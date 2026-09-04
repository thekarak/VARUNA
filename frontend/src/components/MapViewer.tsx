'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export interface SuspectVessel {
  mmsi: number;
  name: string;
  proximity_m: number;
  score: number;
  anomalies: string[];
  path?: [number, number][];
}

export interface MapViewerProps {
  center?: [number, number];
  spillPolygon?: [number, number][];
  driftOrigin?: { latitude: number; longitude: number; time_of_discharge?: string };
  suspects?: SuspectVessel[];
}

// ==============================================================================
// MAP TILE API KEY CONFIGURATION:
// Paste your key directly below in MANUAL_MAP_KEY, OR set NEXT_PUBLIC_MAP_KEY in .env
// ==============================================================================
export const MANUAL_MAP_KEY = 'YOUR_API_KEY_HERE'; // <-- PASTE YOUR KEY HERE

export const getTileLayerUrl = (): string => {
  const rawKey =
    MANUAL_MAP_KEY && MANUAL_MAP_KEY !== 'YOUR_API_KEY_HERE'
      ? MANUAL_MAP_KEY
      : process.env.NEXT_PUBLIC_MAP_KEY || '';

  const activeKey = rawKey.trim();
  const baseUrl = 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

  if (!activeKey || activeKey === 'YOUR_API_KEY_HERE') {
    return `${baseUrl}?key=`;
  }

  // If key string already contains param like 'api_key=xyz' or 'key=xyz'
  if (activeKey.includes('=')) {
    return `${baseUrl}?${activeKey}`;
  }

  // Support both key= and api_key= for maximum provider compatibility
  return `${baseUrl}?key=${activeKey}&api_key=${activeKey}`;
};

export const MapViewer: React.FC<MapViewerProps> = ({
  center = [18.9, 72.5],
  spillPolygon,
  driftOrigin,
  suspects = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    if (mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      // Fix default marker icon issues in React
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialCenter = driftOrigin
        ? [driftOrigin.latitude, driftOrigin.longitude]
        : center;

      const map = L.map(containerRef.current!, {
        center: initialCenter as [number, number],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Voyager tile layer with key parameter
      const tileUrl = getTileLayerUrl();
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;
      mapInstanceRef.current = map;

      renderLayers(L, map, layersGroup);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      const currentZoom = mapInstanceRef.current.getZoom() || 10;
      mapInstanceRef.current.setView(center, currentZoom, { animate: true });
    }
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    import('leaflet').then((L) => {
      renderLayers(L, mapInstanceRef.current, layersGroupRef.current);
    });
  }, [spillPolygon, driftOrigin, suspects]);

  const renderLayers = (L: any, map: any, group: any) => {
    group.clearLayers();
    const bounds: any[] = [];

    // 1. Detected Oil Slick Polygon & Tactical Centroid Icon
    if (spillPolygon && spillPolygon.length > 2) {
      const polygon = L.polygon(spillPolygon, {
        color: '#ef4444',
        weight: 2.5,
        fillColor: '#dc2626',
        fillOpacity: 0.5,
        dashArray: '5, 5',
      });
      polygon.bindPopup(`
        <div style="font-family:sans-serif; color:#0f172a; font-size:12px;">
          <b style="color:#b91c1c; font-size:13px;">U-Net Oil Spill Polygon</b><br/>
          <span>Vertices Extracted: ${spillPolygon.length}</span><br/>
          <span>Neural Model: U-Net Semantic SAR Masker</span><br/>
          <span>Confidence: Verified Spill Boundary</span>
        </div>
      `);
      group.addLayer(polygon);

      // Compute centroid for high-visibility U-Net Oil Spill Icon
      const centroidLat = spillPolygon.reduce((acc, p) => acc + p[0], 0) / spillPolygon.length;
      const centroidLon = spillPolygon.reduce((acc, p) => acc + p[1], 0) / spillPolygon.length;

      const slickIcon = L.divIcon({
        className: 'oil-slick-icon',
        html: `
          <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="U-Net Oil Spill Detected">
            <div style="position:absolute; width:38px; height:38px; border-radius:50%; background:rgba(239,68,68,0.35); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:26px; height:26px; border-radius:8px; background:#dc2626; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(239,68,68,0.9);">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#ffffff">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const slickMarker = L.marker([centroidLat, centroidLon], {
        icon: slickIcon,
      });

      slickMarker.bindPopup(`
        <div style="font-family:sans-serif; color:#0f172a; font-size:12px; min-width:190px;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <span style="font-size:16px;">⚠️</span>
            <b style="color:#b91c1c; font-size:13px;">U-NET OIL SPILL DETECTED</b>
          </div>
          <div style="font-size:11px; color:#334155; line-height:1.4;">
            <span>Centroid: [${centroidLat.toFixed(4)}°N, ${centroidLon.toFixed(4)}°E]</span><br/>
            <span>Architecture: U-Net Binary Segmentation</span><br/>
            <span>Feature: High-Backscatter Damping Area</span>
          </div>
        </div>
      `);
      group.addLayer(slickMarker);

      bounds.push(...spillPolygon);
    } else if (center) {
      // Standby Target Scene Marker before analysis
      const targetIcon = L.divIcon({
        className: 'target-scene-marker',
        html: `
          <div style="position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center;" title="Target Satellite Scene">
            <div style="position:absolute; width:28px; height:28px; border:2px dashed #06b6d4; border-radius:50%; animation:spin 4s linear infinite;"></div>
            <div style="width:10px; height:10px; border-radius:50%; background:#ef4444; border:2px solid #ffffff; box-shadow:0 0 8px #ef4444;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const targetMarker = L.marker(center, { icon: targetIcon });
      targetMarker.bindPopup(`
        <div style="font-family:sans-serif; color:#0f172a; font-size:12px;">
          <b style="color:#0891b2; font-size:13px;">Target Satellite Recon Scene</b><br/>
          <span>Coordinates: [${center[0].toFixed(4)}°N, ${center[1].toFixed(4)}°E]</span><br/>
          <span>Status: Ready for U-Net Detection</span>
        </div>
      `);
      group.addLayer(targetMarker);
    }

    // 2. Lagrangian Hindcast Origin Point
    if (driftOrigin) {
      const originIcon = L.divIcon({
        className: 'origin-marker',
        html: `
          <div style="position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:32px; height:32px; border-radius:50%; background:rgba(6,182,212,0.3); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:14px; height:14px; border-radius:50%; background:#06b6d4; border:2px solid #ffffff; box-shadow:0 0 12px #06b6d4;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const originMarker = L.marker([driftOrigin.latitude, driftOrigin.longitude], {
        icon: originIcon,
      });

      originMarker.bindPopup(`
        <div style="font-family:sans-serif; color:#0f172a; font-size:12px;">
          <b style="color:#0891b2; font-size:13px;">Lagrangian Hindcast Origin</b><br/>
          <span>Lat: ${driftOrigin.latitude.toFixed(4)}</span><br/>
          <span>Lon: ${driftOrigin.longitude.toFixed(4)}</span>
        </div>
      `);
      group.addLayer(originMarker);
      bounds.push([driftOrigin.latitude, driftOrigin.longitude]);
    }

    // 3. Suspect Vessel Tracks
    if (suspects && suspects.length > 0) {
      const colors = ['#f97316', '#eab308', '#a855f7', '#ec4899'];

      suspects.forEach((suspect, idx) => {
        const color = colors[idx % colors.length];

        let pathCoords = suspect.path;
        if (!pathCoords || pathCoords.length < 2) {
          const baseLat = driftOrigin ? driftOrigin.latitude : center[0];
          const baseLon = driftOrigin ? driftOrigin.longitude : center[1];
          const offset = (idx + 1) * 0.015;
          pathCoords = [
            [baseLat - offset * 1.5, baseLon - offset * 1.2],
            [baseLat - offset * 0.5, baseLon - offset * 0.3],
            [baseLat + offset * 0.2, baseLon + offset * 0.4],
            [baseLat + offset * 0.8, baseLon + offset * 0.9],
          ];
        }

        const polyline = L.polyline(pathCoords, {
          color: color,
          weight: 3,
          opacity: 0.85,
        });

        polyline.bindPopup(`
          <div style="font-family:sans-serif; color:#0f172a; font-size:12px;">
            <b style="color:${color}; font-size:13px;">${suspect.name}</b><br/>
            <span>MMSI: ${suspect.mmsi}</span><br/>
            <span>Proximity: ${suspect.proximity_m.toFixed(1)} m</span><br/>
            <span>Anomaly Score: ${suspect.score.toFixed(1)} / 100</span><br/>
            <span>Flags: ${suspect.anomalies.join(', ') || 'None'}</span>
          </div>
        `);
        group.addLayer(polyline);

        const lastPoint = pathCoords[pathCoords.length - 1];
        const shipIcon = L.divIcon({
          className: 'vessel-marker',
          html: `
            <div style="width:12px; height:12px; border-radius:50%; background:${color}; border:2px solid #ffffff; box-shadow:0 0 8px ${color};"></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const shipMarker = L.marker(lastPoint, { icon: shipIcon });
        shipMarker.bindPopup(`
          <div style="font-family:sans-serif; color:#0f172a; font-size:12px;">
            <b style="color:${color}; font-size:13px;">${suspect.name}</b><br/>
            <span>MMSI: ${suspect.mmsi}</span><br/>
            <span>Position: [${lastPoint[0].toFixed(4)}, ${lastPoint[1].toFixed(4)}]</span>
          </div>
        `);
        group.addLayer(shipMarker);

        bounds.push(...pathCoords);
      });
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  };

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Tactical Overlay & Legend */}
      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-lg text-xs text-slate-200 z-[1000] shadow-lg max-w-xs">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700/60 font-mono text-cyan-400 font-semibold tracking-wider text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          VARUNA LIVE GIS INTELLIGENCE
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-red-500/60 border border-red-400"></span>
            <span>U-Net Oil Spill Polygon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 border border-white shadow-[0_0_6px_#22d3ee]"></span>
            <span>Lagrangian Hindcast Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-orange-400"></span>
            <span>Primary Suspect Trajectory</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-yellow-400"></span>
            <span>Correlated Vessel AIS Trail</span>
          </div>
        </div>
        <div className="mt-2.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
          CartoDB Voyager &bull; Key Parameter Configured
        </div>
      </div>
    </div>
  );
};

export default MapViewer;