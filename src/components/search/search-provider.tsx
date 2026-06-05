"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  clearRecentSearches as clearStoredRecentSearches,
  readRecentSearches,
  writeRecentSearch,
} from "@/lib/search/recent-searches";
import { SearchModal } from "./search-modal";

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openWithQuery: (query: string) => void;
  pendingQuery: string;
  clearPendingQuery: () => void;
  recentSearches: string[];
  recordSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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

  const recordSearch = useCallback((query: string) => {
    setRecentSearches(writeRecentSearch(query));
  }, []);

  const clearRecentSearches = useCallback(() => {
    clearStoredRecentSearches();
    setRecentSearches([]);
  }, []);

  const openWithQuery = useCallback((query: string) => {
    setPendingQuery(query.trim());
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
      <SearchModal open={open} onOpenChange={setOpen} />
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
