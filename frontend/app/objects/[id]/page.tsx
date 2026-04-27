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
import { useLanguage } from "@/lib/language-context";
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
    <div className="flex items-center justify-between border-b border-slate-800 py-2.5 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-mono text-sm text-slate-200">{value}</span>
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
  const { t } = useLanguage();
  const od = t.objectDetail;

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
      <div className="rounded-2xl border border-red-800/50 bg-red-950/30 p-6 text-red-400">
        {od.notFound.replace("{id}", String(noradId))}
      </div>
    );
  }

  const riskCat = obj.risk_category as RiskCategory;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">{od.breadDashboard}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/objects" className="hover:text-slate-300 transition-colors">{od.breadObjects}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-300 font-medium">{obj.norad_cat_id}</span>
      </nav>

      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                NORAD {obj.norad_cat_id}
              </p>
              <h1 className="text-2xl font-bold text-slate-100">{obj.object_type}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {od.altitudeBand}: <span className="font-medium text-slate-300">{obj.altitude_band} km</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1.5">{od.predictedCps}</p>
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
            <CardTitle>{od.orbitalParams}</CardTitle>
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
            <CardTitle>{od.featureImportance}</CardTitle>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={featureLabel}
                    width={138}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0" }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(v) => [`${(Number(v) * 100).toFixed(2)}%`, od.importancePct] as [string, string]}
                    labelFormatter={(l) => featureLabel(String(l))}
                  />
                  <Bar dataKey="importance" radius={[0, 3, 3, 0]}>
                    {importances.map((_, i) => (
                      <Cell
                        key={i}
                        fill="#22d3ee"
                        fillOpacity={0.5 + 0.5 * (1 - i / importances.length)}
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
