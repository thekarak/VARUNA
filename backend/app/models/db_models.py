import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from geoalchemy2 import Geometry

Base = declarative_base()


class OilSpillDetection(Base):
    __tablename__ = 'oil_spill_detections'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    detection_timestamp = Column(DateTime, nullable=False)
    source_satellite = Column(String(50), nullable=False)  # Sentinel-1, Sentinel-2, etc.
    geom = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=False)
    area_sq_m = Column(Float, nullable=False)
    perimeter_m = Column(Float, nullable=False)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)


class VesselTelemetry(Base):
    __tablename__ = 'vessel_telemetry'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mmsi = Column(Integer, nullable=False, index=True)
    vessel_name = Column(String(100), nullable=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    speed_knots = Column(Float, nullable=False)
    heading_degrees = Column(Float, nullable=False)
    geom = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)


class SuspectCorrelation(Base):
    __tablename__ = 'suspect_correlations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    spill_id = Column(UUID(as_uuid=True), ForeignKey('oil_spill_detections.id'), nullable=False)
    mmsi = Column(Integer, nullable=False)
    vessel_name = Column(String(100))
    proximity_meters = Column(Float, nullable=False)
    behavior_score = Column(Float, nullable=False)  # ML Anomaly rating
    dark_vessel_flag = Column(Boolean, default=False)
    anomaly_details = Column(JSON, nullable=True)