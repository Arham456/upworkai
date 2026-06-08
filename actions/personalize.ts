"use server";

import { getServerSession } from "next-auth/next";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  scrapeClientIntelligence,
  scrapeClientProfile,
  extractJobFields,
  isUpworkUrl,
  type ClientIntelligence,
} from "@/lib/client-scraper";

const SYSTEM_PROMPT =
  "You are a Proposal Personalization Engine for Upwork freelancers. Your job is to always write a complete, compelling, ready-to-send proposal — never refuse, never ask for more information, never explain what you cannot do.\n\nIf client intelligence data is available, use it to personalize deeply — reference their hire rate, spending history, and past reviews.\n\nIf client intelligence is unavailable or scraping failed, write the proposal using the job description alone. A strong proposal based on the job description is infinitely better than no proposal.\n\nAlways structure the proposal as:\n1. A strong opening line that references something specific from the job (a requirement, a pain point, a stated goal)\n2. Why this freelancer is the right fit — specific to the job requirements\n3. A brief relevant accomplishment or approach\n4. A low-risk next step or call to action\n\nKeep it under 200 words. Be direct, confident, and specific. Never use generic filler phrases like 'I am interested in your project'. Write like a top 1% Upwork freelancer.";

export type PersonalizeResult =
  | {
      proposal: string;
      clientIntelligence: ClientIntelligence;
      scrape_failed: boolean;
      input_mode: "url" | "paste";
    }
  | { error: string };

export async function personalizeProposal(input: {
  mode: "url" | "paste";
  jobUrl?: string;
  jobDescription?: string;
  clientProfileUrl?: string;
  userProfile: string;
  voiceDna: string;
}): Promise<PersonalizeResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  if (user?.plan !== "pro") return { error: "pro_required" };

  if (!process.env.ANTHROPIC_API_KEY) return { error: "server_misconfigured" };

  // ── Input validation ──────────────────────────────────────────────────────
  if (input.mode === "url") {
    if (!input.jobUrl) return { error: "job_url_required" };
    if (!isUpworkUrl(input.jobUrl)) return { error: "invalid_job_url" };
  } else {
    if (!input.jobDescription || input.jobDescription.trim().length < 50) {
      return { error: "description_too_short" };
    }
  }

  // ── Intelligence gathering ────────────────────────────────────────────────
  let intel: ClientIntelligence;

  if (input.mode === "url") {
    intel = await scrapeClientIntelligence(input.jobUrl!, input.clientProfileUrl);
  } else {
    const jobFields = extractJobFields(input.jobDescription!);

    let clientFields: Partial<ClientIntelligence> & { scrape_failed: boolean } = {
      scrape_failed: !input.clientProfileUrl,
    };
    if (input.clientProfileUrl) {
      clientFields = await scrapeClientProfile(input.clientProfileUrl);
    }

    intel = {
      job_title: jobFields.job_title,
      job_description: jobFields.job_description,
      required_skills: jobFields.required_skills,
      budget: null,
      client_location: clientFields.client_location ?? null,
      total_spent: clientFields.total_spent ?? null,
      hire_rate: clientFields.hire_rate ?? null,
      total_hires: clientFields.total_hires ?? null,
      member_since: clientFields.member_since ?? null,
      recent_reviews: clientFields.recent_reviews ?? null,
      // failed only if a client profile was requested but couldn't be scraped
      scrape_failed: !!(input.clientProfileUrl && clientFields.scrape_failed),
    };
  }

  // ── Build prompt sections ─────────────────────────────────────────────────
  const intelLines: string[] = [];
  if (intel.client_location) intelLines.push(`Location: ${intel.client_location}`);
  if (intel.total_spent) intelLines.push(`Total spent on Upwork: ${intel.total_spent}`);
  if (intel.hire_rate) intelLines.push(`Hire rate: ${intel.hire_rate}`);
  if (intel.total_hires !== null) intelLines.push(`Total hires: ${intel.total_hires}`);
  if (intel.member_since) intelLines.push(`Member since: ${intel.member_since}`);
  if (intel.budget) intelLines.push(`Budget: ${intel.budget}`);

  const intelSection =
    intelLines.length > 0
      ? `CLIENT INTELLIGENCE:\n${intelLines.map((l) => `- ${l}`).join("\n")}`
      : "CLIENT INTELLIGENCE: Page could not be scraped. Infer client context from the job description below.";

  const reviewsSection =
    intel.recent_reviews && intel.recent_reviews.length > 0
      ? `\n\nRECENT REVIEWS THIS CLIENT LEFT FOR PAST CONTRACTORS (study these — they reveal exactly what this client values and how they communicate):\n${intel.recent_reviews.map((r, i) => `${i + 1}. "${r}"`).join("\n")}`
      : "";

  const jobSection = intel.job_description
    ? `\n\nJOB DESCRIPTION:\n${intel.job_description}`
    : `\n\nJOB URL (description unavailable — work from context): ${input.jobUrl ?? ""}`;

  const skillsSection =
    intel.required_skills && intel.required_skills.length > 0
      ? `\n\nREQUIRED SKILLS: ${intel.required_skills.join(", ")}`
      : "";

  const userMessage = `${intelSection}${reviewsSection}${jobSection}${skillsSection}

FREELANCER PROFILE:
${input.userProfile.trim()}

VOICE DNA (replicate this writing style exactly — sentence rhythm, vocabulary, tone):
${input.voiceDna.trim()}

Write the proposal now. Open with something that proves you studied this specific client — not generic praise. Let the review history inform your tone. Speak to their psychology, not just their job post.`;

  // ── Call Claude ───────────────────────────────────────────────────────────
  let proposalText = "";
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = anthropic.messages.stream({
      model: "claude-opus-4-8",
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

    const message = await stream.finalMessage();
    const textBlock = message.content.find((b) => b.type === "text");
    proposalText = textBlock?.type === "text" ? textBlock.text.trim() : "";

    if (!proposalText) return { error: "ai_no_response" };
  } catch (err) {
    console.error("[personalize] Claude error:", err);
    return { error: "ai_request_failed" };
  }

  // ── Persist to Proposal table (best-effort) ───────────────────────────────
  try {
    await prisma.proposal.create({
      data: {
        userId: session.user.id,
        content: proposalText,
        status: "pending",
      },
    });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { proposalsGenerated: { increment: 1 } },
    });
  } catch (dbErr) {
    console.error("[personalize] DB save failed (non-fatal):", dbErr);
  }

  return {
    proposal: proposalText,
    clientIntelligence: intel,
    scrape_failed: intel.scrape_failed,
    input_mode: input.mode,
  };
}
