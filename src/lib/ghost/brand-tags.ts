import { brands } from "@/lib/data/brands";
import { getGhostNewsTagSlug } from "@/lib/ghost/env";

const NEWS_TAG = getGhostNewsTagSlug();

const KNOWN_BRAND_SLUGS = new Set(brands.map((b) => b.slug));

const TAG_SLUG_TO_BRAND = new Map<string, string>();
for (const brand of brands) {
  TAG_SLUG_TO_BRAND.set(brand.slug, brand.slug);
  TAG_SLUG_TO_BRAND.set(
    brand.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    brand.slug
  );
}

type GhostTag = { slug: string; name?: string };

export function brandSlugsFromGhostTags(tags: GhostTag[] | undefined): string[] {
  const found = new Set<string>();

  for (const tag of tags ?? []) {
    const slug = tag.slug.trim().toLowerCase();
    if (!slug || slug === NEWS_TAG || slug.startsWith("hash-")) continue;

    if (KNOWN_BRAND_SLUGS.has(slug)) {
      found.add(slug);
      continue;
    }

    const mapped = TAG_SLUG_TO_BRAND.get(slug);
    if (mapped) found.add(mapped);
  }

  return [...found];
}
