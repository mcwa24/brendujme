/** Đak Sport URL slug → Bilbord slug */
export const DJAK_BRAND_TO_SLUG: Record<string, string> = {
  nike: "nike",
  adidas: "adidas",
  puma: "puma",
  reebok: "reebok",
  converse: "converse",
  new_balance: "new-balance",
  new_era: "new-era",
  under_armour: "under-armour",
  the_north_face: "north-face",
  columbia: "columbia",
  timberland: "timberland",
  skechers: "skechers",
  asics: "asics",
  salomon: "salomon",
  hummel: "hummel",
  kappa: "kappa",
  lacoste: "lacoste",
  guess: "guess",
  calvin_klein: "calvin-klein",
  tommy_hilfiger: "tommy-hilfiger",
  hugo: "hugo",
  boss: "boss",
  diesel: "diesel",
  crocs: "crocs",
  vans: "vans",
  fila: "fila",
  joma: "joma",
  mizuno: "mizuno",
  brooks: "brooks",
  "4f": "4f",
  eastbound: "eastbound",
  copperminer: "copperminer",
  coperminer: "copperminer",
};

export function bilbordSlugFromDjakBrand(djakSlug: string, displayName: string): string {
  const key = djakSlug.toLowerCase();
  const mapped = DJAK_BRAND_TO_SLUG[key];
  if (mapped) return mapped;

  const fromName = displayName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (fromName && fromName.length >= 2) return fromName;

  return key.replace(/_/g, "-");
}

export function displayNameFromDjak(name: string): string {
  const t = name.trim();
  if (t.length <= 5 && t === t.toUpperCase()) {
    return t
      .split(/\s+/)
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");
  }
  if (t === t.toUpperCase()) {
    return t
      .split(/\s+/)
      .map((w) => (w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase()))
      .join(" ");
  }
  return t;
}
