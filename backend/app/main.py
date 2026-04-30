"""FastAPI application — orbital collision risk API."""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.data_loader import load_data
from app.model import load_model, get_model
from app.routes.analytics import router as analytics_router
from app.routes.objects import router as objects_router
from app.routes.predict import router as predict_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

# Resolve paths relative to this file so the server can be started from any CWD.
# MODEL_PATH and DATA_PATH env vars override the computed defaults — use them in
# container deployments where the repo root is mounted at a different location.
_HERE = Path(__file__).resolve().parent.parent  # backend/
_MODEL_PATH = Path(os.getenv("MODEL_PATH") or str(_HERE.parent / "models" / "best_model.joblib"))
_DATA_PATH = Path(os.getenv("DATA_PATH") or str(_HERE.parent / "data" / "processed" / "processed_features.parquet"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== Orbital Risk API starting up ===")
    load_model(_MODEL_PATH)
    load_data(_DATA_PATH, model=get_model())
    logger.info("=== Ready ===")
    yield
    logger.info("=== Shutting down ===")


app = FastAPI(
    title="Orbital Risk API",
    description="REST API for orbital collision risk prediction (CPS_log proxy model).",
    version="1.0.0",
    lifespan=lifespan,
)

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(objects_router, prefix="/objects", tags=["Objects"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(predict_router, tags=["Predict"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
