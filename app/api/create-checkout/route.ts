/**
 * One-time Stripe Checkout Session (redirect). For **Embedded Checkout** (2025–2026),
 * create an embedded session on the server and mount with `@stripe/react-stripe-js`
 * — this route can be refactored to return `client_secret` instead of `url`.
 */
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getShopItem } from "@/lib/content/shop";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe-server";
import { getClientIp, resolveStripeRedirectOrigin } from "@/lib/api-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`checkout:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured (set STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const itemId = String((body as { itemId?: string }).itemId ?? "");
  const item = getShopItem(itemId);
  if (!item) {
    return NextResponse.json({ error: "Unknown item" }, { status: 400 });
  }

  const origin = resolveStripeRedirectOrigin(request);
  if (!origin) {
    return NextResponse.json(
      {
        error:
          "App URL not configured (set NEXT_PUBLIC_APP_URL for production).",
      },
      { status: 503 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: item.usdCents,
            product_data: {
              name: item.name,
              description: `${item.description} (cosmetic only — A–Z Haven)`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/shop?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?canceled=1`,
      metadata: {
        itemId: item.id,
        kind: "cosmetic",
      },
    });

    if (session.id) {
      try {
        await prisma.pendingCheckout.create({
          data: {
            sessionId: session.id,
            itemId: item.id,
          },
        });
      } catch (e) {
        const code = (e as { code?: string })?.code;
        if (code !== "P2002") throw e;
      }
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not start checkout." },
      { status: 500 },
    );
  }
}
