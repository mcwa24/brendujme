/**
 * Uklanja HTML iz scrapovanih stringova (npr. N Sport "N SPORT<br>N FASHION").
 */
export function normalizeScrapedDisplayText(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, " · ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s*·\s*(?:·\s*)+/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseStoreToken(token: string): string {
  if (!token) return token;
  if (/^[A-Z]{1,2}$/.test(token)) return token;
  if (token === token.toUpperCase() && token.length > 2) {
    return token.charAt(0) + token.slice(1).toLowerCase();
  }
  return token;
}

/** N SPORT → N Sport, PUMA STORE → Puma Store */
function humanizeStoreName(name: string): string {
  return name
    .split(/\s*·\s*/)
    .map((segment) =>
      segment
        .split(/\s+/)
        .map(titleCaseStoreToken)
        .join(" ")
    )
    .join(" · ");
}

/** Naslov kartice lokacije na stranici brenda — npr. "N Sport - Zuce". */
export function formatBrandLocationTitle(storeName: string, city: string): string {
  const base = humanizeStoreName(normalizeScrapedDisplayText(storeName));
  if (!base) return city;

  const cityLower = city.toLowerCase();
  const hasCity = base.toLowerCase().includes(cityLower);
  const hasLocationHint = base.includes(",") || base.includes(" - ") || base.includes(" — ");

  if (hasCity || hasLocationHint) return base;
  return `${base} - ${city}`;
}

/** Linije naziva radnje — za prikaz u dva reda kad ima više koncepata. */
export function formatStoreNameLines(text: string): string[] {
  const normalized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  const lines = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 0) return lines;

  const single = normalizeScrapedDisplayText(text);
  return single ? [single] : [];
}
