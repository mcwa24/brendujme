/** Planeta Sport /brand/{slug} → Bilbord slug */
export const PLANETA_BRAND_TO_SLUG: Record<string, string> = {
  nike: "nike",
  adidas: "adidas",
  puma: "puma",
  reebok: "reebok",
  converse: "converse",
  newbalance: "new-balance",
  under_armour: "under-armour",
  columbia: "columbia",
  timberland: "timberland",
  skechers: "skechers",
  asics: "asics",
  salomon: "salomon",
  umbro: "umbro",
  crocs: "crocs",
  vans: "vans",
  jordan: "jordan",
  saucony: "saucony",
  helly_hansen: "helly-hansen",
  icepeak: "icepeak",
  kander: "kander",
  karl_lagerfeld: "karl-lagerfeld",
  sergiotacchini: "sergio-tacchini",
  ellesse: "ellesse",
  lonsdale: "lonsdale",
  luhta: "luhta",
  merrell: "merrell",
  mizuno: "mizuno",
  spalding: "spalding",
  speedo: "speedo",
  butterfly: "butterfly",
  arena: "arena",
  ipanema: "ipanema",
  rider: "rider",
  hoka: "hoka",
  on: "on",
  champion: "champion",
  north_face: "north-face",
  the_north_face: "north-face",
  lacoste: "lacoste",
  guess: "guess",
  calvin_klein: "calvin-klein",
  tommy_hilfiger: "tommy-hilfiger",
  u_s_polo_assn: "u-s-polo-assn",
  antony_morato: "antony-morato",
  geox: "geox",
  rieker: "rieker",
  dockers: "dockers",
  nautica: "nautica",
  lotto: "lotto",
  grisport: "grisport",
  reusch: "reusch",
  buff: "buff",
  slazenger: "slazenger",
  proball: "proball",
  gewo: "gewo",
  givova: "givova",
  enervit: "enervit",
  isostar: "isostar",
};

const DISPLAY_OVERRIDES: Record<string, string> = {
  newbalance: "New Balance",
  under_armour: "Under Armour",
  karl_lagerfeld: "Karl Lagerfeld",
  sergiotacchini: "Sergio Tacchini",
  u_s_polo_assn: "U.S. Polo Assn.",
  antony_morato: "Antony Morato",
  geographical_norway: "Geographical Norway",
  de_fonseca: "De Fonseca",
  d_franklin: "D. Franklin",
  fly_london: "Fly London",
  bear_paw: "Bear Paw",
  blue_reef: "Blue Reef",
  cotton_belt: "Cotton Belt",
  jump_power: "Jump Power",
  keva_si: "Keva Si",
  la_terra: "La Terra",
  little_seal: "Little Seal",
  shoes_cover: "Shoes Cover",
  street_surfing: "Street Surfing",
  gal_kom: "Gal Kom",
};

export function bilbordSlugFromPlanetaBrand(psSlug: string): string {
  const key = psSlug.toLowerCase();
  const mapped = PLANETA_BRAND_TO_SLUG[key];
  if (mapped) return mapped;

  return key.replace(/_/g, "-");
}

export function displayNameFromPlaneta(psSlug: string): string {
  if (DISPLAY_OVERRIDES[psSlug]) return DISPLAY_OVERRIDES[psSlug];

  return psSlug
    .split("_")
    .map((w) => {
      if (w.length <= 3 && w !== "art") return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}
