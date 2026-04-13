"use client";
import useSWR from "swr";
import * as api from "@/lib/api";

export function useSummary() {
  return useSWR("summary", api.getSummary, { revalidateOnFocus: false });
}

export function useByAltitude() {
  return useSWR("by-altitude", api.getByAltitude, { revalidateOnFocus: false });
}

export function useScatter() {
  return useSWR("scatter", api.getScatter, { revalidateOnFocus: false });
}

export function useByType() {
  return useSWR("by-type", api.getByType, { revalidateOnFocus: false });
}

export function useFeatureImportance() {
  return useSWR("feature-importance", api.getFeatureImportance, { revalidateOnFocus: false });
}

export function useCorrelations() {
  return useSWR("correlations", api.getCorrelations, { revalidateOnFocus: false });
}
