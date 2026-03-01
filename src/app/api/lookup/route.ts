import { NextRequest, NextResponse } from "next/server";
import {
  extractDomainFromEmail,
  isFreeEmailDomain,
  isValidEmail,
  normalizeDomain,
} from "@/lib/domain-utils";
import { lookupByDomain } from "@/lib/game-data";
import { computePublisherStats } from "@/lib/analytics";
import { sendReportEmail, sendNoMatchEmail } from "@/lib/email";

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
    // Send no-match email (fire-and-forget)
    sendNoMatchEmail({ to: email, domain: normalizedDomain }).catch((err) =>
      console.error("No-match email send failed:", err)
    );
    return NextResponse.json({ matched: false });
  }

  const publisher_stats = computePublisherStats(games);

  // Send report email (fire-and-forget, don't block response)
  sendReportEmail({
    to: email,
    publisherName: games[0].publisher_name,
    games,
    stats: publisher_stats,
  }).catch((err) => console.error("Email send failed:", err));

  return NextResponse.json({
    matched: true,
    publisher_name: games[0].publisher_name,
    games,
    publisher_stats,
  });
}
