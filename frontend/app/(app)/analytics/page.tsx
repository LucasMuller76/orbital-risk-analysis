"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/layout/TopBar";
import { ObjectTypeChart } from "@/components/analytics/ObjectTypeChart";
import { CorrelationGrid } from "@/components/analytics/CorrelationGrid";
import { FeatureImportanceChart } from "@/components/analytics/FeatureImportanceChart";
import { AltitudeBarChart } from "@/components/dashboard/AltitudeBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, delay, ease: EASE },
});

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const a = t.analytics;

  return (
    <div className="space-y-6">
      <TopBar title={a.title} subtitle={a.subtitle} />

      {/* Feature Importance — new, shown first */}
      <motion.div {...reveal(0)}>
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Random Forest feature importances — contribution of each orbital parameter to CPS_log prediction.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <FeatureImportanceChart />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...reveal(0.08)}>
        <Card>
          <CardHeader>
            <CardTitle>{a.typeTitle}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{a.typeDesc}</p>
          </CardHeader>
          <CardContent>
            <ObjectTypeChart />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...reveal(0.12)}>
        <Card>
          <CardHeader>
            <CardTitle>{a.altTitle}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{a.altDesc}</p>
          </CardHeader>
          <CardContent>
            <AltitudeBarChart />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...reveal(0.16)}>
        <Card>
          <CardHeader>
            <CardTitle>{a.correlTitle}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{a.correlDesc}</p>
          </CardHeader>
          <CardContent className="pt-2">
            <CorrelationGrid />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
