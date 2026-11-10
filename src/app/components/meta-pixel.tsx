"use client";

import { useConsent } from "@/lib/meta/consent";
import { newEventId, revokePixel, trackMetaEvent } from "@/lib/meta/pixel";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Module-level so that StrictMode double effects and re-renders don't send
// the same page view twice
let lastTrackedPath: string | null = null;

/**
 * Loads the Meta Pixel once advertising consent is granted and sends one
 * PageView per real page (initial load + each client-side navigation).
 */
export function MetaPixel() {
  const consent = useConsent();
  const pathname = usePathname();

  useEffect(() => {
    if (consent === "denied") {
      revokePixel();
      lastTrackedPath = null;
      return;
    }
    if (consent !== "granted" || pathname === lastTrackedPath) return;
    lastTrackedPath = pathname;
    trackMetaEvent("PageView", newEventId());
  }, [consent, pathname]);

  return null;
}
