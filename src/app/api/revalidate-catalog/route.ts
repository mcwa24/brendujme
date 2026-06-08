import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import { revalidateCatalogCache } from "@/lib/data/catalog-cache";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateCatalogCache();

  return NextResponse.json({ ok: true, revalidated: true });
}
