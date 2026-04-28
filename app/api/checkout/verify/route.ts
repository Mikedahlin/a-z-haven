import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getShopItem } from "@/lib/content/shop";
import { getStripe } from "@/lib/stripe-server";
import { getClientIp } from "@/lib/api-request";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * After Stripe redirects back with ?session_id=, the client calls this to
 * confirm payment and receive the cosmetic id to unlock locally.
 * (Webhook can mirror this for redundancy.)
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`checkout-verify:${ip}`, 30, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = String((body as { sessionId?: string }).sessionId ?? "");
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Not paid yet" }, { status: 402 });
    }

    const itemId = session.metadata?.itemId;
    if (!itemId || !getShopItem(itemId)) {
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
    }

    await prisma.pendingCheckout.updateMany({
      where: { sessionId },
      data: { fulfilledAt: new Date() },
    });

    return NextResponse.json({ ok: true, unlockedItemId: itemId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
