"use client";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useScatter } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { riskHex } from "@/lib/utils";
import type { RiskCategory } from "@/lib/types";

export function RiskScatter() {
  const { data, isLoading } = useScatter();

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="altitude_km"
          name="Altitude"
          unit=" km"
          type="number"
          domain={[150, 2050]}
          tick={{ fontSize: 10, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          label={{ value: "Altitude (km)", position: "insideBottom", offset: -2, fontSize: 11, fill: "#64748b" }}
        />
        <YAxis
          dataKey="predicted_CPS_log"
          name="CPS_log"
          type="number"
          domain={[0, 1.9]}
          tick={{ fontSize: 10, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          width={42}
          label={{ value: "CPS_log", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
        />
        <ZAxis range={[18, 18]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: "#334155" }}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0" }}
          labelStyle={{ color: "#94a3b8" }}
          itemStyle={{ color: "#e2e8f0" }}
          formatter={(v, name) => [
            name === "Altitude" ? `${Number(v).toFixed(1)} km` : Number(v).toFixed(4),
            String(name),
          ] as [string, string]}
        />
        <Scatter data={data} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={riskHex(entry.risk_category as RiskCategory)}
              fillOpacity={0.55}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
