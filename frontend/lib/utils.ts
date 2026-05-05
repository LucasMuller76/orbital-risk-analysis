import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskCategory } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCPS(v: number): string {
  return v.toFixed(4);
}

export function formatAltitude(v: number): string {
  return `${v.toFixed(1)} km`;
}

export function formatPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

export function formatNumber(v: number): string {
  return new Intl.NumberFormat("en-US").format(v);
}

/** Tailwind background colour class for a risk category (dark theme). */
export function riskBgClass(cat: RiskCategory): string {
  switch (cat) {
    case "HIGH":   return "bg-red-500/10 text-red-400 border-red-500/25";
    case "MEDIUM": return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    case "LOW":    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
  }
}

/** Hex colour for Recharts. */
export function riskHex(cat: RiskCategory): string {
  switch (cat) {
    case "HIGH":   return "#ef4444";
    case "MEDIUM": return "#f59e0b";
    case "LOW":    return "#10b981";
  }
}

/** Tailwind dot colour class. */
export function riskDotClass(cat: RiskCategory): string {
  switch (cat) {
    case "HIGH":   return "bg-red-500";
    case "MEDIUM": return "bg-amber-400";
    case "LOW":    return "bg-emerald-500";
  }
}

/** Human-readable label for feature names. */
export function featureLabel(name: string): string {
  const labels: Record<string, string> = {
    altitude_km:           "Altitude (km)",
    inclination_deg:       "Inclination (deg)",
    eccentricity:          "Eccentricity",
    velocity_km_s:         "Velocity (km/s)",
    period_min:            "Period (min)",
    bstar_abs:             "B* Drag Coeff.",
    local_density_km3:     "Local Density (obj/km³)",
    debris_fraction_local: "Debris Fraction (local)",
    incl_dispersion_local: "Incl. Dispersion (local)",
    alt_density_gradient:  "Alt. Density Gradient",
    object_type_code:      "Object Type Code",
    is_debris:             "Is Debris",
    is_uncontrolled:       "Is Uncontrolled",
  };
  return labels[name] ?? name;
}
