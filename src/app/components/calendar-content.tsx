"use client";

import { sendEvent } from "@/lib/firebaseClient";
import { shuffle } from "@/lib/random";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Calendar } from "../entities";
import { Button } from "./button";
import { DayDialog } from "./day-dialog";

interface Day {
  date: number;
  available: boolean;
  index: number;
}

export function CalendarContent({
  editing = false,
  calendar,
  premium,
  admin = false,
}: {
  editing?: boolean;
  calendar: Calendar;
  premium: boolean;
  admin?: boolean;
}) {
  const [openFileName, setOpenFileName] = useState<string | null>(null);
  const [unlockAll, setUnlockAll] = useState(false);

  const [startDate, endDate] = useMemo(() => {
    if (calendar.demo && !editing) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 9);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 24);
      return [startDate, endDate];
    } else {
      return [
        new Date(
          calendar.startDate
            ? calendar.startDate + "T00:00:00"
            : "2020-12-01T00:00:00",
        ),
        new Date(
          calendar.endDate
            ? calendar.endDate + "T00:00:00"
            : "2020-12-25T00:00:00",
        ),
      ];
    }
  }, [editing, calendar.demo, calendar.endDate, calendar.startDate]);

  const days = useMemo(() => {
    const days: Day[] = [];
    const currentDate = new Date(startDate);
    const now = new Date();
    let index = 0;
    while (currentDate <= endDate) {
      days.push({
        date: currentDate.getDate(),
        available: unlockAll || now > currentDate,
        index: index,
      });
      index++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [endDate, startDate, unlockAll]);

  const randomizedDays = useMemo(() => {
    if (calendar.randomized > 0) {
      // Use calendar ID as seed for consistent shuffling
      const seed = calendar.randomized;
      // Create a copy of days to avoid mutating the original array
      return shuffle([...days], seed);
    } else {
      return days;
    }
  }, [days, calendar.randomized]);

  function openDay(day: Day) {
    if (editing) {
      sendEvent("Open day");
    }
    if (editing || day.available) {
      setOpenFileName(
        calendar.author +
          "/calendars/" +
          calendar.id +
          "/" +
          day.index +
          ".html",
      );
    }
  }

  return (
    <>
      {admin && !editing && (
        <div className="flex justify-center mt-4">
          <Button theme="dark" onClick={() => setUnlockAll(!unlockAll)}>
            {unlockAll
              ? "Admin : reverrouiller les jours"
              : "Admin : débloquer tous les jours"}
          </Button>
        </div>
      )}
      <div className="flex flex-wrap justify-center mt-8 gap-x-2 sm:gap-x-6 gap-y-2 sm:gap-y-6 pb-4 sm:pb-6">
        {openFileName && (
          <DayDialog
            onClose={() => setOpenFileName(null)}
            fileName={openFileName}
            editing={editing}
            premium={premium}
          />
        )}
        {randomizedDays.map((day) => (
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
              onClick={() => openDay(day)}
              className={`${day.available && "bg-white/30"} ${
                (day.available || editing) &&
                "hover:bg-gray-100 hover:text-black cursor-pointer"
              } rounded flex p-2 sm:p-6 relative border border-white/30`}
            >
              {editing && (
                <span className="absolute text-white flex rounded-full bg-green -top-3 sm:-top-5 -right-3 sm:-right-5 w-6 sm:w-10 h-6 sm:h-10 justify-center items-center">
                  <EditIcon className="text-xs sm:text-2xl" />
                </span>
              )}
              <div className="absolute w-full h-full top-0 left-0 p-2 pb-0 sm:p-6 flex justify-center sm:justify-start items-end sm:items-start">
                <span className="text-md sm:text-lg font-normal sm:font-normal">
                  {day.date}
                </span>
              </div>
              {calendar.dayImage ? (
                <Image
                  src={calendar.dayImage}
                  alt="Image du jour"
                  width={100}
                  height={100}
                  className={`mb-4 mt-0 sm:mb-0 sm:mt-6 w-[50px] md:w-[130px] ${
                    !day.available && "grayscale"
                  }`}
                />
              ) : (
                <Image
                  alt="Cadeau"
                  className="mb-4 mt-0 sm:mb-0 sm:mt-4 w-[50px] md:w-[130px]"
                  src={day.available ? "/gift.svg" : "/gift-disabled.svg"}
                  width="130"
                  height={day.available ? 111 : 115}
                />
              )}
            </div>
          </Tooltip>
        ))}
      </div>
    </>
  );
}
