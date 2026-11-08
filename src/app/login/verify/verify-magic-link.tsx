"use client";

import { useAuth } from "@/context/AuthProvider";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { getEmailForMagicLink, isMagicLink } from "@/lib/firebaseClient";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Spinner } from "../../components/spinner";

type Status = "checking" | "need-email" | "signing-in" | "error";

export function VerifyMagicLink() {
  const { signInWithMagicLink } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  // A magic link can only be used once: make sure we don't try twice
  // (React strict mode runs effects twice in dev)
  const started = useRef(false);

  async function signIn(emailToUse: string) {
    started.current = true;
    setStatus("signing-in");
    setError(null);
    try {
      await signInWithMagicLink(emailToUse, window.location.href);
      router.replace("/calendars");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    if (started.current) return;
    const url = window.location.href;
    if (!isMagicLink(url)) {
      setError("Ce lien de connexion n'est pas valide.");
      setStatus("error");
      return;
    }
    const storedEmail = getEmailForMagicLink();
    if (storedEmail) {
      signIn(storedEmail);
    } else {
      // Link opened on another device or browser: ask the email again
      setStatus("need-email");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    signIn(email.trim());
  }

  return (
    <main className="flex flex-col items-center text-center gap-8 py-8">
      <Link href="/">
        <Image src="/logo.svg" alt="Case du jour" width="212" height="59" />
      </Link>

      {(status === "checking" || status === "signing-in") && (
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-lg">Connexion en cours…</p>
        </div>
      )}

      {status === "need-email" && (
        <form
          onSubmit={onSubmit}
          className="w-full max-w-xs flex flex-col gap-3"
        >
          <h1 className="text-2xl font-bold">Confirmez votre adresse email</h1>
          <p className="text-sm">
            Vous avez ouvert le lien sur un autre appareil ou navigateur.
            Saisissez l&apos;adresse email à laquelle vous l&apos;avez reçu.
          </p>
          <label htmlFor="verify-email" className="sr-only">
            Adresse email
          </label>
          <input
            id="verify-email"
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
            className="h-11 rounded bg-red hover:bg-red/90 font-bold text-sm cursor-pointer"
          >
            Me connecter
          </button>
        </form>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Connexion impossible</h1>
          <p>{error}</p>
          <Link href="/" className="bg-black rounded py-2 px-4 font-bold">
            Recevoir un nouveau lien
          </Link>
        </div>
      )}
    </main>
  );
}
