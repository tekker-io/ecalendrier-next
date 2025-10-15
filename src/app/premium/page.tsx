import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { TopBar } from "../components/top-bar";

export default async function PremiumPage() {
  const user = await getUserFromCookie();

  // Query Firestore for calendars authored by this uid
  const db = admin.firestore();
  const snap = await db.doc(`users/${user.uid}`).get();
  const premium = snap.get("premium");

  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_LINK;

  return (
    <>
      <TopBar />
      <h1 className="text-5xl mb-4 text-yellow-100 flex items-center justify-center">
        <FontAwesomeIcon icon={faStar} className="text-base" />
        Mode premium
        <FontAwesomeIcon icon={faStar} className="text-base" />
      </h1>
      <div className="text-lg">
        <p>
          Le mode premium coûte 7€ à vie et permet d&apos;activer des
          fonctionnalités supplémentaires :
        </p>
        <ul className="list-disc list-inside">
          <li>
            Désactiver le logo &quot;eCalendrier&quot; sur vos calendriers
          </li>
          <li>
            Désactiver le bouton &quot;Créer mon propre calendrier&quot; sur vos
            calendriers
          </li>
          <li>Retirer la limite de 2Mo par case</li>
        </ul>
        <p>
          Acheter le mode premium permet aussi de soutenir le développement de
          l&apos;application pour qu&apos;il puisse perdurer dans le temps.
        </p>
        <p>
          Le paiement s&apos;effectue de façon sécurisée en ligne grâce à la
          plateforme Stripe.
        </p>
        <div className="flex justify-center my-4">
          {premium ? (
            <div className="bg-emerald-500 text-black rounded py-2 px-4 lg:py-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faStar} />
              Vous êtes premium, merci !<FontAwesomeIcon icon={faStar} />
            </div>
          ) : (
            <Link
              href={stripeLink + "?client_reference_id=" + user?.uid}
              className="bg-yellow-400 text-black rounded py-2 px-4 lg:py-4 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faStar} />
              Activer le mode premium
              <FontAwesomeIcon icon={faStar} />
            </Link>
          )}
        </div>
        {!premium && (
          <div className="italic">
            Les fonctionnalités premium peuvent mettre jusqu&apos;à 5 minutes à
            apparaître après votre paiement.
            <br />
            Le bouton ci-dessus changera de couleur quand le mode sera actif.
          </div>
        )}
      </div>
      <div></div>
    </>
  );
}
