"""Pydantic request and response schemas."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Object schemas
# ---------------------------------------------------------------------------

class ObjectResponse(BaseModel):
    norad_cat_id: int
    object_type: str
    altitude_band: str

    # ML features
    altitude_km: float
    inclination_deg: float
    eccentricity: float
    velocity_km_s: float
    period_min: float
    bstar_abs: float
    local_density_km3: float
    debris_fraction_local: float
    incl_dispersion_local: float
    alt_density_gradient: float
    object_type_code: int
    is_debris: int
    is_uncontrolled: int

    # Predictions
    predicted_CPS_log: float
    risk_category: Literal["LOW", "MEDIUM", "HIGH"]

    model_config = {"from_attributes": True}


class ObjectListResponse(BaseModel):
    items: list[ObjectResponse]
    total: int
    page: int
    pages: int
    limit: int


# ---------------------------------------------------------------------------
# Analytics schemas
# ---------------------------------------------------------------------------

class HistogramBin(BaseModel):
    bin_start: float
    bin_end: float
    count: int


class RiskCounts(BaseModel):
    LOW: int
    MEDIUM: int
    HIGH: int


class SummaryResponse(BaseModel):
    total_objects: int
    mean_cps: float
    std_cps: float
    min_cps: float
    max_cps: float
    risk_counts: RiskCounts
    histogram: list[HistogramBin]


class AltitudeBandResponse(BaseModel):
    band: str
    mean_cps: float
    count: int
    pct_high: float   # percentage of HIGH risk objects in this band


class ScatterPointResponse(BaseModel):
    altitude_km: float
    predicted_CPS_log: float
    risk_category: Literal["LOW", "MEDIUM", "HIGH"]
    object_type: str


class ObjectTypeResponse(BaseModel):
    object_type: str
    count: int
    mean_cps: float
    pct_high: float


class FeatureImportanceResponse(BaseModel):
    feature: str
    importance: float


class CorrelationResponse(BaseModel):
    feature: str
    pearson_r: float


# Predict schemas

class PredictRequest(BaseModel):
    altitude_km: float = Field(default=750.0, ge=150, le=2000, description="Orbital altitude in km")
    inclination_deg: float = Field(default=53.0, ge=0, le=180)
    eccentricity: float = Field(default=0.001, ge=0, le=1)
    velocity_km_s: float = Field(default=7.5, ge=6.0, le=8.5)
    period_min: float = Field(default=99.0, ge=85, le=135)
    bstar_abs: float = Field(default=0.0001, ge=0)
    local_density_km3: float = Field(default=6e-8, ge=0)
    debris_fraction_local: float = Field(default=0.36, ge=0, le=1)
    incl_dispersion_local: float = Field(default=17.7, ge=0)
    alt_density_gradient: float = Field(default=0.0)
    object_type_code: int = Field(default=0, ge=0, le=4)
    is_debris: int = Field(default=0, ge=0, le=1)
    is_uncontrolled: int = Field(default=0, ge=0, le=1)


class PredictResponse(BaseModel):
    predicted_CPS_log: float
    risk_category: Literal["LOW", "MEDIUM", "HIGH"]
    input_features: dict
