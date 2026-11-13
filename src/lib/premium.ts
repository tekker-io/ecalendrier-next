// Shared by server and client components: keep this file free of "use client"

export const PREMIUM_PRICE = "7 €";

export type PremiumFeature = "shuffle" | "dayImage" | "hd" | "logo" | "cta";

export const PREMIUM_FEATURES: {
  id: PremiumFeature;
  title: string;
  description: string;
}[] = [
  {
    id: "shuffle",
    title: "Mélanger les jours",
    description:
      "Les cases apparaissent dans le désordre : vos proches devront chercher la case du jour !",
  },
  {
    id: "dayImage",
    title: "Changer l'image des cadeaux",
    description:
      "Remplacez les paquets cadeaux par la photo ou le dessin de votre choix.",
  },
  {
    id: "hd",
    title: "Photos en qualité HD",
    description: "Vos photos sont gardées telles quelles, sans compression.",
  },
  {
    id: "logo",
    title: "Retirer le logo Case du jour",
    description: "Votre calendrier, sans aucune marque.",
  },
  {
    id: "cta",
    title: "Retirer le bouton « Créer mon propre calendrier »",
    description: "Rien ne détourne vos proches de leur surprise.",
  },
];
