'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SuspectVessel } from './MapViewer';

// Dynamically import MapViewer to guarantee no SSR issues with Leaflet
const MapViewer = dynamic(() => import('./MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-xl bg-slate-950 flex flex-col items-center justify-center text-slate-500 border border-slate-800 font-mono text-sm">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      Loading Tactical GIS Canvas...
    </div>
  ),
});

interface DashboardProps {
  center?: [number, number];
  spillData?: {
    area_sq_m: number;
    perimeter_m: number;
    polygon?: [number, number][];
  };
  driftOrigin?: {
    latitude: number;
    longitude: number;
    time_of_discharge?: string;
  };
  vesselTracks?: SuspectVessel[];
  analysisStatus?: string;
  stepMessage?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  center = [18.9, 72.5],
  spillData,
  driftOrigin,
  vesselTracks = [],
  analysisStatus = 'IDLE',
  stepMessage = '',
}) => {
  const steps = [
    { id: 1, label: '4x ESRGAN', desc: 'Satellite Super-Res' },
    { id: 2, label: 'U-Net Model', desc: 'Slick Segmentation' },
    { id: 3, label: 'Lagrangian', desc: 'Drift Hindcasting' },
    { id: 4, label: 'PostGIS AIS', desc: 'Vessel Correlation' },
  ];

  const getActiveStep = () => {
    if (analysisStatus === 'COMPLETED') return 4;
    if (stepMessage.includes('1/4') || stepMessage.toLowerCase().includes('esrgan')) return 1;
    if (stepMessage.includes('2/4') || stepMessage.toLowerCase().includes('segmentation')) return 2;
    if (stepMessage.includes('3/4') || stepMessage.toLowerCase().includes('hindcast')) return 3;
    if (stepMessage.includes('4/4') || stepMessage.toLowerCase().includes('postgis')) return 4;
    if (analysisStatus === 'QUEUED' || analysisStatus === 'PENDING') return 1;
    return 0;
  };

  const activeStep = getActiveStep();

  return (
    <section className="space-y-4">
      {/* 4-Step Visual Forensic Pipeline Tracker */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            PIPELINE EXECUTION STATE:
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                analysisStatus === 'COMPLETED'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : analysisStatus === 'QUEUED' || analysisStatus === 'PROGRESS'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {analysisStatus}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {stepMessage || (analysisStatus === 'COMPLETED' ? 'Pipeline finished successfully' : 'Standing by for satellite feed')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((s) => {
            const isDone = analysisStatus === 'COMPLETED' || activeStep > s.id;
            const isCurrent = activeStep === s.id && analysisStatus !== 'COMPLETED';

            return (
              <div
                key={s.id}
                className={`p-2.5 rounded-lg border transition-all ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-800/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span>STAGE 0{s.id}</span>
                  {isDone ? <span>✓ DONE</span> : isCurrent ? <span className="animate-pulse">● ACTIVE</span> : <span>QUEUED</span>}
                </div>
                <div className="font-bold text-xs text-slate-200">{s.label}</div>
                <div className="text-[10px] text-slate-400">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Tactical GIS Map */}
      <MapViewer
        center={center}
        spillPolygon={spillData?.polygon}
        driftOrigin={driftOrigin}
        suspects={vesselTracks}
      />
    </section>
  );
};

export default Dashboard;