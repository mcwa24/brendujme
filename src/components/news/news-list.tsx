"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { NewsCard } from "@/components/news/news-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { NEWS_PAGE_SIZE } from "@/lib/news/constants";
import type { NewsArticle } from "@/types";

interface NewsListProps {
  initialArticles: NewsArticle[];
  initialHasMore: boolean;
  initialPage?: number;
}

export function NewsList({
  initialArticles,
  initialHasMore,
  initialPage = 1,
}: NewsListProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/news?page=${nextPage}`);
      const data = (await response.json()) as {
        articles?: NewsArticle[];
        hasMore?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Učitavanje nije uspelo");
      }

      const newArticles = data.articles ?? [];
      setArticles((prev) => {
        const seen = new Set(prev.map((a) => a.slug));
        const merged = [...prev];
        for (const article of newArticles) {
          if (!seen.has(article.slug)) merged.push(article);
        }
        return merged;
      });
      setPage(nextPage);
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Učitavanje nije uspelo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, i) => (
          <FadeIn key={article.slug} delay={(i % 6) * 0.04}>
            <NewsCard article={article} />
          </FadeIn>
        ))}
      </div>

      {error ? (
        <p className="mt-4 text-center text-sm text-destructive">{error}</p>
      ) : null}

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={loading}
            className="min-w-[180px] rounded-full px-8"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Učitavanje…
              </>
            ) : (
              "Učitaj više"
            )}
          </Button>
        </div>
      ) : articles.length > NEWS_PAGE_SIZE ? (
        <p className="mt-8 text-center text-sm text-muted">Sve vesti su učitane.</p>
      ) : null}
    </>
  );
}
