/**
 * Upsert akcija iz retailer-promotions-scraped.json u Supabase.
 * npm run db:seed:promotions
 */

import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";
import { seedPromotionsFromScraped } from "./lib/seed-promotions";

async function loadRetailerIds(
  db: NonNullable<ReturnType<typeof createSupabaseAdminClient>>
): Promise<Map<string, string>> {
  const { data, error } = await db.from("retailers").select("id, slug");
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((r) => [r.slug as string, r.id as string]));
}

async function main() {
  if (!isSupabaseSeedConfigured()) {
    console.error("Postavi NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.local");
    process.exit(1);
  }

  const db = createSupabaseAdminClient();
  if (!db) process.exit(1);

  const retailerIdBySlug = await loadRetailerIds(db);
  const count = await seedPromotionsFromScraped(db, retailerIdBySlug);
  console.log(`Upsertovano ${count} kampanja.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
