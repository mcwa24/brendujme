/** Maksimalna dužina upita u pretrazi (ReDoS / abuse zaštita). */
export const SEARCH_QUERY_MAX_LENGTH = 120;

/** Znakovi dozvoljeni u pretrazi — brendovi, ćirilica/latinica, brojevi, osnovna interpunkcija. */
const ALLOWED_QUERY = /^[\p{L}\p{N}\s&+.'\-/]+$/u;

const INJECTION_PATTERNS: RegExp[] = [
  /<script\b/i,
  /<\/script>/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  /on\w+\s*=/i,
  /<\?/,
  /<%/,
  /\$\{/,
  /union\s+select/i,
  /;\s*drop\s+/i,
  /;\s*delete\s+from/i,
  /;\s*insert\s+into/i,
  /;\s*update\s+/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
];

function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
}

/**
 * Uklanja HTML tagove i normalizuje whitespace.
 * Vraća prazan string ako ulaz sadrži blokirane obrasce (XSS / injection).
 */
export function sanitizeSearchQuery(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw !== "string") return "";

  let q = stripControlChars(raw.normalize("NFKC")).trim();
  if (!q) return "";

  if (q.length > SEARCH_QUERY_MAX_LENGTH) {
    q = q.slice(0, SEARCH_QUERY_MAX_LENGTH).trim();
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(q)) return "";
  }

  q = q.replace(/<[^>]*>/g, "").trim();
  if (!q) return "";

  if (!ALLOWED_QUERY.test(q)) {
    q = q
      .replace(/[^\p{L}\p{N}\s&+.'\-/]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return q.slice(0, SEARCH_QUERY_MAX_LENGTH);
}

/** Striktna validacija za API — odbija sumnjive upite pre obrade. */
export function validateSearchQueryParam(raw: unknown): string | null {
  if (raw == null) return "";
  if (typeof raw !== "string") return null;

  const trimmed = stripControlChars(raw.normalize("NFKC")).trim();
  if (!trimmed) return "";

  if (trimmed.length > SEARCH_QUERY_MAX_LENGTH) return null;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) return null;
  }

  if (/<[^>]+>/.test(trimmed)) return null;

  const sanitized = sanitizeSearchQuery(trimmed);
  if (!sanitized && trimmed) return null;

  return sanitized;
}
