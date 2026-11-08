"use client";

import { useAuth } from "@/context/AuthProvider";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { FormEvent, useId, useState } from "react";

export function EmailLoginForm() {
  const { sendMagicLink } = useAuth();
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      await sendMagicLink(email.trim());
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="w-full bg-black/30 rounded p-4 flex gap-3">
        <MarkEmailReadIcon className="shrink-0" />
        <div className="text-sm">
          <p className="font-bold mb-1">Vérifiez votre boîte mail !</p>
          <p className="mb-2">
            Un lien de connexion a été envoyé à <strong>{email}</strong>.
            Cliquez dessus pour accéder à vos calendriers. Pensez à regarder
            dans vos spams.
          </p>
          <button
            type="button"
            className="underline cursor-pointer"
            onClick={() => setStatus("idle")}
          >
            Utiliser une autre adresse
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-2">
      <label htmlFor={inputId} className="sr-only">
        Adresse email
      </label>
      <input
        id={inputId}
        type="email"
        required
        autoComplete="email"
        placeholder="votre@email.fr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 rounded bg-white text-black px-3 placeholder:text-black/40"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="h-11 rounded bg-red hover:bg-red/90 font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {status === "sending"
          ? "Envoi en cours…"
          : "Recevoir un lien de connexion"}
      </button>
      {error && <p className="text-sm text-yellow-200">{error}</p>}
      <p className="text-xs opacity-80">
        Pas de mot de passe : vous recevez un lien par email pour vous
        connecter.
      </p>
    </form>
  );
}
