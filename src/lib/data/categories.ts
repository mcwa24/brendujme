import type { Category, CategorySlug } from "@/types";

/** Glavna modna kategorija u bazi — na sajtu: Ostali brendovi (ne „Moda“). */
export const FASHION_CATEGORY: Category = {
  slug: "fashion",
  name: "Ostali brendovi",
  description: "Modni brendovi bez posebnog segmenta — moda, fast fashion i slično",
};

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

export function getCatalogCategoryBySlug(slug: string): Category | undefined {
  if (slug === "fashion") return FASHION_CATEGORY;
  return categories.find((c) => c.slug === slug);
}

/** @deprecated Koristi getCatalogCategoryBySlug */
export function getCategoryBySlug(slug: string): Category | undefined {
  return getCatalogCategoryBySlug(slug);
}

export function getCategoryName(slug: string): string {
  return getCatalogCategoryBySlug(slug)?.name ?? slug;
}

export function isNavigableCategory(slug: string): boolean {
  return Boolean(getCatalogCategoryBySlug(slug));
}
