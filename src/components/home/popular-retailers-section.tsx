import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { RetailerLogo } from "@/components/retailers/retailer-logo";
import { PremiumCard } from "@/components/ui/premium-card";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import { formatModniBrandCount, formatStoreCount } from "@/lib/format/sr-plural";
import type { Retailer } from "@/types";

interface PopularRetailersSectionProps {
  retailers: Retailer[];
}

function retailerStats(retailer: Retailer): string {
  const meta = getRetailerCatalogMeta(retailer.slug);
  if (meta) {
    return `${formatModniBrandCount(retailer.brandCount)} · ${formatStoreCount(meta.storeCount)}`;
  }
  return formatModniBrandCount(retailer.brandCount);
}

export function PopularRetailersSection({ retailers }: PopularRetailersSectionProps) {
  if (!retailers.length) return null;

  return (
    <section className={HOME_SECTION_PY}>
      <Container narrow>
        <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={HOME_SECTION_TITLE}>Najtraženiji prodavci</h2>
            <p className="mt-3 max-w-xl text-muted">
              Mreže koje najčešće tražite — sneaker i sport u Srbiji.
            </p>
          </div>
          <Link
            href="/retailers"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Svi prodavci
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {retailers.map((retailer, i) => (
            <FadeIn key={retailer.slug} delay={i * 0.06}>
              <Link
                href={`/retailers/${retailer.slug}`}
                prefetch={false}
                className="group block h-full"
              >
                <PremiumCard className="flex h-full flex-col p-6 md:p-8">
                  <div className="flex items-start justify-between gap-3">
                    <RetailerLogo
                      slug={retailer.slug}
                      name={retailer.name}
                      logoUrl={retailer.logoUrl}
                      size="xl"
                      variant="bare"
                    />
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
                    {retailer.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{retailerStats(retailer)}</p>
                  <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                    {retailer.description}
                  </p>
                </PremiumCard>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
