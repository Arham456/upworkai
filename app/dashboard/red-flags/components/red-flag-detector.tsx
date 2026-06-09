"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Check,
  Sparkles,
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

// ── Design tokens per risk level ──────────────────────────────────────────────

function riskConfig(level: RedFlagResult["risk_level"]) {
  switch (level) {
    case "low":
      return {
        cardBg: "bg-gradient-to-br from-green-950 to-[#0a0a0a]",
        cardBorder: "border-green-500/30",
        scoreColor: "text-green-400",
        badgeBg: "bg-green-500/15 border border-green-500/40",
        badgeText: "text-green-400",
        label: "LOW RISK",
        cardGlow: "shadow-[0_0_80px_rgba(34,197,94,0.12)]",
        verdictBorder: "border-green-500/30",
        verdictGlow: "shadow-[0_0_50px_rgba(34,197,94,0.08)]",
        verdictLabel: "text-green-400",
        VerdictIcon: ShieldCheck,
        verdictTitle: "SAFE TO APPLY",
        isSafe: true,
      } as const;
    case "medium":
      return {
        cardBg: "bg-gradient-to-br from-yellow-950 to-[#0a0a0a]",
        cardBorder: "border-yellow-500/30",
        scoreColor: "text-yellow-400",
        badgeBg: "bg-yellow-500/15 border border-yellow-500/40",
        badgeText: "text-yellow-400",
        label: "MEDIUM RISK",
        cardGlow: "shadow-[0_0_80px_rgba(234,179,8,0.12)]",
        verdictBorder: "border-yellow-500/30",
        verdictGlow: "shadow-[0_0_50px_rgba(234,179,8,0.08)]",
        verdictLabel: "text-yellow-400",
        VerdictIcon: ShieldAlert,
        verdictTitle: "PROCEED WITH CARE",
        isSafe: true,
      } as const;
    case "high":
      return {
        cardBg: "bg-gradient-to-br from-orange-950 to-[#0a0a0a]",
        cardBorder: "border-orange-500/30",
        scoreColor: "text-orange-400",
        badgeBg: "bg-orange-500/15 border border-orange-500/40",
        badgeText: "text-orange-400",
        label: "HIGH RISK",
        cardGlow: "shadow-[0_0_80px_rgba(249,115,22,0.15)]",
        verdictBorder: "border-orange-500/30",
        verdictGlow: "shadow-[0_0_50px_rgba(249,115,22,0.08)]",
        verdictLabel: "text-orange-400",
        VerdictIcon: ShieldX,
        verdictTitle: "HIGH RISK — THINK TWICE",
        isSafe: false,
      } as const;
    case "critical":
      return {
        cardBg: "bg-gradient-to-br from-red-950 to-[#0a0a0a]",
        cardBorder: "border-red-500/30",
        scoreColor: "text-red-400",
        badgeBg: "bg-red-500/15 border border-red-500/40",
        badgeText: "text-red-400",
        label: "CRITICAL RISK",
        cardGlow: "shadow-[0_0_80px_rgba(239,68,68,0.18)]",
        verdictBorder: "border-red-500/30",
        verdictGlow: "shadow-[0_0_50px_rgba(239,68,68,0.10)]",
        verdictLabel: "text-red-400",
        VerdictIcon: ShieldX,
        verdictTitle: "CRITICAL — AVOID THIS JOB",
        isSafe: false,
      } as const;
  }
}

function severityConfig(severity: RedFlag["severity"]) {
  switch (severity) {
    case "low":
      return {
        leftBorder: "border-l-yellow-500",
        badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
        dot: "bg-yellow-500",
      };
    case "medium":
      return {
        leftBorder: "border-l-orange-500",
        badge: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
        dot: "bg-orange-500",
      };
    case "high":
      return {
        leftBorder: "border-l-red-500",
        badge: "bg-red-500/15 text-red-400 border border-red-500/30",
        dot: "bg-red-500",
      };
  }
}

// ── Animation variants ────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

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

function AnalyzingState() {
  return (
    <motion.div
      key="analyzing"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center py-20 space-y-6"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-violet-400" />
        </div>
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl border border-violet-500/30"
          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      </motion.div>

      <div className="text-center space-y-2">
        <p className="text-lg font-bold text-white">Analyzing for red flags…</p>
        <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
          Scanning client history, risk patterns, and posting language
        </p>
      </div>

      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-500"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
      </div>
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

      {/* ── Input Card ──────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-zinc-800 bg-[#111111] overflow-hidden">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        <div className="p-8 space-y-7">
          {/* Icon + headline */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-violet-400" />
              </div>
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl"
                style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, transparent 70%)", filter: "blur(12px)" }}
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Is this client safe to work with?
              </h1>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
                Paste the job posting and get an instant risk score — before you spend a single connect.
              </p>
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Job Posting
              </label>
              <span className={`text-xs tabular-nums font-medium transition-colors ${
                jobText.length > CHAR_MAX * 0.9 ? "text-amber-400" : "text-zinc-600"
              }`}>
                {jobText.length.toLocaleString()} / {CHAR_MAX.toLocaleString()}
              </span>
            </div>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value.slice(0, CHAR_MAX))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
              }}
              placeholder="Paste the full Upwork job posting here — title, description, budget, client info…"
              disabled={loading}
              rows={8}
              className="w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_0_24px_rgba(139,92,246,0.08)] transition-all duration-200 disabled:opacity-50 resize-y leading-relaxed"
              style={{ minHeight: "180px" }}
            />
            {showMinWarning && (
              <p className="flex items-center gap-1.5 text-xs text-amber-400/80">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Add at least {CHAR_MIN - trimmedLength} more characters for accurate analysis
              </p>
            )}
          </div>

          {/* CTA button */}
          <button
            onClick={handleAnalyze}
            disabled={!canSubmit || loading}
            className="group w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 px-6 py-3.5 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Analyzing…
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Analyze Red Flags
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Analyzing / Results ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Loading state */}
        {loading && <AnalyzingState />}

        {/* Results */}
        {result && !loading && (
          <motion.div
            key="results"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            className="space-y-5"
          >

            {/* ── Risk Score Card ────────────────────────────────────────────── */}
            {(() => {
              const cfg = riskConfig(result.risk_level);
              const VerdictIcon = cfg.VerdictIcon;
              return (
                <motion.div
                  variants={fadeInUp}
                  className={`rounded-2xl border ${cfg.cardBorder} ${cfg.cardBg} p-8 space-y-8 ${cfg.cardGlow}`}
                >
                  <div className="flex flex-col items-center text-center space-y-5">
                    {/* Giant score */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.65, ease, delay: 0.1 }}
                      className="flex items-end gap-2 leading-none"
                    >
                      <span
                        className={`text-[8rem] font-black tabular-nums leading-none tracking-tighter ${cfg.scoreColor}`}
                        style={{ textShadow: "0 0 80px currentColor, 0 0 120px currentColor" }}
                      >
                        {result.risk_score}
                      </span>
                      <span className="text-3xl font-bold text-zinc-700 mb-5">/100</span>
                    </motion.div>

                    {/* Risk level badge */}
                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.35 }}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.18em] ${cfg.badgeBg} ${cfg.badgeText}`}
                    >
                      <VerdictIcon className="w-4 h-4" />
                      {cfg.label}
                    </motion.span>

                    {/* Summary */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="text-base text-zinc-300 leading-relaxed max-w-lg"
                    >
                      {result.summary}
                    </motion.p>
                  </div>

                  {/* Risk bar */}
                  <div className="space-y-2.5">
                    <div className="relative h-4 w-full rounded-full bg-black/50 overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${result.risk_score}%` }}
                        transition={{ duration: 1.3, ease, delay: 0.45 }}
                        className="h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #22c55e 0%, #eab308 35%, #f97316 65%, #ef4444 100%)",
                          boxShadow: "0 0 16px rgba(239,68,68,0.25)",
                        }}
                      />
                      {[25, 50, 75].map((tick) => (
                        <div
                          key={tick}
                          className="absolute inset-y-0 w-px bg-black/60"
                          style={{ left: `${tick}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                      <span>Safe</span>
                      <span>Moderate</span>
                      <span>Dangerous</span>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* ── Flags Grid ────────────────────────────────────────────────── */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Red Flags */}
              <div className="rounded-2xl border border-zinc-800 bg-[#111111] overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/80 bg-red-950/25">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-xs font-black text-red-400 uppercase tracking-widest">
                    Red Flags
                  </span>
                  <span className="ml-auto rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-black px-2.5 py-0.5 tabular-nums">
                    {result.red_flags.length}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {result.red_flags.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-xl bg-green-500/5 border border-green-500/15 px-4 py-3.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <p className="text-sm font-medium text-green-400">No red flags detected</p>
                    </div>
                  ) : (
                    result.red_flags.map((flag, i) => {
                      const sv = severityConfig(flag.severity);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.08, duration: 0.3 }}
                          className={`rounded-xl border-l-4 ${sv.leftBorder} bg-red-950/20 border border-red-500/15 p-4 space-y-2`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-black uppercase tracking-widest rounded-full px-2.5 py-0.5 ${sv.badge}`}>
                                {flag.severity}
                              </span>
                              <span className="text-[11px] font-medium text-zinc-500">
                                {flag.category}
                              </span>
                            </div>
                            <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${sv.dot}`} />
                          </div>
                          <p className="text-sm font-semibold text-white leading-snug">
                            {flag.issue}
                          </p>
                          {flag.quote && (
                            <p className="text-xs text-zinc-400 italic leading-relaxed pl-3 border-l-2 border-zinc-700 mt-1">
                              &ldquo;{flag.quote}&rdquo;
                            </p>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Green Flags */}
              <div className="rounded-2xl border border-zinc-800 bg-[#111111] overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/80 bg-green-950/25">
                  <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-xs font-black text-green-400 uppercase tracking-widest">
                    Green Flags
                  </span>
                  <span className="ml-auto rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-black px-2.5 py-0.5 tabular-nums">
                    {result.green_flags.length}
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  {result.green_flags.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic text-center py-6">
                      No positive signals detected.
                    </p>
                  ) : (
                    result.green_flags.map((flag, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.08, duration: 0.3 }}
                        className="flex items-start gap-3 rounded-xl bg-green-950/20 border border-green-500/15 px-4 py-3"
                      >
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <p className="text-sm text-zinc-300 leading-snug">{flag.signal}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── Verdict Card ──────────────────────────────────────────────── */}
            {(() => {
              const cfg = riskConfig(result.risk_level);
              const VerdictIcon = cfg.VerdictIcon;
              return (
                <motion.div
                  variants={fadeInUp}
                  className={`rounded-2xl border bg-[#111111] p-6 space-y-5 ${cfg.verdictBorder} ${cfg.verdictGlow}`}
                >
                  {/* Label */}
                  <div className={`flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.18em] ${cfg.verdictLabel}`}>
                    <VerdictIcon className="w-4 h-4" />
                    <span>Verdict</span>
                    <span className="text-zinc-700">—</span>
                    <span>{cfg.verdictTitle}</span>
                  </div>

                  <div className="h-px bg-zinc-800/80" />

                  {/* Verdict text */}
                  <p className="text-base text-zinc-200 leading-relaxed">{result.verdict}</p>

                  {/* CTA */}
                  <div className="pt-1">
                    {cfg.isSafe ? (
                      <Link
                        href="/dashboard/personalize"
                        className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        Write Personalized Proposal
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/25 px-6 py-3 text-sm font-bold text-red-400 cursor-default select-none">
                        <ShieldX className="w-4 h-4 shrink-0" />
                        Skip This Job — Too Risky
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast container ──────────────────────────────────────────────────── */}
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
