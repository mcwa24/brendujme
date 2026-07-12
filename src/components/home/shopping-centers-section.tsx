"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBrandCount } from "@/lib/format/sr-plural";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { TagChip, tagListClassName } from "@/components/ui/tag-chip";
import { Container } from "@/components/layout/container";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionCtaLink } from "@/components/ui/section-cta-link";
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
            className={tagListClassName("mt-10 overflow-x-auto pb-2 scrollbar-thin")}
            role="tablist"
            aria-label="Tržni centri"
          >
            {centers.map((center) => {
              const isActive = center.slug === active.slug;
              return (
                <TagChip
                  key={center.slug}
                  role="tab"
                  aria-selected={isActive}
                  active={isActive}
                  onClick={() => setActiveSlug(center.slug)}
                  className="max-w-[160px] truncate sm:max-w-none"
                >
                  {center.name.replace(/ Shopping Center| Park/gi, "")}
                </TagChip>
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

        <FadeIn delay={0.16} className="mt-6 flex justify-center">
          <SectionCtaLink href="/shopping-centers">
            Svi tržni centri
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </SectionCtaLink>
        </FadeIn>
      </Container>
    </section>
  );
}
