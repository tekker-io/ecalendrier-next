"use client";

import {
  clearServerSession,
  createServerSession,
  getFirebaseAuth,
  sendEvent,
  signInWithGoogle,
  signOut,
} from "@/lib/firebaseClient";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = auth.onAuthStateChanged((u: User | null) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleSignIn() {
    sendEvent("Login");
    sendEvent("Login via Google");
    const res = await signInWithGoogle();
    // Exchange the ID token for a secure server-side session cookie
    try {
      if (res && res.idToken) {
        await createServerSession(res.idToken);
        router.refresh();
      }
    } catch (e) {
      console.error("Failed to create server session", e);
    }
  }

  async function handleSignOut() {
    try {
      sendEvent("Logout");
      await clearServerSession();
      router.refresh();
    } catch {
      // ignore
    }
    await signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
