import { NextRequest, NextResponse } from "next/server";
import { lookupByPublisher } from "@/lib/game-data";
import { computePublisherStats } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json(
      { error: "Missing publisher name" },
      { status: 400 }
    );
  }

  const games = lookupByPublisher(name);

  if (!games || games.length === 0) {
    return NextResponse.json({ matched: false });
  }

  const publisher_stats = computePublisherStats(games);

  return NextResponse.json({
    matched: true,
    publisher_name: games[0].publisher_name,
    games,
    publisher_stats,
  });
}
