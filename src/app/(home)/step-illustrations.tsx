import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import LockIcon from "@mui/icons-material/Lock";
import Image from "next/image";

function Tile({
  day,
  state,
  editing = false,
  today = false,
}: {
  day: number;
  state: "available" | "locked";
  editing?: boolean;
  today?: boolean;
}) {
  return (
    <div
      className={`relative w-16 h-16 rounded border flex items-end justify-center pb-2 ${
        state === "available" ? "bg-white/30" : ""
      } ${today ? "border-yellow-300 ring-2 ring-yellow-300" : "border-white/30"}`}
    >
      <span className="absolute top-1 left-1.5 text-xs">{day}</span>
      {editing && (
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green flex items-center justify-center">
          <EditIcon sx={{ fontSize: 12 }} />
        </span>
      )}
      {state === "locked" && !editing && (
        <span className="absolute top-1 right-1 opacity-70">
          <LockIcon sx={{ fontSize: 12 }} />
        </span>
      )}
      <Image
        src={state === "available" ? "/gift.svg" : "/gift-disabled.svg"}
        alt=""
        width={36}
        height={31}
        className="w-9 h-auto"
      />
    </div>
  );
}

export function CreateIllustration() {
  return (
    <div className="grid grid-cols-3 gap-3" aria-hidden>
      {[1, 2, 3, 4, 5, 6].map((day) => (
        <Tile key={day} day={day} state="available" editing />
      ))}
    </div>
  );
}

export function ShareIllustration() {
  return (
    <div
      className="w-44 h-40 rounded-2xl border-2 border-white/40 bg-black/30 p-3 flex flex-col gap-2 text-xs"
      aria-hidden
    >
      <div className="self-end max-w-[85%] rounded-xl rounded-br-sm bg-blue px-3 py-2">
        <p className="mb-1.5">Ton calendrier de l&apos;avent 🎄</p>
        <span className="flex items-center gap-1 rounded bg-white/90 text-black px-1.5 py-0.5 font-bold">
          <LinkIcon sx={{ fontSize: 14 }} />
          Ouvrir le calendrier
        </span>
      </div>
      <div className="self-start rounded-xl rounded-bl-sm bg-white/90 text-black px-3 py-2">
        Trop bien !! 😍
      </div>
    </div>
  );
}

export function UnlockIllustration() {
  return (
    <div className="flex flex-col items-center gap-2" aria-hidden>
      <div className="grid grid-cols-3 gap-3">
        <Tile day={1} state="available" />
        <Tile day={2} state="available" />
        <Tile day={3} state="available" today />
        <Tile day={4} state="locked" />
        <Tile day={5} state="locked" />
        <Tile day={6} state="locked" />
      </div>
    </div>
  );
}
