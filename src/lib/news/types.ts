import type { NewsArticle } from "@/types";

export interface NewsPageResult {
  articles: NewsArticle[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  total?: number;
}
