export type PaidPurchase = {
  transactionId: string;
  /** Amount actually paid, in currency units (e.g. 4.9), discounts included */
  value: number;
  /** ISO 4217 code, upper case (e.g. "EUR") */
  currency: string;
};

// Fallback used when STRIPE_READ_KEY is not configured
const DEFAULT_PURCHASE = { value: 7, currency: "EUR" };

/**
 * Fetches a Stripe Checkout session and returns what was actually paid, or
 * null if the session isn't paid or doesn't belong to this user.
 *
 * Uses a restricted key with read access to Checkout Sessions only
 * (STRIPE_READ_KEY). Premium itself is still granted by the Stripe webhook.
 */
export async function getPaidPurchase(
  sessionId: string,
  userId: string
): Promise<PaidPurchase | null> {
  // Stripe Checkout session ids always start with "cs_"
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;

  const key = process.env.STRIPE_READ_KEY;
  if (!key) {
    console.warn("STRIPE_READ_KEY is not configured, using default price");
    return { transactionId: sessionId, ...DEFAULT_PURCHASE };
  }

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error(
        `Stripe session ${sessionId} lookup failed: ${res.status}`,
        await res.text()
      );
      return null;
    }

    const session = (await res.json()) as {
      payment_status: string;
      client_reference_id: string | null;
      amount_total: number | null;
      currency: string | null;
    };

    if (
      session.payment_status !== "paid" ||
      session.client_reference_id !== userId ||
      session.amount_total === null ||
      !session.currency
    ) {
      return null;
    }

    return {
      transactionId: sessionId,
      // amount_total is in cents and already includes promo codes
      value: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
    };
  } catch (err) {
    console.error(`Stripe session ${sessionId} lookup failed`, err);
    return null;
  }
}
