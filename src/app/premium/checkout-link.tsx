"use client";

import { sendEvent } from "@/lib/firebaseClient";
import { PREMIUM_PRICE } from "@/lib/premium";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";

/** Link to the Stripe payment page, tracked as a GA4 begin_checkout */
export function CheckoutLink({
  href,
  location,
}: {
  href: string;
  location: string;
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        sendEvent("begin_checkout", {
          value: 7,
          currency: "EUR",
          location,
        })
      }
      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-lg py-4 px-8 shadow-lg"
    >
      <StarIcon />
      Activer le premium – {PREMIUM_PRICE}
    </Link>
  );
}
