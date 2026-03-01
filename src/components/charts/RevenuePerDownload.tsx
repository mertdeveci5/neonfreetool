"use client";

import { formatRPD } from "@/lib/format";

interface RevenuePerDownloadProps {
  rpd: number;
  medianRpd: number;
  topQuartileRpd: number;
}

export function RevenuePerDownload({
  rpd,
  medianRpd,
  topQuartileRpd,
}: RevenuePerDownloadProps) {
  const maxVal = Math.max(rpd, topQuartileRpd) * 1.2;
  const publisherPos = maxVal > 0 ? (rpd / maxVal) * 100 : 0;
  const medianPos = maxVal > 0 ? (medianRpd / maxVal) * 100 : 0;
  const topPos = maxVal > 0 ? (topQuartileRpd / maxVal) * 100 : 0;

  const isAboveMedian = rpd >= medianRpd;

  return (
    <div className="border border-border p-5">
      <h3 className="text-xs uppercase tracking-wider text-accent mb-4">
        Revenue Per Download
      </h3>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-semibold font-serif text-foreground">
          {formatRPD(rpd)}
        </span>
        <span
          className={`text-sm font-medium ${isAboveMedian ? "text-emerald-400" : "text-amber-400"}`}
        >
          {isAboveMedian ? "Above" : "Below"} median
        </span>
      </div>
      <p className="text-xs text-muted mb-5">per download</p>

      <div className="relative h-3 bg-border rounded-full overflow-visible">
        {/* Median marker */}
        <div
          className="absolute top-0 w-0.5 h-5 -mt-1 bg-muted/60"
          style={{ left: `${medianPos}%` }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted whitespace-nowrap">
            Median
          </span>
        </div>
        {/* Top quartile marker */}
        <div
          className="absolute top-0 w-0.5 h-5 -mt-1 bg-emerald-500/60"
          style={{ left: `${topPos}%` }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 whitespace-nowrap">
            Top 25%
          </span>
        </div>
        {/* Publisher bar */}
        <div
          className="absolute top-0 h-3 rounded-full bg-accent"
          style={{ width: `${publisherPos}%` }}
        />
      </div>

      <div className="flex justify-between mt-6 text-xs text-muted">
        <span>Industry median: {formatRPD(medianRpd)}</span>
        <span>Top quartile: {formatRPD(topQuartileRpd)}</span>
      </div>
    </div>
  );
}
