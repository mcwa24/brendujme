import type { ShoppingCenter } from "@/types";

/** Skriveni sa sajta — i dalje mogu postojati u scraped podacima prodavaca */
export const EXCLUDED_SHOPPING_CENTER_SLUGS = new Set([
  "mercator",
  "kragujevac-plaza",
  "zlatibor",
  "promenada",
]);

export function isPublishedShoppingCenterSlug(slug: string): boolean {
  return !EXCLUDED_SHOPPING_CENTER_SLUGS.has(slug);
}

export function filterPublishedShoppingCenterSlugs(slugs: string[]): string[] {
  return slugs.filter(isPublishedShoppingCenterSlug);
}

export function filterPublishedShoppingCenters(
  centers: ShoppingCenter[]
): ShoppingCenter[] {
  return centers.filter((c) => isPublishedShoppingCenterSlug(c.slug));
}

export const shoppingCenters: ShoppingCenter[] = [
  {
    slug: "usce",
    name: "Ušće Shopping Center",
    city: "Beograd",
    address: "Bulevar Mihajla Pupina 4",
    latitude: 44.8211359,
    longitude: 20.3478675,
    brandCount: 142,
    description:
      "Jedan od najvećih i najpoznatijih tržnih centara u regionu, dom premium modnih i lifestyle brenda.",
    brandSlugs: ["zara", "massimo-dutti", "cos", "nike", "adidas", "scotch-and-soda"],
  },
  {
    slug: "galerija",
    name: "Galerija Beograd",
    city: "Beograd",
    address: "Bulevar Vudroa Vilsona 12",
    latitude: 44.8036997,
    longitude: 20.4413032,
    brandCount: 98,
    description:
      "Savremeni retail prostor na obali Save sa fokusom na modu, lepotu i gastronomiju.",
    brandSlugs: ["mango", "bershka", "pull-and-bear", "rituals", "tommy-hilfiger"],
  },
  {
    slug: "delta-city",
    name: "Delta City",
    city: "Beograd",
    address: "Jurija Gagarina 16",
    brandCount: 115,
    description:
      "Premium destinacija za porodičnu kupovinu i međunarodne modne brendove.",
    brandSlugs: ["h-and-m", "reserved", "sandro", "maje", "lacoste"],
  },
  {
    slug: "big-fashion",
    name: "BIG Fashion Park",
    city: "Beograd",
    address: "Višnjička 84",
    latitude: 44.794837,
    longitude: 20.4612,
    brandCount: 76,
    description: "Outlet i fashion park sa širokim izborom evropskih brenda.",
    brandSlugs: ["calvin-klein", "guess", "levis", "timberland"],
  },
  {
    slug: "promenada",
    name: "Promenada",
    city: "Novi Sad",
    address: "Bulevar Oslobođenja 119",
    latitude: 45.2454753,
    longitude: 19.8418521,
    brandCount: 64,
    description:
      "Vodeći tržni centar u Novom Sadu sa fokusom na modu i lifestyle.",
    brandSlugs: ["zara", "mango", "nike", "rituals", "cos"],
  },
  {
    slug: "stadion",
    name: "Stadion Shopping Center",
    city: "Beograd",
    address: "Zaplanjska 32",
    latitude: 44.77491,
    longitude: 20.4879193,
    brandCount: 48,
    description: "Kompaktan centar sa sportskim i modnim brendima.",
    brandSlugs: ["nike", "adidas", "puma", "under-armour"],
  },
  {
    slug: "rajiceva",
    name: "Rajićeva Shopping Center",
    city: "Beograd",
    address: "Knez Mihailova 54",
    brandCount: 38,
    description:
      "Boutique centar u centru Beograda sa luksuznim i premium brendima.",
    brandSlugs: ["scotch-and-soda", "sandro", "maje", "tory-burch"],
  },
];

export function getShoppingCenterBySlug(
  slug: string
): ShoppingCenter | undefined {
  if (!isPublishedShoppingCenterSlug(slug)) return undefined;
  return shoppingCenters.find((s) => s.slug === slug);
}
