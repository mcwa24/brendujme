/** Office Shoes naziv brenda → Bilbord slug (postojeći ili novi) */
export const OFFICE_BRAND_TO_SLUG: Record<string, string> = {
  Bama: "bama",
  Birkenstock: "birkenstock",
  Blauer: "blauer",
  BOSS: "boss",
  "BOSS Orange": "boss",
  Buffalo: "buffalo",
  "Calvin Klein": "calvin-klein",
  "Calvin Klein Jeans": "calvin-klein",
  Cartago: "cartago",
  Collonil: "collonil",
  Converse: "converse",
  Crocs: "crocs",
  DFNS: "dfns",
  "Dr Martens": "dr-martens",
  "G-Star Raw": "g-star-raw",
  GAP: "gap",
  Gant: "gant",
  Guess: "guess",
  HUGO: "hugo",
  Ipanema: "ipanema",
  "Karl Lagerfeld": "karl-lagerfeld",
  Kickers: "kickers",
  Lacoste: "lacoste",
  Levis: "levis",
  Lumberjack: "lumberjack",
  "Moon Boot": "moon-boot",
  Napapijri: "napapijri",
  "New Balance": "new-balance",
  Palladium: "palladium",
  "Pepe Jeans": "pepe-jeans",
  "Polo Ralph Lauren": "polo-ralph-lauren",
  Puma: "puma",
  Replay: "replay",
  Rider: "rider",
  Skechers: "skechers",
  "Steve Madden": "steve-madden",
  Superdry: "superdry",
  Timberland: "timberland",
  "Tommy Hilfiger": "tommy-hilfiger",
  UGG: "ugg",
  Vagabond: "vagabond",
  Vans: "vans",
  Zaxy: "zaxy",
};

export function bilbordSlugFromOfficeBrand(name: string): string {
  const mapped = OFFICE_BRAND_TO_SLUG[name.trim()];
  if (mapped) return mapped;

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
