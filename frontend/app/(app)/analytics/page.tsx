"use client";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/layout/TopBar";
import { ObjectTypeChart } from "@/components/analytics/ObjectTypeChart";
import { CorrelationGrid } from "@/components/analytics/CorrelationGrid";
import { AltitudeBarChart } from "@/components/dashboard/AltitudeBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const a = t.analytics;

  return (
    <div className="space-y-6">
      <TopBar title={a.title} subtitle={a.subtitle} />

      <Card>
        <CardHeader>
          <CardTitle>{a.typeTitle}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{a.typeDesc}</p>
        </CardHeader>
        <CardContent>
          <ObjectTypeChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{a.altTitle}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{a.altDesc}</p>
        </CardHeader>
        <CardContent>
          <AltitudeBarChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{a.correlTitle}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{a.correlDesc}</p>
        </CardHeader>
        <CardContent className="pt-2">
          <CorrelationGrid />
        </CardContent>
      </Card>
    </div>
  );
}
