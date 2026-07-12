import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandLogoGrid } from "@/components/brands/brand-logo-grid";
import { RetailerPageHeader } from "@/components/retailers/retailer-page-header";
import { RetailerStoresSection } from "@/components/retailers/retailer-stores-section";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import {
  getAllRetailers,
  getRetailerBySlug,
  getRetailerPageBrands,
  getRetailerStores,
} from "@/lib/data/repository";
import { isImportedRetailerSlug } from "@/lib/data/imported-retailers";
import { formatLocationCount, formatModniBrandCount } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const retailers = await getAllRetailers();
  const slugs = new Set(retailers.map((r) => r.slug));
  slugs.add("fashion-company");
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const retailer = await getRetailerBySlug(slug);
  if (!retailer) return {};
  return createMetadata({
    title: retailer.name,
    description: retailer.description,
    path: `/retailers/${retailer.slug}`,
  });
}

export default async function RetailerPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "fashion-friends") {
    redirect("/retailers/fashion-company");
  }
  const retailer = await getRetailerBySlug(slug);
  if (!retailer) notFound();

  const retailerBrands = await getRetailerPageBrands(slug);
  const stores = isImportedRetailerSlug(slug)
    ? await getRetailerStores(slug)
    : [];
  const catalogMeta = getRetailerCatalogMeta(slug);

  return (
    <PageSection detail>
      <Container>
        <FadeIn when="mount" direction="none">
          <RetailerPageHeader
            retailer={retailer}
            website={catalogMeta?.website}
          />
        </FadeIn>

        {stores.length > 0 && (
          <section className="mt-10 md:mt-12">
            <FadeIn>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Gde kupiti
              </h2>
              <p className="mt-2 text-muted">
                {formatLocationCount(stores.length)} {retailer.name} u Srbiji
                — izaberite grad.
              </p>
            </FadeIn>
            <RetailerStoresSection
              retailerName={retailer.name}
              stores={stores}
            />
          </section>
        )}

        <section className="mt-16 md:mt-20">
          <FadeIn>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Brendovi u ponudi
            </h2>
            <p className="mt-2 text-muted">
              {formatModniBrandCount(retailerBrands.length)} u ponudi.
            </p>
          </FadeIn>
          {retailerBrands.length > 0 && (
            <div className="s-list-tab s-list-tab--panel mt-10">
              <BrandLogoGrid brands={retailerBrands} />
            </div>
          )}
        </section>
      </Container>
    </PageSection>
  );
}
