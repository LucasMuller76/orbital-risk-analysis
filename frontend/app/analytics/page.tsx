import { TopBar } from "@/components/layout/TopBar";
import { ObjectTypeChart } from "@/components/analytics/ObjectTypeChart";
import { CorrelationGrid } from "@/components/analytics/CorrelationGrid";
import { AltitudeBarChart } from "@/components/dashboard/AltitudeBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <TopBar
        title="Analytics"
        subtitle="Feature correlations, object type distributions, and altitude-level risk"
      />

      {/* Object type distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Object Type — Count and Mean CPS_log</CardTitle>
        </CardHeader>
        <CardContent>
          <ObjectTypeChart />
        </CardContent>
      </Card>

      {/* Altitude risk heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Risk by Altitude Band (colour = risk level)</CardTitle>
        </CardHeader>
        <CardContent>
          <AltitudeBarChart />
        </CardContent>
      </Card>

      {/* Correlation chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Correlations with CPS_log (Pearson r)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <CorrelationGrid />
        </CardContent>
      </Card>
    </div>
  );
}
