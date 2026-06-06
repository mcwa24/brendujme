/**
 * Fashion & sport partner brendovi — lokacije iz fashion-sport-serbia-scraped.json
 */

import type { Brand, RetailLocation } from "@/types";
import scraped from "./fashion-sport-serbia-scraped.json";
import { tikeBrandSlugs } from "@/lib/data/tike";

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
  burberry: {
    name: "Burberry",
    country: "Velika Britanija",
    website: "https://www.burberry.com/",
    description:
      "Britanski luxury brend — ranije mono-boutique na Terazijama; parfemi dostupni na aerodromu.",
    priceSegment: "luxury",
    category: "luxury",
    relatedBrandSlugs: ["fashion-company", "fashion-friends"],
  },
  "adidas-originals": {
    name: "adidas Originals",
    country: "Nemačka",
    website: "https://adidasoriginals.rs/",
    description:
      "Lifestyle linija Adidas — zvanična Originals radnja na Knezu i adidas store u Ušću, Galeriji, Promenadi i Nišu.",
    priceSegment: "premium",
    category: "sports",
    popular: true,
    relatedBrandSlugs: ["nike", "converse", "adidas"],
  },
  "extra-sports": {
    name: "Extra Sports",
    country: "Srbija",
    website: "https://www.extrasports.com/SRB_rs/",
    description:
      "Fer cena sportske opreme — deo Sport Vision grupe, 25+ lokacija i online shop.",
    priceSegment: "budget",
    category: "sports",
    networkTotal: 25,
    relatedBrandSlugs: ["sport-vision", "nike", "adidas"],
  },
  tike: {
    name: "Tike",
    country: "Srbija",
    website: "https://www.tike.rs/",
    description:
      "Beogradski sneaker temple — limitirane kolekcije u Kralja Petra 24; Sport Vision grupa.",
    priceSegment: "premium",
    category: "sports",
    relatedBrandSlugs: tikeBrandSlugs.filter((s) =>
      ["nike", "jordan", "adidas", "new-balance", "converse"].includes(s)
    ),
  },
  "run-n-more": {
    name: "Run'n More",
    country: "Srbija",
    website: "https://www.runnmore.com/",
    description:
      "Trkačka specijalizovana radnja — patike i oprema za trčanje, Uzun Mirkova 10 Beograd.",
    priceSegment: "mid",
    category: "sports",
    relatedBrandSlugs: ["nike", "asics", "sport-vision"],
  },
};

function storesForBrand(slug: string): StoreRow[] {
  return scraped.stores.filter((s) => s.brandSlug === slug);
}

function toLocations(stores: StoreRow[]): RetailLocation[] {
  return stores.map((s, i) => ({
    id: `fs-${s.brandSlug}-${i}`,
    storeName: s.name,
    retailerSlug: s.retailerSlug,
    address: s.address,
    city: s.city,
  }));
}

function uniqueMalls(stores: StoreRow[]): string[] {
  return [...new Set(stores.map((s) => s.shoppingCenterSlug).filter(Boolean))] as string[];
}

export const FASHION_SPORT_BRAND_SLUGS = Object.keys(BRAND_META);

export function buildFashionSportBrands(): Brand[] {
  return FASHION_SPORT_BRAND_SLUGS.map((slug) => {
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
