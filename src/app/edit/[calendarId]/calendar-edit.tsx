"use client";

import { useState } from "react";
import { CalendarContent } from "../../components/calendar-content";
import { Calendar } from "../../entities";
import DeleteCalendar from "./delete";
import { SettingsButton } from "./settings";
import { ShareButton } from "./share";

export default function CalendarEdit({ calendar }: { calendar: Calendar }) {
  const [localCalendar, setLocalCalendar] = useState(calendar);
  return (
    <>
      <h1 className="flex flex-wrap justify-between">
        <div className="text-3xl">{localCalendar.name}</div>
        <div className="flex">
          <ShareButton calendar={localCalendar} />
          <SettingsButton
            calendar={localCalendar}
            setLocalCalendar={setLocalCalendar}
          />
        </div>
      </h1>
      <CalendarContent calendar={localCalendar} editing />
      <DeleteCalendar calendar={localCalendar} />
    </>
  );
}
