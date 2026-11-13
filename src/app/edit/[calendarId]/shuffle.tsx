"use client";

import { Button } from "@/app/components/button";
import { PremiumDialog } from "@/app/components/premium-dialog";
import { Calendar } from "@/app/entities";
import { getFirebaseFirestore, sendEvent } from "@/lib/firebaseClient";
import CasinoIcon from "@mui/icons-material/Casino";
import Tooltip from "@mui/material/Tooltip";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import toast from "react-hot-toast";

export function ShuffleButton({
  calendar,
  setLocalCalendar,
  premium,
}: {
  calendar: Calendar;
  setLocalCalendar: (value: Calendar) => void;
  premium: boolean;
}) {
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [rolling, setRolling] = useState(false);

  async function shuffle() {
    sendEvent("Click shuffle", { premium: premium ? 1 : 0 });
    if (!premium) {
      setUpsellOpen(true);
      return;
    }
    if (rolling) return;
    setRolling(true);

    // New seed, different from the current one so the order always changes
    let randomized = calendar.randomized;
    while (randomized === calendar.randomized) {
      randomized = Math.ceil(Math.random() * 100);
    }
    try {
      const calendarRef = doc(getFirebaseFirestore(), "calendars/" + calendar.id);
      await Promise.all([
        updateDoc(calendarRef, { randomized }),
        // Lets the dice spin a bit even when the update is instant
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
      setLocalCalendar({ ...calendar, randomized });
      toast.success(
        "Les jours ont été mélangés ! Vous pouvez remettre l'ordre normal dans les options."
      );
    } catch (err) {
      console.error(err);
      toast.error("Le mélange a échoué, veuillez réessayer.");
    } finally {
      setRolling(false);
    }
  }

  return (
    <>
      {upsellOpen && (
        <PremiumDialog feature="shuffle" onClose={() => setUpsellOpen(false)} />
      )}
      <Tooltip title="Mélanger les jours" className="ml-2">
        <div>
          <Button theme="dark" onClick={shuffle}>
            <CasinoIcon className={rolling ? "animate-spin" : ""} />
          </Button>
        </div>
      </Tooltip>
    </>
  );
}
