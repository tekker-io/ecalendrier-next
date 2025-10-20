"use client";

import { sendEvent } from "@/lib/firebaseClient";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// This uses the previous name from angular for consistency with Firebase Analytics
export function ScreenTracker() {
  const pathname = usePathname();

  function sendScreenView(screenName: string) {
    sendEvent("screen_view", {
      firebase_screen: screenName,
      firebase_screen_class: screenName,
    });
  }

  useEffect(() => {
    if (pathname == "/") {
      sendScreenView("app-home");
    } else if (pathname.startsWith("/edit/")) {
      sendScreenView("app-edit-calendar");
    } else if (pathname.startsWith("/calendars/")) {
      sendScreenView("app-calendars");
    } else if (pathname.startsWith("/premium/")) {
      sendScreenView("app-premium");
    } else if (pathname.startsWith("/privacy/")) {
      sendScreenView("app-privacy");
    } else {
      sendScreenView("app-calendar");
    }

    console.log("Screen view:", pathname);
    // Here you can integrate with your analytics service
    // e.g., analytics.trackScreenView(pathname);
  }, [pathname]);

  console.log("pathname:", pathname);

  return null;
}
