import admin from "@/lib/firebaseAdmin";
import Link from "@mui/material/Link";
import Image from "next/image";
import { Button } from "../components/button";
import { CalendarContent } from "../components/calendar-content";
import { Calendar } from "../entities";

export default async function CalendarPage({
  params,
}: {
  params: { calendarId: string };
}) {
  const { calendarId } = await params;
  const db = admin.firestore();
  const doc = await db.collection("calendars").doc(calendarId).get();
  const calendar: Calendar | undefined = !doc.exists
    ? undefined
    : {
        id: doc.id,
        name: doc.get("name"),
        displayLogo: doc.get("displayLogo") ?? true,
        displayCta: doc.get("displayCta") ?? true,
        demo: doc.get("demo") || false,
        startDate: doc.get("startDate"),
        endDate: doc.get("endDate"),
        author: doc.get("author"),
      };

  console.log(calendar);

  return (
    <>
      {(!calendar || calendar.displayLogo || calendar.displayCta) && (
        <div className="mb-14 flex justify-between items-center flex-col md:flex-row">
          <Link href="/">
            {(!calendar || calendar.displayLogo) && (
              <Image src="/logo.svg" alt="logo" width="212" height="59" />
            )}
          </Link>

          {(!calendar || calendar.displayCta) && (
            <div className="flex items-center text-white mt-4 d:mt-0 text-center">
              <Link href="/">
                <Button theme="dark">Créer mon propre calendrier</Button>
              </Link>
            </div>
          )}
        </div>
      )}
      {!calendar ? (
        <p>Ce lien est invalide</p>
      ) : (
        <>
          <h1 className="text-3xl text-center">{calendar.name}</h1>
          {calendar.demo && (
            <p className="mt-2">
              <i>
                La démo montre l&apos;état d&apos;un calendrier qui commencerait
                10 jours dans le passé et terminerait 15 jours après.
              </i>
            </p>
          )}
          <CalendarContent calendar={calendar} />
        </>
      )}
    </>
  );
}
