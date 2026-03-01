"use client";

import Image from "next/image";
import { Game, PublisherStats } from "@/lib/types";
import { formatCurrency, formatNumber, formatRPD, formatPercent } from "@/lib/format";

const PAYMENT_LOGOS = [
  "applepay", "gpay", "paypal", "cashapp", "klarna",
  "alipay", "wechatpay", "samsung-pay", "kakao", "line-pay",
  "naver-pay", "pix", "ideal", "sepa", "upi",
  "grab-pay", "dana", "ovo", "blik", "oxxo",
];
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
          Neon Commerce — DTC revenue estimate for {publisherName}
        </p>
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif font-semibold tracking-tight text-foreground leading-none">
          {formatCurrency(dtc.uplift_low)} – {formatCurrency(dtc.uplift_high)}
        </h2>
        <p className="text-lg text-muted mt-3 max-w-lg mx-auto">
          in additional annual net revenue by going direct with Neon
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

      {/* Payment coverage */}
      <div className="border border-border p-5 mb-px">
        <h3 className="text-xs uppercase tracking-wider text-accent mb-1">
          Accept payments everywhere
        </h3>
        <p className="text-xs text-muted mb-4">
          Coverage across 100% of top 50 gaming markets. Tax, fraud, security, and compliance — all handled.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          {PAYMENT_LOGOS.map((logo) => (
            <div
              key={logo}
              className="w-10 h-7 bg-surface-hover rounded flex items-center justify-center p-1.5"
            >
              <Image
                src={`/img/payment-logos/${logo}.svg`}
                alt={logo}
                width={28}
                height={20}
                className="opacity-70"
              />
            </div>
          ))}
          <span className="text-xs text-muted ml-1">+7 more</span>
        </div>
      </div>

      {/* CTA */}
      <div className="border border-border p-8 text-center mb-10">
        <Image
          src="/neon-logo.png"
          alt="Neon Commerce"
          width={40}
          height={40}
          className="mx-auto mb-4"
        />
        <h3 className="text-xl font-serif font-semibold mb-2 text-foreground">
          Take control of your commerce
        </h3>
        <p className="text-sm text-muted mb-5 max-w-md mx-auto">
          Neon gives game developers full visibility, predictable flat-rate fees,
          and the freedom to go direct — through Neon Shop, Neon Checkout, or Neon Direct Checkout.
        </p>
        <a
          href="https://neon.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block py-3 px-8 bg-accent text-background font-medium hover:bg-accent/90 transition-colors"
        >
          Talk to an Expert
        </a>
      </div>
    </div>
  );
}
