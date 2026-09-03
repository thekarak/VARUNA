from sqlalchemy import text, select
from sqlalchemy.orm import Session
from typing import List, Dict, Any


def spatial_correlation_query(
    db: Session,
    origin_lat: float,
    origin_lon: float,
    origin_time: datetime,
    search_radius_meters: float = 5000.0
) -> List[Dict[str, Any]]:
    """
    Run the PostGIS spatial intersection search to find vessels
    whose trajectories intersect with a spatio-temporal buffer
    around the calculated spill origin.
    """
    from app.models.db_models import OilSpillDetection, VesselTelemetry, SuspectCorrelation

    query = text("""
        WITH trajectory_builder AS (
            SELECT
                mmsi,
                vessel_name,
                ST_MakeLine(geom ORDER BY timestamp) AS ship_path,
                MIN(timestamp) AS track_start,
                MAX(timestamp) AS track_end,
                AVG(speed_knots) AS avg_speed
            FROM vessel_telemetry
            WHERE timestamp BETWEEN :origin_time - INTERVAL '12 hours' AND :origin_time + INTERVAL '12 hours'
            GROUP BY mmsi, vessel_name
        )
        SELECT
            tb.mmsi,
            tb.vessel_name,
            ST_Distance(
                ST_Transform(tb.ship_path, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:origin_lon, :origin_lat), 4326), 3857)
            ) AS proximity_meters,
            tb.avg_speed,
            CASE
                WHEN tb.avg_speed < 5.0 THEN TRUE
                ELSE FALSE
            END AS potential_discharge_speed
        FROM trajectory_builder tb
        WHERE ST_DWithin(
            ST_Transform(tb.ship_path, 3857),
            ST_Transform(ST_SetSRID(ST_MakePoint(:origin_lon, :origin_lat), 4326), 3857),
            :search_radius_meters
        )
        ORDER BY proximity_meters ASC
    """)

    result = db.execute(
        query,
        {
            "origin_lon": origin_lon,
            "origin_lat": origin_lat,
            "origin_time": origin_time,
            "search_radius_meters": search_radius_meters
        }
    ).fetchall()

    return [
        {
            "mmsi": row.mmsi,
            "vessel_name": row.vessel_name,
            "proximity_meters": float(row.proximity_meters),
            "avg_speed": float(row.avg_speed) if row.avg_speed else 0.0,
            "potential_discharge_speed": row.potential_discharge_speed
        }
        for row in result
    ]