import { NextRequest, NextResponse } from "next/server";
import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (!process.env.POLAR_WEBHOOK_SECRET) {
    console.error("[polar/webhook] POLAR_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  return Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET,

    onCheckoutCreated: async (payload) => {
      console.log("[polar/webhook] checkout.created", payload.data.id);
    },

    onSubscriptionActive: async (payload) => {
      const { customer } = payload.data;
      console.log("[polar/webhook] subscription.active for customer:", customer.id);

      // externalId is set to our user ID at checkout creation time
      if (customer.externalId) {
        await prisma.user.update({
          where: { id: customer.externalId },
          data: { plan: "pro" },
        });
        return;
      }

      // Fallback: match by email
      if (customer.email) {
        await prisma.user.updateMany({
          where: { email: customer.email },
          data: { plan: "pro" },
        });
      }
    },

    onSubscriptionRevoked: async (payload) => {
      const { customer } = payload.data;
      console.log("[polar/webhook] subscription.revoked for customer:", customer.id);

      if (customer.externalId) {
        await prisma.user.update({
          where: { id: customer.externalId },
          data: { plan: "free" },
        });
        return;
      }

      if (customer.email) {
        await prisma.user.updateMany({
          where: { email: customer.email },
          data: { plan: "free" },
        });
      }
    },
  })(request);
}
