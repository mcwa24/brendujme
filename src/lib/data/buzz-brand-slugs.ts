/** Buzz proizvodi/{slug} → Bilbord slug */
export const BUZZ_BRAND_TO_SLUG: Record<string, string> = {
  nike: "nike",
  adidas: "adidas",
  "new-balance": "new-balance",
  asics: "asics",
  on: "on",
  hoka: "hoka",
  salomon: "salomon",
  birkenstock: "birkenstock",
  ugg: "ugg",
  crocs: "crocs",
  "juicy-couture": "juicy-couture",
  "moon-boot": "moon-boot",
  lacoste: "lacoste",
  converse: "converse",
  vans: "vans",
  puma: "puma",
  havaianas: "havaianas",
  reebok: "reebok",
  skechers: "skechers",
  mont: "mont",
  timberland: "timberland",
  "under-armour": "under-armour",
  sprayground: "sprayground",
  "crep-protect": "crep-protect",
  dot: "dot",
  "new-era": "new-era",
  colmar: "colmar",
  "goorin-bros": "goorin-bros",
  "gaston-luga": "gaston-luga",
  stanley: "stanley",
  napapijri: "napapijri",
  "the-north-face": "north-face",
  ellesse: "ellesse",
  champion: "champion",
  stance: "stance",
  dfns: "dfns",
  labubu: "labubu",
  "dirty-london": "dirty-london",
};

export function bilbordSlugFromBuzzBrand(buzzSlug: string, displayName: string): string | null {
  if (buzzSlug === "buzz") return null;

  const mapped = BUZZ_BRAND_TO_SLUG[buzzSlug];
  if (mapped) return mapped;

  return buzzSlug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function displayNameFromBuzz(title: string): string {
  const t = title.trim();
  if (t.length <= 4 && t === t.toUpperCase()) {
    return t.charAt(0) + t.slice(1).toLowerCase();
  }
  return t
    .split(/\s+/)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
}
