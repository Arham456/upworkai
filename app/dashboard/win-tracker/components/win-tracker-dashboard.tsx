"use client";

import { useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  FileText,
  Sparkles,
} from "lucide-react";

interface Proposal {
  id: string;
  status: string;
  createdAt: string;
  content: string;
}

interface Stats {
  totalProposals: number;
  wonProposals: number;
  lostProposals: number;
  pendingProposals: number;
  winRate: number;
}

interface Props {
  proposals: Proposal[];
  stats: Stats;
}

const STATUS_BADGE: Record<string, string> = {
  won: "bg-green-500/10 text-green-400 border border-green-500/30",
  lost: "bg-red-500/10 text-red-400 border border-red-500/30",
  pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
};

function getLast6Months(): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    result.push({ key, label });
  }
  return result;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  iconBg,
  highlight,
}: {
  label: string;
  value: string;
  icon: ElementType;
  iconClass: string;
  iconBg: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border bg-[#111111] p-5 flex flex-col gap-3 transition-colors ${
        highlight
          ? "border-violet-500/25 hover:border-violet-500/40"
          : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">{label}</span>
        <span className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconClass}`} />
        </span>
      </div>
      <p className={`text-3xl font-bold ${highlight ? "text-violet-300" : "text-white"}`}>
        {value}
      </p>
    </motion.div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}

function ActionButton({
  label,
  active,
  disabled,
  activeClass,
  inactiveClass,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  activeClass: string;
  inactiveClass: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={active || disabled}
      className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
        active ? activeClass : inactiveClass
      }`}
    >
      {label}
    </button>
  );
}

const CHART_HEIGHT = 140;
const GRID_LINES = 4;

export function WinTrackerDashboard({ proposals: initialProposals }: Props) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const wonCount = proposals.filter((p) => p.status === "won").length;
  const lostCount = proposals.filter((p) => p.status === "lost").length;
  const pendingCount = proposals.filter((p) => p.status === "pending").length;
  const totalCount = proposals.length;
  const winRate =
    wonCount + lostCount > 0
      ? Math.round((wonCount / (wonCount + lostCount)) * 100)
      : 0;

  async function updateStatus(id: string, status: string) {
    if (updatingId === id) return;
    const previous = proposals.find((p) => p.id === id)?.status;
    setUpdatingId(id);
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
    try {
      const res = await fetch("/api/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok && previous !== undefined) {
        setProposals((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: previous } : p)),
        );
      }
    } catch {
      if (previous !== undefined) {
        setProposals((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: previous } : p)),
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const months = getLast6Months();
  const monthData = months.map(({ key, label }) => {
    const mp = proposals.filter((p) => p.createdAt.startsWith(key));
    return {
      label,
      won: mp.filter((p) => p.status === "won").length,
      lost: mp.filter((p) => p.status === "lost").length,
      pending: mp.filter((p) => p.status === "pending").length,
      total: mp.length,
    };
  });
  const maxTotal = Math.max(...monthData.map((m) => m.total), 1);
  const hasChartData = monthData.some((m) => m.total > 0);

  if (totalCount === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Win Tracker</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Track your proposal outcomes and win rate.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#111111] py-24 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-5">
            <Trophy className="w-6 h-6 text-violet-400" />
          </div>
          <p className="text-base font-semibold text-zinc-200">No proposals yet</p>
          <p className="text-sm text-zinc-500 mt-2 mb-6 max-w-xs leading-relaxed">
            Start by personalizing a proposal for a job you want — then track if you won it here.
          </p>
          <Link
            href="/dashboard/personalize"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Personalize a Proposal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Win Tracker</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Track your proposal outcomes and win rate.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Proposals"
          value={String(totalCount)}
          icon={FileText}
          iconClass="text-zinc-400"
          iconBg="bg-zinc-800/60"
        />
        <StatCard
          label="Won"
          value={String(wonCount)}
          icon={TrendingUp}
          iconClass="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          label="Lost"
          value={String(lostCount)}
          icon={TrendingDown}
          iconClass="text-red-400"
          iconBg="bg-red-500/10"
        />
        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
          icon={Trophy}
          iconClass="text-violet-400"
          iconBg="bg-violet-500/10"
          highlight
        />
      </div>

      {/* Monthly performance chart */}
      <div className="rounded-xl border border-zinc-800 bg-[#111111] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Monthly Performance</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Last 6 months</p>
          </div>
          <div className="flex items-center gap-4">
            <LegendDot color="bg-emerald-500/80" label="Won" />
            <LegendDot color="bg-red-500/60" label="Lost" />
            <LegendDot color="bg-zinc-600/60" label="Pending" />
          </div>
        </div>

        {!hasChartData ? (
          <p className="text-sm text-zinc-500 text-center py-10">
            No proposals yet — start applying to see your win rate here
          </p>
        ) : (
          <div className="relative">
            {/* Grid lines */}
            <div
              className="absolute inset-x-0 top-0 flex flex-col justify-between pointer-events-none"
              style={{ height: `${CHART_HEIGHT}px` }}
            >
              {Array.from({ length: GRID_LINES + 1 }).map((_, i) => (
                <div key={i} className="w-full border-t border-zinc-800/60" />
              ))}
            </div>

            {/* Y-axis labels */}
            <div
              className="absolute -left-6 top-0 flex flex-col justify-between pointer-events-none"
              style={{ height: `${CHART_HEIGHT}px` }}
            >
              {Array.from({ length: GRID_LINES + 1 })
                .map((_, i) => Math.round((maxTotal * (GRID_LINES - i)) / GRID_LINES))
                .map((val, i) => (
                  <span key={i} className="text-[9px] text-zinc-700 tabular-nums">
                    {val}
                  </span>
                ))}
            </div>

            {/* Bars */}
            <div
              className="relative flex items-end gap-2 sm:gap-3 pl-2"
              style={{ height: `${CHART_HEIGHT}px` }}
            >
              {monthData.map(({ label, won, lost, pending, total }, idx) => (
                <div
                  key={label}
                  className="flex-1 flex flex-col justify-end"
                  style={{ height: `${CHART_HEIGHT}px` }}
                >
                  {total > 0 ? (
                    <motion.div
                      className="w-full flex flex-col overflow-hidden rounded-t-md"
                      initial={{ height: 0 }}
                      animate={{ height: `${(total / maxTotal) * CHART_HEIGHT}px` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.06 }}
                    >
                      {won > 0 && (
                        <div
                          className="w-full bg-emerald-500/80 hover:bg-emerald-500/95 transition-colors"
                          style={{ flex: won }}
                        />
                      )}
                      {lost > 0 && (
                        <div
                          className="w-full bg-red-500/60 hover:bg-red-500/75 transition-colors"
                          style={{ flex: lost }}
                        />
                      )}
                      {pending > 0 && (
                        <div
                          className="w-full bg-zinc-600/60 hover:bg-zinc-600/80 transition-colors"
                          style={{ flex: pending }}
                        />
                      )}
                    </motion.div>
                  ) : (
                    <div className="w-full h-px bg-zinc-800" />
                  )}
                </div>
              ))}
            </div>

            {/* Month labels */}
            <div className="flex gap-2 sm:gap-3 mt-2 pl-2">
              {monthData.map(({ label }) => (
                <div key={label} className="flex-1 text-center">
                  <span className="text-xs text-zinc-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Proposal history table */}
      <div className="rounded-xl border border-zinc-800 bg-[#111111] overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Proposal History</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {Math.min(totalCount, 20)} of {totalCount} proposals, newest first
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 inline-block" />
              {wonCount} won
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60 inline-block" />
              {pendingCount} pending
            </span>
          </div>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {proposals.slice(0, 20).map((proposal) => {
            const isUpdating = updatingId === proposal.id;
            const badgeClass = STATUS_BADGE[proposal.status] ?? STATUS_BADGE.pending;
            const preview =
              proposal.content.slice(0, 80) +
              (proposal.content.length > 80 ? "…" : "");

            return (
              <div
                key={proposal.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white/[0.015] transition-colors"
              >
                {/* Date */}
                <span className="text-xs text-zinc-600 shrink-0 w-24 tabular-nums">
                  {formatDate(proposal.createdAt)}
                </span>

                {/* Preview */}
                <p className="flex-1 text-sm text-zinc-300 truncate min-w-0">
                  {preview}
                </p>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${badgeClass}`}
                >
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </span>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <ActionButton
                    label="Won"
                    active={proposal.status === "won"}
                    disabled={isUpdating}
                    activeClass="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    inactiveClass="text-zinc-500 border-zinc-700 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                    onClick={() => updateStatus(proposal.id, "won")}
                  />
                  <ActionButton
                    label="Lost"
                    active={proposal.status === "lost"}
                    disabled={isUpdating}
                    activeClass="bg-red-500/20 text-red-400 border-red-500/30"
                    inactiveClass="text-zinc-500 border-zinc-700 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5"
                    onClick={() => updateStatus(proposal.id, "lost")}
                  />
                  <ActionButton
                    label="Reset"
                    active={proposal.status === "pending"}
                    disabled={isUpdating}
                    activeClass="bg-zinc-700/60 text-zinc-300 border-zinc-600"
                    inactiveClass="text-zinc-600 border-zinc-800 hover:text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50"
                    onClick={() => updateStatus(proposal.id, "pending")}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
