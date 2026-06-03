"use client";

import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowRight,
  BarChart2,
  Check,
  PenLine,
  Sparkles,
  Trophy,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-x-hidden">
      {/* Grain texture */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Background glows */}
      <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-green-500/10 blur-[140px]" />
        <div className="absolute top-[20%] right-[-5%] w-[350px] h-[350px] rounded-full bg-green-500/5 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* ── Navbar ───────────────────────────────────────── */}
        <header className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30">
              <Sparkles className="w-4 h-4 text-green-400" />
            </div>
            <span className="font-semibold text-white tracking-tight">UpworkAI</span>
          </div>

          {/* Glowing sign-in button */}
          <div className="relative group">
            <div className="absolute -inset-px rounded-full bg-gradient-to-r from-green-500 to-emerald-400 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300" />
            <button
              onClick={() => signIn("google")}
              disabled={status === "loading"}
              className="relative flex items-center gap-2 rounded-full border border-zinc-700 group-hover:border-transparent bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200 disabled:opacity-60"
            >
              Sign in
            </button>
          </div>
        </header>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Left — copy */}
            <div className="space-y-7">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-400 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Trusted by 500+ freelancers
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease }}
                className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.1] text-white"
              >
                Stop Losing Jobs to{" "}
                <span className="text-green-400">Weaker Freelancers</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease }}
                className="text-lg text-zinc-400 leading-relaxed max-w-[480px]"
              >
                UpworkAI reads every job post, finds what the client actually
                fears, and writes a proposal that makes them choose you.
              </motion.p>

              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease }}
                className="space-y-3"
              >
                {[
                  "Analyzes client psychology in seconds",
                  "Writes proposals in your voice",
                  "Scores jobs before you waste connects",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                      <Check className="w-3 h-3 text-green-400" />
                    </span>
                    <span className="text-sm text-zinc-300">{item}</span>
                  </li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease }}
                className="flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <button
                  onClick={() => signIn("google")}
                  disabled={status === "loading"}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-green-500 hover:bg-green-400 px-7 py-3.5 text-base font-semibold text-zinc-950 shadow-lg shadow-green-500/20 hover:shadow-green-500/35 transition-all duration-200 disabled:opacity-60"
                >
                  <GoogleIcon />
                  Start for Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="text-xs text-zinc-500">
                  Free forever · No credit card · 2 min setup
                </p>
              </motion.div>
            </div>

            {/* Right — mock UI card */}
            <motion.div
              initial={{ opacity: 0, x: 32, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease }}
              className="relative"
            >
              {/* Glow behind card */}
              <div className="absolute inset-[-10%] rounded-3xl bg-green-500/8 blur-3xl pointer-events-none" />

              {/* Glass card */}
              <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-6 shadow-2xl shadow-black/40 space-y-5">
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                      AI Analysis
                    </span>
                  </div>
                  <span className="text-xs text-zinc-600 bg-zinc-800 px-2.5 py-0.5 rounded-full">
                    Just now
                  </span>
                </div>

                {/* Score + bars */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-[76px] h-[76px] rounded-2xl bg-green-500/10 border border-green-500/20 shrink-0">
                    <span className="text-3xl font-bold text-green-400 leading-none">9</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">/10 match</span>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-500">Competition</span>
                        <span className="text-xs text-red-400 font-medium">High</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "78%" }}
                          transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-500">Your fit</span>
                        <span className="text-xs text-green-400 font-medium">Excellent</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "90%" }}
                          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client fear */}
                <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-4 py-3 space-y-1">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                    Client&apos;s Core Fear
                  </p>
                  <p className="text-sm text-zinc-200 leading-snug">
                    &ldquo;Being ghosted again by an unreliable developer mid-project&rdquo;
                  </p>
                </div>

                {/* Proposal snippet */}
                <div className="rounded-xl bg-green-500/5 border border-green-500/20 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-medium text-green-400">
                      Generated Proposal
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    &ldquo;I read your post carefully — it sounds like you&apos;ve been through
                    the hired-and-ghosted cycle before. Here&apos;s my commitment: daily
                    Slack updates, a shared board you can check anytime, and three
                    client references before we start...&rdquo;
                  </p>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="w-0.5 h-3.5 bg-green-400 rounded-full" />
                    <span className="text-xs text-zinc-500">Writing…</span>
                  </motion.div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2.5 py-0.5 rounded-full">
                    No budget set
                  </span>
                  <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full">
                    ✓ Clear scope
                  </span>
                  <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full">
                    ✓ Long-term potential
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Social proof bar ─────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="border-y border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm py-4"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-sm text-zinc-500">
              Join freelancers from 50+ countries
            </span>
            <div className="hidden sm:block w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-1">
              {["🇺🇸","🇬🇧","🇮🇳","🇵🇰","🇩🇪","🇫🇷","🇧🇷","🇨🇦","🇦🇺","🇳🇬"].map((flag) => (
                <span
                  key={flag}
                  className="text-base hover:scale-125 transition-transform cursor-default"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Features ─────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 py-24 space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything you need to win more jobs
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-sm">
              Three tools built for one outcome: clients choosing you over everyone else.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: BarChart2,
                title: "Job Analyzer",
                desc: "Find the client's real fear before applying. Know if a job is worth your connects before you spend them.",
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                border: "border-blue-400/15 bg-blue-500/[0.03]",
              },
              {
                icon: PenLine,
                title: "Proposal Writer",
                desc: "AI writes in your voice — not generic templates. Every proposal sounds like you read their post twice.",
                color: "text-green-400",
                bg: "bg-green-400/10",
                border: "border-green-500/30 bg-green-500/5 ring-1 ring-green-500/20",
                badge: "Most popular",
              },
              {
                icon: Trophy,
                title: "Win Tracker",
                desc: "Track won and lost proposals. Learn exactly what works so you stop repeating what doesn't.",
                color: "text-yellow-400",
                bg: "bg-yellow-400/10",
                border: "border-yellow-400/15 bg-yellow-500/[0.03]",
              },
            ].map(({ icon: Icon, title, desc, color, bg, border, badge }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`relative rounded-2xl border p-6 space-y-4 ${border}`}
              >
                {badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="text-xs bg-green-500 text-zinc-950 font-semibold px-3 py-0.5 rounded-full">
                      {badge}
                    </span>
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Before / After ───────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 py-10 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 mb-12"
          >
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">
              Before vs After
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              The difference is obvious
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-sm">
              See what clients actually read vs. what makes them click hire.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-5"
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-400">
                  Generic Proposal
                </span>
              </div>
              <div className="space-y-2 text-sm text-zinc-400 leading-relaxed">
                <p>Hello,</p>
                <p>
                  I am interested in your project. I have 5 years of experience
                  in web development and I am confident I can complete this task.
                </p>
                <p>
                  I am proficient in React, Node.js, and many other technologies.
                  I have worked on similar projects before and can deliver high
                  quality work on time.
                </p>
                <p>
                  Please check my profile for my portfolio. I am available to
                  start immediately.
                </p>
                <p>Best regards</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-red-500/10">
                {["No research", "Generic opener", "No social proof", "Gets ignored"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-green-400">
                    UpworkAI Proposal
                  </span>
                </div>
                <span className="text-xs bg-green-500 text-zinc-950 font-bold px-2.5 py-0.5 rounded-full">
                  Hired
                </span>
              </div>
              <div className="space-y-2 text-sm text-zinc-300 leading-relaxed">
                <p>
                  I read your post twice — sounds like you&apos;ve been through the
                  hired-and-ghosted cycle before, and you&apos;re done with it.
                </p>
                <p>
                  That&apos;s exactly what I&apos;ve solved for my last three clients, all
                  still with me. I send daily updates without being asked and have
                  never missed a deadline in four years.
                </p>
                <p>
                  Your project needs [specific detail from their post]. I&apos;ve
                  built this exact thing for [relevant example]. Here&apos;s what week
                  one looks like if we work together...
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-green-500/10">
                {["Addresses fear", "Specific research", "Social proof", "Gets hired"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-green-500/15 border border-green-500/25 text-green-400 px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-12 sm:p-16 text-center space-y-7 overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-green-500/10 blur-3xl pointer-events-none" />

            <div className="relative space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Free to start
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Start Writing Winning Proposals Today
              </h2>
              <p className="text-zinc-400 max-w-sm mx-auto text-sm">
                Join 500+ freelancers who stopped losing to weaker candidates.
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => signIn("google")}
                disabled={status === "loading"}
                className="group inline-flex items-center gap-2.5 rounded-full bg-green-500 hover:bg-green-400 px-8 py-4 text-base font-semibold text-zinc-950 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 disabled:opacity-60"
              >
                <GoogleIcon />
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="text-xs text-zinc-500">No credit card required</p>
            </div>
          </motion.div>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="border-t border-zinc-800/60 py-8 px-6 sm:px-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-green-500/20">
                <Sparkles className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-sm font-medium text-zinc-500">UpworkAI</span>
            </div>
            <p className="text-xs text-zinc-600">
              © 2026 UpworkAI. Built for freelancers.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
