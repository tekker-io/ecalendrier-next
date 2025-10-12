"use client";
import { useAuth } from "@/context/AuthProvider";

export function LoggoutButton() {
  const { signOut } = useAuth();
  return <button onClick={() => signOut()}>Se déconnecter</button>;
}
