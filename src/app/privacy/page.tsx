import Link from "next/link";
import { TopBar } from "../components/top-bar";

export default function PrivacyPage() {
  return (
    <>
      <TopBar />
      <div>
        <h1 className="text-5xl mb-2">Politique de confidentialité</h1>
        <p className="mb-1">
          eCalendrier est une application développée par Arnaud Drain dans un
          but non-commercial.
        </p>
        <h2 className="text-3xl mb-2">Données récoltées</h2>
        <p className="mb-1">
          Les données récoltées sont celles saisies sur le site (nom et contenu
          des calendriers) ainsi que celles nécessaires pour la connexion
          (identifiant numérique Google / Facebook, email, nom et prénom).
        </p>
        <h2 className="text-3xl mb-2">Traceurs</h2>
        <p className="mb-1">
          eCalendrier utilise Google Analytics pour récolter des statistiques
          d&apos;utilisation de l&apos;application. Ces statistiques sont
          anonymisés.
        </p>
        <h2 className="text-3xl mb-2">Hébergement des données</h2>
        <p className="mb-1">
          Les données de eCalendrier sont stockés en Europe par le service
          &quot;Firebase&quot; appartenant à Google (Alphabet).
        </p>
        <h2 className="text-3xl mb-2">Contact et suppression des données</h2>
        <p className="mb-1">
          N&apos;hésitez pas à me contacter pour toute demande{" "}
          <Link
            href="https://www.facebook.com/messages/t/108201144469459"
            target="_blank"
            className="!underline"
          >
            en cliquant sur ce lien
          </Link>
          .
        </p>
      </div>
    </>
  );
}
