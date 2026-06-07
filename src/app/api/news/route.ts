import { NextResponse } from "next/server";
import { getNewsPage } from "@/lib/data/repository";
import { NEWS_PAGE_SIZE } from "@/lib/news/constants";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  try {
    const result = await getNewsPage(page, NEWS_PAGE_SIZE);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Učitavanje vesti nije uspelo" },
      { status: 500 }
    );
  }
}
