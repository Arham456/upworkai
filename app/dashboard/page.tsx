import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "./components/sidebar";
import { StatsCards } from "./components/stats-cards";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const firstName = session.user.name?.split(" ")[0] ?? "there";

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

          <StatsCards />

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 shrink-0">
                <Sparkles className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white">
                  Get Started — Set Up Your Profile
                </h2>
                <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                  Before writing proposals, tell the AI about your skills,
                  niche, and experience. This lets it tailor every proposal to
                  your voice and strengths.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors"
                  >
                    Set up profile
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard/analyze"
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Analyze a job first
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: "1", label: "Set up your profile", done: false },
                { step: "2", label: "Paste a job description", done: false },
                { step: "3", label: "Get your AI proposal", done: false },
              ].map(({ step, label, done }) => (
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
                    {step}
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
