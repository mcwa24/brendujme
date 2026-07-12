"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { BrandCard } from "@/components/brands/brand-card";
import {
  PAGE_LEAD,
  PAGE_TITLE,
} from "@/components/home/section-spacing";
import { Container } from "@/components/layout/container";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { Input } from "@/components/ui/input";
import {
  brandMatchesCountry,
  brandMatchesSearch,
  getCountryFilterOptions,
  getPriceSegmentFilterOptions,
} from "@/lib/brands/catalog-filters";
import type { BrandDirectoryItem } from "@/lib/data/brand-directory-item";
import { formatBrandCount, formatFashionBrandCount } from "@/lib/format/sr-plural";
import type { PriceSegment } from "@/types";
import { cn } from "@/lib/utils";

interface BrandDirectoryProps {
  brands: BrandDirectoryItem[];
}

export function BrandDirectory({ brands }: BrandDirectoryProps) {
  const countryOptions = useMemo(() => getCountryFilterOptions(brands), [brands]);
  const priceSegmentOptions = useMemo(
    () => getPriceSegmentFilterOptions(brands),
    [brands]
  );

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("Sve zemlje");
  const [priceSegment, setPriceSegment] = useState<PriceSegment | "all">("all");
  const [sort, setSort] = useState<"name" | "availability">("name");

  const hasSearchQuery = query.trim().length > 0;

  const clearSearch = () => setQuery("");

  const filtered = useMemo(() => {
    let result = [...brands];

    if (query.trim()) {
      result = result.filter((b) => brandMatchesSearch(b, query));
    }
    if (country !== "Sve zemlje") {
      result = result.filter((b) => brandMatchesCountry(b, country));
    }
    if (priceSegment !== "all") {
      result = result.filter((b) => b.priceSegment === priceSegment);
    }

    result.sort((a, b) => {
      if (sort === "availability") {
        return b.availabilityCount - a.availabilityCount;
      }
      return a.name.localeCompare(b.name, "sr");
    });

    return result;
  }, [brands, query, country, priceSegment, sort]);

  return (
    <PageSection>
      <Container>
      <FadeIn when="mount" direction="none">
        <h1 className={PAGE_TITLE}>Modni brendovi</h1>
        <p className={PAGE_LEAD}>
          {formatFashionBrandCount(brands.length)} — pretražite gde ih možete kupiti u
          Srbiji po nazivu, zemlji ili cenovnom segmentu.
        </p>
      </FadeIn>

      <FadeIn delay={0.06} className="mt-8 md:mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraži brendove..."
              className={cn(
                "h-12 rounded-[var(--radius)] pl-11",
                hasSearchQuery && "pr-11"
              )}
            />
            {hasSearchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:text-foreground"
                aria-label="Obriši pretragu"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "name" | "availability")
            }
            className="bilbord-field hidden h-12 px-4 text-sm sm:block"
            aria-label="Sortiranje"
          >
            <option value="name">Naziv A–Z</option>
            <option value="availability">Najviše lokacija</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <p>{formatBrandCount(filtered.length)}</p>
          {hasSearchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="font-medium text-accent hover:underline"
            >
              Obriši pretragu
            </button>
          )}
        </div>
      </FadeIn>

      <div className="mt-8 flex flex-col gap-10 lg:mt-10 lg:flex-row">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-28 space-y-8 rounded-[var(--radius)] bg-card p-6 shadow-[var(--shadow-card)]">
            <FilterGroup title="Zemlja">
              <FilterButton
                active={country === "Sve zemlje"}
                onClick={() => setCountry("Sve zemlje")}
                count={brands.length}
              >
                Sve zemlje
              </FilterButton>
              {countryOptions.map((c) => (
                <FilterButton
                  key={c.value}
                  active={country === c.value}
                  onClick={() => setCountry(c.value)}
                  count={c.count}
                >
                  {c.label}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup title="Cenovni segment">
              <FilterButton
                active={priceSegment === "all"}
                onClick={() => setPriceSegment("all")}
                count={brands.length}
              >
                Svi segmenti
              </FilterButton>
              {priceSegmentOptions.map((p) => (
                <FilterButton
                  key={p.value}
                  active={priceSegment === p.value}
                  onClick={() => setPriceSegment(p.value)}
                  count={p.count}
                >
                  {p.label}
                </FilterButton>
              ))}
            </FilterGroup>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 items-stretch gap-4 sm:gap-6 xl:grid-cols-3">
            {filtered.map((brand, i) => (
              <FadeIn key={brand.slug} delay={(i % 6) * 0.04} className="h-full">
                <BrandCard brand={brand} variant="compact" uniformLogo />
              </FadeIn>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-16 text-center text-muted">
              Nema brenda za izabrane filtere.
            </p>
          )}
        </div>
      </div>
      </Container>
    </PageSection>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  count,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 rounded-[var(--radius)] px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-accent font-medium text-white"
          : "text-muted hover:bg-background hover:text-foreground"
      )}
    >
      <span>{children}</span>
      {count != null ? (
        <span
          className={cn(
            "tabular-nums text-xs",
            active ? "text-white/80" : "text-muted"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
