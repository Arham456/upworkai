"use client";

import { motion, useInView } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart2,
  Check,
  PenLine,
  Search,
  Settings,
  Trophy,
  UserPlus,
  X,
  Zap,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

// -- Particle Canvas ----------------------------------------
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
    }

    const particles: Particle[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.35 + 0.1,
        opacity: Math.random() * 0.4 + 0.05,
      });
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx!.fill();
        p.y -= p.speed;
        if (p.y < -p.size) {
          p.y = canvas!.height + p.size;
          p.x = Math.random() * canvas!.width;
        }
      }
      animId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen", opacity: 0.6 }}
    />
  );
}

// -- Animated Grid Lines -----------------------------------
function GridLines() {
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[28, 52, 76].map((top, i) => (
        <div
          key={`h${i}`}
          className="absolute left-0 h-px"
          style={{
            top: `${top}%`,
            backgroundColor: "#27272a",
            opacity: 0.75,
            animation: `drawLineH 1.8s ease forwards ${0.3 + i * 0.25}s`,
            width: 0,
          }}
        />
      ))}
      {[25, 50, 75].map((left, i) => (
        <div
          key={`v${i}`}
          className="absolute top-0 w-px"
          style={{
            left: `${left}%`,
            backgroundColor: "#27272a",
            opacity: 0.75,
            animation: `drawLineV 1.8s ease forwards ${0.5 + i * 0.25}s`,
            height: 0,
          }}
        />
      ))}
    </div>
  );
}

// -- Animated Counter --------------------------------------
function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1.8,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = (now - start) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  const handleWaitlist = async () => {
    const emailValue = email.trim();
    if (!emailValue || !emailValue.includes("@")) {
      setWaitlistError("Please enter a valid email");
      return;
    }
    setWaitlistLoading(true);
    setWaitlistError("");
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });
      console.log("[waitlist] status:", res.status);
      const data = await res.json() as { error?: string };
      console.log("[waitlist] response:", data);
      if (res.ok) {
        setWaitlistSuccess(true);
      } else {
        setWaitlistError(data.error ?? "Something went wrong");
      }
    } catch (err) {
      console.error("[waitlist] fetch error:", err);
      setWaitlistError("Network error. Please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <ParticleCanvas />
      <GridLines />

      {/* Violet ambient glow */}
      <div
        aria-hidden
        className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)" }}
      />

      <div className="relative z-10">
        {/* -- Navbar ----------------------------------------- */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-10 py-4 border-b border-zinc-800 bg-[#0a0a0a]/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" width={36} height={36} alt="RefinedHawk logo" className="shrink-0" />
            <span className="font-bold text-white tracking-tight">RefinedHawk</span>
          </div>
          <button
            onClick={() => signIn("google")}
            disabled={status === "loading"}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200 disabled:opacity-60"
          >
            Sign in
          </button>
        </header>

        {/* -- Hero ------------------------------------------- */}
        <section className="min-h-[calc(100vh-57px)] flex items-center px-4 sm:px-10 py-16">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-center">

              {/* Left: copy */}
              <div className="space-y-8">
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease }}
                  className="font-bold tracking-tight"
                  style={{ fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 1.05 }}
                >
                  <span className="text-white block">Stop Losing Jobs</span>
                  <span className="block bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                    to Weaker Freelancers.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15, ease }}
                  className="text-zinc-400 text-lg leading-relaxed max-w-md"
                >
                  UpworkAI finds what clients actually fear and writes proposals
                  that make them choose you.
                </motion.p>

                <motion.ul
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.28, ease }}
                  className="space-y-3.5"
                >
                  {[
                    "Analyze client psychology in seconds",
                    "Write proposals in your exact voice",
                    "Score jobs before wasting connects",
                  ].map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm text-zinc-300">
                      <span className="text-violet-400 font-bold text-base leading-none shrink-0">&#8594;</span>
                      {point}
                    </li>
                  ))}
                </motion.ul>

                {/* Social proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="flex items-center gap-3 pt-2"
                >
                  {/* Avatar stack */}
                  <div className="flex -space-x-2">
                    {[
                      { initials: "AK", bg: "bg-violet-600" },
                      { initials: "SR", bg: "bg-blue-600" },
                      { initials: "MJ", bg: "bg-emerald-600" },
                      { initials: "PL", bg: "bg-orange-500" },
                      { initials: "TC", bg: "bg-pink-600" },
                    ].map(({ initials, bg }) => (
                      <div
                        key={initials}
                        className={`w-7 h-7 rounded-full ${bg} border-2 border-[#0a0a0a] flex items-center justify-center`}
                      >
                        <span className="text-[9px] font-bold text-white">{initials}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500">
                    <span className="text-zinc-300 font-medium">500+</span> freelancers already winning more jobs
                  </span>
                </motion.div>
              </div>

              {/* Right: signup card */}
              <motion.div
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.18, ease }}
                className="relative max-w-sm w-full mx-auto lg:mx-0"
              >
                {/* Violet glow behind card */}
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-3xl pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 70%)" }}
                />

                <div
                  className="relative rounded-2xl p-8 space-y-5"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 0 40px rgba(124,58,237,0.10), 0 24px 48px rgba(0,0,0,0.4)",
                  }}
                >
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Get started free</p>

                  {/* Google button */}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); signIn("google"); }}
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-zinc-100 py-3.5 text-sm font-medium text-zinc-900 transition-colors disabled:opacity-60"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <span className="text-xs text-zinc-600">or</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                  </div>

                  {/* Email / waitlist */}
                  <div className="space-y-3">
                    {waitlistSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-600/10 px-4 py-4"
                      >
                        <Check className="w-4 h-4 text-violet-400 shrink-0" />
                        <p className="text-sm text-violet-300">
                          You&apos;re on the list! We&apos;ll be in touch soon. 🎉
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setWaitlistError(""); }}
                          onKeyDown={(e) => { if (e.key === "Enter") handleWaitlist(); }}
                          placeholder="Enter your email"
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)",
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.7)"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
                        />
                        <button
                          type="button"
                          onClick={handleWaitlist}
                          disabled={waitlistLoading}
                          className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {waitlistLoading ? "Joining..." : "Get Early Access →"}
                        </button>
                        {waitlistError && (
                          <p className="text-xs text-red-400 text-center">{waitlistError}</p>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 text-center">
                    Free forever &middot; No credit card required
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* -- How It Works ----------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-10 py-20 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Get Started in 2 Minutes
            </h2>
            <p className="text-zinc-400 max-w-sm mx-auto text-sm">
              No setup. No complexity. Just results.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

            {[
              {
                num: "01",
                icon: UserPlus,
                title: "Sign Up Free",
                desc: "Create your account with one click. No credit card needed.",
              },
              {
                num: "02",
                icon: Settings,
                title: "Build Your Profile",
                desc: "Tell us your skills and paste sample proposals. AI learns your voice.",
              },
              {
                num: "03",
                icon: Search,
                title: "Analyze Any Job",
                desc: "Paste any job description. Get client psychology, match score, and red flags instantly.",
              },
              {
                num: "04",
                icon: Trophy,
                title: "Win More Jobs",
                desc: "Send proposals that address what clients actually fear. Watch your response rate climb.",
              },
            ].map(({ num, icon: Icon, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative flex flex-col items-center text-center px-4 md:px-6 space-y-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-[#111111] border border-zinc-800 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-violet-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white leading-none">
                    {num}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-zinc-400 text-sm font-medium">Ready to win your next job?</p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn("google")}
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 disabled:opacity-60"
            >
              Start Free - No Credit Card
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </section>

        {/* -- Value Banner ----------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-zinc-800 bg-[#111111] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            <div className="relative px-4 sm:px-10 py-10 space-y-8">
              <p className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-white leading-snug">
                One extra job won ={" "}
                <span className="text-violet-400">
                  21 months of RefinedHawk paid for
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                {[
                  { label: "Average Upwork job", prefix: "$", target: 300, suffix: "", note: "typical contract" },
                  { label: "RefinedHawk cost", prefix: "$", target: 14, suffix: "/mo", note: "all features included" },
                  { label: "Your ROI", prefix: "", target: 21, suffix: "x", note: "return on investment" },
                ].map(({ label, prefix, target, suffix, note }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="flex-1 rounded-xl border border-zinc-800 bg-[#0a0a0a]/60 px-6 py-6 text-center space-y-2"
                  >
                    <p className="text-4xl sm:text-3xl md:text-4xl font-bold text-violet-400 tabular-nums">
                      <AnimatedCounter target={target} prefix={prefix} suffix={suffix} />
                    </p>
                    <p className="text-sm font-medium text-zinc-200">{label}</p>
                    <p className="text-xs text-zinc-600">{note}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* -- Features --------------------------------------- */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-10 pb-24 space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
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
              },
              {
                icon: PenLine,
                title: "Proposal Writer",
                desc: "AI writes in your voice — not generic templates. Every proposal sounds like you read their post twice.",
                badge: "Most popular",
              },
              {
                icon: Trophy,
                title: "Win Tracker",
                desc: "Track won and lost proposals. Learn exactly what works so you stop repeating what doesn't.",
              },
            ].map(({ icon: Icon, title, desc, badge }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-xl border border-zinc-800 bg-[#111111] p-6 space-y-4 hover:border-violet-500/40 transition-colors duration-300 cursor-default"
              >
                {badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="text-xs bg-violet-600 text-white font-semibold px-3 py-0.5 rounded-full">
                      {badge}
                    </span>
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* -- Comparison Table ------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-10 pb-28 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Why RefinedHawk Beats Everything Else
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-sm">
              More powerful. More personal. Less expensive.
            </p>
          </motion.div>

          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left pb-4 pr-4 min-w-[160px]">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                      Feature
                    </span>
                  </th>
                  {[
                    { name: "ChatGPT", price: "$20/mo" },
                    { name: "Grammarly", price: "$30/mo" },
                    { name: "Jasper", price: "$49/mo" },
                  ].map((col) => (
                    <th key={col.name} className="pb-4 px-2 text-center w-[16%]">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="h-[18px]" aria-hidden />
                        <span className="text-sm font-semibold text-zinc-400">{col.name}</span>
                        <span className="text-xs text-zinc-600">{col.price}</span>
                      </div>
                    </th>
                  ))}
                  <th className="pb-4 px-2 text-center w-[16%]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] bg-violet-600 text-white font-bold px-2 py-0.5 rounded-full leading-[18px]">
                        Best Value
                      </span>
                      <span className="text-sm font-bold text-violet-400">RefinedHawk</span>
                      <span className="text-xs text-violet-500/70">$14/mo</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {[
                  "Remembers your writing voice",
                  "Analyzes client psychology",
                  "Scores jobs before you apply",
                  "Learns from your wins over time",
                  "Predicts client fear with confidence %",
                  "Built specifically for Upwork",
                  "Price per month",
                ].map((feature, i) => {
                  const isPrice = feature === "Price per month";
                  return (
                    <motion.tr
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="group hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3.5 pr-4 text-sm text-zinc-300 font-medium">
                        {feature}
                      </td>
                      {[{ price: "$20/mo" }, { price: "$30/mo" }, { price: "$49/mo" }].map((comp, j) => (
                        <td key={j} className="py-3.5 px-2 text-center">
                          {isPrice ? (
                            <span className="text-sm text-zinc-500 font-medium">{comp.price}</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10">
                              <X className="w-3 h-3 text-red-400" />
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="py-3.5 px-2 text-center relative">
                        <div className="absolute inset-y-0 inset-x-0 border-x border-violet-500/20 bg-violet-500/[0.03] pointer-events-none" />
                        {isPrice ? (
                          <span className="relative text-sm font-bold text-violet-400">$14/mo</span>
                        ) : (
                          <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/15">
                            <Check className="w-3 h-3 text-violet-400" />
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-zinc-600 mt-2 md:hidden">← scroll to compare →</p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <p className="text-zinc-400 text-sm font-medium">
              Stop paying more for less. Start winning today.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn("google")}
              disabled={status === "loading"}
              className="group inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 disabled:opacity-60"
            >
              Start for Free
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </motion.div>
        </section>

        {/* -- Before / After --------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-10 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 mb-12"
          >
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-5"
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-400">Generic Proposal</span>
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
                <p>Please check my profile for my portfolio. I am available to start immediately.</p>
                <p>Best regards</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-red-500/10">
                {["No research", "Generic opener", "No social proof", "Gets ignored"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span className="text-sm font-semibold text-violet-400">RefinedHawk Proposal</span>
                </div>
                <span className="text-xs bg-violet-600 text-white font-bold px-2.5 py-0.5 rounded-full">
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
                  Your project needs a Shopify integration with custom inventory
                  sync. I built this exact system for a fashion retailer last
                  quarter — here&apos;s what week one looks like if we work together...
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-violet-500/15">
                {["Addresses fear", "Specific research", "Social proof", "Gets hired"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-violet-500/15 border border-violet-500/25 text-violet-400 px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* -- Bottom CTA ------------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-10 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-zinc-800 bg-[#111111] p-12 sm:p-16 text-center space-y-7 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent pointer-events-none" />
            <div
              aria-hidden
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)" }}
            />

            <div className="relative space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5" />
                Free to start
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Start Writing Winning Proposals Today
              </h2>
              <p className="text-zinc-400 max-w-sm mx-auto text-sm">
                Join 500+ freelancers who stopped losing to weaker candidates.
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn("google")}
                disabled={status === "loading"}
                className="group inline-flex items-center gap-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 disabled:opacity-60"
              >
                <GoogleIcon />
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              <p className="text-xs text-zinc-600">No credit card required</p>
            </div>
          </motion.div>
        </section>

        {/* -- Footer ----------------------------------------- */}
        <footer className="border-t border-zinc-800/60 py-8 px-4 sm:px-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" width={20} height={20} alt="RefinedHawk logo" className="opacity-60" />
              <span className="text-sm font-medium text-zinc-500">RefinedHawk</span>
            </div>
            <p className="text-xs text-zinc-600">© 2026 RefinedHawk. Built for freelancers.</p>
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
