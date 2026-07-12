import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { PAGE_TITLE } from "@/components/home/section-spacing";
import { TagLink, tagListClassName } from "@/components/ui/tag-chip";
import { Container } from "@/components/layout/container";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { NewsCover } from "@/components/news/news-cover";
import {
  getAllNews,
  getBrandBySlug,
  getNewsBySlug,
} from "@/lib/data/repository";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getAllNews();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return {};
  return createMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const relatedBrands = (
    await Promise.all((article.brandSlugs ?? []).map((s) => getBrandBySlug(s)))
  ).filter(Boolean);

  return (
    <article>
      <PageSection>
        <Container>
        <FadeIn>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Nazad na vesti
          </Link>
          <span className="mt-8 block text-sm font-medium uppercase tracking-wider text-muted">
            {article.category}
          </span>
          <h1 className={PAGE_TITLE}>{article.title}</h1>
          <div className="mt-6 flex items-center gap-2 text-muted">
            <Calendar className="h-4 w-4" />
            {formatDate(article.publishedAt)}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <NewsCover
            title={article.title}
            imageLabel={article.imageLabel}
            imageUrl={article.imageUrl}
            className="relative mt-10 flex aspect-[21/9] items-center justify-center overflow-hidden rounded-[20px] bg-accent"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </FadeIn>

        <FadeIn delay={0.15} className="mt-12 max-w-3xl">
          {article.contentHtml ? (
            <div
              className="ghost-content prose prose-lg max-w-none text-foreground prose-headings:font-display prose-a:text-accent"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />
          ) : (
            <div className="prose prose-lg">
              <p className="text-xl leading-relaxed text-muted">{article.excerpt}</p>
              <p className="mt-6 leading-relaxed text-foreground">{article.content}</p>
            </div>
          )}
          {article.sourceUrl ? (
            <p className="mt-8 text-sm text-muted">
              Izvor:{" "}
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                Bilbord.rs
              </a>
            </p>
          ) : null}
        </FadeIn>

        {relatedBrands.length > 0 && (
          <FadeIn delay={0.2} className="mt-16">
            <h2 className="font-display text-xl font-semibold">Povezani brendovi</h2>
            <div className={tagListClassName("mt-4")}>
              {relatedBrands.map(
                (brand) =>
                  brand && (
                    <TagLink key={brand.slug} href={`/brands/${brand.slug}`}>
                      {brand.name}
                    </TagLink>
                  )
              )}
            </div>
          </FadeIn>
        )}
      </Container>
      </PageSection>
    </article>
  );
}
