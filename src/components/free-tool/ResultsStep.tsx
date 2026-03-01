"use client";

import { Game, PublisherStats } from "@/lib/types";
import { formatCurrency, formatNumber, formatRPD, formatPercent } from "@/lib/format";
import { MetricCard } from "@/components/ui/MetricCard";
import { RevenueDonut } from "@/components/charts/RevenueDonut";
import { TopCountriesBar } from "@/components/charts/TopCountriesBar";
import { GeoDistribution } from "@/components/charts/GeoDistribution";
import { UpliftVisualization } from "@/components/charts/UpliftVisualization";

interface ResultsStepProps {
  publisherName: string;
  games: Game[];
  stats: PublisherStats;
  onReset: () => void;
}

export function ResultsStep({
  publisherName,
  games,
  stats,
  onReset,
}: ResultsStepProps) {
  const dtc = stats.dtc_uplift;

  return (
    <div className="w-full">
      {/* Hero — Neon's estimated contribution */}
      <div className="text-center mb-12 pt-4">
        <p className="text-xs uppercase tracking-widest text-accent mb-3">
          Estimated Neon DTC revenue uplift for {publisherName}
        </p>
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif font-semibold tracking-tight text-foreground leading-none">
          {formatCurrency(dtc.uplift_low)} – {formatCurrency(dtc.uplift_high)}
        </h2>
        <p className="text-lg text-muted mt-3 max-w-lg mx-auto">
          in additional annual net revenue by shifting to direct-to-consumer channels
        </p>
        <p className="text-sm text-muted mt-1">
          {games.length} game{games.length !== 1 ? "s" : ""} analyzed
          {" · "}
          {dtc.supergenre} portfolio
          {" · "}
          {formatPercent(dtc.uplift_pct_low)} – {formatPercent(dtc.uplift_pct_high)} uplift
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
          label="Current Net Revenue"
          value={formatCurrency(stats.total_revenue)}
          subtitle="Across all markets (after app store cut)"
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
            label="Revenue Per Download"
            value={formatRPD(stats.avg_rpd)}
            subtitle="Across all markets"
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

      {/* Row 3: Geo Diversity + DTC Uplift Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 mb-px">
        <div className="border-b md:border-b-0 md:border-r border-border">
          <GeoDistribution countryShares={stats.country_shares} />
        </div>
        <UpliftVisualization dtcUplift={dtc} />
      </div>

      {/* Row 4: Full-width revenue comparison */}
      <div className="border border-border p-5 mb-10">
        <h3 className="text-xs uppercase tracking-wider text-accent mb-4">
          Revenue Comparison
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-left">
              <th className="pb-3 font-normal"></th>
              <th className="pb-3 font-normal text-right">App Store Only</th>
              <th className="pb-3 font-normal text-right">With DTC (Low)</th>
              <th className="pb-3 font-normal text-right">With DTC (High)</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr className="border-t border-border">
              <td className="py-3">Net Revenue</td>
              <td className="py-3 text-right tabular-nums">{formatCurrency(dtc.total_net_revenue)}</td>
              <td className="py-3 text-right tabular-nums">{formatCurrency(dtc.total_net_with_dtc_low)}</td>
              <td className="py-3 text-right tabular-nums">{formatCurrency(dtc.total_net_with_dtc_high)}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-3">Additional Revenue</td>
              <td className="py-3 text-right text-muted">—</td>
              <td className="py-3 text-right tabular-nums text-accent">+{formatCurrency(dtc.uplift_low)}</td>
              <td className="py-3 text-right tabular-nums text-accent">+{formatCurrency(dtc.uplift_high)}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-3">Uplift</td>
              <td className="py-3 text-right text-muted">—</td>
              <td className="py-3 text-right tabular-nums text-accent">+{formatPercent(dtc.uplift_pct_low)}</td>
              <td className="py-3 text-right tabular-nums text-accent">+{formatPercent(dtc.uplift_pct_high)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="border border-border p-8 text-center">
        <h3 className="text-xl font-serif font-semibold mb-2 text-foreground">
          Ready to unlock this potential?
        </h3>
        <p className="text-sm text-muted mb-5 max-w-md mx-auto">
          Neon helps mobile game publishers shift to direct-to-consumer revenue
          channels, keeping more of what your players spend.
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
