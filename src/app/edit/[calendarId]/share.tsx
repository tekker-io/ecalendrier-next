"use client";

import { Button } from "@/app/components/button";
import { Calendar } from "@/app/entities";
import LinkIcon from "@mui/icons-material/Link";
import ShareIcon from "@mui/icons-material/Share";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Portal from "@mui/material/Portal";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";

export function ShareButton({ calendar }: { calendar: Calendar }) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = origin + "/" + calendar.id;
  const iframe =
    '<iframe width="900" height="1200" src="' + url + '"></iframe>';

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setSnackBarOpen(true);
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
      >
        <DialogContent className="p-10">
          <h2 className="text-3xl font-bold">Partager le calendrier</h2>
          <div className="mb-6 italic">
            Les jours du calendriers seront cachés et se débloqueront
            automatiquement avec le temps.
          </div>
          <h3 className="text-lg pb-3 font-bold">
            Lien partageable du calendrier
          </h3>
          <div className="flex gap-2">
            <input
              disabled
              className="rounded bg-none border-solid border-gray-400 border px-4 py-2 outline-none w-full"
              value={url}
            />
            <Tooltip title="Copier" className="ml-2">
              <div>
                <Button
                  theme="success"
                  onClick={() => {
                    copyToClipboard(url);
                  }}
                >
                  <LinkIcon />
                </Button>
              </div>
            </Tooltip>
          </div>
          <h3 className="mt-4 text-lg pb-3 font-bold">Intégrer dans un site</h3>
          <div className="flex gap-2">
            <input
              disabled
              className="rounded bg-none border-solid border-gray-400 border px-4 py-2 outline-none w-full"
              value={iframe}
            />
            <Tooltip title="Copier" className="ml-2">
              <div>
                <Button
                  theme="success"
                  onClick={() => {
                    copyToClipboard(iframe);
                  }}
                >
                  <LinkIcon />
                </Button>
              </div>
            </Tooltip>
          </div>
        </DialogContent>
      </Dialog>
      <Portal container={document.body}>
        <Snackbar
          open={snackBarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackBarOpen(false)}
          message="Le lien a été copié dans le presse-papier !"
        />
      </Portal>
      <Tooltip title="Partager">
        <div>
          <Button theme="success" onClick={() => setDialogOpen(true)}>
            Partager
            <ShareIcon className="ml-1" />
          </Button>
        </div>
      </Tooltip>
    </>
  );
}
