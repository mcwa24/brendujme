"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { useSearch } from "@/components/search/search-provider";
import { getPopularBrands } from "@/lib/data/brands";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const { setOpen } = useSearch();
  const popularBrands = getPopularBrands().slice(0, 6);

  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-28">
      <Container narrow>
        <FadeIn>
          <h1 className="font-display max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[72px]">
            Otkrijte brendove dostupne u Srbiji
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg text-muted md:text-xl">
            Pronađite modu, lepotu, lifestyle i luksuzne brendove, saznajte gde
            se prodaju i istražite najnovije retail vesti.
          </p>
        </FadeIn>
        <FadeIn delay={0.2} className="mt-10">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-4 rounded-[20px] border border-border bg-card px-6 py-5 text-left shadow-[var(--shadow-card)] transition-all hover:border-accent/20 hover:shadow-[0_4px_24px_rgb(0_0_0/0.06)]"
          >
            <Search className="h-5 w-5 shrink-0 text-muted" />
            <span className="text-muted">
              Pretražite brendove, prodavce ili tržne centre...
            </span>
            <kbd className="ml-auto hidden rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted md:inline">
              ⌘K
            </kbd>
          </button>
        </FadeIn>
        <FadeIn delay={0.3} className="mt-8">
          <p className="mb-3 text-sm font-medium text-muted">Popularni brendovi</p>
          <div className="flex flex-wrap gap-2">
            {popularBrands.map((brand) => (
              <Link key={brand.slug} href={`/brands/${brand.slug}`}>
                <Badge
                  variant="outline"
                  className="rounded-full border-border px-4 py-1.5 text-sm font-normal text-foreground hover:bg-accent hover:text-white"
                >
                  {brand.name}
                </Badge>
              </Link>
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
