import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";
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
      select: { plan: true },
    }),
  ]);

  const winRate =
    totalProposals > 0 ? Math.round((wonProposals / totalProposals) * 100) : 0;

  const isPro = user?.plan === "pro";
  const proposalsRemaining = Math.max(0, 5 - totalProposals);
  const analysesRemaining = Math.max(0, 3 - jobsAnalyzed);

  const step1Done = !!(profile && profile.skills.length > 0 && profile.niche);
  const step2Done = jobsAnalyzed > 0;
  const step3Done = totalProposals > 0;
  const allDone = step1Done && step2Done && step3Done;

  const steps = [
    { step: "1", label: "Set up your profile", done: step1Done },
    { step: "2", label: "Paste a job description", done: step2Done },
    { step: "3", label: "Get your AI proposal", done: step3Done },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Here&apos;s an overview of your proposal activity.
            </p>
          </div>

          <StatsCards
            totalProposals={totalProposals}
            winRate={winRate}
            jobsAnalyzed={jobsAnalyzed}
          />

          {/* Free plan usage */}
          {!isPro && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                  Free Plan Usage
                </h2>
                <Link
                  href="/dashboard/upgrade"
                  className="flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  Upgrade — $14/mo
                </Link>
              </div>

              <div className="space-y-4">
                {/* Proposals bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-zinc-300">
                      {totalProposals} of 5 free proposals used
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
                        proposalsRemaining <= 1 ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(100, (totalProposals / 5) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Analyses bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-zinc-300">
                      {jobsAnalyzed} of 3 free analyses used
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
                        analysesRemaining <= 1 ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(100, (jobsAnalyzed / 3) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 shrink-0">
                {allDone ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-green-400" />
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
                        className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors"
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
                      Get Started — Set Up Your Profile
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                      Before writing proposals, tell the AI about your skills,
                      niche, and experience. This lets it tailor every proposal to
                      your voice and strengths.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {!step1Done && (
                        <Link
                          href="/dashboard/profile"
                          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors"
                        >
                          Set up profile
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      {step1Done && !step2Done && (
                        <Link
                          href="/dashboard/analyze"
                          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors"
                        >
                          Analyze a job
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      {step1Done && step2Done && !step3Done && (
                        <Link
                          href="/dashboard/write"
                          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors"
                        >
                          Write your first proposal
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        href="/dashboard/analyze"
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Analyze a job first
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps.map(({ step, label, done }) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-green-500 text-zinc-950"
                        : "border border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {done ? "✓" : step}
                  </span>
                  <span className={`text-sm ${done ? "text-white" : "text-zinc-400"}`}>
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
