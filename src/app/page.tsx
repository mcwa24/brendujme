import { HeroSection } from "@/components/home/hero-section";
import { HeroPromotions } from "@/components/home/hero-promotions";
import { FeaturedBrandsSection } from "@/components/home/featured-brands-section";
import { ShoppingCentersSection } from "@/components/home/shopping-centers-section";
import { NewsSection } from "@/components/home/news-section";
import { StatsSection } from "@/components/home/stats-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  getAllShoppingCenters,
  getFeaturedBrands,
  getHomePromotions,
  getHomeStats,
  getLatestNews,
  getPopularBrands,
} from "@/lib/data/repository";
import { getPromotionBannerImages } from "@/lib/unsplash/promotion-banners";

export default async function HomePage() {
  const [
    popularBrands,
    featuredBrands,
    shoppingCenters,
    latestNews,
    homePromotions,
    homeStats,
  ] = await Promise.all([
    getPopularBrands(),
    getFeaturedBrands(),
    getAllShoppingCenters(),
    getLatestNews(3),
    getHomePromotions(),
    getHomeStats(),
  ]);

  const promotionBanners = await getPromotionBannerImages(homePromotions);

  return (
    <>
      <HeroSection popularBrands={popularBrands.slice(0, 6)} />
      <HeroPromotions
        promotions={homePromotions}
        bannerImages={promotionBanners}
      />
      <FeaturedBrandsSection brands={featuredBrands} />
      <NewsSection articles={latestNews} />
      <ShoppingCentersSection centers={shoppingCenters.slice(0, 6)} />
      <StatsSection stats={homeStats} />
      <NewsletterSection />
    </>
  );
}
