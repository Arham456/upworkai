import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT =
  "You are an expert Upwork proposal strategist. Analyze job postings and return ONLY a JSON object with no markdown, no explanation. Identify what the client truly fears, the competition level, and the best approach for this specific freelancer profile.";

const OPENING_LINES: Record<string, string[]> = {
  ghosting: [
    "I read your post — sounds like reliability has been the real issue, not capability.",
    "Before I pitch anything, let me address what I think you've experienced: hired and ghosted.",
    "Three words that killed your last project. Let me show you the opposite in 60 seconds.",
  ],
  quality: [
    "Your spec is more detailed than most — that usually means you've been burned by 'good enough' before.",
    "I can see quality isn't negotiable here. Let me show you exactly how I enforce it.",
    "The level of detail in your brief tells me we think alike about what 'done' actually means.",
  ],
  deadline: [
    "I noticed your deadline. It's tight — here's exactly how I'd hit it, day by day.",
    "Deadlines aren't guidelines for me. Here's my delivery record in 30 seconds.",
    "Your timeline is workable. Here's the plan, and here's how we handle slippage if it happens.",
  ],
  budget: [
    "You've set a clear budget. I work within it — no scope creep, no invoice surprises.",
    "Budget clarity means we can move fast. Here's exactly what I'd build for your number.",
    "I noticed the budget cap. Here's what you get at that rate, nothing left out.",
  ],
  communication: [
    "I update clients before they have to ask. Here's what that looks like day-to-day.",
    "Daily Slack updates, shared board, 2-hour response — that's my baseline, not a promise.",
    "You mentioned communication matters. Here's how I've never left a client wondering.",
  ],
  other: [
    "I read your post twice. Here's what I think you actually need versus what you asked for.",
    "Let me skip the pitch and get straight to how I'd approach your specific situation.",
    "Your project has a few moving parts. Here's how I'd sequence them to avoid the common mistakes.",
  ],
};

interface AnalysisResult {
  matchScore: number;
  clientConcern: string;
  competitionLevel: "Low" | "Medium" | "High";
  redFlags: string[];
  recommendedApproach: string;
  jobSummary: string;
  fearType: string;
  triggerWords: string[];
  jobCategory: string;
  // full-page mode extras
  jobDescription?: string;
  hireRate?: string | null;
  totalSpent?: string | null;
  proposalCount?: string | null;
  clientLocation?: string | null;
  memberSince?: string | null;
  clientRating?: string | null;
  jobBudget?: string | null;
  connectsRequired?: number | null;
}

export async function POST(request: NextRequest) {
  console.log("[analyze] API KEY exists:", !!process.env.ANTHROPIC_API_KEY);

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      description?: string;
      fullPageText?: string;
      connectsRequired?: number;
    };

    const isFullPageMode = !!body.fullPageText?.trim();
    const inputText = isFullPageMode
      ? body.fullPageText!.trim()
      : body.description?.trim();

    if (!inputText) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    // Enforce free-tier limit (5 job analyses lifetime)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    if (user?.plan !== "pro") {
      const analysisCount = await prisma.job.count({ where: { userId: session.user.id } });
      if (analysisCount >= 5) {
        return NextResponse.json(
          {
            error: "You've analyzed 5 jobs on the free plan. Upgrade to Pro for unlimited job analysis.",
            upgradeRequired: true,
          },
          { status: 403 },
        );
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("[analyze] ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error: ANTHROPIC_API_KEY is not set" },
        { status: 500 },
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { skills: true, niche: true, experience: true, sampleProposals: true },
    });

    const profileContext = profile
      ? `Freelancer profile:
- Skills: ${profile.skills.join(", ") || "Not specified"}
- Niche: ${profile.niche || "Not specified"}
- Experience level: ${profile.experience || "Not specified"}
- Sample proposals available: ${profile.sampleProposals.length > 0 ? "Yes" : "No"}`
      : "Freelancer profile: Not set up yet.";

    const clientIntelFields = isFullPageMode
      ? `,
  "jobDescription": <string — extract ONLY the job description text, excluding client info sections>,
  "hireRate": <string e.g. "85%" or null if not found>,
  "totalSpent": <string e.g. "$50K+" or null if not found>,
  "proposalCount": <string e.g. "10 to 20" or null if not found>,
  "clientLocation": <string e.g. "United States" or null if not found>,
  "memberSince": <string e.g. "January 2020" or null if not found>,
  "clientRating": <string e.g. "4.95" or null if not found>,
  "jobBudget": <string e.g. "$500–$1,000" or null if not found>,
  "connectsRequired": <number | null — connects needed to apply if shown, else null>`
      : "";

    const inputLabel = isFullPageMode
      ? "Full Upwork job page (includes job description + client info sections like 'About the client' and 'Activity on this job'):"
      : "Job posting:";

    const clientIntelInstruction = isFullPageMode
      ? "\n\nIMPORTANT: This is a full job page paste. Extract the client intelligence fields from the 'About the client' and 'Activity on this job' sections. Use the client's hire rate, spending history, and proposal count to inform the matchScore, competitionLevel, and recommendedApproach."
      : "";

    const userMessage = `${profileContext}

${inputLabel}
${inputText}
${clientIntelInstruction}

Return a JSON object with these exact keys:
{
  "matchScore": <integer 1-10>,
  "clientConcern": <string — the client's deepest underlying fear or need>,
  "competitionLevel": <"Low" | "Medium" | "High">,
  "redFlags": <array of strings — potential issues or concerns>,
  "recommendedApproach": <string — how this freelancer should position themselves>,
  "jobSummary": <string — 1-2 sentence summary of what the job requires>,
  "fearType": <"ghosting" | "quality" | "deadline" | "budget" | "communication" | "other">,
  "triggerWords": <array of strings — words from the job post that signal this fear>,
  "jobCategory": <string — e.g. "Web Development", "Design", "Writing", "Marketing">${clientIntelFields}
}`;

    const stream = client.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    const message = await stream.finalMessage();
    console.log("[analyze] Response content types:", message.content.map((b) => b.type));

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.error("[analyze] No text block in response:", JSON.stringify(message.content));
      return NextResponse.json({ error: "No text response from AI" }, { status: 500 });
    }

    const rawText = textBlock.text;
    console.log("[analyze] Raw Claude response:", rawText);

    let analysis: AnalysisResult;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      analysis = JSON.parse(jsonMatch[0]) as AnalysisResult;
    } catch (parseErr) {
      console.error("[analyze] JSON parse error:", parseErr, "\nRaw text was:", rawText);
      return NextResponse.json(
        { error: "Failed to parse AI response. Check server logs for details." },
        { status: 500 },
      );
    }

    // In full-page mode, store the extracted clean description; fallback to full text
    const descriptionToStore = isFullPageMode
      ? (analysis.jobDescription?.trim() || inputText)
      : inputText;

    const connectsToStore = body.connectsRequired ?? (isFullPageMode ? (analysis.connectsRequired ?? null) : null);

    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        description: descriptionToStore,
        matchScore: analysis.matchScore,
        clientConcern: analysis.clientConcern,
        competitionLevel: analysis.competitionLevel,
        redFlags: analysis.redFlags,
        recommendedApproach: analysis.recommendedApproach,
        jobSummary: analysis.jobSummary,
        jobCategory: analysis.jobCategory ?? null,
        connectsRequired: connectsToStore,
        status: "analyzed",
        ...(isFullPageMode && {
          hireRate: analysis.hireRate ?? null,
          totalSpent: analysis.totalSpent ?? null,
          proposalCount: analysis.proposalCount ?? null,
          clientLocation: analysis.clientLocation ?? null,
          memberSince: analysis.memberSince ?? null,
          clientRating: analysis.clientRating ?? null,
          jobBudget: analysis.jobBudget ?? null,
        }),
      },
    });

    await prisma.fearPattern.create({
      data: {
        fearType: analysis.fearType,
        triggerWords: analysis.triggerWords,
        jobCategory: analysis.jobCategory ?? null,
        confidence: 0.7,
      },
    });

    const similarCount = await prisma.fearPattern.count({
      where: { fearType: analysis.fearType },
    });
    const fearConfidence = Math.min(95, Math.round(similarCount * 15));
    const fearType = analysis.fearType;
    const openingLines = OPENING_LINES[fearType] ?? OPENING_LINES.other;

    return NextResponse.json({
      ...analysis,
      connectsRequired: connectsToStore,
      jobId: job.id,
      fearInsight: {
        fearType,
        confidence: fearConfidence,
        basedOnCount: similarCount,
        openingLines,
      },
    });
  } catch (err) {
    console.error("[analyze] Unhandled error:", err);
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
