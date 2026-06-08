import { notFound, redirect } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandLogoGrid } from "@/components/brands/brand-logo-grid";
import { RetailerCatalogMetaBar } from "@/components/retailers/retailer-catalog-meta";
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
    <>
      <section className="bg-card">
        <Container narrow className="py-16 md:py-24">
          <FadeIn when="mount" direction="none">
            <RetailerPageHeader retailer={retailer}>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-muted">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {retailer.city}
                </span>
                {catalogMeta && (
                  <a
                    href={catalogMeta.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent hover:underline"
                  >
                    {catalogMeta.websiteLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted">
                {retailer.description}
              </p>
              {catalogMeta && (
                <RetailerCatalogMetaBar
                  meta={catalogMeta}
                  brandCount={retailer.brandCount}
                />
              )}
            </RetailerPageHeader>
          </FadeIn>
        </Container>
      </section>

      <Container narrow className="space-y-20 py-16 md:py-20">
        {stores.length > 0 && (
          <section id="prodavnice" className="scroll-mt-28">
            <FadeIn>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Prodavnice
              </h2>
              <p className="mt-2 text-muted">
                {formatLocationCount(stores.length)} {retailer.name} u Srbiji —
                izaberite grad.
              </p>
            </FadeIn>
            <RetailerStoresSection
              retailerName={retailer.name}
              retailerSlug={slug}
              stores={stores}
            />
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl font-semibold">Brendovi u ponudi</h2>
          <p className="mt-2 text-sm text-muted">
            {formatModniBrandCount(retailerBrands.length)} u ponudi.
          </p>
          <FadeIn>
            <BrandLogoGrid brands={retailerBrands} className="mt-8" />
          </FadeIn>
        </section>
      </Container>
    </>
  );
}
