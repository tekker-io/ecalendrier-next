"use client";

import { sendEvent } from "@/lib/firebaseClient";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import { CalendarContent } from "../../components/calendar-content";
import { Calendar } from "../../entities";
import DeleteCalendar from "./delete";
import { SettingsButton } from "./settings";
import { ShareButton } from "./share";
import { ShuffleButton } from "./shuffle";

export default function CalendarEdit({
  calendar,
  premium,
  justCreated = false,
}: {
  calendar: Calendar;
  premium: boolean;
  /** Arrived here right after creating the calendar */
  justCreated?: boolean;
}) {
  const [localCalendar, setLocalCalendar] = useState(calendar);
  const [showWelcome, setShowWelcome] = useState(justCreated);

  useEffect(() => {
    if (!justCreated) return;
    // A reload or a shared URL won't show the welcome message again
    window.history.replaceState(null, "", window.location.pathname);
  }, [justCreated]);

  useEffect(() => {
    sendEvent("Edit calendar");
  }, []);

  return (
    <>
      <h1 className="flex flex-wrap justify-between">
        <div className="text-3xl">{localCalendar.name}</div>
        <div className="flex">
          <ShareButton calendar={localCalendar} />
          <ShuffleButton
            premium={premium}
            calendar={localCalendar}
            setLocalCalendar={setLocalCalendar}
          />
          <SettingsButton
            premium={premium}
            calendar={localCalendar}
            setLocalCalendar={setLocalCalendar}
          />
        </div>
      </h1>
      {showWelcome && (
        <div className="relative mt-4 rounded-lg bg-yellow-50 border border-yellow-300 text-black p-4 pr-10">
          <p className="font-bold text-lg">🎁 Votre calendrier est créé !</p>
          <p>
            Cliquez sur une case pour y ajouter une photo, une vidéo ou un
            message. Quand vous êtes prêt, partagez le lien avec le bouton
            « Partager ».
          </p>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setShowWelcome(false)}
            className="absolute right-2 top-2 cursor-pointer p-1"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      )}
      <CalendarContent calendar={localCalendar} premium={premium} editing />
      <DeleteCalendar calendar={localCalendar} />
    </>
  );
}
