import Link from "next/link";
import { Button } from "./components/button";

export default function NotFound() {
  return (
    <>
      <h1 className="text-3xl mb-2">Oopsi</h1>
      <p className="mb-4">
        Cette page n&apos;existe pas ! Si vous avez reçu le lien d&apos;un
        calendrier, il a peut-être été mal copié ou le calendrier a été
        supprimé.
      </p>
      <div className="flex">
        <Link href="/">
          <Button theme="dark">Retourner à l&apos;accueil</Button>
        </Link>
      </div>
    </>
  );
}
