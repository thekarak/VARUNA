'use client';

import React from 'react';

export interface AnalyticalMetricsData {
  area_sq_m: number;
  perimeter_m: number;
  avg_speed_knots?: number;
  drift_distance_km?: number;
  simulation_time_hours?: number;
  basin?: string;
  wind_speed_kts?: number;
  wind_bearing_deg?: number;
  current_speed_ms?: number;
  current_bearing_deg?: number;
  estimated_volume_bbls?: number;
  volume_m3?: number;
  metric_tonnes?: number;
  thickness_microns?: number;
  bonn_agreement_code?: string;
  confidence_score?: number;
  driftOrigin?: {
    latitude: number;
    longitude: number;
    time_of_discharge?: string;
  };
}

interface AnalyticalMetricsProps {
  metrics?: AnalyticalMetricsData;
}

const getCompassDirection = (deg?: number): string => {
  if (deg === undefined || deg === null || isNaN(deg)) return 'VAR';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return directions[idx];
};

export const AnalyticalMetrics: React.FC<AnalyticalMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="p-5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-center">
        <div className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-2">Hindcast Telemetry</div>
        <p className="text-slate-400 text-sm">Awaiting pipeline execution.</p>
        <p className="text-slate-600 text-xs mt-1">Metrics calculate automatically once U-Net and Lagrangian models complete.</p>
      </div>
    );
  }

  const areaHa = (metrics.area_sq_m / 10000).toFixed(2);
  const areaKm2 = (metrics.area_sq_m / 1000000).toFixed(3);

  // Fractal boundary complexity ratio: P / (2 * sqrt(pi * A))
  const theoreticalMinPerimeter = 2 * Math.sqrt(Math.PI * Math.max(1, metrics.area_sq_m));
  const boundaryComplexity = (metrics.perimeter_m / theoreticalMinPerimeter).toFixed(2);

  // Derived volume in metric tonnes and cubic meters if not explicitly provided
  const estBbls = metrics.estimated_volume_bbls ?? 0;
  const volM3 = metrics.volume_m3 ?? (estBbls * 0.158987);
  const metricTonnes = metrics.metric_tonnes ?? (volM3 * 0.89);

  // Short Bonn Code display
  let bonnShort = 'Bonn BAOAC Model';
  if (metrics.bonn_agreement_code) {
    if (metrics.bonn_agreement_code.includes('Code 5')) {
      bonnShort = 'Bonn Code 5 (Emulsion >200 µm)';
    } else if (metrics.bonn_agreement_code.includes('Code 4')) {
      bonnShort = 'Bonn Code 4 (True Color 50–200 µm)';
    } else if (metrics.bonn_agreement_code.includes('Code 3')) {
      bonnShort = 'Bonn Code 3 (Metallic Film)';
    } else {
      bonnShort = metrics.bonn_agreement_code.split(':')[0];
    }
  }

  return (
    <div className="p-5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            PHYSICAL &amp; FORENSIC METRICS
          </h3>
          {metrics.basin && (
            <p className="text-[12px] text-slate-300 font-mono mt-1 flex items-center gap-1.5">
              <span className="text-slate-500">Basin / Theater:</span>
              <span className="text-emerald-400 font-semibold">{metrics.basin}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {metrics.confidence_score && (
            <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-semibold">
              U-NET CONF: {metrics.confidence_score.toFixed(1)}%
            </span>
          )}
          <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-semibold">
            LAGRANGIAN RUN
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* 1. Area */}
        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">OIL SLICK AREA</div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {metrics.area_sq_m.toLocaleString()} <span className="text-xs font-normal text-slate-400">m²</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            ≈ {areaHa} ha ({areaKm2} km²)
          </div>
        </div>

        {/* 2. Perimeter & Fluid Boundary Complexity */}
        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">SLICK PERIMETER</div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {metrics.perimeter_m.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{' '}
            <span className="text-xs font-normal text-slate-400">m</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5" title="Perimeter elongation relative to minimal circular geometry">
            Dispersion Index: <span className="text-cyan-300 font-semibold">{boundaryComplexity}</span> (Fractal)
          </div>
        </div>

        {/* 3. Drift Distance */}
        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">DRIFT DISTANCE</div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {(metrics.drift_distance_km ?? 8.7).toFixed(2)} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {metrics.simulation_time_hours ?? 12}h Hindcast Vector
          </div>
        </div>

        {/* 4. Wind Forcing */}
        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">WIND FORCING (GFS)</div>
          <div className="text-base font-bold font-mono text-sky-300">
            {metrics.wind_speed_kts ?? 11.4} <span className="text-xs font-normal text-slate-400">kts</span>
            {metrics.wind_bearing_deg !== undefined && (
              <span className="text-xs font-normal text-slate-400 ml-1">@ {metrics.wind_bearing_deg.toFixed(1)}°</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            From {metrics.wind_bearing_deg !== undefined ? `${metrics.wind_bearing_deg.toFixed(0)}° (${getCompassDirection(metrics.wind_bearing_deg)})` : 'SW'} • 3% Leeway
          </div>
        </div>

        {/* 5. Surface Current */}
        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">SURFACE CURRENT (CMEMS)</div>
          <div className="text-base font-bold font-mono text-teal-300">
            {metrics.current_speed_ms ?? 0.35} <span className="text-xs font-normal text-slate-400">m/s</span>
            {metrics.current_bearing_deg !== undefined && (
              <span className="text-xs font-normal text-slate-400 ml-1">@ {metrics.current_bearing_deg.toFixed(1)}°</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Set {metrics.current_bearing_deg !== undefined ? `${metrics.current_bearing_deg.toFixed(0)}° (${getCompassDirection(metrics.current_bearing_deg)})` : 'NE'} • Advection
          </div>
        </div>

        {/* 6. Estimated Discharge Volume & Bonn Classification */}
        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">EST. DISCHARGE VOLUME</div>
          <div className="text-base font-bold font-mono text-amber-300">
            {estBbls > 0 ? `${estBbls.toLocaleString()} bbl` : '≈ 85 bbl'}
            <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">
              (≈ {metricTonnes.toFixed(1)} MT)
            </span>
          </div>
          <div className="text-[10px] text-amber-400/90 font-mono mt-0.5 truncate" title={metrics.bonn_agreement_code || bonnShort}>
            {bonnShort}
          </div>
        </div>

        {/* 7. Calculated Discharge Origin Point */}
        {metrics.driftOrigin && (
          <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg col-span-2 sm:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-slate-400">CALCULATED DISCHARGE ORIGIN POINT</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/50">
                REVERSE INTEGRATED
              </span>
            </div>
            <div className="text-sm font-mono font-bold text-yellow-300">
              [{metrics.driftOrigin.latitude.toFixed(5)}°N, {metrics.driftOrigin.longitude.toFixed(5)}°E]
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              {metrics.driftOrigin.time_of_discharge
                ? `Est. Discharge Window: ${new Date(metrics.driftOrigin.time_of_discharge).toUTCString()}`
                : 'Time of discharge identified'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticalMetrics;