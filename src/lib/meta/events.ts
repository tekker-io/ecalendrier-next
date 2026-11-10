/** Shared between the browser Pixel and the server Conversions API. */
export const META_EVENTS = [
  "PageView",
  "CompleteRegistration",
  "CalendrierCree",
  "Purchase",
] as const;

export type MetaEventName = (typeof META_EVENTS)[number];

export function isMetaEventName(name: unknown): name is MetaEventName {
  return META_EVENTS.includes(name as MetaEventName);
}

/** Custom events are sent with `trackCustom` instead of `track`. */
export const CUSTOM_META_EVENTS: readonly MetaEventName[] = ["CalendrierCree"];

/**
 * Deterministic event ids: the same calendar / payment always gets the same
 * id, so reloads and retries are deduplicated by Meta and by the server.
 */
export const calendarCreatedEventId = (calendarId: string) =>
  `calendar_${calendarId}`;
export const purchaseEventId = (checkoutSessionId: string) =>
  `purchase_${checkoutSessionId}`;

export const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;
