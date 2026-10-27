import Link from "next/link";
import { TopBar } from "../components/top-bar";

export default function PrivacyPage() {
  return (
    <>
      <TopBar />
      <div>
        <h1 className="text-5xl mb-2">Politique de confidentialité</h1>
        <p className="mb-1 italic">Dernière mise à jour : 27 octobre 2026</p>
        <p className="mb-4">
          Cette page explique quelles données sont collectées lorsque vous
          utilisez Case du jour, pourquoi elles le sont, avec qui elles sont
          partagées et comment exercer vos droits, conformément au Règlement
          général sur la protection des données (RGPD).
        </p>

        <h2 className="text-3xl mb-2">Responsable du traitement</h2>
        <p className="mb-4">
          Case du jour est une application développée et éditée par Tekker,
          qui est responsable du traitement des données décrites ci-dessous.
        </p>

        <h2 className="text-3xl mb-2">Données collectées</h2>
        <p className="mb-1">Selon votre utilisation du site :</p>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Compte</strong> : lors de la connexion avec Google, nous
            recevons votre identifiant Google, votre adresse email, votre nom
            et votre prénom.
          </li>
          <li>
            <strong>Calendriers</strong> : le nom, les dates, les réglages et
            le contenu des cases que vous créez (textes, images, vidéos ou
            liens que vous y ajoutez).
          </li>
          <li>
            <strong>Mode premium</strong> : le statut premium de votre compte.
            Le paiement est traité directement par Stripe : nous n&apos;avons
            jamais accès à vos coordonnées bancaires.
          </li>
          <li>
            <strong>Statistiques d&apos;utilisation</strong> : pages
            consultées et actions effectuées sur le site (création d&apos;un
            calendrier, ajout d&apos;une image…), type d&apos;appareil et de
            navigateur.
          </li>
        </ul>

        <h2 className="text-3xl mb-2">Utilisation des données</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Vous permettre de créer, modifier et partager vos calendriers
            (exécution du service que vous demandez).
          </li>
          <li>
            Vous identifier et sécuriser l&apos;accès à vos calendriers.
          </li>
          <li>Activer les fonctionnalités premium après votre paiement.</li>
          <li>
            Mesurer l&apos;audience et améliorer l&apos;application (intérêt
            légitime).
          </li>
        </ul>
        <p className="mb-4">
          Vos données ne sont ni vendues, ni louées, ni utilisées à des fins
          publicitaires.
        </p>

        <h2 className="text-3xl mb-2">Visibilité des calendriers</h2>
        <p className="mb-4">
          Un calendrier est accessible à toute personne disposant de son lien.
          Ne partagez ce lien qu&apos;avec les personnes à qui le calendrier
          est destiné, et évitez d&apos;y placer des informations sensibles.
        </p>

        <h2 className="text-3xl mb-2">Cookies et traceurs</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Cookie de session</strong> : un cookie technique nommé
            &quot;session&quot; vous garde connecté pendant 5 jours. Il est
            indispensable au fonctionnement du site et est supprimé lorsque
            vous vous déconnectez.
          </li>
          <li>
            <strong>Mesure d&apos;audience</strong> : Case du jour utilise
            Google Analytics (via Firebase) pour produire des statistiques
            d&apos;utilisation. Ce service dépose des cookies dans votre
            navigateur. Vous pouvez les bloquer ou les supprimer à tout moment
            depuis les réglages de votre navigateur.
          </li>
        </ul>

        <h2 className="text-3xl mb-2">Hébergement et sous-traitants</h2>
        <p className="mb-1">
          Les données sont confiées aux prestataires suivants, uniquement pour
          les besoins du service :
        </p>
        <ul className="list-disc list-inside mb-1">
          <li>
            <strong>Google Firebase</strong> (Google Ireland Ltd.) :
            authentification, base de données et stockage des fichiers,
            hébergés en Europe.
          </li>
          <li>
            <strong>Google Analytics</strong> (Google Ireland Ltd.) : mesure
            d&apos;audience.
          </li>
          <li>
            <strong>Stripe</strong> (Stripe Payments Europe Ltd.) : paiement du
            mode premium.
          </li>
        </ul>
        <p className="mb-4">
          Certains de ces prestataires peuvent transférer des données hors de
          l&apos;Union européenne, notamment aux États-Unis. Ces transferts
          sont encadrés par le Data Privacy Framework UE–États-Unis ou par les
          clauses contractuelles types de la Commission européenne.
        </p>

        <h2 className="text-3xl mb-2">Durée de conservation</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Les données de compte et les calendriers sont conservés tant que
            votre compte existe, puis supprimés sur simple demande.
          </li>
          <li>
            Un calendrier que vous supprimez depuis l&apos;application est
            effacé immédiatement.
          </li>
          <li>
            Les informations de paiement sont conservées par Stripe selon ses
            propres obligations légales et comptables.
          </li>
          <li>
            Les statistiques d&apos;utilisation sont conservées au maximum 14
            mois.
          </li>
        </ul>

        <h2 className="text-3xl mb-2">Vos droits</h2>
        <p className="mb-1">
          Vous disposez à tout moment d&apos;un droit d&apos;accès, de
          rectification, d&apos;effacement, de limitation, de portabilité et
          d&apos;opposition sur vos données. Vous pouvez supprimer vous-même
          vos calendriers depuis l&apos;application ; pour toute autre demande,
          y compris la suppression complète de votre compte, contactez-nous
          (voir ci-dessous).
        </p>
        <p className="mb-4">
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez
          adresser une réclamation à la CNIL (
          <Link
            href="https://www.cnil.fr"
            target="_blank"
            className="!underline"
          >
            www.cnil.fr
          </Link>
          ).
        </p>

        <h2 className="text-3xl mb-2">Contact</h2>
        <p className="mb-1">
          N&apos;hésitez pas à me contacter pour toute question ou demande
          concernant vos données{" "}
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
