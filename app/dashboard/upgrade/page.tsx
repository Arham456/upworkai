import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Check, X, Zap } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "../components/sidebar";
import { CheckoutButton } from "./components/checkout-button";

const FREE_FEATURES = [
  { text: "5 job analyses to get started", included: true },
  { text: "5 proposals lifetime", included: true },
  { text: "Job scoring with match score", included: true },
  { text: "Connect ROI score (basic)", included: true },
  { text: "Basic proposal generation", included: true },
  { text: "Win/loss tracking", included: true },
  { text: "Mobile friendly", included: true },
  { text: "Voice DNA & tone matching", included: false },
  { text: "Client Intelligence extraction", included: false },
  { text: "Client Fear Database", included: false },
];

const PRO_FEATURES = [
  { text: "Unlimited job analyses", included: true },
  { text: "Unlimited proposals", included: true },
  { text: "No watermark on proposals", included: true },
  { text: "Voice DNA — AI learns your exact writing style", included: true },
  { text: "Client Intelligence (hire rate, spend, rating)", included: true },
  { text: "Proposal Personalization Engine — AI researches the client before writing your proposal", included: true },
  { text: "Client Fear Database — predicts fear with confidence %", included: true },
  { text: "Connect ROI Score with weekly report", included: true },
  { text: "Win pattern learning over time", included: true },
  { text: "AI tone matching from your samples", included: true },
  { text: "Priority support", included: true },
];

export default async function UpgradePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  const isPro = user?.plan === "pro";

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isPro ? "You're on Pro" : "Upgrade to Pro"}
            </h1>
            <p className="text-zinc-500 text-sm">
              {isPro
                ? "You have unlimited access to all features."
                : "Unlock the full power of RefinedHawk."}
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free card */}
            <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-6 flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                    Free
                  </p>
                  {!isPro && (
                    <span className="rounded-full bg-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                      Current plan
                    </span>
                  )}
                </div>
                <p className="mt-2 text-3xl font-bold text-white">
                  $0
                  <span className="text-base font-normal text-zinc-500"> / month</span>
                </p>
              </div>

              <ul className="flex-1 space-y-2.5">
                {FREE_FEATURES.map(({ text, included }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm">
                    {included ? (
                      <Check className="w-4 h-4 shrink-0 text-zinc-500" />
                    ) : (
                      <X className="w-4 h-4 shrink-0 text-zinc-700" />
                    )}
                    <span className={included ? "text-zinc-300" : "text-zinc-600"}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="rounded-lg border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-500 cursor-not-allowed opacity-60">
                {isPro ? "Previous plan" : "Your current plan"}
              </div>
            </div>

            {/* Pro card */}
            <div className="rounded-2xl border border-violet-500/40 bg-[#111111] p-6 flex flex-col gap-5 relative overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.08)]">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
              {/* Most popular badge */}
              {!isPro && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] bg-violet-600 text-white font-bold px-3 py-1 rounded-b-full block">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="relative mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-violet-400 uppercase tracking-wide">
                      Pro
                    </p>
                    <Zap className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  {isPro && (
                    <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-xs font-medium text-violet-400">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-2 text-3xl font-bold text-white">
                  $20
                  <span className="text-base font-normal text-zinc-500"> / month</span>
                </p>
              </div>

              <ul className="relative flex-1 space-y-2.5">
                {PRO_FEATURES.map(({ text, included }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm">
                    <Check
                      className={`w-4 h-4 shrink-0 ${
                        included ? "text-violet-400" : "text-zinc-600"
                      }`}
                    />
                    <span className={included ? "text-zinc-200" : "text-zinc-500"}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="relative">
                {isPro ? (
                  <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 py-2.5 text-center text-sm font-semibold text-violet-400">
                    Active — enjoy Pro
                  </div>
                ) : (
                  <>
                    <CheckoutButton />
                    <p className="text-center text-xs text-zinc-600 mt-2">
                      Secure checkout via Polar
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {!isPro && (
            <p className="text-center text-xs text-zinc-600">
              Cancel any time. No questions asked.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
