"use client";

import { DtcUplift } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";

interface UpliftVisualizationProps {
  dtcUplift: DtcUplift;
}

interface WaterfallBar {
  label: string;
  value: number;
  displayValue: string;
  subtitle?: string;
  isTotal?: boolean;
  isUplift?: boolean;
  channel?: "direct-checkout" | "webshop";
  startFrom: number;
}

function buildScenarioBars(
  dtc: DtcUplift,
  scenario: "low" | "high"
): WaterfallBar[] {
  const dcUplift = scenario === "low" ? dtc.direct_checkout_uplift_low : dtc.direct_checkout_uplift_high;
  const wsUplift = scenario === "low" ? dtc.webshop_uplift_low : dtc.webshop_uplift_high;
  const totalWithDtc = scenario === "low" ? dtc.total_net_with_dtc_low : dtc.total_net_with_dtc_high;
  const upliftPct = scenario === "low" ? dtc.uplift_pct_low : dtc.uplift_pct_high;

  return [
    {
      label: "Current Net Revenue",
      value: dtc.total_net_revenue,
      displayValue: formatCurrency(dtc.total_net_revenue),
      subtitle: "App store only",
      isTotal: true,
      startFrom: 0,
    },
    {
      label: "Direct Checkout (US)",
      value: dcUplift,
      displayValue: `+${formatCurrency(dcUplift)}`,
      subtitle: `${formatPercent(scenario === "low" ? dtc.direct_checkout_rate_low : dtc.direct_checkout_rate_high)} conversion`,
      isUplift: true,
      channel: "direct-checkout",
      startFrom: dtc.total_net_revenue,
    },
    {
      label: "Webshop (Rest of World)",
      value: wsUplift,
      displayValue: `+${formatCurrency(wsUplift)}`,
      subtitle: `${formatPercent(scenario === "low" ? dtc.webshop_rate_low : dtc.webshop_rate_high)} conversion`,
      isUplift: true,
      channel: "webshop",
      startFrom: dtc.total_net_revenue + dcUplift,
    },
    {
      label: "Total with Neon",
      value: totalWithDtc,
      displayValue: formatCurrency(totalWithDtc),
      subtitle: formatPercent(upliftPct) + " uplift",
      isTotal: true,
      startFrom: 0,
    },
  ];
}

export function UpliftVisualization({ dtcUplift: dtc }: UpliftVisualizationProps) {
  const lowBars = buildScenarioBars(dtc, "low");
  const highBars = buildScenarioBars(dtc, "high");

  const maxVal = Math.max(dtc.total_net_with_dtc_high, dtc.total_net_revenue, 1);

  return (
    <div className="border border-border p-5">
      <h3 className="text-xs uppercase tracking-wider text-accent mb-1">
        DTC Revenue Waterfall
      </h3>
      <p className="text-xs text-muted mb-6">
        How going direct with Neon adds to your net revenue — broken out by channel
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Scenario */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
            Conservative Estimate
          </p>
          <ScenarioBars bars={lowBars} maxVal={maxVal} />
        </div>

        {/* High Scenario */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
            High Estimate
          </p>
          <ScenarioBars bars={highBars} maxVal={maxVal} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-5 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-muted/30" />
          <span>Current Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-accent" />
          <span>Direct Checkout (US)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-accent/50" />
          <span>Webshop (Intl)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-accent/25" />
          <span>New Total</span>
        </div>
      </div>
    </div>
  );
}

function ScenarioBars({ bars, maxVal }: { bars: WaterfallBar[]; maxVal: number }) {
  return (
    <div className="space-y-3">
      {bars.map((bar, i) => {
        const barWidth = maxVal > 0 ? (bar.value / maxVal) * 100 : 0;
        const offsetLeft = maxVal > 0 ? (bar.startFrom / maxVal) * 100 : 0;

        return (
          <div key={i}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-sm ${bar.isTotal ? "font-medium text-foreground" : "text-muted"}`}>
                {bar.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-sm tabular-nums ${bar.isUplift ? "text-accent font-medium" : "text-foreground"}`}>
                  {bar.displayValue}
                </span>
                {bar.subtitle && (
                  <span className={`text-xs ${bar.isUplift ? "text-accent/70" : "text-muted"}`}>
                    {bar.subtitle}
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-6 bg-border/20">
              <div
                className={`absolute top-0 h-full transition-all ${
                  bar.channel === "direct-checkout"
                    ? "bg-accent"
                    : bar.channel === "webshop"
                      ? "bg-accent/50"
                      : bar.isTotal && i === 0
                        ? "bg-muted/30"
                        : "bg-accent/25"
                }`}
                style={{
                  left: `${offsetLeft}%`,
                  width: `${barWidth}%`,
                }}
              />
              {/* Connector line from previous bar */}
              {bar.isUplift && (
                <div
                  className="absolute top-0 h-full border-l border-dashed border-muted/40"
                  style={{ left: `${offsetLeft}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
