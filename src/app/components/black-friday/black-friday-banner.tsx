import Link from "next/link";

/*
 ** To use this, enable it in layout.tsx
 ** Then add some <BlackFridayDisplayer premium={premium} /> at the root of the pages that needs to display it
 */

export function BlackFridayBanner() {
  return (
    <Link
      id="black-friday-banner"
      href="/premium"
      className="w-full text-center -mt-12 mb-12 bg-red/80 py-2 cursor-pointer hidden text-md px-2"
    >
      ✨ Offre limitée : –20% sur le mode premium grâce au code BLACKFRIDAY
      jusqu&apos;à vendredi soir ! ✨
    </Link>
  );
}
