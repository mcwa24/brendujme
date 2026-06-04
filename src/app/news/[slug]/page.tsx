import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { newsArticles, getNewsBySlug } from "@/lib/data/news";
import { getBrandBySlug } from "@/lib/data/brands";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return newsArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
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
  const article = getNewsBySlug(slug);
  if (!article) notFound();

  const relatedBrands = (article.brandSlugs ?? [])
    .map((s) => getBrandBySlug(s))
    .filter(Boolean);

  return (
    <article>
      <Container narrow className="py-12 md:py-16">
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
          <h1 className="font-display mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">
            {article.title}
          </h1>
          <div className="mt-6 flex items-center gap-2 text-muted">
            <Calendar className="h-4 w-4" />
            {formatDate(article.publishedAt)}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-10 flex aspect-[21/9] items-center justify-center rounded-[20px] bg-accent">
            <span className="font-display text-3xl text-white/90">
              {article.imageLabel}
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="prose prose-lg mt-12 max-w-3xl">
          <p className="text-xl text-muted leading-relaxed">{article.excerpt}</p>
          <p className="mt-6 text-foreground leading-relaxed">{article.content}</p>
        </FadeIn>

        {relatedBrands.length > 0 && (
          <FadeIn delay={0.2} className="mt-16">
            <h2 className="font-display text-xl font-semibold">Povezani brendovi</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedBrands.map(
                (brand) =>
                  brand && (
                    <Link
                      key={brand.slug}
                      href={`/brands/${brand.slug}`}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
                    >
                      {brand.name}
                    </Link>
                  )
              )}
            </div>
          </FadeIn>
        )}
      </Container>
    </article>
  );
}
