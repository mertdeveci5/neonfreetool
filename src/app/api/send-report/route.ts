import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, isFreeEmailDomain, extractDomainFromEmail } from "@/lib/domain-utils";
import { lookupByPublisher } from "@/lib/game-data";
import { computePublisherStats } from "@/lib/analytics";
import { sendReportEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  let body: { email?: string; publisherName?: string };
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
  if (!domain || isFreeEmailDomain(domain)) {
    return NextResponse.json(
      { error: "Please use your work email address" },
      { status: 400 }
    );
  }

  const publisherName = body.publisherName?.trim();
  if (!publisherName) {
    return NextResponse.json(
      { error: "Publisher name is required" },
      { status: 400 }
    );
  }

  const games = lookupByPublisher(publisherName);
  if (!games || games.length === 0) {
    return NextResponse.json(
      { error: "Publisher not found" },
      { status: 404 }
    );
  }

  const stats = computePublisherStats(games);

  sendReportEmail({
    to: email,
    publisherName,
    games,
    stats,
  }).catch((err) => console.error("Send-report email failed:", err));

  return NextResponse.json({ success: true });
}
