/**
 * Generiše fashion-sport-serbia-scraped.json iz FC/FF podataka + kuriranih lokacija
 * npx tsx scripts/build-fashion-sport-scraped.ts
 */

import fs from "fs";
import path from "path";
import { fashionCompanyStores } from "../src/lib/data/fashion-company";
import { fashionAndFriendsStores } from "../src/lib/data/fashion-and-friends";

const OUT = path.join(process.cwd(), "src/lib/data/fashion-sport-serbia-scraped.json");

export interface FsStore {
  brandSlug: string;
  name: string;
  address: string;
  city: string;
  citySlug: string;
  shoppingCenterSlug: string | null;
  retailerSlug: string;
  storeUrl: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cityFromLabel(label: string): string {
  if (/novi beograd|nbg/i.test(label)) return "Beograd";
  if (/beograd|centar/i.test(label)) return "Beograd";
  if (/novi sad/i.test(label)) return "Novi Sad";
  if (/niš|nis/i.test(label)) return "Niš";
  if (/kragujevac/i.test(label)) return "Kragujevac";
  return label.split("(")[0]?.trim() || label;
}

const stores: FsStore[] = [];

// Fashion Company — sve fizičke lokacije (agregat)
for (const s of fashionCompanyStores) {
  const city = cityFromLabel(s.cityLabel);
  stores.push({
    brandSlug: "fashion-company",
    name: s.storeName,
    address: s.address,
    city,
    citySlug: slugify(city),
    shoppingCenterSlug: s.shoppingCenterSlug ?? null,
    retailerSlug: "fashion-company",
    storeUrl: "https://www.fashioncompany.rs/",
  });
}

// Mono-brand Diesel / Levi's iz FC
for (const s of fashionCompanyStores) {
  const bn = s.brandName.toLowerCase();
  if (!bn.includes("diesel") && !bn.includes("levi")) continue;
  const slug = bn.includes("diesel") ? "diesel" : "levis";
  const city = cityFromLabel(s.cityLabel);
  stores.push({
    brandSlug: slug,
    name: s.storeName,
    address: s.address,
    city,
    citySlug: slugify(city),
    shoppingCenterSlug: s.shoppingCenterSlug ?? null,
    retailerSlug: "fashion-company",
    storeUrl: "https://www.fashioncompany.rs/",
  });
}

// Fashion&Friends
for (const s of fashionAndFriendsStores) {
  const city = cityFromLabel(s.cityLabel);
  stores.push({
    brandSlug: "fashion-friends",
    name: s.name,
    address: s.address,
    city,
    citySlug: slugify(city),
    shoppingCenterSlug: s.shoppingCenterSlug ?? null,
    retailerSlug: "fashion-friends",
    storeUrl: "https://www.fashionandfriends.com/rs/",
  });
}

// Extra Sports (Sport Vision grupa) — uzorak ključnih
const extraSports: Omit<FsStore, "brandSlug" | "retailerSlug">[] = [
  { name: "Extra Sports Roda", address: "Đorđa Stanojevića 35", city: "Beograd", citySlug: "beograd", shoppingCenterSlug: null, storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports Stadion", address: "Zaplanjska 32, TC Stadion", city: "Beograd", citySlug: "beograd", shoppingCenterSlug: "stadion", storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports Borča", address: "Bratstva i jedinstva 2g", city: "Beograd", citySlug: "beograd", shoppingCenterSlug: null, storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports BIG Novi Sad", address: "Sentandrejski put 11", city: "Novi Sad", citySlug: "novi-sad", shoppingCenterSlug: "promenada", storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports Delta Niš", address: "Bulevar Nemanjića 11b", city: "Niš", citySlug: "nis", shoppingCenterSlug: "delta-city", storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports Kragujevac", address: "Bulevar Kraljice Marije 56", city: "Kragujevac", citySlug: "kragujevac", shoppingCenterSlug: "kragujevac-plaza", storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports Šabac", address: "Cara Dušana 1", city: "Šabac", citySlug: "sabac", shoppingCenterSlug: null, storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports Čačak", address: "Braće Spasića bb", city: "Čačak", citySlug: "cacak", shoppingCenterSlug: null, storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports Subotica", address: "Segedinski put 88", city: "Subotica", citySlug: "subotica", shoppingCenterSlug: null, storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
  { name: "Extra Sports Zrenjanin", address: "Bagljaš zapad 5", city: "Zrenjanin", citySlug: "zrenjanin", shoppingCenterSlug: "big-fashion", storeUrl: "https://www.extrasports.com/SRB_rs/prodavnice" },
];
for (const s of extraSports) {
  stores.push({ ...s, brandSlug: "extra-sports", retailerSlug: "extra-sports" });
}

// Run'n More
stores.push({
  brandSlug: "run-n-more",
  name: "Runnmore",
  address: "Uzun Mirkova 10",
  city: "Beograd",
  citySlug: "beograd",
  shoppingCenterSlug: null,
  retailerSlug: "run-n-more",
  storeUrl: "https://www.runnmore.com/",
});

// Burberry (istorijska mono-boutique lokacija)
stores.push({
  brandSlug: "burberry",
  name: "Burberry",
  address: "Terazije 28",
  city: "Beograd",
  citySlug: "beograd",
  shoppingCenterSlug: null,
  retailerSlug: "burberry",
  storeUrl: "https://www.fashioncompany.rs/",
});

// adidas Originals (Trendmaker / zvanične lokacije)
const originals: Omit<FsStore, "brandSlug" | "retailerSlug">[] = [
  { name: "adidas Originals Knez", address: "Knez Mihailova 33", city: "Beograd", citySlug: "beograd", shoppingCenterSlug: "rajiceva", storeUrl: "https://adidasoriginals.rs/" },
  { name: "adidas Store Ušće", address: "Bulevar Mihajla Pupina 6", city: "Beograd", citySlug: "beograd", shoppingCenterSlug: "usce", storeUrl: "https://adidasoriginals.rs/" },
  { name: "adidas Store Delta City", address: "Jurija Gagarina 16", city: "Beograd", citySlug: "beograd", shoppingCenterSlug: "delta-city", storeUrl: "https://adidasoriginals.rs/" },
  { name: "adidas Store Galerija", address: "Bulevar Vudroa Vilsona 12", city: "Beograd", citySlug: "beograd", shoppingCenterSlug: "galerija", storeUrl: "https://adidasoriginals.rs/" },
  { name: "adidas Store Promenada", address: "Bulevar Oslobođenja 119", city: "Novi Sad", citySlug: "novi-sad", shoppingCenterSlug: "promenada", storeUrl: "https://adidasoriginals.rs/" },
  { name: "adidas Store Delta Niš", address: "Bulevar Nemanjića 11b", city: "Niš", citySlug: "nis", shoppingCenterSlug: "delta-city", storeUrl: "https://adidasoriginals.rs/" },
  { name: "adidas Store Novi Pazar", address: "Avnoja bb", city: "Novi Pazar", citySlug: "novi-pazar", shoppingCenterSlug: null, storeUrl: "https://adidasoriginals.rs/" },
];
for (const s of originals) {
  stores.push({ ...s, brandSlug: "adidas-originals", retailerSlug: "adidas-originals" });
}

const payload = {
  scrapedAt: new Date().toISOString(),
  sourceNote:
    "FC fashioncompany.rs; F&F; Extra Sports extrasports.com; Runnmore; Burberry Terazije 28; adidas Originals trendmaker/adidasoriginals.rs (Tike → scrape:tike)",
  brands: [
    "fashion-company",
    "fashion-friends",
    "diesel",
    "levis",
    "burberry",
    "adidas-originals",
    "extra-sports",
    "run-n-more",
  ],
  stores,
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${stores.length} stores → ${OUT}`);
