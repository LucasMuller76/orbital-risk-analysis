"""Singleton dataset loader — reads parquet once at startup, computes predictions."""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import pandas as pd

from app.services.prediction import FEATURES_ML, predict_batch, risk_category

logger = logging.getLogger(__name__)

_df: pd.DataFrame | None = None
_scatter_sample: pd.DataFrame | None = None


def load_data(path: str | Path, model=None) -> None:
    """Load parquet, compute predictions, cache globally."""
    global _df, _scatter_sample
    resolved = Path(path).resolve()
    logger.info("Loading dataset from %s", resolved)

    df = pd.read_parquet(resolved)
    logger.info("Dataset loaded: %s rows × %s cols", *df.shape)

    # Compute fresh predictions using the live model (ensures feature alignment)
    if model is not None:
        preds, cats = predict_batch(model, df)
        df["predicted_CPS_log"] = preds
        df["risk_category"] = cats
    else:
        # Fallback: use the stored CPS_log from notebook 02 as the prediction
        df["predicted_CPS_log"] = df["CPS_log"]
        df["risk_category"] = df["CPS_log"].map(risk_category)

    # Precompute correlations (Pearson r vs predicted_CPS_log) — stored for analytics
    feature_series = df[FEATURES_ML]
    target_series = df["predicted_CPS_log"]
    df.attrs["correlations"] = {
        col: float(feature_series[col].corr(target_series))
        for col in FEATURES_ML
    }

    # Precompute histogram bins (60 equal-width bins over [min, max])
    cps_vals = df["predicted_CPS_log"].values
    counts, edges = np.histogram(cps_vals, bins=60)
    df.attrs["histogram"] = [
        {
            "bin_start": round(float(edges[i]), 6),
            "bin_end": round(float(edges[i + 1]), 6),
            "count": int(counts[i]),
        }
        for i in range(len(counts))
    ]

    _df = df

    # Precompute stratified scatter sample
    _scatter_sample = _build_scatter_sample(df, n=2000)
    logger.info("Data loader ready.")


def get_df() -> pd.DataFrame:
    if _df is None:
        raise RuntimeError("Dataset has not been loaded. Call load_data() first.")
    return _df


def get_scatter_sample() -> pd.DataFrame:
    if _scatter_sample is None:
        raise RuntimeError("Dataset has not been loaded.")
    return _scatter_sample


def _build_scatter_sample(df: pd.DataFrame, n: int = 2000) -> pd.DataFrame:
    """Stratified sample by risk_category so all three categories are represented."""
    cats = df["risk_category"].unique()
    frames = []
    per_cat = max(1, n // len(cats))
    for cat in cats:
        sub = df[df["risk_category"] == cat]
        sample = sub.sample(min(per_cat, len(sub)), random_state=42)
        frames.append(sample)
    result = pd.concat(frames).sample(frac=1, random_state=42)  # shuffle
    return result[
        ["altitude_km", "predicted_CPS_log", "risk_category", "OBJECT_TYPE"]
    ].reset_index(drop=True)
