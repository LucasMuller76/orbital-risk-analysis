"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummary } from "@/hooks/useAnalytics";
import { formatCPS, formatNumber, formatPct } from "@/lib/utils";
import { Globe, AlertTriangle, ShieldCheck, Activity } from "lucide-react";

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-zinc-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function KpiCards() {
  const { data, isLoading } = useSummary();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16 mt-1" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalPct = (n: number) => (n / data.total_objects) * 100;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        title="Total Objects"
        value={formatNumber(data.total_objects)}
        sub="LEO objects tracked"
        icon={Globe}
        accent="bg-blue-50 text-blue-600"
      />
      <KpiCard
        title="Avg CPS Score"
        value={formatCPS(data.mean_cps)}
        sub={`std ${formatCPS(data.std_cps)}`}
        icon={Activity}
        accent="bg-zinc-100 text-zinc-600"
      />
      <KpiCard
        title="High Risk"
        value={formatPct(totalPct(data.risk_counts.HIGH))}
        sub={`${formatNumber(data.risk_counts.HIGH)} objects`}
        icon={AlertTriangle}
        accent="bg-red-50 text-red-600"
      />
      <KpiCard
        title="Low Risk"
        value={formatPct(totalPct(data.risk_counts.LOW))}
        sub={`${formatNumber(data.risk_counts.LOW)} objects`}
        icon={ShieldCheck}
        accent="bg-emerald-50 text-emerald-600"
      />
    </div>
  );
}
