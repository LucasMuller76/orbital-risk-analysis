"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react";
import { useObjects } from "@/hooks/useObjects";
import { RiskBadge } from "./RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/components/ui/api-error";
import { cn, formatAltitude, formatCPS, formatNumber } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import type { RiskCategory } from "@/lib/types";

type SortKey = "predicted_CPS_log" | "altitude_km" | "inclination_deg" | "velocity_km_s";
type SortOrder = "asc" | "desc";

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown className="ml-1 h-3 w-3 text-slate-600" />;
  return order === "asc"
    ? <ArrowUp className="ml-1 h-3 w-3 text-cyan-400" />
    : <ArrowDown className="ml-1 h-3 w-3 text-cyan-400" />;
}

export function ObjectsTable() {
  const router = useRouter();
  const { t } = useLanguage();
  const o = t.objects;

  const [page, setPage] = useState(1);
  const [risk, setRisk] = useState<RiskCategory | "">("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("predicted_CPS_log");
  const [order, setOrder] = useState<SortOrder>("desc");

  const { data, isLoading, error, mutate } = useObjects({ page, limit: 50, risk, search: search || undefined, sort, order });

  const handleSort = useCallback((col: SortKey) => {
    if (col === sort) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(col);
      setOrder("desc");
    }
    setPage(1);
  }, [sort]);

  const handleRisk = (r: RiskCategory | "") => { setRisk(r); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const RISK_FILTERS: Array<{ label: string; value: RiskCategory | "" }> = [
    { label: o.filters.all,    value: "" },
    { label: o.filters.high,   value: "HIGH" },
    { label: o.filters.medium, value: "MEDIUM" },
    { label: o.filters.low,    value: "LOW" },
  ];

  const COLS: Array<{ key: SortKey; label: string }> = [
    { key: "altitude_km",       label: o.cols.altitude },
    { key: "inclination_deg",   label: o.cols.inclination },
    { key: "velocity_km_s",     label: o.cols.velocity },
    { key: "predicted_CPS_log", label: o.cols.cps },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder={o.searchPlaceholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-9 rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(7,14,36,0.6)] pl-9 pr-8 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500/40 backdrop-blur-sm"
          />
          {search && (
            <button onClick={() => handleSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-slate-500 hover:text-slate-300" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(7,14,36,0.6)] p-1 backdrop-blur-sm">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleRisk(f.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                risk === f.value
                  ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25"
                  : "text-slate-400 hover:bg-slate-700 hover:text-slate-200",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {data && (
          <span className="ml-auto text-sm text-slate-500">
            {formatNumber(data.total)} {o.objectsCount}
          </span>
        )}
      </div>

      {/* Table */}
      {error ? (
        <ApiError onRetry={() => mutate()} className="h-64" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgba(34,211,238,0.1)] bg-[rgba(7,14,36,0.78)] shadow-[0_4px_28px_rgba(0,0,0,0.45)] backdrop-blur-[18px]">
          <table className="w-full text-sm">
            <thead className="border-b border-[rgba(34,211,238,0.08)] bg-[rgba(7,14,36,0.5)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {o.cols.norad}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {o.cols.type}
                </th>
                {COLS.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort(c.key)}
                      className="flex items-center text-xs font-medium uppercase tracking-wide text-slate-500 hover:text-slate-200 transition-colors"
                    >
                      {c.label}
                      <SortIcon active={sort === c.key} order={order} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  {o.cols.risk}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(34,211,238,0.05)]">
              {isLoading
                ? [...Array(10)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.items.map((obj) => (
                    <tr
                      key={obj.norad_cat_id}
                      onClick={() => router.push(`/objects/${obj.norad_cat_id}`)}
                      className="cursor-pointer transition-colors hover:bg-[rgba(34,211,238,0.04)]"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{obj.norad_cat_id}</td>
                      <td className="px-4 py-3 text-slate-300">{obj.object_type}</td>
                      <td className="px-4 py-3 text-slate-300">{formatAltitude(obj.altitude_km)}</td>
                      <td className="px-4 py-3 text-slate-300">{obj.inclination_deg.toFixed(2)}°</td>
                      <td className="px-4 py-3 text-slate-300">{obj.velocity_km_s.toFixed(3)} km/s</td>
                      <td className="px-4 py-3 font-mono text-slate-100 font-semibold">{formatCPS(obj.predicted_CPS_log)}</td>
                      <td className="px-4 py-3"><RiskBadge category={obj.risk_category} size="sm" /></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!error && data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {o.page} {data.page} {o.of} {data.pages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[rgba(34,211,238,0.12)] bg-[rgba(7,14,36,0.5)] px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-[rgba(34,211,238,0.25)] hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {o.prev}
            </button>
            <button
              disabled={page === data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[rgba(34,211,238,0.12)] bg-[rgba(7,14,36,0.5)] px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-[rgba(34,211,238,0.25)] hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {o.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
