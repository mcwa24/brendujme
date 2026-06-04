/**
 * Fast fashion brendovi u Srbiji — lokacije iz fast-fashion-serbia-scraped.json
 */

import type { Brand, RetailLocation } from "@/types";
import scraped from "./fast-fashion-serbia-scraped.json";

type StoreRow = (typeof scraped.stores)[number];

const BRAND_META: Record<
  string,
  {
    name: string;
    country: string;
    website: string;
    description: string;
    priceSegment: Brand["priceSegment"];
    featured?: boolean;
    popular?: boolean;
    relatedBrandSlugs: string[];
  }
> = {
  zara: {
    name: "Zara",
    country: "Španija",
    website: "https://www.zara.com/rs/",
    description:
      "Inditex brend — globalni fast fashion lider sa prodavnicama u Ušću, Galeriji, BIG Fashion, Promenadi i Delta City.",
    priceSegment: "mid",
    featured: true,
    popular: true,
    relatedBrandSlugs: ["massimo-dutti", "bershka", "pull-and-bear", "stradivarius"],
  },
  "massimo-dutti": {
    name: "Massimo Dutti",
    country: "Španija",
    website: "https://www.massimodutti.com/rs/",
    description:
      "Premium Inditex linija — elegantna moda u Ušću, Galeriji i drugim tržnim centrima u Beogradu.",
    priceSegment: "premium",
    featured: true,
    popular: true,
    relatedBrandSlugs: ["zara", "oysho", "cos"],
  },
  "pull-and-bear": {
    name: "Pull&Bear",
    country: "Španija",
    website: "https://www.pullandbear.com/rs/",
    description:
      "Inditex brend za mlade — ulični stil u Ušću, BIG Fashion, Delta City i Promenadi.",
    priceSegment: "budget",
    popular: true,
    relatedBrandSlugs: ["bershka", "stradivarius", "zara"],
  },
  bershka: {
    name: "Bershka",
    country: "Španija",
    website: "https://www.bershka.com/rs/",
    description:
      "Inditex brend na udaru trendova — prodavnice u Ušću, BIG Fashion i Delta City.",
    priceSegment: "budget",
    popular: true,
    relatedBrandSlugs: ["pull-and-bear", "stradivarius", "zara"],
  },
  stradivarius: {
    name: "Stradivarius",
    country: "Španija",
    website: "https://www.stradivarius.com/rs/",
    description:
      "Inditex brend za dinamičnu publiku — Ušće, BIG Fashion, Promenada, Delta City.",
    priceSegment: "budget",
    popular: true,
    relatedBrandSlugs: ["bershka", "pull-and-bear", "oysho"],
  },
  oysho: {
    name: "Oysho",
    country: "Španija",
    website: "https://www.oysho.com/rs/",
    description:
      "Inditex brend za sport, donji veš i leisure — Ušće, Galerija, Promenada.",
    priceSegment: "mid",
    relatedBrandSlugs: ["zara", "stradivarius", "massimo-dutti"],
  },
  reserved: {
    name: "Reserved",
    country: "Poljska",
    website: "https://www.reserved.com/rs/sr/",
    description:
      "LPP grupa — trend moda u 60+ prodavnica u Srbiji (Delta, BIG, Promenada, Knez Mihailova).",
    priceSegment: "budget",
    popular: true,
    relatedBrandSlugs: ["house", "mohito", "sinsay", "cropp"],
  },
  mohito: {
    name: "Mohito",
    country: "Poljska",
    website: "https://www.mohito.com/rs/sr/",
    description:
      "LPP brend za žene — prodavnice u Delta City, BIG Fashion, Promenadi i drugim gradovima.",
    priceSegment: "budget",
    relatedBrandSlugs: ["reserved", "sinsay", "house"],
  },
  sinsay: {
    name: "Sinsay",
    country: "Poljska",
    website: "https://www.sinsay.com/rs/sr/",
    description:
      "LPP brend za celu porodicu po pristupačnim cenama — široka mreža u Beogradu i regionu.",
    priceSegment: "budget",
    popular: true,
    relatedBrandSlugs: ["reserved", "cropp", "house"],
  },
  cropp: {
    name: "Cropp",
    country: "Poljska",
    website: "https://www.cropp.com/rs/sr/",
    description:
      "LPP muški streetwear brend — Delta City, Delta Planet Niš, Promenada.",
    priceSegment: "budget",
    relatedBrandSlugs: ["house", "reserved", "sinsay"],
  },
  house: {
    name: "House",
    country: "Poljska",
    website: "https://www.housebrand.com/rs/sr/",
    description:
      "LPP brend za mlade — Delta City, Ušće, Promenada i drugi tržni centri.",
    priceSegment: "budget",
    relatedBrandSlugs: ["reserved", "mohito", "sinsay"],
  },
  "h-and-m": {
    name: "H&M",
    country: "Švedska",
    website: "https://www.hm.com/rs_sr/",
    description:
      "9 prodavnica u Srbiji — Beograd (Delta, Galerija), Novi Sad, Niš, Zrenjanin, Subotica, Pančevo.",
    priceSegment: "budget",
    popular: true,
    relatedBrandSlugs: ["zara", "reserved", "mango"],
  },
  mango: {
    name: "Mango",
    country: "Španija",
    website: "https://shop.mango.com/rs",
    description:
      "Španski brend — Galerija, Ušće i Promenada; mediteranski stil po pristupačnim cenama.",
    priceSegment: "mid",
    popular: true,
    relatedBrandSlugs: ["zara", "massimo-dutti", "bershka"],
  },
  "new-yorker": {
    name: "New Yorker",
    country: "Nemačka",
    website: "https://www.newyorker.de/rs/",
    description:
      "Evropski lanac za mlade — 6+ lokacija u Beogradu, Novi Sad, Zrenjanin (Ušće, Galerija, Stadion).",
    priceSegment: "budget",
    popular: true,
    relatedBrandSlugs: ["bershka", "pull-and-bear", "sinsay"],
  },
};

function storesForBrand(slug: string): StoreRow[] {
  return scraped.stores.filter((s) => s.brandSlug === slug);
}

function toLocations(stores: StoreRow[]): RetailLocation[] {
  return stores.map((s, i) => ({
    id: `ff-${s.brandSlug}-${i}`,
    storeName: s.name,
    retailerSlug: s.retailerSlug,
    address: s.address,
    city: s.city,
  }));
}

function uniqueMalls(stores: StoreRow[]): string[] {
  return [...new Set(stores.map((s) => s.shoppingCenterSlug).filter(Boolean))] as string[];
}

export const FAST_FASHION_BRAND_SLUGS = Object.keys(BRAND_META);

export function buildFastFashionBrands(): Brand[] {
  return FAST_FASHION_BRAND_SLUGS.map((slug) => {
    const meta = BRAND_META[slug];
    const stores = storesForBrand(slug);
    return {
      slug,
      name: meta.name,
      category: "fashion" as const,
      country: meta.country,
      website: meta.website,
      description: meta.description,
      priceSegment: meta.priceSegment,
      availabilityCount: stores.length,
      featured: meta.featured ?? false,
      popular: meta.popular ?? false,
      locations: toLocations(stores),
      shoppingCenterSlugs: uniqueMalls(stores),
      relatedBrandSlugs: meta.relatedBrandSlugs.filter((s) => s !== slug),
    };
  });
}

export const fastFashionBrands = buildFastFashionBrands();
