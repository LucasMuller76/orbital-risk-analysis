"""Feature alignment, prediction, and risk categorisation."""
from __future__ import annotations

import numpy as np
import pandas as pd

# Must match the exact order used during training (Notebook 03)
FEATURES_ML: list[str] = [
    "altitude_km",
    "inclination_deg",
    "eccentricity",
    "velocity_km_s",
    "period_min",
    "bstar_abs",
    "local_density_km3",
    "debris_fraction_local",
    "incl_dispersion_local",
    "alt_density_gradient",
    "object_type_code",
    "is_debris",
    "is_uncontrolled",
]

# CPS_log thresholds determined from the project analysis
RISK_LOW_THRESHOLD: float = 0.4
RISK_HIGH_THRESHOLD: float = 1.0


def risk_category(cps_log: float) -> str:
    """Map a CPS_log value to a risk category string."""
    if cps_log < RISK_LOW_THRESHOLD:
        return "LOW"
    if cps_log <= RISK_HIGH_THRESHOLD:
        return "MEDIUM"
    return "HIGH"


def align_features(df: pd.DataFrame) -> pd.DataFrame:
    """Return a copy of df with exactly FEATURES_ML columns in the right order.

    Raises ValueError if any required column is missing.
    """
    missing = [f for f in FEATURES_ML if f not in df.columns]
    if missing:
        raise ValueError(f"Missing required features: {missing}")
    return df[FEATURES_ML].astype(np.float64)


def predict_single(model, values: dict) -> tuple[float, str]:
    """Predict CPS_log for a single object given a dict of feature values.

    Returns (predicted_cps_log, risk_category).
    """
    row = pd.DataFrame([values])
    X = align_features(row)
    cps_log = float(model.predict(X)[0])
    return cps_log, risk_category(cps_log)


def predict_batch(model, df: pd.DataFrame) -> tuple[np.ndarray, list[str]]:
    """Predict CPS_log for all rows in df.

    Returns (array of floats, list of risk category strings).
    """
    X = align_features(df)
    predictions = model.predict(X)
    categories = [risk_category(v) for v in predictions]
    return predictions, categories
