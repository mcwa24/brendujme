"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { sanitizeSearchQuery } from "@/lib/security/sanitize-search-query";
import {
  clearRecentSearches as clearStoredRecentSearches,
  readRecentSearches,
  writeRecentSearch,
  type RecentSearchEntry,
} from "@/lib/search/recent-searches";

const SearchModal = dynamic(
  () => import("./search-modal").then((m) => m.SearchModal),
  { ssr: false }
);

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openWithQuery: (query: string) => void;
  pendingQuery: string;
  clearPendingQuery: () => void;
  recentSearches: RecentSearchEntry[];
  recordSearch: (entry: RecentSearchEntry) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearchEntry[]>([]);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const recordSearch = useCallback((entry: RecentSearchEntry) => {
    setRecentSearches(writeRecentSearch(entry));
  }, []);

  const clearRecentSearches = useCallback(() => {
    clearStoredRecentSearches();
    setRecentSearches([]);
  }, []);

  const openWithQuery = useCallback((query: string) => {
    setPendingQuery(sanitizeSearchQuery(query));
    setOpen(true);
  }, []);

  const clearPendingQuery = useCallback(() => {
    setPendingQuery("");
  }, []);

  return (
    <SearchContext.Provider
      value={{
        open,
        setOpen,
        openWithQuery,
        pendingQuery,
        clearPendingQuery,
        recentSearches,
        recordSearch,
        clearRecentSearches,
      }}
    >
      {children}
      {open ? <SearchModal open={open} onOpenChange={setOpen} /> : null}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}

export function useSearchShortcut() {
  const { setOpen } = useSearch();
  return useCallback(() => setOpen(true), [setOpen]);
}
