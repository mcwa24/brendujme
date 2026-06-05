import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";

export const runtime = "nodejs";

/**
 * Detekcija zahteva Playwright — ne radi na Vercel serverless.
 * n8n: Execute Command na runneru → npm run promotions:detect
 */
export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        "Detekcija se ne pokreće na Vercel-u. Koristi n8n Execute Command: npm run promotions:detect (brendujme repo, Playwright). Zatim POST /api/cron/seed-promotions.",
    },
    { status: 501 }
  );
}
