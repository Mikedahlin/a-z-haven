import Stripe from "stripe";

let serverStripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!serverStripe) {
    serverStripe = new Stripe(key);
  }
  return serverStripe;
}
