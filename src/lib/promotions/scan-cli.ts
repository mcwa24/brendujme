import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";

const execFileAsync = promisify(execFile);

const SCRAPED_PATH = path.join(
  process.cwd(),
  "src/lib/data/retailer-promotions-scraped.json"
);

export interface ScrapedPromotionSummary {
  retailerSlug: string;
  retailerName: string;
  title: string;
  startDate: string;
  endDate: string;
  discountPercent: number | null;
  sourceUrl: string;
}

export function readScrapedPromotionsSummary(): {
  scrapedAt: string | null;
  promotions: ScrapedPromotionSummary[];
} {
  if (!fs.existsSync(SCRAPED_PATH)) {
    return { scrapedAt: null, promotions: [] };
  }

  const raw = JSON.parse(fs.readFileSync(SCRAPED_PATH, "utf8")) as {
    scrapedAt?: string;
    promotions?: ScrapedPromotionSummary[];
  };

  return {
    scrapedAt: raw.scrapedAt ?? null,
    promotions: (raw.promotions ?? []).map((p) => ({
      retailerSlug: p.retailerSlug,
      retailerName: p.retailerName,
      title: p.title,
      startDate: p.startDate,
      endDate: p.endDate,
      discountPercent: p.discountPercent ?? null,
      sourceUrl: p.sourceUrl,
    })),
  };
}

export async function runPromotionDetectCli(): Promise<string> {
  const { stdout, stderr } = await execFileAsync(
    "npm",
    ["run", "promotions:detect"],
    {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 12 * 1024 * 1024,
      timeout: 280_000,
    }
  );

  return [stdout, stderr].filter(Boolean).join("\n").trim();
}

export function isVercelServerless(): boolean {
  return process.env.VERCEL === "1";
}
