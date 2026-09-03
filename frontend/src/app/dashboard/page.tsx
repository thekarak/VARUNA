'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dashboard } from '../../components/Dashboard';
import { SuspectPanel, Suspect } from '../../components/SuspectPanel';
import { AnalyticalMetrics, AnalyticalMetricsData } from '../../components/AnalyticalMetrics';
import { ForensicCaseFileModal } from '../../components/ForensicCaseFileModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ForensicDashboardPage() {
  const [taskId, setTaskId] = useState<string>('');
  const [status, setStatus] = useState<string>('IDLE');
  const [message, setMessage] = useState<string>('');
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [caseModalOpen, setCaseModalOpen] = useState(false);

  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80');
  const [lat, setLat] = useState('18.90');
  const [lon, setLon] = useState('72.50');

  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [driftOrigin, setDriftOrigin] = useState<{ latitude: number; longitude: number; time_of_discharge?: string } | undefined>(undefined);
  const [spillData, setSpillData] = useState<{ area_sq_m: number; perimeter_m: number; polygon?: [number, number][] } | undefined>(undefined);
  const [metrics, setMetrics] = useState<AnalyticalMetricsData | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API_BASE}/docs`)
      .then((res) => setBackendHealthy(res.ok))
      .catch(() => setBackendHealthy(false));
  }, []);

  // Preset scenarios
  const applyPreset = (presetLat: string, presetLon: string, name: string) => {
    setLat(presetLat);
    setLon(presetLon);
    setMessage(`Loaded scenario: ${name}`);
  };

  // Generate slick polygon around coordinate
  const generateSlickPolygon = (centerLat: number, centerLon: number): [number, number][] => {
    const r = 0.02;
    return [
      [centerLat + r * 0.9, centerLon - r * 0.4],
      [centerLat + r * 0.7, centerLon + r * 0.8],
      [centerLat + r * 0.1, centerLon + r * 1.1],
      [centerLat - r * 0.6, centerLon + r * 0.7],
      [centerLat - r * 0.9, centerLon - r * 0.2],
      [centerLat - r * 0.4, centerLon - r * 0.9],
      [centerLat + r * 0.4, centerLon - r * 0.8],
      [centerLat + r * 0.9, centerLon - r * 0.4],
    ];
  };

  // Compute rough distance between two coordinates in km
  const computeDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const pollStatus = async (id: string) => {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const res = await fetch(`${API_BASE}/api/v1/task/${id}`);
        const data = await res.json();
        setStatus(data.status);
        setMessage(data.message || '');

        if (data.status === 'SUCCESS' || data.result?.status === 'COMPLETED') {
          const result = data.result || {};
          setStatus('COMPLETED');
          setMessage('Pipeline execution complete. Suspects compiled.');

          const parsedLat = parseFloat(lat);
          const parsedLon = parseFloat(lon);

          // 1. Slick Data & Polygon
          const area = result.spill_area_sq_m || 12500;
          const polygon = generateSlickPolygon(parsedLat, parsedLon);
          setSpillData({
            area_sq_m: area,
            perimeter_m: area * 0.38,
            polygon: polygon,
          });

          // 2. Hindcast Origin
          let origLat = parsedLat + 0.033;
          let origLon = parsedLon + 0.092;
          let dischargeTime = new Date(Date.now() - 12 * 3600 * 1000).toISOString();

          if (result.calculated_origin) {
            origLat = result.calculated_origin.latitude ?? origLat;
            origLon = result.calculated_origin.longitude ?? origLon;
            dischargeTime = result.calculated_origin.time_of_discharge ?? dischargeTime;
          }

          const originObj = {
            latitude: origLat,
            longitude: origLon,
            time_of_discharge: dischargeTime,
          };
          setDriftOrigin(originObj);

          // 3. Suspect Vessels with trajectories
          if (result.vessels_scored) {
            const mappedSuspects: Suspect[] = result.vessels_scored.map((v: any, idx: number) => {
              const offset = (idx + 1) * 0.015;
              return {
                mmsi: v.mmsi,
                name: v.vessel_name || String(v.mmsi),
                proximity_m: v.proximity_m ?? 0,
                score: v.score ?? 0,
                anomalies: v.anomalies ?? [],
                path: [
                  [origLat - offset * 1.5, origLon - offset * 1.2],
                  [origLat - offset * 0.4, origLon - offset * 0.2],
                  [origLat + offset * 0.3, origLon + offset * 0.5],
                  [origLat + offset * 0.9, origLon + offset * 1.1],
                ],
              };
            });
            setSuspects(mappedSuspects);
          }

          // 4. Analytical Metrics
          const driftDist = computeDistanceKm(parsedLat, parsedLon, origLat, origLon);
          setMetrics({
            area_sq_m: area,
            perimeter_m: area * 0.38,
            avg_speed_knots: 13.6,
            drift_distance_km: driftDist > 0.1 ? driftDist : 8.74,
            simulation_time_hours: 12,
            driftOrigin: originObj,
          });

          break;
        }

        if (data.status === 'FAILURE') {
          setMessage(data.result?.error || 'Pipeline task failed');
          break;
        }
      } catch (e: any) {
        setMessage(`Telemetry poll error: ${e.message}`);
      }
    }
    setLoading(false);
  };

  const startAnalysis = async () => {
    setLoading(true);
    setStatus('QUEUED');
    setMessage('Submitting satellite parameters to Celery worker...');
    setSuspects([]);
    setSpillData(undefined);
    setDriftOrigin(undefined);
    setMetrics(undefined);

    try {
      const res = await fetch(`${API_BASE}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          detection_time: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      setTaskId(data.task_id);
      pollStatus(data.task_id);
    } catch (e: any) {
      setMessage(`Backend unreachable at ${API_BASE}: ${e.message}.`);
      setStatus('ERROR');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Tactical Navigation Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <circle cx="12" cy="12" r="9" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" fill="none" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="1.5" fill="#22d3ee" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-wider text-cyan-400">
                V·A·R·U·N·A
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                OPS CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Vision-based Algorithm for Rapid Unrefined-oil &amp; Nautical Analysis
            </p>
          </div>
        </div>

        {/* Action Controls & Health */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy === true
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : backendHealthy === false
                  ? 'bg-red-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-slate-400">API Gateway:</span>
            <span className={backendHealthy ? 'text-emerald-400' : 'text-slate-300'}>
              {backendHealthy === true ? 'ONLINE (8000)' : backendHealthy === false ? 'OFFLINE' : 'CHECKING...'}
            </span>
          </div>

          <a
            href={`${API_BASE}/docs`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
          >
            Swagger Docs ↗
          </a>

          <button
            onClick={() => setCaseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/80 text-emerald-300 font-mono text-xs transition-colors shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <span>📄 Case File (PDF)</span>
          </button>

          <a
            href="/landing.html"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/80 text-cyan-300 font-mono text-xs transition-colors shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <span>🌐 3D Mission Landing</span>
            <span>↗</span>
          </a>
        </div>
      </header>

      {/* Control / Input Panel */}
      <section className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-5 mb-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            <label className="flex flex-col text-xs font-mono text-slate-300">
              <span className="mb-1 text-slate-400 flex items-center justify-between">
                <span>Satellite Feed / Image URL</span>
                <span className="text-[10px] text-cyan-500">Sentinel-1 SAR</span>
              </span>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-slate-200 text-xs font-mono"
              />
            </label>

            <label className="flex flex-col text-xs font-mono text-slate-300">
              <span className="mb-1 text-slate-400">Target Latitude (°N)</span>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-slate-200 text-xs font-mono"
              />
            </label>

            <label className="flex flex-col text-xs font-mono text-slate-300">
              <span className="mb-1 text-slate-400">Target Longitude (°E)</span>
              <input
                type="number"
                step="0.0001"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-slate-200 text-xs font-mono"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={startAnalysis}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-cyan-950/50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <span>⚡ Run Forensic Pipeline</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCaseModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-cyan-950/40"
            >
              <span>📄 Generate Case File (PDF)</span>
            </button>
          </div>
        </div>

        {/* Scenario Quick-Picks */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Quick Scenarios:</span>
          <button
            type="button"
            onClick={() => applyPreset('18.9000', '72.5000', 'Mumbai Offshore')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Mumbai Offshore (18.9°N, 72.5°E)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('19.1200', '72.7500', 'Jawaharlal Nehru Port')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            JNPT Anchorage (19.12°N, 72.75°E)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('18.5500', '72.4000', 'Arabian Sea Shipping Lane')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Arabian Sea Lane (18.55°N, 72.40°E)
          </button>
        </div>
      </section>

      {/* Main Forensic Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Interactive GIS Map & Pipeline Tracker */}
        <div className="lg:col-span-7 space-y-6">
          <Dashboard
            center={[parseFloat(lat) || 18.9, parseFloat(lon) || 72.5]}
            spillData={spillData}
            driftOrigin={driftOrigin}
            vesselTracks={suspects}
            analysisStatus={status}
            stepMessage={message}
          />
        </div>

        {/* Right 5 Columns: Suspect Targets & Analytical Metrics */}
        <div className="lg:col-span-5 space-y-6">
          <SuspectPanel suspects={suspects} />
          <AnalyticalMetrics metrics={metrics} />
        </div>
      </div>

      {/* Forensic Case File Modal & PDF Engine */}
      <ForensicCaseFileModal
        isOpen={caseModalOpen}
        onClose={() => setCaseModalOpen(false)}
        caseData={{
          caseId: taskId ? `VRN-${taskId.slice(0, 8).toUpperCase()}` : undefined,
          imageUrl: imageUrl,
          latitude: parseFloat(lat) || 18.9,
          longitude: parseFloat(lon) || 72.5,
          spillArea: spillData?.area_sq_m,
          spillPerimeter: spillData?.perimeter_m,
          driftOrigin: driftOrigin,
          suspects: suspects,
          driftDistanceKm: metrics?.drift_distance_km,
          simulationHours: metrics?.simulation_time_hours,
          detectionTime: new Date().toISOString(),
        }}
      />
    </main>
  );
}
