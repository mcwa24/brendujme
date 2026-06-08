/** Urban Shop naziv brenda → Bilbord slug */
export const URBAN_SHOP_BRAND_TO_SLUG: Record<string, string> = {
  "Alpha Industries": "alpha-industries",
  Bench: "bench",
  "CAT Bags": "cat-bags",
  "CAT Footwear": "cat-footwear",
  "Dr. Martens": "dr-martens",
  "DVS Shoes": "dvs-shoes",
  Etnies: "etnies",
  "Fred Perry": "fred-perry",
  Globe: "globe",
  "Jet Lag": "jet-lag",
  Miltec: "miltec",
  Nevermind: "nevermind",
  Salomon: "salomon",
  "Shellys Rangers": "shellys-rangers",
  Superdry: "superdry",
  Surplus: "surplus",
  "Vintage Industries": "vintage-industries",
};

export function bilbordSlugFromUrbanShopBrand(name: string): string {
  const mapped = URBAN_SHOP_BRAND_TO_SLUG[name.trim()];
  if (mapped) return mapped;

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
