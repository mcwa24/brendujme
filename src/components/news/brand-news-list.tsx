import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { NewsCover } from "@/components/news/news-cover";
import { ExternalTagLink, tagListClassName } from "@/components/ui/tag-chip";
import { SectionCtaLink } from "@/components/ui/section-cta-link";
import { getNewsArticleDisplayTags } from "@/lib/news/tags";
import { BILBORD_MODA_STIL_URL, getNewsArticleUrl } from "@/lib/news/urls";
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
        <SectionCtaLink href={BILBORD_MODA_STIL_URL} external>
          Sve vesti
          <ArrowRight className="h-3.5 w-3.5 shrink-0" />
        </SectionCtaLink>
      </FadeIn>

      <div className="s-cards s-cards--list mt-8">
        {articles.map((article, i) => {
          const tags = getNewsArticleDisplayTags(article);
          return (
          <FadeIn key={article.slug} delay={i * 0.04}>
            <article className="s-card s-card--list">
              <div className="s-card-image">
                <a
                  href={getNewsArticleUrl(article)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <NewsCover
                    title={article.title}
                    imageLabel={article.imageLabel}
                    imageUrl={article.imageUrl}
                    className="s-image relative h-full w-full overflow-hidden bg-accent/90"
                    sizes="(max-width: 767px) 100vw, 480px"
                  />
                </a>
              </div>
              <div className="s-card-content">
                {tags.length > 0 ? (
                  <div className={tagListClassName()}>
                    {tags.map((tag) => (
                      <ExternalTagLink key={tag.slug} href={tag.url}>
                        {tag.name}
                      </ExternalTagLink>
                    ))}
                  </div>
                ) : null}
                <h3 className="s-card-title">
                  <a
                    href={getNewsArticleUrl(article)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.title}
                  </a>
                </h3>
                <p className="s-card-excerpt">{article.excerpt}</p>
                <time
                  className="s-byline-date"
                  dateTime={article.publishedAt}
                >
                  {formatDate(article.publishedAt)}
                </time>
              </div>
            </article>
          </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
