"use client";

import { useAuth } from "@/context/AuthProvider";

export default function Home() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {loading ? (
          <div>Loading...</div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="font-medium">{user.displayName}</span>
              <button onClick={() => signOut()}>Sign out</button>
            </div>
          </div>
        ) : (
          <button onClick={() => signInWithGoogle()}>
            Connexion avec Google
          </button>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        eCalendrier
      </footer>
    </div>
  );
}
