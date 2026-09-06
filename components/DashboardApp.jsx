const { useState, useEffect, useRef } = React;

function CountUpNumber({ value, decimals = 1, duration = 850, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startVal = displayValue;
    const targetVal = typeof value === "number" ? value : parseFloat(value) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return (
    <span>
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const particleCount = 1000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color("#4ee7ff");
    const mint = new THREE.Color("#3dffb0");
    const white = new THREE.Color("#ffffff");

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 850;
      positions[i + 1] = (Math.random() - 0.5) * 850;
      positions[i + 2] = (Math.random() - 0.5) * 650;

      const rnd = Math.random();
      let c = white;
      if (rnd > 0.68) c = cyan;
      else if (rnd > 0.42) c = mint;

      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4ee7ff,
      wireframe: true,
      transparent: true,
      opacity: 0.14
    });
    const circleShape = new THREE.Mesh(new THREE.TorusGeometry(26, 2.4, 10, 36), wireMat);
    circleShape.position.set(-150, 70, -90);
    scene.add(circleShape);

    const torus = new THREE.Mesh(new THREE.TorusGeometry(32, 2.2, 8, 28), wireMat);
    torus.position.set(160, -60, -100);
    scene.add(torus);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      points.rotation.y += 0.0008;
      circleShape.rotation.x += 0.0025;
      circleShape.rotation.y += 0.0035;
      torus.rotation.x += 0.002;
      torus.rotation.z += 0.0025;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
}

function ThreeCorrelationScene({ vessels, activeScenario, selectedVessel, onSelectVessel }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 60, 140);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const originGroup = new THREE.Group();
    const originGeo = new THREE.SphereGeometry(4.5, 20, 20);
    const originMat = new THREE.MeshBasicMaterial({ color: 0x3dffb0, wireframe: true });
    const originCore = new THREE.Mesh(originGeo, originMat);
    originGroup.add(originCore);

    const haloGeo1 = new THREE.RingGeometry(7, 8.5, 36);
    const haloMat1 = new THREE.MeshBasicMaterial({ color: 0x3dffb0, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const halo1 = new THREE.Mesh(haloGeo1, haloMat1);
    halo1.rotation.x = Math.PI / 2;
    originGroup.add(halo1);

    const haloGeo2 = new THREE.RingGeometry(11, 12, 36);
    const haloMat2 = new THREE.MeshBasicMaterial({ color: 0x4ee7ff, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const halo2 = new THREE.Mesh(haloGeo2, haloMat2);
    halo2.rotation.x = Math.PI / 2.2;
    originGroup.add(halo2);

    scene.add(originGroup);

    const gridHelper = new THREE.PolarGridHelper(80, 8, 8, 36, 0x4ee7ff, 0x1e293b);
    gridHelper.position.y = -6;
    gridHelper.material.opacity = 0.28;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const vesselMeshes = [];
    const vesselList = vessels || [];

    vesselList.forEach((vessel, idx) => {
      const angle = (idx / Math.max(vesselList.length, 1)) * Math.PI * 2;
      const dist = 26 + ((100 - vessel.riskScore) / 100) * 48;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const isHighRisk = vessel.riskScore > 85;
      const vColor = isHighRisk ? 0xff5a4e : vessel.riskScore > 60 ? 0x4ee7ff : 0x94a3b8;

      const nodeGeo = isHighRisk ? new THREE.TorusGeometry(3.8, 0.9, 10, 24) : new THREE.TorusGeometry(2.6, 0.6, 8, 20);
      const nodeMat = new THREE.MeshBasicMaterial({ color: vColor, wireframe: true });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, 0, z);
      nodeMesh.userData = { vessel, dist, angle };
      scene.add(nodeMesh);
      vesselMeshes.push(nodeMesh);

      const curvePoints = [];
      for (let p = 0; p <= 24; p++) {
        const factor = p / 24;
        const px = x * factor;
        const pz = z * factor;
        const py = Math.sin(factor * Math.PI) * (isHighRisk ? 14 : 7);
        curvePoints.push(new THREE.Vector3(px, py, pz));
      }
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineBasicMaterial({
        color: vColor,
        transparent: true,
        opacity: isHighRisk ? 0.8 : 0.35
      });
      const line = new THREE.Line(curveGeo, curveMat);
      scene.add(line);
    });

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotY = 0;
    let rotX = 0.38;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      rotY += dx * 0.008;
      rotX = Math.max(0.12, Math.min(Math.PI / 2.2, rotX + dy * 0.008));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        rotY += 0.0028;
      }

      camera.position.x = Math.sin(rotY) * 135 * Math.cos(rotX);
      camera.position.z = Math.cos(rotY) * 135 * Math.cos(rotX);
      camera.position.y = Math.sin(rotX) * 135;
      camera.lookAt(0, 0, 0);

      originCore.rotation.y += 0.018;
      halo1.rotation.z += 0.012;
      halo2.rotation.z -= 0.008;

      vesselMeshes.forEach((mesh) => {
        mesh.rotation.y += 0.02;
        mesh.rotation.x += 0.01;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [vessels, activeScenario]);

  return (
    <div className="relative w-full h-[480px] lg:h-[530px] rounded-2xl overflow-hidden bg-[#03060a]/95 border border-cyan-500/20 shadow-inner">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute top-3.5 left-4 z-10 flex items-center gap-2 font-mono text-[9.5px] text-cyan-400 bg-black/70 px-3 py-1.5 rounded-lg border border-cyan-500/30 backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        {"3D KINEMATIC CORRELATION ORBIT // DRAG TO ROTATE"}
      </div>
      <div className="absolute bottom-3.5 right-4 z-10 flex items-center gap-3.5 font-mono text-[9.5px] text-slate-400 bg-black/70 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
        <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> ORIGIN NODE
        </span>
        <span className="text-rose-400 flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span> HIGH RISK
        </span>
      </div>
    </div>
  );
}

function LeafletMapView({ activeScenario, vessels, selectedVessel, onSelectVessel, onAlertCoastGuard }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [mapTheme, setMapTheme] = useState("light"); // Light mode default

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [activeScenario.lat, activeScenario.lng],
      zoom: activeScenario.zoom || 11,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Update tile layer whenever mapTheme changes (Light mode Positron vs Dark Matter)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cartoKey = window.CARTO_API_KEY || "cb1_2vlt_1_8a2a2b183412e738d2fe8ff8";
    const basemapSubpath = mapTheme === "dark" ? "dark_all" : "light_all";
    const tileUrl = cartoKey
      ? `https://{s}.basemaps.cartocdn.com/${basemapSubpath}/{z}/{x}/{y}{r}.png?key=${cartoKey}`
      : `https://{s}.basemaps.cartocdn.com/${basemapSubpath}/{z}/{x}/{y}{r}.png`;

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains: "abcd",
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    tileLayerRef.current = tileLayer;
  }, [mapTheme]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    map.flyTo([activeScenario.lat, activeScenario.lng], activeScenario.zoom || 11, {
      duration: 1.4,
      easeLinearity: 0.25
    });

    const isLight = mapTheme === "light";

    if (activeScenario.slickPolygon && activeScenario.slickPolygon.length > 0) {
      const polygon = L.polygon(activeScenario.slickPolygon, {
        color: isLight ? "#0284c7" : "#4ee7ff",
        weight: 2.5,
        fillColor: isLight ? "#0284c7" : "#06b6d4",
        fillOpacity: isLight ? 0.35 : 0.3,
        dashArray: "4, 4"
      }).addTo(layerGroup);

      polygon.bindTooltip("DETECTED OIL SLICK // " + activeScenario.metrics.areaKm2 + " KM²", {
        permanent: false,
        direction: "top",
        className: "leaflet-tooltip-dark"
      });
    }

    if (activeScenario.originCoord) {
      const originIcon = L.divIcon({
        className: "custom-origin-icon",
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-9 h-9 rounded-full bg-emerald-500/25 pulse-ring-anim"></div>
                 <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_14px_#10b981]"></div>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const originMarker = L.marker([activeScenario.originCoord.lat, activeScenario.originCoord.lng], {
        icon: originIcon
      }).addTo(layerGroup);

      originMarker.bindTooltip("RECONSTRUCTED DISCHARGE ORIGIN", {
        permanent: true,
        direction: "bottom",
        className: "leaflet-tooltip-dark font-mono text-[9px]"
      });

      L.polyline([
        [activeScenario.lat, activeScenario.lng],
        [activeScenario.originCoord.lat, activeScenario.originCoord.lng]
      ], {
        color: isLight ? "#059669" : "#34d399",
        weight: 2.5,
        dashArray: "6, 6"
      }).addTo(layerGroup);
    }

    // Render Forward Drift Forecast Trajectory (+24h)
    const forecastPts = activeScenario.forecastTrajectory || activeScenario.forecast_trajectory;
    if (forecastPts && forecastPts.length > 0) {
      const latlngs = forecastPts.map((p) => (Array.isArray(p) ? p : [p.lat, p.lon !== undefined ? p.lon : p.lng]));
      const forecastLine = L.polyline(latlngs, {
        color: isLight ? "#d97706" : "#f59e0b",
        weight: 3,
        dashArray: "6, 6",
        opacity: 0.95
      }).addTo(layerGroup);

      forecastLine.bindTooltip("FORWARD DRIFT FORECAST (+24H CMEMS / GFS)", {
        permanent: false,
        direction: "top",
        className: "leaflet-tooltip-dark font-mono text-[9px]"
      });

      const lastForecast = latlngs[latlngs.length - 1];
      const forecastEndIcon = L.divIcon({
        className: "custom-forecast-icon",
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-7 h-7 rounded-full bg-amber-500/30 animate-ping"></div>
                 <div class="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-[0_0_12px_#d97706]"></div>
               </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker(lastForecast, { icon: forecastEndIcon }).addTo(layerGroup).bindTooltip("T+24H PREDICTED SLICK", {
        permanent: true,
        direction: "right",
        className: "leaflet-tooltip-dark font-mono text-[9px]"
      });
    }

    vessels.forEach((vessel) => {
      const isSelected = selectedVessel && selectedVessel.mmsi === vessel.mmsi;
      const isPrimary = vessel.riskScore > 85;

      const trackPoints = vessel.track && vessel.track.length > 0
        ? vessel.track
        : (vessel.trail && vessel.trail.length > 0
            ? vessel.trail.map((t) => [t.lat, t.lng])
            : (vessel.trajectory && vessel.trajectory.length > 0
                ? vessel.trajectory.map((t) => [t.lat, t.lon !== undefined ? t.lon : t.lng])
                : []));

      if (trackPoints.length > 0) {
        L.polyline(trackPoints, {
          color: isPrimary ? (isLight ? "#0284c7" : "#38bdf8") : (isLight ? "#64748b" : "#94a3b8"),
          weight: isSelected ? 3.5 : 2,
          opacity: isSelected ? 0.95 : 0.6
        }).addTo(layerGroup);
      }

      const blackoutPoints = vessel.blackoutCorridor && vessel.blackoutCorridor.length > 0
        ? vessel.blackoutCorridor
        : (vessel.trail && vessel.trail.length > 0
            ? vessel.trail.filter((t) => t.status && t.status.includes("blackout")).map((t) => [t.lat, t.lng])
            : []);

      if (blackoutPoints.length > 0) {
        const blackoutLine = L.polyline(blackoutPoints, {
          color: isLight ? "#dc2626" : "#f43f5e",
          weight: isSelected ? 4 : 2.5,
          dashArray: "5, 5",
          opacity: 0.95
        }).addTo(layerGroup);

        blackoutLine.bindTooltip("AIS BLACKOUT VOID // " + (vessel.blackoutDurationHours || "GAP") + "H", {
          permanent: false,
          direction: "center",
          className: "leaflet-tooltip-dark"
        });
      }

      if (trackPoints.length > 0) {
        const lastPos = trackPoints[trackPoints.length - 1];
        const vIcon = L.divIcon({
          className: "custom-vessel-icon",
          html: `<div class="relative flex items-center justify-center cursor-pointer">
                   <div class="w-3.5 h-3.5 rounded-full ${isPrimary ? "bg-rose-500 shadow-[0_0_12px_#f43f5e]" : "bg-cyan-500 shadow-[0_0_8px_#06b6d4]"} border-2 border-white"></div>
                 </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const vMarker = L.marker(lastPos, { icon: vIcon }).addTo(layerGroup);
        vMarker.on("click", () => {
          onSelectVessel(vessel);
        });

        vMarker.bindTooltip(`${vessel.name} (${vessel.riskScore}%)`, {
          direction: "top",
          className: "leaflet-tooltip-dark font-mono text-[9.5px]"
        });
      }
    });
  }, [activeScenario, vessels, selectedVessel, mapTheme]);

  return (
    <div className={`relative w-full h-[580px] lg:h-[650px] rounded-2xl overflow-hidden border border-white/10 ${mapTheme === "light" ? "bg-[#e2e8f0]" : "bg-[#04070d]"} shadow-2xl transition-colors duration-300`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      <div className="absolute top-4 left-4 z-20 pointer-events-auto bg-[#070c14]/92 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-3.5 shadow-2xl font-mono text-[10px] space-y-2 max-w-[220px]">
        <div className="text-cyan-400 font-bold border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="tracking-wider uppercase">MAP OVERLAY LAYERS</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-400"></span>
          <span>Detected Slick Polygon</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Reconstructed Origin (Hindcast)</span>
        </div>
        <div className="flex items-center gap-2.5 text-amber-400">
          <span className="w-3.5 h-0.5 border-b-2 border-dashed border-amber-400"></span>
          <span>Forward Forecast (+24h)</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-300">
          <span className="w-3.5 h-0.5 bg-sky-400"></span>
          <span>AIS Active Track</span>
        </div>
        <div className="flex items-center gap-2.5 text-rose-400">
          <span className="w-3.5 h-0.5 border-b-2 border-dashed border-rose-400"></span>
          <span>AIS Blackout Corridor</span>
        </div>
      </div>

      <div className="absolute top-4 right-14 z-20 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setMapTheme(mapTheme === "light" ? "dark" : "light")}
          className="px-3 py-2 rounded-xl bg-[#070c14]/92 hover:bg-[#0f172a] border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md active:scale-95"
          title="Toggle Map Basemap (Light Mode / Dark Mode)"
        >
          <span>{mapTheme === "light" ? "☀️ LIGHT MODE" : "🌙 DARK MODE"}</span>
        </button>
        <button
          onClick={onAlertCoastGuard}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
          <span>ALERT COAST GUARD</span>
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-[#070c14]/92 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 font-mono text-[9px] text-slate-300 flex items-center gap-3 shadow-lg">
        <span className="text-cyan-400 font-bold">LAT {activeScenario.lat.toFixed(4)}°N</span>
        <span>LON {activeScenario.lng.toFixed(4)}°E</span>
        <span className="text-slate-500">·</span>
        <span className="text-emerald-400">RADAR 10M C-SAR</span>
      </div>
    </div>
  );
}

function CaseFileModal({ isOpen, onClose, scenario, vessels, metrics }) {
  if (!isOpen) return null;

  const topVessel = vessels && vessels.length > 0 ? vessels[0] : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#070c14] border border-cyan-500/40 rounded-2xl p-6 sm:p-10 shadow-2xl text-white font-sans my-8 print:p-0 print:border-none print:bg-white print:text-black">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 print:border-black">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-black text-cyan-400 tracking-[0.2em] print:text-black">
              V.A.R.U.N.A
            </span>
            <span className="text-slate-500 font-mono text-xs">|</span>
            <span className="font-mono text-xs tracking-widest text-slate-300 uppercase print:text-gray-700 font-semibold">
              MARPOL ANNEX I FORENSIC ADMISSIBILITY DOSSIER
            </span>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-cyan-glow"
            >
              PRINT / SAVE AS PDF
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 font-mono text-xs uppercase cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-6 font-mono text-xs print:border-gray-300 print:bg-gray-50">
          <div>
            <span className="text-slate-500 text-[10px] block font-medium">DOSSIER CASE REF</span>
            <span className="font-bold text-white print:text-black">#V.A.R.U.N.A-MED-08492</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block font-medium">TIMESTAMP (UTC)</span>
            <span className="font-bold text-cyan-300 print:text-black">2026-09-04T12:08:44Z</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block font-medium">TARGET MARITIME REGION</span>
            <span className="font-bold text-white print:text-black">{scenario.name}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block font-medium">LEGAL STATUS</span>
            <span className="font-bold text-emerald-400 print:text-green-700">BURDEN OF PROOF MET</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-cyan-200 mb-2.5 print:text-black">
              1. Satellite Observation & Physical Slick Dimensions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 print:bg-white print:border-gray-300">
                <span className="text-slate-400 text-[10px] block">SLICK SURFACE AREA</span>
                <span className="text-base font-bold text-white print:text-black">{metrics.areaKm2} KM²</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 print:bg-white print:border-gray-300">
                <span className="text-slate-400 text-[10px] block">SLICK PERIMETER</span>
                <span className="text-base font-bold text-white print:text-black">{metrics.perimeterKm} KM</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 print:bg-white print:border-gray-300">
                <span className="text-slate-400 text-[10px] block">SEGMENTATION IOU</span>
                <span className="text-base font-bold text-emerald-400 print:text-black">{metrics.segmentationIoU}%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-cyan-200 mb-2 print:text-black">
              2. Lagrangian Reverse Hydrodynamic Hindcast
            </h3>
            <p className="font-sans text-xs text-slate-300 leading-relaxed mb-3 print:text-black">
              Using HYCOM 1/12° oceanic current velocity vectors and ERA5 10m wind leeway drag modeling (3.1%), the slick was back-calculated across 18.4 hours to discharge coordinates ({scenario.originCoord.lat.toFixed(4)}°N, {scenario.originCoord.lng.toFixed(4)}°E).
            </p>
          </div>

          {topVessel && (
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-rose-300 mb-2.5 print:text-black">
                3. Primary Attribution Suspect Vessel
              </h3>
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 font-mono text-xs space-y-2.5 print:bg-white print:border-red-600">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-white print:text-black">
                    {topVessel.name} (MMSI: {topVessel.mmsi} · IMO: {topVessel.imo})
                  </span>
                  <span className="px-2.5 py-1 rounded bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs">
                    BAYESIAN LIABILITY: {topVessel.riskScore}%
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 print:text-black pt-2 border-t border-rose-500/20">
                  <div>TYPE: {topVessel.type}</div>
                  <div>FLAG: {topVessel.flag}</div>
                  <div>DWT: {topVessel.dwt.toLocaleString()} TONS</div>
                  <div>PROXIMITY: {topVessel.proximityNM} NM</div>
                </div>
                <div className="pt-2 text-slate-400 print:text-gray-800 text-[11px] leading-relaxed">
                  CORRELATION EVIDENCE: Vessel disabled AIS transponders for {topVessel.blackoutDurationHours} hours and dropped speed by {Math.abs(topVessel.speedDelta)} kts during the exact estimated discharge window.
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between font-mono text-[10px] text-slate-500 print:border-black print:text-black">
            <span>SHA-256 SEAL: 9e8a7c1b4d0e2f5a8c3b1e9d7f5a2c4e6b8a0d2f4a6c8e0b2d4f6a8c0e2b4d6</span>
            <span>V.A.R.U.N.A SECURE CHAIN OF CUSTODY</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function VesselDetailModal({ vessel, onClose }) {
  if (!vessel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#070c14] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-white font-mono">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wider font-display">
                {vessel.name}
              </h3>
              <span className="text-[10px] text-slate-400">
                MMSI: {vessel.mmsi} · IMO: {vessel.imo}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-5 text-xs">
          <div>
            <span className="text-[9px] text-slate-500 block">TYPE</span>
            <span className="font-semibold text-slate-200">{vessel.type}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block">FLAG</span>
            <span className="font-semibold text-slate-200">{vessel.flag}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block">DWT TONNAGE</span>
            <span className="font-semibold text-slate-200">{vessel.dwt.toLocaleString()} MT</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block">MATCH CONFIDENCE</span>
            <span className="font-bold text-rose-400 text-sm">{vessel.riskScore}%</span>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-semibold">
            SPEED HISTORY KINEMATICS (HOURLY SAMPLE)
          </span>
          <div className="h-24 w-full bg-black/50 rounded-xl p-3 border border-white/5 flex items-end gap-1.5">
            {vessel.speedHistory && vessel.speedHistory.map((spd, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${spd < 10 ? "bg-rose-500" : "bg-cyan-400"}`}
                  style={{ height: `${(spd / 20) * 100}%` }}
                />
                <span className="text-[8px] text-slate-500">{spd}k</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-semibold">
            ANOMALY WARNING SIGNATURES
          </span>
          <div className="flex flex-wrap gap-2">
            {vessel.warningTags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              if (onReportCoastGuard) onReportCoastGuard(vessel);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/25 to-amber-500/25 hover:from-rose-500/40 hover:to-amber-500/40 text-rose-300 border border-rose-500/50 text-xs font-bold uppercase cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
            <span>REPORT THIS VESSEL TO COAST GUARD</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold cursor-pointer shadow-cyan-glow"
          >
            DISMISS INTELLIGENCE VIEW
          </button>
        </div>
      </div>
    </div>
  );
}

function CoastGuardModal({ isOpen, onClose, scenario, vessels, metrics, lastDispatch, onDispatchSuccess, targetVessel }) {
  if (!isOpen || !scenario) return null;

  const [selectedStationId, setSelectedStationId] = useState(
    scenario.coastGuardStations && scenario.coastGuardStations.length > 0 ? scenario.coastGuardStations[0].id : "all"
  );
  const [selectedTier, setSelectedTier] = useState("TIER 2");
  const [operatorNotes, setOperatorNotes] = useState(
    "Lagrangian hydrodynamic reverse trajectory confirms discharge origin. Primary suspect vessel throttled speed during AIS blackout corridor. Recommend immediate aerial surveillance and patrol intercept."
  );
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionStep, setTransmissionStep] = useState(0);
  const [dispatchResult, setDispatchResult] = useState(lastDispatch || null);

  const stations = scenario.coastGuardStations || [];
  const primaryVessel = targetVessel || (vessels && vessels.length > 0 ? vessels[0] : null);

  const handleTransmit = () => {
    setIsTransmitting(true);
    setTransmissionStep(1);

    setTimeout(() => {
      setTransmissionStep(2);
    }, 600);

    setTimeout(() => {
      setTransmissionStep(3);
    }, 1200);

    setTimeout(() => {
      const selectedStation = stations.find((s) => s.id === selectedStationId);
      const chosenStationName = selectedStationId === "all"
        ? "ALL REGIONAL MARITIME COMMANDS (REGIONAL BROADCAST)"
        : (selectedStation ? selectedStation.name : "Regional Maritime Rescue Coordination Centre");
      
      const eta = selectedStation ? selectedStation.etaMin : 35;

      ForensicApi.dispatchCoastGuardAlert({
        station: chosenStationName,
        frequency: selectedStation ? selectedStation.channel : "VHF Ch 16 / DSC / INMARSAT-C",
        tier: selectedTier,
        etaMin: eta,
        scenarioId: scenario.id,
        coordinates: `${scenario.lat.toFixed(4)}°N, ${scenario.lng.toFixed(4)}°E`,
        originCoords: `${scenario.originCoord.lat.toFixed(4)}°N, ${scenario.originCoord.lng.toFixed(4)}°E`,
        volumeBbl: metrics.estimatedVolumeBbl,
        primarySuspectMmsi: primaryVessel ? primaryVessel.mmsi : "UNKNOWN",
        notes: operatorNotes
      }).then((res) => {
        setIsTransmitting(false);
        setDispatchResult(res);
        if (onDispatchSuccess) onDispatchSuccess(res);
      });
    }, 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#070c14] border border-rose-500/40 rounded-2xl p-6 sm:p-10 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-white font-mono my-8 max-h-[92vh] overflow-y-auto print:bg-white print:text-black print:border-none print:p-0">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 print:border-black">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl sm:text-2xl font-black text-rose-400 tracking-wider print:text-black">
                  V.A.R.U.N.A
                </span>
                <span className="text-slate-500 text-xs">|</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest print:text-black">
                  COAST GUARD EMERGENCY DISPATCH
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                MARITIME RESCUE COORDINATION CENTRE (MRCC) TELEGRAM & INTERCEPT ORDER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            {dispatchResult && (
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold uppercase cursor-pointer transition-all"
              >
                PRINT DISPATCH
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs uppercase cursor-pointer transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-6 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block">INCIDENT REGION</span>
            <span className="font-bold text-white text-xs block truncate">{scenario.name}</span>
            <span className="text-[9.5px] text-cyan-400">{scenario.lat.toFixed(4)}°N, {scenario.lng.toFixed(4)}°E</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">RECONSTRUCTED ORIGIN</span>
            <span className="font-bold text-emerald-400 text-xs block truncate">{scenario.originCoord.lat.toFixed(4)}°N, {scenario.originCoord.lng.toFixed(4)}°E</span>
            <span className="text-[9.5px] text-slate-400">DRIFT: {metrics.driftDistanceNM} NM (T-18.4H)</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">ESTIMATED DISCHARGE</span>
            <span className="font-bold text-rose-400 text-xs block truncate">~{metrics.estimatedVolumeBbl} BBL</span>
            <span className="text-[9.5px] text-slate-400">{metrics.areaKm2} KM² SLICK AREA</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">PRIMARY SUSPECT</span>
            <span className="font-bold text-white text-xs block truncate">{primaryVessel ? primaryVessel.name : "UNKNOWN"}</span>
            <span className="text-[9.5px] text-amber-400">MMSI: {primaryVessel ? primaryVessel.mmsi : "N/A"} ({primaryVessel ? primaryVessel.riskScore : 0}%)</span>
          </div>
        </div>

        {!dispatchResult ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
                  1. SELECT EMERGENCY RESPONSE TIER
                </span>
                <span className="text-[10px] text-slate-500">MARPOL PROTOCOL LEVEL</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "TIER 1", title: "TIER 1 // LOCAL RESPONSE", desc: "Containment booms, skimmers, and port authority alert." },
                  { id: "TIER 2", title: "TIER 2 // REGIONAL INTERCEPT", desc: "Coast Guard air/sea patrol dispatch, active vessel intercept & boarding." },
                  { id: "TIER 3", title: "TIER 3 // INTERNATIONAL PURSUIT", desc: "Flag state detention warrant & international admiralty alert." }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTier === tier.id
                        ? "bg-rose-950/40 border-rose-500/80 text-white shadow-[0_0_20px_rgba(244,63,94,0.25)]"
                        : "bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{tier.title}</span>
                        {selectedTier === tier.id && <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>}
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-relaxed mt-1">{tier.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
                  2. DESIGNATED COAST GUARD COMMANDS & MRCC STATIONS
                </span>
                <span className="text-[10px] text-slate-500">AUTOMATIC GEOLOCATION</span>
              </div>

              <div className="space-y-2.5">
                {stations.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStationId(st.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selectedStationId === st.id
                        ? "bg-[#0b1626] border-cyan-400 shadow-cyan-glow"
                        : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedStationId === st.id ? "border-cyan-400 bg-cyan-400" : "border-slate-600"}`}>
                        {selectedStationId === st.id && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">{st.name}</span>
                        <span className="text-[10px] text-slate-400 block">{st.base} · DISTANCE: {st.distanceNM} NM</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <span className="text-cyan-300 font-semibold">{st.channel}</span>
                      <span className="text-slate-400">ETA: <strong className="text-white">{st.etaMin} MIN</strong></span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                        {st.status}
                      </span>
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => setSelectedStationId("all")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedStationId === "all"
                      ? "bg-rose-950/40 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.25)]"
                      : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedStationId === "all" ? "border-rose-400 bg-rose-400" : "border-slate-600"}`}>
                      {selectedStationId === "all" && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                    </div>
                    <span className="font-bold text-xs text-white">BROADCAST TO ALL NEARBY REGIONAL COMMAND CENTERS</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">
                    SIMULTANEOUS RELAY
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                3. DISTRESS BROADCAST CHANNELS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-300">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>VHF Marine Channel 16 / 70 DSC (Digital Selective Calling)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Regional MRCC Dedicated Telex & Encrypted Satellite Relay</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Inmarsat SafetyNET Maritime Safety Information (MSI) Alert</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>IMO GISIS Maritime Pollution Incident Database Automated Log</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                {"4. OPERATIONAL EVIDENCE NOTES // DIRECTIVE"}
              </span>
              <textarea
                rows={3}
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-rose-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-[10px] text-slate-400">
                <span>CHAIN OF CUSTODY: </span>
                <span className="text-cyan-400 font-mono">SHA-256 ENCRYPTED · ADMISSIBLE UNDER MARPOL ANNEX I</span>
              </div>

              <button
                onClick={handleTransmit}
                disabled={isTransmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-mono text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_30px_rgba(244,63,94,0.4)] disabled:opacity-50 flex items-center justify-center gap-2.5 active:scale-95"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isTransmitting ? "bg-black animate-ping" : "bg-black"}`}></span>
                <span>{isTransmitting ? "TRANSMITTING TO MRCC..." : "TRANSMIT EMERGENCY REPORT TO COAST GUARD"}</span>
              </button>
            </div>

            {isTransmitting && (
              <div className="p-4 rounded-xl bg-[#0c1828] border border-cyan-400 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-cyan-400">
                    {transmissionStep === 1 && "ENCRYPTING TELEMETRY DOCKET..."}
                    {transmissionStep === 2 && "ROUTING VIA REGIONAL MRCC SATELLITE RELAY..."}
                    {transmissionStep === 3 && "TRANSMITTING VIA INMARSAT-C & VHF DSC CH-16..."}
                  </span>
                  <span className="text-white">{transmissionStep * 33}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${transmissionStep * 33}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-4 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-400 text-black font-bold flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      ALERT TRANSMITTED & ACKNOWLEDGED BY COAST GUARD
                    </h4>
                    <span className="text-xs text-emerald-400">
                      INCIDENT DOCKET SEALED AND DISPATCHED
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-300 font-bold px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/40">
                  DISPATCH CONFIRMED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">DISPATCH REF ID</span>
                  <span className="font-bold text-white">{dispatchResult.dispatchId}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">RESPONDING COMMAND</span>
                  <span className="font-bold text-white truncate block">{dispatchResult.station}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">PATROL INTERCEPT ETA</span>
                  <span className="font-bold text-emerald-400 text-sm">{dispatchResult.interceptETA}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">TIMESTAMP (UTC)</span>
                  <span className="font-bold text-cyan-300 text-[11px]">{dispatchResult.timestamp}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-[10px] text-slate-300 space-y-1">
                <div className="text-slate-400 uppercase font-semibold">TRANSMISSION CHECKSUM & PROTOCOL</div>
                <div className="text-cyan-300">{dispatchResult.transmissionChecksum}</div>
                <div className="text-slate-400">BROADCAST VIA: {dispatchResult.frequency} · DIRECTIVE: {dispatchResult.tier}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setDispatchResult(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs uppercase cursor-pointer transition-all"
              >
                TRANSMIT AMENDED INCIDENT UPDATE
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase cursor-pointer transition-all shadow-emerald-glow"
                >
                  PRINT OFFICIAL DISPATCH RECEIPT
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase cursor-pointer transition-all shadow-cyan-glow"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function DashboardApp() {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState("hormuz");
  const [activeScenario, setActiveScenario] = useState(null);
  const [latInput, setLatInput] = useState("24.6367");
  const [lngInput, setLngInput] = useState("54.3292");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [pipelineStages, setPipelineStages] = useState([]);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [showCaseFile, setShowCaseFile] = useState(false);
  const [showCoastGuardModal, setShowCoastGuardModal] = useState(false);
  const [coastGuardDispatch, setCoastGuardDispatch] = useState(null);
  const [targetVesselForReport, setTargetVesselForReport] = useState(null);
  const [timeString, setTimeString] = useState(new Date().toUTCString());

  useEffect(() => {
    ForensicApi.getOperationalScenarios().then((res) => {
      setScenarios(res);
      if (res.length > 0) {
        const first = res[0];
        setActiveScenario(first);
        setLatInput(first.lat.toFixed(4));
        setLngInput(first.lng.toFixed(4));
        setImageUrlInput(first.imageUrl);
        setMetrics(first.metrics);
      }
    });

    setPipelineStages(window.initialPipelineStages || []);

    ForensicApi.getSuspectVessels("hormuz").then((vList) => {
      setVessels(vList);
    });

    const timer = setInterval(() => {
      setTimeString(new Date().toUTCString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSelectScenario = (sc) => {
    setActiveScenarioId(sc.id);
    setActiveScenario(sc);
    setLatInput(sc.lat.toFixed(4));
    setLngInput(sc.lng.toFixed(4));
    setImageUrlInput(sc.imageUrl);
    setMetrics(sc.metrics);
    setTargetVesselForReport(null);
    ForensicApi.getSuspectVessels(sc.id).then((vList) => {
      setVessels(vList);
    });
  };

  const handleRunPipeline = () => {
    if (isRunningPipeline) return;
    setIsRunningPipeline(true);

    ForensicApi.runDetectionPipeline(
      { scenarioId: activeScenarioId },
      (updatedStages) => {
        setPipelineStages(updatedStages);
      }
    ).then((result) => {
      setIsRunningPipeline(false);
      setVessels(result.vessels);
      setMetrics(result.metrics);
      if (result.scenario) setActiveScenario(result.scenario);
    });
  };

  if (!activeScenario || !metrics) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#04070d] text-cyan-400 font-mono">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-3"></span>
        INITIALIZING V.A.R.U.N.A FORENSIC OPERATIONS DASHBOARD...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04070d] text-white selection:bg-cyan-400 selection:text-black font-sans relative overflow-x-hidden">
      <ThreeBackground />

      <header className="sticky top-0 z-40 w-full bg-[#04070d]/88 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="index.html"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "index.html";
            }}
            className="flex items-center gap-2 group cursor-pointer"
            title="Return to Landing Page"
          >
            <span className="font-display text-xl sm:text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-[0.2em]">
              V.A.R.U.N.A
            </span>
          </a>
          <span className="hidden md:inline text-slate-500 font-mono text-xs">|</span>
          <span className="hidden md:inline font-mono text-[10px] text-slate-400 tracking-widest uppercase font-semibold">
            FORENSIC OPERATIONAL ATTRIBUTION ENGINE
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {coastGuardDispatch ? (
            <button
              onClick={() => setShowCoastGuardModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 font-mono text-xs text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] cursor-pointer transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>CG DISPATCHED ({coastGuardDispatch.interceptETA})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setTargetVesselForReport(null);
                setShowCoastGuardModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/25 to-amber-500/25 hover:from-rose-500/40 hover:to-amber-500/40 text-rose-300 hover:text-white border border-rose-500/50 font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>ALERT COAST GUARD</span>
            </button>
          )}

          <button
            onClick={() => setShowCaseFile(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-cyan-glow"
          >
            <span>CASE FILE (PDF)</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6">

        <section className="bg-[#070c14]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-3">
            <div>
              <span className="font-mono text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase block">
                {"INPUT PARAMETERS // OPERATIONAL SCENARIOS"}
              </span>
              <p className="font-sans text-xs text-slate-400 mt-0.5 font-light">
                Define the maritime coordinates, feed imagery, or select a preset maritime crime scene.
              </p>
            </div>
            <div>
              <button
                onClick={handleRunPipeline}
                disabled={isRunningPipeline}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-black font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(78,231,255,0.35)] cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                <span className={`w-2 h-2 rounded-full ${isRunningPipeline ? "bg-black animate-ping" : "bg-black"}`}></span>
                {isRunningPipeline ? "RUNNING PIPELINE..." : "RUN FORENSIC PIPELINE"}
              </button>
            </div>
          </div>

          <div className="mb-5">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-2.5 font-semibold">
              PRESET MARITIME SCENARIOS (CLICK TO AUTOFILL)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {scenarios.map((sc) => {
                const nearestCg = sc.coastGuardStations && sc.coastGuardStations[0] ? sc.coastGuardStations[0] : null;
                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`p-4 rounded-xl font-mono text-xs transition-all cursor-pointer border text-left flex flex-col justify-between gap-2.5 ${
                      activeScenarioId === sc.id
                        ? "bg-[#0c1828] border-cyan-400 text-cyan-300 shadow-cyan-glow"
                        : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs block">{sc.name}</span>
                        {activeScenarioId === sc.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{sc.region}</span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9.5px]">
                      <span className="text-cyan-400">{sc.lat.toFixed(2)}°N, {sc.lng.toFixed(2)}°E</span>
                      {nearestCg && (
                        <span className="text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-500/30">
                          {nearestCg.name.split(" ")[0]} CG · {nearestCg.distanceNM} NM
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
                TARGET LATITUDE
              </label>
              <input
                type="text"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
                TARGET LONGITUDE
              </label>
              <input
                type="text"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
                SATELLITE SAR FEED URL
              </label>
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none transition-colors truncate"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#070c14]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="font-mono text-xs font-bold text-slate-300 tracking-[0.2em] uppercase">
              PIPELINE EXECUTION STATUS
            </span>
            <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest px-2.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
              {"4 STAGES // ASYNC ORCHESTRATION"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            {pipelineStages.map((st) => (
              <div
                key={st.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  st.status === "RUNNING"
                    ? "bg-[#0b1626] border-cyan-400 shadow-cyan-glow"
                    : "bg-white/[0.02] border-white/5"
                }`}
              >
                {st.status === "RUNNING" && (
                  <div className="absolute inset-x-0 top-0 h-0.5 scanline-bar pointer-events-none" />
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-bold text-xs">{st.num}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        st.status === "DONE"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                          : st.status === "RUNNING"
                          ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 animate-pulse"
                          : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-wider">
                    {st.name}
                  </h4>
                  <p className="font-sans text-[11px] text-slate-400 mt-1 leading-snug">
                    {st.desc}
                  </p>
                </div>

                {st.status === "RUNNING" && (
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-150"
                      style={{ width: `${st.progress || 50}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 xl:grid-cols-10 gap-3 font-mono">
          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">OIL SLICK AREA</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              <CountUpNumber value={metrics.areaKm2} decimals={2} /> <span className="text-xs font-normal text-cyan-400">KM²</span>
            </span>
            <span className="text-[8.5px] text-cyan-400 mt-1 block">SENTINEL-1 C-SAR</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">PERIMETER</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              <CountUpNumber value={metrics.perimeterKm} decimals={1} /> <span className="text-xs font-normal text-cyan-400">KM</span>
            </span>
            <span className="text-[8.5px] text-slate-400 mt-1 block">CONTOUR BOUND</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">DRIFT DISTANCE</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              <CountUpNumber value={metrics.driftDistanceNM} decimals={1} /> <span className="text-xs font-normal text-cyan-400">NM</span>
            </span>
            <span className="text-[8.5px] text-emerald-400 mt-1 block">
              T-{(metrics.spillAgeHours || (activeScenario.driftVector && activeScenario.driftVector.durationHours) || 18.4).toFixed(1)}H HINDCAST
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">SEGMENTATION IOU</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
              <CountUpNumber value={metrics.segmentationIoU} decimals={1} suffix="%" />
            </span>
            <span className="text-[8.5px] text-slate-400 mt-1 block">CNN U-NET MASK</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">EST. DISCHARGE</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              ~<CountUpNumber value={metrics.estimatedVolumeBbl} decimals={0} /> <span className="text-xs font-normal text-cyan-400">BBL</span>
            </span>
            <span className="text-[8.5px] text-amber-400 mt-1 block">BONN CODE (BAOAC)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">ATTRIBUTION CONF</span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">
              <CountUpNumber value={metrics.attributionConfidence} decimals={1} suffix="%" />
            </span>
            <span className="text-[8.5px] text-rose-400 mt-1 block">BAYESIAN EVIDENCE</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">SPILL AGE</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">
              <CountUpNumber value={metrics.spillAgeHours || activeScenario.driftVector?.durationHours || 14.2} decimals={1} />
              {" "}<span className="text-xs font-normal text-amber-400">HRS</span>
            </span>
            <span className="text-[8.5px] text-amber-400 mt-1 block">FAY SPREADING MODEL</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">WEATHERING</span>
            <span className="text-sm font-black text-rose-300 mt-1 block leading-tight">
              {(metrics.weatheringStage || "Evaporating").split(" / ")[0]}
            </span>
            <span className="text-[8.5px] text-rose-400 mt-1 block">
              {(metrics.weatheringStage || "Evaporating / Spreading").split(" / ")[1] || "Spreading"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070c14]/92 border border-white/10 shadow-xl flex flex-col justify-between min-h-[115px]">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">DRIFT VELOCITY</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              {activeScenario.driftVector ? activeScenario.driftVector.speedKts : 1.84} <span className="text-xs font-normal text-cyan-400">KTS</span>
            </span>
            <span className="text-[8.5px] text-cyan-300 mt-1 block">
              {activeScenario.driftVector ? activeScenario.driftVector.angle : 225}° CMEMS / GFS
            </span>
          </div>

          <div
            onClick={() => {
              setTargetVesselForReport(null);
              setShowCoastGuardModal(true);
            }}
            className={`p-4 rounded-2xl border shadow-xl flex flex-col justify-between min-h-[115px] cursor-pointer transition-all ${
              coastGuardDispatch
                ? "bg-emerald-950/40 border-emerald-500/60 hover:bg-emerald-950/60 shadow-emerald-glow"
                : "bg-rose-950/30 border-rose-500/40 hover:bg-rose-950/50 shadow-[0_0_20px_rgba(244,63,94,0.18)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest block font-semibold text-rose-300">COAST GUARD</span>
              <span className={`w-2 h-2 rounded-full ${coastGuardDispatch ? "bg-emerald-400 animate-pulse" : "bg-rose-400 animate-ping"}`}></span>
            </div>
            <span className="text-base sm:text-lg font-bold mt-1 block text-white">
              {coastGuardDispatch ? "ALERTED" : "STANDBY"}
            </span>
            <span className={`text-[8.5px] font-bold mt-1 block ${coastGuardDispatch ? "text-emerald-400" : "text-rose-400"}`}>
              {coastGuardDispatch ? `ETA: ${coastGuardDispatch.interceptETA}` : "DISPATCH REPORT →"}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-cyan-400 font-semibold tracking-wider uppercase">
                GEOSPATIAL INTELLIGENCE MAP
              </span>
              <span className="text-slate-500 font-mono text-[10px]">SENTINEL-1 SAR PASS</span>
            </div>
            <LeafletMapView
              activeScenario={activeScenario}
              vessels={vessels}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
              onAlertCoastGuard={() => {
                setTargetVesselForReport(null);
                setShowCoastGuardModal(true);
              }}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-rose-400 font-semibold tracking-wider uppercase">
                SUSPECT VESSELS RANKED ({vessels.length})
              </span>
              <span className="text-slate-500 font-mono text-[10px]">SORTED BY BAYESIAN RISK</span>
            </div>

            <div className="space-y-2.5 max-h-[580px] lg:max-h-[650px] overflow-y-auto pr-1 font-mono">
              {vessels.map((vessel, idx) => (
                <div
                  key={vessel.mmsi}
                  onClick={() => setSelectedVessel(vessel)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedVessel && selectedVessel.mmsi === vessel.mmsi
                      ? "bg-[#0c1828] border-cyan-400 shadow-cyan-glow border-l-4 border-l-cyan-400"
                      : "bg-[#070c14]/92 border-white/10 hover:border-white/25 hover:bg-[#070c14]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs tracking-wider">
                      #{idx + 1} {vessel.name}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        vessel.riskScore > 85
                          ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                          : vessel.riskScore > 60
                          ? "bg-amber-950/60 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {vessel.riskScore}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                    <span>MMSI: {vessel.mmsi} · {vessel.flag}</span>
                    <span className="text-slate-300 font-semibold">DIST: {vessel.proximityNM} NM</span>
                  </div>

                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        vessel.riskScore > 85 ? "bg-rose-500" : vessel.riskScore > 60 ? "bg-cyan-400" : "bg-slate-500"
                      }`}
                      style={{ width: `${vessel.riskScore}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {vessel.warningTags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[8.5px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/5 text-[10px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVessel(vessel);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors uppercase font-semibold"
                    >
                      KINEMATICS →
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetVesselForReport(vessel);
                        setShowCoastGuardModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold uppercase transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                      <span>ALERT CG</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#070c14]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl">
          <div className="border-b border-white/10 pb-4 mb-5">
            <span className="font-mono text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase block">
              3D CORRELATION MATRIX & BAYESIAN ATTRIBUTION BREAKDOWN
            </span>
            <p className="font-sans text-xs text-slate-400 mt-0.5 font-light">
              Radial orbital distance indicates inverse liability confidence; right panel decomposes multi-variable physical evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8">
              <ThreeCorrelationScene
                vessels={vessels}
                activeScenario={activeScenario}
                selectedVessel={selectedVessel}
                onSelectVessel={setSelectedVessel}
              />
            </div>

            <div className="lg:col-span-5 xl:col-span-4 bg-[#050810]/95 border border-white/10 rounded-2xl p-5 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  PHYSICAL EVIDENCE CONCORDANCE
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {metrics.attributionConfidence}% VERDICT
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                    <span>1. LAGRANGIAN DRIFT CONCORDANCE</span>
                    <span className="text-cyan-400 font-bold">96.5%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: "96.5%" }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Runge-Kutta 4th order 1/12° ocean currents</span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                    <span>2. AIS BLACKOUT INTERCEPT CORRIDOR</span>
                    <span className="text-emerald-400 font-bold">98.2%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "98.2%" }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-0.5">0.82 NM corridor spatial proximity offset</span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                    <span>3. KINEMATIC SPEED DROP DELTA</span>
                    <span className="text-amber-400 font-bold">91.0%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "91.0%" }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Deceleration from 14.2 kts to 8.1 kts in void</span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                    <span>4. HISTORICAL VOYAGE VIOLATION INDEX</span>
                    <span className="text-rose-400 font-bold">89.4%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: "89.4%" }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Cross-referenced port state inspection record</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">
                  JUDICIAL LEGAL STATUS
                </span>
                <span className="text-xs font-bold text-white block">
                  MEETS MARPOL ANNEX I BURDEN OF PROOF
                </span>
                <p className="text-[9.5px] text-slate-400 font-sans leading-tight">
                  Cryptographically sealed evidentiary docket ready for immediate presentation to maritime tribunal and Coast Guard command.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setShowCaseFile(true)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold uppercase transition-all cursor-pointer text-center shadow-cyan-glow"
                >
                  VIEW MARPOL DOSSIER
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="w-full border-t border-white/10 bg-[#04070d] py-4 px-6 sm:px-8 lg:px-12 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-400">
        <div className="flex items-center gap-3">
          <a
            href="index.html"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "index.html";
            }}
            className="font-bold text-white hover:text-cyan-400 transition-colors tracking-widest cursor-pointer"
            title="Return to Landing Page"
          >
            V.A.R.U.N.A
          </a>
          <span>·</span>
          <span>MARITIME FORENSIC ATTRIBUTION</span>
          <span>·</span>
          <span>{timeString}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-cyan-400">LAT: {latInput}°N  LON: {lngInput}°E</span>
        </div>
      </footer>

      <VesselDetailModal
        vessel={selectedVessel}
        onClose={() => setSelectedVessel(null)}
        onReportCoastGuard={(v) => {
          setTargetVesselForReport(v);
          setShowCoastGuardModal(true);
        }}
      />

      <CaseFileModal
        isOpen={showCaseFile}
        onClose={() => setShowCaseFile(false)}
        scenario={activeScenario}
        vessels={vessels}
        metrics={metrics}
      />

      <CoastGuardModal
        isOpen={showCoastGuardModal}
        onClose={() => setShowCoastGuardModal(false)}
        scenario={activeScenario}
        vessels={vessels}
        metrics={metrics}
        targetVessel={targetVesselForReport}
        lastDispatch={coastGuardDispatch}
        onDispatchSuccess={(res) => {
          setCoastGuardDispatch(res);
        }}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<DashboardApp />);
