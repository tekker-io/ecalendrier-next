"use client";

import { Button } from "@/app/components/button";
import { Spinner } from "@/app/components/spinner";
import { Calendar } from "@/app/entities";
import { getFirebaseFirestore } from "@/lib/firebaseClient";
import DeleteIcon from "@mui/icons-material/Delete";
import { Dialog, DialogContent } from "@mui/material";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

function DeleteDialog({
  onClose,
  calendar,
}: {
  onClose: () => void;
  calendar: Calendar;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  function deleteCalendar() {
    if (deleting) return;
    setDeleting(true);
    const firestore = getFirebaseFirestore();
    deleteDoc(doc(firestore, `/calendars/${calendar.id}`)).then(() => {
      router.push("/calendars");
    });
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogContent>
        <p>
          Êtes-vous sûr de vouloir <strong>supprimer</strong> ce calendrier ?
        </p>
        <div className="flex gap-2 mt-3">
          <Button onClick={onClose}>Non, annuler</Button>
          <Button theme="danger" onClick={deleteCalendar}>
            {deleting ? <Spinner /> : "Oui, supprimer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DeleteCalendar({ calendar }: { calendar: Calendar }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <p>
      <Button theme="danger" onClick={() => setDeleting(true)}>
        <DeleteIcon /> Supprimer le calendrier
      </Button>
      {deleting && (
        <DeleteDialog onClose={() => setDeleting(false)} calendar={calendar} />
      )}
    </p>
  );
}
