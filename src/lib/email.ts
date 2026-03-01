import { Resend } from "resend";
import { PublisherStats, IndustryBenchmarks, Game } from "./types";
import { formatCurrency, formatNumber, formatRPD, formatPercent } from "./format";

const resend = new Resend(process.env.RESEND_API_KEY);

// Override recipient for demo/sandbox — all reports go to this address
const DEMO_RECIPIENT = "mert@troylabs.io";

interface ReportEmailParams {
  to: string;
  publisherName: string;
  games: Game[];
  stats: PublisherStats;
  benchmarks: IndustryBenchmarks;
}

export async function sendReportEmail({
  to,
  publisherName,
  games,
  stats,
  benchmarks,
}: ReportEmailParams) {
  const combinedUplift = stats.total_uplift + stats.rpd_uplift;
  const usRevenue = stats.country_revenues["us"] || 0;
  const intlRevenue = stats.total_revenue - usRevenue;
  const intlUplift = stats.total_uplift;

  // Top 5 games by revenue
  const topGames = [...games]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5);

  // Top uplift countries
  const topUpliftCountries = Object.entries(stats.uplift_by_country)
    .filter(([code, uplift]) => code !== "us" && uplift > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const COUNTRY_NAMES: Record<string, string> = {
    us: "United States", jp: "Japan", kr: "South Korea", de: "Germany",
    gb: "United Kingdom", fr: "France", ca: "Canada", au: "Australia",
    it: "Italy", br: "Brazil", es: "Spain", mx: "Mexico", id: "Indonesia",
    sa: "Saudi Arabia", ae: "UAE", hk: "Hong Kong", th: "Thailand",
    ch: "Switzerland", co: "Colombia", cl: "Chile", pe: "Peru", ar: "Argentina",
    cn: "China", tw: "Taiwan", se: "Sweden",
  };

  const rpdStatus = stats.avg_rpd >= benchmarks.median_rpd ? "above" : "below";

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
            Publisher Revenue Insights
          </p>
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#e8e4df;margin:0 0 8px;">
            Revenue Report for ${publisherName}
          </h1>
          <p style="font-size:14px;color:#8a8580;margin:0;">
            ${games.length} game${games.length !== 1 ? "s" : ""} analyzed across international markets
          </p>
        </td></tr>

        <!-- Hero: Uplift -->
        <tr><td style="background-color:#222222;border:1px solid #2e2e2e;padding:32px;text-align:center;margin-bottom:1px;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#c4956a;margin:0 0 8px;">
            Estimated Neon Contribution
          </p>
          <h2 style="font-family:Georgia,serif;font-size:48px;font-weight:600;color:#e8e4df;margin:0 0 8px;">
            ${formatCurrency(combinedUplift)}
          </h2>
          <p style="font-size:14px;color:#8a8580;margin:0;">
            in additional annual revenue by optimizing across international markets
          </p>
        </td></tr>

        <!-- Key Metrics -->
        <tr><td style="padding:1px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="background-color:#222222;border:1px solid #2e2e2e;padding:20px;vertical-align:top;">
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 6px;">Total Revenue</p>
                <p style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#e8e4df;margin:0 0 4px;">${formatCurrency(stats.total_revenue)}</p>
                <p style="font-size:11px;color:#8a8580;margin:0;">Across all markets</p>
              </td>
              <td width="33%" style="background-color:#222222;border:1px solid #2e2e2e;padding:20px;vertical-align:top;">
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 6px;">Total Downloads</p>
                <p style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#e8e4df;margin:0 0 4px;">${formatNumber(stats.total_downloads)}</p>
                <p style="font-size:11px;color:#8a8580;margin:0;">All platforms</p>
              </td>
              <td width="33%" style="background-color:#222222;border:1px solid #2e2e2e;padding:20px;vertical-align:top;">
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 6px;">Revenue Per Download</p>
                <p style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#e8e4df;margin:0 0 4px;">${formatRPD(stats.avg_rpd)}</p>
                <p style="font-size:11px;color:#8a8580;margin:0;">${rpdStatus === "above" ? "Above" : "Below"} industry median</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- US vs International -->
        <tr><td style="background-color:#222222;border:1px solid #2e2e2e;padding:24px;margin-top:1px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 16px;">Revenue Split</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding-right:12px;">
                <p style="font-size:13px;color:#8a8580;margin:0 0 4px;">United States</p>
                <p style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#e8e4df;margin:0;">${formatCurrency(usRevenue)}</p>
                <p style="font-size:12px;color:#8a8580;margin:4px 0 0;">${formatPercent(usRevenue / stats.total_revenue)} of total</p>
              </td>
              <td width="50%" style="padding-left:12px;border-left:1px solid #2e2e2e;">
                <p style="font-size:13px;color:#8a8580;margin:0 0 4px;">International</p>
                <p style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#e8e4df;margin:0;">
                  ${formatCurrency(intlRevenue)}
                  ${intlUplift > 0 ? `<span style="color:#c4956a;font-size:14px;"> +${formatCurrency(intlUplift)}</span>` : ""}
                </p>
                <p style="font-size:12px;color:#8a8580;margin:4px 0 0;">${formatPercent(intlRevenue / stats.total_revenue)} of total</p>
              </td>
            </tr>
          </table>
        </td></tr>

        ${topUpliftCountries.length > 0 ? `
        <!-- Top Growth Markets -->
        <tr><td style="background-color:#222222;border:1px solid #2e2e2e;padding:24px;margin-top:1px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c4956a;margin:0 0 16px;">Top Growth Opportunities</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${topUpliftCountries.map(([code, uplift]) => `
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#e8e4df;">${COUNTRY_NAMES[code] || code.toUpperCase()}</td>
              <td style="padding:6px 0;font-size:13px;color:#8a8580;text-align:right;">Current: ${formatCurrency(stats.country_revenues[code] || 0)}</td>
              <td style="padding:6px 0;font-size:13px;color:#c4956a;text-align:right;font-weight:500;">+${formatCurrency(uplift)}</td>
            </tr>
            `).join("")}
          </table>
        </td></tr>
        ` : ""}

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
            Neon helps mobile game publishers optimize revenue across global markets with data-driven insights.
          </p>
          <a href="https://neon.tech" style="display:inline-block;padding:12px 32px;background-color:#c4956a;color:#1a1a1a;font-size:14px;font-weight:500;text-decoration:none;">
            Get in touch
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:24px 0;border-top:1px solid #2e2e2e;">
          <p style="font-size:11px;color:#8a8580;margin:0;">
            This report was generated by Neon Publisher Revenue Insights.
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
    subject: `Revenue Report: ${formatCurrency(combinedUplift)} growth opportunity for ${publisherName}`,
    html,
  });

  if (error) {
    console.error("Failed to send report email:", error);
    throw error;
  }

  return data;
}
