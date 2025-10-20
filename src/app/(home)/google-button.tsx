"use client";

import { useAuth } from "@/context/AuthProvider";
import { SocialButton } from "../components/social-button";

export function GoogleButton() {
  const { signInWithGoogle } = useAuth();

  return (
    <SocialButton
      onClick={() => signInWithGoogle()}
      theme="blue"
      img="/google.svg"
      imgAlt="Google logo"
    >
      Connexion avec Google
    </SocialButton>
  );
}
