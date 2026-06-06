import { BILBORD_SITE_URL } from "@/lib/bilbord-footer";
import type { NewsArticle } from "@/types";

export const BILBORD_MODA_STIL_URL = `${BILBORD_SITE_URL}/moda-stil/`;

/** URL članka na bilbord.rs (Ghost sourceUrl ili slug fallback). */
export function getNewsArticleUrl(article: NewsArticle): string {
  const fromSource = article.sourceUrl?.trim();
  if (fromSource) return fromSource;
  return `${BILBORD_SITE_URL}/${article.slug}/`;
}
