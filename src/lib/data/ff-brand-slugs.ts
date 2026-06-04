/** Mapiranje F&F slug → Bilbord direktorijum slug */
export const FF_SLUG_TO_BILBORD: Record<string, string> = {
  "scotch-soda": "scotch-and-soda",
  "guess-jeans": "guess",
  "hugo-boss": "boss",
  levis: "levis",
};

export function bilbordSlugFromFfSlug(ffSlug: string): string {
  return FF_SLUG_TO_BILBORD[ffSlug] ?? ffSlug;
}

/** Imena brenda (FC / F&F) → Bilbord slug */
export const BRAND_NAME_TO_SLUG: Record<string, string> = {
  diesel: "diesel",
  replay: "replay",
  guess: "guess",
  "guess jeans": "guess",
  "tommy hilfiger": "tommy-hilfiger",
  "calvin klein": "calvin-klein",
  "calvin klein jeans": "calvin-klein",
  "calvin klein underwear": "calvin-klein",
  "scotch & soda": "scotch-and-soda",
  "scotch&soda": "scotch-and-soda",
  timberland: "timberland",
  mango: "mango",
  maje: "maje",
  "levi's": "levis",
  levis: "levis",
  superdry: "superdry",
  "liu jo": "liu-jo",
  "armani exchange": "armani-exchange",
  "steve madden": "steve-madden",
  "patrizia pepe": "patrizia-pepe",
  "miss sixty": "miss-sixty",
  "cesare paciotti": "cesare-paciotti",
  camper: "camper",
  desigual: "desigual",
  premiata: "premiata",
  ugg: "ugg",
  bata: "bata",
  hugo: "hugo",
  boss: "boss",
  "antony morato": "antony-morato",
  inuikii: "inuikii",
  mou: "mou",
  "saint barth": "saint-barth",
  "lyle & scott": "lyle-scott",
  "lyle scott": "lyle-scott",
  kiko: "kiko",
  "kiko milano": "kiko",
  "new balance": "new-balance",
  dkny: "dkny",
  "karl lagerfeld": "karl-lagerfeld",
  "kurt geiger": "kurt-geiger",
  "love moschino": "love-moschino",
  "moschino jeans": "moschino-jeans",
  wellensteyn: "wellensteyn",
  collegium: "collegium",
  dekker: "dekker",
  "dolce vita": "dolce-vita",
  "flower mountain": "flower-mountain",
};

export function bilbordSlugFromBrandName(brandName: string): string | undefined {
  const key = brandName.toLowerCase().replace(/['']/g, "'").trim();
  return BRAND_NAME_TO_SLUG[key];
}
