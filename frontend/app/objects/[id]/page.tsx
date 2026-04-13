"use client";
import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useObject } from "@/hooks/useObjects";
import { useFeatureImportance } from "@/hooks/useAnalytics";
import { RiskBadge } from "@/components/objects/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { featureLabel, formatCPS, riskHex } from "@/lib/utils";
import type { RiskCategory } from "@/lib/types";
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

const FEATURE_KEYS = [
  "altitude_km", "inclination_deg", "eccentricity", "velocity_km_s", "period_min",
  "bstar_abs", "local_density_km3", "debris_fraction_local", "incl_dispersion_local",
  "alt_density_gradient", "object_type_code", "is_debris", "is_uncontrolled",
] as const;

function FeatureRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2.5 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-mono text-sm text-zinc-900">{value}</span>
    </div>
  );
}

function formatFeatureValue(key: string, value: unknown): string {
  if (typeof value === "number") {
    if (["is_debris", "is_uncontrolled", "object_type_code"].includes(key))
      return String(value);
    return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
  }
  return String(value ?? "—");
}

export default function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const noradId = parseInt(id, 10);

  const { data: obj, isLoading: objLoading } = useObject(isNaN(noradId) ? null : noradId);
  const { data: importances, isLoading: impLoading } = useFeatureImportance();

  if (objLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!obj) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Object {noradId} not found.
      </div>
    );
  }

  const riskCat = obj.risk_category as RiskCategory;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/objects" className="hover:text-zinc-900">Objects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-900 font-medium">{obj.norad_cat_id}</span>
      </nav>

      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 mb-1">
                NORAD {obj.norad_cat_id}
              </p>
              <h1 className="text-2xl font-bold text-zinc-900">{obj.object_type}</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Altitude band: <span className="font-medium text-zinc-700">{obj.altitude_band} km</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400 mb-1.5">Predicted CPS_log</p>
              <p className="text-4xl font-bold" style={{ color: riskHex(riskCat) }}>
                {formatCPS(obj.predicted_CPS_log)}
              </p>
              <div className="mt-2">
                <RiskBadge category={riskCat} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Feature grid */}
        <Card>
          <CardHeader>
            <CardTitle>Orbital Features</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {FEATURE_KEYS.map((key) => (
              <FeatureRow
                key={key}
                label={featureLabel(key)}
                value={formatFeatureValue(key, (obj as unknown as Record<string, unknown>)[key])}
              />
            ))}
          </CardContent>
        </Card>

        {/* Feature importance */}
        <Card>
          <CardHeader>
            <CardTitle>Model Feature Importance (global)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {impLoading || !importances ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  layout="vertical"
                  data={[...importances].reverse()}
                  margin={{ top: 0, right: 16, bottom: 0, left: 140 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    tick={{ fontSize: 11, fill: "#3f3f46" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={featureLabel}
                    width={138}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                    formatter={(v) => [`${(Number(v) * 100).toFixed(2)}%`, "Importance"] as [string, string]}
                    labelFormatter={(l) => featureLabel(String(l))}
                  />
                  <Bar dataKey="importance" radius={[0, 3, 3, 0]}>
                    {importances.map((_, i) => (
                      <Cell
                        key={i}
                        fill="#3b82f6"
                        fillOpacity={0.7 + 0.3 * (1 - i / importances.length)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
