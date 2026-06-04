/** Tike proizvodi/{slug} → Bilbord slug (null = preskoči u katalogu) */
export const TIKE_SKIP_SLUGS = new Set([
  "nova-kolekcija",
  "online-only",
  "shoe-care",
  "funko-pop",
  "tike-collaboration",
]);

export const TIKE_BRAND_TO_SLUG: Record<string, string> = {
  nike: "nike",
  adidas: "adidas",
  "new-balance-brend": "new-balance",
  asics: "asics",
  saucony: "saucony",
  "converse-brend": "converse",
  reebok: "reebok",
  birkenstock: "birkenstock",
  "crocs-brend": "crocs",
  "salomon-brend": "salomon",
  "the-north-face": "north-face",
  hoka: "hoka",
  havaianas: "havaianas",
  "new-era": "new-era",
  sprayground: "sprayground",
  "crep-protect": "crep-protect",
  "goorin-bros": "goorin-bros",
  stanley: "stanley",
  stance: "stance",
  puma: "puma",
  vans: "vans",
  jordan: "jordan",
};

export function bilbordSlugFromTikeBrand(
  tikeSlug: string,
  displayName: string
): string | null {
  if (TIKE_SKIP_SLUGS.has(tikeSlug)) return null;
  if (tikeSlug === "tike") return null;

  const mapped = TIKE_BRAND_TO_SLUG[tikeSlug];
  if (mapped) return mapped;

  return displayName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function displayNameFromTike(title: string): string {
  const t = title.trim();
  if (t.length <= 4 && t === t.toUpperCase()) {
    return t.charAt(0) + t.slice(1).toLowerCase();
  }
  return t
    .split(/\s+/)
    .map((w) =>
      w.length <= 3 ? w.toUpperCase() : w.charAt(0) + w.slice(1).toLowerCase()
    )
    .join(" ");
}
