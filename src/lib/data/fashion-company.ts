/**
 * Podaci preuzeti sa https://www.fashioncompany.rs
 * - Portfolio brendova: /brands/
 * - Prodajna mesta: /loyalty-program/ (tabela prodavnica)
 * - Dopune iz vesti na sajtu (Galerija, Ušće, Maje, itd.)
 * Poslednja verifikacija: jun 2026
 */

import { bilbordSlugFromBrandName } from "@/lib/data/ff-brand-slugs";

export interface FashionCompanyBrand {
  name: string;
  slug?: string;
}

export interface FashionCompanyStore {
  id: string;
  storeName: string;
  brandName: string;
  brandSlug?: string;
  city: string;
  cityLabel: string;
  address: string;
  shoppingCenter?: string;
  shoppingCenterSlug?: string;
  source: "loyalty" | "news";
}

const CITY_LABELS: Record<string, string> = {
  BG: "Beograd (centar)",
  NBG: "Novi Beograd",
  NS: "Novi Sad",
  NI: "Niš",
  KG: "Kragujevac",
};

/** Portfolio sa fashioncompany.rs/brands/ */
export const fashionCompanyBrands: FashionCompanyBrand[] = [
  { name: "Moose Knuckles" },
  { name: "BOSS" },
  { name: "HUGO" },
  { name: "Fedeli" },
  { name: "Lyle & Scott" },
  { name: "Diesel" },
  { name: "Replay" },
  { name: "Tommy Hilfiger", slug: "tommy-hilfiger" },
  { name: "Guess", slug: "guess" },
  { name: "Calvin Klein", slug: "calvin-klein" },
  { name: "Scotch & Soda", slug: "scotch-and-soda" },
  { name: "Liu Jo" },
  { name: "Superdry" },
  { name: "Miss Sixty" },
  { name: "Patrizia Pepe" },
  { name: "Steve Madden" },
  { name: "Dstrezzed" },
  { name: "Timberland", slug: "timberland" },
  { name: "Levi's" },
  { name: "Mango", slug: "mango" },
  { name: "Desigual" },
  { name: "Cesare Paciotti" },
  { name: "Premiata" },
  { name: "Camper" },
  { name: "UGG" },
  { name: "Bata" },
  { name: "Maje" },
  { name: "Armani Exchange" },
  { name: "Antony Morato" },
  { name: "Inuikii" },
  { name: "Mou" },
  { name: "Saint Barth" },
];

function centerSlugFromStore(name: string): string | undefined {
  const n = name.toLowerCase();
  if (n.includes("rajićeva") || n.includes("rajiceva")) return "rajiceva";
  if (n.includes("ušće") || n.includes("usce")) return "usce";
  if (n.includes("delta")) return "delta-city";
  if (n.includes("big fashion") || n.includes("big")) {
    if (n.includes("forum")) return undefined;
    return n.includes("novi sad") || n.includes("tc big") ? "promenada" : "big-fashion";
  }
  if (n.includes("merkator")) return "mercator";
  if (n.includes("plaza") && n.includes("kg")) return "kragujevac-plaza";
  if (n.includes("forum")) return "mercator";
  if (n.includes("galerija")) return "galerija";
  return undefined;
}

function extractBrandFromStore(storeName: string): string {
  const mono = [
    "Replay Store",
    "Cesare Paciotti",
    "SUPERDRY",
    "Camper Store",
    "Diesel",
    "Guess",
    "DENIM LAB",
    "Bata City Store",
    "Bata BIG FASHION",
    "Fashion&Friends",
    "FASHION&FRIENDS",
  ];
  for (const m of mono) {
    if (storeName.startsWith(m) || storeName === m) return m.replace(" Store", "");
  }
  const beforeComma = storeName.split(",")[0]?.trim() ?? storeName;
  return beforeComma.replace(/,.*$/, "").trim();
}

function brandSlugForName(brandName: string): string | undefined {
  return bilbordSlugFromBrandName(brandName);
}

function parseStore(
  id: string,
  storeName: string,
  cityCode: string,
  address: string,
  source: "loyalty" | "news" = "loyalty"
): FashionCompanyStore {
  const brandName = extractBrandFromStore(storeName);
  const shoppingCenter = storeName.includes(",")
    ? storeName.split(",").slice(1).join(",").trim()
    : undefined;

  return {
    id,
    storeName,
    brandName,
    brandSlug: brandSlugForName(brandName.toLowerCase()),
    city: cityCode,
    cityLabel: CITY_LABELS[cityCode] ?? cityCode,
    address,
    shoppingCenter,
    shoppingCenterSlug: centerSlugFromStore(storeName + (shoppingCenter ?? "")),
    source,
  };
}

/** 40 prodavnica iz loyalty programa + novije lokacije iz vesti */
export const fashionCompanyStores: FashionCompanyStore[] = [
  parseStore("1", "Replay Store", "BG", "Knez Mihailova 33"),
  parseStore("2", "Cesare Paciotti", "BG", "Knez Mihailova 30"),
  parseStore("3", "SUPERDRY", "BG", "Knez Mihailova 33"),
  parseStore("4", "Camper Store", "BG", "Terazije 31"),
  parseStore("5", "FASHION&FRIENDS, Rajićeva SC", "BG", "Knez Mihailova 54"),
  parseStore("6", "Scotch&Soda, Rajićeva SC", "BG", "Knez Mihailova 54"),
  parseStore("7", "Levi's, Rajićeva SC", "BG", "Knez Mihailova 54"),
  parseStore("8", "Timberland, Rajićeva SC", "BG", "Knez Mihailova 54"),
  parseStore("9", "Calvin Klein jeans, Rajićeva SC", "BG", "Knez Mihailova 54"),
  parseStore("10", "Tommy Hilfiger, Rajićeva SC", "BG", "Knez Mihailova 54"),
  parseStore("11", "Bata City Store, TC Ušće", "NBG", "Bulevar Mihajla Pupina 4"),
  parseStore("12", "Diesel, TC Ušće", "NBG", "Bulevar Mihajla Pupina 4"),
  parseStore("13", "Fashion&Friends, TC Ušće", "NBG", "Bulevar Mihajla Pupina 4"),
  parseStore("14", "Guess, TC Ušće", "NBG", "Bulevar Mihajla Pupina 4"),
  parseStore("15", "Timberland, TC Ušće", "NBG", "Bulevar Mihajla Pupina 4"),
  parseStore("16", "Tommy Hilfiger, TC Ušće", "NBG", "Bulevar Mihajla Pupina 4"),
  parseStore("17", "Levis, TC Ušće", "NBG", "Bulevar Mihajla Pupina 4"),
  parseStore("18", "Calvin Klein Underwear Ušće", "NBG", "Bulevar Mihajla Pupina 4"),
  parseStore("19", "Bata City Store, TC Delta City", "NBG", "Jurija Gagarina 16"),
  parseStore("20", "Fashion&Friends, TC Delta City", "NBG", "Jurija Gagarina 16"),
  parseStore("21", "Timberland, TC Delta City", "NBG", "Jurija Gagarina 16"),
  parseStore("22", "Guess Jeans, TC Delta City", "NBG", "Jurija Gagarina 16"),
  parseStore("23", "Calvin Klein Underwear Delta city", "NBG", "Jurija Gagarina 16"),
  parseStore("24", "DENIM LAB, Delta city", "NBG", "Jurija Gagarina 16"),
  parseStore("25", "Bata City Store, Merkator", "NBG", "Bulevar Umetnosti 4"),
  parseStore("26", "Fashion&Friends BIG FASHION", "BG", "Višnjička 84"),
  parseStore("27", "Bata BIG FASHION", "BG", "Višnjička 84"),
  parseStore("28", "Fashion&Friends, TC Plaza", "KG", "Dimitrija Tucovića bb"),
  parseStore("29", "Tommy Hilfiger", "NS", "Zmaj Jovina 19"),
  parseStore("30", "Timberland", "NS", "Zmaj Jovina 5"),
  parseStore("31", "Levi's", "NS", "Zmaj Jovina 8"),
  parseStore("32", "Replay", "NS", "Zmaj Jovina 10"),
  parseStore("33", "Bata City Store, Merkator", "NS", "Bulevar Oslobođenja 102"),
  parseStore("34", "Bata City Store, TC BIG", "NS", "Sentandrejski put 11"),
  parseStore("35", "Fashion&Friends, TC BIG", "NS", "Sentandrejski put 11"),
  parseStore("36", "Guess", "NS", "Pozorišni trg 7"),
  parseStore("37", "Fashion&Friends, TC Forum", "NI", "Obrenovićeva 42"),
  parseStore("38", "Bata City Store, TC Forum", "NI", "Obrenovićeva 42"),
  parseStore("39", "Levis, TC Forum", "NI", "Obrenovićeva 42"),
  parseStore("40", "Tommy Hilfiger, TC Forum", "NI", "Obrenovićeva 42"),
  // Novije lokacije iz vesti na fashioncompany.rs (2025–2026)
  {
    id: "news-mango-usce",
    storeName: "Mango, Ušće Shopping Center",
    brandName: "Mango",
    brandSlug: "mango",
    city: "NBG",
    cityLabel: CITY_LABELS.NBG,
    address: "Bulevar Mihajla Pupina 4",
    shoppingCenter: "Ušće Shopping Center",
    shoppingCenterSlug: "usce",
    source: "news",
  },
  {
    id: "news-scotch-galerija",
    storeName: "Scotch & Soda, Galerija Beograd",
    brandName: "Scotch & Soda",
    brandSlug: "scotch-and-soda",
    city: "NBG",
    cityLabel: "Beograd",
    address: "Galerija Beograd, 1. sprat",
    shoppingCenter: "Galerija Beograd",
    shoppingCenterSlug: "galerija",
    source: "news",
  },
  {
    id: "news-superdry-galerija",
    storeName: "Superdry, Galerija Beograd",
    brandName: "Superdry",
    city: "NBG",
    cityLabel: "Beograd",
    address: "Galerija Beograd",
    shoppingCenter: "Galerija Beograd",
    shoppingCenterSlug: "galerija",
    source: "news",
  },
  {
    id: "news-timberland-galerija",
    storeName: "Timberland, Galerija Beograd",
    brandName: "Timberland",
    brandSlug: "timberland",
    city: "NBG",
    cityLabel: "Beograd",
    address: "Galerija Beograd, 1. sprat",
    shoppingCenter: "Galerija Beograd",
    shoppingCenterSlug: "galerija",
    source: "news",
  },
  {
    id: "news-maje-beograd",
    storeName: "Maje (prva radnja u regionu)",
    brandName: "Maje",
    city: "BG",
    cityLabel: "Beograd",
    address: "Beograd — lokacija na sajtu Fashion Company",
    source: "news",
  },
];

export const fashionCompanyMeta = {
  website: "https://www.fashioncompany.rs",
  brandsUrl: "https://www.fashioncompany.rs/brands/",
  storesUrl: "https://www.fashioncompany.rs/loyalty-program/",
  headquarters: "Bulevar Mihajla Pupina 115b, 11070 Novi Beograd",
  phone: "+381 11 3532 497",
  storeCount: fashionCompanyStores.length,
  brandCount: fashionCompanyBrands.length,
  lastSynced: "2026-06-04",
};

export function getFashionCompanyStoresByCity(): Record<string, FashionCompanyStore[]> {
  const grouped: Record<string, FashionCompanyStore[]> = {};
  for (const store of fashionCompanyStores) {
    if (!grouped[store.cityLabel]) grouped[store.cityLabel] = [];
    grouped[store.cityLabel].push(store);
  }
  return grouped;
}

export function getFashionCompanyStoresByBrand(
  brandSlug: string
): FashionCompanyStore[] {
  return fashionCompanyStores.filter((s) => s.brandSlug === brandSlug);
}

export function getFashionCompanyBrandsInDirectory(): FashionCompanyBrand[] {
  const withProfile = fashionCompanyBrands.filter((b) => b.slug);
  const withoutProfile = fashionCompanyBrands.filter((b) => !b.slug);
  return [...withProfile, ...withoutProfile];
}
