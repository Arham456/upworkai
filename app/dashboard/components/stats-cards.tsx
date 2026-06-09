"use client";

import { motion, type Variants } from "framer-motion";
import { FileText, Target, Zap, Search } from "lucide-react";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

interface Props {
  totalProposals: number;
  winRate: number;
  jobsAnalyzed: number;
  connectsSaved?: number;
}

export function StatsCards({ totalProposals, winRate, jobsAnalyzed, connectsSaved = 0 }: Props) {
  const cards = [
    {
      label: "Proposals Written",
      value: String(totalProposals),
      icon: FileText,
      iconClass: "text-violet-400",
      iconBg: "bg-violet-500/10",
      cardGradient: "bg-gradient-to-br from-violet-950/30 to-[#111111]",
      cardBorder: "border-violet-500/20 hover:border-violet-500/30",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Target,
      iconClass: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      cardGradient: "bg-gradient-to-br from-green-950/40 to-[#111111]",
      cardBorder: "border-green-900/50 hover:border-green-700/40",
    },
    {
      label: "Connects Saved",
      value: String(connectsSaved),
      icon: Zap,
      iconClass: "text-amber-400",
      iconBg: "bg-amber-500/10",
      cardGradient: "bg-gradient-to-br from-amber-950/30 to-[#111111]",
      cardBorder: "border-amber-900/50 hover:border-amber-700/40",
    },
    {
      label: "Jobs Analyzed",
      value: String(jobsAnalyzed),
      icon: Search,
      iconClass: "text-blue-400",
      iconBg: "bg-blue-500/10",
      cardGradient: "bg-gradient-to-br from-blue-950/30 to-[#111111]",
      cardBorder: "border-blue-900/50 hover:border-blue-700/40",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {cards.map(({ label, value, icon: Icon, iconClass, iconBg, cardGradient, cardBorder }) => (
        <motion.div
          key={label}
          variants={item}
          className={`rounded-2xl border p-6 flex flex-col gap-4 transition-all ${cardGradient} ${cardBorder}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">{label}</span>
            <span className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon className={`w-5 h-5 ${iconClass}`} />
            </span>
          </div>
          <p className="text-4xl font-black text-white tabular-nums tracking-tight">{value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
