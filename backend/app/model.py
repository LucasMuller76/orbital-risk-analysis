"""Singleton model loader — loads the joblib model once at startup."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from app.services.prediction import FEATURES_ML

logger = logging.getLogger(__name__)

_model: Any = None


def load_model(path: str | Path) -> None:
    """Load the Random Forest model from disk and cache it globally."""
    global _model
    resolved = Path(path).resolve()
    logger.info("Loading model from %s", resolved)
    _model = joblib.load(resolved)
    logger.info("Model loaded: %s", type(_model).__name__)

    # Validate that the model has the expected feature interface
    if hasattr(_model, "feature_names_in_"):
        expected = list(_model.feature_names_in_)
        if expected != FEATURES_ML:
            logger.warning(
                "Model feature_names_in_ does not match FEATURES_ML!\n"
                "Model: %s\nExpected: %s",
                expected,
                FEATURES_ML,
            )


def get_model() -> Any:
    if _model is None:
        raise RuntimeError("Model has not been loaded. Call load_model() first.")
    return _model


def get_feature_importances() -> list[dict]:
    """Return feature importances as a sorted list of {feature, importance}."""
    model = get_model()
    if not hasattr(model, "feature_importances_"):
        return []
    importances = model.feature_importances_
    pairs = sorted(
        zip(FEATURES_ML, importances),
        key=lambda x: x[1],
        reverse=True,
    )
    return [{"feature": f, "importance": round(float(imp), 6)} for f, imp in pairs]
