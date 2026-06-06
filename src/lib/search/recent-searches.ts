import { searchAll } from "@/lib/search";
import { sanitizeSearchQuery } from "@/lib/security/sanitize-search-query";

const STORAGE_KEY = "brendujme-recent-searches";
const MAX_RECENT = 6;

export interface RecentSearchEntry {
  title: string;
  href: string;
}

function normalizeTitle(title: string): string {
  return sanitizeSearchQuery(title).replace(/\s+/g, " ");
}

function parseStoredEntry(item: unknown): RecentSearchEntry | null {
  if (typeof item === "string") {
    const title = normalizeTitle(item);
    if (title.length < 2) return null;
    return { title, href: "" };
  }
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const title =
      typeof record.title === "string" ? normalizeTitle(record.title) : "";
    const href = typeof record.href === "string" ? record.href : "";
    if (title.length < 2) return null;
    return { title, href };
  }
  return null;
}

export function readRecentSearches(): RecentSearchEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseStoredEntry)
      .filter((item): item is RecentSearchEntry => item !== null)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function writeRecentSearch(entry: RecentSearchEntry): RecentSearchEntry[] {
  const title = normalizeTitle(entry.title);
  const href = entry.href?.trim() ?? "";
  if (title.length < 2) return readRecentSearches();

  const previous = readRecentSearches().filter(
    (item) => item.title.toLowerCase() !== title.toLowerCase()
  );
  const next = [{ title, href }, ...previous].slice(0, MAX_RECENT);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // privatni režim / pun storage
  }

  return next;
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Stari zapisi (samo tekst) ili prazan href — pronađi destinaciju iz kataloga. */
export function resolveRecentSearchHref(title: string): string | null {
  const results = searchAll(title);
  const normalized = title.toLowerCase();
  const exact = results.find((r) => r.title.toLowerCase() === normalized);
  return (exact ?? results[0])?.href ?? null;
}
