export type RiskCategory = "LOW" | "MEDIUM" | "HIGH";

export interface OrbitalObject {
  norad_cat_id: number;
  object_type: string;
  altitude_band: string;
  altitude_km: number;
  inclination_deg: number;
  eccentricity: number;
  velocity_km_s: number;
  period_min: number;
  bstar_abs: number;
  local_density_km3: number;
  debris_fraction_local: number;
  incl_dispersion_local: number;
  alt_density_gradient: number;
  object_type_code: number;
  is_debris: number;
  is_uncontrolled: number;
  predicted_CPS_log: number;
  risk_category: RiskCategory;
}

export interface ObjectListResponse {
  items: OrbitalObject[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface HistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
}

export interface RiskCounts {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

export interface SummaryResponse {
  total_objects: number;
  mean_cps: number;
  std_cps: number;
  min_cps: number;
  max_cps: number;
  risk_counts: RiskCounts;
  histogram: HistogramBin[];
}

export interface AltitudeBand {
  band: string;
  mean_cps: number;
  count: number;
  pct_high: number;
}

export interface ScatterPoint {
  altitude_km: number;
  predicted_CPS_log: number;
  risk_category: RiskCategory;
  object_type: string;
}

export interface ObjectType {
  object_type: string;
  count: number;
  mean_cps: number;
  pct_high: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface Correlation {
  feature: string;
  pearson_r: number;
}

export interface PredictRequest {
  altitude_km: number;
  inclination_deg: number;
  eccentricity: number;
  velocity_km_s: number;
  period_min: number;
  bstar_abs: number;
  local_density_km3: number;
  debris_fraction_local: number;
  incl_dispersion_local: number;
  alt_density_gradient: number;
  object_type_code: number;
  is_debris: number;
  is_uncontrolled: number;
}

export interface PredictResponse {
  predicted_CPS_log: number;
  risk_category: RiskCategory;
  input_features: PredictRequest;
}

export interface GetObjectsParams {
  page?: number;
  limit?: number;
  risk?: RiskCategory | "";
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
