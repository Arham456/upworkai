import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT =
  "You are an expert Upwork proposal strategist. Analyze job postings and return ONLY a JSON object with no markdown, no explanation. Identify what the client truly fears, the competition level, and the best approach for this specific freelancer profile.";

interface AnalysisResult {
  matchScore: number;
  clientConcern: string;
  competitionLevel: "Low" | "Medium" | "High";
  redFlags: string[];
  recommendedApproach: string;
  jobSummary: string;
}

export async function POST(request: NextRequest) {
  console.log("[analyze] API KEY exists:", !!process.env.ANTHROPIC_API_KEY);

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { description: string };
    if (!body.description?.trim()) {
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

    // Initialize inside the handler so any constructor error is caught
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

    const userMessage = `${profileContext}

Job posting:
${body.description.trim()}

Return a JSON object with these exact keys:
{
  "matchScore": <integer 1-10>,
  "clientConcern": <string — the client's deepest underlying fear or need>,
  "competitionLevel": <"Low" | "Medium" | "High">,
  "redFlags": <array of strings — potential issues or concerns>,
  "recommendedApproach": <string — how this freelancer should position themselves>,
  "jobSummary": <string — 1-2 sentence summary of what the job requires>
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
      // Extract the first {...} block, tolerating markdown fences or extra prose
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }
      analysis = JSON.parse(jsonMatch[0]) as AnalysisResult;
    } catch (parseErr) {
      console.error("[analyze] JSON parse error:", parseErr, "\nRaw text was:", rawText);
      return NextResponse.json(
        { error: "Failed to parse AI response. Check server logs for details." },
        { status: 500 },
      );
    }

    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        description: body.description.trim(),
        matchScore: analysis.matchScore,
        clientConcern: analysis.clientConcern,
        competitionLevel: analysis.competitionLevel,
        redFlags: analysis.redFlags,
        recommendedApproach: analysis.recommendedApproach,
        jobSummary: analysis.jobSummary,
        status: "analyzed",
      },
    });

    return NextResponse.json({ ...analysis, jobId: job.id });
  } catch (err) {
    console.error("[analyze] Unhandled error:", err);
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
