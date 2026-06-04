import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandCard } from "@/components/brands/brand-card";
import { ShoppingCenterLogo } from "@/components/shopping-centers/shopping-center-logo";
import {
  getAllShoppingCenters,
  getBrandBySlug,
  getShoppingCenterBySlug,
} from "@/lib/data/repository";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

  const centerBrands = (
    await Promise.all(center.brandSlugs.map((s) => getBrandBySlug(s)))
  ).filter(Boolean);

  return (
    <>
      <section className="border-b border-border bg-card">
        <Container narrow className="py-16">
          <FadeIn className="flex flex-col gap-6 md:flex-row md:items-center">
            <ShoppingCenterLogo
              slug={center.slug}
              name={center.name}
              size="xl"
              className="h-24 w-24 rounded-[20px] p-3"
              logoUrl={center.logoUrl}
              logoStoragePath={center.logoStoragePath}
            />
            <div>
              <h1 className="font-display text-4xl font-semibold md:text-5xl">
                {center.name}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-muted">
                <MapPin className="h-4 w-4" />
                {center.city}
              </div>
              <p className="mt-4 max-w-2xl text-muted">{center.description}</p>
              <p className="mt-4 font-medium text-success">
                {center.brandCount}+ brendova
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      <Container narrow className="py-16">
        <h2 className="font-display text-2xl font-semibold">Brendovi u centru</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {centerBrands.map(
            (brand, i) =>
              brand && (
                <FadeIn key={brand.slug} delay={i * 0.04}>
                  <BrandCard brand={brand} variant="compact" />
                </FadeIn>
              )
          )}
        </div>
      </Container>
    </>
  );
}
