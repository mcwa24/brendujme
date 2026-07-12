"use client";

import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HeroStats } from "@/components/home/hero-stats";
import { HeroSearchTrigger } from "@/components/search/hero-search-field";
import { RecentSearchPills } from "@/components/search/recent-search-pills";
import {
  HOME_HERO_SECTION_PB,
  PAGE_SECTION_CLASS,
} from "@/components/home/section-spacing";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import type { HomeStats } from "@/lib/data/repository";

interface HeroSectionProps {
  stats: HomeStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className={cn(PAGE_SECTION_CLASS, HOME_HERO_SECTION_PB)}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <PageHeader
              title="Bilbord Shop"
              description="Akcije, ponude i brendovi"
            />
            <FadeIn delay={0.06} when="mount" className="mt-5 max-w-xl md:mt-6">
              <HeroSearchTrigger />
              <RecentSearchPills className="mt-2.5" />
            </FadeIn>
          </div>

          <aside className="hidden md:flex md:items-center md:justify-center md:self-center">
            <HeroStats stats={stats} />
          </aside>
        </div>
      </Container>
    </section>
  );
}
