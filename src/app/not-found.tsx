import Link from "next/link";
import { Button } from "./components/button";

export default function NotFound() {
  return (
    <>
      <h2>Oopsi</h2>
      Cette page n&apos;existe pas !
      <div className="flex">
        <Link href="/">
          <Button theme="dark">Retourner à l&apos;accueil</Button>
        </Link>
      </div>
    </>
  );
}
