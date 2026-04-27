"use client";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/layout/TopBar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RiskHistogram } from "@/components/dashboard/RiskHistogram";
import { RiskPieChart } from "@/components/dashboard/RiskPieChart";
import { AltitudeBarChart } from "@/components/dashboard/AltitudeBarChart";
import { RiskScatter } from "@/components/dashboard/RiskScatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { t } = useLanguage();
  const d = t.dashboard;

  return (
    <div className="space-y-6">
      <TopBar title={d.title} subtitle={d.subtitle} />

      <KpiCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{d.histTitle}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{d.histDesc}</p>
          </CardHeader>
          <CardContent>
            <RiskHistogram />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{d.pieTitle}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{d.pieDesc}</p>
          </CardHeader>
          <CardContent>
            <RiskPieChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{d.altTitle}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{d.altDesc}</p>
        </CardHeader>
        <CardContent>
          <AltitudeBarChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{d.scatterTitle}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{d.scatterDesc}</p>
        </CardHeader>
        <CardContent>
          <RiskScatter />
        </CardContent>
      </Card>
    </div>
  );
}
