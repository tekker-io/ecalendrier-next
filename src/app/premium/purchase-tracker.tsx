"use client";

import { sendEvent } from "@/lib/firebaseClient";
import type { PaidPurchase } from "@/lib/stripe";
import { useEffect } from "react";

/**
 * Sends a GA4 `purchase` event when Stripe redirects the user back here after
 * a successful payment (`/premium?session_id={CHECKOUT_SESSION_ID}`).
 *
 * Premium itself is granted by the Stripe webhook; this event is only used
 * for analytics and Google Ads conversion tracking.
 */
export function PurchaseTracker({ purchase }: { purchase: PaidPurchase }) {
  const { transactionId, value, currency } = purchase;

  useEffect(() => {
    // Don't count the same purchase twice if the page is reloaded
    const storageKey = `purchase-tracked-${transactionId}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // storage unavailable: GA4 still dedupes on transaction_id
    }

    sendEvent("purchase", { transaction_id: transactionId, value, currency });
  }, [transactionId, value, currency]);

  return null;
}
