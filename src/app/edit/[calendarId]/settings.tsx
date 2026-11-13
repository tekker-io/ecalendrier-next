"use client";

import { Button } from "@/app/components/button";
import { PremiumDialog } from "@/app/components/premium-dialog";
import { Spinner } from "@/app/components/spinner";
import { Calendar } from "@/app/entities";
import {
  deleteFile,
  getFirebaseFirestore,
  getMediaURL,
  sendEvent,
  writeFileBytes,
} from "@/lib/firebaseClient";
import { PremiumFeature } from "@/lib/premium";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import StarIcon from "@mui/icons-material/Star";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Switch,
  useMediaQuery,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { doc, updateDoc } from "firebase/firestore";
import NextImage from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const inputClassName =
  "rounded border border-gray-400 px-3 py-2 outline-none w-full";

/**
 * One premium option. For free users the control is replaced by a lock and
 * the whole row opens the premium dialog.
 */
function OptionRow({
  title,
  description,
  locked,
  onLockedClick,
  children,
}: {
  title: string;
  description?: string;
  locked: boolean;
  onLockedClick: () => void;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <div className="flex-1">
        <h4 className="font-bold">{title}</h4>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {locked ? (
          <span className="flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1">
            <LockIcon fontSize="inherit" />
            Premium
          </span>
        ) : (
          children
        )}
      </div>
    </>
  );

  const className = "flex items-center gap-4 py-3";
  if (locked) {
    return (
      <button
        type="button"
        onClick={onLockedClick}
        className={`${className} w-full text-left cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2`}
      >
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}

function SettingsDialog({
  calendar,
  onClose,
  onUpdate,
  premium,
}: {
  calendar: Calendar;
  onClose: () => void;
  onUpdate: (newValues: Partial<Calendar>) => void;
  premium: boolean;
}) {
  const [name, setName] = useState(calendar.name);
  const [startDate, setStartDate] = useState(calendar.startDate);
  const [endDate, setEndDate] = useState(calendar.endDate);
  const [displayLogo, setDisplayLogo] = useState(calendar.displayLogo);
  const [displayCta, setDisplayCta] = useState(calendar.displayCta);
  const [randomized, setRandomized] = useState(calendar.randomized);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [upsellFeature, setUpsellFeature] = useState<PremiumFeature | null>(
    null
  );
  const isMobile = useMediaQuery("(max-width:639px)");

  const dayImageFileName =
    calendar.author + "/calendars/" + calendar.id + "/dayImage";

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
    updateDoc(calendarRef, newValues)
      .then(() => {
        onUpdate(newValues);
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast.error("L'enregistrement a échoué, veuillez réessayer.");
        setSaving(false);
      });
  }

  async function uploadDayImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    sendEvent("Upload day image");
    setUploadingImage(true);
    try {
      await writeFileBytes(dayImageFileName, file);
      const url = await getMediaURL(dayImageFileName);
      const newValues = { dayImage: url + "v=" + Date.now() };
      const firestore = getFirebaseFirestore();
      await updateDoc(doc(firestore, "calendars/" + calendar.id), newValues);
      onUpdate(newValues);
    } catch (err) {
      console.error(err);
      toast.error("L'envoi de l'image a échoué, veuillez réessayer.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function deleteImage() {
    sendEvent("Delete day image");
    const firestore = getFirebaseFirestore();
    const newValues = { dayImage: null };
    try {
      await deleteFile(dayImageFileName);
      await updateDoc(doc(firestore, "calendars/" + calendar.id), newValues);
      onUpdate(newValues);
    } catch (err) {
      console.error(err);
      toast.error("La suppression de l'image a échoué, veuillez réessayer.");
    }
  }

  const locked = !premium;
  const openUpsell = (feature: PremiumFeature) => () =>
    setUpsellFeature(feature);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      {upsellFeature && (
        <PremiumDialog
          feature={upsellFeature}
          onClose={() => setUpsellFeature(null)}
        />
      )}
      <DialogContent className="p-6 sm:p-8">
        <h2 className="text-3xl pb-6 font-bold">Options du calendrier</h2>

        <section className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <h3 className="font-bold">Nom du calendrier</h3>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              name="name"
              className={inputClassName}
              placeholder="Nom"
            />
          </label>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Dates du calendrier</h3>
            <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_1fr] items-center gap-2">
              <label htmlFor="startDate">Du</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className={inputClassName}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label htmlFor="endDate">au</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className={inputClassName}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <StarIcon className="text-yellow-500" />
            Personnalisation
          </h3>

          {locked && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-300 p-4 mb-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="flex-1 text-sm">
                Ces options sont réservées au <strong>mode premium</strong> :
                7 € une seule fois, pour tous vos calendriers.
              </p>
              <Link
                href="/premium"
                onClick={() => sendEvent("Click premium from settings")}
                className="shrink-0 flex items-center justify-center gap-1 rounded bg-yellow-400 text-black font-bold py-2 px-4"
              >
                <StarIcon fontSize="small" />
                Découvrir
              </Link>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            <OptionRow
              title="Mélanger les jours"
              description="Les cases apparaissent dans le désordre. L'ordre change à chaque activation."
              locked={locked}
              onLockedClick={openUpsell("shuffle")}
            >
              <Switch
                checked={randomized > 0}
                onChange={(e) =>
                  setRandomized(
                    e.target.checked ? Math.ceil(Math.random() * 100) : 0
                  )
                }
              />
            </OptionRow>

            <OptionRow
              title="Image des cadeaux"
              description="Remplacez les paquets cadeaux par l'image de votre choix."
              locked={locked}
              onLockedClick={openUpsell("dayImage")}
            >
              <NextImage
                src={calendar.dayImage || "/gift.svg"}
                alt="Image des cases"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
              <div className="flex flex-col items-start text-sm">
                <label className="underline cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={uploadDayImage}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? <Spinner color="black" /> : "Changer"}
                </label>
                {calendar.dayImage && !uploadingImage && (
                  <button
                    type="button"
                    onClick={deleteImage}
                    className="underline cursor-pointer"
                  >
                    Retirer
                  </button>
                )}
              </div>
            </OptionRow>

            <OptionRow
              title="Afficher le logo Case du jour"
              locked={locked}
              onLockedClick={openUpsell("logo")}
            >
              <Switch
                checked={displayLogo}
                onChange={(e) => setDisplayLogo(e.target.checked)}
              />
            </OptionRow>

            <OptionRow
              title="Afficher le bouton « Créer mon propre calendrier »"
              locked={locked}
              onLockedClick={openUpsell("cta")}
            >
              <Switch
                checked={displayCta}
                onChange={(e) => setDisplayCta(e.target.checked)}
              />
            </OptionRow>
          </div>
        </section>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose}>
          <span className="text-black">Annuler</span>
        </Button>
        <Button theme="success" onClick={save}>
          {saving ? <Spinner /> : "Enregistrer"}
        </Button>
      </DialogActions>
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
          onClose={() => {
            setDialogOpen(false);
          }}
          onUpdate={(newValues) => {
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
