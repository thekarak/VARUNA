"""Seed the PostGIS ``vessel_telemetry`` table from the bundled AIS file.

Usage (from ``backend/``)::

    python -m app.services.seed_postgis_ais [--clear]

Loads every ping of ``data/ais/vessel_trajectories.json`` as a PostGIS
POINT (SRID 4326) with timestamp/speed/heading, so the worker's
``fetch_postgis_candidates`` ST_DWithin join has real rows to query.
``--clear`` empties the table first (default) for idempotent demo seeding.
Requires ``DATABASE_URL`` to point at a live PostGIS (e.g. docker-compose
``db`` service); raises otherwise.
"""

import argparse
import datetime
import json
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.abspath(os.path.join(_HERE, "..", "..", ".."))
_JSON_PATH = os.path.join(_REPO_ROOT, "data", "ais", "vessel_trajectories.json")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--clear", action="store_true", default=True,
                        help="Empty vessel_telemetry before seeding (default: on)")
    parser.add_argument("--no-clear", action="store_false", dest="clear",
                        help="Append instead of clearing")
    args = parser.parse_args()

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from geoalchemy2.elements import WKTElement

    from app.models.db_models import Base, VesselTelemetry

    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://varuna_user:varuna_secure_password@localhost:5432/varuna_db",
    )
    engine = create_engine(db_url, connect_args={"connect_timeout": 5})
    # Fail fast with a clear message when PostGIS is unreachable.
    with engine.connect() as conn:
        conn.execute(__import__("sqlalchemy").text("SELECT PostGIS_version()"))

    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    with open(_JSON_PATH, "r", encoding="utf-8") as f:
        vessels = json.load(f)

    session = Session()
    try:
        if args.clear:
            deleted = session.query(VesselTelemetry).delete()
            print(f"Cleared {deleted} existing telemetry rows.")
        inserted = 0
        for v in vessels:
            for p in v.get("pings", []):
                ts = p.get("timestamp")
                dt = (datetime.datetime.fromisoformat(ts) if isinstance(ts, str)
                      else datetime.datetime.now(datetime.timezone.utc))
                if dt.tzinfo is not None:
                    dt = dt.astimezone(datetime.timezone.utc).replace(tzinfo=None)
                session.add(VesselTelemetry(
                    mmsi=int(v["mmsi"]),
                    vessel_name=v.get("vessel_name"),
                    timestamp=dt,
                    speed_knots=float(p.get("sog_kts", 0.0)),
                    heading_degrees=float(p.get("cog_deg", 0.0)),
                    geom=WKTElement(f"POINT({float(p['lon'])} {float(p['lat'])})", srid=4326),
                    is_transponder_suppressed=bool(p.get("is_transponder_suppressed", False)),
                ))
                inserted += 1
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
    print(f"Seeded {inserted} AIS pings from {len(vessels)} vessels into vessel_telemetry.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
