import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { RetailerLogo } from "@/components/retailers/retailer-logo";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import { formatModniBrandCount, formatStoreCount } from "@/lib/format/sr-plural";
import type { Retailer } from "@/types";

interface RetailersListProps {
  retailers: Retailer[];
}

function retailerStats(retailer: Retailer): string {
  const meta = getRetailerCatalogMeta(retailer.slug);
  if (meta) {
    return `${formatModniBrandCount(retailer.brandCount)} · ${formatStoreCount(meta.storeCount)}`;
  }
  return formatModniBrandCount(retailer.brandCount);
}

export function RetailersList({ retailers }: RetailersListProps) {
  return (
    <ul className="s-list-tabs">
      {retailers.map((retailer, i) => (
        <li key={retailer.slug}>
          <FadeIn delay={Math.min(i * 0.03, 0.24)}>
            <Link
              href={`/retailers/${retailer.slug}`}
              prefetch={false}
              className="s-list-tab s-list-tab--row group"
            >
              <div className="flex w-[5.5rem] shrink-0 items-center justify-center md:w-32">
                <RetailerLogo
                  slug={retailer.slug}
                  name={retailer.name}
                  logoUrl={retailer.logoUrl}
                  size="xl"
                  variant="bare"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-2xl">
                      {retailer.name}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted">
                      {retailer.city}
                      <span aria-hidden="true"> · </span>
                      {retailerStats(retailer)}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="mt-1 h-5 w-5 shrink-0 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                  {retailer.description}
                </p>
              </div>
            </Link>
          </FadeIn>
        </li>
      ))}
    </ul>
  );
}
