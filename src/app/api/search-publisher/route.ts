import { NextRequest, NextResponse } from "next/server";
import { searchPublishers } from "@/lib/game-data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = searchPublishers(q, 8);
  return NextResponse.json({ results });
}
