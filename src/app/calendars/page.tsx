import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
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
    <div className="p-8">
      <h1 className="text-2xl font-bold">My calendars</h1>
      {calendars.length === 0 ? (
        <p className="mt-4">You have no calendars yet.</p>
      ) : (
        <ul className="mt-4 list-disc pl-6">
          {calendars.map((c) => (
            <li key={c.id} className="py-1">
              {c.name}
            </li>
          ))}
        </ul>
      )}
      <LogoutButton />
    </div>
  );
}
