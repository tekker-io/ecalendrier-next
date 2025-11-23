"use client";

import { Button } from "@/app/components/button";
import { Spinner } from "@/app/components/spinner";
import { Calendar } from "@/app/entities";
import { getFirebaseFirestore, sendEvent } from "@/lib/firebaseClient";
import SettingsIcon from "@mui/icons-material/Settings";
import { Dialog, DialogContent, Switch } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useState } from "react";

function SettingsDialog({
  calendar,
  onClose,
  premium,
}: {
  calendar: Calendar;
  onClose: (newValues?: Partial<Calendar>) => void;
  premium: boolean;
}) {
  const [name, setName] = useState(calendar.name);
  const [startDate, setStartDate] = useState(calendar.startDate);
  const [endDate, setEndDate] = useState(calendar.endDate);
  const [displayLogo, setDisplayLogo] = useState(calendar.displayLogo);
  const [displayCta, setDisplayCta] = useState(calendar.displayCta);
  const [randomized, setRandomized] = useState(calendar.randomized);
  const [saving, setSaving] = useState(false);

  function save() {
    if (saving) return;
    sendEvent("Save settings");
    setSaving(true);
    const firestore = getFirebaseFirestore();
    const calendarRef = doc(firestore, "calendars/" + calendar.id);
    const newValues = {
      name,
      startDate,
      endDate,
      displayLogo: displayLogo,
      displayCta: displayCta,
      randomized: randomized,
    };
    updateDoc(calendarRef, newValues).then(() => {
      onClose(newValues);
    });
  }

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
        {premium && (
          <div>
            <label className="flex justify-between items-center">
              <div className="pb-3 pt-3">
                <h3 className="text-lg font-bold">Mélanger les jours</h3>
                <i>
                  L&apos;ordre ne change que quand vous activez l&apos;option.
                </i>
              </div>
              <Switch
                checked={randomized > 0}
                onChange={(e) =>
                  setRandomized(
                    e.target.checked ? Math.ceil(Math.random() * 100) : 0
                  )
                }
              />
            </label>
          </div>
        )}
        {!premium && (
          <div className="pt-4">
            <i>
              En activant le{" "}
              <Link href="/premium" target="_blank" className="!underline">
                mode premium
              </Link>
              , vous pouvez aussi :
              <ul className="list-disc list-inside">
                <li>Mélanger les jours (nouveau !)</li>
                <li>Cacher le logo du site</li>
                <li>
                  Cacher le bouton &quot;Créer mon propre calendrier&quot;
                </li>
              </ul>
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
  premium,
}: {
  calendar: Calendar;
  setLocalCalendar: (value: Calendar) => void;
  premium: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      {dialogOpen && (
        <SettingsDialog
          premium={premium}
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
          <Button
            theme="dark"
            onClick={() => {
              sendEvent("Open settings");
              setDialogOpen(true);
            }}
          >
            <SettingsIcon />
          </Button>
        </div>
      </Tooltip>
    </>
  );
}
