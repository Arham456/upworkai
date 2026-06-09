import Link from "next/link";
import { HawkLogo } from "@/components/hawk-logo";
import { Mail, MessageSquare, Clock } from "lucide-react";

export const metadata = {
  title: "Contact — RefinedHawk",
};

export default function ContactPage() {
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

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
        <div className="space-y-3 mb-12">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Get in touch</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Contact Us</h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-lg">
            Have a question, found a bug, or want to share feedback? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Main contact card */}
        <div
          className="rounded-2xl p-8 space-y-6 mb-10"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 40px rgba(124,58,237,0.08)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-5 h-5 text-violet-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Email Support</p>
              <p className="text-zinc-400 text-sm">
                For all inquiries — billing, bugs, feature requests, or general questions.
              </p>
              <a
                href="mailto:arham.k5299@gmail.com"
                className="inline-block mt-2 text-violet-400 hover:text-violet-300 font-medium transition-colors text-sm underline underline-offset-2"
              >
                arham.k5299@gmail.com
              </a>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Response Time</p>
              <p className="text-zinc-400 text-sm">
                We typically respond within <span className="text-zinc-200">24–48 hours</span>. For
                urgent billing issues, include &ldquo;Urgent&rdquo; in your subject line.
              </p>
            </div>
          </div>
        </div>

        {/* What to include */}
        <div className="rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <p className="text-sm font-semibold text-white">What to include in your email</p>
          </div>
          <ul className="space-y-2 text-sm text-zinc-400">
            {[
              { type: "Bug reports", detail: "steps to reproduce, what you expected, what happened" },
              { type: "Billing questions", detail: "the email address on your account" },
              { type: "Feature requests", detail: "what problem it solves and how you'd use it" },
              { type: "Account deletion", detail: "just ask — we'll handle it within 30 days" },
            ].map(({ type, detail }) => (
              <li key={type} className="flex gap-2">
                <span className="text-violet-500 shrink-0 mt-0.5">›</span>
                <span>
                  <span className="text-zinc-200 font-medium">{type}:</span> {detail}
                </span>
              </li>
            ))}
          </ul>
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
