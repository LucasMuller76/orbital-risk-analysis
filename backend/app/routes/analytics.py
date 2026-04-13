"""Analytics endpoints — summary, by-altitude, scatter, by-type, feature importance, correlations."""
from __future__ import annotations

from fastapi import APIRouter

from app.data_loader import get_df, get_scatter_sample
from app.model import get_feature_importances
from app.schemas import (
    AltitudeBandResponse,
    CorrelationResponse,
    FeatureImportanceResponse,
    ObjectTypeResponse,
    RiskCounts,
    ScatterPointResponse,
    SummaryResponse,
)

router = APIRouter()


@router.get("/summary", response_model=SummaryResponse)
def get_summary():
    df = get_df()
    cps = df["predicted_CPS_log"]
    risk_counts = df["risk_category"].value_counts().to_dict()

    return SummaryResponse(
        total_objects=len(df),
        mean_cps=round(float(cps.mean()), 6),
        std_cps=round(float(cps.std()), 6),
        min_cps=round(float(cps.min()), 6),
        max_cps=round(float(cps.max()), 6),
        risk_counts=RiskCounts(
            LOW=int(risk_counts.get("LOW", 0)),
            MEDIUM=int(risk_counts.get("MEDIUM", 0)),
            HIGH=int(risk_counts.get("HIGH", 0)),
        ),
        histogram=df.attrs.get("histogram", []),
    )


@router.get("/by-altitude", response_model=list[AltitudeBandResponse])
def get_by_altitude():
    df = get_df()

    def sort_key(band: str) -> int:
        try:
            return int(str(band).split("-")[0])
        except (ValueError, IndexError):
            return 0

    grouped = (
        df.groupby("faixa_50km_str")
        .agg(
            mean_cps=("predicted_CPS_log", "mean"),
            count=("predicted_CPS_log", "count"),
            high_count=("risk_category", lambda s: (s == "HIGH").sum()),
        )
        .reset_index()
    )
    grouped["pct_high"] = grouped["high_count"] / grouped["count"] * 100
    grouped = grouped.sort_values(
        "faixa_50km_str", key=lambda s: s.map(sort_key)
    )

    return [
        AltitudeBandResponse(
            band=str(row["faixa_50km_str"]),
            mean_cps=round(float(row["mean_cps"]), 6),
            count=int(row["count"]),
            pct_high=round(float(row["pct_high"]), 2),
        )
        for _, row in grouped.iterrows()
    ]


@router.get("/scatter", response_model=list[ScatterPointResponse])
def get_scatter():
    sample = get_scatter_sample()
    return [
        ScatterPointResponse(
            altitude_km=float(row["altitude_km"]),
            predicted_CPS_log=float(row["predicted_CPS_log"]),
            risk_category=str(row["risk_category"]),
            object_type=str(row["OBJECT_TYPE"]),
        )
        for _, row in sample.iterrows()
    ]


@router.get("/by-type", response_model=list[ObjectTypeResponse])
def get_by_type():
    df = get_df()
    grouped = (
        df.groupby("OBJECT_TYPE")
        .agg(
            count=("predicted_CPS_log", "count"),
            mean_cps=("predicted_CPS_log", "mean"),
            high_count=("risk_category", lambda s: (s == "HIGH").sum()),
        )
        .reset_index()
        .sort_values("mean_cps", ascending=False)
    )
    grouped["pct_high"] = grouped["high_count"] / grouped["count"] * 100

    return [
        ObjectTypeResponse(
            object_type=str(row["OBJECT_TYPE"]),
            count=int(row["count"]),
            mean_cps=round(float(row["mean_cps"]), 6),
            pct_high=round(float(row["pct_high"]), 2),
        )
        for _, row in grouped.iterrows()
    ]


@router.get("/feature-importance", response_model=list[FeatureImportanceResponse])
def get_feature_importance():
    return [
        FeatureImportanceResponse(**item) for item in get_feature_importances()
    ]


@router.get("/correlations", response_model=list[CorrelationResponse])
def get_correlations():
    df = get_df()
    corrs: dict = df.attrs.get("correlations", {})
    # Sort by absolute value descending
    sorted_corrs = sorted(corrs.items(), key=lambda x: abs(x[1]), reverse=True)
    return [
        CorrelationResponse(feature=f, pearson_r=round(r, 6))
        for f, r in sorted_corrs
    ]
