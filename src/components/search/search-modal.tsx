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
import { searchAll } from "@/lib/search";
import type { SearchResult, SearchResultType } from "@/types";

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

  const grouped = useMemo(() => {
    const groups: Record<SearchResultType, typeof results> = {
      brand: [],
      retailer: [],
      "shopping-center": [],
    };
    for (const r of results) {
      groups[r.type].push(r);
    }
    return groups;
  }, [results]);

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
              placeholder="Pretraži brendove, prodavce ili tržne centre..."
              className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted"
              autoFocus
              aria-label="Pretraga"
            />
          </div>
          <CommandList className="max-h-[360px]">
            {!hasQuery && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Unesite naziv brenda, prodavca ili tržnog centra
              </p>
            )}
            {hasQuery && loading && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                Pretraga…
              </p>
            )}
            {hasQuery && !loading && results.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                Nema rezultata. Pokušajte drugačiji upit.
              </p>
            )}
            {hasQuery &&
              results.length > 0 &&
              (["brand", "retailer", "shopping-center"] as const).map(
                (type, idx) => {
                  const items = grouped[type];
                  if (items.length === 0) return null;
                  const Icon = typeIcons[type];
                  return (
                    <div key={type}>
                      {idx > 0 && <CommandSeparator />}
                      <CommandGroup heading={typeLabels[type]}>
                        {items.map((item) => (
                          <CommandItem
                            key={`${item.type}-${item.slug}`}
                            value={`${item.title} ${item.subtitle}`}
                            keywords={[item.title, item.subtitle, item.slug]}
                            onSelect={() => handleSelect(item.href)}
                            className="cursor-pointer gap-3 py-3"
                          >
                            <Icon className="h-4 w-4 text-muted" />
                            <div>
                              <p className="font-medium text-foreground">
                                {item.title}
                              </p>
                              <p className="text-sm text-muted">
                                {item.subtitle}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </div>
                  );
                }
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
