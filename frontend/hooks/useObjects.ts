"use client";
import useSWR from "swr";
import { getObject, getObjects } from "@/lib/api";
import type { GetObjectsParams } from "@/lib/types";

export function useObjects(params: GetObjectsParams = {}) {
  const key = "objects:" + JSON.stringify(params);
  return useSWR(key, () => getObjects(params), { revalidateOnFocus: false });
}

export function useObject(noradId: number | null) {
  return useSWR(
    noradId != null ? `object-${noradId}` : null,
    () => getObject(noradId!),
    { revalidateOnFocus: false },
  );
}
