import os
import uuid
import datetime
import socket
import threading
from typing import Dict, Any, Optional
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.schemas.api_schemas import SpillAnalysisRequest, AnalysisStatusResponse

app = FastAPI(
    title="V.A.R.U.N.A. API Gateway & Forensic Operations",
    description="Vision-based Algorithm for Rapid Unrefined-oil & Nautical Analysis API Panel & Interactive Operations Canvas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve repository root and frontend folder
_current_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.abspath(os.path.join(_current_dir, "../.."))
_frontend_dir = os.path.join(_repo_root, "frontend")


def _find_static_file(filename: str) -> Optional[str]:
    """Search for a file in repo root first, then frontend directory."""
    for base in [_repo_root, _frontend_dir]:
        p = os.path.join(base, filename)
        if os.path.exists(p) and os.path.isfile(p):
            return p
    return None


def _find_static_dir(dirname: str) -> Optional[str]:
    """Search for a directory in repo root first, then frontend directory."""
    for base in [_repo_root, _frontend_dir]:
        p = os.path.join(base, dirname)
        if os.path.exists(p) and os.path.isdir(p):
            return p
    return None


# Mount static subdirectories (components, services, data).
# Guarded so a missing directory can never crash the process at boot
# (StaticFiles raises RuntimeError for non-existent directories, which
#  on Render/Vercel surfaces as "Exited with status 3").
for _d in ["components", "services", "data"]:
    try:
        _dp = _find_static_dir(_d)
        if _dp:
            app.mount(f"/{_d}", StaticFiles(directory=_dp), name=_d)
    except Exception:
        pass

# Mount frontend directory if present
try:
    if os.path.exists(_frontend_dir) and os.path.isdir(_frontend_dir):
        app.mount("/frontend", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
except Exception:
    pass


# In-memory storage for tasks when Redis / Celery broker is not active
LOCAL_TASK_STORE: Dict[str, Dict[str, Any]] = {}


def _json_safe(value):
    """Coerce an arbitrary task result into JSON-serializable data.

    Celery failure results are exception instances, which pydantic cannot
    serialize (500 Internal Server Error). Anything non-serializable becomes
    a small ``{"error": ...}`` dict instead of crashing the endpoint.
    """
    import json
    try:
        json.dumps(value)
        return value
    except Exception:
        pass
    try:
        from fastapi.encoders import jsonable_encoder
        safe = jsonable_encoder(value)
        json.dumps(safe)
        return safe
    except Exception:
        pass
    if isinstance(value, BaseException):
        return {"error": f"{type(value).__name__}: {value}"}
    return {"value": str(value)[:2000]}


def _broker_reachable(timeout: float = 2.0) -> bool:
    """Quick TCP check for the Celery/Redis broker.

    Celery's publish path retries broker connections (effectively forever by
    default), so calling ``task.delay()`` with Redis down hangs the request
    until the platform kills it. On Render/Vercel there is no Redis, so probe
    the broker first and use the local background thread instead.
    """
    try:
        from app.workers.celery_app import celery_app
        url = celery_app.conf.broker_url or os.getenv("REDIS_URL", "")
        parts = urlparse(url)
        if parts.scheme not in ("redis", "rediss"):
            return True  # Non-Redis broker: let Celery handle errors itself.
        host = parts.hostname or "localhost"
        port = parts.port or 6379
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False
    return False


def _execute_pipeline_in_background(task_id: str, image_url: str, lat: float, lon: float, dt_iso: str):
    """Executes the pipeline synchronously in a background thread when Celery is not available."""
    try:
        LOCAL_TASK_STORE[task_id] = {
            "status": "PROGRESS",
            "message": "Executing ESRGAN, U-Net, Lagrangian & AIS pipeline in background.",
            "result": None
        }
        from app.workers.tasks import run_varuna_forensic_pipeline
        eager_res = run_varuna_forensic_pipeline.apply(
            kwargs={
                "image_url": image_url,
                "latitude": lat,
                "longitude": lon,
                "detection_time": dt_iso
            }
        )
        if getattr(eager_res, "failed", lambda: False)():
            raise eager_res.result if isinstance(eager_res.result, BaseException) else RuntimeError(str(eager_res.result))
        LOCAL_TASK_STORE[task_id] = {
            "status": "SUCCESS",
            "message": "VARUNA Forensic Analysis completed successfully.",
            "result": _json_safe(eager_res.result)
        }
    except Exception as exc:
        LOCAL_TASK_STORE[task_id] = {
            "status": "FAILURE",
            "message": f"Pipeline failed: {str(exc)}",
            "result": {"error": str(exc)}
        }


# --- Frontend & UI Routes ---

@app.get("/", response_class=FileResponse)
@app.get("/index.html", response_class=FileResponse)
def serve_landing_page():
    """Serves the 3D WebGL Intelligence Canvas Landing Page."""
    p = _find_static_file("index.html")
    if p:
        return FileResponse(p, media_type="text/html")
    return {"service": "V.A.R.U.N.A. API Gateway", "status": "ONLINE", "docs": "/docs"}


@app.get("/dashboard", response_class=FileResponse)
@app.get("/dashboard.html", response_class=FileResponse)
def serve_dashboard_page():
    """Serves the Forensic Operations Dashboard."""
    p = _find_static_file("dashboard.html")
    if p:
        return FileResponse(p, media_type="text/html")
    raise HTTPException(status_code=404, detail="dashboard.html not found")


@app.get("/style.css", response_class=FileResponse)
def serve_styles():
    p = _find_static_file("style.css")
    if p:
        return FileResponse(p, media_type="text/css")
    raise HTTPException(status_code=404, detail="style.css not found")


@app.get("/App.jsx", response_class=FileResponse)
def serve_root_app():
    p = _find_static_file("App.jsx")
    if p:
        return FileResponse(p, media_type="text/javascript; charset=utf-8")
    raise HTTPException(status_code=404, detail="App.jsx not found")


# --- API & Gateway Routes ---

@app.get("/api/v1/status")
def read_api_status():
    return {
        "service": "V.A.R.U.N.A. API Gateway",
        "status": "ONLINE",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "analyze": "/api/v1/analyze",
            "task": "/api/v1/task/{task_id}"
        }
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "gateway": "V.A.R.U.N.A.",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


@app.post("/api/v1/analyze", response_model=AnalysisStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def start_forensic_pipeline(request: SpillAnalysisRequest):
    """
    Submits a satellite image and coordinate parameters to trigger the async
    processing pipeline (Super-resolution, segmentation, hindcasting, and AIS joining).
    Supports distributed Celery execution or graceful local background processing.
    """
    from app.workers.tasks import run_varuna_forensic_pipeline

    dt_str = request.detection_time.isoformat()

    # Only use Celery when the broker is actually reachable; otherwise
    # .delay() would block on connection retries until platform timeout.
    if _broker_reachable():
        try:
            task = run_varuna_forensic_pipeline.delay(
                image_url=request.image_url,
                latitude=request.latitude,
                longitude=request.longitude,
                detection_time=dt_str
            )
            return {
                "task_id": task.id,
                "status": "QUEUED",
                "message": "VARUNA processing pipeline initiated via Celery worker."
            }
        except Exception:
            pass
    # Local background-thread fallback (no Redis, or Celery publish failed).
    task_id = str(uuid.uuid4())
    LOCAL_TASK_STORE[task_id] = {
        "status": "QUEUED",
        "message": "VARUNA processing pipeline queued in local background thread.",
        "result": None
    }
    thread = threading.Thread(
        target=_execute_pipeline_in_background,
        args=(task_id, request.image_url, request.latitude, request.longitude, dt_str),
        daemon=True
    )
    thread.start()
    return {
        "task_id": task_id,
        "status": "QUEUED",
        "message": "VARUNA processing pipeline initiated via background worker."
    }


@app.get("/api/v1/task/{task_id}", response_model=AnalysisStatusResponse)
def get_pipeline_status(task_id: str):
    """
    Check the evaluation state of a background processing task (local or Celery).
    """
    if task_id in LOCAL_TASK_STORE:
        entry = LOCAL_TASK_STORE[task_id]
        return {
            "task_id": task_id,
            "status": entry.get("status", "PENDING"),
            "result": _json_safe(entry.get("result")),
            "message": entry.get("message", "Task in progress")
        }

    # Unknown locally and broker unreachable: answer immediately instead of
    # blocking on Celery result-backend connection retries.
    if not _broker_reachable():
        return {
            "task_id": task_id,
            "status": "UNKNOWN",
            "result": None,
            "message": "Task not found locally and Celery result backend is unavailable."
        }

    try:
        from celery.result import AsyncResult
        from app.workers.celery_app import celery_app

        res = AsyncResult(task_id, app=celery_app)
        raw = res.result if res.ready() else None

        if isinstance(raw, BaseException):
            safe_result = {"error": f"{type(raw).__name__}: {raw}"}
            message = "Task failed - see result.error"
        elif isinstance(raw, dict):
            safe_result = _json_safe(raw)
            message = "Query completed successfully"
        elif raw is None:
            safe_result = None
            info = res.info if isinstance(res.info, dict) else None
            message = str(info) if info else f"Task state: {res.status}"
        else:
            safe_result = {"value": str(raw)}
            message = "Query completed successfully"

        return {
            "task_id": task_id,
            "status": res.status,
            "result": safe_result,
            "message": message,
        }
    except Exception as e:
        return {
            "task_id": task_id,
            "status": "UNKNOWN",
            "result": None,
            "message": f"Unable to retrieve task status: {str(e)}"
        }