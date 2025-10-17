"use client";

import { Button } from "@/app/components/button";
import { Spinner } from "@/app/components/spinner";
import { Calendar } from "@/app/entities";
import { useAuth } from "@/context/AuthProvider";
import { getFirebaseFirestore } from "@/lib/firebaseClient";
import SettingsIcon from "@mui/icons-material/Settings";
import { Dialog, DialogContent, Switch } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useState } from "react";

function SettingsDialog({
  calendar,
  onClose,
}: {
  calendar: Calendar;
  onClose: (newValues?: Partial<Calendar>) => void;
}) {
  const { premium } = useAuth();
  const [name, setName] = useState(calendar.name);
  const [startDate, setStartDate] = useState(calendar.startDate);
  const [endDate, setEndDate] = useState(calendar.endDate);
  const [displayLogo, setDisplayLogo] = useState(calendar.displayLogo);
  const [displayCta, setDisplayCta] = useState(calendar.displayCta);
  const [saving, setSaving] = useState(false);

  function save() {
    if (saving) return;
    setSaving(true);
    const firestore = getFirebaseFirestore();
    const calendarRef = doc(firestore, "calendars/" + calendar.id);
    const newValues = {
      name,
      startDate,
      endDate,
      displayLogo: displayLogo,
      displayCta: displayCta,
    };
    updateDoc(calendarRef, newValues).then(() => {
      onClose(newValues);
    });
  }
  // 1 save
  // 2 send to onCLose
  // 3 update "calendar-content" with new values
  // 4 test premium

  return (
    <Dialog open onClose={onClose}>
      <DialogContent className="pt-10 px-10">
        <h2 className="text-3xl pb-8 font-bold">Paramètres du calendrier</h2>
        <label htmlFor="name">
          <h3 className="text-lg pb-3 font-bold">Nom du calendrier</h3>
          <input
            required
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
            className="rounded bg-none border-solid border-gray-400 border px-4 py-2 outline-none w-full"
            placeholder="Nom"
          />
        </label>
        <label htmlFor="dates">
          <h3 className="text-lg pb-3 pt-3 font-bold">Dates du calendrier</h3>
          <div className="gap-1 flex items-center md:flex-row flex-col">
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
          </div>
        </label>
        {premium && (
          <label className="flex justify-between items-center">
            <h3 className="text-lg pb-3 pt-3 font-bold">
              Afficher le logo du site
            </h3>
            <Switch
              checked={displayLogo}
              onChange={(e) => setDisplayLogo(e.target.checked)}
            />
          </label>
        )}
        {premium && (
          <label className="flex justify-between items-center">
            <h3 className="text-lg pb-3 pt-3 font-bold">
              Bouton &quot;Créer mon propre calendrier&quot;
            </h3>
            <Switch
              checked={displayCta}
              onChange={(e) => setDisplayCta(e.target.checked)}
            />
          </label>
        )}
        {!premium && (
          <div className="pt-4">
            <i>
              En activant le{" "}
              <Link href="/premium" target="_blank" className="!underline">
                mode premium
              </Link>
              , vous pouvez aussi cacher le logo du site et le bouton
              &quot;Créer mon propre calendrier&quot;
            </i>
          </div>
        )}
        <div className="pt-4">
          <Button theme="success" onClick={save}>
            {saving ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsButton({
  calendar,
  setLocalCalendar,
}: {
  calendar: Calendar;
  setLocalCalendar: (value: Calendar) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      {dialogOpen && (
        <SettingsDialog
          calendar={calendar}
          onClose={(newValues) => {
            setDialogOpen(false);
            if (newValues) {
              setLocalCalendar({ ...calendar, ...newValues } as Calendar);
            }
          }}
        />
      )}

      <Tooltip title="Options" className="ml-2">
        <div>
          <Button theme="dark" onClick={() => setDialogOpen(true)}>
            <SettingsIcon />
          </Button>
        </div>
      </Tooltip>
    </>
  );
}
