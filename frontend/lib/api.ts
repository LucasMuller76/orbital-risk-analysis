import type {
  AltitudeBand,
  Correlation,
  FeatureImportance,
  GetObjectsParams,
  ObjectListResponse,
  ObjectType,
  OrbitalObject,
  PredictRequest,
  PredictResponse,
  ScatterPoint,
  SummaryResponse,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TIMEOUT_MS = 35_000;

async function get<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out — backend may be waking up, try again in a moment");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out — backend may be waking up, try again in a moment");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---- Objects ---------------------------------------------------------------

export function getObjects(params: GetObjectsParams = {}): Promise<ObjectListResponse> {
  const q = new URLSearchParams();
  if (params.page)   q.set("page",  String(params.page));
  if (params.limit)  q.set("limit", String(params.limit));
  if (params.risk)   q.set("risk",  params.risk);
  if (params.search) q.set("search", params.search);
  if (params.sort)   q.set("sort",  params.sort);
  if (params.order)  q.set("order", params.order);
  const qs = q.toString();
  return get<ObjectListResponse>(`/objects${qs ? `?${qs}` : ""}`);
}

export function getObject(noradId: number): Promise<OrbitalObject> {
  return get<OrbitalObject>(`/objects/${noradId}`);
}

// ---- Analytics -------------------------------------------------------------

export function getSummary(): Promise<SummaryResponse> {
  return get<SummaryResponse>("/analytics/summary");
}

export function getByAltitude(): Promise<AltitudeBand[]> {
  return get<AltitudeBand[]>("/analytics/by-altitude");
}

export function getScatter(): Promise<ScatterPoint[]> {
  return get<ScatterPoint[]>("/analytics/scatter");
}

export function getByType(): Promise<ObjectType[]> {
  return get<ObjectType[]>("/analytics/by-type");
}

export function getFeatureImportance(): Promise<FeatureImportance[]> {
  return get<FeatureImportance[]>("/analytics/feature-importance");
}

export function getCorrelations(): Promise<Correlation[]> {
  return get<Correlation[]>("/analytics/correlations");
}

// ---- Predict ---------------------------------------------------------------

export function predict(body: PredictRequest): Promise<PredictResponse> {
  return post<PredictResponse>("/predict", body);
}
