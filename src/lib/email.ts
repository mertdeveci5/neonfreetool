import { Resend } from "resend";
import { PublisherStats, Game } from "./types";
import { formatCurrency, formatPercent } from "./format";

const resend = new Resend(process.env.RESEND_API_KEY);

// Override recipient for demo/sandbox — all reports go to this address
const DEMO_RECIPIENT = "mert@troylabs.io";

// 15-minute delay for all emails
const SEND_DELAY_MS = 15 * 60 * 1000;

function getScheduledAt(): string {
  return new Date(Date.now() + SEND_DELAY_MS).toISOString();
}

function extractFirstName(email: string): string | null {
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 1 && parts[0].length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }
  return null;
}

// ─── Matched publisher report email ───────────────────────────────────

interface ReportEmailParams {
  to: string;
  publisherName: string;
  games: Game[];
  stats: PublisherStats;
}

export async function sendReportEmail({
  to,
  publisherName,
  games,
  stats,
}: ReportEmailParams) {
  const dtc = stats.dtc_uplift;
  const firstName = extractFirstName(to);
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const usRevenue = stats.country_revenues["us"] || 0;
  const nonUsRevenue = stats.total_revenue - usRevenue;

  // Top 5 games by revenue
  const topGames = [...games]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8e4df;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="text-align:center;padding:0 0 32px;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#c4956a;margin:0 0 12px;">
            DTC Revenue Insights
          </p>
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#e8e4df;margin:0 0 8px;">
            Revenue Report for ${publisherName}
          </h1>
          <p style="font-size:14px;color:#8a8580;margin:0;">
            ${games.length} game${games.length !== 1 ? "s" : ""} analyzed · ${dtc.supergenre} portfolio
          </p>
        </td></tr>

        <!-- Personal greeting -->
        <tr><td style="padding:0 0 24px;">
          <p style="font-size:14px;color:#e8e4df;margin:0 0 8px;">${greeting}</p>
          <p style="font-size:14px;color:#8a8580;margin:0;line-height:1.6;">
            Thank you for using Neon's revenue insights tool. We've analyzed ${publisherName}'s portfolio to estimate the revenue uplift from shifting to direct-to-consumer channels. Here's what we found.
          </p>
        </td></tr>

        <!-- Hero: Uplift range -->
        <tr><td style="background-color:#222222;border:1px solid #2e2e2e;padding:32px;text-align:center;margin-bottom:1px;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#c4956a;margin:0 0 8px;">
            Estimated DTC Revenue Uplift
          </p>
          <h2 style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#e8e4df;margin:0 0 8px;">
            ${formatCurrency(dtc.uplift_low)} – ${formatCurrency(dtc.uplift_high)}
          </h2>
          <p style="font-size:14px;color:#8a8580;margin:0;">
            in additional annual net revenue (${formatPercent(dtc.uplift_pct_low)} – ${formatPercent(dtc.uplift_pct_high)} uplift)
          </p>
        </td></tr>

        <!-- Revenue comparison table -->
        <tr><td style="background-color:#222222;border:1px solid #2e2e2e;padding:24px;margin-top:1px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 16px;">Revenue Comparison</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#8a8580;"></td>
              <td style="padding:8px 0;font-size:12px;color:#8a8580;text-align:right;">App Store Only</td>
              <td style="padding:8px 0;font-size:12px;color:#8a8580;text-align:right;">With DTC (Low)</td>
              <td style="padding:8px 0;font-size:12px;color:#8a8580;text-align:right;">With DTC (High)</td>
            </tr>
            <tr style="border-top:1px solid #2e2e2e;">
              <td style="padding:8px 0;font-size:13px;color:#e8e4df;">Net Revenue</td>
              <td style="padding:8px 0;font-size:13px;color:#e8e4df;text-align:right;">${formatCurrency(dtc.total_net_revenue)}</td>
              <td style="padding:8px 0;font-size:13px;color:#e8e4df;text-align:right;">${formatCurrency(dtc.total_net_with_dtc_low)}</td>
              <td style="padding:8px 0;font-size:13px;color:#e8e4df;text-align:right;">${formatCurrency(dtc.total_net_with_dtc_high)}</td>
            </tr>
            <tr style="border-top:1px solid #2e2e2e;">
              <td style="padding:8px 0;font-size:13px;color:#e8e4df;">Additional Revenue</td>
              <td style="padding:8px 0;font-size:13px;color:#8a8580;text-align:right;">—</td>
              <td style="padding:8px 0;font-size:13px;color:#c4956a;text-align:right;">+${formatCurrency(dtc.uplift_low)}</td>
              <td style="padding:8px 0;font-size:13px;color:#c4956a;text-align:right;">+${formatCurrency(dtc.uplift_high)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Key Metrics -->
        <tr><td style="padding:1px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="background-color:#222222;border:1px solid #2e2e2e;padding:20px;vertical-align:top;">
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 6px;">Current Net Revenue</p>
                <p style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#e8e4df;margin:0 0 4px;">${formatCurrency(stats.total_revenue)}</p>
                <p style="font-size:11px;color:#8a8580;margin:0;">After app store cut</p>
              </td>
              <td width="33%" style="background-color:#222222;border:1px solid #2e2e2e;padding:20px;vertical-align:top;">
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 6px;">US Revenue</p>
                <p style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#e8e4df;margin:0 0 4px;">${formatCurrency(usRevenue)}</p>
                <p style="font-size:11px;color:#8a8580;margin:0;">${formatPercent(usRevenue / stats.total_revenue)} of total</p>
              </td>
              <td width="33%" style="background-color:#222222;border:1px solid #2e2e2e;padding:20px;vertical-align:top;">
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 6px;">Non-US Revenue</p>
                <p style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#e8e4df;margin:0 0 4px;">${formatCurrency(nonUsRevenue)}</p>
                <p style="font-size:11px;color:#8a8580;margin:0;">${formatPercent(nonUsRevenue / stats.total_revenue)} of total</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Top Games -->
        <tr><td style="background-color:#222222;border:1px solid #2e2e2e;padding:24px;margin-top:1px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 16px;">Top Games by Revenue</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${topGames.map((game) => `
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#e8e4df;">${game.app_name}</td>
              <td style="padding:6px 0;font-size:13px;color:#8a8580;text-align:right;">${formatCurrency(game.total_revenue)}</td>
            </tr>
            `).join("")}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="text-align:center;padding:32px 0;">
          <h3 style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#e8e4df;margin:0 0 8px;">
            Ready to unlock this potential?
          </h3>
          <p style="font-size:13px;color:#8a8580;margin:0 0 20px;max-width:400px;margin-left:auto;margin-right:auto;">
            ${firstName ? `${firstName}, we'd` : "We'd"} love to show you how Neon can help ${publisherName} shift to DTC and keep more revenue.
          </p>
          <a href="https://neon.tech" style="display:inline-block;padding:12px 32px;background-color:#c4956a;color:#1a1a1a;font-size:14px;font-weight:500;text-decoration:none;">
            Schedule a demo
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:24px 0;border-top:1px solid #2e2e2e;">
          <p style="font-size:11px;color:#8a8580;margin:0;">
            This report was generated by Neon DTC Revenue Insights.
            Data is based on publicly available market estimates.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: "Neon Insights <onboarding@resend.dev>",
    to: DEMO_RECIPIENT,
    subject: `${firstName ? `${firstName}, ` : ""}${formatCurrency(dtc.uplift_low)}–${formatCurrency(dtc.uplift_high)} DTC uplift for ${publisherName}`,
    html,
    scheduledAt: getScheduledAt(),
  });

  if (error) {
    console.error("Failed to send report email:", error);
    throw error;
  }

  return data;
}

// ─── No-match email (studio not found) ────────────────────────────────

interface NoMatchEmailParams {
  to: string;
  domain: string;
}

export async function sendNoMatchEmail({ to, domain }: NoMatchEmailParams) {
  const firstName = extractFirstName(to);
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8e4df;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="text-align:center;padding:0 0 32px;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#c4956a;margin:0 0 12px;">
            Neon DTC Insights
          </p>
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#e8e4df;margin:0 0 8px;">
            We'd love to learn more about your studio
          </h1>
        </td></tr>

        <!-- Personal greeting + message -->
        <tr><td style="background-color:#222222;border:1px solid #2e2e2e;padding:32px;">
          <p style="font-size:14px;color:#e8e4df;margin:0 0 16px;">${greeting}</p>
          <p style="font-size:14px;color:#8a8580;margin:0 0 16px;line-height:1.6;">
            Thank you for trying Neon's DTC Revenue Insights tool. We weren't able to automatically match your company (${domain}) to our database of mobile game publishers — but that doesn't mean we can't help.
          </p>
          <p style="font-size:14px;color:#8a8580;margin:0 0 16px;line-height:1.6;">
            Our team can run a custom analysis for your studio, estimating how much additional revenue you could earn by shifting from app store distribution to direct-to-consumer channels.
          </p>
          <p style="font-size:14px;color:#8a8580;margin:0;line-height:1.6;">
            We'd also be happy to give you a walkthrough of how Neon helps publishers keep more of their revenue with lower platform fees.
          </p>
        </td></tr>

        <!-- What we can do -->
        <tr><td style="background-color:#222222;border:1px solid #2e2e2e;padding:24px;margin-top:1px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 16px;">What we can do for you</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#e8e4df;vertical-align:top;width:24px;">1.</td>
              <td style="padding:8px 0;font-size:13px;color:#8a8580;">Run a custom DTC revenue analysis for your specific games</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#e8e4df;vertical-align:top;width:24px;">2.</td>
              <td style="padding:8px 0;font-size:13px;color:#8a8580;">Show you how much you could save by reducing app store fees</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#e8e4df;vertical-align:top;width:24px;">3.</td>
              <td style="padding:8px 0;font-size:13px;color:#8a8580;">Walk you through a live demo of Neon's DTC platform</td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="text-align:center;padding:32px 0;">
          <h3 style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#e8e4df;margin:0 0 8px;">
            Let's build your custom report
          </h3>
          <p style="font-size:13px;color:#8a8580;margin:0 0 20px;max-width:400px;margin-left:auto;margin-right:auto;">
            Book a quick call and we'll have your personalized analysis ready.
          </p>
          <a href="https://neon.tech" style="display:inline-block;padding:12px 32px;background-color:#c4956a;color:#1a1a1a;font-size:14px;font-weight:500;text-decoration:none;">
            Schedule a demo
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:24px 0;border-top:1px solid #2e2e2e;">
          <p style="font-size:11px;color:#8a8580;margin:0;">
            This email was sent by Neon DTC Revenue Insights.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: "Neon Insights <onboarding@resend.dev>",
    to: DEMO_RECIPIENT,
    subject: `${firstName ? `${firstName}, ` : ""}Let's build a custom DTC revenue report for your studio`,
    html,
    scheduledAt: getScheduledAt(),
  });

  if (error) {
    console.error("Failed to send no-match email:", error);
    throw error;
  }

  return data;
}
