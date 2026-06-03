import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposals = await prisma.proposal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        jobId: true,
        job: {
          select: {
            jobSummary: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(proposals);
  } catch (err) {
    console.error("[proposals/GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { id?: string; status?: string };

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 },
      );
    }

    if (!["pending", "won", "lost"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.proposal.findFirst({
      where: { id: body.id, userId: session.user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const updated = await prisma.proposal.update({
      where: { id: body.id },
      data: { status: body.status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[proposals/PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
