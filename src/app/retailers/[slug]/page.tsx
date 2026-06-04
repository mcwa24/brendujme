import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandCard } from "@/components/brands/brand-card";
import { retailers, getRetailerBySlug } from "@/lib/data/retailers";
import { getBrandBySlug } from "@/lib/data/brands";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return retailers.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const retailer = getRetailerBySlug(slug);
  if (!retailer) return {};
  return createMetadata({
    title: retailer.name,
    description: retailer.description,
    path: `/retailers/${retailer.slug}`,
  });
}

export default async function RetailerPage({ params }: PageProps) {
  const { slug } = await params;
  const retailer = getRetailerBySlug(slug);
  if (!retailer) notFound();

  const retailerBrands = retailer.brandSlugs
    .map((s) => getBrandBySlug(s))
    .filter(Boolean);

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Prodavac
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold md:text-5xl">
          {retailer.name}
        </h1>
        <div className="mt-4 flex items-center gap-2 text-muted">
          <MapPin className="h-4 w-4" />
          {retailer.city}
        </div>
        <p className="mt-6 max-w-2xl text-lg text-muted">{retailer.description}</p>
      </FadeIn>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">Brendovi u ponudi</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {retailerBrands.map(
            (brand, i) =>
              brand && (
                <FadeIn key={brand.slug} delay={i * 0.04}>
                  <BrandCard brand={brand} variant="compact" />
                </FadeIn>
              )
          )}
        </div>
      </section>
    </Container>
  );
}
