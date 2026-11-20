import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import { TopBar } from "../components/top-bar";
import { Calendars } from "./calendars";

export type CalendarList = {
  id: string;
  name: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
}[];

export default async function CalendarsPage() {
  const user = await getUserFromCookie();
  if (!user) {
    redirect("/");
  }

  const db = admin.firestore();
  // In parallel: the premium status doesn't slow down the list
  const [userSnap, snap] = await Promise.all([
    db.doc(`users/${user.uid}`).get(),
    db
      .collection("calendars")
      .where("author", "==", user.uid)
      .orderBy("createdAt")
      .get(),
  ]);
  const premium = !!userSnap.get("premium");
  const calendars: CalendarList = snap.docs
    .map((d) => ({
      id: d.id,
      name: d.get("name"),
      startDate: d.get("startDate"),
      endDate: d.get("endDate"),
    }))
    // Most recent first (sorted here to keep using the existing index)
    .reverse();

  return (
    <>
      <TopBar account={{ email: user.email ?? null, premium: !!premium }} />
      <Calendars calendars={calendars} />
    </>
  );
}
