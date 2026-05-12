"use client";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useFeatureImportance } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const LABELS: Record<string, string> = {
  altitude_km:            "Altitude (km)",
  inclination_deg:        "Inclination (°)",
  eccentricity:           "Eccentricity",
  velocity_km_s:          "Velocity (km/s)",
  period_min:             "Orbital Period (min)",
  bstar_abs:              "BSTAR Drag Coeff.",
  local_density_km3:      "Local Object Density",
  debris_fraction_local:  "Local Debris Fraction",
  incl_dispersion_local:  "Incl. Dispersion",
  alt_density_gradient:   "Altitude Density Gradient",
  object_type_code:       "Object Type Code",
  is_debris:              "Is Debris",
  is_uncontrolled:        "Is Uncontrolled",
};

interface BarProps {
  feature: string;
  importance: number;
  rank: number;
  delay: number;
}

function FeatureBar({ feature, importance, rank, delay }: BarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const shouldReduce = useReducedMotion();

  const pct = (importance * 100).toFixed(1);
  const widthTarget = `${importance * 100}%`;
  const isTop = rank === 0;

  return (
    <div ref={ref} className="flex items-center gap-3 group">
      <span className="w-44 shrink-0 text-right text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
        {LABELS[feature] ?? feature}
      </span>

      <div className="flex-1 h-5 rounded-full bg-[rgba(34,211,238,0.05)] relative overflow-hidden border border-[rgba(34,211,238,0.06)]">
        {/* Fill bar */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: isTop
              ? "linear-gradient(90deg, #22d3ee, #6366f1)"
              : `linear-gradient(90deg, rgba(34,211,238,${0.85 - rank * 0.06}), rgba(34,211,238,${0.4 - rank * 0.03}))`,
          }}
          initial={{ width: "0%" }}
          animate={isInView ? { width: widthTarget } : { width: "0%" }}
          transition={{
            duration: shouldReduce ? 0 : 0.8,
            delay: shouldReduce ? 0 : delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* Shimmer sweep */}
        {!shouldReduce && (
          <motion.div
            className="absolute inset-y-0 w-12 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
            }}
            initial={{ left: "-3rem" }}
            animate={isInView ? { left: "110%" } : { left: "-3rem" }}
            transition={{ duration: 0.5, delay: delay + 0.6 }}
          />
        )}
      </div>

      <span className="w-12 shrink-0 text-right font-mono text-xs text-cyan-400">
        {pct}%
      </span>
    </div>
  );
}

export function FeatureImportanceChart() {
  const { data, isLoading } = useFeatureImportance();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-44 shrink-0" />
            <Skeleton className="h-5 flex-1 rounded-full" />
            <Skeleton className="h-3 w-12 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const sorted = [...data].sort((a, b) => b.importance - a.importance);

  return (
    <div className="space-y-2.5">
      {sorted.map((item, i) => (
        <FeatureBar
          key={item.feature}
          feature={item.feature}
          importance={item.importance}
          rank={i}
          delay={i * 0.06}
        />
      ))}
    </div>
  );
}
