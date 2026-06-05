import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { NewsList } from "@/components/news/news-list";
import { getNewsPage } from "@/lib/data/repository";
import { NEWS_PAGE_SIZE } from "@/lib/news/constants";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Vesti",
  description: "Najnovije retail vesti, otvaranja brenda i trendovi na tržištu Srbije.",
  path: "/news",
});

export default async function NewsPage() {
  const { articles, hasMore, page } = await getNewsPage(1, NEWS_PAGE_SIZE);

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Vesti</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Retail inteligencija — otvaranja, kolekcije, tržni centri i analize tržišta.
        </p>
      </FadeIn>
      <NewsList
        initialArticles={articles}
        initialHasMore={hasMore}
        initialPage={page}
      />
    </Container>
  );
}
