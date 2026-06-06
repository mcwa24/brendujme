import type { NextRequest } from "next/server";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

/** Jednostavan in-memory limiter (dovoljan za single-instance / dev). */
const SEARCH_LIMIT = 60;
const SEARCH_WINDOW_MS = 60_000;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function checkSearchRateLimit(request: NextRequest): {
  ok: boolean;
  retryAfter?: number;
} {
  const key = `search:${clientIp(request)}`;
  const now = Date.now();
  pruneExpiredBuckets(now);
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + SEARCH_WINDOW_MS });
    return { ok: true };
  }

  if (existing.count >= SEARCH_LIMIT) {
    return {
      ok: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true };
}

function pruneExpiredBuckets(now: number): void {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets.entries()) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}
