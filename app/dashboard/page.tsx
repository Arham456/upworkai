import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BarChart2, CheckCircle2, Sparkles, Zap } from "lucide-react";

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

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "./components/sidebar";
import { StatsCards } from "./components/stats-cards";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [totalProposals, wonProposals, jobsAnalyzed, profile, user] = await Promise.all([
    prisma.proposal.count({ where: { userId } }),
    prisma.proposal.count({ where: { userId, status: "won" } }),
    prisma.job.count({ where: { userId } }),
    prisma.profile.findUnique({
      where: { userId },
      select: { skills: true, niche: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, proposalsGenerated: true },
    }),
  ]);

  const isPro = user?.plan === "pro";

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weeklyJobs = isPro
    ? await prisma.job.findMany({
        where: { userId, createdAt: { gte: weekStart } },
        select: {
          connectsRequired: true,
          matchScore: true,
          jobBudget: true,
          jobCategory: true,
          jobSummary: true,
        },
      })
    : [];

  const totalConnects = weeklyJobs.reduce((sum, j) => sum + (j.connectsRequired ?? 6), 0);
  const totalExpectedValue = Math.round(
    weeklyJobs.reduce((sum, j) => sum + ((j.matchScore ?? 0) / 10) * parseBudget(j.jobBudget), 0),
  );

  const categoryRoi: Record<string, { total: number; count: number }> = {};
  for (const j of weeklyJobs) {
    const cat = j.jobCategory ?? "Unknown";
    const connects = j.connectsRequired ?? 6;
    const earnings = parseBudget(j.jobBudget);
    const roi = connects > 0 ? ((j.matchScore ?? 0) / 10) * earnings / connects : 0;
    if (!categoryRoi[cat]) categoryRoi[cat] = { total: 0, count: 0 };
    categoryRoi[cat].total += roi;
    categoryRoi[cat].count += 1;
  }

  const categoryAvgs = Object.entries(categoryRoi).map(([cat, { total, count }]) => ({
    cat,
    avg: count > 0 ? total / count : 0,
  }));

  const bestCategory = categoryAvgs.length > 0
    ? categoryAvgs.reduce((a, b) => (a.avg >= b.avg ? a : b)).cat
    : null;
  const worstCategory = categoryAvgs.length > 1
    ? categoryAvgs.reduce((a, b) => (a.avg <= b.avg ? a : b)).cat
    : null;

  const winRate =
    totalProposals > 0 ? Math.round((wonProposals / totalProposals) * 100) : 0;

  const proposalsGenerated = user?.proposalsGenerated ?? 0;
  const proposalsRemaining = Math.max(0, 5 - proposalsGenerated);
  const analysesRemaining = Math.max(0, 5 - jobsAnalyzed);

  const isNewUser = jobsAnalyzed === 0 && totalProposals === 0;

  const step1Done = jobsAnalyzed > 0;
  const step2Done = !!(profile && profile.skills.length > 0 && profile.niche);
  const step3Done = totalProposals > 0;
  const allDone = step1Done && step2Done && step3Done;

  const steps = [
    { step: "1", label: "Analyze a job", done: step1Done },
    { step: "2", label: "Set up your profile", done: step2Done },
    { step: "3", label: "Check a job for red flags", done: step3Done },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />

      <main
        className="flex-1 overflow-y-auto pt-14 md:pt-0"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(139,92,246,0.05) 1px, transparent 0)", backgroundSize: "28px 28px" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">
              Here&apos;s your proposal performance.
            </p>
          </div>

          {isNewUser ? (
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-violet-950/10 to-[#111111] p-10 flex flex-col items-center text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <BarChart2 className="w-7 h-7 text-violet-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">
                  Find out if a job is worth your connects
                </h2>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Paste any Upwork job posting and get a match score, the
                  client&apos;s core concern, and whether it&apos;s worth
                  applying to — in seconds.
                </p>
              </div>
              <Link
                href="/dashboard/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                Analyze your first job
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-zinc-600">Start here — no profile setup needed</p>
            </div>
          ) : (
            <StatsCards
              totalProposals={totalProposals}
              winRate={winRate}
              jobsAnalyzed={jobsAnalyzed}
            />
          )}

          {/* Free plan usage */}
          {!isPro && !isNewUser && (
            <div className="rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                  Free Plan Usage
                </h2>
                <Link
                  href="/dashboard/upgrade"
                  className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-400 hover:bg-violet-500/20 transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  Upgrade — $20/mo
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-zinc-300">
                      {proposalsGenerated} of 5 free proposals generated
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        proposalsRemaining <= 1 ? "text-red-400" : "text-zinc-500"
                      }`}
                    >
                      {proposalsRemaining} remaining
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        proposalsRemaining <= 1 ? "bg-red-500" : "bg-violet-600"
                      }`}
                      style={{ width: `${Math.min(100, (proposalsGenerated / 5) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-zinc-300">
                      {jobsAnalyzed} of 5 free analyses used
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        analysesRemaining <= 1 ? "text-red-400" : "text-zinc-500"
                      }`}
                    >
                      {analysesRemaining} remaining
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        analysesRemaining <= 1 ? "bg-red-500" : "bg-violet-600"
                      }`}
                      style={{ width: `${Math.min(100, (jobsAnalyzed / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weekly ROI Report — Pro only */}
          {isPro && weeklyJobs.length > 0 && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-wide">
                <BarChart2 className="w-3.5 h-3.5" />
                This Week&apos;s ROI
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-zinc-800/50 px-3 py-2.5 space-y-0.5">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Connects Spent</p>
                  <p className="text-lg font-bold text-violet-400">{totalConnects}</p>
                </div>
                <div className="rounded-lg bg-zinc-800/50 px-3 py-2.5 space-y-0.5">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Jobs Analyzed</p>
                  <p className="text-lg font-bold text-violet-400">{weeklyJobs.length}</p>
                </div>
                <div className="rounded-lg bg-zinc-800/50 px-3 py-2.5 space-y-0.5">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Expected Value</p>
                  <p className="text-lg font-bold text-violet-400">${totalExpectedValue.toLocaleString()}</p>
                </div>
              </div>

              {(bestCategory || worstCategory) && (
                <div className="flex flex-wrap gap-3 text-sm">
                  {bestCategory && (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400">
                      Best: {bestCategory}
                    </span>
                  )}
                  {worstCategory && worstCategory !== bestCategory && (
                    <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs text-red-400">
                      Worst: {worstCategory}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Get started / You're all set */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/15 to-[#111111] p-6 shadow-[0_0_40px_rgba(124,58,237,0.05)]">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-violet-500/10 shrink-0">
                {allDone ? (
                  <CheckCircle2 className="w-5 h-5 text-violet-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-violet-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {allDone ? (
                  <>
                    <h2 className="text-lg font-semibold text-white">
                      You&apos;re all set!
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                      Your profile is configured, you&apos;ve analyzed jobs, and your
                      first proposal is written. Keep going — every proposal sharpens your edge.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href="/dashboard/analyze"
                        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
                      >
                        Analyze another job
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/dashboard/proposals"
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        View my proposals
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-white">
                      {!step1Done
                        ? "Analyze your first job — instant results"
                        : !step2Done
                        ? "Set up your profile for better results"
                        : "Analyze your first job"}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                      {!step1Done
                        ? "See your match score, the client's core concern, and whether a job is worth your connects — before you spend them."
                        : !step2Done
                        ? "Tell the AI your skills and niche so it tailors every proposal to your voice and strengths."
                        : "Paste any Upwork job and RefinedHawk will score the client risk before you apply."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {!step1Done && (
                        <Link
                          href="/dashboard/analyze"
                          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
                        >
                          Analyze your first job
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      {step1Done && !step2Done && (
                        <Link
                          href="/dashboard/profile"
                          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
                        >
                          Set up your profile
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      {step1Done && step2Done && !step3Done && (
                        <Link
                          href="/dashboard/red-flags"
                          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
                        >
                          Analyze your first job
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      {step1Done && (
                        <Link
                          href="/dashboard/analyze"
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          Analyze another job
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps.map(({ step, label, done }) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-[#0a0a0a]/60 px-4 py-3"
                >
                  {done ? (
                    <CheckCircle2 className="w-6 h-6 text-violet-500 shrink-0" />
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-xs font-bold text-zinc-500">
                      {step}
                    </span>
                  )}
                  <span className={`text-sm font-medium ${done ? "text-white" : "text-zinc-500"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
