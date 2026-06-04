import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Check, X, Zap } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "../components/sidebar";
import { CheckoutButton } from "./components/checkout-button";

const FREE_FEATURES = [
  { text: "5 proposals to get your first win", included: true },
  { text: "5 job analyses", included: true },
  { text: "Basic proposal generation", included: true },
  { text: "Win/loss tracking", included: true },
  { text: "Unlimited proposals", included: false },
  { text: "AI tone matching", included: false },
  { text: "No watermark", included: false },
];

const PRO_FEATURES = [
  { text: "Unlimited proposals", included: true },
  { text: "Unlimited job analysis", included: true },
  { text: "AI tone matching from your samples", included: true },
  { text: "Win pattern learning", included: true },
  { text: "No watermark", included: true },
  { text: "Weekly performance reports", included: true },
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
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {isPro ? "You're on Pro" : "Upgrade to Pro"}
            </h1>
            <p className="text-zinc-400 text-sm">
              {isPro
                ? "You have unlimited access to all features."
                : "Unlock unlimited proposals and the full power of UpworkAI."}
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free card */}
            <div
              className={`rounded-2xl border p-6 flex flex-col gap-5 ${
                !isPro
                  ? "border-green-500/40 bg-zinc-900"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
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
                      <Check className="w-4 h-4 shrink-0 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 shrink-0 text-zinc-600" />
                    )}
                    <span className={included ? "text-zinc-200" : "text-zinc-500"}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="rounded-lg border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-500">
                Your current plan
              </div>
            </div>

            {/* Pro card */}
            <div
              className={`rounded-2xl border p-6 flex flex-col gap-5 relative overflow-hidden ${
                isPro
                  ? "border-green-500/40 bg-zinc-900"
                  : "border-green-500/50 bg-zinc-900"
              }`}
            >
              {/* Glow accent */}
              <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-green-400 uppercase tracking-wide">
                      Pro
                    </p>
                    <Zap className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  {isPro && (
                    <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2.5 py-0.5 text-xs font-medium text-green-400">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-2 text-3xl font-bold text-white">
                  $14
                  <span className="text-base font-normal text-zinc-500"> / month</span>
                </p>
              </div>

              <ul className="relative flex-1 space-y-2.5">
                {PRO_FEATURES.map(({ text, included }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm">
                    <Check
                      className={`w-4 h-4 shrink-0 ${
                        included ? "text-green-400" : "text-zinc-600"
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
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 py-2.5 text-center text-sm font-semibold text-green-400">
                    Active — enjoy Pro
                  </div>
                ) : (
                  <CheckoutButton />
                )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          {!isPro && (
            <p className="text-center text-xs text-zinc-600">
              Secure checkout via Polar. Cancel any time. No questions asked.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
