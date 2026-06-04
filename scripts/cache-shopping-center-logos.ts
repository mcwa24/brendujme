/**
 * Preuzima zvanične logotipe tržnih centara u public/shopping-centers/
 * Pokretanje: npm run centers:cache
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public/shopping-centers");

const DOWNLOADS: { slug: string; url: string; file: string }[] = [
  {
    slug: "usce",
    url: "https://usceshoppingcenter.rs/wp-content/uploads/2017/03/Logo-usce.png",
    file: "usce.png",
  },
  {
    slug: "galerija",
    url: "https://www.galerijabelgrade.com/android-chrome-512x512.png",
    file: "galerija.png",
  },
  {
    slug: "delta-city",
    url: "https://www.deltacity.rs/wp-content/uploads/2024/12/delta-logo.jpg",
    file: "delta-city.jpg",
  },
  {
    slug: "big-fashion",
    url: "https://www.bigcenters.rs/beograd/wp-content/uploads/sites/3/2022/02/big-fashion-logo.png",
    file: "big-fashion.png",
  },
  {
    slug: "promenada",
    url: "https://www.bigcenters.rs/novi-sad/wp-content/uploads/sites/4/2022/03/BIG-logo-01.png",
    file: "promenada.png",
  },
  {
    slug: "mercator",
    url: "https://mercatorcentar.rs/wp-content/themes/mercator/img/mercator_logo.png",
    file: "mercator.png",
  },
  {
    slug: "stadion",
    url: "https://stadionshoppingcenter.rs/wp-content/themes/Stadion/images/stadion-logo.png",
    file: "stadion.png",
  },
  {
    slug: "kragujevac-plaza",
    url: "https://www.bigcenters.rs/kragujevac/wp-content/uploads/sites/7/2022/03/big-fashion-logo-1.png",
    file: "kragujevac-plaza.png",
  },
  {
    slug: "zlatibor",
    url: "https://cdn.cpi-europe.com/uploads/production/602b986b5851a4f31d39b6b0/stopshop_logo_rgb_v1.png",
    file: "zlatibor.png",
  },
  {
    slug: "rajiceva",
    url: "https://www.rajicevashoppingcenter.rs/wp-content/uploads/2022/11/rajiceva-logo-crn.jpg",
    file: "rajiceva.jpg",
  },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const item of DOWNLOADS) {
    const res = await fetch(item.url, {
      headers: { "User-Agent": "BilbordBrands/1.0 (logo cache)" },
    });
    if (!res.ok) {
      console.error(`✗ ${item.slug}: HTTP ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const outPath = path.join(OUT_DIR, item.file);
    await writeFile(outPath, buf);
    console.log(`✓ ${item.slug} → ${item.file} (${buf.length} B)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
