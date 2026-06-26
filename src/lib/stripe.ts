import Stripe from "stripe";

let _stripe: Stripe | undefined;

// Throws on first use if the env var is missing rather than at startup.
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  }
  return _stripe;
}

export function getStripePriceMonthly(): string {
  const price = process.env.STRIPE_PRICE_ID_MONTHLY;
  if (!price) throw new Error("STRIPE_PRICE_ID_MONTHLY is not set");
  return price;
}

export function getStripePriceYearly(): string {
  const price = process.env.STRIPE_PRICE_ID_YEARLY;
  if (!price) throw new Error("STRIPE_PRICE_ID_YEARLY is not set");
  return price;
}
