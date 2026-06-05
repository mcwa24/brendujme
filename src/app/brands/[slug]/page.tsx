import { notFound } from "next/navigation";
import { ExternalLink, Globe } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { RelatedBrandsCarousel } from "@/components/brands/related-brands-carousel";
import { BrandHero } from "@/components/brands/brand-hero";
import { BrandLocationCard } from "@/components/brands/brand-location-card";
import { BrandLocationsSection } from "@/components/brands/brand-locations-section";
import { RetailerSectionTitle } from "@/components/retailers/retailer-section-title";
import { BrandNewsList } from "@/components/news/brand-news-list";
import { hasBrandLogo } from "@/lib/brand-logo-resolve";
import { getCategoryName } from "@/lib/data/categories";
import {
  getAllBrands,
  getBrandBySlug,
  getNewsByBrand,
  getRelatedBrands,
  getShoppingCenterBySlug,
} from "@/lib/data/repository";
import { getFashionCompanyStoresByBrand } from "@/lib/data/fashion-company";
import { formatLocationCount } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const brands = await getAllBrands();
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return createMetadata({
    title: brand.name,
    description: brand.description.slice(0, 160),
    path: `/brands/${brand.slug}`,
  });
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const related = await getRelatedBrands(brand);
  const news = await getNewsByBrand(slug);
  const centers = (
    await Promise.all(
      brand.shoppingCenterSlugs.map((s) => getShoppingCenterBySlug(s))
    )
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const showLogoHero = hasBrandLogo(brand);
  const fcStores = getFashionCompanyStoresByBrand(slug);

  const { expandBrandLocations } = await import(
    "@/lib/data/expand-brand-locations"
  );
  const brandWithStores = await expandBrandLocations(brand);

  return (
    <>
      <section className="border-b border-border bg-card">
        <Container narrow className="py-16 md:py-24">
          <FadeIn className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
            <BrandHero brand={brand} />
            <div className="flex-1">
              {showLogoHero && (
                <>
                  <p className="text-sm font-medium uppercase tracking-wider text-muted">
                    {getCategoryName(brand.category)}
                  </p>
                  <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-6xl">
                    {brand.name}
                  </h1>
                </>
              )}
              {!showLogoHero && (
                <p className="mt-4 text-sm font-medium uppercase tracking-wider text-muted">
                  {getCategoryName(brand.category)}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-6 text-muted">
                <span>{brand.country}</span>
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Veb sajt
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted">
                {brand.description}
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      <Container narrow className="space-y-20 py-16 md:py-20">
        <section>
          <FadeIn>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Gde kupiti
            </h2>
            <p className="mt-2 text-muted">
              Izaberite grad — prikazuju se samo prodavnice u tom gradu.
            </p>
          </FadeIn>
          <BrandLocationsSection
            brandName={brand.name}
            locations={brandWithStores.locations}
            shoppingCenters={centers}
          />
        </section>

        {fcStores.length > 0 && (
          <section>
            <FadeIn>
              <RetailerSectionTitle retailerSlug="fashion-company" />
              <p className="mt-2 text-muted">
                {formatLocationCount(fcStores.length)} u mreži u Srbiji.
              </p>
            </FadeIn>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {fcStores.map((store, i) => (
                <BrandLocationCard
                  key={store.id}
                  storeName={store.storeName}
                  retailerSlug="fashion-company"
                  address={store.address}
                  city={store.cityLabel}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </section>
        )}

        <BrandNewsList articles={news} brandName={brand.name} />

        <FadeIn>
          <RelatedBrandsCarousel brands={related} />
        </FadeIn>
      </Container>
    </>
  );
}
