"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBrandCount } from "@/lib/format/sr-plural";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";
import type { ShoppingCenter } from "@/types";

interface ShoppingCentersSectionProps {
  centers: ShoppingCenter[];
}

export function ShoppingCentersSection({ centers }: ShoppingCentersSectionProps) {
  const [activeSlug, setActiveSlug] = useState(centers[0]?.slug ?? "");
  const active =
    centers.find((c) => c.slug === activeSlug) ?? centers[0];

  if (!active) return null;

  return (
    <section className={HOME_SECTION_PY}>
      <Container narrow>
        <FadeIn>
          <h2 className={HOME_SECTION_TITLE}>
            Popularni tržni centri
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Gde kupiti modne brendove — najveći tržni centri u Srbiji.
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="mt-10">
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
            role="tablist"
            aria-label="Tržni centri"
          >
            {centers.map((center) => {
              const isActive = center.slug === active.slug;
              return (
                <button
                  key={center.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSlug(center.slug)}
                  className={cn(
                    "shrink-0 rounded-none border px-3 py-2 text-left transition-all sm:px-4 sm:py-2.5",
                    isActive
                      ? "border-accent bg-card shadow-[var(--shadow-card)]"
                      : "border-border bg-transparent text-muted hover:border-accent/30 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "max-w-[120px] truncate text-sm font-medium sm:max-w-none",
                      isActive ? "text-foreground" : ""
                    )}
                  >
                    {center.name.replace(/ Shopping Center| Park/gi, "")}
                  </span>
                </button>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={0.12} className="mt-8">
          <Link href={`/shopping-centers/${active.slug}`} className="block">
            <PremiumCard className="overflow-hidden transition-shadow hover:shadow-[0_8px_32px_rgb(0_0_0/0.08)]">
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl font-semibold md:text-3xl">
                      {active.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {active.city}
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted" />
                </div>
                <p className="mt-4 line-clamp-2 text-muted">
                  {active.description}
                </p>
                <p className="mt-4 text-sm font-medium text-success">
                  {formatBrandCount(active.brandCount)} u ponudi
                </p>
              </div>
            </PremiumCard>
          </Link>
        </FadeIn>

        <FadeIn delay={0.16} className="mt-6 text-center">
          <Link
            href="/shopping-centers"
            className="text-sm font-medium text-accent hover:underline"
          >
            Svi tržni centri →
          </Link>
        </FadeIn>
      </Container>
    </section>
  );
}
