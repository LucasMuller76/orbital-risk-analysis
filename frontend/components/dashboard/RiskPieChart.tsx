"use client";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useSummary } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

const COLORS: Record<string, string> = {
  HIGH:   "#ef4444",
  MEDIUM: "#f59e0b",
  LOW:    "#10b981",
};

const LABELS: Record<string, string> = {
  HIGH:   "Alto Risco",
  MEDIUM: "Risco Médio",
  LOW:    "Baixo Risco",
};

export function RiskPieChart() {
  const { data, isLoading } = useSummary();

  if (isLoading || !data) {
    return <Skeleton className="h-56 w-full" />;
  }

  const chartData = [
    { name: "HIGH",   value: data.risk_counts.HIGH },
    { name: "MEDIUM", value: data.risk_counts.MEDIUM },
    { name: "LOW",    value: data.risk_counts.LOW },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0" }}
          labelStyle={{ color: "#94a3b8" }}
          itemStyle={{ color: "#e2e8f0" }}
          formatter={(v, name) => [formatNumber(Number(v)), LABELS[String(name)] ?? String(name)] as [string, string]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{LABELS[value] ?? value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
