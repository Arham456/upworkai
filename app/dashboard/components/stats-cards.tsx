"use client";

import { motion, type Variants } from "framer-motion";
import { FileText, TrendingUp, Zap, Search } from "lucide-react";

interface Props {
  totalProposals: number;
  winRate: number;
  jobsAnalyzed: number;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function StatsCards({ totalProposals, winRate, jobsAnalyzed }: Props) {
  const stats = [
    {
      label: "Total Proposals Written",
      value: String(totalProposals),
      icon: FileText,
      description: "Proposals sent to clients",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: TrendingUp,
      description: "Proposals that converted",
    },
    {
      label: "Connects Saved",
      value: String(jobsAnalyzed),
      icon: Zap,
      description: "Connects not wasted on bad fits",
    },
    {
      label: "Jobs Analyzed",
      value: String(jobsAnalyzed),
      icon: Search,
      description: "Jobs scored by AI",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={item}
            className="rounded-xl border border-zinc-800 bg-[#111111] p-5 flex flex-col gap-3 hover:border-violet-500/30 transition-colors duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{stat.label}</span>
              <span className="p-2 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/15 transition-colors">
                <Icon className="w-4 h-4 text-violet-400" />
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.description}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
