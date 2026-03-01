"use client";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
}

export function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <div className="p-5">
      <p className="text-xs uppercase tracking-wider text-accent mb-2">
        {label}
      </p>
      <p className="text-2xl font-semibold font-serif tracking-tight text-foreground">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}
