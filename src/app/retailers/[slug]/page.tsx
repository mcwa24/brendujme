import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandCard } from "@/components/brands/brand-card";
import { FashionCompanyDetail } from "@/components/retailers/fashion-company-detail";
import {
  getAllRetailers,
  getBrandBySlug,
  getRetailerBySlug,
} from "@/lib/data/repository";
import { fashionCompanyMeta } from "@/lib/data/fashion-company";
import { createMetadata } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const retailers = await getAllRetailers();
  return retailers.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const retailer = await getRetailerBySlug(slug);
  if (!retailer) return {};
  const description =
    slug === "fashion-company"
      ? `Fashion Company zastupa ${fashionCompanyMeta.brandCount}+ brendova sa ${fashionCompanyMeta.storeCount} dokumentovanih prodajnih mesta u Srbiji.`
      : retailer.description;
  return createMetadata({
    title: retailer.name,
    description,
    path: `/retailers/${retailer.slug}`,
  });
}

export default async function RetailerPage({ params }: PageProps) {
  const { slug } = await params;
  const retailer = await getRetailerBySlug(slug);
  if (!retailer) notFound();

  const isFashionCompany = slug === "fashion-company";

  const retailerBrands = (
    await Promise.all(retailer.brandSlugs.map((s) => getBrandBySlug(s)))
  ).filter(Boolean);

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Prodavac
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold md:text-5xl">
          {retailer.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-muted">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {retailer.city}
            {isFashionCompany && " · Region"}
          </span>
          {isFashionCompany && (
            <a
              href={fashionCompanyMeta.website}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "inline-flex gap-1.5 rounded-full"
              )}
            >
              fashioncompany.rs
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <p className="mt-6 max-w-3xl text-lg text-muted">
          {isFashionCompany
            ? "Najveći distributer međunarodnih modnih brendova u regionu. Više od 40 godina prisustva na tržištu Srbije sa mono-brand prodavnicama, Fashion&Friends multibrand konceptom i premium lokacijama u tržnim centrima i centrima gradova."
            : retailer.description}
        </p>
      </FadeIn>

      {isFashionCompany ? (
        <div className="mt-16">
          <FashionCompanyDetail />
        </div>
      ) : (
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
      )}
    </Container>
  );
}
