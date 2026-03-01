"use client";

import { formatCurrency } from "@/lib/format";

interface UpliftVisualizationProps {
  countryRevenues: Record<string, number>;
  upliftByCountry: Record<string, number>;
  totalUplift: number;
  rpdUplift: number;
}

export function UpliftVisualization({
  countryRevenues,
  upliftByCountry,
  totalUplift,
  rpdUplift,
}: UpliftVisualizationProps) {
  const usRevenue = countryRevenues["us"] || 0;
  const intlRevenue = Object.entries(countryRevenues)
    .filter(([code]) => code !== "us")
    .reduce((sum, [, rev]) => sum + rev, 0);
  const intlUplift = Object.entries(upliftByCountry)
    .filter(([code]) => code !== "us")
    .reduce((sum, [, up]) => sum + up, 0);

  const combinedUplift = totalUplift + rpdUplift;
  const maxVal = Math.max(usRevenue, intlRevenue + intlUplift);

  const usWidth = maxVal > 0 ? (usRevenue / maxVal) * 100 : 0;
  const intlCurrentWidth = maxVal > 0 ? (intlRevenue / maxVal) * 100 : 0;
  const intlUpliftWidth = maxVal > 0 ? (intlUplift / maxVal) * 100 : 0;

  return (
    <div className="border border-border p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xs uppercase tracking-wider text-accent mb-1">
            International Revenue Opportunity
          </h3>
          <p className="text-xs text-muted">
            Your current US vs. international revenue split, with estimated
            growth potential in under-indexed international markets
          </p>
        </div>
        {combinedUplift > 0 && (
          <div className="border border-accent/30 bg-accent/5 px-4 py-2.5 shrink-0">
            <p className="text-xs text-accent mb-0.5">
              Estimated additional annual revenue
            </p>
            <p className="text-xl font-semibold font-serif text-foreground">
              {formatCurrency(combinedUplift)}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* US bar */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              United States
            </span>
            <span className="text-sm tabular-nums text-foreground">
              {formatCurrency(usRevenue)}
            </span>
          </div>
          <div className="h-8 bg-border/30">
            <div
              className="h-full bg-accent"
              style={{ width: `${usWidth}%` }}
            />
          </div>
        </div>

        {/* International bar */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              International
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm tabular-nums text-foreground">
                {formatCurrency(intlRevenue)}
              </span>
              {intlUplift > 0 && (
                <span className="text-sm tabular-nums text-accent">
                  +{formatCurrency(intlUplift)}
                </span>
              )}
            </div>
          </div>
          <div className="h-8 bg-border/30 flex">
            <div
              className="h-full bg-accent"
              style={{ width: `${intlCurrentWidth}%` }}
            />
            {intlUplift > 0 && (
              <div
                className="h-full bg-accent/20 border-y border-r border-accent/40 border-dashed"
                style={{ width: `${intlUpliftWidth}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-accent" />
          <span>Current Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-accent/20 border border-accent/40 border-dashed" />
          <span>Potential Uplift</span>
        </div>
      </div>
    </div>
  );
}
