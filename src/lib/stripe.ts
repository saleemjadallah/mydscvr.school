import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Get Stripe instance. Returns null if STRIPE_SECRET_KEY is not configured.
 * All Stripe operations should check for null before proceeding.
 */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

/**
 * Verify Stripe webhook signature.
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event | null {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return null;

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook verification failed:", err);
    return null;
  }
}
