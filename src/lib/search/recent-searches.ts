const STORAGE_KEY = "brendujme-recent-searches";
const MAX_RECENT = 6;

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map(normalizeQuery)
      .filter(Boolean)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function writeRecentSearch(query: string): string[] {
  const normalized = normalizeQuery(query);
  if (normalized.length < 2) return readRecentSearches();

  const previous = readRecentSearches().filter(
    (item) => item.toLowerCase() !== normalized.toLowerCase()
  );
  const next = [normalized, ...previous].slice(0, MAX_RECENT);

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
