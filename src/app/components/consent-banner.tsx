"use client";

import {
  onOpenConsentBanner,
  openConsentBanner,
  useConsent,
  writeConsent,
} from "@/lib/meta/consent";
import { isPixelConfigured } from "@/lib/meta/pixel";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ConsentBanner() {
  const consent = useConsent();
  const [forcedOpen, setForcedOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    return onOpenConsentBanner(() => setForcedOpen(true));
  }, []);

  if (!hydrated || !isPixelConfigured()) return null;
  if (consent !== null && !forcedOpen) return null;

  function choose(value: "granted" | "denied") {
    writeConsent(value);
    setForcedOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 inset-x-0 z-50 p-4"
    >
      <div className="max-w-3xl m-auto bg-black/90 text-white rounded-lg p-4 shadow-lg flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm flex-1">
          Avec votre accord, nous utilisons le pixel Meta (Facebook) pour
          mesurer l&apos;efficacité de nos publicités. Vous pouvez changer
          d&apos;avis à tout moment via le lien « Gérer les cookies » en bas
          de page.{" "}
          <Link href="/privacy" className="!underline">
            En savoir plus
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="h-10 px-4 rounded bg-white text-black font-bold text-sm cursor-pointer"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="h-10 px-4 rounded bg-white text-black font-bold text-sm cursor-pointer"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

export function ManageCookiesLink() {
  if (!isPixelConfigured()) return null;
  return (
    <button
      type="button"
      onClick={openConsentBanner}
      className="cursor-pointer"
    >
      Gérer les cookies
    </button>
  );
}
