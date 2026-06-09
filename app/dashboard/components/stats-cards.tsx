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
      borderHover: "hover:border-violet-500/25",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Target,
      iconClass: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/25",
    },
    {
      label: "Connects Saved",
      value: String(connectsSaved),
      icon: Zap,
      iconClass: "text-amber-400",
      iconBg: "bg-amber-500/10",
      borderHover: "hover:border-amber-500/25",
    },
    {
      label: "Jobs Analyzed",
      value: String(jobsAnalyzed),
      icon: Search,
      iconClass: "text-blue-400",
      iconBg: "bg-blue-500/10",
      borderHover: "hover:border-blue-500/25",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {cards.map(({ label, value, icon: Icon, iconClass, iconBg, borderHover }) => (
        <motion.div
          key={label}
          variants={item}
          className={`rounded-xl border border-zinc-800 bg-[#111111] p-5 flex flex-col gap-3 transition-colors ${borderHover}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">{label}</span>
            <span className={`p-2 rounded-lg ${iconBg}`}>
              <Icon className={`w-4 h-4 ${iconClass}`} />
            </span>
          </div>
          <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
