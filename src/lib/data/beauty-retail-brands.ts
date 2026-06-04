/**
 * Beauty / drogerija brendovi u Srbiji
 */

import type { Brand, RetailLocation } from "@/types";
import scraped from "./beauty-retail-serbia-scraped.json";

type StoreRow = (typeof scraped.stores)[number];

const BRAND_META: Record<
  string,
  {
    name: string;
    country: string;
    website: string;
    description: string;
    priceSegment: Brand["priceSegment"];
    category: Brand["category"];
    featured?: boolean;
    popular?: boolean;
    relatedBrandSlugs: string[];
    /** Ukupno u mreži (ako je veće od broja lokacija u JSON) */
    networkTotal?: number;
  }
> = {
  sephora: {
    name: "Sephora",
    country: "Francuska",
    website: "https://www.sephora.rs/",
    description:
      "LVMH parfimerija — prestižna kozmetika, parfemi i Beauty Hub usluge u Ušću, Galeriji, BIG Fashion, Belville i Promenadi.",
    priceSegment: "premium",
    category: "beauty",
    featured: true,
    popular: true,
    relatedBrandSlugs: ["mac", "jasmin", "alexandar-cosmetics"],
  },
  dm: {
    name: "DM",
    country: "Nemačka",
    website: "https://www.dm.rs/",
    description:
      "dm drogerie markt — najveća drogerijska mreža u Evropi, u Srbiji od 2004. sa 130+ prodajnih mesta u 37 gradova.",
    priceSegment: "budget",
    category: "beauty",
    popular: true,
    networkTotal: 130,
    relatedBrandSlugs: ["lilly", "sephora", "house"],
  },
  lilly: {
    name: "Lilly",
    country: "Srbija",
    website: "https://www.lilly.rs/",
    description:
      "Domaci lanac drogerija i apoteka — kozmetika, nega, lekovi i baby program na 185+ lokacija u Srbiji.",
    priceSegment: "budget",
    category: "beauty",
    popular: true,
    networkTotal: 185,
    relatedBrandSlugs: ["dm", "jasmin", "sephora"],
  },
  jasmin: {
    name: "Jasmin",
    country: "Srbija",
    website: "https://www.jasmin.rs/",
    description:
      "Parfimerije od 1967 — Chanel, Dior, Lancôme, Guerlain i 30+ prodavnica u Beogradu i gradovima Srbije.",
    priceSegment: "luxury",
    category: "beauty",
    featured: true,
    popular: true,
    networkTotal: 30,
    relatedBrandSlugs: ["sephora", "mac", "rituals"],
  },
  "alexandar-cosmetics": {
    name: "Alexandar Cosmetics",
    country: "Srbija",
    website: "https://www.alexandar-cosmetics.com/",
    description:
      "Srpski proizvođač kozmetike — proizvodi dostupni u mreži distributera (Charm, MK, BEO, Black Care) i maloprodaji u Novom Sadu.",
    priceSegment: "mid",
    category: "beauty",
    relatedBrandSlugs: ["lilly", "dm", "jasmin"],
  },
};

function storesForBrand(slug: string): StoreRow[] {
  return scraped.stores.filter((s) => s.brandSlug === slug);
}

function toLocations(stores: StoreRow[]): RetailLocation[] {
  return stores.map((s, i) => ({
    id: `beauty-${s.brandSlug}-${i}`,
    storeName: s.name,
    retailerSlug: s.retailerSlug,
    address: s.address,
    city: s.city,
  }));
}

function uniqueMalls(stores: StoreRow[]): string[] {
  return [...new Set(stores.map((s) => s.shoppingCenterSlug).filter(Boolean))] as string[];
}

export const BEAUTY_RETAIL_BRAND_SLUGS = Object.keys(BRAND_META);

export function buildBeautyRetailBrands(): Brand[] {
  return BEAUTY_RETAIL_BRAND_SLUGS.map((slug) => {
    const meta = BRAND_META[slug];
    const stores = storesForBrand(slug);
    const count = meta.networkTotal ?? stores.length;
    return {
      slug,
      name: meta.name,
      category: meta.category,
      country: meta.country,
      website: meta.website,
      description: meta.description,
      priceSegment: meta.priceSegment,
      availabilityCount: count,
      featured: meta.featured ?? false,
      popular: meta.popular ?? false,
      locations: toLocations(stores),
      shoppingCenterSlugs: uniqueMalls(stores),
      relatedBrandSlugs: meta.relatedBrandSlugs.filter((s) => s !== slug),
    };
  });
}

export const beautyRetailBrands = buildBeautyRetailBrands();
