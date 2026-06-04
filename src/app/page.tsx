import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBrandsSection } from "@/components/home/featured-brands-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { ShoppingCentersSection } from "@/components/home/shopping-centers-section";
import { NewsSection } from "@/components/home/news-section";
import { StatsSection } from "@/components/home/stats-section";
import { NewsletterSection } from "@/components/home/newsletter-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedBrandsSection />
      <CategoriesSection />
      <ShoppingCentersSection />
      <NewsSection />
      <StatsSection />
      <NewsletterSection />
    </>
  );
}
