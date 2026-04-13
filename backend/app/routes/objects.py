"""GET /objects and GET /objects/{norad_id}"""
from __future__ import annotations

import math
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Query

from app.data_loader import get_df
from app.schemas import ObjectListResponse, ObjectResponse

router = APIRouter()


def _row_to_response(row) -> ObjectResponse:
    return ObjectResponse(
        norad_cat_id=int(row["NORAD_CAT_ID"]),
        object_type=str(row["OBJECT_TYPE"]),
        altitude_band=str(row["faixa_50km_str"]),
        altitude_km=float(row["altitude_km"]),
        inclination_deg=float(row["inclination_deg"]),
        eccentricity=float(row["eccentricity"]),
        velocity_km_s=float(row["velocity_km_s"]),
        period_min=float(row["period_min"]),
        bstar_abs=float(row["bstar_abs"]),
        local_density_km3=float(row["local_density_km3"]),
        debris_fraction_local=float(row["debris_fraction_local"]),
        incl_dispersion_local=float(row["incl_dispersion_local"]),
        alt_density_gradient=float(row["alt_density_gradient"]),
        object_type_code=int(row["object_type_code"]),
        is_debris=int(row["is_debris"]),
        is_uncontrolled=int(row["is_uncontrolled"]),
        predicted_CPS_log=float(row["predicted_CPS_log"]),
        risk_category=str(row["risk_category"]),
    )


@router.get("", response_model=ObjectListResponse)
def list_objects(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=500),
    risk: Optional[Literal["LOW", "MEDIUM", "HIGH"]] = Query(default=None),
    search: Optional[str] = Query(default=None, description="Filter by NORAD ID or object type"),
    sort: str = Query(default="predicted_CPS_log"),
    order: Literal["asc", "desc"] = Query(default="desc"),
):
    df = get_df().copy()

    # Filter by risk category
    if risk:
        df = df[df["risk_category"] == risk]

    # Filter by search term (NORAD ID or object type)
    if search:
        search = search.strip()
        if search.isdigit():
            df = df[df["NORAD_CAT_ID"] == int(search)]
        else:
            df = df[df["OBJECT_TYPE"].str.contains(search, case=False, na=False)]

    # Sort
    valid_sort_cols = {
        "altitude_km", "inclination_deg", "velocity_km_s",
        "predicted_CPS_log", "norad_cat_id", "period_min",
    }
    sort_col = sort if sort in valid_sort_cols else "predicted_CPS_log"
    # Map norad_cat_id → NORAD_CAT_ID for the dataframe
    if sort_col == "norad_cat_id":
        sort_col = "NORAD_CAT_ID"
    ascending = order == "asc"
    df = df.sort_values(sort_col, ascending=ascending)

    # Paginate
    total = len(df)
    pages = max(1, math.ceil(total / limit))
    offset = (page - 1) * limit
    page_df = df.iloc[offset : offset + limit]

    items = [_row_to_response(row) for _, row in page_df.iterrows()]
    return ObjectListResponse(
        items=items,
        total=total,
        page=page,
        pages=pages,
        limit=limit,
    )


@router.get("/{norad_id}", response_model=ObjectResponse)
def get_object(norad_id: int):
    df = get_df()
    rows = df[df["NORAD_CAT_ID"] == norad_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"Object {norad_id} not found")
    return _row_to_response(rows.iloc[0])
