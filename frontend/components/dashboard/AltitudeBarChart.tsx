"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useByAltitude } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

function cpsColor(v: number): string {
  if (v >= 1.0) return "#ef4444";
  if (v >= 0.4) return "#f59e0b";
  return "#10b981";
}

export function AltitudeBarChart() {
  const { data, isLoading } = useByAltitude();

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, bottom: 40, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="band"
          tick={{ fontSize: 9, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
          angle={-55}
          textAnchor="end"
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
          width={40}
          domain={[0, 1.8]}
          label={{ value: "Avg CPS_log", angle: -90, position: "insideLeft", fontSize: 11, fill: "#71717a" }}
        />
        <Tooltip
          cursor={{ fill: "#f4f4f5" }}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
          formatter={(v) => [Number(v).toFixed(4), "Mean CPS_log"] as [string, string]}
          labelFormatter={(l) => `Altitude: ${l} km`}
        />
        <Bar dataKey="mean_cps" radius={[3, 3, 0, 0]} maxBarSize={18}>
          {data.map((entry, i) => (
            <Cell key={i} fill={cpsColor(entry.mean_cps)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
