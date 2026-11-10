"use client";

import { useSyncExternalStore } from "react";

/**
 * Advertising consent (Meta Pixel + Conversions API).
 *
 * Stored in a first-party cookie so the server can also check it before
 * sending Conversions API events. The cookie name is shared with
 * `src/app/api/meta/event/route.ts`.
 */
export const CONSENT_COOKIE = "cdj_consent";
const CONSENT_CHANGE_EVENT = "cdj-consent-change";
const OPEN_BANNER_EVENT = "cdj-consent-open";
// CNIL recommends asking again after ~6 months
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182;

export type Consent = "granted" | "denied" | null;

export function readConsent(): Consent {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE}=(granted|denied)(?:;|$)`)
  );
  return (match?.[1] as Consent) ?? null;
}

export function writeConsent(value: "granted" | "denied") {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
}

/** Current consent; `null` while unknown (server render or no choice yet). */
export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, readConsent, () => null);
}

/** Re-opens the consent banner (e.g. from the footer link). */
export function openConsentBanner() {
  window.dispatchEvent(new Event(OPEN_BANNER_EVENT));
}

export function onOpenConsentBanner(callback: () => void) {
  window.addEventListener(OPEN_BANNER_EVENT, callback);
  return () => window.removeEventListener(OPEN_BANNER_EVENT, callback);
}
