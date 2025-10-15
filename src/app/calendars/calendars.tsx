"use client";

import {
  getFirebaseAuth,
  getFirebaseFirestore,
  sendEvent,
} from "@/lib/firebaseClient";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../components/button";
import { Spinner } from "../components/spinner";
import { CalendarList } from "./page";

const christmasStartDate = "2025-12-01";
const christmasEndDate = "2025-12-25";

function AddCalendarDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: (data?: { id: string; name: string }) => void;
}) {
  const [dates, setDates] = useState("christmas");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(christmasStartDate);
  const [endDate, setEndDate] = useState(christmasEndDate);
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setDates("christmas");
    setStartDate(christmasStartDate);
    setEndDate(christmasEndDate);
  }

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

    const calendarCollection = collection(firestore, "/calendars");
    const data = await addDoc(calendarCollection, calendarData);
    setLoading(false);
    reset();
    onClose({ id: data.id, name: name });
  }

  return (
    <Dialog open={open} onClose={() => onClose()}>
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
              <option value="christmas">Noël 2025</option>
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

export function Calendars({ calendars }: { calendars: CalendarList }) {
  const [addCalendarOpen, setAddCalendarOpen] = useState(false);
  const [localCalendars, setLocalCalendars] = useState(calendars);

  return (
    <div className="mb-6 flex flex-wrap">
      {localCalendars.map((c) => (
        <Link
          key={c.id}
          href={`/edit/${c.id}`}
          className="rounded mr-2 mb-2 flex p-8 border-2 border-solid border-gray-100 hover:bg-gray-100 hover:text-black bg-white/30"
        >
          {c.name}
        </Link>
      ))}
      <AddCalendarDialog
        open={addCalendarOpen}
        onClose={(calendar) => {
          setAddCalendarOpen(false);
          if (calendar) {
            setLocalCalendars((prev) => [...prev, calendar]);
          }
        }}
      />
      <div
        onClick={() => setAddCalendarOpen(true)}
        className="
          rounded
          mr-2
          mb-2
          flex
          p-8
          border-2 border-dashed
          cursor-pointer
          border-gray-100
          hover:bg-gray-100 hover:text-black
          bg-white/30
        "
      >
        + Ajouter un calendrier
      </div>
    </div>
  );
}
