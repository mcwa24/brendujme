import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import {
  loadRetailerIdBySlug,
  seedPromotionsFromScraped,
} from "@/lib/seed/promotions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const result = await seedPromotionsFromScraped(db, retailerIdBySlug);

    if (result.error && result.count === 0) {
      return NextResponse.json({ ok: false, ...result }, { status: 422 });
    }

    return NextResponse.json({
      ok: true,
      count: result.count,
      expired: result.expired,
      activated: result.activated,
      scrapedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Seed failed" },
      { status: 500 }
    );
  }
}
