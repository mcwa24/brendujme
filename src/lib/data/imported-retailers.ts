import { isSerbiaMarketUrl } from "@/lib/data/retailer-serbia-urls";

/** Retaileri uvezeni sa zvaničnih sajtova — samo moda / sport / obuća */
export const IMPORTED_RETAILER_SLUGS = [
  "fashion-company",
  "buzz-sneakers",
  "office-shoes",
  "sport-time",
  "djak-sport",
  "sport-vision",
  "planeta-sport",
  "inditex",
  "lpp",
  "tike",
  "urban-shop",
  "n-sport",
] as const;

export type ImportedRetailerSlug = (typeof IMPORTED_RETAILER_SLUGS)[number];

/** Skriveni iz kataloga (bivši home / tech / beauty partneri) */
export const DEPRECATED_RETAILER_SLUGS = [
  /** Podbrend — vidi /retailers/fashion-company i F&F radnje u listi lokacija */
  "fashion-friends",
  "xyz",
  "jysk",
  "ikea",
  "forma-ideale",
  "emmezeta",
  "tehnika",
  "gigatron",
  "tehnomanija",
  "bc-group",
  "ct-shop",
  "sephora",
  "dm",
  "lilly",
  "jasmin",
  "extra-sports",
  "run-n-more",
] as const;

export const DEPRECATED_BRAND_SLUGS = [
  ...DEPRECATED_RETAILER_SLUGS,
  "alexandar-cosmetics",
  /** Prodavci / lanci — samo na /retailers, ne u /brands */
  ...IMPORTED_RETAILER_SLUGS,
] as const;

export function isExcludedBrandSlug(slug: string): boolean {
  return (DEPRECATED_BRAND_SLUGS as readonly string[]).includes(slug);
}

export function isImportedRetailerSlug(slug: string): slug is ImportedRetailerSlug {
  return (IMPORTED_RETAILER_SLUGS as readonly string[]).includes(slug);
}

/** Bivši slugovi — mapiraju se na glavnog prodavca (npr. F&F → Fashion Company). */
const RETAILER_SLUG_ALIASES: Record<string, ImportedRetailerSlug> = {
  "fashion-friends": "fashion-company",
};

export function normalizeRetailerSlug(slug: string): string {
  return RETAILER_SLUG_ALIASES[slug] ?? slug;
}

export function isExcludedRetailerSlug(slug: string): boolean {
  return (DEPRECATED_RETAILER_SLUGS as readonly string[]).includes(slug);
}

export function sortImportedRetailers<T extends { slug: string }>(items: T[]): T[] {
  const order = new Map(IMPORTED_RETAILER_SLUGS.map((s, i) => [s, i]));
  return [...items].sort(
    (a, b) => (order.get(a.slug as ImportedRetailerSlug) ?? 99) - (order.get(b.slug as ImportedRetailerSlug) ?? 99)
  );
}

export interface RetailerExternalLinks {
  /** Srpski shop — prioritet na stranici prodavca i u akcijama */
  website: string;
  websiteLabel: string;
  /** Originalni/corporate sajt ako SR varijanta nije dostupna */
  fallbackWebsite?: string;
  fallbackWebsiteLabel?: string;
}

export const IMPORTED_RETAILER_EXTERNAL: Record<
  ImportedRetailerSlug,
  RetailerExternalLinks
> = {
  "buzz-sneakers": {
    website: "https://www.buzzsneakers.rs/",
    websiteLabel: "buzzsneakers.rs",
  },
  "office-shoes": {
    website: "https://www.officeshoes.rs/",
    websiteLabel: "officeshoes.rs",
  },
  "sport-time": {
    website: "https://www.nike.com/rs/",
    websiteLabel: "nike.com/rs",
    fallbackWebsite: "https://www.nike.com/",
    fallbackWebsiteLabel: "nike.com",
  },
  "djak-sport": {
    website: "https://www.djaksport.com/",
    websiteLabel: "djaksport.com",
  },
  "sport-vision": {
    website: "https://www.sportvision.rs/",
    websiteLabel: "sportvision.rs",
  },
  "planeta-sport": {
    website: "https://planetasport.rs/",
    websiteLabel: "planetasport.rs",
  },
  inditex: {
    website: "https://www.zara.com/rs/",
    websiteLabel: "zara.com/rs",
    fallbackWebsite: "https://www.inditex.com/",
    fallbackWebsiteLabel: "inditex.com",
  },
  lpp: {
    website: "https://www.reserved.com/rs/sr/",
    websiteLabel: "reserved.com/rs",
    fallbackWebsite: "https://www.lpp.com/",
    fallbackWebsiteLabel: "lpp.com",
  },
  "fashion-company": {
    website: "https://www.fashioncompany.rs/",
    websiteLabel: "fashioncompany.rs",
    fallbackWebsite: "https://www.fashionandfriends.com/rs/",
    fallbackWebsiteLabel: "fashionandfriends.com",
  },
  tike: {
    website: "https://www.tike.rs/",
    websiteLabel: "tike.rs",
  },
  "urban-shop": {
    website: "https://www.urbanshop.rs/",
    websiteLabel: "urbanshop.rs",
  },
  "n-sport": {
    website: "https://www.n-sport.net/",
    websiteLabel: "n-sport.net",
  },
};

/** Javni link prodavca: SR shop → originalni sajt → interna stranica. */
export function resolveRetailerPublicWebsite(retailerSlug: string): {
  url: string;
  label: string;
  isSerbia: boolean;
} {
  const external =
    IMPORTED_RETAILER_EXTERNAL[
      retailerSlug as keyof typeof IMPORTED_RETAILER_EXTERNAL
    ];

  if (!external) {
    return {
      url: `/retailers/${retailerSlug}`,
      label: retailerSlug,
      isSerbia: false,
    };
  }

  if (isSerbiaMarketUrl(external.website)) {
    return {
      url: external.website,
      label: external.websiteLabel,
      isSerbia: true,
    };
  }

  if (external.fallbackWebsite) {
    return {
      url: external.fallbackWebsite,
      label: external.fallbackWebsiteLabel ?? external.fallbackWebsite,
      isSerbia: false,
    };
  }

  return {
    url: external.website,
    label: external.websiteLabel,
    isSerbia: isSerbiaMarketUrl(external.website),
  };
}

/** Za akcije: SR stranica akcije → SR shop (ili original ako nema SR). */
export function getRetailerWebsiteUrl(
  retailerSlug: string,
  promoPageUrl?: string
): string {
  const promo = promoPageUrl?.trim();
  if (promo && isSerbiaMarketUrl(promo)) return promo;
  return resolveRetailerPublicWebsite(retailerSlug).url;
}

/** Link radnje: SR URL ako postoji, inače shop prodavca (SR pa original). */
export function resolveStoreExternalUrl(
  storeUrl: string | null | undefined,
  retailerSlug: string
): string | null {
  const trimmed = storeUrl?.trim();
  if (trimmed && isSerbiaMarketUrl(trimmed)) return trimmed;

  const { url } = resolveRetailerPublicWebsite(retailerSlug);
  return url.startsWith("http") ? url : null;
}
