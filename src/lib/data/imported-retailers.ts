/** Retaileri uvezeni sa zvaničnih sajtova — samo moda / sport / obuća */
export const IMPORTED_RETAILER_SLUGS = [
  "fashion-company",
  "fashion-friends",
  "buzz-sneakers",
  "office-shoes",
  "sport-time",
  "djak-sport",
  "sport-vision",
  "planeta-sport",
  "inditex",
  "lpp",
  "tike",
] as const;

export type ImportedRetailerSlug = (typeof IMPORTED_RETAILER_SLUGS)[number];

/** Skriveni iz kataloga (bivši home / tech / beauty partneri) */
export const DEPRECATED_RETAILER_SLUGS = [
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

export function isExcludedRetailerSlug(slug: string): boolean {
  return (DEPRECATED_RETAILER_SLUGS as readonly string[]).includes(slug);
}

export function sortImportedRetailers<T extends { slug: string }>(items: T[]): T[] {
  const order = new Map(IMPORTED_RETAILER_SLUGS.map((s, i) => [s, i]));
  return [...items].sort(
    (a, b) => (order.get(a.slug as ImportedRetailerSlug) ?? 99) - (order.get(b.slug as ImportedRetailerSlug) ?? 99)
  );
}

export const IMPORTED_RETAILER_EXTERNAL: Record<
  ImportedRetailerSlug,
  { website: string; websiteLabel: string }
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
    website: "https://www.nike.com/",
    websiteLabel: "nike.com",
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
    website: "https://www.inditex.com/",
    websiteLabel: "inditex.com",
  },
  lpp: {
    website: "https://www.lpp.com/",
    websiteLabel: "lpp.com",
  },
  "fashion-company": {
    website: "https://www.fashioncompany.rs/",
    websiteLabel: "fashioncompany.rs",
  },
  "fashion-friends": {
    website: "https://www.fashionandfriends.com/rs/",
    websiteLabel: "fashionandfriends.com",
  },
  tike: {
    website: "https://www.tike.rs/",
    websiteLabel: "tike.rs",
  },
};

/** Zvanični home page prodavca — ne promo / shop podstranica. */
export function getRetailerWebsiteUrl(
  retailerSlug: string,
  promoPageUrl?: string
): string {
  const external =
    IMPORTED_RETAILER_EXTERNAL[
      retailerSlug as keyof typeof IMPORTED_RETAILER_EXTERNAL
    ];
  if (external?.website) return external.website;

  if (promoPageUrl?.startsWith("http")) {
    try {
      return `${new URL(promoPageUrl).origin}/`;
    } catch {
      /* ignore */
    }
  }

  return `/retailers/${retailerSlug}`;
}
