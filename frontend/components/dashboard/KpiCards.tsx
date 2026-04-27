"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummary } from "@/hooks/useAnalytics";
import { formatCPS, formatNumber, formatPct } from "@/lib/utils";
import { Globe, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accentBg,
  accentText,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accentBg: string;
  accentText: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentBg}`}>
            <Icon className={`h-4 w-4 ${accentText}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-slate-100">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function KpiCards() {
  const { data, isLoading } = useSummary();
  const { t } = useLanguage();

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
        title={t.kpi.totalObjects}
        value={formatNumber(data.total_objects)}
        sub={t.kpi.trackedSub}
        icon={Globe}
        accentBg="bg-cyan-500/10"
        accentText="text-cyan-400"
      />
      <KpiCard
        title={t.kpi.avgCps}
        value={formatCPS(data.mean_cps)}
        sub={`${t.kpi.stdSub}: ${formatCPS(data.std_cps)}`}
        icon={Activity}
        accentBg="bg-slate-700/50"
        accentText="text-slate-400"
      />
      <KpiCard
        title={t.kpi.highRisk}
        value={formatPct(totalPct(data.risk_counts.HIGH))}
        sub={`${formatNumber(data.risk_counts.HIGH)} ${t.kpi.objectsSub}`}
        icon={AlertTriangle}
        accentBg="bg-red-500/10"
        accentText="text-red-400"
      />
      <KpiCard
        title={t.kpi.lowRisk}
        value={formatPct(totalPct(data.risk_counts.LOW))}
        sub={`${formatNumber(data.risk_counts.LOW)} ${t.kpi.objectsSub}`}
        icon={ShieldCheck}
        accentBg="bg-emerald-500/10"
        accentText="text-emerald-400"
      />
    </div>
  );
}
