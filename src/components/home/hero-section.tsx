"use client";

import { Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HeroStats } from "@/components/home/hero-stats";
import { RecentSearchPills } from "@/components/search/recent-search-pills";
import { useSearch } from "@/components/search/search-provider";
import { HOME_HERO_SECTION_PY } from "@/components/home/section-spacing";
import type { HomeStats } from "@/lib/data/repository";

interface HeroSectionProps {
  stats: HomeStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const { setOpen } = useSearch();

  return (
    <section className={HOME_HERO_SECTION_PY}>
      <Container narrow>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14 xl:gap-20">
          <div className="flex min-w-0 flex-col justify-center">
            <FadeIn>
              <h1 className="font-display max-w-4xl text-[1.75rem] font-semibold leading-[1.18] text-foreground sm:text-4xl sm:leading-[1.12] md:text-6xl md:leading-[1.05] lg:text-[4.5rem] lg:leading-[1.02]">
                Gde kupiti modne brendove
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:mt-6 md:text-lg lg:text-xl">
                Patike, streetwear i premium u Srbiji — prodavci, lokacije i
                aktuelne akcije.
              </p>
            </FadeIn>
            <FadeIn delay={0.2} when="mount" className="mt-10">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center gap-4 rounded-none border border-border bg-card px-6 py-5 text-left shadow-[var(--shadow-card)] transition-all hover:border-accent/20 hover:shadow-[0_4px_24px_rgb(0_0_0/0.06)]"
              >
                <Search className="h-5 w-5 shrink-0 text-muted" />
                <span className="text-muted">
                  Pretražite modne brendove ili prodavce...
                </span>
                <kbd className="ml-auto hidden rounded-none border border-border bg-background px-2.5 py-1 text-xs text-muted md:inline">
                  ⌘K
                </kbd>
              </button>
              <RecentSearchPills className="mt-3" />
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
