import admin, { getUserFromCookie } from "@/lib/firebaseAdmin";
import {
  PREMIUM_FEATURES,
  PREMIUM_PRICE,
  PremiumFeature,
} from "@/lib/premium";
import { getPaidPurchase } from "@/lib/stripe";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CasinoIcon from "@mui/icons-material/Casino";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HideImageIcon from "@mui/icons-material/HideImage";
import HighQualityIcon from "@mui/icons-material/HighQuality";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "../components/top-bar";
import { CheckoutLink } from "./checkout-link";
import { PremiumActivation } from "./premium-activation";
import { PurchaseTracker } from "./purchase-tracker";

const featureIcons: Record<PremiumFeature, React.ReactNode> = {
  shuffle: <CasinoIcon fontSize="large" />,
  dayImage: <CardGiftcardIcon fontSize="large" />,
  hd: <HighQualityIcon fontSize="large" />,
  logo: <HideImageIcon fontSize="large" />,
  cta: <LinkOffIcon fontSize="large" />,
};

function PriceCard({ stripeLink }: { stripeLink: string }) {
  return (
    <div className="w-full bg-black/30 rounded-lg p-6 flex flex-col items-center gap-3 text-center">
      <p className="text-5xl font-bold">{PREMIUM_PRICE}</p>
      <p className="text-lg">
        Une seule fois, à vie, pour tous vos calendriers
      </p>
      <CheckoutLink href={stripeLink} location="top" />
      <p className="text-sm opacity-80 flex items-center gap-1">
        <LockIcon fontSize="inherit" />
        Paiement sécurisé par Stripe
      </p>
    </div>
  );
}

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const user = await getUserFromCookie();
  if (!user) {
    redirect("/");
  }

  const db = admin.firestore();
  const snap = await db.doc(`users/${user.uid}`).get();
  const premium = snap.get("premium");

  const stripeParams = new URLSearchParams({ client_reference_id: user.uid });
  if (user.email) {
    // Pre-fills the email field on the Stripe payment page
    stripeParams.set("prefilled_email", user.email);
  }
  const stripeLink = `${process.env.NEXT_PUBLIC_STRIPE_LINK}?${stripeParams}`;

  // Set when Stripe redirects here after a payment
  const purchase =
    typeof sessionId === "string"
      ? await getPaidPurchase(sessionId, user.uid)
      : null;

  return (
    <>
      {purchase && <PurchaseTracker purchase={purchase} />}
      <TopBar />
      <main className="max-w-3xl mx-auto flex flex-col gap-12">
        <section className="flex flex-col items-center text-center gap-5">
          <span className="flex items-center gap-1 rounded-full bg-yellow-400 text-black font-bold text-sm px-3 py-1">
            <StarIcon fontSize="small" />
            Mode premium
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold">
            Un calendrier encore plus personnel
          </h1>
          <p className="text-lg">
            Mélangez les jours, choisissez l&apos;image des cadeaux, gardez vos
            photos en HD et retirez toute trace de Case du jour.
          </p>

          {premium ? (
            <div className="w-full bg-emerald-500 text-black rounded-lg p-6 flex flex-col items-center gap-3">
              <p className="text-2xl font-bold flex items-center gap-2">
                <StarIcon />
                Vous êtes premium, merci !
                <StarIcon />
              </p>
              <Link
                href="/calendars"
                className="rounded bg-black text-white font-bold py-3 px-6"
              >
                Retour à mes calendriers
              </Link>
            </div>
          ) : purchase ? (
            <PremiumActivation />
          ) : (
            <PriceCard stripeLink={stripeLink} />
          )}
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            Ce que débloque le premium
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {PREMIUM_FEATURES.map((feature) => (
              <li
                key={feature.id}
                className="bg-black/30 rounded-lg p-5 flex gap-4"
              >
                <span className="shrink-0 text-yellow-300">
                  {featureIcons[feature.id]}
                </span>
                <div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="opacity-90">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-black/30 rounded-lg p-6 flex gap-4">
          <FavoriteIcon className="shrink-0 text-red" fontSize="large" />
          <div>
            <h2 className="font-bold text-lg">Soutenez un projet indépendant</h2>
            <p className="opacity-90">
              Acheter le mode premium permet aussi de soutenir le développement
              de l&apos;application pour qu&apos;elle puisse perdurer dans le
              temps.
            </p>
          </div>
        </section>

        {!premium && !purchase && (
          <section className="flex flex-col items-center gap-3 text-center">
            <p className="text-xl font-bold">
              Prêt à rendre votre calendrier unique ?
            </p>
            <CheckoutLink href={stripeLink} location="bottom" />
          </section>
        )}
      </main>
    </>
  );
}
