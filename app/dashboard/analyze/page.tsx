"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Users,
  Lightbulb,
  FileText,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Sidebar } from "../components/sidebar";

interface AnalysisResult {
  jobId: string;
  matchScore: number;
  clientConcern: string;
  competitionLevel: "Low" | "Medium" | "High";
  redFlags: string[];
  recommendedApproach: string;
  jobSummary: string;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

function matchScoreColor(score: number) {
  if (score >= 8) return "text-green-400";
  if (score >= 5) return "text-yellow-400";
  return "text-red-400";
}

function matchScoreBg(score: number) {
  if (score >= 8) return "bg-green-500/10 border-green-500/30";
  if (score >= 5) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function competitionBadge(level: "Low" | "Medium" | "High") {
  const styles = {
    Low: "bg-green-500/15 text-green-400",
    Medium: "bg-yellow-500/15 text-yellow-400",
    High: "bg-red-500/15 text-red-400",
  };
  return styles[level];
}

export default function AnalyzePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleAnalyze() {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setUpgradeRequired(false);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string; upgradeRequired?: boolean };
        if (data.upgradeRequired) {
          setUpgradeRequired(true);
          return;
        }
        throw new Error(data.error ?? "Analysis failed");
      }

      const data = (await res.json()) as AnalysisResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleWriteProposal() {
    if (!result) return;
    const params = new URLSearchParams({ jobId: result.jobId });
    router.push(`/dashboard/write?${params.toString()}`);
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analyze Job</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Paste a job description and get AI-powered insights before writing your proposal.
            </p>
          </div>

          {/* Input card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <label className="block text-sm font-medium text-zinc-300">
              Job description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full Upwork job posting here..."
              rows={10}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-1 focus:ring-green-500/60 focus:border-green-500/60 transition-colors"
            />
            {error && (
              <p className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}
            <button
              onClick={handleAnalyze}
              disabled={loading || !description.trim()}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze Job
                </>
              )}
            </button>
          </div>

          {/* Upgrade wall */}
          {upgradeRequired && (
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 space-y-4">
              <p className="text-zinc-200 leading-relaxed">
                You&apos;ve analyzed 3 jobs on the free plan. Upgrade to Pro for unlimited job analysis.
              </p>
              <Link
                href="/dashboard/upgrade"
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors"
              >
                Upgrade to Pro
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="results"
                variants={stagger}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                {/* Header row: match score + competition */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                  <div
                    className={`rounded-xl border p-5 flex flex-col items-center justify-center gap-1 ${matchScoreBg(result.matchScore)}`}
                  >
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                      Match Score
                    </span>
                    <span className={`text-4xl font-bold ${matchScoreColor(result.matchScore)}`}>
                      {result.matchScore}
                      <span className="text-xl text-zinc-500">/10</span>
                    </span>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                      <Users className="w-3.5 h-3.5" />
                      Competition
                    </div>
                    <span
                      className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${competitionBadge(result.competitionLevel)}`}
                    >
                      {result.competitionLevel}
                    </span>
                  </div>
                </motion.div>

                {/* Job summary */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    <FileText className="w-3.5 h-3.5" />
                    Job Summary
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">{result.jobSummary}</p>
                </motion.div>

                {/* Client concern */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Client&apos;s Core Concern
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">{result.clientConcern}</p>
                </motion.div>

                {/* Recommended approach */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Recommended Approach
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">{result.recommendedApproach}</p>
                </motion.div>

                {/* Red flags */}
                {result.redFlags.length > 0 && (
                  <motion.div
                    variants={fadeUp}
                    className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-red-400 uppercase tracking-wide">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Red Flags
                    </div>
                    <ul className="space-y-2">
                      {result.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {result.redFlags.length === 0 && (
                  <motion.div
                    variants={fadeUp}
                    className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex items-center gap-3"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    <p className="text-sm text-green-300">No red flags detected — looks like a clean posting.</p>
                  </motion.div>
                )}

                {/* CTA */}
                <motion.div variants={fadeUp}>
                  <button
                    onClick={handleWriteProposal}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors"
                  >
                    Write Proposal for this Job
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
