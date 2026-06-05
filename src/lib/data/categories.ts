import type { Category, CategorySlug } from "@/types";

/** Podrazumevana kategorija brenda — ne prikazuje se u navigaciji. */
export const HIDDEN_CATEGORY_SLUGS = new Set<CategorySlug>(["fashion"]);

export const categories: Category[] = [
  {
    slug: "beauty",
    name: "Lepota",
    description: "Kozmetika, parfemi i nega tela",
  },
  {
    slug: "sports",
    name: "Sport",
    description: "Sportska odeća i oprema vrhunskih brenda",
  },
  {
    slug: "luxury",
    name: "Luksuz",
    description: "Ekskluzivni brendovi i haute couture",
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    description: "Životni stil, dodaci i premium iskustvo",
  },
  {
    slug: "footwear",
    name: "Obuća",
    description: "Patike, čizme, sandale i sneaker brendovi",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string): string {
  if (HIDDEN_CATEGORY_SLUGS.has(slug as CategorySlug)) return "";
  return getCategoryBySlug(slug)?.name ?? slug;
}

export function isNavigableCategory(slug: string): boolean {
  return !HIDDEN_CATEGORY_SLUGS.has(slug as CategorySlug);
}
