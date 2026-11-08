import type { Metadata } from "next";
import { VerifyMagicLink } from "./verify-magic-link";

export const metadata: Metadata = {
  title: "Connexion - Case du jour",
  robots: { index: false },
};

export default function VerifyPage() {
  return <VerifyMagicLink />;
}
