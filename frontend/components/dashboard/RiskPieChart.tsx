"use client";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useSummary } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import { CHART_TOOLTIP } from "@/lib/chart-styles";

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
    { name: "HIGH",   value: data.risk_counts.HIGH   },
    { name: "MEDIUM", value: data.risk_counts.MEDIUM },
    { name: "LOW",    value: data.risk_counts.LOW    },
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
          strokeWidth={0}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} fillOpacity={0.88} />
          ))}
        </Pie>
        <Tooltip
          {...CHART_TOOLTIP}
          formatter={(v, name) => [
            formatNumber(Number(v)),
            LABELS[String(name)] ?? String(name),
          ] as [string, string]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {LABELS[value] ?? value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
