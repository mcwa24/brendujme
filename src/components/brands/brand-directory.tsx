"use client";

import { useMemo, useState } from "react";
import { BrandLogoGrid } from "@/components/brands/brand-logo-grid";
import { PAGE_CONTENT_MT } from "@/components/home/section-spacing";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { HeroSearchInput } from "@/components/search/hero-search-field";
import { brandMatchesSearch } from "@/lib/brands/catalog-filters";
import type { BrandDirectoryItem } from "@/lib/data/brand-directory-item";
import type { Brand } from "@/types";

interface BrandDirectoryProps {
  brands: BrandDirectoryItem[];
}

export function BrandDirectory({ brands }: BrandDirectoryProps) {
  const [query, setQuery] = useState("");

  const hasSearchQuery = query.trim().length > 0;

  const clearSearch = () => setQuery("");

  const filtered = useMemo(() => {
    let result = [...brands];

    if (query.trim()) {
      result = result.filter((b) => brandMatchesSearch(b, query));
    }

    result.sort((a, b) => a.name.localeCompare(b.name, "sr"));

    return result;
  }, [brands, query]);

  return (
    <PageSection>
      <Container>
        <PageHeader
          title="Modni brendovi"
          description="Pretražite gde ih možete kupiti u Srbiji."
        />

        <FadeIn delay={0.06} className={PAGE_CONTENT_MT}>
          <HeroSearchInput
            className="max-w-xl"
            value={query}
            onChange={setQuery}
            onClear={clearSearch}
          />

          {hasSearchQuery && (
            <div className="mt-4">
              <button
                type="button"
                onClick={clearSearch}
                className="text-sm font-medium text-accent hover:underline"
              >
                Obriši pretragu
              </button>
            </div>
          )}
        </FadeIn>

        {filtered.length > 0 ? (
          <div className="s-list-tab s-list-tab--panel mt-8 lg:mt-10">
            <BrandLogoGrid brands={filtered as Brand[]} />
          </div>
        ) : (
          <p className="mt-16 text-center text-muted">
            Nema brendova za unetu pretragu.
          </p>
        )}
      </Container>
    </PageSection>
  );
}
