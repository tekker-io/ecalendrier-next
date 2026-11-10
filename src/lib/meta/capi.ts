import { createHash } from "node:crypto";
import type { MetaEventName } from "./events";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";

export type CapiUserData = {
  email?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type CapiEvent = {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  user: CapiUserData;
  customData?: { value: number; currency: string };
};

export function isCapiConfigured() {
  return Boolean(PIXEL_ID && process.env.META_CAPI_TOKEN);
}

export function hashEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Sends one event to the Meta Conversions API.
 * Never logs the token nor personal data, only the event name/id and Meta's
 * error message.
 */
export async function sendCapiEvent(event: CapiEvent): Promise<boolean> {
  const token = process.env.META_CAPI_TOKEN;
  if (!PIXEL_ID || !token) return false;

  const { user } = event;
  const userData: Record<string, unknown> = {};
  if (user.email) userData.em = [hashEmail(user.email)];
  // IP, user agent, fbp and fbc must NOT be hashed
  if (user.clientIp) userData.client_ip_address = user.clientIp;
  if (user.userAgent) userData.client_user_agent = user.userAgent;
  if (user.fbp) userData.fbp = user.fbp;
  if (user.fbc) userData.fbc = user.fbc;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: event.eventSourceUrl,
        user_data: userData,
        ...(event.customData ? { custom_data: event.customData } : {}),
      },
    ],
  };
  // Only set while validating in Meta's "Test events" tool
  const testCode = process.env.META_TEST_EVENT_CODE;
  if (testCode) payload.test_event_code = testCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: { message?: string; code?: number; error_subcode?: number };
      } | null;
      console.error(
        `Meta CAPI ${event.eventName} (${event.eventId}) failed: ${res.status}`,
        body?.error?.code,
        body?.error?.error_subcode,
        body?.error?.message
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `Meta CAPI ${event.eventName} (${event.eventId}) failed:`,
      err instanceof Error ? err.message : "unknown error"
    );
    return false;
  }
}
