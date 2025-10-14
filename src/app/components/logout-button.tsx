"use client";
import { useAuth } from "@/context/AuthProvider";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "./button";

export function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <Button onClick={() => signOut()} theme="danger">
      <FontAwesomeIcon icon={faSignOut} />
      Déconnexion
    </Button>
  );
}
