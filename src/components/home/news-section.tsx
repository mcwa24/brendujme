import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import type { NewsArticle } from "@/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface NewsSectionProps {
  featured?: NewsArticle;
  latest: NewsArticle[];
}

export function NewsSection({ featured, latest }: NewsSectionProps) {
  const sideArticles = latest.filter((a) => a.slug !== featured?.slug);

  if (!featured) return null;

  return (
    <section className="py-20">
      <Container narrow>
        <FadeIn className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              Najnovije retail vesti
            </h2>
            <p className="mt-3 text-muted">
              Uvid u otvaranja, kolekcije i trendove na srpskom tržištu.
            </p>
          </div>
          <Link
            href="/news"
            className="hidden items-center gap-1 text-sm font-medium text-accent sm:flex"
          >
            Sve vesti
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <Link href={`/news/${featured.slug}`}>
              <PremiumCard className="group h-full overflow-hidden">
                <div className="flex aspect-[16/10] items-center justify-center bg-accent">
                  <span className="font-display text-3xl text-white/90">
                    {featured.imageLabel}
                  </span>
                </div>
                <div className="p-8">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted">
                    {featured.category}
                  </span>
                  <h3 className="font-display mt-3 text-2xl font-semibold leading-tight group-hover:text-accent md:text-3xl">
                    {featured.title}
                  </h3>
                  <p className="mt-4 text-muted line-clamp-3">{featured.excerpt}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featured.publishedAt)}
                  </div>
                </div>
              </PremiumCard>
            </Link>
          </FadeIn>

          <div className="flex flex-col gap-4">
            {sideArticles.slice(0, 3).map((article, i) => (
              <FadeIn key={article.slug} delay={i * 0.08}>
                <Link href={`/news/${article.slug}`}>
                  <PremiumCard className="group p-6">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted">
                      {article.category}
                    </span>
                    <h3 className="font-display mt-2 text-lg font-semibold leading-snug group-hover:text-accent">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted line-clamp-2">
                      {article.excerpt}
                    </p>
                    <p className="mt-3 text-xs text-muted">
                      {formatDate(article.publishedAt)}
                    </p>
                  </PremiumCard>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
