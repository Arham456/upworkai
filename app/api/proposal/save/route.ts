import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { content: string; jobId?: string };
    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: "Proposal content is required" },
        { status: 400 },
      );
    }

    if (body.jobId) {
      const job = await prisma.job.findFirst({
        where: { id: body.jobId, userId: session.user.id },
        select: { id: true },
      });
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
    }

    const proposal = await prisma.proposal.create({
      data: {
        userId: session.user.id,
        jobId: body.jobId ?? null,
        content: body.content.trim(),
        status: "pending",
      },
    });

    return NextResponse.json({ proposalId: proposal.id });
  } catch (err) {
    console.error("[proposal/save] Error:", err);
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
