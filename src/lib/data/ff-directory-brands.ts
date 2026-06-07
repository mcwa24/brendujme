import type { Brand, CategorySlug, PriceSegment } from "@/types";
import {
  fashionAndFriendsBrands,
  fashionAndFriendsStores,
} from "@/lib/data/fashion-and-friends";
import { bilbordSlugFromFfSlug } from "@/lib/data/ff-brand-slugs";

const FF_BASE = "https://www.fashionandfriends.com/rs/brendovi";

/** Zvanični sajtovi (ne F&F listing stranice) — za sync logoa */
export const BRAND_OFFICIAL_WEBSITES: Record<string, string> = {
  diesel: "https://www.diesel.com",
  replay: "https://www.replayjeans.com",
  guess: "https://www.guess.eu",
  "calvin-klein": "https://www.calvinklein.com",
  "tommy-hilfiger": "https://www.tommy.com",
  superdry: "https://www.superdry.com",
  levis: "https://www.levi.com",
  "liu-jo": "https://www.liujo.com",
  "armani-exchange": "https://www.armani.com",
  "steve-madden": "https://www.stevemadden.com",
  "patrizia-pepe": "https://www.patriziapepe.com",
  "miss-sixty": "https://www.misssixty.com",
  "cesare-paciotti": "https://www.paciotti.com",
  camper: "https://www.camper.com",
  desigual: "https://www.desigual.com",
  premiata: "https://www.premiata.eu",
  ugg: "https://www.ugg.com",
  bata: "https://www.bata.com",
  hugo: "https://www.hugoboss.com",
  boss: "https://www.hugoboss.com",
  "antony-morato": "https://www.anthonymorato.com",
  inuikii: "https://www.inuikii.com",
  mou: "https://www.mou-boots.com",
  "saint-barth": "https://www.saintbarth.com",
  "lyle-scott": "https://www.lyleandscott.com",
  kiko: "https://www.kikocosmetics.com",
  timberland: "https://www.timberland.com",
  "scotch-and-soda": "https://www.scotch-soda.com",
  "new-balance": "https://www.newbalance.com",
  dkny: "https://www.dkny.com",
  "karl-lagerfeld": "https://www.karl.com",
  "kurt-geiger": "https://www.kurtgeiger.com",
  "love-moschino": "https://www.lovemoschino.com",
  "moschino-jeans": "https://www.moschino.com",
  wellensteyn: "https://www.wellensteyn.com",
  collegium: "https://www.collegium.si",
  dekker: "https://www.dekkershoes.com",
  "dolce-vita": "https://www.dolcevita.com",
  "flower-mountain": "https://www.flowermountain.com",
};

const COUNTRIES: Record<string, string> = {
  diesel: "Italija",
  replay: "Italija",
  guess: "SAD",
  superdry: "Velika Britanija",
  levis: "SAD",
  "liu-jo": "Italija",
  "armani-exchange": "Italija",
  "steve-madden": "SAD",
  "patrizia-pepe": "Italija",
  "miss-sixty": "Italija",
  "cesare-paciotti": "Italija",
  camper: "Španija",
  desigual: "Španija",
  premiata: "Italija",
  ugg: "SAD",
  bata: "Švajcarska",
  hugo: "Nemačka",
  boss: "Nemačka",
  "antony-morato": "Italija",
  inuikii: "Švajcarska",
  mou: "Francuska",
  "saint-barth": "Italija",
  "lyle-scott": "Velika Britanija",
  kiko: "Italija",
  "new-balance": "SAD",
  dkny: "SAD",
  "karl-lagerfeld": "Nemačka",
  "kurt-geiger": "Velika Britanija",
  "love-moschino": "Italija",
  "moschino-jeans": "Italija",
  wellensteyn: "Nemačka",
  collegium: "Slovenija",
  dekker: "Holandija",
  "dolce-vita": "SAD",
  "flower-mountain": "Italija",
};

const CATEGORIES: Record<string, CategorySlug> = {
  kiko: "beauty",
  "new-balance": "sports",
  camper: "lifestyle",
  dekker: "lifestyle",
  "flower-mountain": "lifestyle",
  premiata: "lifestyle",
  mou: "lifestyle",
  inuikii: "lifestyle",
  ugg: "lifestyle",
  bata: "lifestyle",
  wellensteyn: "lifestyle",
};

const POPULAR_FF = new Set([
  "diesel",
  "replay",
  "guess",
  "superdry",
  "levis",
  "liu-jo",
  "armani-exchange",
  "patrizia-pepe",
]);

const FEATURED_FF = new Set(["diesel", "replay", "guess"]);

const FF_CENTER_SLUGS = [
  "rajiceva",
  "usce",
  "delta-city",
  "big-fashion",
  "galerija",
];

function ffLocations(slug: string) {
  return fashionAndFriendsStores.map((store, index) => ({
    id: `ff-${slug}-${index}`,
    storeName: store.name,
    retailerSlug: "fashion-company",
    address: store.address,
    city: store.cityLabel,
  }));
}

function buildDescription(name: string): string {
  return (
    `${name} je deo portfolija Fashion Company u Srbiji — dostupan u Fashion&Friends ` +
    `multibrand prodavnicama i na fashionandfriends.com, uz mono-brand lokacije u ` +
    `Beogradu, Novom Sadu, Nišu i Kragujevcu.`
  );
}

function priceForSlug(slug: string): PriceSegment {
  if (slug === "bata" || slug === "collegium") return "mid";
  if (slug === "boss" || slug === "cesare-paciotti" || slug === "premiata")
    return "luxury";
  return "premium";
}

function relatedSlugs(slug: string): string[] {
  const pool = [
    "diesel",
    "replay",
    "guess",
    "superdry",
    "tommy-hilfiger",
    "calvin-klein",
    "levis",
    "liu-jo",
  ].filter((s) => s !== slug);
  return pool.slice(0, 3);
}

/** Brendovi iz F&F kataloga za Bilbord direktorijum (bez duplikata sa postojećim) */
export function buildFashionAndFriendsDirectoryBrands(
  existingSlugs: Set<string>
): Brand[] {
  const result: Brand[] = [];
  const added = new Set<string>();

  for (const ff of fashionAndFriendsBrands) {
    const slug = bilbordSlugFromFfSlug(ff.ffSlug);
    if (existingSlugs.has(slug) || added.has(slug)) continue;
    added.add(slug);

    const website =
      BRAND_OFFICIAL_WEBSITES[slug] ?? `${FF_BASE}/${ff.ffSlug}`;

    result.push({
      slug,
      name: ff.name,
      category: CATEGORIES[slug] ?? "fashion",
      country: COUNTRIES[slug] ?? "Italija",
      website,
      description: buildDescription(ff.name),
      priceSegment: priceForSlug(slug),
      availabilityCount: fashionAndFriendsStores.length + 2,
      featured: FEATURED_FF.has(slug),
      popular: POPULAR_FF.has(slug),
      locations: ffLocations(slug),
      shoppingCenterSlugs: [...FF_CENTER_SLUGS],
      relatedBrandSlugs: relatedSlugs(slug),
    });
  }

  return result;
}
