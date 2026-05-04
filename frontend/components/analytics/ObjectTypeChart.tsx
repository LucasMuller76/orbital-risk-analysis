"use client";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useByType } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/components/ui/api-error";
import { CHART_TOOLTIP, CHART_GRID_STROKE, CHART_AXIS_TICK } from "@/lib/chart-styles";

const PALETTE = ["#22d3ee", "#818cf8", "#f59e0b", "#10b981", "#ef4444"];

export function ObjectTypeChart() {
  const { data, isLoading, error, mutate } = useByType();

  if (error) return <ApiError onRetry={() => mutate()} className="h-56 w-full" />;
  if (isLoading || !data) return <Skeleton className="h-56 w-full" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="object_type"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="count"
          orientation="left"
          tick={CHART_AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={50}
          label={{ value: "Qtd.", angle: -90, position: "insideLeft", fontSize: 11, fill: "#475569" }}
        />
        <YAxis
          yAxisId="cps"
          orientation="right"
          tick={CHART_AXIS_TICK}
          tickLine={false}
          axisLine={false}
          domain={[0, 1.8]}
          width={50}
          label={{ value: "CPS_log médio", angle: 90, position: "insideRight", fontSize: 11, fill: "#475569" }}
        />
        <Tooltip
          {...CHART_TOOLTIP}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        <Bar yAxisId="count" dataKey="count" name="Quantidade" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.78} />
          ))}
        </Bar>
        <Bar yAxisId="cps" dataKey="mean_cps" name="CPS_log médio" radius={[3, 3, 0, 0]} fill="#f59e0b" fillOpacity={0.65} />
      </BarChart>
    </ResponsiveContainer>
  );
}
