"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Loader2,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { analyzeJobRedFlags } from "@/actions/red-flag";
import type { RedFlagResult, RedFlag } from "@/lib/red-flag-analyzer";

// ── Types ─────────────────────────────────────────────────────────────────────

type Result = RedFlagResult & { input_length: number };
type Toast = { id: number; message: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const CHAR_MAX = 10_000;
const CHAR_MIN = 100;

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Please sign in to continue.",
  text_too_short: "Paste at least 100 characters for accurate analysis.",
  text_too_long: "Job posting is too long. Please trim to 10,000 characters.",
  analysis_failed: "Analysis failed. Please try again.",
};

// ── Style helpers ─────────────────────────────────────────────────────────────

function riskLevelStyles(level: RedFlagResult["risk_level"]) {
  switch (level) {
    case "low":
      return {
        badge: "bg-green-500/10 text-green-400 border border-green-500/30",
        score: "text-green-400",
        label: "Low Risk",
      };
    case "medium":
      return {
        badge: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
        score: "text-yellow-400",
        label: "Medium Risk",
      };
    case "high":
      return {
        badge: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
        score: "text-orange-400",
        label: "High Risk",
      };
    case "critical":
      return {
        badge: "bg-red-500/10 text-red-400 border border-red-500/30",
        score: "text-red-400",
        label: "Critical Risk",
      };
  }
}

function severityStyles(severity: RedFlag["severity"]): string {
  switch (severity) {
    case "low":    return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    case "medium": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    case "high":   return "bg-red-500/10 text-red-400 border border-red-500/20";
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export function RedFlagDetector() {
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const trimmedLength = jobText.trim().length;
  const canSubmit = trimmedLength >= CHAR_MIN;
  const showMinWarning = jobText.length > 0 && trimmedLength < CHAR_MIN;

  async function handleAnalyze() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeJobRedFlags(jobText);

      if ("error" in response) {
        addToast(ERROR_MESSAGES[response.error] ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(response);
    } catch {
      addToast("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Red Flag Detector</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Paste any Upwork job posting and find out if the client is worth your time — before you spend a single connect.
        </p>
      </div>

      {/* ── Input card ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-300">Job Posting</label>
            <span
              className={`text-xs tabular-nums ${
                jobText.length > CHAR_MAX * 0.9 ? "text-amber-400" : "text-zinc-600"
              }`}
            >
              {jobText.length.toLocaleString()} / {CHAR_MAX.toLocaleString()}
            </span>
          </div>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value.slice(0, CHAR_MAX))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
            }}
            placeholder="Paste the full Upwork job posting here — title, description, budget, client info..."
            disabled={loading}
            rows={8}
            className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 resize-y leading-relaxed"
            style={{ minHeight: "180px" }}
          />
          {showMinWarning && (
            <p className="mt-1.5 text-xs text-amber-400/80">
              Add at least {CHAR_MIN - trimmedLength} more characters for accurate analysis.
            </p>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!canSubmit || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Analyzing job post…
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Analyze Red Flags
            </>
          )}
        </button>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-4"
          >
            {/* Risk Score Card */}
            <div className="rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <span
                  className={`text-6xl font-black tabular-nums tracking-tight ${
                    riskLevelStyles(result.risk_level).score
                  }`}
                >
                  {result.risk_score}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    riskLevelStyles(result.risk_level).badge
                  }`}
                >
                  {riskLevelStyles(result.risk_level).label}
                </span>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                  {result.summary}
                </p>
              </div>

              {/* Gradient risk bar */}
              <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.risk_score}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #22c55e 0%, #eab308 40%, #f97316 70%, #ef4444 100%)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 font-medium">
                <span>Safe</span>
                <span>Dangerous</span>
              </div>
            </div>

            {/* Red Flags + Green Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Red Flags */}
              <div className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wide">
                  <ShieldX className="w-3.5 h-3.5" />
                  Red Flags
                  {result.red_flags.length > 0 && (
                    <span className="ml-auto rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-red-400 font-bold">
                      {result.red_flags.length}
                    </span>
                  )}
                </div>

                {result.red_flags.length === 0 ? (
                  <p className="text-sm text-green-400/80 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    No red flags detected
                  </p>
                ) : (
                  <div className="space-y-3">
                    {result.red_flags.map((flag, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-zinc-800 bg-[#0a0a0a] p-3 space-y-1.5"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${severityStyles(flag.severity)}`}
                          >
                            {flag.severity}
                          </span>
                          <span className="text-[11px] font-medium text-zinc-500">
                            {flag.category}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-200 leading-snug">
                          {flag.issue}
                        </p>
                        {flag.quote && (
                          <p className="text-xs text-zinc-500 italic leading-relaxed border-l-2 border-zinc-700 pl-2">
                            &ldquo;{flag.quote}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Green Flags */}
              <div className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-green-400 uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Green Flags
                  {result.green_flags.length > 0 && (
                    <span className="ml-auto rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-green-400 font-bold">
                      {result.green_flags.length}
                    </span>
                  )}
                </div>

                {result.green_flags.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">
                    No positive signals detected.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.green_flags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                          <Check className="w-2.5 h-2.5 text-green-400" />
                        </div>
                        <p className="text-sm text-zinc-300 leading-snug">{flag.signal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Verdict Card */}
            <div className="rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5" />
                Verdict
              </div>

              <p className="text-sm text-zinc-200 leading-relaxed">{result.verdict}</p>

              <div className="pt-1">
                {result.risk_level === "low" || result.risk_level === "medium" ? (
                  <Link
                    href="/dashboard/personalize"
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                  >
                    Write Proposal for This Job
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-5 py-2.5 text-sm font-semibold text-red-400 cursor-default select-none">
                    <ShieldX className="w-4 h-4" />
                    Skip This Job
                  </div>
                )}
              </div>
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
