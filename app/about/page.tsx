import Link from "next/link";
import { HawkLogo } from "@/components/hawk-logo";
import { Sparkles, Target, Zap } from "lucide-react";

export const metadata = {
  title: "About — RefinedHawk",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-10 py-4 border-b border-zinc-800 bg-[#0a0a0a]/95 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <HawkLogo size={32} />
          <span className="font-bold text-white tracking-tight">RefinedHawk</span>
        </Link>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-16 space-y-16">
        {/* Hero */}
        <div className="space-y-5">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">About</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Built by a freelancer,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
              for freelancers.
            </span>
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            RefinedHawk started as a personal tool to solve a real problem: spending connects on
            jobs that weren&apos;t worth applying to, and sending proposals that looked just like
            everyone else&apos;s.
          </p>
        </div>

        {/* Story */}
        <div
          className="rounded-2xl p-8 space-y-5 text-zinc-300 leading-relaxed"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p>
            Upwork is competitive. Really competitive. The average job gets 20–50 proposals within
            hours, and most of them say the exact same thing: &ldquo;I have 5 years of experience, I&apos;m
            a hard worker, here&apos;s my portfolio.&rdquo;
          </p>
          <p>
            The freelancers who win aren&apos;t necessarily the most skilled. They&apos;re the ones who
            understand what the client is actually afraid of — and speak directly to that fear
            before anyone else does.
          </p>
          <p>
            RefinedHawk gives every freelancer the tools to do exactly that: analyze a job in
            seconds, spot clients not worth your time, and write proposals that feel like they were
            written specifically for that one client.
          </p>
        </div>

        {/* Values */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">What we believe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Target,
                title: "Research beats hustle",
                desc: "One well-researched proposal beats ten generic ones. We help you do the research in seconds.",
              },
              {
                icon: Zap,
                title: "Time is money",
                desc: "Connects cost money. Wasted proposals cost time. We help you invest both where they matter.",
              },
              {
                icon: Sparkles,
                title: "Your voice, amplified",
                desc: "AI should sound like you — not like a robot. We use your own samples to match your style.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-3"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Individual operator note */}
        <div className="rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-2">
          <p className="text-sm font-semibold text-white">A note on who we are</p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            RefinedHawk is an independently operated product — not a VC-backed startup, not a
            large team. That means fast iteration, direct support, and no fluff. Every feature
            exists because it helps freelancers win more jobs, not because it looks good in a
            pitch deck.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Questions or ideas?{" "}
            <a
              href="mailto:arham.k5299@gmail.com"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
            >
              arham.k5299@gmail.com
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-zinc-800/60 py-8 px-4 sm:px-10 mt-16">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HawkLogo size={20} />
            <span className="text-sm font-medium text-zinc-500">RefinedHawk</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-600">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-zinc-400 transition-colors">Contact</Link>
            <Link href="/about" className="hover:text-zinc-400 transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
