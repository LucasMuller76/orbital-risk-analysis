"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummary } from "@/hooks/useAnalytics";
import { formatCPS, formatNumber, formatPct } from "@/lib/utils";
import { Globe, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { ApiError } from "@/components/ui/api-error";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accentBg: string;
  accentText: string;
  accentGlow: string;
  cardClass?: string;
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accentBg,
  accentText,
  accentGlow,
  cardClass,
}: KpiCardProps) {
  return (
    <Card className={cardClass}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {/* Icon container with glow ring */}
          <div
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${accentBg} ring-1 ${accentGlow}`}
          >
            <Icon className={`h-4 w-4 ${accentText}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className="text-3xl font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #f1f5f9 20%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-600">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: "easeOut" as const },
  },
};

export function KpiCards() {
  const { data, isLoading, error, mutate } = useSummary();
  const { t } = useLanguage();

  if (error) return <ApiError onRetry={() => mutate()} className="h-32" />;
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mt-1" />
              <Skeleton className="h-3 w-28 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalPct = (n: number) => (n / data.total_objects) * 100;

  const cards: KpiCardProps[] = [
    {
      title:      t.kpi.totalObjects,
      value:      formatNumber(data.total_objects),
      sub:        t.kpi.trackedSub,
      icon:       Globe,
      accentBg:   "bg-cyan-500/10",
      accentText: "text-cyan-400",
      accentGlow: "ring-cyan-500/20",
    },
    {
      title:      t.kpi.avgCps,
      value:      formatCPS(data.mean_cps),
      sub:        `${t.kpi.stdSub}: ${formatCPS(data.std_cps)}`,
      icon:       Activity,
      accentBg:   "bg-slate-700/40",
      accentText: "text-slate-400",
      accentGlow: "ring-slate-600/30",
    },
    {
      title:      t.kpi.highRisk,
      value:      formatPct(totalPct(data.risk_counts.HIGH)),
      sub:        `${formatNumber(data.risk_counts.HIGH)} ${t.kpi.objectsSub}`,
      icon:       AlertTriangle,
      accentBg:   "bg-red-500/10",
      accentText: "text-red-400",
      accentGlow: "ring-red-500/20",
      cardClass:  "card-risk-high",
    },
    {
      title:      t.kpi.lowRisk,
      value:      formatPct(totalPct(data.risk_counts.LOW)),
      sub:        `${formatNumber(data.risk_counts.LOW)} ${t.kpi.objectsSub}`,
      icon:       ShieldCheck,
      accentBg:   "bg-emerald-500/10",
      accentText: "text-emerald-400",
      accentGlow: "ring-emerald-500/20",
      cardClass:  "card-risk-low",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, i) => (
        <motion.div key={i} variants={itemVariants}>
          <KpiCard {...card} />
        </motion.div>
      ))}
    </motion.div>
  );
}
