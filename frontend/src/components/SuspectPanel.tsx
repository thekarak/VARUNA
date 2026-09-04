'use client';

import React from 'react';

export interface Suspect {
  mmsi: number;
  name: string;
  proximity_m: number;
  score: number;
  anomalies: string[];
  risk_tier?: string;
  tier_label?: string;
  vessel_type?: string;
  flag_registry?: string;
  dark_vessel_flag?: boolean;
  path?: [number, number][];
}

interface SuspectPanelProps {
  suspects?: Suspect[];
}

export const SuspectPanel: React.FC<SuspectPanelProps> = ({ suspects = [] }) => {
  if (!suspects || suspects.length === 0) {
    return (
      <div className="p-5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-center">
        <div className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-2">AIS Correlated Targets</div>
        <p className="text-slate-400 text-sm">No suspicious vessels correlated yet.</p>
        <p className="text-slate-600 text-xs mt-1">Run the forensic pipeline to query PostGIS historical trajectories.</p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            SUSPECT VESSELS RANKED ({suspects.length})
          </h3>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Bayesian Multi-Factor AIS Likelihood Engine
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/80 text-red-400 border border-red-800/80">
          PRIORITY LEAD
        </span>
      </div>

      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {suspects.map((suspect, index) => {
          const isHighRisk = suspect.score >= 70;
          const isMediumRisk = suspect.score >= 30 && suspect.score < 70;
          const isLowRisk = suspect.score < 30;

          return (
            <div
              key={suspect.mmsi}
              className={`p-3.5 rounded-lg border transition-all ${
                isHighRisk
                  ? 'bg-slate-800/95 border-red-500/60 shadow-md shadow-red-950/40'
                  : isMediumRisk
                  ? 'bg-slate-800/60 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800/35 border-slate-700/50 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 font-bold">#{index + 1}</span>
                    <h4 className="font-bold text-slate-100 text-sm">{suspect.name}</h4>
                    {isHighRisk && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-900/60 text-red-300 border border-red-700">
                        HIGH PROBABILITY
                      </span>
                    )}
                    {isLowRisk && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                        CLEARED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono">
                    <span className="text-cyan-400/90">MMSI: {suspect.mmsi}</span>
                    {suspect.flag_registry && (
                      <span className="text-slate-400">· {suspect.flag_registry}</span>
                    )}
                  </div>
                  {suspect.vessel_type && (
                    <div className="text-[10px] text-slate-400 font-mono italic">
                      {suspect.vessel_type}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-mono font-bold ${
                      isHighRisk
                        ? 'text-red-400'
                        : isMediumRisk
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {suspect.score.toFixed(1)}% {isLowRisk ? 'PROB' : 'MATCH'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    CPA: {suspect.proximity_m.toFixed(1)}m
                  </span>
                </div>
              </div>

              {/* Likelihood Score Bar */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2.5 border border-slate-700/40">
                <div
                  className={`h-full rounded-full transition-all ${
                    isHighRisk
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                      : isMediumRisk
                      ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                      : 'bg-slate-500'
                  }`}
                  style={{ width: `${Math.max(3, Math.min(100, suspect.score))}%` }}
                />
              </div>

              {/* Anomaly Tags */}
              <div className="flex flex-wrap gap-1.5">
                {suspect.anomalies.map((anomaly, i) => {
                  const isCriticalAnomaly =
                    anomaly.toLowerCase().includes('blackout') ||
                    anomaly.toLowerCase().includes('dead-reckon') ||
                    anomaly.toLowerCase().includes('speed drop');
                  const isClearanceNote =
                    anomaly.toLowerCase().includes('nominal') ||
                    anomaly.toLowerCase().includes('zero transponder') ||
                    anomaly.toLowerCase().includes('distant');

                  return (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        isCriticalAnomaly
                          ? 'bg-red-950/50 text-red-300 border-red-800/50'
                          : isClearanceNote
                          ? 'bg-slate-900/60 text-slate-400 border-slate-700/60'
                          : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                      }`}
                    >
                      {isCriticalAnomaly ? '⚠️' : isClearanceNote ? '✓' : '•'} {anomaly}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuspectPanel;