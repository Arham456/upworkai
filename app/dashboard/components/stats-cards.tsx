"use client";

import { motion, type Variants } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Zap,
  Search,
} from "lucide-react";

const stats = [
  {
    label: "Total Proposals Written",
    value: "0",
    icon: FileText,
    description: "Proposals sent to clients",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    label: "Win Rate",
    value: "0%",
    icon: TrendingUp,
    description: "Proposals that converted",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    label: "Connects Saved",
    value: "0",
    icon: Zap,
    description: "Connects not wasted on bad fits",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    label: "Jobs Analyzed",
    value: "0",
    icon: Search,
    description: "Jobs scored by AI",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function StatsCards() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={item}
            className={`rounded-xl border ${stat.border} bg-zinc-900 p-5 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{stat.label}</span>
              <span className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
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
