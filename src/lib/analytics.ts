import { Game, PublisherStats, DtcUplift, Supergenre, COUNTRY_CODES } from "./types";

// App store takes 30%, publisher gets 70%
const APP_STORE_CUT = 0.30;
const APP_STORE_NET_RATE = 1 - APP_STORE_CUT; // 0.70

// Neon DTC takes 6%, publisher gets 94%
const NEON_DTC_CUT = 0.06;
const NEON_DTC_NET_RATE = 1 - NEON_DTC_CUT; // 0.94

// DTC conversion rates by supergenre
// Direct checkout = US market, Webshop = non-US markets
const DTC_RATES: Record<Supergenre, {
  direct_checkout_low: number;
  direct_checkout_high: number;
  webshop_low: number;
  webshop_high: number;
}> = {
  Core: {
    direct_checkout_low: 0.25,
    direct_checkout_high: 0.60,
    webshop_low: 0.20,
    webshop_high: 0.65,
  },
  Casino: {
    direct_checkout_low: 0.25,
    direct_checkout_high: 0.60,
    webshop_low: 0.20,
    webshop_high: 0.65,
  },
  Casual: {
    direct_checkout_low: 0.25,
    direct_checkout_high: 0.60,
    webshop_low: 0.08,
    webshop_high: 0.35,
  },
};

function computeDtcUplift(
  usNetRevenue: number,
  nonUsNetRevenue: number,
  supergenre: Supergenre
): DtcUplift {
  const totalNetRevenue = usNetRevenue + nonUsNetRevenue;

  // Step 1: Gross up revenue (reverse the 30% app store cut)
  const usGross = usNetRevenue / APP_STORE_NET_RATE;
  const nonUsGross = nonUsNetRevenue / APP_STORE_NET_RATE;
  const totalGross = totalNetRevenue / APP_STORE_NET_RATE;

  // Step 2: DTC revenue calculation
  const rates = DTC_RATES[supergenre];

  const directCheckoutGrossLow = usGross * rates.direct_checkout_low;
  const directCheckoutGrossHigh = usGross * rates.direct_checkout_high;
  const webshopGrossLow = nonUsGross * rates.webshop_low;
  const webshopGrossHigh = nonUsGross * rates.webshop_high;

  const totalDtcGrossLow = directCheckoutGrossLow + webshopGrossLow;
  const totalDtcGrossHigh = directCheckoutGrossHigh + webshopGrossHigh;

  // Step 3: Split revenue — remaining on app store
  const appStoreRemainingGrossLow = totalGross - totalDtcGrossLow;
  const appStoreRemainingGrossHigh = totalGross - totalDtcGrossHigh;

  // Step 4: Net revenue by channel
  const appStoreNetLow = appStoreRemainingGrossLow * APP_STORE_NET_RATE;
  const appStoreNetHigh = appStoreRemainingGrossHigh * APP_STORE_NET_RATE;
  const dtcNetLow = totalDtcGrossLow * NEON_DTC_NET_RATE;
  const dtcNetHigh = totalDtcGrossHigh * NEON_DTC_NET_RATE;

  const totalNetWithDtcLow = appStoreNetLow + dtcNetLow;
  const totalNetWithDtcHigh = appStoreNetHigh + dtcNetHigh;

  // Step 5: Uplift
  const upliftLow = totalNetWithDtcLow - totalNetRevenue;
  const upliftHigh = totalNetWithDtcHigh - totalNetRevenue;
  const upliftPctLow = totalNetRevenue > 0 ? upliftLow / totalNetRevenue : 0;
  const upliftPctHigh = totalNetRevenue > 0 ? upliftHigh / totalNetRevenue : 0;

  return {
    us_net_revenue: usNetRevenue,
    non_us_net_revenue: nonUsNetRevenue,
    total_net_revenue: totalNetRevenue,
    supergenre,

    us_gross_revenue: usGross,
    non_us_gross_revenue: nonUsGross,
    total_gross_revenue: totalGross,

    direct_checkout_rate_low: rates.direct_checkout_low,
    direct_checkout_rate_high: rates.direct_checkout_high,
    webshop_rate_low: rates.webshop_low,
    webshop_rate_high: rates.webshop_high,

    direct_checkout_gross_low: directCheckoutGrossLow,
    direct_checkout_gross_high: directCheckoutGrossHigh,
    webshop_gross_low: webshopGrossLow,
    webshop_gross_high: webshopGrossHigh,

    total_dtc_gross_low: totalDtcGrossLow,
    total_dtc_gross_high: totalDtcGrossHigh,

    app_store_remaining_gross_low: appStoreRemainingGrossLow,
    app_store_remaining_gross_high: appStoreRemainingGrossHigh,
    app_store_net_low: appStoreNetLow,
    app_store_net_high: appStoreNetHigh,
    dtc_net_low: dtcNetLow,
    dtc_net_high: dtcNetHigh,
    total_net_with_dtc_low: totalNetWithDtcLow,
    total_net_with_dtc_high: totalNetWithDtcHigh,

    uplift_low: upliftLow,
    uplift_high: upliftHigh,
    uplift_pct_low: upliftPctLow,
    uplift_pct_high: upliftPctHigh,
  };
}

// Determine the dominant supergenre for a set of games (by revenue)
function getDominantSupergenre(games: Game[]): Supergenre {
  const revenueByGenre: Record<string, number> = {};
  for (const game of games) {
    if (game.supergenre) {
      revenueByGenre[game.supergenre] =
        (revenueByGenre[game.supergenre] || 0) + game.total_revenue;
    }
  }
  const entries = Object.entries(revenueByGenre);
  if (entries.length === 0) return "Casual"; // default to Casual (most conservative)
  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0] as Supergenre;
}

export function computePublisherStats(publisherGames: Game[]): PublisherStats {
  const totalRevenue = publisherGames.reduce(
    (sum, g) => sum + g.total_revenue,
    0
  );
  const totalDownloads = publisherGames.reduce(
    (sum, g) => sum + g.total_downloads,
    0
  );

  const countryRevenues: Record<string, number> = {};
  const countryShares: Record<string, number> = {};

  for (const cc of COUNTRY_CODES) {
    const revenueKey = `${cc}_revenue` as keyof Game;
    const rev = publisherGames.reduce(
      (sum, g) => sum + ((g[revenueKey] as number) || 0),
      0
    );
    countryRevenues[cc] = rev;
    countryShares[cc] = totalRevenue > 0 ? rev / totalRevenue : 0;
  }

  const usRevenue = countryRevenues["us"] || 0;
  const nonUsRevenue = totalRevenue - usRevenue;

  const avgRpd = totalDownloads > 0 ? totalRevenue / totalDownloads : 0;
  const dominantSupergenre = getDominantSupergenre(publisherGames);

  const dtcUplift = computeDtcUplift(usRevenue, nonUsRevenue, dominantSupergenre);

  return {
    total_revenue: totalRevenue,
    total_downloads: totalDownloads,
    avg_rpd: avgRpd,
    us_share: countryShares["us"] || 0,
    country_shares: countryShares,
    country_revenues: countryRevenues,
    dtc_uplift: dtcUplift,
  };
}
