import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    await prisma.waitlist.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[waitlist] error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
