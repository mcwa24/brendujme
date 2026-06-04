import type { CategorySlug } from "@/types";
import type { Brand } from "@/types";
import type { OfferingSlug } from "@/lib/data/brand-offerings";

export interface SearchIntent {
  /** Tekst posle uklanjanja brenda i ključnih reči ponude */
  coreText: string;
  brandSlug?: string;
  brandName?: string;
  offerings?: OfferingSlug[];
  categorySlug?: CategorySlug;
}

const FOOTWEAR_TERMS = [
  "patik",
  "cipel",
  "obuc",
  "obuć",
  "sneaker",
  "tenisic",
  "sandale",
  "papuc",
  "cizme",
  "boot",
];

const APPAREL_TERMS = [
  "majic",
  "dukser",
  "hoodie",
  "pantalon",
  "farmerk",
  "odec",
  "odeć",
  "garderob",
  "haljin",
  "jakn",
  "trenerk",
  "sorc",
  "sorts",
  "kosulj",
  "košulj",
  "dzemper",
  "džemper",
];

const SPORTSWEAR_TERMS = ["sportska odec", "sportska odeć", "sportswear", "trenerka"];

const CATEGORY_TERMS: { slug: CategorySlug; terms: string[] }[] = [
  { slug: "fashion", terms: ["moda", "fashion", "garderoba", "odeca", "odeća"] },
  { slug: "sports", terms: ["sportska", "sports"] },
  { slug: "luxury", terms: ["luksuz", "luxury", "premium brend"] },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectOfferings(text: string): OfferingSlug[] {
  const found = new Set<OfferingSlug>();
  for (const t of FOOTWEAR_TERMS) {
    if (text.includes(t)) found.add("footwear");
  }
  for (const t of APPAREL_TERMS) {
    if (text.includes(t)) found.add("apparel");
  }
  for (const t of SPORTSWEAR_TERMS) {
    if (text.includes(t)) found.add("sportswear");
  }
  return [...found];
}

function detectCategory(text: string): CategorySlug | undefined {
  for (const { slug, terms } of CATEGORY_TERMS) {
    if (terms.some((t) => text.includes(t))) return slug;
  }
  return undefined;
}

function findBrandInQuery(text: string, brands: Brand[]): Brand | undefined {
  const sorted = [...brands].sort((a, b) => b.name.length - a.name.length);
  for (const brand of sorted) {
    const bn = normalize(brand.name);
    if (bn.length < 2) continue;
    if (text.includes(bn) || text.includes(brand.slug.replace(/-/g, " "))) {
      return brand;
    }
  }
  return undefined;
}

export function parseSearchIntent(query: string, brands: Brand[]): SearchIntent {
  const normalized = normalize(query.trim());
  if (!normalized) {
    return { coreText: "" };
  }

  const offerings = detectOfferings(normalized);
  const categorySlug = detectCategory(normalized);
  const brand = findBrandInQuery(normalized, brands);

  let coreText = normalized;
  if (brand) {
    const bn = normalize(brand.name);
    coreText = coreText.replace(bn, " ").replace(/\s+/g, " ").trim();
  }

  return {
    coreText,
    brandSlug: brand?.slug,
    brandName: brand?.name,
    offerings: offerings.length ? offerings : undefined,
    categorySlug,
  };
}
