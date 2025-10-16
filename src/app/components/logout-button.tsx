"use client";
import { useAuth } from "@/context/AuthProvider";
import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "./button";

export function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <Button onClick={() => signOut()} theme="danger">
      <LogoutIcon />
      Déconnexion
    </Button>
  );
}
