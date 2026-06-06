import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkSearchRateLimit } from "@/lib/security/rate-limit";
import { validateSearchQueryParam } from "@/lib/security/sanitize-search-query";
import { searchAllAsync } from "@/lib/search-async";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rate = checkSearchRateLimit(request);
  if (!rate.ok) {
    const res = NextResponse.json(
      { error: "Previše zahteva. Pokušajte ponovo za trenutak." },
      { status: 429 }
    );
    if (rate.retryAfter) {
      res.headers.set("Retry-After", String(rate.retryAfter));
    }
    applySecurityHeaders(res);
    return res;
  }

  const { searchParams } = new URL(request.url);
  const validated = validateSearchQueryParam(searchParams.get("q"));

  if (validated === null) {
    const res = NextResponse.json(
      { error: "Neispravan upit za pretragu." },
      { status: 400 }
    );
    applySecurityHeaders(res);
    return res;
  }

  const results = validated ? await searchAllAsync(validated) : [];
  const res = NextResponse.json(
    { results },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
  applySecurityHeaders(res);
  return res;
}
