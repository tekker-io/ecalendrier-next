"use client";

import { useAuth } from "@/context/AuthProvider";
import Image from "next/image";

export default function Home() {
  const { signInWithGoogle } = useAuth();

  return (
    <main className="flex">
      <div className="flex-1">
        <Image src="/logo.svg" alt="logo" width="212" height="59" />
        <h2 className="text-white font-bold text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl mt-12 mb-10">
          Créez gratuitement votre calendrier de l&apos;avent
        </h2>
        <div className="flex flex-wrap">
          {/* @Todo design the button */}
          <button onClick={() => signInWithGoogle()}>
            Connexion avec Google
          </button>
        </div>
        <div className="w-20 h-0.5 bg-black my-7"></div>
      </div>
      <div className="flex-1 invisible md:visible flex">
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
