"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShoppingBag, Store, type LucideIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
import type { SearchResultType } from "@/types";

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

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => searchAll(query), [query]);

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
        <Command
          shouldFilter={false}
          value={query}
          onValueChange={setQuery}
          className="bg-card"
        >
          <div className="border-b border-border px-2 py-2">
            <CommandInput
              placeholder="Pretraži brendove, prodavce ili tržne centre..."
              className="h-12 text-base"
            />
          </div>
          <CommandList className="max-h-[360px]">
            <CommandEmpty className="py-10 text-center text-muted">
              Nema rezultata. Pokušajte drugačiji upit.
            </CommandEmpty>
            {(["brand", "retailer", "shopping-center"] as const).map(
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
                          value={`${item.type}-${item.slug}`}
                          onSelect={() => handleSelect(item.href)}
                          className="cursor-pointer gap-3 py-3"
                        >
                          <Icon className="h-4 w-4 text-muted" />
                          <div>
                            <p className="font-medium text-foreground">
                              {item.title}
                            </p>
                            <p className="text-sm text-muted">{item.subtitle}</p>
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
              Koristite strelice za navigaciju · Enter za izbor ·{" "}
            </span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5">
              ⌘K
            </kbd>{" "}
            za pretragu
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
