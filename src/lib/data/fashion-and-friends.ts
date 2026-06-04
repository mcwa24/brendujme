/**
 * Katalog brendova sa https://www.fashionandfriends.com/rs/brendovi/
 * (redirect sa fashionandfriends.rs)
 * Poslednja verifikacija: jun 2026
 */

import { bilbordSlugFromFfSlug } from "@/lib/data/ff-brand-slugs";

export interface FashionAndFriendsBrand {
  name: string;
  /** Slug na F&F sajtu */
  ffSlug: string;
  /** Slug u Bilbord direktorijumu, ako postoji */
  bilbordSlug?: string;
  /** Direktan link na brend na F&F */
  url: string;
}

const FF_BASE = "https://www.fashionandfriends.com/rs/brendovi";

const SLUG_TO_NAME: Record<string, string> = {
  "antony-morato": "Antony Morato",
  "armani-exchange": "Armani Exchange",
  bata: "Bata",
  "calvin-klein": "Calvin Klein",
  camper: "Camper",
  "cesare-paciotti": "Cesare Paciotti",
  collegium: "Collegium",
  dekker: "Dekker",
  desigual: "Desigual",
  diesel: "Diesel",
  dkny: "DKNY",
  "dolce-vita": "Dolce Vita",
  "flower-mountain": "Flower Mountain",
  guess: "Guess",
  "guess-jeans": "Guess Jeans",
  hugo: "HUGO",
  "hugo-boss": "BOSS",
  inuikii: "Inuikii",
  "karl-lagerfeld": "Karl Lagerfeld",
  kiko: "KIKO Milano",
  "kurt-geiger": "Kurt Geiger",
  levis: "Levi's",
  "liu-jo": "Liu Jo",
  "love-moschino": "Love Moschino",
  "lyle-scott": "Lyle & Scott",
  "miss-sixty": "Miss Sixty",
  "moschino-jeans": "Moschino Jeans",
  mou: "Mou",
  "new-balance": "New Balance",
  "patrizia-pepe": "Patrizia Pepe",
  premiata: "Premiata",
  replay: "Replay",
  "saint-barth": "Saint Barth",
  "scotch-soda": "Scotch & Soda",
  "steve-madden": "Steve Madden",
  superdry: "Superdry",
  timberland: "Timberland",
  "tommy-hilfiger": "Tommy Hilfiger",
  ugg: "UGG",
  wellensteyn: "Wellensteyn",
};

/** Slugovi sa F&F /brendovi/ stranice (redosled kao na sajtu) */
const FF_BRAND_SLUGS = [
  "bata",
  "calvin-klein",
  "camper",
  "desigual",
  "diesel",
  "guess",
  "inuikii",
  "levis",
  "patrizia-pepe",
  "hugo",
  "lyle-scott",
  "kiko",
  "liu-jo",
  "cesare-paciotti",
  "premiata",
  "replay",
  "scotch-soda",
  "wellensteyn",
  "hugo-boss",
  "steve-madden",
  "antony-morato",
  "armani-exchange",
  "collegium",
  "dekker",
  "dkny",
  "dolce-vita",
  "flower-mountain",
  "guess-jeans",
  "karl-lagerfeld",
  "kurt-geiger",
  "love-moschino",
  "miss-sixty",
  "moschino-jeans",
  "mou",
  "new-balance",
  "saint-barth",
  "superdry",
  "timberland",
  "tommy-hilfiger",
  "ugg",
] as const;

export const fashionAndFriendsBrands: FashionAndFriendsBrand[] = FF_BRAND_SLUGS.map(
  (ffSlug) => ({
    name: SLUG_TO_NAME[ffSlug] ?? ffSlug,
    ffSlug,
    bilbordSlug: bilbordSlugFromFfSlug(ffSlug),
    url: `${FF_BASE}/${ffSlug}`,
  })
);

export const fashionAndFriendsMeta = {
  website: "https://www.fashionandfriends.com/rs/",
  brandsUrl: `${FF_BASE}/`,
  parentCompany: "Fashion Company",
  brandCount: fashionAndFriendsBrands.length,
  lastSynced: "2026-06-04",
};

/** Multibrand Fashion&Friends prodavnice u Srbiji (FC mreža + javni spisak lokacija) */
export interface FashionAndFriendsStore {
  id: string;
  name: string;
  address: string;
  cityLabel: string;
  shoppingCenter?: string;
  shoppingCenterSlug?: string;
}

export const fashionAndFriendsStores: FashionAndFriendsStore[] = [
  {
    id: "ff-rajiceva",
    name: "Fashion&Friends Rajićeva",
    address: "Knez Mihailova 54",
    cityLabel: "Beograd (centar)",
    shoppingCenter: "Rajićeva Shopping Center",
    shoppingCenterSlug: "rajiceva",
  },
  {
    id: "ff-usce",
    name: "Fashion&Friends Ušće",
    address: "Bulevar Mihajla Pupina 4",
    cityLabel: "Novi Beograd",
    shoppingCenter: "Ušće Shopping Center",
    shoppingCenterSlug: "usce",
  },
  {
    id: "ff-delta",
    name: "Fashion&Friends Delta City",
    address: "Jurija Gagarina 16",
    cityLabel: "Novi Beograd",
    shoppingCenter: "Delta City",
    shoppingCenterSlug: "delta-city",
  },
  {
    id: "ff-big-fashion",
    name: "Fashion&Friends Big Fashion",
    address: "Višnjička 84",
    cityLabel: "Beograd",
    shoppingCenter: "Big Fashion",
    shoppingCenterSlug: "big-fashion",
  },
  {
    id: "ff-galerija",
    name: "Fashion&Friends Galerija",
    address: "Galerija Beograd",
    cityLabel: "Beograd",
    shoppingCenter: "Galerija Beograd",
    shoppingCenterSlug: "galerija",
  },
  {
    id: "ff-capitol",
    name: "Fashion&Friends Capitol Park",
    address: "Patrijarha Dimitrija 14",
    cityLabel: "Beograd",
    shoppingCenter: "Capitol Park",
  },
  {
    id: "ff-plaza-kg",
    name: "Fashion&Friends Plaza",
    address: "Dimitrija Tucovića bb",
    cityLabel: "Kragujevac",
    shoppingCenter: "TC Plaza",
  },
  {
    id: "ff-big-ns",
    name: "Fashion&Friends BIG Novi Sad",
    address: "Sentandrejski put 11",
    cityLabel: "Novi Sad",
    shoppingCenter: "TC BIG",
    shoppingCenterSlug: "promenada",
  },
  {
    id: "ff-forum-ni",
    name: "Fashion&Friends Forum",
    address: "Obrenovićeva 42",
    cityLabel: "Niš",
    shoppingCenter: "TC Forum",
  },
];

export function isFashionAndFriendsMultibrandStore(storeName: string): boolean {
  return /fashion\s*&\s*friends/i.test(storeName);
}

export function getFashionAndFriendsBrandByFfSlug(
  ffSlug: string
): FashionAndFriendsBrand | undefined {
  return fashionAndFriendsBrands.find((b) => b.ffSlug === ffSlug);
}

export function getFashionAndFriendsBrandsInBilbord(): FashionAndFriendsBrand[] {
  return fashionAndFriendsBrands.filter((b) => b.bilbordSlug);
}
