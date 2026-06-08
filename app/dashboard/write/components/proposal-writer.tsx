"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenLine,
  Loader2,
  Copy,
  Check,
  Save,
  RefreshCw,
  BookOpen,
  Sparkles,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Brain,
  DollarSign,
  Globe,
  Star,
  Calendar,
  ClipboardList,
} from "lucide-react";

interface Job {
  id: string;
  description: string;
  jobSummary: string | null;
  clientConcern: string | null;
  recommendedApproach: string | null;
  competitionLevel: string | null;
  matchScore: number | null;
  redFlags: string[];
  hireRate: string | null;
  totalSpent: string | null;
  proposalCount: string | null;
  clientLocation: string | null;
  memberSince: string | null;
  clientRating: string | null;
  jobBudget: string | null;
}

interface Props {
  job: Job | null;
}

function scoreColor(score: number) {
  if (score >= 8) return "text-violet-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

function IntelItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-zinc-800/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className="text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function hasClientIntel(job: Job) {
  return !!(
    job.hireRate ||
    job.totalSpent ||
    job.proposalCount ||
    job.clientLocation ||
    job.memberSince ||
    job.clientRating ||
    job.jobBudget
  );
}

export function ProposalWriter({ job }: Props) {
  const [manualDescription, setManualDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const canGenerate = job !== null || manualDescription.trim().length > 0;

  async function handleGenerate() {
    if (!canGenerate || isGenerating) return;
    setIsGenerating(true);
    setProposal("");
    setError(null);
    setUpgradeRequired(false);
    setSavedId(null);

    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job?.id,
          jobDescription: !job ? manualDescription : undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string; upgradeRequired?: boolean };
        if (data.upgradeRequired) {
          setUpgradeRequired(true);
          return;
        }
        throw new Error(data.error ?? "Generation failed");
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setProposal((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    if (!proposal.trim() || isSaving || savedId) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/proposal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: proposal, jobId: job?.id }),
      });
      const data = (await res.json()) as { proposalId?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSavedId(data.proposalId!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Write Proposal</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {job
            ? "AI will use your profile, job analysis, and client intelligence to craft a personalized proposal."
            : "Enter a job description below to generate a personalized proposal."}
        </p>
      </div>

      {/* Client Intelligence card */}
      {job && hasClientIntel(job) && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400 uppercase tracking-wide">
            <Brain className="w-3.5 h-3.5" />
            Client Intelligence
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {job.hireRate && <IntelItem icon={TrendingUp} label="Hire Rate" value={job.hireRate} />}
            {job.totalSpent && <IntelItem icon={DollarSign} label="Total Spent" value={job.totalSpent} />}
            {job.jobBudget && <IntelItem icon={DollarSign} label="Budget" value={job.jobBudget} />}
            {job.proposalCount && <IntelItem icon={ClipboardList} label="Proposals Sent" value={job.proposalCount} />}
            {job.clientRating && <IntelItem icon={Star} label="Client Rating" value={job.clientRating} />}
            {job.clientLocation && <IntelItem icon={Globe} label="Location" value={job.clientLocation} />}
            {job.memberSince && <IntelItem icon={Calendar} label="Member Since" value={job.memberSince} />}
          </div>
        </div>
      )}

      {/* Job context card */}
      {job && (
        <div className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-4 border-l-[3px] border-l-violet-500">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wide">
            <BookOpen className="w-3.5 h-3.5" />
            Job Context
          </div>

          <div className="grid gap-3">
            {job.jobSummary && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Summary</p>
                <p className="text-sm text-zinc-200 leading-relaxed">{job.jobSummary}</p>
              </div>
            )}

            {job.clientConcern && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Client&apos;s Core Fear</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{job.clientConcern}</p>
              </div>
            )}

            {job.matchScore !== null && (
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Match score</span>
                  <span className={`text-sm font-bold ${scoreColor(job.matchScore)}`}>
                    {job.matchScore}/10
                  </span>
                </div>
                {job.competitionLevel && (
                  <span className="text-xs text-zinc-500">
                    · {job.competitionLevel} competition
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual job input */}
      {!job && (
        <div className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-3">
          <label className="block text-sm font-medium text-zinc-300">
            Job Description
          </label>
          <textarea
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
            placeholder="Paste the Upwork job posting here…"
            rows={9}
            className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500 transition-colors"
          />
          <p className="text-xs text-zinc-500">
            Tip: run{" "}
            <a href="/dashboard/analyze" className="text-violet-400 hover:underline">
              Analyze Job
            </a>{" "}
            first to unlock smarter, insight-driven proposals.
          </p>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {proposal ? "Regenerate" : "Generate Proposal"}
          </>
        )}
      </button>

      {/* Upgrade wall */}
      {upgradeRequired && (
        <div className="rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-4">
          <p className="text-zinc-200 leading-relaxed">
            You&apos;ve used all 5 free proposals. Free plan was designed to get you your first win.
            If it worked — Pro is how you keep winning. $20/month — less than what you earn in one hour.
          </p>
          <Link
            href="/dashboard/upgrade"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Proposal output */}
      <AnimatePresence>
        {(proposal || isGenerating) && (
          <motion.div
            key="proposal-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="rounded-xl border border-zinc-800 bg-[#111111] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <PenLine className="w-4 h-4" />
                Your Proposal
              </div>
              {isGenerating && (
                <span className="flex items-center gap-1.5 text-xs text-violet-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Writing…
                </span>
              )}
            </div>

            <div className="p-5">
              <div className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                {proposal}
                {isGenerating && (
                  <span className="inline-block w-0.5 h-[1.1em] bg-violet-400 ml-0.5 animate-pulse align-middle" />
                )}
                {!proposal && isGenerating && (
                  <span className="text-zinc-500">Thinking…</span>
                )}
              </div>
            </div>

            {proposal && !isGenerating && (
              <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-t border-zinc-800 bg-[#0a0a0a]/50">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>

                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>

                <div className="flex-1" />

                {savedId ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    Saved to My Proposals
                  </span>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {isSaving ? "Saving…" : "Save Proposal"}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
