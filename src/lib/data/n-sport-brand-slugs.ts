import { bilbordSlugFromBrandName } from "@/lib/data/ff-brand-slugs";
import { bilbordSlugFromOfficeBrand } from "@/lib/data/office-brand-slugs";

/** N Sport naziv brenda → Bilbord slug */
const NSPORT_BRAND_OVERRIDES: Record<string, string> = {
  "361 Degrees": "361-degrees",
  "4F": "4f",
  Adidas: "adidas",
  AUTRY: "autry",
  "Armani Exchange": "armani-exchange",
  Asics: "asics",
  Cat: "cat-footwear",
  Champion: "champion",
  Converse: "converse",
  Crocs: "crocs",
  "Dr.Martens": "dr-martens",
  "Dr Martens": "dr-martens",
  EA7: "ea7",
  Ellesse: "ellesse",
  Fila: "fila",
  "Fire+Ice": "fire-ice",
  Guess: "guess",
  "Harmont&Blaine": "harmont-blaine",
  "Hey Dude": "hey-dude",
  Hoka: "hoka",
  HUGO: "hugo",
  "Ice Peak": "icepeak",
  "Jack & Jones": "jack-jones",
  "Karl Lagerfeld": "karl-lagerfeld",
  "Liu Jo": "liu-jo",
  "Lyle&Scott": "lyle-scott",
  "Michael  Kors": "michael-kors",
  "Moon Boot": "moon-boot",
  "New Balance": "new-balance",
  "New Era": "new-era",
  Nike: "nike",
  On: "on-running",
  Puma: "puma",
  Reebok: "reebok",
  Salomon: "salomon",
  SELECTED: "selected",
  Selected: "selected",
  Skechers: "skechers",
  Speedo: "speedo",
  "Steve Madden": "steve-madden",
  Superdry: "superdry",
  Timberland: "timberland",
  "Tommy Hilfiger": "tommy-hilfiger",
  "Tom Tailor": "tom-tailor",
  "Under Armour": "under-armour",
  Ugg: "ugg",
  UGG: "ugg",
  "Vero Moda": "vero-moda",
  "Versace Jeans": "versace-jeans",
};

export function bilbordSlugFromNSportBrand(name: string): string {
  const trimmed = name.trim();
  const override = NSPORT_BRAND_OVERRIDES[trimmed];
  if (override) return override;

  const fromFf = bilbordSlugFromBrandName(trimmed);
  if (fromFf) return fromFf;

  return bilbordSlugFromOfficeBrand(trimmed);
}
