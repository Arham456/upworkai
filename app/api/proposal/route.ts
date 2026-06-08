import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT =
  "You are an expert Upwork proposal writer. Write a proposal that directly addresses the client's core fear, sounds human and personal, and positions the freelancer's specific strengths. Never use generic phrases like 'I am interested in your project'. Open with something that shows you read and understood their specific situation.";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Server configuration error: ANTHROPIC_API_KEY is not set" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      jobId?: string;
      jobDescription?: string;
    };

    // Enforce free-tier limit (5 proposals generated lifetime)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, proposalsGenerated: true },
    });
    const isFreePlan = user?.plan !== "pro";
    if (isFreePlan && (user?.proposalsGenerated ?? 0) >= 5) {
      return Response.json(
        {
          error:
            "You've used all 5 free proposals. Free plan was designed to get you your first win. If it worked — Pro is how you keep winning. $20/month — less than what you earn in one hour.",
          upgradeRequired: true,
        },
        { status: 403 },
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    let job = null;
    if (body.jobId) {
      job = await prisma.job.findFirst({
        where: { id: body.jobId, userId: session.user.id },
      });
      if (!job) {
        return Response.json({ error: "Job not found" }, { status: 404 });
      }
    }

    const jobDescription = job?.description ?? body.jobDescription ?? "";
    if (!jobDescription.trim()) {
      return Response.json({ error: "Job description is required" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const voiceDNASection = (() => {
      if (!profile?.voiceDNA) return "";
      const dna = profile.voiceDNA as {
        tone?: string;
        avgSentenceLength?: string;
        phrasesAlwaysUsed?: string[];
        phrasesNeverUsed?: string[];
        structurePattern?: string;
        uniqueCharacteristics?: string[];
      };
      return `
VOICE DNA (match this writing style exactly):
Tone: ${dna.tone ?? ""}
Sentence length: ${dna.avgSentenceLength ?? ""}
Phrases they always use: ${(dna.phrasesAlwaysUsed ?? []).join(", ")}
Phrases they NEVER use (avoid these): ${(dna.phrasesNeverUsed ?? []).join(", ")}
Structure pattern: ${dna.structurePattern ?? ""}
Key characteristics: ${(dna.uniqueCharacteristics ?? []).join("; ")}`;
    })();

    const profileSection = profile
      ? `FREELANCER PROFILE:
Skills: ${profile.skills.join(", ") || "Not specified"}
Niche: ${profile.niche || "Not specified"}
Experience level: ${profile.experience || "Not specified"}
${
  profile.sampleProposals.length > 0
    ? `\nSample proposals (match this tone and style):\n${profile.sampleProposals
        .slice(0, 2)
        .join("\n\n---\n\n")}`
    : ""
}${voiceDNASection}`
      : "FREELANCER PROFILE: Not configured — write a strong general proposal.";

    const clientIntelSection =
      job &&
      (job.hireRate || job.totalSpent || job.proposalCount || job.clientLocation || job.memberSince || job.clientRating || job.jobBudget)
        ? `
CLIENT INTELLIGENCE (extracted from their job page):
${job.hireRate ? `- Hire rate: ${job.hireRate} — reference their track record if it's strong` : ""}
${job.totalSpent ? `- Total spent on Upwork: ${job.totalSpent}` : ""}
${job.jobBudget ? `- Job budget: ${job.jobBudget}` : ""}
${job.proposalCount ? `- Proposals already sent: ${job.proposalCount} — calibrate how competitive your opener needs to be` : ""}
${job.clientRating ? `- Client rating: ${job.clientRating}/5` : ""}
${job.clientLocation ? `- Client location: ${job.clientLocation}` : ""}
${job.memberSince ? `- Upwork member since: ${job.memberSince}` : ""}
Use this intelligence subtly — don't recite it robotically. Let it inform your tone and positioning.`
        : "";

    const analysisSection = job
      ? `
JOB ANALYSIS (from prior AI analysis):
Summary: ${job.jobSummary ?? "N/A"}
Client's core concern: ${job.clientConcern ?? "N/A"}
Recommended approach: ${job.recommendedApproach ?? "N/A"}
Competition level: ${job.competitionLevel ?? "N/A"}
${job.redFlags.length > 0 ? `Red flags to address or avoid: ${job.redFlags.join(", ")}` : "No red flags."}${clientIntelSection}`
      : "";

    const userMessage = `${profileSection}
${analysisSection}

FULL JOB DESCRIPTION:
${jobDescription.trim()}

Write a compelling, personalized proposal. Address the client's core concern directly in the opening sentence. Be specific about their project details. Sound like a real person who has read and understood their situation — not a template.`;

    const stream = client.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 2048,
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

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          if (isFreePlan) {
            controller.enqueue(
              encoder.encode(
                "\n\n---\nWritten with RefinedHawk Free — upgrade to Pro for unlimited proposals with no watermark.",
              ),
            );
            // Increment generated count AFTER successful stream (not on error)
            await prisma.user.update({
              where: { id: session.user.id },
              data: { proposalsGenerated: { increment: 1 } },
            }).catch(console.error);
          }
        } catch (streamErr) {
          console.error("[proposal] Stream error:", streamErr);
          const msg =
            streamErr instanceof Error ? streamErr.message : "Stream failed";
          controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[proposal] Unhandled error:", err);
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
