import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile ?? null);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    skills?: string[];
    niche?: string;
    experience?: string;
    upworkUrl?: string;
    sampleProposals?: string[];
  };

  const data = {
    skills: body.skills ?? [],
    niche: body.niche || null,
    experience: body.experience || null,
    upworkUrl: body.upworkUrl || null,
    sampleProposals: body.sampleProposals ?? [],
  };

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json(profile);
}
