"use client";

import { Button } from "@/app/components/button";
import { Calendar } from "@/app/entities";
import { sendEvent } from "@/lib/firebaseClient";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import IosShareIcon from "@mui/icons-material/IosShare";
import ShareIcon from "@mui/icons-material/Share";
import SmsIcon from "@mui/icons-material/Sms";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/** Copy button that shows "Copié" for a moment once the text is copied */
function CopyButton({
  text,
  label,
  event,
}: {
  text: string;
  label: string;
  event: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    sendEvent("Share", { method: event });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard can be unavailable (in-app browsers, old browsers)
      toast.error("Impossible de copier, sélectionnez le texte à la main.");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`shrink-0 flex items-center gap-1 rounded px-4 py-2 font-bold text-white cursor-pointer transition-colors ${
        copied ? "bg-emerald-600" : "bg-green hover:bg-green/90"
      }`}
    >
      {copied ? (
        <>
          <CheckIcon fontSize="small" />
          Copié !
        </>
      ) : (
        <>
          <ContentCopyIcon fontSize="small" />
          {label}
        </>
      )}
    </button>
  );
}

function ShareDialog({
  calendar,
  onClose,
}: {
  calendar: Calendar;
  onClose: () => void;
}) {
  const [canNativeShare, setCanNativeShare] = useState(false);

  const url = window.location.origin + "/" + calendar.id;
  const iframe = `<iframe width="900" height="1200" src="${url}"></iframe>`;
  const message = `Je t'ai préparé un calendrier surprise « ${calendar.name} » 🎁 Une nouvelle case se débloque chaque jour : ${url}`;

  useEffect(() => {
    // Mostly available on phones: opens the system share sheet
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  async function nativeShare() {
    sendEvent("Share", { method: "native" });
    try {
      await navigator.share({ title: calendar.name, text: message });
    } catch {
      // Cancelled by the user
    }
  }

  const quickShares = [
    {
      method: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon />,
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
      className: "bg-[#25D366] text-white",
    },
    {
      method: "sms",
      label: "SMS",
      icon: <SmsIcon />,
      // "?&" works on both iOS and Android
      href: `sms:?&body=${encodeURIComponent(message)}`,
      className: "bg-blue text-white",
    },
    {
      method: "email",
      label: "Email",
      icon: <EmailIcon />,
      href: `mailto:?subject=${encodeURIComponent(
        `Un calendrier surprise pour toi : ${calendar.name}`
      )}&body=${encodeURIComponent(message)}`,
      className: "bg-black text-white",
    },
  ];

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent className="p-6 sm:p-8 relative">
        <IconButton
          aria-label="Fermer"
          onClick={onClose}
          className="!absolute right-2 top-2"
        >
          <CloseIcon />
        </IconButton>

        <h2 className="text-2xl sm:text-3xl font-bold pr-8">
          Partager le calendrier
        </h2>
        <p className="mt-1 mb-6 text-gray-600">
          Envoyez ce lien à vos proches : pas besoin de compte, et les cases se
          débloquent automatiquement chaque jour.
        </p>

        <div className="flex items-center gap-2 rounded-lg border border-gray-300 p-1 pl-3">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            aria-label="Lien du calendrier"
            className="flex-1 min-w-0 outline-none bg-transparent text-gray-800"
          />
          <CopyButton text={url} label="Copier" event="copy link" />
        </div>

        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-red text-white font-bold py-3 cursor-pointer"
          >
            <IosShareIcon />
            Partager…
          </button>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {quickShares.map((share) => (
            <a
              key={share.method}
              href={share.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sendEvent("Share", { method: share.method })}
              className={`flex flex-col items-center gap-1 rounded-lg py-3 font-bold text-sm ${share.className}`}
            >
              {share.icon}
              {share.label}
            </a>
          ))}
        </div>

        <details className="mt-6 group">
          <summary className="cursor-pointer text-sm text-gray-600 list-none flex items-center gap-1 hover:text-gray-900">
            <CodeIcon fontSize="small" />
            <span className="underline">
              Intégrer le calendrier dans un site web
            </span>
            <ExpandMoreIcon
              fontSize="small"
              className="transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-300 p-1 pl-3">
            <input
              readOnly
              value={iframe}
              onFocus={(e) => e.target.select()}
              aria-label="Code d'intégration"
              className="flex-1 min-w-0 outline-none bg-transparent text-gray-800 font-mono text-xs"
            />
            <CopyButton text={iframe} label="Copier" event="copy iframe" />
          </div>
        </details>
      </DialogContent>
    </Dialog>
  );
}

export function ShareButton({ calendar }: { calendar: Calendar }) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      {dialogOpen && (
        <ShareDialog calendar={calendar} onClose={() => setDialogOpen(false)} />
      )}

      <Tooltip title="Partager">
        <div>
          <Button
            theme="success"
            onClick={() => {
              sendEvent("Open share");
              setDialogOpen(true);
            }}
          >
            Partager
            <ShareIcon className="ml-1" />
          </Button>
        </div>
      </Tooltip>
    </>
  );
}
