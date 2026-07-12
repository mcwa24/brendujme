/** Javni prefiks shop aplikacije (npr. /shop na bilbord.rs ili shop.bilbord.rs). */
export const SHOP_BASE_PATH = normalizeShopBasePath(
  process.env.NEXT_PUBLIC_SHOP_BASE_PATH?.trim() || "/shop",
);

function normalizeShopBasePath(raw: string): string {
  if (!raw || raw === "/") return "";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.replace(/\/+$/, "");
}

export function shopPublicPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!SHOP_BASE_PATH) return normalized;
  return `${SHOP_BASE_PATH}${normalized}`;
}

export function shopPublicOrigin(siteUrl: string): string {
  const trimmed = siteUrl.replace(/\/+$/, "");
  if (!SHOP_BASE_PATH) return trimmed;
  if (trimmed.endsWith(SHOP_BASE_PATH)) return trimmed;
  return `${trimmed}${SHOP_BASE_PATH}`;
}
