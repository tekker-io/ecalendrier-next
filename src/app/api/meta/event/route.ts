import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
import { isCapiConfigured, sendCapiEvent } from "@/lib/meta/capi";
import {
  calendarCreatedEventId,
  EVENT_ID_PATTERN,
  isMetaEventName,
  purchaseEventId,
} from "@/lib/meta/events";
import { getPaidPurchase } from "@/lib/stripe";
import { isIP } from "node:net";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Same name as CONSENT_COOKIE in src/lib/meta/consent.ts (client module)
const CONSENT_COOKIE = "cdj_consent";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const skipped = () => new NextResponse(null, { status: 204 });
const badRequest = () =>
  NextResponse.json({ error: "Invalid event" }, { status: 400 });

/** Keeps only origin + path: no query string (magic link, Stripe session…) */
function cleanUrl(raw: unknown, req: NextRequest): string | null {
  if (typeof raw !== "string") return null;
  try {
    const url = new URL(raw);
    if (url.host !== req.nextUrl.host) return null;
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

/**
 * Client IP as seen by the hosting proxy. `x-real-ip` is set by the proxy
 * itself; otherwise the first `x-forwarded-for` hop is used.
 */
function getClientIp(req: NextRequest): string | null {
  const candidates = [
    req.headers.get("x-real-ip"),
    req.headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && isIP(ip)) return ip;
  }
  return null;
}

/**
 * Records that an event was sent so that retries / reloads don't send it
 * twice. Returns false if it was already recorded.
 */
async function claimEvent(eventId: string) {
  try {
    await admin
      .firestore()
      .doc(`metaEvents/${eventId}`)
      .create({ createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return true;
  } catch (err) {
    // 6 = ALREADY_EXISTS
    if ((err as { code?: number }).code === 6) return false;
    throw err;
  }
}

async function releaseEvent(eventId: string) {
  await admin
    .firestore()
    .doc(`metaEvents/${eventId}`)
    .delete()
    .catch(() => {});
}

export async function POST(req: NextRequest) {
  // Advertising consent is checked server-side too
  if (req.cookies.get(CONSENT_COOKIE)?.value !== "granted") return skipped();
  if (!isCapiConfigured()) return skipped();

  const body = await req.json().catch(() => null);
  if (!body || !isMetaEventName(body.eventName)) return badRequest();

  const eventSourceUrl = cleanUrl(body.url, req);
  if (!eventSourceUrl) return badRequest();

  const user = {
    email: null as string | null,
    clientIp: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
    fbp: req.cookies.get("_fbp")?.value ?? null,
    fbc: req.cookies.get("_fbc")?.value ?? null,
  };

  let eventId: string = body.eventId;
  let customData: { value: number; currency: string } | undefined;
  let idempotent = false;

  switch (body.eventName) {
    case "PageView":
    case "CompleteRegistration": {
      if (typeof eventId !== "string" || !EVENT_ID_PATTERN.test(eventId)) {
        return badRequest();
      }
      if (body.eventName === "CompleteRegistration") {
        if (typeof body.email === "string" && EMAIL_PATTERN.test(body.email)) {
          user.email = body.email;
        }
      } else {
        // Page views of logged-in users can be matched with their email
        user.email = (await getUserFromCookie())?.email ?? null;
      }
      break;
    }

    case "CalendrierCree": {
      const session = await getUserFromCookie();
      const calendarId = body.calendarId;
      if (!session || typeof calendarId !== "string") return badRequest();
      if (!/^[A-Za-z0-9]{1,100}$/.test(calendarId)) return badRequest();
      const calendar = await admin
        .firestore()
        .doc(`calendars/${calendarId}`)
        .get();
      if (!calendar.exists || calendar.get("author") !== session.uid) {
        return badRequest();
      }
      eventId = calendarCreatedEventId(calendarId);
      user.email = session.email ?? null;
      idempotent = true;
      break;
    }

    case "Purchase": {
      const session = await getUserFromCookie();
      const sessionId = body.sessionId;
      if (!session || typeof sessionId !== "string") return badRequest();
      // Verified with Stripe: amount actually paid, for this user only
      const purchase = await getPaidPurchase(sessionId, session.uid);
      if (!purchase) return badRequest();
      eventId = purchaseEventId(purchase.transactionId);
      customData = { value: purchase.value, currency: purchase.currency };
      user.email = session.email ?? null;
      idempotent = true;
      break;
    }
  }

  if (idempotent && !(await claimEvent(eventId))) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const ok = await sendCapiEvent({
    eventName: body.eventName,
    eventId,
    eventSourceUrl,
    user,
    customData,
  });

  if (!ok) {
    // Allow a later retry with the same event id
    if (idempotent) await releaseEvent(eventId);
    return NextResponse.json({ error: "Meta request failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
