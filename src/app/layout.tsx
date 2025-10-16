import { AuthProvider } from "@/context/AuthProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "eCalendrier - Calendrier de l'avent en ligne",
  description: "eCalendrier",
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
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <div className="w-4/5 max-w-7xl m-auto pb-16">
            <div
              className="backdrop-blur-lg rounded-lg p-6 lg:p-12"
              style={{
                background:
                  "linear-gradient(104.42deg, rgba(100, 150, 101, 0.4) 0.83%, rgba(240, 0, 35, 0.4) 98.12%)",
              }}
            >
              <AuthProvider>{children}</AuthProvider>
            </div>
          </div>
          <div className="absolute bottom-0 bg-black w-full">
            <div className="w-4/5 max-w-7xl m-auto">
              <Link href="/privacy">Politique de confidentialité</Link>
            </div>
          </div>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
