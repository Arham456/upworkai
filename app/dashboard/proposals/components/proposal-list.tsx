"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Trophy,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  CalendarDays,
} from "lucide-react";

interface Proposal {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  jobId: string | null;
  job: {
    jobSummary: string | null;
    description: string;
  } | null;
}

interface Props {
  initialProposals: Proposal[];
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  won: {
    label: "Won",
    icon: Trophy,
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  lost: {
    label: "Lost",
    icon: XCircle,
    classes: "bg-red-500/15 text-red-400 border-red-500/20",
  },
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProposalList({ initialProposals }: Props) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const res = await fetch("/api/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) return;
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (proposals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Proposals</h1>
          <p className="text-zinc-500 mt-1 text-sm">Track and manage your saved proposals.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#111111] py-20 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 mb-4">
            <FolderOpen className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-300">No proposals yet</p>
          <p className="text-xs text-zinc-500 mt-1 mb-5">
            Generate and save your first proposal to track it here.
          </p>
          <Link
            href="/dashboard/personalize"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Personalize a Proposal
          </Link>
        </div>
      </div>
    );
  }

  const wonCount = proposals.filter((p) => p.status === "won").length;
  const pendingCount = proposals.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Proposals</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {proposals.length} total · {wonCount} won · {pendingCount} pending
          </p>
        </div>
        <Link
          href="/dashboard/personalize"
          className="flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          New Proposal
        </Link>
      </div>

      <div className="space-y-3">
        {proposals.map((proposal) => {
          const isExpanded = expandedId === proposal.id;
          const isUpdating = updatingId === proposal.id;
          const jobTitle =
            proposal.job?.jobSummary?.slice(0, 80) ??
            (proposal.job ? proposal.job.description.slice(0, 80) + "…" : null);

          return (
            <div
              key={proposal.id}
              className="rounded-xl border border-zinc-800 bg-[#111111] overflow-hidden hover:border-zinc-700 transition-colors"
            >
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {jobTitle ?? (
                        <span className="text-zinc-500 font-normal">No job linked</span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                      {proposal.content.slice(0, 100)}
                      {proposal.content.length > 100 && "…"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={proposal.status} />
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                      className="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-600">
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(proposal.createdAt)}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="expanded"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 border-t border-zinc-800 pt-4">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
                        Proposal
                      </p>
                      <div className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed bg-[#0a0a0a]/50 rounded-lg p-4 border border-zinc-800">
                        {proposal.content}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-5 pb-5">
                      {proposal.status !== "won" && (
                        <button
                          onClick={() => updateStatus(proposal.id, "won")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trophy className="w-3 h-3" />
                          )}
                          Mark as Won
                        </button>
                      )}

                      {proposal.status !== "lost" && (
                        <button
                          onClick={() => updateStatus(proposal.id, "lost")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          Mark as Lost
                        </button>
                      )}

                      {proposal.status !== "pending" && (
                        <button
                          onClick={() => updateStatus(proposal.id, "pending")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
