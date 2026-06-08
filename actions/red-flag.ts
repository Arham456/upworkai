"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { analyzeRedFlags, type RedFlagResult } from "@/lib/red-flag-analyzer";

export type RedFlagActionResult =
  | (RedFlagResult & { input_length: number })
  | { error: string };

export async function analyzeJobRedFlags(
  jobText: string,
): Promise<RedFlagActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "unauthorized" };

  const trimmed = jobText.trim();

  if (trimmed.length < 100) return { error: "text_too_short" };
  if (trimmed.length > 10_000) return { error: "text_too_long" };

  try {
    const result = await analyzeRedFlags(trimmed);
    return { ...result, input_length: trimmed.length };
  } catch {
    return { error: "analysis_failed" };
  }
}
