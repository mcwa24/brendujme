import { NextResponse } from "next/server";
import { searchAllAsync } from "@/lib/search-async";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchAllAsync(q);
  return NextResponse.json({ results });
}
