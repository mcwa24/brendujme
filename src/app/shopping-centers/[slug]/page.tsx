import { notFound } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { googleMapsUrl } from "@/lib/maps/google-maps-url";
import { PAGE_TITLE } from "@/components/home/section-spacing";
import { Container } from "@/components/layout/container";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandLogoGrid } from "@/components/brands/brand-logo-grid";
import {
  getAllShoppingCenters,
  getBrandsBySlugs,
  getShoppingCenterBySlug,
} from "@/lib/data/repository";
import { formatBrandCountPlus } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

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
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Tržni centar
          </p>
          <h1 className={cn(PAGE_TITLE, "mt-2")}>{center.name}</h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-muted">
            {center.address ? (
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {center.address}
                  <span className="text-muted"> · {center.city}</span>
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {center.city}
              </span>
            )}
            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-accent hover:underline"
              >
                Google Maps
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <p className="mt-4 max-w-2xl text-muted">{center.description}</p>
          <p className="mt-4 font-medium text-success">
            {formatBrandCountPlus(center.brandCount)}
          </p>
        </FadeIn>

        <div className="mt-16 md:mt-20">
          <h2 className="font-display text-2xl font-semibold">Brendovi u centru</h2>
          <FadeIn>
            <BrandLogoGrid brands={brands} className="mt-8" />
          </FadeIn>
        </div>
      </Container>
    </PageSection>
  );
}
