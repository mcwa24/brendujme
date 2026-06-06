import { HeroSection } from "@/components/home/hero-section";
import { HeroPromotions } from "@/components/home/hero-promotions";
import { FeaturedBrandsSection } from "@/components/home/featured-brands-section";
import { NewsSection } from "@/components/home/news-section";
import {
  getFeaturedBrands,
  getHomePromotions,
  getHomeStats,
  getLatestNews,
} from "@/lib/data/repository";
import { getPromotionBannerImages } from "@/lib/unsplash/promotion-banners";

export const revalidate = 3600;

export default async function HomePage() {
  const homePromotionsPromise = getHomePromotions();
  const [featuredBrands, latestNews, homePromotions, homeStats, promotionBanners] =
    await Promise.all([
      getFeaturedBrands(),
      getLatestNews(3),
      homePromotionsPromise,
      getHomeStats(),
      homePromotionsPromise.then((promotions) =>
        getPromotionBannerImages(promotions)
      ),
    ]);

  return (
    <>
      <HeroSection stats={homeStats} />
      <HeroPromotions
        promotions={homePromotions}
        bannerImages={promotionBanners}
      />
      <FeaturedBrandsSection brands={featuredBrands} embedded />
      <NewsSection articles={latestNews} />
    </>
  );
}
