import Link from "next/link";
import { Calendar } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { getLatestNews } from "@/lib/data/news";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Vesti",
  description: "Najnovije retail vesti, otvaranja brendova i trendovi na tržištu Srbije.",
  path: "/news",
});

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsPage() {
  const articles = getLatestNews(20);

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Vesti</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Retail inteligencija — otvaranja, kolekcije, tržni centri i analize tržišta.
        </p>
      </FadeIn>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, i) => (
          <FadeIn key={article.slug} delay={(i % 6) * 0.04}>
            <Link href={`/news/${article.slug}`}>
              <PremiumCard className="group h-full overflow-hidden">
                <div className="flex aspect-[16/9] items-center justify-center bg-accent/90">
                  <span className="font-display text-lg text-white/90">
                    {article.imageLabel}
                  </span>
                </div>
                <div className="p-6">
                  <span className="text-xs uppercase tracking-wider text-muted">
                    {article.category}
                  </span>
                  <h2 className="font-display mt-2 text-lg font-semibold group-hover:text-accent">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>
              </PremiumCard>
            </Link>
          </FadeIn>
        ))}
      </div>
    </Container>
  );
}
