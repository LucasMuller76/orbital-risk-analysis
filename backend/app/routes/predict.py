"""POST /predict — real-time prediction for a single orbital object."""
from __future__ import annotations

from fastapi import APIRouter

from app.model import get_model
from app.schemas import PredictRequest, PredictResponse
from app.services.prediction import predict_single

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
def predict(body: PredictRequest):
    model = get_model()
    values = body.model_dump()
    cps_log, risk_cat = predict_single(model, values)
    return PredictResponse(
        predicted_CPS_log=round(cps_log, 6),
        risk_category=risk_cat,
        input_features=values,
    )
