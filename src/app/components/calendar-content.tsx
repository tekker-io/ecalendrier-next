"use client";

import { useAuth } from "@/context/AuthProvider";
import { getFile, sendEvent, writeFile } from "@/lib/firebaseClient";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "../entities";
import { Button } from "./button";
import { Spinner } from "./spinner";

const Editor = dynamic(() => import("./editor"), { ssr: false });

interface Day {
  date: number;
  available: boolean;
  index: number;
}

function DayDialog({
  onClose,
  fileName,
  editing,
}: {
  onClose: () => void;
  fileName: string;
  editing: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");
  const quillRef = useRef<HTMLDivElement>(null);
  const { premium } = useAuth();

  useEffect(() => {
    setLoading(true);
    getFile(fileName)
      .then((fileContent) => {
        setFileContent(fileContent);
      })
      .catch(() => {
        setFileContent("");
      })
      .finally(() => setLoading(false));
  }, [fileName]);

  function save() {
    if (!premium && fileContent.length > 2000000) return;
    setSaving(true);
    sendEvent("Save day");
    writeFile(fileName, fileContent).then(() => {
      setSaving(false);
      onClose();
    });
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="lg">
      <DialogContent>
        {loading ? (
          <Spinner color="black" />
        ) : (
          <>
            {editing && (
              <div className="mb-3 text-right">
                Prévisualiser:{" "}
                <Switch value={preview} onChange={() => setPreview(!preview)} />
              </div>
            )}
            {editing && !preview && (
              <Editor
                ref={quillRef}
                defaultValue={fileContent}
                onTextChange={(text) => {
                  setFileContent(text);
                }}
              />
            )}
            {(!editing || preview) && (
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{
                  __html:
                    fileContent ||
                    "<i>Le père noël n'est pas encore passé par là...</i>",
                }}
              />
            )}
            {editing && (
              <div className="mt-4">
                <Button onClick={() => save()} theme="success">
                  {saving ? <Spinner /> : "OK"}
                </Button>
              </div>
            )}
            {editing && !premium && fileContent.length > 2000000 && (
              <p className="text-red mt-4">
                Chaque jour est limité à 2Mo de données, essayez de réduire la
                taille de vos images ou{" "}
                <Link href="/premium" target="_blank" className="!underline">
                  activez le mode premium
                </Link>
                .
              </p>
            )}
          </>
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
          editing={editing}
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
            {editing && (
              <span className="absolute text-white flex rounded-full bg-green -top-5 -right-5 w-10 h-10 justify-center items-center">
                <EditIcon />
              </span>
            )}
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
