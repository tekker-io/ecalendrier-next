import { TopBar } from "@/app/components/top-bar";
import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
import SettingsIcon from "@mui/icons-material/Settings";
import ShareIcon from "@mui/icons-material/Share";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "../../components/button";
import { CalendarContent } from "../../components/calendar-content";
import { Calendar } from "../../entities";

export default async function CalendarPage({
  params,
}: {
  params: { calendarId: string };
}) {
  const user = await getUserFromCookie();
  const { calendarId } = await params;
  const db = admin.firestore();
  const doc = await db.collection("calendars").doc(calendarId).get();
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
        <>
          <h1 className="flex flex-wrap justify-between">
            <div className="text-3xl">{calendar.name}</div>
            <div className="flex">
              <Tooltip title="Partager">
                <Button theme="success">
                  Partager
                  <ShareIcon className="ml-1" />
                </Button>
              </Tooltip>
              <Tooltip title="Options" className="ml-2">
                <Button theme="dark">
                  <SettingsIcon />
                </Button>
              </Tooltip>
            </div>
          </h1>
          <CalendarContent calendar={calendar} editing />
        </>
      )}
    </>
  );
}
