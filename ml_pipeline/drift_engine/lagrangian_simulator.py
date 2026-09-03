import numpy as np
import datetime


def run_drift_hindcast(lat: float, lon: float, detection_time: datetime.datetime, simulation_hours: int = 12):
    """
    Implements a Lagrangian particle tracker running backwards in time (hindcasting).
    In a fully operational build, this fetches real wind vectors from NOAA GFS
    and ocean currents from Copernicus CMEMS.
    """
    # Mocking environment currents and winds
    # Currents in m/s: positive u is east, positive v is north
    u_current = -0.15
    v_current = -0.05

    # Wind in m/s: 3% wind drift factor applied
    u_wind = -2.5
    v_wind = -1.2
    wind_factor = 0.03

    total_u = u_current + (u_wind * wind_factor)
    total_v = v_current + (v_wind * wind_factor)

    # Convert m/s velocity to degree coordinates shift per hour (approximated)
    deg_per_meter_lat = 1.0 / 111139.0
    deg_per_meter_lon = 1.0 / (111139.0 * np.cos(np.radians(lat)))

    # Track backwards hour by hour
    current_lat = lat
    current_lon = lon
    trajectory = []

    for hr in range(simulation_hours):
        # Move backwards (subtract vector)
        current_lat -= (total_v * 3600.0) * deg_per_meter_lat
        current_lon -= (total_u * 3600.0) * deg_per_meter_lon
        trajectory.append({"lat": current_lat, "lon": current_lon, "hour_back": hr + 1})

    origin_point = (current_lat, current_lon)
    return origin_point, trajectory