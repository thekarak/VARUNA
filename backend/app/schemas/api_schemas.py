from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SpillAnalysisRequest(BaseModel):
    image_url: str = Field(..., description="URL of the satellite image")
    latitude: float = Field(..., description="Latitude of the spill origin")
    longitude: float = Field(..., description="Longitude of the spill origin")
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