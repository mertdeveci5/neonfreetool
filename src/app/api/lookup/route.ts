import { NextRequest, NextResponse } from "next/server";
import {
  extractDomainFromEmail,
  isFreeEmailDomain,
  isValidEmail,
  normalizeDomain,
} from "@/lib/domain-utils";
import { lookupByDomain, getAllGames } from "@/lib/game-data";
import { computeBenchmarks, computePublisherStats } from "@/lib/analytics";
import { IndustryBenchmarks } from "@/lib/types";
import { sendReportEmail } from "@/lib/email";

let cachedBenchmarks: IndustryBenchmarks | null = null;

function getBenchmarks(): IndustryBenchmarks {
  if (!cachedBenchmarks) {
    cachedBenchmarks = computeBenchmarks(getAllGames());
  }
  return cachedBenchmarks;
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  const domain = extractDomainFromEmail(email);
  if (!domain) {
    return NextResponse.json(
      { error: "Could not extract domain from email" },
      { status: 400 }
    );
  }

  if (isFreeEmailDomain(domain)) {
    return NextResponse.json(
      { error: "Please use your work email address" },
      { status: 400 }
    );
  }

  const normalizedDomain = normalizeDomain(domain);
  const games = lookupByDomain(normalizedDomain);

  if (!games || games.length === 0) {
    return NextResponse.json({ matched: false });
  }

  const benchmarks = getBenchmarks();
  const publisher_stats = computePublisherStats(games, benchmarks);

  // Send report email (fire-and-forget, don't block response)
  sendReportEmail({
    to: email,
    publisherName: games[0].publisher_name,
    games,
    stats: publisher_stats,
    benchmarks,
  }).catch((err) => console.error("Email send failed:", err));

  return NextResponse.json({
    matched: true,
    publisher_name: games[0].publisher_name,
    games,
    benchmarks,
    publisher_stats,
  });
}
