from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import get_db
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


@app.post("/api/v1/analyze", response_model=AnalysisStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def start_forensic_pipeline(request: SpillAnalysisRequest, db: Session = Depends(get_db)):
    """
    Submits a satellite image and coordinate parameters to trigger the async
    processing pipeline (Super-resolution, segmentation, hindcasting, and AIS joining).
    """
    from app.workers.tasks import run_varuna_forensic_pipeline

    try:
        # Launch celery task asynchronously
        task = run_varuna_forensic_pipeline.delay(
            image_url=request.image_url,
            latitude=request.latitude,
            longitude=request.longitude,
            detection_time=request.detection_time.isoformat()
        )
        return {
            "task_id": task.id,
            "status": "QUEUED",
            "message": "Project VARUNA processing pipeline initiated."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/task/{task_id}", response_model=AnalysisStatusResponse)
def get_pipeline_status(task_id: str):
    """
    Check the evaluation state of a Celery background processing task.
    """
    from celery.result import AsyncResult
    from app.workers.celery_app import celery_app

    res = AsyncResult(task_id, app=celery_app)
    raw = res.result if res.ready() else None
    # Celery stores Exceptions as result on FAILURE - must serialize to JSON-safe dict
    if isinstance(raw, BaseException):
        safe_result = {"error": f"{type(raw).__name__}: {raw}"}
        message = "Task failed - see result.error"
    elif isinstance(raw, dict):
        safe_result = raw
        message = "Query completed successfully"
    elif raw is None:
        safe_result = None
        # PROGRESS state stores meta in res.info
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