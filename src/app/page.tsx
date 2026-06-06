import { HeroSection } from "@/components/home/hero-section";
import { HeroPromotions } from "@/components/home/hero-promotions";
import { FeaturedBrandsSection } from "@/components/home/featured-brands-section";
import { NewsSection } from "@/components/home/news-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  getFeaturedBrands,
  getHomePromotions,
  getHomeStats,
  getLatestNews,
} from "@/lib/data/repository";
import { getPromotionBannerImages } from "@/lib/unsplash/promotion-banners";

export default async function HomePage() {
  const [featuredBrands, latestNews, homePromotions, homeStats] =
    await Promise.all([
      getFeaturedBrands(),
      getLatestNews(3),
      getHomePromotions(),
      getHomeStats(),
    ]);

  const promotionBanners = await getPromotionBannerImages(homePromotions);

  return (
    <>
      <HeroSection stats={homeStats} />
      <HeroPromotions
        promotions={homePromotions}
        bannerImages={promotionBanners}
      />
      <FeaturedBrandsSection brands={featuredBrands} embedded />
      <NewsSection articles={latestNews} />
      <NewsletterSection />
    </>
  );
}
