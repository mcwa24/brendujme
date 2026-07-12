"use client";

import { Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HeroStats } from "@/components/home/hero-stats";
import { RecentSearchPills } from "@/components/search/recent-search-pills";
import { useSearch } from "@/components/search/search-provider";
import { HOME_HERO_SECTION_PY, PAGE_TITLE } from "@/components/home/section-spacing";
import type { HomeStats } from "@/lib/data/repository";

interface HeroSectionProps {
  stats: HomeStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const { setOpen } = useSearch();

  return (
    <section className={HOME_HERO_SECTION_PY}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <FadeIn>
              <h1 className={PAGE_TITLE}>
                Akcije, ponude i brendovi
              </h1>
            </FadeIn>
            <FadeIn delay={0.06}>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted md:mt-4 md:text-[1.0625rem]">
                Patike, streetwear i premium u Srbiji — gde kupiti i šta je na
                popustu.
              </p>
            </FadeIn>
            <FadeIn delay={0.12} when="mount" className="mt-6 md:mt-7">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="bilbord-field flex w-full items-center gap-3 px-4 py-3.5 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[0_4px_24px_rgb(0_0_0/0.06)] md:max-w-xl"
              >
                <Search className="h-5 w-5 shrink-0 text-muted" />
                <span className="text-muted-foreground">
                  Pretražite modne brendove ili prodavce...
                </span>
                <kbd className="ml-auto hidden rounded-full bg-[var(--color-chip-bg)] px-2 py-0.5 text-[11px] text-muted md:inline">
                  ⌘K
                </kbd>
              </button>
              <RecentSearchPills className="mt-2.5" />
            </FadeIn>
          </div>

          <aside className="hidden w-full items-center justify-center md:flex">
            <HeroStats stats={stats} />
          </aside>
        </div>
      </Container>
    </section>
  );
}
