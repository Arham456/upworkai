import { prisma } from "@/lib/prisma";

type RejectionWebhookBody = {
  user_id?: string;
  company_name?: string;
  role_title?: string;
  raw_feedback?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RejectionWebhookBody;

    const userId = body.user_id?.trim();
    const companyName = body.company_name?.trim();
    const roleTitle = body.role_title?.trim();
    const rawFeedback = body.raw_feedback?.trim();

    if (!userId || !companyName || !roleTitle || !rawFeedback) {
      return Response.json(
        { error: "user_id, company_name, role_title, and raw_feedback are required" },
        { status: 400 },
      );
    }

    await prisma.rejection.create({
      data: {
        userId,
        companyName,
        roleTitle,
        stage: "rejected",
        rawFeedback,
      },
    });

    return Response.json({ status: "success" });
  } catch (err) {
    console.error("[webhook/rejection] error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
