import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";

export type AuditResult = {
  hireability_score: number;
  audit_feedback: string;
};

type DraftAudit = {
  hireability_score: number;
  audit_feedback: string;
};

type FeedbackCritique = {
  is_specific_and_actionable: boolean;
  issues: string[];
  improved_feedback: string;
};

const AUDIT_SYSTEM_PROMPT = `You are a Success-Probability Auditor for job applications.
Compare the applicant's recent rejection history against a target job description.
Identify recurring rejection patterns, skill gaps, and mismatches that would lower hire probability.
Return JSON only with:
- hireability_score: integer 0-100 (likelihood of success if they apply now)
- audit_feedback: detailed analysis referencing specific rejection themes and job requirements`;

const CRITIQUE_SYSTEM_PROMPT = `You are a quality reviewer for career coaching feedback.
Evaluate whether audit feedback is specific (names concrete skills, requirements, or rejection patterns)
and actionable (gives clear next steps the applicant can take).
Return JSON only with:
- is_specific_and_actionable: boolean
- issues: string[] (empty if feedback passes)
- improved_feedback: rewritten feedback that is specific and actionable; if the original already passes, return it unchanged`;

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

function parseJsonFromResponse<T>(rawText: string): T {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in AI response");
  }
  return JSON.parse(jsonMatch[0]) as T;
}

const SCRAPE_FALLBACK_NOTICE = `Job description could not be scraped from the provided URL.
The page may require login, block bots, or render content with JavaScript.
Audit will use the URL context and rejection history only.`;

function getMockJobDescription(jobUrl: string): string {
  return `MOCK JOB POSTING (AUDIT_MOCK_MODE=true)
URL: ${jobUrl}
Role: Senior Full-Stack Developer
Requirements: React, TypeScript, Node.js, PostgreSQL, 5+ years experience, strong communication.
Client notes: Need someone who can deliver quickly and communicate proactively.`;
}

function getMockAuditResult(): AuditResult {
  return {
    hireability_score: 62,
    audit_feedback:
      "Mock audit (AUDIT_MOCK_MODE=true): Your rejection history suggests gaps in senior-level system design storytelling. For this role, add 2–3 portfolio bullets showing end-to-end delivery with React + Node, and tailor your opener to the client's speed/communication requirements.",
  };
}

async function fetchJobDescription(jobUrl: string): Promise<string> {
  if (process.env.AUDIT_MOCK_MODE === "true") {
    return getMockJobDescription(jobUrl);
  }

  try {
    const response = await fetch(jobUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RefinedHawk-Auditor/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      throw new Error("empty page content");
    }

    return text.slice(0, 15000);
  } catch (err) {
    console.warn("[audit] Job scrape failed, using fallback description:", err);
    return `${SCRAPE_FALLBACK_NOTICE}\n\nTarget URL: ${jobUrl}`;
  }
}

function formatRejections(
  rejections: Array<{
    companyName: string;
    roleTitle: string;
    stage: string;
    rawFeedback: string;
    createdAt: Date;
  }>,
): string {
  if (rejections.length === 0) {
    return "No prior rejections on record.";
  }

  return rejections
    .map(
      (rejection, index) =>
        `${index + 1}. ${rejection.roleTitle} at ${rejection.companyName}
Stage: ${rejection.stage}
Date: ${rejection.createdAt.toISOString().split("T")[0]}
Feedback: ${rejection.rawFeedback}`,
    )
    .join("\n\n");
}

async function runInitialAudit(
  anthropic: Anthropic,
  rejectionsText: string,
  jobDescription: string,
  jobUrl: string,
): Promise<DraftAudit> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    temperature: 0.3,
    system: AUDIT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Target job URL: ${jobUrl}

JOB DESCRIPTION:
${jobDescription}

APPLICANT'S LAST REJECTIONS:
${rejectionsText}

Produce hireability_score and audit_feedback based on pattern overlap between rejections and this role.`,
      },
    ],
  });

  const rawText =
    message.content[0]?.type === "text" ? message.content[0].text.trim() : "";
  if (!rawText) {
    throw new Error("Empty response from audit model");
  }

  const draft = parseJsonFromResponse<DraftAudit>(rawText);
  const score = Math.round(draft.hireability_score);
  if (Number.isNaN(score) || score < 0 || score > 100) {
    throw new Error("Invalid hireability_score from audit model");
  }

  return {
    hireability_score: score,
    audit_feedback: draft.audit_feedback.trim(),
  };
}

async function critiqueAuditFeedback(
  anthropic: Anthropic,
  draftFeedback: string,
  rejectionsText: string,
  jobDescription: string,
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    temperature: 0.2,
    system: CRITIQUE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Review this draft audit feedback for specificity and actionability.

DRAFT FEEDBACK:
${draftFeedback}

CONTEXT — JOB DESCRIPTION (excerpt):
${jobDescription.slice(0, 4000)}

CONTEXT — REJECTION HISTORY:
${rejectionsText}

If the draft uses vague advice (e.g. "improve your resume", "gain more experience" without specifics),
rewrite it to cite exact gaps and concrete actions tied to this job and rejection patterns.`,
      },
    ],
  });

  const rawText =
    message.content[0]?.type === "text" ? message.content[0].text.trim() : "";
  if (!rawText) {
    throw new Error("Empty response from feedback critique model");
  }

  const critique = parseJsonFromResponse<FeedbackCritique>(rawText);
  const improved = critique.improved_feedback?.trim();

  if (!improved) {
    throw new Error("Critique step did not return improved_feedback");
  }

  if (!critique.is_specific_and_actionable && critique.issues.length > 0) {
    console.warn("[audit] Feedback critique flagged issues:", critique.issues);
  }

  return improved;
}

export async function auditJobApplication(
  user_id: string,
  job_url: string,
): Promise<AuditResult> {
  const jobUrl = job_url.trim();
  if (!user_id.trim()) {
    throw new Error("user_id is required");
  }
  if (!jobUrl) {
    throw new Error("job_url is required");
  }

  if (process.env.AUDIT_MOCK_MODE === "true") {
    return getMockAuditResult();
  }

  let rejections: Array<{
    companyName: string;
    roleTitle: string;
    stage: string;
    rawFeedback: string;
    createdAt: Date;
  }> = [];

  try {
    rejections = await prisma.rejection.findMany({
      where: { userId: user_id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        companyName: true,
        roleTitle: true,
        stage: true,
        rawFeedback: true,
        createdAt: true,
      },
    });
  } catch (err) {
    console.error("[audit] Failed to load rejections:", err);
    throw new Error(
      "Could not load rejection history. Run database migrations on production (prisma migrate deploy).",
    );
  }

  const jobDescription = await fetchJobDescription(jobUrl);
  const anthropic = getAnthropicClient();
  const rejectionsText = formatRejections(rejections);

  try {
    const draft = await runInitialAudit(anthropic, rejectionsText, jobDescription, jobUrl);
    const audit_feedback = await critiqueAuditFeedback(
      anthropic,
      draft.audit_feedback,
      rejectionsText,
      jobDescription,
    );

    return {
      hireability_score: draft.hireability_score,
      audit_feedback,
    };
  } catch (err) {
    console.error("[audit] AI audit failed:", err);
    if (err instanceof Error && err.message.includes("ANTHROPIC_API_KEY")) {
      throw err;
    }
    throw new Error(
      err instanceof Error
        ? `Audit analysis failed: ${err.message}`
        : "Audit analysis failed. Please try again.",
    );
  }
}