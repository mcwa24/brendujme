"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, ShoppingBag, Store, type LucideIcon } from "lucide-react";
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
import { OFFERING_LABELS } from "@/lib/data/brand-offerings";
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

const typeIcons: Record<SearchResultType, LucideIcon> = {
  brand: ShoppingBag,
  retailer: Store,
  "shopping-center": Building2,
};

const OFFERING_GROUP_ORDER: BrandOfferingSlug[] = [
  "footwear",
  "sportswear",
  "apparel",
  "accessories",
];

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
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

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[20px] border-border p-0 shadow-2xl sm:max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Pretraga</DialogTitle>
          <DialogDescription>
            Pretražite brendove, prodavce i tržne centre
          </DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false} className="bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-5 w-5 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="npr. Nike patike, Nike majica, Buzz…"
              className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted"
              autoFocus
              aria-label="Pretraga"
            />
          </div>
          {brandRefinements && hasQuery && !loading && (
            <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
              <span className="w-full text-xs text-muted">Sužite pretragu:</span>
              <button
                type="button"
                onClick={() => setQuery(brandRefinements.patike)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm hover:border-accent"
              >
                {brandRefinements.patike}
              </button>
              <button
                type="button"
                onClick={() => setQuery(brandRefinements.odeca)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm hover:border-accent"
              >
                {brandRefinements.odeca}
              </button>
            </div>
          )}
          <CommandList className="max-h-[360px]">
            {!hasQuery && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Unesite brend i tip proizvoda (patike, majica…) ili naziv prodavca
              </p>
            )}
            {hasQuery && loading && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                Pretraga…
              </p>
            )}
            {hasQuery && !loading && results.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                Nema rezultata. Pokušajte „Nike patike“ ili „Nike majica“.
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
                    {(brandResults.length > 0 || idx > 0) && <CommandSeparator />}
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
                    <CommandSeparator />
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
          <div className="border-t border-border px-4 py-3 text-xs text-muted">
            <span className="hidden sm:inline">
              Enter za izbor · Esc za zatvaranje ·{" "}
            </span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function SearchResultItem({
  item,
  onSelect,
}: {
  item: SearchResult;
  onSelect: (href: string) => void;
}) {
  const Icon = typeIcons[item.type];
  return (
    <CommandItem
      value={`${item.title} ${item.subtitle}`}
      keywords={[item.title, item.subtitle, item.slug]}
      onSelect={() => onSelect(item.href)}
      className="cursor-pointer gap-3 py-3"
    >
      <Icon className="h-4 w-4 text-muted" />
      <div>
        <p className="font-medium text-foreground">{item.title}</p>
        <p className="text-sm text-muted">{item.subtitle}</p>
      </div>
    </CommandItem>
  );
}
