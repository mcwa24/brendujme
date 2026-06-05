export const GHOST_MODA_STIL_TAG_SLUG = "moda-stil";
export const GHOST_MODA_STIL_CATEGORY = "Moda & Stil";

export function getGhostAdminUrl(): string | undefined {
  return process.env.GHOST_ADMIN_URL?.replace(/^["']|["']$/g, "").trim();
}

export function getGhostAdminKey(): string | undefined {
  return process.env.GHOST_ADMIN_KEY?.replace(/^["']|["']$/g, "").trim();
}

export function getGhostPublicSiteUrl(): string {
  return (
    process.env.GHOST_PUBLIC_SITE_URL?.replace(/^["']|["']$/g, "").trim() ||
    "https://bilbord.rs"
  ).replace(/\/$/, "");
}

export function getGhostNewsTagSlug(): string {
  return (
    process.env.GHOST_NEWS_TAG_SLUG?.replace(/^["']|["']$/g, "").trim() ||
    GHOST_MODA_STIL_TAG_SLUG
  );
}

export function isGhostConfigured(): boolean {
  return Boolean(getGhostAdminUrl() && getGhostAdminKey());
}
