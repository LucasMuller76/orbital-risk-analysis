import { TopBar } from "@/components/layout/TopBar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RiskHistogram } from "@/components/dashboard/RiskHistogram";
import { RiskPieChart } from "@/components/dashboard/RiskPieChart";
import { AltitudeBarChart } from "@/components/dashboard/AltitudeBarChart";
import { RiskScatter } from "@/components/dashboard/RiskScatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <TopBar
        title="Dashboard"
        subtitle="LEO collision risk overview — 27,994 tracked objects"
      />

      <KpiCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>CPS_log Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskHistogram />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Category Split</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskPieChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mean CPS_log by Altitude Band (50 km bins)</CardTitle>
        </CardHeader>
        <CardContent>
          <AltitudeBarChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Altitude vs Predicted Risk — sample of 2,000 objects</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskScatter />
        </CardContent>
      </Card>
    </div>
  );
}
