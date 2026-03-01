import {
  Game,
  GenreBenchmarks,
  IndustryBenchmarks,
  PublisherStats,
  COUNTRY_CODES,
  Supergenre,
} from "./types";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function topQuartile(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.75);
  return sorted[Math.min(idx, sorted.length - 1)];
}

interface PublisherAggregate {
  total_revenue: number;
  total_downloads: number;
  country_revenues: Record<string, number>;
}

function aggregateByPublisher(games: Game[]): Map<string, PublisherAggregate> {
  const map = new Map<string, PublisherAggregate>();

  for (const game of games) {
    const key = game.publisher_name;
    let agg = map.get(key);
    if (!agg) {
      agg = { total_revenue: 0, total_downloads: 0, country_revenues: {} };
      for (const cc of COUNTRY_CODES) {
        agg.country_revenues[cc] = 0;
      }
      map.set(key, agg);
    }
    agg.total_revenue += game.total_revenue;
    agg.total_downloads += game.total_downloads;
    for (const cc of COUNTRY_CODES) {
      const revenueKey = `${cc}_revenue` as keyof Game;
      agg.country_revenues[cc] += (game[revenueKey] as number) || 0;
    }
  }

  return map;
}

function computeGenreBenchmarks(
  publishers: PublisherAggregate[]
): GenreBenchmarks {
  const meaningful = publishers.filter((p) => p.total_revenue > 10000);

  const usShares = meaningful.map((p) =>
    p.total_revenue > 0 ? p.country_revenues["us"] / p.total_revenue : 0
  );

  const rpds = meaningful
    .filter((p) => p.total_downloads > 0)
    .map((p) => p.total_revenue / p.total_downloads);

  const topQuartileCountryShares: Record<string, number> = {};
  for (const cc of COUNTRY_CODES) {
    const shares = meaningful.map((p) =>
      p.total_revenue > 0 ? p.country_revenues[cc] / p.total_revenue : 0
    );
    topQuartileCountryShares[cc] = topQuartile(shares);
  }

  return {
    median_us_share: median(usShares),
    top_quartile_us_share: topQuartile(usShares),
    median_rpd: median(rpds),
    top_quartile_rpd: topQuartile(rpds),
    top_quartile_country_shares: topQuartileCountryShares,
  };
}

export function computeBenchmarks(allGames: Game[]): IndustryBenchmarks {
  // Global benchmarks (all games)
  const allPublishers = aggregateByPublisher(allGames);
  const globalBenchmarks = computeGenreBenchmarks([...allPublishers.values()]);

  // Per-supergenre benchmarks
  const supergenres: Supergenre[] = ["Core", "Casual", "Casino"];
  const bySupergenre: Record<string, GenreBenchmarks> = {};

  for (const sg of supergenres) {
    const genreGames = allGames.filter((g) => g.supergenre === sg);
    const genrePublishers = aggregateByPublisher(genreGames);
    bySupergenre[sg] = computeGenreBenchmarks([...genrePublishers.values()]);
  }

  return {
    ...globalBenchmarks,
    by_supergenre: bySupergenre,
  };
}

// Determine the dominant supergenre for a set of games (by revenue)
function getDominantSupergenre(games: Game[]): Supergenre | null {
  const revenueByGenre: Record<string, number> = {};
  for (const game of games) {
    if (game.supergenre) {
      revenueByGenre[game.supergenre] =
        (revenueByGenre[game.supergenre] || 0) + game.total_revenue;
    }
  }
  const entries = Object.entries(revenueByGenre);
  if (entries.length === 0) return null;
  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0] as Supergenre;
}

export function computePublisherStats(
  publisherGames: Game[],
  benchmarks: IndustryBenchmarks
): PublisherStats {
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

  // Use supergenre-specific benchmarks if available, otherwise fall back to global
  const dominantGenre = getDominantSupergenre(publisherGames);
  const genreBenchmarks =
    dominantGenre && benchmarks.by_supergenre[dominantGenre]
      ? benchmarks.by_supergenre[dominantGenre]
      : benchmarks;

  // Uplift: for each non-US country where publisher is below their genre benchmark,
  // capped at 1x current country revenue (floor at 0.2% of total revenue).
  // US is excluded because Neon's value prop is international market optimization.
  const upliftByCountry: Record<string, number> = {};
  let totalUplift = 0;

  for (const cc of COUNTRY_CODES) {
    if (cc === "us") {
      upliftByCountry[cc] = 0;
      continue;
    }
    const benchmarkShare = genreBenchmarks.top_quartile_country_shares[cc] || 0;
    const publisherShare = countryShares[cc];
    const gap = Math.max(0, benchmarkShare - publisherShare);
    const rawUplift = gap * totalRevenue;
    // Cap: no more than doubling current revenue in a market;
    // floor ensures tiny/zero-revenue markets still show some opportunity
    const cap = Math.max(countryRevenues[cc], totalRevenue * 0.002);
    const uplift = Math.min(rawUplift, cap);
    upliftByCountry[cc] = uplift;
    totalUplift += uplift;
  }

  // RPD uplift — also use genre-specific median
  const avgRpd = totalDownloads > 0 ? totalRevenue / totalDownloads : 0;
  const rpdUplift =
    avgRpd < genreBenchmarks.median_rpd && totalDownloads > 0
      ? (genreBenchmarks.median_rpd - avgRpd) * totalDownloads
      : 0;

  return {
    total_revenue: totalRevenue,
    total_downloads: totalDownloads,
    avg_rpd: avgRpd,
    us_share: countryShares["us"] || 0,
    country_shares: countryShares,
    country_revenues: countryRevenues,
    uplift_by_country: upliftByCountry,
    total_uplift: totalUplift,
    rpd_uplift: rpdUplift,
  };
}
