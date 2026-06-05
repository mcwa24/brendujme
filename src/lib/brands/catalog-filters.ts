import { categories } from "@/lib/data/categories";
import type { Brand, CategorySlug, PriceSegment } from "@/types";

export interface CategoryFilterOption {
  slug: CategorySlug;
  name: string;
  count: number;
}

export interface CountryFilterOption {
  value: string;
  label: string;
  count: number;
}

export interface PriceSegmentFilterOption {
  value: PriceSegment;
  label: string;
  count: number;
}

const FASHION_FILTER_LABEL = "Ostali brendovi";
const UNKNOWN_COUNTRY = "Drugo";

const PRICE_SEGMENT_LABELS: Record<PriceSegment, string> = {
  budget: "Pristupačno",
  mid: "Srednji",
  premium: "Premium",
  luxury: "Luksuz",
};

/** Kategorije iz stvarnog kataloga — ista logika kao na /categories. */
export function getCategoryFilterOptions(brands: Brand[]): CategoryFilterOption[] {
  const counts = new Map<CategorySlug, number>();
  for (const brand of brands) {
    counts.set(brand.category, (counts.get(brand.category) ?? 0) + 1);
  }

  const options: CategoryFilterOption[] = [];

  for (const cat of categories) {
    const count = counts.get(cat.slug);
    if (count) options.push({ slug: cat.slug, name: cat.name, count });
  }

  const fashionCount = counts.get("fashion");
  if (fashionCount) {
    options.push({
      slug: "fashion",
      name: FASHION_FILTER_LABEL,
      count: fashionCount,
    });
  }

  return options;
}

export function getCountryFilterOptions(brands: Brand[]): CountryFilterOption[] {
  const counts = new Map<string, number>();
  for (const brand of brands) {
    const key = brand.country?.trim() || UNKNOWN_COUNTRY;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "sr"));
}

export function getPriceSegmentFilterOptions(
  brands: Brand[]
): PriceSegmentFilterOption[] {
  const counts = new Map<PriceSegment, number>();
  for (const brand of brands) {
    counts.set(brand.priceSegment, (counts.get(brand.priceSegment) ?? 0) + 1);
  }

  const order: PriceSegment[] = ["budget", "mid", "premium", "luxury"];
  return order
    .filter((value) => counts.has(value))
    .map((value) => ({
      value,
      label: PRICE_SEGMENT_LABELS[value],
      count: counts.get(value)!,
    }));
}

export function getFilterCategoryLabel(slug: CategorySlug): string {
  if (slug === "fashion") return FASHION_FILTER_LABEL;
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function parseCategoryFilterParam(
  value: string | undefined,
  brands: Brand[]
): CategorySlug | "all" {
  if (!value) return "all";
  const valid = new Set(brands.map((b) => b.category));
  return valid.has(value as CategorySlug) ? (value as CategorySlug) : "all";
}

export function brandMatchesCountry(brand: Brand, country: string): boolean {
  if (country === "Sve zemlje") return true;
  const brandCountry = brand.country?.trim() || UNKNOWN_COUNTRY;
  return brandCountry === country;
}

export function brandMatchesSearch(brand: Brand, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const categoryLabel = getFilterCategoryLabel(brand.category).toLowerCase();
  return (
    brand.name.toLowerCase().includes(q) ||
    categoryLabel.includes(q) ||
    brand.category.toLowerCase().includes(q)
  );
}
