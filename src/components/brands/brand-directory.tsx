"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BrandCard } from "@/components/brands/brand-card";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Input } from "@/components/ui/input";
import {
  brandMatchesCountry,
  brandMatchesSearch,
  getCountryFilterOptions,
  getPriceSegmentFilterOptions,
} from "@/lib/brands/catalog-filters";
import type { BrandDirectoryItem } from "@/lib/data/brand-directory-item";
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
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Modni brendovi
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {brands.length} fashion brendova — pretražite gde ih možete kupiti u
          Srbiji po nazivu, zemlji ili cenovnom segmentu.
        </p>
      </FadeIn>

      <div className="mt-12 flex flex-col gap-10 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="sticky top-28 space-y-8 rounded-none border border-border bg-card p-6">
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pretraži brendove..."
                className="h-12 rounded-none border-border pl-11"
              />
            </div>
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as "name" | "availability")
              }
              className="h-12 rounded-none border border-border bg-card px-4 text-sm text-foreground outline-none"
              aria-label="Sortiranje"
            >
              <option value="name">Naziv A–Z</option>
              <option value="availability">Najviše lokacija</option>
            </select>
          </div>

          <p className="mt-6 text-sm text-muted">
            {filtered.length} brend{filtered.length === 1 ? "" : "ova"}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((brand, i) => (
              <FadeIn key={brand.slug} delay={(i % 6) * 0.04}>
                <BrandCard brand={brand} variant="compact" />
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
        "flex items-center justify-between gap-3 rounded-none px-3 py-2 text-left text-sm transition-colors",
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
