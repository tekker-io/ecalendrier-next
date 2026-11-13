"use client";

import { Spinner } from "@/app/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REFRESH_INTERVAL = 4000;
const MAX_ATTEMPTS = 30; // 2 minutes

/**
 * Shown after a payment while the Stripe webhook hasn't granted premium yet:
 * refreshes the page until it has.
 */
export function PremiumActivation() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const givenUp = attempts >= MAX_ATTEMPTS;

  useEffect(() => {
    if (givenUp) return;
    const timeout = setTimeout(() => {
      router.refresh();
      setAttempts((a) => a + 1);
    }, REFRESH_INTERVAL);
    return () => clearTimeout(timeout);
  }, [attempts, givenUp, router]);

  return (
    <div className="bg-black/30 rounded-lg p-6 flex flex-col items-center gap-3 text-center">
      <p className="text-2xl font-bold">Paiement reçu, merci ! 🎉</p>
      {givenUp ? (
        <p>
          L&apos;activation prend plus de temps que prévu. Rechargez la page
          dans quelques minutes, ou contactez-nous si le problème persiste.
        </p>
      ) : (
        <p className="flex items-center gap-2">
          <Spinner />
          Activation de votre mode premium…
        </p>
      )}
    </div>
  );
}
