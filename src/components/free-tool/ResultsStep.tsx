"use client";

import { Game, IndustryBenchmarks, PublisherStats } from "@/lib/types";
import { formatCurrency, formatNumber, formatRPD } from "@/lib/format";
import { MetricCard } from "@/components/ui/MetricCard";
import { RevenueDonut } from "@/components/charts/RevenueDonut";
import { TopCountriesBar } from "@/components/charts/TopCountriesBar";
import { RevenuePerDownload } from "@/components/charts/RevenuePerDownload";
import { GeoDistribution } from "@/components/charts/GeoDistribution";
import { UpliftVisualization } from "@/components/charts/UpliftVisualization";

interface ResultsStepProps {
  publisherName: string;
  games: Game[];
  benchmarks: IndustryBenchmarks;
  stats: PublisherStats;
  onReset: () => void;
}

export function ResultsStep({
  publisherName,
  games,
  benchmarks,
  stats,
  onReset,
}: ResultsStepProps) {
  const combinedUplift = stats.total_uplift + stats.rpd_uplift;

  return (
    <div className="w-full">
      {/* Hero — Neon's estimated contribution */}
      <div className="text-center mb-12 pt-4">
        <p className="text-xs uppercase tracking-widest text-accent mb-3">
          Estimated Neon contribution for {publisherName}
        </p>
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif font-semibold tracking-tight text-foreground leading-none">
          {formatCurrency(combinedUplift)}
        </h2>
        <p className="text-lg text-muted mt-3 max-w-lg mx-auto">
          in additional annual revenue by optimizing across international markets
        </p>
        <p className="text-sm text-muted mt-1">
          {games.length} game{games.length !== 1 ? "s" : ""} analyzed
        </p>
        <div className="flex justify-center mt-6">
          <button
            onClick={onReset}
            className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
          >
            Analyze another publisher
          </button>
        </div>
      </div>

      {/* Row 1: Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-border mb-px">
        <MetricCard
          label="Current Total Revenue"
          value={formatCurrency(stats.total_revenue)}
          subtitle="Across all markets"
        />
        <div className="border-t sm:border-t-0 sm:border-l border-border">
          <MetricCard
            label="Total Downloads"
            value={formatNumber(stats.total_downloads)}
            subtitle="All platforms"
          />
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-border">
          <MetricCard
            label="Avg. Revenue Per Download"
            value={formatRPD(stats.avg_rpd)}
            subtitle={
              stats.avg_rpd >= benchmarks.median_rpd
                ? "Above industry median"
                : "Below industry median"
            }
          />
        </div>
      </div>

      {/* Row 2: Donut + Top Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 mb-px">
        <div className="border-b md:border-b-0 md:border-r border-border">
          <RevenueDonut
            usRevenue={stats.country_revenues["us"] || 0}
            totalRevenue={stats.total_revenue}
          />
        </div>
        <TopCountriesBar countryRevenues={stats.country_revenues} />
      </div>

      {/* Row 3: RPD + Geo Diversity */}
      <div className="grid grid-cols-1 md:grid-cols-2 mb-px">
        <div className="border-b md:border-b-0 md:border-r border-border">
          <RevenuePerDownload
            rpd={stats.avg_rpd}
            medianRpd={benchmarks.median_rpd}
            topQuartileRpd={benchmarks.top_quartile_rpd}
          />
        </div>
        <GeoDistribution countryShares={stats.country_shares} />
      </div>

      {/* Row 4: Uplift breakdown */}
      <div className="mb-10">
        <UpliftVisualization
          countryRevenues={stats.country_revenues}
          upliftByCountry={stats.uplift_by_country}
          totalUplift={stats.total_uplift}
          rpdUplift={stats.rpd_uplift}
        />
      </div>

      {/* CTA */}
      <div className="border border-border p-8 text-center">
        <h3 className="text-xl font-serif font-semibold mb-2 text-foreground">
          Ready to unlock this potential?
        </h3>
        <p className="text-sm text-muted mb-5 max-w-md mx-auto">
          Neon helps mobile game publishers optimize revenue across global
          markets with data-driven insights and localization strategies.
        </p>
        <a
          href="https://neon.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block py-3 px-8 bg-accent text-background font-medium hover:bg-accent/90 transition-colors"
        >
          Get in touch
        </a>
      </div>
    </div>
  );
}
