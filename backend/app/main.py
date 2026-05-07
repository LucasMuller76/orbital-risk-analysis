"""FastAPI application — orbital collision risk API."""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Receive, Scope, Send

from app.data_loader import load_data
from app.model import load_model, get_model
from app.routes.analytics import router as analytics_router
from app.routes.objects import router as objects_router
from app.routes.predict import router as predict_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware:
    """Pure ASGI middleware — avoids BaseHTTPMiddleware conflict with CORSMiddleware."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_headers(message: dict) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers.append("X-Content-Type-Options", "nosniff")
                headers.append("X-Frame-Options", "DENY")
                headers.append("Referrer-Policy", "strict-origin-when-cross-origin")
            await send(message)

        await self.app(scope, receive, send_with_headers)


_HERE = Path(__file__).resolve().parent.parent  # backend/ (local) or /app/ (Docker)
_MODEL_PATH = Path(os.getenv("MODEL_PATH") or str(_HERE / "models" / "best_model.joblib"))
_DATA_PATH = Path(os.getenv("DATA_PATH") or str(_HERE / "data" / "processed" / "processed_features.parquet"))


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

_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
_ALLOWED_ORIGINS: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("[CORS] allow_origins=%s", _ALLOWED_ORIGINS)

app.include_router(objects_router, prefix="/objects", tags=["Objects"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(predict_router, tags=["Predict"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
