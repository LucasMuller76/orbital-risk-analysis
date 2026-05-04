"use client";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Cell,
} from "recharts";
import { useSummary } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/components/ui/api-error";
import { CHART_TOOLTIP, CHART_GRID_STROKE, CHART_AXIS_TICK } from "@/lib/chart-styles";

function riskColor(binStart: number): string {
  if (binStart >= 1.0) return "#ef4444";
  if (binStart >= 0.4) return "#f59e0b";
  return "#10b981";
}

export function RiskHistogram() {
  const { data, isLoading, error, mutate } = useSummary();

  if (error) return <ApiError onRetry={() => mutate()} className="h-56 w-full" />;
  if (isLoading || !data) {
    return <Skeleton className="h-56 w-full" />;
  }

  const chartData = data.histogram.map((b) => ({
    name: b.bin_start.toFixed(2),
    count: b.count,
    binStart: b.bin_start,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="name"
          tick={CHART_AXIS_TICK}
          tickLine={false}
          axisLine={false}
          interval={9}
          label={{ value: "CPS_log", position: "insideBottom", offset: -2, fontSize: 11, fill: "#475569" }}
        />
        <YAxis
          tick={CHART_AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "rgba(34, 211, 238, 0.04)" }}
          {...CHART_TOOLTIP}
          formatter={(v) => [Number(v).toLocaleString(), "Objects"] as [string, string]}
          labelFormatter={(l) => `CPS_log ≈ ${l}`}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={20}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={riskColor(entry.binStart)} fillOpacity={0.88} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
