/**
 * Home & Living brendovi u Srbiji
 */

import type { Brand, RetailLocation } from "@/types";
import scraped from "./home-retail-serbia-scraped.json";

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
  jysk: {
    name: "JYSK",
    country: "Danska",
    website: "https://jysk.rs/",
    description:
      "Skandinavski lanac za dom i baštu — 50 prodavnica u Srbiji, niska cena i nordijski dizajn.",
    priceSegment: "budget",
    category: "home",
    popular: true,
    networkTotal: 50,
    relatedBrandSlugs: ["ikea", "forma-ideale", "emmezeta"],
  },
  ikea: {
    name: "IKEA",
    country: "Švedska",
    website: "https://www.ikea.com/rs/",
    description:
      "Robna kuća IKEA Beograd, studiji za planiranje i mreža preuzimanja širom Srbije.",
    priceSegment: "mid",
    category: "home",
    featured: true,
    popular: true,
    relatedBrandSlugs: ["jysk", "forma-ideale", "emmezeta"],
  },
  "forma-ideale": {
    name: "Forma Ideale",
    country: "Srbija",
    website: "https://formaideale.rs/",
    description:
      "Najveća domaća mreža salona nameštaja — 44 salona u 37 gradova, sopstvena proizvodnja i online shop.",
    priceSegment: "mid",
    category: "home",
    featured: true,
    popular: true,
    relatedBrandSlugs: ["jysk", "ikea", "emmezeta"],
  },
  emmezeta: {
    name: "Emmezeta",
    country: "Srbija",
    website: "https://www.emmezeta.rs/",
    description:
      "Emmezeta i Merkury — veliki centri nameštaja i enterijera u Beogradu, Novom Sadu i Nišu.",
    priceSegment: "mid",
    category: "home",
    popular: true,
    relatedBrandSlugs: ["forma-ideale", "jysk", "ikea"],
  },
};

function storesForBrand(slug: string): StoreRow[] {
  return scraped.stores.filter((s) => s.brandSlug === slug);
}

function toLocations(stores: StoreRow[]): RetailLocation[] {
  return stores.map((s, i) => ({
    id: `home-${s.brandSlug}-${i}`,
    storeName: s.name,
    retailerSlug: s.retailerSlug,
    address: s.address,
    city: s.city,
  }));
}

function uniqueMalls(stores: StoreRow[]): string[] {
  return [...new Set(stores.map((s) => s.shoppingCenterSlug).filter(Boolean))] as string[];
}

export const HOME_RETAIL_BRAND_SLUGS = Object.keys(BRAND_META);

export function buildHomeRetailBrands(): Brand[] {
  return HOME_RETAIL_BRAND_SLUGS.map((slug) => {
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

export const homeRetailBrands = buildHomeRetailBrands();
