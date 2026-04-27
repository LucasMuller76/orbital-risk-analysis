"use client";
import { useCorrelations } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { featureLabel } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

function corrColor(r: number): string {
  const abs = Math.abs(r);
  if (abs >= 0.7) return r > 0 ? "#2563eb" : "#dc2626";
  if (abs >= 0.4) return r > 0 ? "#3b82f6" : "#ef4444";
  if (abs >= 0.2) return r > 0 ? "#60a5fa" : "#f87171";
  return "#334155";
}

export function CorrelationGrid() {
  const { data, isLoading } = useCorrelations();
  const { t } = useLanguage();

  if (isLoading || !data) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-2">
      {data.map((item) => {
        const barW = `${Math.abs(item.pearson_r) * 100}%`;
        const positive = item.pearson_r >= 0;
        return (
          <div key={item.feature} className="flex items-center gap-3">
            <span className="w-44 shrink-0 text-right text-xs text-slate-400">
              {featureLabel(item.feature)}
            </span>
            <div className="flex flex-1 items-center gap-1">
              <div className="flex w-1/2 justify-end">
                {!positive && (
                  <div
                    className="h-5 rounded-l-md"
                    style={{ width: barW, backgroundColor: corrColor(item.pearson_r) }}
                  />
                )}
              </div>
              <div className="h-5 w-px bg-slate-600" />
              <div className="w-1/2">
                {positive && (
                  <div
                    className="h-5 rounded-r-md"
                    style={{ width: barW, backgroundColor: corrColor(item.pearson_r) }}
                  />
                )}
              </div>
            </div>
            <span className={`w-14 text-right font-mono text-xs font-medium ${item.pearson_r >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {item.pearson_r >= 0 ? "+" : ""}{item.pearson_r.toFixed(3)}
            </span>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-red-500 opacity-70" />
          {t.analytics.negCorrel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-blue-500 opacity-70" />
          {t.analytics.posCorrel}
        </span>
      </div>
    </div>
  );
}
