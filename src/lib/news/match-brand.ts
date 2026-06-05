import type { Brand, NewsArticle } from "@/types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function articleMentionsBrand(
  article: NewsArticle,
  brand: Pick<Brand, "slug" | "name">
): boolean {
  if (article.brandSlugs?.includes(brand.slug)) return true;

  const pattern = new RegExp(`\\b${escapeRegExp(brand.name)}\\b`, "i");
  const haystack = `${article.title} ${article.excerpt} ${article.content ?? ""}`;
  return pattern.test(haystack);
}

export function filterNewsByBrand(
  articles: NewsArticle[],
  brand: Pick<Brand, "slug" | "name">
): NewsArticle[] {
  return articles
    .filter((article) => articleMentionsBrand(article, brand))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
