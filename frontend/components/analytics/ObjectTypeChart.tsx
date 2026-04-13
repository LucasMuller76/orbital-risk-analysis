"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useByType } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const PALETTE = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export function ObjectTypeChart() {
  const { data, isLoading } = useByType();

  if (isLoading || !data) return <Skeleton className="h-56 w-full" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="object_type"
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="count"
          orientation="left"
          tick={{ fontSize: 10, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
          width={50}
          label={{ value: "Count", angle: -90, position: "insideLeft", fontSize: 11, fill: "#71717a" }}
        />
        <YAxis
          yAxisId="cps"
          orientation="right"
          tick={{ fontSize: 10, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
          domain={[0, 1.8]}
          width={50}
          label={{ value: "Avg CPS_log", angle: 90, position: "insideRight", fontSize: 11, fill: "#71717a" }}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        <Bar yAxisId="count" dataKey="count" name="Object count" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.75} />
          ))}
        </Bar>
        <Bar yAxisId="cps" dataKey="mean_cps" name="Avg CPS_log" radius={[3, 3, 0, 0]} fill="#f59e0b" fillOpacity={0.6} />
      </BarChart>
    </ResponsiveContainer>
  );
}
