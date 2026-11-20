"use client";

import {
  getFirebaseAuth,
  getFirebaseFirestore,
  sendEvent,
} from "@/lib/firebaseClient";
import { calendarCreatedEventId } from "@/lib/meta/events";
import { trackMetaEvent } from "@/lib/meta/pixel";
import AddIcon from "@mui/icons-material/Add";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import EditIcon from "@mui/icons-material/Edit";
import EventIcon from "@mui/icons-material/Event";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../components/button";
import { Spinner } from "../components/spinner";
import { CalendarList } from "./page";

const christmasStartDate = "2026-12-01";
const christmasEndDate = "2026-12-25";

function AddCalendarDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [dates, setDates] = useState("christmas");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(christmasStartDate);
  const [endDate, setEndDate] = useState(christmasEndDate);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    const auth = getFirebaseAuth();
    const firestore = getFirebaseFirestore();
    e.preventDefault();
    if (loading || !name || !auth.currentUser) return;
    setLoading(true);
    sendEvent("Create calendar");
    const calendarData = {
      name: name,
      author: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      startDate: dates === "christmas" ? christmasStartDate : startDate,
      endDate: dates === "christmas" ? christmasEndDate : endDate,
    };

    try {
      const calendarCollection = collection(firestore, "/calendars");
      const data = await addDoc(calendarCollection, calendarData);
      trackMetaEvent(
        "CalendrierCree",
        calendarCreatedEventId(data.id),
        {},
        { calendarId: data.id }
      );
      // Straight to the new calendar so people start filling the days. The
      // dialog keeps its spinner until the edit page replaces this one.
      router.push(`/edit/${data.id}?created=1`);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de créer le calendrier, réessayez.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => !loading && onClose()}>
      <DialogContent className="p-10">
        <form onSubmit={onSubmit}>
          <h2 className="text-3xl pb-8 font-bold">
            Créer un nouveau calendrier
          </h2>
          <label htmlFor="name">
            <h3 className="text-lg pb-3 font-bold">Nom du calendrier</h3>
            <input
              required
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              name="name"
              className="rounded bg-none border-solid border-gray-400 border px-4 py-2 outline-none w-full"
              placeholder="Nom"
            />
          </label>
          <label htmlFor="dates">
            <h3 className="text-lg pb-3 pt-3 font-bold">Dates du calendrier</h3>
            <select
              className="rounded bg-none border-solid border-gray-400 border px-4 py-2 outline-none w-full text-center"
              id="dates"
              name="dates"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
            >
              <option value="christmas">Noël 2026</option>
              <option value="custom">Personnalisées</option>
            </select>
          </label>
          {dates === "custom" && (
            <label className="pb-3 pt-3 gap-1 flex items-center md:flex-row flex-col">
              Du
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="rounded bg-none border-solid border-gray-400 border px-4 py-2 outline-none w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              au
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="rounded bg-none border-solid border-gray-400 border px-4 py-2 outline-none w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          )}
          <div className="pt-5">
            <Button type="submit" theme="success">
              {loading ? <Spinner /> : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const DAY = 86_400_000;

/** "YYYY-MM-DD" as a UTC timestamp, so no timezone shifts the day */
function parseDay(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatDates(startDate: string, endDate: string) {
  const format = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return format.formatRange(parseDay(startDate), parseDay(endDate));
}

function dayCount(startDate: string, endDate: string) {
  return Math.round((parseDay(endDate) - parseDay(startDate)) / DAY) + 1;
}

/** Status relative to the visitor's today, only known in the browser */
function CalendarStatus({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const now = new Date();
    setToday(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);
  if (today === null) return null;

  const start = parseDay(startDate);
  const end = parseDay(endDate);
  let label: string;
  let className: string;
  if (today < start) {
    const days = Math.round((start - today) / DAY);
    label = days === 1 ? "Commence demain" : `Commence dans ${days} jours`;
    className = "bg-blue text-white";
  } else if (today <= end) {
    const day = Math.round((today - start) / DAY) + 1;
    label = `En cours · case ${day}/${dayCount(startDate, endDate)}`;
    className = "bg-emerald-500 text-black";
  } else {
    label = "Terminé";
    className = "bg-black/40 text-white";
  }
  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

export function Calendars({ calendars }: { calendars: CalendarList }) {
  const [addCalendarOpen, setAddCalendarOpen] = useState(false);

  function openAdd() {
    sendEvent("Open create calendar");
    setAddCalendarOpen(true);
  }

  return (
    <>
      <AddCalendarDialog
        open={addCalendarOpen}
        onClose={() => setAddCalendarOpen(false)}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Mes calendriers</h1>
        {calendars.length > 0 && (
          <Button theme="success" onClick={openAdd}>
            <AddIcon />
            Nouveau calendrier
          </Button>
        )}
      </div>

      {calendars.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-4 rounded-lg bg-black/30 py-12 px-6">
          <CardGiftcardIcon className="!text-6xl text-yellow-300" />
          <p className="text-2xl font-bold">
            Créez votre premier calendrier
          </p>
          <p className="max-w-md opacity-90">
            Choisissez un nom et des dates, puis remplissez chaque case avec
            une photo, une vidéo ou un message.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-green text-white font-bold text-lg py-3 px-6 cursor-pointer hover:bg-green/90"
          >
            <AddIcon />
            Créer un calendrier
          </button>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendars.map((c) => (
            <li key={c.id}>
              <Link
                href={`/edit/${c.id}`}
                className="h-full rounded-lg bg-black/30 hover:bg-black/40 transition-colors p-5 flex flex-col gap-3"
              >
                <span className="text-xl font-bold break-words">{c.name}</span>
                {c.startDate && c.endDate && (
                  <span className="flex items-center gap-2 opacity-90">
                    <EventIcon fontSize="small" />
                    {formatDates(c.startDate, c.endDate)} ·{" "}
                    {dayCount(c.startDate, c.endDate)} cases
                  </span>
                )}
                <span className="mt-auto flex items-center justify-between gap-2">
                  {c.startDate && c.endDate && (
                    <CalendarStatus
                      startDate={c.startDate}
                      endDate={c.endDate}
                    />
                  )}
                  <span className="ml-auto flex items-center gap-1 text-sm font-bold">
                    <EditIcon fontSize="small" />
                    Modifier
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={openAdd}
              className="w-full h-full min-h-32 rounded-lg border-2 border-dashed border-white/60 hover:bg-white/10 flex items-center justify-center gap-2 font-bold cursor-pointer"
            >
              <AddIcon />
              Nouveau calendrier
            </button>
          </li>
        </ul>
      )}
    </>
  );
}
