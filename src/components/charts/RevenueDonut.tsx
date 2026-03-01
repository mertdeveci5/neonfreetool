"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";

interface RevenueDonutProps {
  usRevenue: number;
  totalRevenue: number;
}

export function RevenueDonut({ usRevenue, totalRevenue }: RevenueDonutProps) {
  const nonUsRevenue = Math.max(0, totalRevenue - usRevenue);
  const data = [
    { name: "United States", value: usRevenue },
    { name: "Rest of World", value: nonUsRevenue },
  ];

  const COLORS = ["#c4956a", "#3d3d3d"];

  return (
    <div className="border border-border p-5">
      <h3 className="text-xs uppercase tracking-wider text-accent mb-4">
        US vs. International Revenue
      </h3>
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                background: "#2a2a2a",
                border: "1px solid #3d3d3d",
                borderRadius: "0",
                fontSize: "13px",
                color: "#e8e4df",
              }}
              itemStyle={{ color: "#e8e4df" }}
              labelStyle={{ color: "#8a8580" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-semibold font-serif text-foreground">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-xs text-muted">Total</span>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span>
            US{" "}
            {formatPercent(totalRevenue > 0 ? usRevenue / totalRevenue : 0)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#3d3d3d" }}
          />
          <span>
            Intl{" "}
            {formatPercent(
              totalRevenue > 0 ? nonUsRevenue / totalRevenue : 0
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
