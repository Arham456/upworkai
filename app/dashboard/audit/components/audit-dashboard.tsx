"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ExternalLink, Loader2 } from "lucide-react";
import { runJobAudit } from "@/actions/audit";

export type SerializedAudit = {
  id: string;
  jobUrl: string;
  hireabilityScore: number;
  auditFeedback: string;
};

function scoreBadgeStyles(score: number) {
  if (score >= 80) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (score >= 50) {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  return "bg-red-500/15 text-red-400 border-red-500/30";
}

type Props = {
  userId: string;
  initialAudits: SerializedAudit[];
};

export function AuditDashboard({ userId, initialAudits }: Props) {
  const router = useRouter();
  const [jobUrl, setJobUrl] = useState("");
  const [audits, setAudits] = useState(initialAudits);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = jobUrl.trim();
    if (!trimmedUrl || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await runJobAudit(userId, trimmedUrl);
      setAudits((prev) => [
        {
          id: result.id,
          jobUrl: trimmedUrl,
          hireabilityScore: result.hireability_score,
          auditFeedback: result.audit_feedback,
        },
        ...prev,
      ]);
      setJobUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <ClipboardCheck className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Success-Probability Auditor
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Compare your rejection history against a job before you apply.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-4"
      >
        <div>
          <label htmlFor="job-url" className="block text-sm font-medium text-zinc-300 mb-2">
            Job URL
          </label>
          <input
            id="job-url"
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://www.upwork.com/jobs/..."
            required
            disabled={loading}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 disabled:opacity-50 transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !jobUrl.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running audit…
            </>
          ) : (
            "Run Audit"
          )}
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Recent Audits</h2>

        {audits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-[#111111]/50 px-6 py-12 text-center">
            <p className="text-sm text-zinc-500">
              No audits yet. Paste a job URL above to get your hireability score.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {audits.map((audit) => (
              <li
                key={audit.id}
                className="rounded-xl border border-zinc-800 bg-[#111111] p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <a
                    href={audit.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors min-w-0"
                  >
                    <span className="truncate">{audit.jobUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${scoreBadgeStyles(audit.hireabilityScore)}`}
                  >
                    Score: {audit.hireabilityScore}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {audit.auditFeedback}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
