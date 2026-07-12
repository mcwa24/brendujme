import type { NextRequest } from "next/server";

const DEFAULT_ORIGINS = [
  "https://bilbord.rs",
  "https://www.bilbord.rs",
  "http://localhost:2368",
  "http://127.0.0.1:2368",
];

function parseAllowedOrigins(): string[] {
  const raw = process.env.SHOP_PUBLIC_CORS_ORIGINS?.trim();
  if (!raw) return DEFAULT_ORIGINS;
  return [
    ...DEFAULT_ORIGINS,
    ...raw.split(",").map((o) => o.trim()).filter(Boolean),
  ];
}

export function resolvePublicApiCorsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin")?.trim();
  if (!origin) return null;
  const allowed = parseAllowedOrigins();
  if (allowed.includes(origin)) return origin;
  try {
    const host = new URL(origin).hostname;
    if (host === "bilbord.rs" || host.endsWith(".bilbord.rs")) return origin;
  } catch {
    /* ignore */
  }
  return null;
}

export function applyPublicApiCorsHeaders(
  response: Response,
  request: NextRequest,
): void {
  const origin = resolvePublicApiCorsOrigin(request);
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Vary", "Origin");
  }
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
}
