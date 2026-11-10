"use client";

import { readConsent } from "./consent";
import { CUSTOM_META_EVENTS, type MetaEventName } from "./events";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let initialized = false;

export function isPixelConfigured() {
  return Boolean(PIXEL_ID);
}

/**
 * Loads and initializes the Pixel (Meta base code, without the automatic
 * PageView: page views are sent with an eventID by `MetaPixel`).
 * Must only be called once consent has been granted.
 */
export function ensurePixel() {
  if (!PIXEL_ID || typeof window === "undefined") return false;
  if (readConsent() !== "granted") return false;
  if (initialized) return true;

  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue.push(args);
    } as Fbq;
    window.fbq = n;
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const first = document.getElementsByTagName("script")[0];
    if (first?.parentNode) first.parentNode.insertBefore(script, first);
    else document.head.appendChild(script);
  }

  window.fbq("consent", "grant");
  window.fbq("init", PIXEL_ID);
  initialized = true;
  return true;
}

/** Stops the Pixel from sending anything and removes its cookies. */
export function revokePixel() {
  if (window.fbq) window.fbq("consent", "revoke");
  const host = window.location.hostname;
  const rootDomain = host.split(".").slice(-2).join(".");
  for (const name of ["_fbp", "_fbc"]) {
    for (const domain of ["", `; Domain=${host}`, `; Domain=.${rootDomain}`]) {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain}`;
    }
  }
}

export function newEventId() {
  return crypto.randomUUID();
}

type ServerContext = {
  /** CompleteRegistration only: the address the link was sent to */
  email?: string;
  /** CalendrierCree only */
  calendarId?: string;
  /** Purchase only: Stripe Checkout session id */
  sessionId?: string;
};

/**
 * Sends one occurrence of an event to both the browser Pixel and the
 * Conversions API, with the same eventID so Meta deduplicates them.
 * Does nothing without advertising consent.
 */
export function trackMetaEvent(
  eventName: MetaEventName,
  eventId: string,
  params: Record<string, string | number> = {},
  server: ServerContext = {}
) {
  if (!ensurePixel() || !window.fbq) return;

  const method = CUSTOM_META_EVENTS.includes(eventName)
    ? "trackCustom"
    : "track";
  window.fbq(method, eventName, params, { eventID: eventId });

  // Value / currency are never taken from the browser: the server computes
  // them from Stripe for Purchase.
  fetch("/api/meta/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId,
      url: window.location.href,
      ...server,
    }),
  }).catch(() => {
    // Network error: the browser event was still sent
  });
}
