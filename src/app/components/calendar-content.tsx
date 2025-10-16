"use client";

import { getFile } from "@/lib/firebaseClient";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Tooltip from "@mui/material/Tooltip";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "../entities";
import { Spinner } from "./spinner";

interface Day {
  date: number;
  available: boolean;
  index: number;
}

function DayDialog({
  onClose,
  fileName,
  edit,
}: {
  onClose: () => void;
  fileName: string;
  edit: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    getFile(fileName).then((fileContent) => {
      console.log(fileContent);
      setFileContent(fileContent);
      setLoading(false);
    });
  }, [fileName]);

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogContent>
        {loading ? (
          <Spinner />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: fileContent }} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CalendarContent({
  editing = false,
  calendar,
}: {
  editing?: boolean;
  calendar: Calendar;
}) {
  const [localCalendar] = useState(calendar);
  const [openFileName, setOpenFileName] = useState<string | null>(null);

  const [startDate, endDate] = useMemo(() => {
    if (localCalendar.demo && !editing) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 9);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 24);
      return [startDate, endDate];
    } else {
      return [
        new Date(
          localCalendar.startDate
            ? localCalendar.startDate + "T00:00:00"
            : "2020-12-01T00:00:00"
        ),
        new Date(
          localCalendar.endDate
            ? localCalendar.endDate + "T00:00:00"
            : "2020-12-25T00:00:00"
        ),
      ];
    }
  }, [
    editing,
    localCalendar.demo,
    localCalendar.endDate,
    localCalendar.startDate,
  ]);

  const days = useMemo(() => {
    const days: Day[] = [];
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

  function openDay(day: Day) {
    if (editing || day.available) {
      setOpenFileName(
        localCalendar.author +
          "/calendars/" +
          localCalendar.id +
          "/" +
          day.index +
          ".html"
      );
    }
  }

  return (
    <div className="flex flex-wrap justify-center mt-8">
      {openFileName && (
        <DayDialog
          onClose={() => setOpenFileName(null)}
          fileName={openFileName}
          edit={editing}
        />
      )}
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
            onClick={() => openDay(day)}
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
