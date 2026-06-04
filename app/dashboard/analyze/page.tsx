"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  Globe,
  Brain,
  Star,
  DollarSign,
  Calendar,
  ClipboardList,
  LayoutList,
  Shield,
  Zap,
} from "lucide-react";
import { Sidebar } from "../components/sidebar";

function parseBudget(budgetStr: string | null | undefined): number {
  if (!budgetStr) return 0;
  const clean = budgetStr.replace(/[$,]/g, "");
  const rangeMatch = clean.match(/(\d+(?:\.\d+)?)\s*[–\-]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) return (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
  const kMatch = budgetStr.match(/(\d+(?:\.\d+)?)[Kk]/);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const plusMatch = clean.match(/(\d+(?:\.\d+)?)\+/);
  if (plusMatch) return parseFloat(plusMatch[1]);
  const numMatch = clean.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1]);
  return 0;
}

type InputMode = "description" | "fullPage";

interface ClientIntel {
  hireRate?: string | null;
  totalSpent?: string | null;
  proposalCount?: string | null;
  clientLocation?: string | null;
  memberSince?: string | null;
  clientRating?: string | null;
  jobBudget?: string | null;
}

interface AnalysisResult extends ClientIntel {
  jobId: string;
  matchScore: number;
  clientConcern: string;
  competitionLevel: "Low" | "Medium" | "High";
  redFlags: string[];
  recommendedApproach: string;
  jobSummary: string;
  connectsRequired?: number | null;
  fearInsight?: {
    fearType: string;
    confidence: number;
    basedOnCount: number;
    openingLines: string[];
  };
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

function ProBlur({ children, isPro, featureName }: { children: React.ReactNode; isPro: boolean; featureName: string }) {
  if (isPro) return <>{children}</>;
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="blur-sm pointer-events-none select-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 rounded-xl">
        <div className="text-center space-y-3 p-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{featureName}</p>
            <p className="text-xs text-zinc-400 mt-1">Upgrade to Pro to unlock this insight</p>
          </div>
          <Link href="/dashboard/upgrade" className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-green-400 transition-colors">
            <Zap className="w-3 h-3" />
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

function FearInsightCard({ fearInsight, isPro }: { fearInsight: AnalysisResult["fearInsight"]; isPro: boolean }) {
  const mockFear = {
    fearType: "ghosting",
    confidence: 78,
    basedOnCount: 12,
    openingLines: [
      "I read your post — sounds like reliability has been the real issue, not capability.",
      "Before I pitch anything, let me address what I think you've experienced: hired and ghosted.",
    ],
  };

  const data = isPro ? fearInsight : mockFear;
  if (!data) return null;

  const fearLabel = data.fearType.charAt(0).toUpperCase() + data.fearType.slice(1);

  return (
    <motion.div variants={fadeUp}>
      <ProBlur isPro={isPro} featureName="Fear Detection">
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-orange-400 uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5" />
              Fear Detection
            </div>
            <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-semibold text-orange-300">
              {fearLabel} Fear
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{data.confidence}% confident</span>
              <span>Based on {data.basedOnCount} similar jobs analyzed</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${data.confidence}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Top 3 Opening Lines</p>
            <ol className="space-y-2">
              {data.openingLines.slice(0, 3).map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 border border-orange-500/25 text-xs font-bold text-orange-400">
                    {i + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </ProBlur>
    </motion.div>
  );
}

function ConnectRoiCard({
  result,
  connects,
  isPro,
}: {
  result: AnalysisResult;
  connects: number;
  isPro: boolean;
}) {
  const mockRoi = { winProb: 80, expectedEarnings: 750, roiScore: 125, verdict: "Priority" as const };

  const winProb = result.matchScore * 10;
  const expectedEarnings = parseBudget(result.jobBudget);
  const roiScore = connects > 0 ? Math.round((winProb / 100) * expectedEarnings / connects) : 0;
  const verdict =
    roiScore >= 60 ? "Priority" : roiScore >= 30 ? "Apply" : roiScore >= 10 ? "Consider" : "Skip";

  const display = isPro
    ? { winProb, expectedEarnings, roiScore, verdict }
    : mockRoi;

  const verdictColors = {
    Skip: "bg-red-500/15 text-red-400 border-red-500/30",
    Consider: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Apply: "bg-green-500/15 text-green-400 border-green-500/30",
    Priority: "bg-green-500/20 text-green-300 border-green-500/40",
  };

  return (
    <motion.div variants={fadeUp}>
      <ProBlur isPro={isPro} featureName="Connect ROI Score">
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-yellow-400 uppercase tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" />
            Connect ROI
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-zinc-800/50 px-3 py-2.5 space-y-0.5">
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Win Prob.</p>
              <p className="text-lg font-bold text-yellow-400">{display.winProb}%</p>
            </div>
            {display.expectedEarnings > 0 && (
              <div className="rounded-lg bg-zinc-800/50 px-3 py-2.5 space-y-0.5">
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Expected</p>
                <p className="text-lg font-bold text-yellow-400">${display.expectedEarnings.toLocaleString()}</p>
              </div>
            )}
            <div className="rounded-lg bg-zinc-800/50 px-3 py-2.5 space-y-0.5">
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">ROI/connect</p>
              <p className="text-lg font-bold text-yellow-400">${display.roiScore}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">Verdict:</span>
            <span className={`rounded-full border px-4 py-1 text-sm font-bold ${verdictColors[display.verdict as keyof typeof verdictColors]}`}>
              {display.verdict}
            </span>
          </div>
        </div>
      </ProBlur>
    </motion.div>
  );
}

function hasClientIntel(result: AnalysisResult) {
  return !!(
    result.hireRate ||
    result.totalSpent ||
    result.proposalCount ||
    result.clientLocation ||
    result.memberSince ||
    result.clientRating ||
    result.jobBudget
  );
}

function IntelItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
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

export default function AnalyzePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isPro = session?.user?.plan === "pro";
  const [inputMode, setInputMode] = useState<InputMode>("description");
  const [description, setDescription] = useState("");
  const [fullPageText, setFullPageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [connects, setConnects] = useState(6);

  async function handleAnalyze() {
    const inputText = inputMode === "fullPage" ? fullPageText : description;
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    setUpgradeRequired(false);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          inputMode === "fullPage"
            ? { fullPageText: inputText, connectsRequired: connects }
            : { description: inputText, connectsRequired: connects },
        ),
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
      if (inputMode === "fullPage" && data.connectsRequired != null) {
        setConnects(data.connectsRequired);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleWriteProposal() {
    if (!result) return;
    router.push(`/dashboard/write?jobId=${result.jobId}`);
  }

  const inputValue = inputMode === "fullPage" ? fullPageText : description;
  const setInputValue = inputMode === "fullPage" ? setFullPageText : setDescription;

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analyze Job</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Score a job and uncover the client&apos;s real concern before writing your proposal.
            </p>
          </div>

          {/* Input card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            {/* Mode toggle */}
            <div className="flex items-center gap-1 rounded-lg bg-zinc-950 border border-zinc-800 p-1 w-fit">
              <button
                onClick={() => setInputMode("description")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  inputMode === "description"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Job description
              </button>
              <button
                onClick={() => setInputMode("fullPage")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  inputMode === "fullPage"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                Paste full job page
                <span className="rounded-full bg-green-500/15 border border-green-500/25 text-green-400 px-1.5 py-0 text-[10px] font-semibold">
                  More intel
                </span>
              </button>
            </div>

            {/* Mode hint */}
            {inputMode === "fullPage" && (
              <p className="text-xs text-zinc-500 leading-relaxed">
                Copy everything from the Upwork job page — job description, &ldquo;About the client&rdquo;,
                and &ldquo;Activity on this job&rdquo; sections. The AI will extract hire rate, total spent,
                proposal count, budget, and more.
              </p>
            )}

            <label className="block text-sm font-medium text-zinc-300">
              {inputMode === "fullPage" ? "Full job page text" : "Job description"}
            </label>

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                inputMode === "fullPage"
                  ? "Paste the entire Upwork job page here — title, description, 'About the client', 'Activity on this job'…"
                  : "Paste the full Upwork job posting here…"
              }
              rows={inputMode === "fullPage" ? 14 : 10}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-1 focus:ring-green-500/60 focus:border-green-500/60 transition-colors"
            />

            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-400 shrink-0">Connects required:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={connects}
                onChange={(e) => setConnects(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-green-500/60 focus:border-green-500/60 transition-colors"
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !inputValue.trim()}
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
                You&apos;ve analyzed 5 jobs on the free plan. Upgrade to Pro for unlimited job analysis.
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
                {/* Client Intelligence — Pro only; free users see blurred mock */}
                {(hasClientIntel(result) || (!isPro && inputMode === "fullPage")) && (
                  <motion.div variants={fadeUp}>
                    <ProBlur isPro={isPro} featureName="Client Intelligence">
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-400 uppercase tracking-wide">
                          <Brain className="w-3.5 h-3.5" />
                          Client Intelligence
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {isPro ? (
                            <>
                              {result.hireRate && <IntelItem icon={TrendingUp} label="Hire Rate" value={result.hireRate} />}
                              {result.totalSpent && <IntelItem icon={DollarSign} label="Total Spent" value={result.totalSpent} />}
                              {result.jobBudget && <IntelItem icon={DollarSign} label="Budget" value={result.jobBudget} />}
                              {result.proposalCount && <IntelItem icon={ClipboardList} label="Proposals Sent" value={result.proposalCount} />}
                              {result.clientRating && <IntelItem icon={Star} label="Client Rating" value={result.clientRating} />}
                              {result.clientLocation && <IntelItem icon={Globe} label="Location" value={result.clientLocation} />}
                              {result.memberSince && <IntelItem icon={Calendar} label="Member Since" value={result.memberSince} />}
                            </>
                          ) : (
                            <>
                              <IntelItem icon={TrendingUp} label="Hire Rate" value="87%" />
                              <IntelItem icon={DollarSign} label="Total Spent" value="$45K+" />
                              <IntelItem icon={DollarSign} label="Budget" value="$500–$1,500" />
                              <IntelItem icon={ClipboardList} label="Proposals Sent" value="10 to 20" />
                              <IntelItem icon={Star} label="Client Rating" value="4.9" />
                              <IntelItem icon={Globe} label="Location" value="United States" />
                              <IntelItem icon={Calendar} label="Member Since" value="March 2021" />
                            </>
                          )}
                        </div>
                      </div>
                    </ProBlur>
                  </motion.div>
                )}

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

                {/* Fear Detection */}
                <FearInsightCard fearInsight={result.fearInsight} isPro={isPro} />

                {/* Connect ROI */}
                <ConnectRoiCard result={result} connects={connects} isPro={isPro} />

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
