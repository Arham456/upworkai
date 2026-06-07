"use server";

import { getServerSession } from "next-auth/next";
import { auditJobApplication } from "@/lib/audit";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type RunAuditResult = {
  id: string;
  hireability_score: number;
  audit_feedback: string;
};

export async function runJobAudit(
  user_id: string,
  job_url: string,
): Promise<RunAuditResult> {
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;

  if (!sessionUserId || sessionUserId !== user_id) {
    throw new Error("Unauthorized");
  }

  const result = await auditJobApplication(user_id, job_url);

  const audit = await prisma.audit.create({
    data: {
      userId: user_id,
      jobUrl: job_url.trim(),
      hireabilityScore: result.hireability_score,
      auditFeedback: result.audit_feedback,
    },
  });

  return {
    id: audit.id,
    hireability_score: result.hireability_score,
    audit_feedback: result.audit_feedback,
  };
}
