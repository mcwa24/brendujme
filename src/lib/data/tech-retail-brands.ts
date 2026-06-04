/**
 * Tech retail brendovi u Srbiji
 */

import type { Brand, RetailLocation } from "@/types";
import scraped from "./tech-retail-serbia-scraped.json";

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
    networkTotal?: number;
  }
> = {
  tehnika: {
    name: "Tehnika",
    country: "Srbija",
    website: "https://www.tehnomedia.rs/",
    description:
      "Tehnomedia centar — bela tehnika, IT, audio-video i kućni aparati; 84 prodavnice u 50 gradova širom Srbije.",
    priceSegment: "mid",
    category: "technology",
    featured: true,
    popular: true,
    networkTotal: 84,
    relatedBrandSlugs: ["gigatron", "tehnomanija", "ct-shop"],
  },
  gigatron: {
    name: "Gigatron",
    country: "Srbija",
    website: "https://gigatron.rs/",
    description:
      "Lider u maloprodaji tehnike od 2003 — IT, gejming, potrošačka elektronika i bela tehnika u 70+ prodavnica i Megastore objektima.",
    priceSegment: "mid",
    category: "technology",
    featured: true,
    popular: true,
    networkTotal: 70,
    relatedBrandSlugs: ["tehnomanija", "tehnika", "bc-group"],
  },
  tehnomanija: {
    name: "Tehnomanija",
    country: "Srbija",
    website: "https://www.tehnomanija.rs/",
    description:
      "Lanac elektronike i bele tehnike od 1999 — Roaming grupa, 80+ prodavnica i online shop sa 20.000+ artikala.",
    priceSegment: "mid",
    category: "technology",
    featured: true,
    popular: true,
    networkTotal: 80,
    relatedBrandSlugs: ["gigatron", "tehnika", "ct-shop"],
  },
  "bc-group": {
    name: "BC Group",
    country: "Srbija",
    website: "https://bcgroup.rs/",
    description:
      "BC Group Computers — online prodaja IT i elektronike (Big Bang grupacija), preuzimanje na Durmitorskoj i partner lokacijama.",
    priceSegment: "mid",
    category: "technology",
    relatedBrandSlugs: ["gigatron", "ct-shop", "tehnomanija"],
  },
  "ct-shop": {
    name: "CT Shop",
    country: "Srbija",
    website: "https://www.ctshop.rs/",
    description:
      "Comtrade maloprodaja — IT, mobilni, TV i bela tehnika u Ada Mall, Ušću, Delta City, Rajićevoj i Mercatoru.",
    priceSegment: "mid",
    category: "technology",
    popular: true,
    relatedBrandSlugs: ["gigatron", "tehnomanija", "bc-group"],
  },
};

function storesForBrand(slug: string): StoreRow[] {
  return scraped.stores.filter((s) => s.brandSlug === slug);
}

function toLocations(stores: StoreRow[]): RetailLocation[] {
  return stores.map((s, i) => ({
    id: `tech-${s.brandSlug}-${i}`,
    storeName: s.name,
    retailerSlug: s.retailerSlug,
    address: s.address,
    city: s.city,
  }));
}

function uniqueMalls(stores: StoreRow[]): string[] {
  return [...new Set(stores.map((s) => s.shoppingCenterSlug).filter(Boolean))] as string[];
}

export const TECH_RETAIL_BRAND_SLUGS = Object.keys(BRAND_META);

export function buildTechRetailBrands(): Brand[] {
  return TECH_RETAIL_BRAND_SLUGS.map((slug) => {
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

export const techRetailBrands = buildTechRetailBrands();
