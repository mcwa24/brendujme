/**
 * Jednokratno spajanje lokacija iz browser/CDP ekstrakcije u djak-sport-scraped.json
 * (kad Playwright ne prolazi Cloudflare na /lokacije).
 */
const fs = require("fs");
const path = require("path");

const SCRAPED = path.join(
  process.cwd(),
  "src/lib/data/djak-sport-scraped.json"
);
const RAW = process.argv[2];
if (!RAW) {
  console.error("Usage: node scripts/merge-djak-stores-from-browser.js <stores.json>");
  process.exit(1);
}

const MALL_PATTERNS = [
  [/u[sš][cć]e|arena.*beograd/i, "usce"],
  [/delta|gagarina/i, "delta-city"],
  [/galerija|vilsona|ada mall|bw\b/i, "galerija"],
  [/raji[cć]eva|knez mihailova/i, "rajiceva"],
  [/big fashion|tc big|big cee|uralska|karaburma|rakovica/i, "big-fashion"],
  [/promenada|sentandrejski|futoški/i, "promenada"],
  [/stadion|voždovac|vozdovac|zaplanjska/i, "stadion"],
  [/merkator|mercator|forum park/i, "mercator"],
  [/stop shop|zlatibor/i, "zlatibor"],
  [/plaza|kragujevac.*big|dimitrija tucovi/i, "kragujevac-plaza"],
  [/capitol/i, "promenada"],
];

function slugify(t) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cityFromName(name) {
  const m = name.match(/^(.+?)\s*-\s*/);
  return m ? m[1].trim() : name;
}

function inferMall(name, address) {
  const hay = `${name} ${address}`;
  for (const [re, slug] of MALL_PATTERNS) {
    if (re.test(hay)) return slug;
  }
  return null;
}

function storePathFromUrl(url) {
  try {
    const p = new URL(url).pathname;
    const m = p.match(/\/lokacije\/([^/]+)/i);
    return m ? decodeURIComponent(m[1]) : slugify(p);
  } catch {
    return slugify(url);
  }
}

const rawItems = JSON.parse(fs.readFileSync(RAW, "utf8"));
const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8"));

const stores = rawItems.map((it) => {
  const name = String(it.name || "");
  const city = String(it.city || "").trim() || cityFromName(name);
  const address = String(it.address || "").trim() || name;
  const storeUrl = String(it.storeUrl || "");
  return {
    path: storePathFromUrl(storeUrl || name),
    name,
    address,
    postalCode: String(it.zip || ""),
    city,
    citySlug: slugify(city),
    phone: null,
    email: null,
    shoppingCenterSlug: inferMall(name, address),
    latitude: it.lat != null ? Number(it.lat) : null,
    longitude: it.lng != null ? Number(it.lng) : null,
    storeUrl: storeUrl || "https://www.djaksport.com/lokacije/",
  };
});

scraped.stores = stores;
fs.writeFileSync(SCRAPED, `${JSON.stringify(scraped, null, 2)}\n`);
console.log(`Upisano ${stores.length} prodavnica u ${SCRAPED}`);
