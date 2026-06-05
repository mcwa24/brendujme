import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import {
  isVercelServerless,
  readScrapedPromotionsSummary,
  runPromotionDetectCli,
} from "@/lib/promotions/scan-cli";
import {
  loadRetailerIdBySlug,
  seedPromotionsFromScraped,
} from "@/lib/seed/promotions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let detectSkipped = false;
  let detectLog = "";

  if (isVercelServerless()) {
    detectSkipped = true;
  } else {
    try {
      detectLog = await runPromotionDetectCli();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Detekcija nije uspela";
      return NextResponse.json(
        { ok: false, error: message, detectLog },
        { status: 500 }
      );
    }
  }

  const db = createSupabaseAdminClient();
  if (!db) {
    return NextResponse.json(
      { error: "Supabase nije konfigurisan" },
      { status: 500 }
    );
  }

  try {
    const retailerIdBySlug = await loadRetailerIdBySlug(db);
    const seed = await seedPromotionsFromScraped(db, retailerIdBySlug);
    const scraped = readScrapedPromotionsSummary();

    if (seed.error && seed.count === 0 && !scraped.promotions.length) {
      return NextResponse.json(
        { ok: false, detectSkipped, ...seed, promotions: [] },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      detectSkipped,
      detectMessage: detectSkipped
        ? "Detekcija preskočena na Vercel-u (Playwright). Koristi lokalni brendujme ili n8n runner."
        : undefined,
      detectLog: detectLog || undefined,
      scrapedAt: scraped.scrapedAt,
      promotionCount: scraped.promotions.length,
      promotions: scraped.promotions,
      seed,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Seed failed",
        detectSkipped,
      },
      { status: 500 }
    );
  }
}
