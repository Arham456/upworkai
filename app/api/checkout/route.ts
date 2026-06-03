import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = process.env.POLAR_ACCESS_TOKEN;
    const productId = process.env.POLAR_PRODUCT_ID;
    const polarServer = process.env.POLAR_SERVER ?? "sandbox";

    console.log("[checkout] token present:", !!token);
    console.log("[checkout] productId:", productId);
    console.log("[checkout] server:", polarServer);

    if (!token || !productId) {
      return NextResponse.json(
        { error: "Polar is not configured (missing POLAR_ACCESS_TOKEN or POLAR_PRODUCT_ID)" },
        { status: 500 },
      );
    }

    const baseUrl =
      polarServer === "production"
        ? "https://api.polar.sh"
        : "https://sandbox-api.polar.sh";

    const body = {
      products: [productId],
      external_customer_id: session.user.id,
      customer_email: session.user.email ?? undefined,
      customer_name: session.user.name ?? undefined,
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
    };

    console.log("[checkout] POST", `${baseUrl}/v1/checkouts/`, JSON.stringify(body));

    const res = await fetch(`${baseUrl}/v1/checkouts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      // Disable Next.js fetch caching for this request
      cache: "no-store",
    });

    const data = await res.json() as Record<string, unknown>;

    console.log("[checkout] Polar response status:", res.status);
    console.log("[checkout] Polar response body:", JSON.stringify(data));

    if (!res.ok) {
      const detail = (data.detail as string) ?? (data.error as string) ?? JSON.stringify(data);
      return NextResponse.json(
        { error: `Polar API error (${res.status}): ${detail}` },
        { status: 500 },
      );
    }

    const checkoutUrl = data.url as string;
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    const cause = err instanceof Error ? (err as NodeJS.ErrnoException).cause : undefined;
    console.error("[checkout] Unhandled error:", err);
    console.error("[checkout] Error cause:", cause);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
