import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBrandsSection } from "@/components/home/featured-brands-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { ShoppingCentersSection } from "@/components/home/shopping-centers-section";
import { NewsSection } from "@/components/home/news-section";
import { StatsSection } from "@/components/home/stats-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  getAllBrands,
  getAllCategories,
  getAllShoppingCenters,
  getFeaturedBrands,
  getFeaturedNews,
  getLatestNews,
  getPopularBrands,
} from "@/lib/data/repository";

export default async function HomePage() {
  const [
    popularBrands,
    featuredBrands,
    categories,
    shoppingCenters,
    featuredNews,
    latestNews,
    allBrands,
  ] = await Promise.all([
    getPopularBrands(),
    getFeaturedBrands(),
    getAllCategories(),
    getAllShoppingCenters(),
    getFeaturedNews(),
    getLatestNews(4),
    getAllBrands(),
  ]);

  return (
    <>
      <HeroSection popularBrands={popularBrands.slice(0, 6)} />
      <FeaturedBrandsSection brands={featuredBrands.slice(0, 8)} />
      <CategoriesSection categories={categories} />
      <ShoppingCentersSection centers={shoppingCenters.slice(0, 6)} />
      <NewsSection featured={featuredNews} latest={latestNews} />
      <StatsSection brandCount={allBrands.length} />
      <NewsletterSection />
    </>
  );
}
