import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "fashion",
    name: "Moda",
    description: "Savremena i luksuzna moda dostupna u Srbiji",
  },
  {
    slug: "beauty",
    name: "Lepota",
    description: "Kozmetika, parfemi i nega tela",
  },
  {
    slug: "sports",
    name: "Sport",
    description: "Sportska odeća i oprema vrhunskih brendova",
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
    slug: "home",
    name: "Dom",
    description: "Nameštaj, dekor i dizajn enterijera",
  },
  {
    slug: "technology",
    name: "Tehnologija",
    description: "Premium tehnologija i gadžeti",
  },
  {
    slug: "kids",
    name: "Deca",
    description: "Moda i proizvodi za najmlađe",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string): string {
  return getCategoryBySlug(slug)?.name ?? slug;
}
