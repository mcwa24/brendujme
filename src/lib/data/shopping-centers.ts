import type { ShoppingCenter } from "@/types";

export const shoppingCenters: ShoppingCenter[] = [
  {
    slug: "usce",
    name: "Ušće Shopping Center",
    city: "Beograd",
    brandCount: 142,
    description:
      "Jedan od najvećih i najpoznatijih tržnih centara u regionu, dom premium modnih i lifestyle brendova.",
    brandSlugs: ["zara", "massimo-dutti", "cos", "nike", "adidas", "scotch-and-soda"],
  },
  {
    slug: "galerija",
    name: "Galerija Beograd",
    city: "Beograd",
    brandCount: 98,
    description:
      "Savremeni retail prostor na obali Save sa fokusom na modu, lepotu i gastronomiju.",
    brandSlugs: ["mango", "bershka", "pull-and-bear", "rituals", "tommy-hilfiger"],
  },
  {
    slug: "delta-city",
    name: "Delta City",
    city: "Beograd",
    brandCount: 115,
    description:
      "Premium destinacija za porodičnu kupovinu i međunarodne modne brendove.",
    brandSlugs: ["h-and-m", "reserved", "sandro", "maje", "lacoste"],
  },
  {
    slug: "big-fashion",
    name: "BIG Fashion Park",
    city: "Beograd",
    brandCount: 76,
    description: "Outlet i fashion park sa širokim izborom evropskih brendova.",
    brandSlugs: ["calvin-klein", "guess", "levis", "timberland"],
  },
  {
    slug: "promenada",
    name: "Promenada",
    city: "Novi Sad",
    brandCount: 64,
    description:
      "Vodeći tržni centar u Novom Sadu sa fokusom na modu i lifestyle.",
    brandSlugs: ["zara", "mango", "nike", "rituals", "cos"],
  },
  {
    slug: "mercator",
    name: "Mercator Centar",
    city: "Niš",
    brandCount: 52,
    description: "Regionalni retail hub sa međunarodnim modnim brendovima.",
    brandSlugs: ["h-and-m", "bershka", "adidas", "pull-and-bear"],
  },
  {
    slug: "stadion",
    name: "Stadion Shopping Center",
    city: "Beograd",
    brandCount: 48,
    description: "Kompaktan centar sa sportskim i modnim brendovima.",
    brandSlugs: ["nike", "adidas", "puma", "under-armour"],
  },
  {
    slug: "kragujevac-plaza",
    name: "Plaza Kragujevac",
    city: "Kragujevac",
    brandCount: 41,
    description: "Moderni tržni centar u srcu Šumadije.",
    brandSlugs: ["reserved", "house", "mohito", "cropp"],
  },
  {
    slug: "zlatibor",
    name: "Stop Shop Zlatibor",
    city: "Zlatibor",
    brandCount: 28,
    description: "Planinski retail sa lifestyle i outdoor brendovima.",
    brandSlugs: ["north-face", "columbia", "timberland"],
  },
  {
    slug: "rajiceva",
    name: "Rajiceva Shopping Center",
    city: "Beograd",
    brandCount: 38,
    description:
      "Boutique centar u centru Beograda sa luksuznim i premium brendovima.",
    brandSlugs: ["scotch-and-soda", "sandro", "maje", "tory-burch"],
  },
];

export function getShoppingCenterBySlug(
  slug: string
): ShoppingCenter | undefined {
  return shoppingCenters.find((s) => s.slug === slug);
}
