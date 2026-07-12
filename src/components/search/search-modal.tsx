"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecentSearchPills } from "@/components/search/recent-search-pills";
import { useSearch } from "@/components/search/search-provider";
import { getBrandLetter } from "@/lib/brand-logo-resolve";
import { OFFERING_LABELS } from "@/lib/data/brand-offerings";
import {
  SEARCH_QUERY_MAX_LENGTH,
  sanitizeSearchQuery,
} from "@/lib/security/sanitize-search-query";
import { searchAll } from "@/lib/search";
import { parseSearchIntent } from "@/lib/search-intent";
import type { BrandOfferingSlug, SearchResult, SearchResultType } from "@/types";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeLabels: Record<SearchResultType, string> = {
  brand: "Brendovi",
  retailer: "Prodavci",
  "shopping-center": "Tržni centri",
};

const OFFERING_GROUP_ORDER: BrandOfferingSlug[] = [
  "footwear",
  "sportswear",
  "apparel",
  "beauty",
  "accessories",
];

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const { pendingQuery, clearPendingQuery, recordSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      clearPendingQuery();
    }
  }, [open, clearPendingQuery]);

  useEffect(() => {
    if (open && pendingQuery) {
      setQuery(sanitizeSearchQuery(pendingQuery));
    }
  }, [open, pendingQuery]);

  useEffect(() => {
    const q = sanitizeSearchQuery(query);
    if (!q) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as { results?: SearchResult[] };
        setResults(data.results ?? []);
      } catch {
        setResults(searchAll(q));
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  const hasQuery = query.trim().length > 0;

  const brandRefinements = useMemo(() => {
    const q = query.trim();
    if (!q || parseSearchIntent(q, []).offerings?.length) return null;
    const brandHit = results.find((r) => r.type === "brand");
    if (!brandHit) return null;
    const qn = q.toLowerCase();
    const name = brandHit.title.toLowerCase();
    const slugWords = brandHit.slug.replace(/-/g, " ");
    if (!qn.includes(name) && !qn.includes(slugWords)) return null;
    return {
      brandLabel: brandHit.title,
      patike: `${brandHit.title} patike`,
      odeca: `${brandHit.title} majica`,
    };
  }, [query, results]);

  const groupedRetailers = useMemo(() => {
    const retailers = results.filter((r) => r.type === "retailer");
    const hasOfferingGroups = retailers.some((r) => r.offeringGroup);
    if (!hasOfferingGroups) {
      return [{ heading: typeLabels.retailer, items: retailers }];
    }

    const byOffering = new Map<BrandOfferingSlug | "other", SearchResult[]>();
    for (const r of retailers) {
      const key = r.offeringGroup ?? "other";
      const list = byOffering.get(key) ?? [];
      list.push(r);
      byOffering.set(key, list);
    }

    const sections: { heading: string; items: SearchResult[] }[] = [];
    for (const offering of OFFERING_GROUP_ORDER) {
      const items = byOffering.get(offering);
      if (!items?.length) continue;
      const label = brandRefinements?.brandLabel ?? "Brend";
      sections.push({
        heading: `${label} — ${OFFERING_LABELS[offering].toLowerCase()}`,
        items,
      });
    }
    const other = byOffering.get("other");
    if (other?.length) {
      sections.push({ heading: typeLabels.retailer, items: other });
    }
    return sections;
  }, [results, brandRefinements]);

  const brandResults = useMemo(
    () => results.filter((r) => r.type === "brand"),
    [results]
  );
  const mallResults = useMemo(
    () => results.filter((r) => r.type === "shopping-center"),
    [results]
  );

  const handleSelect = (item: SearchResult) => {
    recordSearch({ title: item.title, href: item.href });
    onOpenChange(false);
    router.push(item.href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[var(--radius)] border-border bg-card p-0 shadow-[0_8px_40px_rgb(0_0_0/0.12)] sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Pretraga brendova</DialogTitle>
          <DialogDescription>
            Pretražite modne brendove i prodavce u Srbiji
          </DialogDescription>
        </DialogHeader>
        <Command
          shouldFilter={false}
          className="rounded-[var(--radius)] bg-card text-foreground [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted"
        >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-5 w-5 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(sanitizeSearchQuery(e.target.value))}
              maxLength={SEARCH_QUERY_MAX_LENGTH}
              placeholder="npr. Nike patike, New Balance, Buzz…"
              className="bilbord-field h-14 w-full rounded-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:shadow-none"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              aria-label="Pretraga"
            />
          </div>
          {brandRefinements && hasQuery && !loading && (
            <div className="flex flex-wrap gap-2 border-b border-border bg-background/60 px-4 py-3">
              <span className="w-full text-xs text-muted">Sužite pretragu:</span>
              <button
                type="button"
                onClick={() => setQuery(brandRefinements.patike)}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-card"
              >
                {brandRefinements.patike}
              </button>
              <button
                type="button"
                onClick={() => setQuery(brandRefinements.odeca)}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-card"
              >
                {brandRefinements.odeca}
              </button>
            </div>
          )}
          <CommandList className="max-h-[min(420px,50vh)] px-2 py-2">
            {!hasQuery && (
              <div className="px-3 py-6">
                <RecentSearchPills />
                <p className="mt-6 text-center text-sm text-muted">
                  Unesite brend i tip proizvoda (patike, majica…) ili naziv prodavca
                </p>
              </div>
            )}
            {hasQuery && loading && (
              <p className="px-3 py-10 text-center text-sm text-muted">
                Pretraga…
              </p>
            )}
            {hasQuery && !loading && results.length === 0 && (
              <p className="px-3 py-10 text-center text-sm text-muted">
                Nema rezultata. Pokušajte „Nike patike“ ili „New Balance“.
              </p>
            )}
            {hasQuery && !loading && results.length > 0 && (
              <>
                {brandResults.length > 0 && (
                  <CommandGroup heading={typeLabels.brand}>
                    {brandResults.map((item) => (
                      <SearchResultItem
                        key={`${item.type}-${item.slug}`}
                        item={item}
                        onSelect={handleSelect}
                      />
                    ))}
                  </CommandGroup>
                )}
                {groupedRetailers.map((section, idx) => (
                  <div key={section.heading}>
                    {(brandResults.length > 0 || idx > 0) && (
                      <CommandSeparator className="my-2" />
                    )}
                    <CommandGroup heading={section.heading}>
                      {section.items.map((item) => (
                        <SearchResultItem
                          key={`${item.type}-${item.slug}-${item.offeringGroup ?? ""}`}
                          item={item}
                          onSelect={handleSelect}
                        />
                      ))}
                    </CommandGroup>
                  </div>
                ))}
                {mallResults.length > 0 && (
                  <>
                    <CommandSeparator className="my-2" />
                    <CommandGroup heading={typeLabels["shopping-center"]}>
                      {mallResults.map((item) => (
                        <SearchResultItem
                          key={`${item.type}-${item.slug}`}
                          item={item}
                          onSelect={handleSelect}
                        />
                      ))}
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
          <div className="border-t border-border bg-background/50 px-4 py-3 text-xs text-muted">
            <span className="hidden sm:inline">
              Enter za izbor · Esc za zatvoriti ·{" "}
            </span>
            <kbd className="rounded-full border border-border bg-card px-2 py-0.5 text-foreground">
              ⌘K
            </kbd>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function SearchResultThumbnail({ item }: { item: SearchResult }) {
  if (item.imageUrl) {
    return (
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[var(--radius)] border border-border bg-transparent">
        <Image
          src={item.imageUrl}
          alt=""
          fill
          className="brand-logo-img object-contain p-1.5"
          sizes="44px"
          unoptimized={
            item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/logos/")
          }
        />
      </div>
    );
  }

  if (item.type === "shopping-center") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] border border-border bg-secondary text-muted">
        <Building2 className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] border border-border bg-secondary font-display text-sm font-semibold text-muted-foreground"
      aria-hidden
    >
      {getBrandLetter(item.title, item.type === "brand" ? item.slug : undefined)}
    </div>
  );
}

function SearchResultItem({
  item,
  onSelect,
}: {
  item: SearchResult;
  onSelect: (item: SearchResult) => void;
}) {
  return (
    <CommandItem
      value={`${item.title} ${item.subtitle}`}
      keywords={[item.title, item.subtitle, item.slug]}
      onSelect={() => onSelect(item)}
      className="mb-1 cursor-pointer gap-3 rounded-[var(--radius)] border border-border/60 bg-secondary px-3 py-2.5 text-foreground hover:border-border hover:bg-card data-[selected=true]:border-accent/20 data-[selected=true]:bg-card aria-[selected=true]:border-accent/20 aria-[selected=true]:bg-card"
    >
      <SearchResultThumbnail item={item} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{item.title}</p>
        <p className="truncate text-sm text-muted">{item.subtitle}</p>
      </div>
    </CommandItem>
  );
}
