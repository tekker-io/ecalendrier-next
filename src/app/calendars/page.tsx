import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
import Link from "next/link";
import { LogoutButton } from "../components/logout-button";

type Calendar = {
  id: string;
  name: string;
};

export default async function CalendarsPage() {
  const user = await getUserFromCookie();

  // Query Firestore for calendars authored by this uid
  const db = admin.firestore();
  const snap = await db
    .collection("calendars")
    .where("author", "==", user.uid)
    .get();
  const calendars: Calendar[] = snap.docs.map((d) => ({
    id: d.id,
    name: d.get("name"),
  }));

  return (
    <>
      <h1 className="text-4xl mb-4">Bonjour !</h1>
      <h2 className="text-2xl mb-3">Mes calendriers :</h2>
      <div className="mb-6 flex flex-wrap">
        {calendars.map((c) => (
          <Link
            key={c.id}
            href={`/edit/${c.id}`}
            className="rounded mr-2 mb-2 flex p-8 border-2 border-solid border-gray-100 hover:bg-gray-100 hover:text-black bg-white/30"
          >
            {c.name}
          </Link>
        ))}
        <div
          className="
        rounded
        mr-2
        mb-2
        flex
        p-8
        border-2 border-dashed
        cursor-pointer
        border-gray-100
        hover:bg-gray-100 hover:text-black
        bg-white/30
      "
        >
          + Ajouter un calendrier
        </div>
      </div>
      <div className="mb-1">
        <LogoutButton />
      </div>
    </>
  );
}
