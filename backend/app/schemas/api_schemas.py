from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SpillAnalysisRequest(BaseModel):
    # SIH audit: reject out-of-range coordinates and empty image refs at the
    # contract boundary (422) instead of queuing impossible pipelines.
    # Field() bounds work on both pydantic v1 and v2.
    image_url: str = Field(..., min_length=1, max_length=2048,
                           description="URL, local path, or bundled sample name of the satellite image")
    latitude: float = Field(..., ge=-90.0, le=90.0,
                            description="Latitude of the spill origin (-90..90)")
    longitude: float = Field(..., ge=-180.0, le=180.0,
                             description="Longitude of the spill origin (-180..180)")
    detection_time: datetime = Field(..., description="ISO format detection timestamp")


class AnalysisStatusResponse(BaseModel):
    task_id: str = Field(..., description="Celery task ID")
    status: str = Field(..., description="Current task status")
    result: Optional[Any] = Field(None, description="Task result if completed")
    message: Optional[str] = Field(None, description="Human-readable status message")


class SpillDetectionResponse(BaseModel):
    id: str
    detection_timestamp: datetime
    source_satellite: str
    area_sq_m: float
    perimeter_m: float
    centroid_lat: float
    centroid_lon: float

    class Config:
        from_attributes = True


class VesselTelemetryResponse(BaseModel):
    id: str
    mmsi: int
    vessel_name: Optional[str]
    timestamp: datetime
    speed_knots: float
    heading_degrees: float

    class Config:
        from_attributes = True


class SuspectCorrelationResponse(BaseModel):
    id: str
    spill_id: str
    mmsi: int
    vessel_name: Optional[str]
    proximity_meters: float
    behavior_score: float
    dark_vessel_flag: bool
    anomaly_details: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class PipelineProgressUpdate(BaseModel):
    step: str
    detail: str
    progress_percent: Optional[int] = None