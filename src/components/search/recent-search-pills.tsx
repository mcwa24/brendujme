"use client";

import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";
import { useSearch } from "@/components/search/search-provider";
import {
  resolveRecentSearchHref,
  type RecentSearchEntry,
} from "@/lib/search/recent-searches";

interface RecentSearchPillsProps {
  className?: string;
  showHeading?: boolean;
}

export function RecentSearchPills({
  className = "",
  showHeading = true,
}: RecentSearchPillsProps) {
  const router = useRouter();
  const { recentSearches, openWithQuery, clearRecentSearches } = useSearch();

  if (!recentSearches.length) return null;

  const handleClick = (entry: RecentSearchEntry) => {
    const href = entry.href || resolveRecentSearchHref(entry.title);
    if (href) {
      router.push(href);
      return;
    }
    openWithQuery(entry.title);
  };

  return (
    <div className={className}>
      {showHeading ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <Clock className="h-3.5 w-3.5" />
            Poslednje pretrage
          </p>
          <button
            type="button"
            onClick={clearRecentSearches}
            className="text-xs text-muted transition-colors hover:text-foreground"
          >
            Obriši
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((entry) => (
          <button
            key={entry.title}
            type="button"
            onClick={() => handleClick(entry)}
            className="rounded-none border border-border bg-secondary px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-border hover:bg-background"
          >
            {entry.title}
          </button>
        ))}
        {!showHeading ? (
          <button
            type="button"
            onClick={clearRecentSearches}
            className="inline-flex items-center gap-1 rounded-none border border-dashed border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
            aria-label="Obriši poslednje pretrage"
          >
            <X className="h-3 w-3" />
            Obriši
          </button>
        ) : null}
      </div>
    </div>
  );
}
