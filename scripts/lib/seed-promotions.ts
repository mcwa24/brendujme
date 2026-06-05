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
  return result.count;
}
