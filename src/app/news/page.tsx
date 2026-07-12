import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { NewsList } from "@/components/news/news-list";
import { PAGE_CONTENT_MT } from "@/components/home/section-spacing";
import { getNewsPage } from "@/lib/data/repository";
import { NEWS_PAGE_SIZE } from "@/lib/news/constants";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Vesti",
  description: "Najnovije vesti, kolekcije i trendovi sa globalne modne scene.",
  path: "/news",
});

export default async function NewsPage() {
  const { articles, hasMore, page } = await getNewsPage(1, NEWS_PAGE_SIZE);

  return (
    <PageSection>
      <Container>
        <PageHeader
          title="Vesti"
          description="Kolekcije, kampanje, pokazivanja i trendovi sa globalne modne scene."
        />
        <FadeIn delay={0.06} className={PAGE_CONTENT_MT}>
          <NewsList
            initialArticles={articles}
            initialHasMore={hasMore}
            initialPage={page}
          />
        </FadeIn>
      </Container>
    </PageSection>
  );
}
