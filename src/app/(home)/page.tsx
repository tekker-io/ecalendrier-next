import { getUserFromCookie } from "@/lib/firebaseAdmin";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SocialButton } from "../components/social-button";
import { GoogleButton } from "./google-button";

export default async function Home() {
  const user = await getUserFromCookie();
  if (user) {
    redirect("/calendars");
  }

  return (
    <main className="flex sm:flex-row flex-col sm:gap-0 gap-10">
      <div className="flex-1 flex flex-col items-center sm:items-start">
        <Image src="/logo.svg" alt="logo" width="212" height="59" />
        <h2 className="text-white font-bold text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl mt-12 mb-10 text-center sm:text-left">
          Créez gratuitement votre calendrier de l&apos;avent
        </h2>
        <div className="flex flex-wrap">
          <GoogleButton />
        </div>
        <div className="w-20 h-0.5 bg-black my-7" />
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
      <div className="flex-1 flex">
        <Image
          src="/santa.svg"
          alt="santa"
          className="w-full"
          width="100"
          height="100"
        />
      </div>
    </main>
  );
}
