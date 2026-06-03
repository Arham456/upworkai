import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.POLAR_ACCESS_TOKEN || !process.env.POLAR_PRODUCT_ID) {
      return NextResponse.json(
        { error: "Polar is not configured" },
        { status: 500 },
      );
    }

    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: (process.env.POLAR_SERVER as "sandbox" | "production") ?? "sandbox",
    });

    const checkout = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID],
      externalCustomerId: session.user.id,
      customerEmail: session.user.email ?? undefined,
      customerName: session.user.name ?? undefined,
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (err) {
    console.error("[checkout] Error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
