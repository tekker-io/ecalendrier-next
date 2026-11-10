"use client";

import { sendEvent } from "@/lib/firebaseClient";
import { useConsent } from "@/lib/meta/consent";
import { purchaseEventId } from "@/lib/meta/events";
import { trackMetaEvent } from "@/lib/meta/pixel";
import type { PaidPurchase } from "@/lib/stripe";
import { useEffect } from "react";

/**
 * Sends a GA4 `purchase` event and a Meta `Purchase` event when Stripe
 * redirects the user back here after a successful payment
 * (`/premium?session_id={CHECKOUT_SESSION_ID}`). The purchase has already
 * been verified with Stripe on the server.
 *
 * Premium itself is granted by the Stripe webhook; these events are only used
 * for analytics and ads conversion tracking.
 */
export function PurchaseTracker({ purchase }: { purchase: PaidPurchase }) {
  const { transactionId, value, currency } = purchase;
  const consent = useConsent();

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

  useEffect(() => {
    // Waits for consent: also fires if it is given on this page
    if (consent !== "granted") return;
    const storageKey = `meta-purchase-tracked-${transactionId}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // storage unavailable: Meta dedupes on the deterministic event id and
      // the server only sends it once
    }

    // Value and currency sent to the Conversions API are recomputed by the
    // server from Stripe
    trackMetaEvent(
      "Purchase",
      purchaseEventId(transactionId),
      { value, currency },
      { sessionId: transactionId }
    );
  }, [consent, transactionId, value, currency]);

  return null;
}
