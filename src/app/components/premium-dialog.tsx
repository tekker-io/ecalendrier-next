"use client";

import { sendEvent } from "@/lib/firebaseClient";
import {
  PREMIUM_FEATURES,
  PREMIUM_PRICE,
  PremiumFeature,
} from "@/lib/premium";
import CheckIcon from "@mui/icons-material/Check";
import StarIcon from "@mui/icons-material/Star";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Link from "next/link";
import { useEffect } from "react";

export function PremiumDialog({
  feature,
  onClose,
}: {
  feature: PremiumFeature;
  onClose: () => void;
}) {
  const highlighted = PREMIUM_FEATURES.find((f) => f.id === feature)!;
  const others = PREMIUM_FEATURES.filter((f) => f.id !== feature);

  useEffect(() => {
    sendEvent("Open premium upsell", { feature });
  }, [feature]);

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center gap-2 mb-5">
          <span className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center">
            <StarIcon fontSize="large" />
          </span>
          <h2 className="text-2xl font-bold">{highlighted.title}</h2>
          <p className="text-gray-700">{highlighted.description}</p>
          <p className="text-sm font-bold text-yellow-700 uppercase tracking-wide">
            Option premium
          </p>
        </div>

        <p className="font-bold mb-2">Le mode premium débloque aussi :</p>
        <ul className="flex flex-col gap-1 mb-6">
          {others.map((f) => (
            <li key={f.id} className="flex items-start gap-2">
              <CheckIcon className="text-green shrink-0" fontSize="small" />
              {f.title}
            </li>
          ))}
        </ul>

        <Link
          href="/premium"
          onClick={() => sendEvent("Click premium from upsell", { feature })}
          className="flex items-center justify-center gap-2 rounded bg-yellow-400 text-black font-bold py-3 px-4 w-full"
        >
          <StarIcon />
          Activer le premium – {PREMIUM_PRICE} à vie
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-center underline cursor-pointer text-sm text-gray-600"
        >
          Plus tard
        </button>
      </DialogContent>
    </Dialog>
  );
}
