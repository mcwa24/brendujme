import { HeroSection } from "@/components/home/hero-section";
import { HeroPromotions } from "@/components/home/hero-promotions";
import { FeaturedBrandsSection } from "@/components/home/featured-brands-section";
import { NewsSection } from "@/components/home/news-section";
import { ExpiringSoonPromotionBanner } from "@/components/home/expiring-soon-promotion-banner";
import { FeaturedShoppingCenterBanner } from "@/components/home/featured-shopping-center-banner";
import { NewsletterBanner } from "@/components/home/newsletter-banner";
import { PopularRetailersSection } from "@/components/home/popular-retailers-section";
import {
  getFeaturedBrands,
  getHomePromotions,
  getHomeStats,
  getLatestNews,
  getRetailerBySlug,
  getShoppingCenterBySlug,
} from "@/lib/data/repository";
import { HOME_FEATURED_SHOPPING_CENTER_SLUGS } from "@/lib/data/home-featured-shopping-center";
import { HOME_POPULAR_RETAILER_SLUGS } from "@/lib/data/home-popular-retailers";
import { pickExpiringSoonPromotion } from "@/lib/data/promotions";
import { getPromotionBannerImages } from "@/lib/unsplash/promotion-banners";

export const revalidate = 3600;

export default async function HomePage() {
  const homePromotionsPromise = getHomePromotions();
  const popularRetailersPromise = Promise.all(
    HOME_POPULAR_RETAILER_SLUGS.map((slug) => getRetailerBySlug(slug))
  ).then((rows) => rows.filter((r): r is NonNullable<typeof r> => Boolean(r)));

  const expiringSoonPromise = homePromotionsPromise.then((promotions) =>
    pickExpiringSoonPromotion(promotions)
  );

  const featuredShoppingCentersPromise = Promise.all(
    HOME_FEATURED_SHOPPING_CENTER_SLUGS.map((slug) => getShoppingCenterBySlug(slug))
  ).then((rows) => rows.filter((r): r is NonNullable<typeof r> => Boolean(r)));

  const [
    featuredBrands,
    latestNews,
    homePromotions,
    homeStats,
    promotionBanners,
    popularRetailers,
    expiringSoonPromotion,
    expiringSoonBanner,
    featuredShoppingCenters,
  ] = await Promise.all([
    getFeaturedBrands(),
    getLatestNews(3),
    homePromotionsPromise,
    getHomeStats(),
    homePromotionsPromise.then((promotions) =>
      getPromotionBannerImages(promotions)
    ),
    popularRetailersPromise,
    expiringSoonPromise,
    expiringSoonPromise.then((promotion) =>
      promotion ? getPromotionBannerImages([promotion]).then((b) => b[0]) : null
    ),
    featuredShoppingCentersPromise,
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
      {expiringSoonPromotion ? (
        <ExpiringSoonPromotionBanner
          promotion={expiringSoonPromotion}
          bannerImage={expiringSoonBanner ?? undefined}
        />
      ) : null}
      <PopularRetailersSection retailers={popularRetailers} />
      <FeaturedShoppingCenterBanner centers={featuredShoppingCenters} />
      <NewsletterBanner />
    </>
  );
}
