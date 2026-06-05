import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    console.log("[waitlist] received email:", email);

    if (!email || !email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    await prisma.waitlist.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    console.log("[waitlist] upserted:", email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[waitlist] error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
