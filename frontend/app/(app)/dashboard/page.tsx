"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/layout/TopBar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RiskHistogram } from "@/components/dashboard/RiskHistogram";
import { RiskPieChart } from "@/components/dashboard/RiskPieChart";
import { AltitudeBarChart } from "@/components/dashboard/AltitudeBarChart";
import { RiskScatter } from "@/components/dashboard/RiskScatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, delay, ease: EASE },
});

export default function DashboardPage() {
  const { t } = useLanguage();
  const d = t.dashboard;

  return (
    <div className="space-y-6">
      <TopBar title={d.title} subtitle={d.subtitle} />

      <KpiCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <motion.div className="lg:col-span-3" {...reveal(0)}>
          <Card>
            <CardHeader>
              <CardTitle>{d.histTitle}</CardTitle>
              <p className="text-xs text-slate-500 mt-1">{d.histDesc}</p>
            </CardHeader>
            <CardContent>
              <RiskHistogram />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-2" {...reveal(0.1)}>
          <Card>
            <CardHeader>
              <CardTitle>{d.pieTitle}</CardTitle>
              <p className="text-xs text-slate-500 mt-1">{d.pieDesc}</p>
            </CardHeader>
            <CardContent>
              <RiskPieChart />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div {...reveal(0.15)}>
        <Card>
          <CardHeader>
            <CardTitle>{d.altTitle}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{d.altDesc}</p>
          </CardHeader>
          <CardContent>
            <AltitudeBarChart />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...reveal(0.2)}>
        <Card>
          <CardHeader>
            <CardTitle>{d.scatterTitle}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{d.scatterDesc}</p>
          </CardHeader>
          <CardContent>
            <RiskScatter />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
