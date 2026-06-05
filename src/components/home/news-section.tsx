import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { NewsCard } from "@/components/news/news-card";
import { HOME_SECTION_PY } from "@/components/home/section-spacing";
import type { NewsArticle } from "@/types";

interface NewsSectionProps {
  articles: NewsArticle[];
}

export function NewsSection({ articles }: NewsSectionProps) {
  if (!articles.length) return null;

  return (
    <section className={HOME_SECTION_PY}>
      <Container narrow>
        <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              Iz sveta mode
            </h2>
            <p className="mt-3 text-muted">
              Kolekcije, kampanje i trendovi sa globalne modne scene.
            </p>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent"
          >
            Sve vesti
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <FadeIn key={article.slug} delay={i * 0.06}>
              <NewsCard article={article} showCategory={false} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
