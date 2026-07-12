import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { TagLink, tagListClassName } from "@/components/ui/tag-chip";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { NewsCover } from "@/components/news/news-cover";
import { PAGE_CONTENT_MT } from "@/components/home/section-spacing";
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
          <PageHeader title={article.title} />

          <FadeIn delay={0.04} className={PAGE_CONTENT_MT}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="font-medium uppercase tracking-wider">
                {article.category}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <time dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
              </span>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Nazad na vesti
              </Link>
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
