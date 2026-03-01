"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COUNTRY_SHORT_LABELS, COUNTRY_LABELS, CHART_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

interface TopCountriesBarProps {
  countryRevenues: Record<string, number>;
}

export function TopCountriesBar({ countryRevenues }: TopCountriesBarProps) {
  const data = Object.entries(countryRevenues)
    .map(([code, revenue]) => ({
      country: COUNTRY_SHORT_LABELS[code] || code.toUpperCase(),
      fullName: COUNTRY_LABELS[code] || code.toUpperCase(),
      code,
      revenue,
    }))
    .filter((d) => d.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <div className="border border-border p-5">
      <h3 className="text-xs uppercase tracking-wider text-accent mb-4">
        Top Revenue Markets
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis
              type="number"
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fontSize: 11, fill: "#8a8580" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="country"
              width={72}
              tick={{ fontSize: 11, fill: "#8a8580" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(label) => {
                const item = data.find((d) => d.country === label);
                return item?.fullName || label;
              }}
              labelStyle={{ fontWeight: 500, color: "#e8e4df" }}
              contentStyle={{
                background: "#2a2a2a",
                border: "1px solid #3d3d3d",
                borderRadius: "0",
                fontSize: "13px",
                color: "#e8e4df",
              }}
              itemStyle={{ color: "#e8e4df" }}
            />
            <Bar dataKey="revenue" radius={[0, 2, 2, 0]} barSize={18}>
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
