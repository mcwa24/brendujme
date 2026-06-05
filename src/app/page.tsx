import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBrandsSection } from "@/components/home/featured-brands-section";
import { ShoppingCentersSection } from "@/components/home/shopping-centers-section";
import { NewsSection } from "@/components/home/news-section";
import { StatsSection } from "@/components/home/stats-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  getAllBrands,
  getAllShoppingCenters,
  getFeaturedBrands,
  getHomePromotions,
  getLatestNews,
  getPopularBrands,
} from "@/lib/data/repository";
import { getPromotionBannerImages } from "@/lib/unsplash/promotion-banners";

export default async function HomePage() {
  const [
    popularBrands,
    featuredBrands,
    allBrands,
    shoppingCenters,
    latestNews,
    homePromotions,
  ] = await Promise.all([
    getPopularBrands(),
    getFeaturedBrands(),
    getAllBrands(),
    getAllShoppingCenters(),
    getLatestNews(3),
    getHomePromotions(),
  ]);

  const promotionBanners = await getPromotionBannerImages(homePromotions);

  return (
    <>
      <HeroSection
        popularBrands={popularBrands.slice(0, 6)}
        promotions={homePromotions}
        promotionBanners={promotionBanners}
      />
      <FeaturedBrandsSection brands={featuredBrands} />
      <NewsSection articles={latestNews} />
      <ShoppingCentersSection centers={shoppingCenters.slice(0, 6)} />
      <StatsSection brandCount={allBrands.length} />
      <NewsletterSection />
    </>
  );
}
