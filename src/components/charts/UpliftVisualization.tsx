"use client";

import { DtcUplift } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";

interface UpliftVisualizationProps {
  dtcUplift: DtcUplift;
}

export function UpliftVisualization({ dtcUplift: dtc }: UpliftVisualizationProps) {
  const maxVal = Math.max(
    dtc.total_net_revenue,
    dtc.total_net_with_dtc_high
  );

  const currentWidth = maxVal > 0 ? (dtc.total_net_revenue / maxVal) * 100 : 0;
  const lowWidth = maxVal > 0 ? (dtc.total_net_with_dtc_low / maxVal) * 100 : 0;
  const highWidth = maxVal > 0 ? (dtc.total_net_with_dtc_high / maxVal) * 100 : 0;

  // For the DTC high bar, split into app store portion and DTC portion
  const appStoreHighWidth = maxVal > 0 ? (dtc.app_store_net_high / maxVal) * 100 : 0;
  const dtcHighWidth = maxVal > 0 ? (dtc.dtc_net_high / maxVal) * 100 : 0;

  return (
    <div className="border border-border p-5">
      <h3 className="text-xs uppercase tracking-wider text-accent mb-1">
        DTC Revenue Uplift
      </h3>
      <p className="text-xs text-muted mb-5">
        Net revenue comparison: app store only vs. with Neon DTC channels
      </p>

      <div className="space-y-5">
        {/* Current: App Store Only */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              App Store Only (Today)
            </span>
            <span className="text-sm tabular-nums text-foreground">
              {formatCurrency(dtc.total_net_revenue)}
            </span>
          </div>
          <div className="h-8 bg-border/30">
            <div
              className="h-full bg-muted/40"
              style={{ width: `${currentWidth}%` }}
            />
          </div>
        </div>

        {/* With DTC: Low estimate */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              With Neon DTC (Low)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm tabular-nums text-foreground">
                {formatCurrency(dtc.total_net_with_dtc_low)}
              </span>
              <span className="text-sm tabular-nums text-accent">
                +{formatPercent(dtc.uplift_pct_low)}
              </span>
            </div>
          </div>
          <div className="h-8 bg-border/30">
            <div
              className="h-full bg-accent"
              style={{ width: `${lowWidth}%` }}
            />
          </div>
        </div>

        {/* With DTC: High estimate */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              With Neon DTC (High)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm tabular-nums text-foreground">
                {formatCurrency(dtc.total_net_with_dtc_high)}
              </span>
              <span className="text-sm tabular-nums text-accent">
                +{formatPercent(dtc.uplift_pct_high)}
              </span>
            </div>
          </div>
          <div className="h-8 bg-border/30 flex">
            <div
              className="h-full bg-accent/60"
              style={{ width: `${appStoreHighWidth}%` }}
            />
            <div
              className="h-full bg-accent"
              style={{ width: `${dtcHighWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-muted/40" />
          <span>App Store Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-accent" />
          <span>DTC Revenue</span>
        </div>
      </div>
    </div>
  );
}
