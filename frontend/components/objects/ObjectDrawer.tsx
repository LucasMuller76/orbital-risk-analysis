"use client";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Satellite, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { useObject } from "@/hooks/useObjects";
import { RiskBadge } from "./RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAltitude, formatCPS, formatNumber } from "@/lib/utils";
import type { OrbitalObject } from "@/lib/types";

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

const drawerVariants = {
  hidden:  { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: "easeIn" as const },
  },
};

interface StatRowProps { label: string; value: string }
function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(34,211,238,0.05)]">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-mono text-slate-200">{value}</span>
    </div>
  );
}

function DrawerContent({ obj }: { obj: OrbitalObject }) {
  const riskIcon = obj.risk_category === "HIGH"
    ? <AlertTriangle className="h-4 w-4 text-red-400" />
    : obj.risk_category === "LOW"
    ? <ShieldCheck className="h-4 w-4 text-emerald-400" />
    : <Activity className="h-4 w-4 text-amber-400" />;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Satellite className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
              NORAD {formatNumber(obj.norad_cat_id)}
            </span>
          </div>
          <p className="text-slate-300 font-medium">{obj.object_type}</p>
          <p className="text-xs text-slate-500 mt-0.5">Band {obj.altitude_band} km</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RiskBadge category={obj.risk_category} size="md" />
          <div className="flex items-center gap-1.5">
            {riskIcon}
            <span className="font-mono text-lg font-bold text-slate-100">
              {formatCPS(obj.predicted_CPS_log)}
            </span>
          </div>
          <span className="text-xs text-slate-500">CPS_log</span>
        </div>
      </div>

      {/* Orbital parameters */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
          Orbital Parameters
        </p>
        <div className="divide-y divide-[rgba(34,211,238,0.05)]">
          <StatRow label="Altitude" value={formatAltitude(obj.altitude_km)} />
          <StatRow label="Inclination" value={`${obj.inclination_deg.toFixed(2)}°`} />
          <StatRow label="Eccentricity" value={obj.eccentricity.toFixed(6)} />
          <StatRow label="Velocity" value={`${obj.velocity_km_s.toFixed(3)} km/s`} />
          <StatRow label="Period" value={`${obj.period_min.toFixed(2)} min`} />
          <StatRow label="BSTAR Drag" value={obj.bstar_abs.toExponential(3)} />
        </div>
      </div>

      {/* Environment */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
          Local Environment
        </p>
        <div className="divide-y divide-[rgba(34,211,238,0.05)]">
          <StatRow label="Local Density" value={obj.local_density_km3.toFixed(4)} />
          <StatRow label="Debris Fraction" value={`${(obj.debris_fraction_local * 100).toFixed(1)}%`} />
          <StatRow label="Incl. Dispersion" value={obj.incl_dispersion_local.toFixed(4)} />
          <StatRow label="Alt. Gradient" value={obj.alt_density_gradient.toFixed(4)} />
        </div>
      </div>

      {/* Classification */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
          Classification
        </p>
        <div className="flex gap-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${obj.is_debris ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20" : "bg-slate-700/40 text-slate-400"}`}>
            {obj.is_debris ? "Debris" : "Non-Debris"}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${obj.is_uncontrolled ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20" : "bg-slate-700/40 text-slate-400"}`}>
            {obj.is_uncontrolled ? "Uncontrolled" : "Controlled"}
          </span>
        </div>
      </div>

      {/* Link to full detail */}
      <Link
        href={`/objects/${obj.norad_cat_id}`}
        className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(34,211,238,0.15)] bg-[rgba(34,211,238,0.05)] px-4 py-2.5 text-sm font-medium text-cyan-400 hover:bg-[rgba(34,211,238,0.1)] hover:border-[rgba(34,211,238,0.3)] transition-all"
      >
        View Full Details
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

interface ObjectDrawerProps {
  noradId: number | null;
  onClose: () => void;
}

export function ObjectDrawer({ noradId, onClose }: ObjectDrawerProps) {
  const { data, isLoading } = useObject(noradId);
  const isOpen = noradId !== null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  style={{ zIndex: 55 }}
                  variants={backdropVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>

              {/* Drawer panel */}
              <Dialog.Content asChild>
                <motion.div
                  className="fixed right-0 top-0 h-full w-full max-w-md overflow-y-auto glass-card border-l border-[rgba(34,211,238,0.12)] shadow-[0_0_60px_rgba(0,0,0,0.7)] p-6 flex flex-col gap-5"
                  style={{ zIndex: 60 }}
                  variants={drawerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Dialog.Title className="sr-only">Object Detail</Dialog.Title>

                  {/* Close button */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase tracking-widest text-slate-600">
                      Object Detail
                    </span>
                    <Dialog.Close asChild>
                      <button className="rounded-lg p-1.5 text-slate-500 hover:text-slate-200 hover:bg-[rgba(34,211,238,0.08)] transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {isLoading || !data ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : (
                    <DrawerContent obj={data} />
                  )}
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
