import type { SupabaseClient } from "@supabase/supabase-js";
import { seedPromotionsFromScraped as seedFromLib } from "../../src/lib/seed/promotions";

export async function seedPromotionsFromScraped(
  db: SupabaseClient,
  retailerIdBySlug: Map<string, string>
): Promise<number> {
  const result = await seedFromLib(db, retailerIdBySlug);
  if (result.error) {
    console.log(`  promotions: ${result.error}`);
  }
  if (result.expired > 0) {
    console.log(`  isteklo u bazi: ${result.expired}`);
  }
  if (result.activated > 0) {
    console.log(`  aktivirano: ${result.activated}`);
  }
  return result.count;
}
