import { BILBORD_SITE_URL } from "@/lib/bilbord-footer";
import { getGhostNewsTagSlug } from "@/lib/ghost/env";
import { BILBORD_MODA_STIL_URL } from "@/lib/news/urls";
import type { NewsArticle, NewsArticleTag } from "@/types";

const HIDDEN_TAG_SLUGS = new Set([
  "instagram",
  "komunikart",
  "milan-lecis",
  "milan-lecic",
  "milan-lečić",
  "ukeab7j-x-kjpn0b-8fg",
  "propr",
  "avokado",
]);

export function slugifyNewsTag(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getBilbordTagUrl(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (normalized === getGhostNewsTagSlug()) {
    return BILBORD_MODA_STIL_URL;
  }
  return `${BILBORD_SITE_URL}/${normalized}/`;
}

/** Ghost ponekad vraća /tag/{slug}/ — na bilbord.rs rubrike su /{slug}/. */
export function normalizeBilbordTagUrl(
  url: string | null | undefined,
  slug: string
): string {
  const canonical = getBilbordTagUrl(slug);
  if (!url?.trim()) return canonical;

  const trimmed = url.trim();
  const normalizedSlug = slug.trim().toLowerCase();
  if (
    trimmed.includes(`/tag/${normalizedSlug}/`) ||
    trimmed.endsWith(`/tag/${normalizedSlug}`)
  ) {
    return canonical;
  }
  return trimmed;
}

export function isPublicGhostTagSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === getGhostNewsTagSlug()) return false;
  if (normalized.startsWith("hash-")) return false;
  if (HIDDEN_TAG_SLUGS.has(normalized)) return false;
  return true;
}

type GhostTagInput = {
  slug: string;
  name?: string;
  url?: string | null;
};

export function mapGhostPublicTags(
  tags: GhostTagInput[] | undefined,
  limit = 3
): NewsArticleTag[] {
  const result: NewsArticleTag[] = [];

  for (const tag of tags ?? []) {
    const slug = tag.slug.trim().toLowerCase();
    if (!isPublicGhostTagSlug(slug)) continue;

    const name = tag.name?.trim() || slug;
    result.push({
      name,
      slug,
      url: normalizeBilbordTagUrl(tag.url, slug),
    });
    if (result.length >= limit) break;
  }

  return result;
}

/** Tag tabovi za prikaz na kartici vesti — Ghost javni tagovi ili fallback kategorija. */
export function getNewsArticleDisplayTags(article: NewsArticle): NewsArticleTag[] {
  if (article.tags?.length) return article.tags;

  const category = article.category?.trim();
  if (!category) return [];

  const slug = slugifyNewsTag(category);
  if (!slug) return [];

  return [
    {
      name: category,
      slug,
      url: getBilbordTagUrl(slug),
    },
  ];
}
