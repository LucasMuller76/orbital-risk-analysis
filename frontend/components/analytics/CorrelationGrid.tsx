"use client";
import { useCorrelations } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { featureLabel } from "@/lib/utils";

function corrColor(r: number): string {
  const abs = Math.abs(r);
  if (abs >= 0.7) return r > 0 ? "#1d4ed8" : "#dc2626";
  if (abs >= 0.4) return r > 0 ? "#3b82f6" : "#ef4444";
  if (abs >= 0.2) return r > 0 ? "#93c5fd" : "#fca5a5";
  return "#d4d4d8";
}

export function CorrelationGrid() {
  const { data, isLoading } = useCorrelations();

  if (isLoading || !data) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-2">
      {data.map((item) => {
        const barW = `${Math.abs(item.pearson_r) * 100}%`;
        const positive = item.pearson_r >= 0;
        return (
          <div key={item.feature} className="flex items-center gap-3">
            <span className="w-44 shrink-0 text-right text-xs text-zinc-600">
              {featureLabel(item.feature)}
            </span>
            <div className="flex flex-1 items-center gap-1">
              {/* Negative side */}
              <div className="flex w-1/2 justify-end">
                {!positive && (
                  <div
                    className="h-5 rounded-l-md"
                    style={{ width: barW, backgroundColor: corrColor(item.pearson_r) }}
                  />
                )}
              </div>
              {/* Centre line */}
              <div className="h-5 w-px bg-zinc-300" />
              {/* Positive side */}
              <div className="w-1/2">
                {positive && (
                  <div
                    className="h-5 rounded-r-md"
                    style={{ width: barW, backgroundColor: corrColor(item.pearson_r) }}
                  />
                )}
              </div>
            </div>
            <span className={`w-14 text-right font-mono text-xs font-medium ${item.pearson_r >= 0 ? "text-blue-700" : "text-red-600"}`}>
              {item.pearson_r >= 0 ? "+" : ""}{item.pearson_r.toFixed(3)}
            </span>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-red-500 opacity-70" /> Negative correlation</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-blue-600 opacity-70" /> Positive correlation</span>
      </div>
    </div>
  );
}
