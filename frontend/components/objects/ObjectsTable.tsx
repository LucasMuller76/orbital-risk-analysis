"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react";
import { useObjects } from "@/hooks/useObjects";
import { RiskBadge } from "./RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatAltitude, formatCPS, formatNumber } from "@/lib/utils";
import type { RiskCategory } from "@/lib/types";

type SortKey = "predicted_CPS_log" | "altitude_km" | "inclination_deg" | "velocity_km_s";
type SortOrder = "asc" | "desc";

const RISK_FILTERS: Array<{ label: string; value: RiskCategory | "" }> = [
  { label: "All", value: "" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

function SortIcon({ col, active, order }: { col: string; active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown className="ml-1 h-3 w-3 text-zinc-400" />;
  return order === "asc"
    ? <ArrowUp className="ml-1 h-3 w-3 text-zinc-700" />
    : <ArrowDown className="ml-1 h-3 w-3 text-zinc-700" />;
}

export function ObjectsTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [risk, setRisk] = useState<RiskCategory | "">("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("predicted_CPS_log");
  const [order, setOrder] = useState<SortOrder>("desc");

  const { data, isLoading } = useObjects({ page, limit: 50, risk, search: search || undefined, sort, order });

  const handleSort = useCallback((col: SortKey) => {
    if (col === sort) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(col);
      setOrder("desc");
    }
    setPage(1);
  }, [sort]);

  const handleRisk = (r: RiskCategory | "") => { setRisk(r); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const COLS: Array<{ key: SortKey; label: string }> = [
    { key: "altitude_km",      label: "Altitude" },
    { key: "inclination_deg",  label: "Inclination" },
    { key: "velocity_km_s",    label: "Velocity" },
    { key: "predicted_CPS_log",label: "CPS_log" },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="NORAD ID or type..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-9 rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          {search && (
            <button onClick={() => handleSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-700" />
            </button>
          )}
        </div>

        {/* Risk filter buttons */}
        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleRisk(f.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                risk === f.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {data && (
          <span className="ml-auto text-sm text-zinc-500">
            {formatNumber(data.total)} objects
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                NORAD ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Type
              </th>
              {COLS.map((c) => (
                <th key={c.key} className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort(c.key)}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-900"
                  >
                    {c.label}
                    <SortIcon col={c.key} active={sort === c.key} order={order} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Risk
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
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
                    className="cursor-pointer transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                      {obj.norad_cat_id}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{obj.object_type}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatAltitude(obj.altitude_km)}</td>
                    <td className="px-4 py-3 text-zinc-700">{obj.inclination_deg.toFixed(2)}°</td>
                    <td className="px-4 py-3 text-zinc-700">{obj.velocity_km_s.toFixed(3)} km/s</td>
                    <td className="px-4 py-3 font-mono text-zinc-900 font-medium">
                      {formatCPS(obj.predicted_CPS_log)}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge category={obj.risk_category} size="sm" />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {data.page} of {data.pages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page === data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
