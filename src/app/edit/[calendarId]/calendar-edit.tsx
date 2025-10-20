"use client";

import { sendEvent } from "@/lib/firebaseClient";
import { useEffect, useState } from "react";
import { CalendarContent } from "../../components/calendar-content";
import { Calendar } from "../../entities";
import DeleteCalendar from "./delete";
import { SettingsButton } from "./settings";
import { ShareButton } from "./share";

export default function CalendarEdit({
  calendar,
  premium,
}: {
  calendar: Calendar;
  premium: boolean;
}) {
  const [localCalendar, setLocalCalendar] = useState(calendar);

  useEffect(() => {
    sendEvent("Edit calendar");
  }, []);

  return (
    <>
      <h1 className="flex flex-wrap justify-between">
        <div className="text-3xl">{localCalendar.name}</div>
        <div className="flex">
          <ShareButton calendar={localCalendar} />
          <SettingsButton
            premium={premium}
            calendar={localCalendar}
            setLocalCalendar={setLocalCalendar}
          />
        </div>
      </h1>
      <CalendarContent calendar={localCalendar} premium={premium} editing />
      <DeleteCalendar calendar={localCalendar} />
    </>
  );
}
