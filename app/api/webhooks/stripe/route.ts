import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

/**
 * Fulfill cosmetic unlocks server-side when Stripe sends checkout.session.completed.
 * Idempotent: marks PendingCheckout fulfilled.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whSecret) {
    return NextResponse.json({ received: true, skipped: true });
  }

  const raw = await request.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id && session.payment_status === "paid") {
      await prisma.pendingCheckout.updateMany({
        where: { sessionId: session.id },
        data: { fulfilledAt: new Date() },
      });
    }
  }

  return NextResponse.json({ received: true });
}
