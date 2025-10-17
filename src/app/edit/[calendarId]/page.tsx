import { TopBar } from "@/app/components/top-bar";
import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
import { Calendar } from "../../entities";
import CalendarEdit from "./calendar-edit";

export default async function CalendarPage({
  params,
}: {
  params: { calendarId: string };
}) {
  const beforeGetUserFromCookie = Date.now();
  const user = await getUserFromCookie();
  console.log(
    `getUserFromCookie took ${Date.now() - beforeGetUserFromCookie}ms`
  );
  const beforeGetParams = Date.now();
  const { calendarId } = await params;
  console.log(`Getting params took ${Date.now() - beforeGetParams}ms`);
  const beforeDbFetch = Date.now();
  const db = admin.firestore();
  const doc = await db.collection("calendars").doc(calendarId).get();
  console.log(`DB fetch took ${Date.now() - beforeDbFetch}ms`);
  const calendar: Calendar | undefined = !doc.exists
    ? undefined
    : {
        id: doc.id,
        name: doc.get("name"),
        displayLogo: doc.get("displayLogo") || true,
        displayCta: doc.get("displayCta") || true,
        demo: doc.get("demo") || false,
        startDate: doc.get("startDate"),
        endDate: doc.get("endDate"),
        author: doc.get("author"),
      };

  return (
    <>
      <TopBar />
      {!calendar ? (
        <p>Ce lien est invalide</p>
      ) : calendar.author !== user.uid ? (
        <p>Vous n&apos;avez pas accès à ce calendrier.</p>
      ) : (
        <CalendarEdit calendar={calendar} />
      )}
    </>
  );
}
