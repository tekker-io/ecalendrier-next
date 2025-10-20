import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import { LogoutButton } from "../components/logout-button";
import { TopBar } from "../components/top-bar";
import { Calendars } from "./calendars";

export type CalendarList = {
  id: string;
  name: string;
}[];

export default async function CalendarsPage() {
  const user = await getUserFromCookie();
  if (!user) {
    redirect("/");
  }

  const db = admin.firestore();
  const snap = await db
    .collection("calendars")
    .where("author", "==", user.uid)
    .orderBy("createdAt")
    .get();
  const calendars: CalendarList = snap.docs.map((d) => ({
    id: d.id,
    name: d.get("name"),
  }));

  return (
    <>
      <TopBar />
      <h1 className="text-4xl mb-4">Bonjour !</h1>
      <h2 className="text-2xl mb-3">Mes calendriers :</h2>
      <Calendars calendars={calendars} />

      <div className="mb-1">
        <LogoutButton />
      </div>
    </>
  );
}
