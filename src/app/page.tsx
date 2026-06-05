import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBrandsSection } from "@/components/home/featured-brands-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { ShoppingCentersSection } from "@/components/home/shopping-centers-section";
import { NewsSection } from "@/components/home/news-section";
import { StatsSection } from "@/components/home/stats-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  getAllCategories,
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
    categories,
    shoppingCenters,
    latestNews,
    homePromotions,
  ] = await Promise.all([
    getPopularBrands(),
    getFeaturedBrands(),
    getAllCategories(),
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
      <FeaturedBrandsSection brands={featuredBrands.slice(0, 8)} />
      <NewsSection articles={latestNews} />
      <CategoriesSection categories={categories} />
      <ShoppingCentersSection centers={shoppingCenters.slice(0, 6)} />
      <StatsSection />
      <NewsletterSection />
    </>
  );
}
