export type ClientIntelligence = {
  job_title: string | null;
  job_description: string | null;
  budget: string | null;
  required_skills: string[] | null;
  client_location: string | null;
  total_spent: string | null;
  hire_rate: string | null;
  total_hires: number | null;
  member_since: string | null;
  recent_reviews: string[] | null;
  scrape_failed: boolean;
};

const USER_AGENT = "Mozilla/5.0 (compatible; RefinedHawk/1.0)";
const FETCH_TIMEOUT_MS = 10_000;

function failed(): ClientIntelligence {
  return {
    job_title: null,
    job_description: null,
    budget: null,
    required_skills: null,
    client_location: null,
    total_spent: null,
    hire_rate: null,
    total_hires: null,
    member_since: null,
    recent_reviews: null,
    scrape_failed: true,
  };
}

function isUpworkJobUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, "");
    if (host !== "upwork.com") return false;
    return pathname.startsWith("/jobs/") || /~[0-9a-f]{10,}/i.test(pathname);
  } catch {
    return false;
  }
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

// Return the stripped first capture group from the first pattern that matches
function firstMatch(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const val = stripHtml(m[1]).trim();
      if (val) return val;
    }
  }
  return null;
}

// Collect all unique stripped capture groups from a global pattern (max 20)
function allMatches(html: string, re: RegExp): string[] {
  const results: string[] = [];
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let m: RegExpExecArray | null;
  while ((m = g.exec(html)) !== null) {
    const val = stripHtml(m[1]).trim();
    if (val && !results.includes(val)) {
      results.push(val);
      if (results.length >= 20) break;
    }
  }
  return results;
}

function parseNextData(html: string): unknown {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// Walk an object tree (depth-limited) looking for any of the given keys
function deepFind(obj: unknown, keys: string[], depth = 0): unknown {
  if (depth > 12 || obj === null || obj === undefined || typeof obj !== "object") {
    return undefined;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const r = deepFind(item, keys, depth + 1);
      if (r !== undefined) return r;
    }
    return undefined;
  }
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    if (
      Object.prototype.hasOwnProperty.call(rec, k) &&
      rec[k] !== null &&
      rec[k] !== undefined &&
      rec[k] !== ""
    ) {
      return rec[k];
    }
  }
  for (const v of Object.values(rec)) {
    if (v && typeof v === "object") {
      const r = deepFind(v, keys, depth + 1);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}

function jStr(json: unknown, keys: string[]): string | null {
  const v = deepFind(json, keys);
  return typeof v === "string" && v.trim() ? stripHtml(v.trim()) : null;
}

function jNum(json: unknown, keys: string[]): number | null {
  const v = deepFind(json, keys);
  if (typeof v === "number" && !isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? null : n;
  }
  return null;
}

// ── Field extractors ──────────────────────────────────────────────────────────

function extractTitle(html: string, json: unknown): string | null {
  // JSON-LD blocks
  const ldRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldRe.exec(html)) !== null) {
    try {
      const ld = JSON.parse(m[1]) as Record<string, unknown>;
      if (typeof ld.title === "string" && ld.title) return ld.title;
      if (typeof ld.name === "string" && ld.name) return ld.name;
    } catch {
      // malformed block — skip
    }
  }

  return (
    jStr(json, ["title", "jobTitle"]) ??
    firstMatch(html, [
      /data-test="job-title"[^>]*>([\s\S]*?)<\//i,
      /<h1[^>]*class="[^"]*(?:job-title|heading|h4)[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
      /<h1[^>]*>([\s\S]*?)<\/h1>/i,
      /<title>([\s\S]*?)(?:\s*[-|–]\s*Upwork)?<\/title>/i,
    ])
  );
}

function extractDescription(html: string, json: unknown): string | null {
  const fromJson = jStr(json, ["description", "jobDescription", "snippet"]);
  if (fromJson && fromJson.length > 30) return fromJson;

  return firstMatch(html, [
    /data-test="[^"]*description[^"]*"[^>]*>([\s\S]{50,}?)<\/div>/i,
    /class="[^"]*job-description[^"]*"[^>]*>([\s\S]{50,}?)<\/div>/i,
    /class="[^"]*description[^"]*"[^>]*>([\s\S]{50,}?)<\/div>/i,
    /itemprop="description"[^>]*>([\s\S]+?)<\/\w+>/i,
  ]);
}

function extractBudget(html: string, json: unknown): string | null {
  const hourlyMin = deepFind(json, ["hourlyBudgetMin", "budgetMin", "rateMin"]);
  const hourlyMax = deepFind(json, ["hourlyBudgetMax", "budgetMax", "rateMax"]);
  if (
    typeof hourlyMin === "number" &&
    typeof hourlyMax === "number" &&
    hourlyMin > 0
  ) {
    return `$${hourlyMin}–$${hourlyMax}/hr`;
  }

  const amount = deepFind(json, ["amount", "fixedPriceAmount"]);
  if (typeof amount === "number" && amount > 0) {
    return `$${amount.toLocaleString()}`;
  }
  if (typeof amount === "string" && amount.startsWith("$")) return amount;

  return firstMatch(html, [
    /(\$[\d,]+(?:\.\d{2})?\s*[-–]\s*\$[\d,]+(?:\.\d{2})?\s*\/\s*hr)/i,
    /(\$[\d,]+(?:\.\d{2})?)\s*(?:Fixed|Budget|USD)/i,
    /(?:Budget|Fixed(?:-Price)?|Hourly(?:\s+Range)?)\s*:?\s*([^\n<]{3,60})/i,
  ]);
}

function extractSkills(html: string, json: unknown): string[] | null {
  const raw = deepFind(json, ["skills", "requiredSkills", "jobTags", "tags"]);
  if (Array.isArray(raw) && raw.length > 0) {
    const names = raw
      .map((s) => {
        if (typeof s === "string") return s.trim();
        if (typeof s === "object" && s !== null) {
          const o = s as Record<string, unknown>;
          return String(o.prettyName ?? o.name ?? o.label ?? o.tag ?? "").trim();
        }
        return "";
      })
      .filter((s) => s.length > 0);
    if (names.length > 0) return names;
  }

  const fromHtml = allMatches(
    html,
    /(?:skill-badge|skill-token|job-skill|skill-name|cfe-ui-tag)[^>]*>([\s\S]*?)<\//i,
  );
  if (fromHtml.length > 0) return fromHtml;

  const fromDataTest = allMatches(html, /data-test="[^"]*skill[^"]*"[^>]*>([\s\S]*?)<\//i);
  if (fromDataTest.length > 0) return fromDataTest;

  return null;
}

function extractLocation(html: string, json: unknown): string | null {
  return (
    jStr(json, ["country", "clientLocation", "location", "countryName"]) ??
    firstMatch(html, [
      /data-test="[^"]*location[^"]*"[^>]*>([\s\S]*?)<\//i,
      /itemprop="addressCountry"[^>]*>([\s\S]*?)<\//i,
      /<span[^>]*class="[^"]*location[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
      /(?:Location|Country)\s*:\s*([A-Z][a-zA-Z\s,]{2,40})/,
    ])
  );
}

function extractTotalSpent(html: string, json: unknown): string | null {
  // Prefer a pre-formatted string if available
  const s = jStr(json, ["totalSpentFormatted", "formattedTotalSpent"]);
  if (s) return s;

  const n = jNum(json, ["totalSpent", "totalCharges", "totalBilled"]);
  if (n !== null && n > 0) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M+`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K+`;
    return `$${n}`;
  }

  return firstMatch(html, [
    /(\$[\d,.]+[KkMm+]*)\s*(?:spent|total spent)/i,
    /(?:Total\s+[Ss]pent|[Ss]pent)[^$]*(\$[\d,.]+[KkMm+]*)/i,
    /data-test="[^"]*spent[^"]*"[^>]*>([\s\S]*?)<\//i,
  ]);
}

function extractHireRate(html: string, json: unknown): string | null {
  const n = jNum(json, ["hireRate", "hireRatio", "inviteToHireRate"]);
  if (n !== null) {
    // Some APIs return 0–1 (fractional), others 0–100
    return `${Math.round(n <= 1 ? n * 100 : n)}%`;
  }

  const s = jStr(json, ["hireRateLabel", "hireRate"]);
  if (s) return s;

  return firstMatch(html, [
    /(?:Hire\s+[Rr]ate)[^%\d]*(\d+\s*%)/i,
    /(\d{1,3}%)\s*(?:hire rate|hired)/i,
    /data-test="[^"]*hire-rate[^"]*"[^>]*>([\s\S]*?)<\//i,
  ]);
}

function extractTotalHires(html: string, json: unknown): number | null {
  const n = jNum(json, ["totalHires", "hires", "totalEngagements", "totalFreelancers"]);
  if (n !== null) return Math.round(n);

  const m =
    html.match(/(?:Total\s+[Hh]ires?|Jobs?\s+[Pp]osted)[^0-9]*(\d+)/i) ??
    html.match(/data-test="[^"]*hires?[^"]*"[^>]*>(\d+)<\//i);
  if (m) return parseInt(m[1], 10);

  return null;
}

function extractMemberSince(html: string, json: unknown): string | null {
  const raw = jStr(json, ["memberSince", "memberSinceDate", "joinedAt", "createdAt"]);
  if (raw) {
    // Prefer just the year if that's all we need
    const yearMatch = raw.match(/\b(20\d{2})\b/);
    return yearMatch ? yearMatch[1] : raw;
  }

  return firstMatch(html, [
    /(?:Member\s+since|Joined)\D{0,10}((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+20\d{2}|20\d{2})/i,
    /data-test="[^"]*member[^"]*"[^>]*>([\s\S]*?)<\//i,
  ]);
}

function extractReviews(html: string, json: unknown): string[] | null {
  // Client reviews *for freelancers* — public feedback left on past contracts
  const raw = deepFind(json, [
    "publicFeedback",
    "feedback",
    "reviewsFromClient",
    "feedbackToFreelancer",
    "clientFeedback",
    "reviews",
  ]);
  if (Array.isArray(raw) && raw.length > 0) {
    const texts = raw
      .slice(0, 5)
      .map((r) => {
        if (typeof r === "string") return r.trim();
        if (typeof r === "object" && r !== null) {
          const o = r as Record<string, unknown>;
          return String(
            o.comment ?? o.publicFeedback ?? o.feedback ?? o.text ?? o.message ?? "",
          ).trim();
        }
        return "";
      })
      .filter((t) => t.length > 5);
    if (texts.length > 0) return texts;
  }

  const fromHtml = allMatches(
    html,
    /(?:feedback-comment|review-text|client-feedback|publicFeedback|review-comment)[^>]*>([\s\S]{10,400}?)<\//i,
  ).slice(0, 5);
  return fromHtml.length > 0 ? fromHtml : null;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function scrapeClientIntelligence(jobUrl: string): Promise<ClientIntelligence> {
  if (!isUpworkJobUrl(jobUrl)) return failed();

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(jobUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return failed();
    html = await res.text();
  } catch {
    return failed();
  }

  const json = parseNextData(html);

  return {
    job_title: extractTitle(html, json),
    job_description: extractDescription(html, json),
    budget: extractBudget(html, json),
    required_skills: extractSkills(html, json),
    client_location: extractLocation(html, json),
    total_spent: extractTotalSpent(html, json),
    hire_rate: extractHireRate(html, json),
    total_hires: extractTotalHires(html, json),
    member_since: extractMemberSince(html, json),
    recent_reviews: extractReviews(html, json),
    scrape_failed: false,
  };
}
