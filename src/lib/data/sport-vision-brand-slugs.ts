/** Sport Vision proizvodi/{slug} → Bilbord slug */
export const SPORT_VISION_BRAND_TO_SLUG: Record<string, string> = {
  nike: "nike",
  adidas: "adidas",
  asics: "asics",
  "under-armour": "under-armour",
  mont: "mont",
  kander: "kander",
  "new-balance": "new-balance",
  "the-north-face": "north-face",
  bhpc: "bhpc",
  champion: "champion",
  ellesse: "ellesse",
  columbia: "columbia",
  salomon: "salomon",
  umbro: "umbro",
  kronos: "kronos",
  puma: "puma",
  reebok: "reebok",
  skechers: "skechers",
  "moon-boot": "moon-boot",
  colmar: "colmar",
  timberland: "timberland",
  icepeak: "icepeak",
  lussari: "lussari",
  hoka: "hoka",
  lonsdale: "lonsdale",
  "capelli-sport": "capelli-sport",
  "sergio-tacchini": "sergio-tacchini",
  converse: "converse",
  on: "on",
  action: "action",
  butterfly: "butterfly",
  speedo: "speedo",
  cartago: "cartago",
  crocs: "crocs",
  arena: "arena",
  "helly-hansen": "helly-hansen",
  ipanema: "ipanema",
  rider: "rider",
  luhta: "luhta",
  merrell: "merrell",
  mizuno: "mizuno",
  americanino: "americanino",
  "soul-studio": "soul-studio",
  vans: "vans",
  molten: "molten",
  "ring-sport": "ring-sport",
  j2c: "j2c",
  mcdavid: "mcdavid",
  "jack-wolfskin": "jack-wolfskin",
  reusch: "reusch",
  mammut: "mammut",
  "new-era": "new-era",
  atlantis: "atlantis",
  zaxy: "zaxy",
  spalding: "spalding",
  buff: "buff",
  "shoe-care": "shoe-care",
  havaianas: "havaianas",
};

export function bilbordSlugFromSportVisionBrand(
  svSlug: string,
  displayName: string
): string | null {
  if (!svSlug || svSlug === "sport-vision") return null;

  const mapped = SPORT_VISION_BRAND_TO_SLUG[svSlug];
  if (mapped) return mapped;

  return svSlug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function displayNameFromSportVision(title: string): string {
  const t = title.trim();
  if (t.length <= 4 && t === t.toUpperCase()) {
    return t.charAt(0) + t.slice(1).toLowerCase();
  }
  return t
    .split(/\s+/)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
}
