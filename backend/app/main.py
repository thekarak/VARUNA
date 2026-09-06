import uuid
import datetime
import threading
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.api_schemas import SpillAnalysisRequest, AnalysisStatusResponse

app = FastAPI(
    title="V.A.R.U.N.A. API Gateway",
    description="Vision-based Algorithm for Rapid Unrefined-oil & Nautical Analysis API Panel",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for tasks when Redis / Celery broker is not active (e.g. Render single web service)
LOCAL_TASK_STORE: Dict[str, Dict[str, Any]] = {}


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
        LOCAL_TASK_STORE[task_id] = {
            "status": "SUCCESS",
            "message": "VARUNA Forensic Analysis completed successfully.",
            "result": eager_res.result
        }
    except Exception as exc:
        LOCAL_TASK_STORE[task_id] = {
            "status": "FAILURE",
            "message": f"Pipeline failed: {str(exc)}",
            "result": {"error": str(exc)}
        }


@app.get("/")
def read_root():
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

    # 1. Attempt dispatch to Celery distributed worker
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
        # 2. Celery / Redis broker unavailable (e.g. standalone Render deployment)
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
    # 1. Check local background task store
    if task_id in LOCAL_TASK_STORE:
        entry = LOCAL_TASK_STORE[task_id]
        return {
            "task_id": task_id,
            "status": entry.get("status", "PENDING"),
            "result": entry.get("result"),
            "message": entry.get("message", "Task in progress")
        }

    # 2. Check distributed Celery task result
    try:
        from celery.result import AsyncResult
        from app.workers.celery_app import celery_app

        res = AsyncResult(task_id, app=celery_app)
        raw = res.result if res.ready() else None

        if isinstance(raw, BaseException):
            safe_result = {"error": f"{type(raw).__name__}: {raw}"}
            message = "Task failed - see result.error"
        elif isinstance(raw, dict):
            safe_result = raw
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