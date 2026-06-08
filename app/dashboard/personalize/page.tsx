import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "../components/sidebar";
import { Personalizer } from "./components/personalizer";

export default async function PersonalizePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const [profile, user] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        skills: true,
        niche: true,
        experience: true,
        sampleProposals: true,
        voiceDNA: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
  ]);

  const isPro = user?.plan === "pro";

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Personalize Proposal
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">
              Drop a job URL — we research the client, then write a proposal tailored to their psychology.
            </p>
          </div>

          {!isPro ? (
            <div className="relative rounded-xl overflow-hidden">
              {/* Blurred preview */}
              <div
                aria-hidden
                className="blur-sm pointer-events-none select-none opacity-40 rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-5"
              >
                <div className="flex gap-3">
                  <div className="h-10 rounded-lg bg-zinc-700/60 flex-1" />
                  <div className="h-10 rounded-lg bg-violet-600/50 w-44 shrink-0" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl border border-zinc-800 bg-[#0a0a0a] p-5 space-y-4">
                    <div className="h-3 rounded bg-blue-400/30 w-28" />
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-14 rounded-lg bg-zinc-800/60" />
                      ))}
                    </div>
                    <div className="space-y-2 pt-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-10 rounded-lg bg-zinc-800/40 border-l-2 border-violet-500/30" />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-[#0a0a0a] p-5 space-y-2.5">
                    <div className="h-3 rounded bg-violet-400/30 w-32" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-2.5 rounded bg-zinc-700/40"
                        style={{ width: `${75 + (i % 3) * 8}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Pro gate overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/80 rounded-xl">
                <div className="text-center space-y-4 p-8 max-w-sm">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
                    <Zap className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-base font-semibold text-white">Pro Feature</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Client personalization reads their hiring history, reviews they left for past
                      contractors, and budget behavior — then writes a proposal that speaks directly
                      to their psychology.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/upgrade"
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <Personalizer profile={profile} />
          )}
        </div>
      </main>
    </div>
  );
}
