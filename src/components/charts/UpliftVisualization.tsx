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
  startFrom: number; // Where the bar starts (cumulative)
}

export function UpliftVisualization({ dtcUplift: dtc }: UpliftVisualizationProps) {
  // Waterfall: Current → +Low Uplift → = Low Total → +High Uplift → = High Total
  const bars: WaterfallBar[] = [
    {
      label: "Current Net Revenue",
      value: dtc.total_net_revenue,
      displayValue: formatCurrency(dtc.total_net_revenue),
      subtitle: "App store only",
      isTotal: true,
      startFrom: 0,
    },
    {
      label: "DTC Uplift (Low)",
      value: dtc.uplift_low,
      displayValue: `+${formatCurrency(dtc.uplift_low)}`,
      subtitle: formatPercent(dtc.uplift_pct_low),
      isUplift: true,
      startFrom: dtc.total_net_revenue,
    },
    {
      label: "With Neon (Low)",
      value: dtc.total_net_with_dtc_low,
      displayValue: formatCurrency(dtc.total_net_with_dtc_low),
      isTotal: true,
      startFrom: 0,
    },
    {
      label: "DTC Uplift (High)",
      value: dtc.uplift_high,
      displayValue: `+${formatCurrency(dtc.uplift_high)}`,
      subtitle: formatPercent(dtc.uplift_pct_high),
      isUplift: true,
      startFrom: dtc.total_net_revenue,
    },
    {
      label: "With Neon (High)",
      value: dtc.total_net_with_dtc_high,
      displayValue: formatCurrency(dtc.total_net_with_dtc_high),
      isTotal: true,
      startFrom: 0,
    },
  ];

  const maxVal = dtc.total_net_with_dtc_high;

  return (
    <div className="border border-border p-5">
      <h3 className="text-xs uppercase tracking-wider text-accent mb-1">
        DTC Revenue Waterfall
      </h3>
      <p className="text-xs text-muted mb-6">
        How going direct with Neon adds to your net revenue
      </p>

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
              <div className="relative h-7 bg-border/20">
                <div
                  className={`absolute top-0 h-full transition-all ${
                    bar.isUplift
                      ? "bg-accent"
                      : bar.isTotal && i === 0
                        ? "bg-muted/30"
                        : "bg-accent/25"
                  }`}
                  style={{
                    left: `${offsetLeft}%`,
                    width: `${barWidth}%`,
                  }}
                />
                {/* Connector line from previous total to uplift */}
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

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-muted/30" />
          <span>Current Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-accent" />
          <span>DTC Uplift</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-accent/25" />
          <span>New Total</span>
        </div>
      </div>
    </div>
  );
}
