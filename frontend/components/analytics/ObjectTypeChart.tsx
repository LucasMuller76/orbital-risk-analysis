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

const PALETTE = ["#22d3ee", "#818cf8", "#f59e0b", "#10b981", "#ef4444"];

export function ObjectTypeChart() {
  const { data, isLoading } = useByType();

  if (isLoading || !data) return <Skeleton className="h-56 w-full" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="object_type"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="count"
          orientation="left"
          tick={{ fontSize: 10, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          width={50}
          label={{ value: "Qtd.", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
        />
        <YAxis
          yAxisId="cps"
          orientation="right"
          tick={{ fontSize: 10, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          domain={[0, 1.8]}
          width={50}
          label={{ value: "CPS_log médio", angle: 90, position: "insideRight", fontSize: 11, fill: "#64748b" }}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0" }}
          labelStyle={{ color: "#94a3b8" }}
          itemStyle={{ color: "#e2e8f0" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        <Bar yAxisId="count" dataKey="count" name="Quantidade" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.75} />
          ))}
        </Bar>
        <Bar yAxisId="cps" dataKey="mean_cps" name="CPS_log médio" radius={[3, 3, 0, 0]} fill="#f59e0b" fillOpacity={0.65} />
      </BarChart>
    </ResponsiveContainer>
  );
}
