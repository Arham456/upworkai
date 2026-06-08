import Anthropic from "@anthropic-ai/sdk";

export type RedFlag = {
  category: string;
  severity: "low" | "medium" | "high";
  issue: string;
  quote: string;
};

export type GreenFlag = {
  signal: string;
};

export type RedFlagResult = {
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  summary: string;
  red_flags: RedFlag[];
  green_flags: GreenFlag[];
  verdict: string;
};

const SYSTEM_PROMPT =
  "You are a Client Risk Analyzer for Upwork freelancers. Your job is to protect freelancers from bad clients, scope creep, payment risks, and time wasters.\n\nAnalyze the job posting for these red flag categories:\n- Budget red flags: unrealistically low budget for scope, hourly rate below market, fixed price for open-ended work, 'we'll pay more for good work' bait\n- Scope red flags: vague requirements, 'simple' or 'quick' for complex work, 'and other tasks as needed', no clear deliverables\n- Client behavior red flags: urgency pressure ('need ASAP', 'start today'), demanding free work ('do a test first'), 'we've had bad experiences with freelancers before' (blame-shifting), multiple past hires with bad reviews\n- Communication red flags: all caps, aggressive tone, unrealistic timeline, 'no excuses' language\n- Payment red flags: milestone structure not mentioned, 'we pay after approval' with no clear criteria, requests to work outside Upwork\n\nAlso identify green flags:\n- Clear requirements, realistic budget, verified payment, good review history, specific timeline, respectful tone, milestone structure mentioned\n\nReturn ONLY valid JSON matching this exact structure, no markdown, no explanation:\n{\n  \"risk_score\": number 0-100,\n  \"risk_level\": \"low\" | \"medium\" | \"high\" | \"critical\",\n  \"summary\": \"one sentence verdict\",\n  \"red_flags\": [{ \"category\": string, \"severity\": \"low\"|\"medium\"|\"high\", \"issue\": string, \"quote\": string }],\n  \"green_flags\": [{ \"signal\": string }],\n  \"verdict\": \"detailed paragraph recommending apply or skip with specific reasons\"\n}";

const VALID_RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
const VALID_SEVERITIES = ["low", "medium", "high"] as const;

export async function analyzeRedFlags(jobText: string): Promise<RedFlagResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this Upwork job posting for red flags:\n\n${jobText.trim().slice(0, 8_000)}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("analyzeRedFlags: no text block in Claude response");
  }

  // Strip markdown code fences if Claude wraps the JSON despite instructions
  const raw = textBlock.text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("analyzeRedFlags: failed to parse Claude response as JSON");
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("analyzeRedFlags: response is not a JSON object");
  }

  const r = parsed as Record<string, unknown>;

  // ── Validate required fields ──────────────────────────────────────────────

  if (typeof r.risk_score !== "number") {
    throw new Error("analyzeRedFlags: risk_score missing or not a number");
  }
  if (r.risk_score < 0 || r.risk_score > 100) {
    throw new Error(`analyzeRedFlags: risk_score out of range (${r.risk_score})`);
  }

  if (!VALID_RISK_LEVELS.includes(r.risk_level as (typeof VALID_RISK_LEVELS)[number])) {
    throw new Error(`analyzeRedFlags: invalid risk_level "${r.risk_level}"`);
  }

  if (typeof r.summary !== "string" || !r.summary.trim()) {
    throw new Error("analyzeRedFlags: summary missing or empty");
  }

  if (!Array.isArray(r.red_flags)) {
    throw new Error("analyzeRedFlags: red_flags is not an array");
  }

  if (!Array.isArray(r.green_flags)) {
    throw new Error("analyzeRedFlags: green_flags is not an array");
  }

  if (typeof r.verdict !== "string" || !r.verdict.trim()) {
    throw new Error("analyzeRedFlags: verdict missing or empty");
  }

  // ── Normalize arrays defensively ─────────────────────────────────────────

  const red_flags: RedFlag[] = (r.red_flags as unknown[]).map((item, i) => {
    const f = (item !== null && typeof item === "object" && !Array.isArray(item))
      ? (item as Record<string, unknown>)
      : {};
    const severity = VALID_SEVERITIES.includes(f.severity as (typeof VALID_SEVERITIES)[number])
      ? (f.severity as RedFlag["severity"])
      : "low";
    return {
      category: typeof f.category === "string" ? f.category : `Flag ${i + 1}`,
      severity,
      issue: typeof f.issue === "string" ? f.issue : "",
      quote: typeof f.quote === "string" ? f.quote : "",
    };
  });

  const green_flags: GreenFlag[] = (r.green_flags as unknown[]).map((item) => {
    const f = (item !== null && typeof item === "object" && !Array.isArray(item))
      ? (item as Record<string, unknown>)
      : {};
    return {
      signal: typeof f.signal === "string" ? f.signal : "",
    };
  }).filter((g) => g.signal.length > 0);

  return {
    risk_score: Math.round(r.risk_score),
    risk_level: r.risk_level as RedFlagResult["risk_level"],
    summary: r.summary.trim(),
    red_flags,
    green_flags,
    verdict: r.verdict.trim(),
  };
}
