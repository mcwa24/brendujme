/**
 * Brza provera broja brendova/prodavaca na lokalnom sajtu.
 * npx tsx scripts/check-site-catalog.ts
 */

const BASE = (process.env.CHECK_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function countMatches(path: string, pattern: RegExp): Promise<number> {
  const res = await fetch(`${BASE}${path}`);
  const html = await res.text();
  const matches = html.match(pattern);
  return matches ? new Set(matches).size : 0;
}

async function main() {
  const retailers = await countMatches("/retailers", /href="\/retailers\/[^"]+"/g);
  const brands = await countMatches("/brands", /href="\/brands\/[^"]+"/g);
  const urbanBrands = await countMatches(
    "/retailers/urban-shop",
    /href="\/brands\/[^"]+"/g
  );
  const hasUrban = (await fetch(`${BASE}/retailers`)).text().then((h) =>
    h.includes("urban-shop")
  );

  console.log(`Prodavci (/retailers): ${retailers}`);
  console.log(`Brendovi (/brands): ${brands}`);
  console.log(`Urban Shop brendovi: ${urbanBrands}`);
  console.log(`Urban Shop u listi: ${await hasUrban ? "da" : "ne"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
