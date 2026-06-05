import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { NewsCover } from "@/components/news/news-cover";
import type { NewsArticle } from "@/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface BrandNewsListProps {
  articles: NewsArticle[];
  brandName: string;
}

export function BrandNewsList({ articles, brandName }: BrandNewsListProps) {
  if (!articles.length) return null;

  return (
    <section>
      <FadeIn className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Vesti o brendu
          </h2>
          <p className="mt-2 text-muted">
            Najnovije iz moda & stil sekcije vezano za {brandName}.
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

      <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {articles.map((article, i) => (
          <li key={article.slug}>
            <FadeIn delay={i * 0.04}>
              <Link
                href={`/news/${article.slug}`}
                className="group flex gap-4 p-4 transition-colors hover:bg-background sm:gap-5 sm:p-5"
              >
                <div className="relative h-[72px] w-[104px] shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-28">
                  <NewsCover
                    title={article.title}
                    imageLabel={article.imageLabel}
                    imageUrl={article.imageUrl}
                    className="relative h-full w-full"
                    sizes="112px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold leading-snug group-hover:text-accent sm:text-lg">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                    {article.excerpt}
                  </p>
                  <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {formatDate(article.publishedAt)}
                  </p>
                </div>
              </Link>
            </FadeIn>
          </li>
        ))}
      </ul>
    </section>
  );
}
