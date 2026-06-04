import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Globe, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { RelatedBrandsCarousel } from "@/components/brands/related-brands-carousel";
import { BrandHero } from "@/components/brands/brand-hero";
import { hasBrandLogo } from "@/lib/brand-logo-resolve";
import { PremiumCard } from "@/components/ui/premium-card";
import { getCategoryName } from "@/lib/data/categories";
import {
  getAllBrands,
  getBrandBySlug,
  getNewsByBrand,
  getRelatedBrands,
  getShoppingCenterBySlug,
} from "@/lib/data/repository";
import { ShoppingCenterLogo } from "@/components/shopping-centers/shopping-center-logo";
import { getFashionCompanyStoresByBrand } from "@/lib/data/fashion-company";
import { createMetadata } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const related = await getRelatedBrands(brand);
  const news = (await getNewsByBrand(slug)).slice(0, 3);
  const centers = (
    await Promise.all(
      brand.shoppingCenterSlugs.map((s) => getShoppingCenterBySlug(s))
    )
  ).filter(Boolean);
  const showLogoHero = hasBrandLogo(brand);
  const fcStores = getFashionCompanyStoresByBrand(slug);

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
              Prodavnice i lokacije gde je {brand.name} dostupan u Srbiji.
            </p>
          </FadeIn>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {brand.locations.map((loc, i) => (
              <FadeIn key={loc.id} delay={i * 0.05}>
                <PremiumCard className="p-8">
                  <h3 className="font-display text-xl font-semibold">
                    {loc.storeName}
                  </h3>
                  <div className="mt-4 space-y-2 text-muted">
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      {loc.address}
                    </p>
                    <p>{loc.city}</p>
                  </div>
                  <Link
                    href={`/retailers/${loc.retailerSlug}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "mt-6 rounded-full"
                    )}
                  >
                    Pogledaj prodavca
                  </Link>
                </PremiumCard>
              </FadeIn>
            ))}
          </div>
        </section>

        {fcStores.length > 0 && (
          <section>
            <FadeIn>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Fashion Company prodavnice
              </h2>
              <p className="mt-2 text-muted">
                Lokacije prema{" "}
                <Link href="/retailers/fashion-company" className="text-accent hover:underline">
                  Fashion Company
                </Link>{" "}
                mreži ({fcStores.length}).
              </p>
            </FadeIn>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {fcStores.map((store, i) => (
                <FadeIn key={store.id} delay={i * 0.05}>
                  <PremiumCard className="p-6">
                    <h3 className="font-display text-lg font-semibold">
                      {store.storeName}
                    </h3>
                    <div className="mt-3 space-y-1 text-sm text-muted">
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        {store.address}
                      </p>
                      <p>{store.cityLabel}</p>
                    </div>
                  </PremiumCard>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {centers.length > 0 && (
          <section>
            <FadeIn>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Dostupno u tržnim centrima
              </h2>
            </FadeIn>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {centers.map((center, i) =>
                center ? (
                  <FadeIn key={center.slug} delay={i * 0.05}>
                    <Link href={`/shopping-centers/${center.slug}`}>
                      <PremiumCard className="p-6">
                        <ShoppingCenterLogo
                          slug={center.slug}
                          name={center.name}
                          size="lg"
                          className="mb-4"
                        />
                        <h3 className="font-display text-lg font-semibold">
                          {center.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted">{center.city}</p>
                        <p className="mt-3 text-sm text-success">
                          {center.brandCount} brendova u centru
                        </p>
                      </PremiumCard>
                    </Link>
                  </FadeIn>
                ) : null
              )}
            </div>
          </section>
        )}

        <FadeIn>
          <RelatedBrandsCarousel brands={related} />
        </FadeIn>

        {news.length > 0 && (
          <section>
            <FadeIn>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Najnovije vesti o brendu
              </h2>
            </FadeIn>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {news.map((article, i) => (
                <FadeIn key={article.slug} delay={i * 0.06}>
                  <Link href={`/news/${article.slug}`}>
                    <PremiumCard className="group h-full p-6">
                      <span className="text-xs uppercase tracking-wider text-muted">
                        {article.category}
                      </span>
                      <h3 className="font-display mt-3 text-lg font-semibold group-hover:text-accent">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted line-clamp-2">
                        {article.excerpt}
                      </p>
                      <p className="mt-4 text-xs text-muted">
                        {formatDate(article.publishedAt)}
                      </p>
                    </PremiumCard>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
