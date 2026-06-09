"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Brain,
  FileText,
} from "lucide-react";
import { personalizeProposal } from "@/actions/personalize";
import type { ClientIntelligence } from "@/lib/client-scraper";

// ── Types ─────────────────────────────────────────────────────────────────────

type VoiceDNA = {
  tone?: string;
  avgSentenceLength?: string;
  phrasesAlwaysUsed?: string[];
  phrasesNeverUsed?: string[];
  structurePattern?: string;
  uniqueCharacteristics?: string[];
};

type Profile = {
  skills: string[];
  niche: string | null;
  experience: string | null;
  sampleProposals: string[];
  voiceDNA: unknown;
} | null;

type Result = {
  proposal: string;
  clientIntelligence: ClientIntelligence;
  scrape_failed: boolean;
  input_mode: "url" | "paste";
};

type Toast = { id: number; message: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const DESC_MAX = 8_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildProfileString(profile: Profile): string {
  if (!profile) return "Profile not configured.";
  return [
    `Skills: ${profile.skills.join(", ") || "Not specified"}`,
    `Niche: ${profile.niche || "Not specified"}`,
    `Experience: ${profile.experience || "Not specified"}`,
    profile.sampleProposals.length > 0
      ? `\nSample proposals:\n${profile.sampleProposals.slice(0, 2).join("\n\n---\n\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildVoiceDnaString(raw: unknown): string {
  if (!raw) return "No voice DNA configured — match a professional, direct tone.";
  const dna = raw as VoiceDNA;
  return [
    `Tone: ${dna.tone ?? "professional"}`,
    `Sentence length: ${dna.avgSentenceLength ?? "medium"}`,
    dna.phrasesAlwaysUsed?.length
      ? `Always uses: ${dna.phrasesAlwaysUsed.join(", ")}`
      : "",
    dna.phrasesNeverUsed?.length
      ? `Never uses: ${dna.phrasesNeverUsed.join(", ")}`
      : "",
    dna.structurePattern ? `Structure: ${dna.structurePattern}` : "",
    dna.uniqueCharacteristics?.length
      ? `Characteristics: ${dna.uniqueCharacteristics.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IntelStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-zinc-800/50 border border-zinc-700/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className="text-sm font-semibold text-zinc-200 truncate">{value}</p>
    </div>
  );
}

function ToastItem({ message }: { message: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.92 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-950/90 px-4 py-3 text-sm text-red-300 shadow-xl backdrop-blur-sm max-w-xs pointer-events-auto"
    >
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </motion.div>
  );
}

// ── Shared client profile URL input ──────────────────────────────────────────

function ClientProfileInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
        Client Profile URL{" "}
        <span className="font-normal text-zinc-600">(optional)</span>
      </label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://www.upwork.com/companies/~..."
        disabled={disabled}
        className="w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_0_24px_rgba(139,92,246,0.08)] transition-all disabled:opacity-50"
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Personalizer({ profile }: { profile: Profile }) {
  const [mode, setMode] = useState<"url" | "paste">("paste");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [clientProfileUrl, setClientProfileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<"researching" | "writing">("researching");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  // Switch loading phase message after 4 seconds
  useEffect(() => {
    if (!loading) {
      setLoadingPhase("researching");
      return;
    }
    const t = setTimeout(() => setLoadingPhase("writing"), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  function handleModeSwitch(next: "url" | "paste") {
    if (next === mode) return;
    setMode(next);
    setResult(null);
  }

  const canSubmit =
    mode === "url" ? !!jobUrl.trim() : jobDescription.trim().length >= 50;

  async function handlePersonalize() {
    if (loading || !canSubmit) return;
    setLoading(true);
    setResult(null);

    try {
      const shared = {
        clientProfileUrl: clientProfileUrl.trim() || undefined,
        userProfile: buildProfileString(profile),
        voiceDna: buildVoiceDnaString(profile?.voiceDNA),
      };

      const response =
        mode === "url"
          ? await personalizeProposal({ mode: "url", jobUrl: jobUrl.trim(), ...shared })
          : await personalizeProposal({
              mode: "paste",
              jobDescription: jobDescription.trim(),
              ...shared,
            });

      if ("error" in response) {
        const messages: Record<string, string> = {
          pro_required: "This feature requires a Pro subscription.",
          unauthorized: "Please sign in to continue.",
          server_misconfigured: "Server configuration error. Please try again later.",
          ai_no_response: "The AI did not return a response. Please try again.",
          ai_request_failed: "The AI request failed. Please try again.",
          description_too_short: "Please paste at least 50 characters of the job description.",
          job_url_required: "Please enter a valid Upwork job URL.",
          invalid_job_url: "Please enter a valid Upwork job URL (upwork.com/jobs/...)",
        };
        addToast(messages[response.error] ?? response.error);
        return;
      }

      setResult(response);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.proposal) return;
    try {
      await navigator.clipboard.writeText(result.proposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Could not copy to clipboard. Please select and copy manually.");
    }
  }

  const hasNoIntelStats =
    !result?.clientIntelligence.client_location &&
    !result?.clientIntelligence.total_spent &&
    !result?.clientIntelligence.hire_rate &&
    result?.clientIntelligence.total_hires === null &&
    !result?.clientIntelligence.member_since &&
    !result?.clientIntelligence.budget;

  return (
    <div className="space-y-6">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="text-center space-y-3 pb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/[0.08] border border-violet-500/20 shadow-[0_0_30px_rgba(124,58,237,0.12)]">
          <Sparkles className="w-6 h-6 text-violet-400" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Write a proposal that speaks to this client&apos;s psychology
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
          Paste the job description — we research the client, analyze their patterns, and write a proposal tailored to win them.
        </p>
      </div>

      {/* ── Input card ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-6 space-y-5">

        {/* Mode toggle tabs — pill style */}
        <div className="flex rounded-full border border-zinc-800 bg-[#0a0a0a] p-1 gap-1">
          <button
            type="button"
            onClick={() => handleModeSwitch("url")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
              mode === "url"
                ? "bg-violet-500/10 text-violet-300 border border-violet-500/25"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            Job URL
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("paste")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
              mode === "paste"
                ? "bg-violet-500/10 text-violet-300 border border-violet-500/25"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            Paste Description
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-full leading-none">
              Recommended
            </span>
          </button>
        </div>

        {/* ── URL mode ─────────────────────────────────────────────────────── */}
        {mode === "url" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Job URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePersonalize()}
                  placeholder="https://www.upwork.com/jobs/~..."
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_0_24px_rgba(139,92,246,0.08)] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <ClientProfileInput
              value={clientProfileUrl}
              onChange={setClientProfileUrl}
              disabled={loading}
            />

            <p className="flex items-start gap-1.5 text-xs text-amber-400/80 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Note: Upwork job pages require login — URL mode works best when combined with a client profile URL
            </p>
          </div>
        )}

        {/* ── Paste mode ───────────────────────────────────────────────────── */}
        {mode === "paste" && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-400">Job Description</label>
                <span
                  className={`text-xs tabular-nums ${
                    jobDescription.length > DESC_MAX * 0.9
                      ? "text-amber-400"
                      : "text-zinc-600"
                  }`}
                >
                  {jobDescription.length.toLocaleString()} / {DESC_MAX.toLocaleString()}
                </span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, DESC_MAX))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePersonalize();
                }}
                placeholder="Paste the full job description here — title, requirements, budget, everything the client wrote..."
                disabled={loading}
                rows={8}
                className="w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_0_24px_rgba(139,92,246,0.08)] transition-all disabled:opacity-50 resize-y leading-relaxed"
                style={{ minHeight: "200px" }}
              />
              {jobDescription.length > 0 && jobDescription.trim().length < 50 && (
                <p className="text-xs text-amber-400/80 mt-1">
                  Add at least {50 - jobDescription.trim().length} more characters for a meaningful proposal.
                </p>
              )}
            </div>

            <ClientProfileInput
              value={clientProfileUrl}
              onChange={setClientProfileUrl}
              disabled={loading}
            />

            <p className="flex items-center gap-1.5 text-xs text-emerald-400/80">
              <Check className="w-3.5 h-3.5 shrink-0" />
              Works reliably — paste the job description directly for best results
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handlePersonalize}
          disabled={loading || !canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>
                {loadingPhase === "researching"
                  ? "Researching client…"
                  : "Writing personalized proposal…"}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 shrink-0" />
              Personalize Proposal
            </>
          )}
        </button>

        {/* Profile nudge */}
        {!profile?.skills?.length && (
          <p className="text-xs text-amber-400/80">
            Your profile isn&apos;t set up yet.{" "}
            <Link
              href="/dashboard/profile"
              className="underline hover:text-amber-300 transition-colors"
            >
              Add your skills
            </Link>{" "}
            for a stronger proposal.
          </p>
        )}
        {profile && !profile.voiceDNA && (
          <p className="text-xs text-amber-400/80 mt-1">
            <Link
              href="/dashboard/profile"
              className="underline underline-offset-2 hover:text-amber-300 transition-colors"
            >
              Set up Voice DNA
            </Link>
            {" "}so proposals match your writing style.
          </p>
        )}
      </div>

      {/* ── Loading shimmer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {[0, 1].map((col) => (
              <div
                key={col}
                className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-3 h-64 overflow-hidden"
              >
                <div className="h-3 rounded bg-zinc-800 w-28 animate-pulse" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-lg bg-zinc-800/60 animate-pulse" />
                  ))}
                </div>
                <div className="space-y-2 pt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-2.5 rounded bg-zinc-800/60 animate-pulse"
                      style={{ width: `${70 + i * 10}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start"
          >
            {/* LEFT — Client Intelligence */}
            <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-[#111111] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-400 uppercase tracking-wide">
                  <Brain className="w-3.5 h-3.5" />
                  Client Intelligence
                </div>
                {result.scrape_failed && (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                    Partial data
                  </span>
                )}
              </div>

              {result.scrape_failed && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300 leading-relaxed">
                    {result.input_mode === "paste"
                      ? "No client profile URL provided — proposal written from job description"
                      : "Job page requires login — try adding a client profile URL or switch to Paste mode"}
                  </p>
                </div>
              )}

              {/* Stats grid */}
              {!hasNoIntelStats && (
                <div className="grid grid-cols-2 gap-2">
                  {result.clientIntelligence.client_location && (
                    <IntelStat
                      icon={MapPin}
                      label="Location"
                      value={result.clientIntelligence.client_location}
                    />
                  )}
                  {result.clientIntelligence.total_spent && (
                    <IntelStat
                      icon={DollarSign}
                      label="Total Spent"
                      value={result.clientIntelligence.total_spent}
                    />
                  )}
                  {result.clientIntelligence.hire_rate && (
                    <IntelStat
                      icon={TrendingUp}
                      label="Hire Rate"
                      value={result.clientIntelligence.hire_rate}
                    />
                  )}
                  {result.clientIntelligence.total_hires !== null && (
                    <IntelStat
                      icon={Users}
                      label="Total Hires"
                      value={String(result.clientIntelligence.total_hires)}
                    />
                  )}
                  {result.clientIntelligence.member_since && (
                    <IntelStat
                      icon={Calendar}
                      label="Member Since"
                      value={result.clientIntelligence.member_since}
                    />
                  )}
                  {result.clientIntelligence.budget && (
                    <IntelStat
                      icon={DollarSign}
                      label="Budget"
                      value={result.clientIntelligence.budget}
                    />
                  )}
                </div>
              )}

              {hasNoIntelStats && !result.scrape_failed && (
                <p className="text-xs text-zinc-500 italic text-center py-2">
                  No client stats found on this page.
                </p>
              )}

              {/* Reviews */}
              {result.clientIntelligence.recent_reviews &&
                result.clientIntelligence.recent_reviews.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                      Reviews this client left for contractors
                    </p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {result.clientIntelligence.recent_reviews.map((review, i) => (
                        <blockquote
                          key={i}
                          className="rounded-lg bg-zinc-800/40 border-l-[3px] border-l-violet-500/50 px-3 py-2.5 text-xs text-zinc-300 leading-relaxed italic"
                        >
                          &ldquo;{review}&rdquo;
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* RIGHT — Generated proposal */}
            <div className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-3 flex flex-col shadow-[0_0_30px_rgba(124,58,237,0.05)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  Personalized Proposal
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    copied
                      ? "bg-emerald-950 border border-emerald-500/30 text-emerald-400"
                      : "bg-violet-500/10 border border-violet-500/25 text-violet-400 hover:bg-violet-500/15 hover:border-violet-500/40 hover:text-violet-300"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                value={result.proposal}
                className="w-full min-h-[420px] rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-200 resize-y focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_0_24px_rgba(139,92,246,0.08)] transition-all leading-relaxed"
              />

              <p className="text-[11px] text-zinc-600">
                Saved to{" "}
                <Link
                  href="/dashboard/proposals"
                  className="underline hover:text-zinc-400 transition-colors"
                >
                  My Proposals
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast container ─────────────────────────────────────────────────── */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} message={toast.message} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
