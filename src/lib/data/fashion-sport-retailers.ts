import scraped from "./fashion-sport-serbia-scraped.json";
import { tikeBrandSlugs, tikeMeta } from "@/lib/data/tike";
import type { Retailer } from "@/types";
import type { RetailerStore } from "@/types";

const MALL_NAMES: Record<string, string> = {
  usce: "Ušće",
  "delta-city": "Delta City",
  galerija: "Galerija",
  "big-fashion": "BIG Fashion",
  promenada: "Promenada",
  stadion: "Stadion",
  rajiceva: "Rajićeva",
  mercator: "Mercator",
  "kragujevac-plaza": "Plaza Kragujevac",
};

function storesForRetailer(slug: string): RetailerStore[] {
  return scraped.stores
    .filter((s) => s.retailerSlug === slug)
    .map((s, i) => ({
      id: `${slug}-${i}`,
      name: s.name,
      address: s.address,
      city: s.city,
      phone: null,
      email: null,
      shoppingCenterSlug: s.shoppingCenterSlug,
      shoppingCenterName: s.shoppingCenterSlug
        ? (MALL_NAMES[s.shoppingCenterSlug] ?? null)
        : null,
      storeUrl: s.storeUrl,
    }));
}

/** Novi fashion/sport partneri (FC već u repository; sport lanci u importedRetailers) */
export const fashionSportRetailers: Retailer[] = [
  {
    slug: "fashion-friends",
    name: "Fashion&Friends",
    description:
      "Multibrand koncept Fashion Company — Diesel, Replay, Guess, Superdry, Liu Jo i 30+ brendova u Ušću, Rajićevoj, Galeriji i regionu.",
    city: "Beograd",
    brandCount: 30,
    brandSlugs: ["diesel", "levis", "guess", "replay", "superdry"],
  },
  {
    slug: "extra-sports",
    name: "Extra Sports",
    description:
      "Sport Vision grupa — fer cena sportske opreme, Nike, Adidas, Puma i 25+ prodavnica u Srbiji.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["extra-sports"],
  },
  {
    slug: "tike",
    name: "Tike",
    description:
      `Sneaker temple u centru Beograda — ${tikeMeta.brandCount} brendova (Nike, Jordan, Adidas, New Balance i dr.) prema zvaničnom katalogu na tike.rs.`,
    city: "Beograd",
    brandCount: tikeMeta.brandCount,
    brandSlugs: tikeBrandSlugs,
  },
  {
    slug: "run-n-more",
    name: "Run'n More",
    description:
      "Specijalizovana trkačka radnja u centru Beograda — patike i oprema za trčanje (Runnmore).",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["run-n-more"],
  },
];

export function getFashionSportRetailerStores(slug: string): RetailerStore[] {
  return storesForRetailer(slug);
}
