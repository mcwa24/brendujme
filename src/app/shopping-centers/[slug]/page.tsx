import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandLogoGrid } from "@/components/brands/brand-logo-grid";
import { ShoppingCenterPageHeader } from "@/components/shopping-centers/shopping-center-page-header";
import {
  getAllShoppingCenters,
  getBrandsBySlugs,
  getShoppingCenterBySlug,
} from "@/lib/data/repository";
import { formatBrandCountPlus, formatModniBrandCount } from "@/lib/format/sr-plural";
import { googleMapsUrl } from "@/lib/maps/google-maps-url";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const centers = await getAllShoppingCenters();
  return centers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const center = await getShoppingCenterBySlug(slug);
  if (!center) return {};
  return createMetadata({
    title: center.name,
    description: center.description,
    path: `/shopping-centers/${center.slug}`,
  });
}

export default async function ShoppingCenterPage({ params }: PageProps) {
  const { slug } = await params;
  const center = await getShoppingCenterBySlug(slug);
  if (!center) notFound();

  const centerBrands = await getBrandsBySlugs(center.brandSlugs);

  const mapsHref = center.address
    ? googleMapsUrl({
        address: center.address,
        city: center.city,
        latitude: center.latitude,
        longitude: center.longitude,
      })
    : null;

  const brands = centerBrands.filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <PageSection detail>
      <Container>
        <FadeIn when="mount" direction="none">
          <ShoppingCenterPageHeader
            name={center.name}
            city={center.city}
            address={center.address}
            description={center.description}
            mapsHref={mapsHref}
            brandCountLabel={formatBrandCountPlus(center.brandCount)}
          />
        </FadeIn>

        <section className="mt-16 md:mt-20">
          <FadeIn>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Brendovi u centru
            </h2>
            <p className="mt-2 text-muted">
              {formatModniBrandCount(brands.length)} u ponudi.
            </p>
          </FadeIn>
          {brands.length > 0 && (
            <div className="s-list-tab s-list-tab--panel mt-10">
              <BrandLogoGrid brands={brands} />
            </div>
          )}
        </section>
      </Container>
    </PageSection>
  );
}
