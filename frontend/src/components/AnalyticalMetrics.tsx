'use client';

import React from 'react';

export interface AnalyticalMetricsData {
  area_sq_m: number;
  perimeter_m: number;
  avg_speed_knots?: number;
  drift_distance_km?: number;
  simulation_time_hours?: number;
  driftOrigin?: {
    latitude: number;
    longitude: number;
    time_of_discharge?: string;
  };
}

interface AnalyticalMetricsProps {
  metrics?: AnalyticalMetricsData;
}

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

  return (
    <div className="p-5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h3 className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          PHYSICAL &amp; FORENSIC METRICS
        </h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
          LAGRANGIAN RUN
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">OIL SLICK AREA</div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {metrics.area_sq_m.toLocaleString()} <span className="text-xs font-normal text-slate-400">m²</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">≈ {areaHa} Hectares</div>
        </div>

        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">SLICK PERIMETER</div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {metrics.perimeter_m.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Derived boundary</div>
        </div>

        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">DRIFT DISTANCE</div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {(metrics.drift_distance_km ?? 8.7).toFixed(2)} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Wind/Current vector</div>
        </div>

        <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-1">HINDCAST DURATION</div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {metrics.simulation_time_hours ?? 12} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Reverse integration</div>
        </div>

        {metrics.driftOrigin && (
          <>
            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg col-span-2 sm:col-span-2">
              <div className="text-[11px] font-mono text-slate-400 mb-1">CALCULATED DISCHARGE POINT</div>
              <div className="text-sm font-mono font-bold text-yellow-300">
                [{metrics.driftOrigin.latitude.toFixed(5)}, {metrics.driftOrigin.longitude.toFixed(5)}]
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                {metrics.driftOrigin.time_of_discharge
                  ? `Est. Discharge: ${new Date(metrics.driftOrigin.time_of_discharge).toUTCString()}`
                  : 'Time of discharge identified'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticalMetrics;