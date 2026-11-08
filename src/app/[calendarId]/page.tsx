import admin from "@/lib/firebaseAdmin";
import Link from "@mui/material/Link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Button } from "../components/button";
import { CalendarContent } from "../components/calendar-content";
import { Calendar } from "../entities";

const getCalendar = cache(
  async (calendarId: string): Promise<Calendar | null> => {
    let doc;
    try {
      doc = await admin.firestore().collection("calendars").doc(calendarId).get();
    } catch (err) {
      // Firestore rejects some ids (e.g. "__foo__"): treat them as not found
      console.warn(`Invalid calendar id "${calendarId}"`, err);
      return null;
    }
    if (!doc.exists) return null;
    return {
      id: doc.id,
      name: doc.get("name"),
      displayLogo: doc.get("displayLogo") ?? true,
      displayCta: doc.get("displayCta") ?? true,
      randomized: doc.get("randomized") ?? 0,
      demo: doc.get("demo") || false,
      startDate: doc.get("startDate"),
      endDate: doc.get("endDate"),
      author: doc.get("author"),
      dayImage: doc.get("dayImage") || null,
    };
  }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ calendarId: string }>;
}): Promise<Metadata> {
  const { calendarId } = await params;
  const calendar = await getCalendar(calendarId);
  if (!calendar) {
    // Responds with a real 404 instead of an empty page
    notFound();
  }

  const title = calendar.name
    ? `${calendar.name} - Calendrier de l'avent`
    : "Calendrier de l'avent";
  return {
    title,
    openGraph: {
      title,
      images: "/bg.webp",
    },
    description: calendar.name
      ? `Calendrier de l'avent en ligne - ${calendar.name}`
      : "Calendrier de l'avent en ligne",
  };
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ calendarId: string }>;
}) {
  const { calendarId } = await params;
  const calendar = await getCalendar(calendarId);
  if (!calendar) {
    notFound();
  }

  return (
    <>
      {(calendar.displayLogo || calendar.displayCta) && (
        <div className="mb-10 sm:mb-14 flex justify-between items-center flex-col md:flex-row">
          <Link href="/">
            {calendar.displayLogo && (
              <Image src="/logo.svg" alt="logo" width="212" height="59" />
            )}
          </Link>

          {calendar.displayCta && (
            <div className="flex items-center text-white mt-4 d:mt-0 text-center">
              <Link href="/">
                <Button theme="dark">Créer mon propre calendrier</Button>
              </Link>
            </div>
          )}
        </div>
      )}
      <h1 className="text-3xl text-center">{calendar.name}</h1>
      {calendar.demo && (
        <p className="mt-2">
          <i>
            La démo montre l&apos;état d&apos;un calendrier qui commencerait 10
            jours dans le passé et terminerait 15 jours après.
          </i>
        </p>
      )}
      <CalendarContent calendar={calendar} premium={false} />
    </>
  );
}
