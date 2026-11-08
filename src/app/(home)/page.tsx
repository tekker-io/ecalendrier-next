import { getUserFromCookie } from "@/lib/firebaseAdmin";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SocialButton } from "../components/social-button";
import { LoginOptions } from "./login-options";
import {
  CreateIllustration,
  ShareIllustration,
  UnlockIllustration,
} from "./step-illustrations";

export const metadata: Metadata = {
  title: "Calendrier de l'avent en ligne gratuit - Case du jour",
  description:
    "Créez gratuitement votre calendrier de l'avent en ligne : remplissez chaque case avec des messages, photos ou vidéos, partagez le lien, et une case se débloque chaque jour.",
};

const steps = [
  {
    title: "Créez votre calendrier",
    illustration: <CreateIllustration />,
    text: "Connectez-vous, créez votre calendrier de l'avent en ligne et remplissez chaque case avec le contenu de votre choix : un mot doux, une photo, une vidéo, un lien, une énigme…",
  },
  {
    title: "Partagez le lien",
    illustration: <ShareIllustration />,
    text: "Envoyez le lien du calendrier à la ou les personnes de votre choix, par SMS, email ou messagerie. Pas besoin de créer de compte pour l'ouvrir.",
  },
  {
    title: "Une case par jour",
    illustration: <UnlockIllustration />,
    text: "Chaque jour, une nouvelle case se débloque et vos destinataires découvrent la surprise que vous leur avez préparée. Impossible de tricher en ouvrant les cases en avance !",
  },
];

const ideas = [
  {
    title: "Pour votre moitié",
    text: "Souvenirs, déclarations, bons pour un massage ou un resto : un calendrier de l'avent romantique, même à distance.",
  },
  {
    title: "Pour les enfants",
    text: "Une blague, un dessin animé, une devinette ou une activité de Noël à faire chaque jour en attendant le 25 décembre.",
  },
  {
    title: "Pour la famille et les amis",
    text: "Des photos de famille, des messages vidéo, une playlist : idéal pour garder le lien avec ceux qui vivent loin.",
  },
  {
    title: "Pour vos collègues",
    text: "Un quiz, une anecdote ou un défi quotidien pour animer l'équipe pendant tout le mois de décembre.",
  },
];

const faq = [
  {
    question: "Qu'est-ce qu'un calendrier de l'avent en ligne ?",
    answer:
      "C'est un calendrier de l'avent digital, accessible depuis un simple lien sur téléphone, tablette ou ordinateur. Au lieu de chocolats, chaque case cache un contenu que vous avez choisi : texte, image, vidéo ou lien. Une nouvelle case s'ouvre chaque jour jusqu'à Noël.",
  },
  {
    question: "Est-ce vraiment gratuit ?",
    answer:
      "Oui, la création et le partage d'un calendrier sont entièrement gratuits. Un mode premium optionnel (7€ à vie) permet de retirer le logo, de mélanger l'ordre des cases, de personnaliser l'image des cadeaux et de lever la limite de 2 Mo par case.",
  },
  {
    question: "Mes destinataires doivent-ils créer un compte ?",
    answer:
      "Non. Il suffit d'ouvrir le lien que vous leur envoyez. Seule la personne qui crée le calendrier se connecte, avec son compte Google ou son adresse email.",
  },
  {
    question: "Que peut-on mettre dans les cases ?",
    answer:
      "Tout ce que vous voulez : du texte mis en forme, des photos, des vidéos, des GIFs ou des liens vers une chanson, un jeu ou une réservation. Vous pouvez modifier le contenu des cases à tout moment, même après avoir partagé le calendrier.",
  },
  {
    question: "Peut-on choisir les dates du calendrier ?",
    answer:
      "Oui. Par défaut le calendrier couvre l'avent, du 1er au 25 décembre, mais vous pouvez choisir n'importe quelles dates de début et de fin : compte à rebours avant un anniversaire, un mariage, des vacances ou une naissance.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default async function Home() {
  const user = await getUserFromCookie();
  if (user) {
    redirect("/calendars");
  }

  return (
    <main className="flex flex-col gap-16 lg:gap-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="flex sm:flex-row sm:items-center flex-col sm:gap-0 gap-10">
        <div className="flex-1 flex flex-col items-center sm:items-start">
          <Image src="/logo.svg" alt="Case du jour" width="212" height="59" />
          <h1 className="text-white font-bold text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl mt-12 mb-6 text-center sm:text-left">
            Créez gratuitement votre calendrier de l&apos;avent en ligne
          </h1>
          <p className="text-lg mb-10 text-center sm:text-left">
            Un calendrier de l&apos;avent digital à remplir de messages,
            photos et vidéos, à offrir à vos proches avec un simple lien.
          </p>
          <LoginOptions />
        </div>
        <div className="flex-1 flex">
          <Image
            src="/santa.svg"
            alt="Père Noël"
            className="w-full"
            width="100"
            height="100"
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
          Comment ça marche ?
        </h2>
        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <li key={step.title} className="bg-black/30 rounded-lg p-6">
              <div className="h-48 flex items-center justify-center mb-6">
                {step.illustration}
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="shrink-0 w-10 h-10 rounded-full bg-red flex items-center justify-center font-bold text-xl">
                  {i + 1}
                </span>
                <h3 className="text-xl font-bold">{step.title}</h3>
              </div>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-col items-center gap-4 mt-10">
          <p className="text-lg">Envie de voir le résultat ?</p>
          <Link href="-MMm0AnXznQF1ZTaetrC">
            <SocialButton
              theme="black"
              img="sample.svg"
              imgAlt="Sample calendar icon"
            >
              Regarder un exemple
            </SocialButton>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-center">
          Un calendrier de l&apos;avent digital pour tout le monde
        </h2>
        <p className="text-lg mb-8 text-center max-w-3xl mx-auto">
          Plus original qu&apos;un calendrier en chocolat et sans frais de
          port, le calendrier de l&apos;avent en ligne se prépare en quelques
          minutes et s&apos;ouvre partout, même à l&apos;autre bout du monde.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {ideas.map((idea) => (
            <div key={idea.title} className="bg-black/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">{idea.title}</h3>
              <p>{idea.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto w-full">
        <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
          Questions fréquentes
        </h2>
        <div className="flex flex-col gap-3">
          {faq.map(({ question, answer }) => (
            <details key={question} className="bg-black/30 rounded-lg group">
              <summary className="cursor-pointer list-none p-4 font-bold text-lg flex justify-between items-center gap-4">
                <h3>{question}</h3>
                <span className="text-2xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center text-center gap-6">
        <h2 className="text-3xl lg:text-4xl font-bold">
          Prêt à préparer votre calendrier ?
        </h2>
        <p className="text-lg">
          C&apos;est gratuit et ça ne prend que quelques minutes.
        </p>
        <LoginOptions />
      </section>
    </main>
  );
}
