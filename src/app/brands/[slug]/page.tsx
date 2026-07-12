import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandPageHeader } from "@/components/brands/brand-page-header";
import { BrandLocationCard } from "@/components/brands/brand-location-card";
import { BrandLocationsSection } from "@/components/brands/brand-locations-section";
import { RetailerSectionTitle } from "@/components/retailers/retailer-section-title";
import { BrandNewsList } from "@/components/news/brand-news-list";
import { expandBrandLocations } from "@/lib/data/expand-brand-locations";
import {
  getAllBrands,
  getBrandBySlug,
  getNewsByBrand,
  getShoppingCenterBySlug,
} from "@/lib/data/repository";
import { getFashionCompanyStoresByBrand } from "@/lib/data/fashion-company";
import { formatLocationCount } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

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

  const [news, centerResults, brandWithStores] = await Promise.all([
    getNewsByBrand(slug),
    Promise.all(brand.shoppingCenterSlugs.map((s) => getShoppingCenterBySlug(s))),
    expandBrandLocations(brand),
  ]);
  const centers = centerResults.filter((c): c is NonNullable<typeof c> =>
    Boolean(c)
  );
  const fcStores = getFashionCompanyStoresByBrand(slug);

  return (
    <PageSection detail>
      <Container>
        <FadeIn when="mount" direction="none">
          <BrandPageHeader brand={brand} />
        </FadeIn>

        <section className="mt-10 md:mt-12">
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
          <section className="mt-16 md:mt-20">
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

        <div className="mt-16 md:mt-20">
          <BrandNewsList articles={news} brandName={brand.name} />
        </div>
      </Container>
    </PageSection>
  );
}
