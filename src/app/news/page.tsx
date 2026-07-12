import {
  PAGE_LEAD,
  PAGE_TITLE,
} from "@/components/home/section-spacing";
import { Container } from "@/components/layout/container";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { NewsList } from "@/components/news/news-list";
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
        <FadeIn when="mount" direction="none">
          <h1 className={PAGE_TITLE}>Vesti</h1>
          <p className={PAGE_LEAD}>
            Kolekcije, kampanje, pokazivanja i trendovi sa globalne modne scene.
          </p>
        </FadeIn>
        <NewsList
          initialArticles={articles}
          initialHasMore={hasMore}
          initialPage={page}
        />
      </Container>
    </PageSection>
  );
}
