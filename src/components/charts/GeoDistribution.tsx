"use client";

import { COUNTRY_LABELS, CHART_COLORS } from "@/lib/constants";
import { formatPercent } from "@/lib/format";

interface GeoDistributionProps {
  countryShares: Record<string, number>;
}

export function GeoDistribution({ countryShares }: GeoDistributionProps) {
  const sorted = Object.entries(countryShares)
    .map(([code, share]) => ({
      code,
      label: COUNTRY_LABELS[code] || code.toUpperCase(),
      share,
    }))
    .filter((d) => d.share > 0.001)
    .sort((a, b) => b.share - a.share);

  return (
    <div className="border border-border p-5">
      <h3 className="text-xs uppercase tracking-wider text-accent mb-4">
        Revenue Distribution by Market
      </h3>

      {/* Stacked bar */}
      <div className="flex overflow-hidden h-8 mb-4">
        {sorted.map((item, i) => (
          <div
            key={item.code}
            className="relative group"
            style={{
              width: `${item.share * 100}%`,
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              minWidth: item.share > 0.01 ? "2px" : "1px",
            }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-hover text-foreground text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-border">
              {item.label}: {formatPercent(item.share)}
            </div>
          </div>
        ))}
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
        {sorted.slice(0, 12).map((item, i) => (
          <div key={item.code} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
            <span className="text-muted truncate">{item.label}</span>
            <span className="ml-auto tabular-nums font-medium text-foreground">
              {formatPercent(item.share)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
