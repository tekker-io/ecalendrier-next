import { AuthProvider } from "@/context/AuthProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { BlackFridayBanner } from "./components/black-friday-banner";
import { ScreenTracker } from "./components/screen-tracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "eCalendrier - Calendrier de l'avent en ligne",
  description: "Créez gratuitement votre calendrier de l'avent en ligne !",
  openGraph: {
    images: "/bg.webp",
  },
};

const roboto = Roboto({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`h-full ${roboto.className}`}>
      <body
        className={`m-0 bg-cover min-h-full bg-center bg-fixed pt-12 relative`}
      >
        <BlackFridayBanner />
        <Toaster position="top-right" />
        <ScreenTracker />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <div className="px-6 sm:px-12 md:px-16 lg:px-24">
            <div className="max-w-7xl m-auto pb-16">
              <div
                className="backdrop-blur-lg rounded-lg py-6 lg:py-12 px-4 sm:px-6 lg:px-12"
                style={{
                  background:
                    "linear-gradient(104.42deg, rgba(100, 150, 101, 0.4) 0.83%, rgba(240, 0, 35, 0.4) 98.12%)",
                }}
              >
                <AuthProvider>{children}</AuthProvider>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 bg-black w-full">
            <div className="max-w-7xl m-auto">
              <Link href="/privacy">Politique de confidentialité</Link>
            </div>
          </div>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
