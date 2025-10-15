"use client";

import Tooltip from "@mui/material/Tooltip";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Calendar } from "../entities";

export function CalendarContent({
  editing = false,
  calendar,
}: {
  editing?: boolean;
  calendar: Calendar;
}) {
  const [localCalendar] = useState(calendar);

  const startDate = useMemo(() => {
    if (localCalendar.demo && !editing) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 9);
      startDate.setHours(0, 0, 0, 0);
      return startDate;
    } else {
      return new Date(
        localCalendar.startDate
          ? localCalendar.startDate + "T00:00:00"
          : "2020-12-01T00:00:00"
      );
    }
  }, [editing, localCalendar.demo, localCalendar.startDate]);

  const endDate = useMemo(() => {
    if (localCalendar.demo && !editing) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 24);
      return endDate;
    } else {
      return new Date(
        localCalendar.endDate
          ? localCalendar.endDate + "T00:00:00"
          : "2020-12-25T00:00:00"
      );
    }
  }, [editing, localCalendar.demo, localCalendar.endDate, startDate]);

  const days = useMemo(() => {
    const days = [];
    const currentDate = new Date(startDate);
    const now = new Date();
    let index = 0;
    while (currentDate <= endDate) {
      days.push({
        date: currentDate.getDate(),
        available: now > currentDate,
        index: index,
      });
      index++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [endDate, startDate]);
  return (
    <div className="flex flex-wrap justify-center mt-8">
      {days.map((day) => (
        <Tooltip
          placement="top"
          title={
            !editing && !day.available
              ? "Ce jour n'est pas encore visible !"
              : ""
          }
          key={day.index}
        >
          <div
            className={`${day.available && "bg-white/30"} ${
              (day.available || editing) &&
              "hover:bg-gray-100 hover:text-black cursor-pointer"
            } rounded mb-6 mx-3 flex p-6 relative border border-white/30`}
          >
            <span className="absolute text-lg">{day.date}</span>
            <Image
              alt="Cadeau"
              className="mt-4"
              src={day.available ? "/gift.svg" : "/gift-disabled.svg"}
              width="130"
              height={day.available ? 111 : 115}
            />
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
