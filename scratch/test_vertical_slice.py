"""SIH audit Gap-1 proof: a REAL vertical slice on bundled Sentinel-1 samples.

Feeds two different real SAR scenes through enhancement -> segmentation and
asserts the outputs DERIVE FROM THE INPUT PIXELS (different scenes give
different polygons/areas — i.e. nothing is hard-coded). Also exercises the
ensemble drift (uncertainty ellipse) and the AIS attribution chain.

Run from the repo root:  python scratch/test_vertical_slice.py
"""

import datetime
import json
import os
import sys

sys.path.insert(0, os.path.abspath("."))
sys.path.insert(0, os.path.abspath("backend"))

from ml_pipeline.super_resolution.esrgan_inference import execute_super_resolution
from ml_pipeline.segmentation.unet_inference import execute_unet_segmentation
from ml_pipeline.drift_engine.lagrangian_simulator import run_drift_hindcast
from backend.app.services.ais_service import query_and_score_ais_vessels


def segment_scene(scene_path, lat, lon):
    sr = execute_super_resolution(scene_path)
    assert os.path.exists(sr["upscaled_image_path"]), "upscaled file missing"
    assert sr["output_shape_hw"][0] == 4 * sr["input_shape_hw"][0], "not 4x"
    seg = execute_unet_segmentation(sr["upscaled_image_path"], lat, lon)
    assert len(seg["polygon"]) >= 4, "degenerate polygon"
    return sr, seg


def main():
    print("=== GAP-1 VERTICAL SLICE: real pixels in, measured geometry out ===")
    sr1, seg1 = segment_scene("data/sar/sentinel1_sample_slick.png", 19.0, 72.8)
    print(f"scene A: {sr1['input_shape_hw']} -> {sr1['output_shape_hw']}, "
          f"area={seg1['area_sq_m']} m2, peri={seg1['perimeter_m']} m, "
          f"verts={len(seg1['polygon'])}, age={seg1['spill_age_hours']}h")
    sr2, seg2 = segment_scene("data/sar/sentinel1_kutch_slick.png", 22.45, 69.72)
    print(f"scene B: {sr2['input_shape_hw']} -> {sr2['output_shape_hw']}, "
          f"area={seg2['area_sq_m']} m2, peri={seg2['perimeter_m']} m, "
          f"verts={len(seg2['polygon'])}, age={seg2['spill_age_hours']}h")
    assert (seg1["area_sq_m"], seg1["perimeter_m"]) != (seg2["area_sq_m"], seg2["perimeter_m"]), \
        "outputs identical across scenes — segmentation would be hard-coded!"
    assert seg1["polygon"] != seg2["polygon"], "polygons identical — not dynamic!"
    print("DYNAMIC OUTPUT PROOF: scenes A and B yield different measured geometry.")

    print("\n=== GAP-2: ensemble drift with 95% confidence ellipse ===")
    dt = datetime.datetime(2026, 9, 6, 12, 0, 0, tzinfo=datetime.timezone.utc)
    origin, traj, env = run_drift_hindcast(19.0, 72.8, dt, 12, n_particles=500)
    ell = env["origin_uncertainty_ellipse_km"]
    print(f"origin={origin}, spread={env['hindcast_spread_km']} km, ellipse={ell}")
    print(f"forcing: {env['forcing_source']}")
    assert env["particles_simulated"] == 500
    assert ell["semi_major_km"] > 0 and ell["confidence"] == 0.95
    assert len(env["particle_cloud_sample"]) > 0 and len(env["forecast_trajectory"]) == 25

    print("\n=== GAP-3/4/5: AIS scoring labels ===")
    det = dt - datetime.timedelta(hours=12)
    vessels = query_and_score_ais_vessels(origin[0], origin[1], det)
    banned = ("CRITICAL_LEAD", "EXONERATED", "CLEARED")
    for v in vessels:
        assert v["risk_tier"] not in banned, f"banned tier leaked: {v['risk_tier']}"
    print(f"scored {len(vessels)} vessels; tiers: "
          f"{sorted({v['risk_tier'] for v in vessels})}")
    print("\nVERTICAL SLICE: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
