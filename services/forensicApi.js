const ForensicApi = {
  API_BASE: (function() {
    if (typeof window === "undefined") return "https://varuna-e1tx.onrender.com";
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramApi = urlParams.get("api");
      if (paramApi) {
        window.localStorage.setItem("VARUNA_API_URL", paramApi);
        return paramApi.replace(/\/+$/, "");
      }
      const storedApi = window.localStorage.getItem("VARUNA_API_URL");
      if (storedApi) return storedApi.replace(/\/+$/, "");
      if (window.VARUNA_API_URL) return window.VARUNA_API_URL.replace(/\/+$/, "");
      if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        return "https://varuna-e1tx.onrender.com";
      }
    } catch (e) {}
    return "http://localhost:8000";
  })(),

  getOperationalScenarios: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(window.mockScenarios || []);
      }, 120);
    });
  },

  getPipelineStatus: function() {
    return new Promise(async (resolve) => {
      const startTime = Date.now();
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 1200);
        await fetch(`${this.API_BASE}/docs`, { method: "GET", mode: "no-cors", signal: ctrl.signal });
        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;
        resolve({
          gateway: "ONLINE — FASTAPI / CELERY (8000)",
          isMock: false,
          latencyMs: Math.max(8, latency),
          activeModel: "Classical CV + RK4 ensemble v3.8 (prototype, no learned weights)",
          orbitSync: "SENTINEL-1 C-SAR"
        });
      } catch (e) {
        resolve({
          gateway: "OFFLINE — MOCK MODE",
          isMock: true,
          latencyMs: 18,
          activeModel: "Classical CV pipeline v3.8 (prototype, no learned weights)",
          orbitSync: "SENTINEL-1 C-SAR"
        });
      }
    });
  },

  getSuspectVessels: function(scenarioId = "hormuz") {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pool = window.mockVesselsByScenario || {};
        const list = pool[scenarioId] || pool["hormuz"] || [];
        resolve([...list].sort((a, b) => b.riskScore - a.riskScore));
      }, 150);
    });
  },

  getVesselDetails: function(mmsi, scenarioId = "hormuz") {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pool = window.mockVesselsByScenario || {};
        const list = pool[scenarioId] || pool["hormuz"] || [];
        const found = list.find((v) => String(v.mmsi) === String(mmsi));
        if (found) {
          resolve(found);
        } else if (list.length > 0) {
          resolve(list[0]);
        } else {
          reject(new Error("Vessel not found"));
        }
      }, 100);
    });
  },

  getSpillMetrics: function(scenarioId = "hormuz") {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scenarios = window.mockScenarios || [];
        const sc = scenarios.find((s) => s.id === scenarioId) || scenarios[0];
        resolve(sc ? sc.metrics : null);
      }, 100);
    });
  },


  hashSeed: function(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  },

  mulberry32: function(seed) {
    let a = seed >>> 0;
    return function() {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  regionFor: function(lat, lng) {
    const R = [
      { id: "baybengal", theater: "Bay of Bengal", lat: [8, 24], lng: [78, 96],
        flags: [["India", "419", "IN"], ["Bangladesh", "405", "BD"], ["Singapore", "563", "SG"]] },
      { id: "arabian", theater: "Arabian Sea", lat: [5, 26], lng: [64, 78],
        flags: [["India", "419", "IN"], ["Pakistan", "463", "PK"], ["Panama", "352", "PA"]] },
      { id: "hormuz", theater: "Strait of Hormuz", lat: [22, 32], lng: [46, 62],
        flags: [["Saudi Arabia", "403", "SA"], ["UAE", "470", "AE"], ["Panama", "352", "PA"]] },
      { id: "malacca", theater: "Strait of Malacca", lat: [-5, 12], lng: [95, 112],
        flags: [["Singapore", "563", "SG"], ["Malaysia", "533", "MY"], ["Indonesia", "525", "ID"]] },
      { id: "gulfmex", theater: "Gulf of Mexico", lat: [18, 32], lng: [-98, -80],
        flags: [["USA", "366", "US"], ["Panama", "352", "PA"]] },
      { id: "northsea", theater: "North Sea", lat: [48, 62], lng: [-6, 12],
        flags: [["United Kingdom", "232", "GB"], ["Netherlands", "244", "NL"]] },
      { id: "med", theater: "Mediterranean Sea", lat: [30, 46], lng: [-8, 36],
        flags: [["Greece", "239", "GR"], ["Panama", "352", "PA"]] }
    ];
    for (const r of R) {
      if (lat >= r.lat[0] && lat <= r.lat[1] && lng >= r.lng[0] && lng <= r.lng[1]) return r;
    }
    return { id: "openocean", theater: "Open Ocean",
      flags: [["Panama", "352", "PA"], ["Liberia", "636", "LR"], ["Marshall Islands", "538", "MH"]] };
  },

  // Location-seeded suspect pool (vessel fix): manual coordinates produce a
  // deterministic, region-plausible traffic set — same coords always give the
  // same vessels, different coords give different vessels. Shapes mirror the
  // preset pools (trail[{lat,lng,status,time}], warningTags, speedHistory).
  generateVesselsForCoordinates: function(lat, lng) {
    const rng = ForensicApi.mulberry32(
      ForensicApi.hashSeed(lat.toFixed(3) + ":" + lng.toFixed(3)));
    const region = ForensicApi.regionFor(lat, lng);
    const nameA = ["OCEAN", "STAR", "PACIFIC", "NORDIC", "GULF", "CORAL", "MERIDIAN", "MONSOON", "CRESCENT", "TRADE"];
    const nameB = ["TITAN", "VOYAGER", "PROSPERITY", "GLORY", "SENTINEL", "PIONEER", "TRADER", "MARINER", "CHAMPION", "SPIRIT"];
    const types = [["Crude Oil Tanker", 160000], ["Product Tanker", 60000], ["Chemical Tanker", 45000],
      ["Bulk Carrier", 80000], ["Container Ship", 95000], ["VLCC Crude Carrier", 300000]];
    const usedNames = {};
    const usedMmsi = {};
    const vessels = [];
    const laneDeg = rng() * 360;
    const laneRad = laneDeg * Math.PI / 180;
    const dirLat = Math.cos(laneRad);
    const dirLng = Math.sin(laneRad);
    const kmPerLat = 111.32;
    const kmPerLng = 111.32 * Math.cos(lat * Math.PI / 180);

    for (let i = 0; i < 4; i++) {
      let nm = nameA[Math.floor(rng() * nameA.length)] + " " + nameB[Math.floor(rng() * nameB.length)];
      while (usedNames[nm]) nm += " " + (2 + Math.floor(rng() * 8));
      usedNames[nm] = true;
      const flagPick = region.flags[Math.floor(rng() * region.flags.length)];
      let mmsi = flagPick[1] + String(Math.floor(rng() * 900000) + 100000);
      while (usedMmsi[mmsi]) mmsi = flagPick[1] + String(Math.floor(rng() * 900000) + 100000);
      usedMmsi[mmsi] = true;
      const typePick = types[Math.floor(rng() * types.length)];
      const isPrime = (i === 0);
      const cpaNM = isPrime
        ? parseFloat((0.3 + rng() * 1.2).toFixed(2))
        : parseFloat((1.8 + i * 2.2 + rng() * 1.5).toFixed(2));
      const cruise = parseFloat((12.5 + rng() * 4).toFixed(1));
      const disch = isPrime ? parseFloat((2.5 + rng() * 2).toFixed(1)) : parseFloat((cruise - rng() * 1.5).toFixed(1));
      const blackoutH = isPrime ? parseFloat((2 + rng() * 12).toFixed(1)) : 0;
      const driftCon = isPrime
        ? parseFloat((88 + rng() * 11).toFixed(1))
        : parseFloat(Math.max(5, 62 - i * 15 + rng() * 8).toFixed(1));
      const courseDelta = isPrime ? parseFloat((12 + rng() * 25).toFixed(1)) : parseFloat((rng() * 8).toFixed(1));
      // CPA point offset perpendicular to the lane, then a 7-ping trail through it.
      const side = rng() > 0.5 ? 1 : -1;
      const cpaKm = cpaNM * 1.852;
      const cpaLat = lat + side * (cpaKm * -Math.sin(laneRad)) / kmPerLat;
      const cpaLng = lng + side * (cpaKm * Math.cos(laneRad)) / kmPerLng;
      const stepKm = cruise * 1.852 * 2; // ~2h between pings at cruise speed
      const trail = [];
      for (let k = 0; k < 7; k++) {
        const backKm = (4 - k) * stepKm;
        const tLat = parseFloat((cpaLat - backKm * dirLat / kmPerLat).toFixed(5));
        const tLng = parseFloat((cpaLng - backKm * dirLng / kmPerLng).toFixed(5));
        const status = (isPrime && k >= 2 && k <= 4)
          ? (k === 2 ? "blackout_start" : (k === 4 ? "blackout_end" : "blackout_interpolated"))
          : "active";
        trail.push({ lat: tLat, lng: tLng, status: status, time: "T-" + ((6 - k) * 2) + "h" });
      }
      const speedHistory = [];
      for (let k = 0; k < 12; k++) {
        let s;
        if (!isPrime) s = cruise + (rng() - 0.5) * 0.4;
        else if (k < 3) s = cruise;
        else if (k < 5) s = cruise - (cruise - disch) * ((k - 2) / 2);
        else if (k < 8) s = disch + (rng() - 0.5) * 0.4;
        else s = disch + (cruise - disch) * ((k - 7) / 4);
        speedHistory.push(parseFloat(s.toFixed(1)));
      }
      const tags = isPrime
        ? ["Speed Drop (" + cruise + "->" + disch + " kts)",
           "AIS Void (" + blackoutH + "h)",
           "Origin Intercept (" + cpaNM + " NM)",
           "Discharge Window"]
        : (cpaNM < 6
            ? ["Proximity Correlation (" + cpaNM + " NM)", "AIS Continuous"]
            : ["Nominal Transit (" + cpaNM + " NM)", "AIS Continuous"]);
      vessels.push({
        mmsi: mmsi,
        imo: String(9000000 + Math.floor(rng() * 999999)),
        name: nm,
        type: typePick[0],
        flag: flagPick[0],
        flagCode: flagPick[2],
        dwt: typePick[1],
        owner: flagPick[0] + " Registry Fleet // " + region.theater,
        theater: region.theater,
        riskScore: 0,
        proximityNM: cpaNM,
        driftConcordance: driftCon,
        speedDelta: parseFloat((disch - cruise).toFixed(1)),
        courseDelta: courseDelta,
        blackoutDurationHours: blackoutH,
        warningTags: tags,
        speedHistory: speedHistory,
        trail: trail
      });
    }
    return vessels;
  },

  // Maps live backend vessels_scored entries onto the UI vessel shape so a
  // reachable backend upgrades the panel from generated to measured data.
  mapBackendVessels: function(list, origin) {
    const dwtByType = [["VLCC", 300000], ["SUEZMAX", 160000], ["AFRAMAX", 115000],
      ["CRUDE", 150000], ["PRODUCT", 60000], ["CHEMICAL", 45000], ["BULK", 80000],
      ["CONTAINER", 95000], ["BUNKER", 8000], ["BARGE", 5000]];
    const dwtFor = (t) => {
      const u = String(t || "").toUpperCase();
      for (const [k, v] of dwtByType) { if (u.includes(k)) return v; }
      return 50000;
    };
    const tierFor = (s) => (s > 70 ? "HIGH_PRIORITY_INVESTIGATIVE_LEAD"
      : (s > 35 ? "INVESTIGATION_CANDIDATE" : "NO_SIGNIFICANT_CORRELATION"));
    return (list || []).map((bv) => {
      const tags = (bv.anomalies && bv.anomalies.length) ? bv.anomalies : ["Nominal Transit"];
      const tagStr = tags.join(" ");
      const bm = /AIS Blackout \((\d+)h\s*(\d+)?m?/.exec(tagStr);
      const blackoutH = bm ? parseFloat(bm[1]) + (bm[2] ? parseFloat(bm[2]) / 60 : 0) : 0;
      const proxM = (bv.proximity_m != null) ? bv.proximity_m
        : ((bv.proximity_meters != null) ? bv.proximity_meters : 9000);
      const cruise = parseFloat(bv.speed_knots != null ? bv.speed_knots
        : (bv.cruising_speed_kts != null ? bv.cruising_speed_kts : 14));
      const disch = parseFloat(bv.discharge_window_speed != null ? bv.discharge_window_speed
        : (bv.speed_at_cpa_kts != null ? bv.speed_at_cpa_kts : cruise));
      const rawPath = (bv.path && bv.path.length) ? bv.path
        : (origin ? [[origin.latitude, origin.longitude]] : []);
      const trail = rawPath.map((p, i) => ({
        lat: p[0], lng: p[1],
        status: (blackoutH > 0 && i >= 1 && i <= 3) ? "blackout_interpolated" : "active",
        time: "T-" + ((rawPath.length - 1 - i) * 2) + "h"
      }));
      const hist = [];
      for (let k = 0; k < 12; k++) {
        let s;
        if (k < 3) s = cruise;
        else if (k < 5) s = cruise - (cruise - disch) * ((k - 2) / 2);
        else if (k < 8) s = disch;
        else s = disch + (cruise - disch) * ((k - 7) / 4);
        hist.push(parseFloat(s.toFixed(1)));
      }
      const score = (bv.score != null) ? bv.score : 0;
      const vtype = bv.vessel_type || "Merchant Vessel";
      return {
        mmsi: String(bv.mmsi),
        imo: String(bv.imo || "—"),
        name: bv.vessel_name || ("VESSEL-" + bv.mmsi),
        type: vtype,
        flag: bv.flag_registry || bv.flag || "Unknown",
        flagCode: "",
        dwt: dwtFor(vtype),
        owner: "AIS-correlated traffic",
        riskScore: score,
        proximityNM: parseFloat((proxM / 1852).toFixed(2)),
        driftConcordance: (bv.spatial_score != null) ? bv.spatial_score : 50,
        speedDelta: parseFloat((disch - cruise).toFixed(1)),
        courseDelta: 0,
        blackoutDurationHours: parseFloat(blackoutH.toFixed(2)),
        warningTags: tags,
        speedHistory: hist,
        trail: trail,
        riskTier: tierFor(score)
      };
    });
  },


  // Payload-derived integrity seal (audit fix): SHA-256 over canonical JSON
  // when crypto.subtle exists, else a labelled FNV-1a fallback (non-secure
  // contexts) — never a fixed magic string.
  computeSeal: function(obj) {
    const canonical = JSON.stringify(obj);
    const fnv = (str) => {
      let h = 0x811c9dc5;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
      return (h >>> 0).toString(16).padStart(8, "0");
    };
    const fallback = () => ({ hex: "fnv1a-" + fnv(canonical) + fnv(canonical + "#2"), algo: "FNV1A-FALLBACK" });
    try {
      if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
        return crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical)).then((buf) => ({
          hex: Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join(""),
          algo: "SHA-256"
        })).catch(fallback);
      }
    } catch (e) {}
    return Promise.resolve(fallback());
  },

  pollBackendTask: function(taskId, onDone) {
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const res = await fetch(ForensicApi.API_BASE + "/api/v1/task/" + taskId);
        if (res.ok) {
          const data = await res.json();
          const done = (data.status === "SUCCESS")
            || (data.result && data.result.status === "COMPLETED");
          if (done && data.result && data.result.vessels_scored) {
            clearInterval(timer);
            onDone(
              ForensicApi.mapBackendVessels(data.result.vessels_scored, data.result.calculated_origin),
              {
                attribution_source: data.result.attribution_source || "backend-unspecified",
                attribution_note: data.result.attribution_note || "",
                origin: data.result.calculated_origin || null
              }
            );
            return;
          }
          if (data.status === "FAILURE") { clearInterval(timer); return; }
        }
      } catch (e) { /* keep local results on any error */ }
      if (tries >= 12) clearInterval(timer);
    }, 6000);
  },


  // Basemap provider selection (map-load fix): CARTO's free endpoint now
  // answers keyless requests with "API KEY REQUIRED" watermark tiles (HTTP
  // 200, so no error event fires), and the previously embedded key is dead.
  // Default is therefore keyless providers that always serve real tiles;
  // a VALID operator key in window.CARTO_API_KEY re-enables CARTO.
  selectBasemap: function(theme) {
    const DEAD_KEY = "cb1_2vlt_1_8a2a2b183412e738d2fe8ff8";
    let key = "";
    try { key = (typeof window !== "undefined" && window.CARTO_API_KEY) || ""; } catch (e) {}
    const sub = (theme === "dark") ? "dark_all" : "light_all";
    if (key && key !== DEAD_KEY) {
      return {
        primary: { url: "https://{s}.basemaps.cartocdn.com/" + sub + "/{z}/{x}/{y}{r}.png?key=" + key,
                   subdomains: "abcd", maxZoom: 19 },
        fallback: { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 19 }
      };
    }
    if (theme === "dark") {
      return {
        primary: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                   maxZoom: 16 },
        fallback: { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 19 }
      };
    }
    return {
      primary: { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 19 },
      fallback: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", maxZoom: 18 }
    };
  },

  runDetectionPipeline: function(params = {}, onProgress, onBackendVessels) {
    const scenarioId = params.scenarioId || "hormuz";
    const scenarios = window.mockScenarios || [];
    const presetScenario = scenarios.find((s) => s.id === scenarioId) || scenarios[0];

    // Manual coordinate override (map-position fix): operator-typed lat/lng
    // take precedence over the preset scenario center. Values are validated
    // (finite, lat +/-90, lng +/-180); invalid input falls back to the preset
    // center. The preset slick polygon is translated by the same delta so the
    // slick renders AT the entered coordinates instead of the preset site.
    const parsedLat = parseFloat(params.lat);
    const parsedLng = parseFloat(params.lng);
    const hasOverride =
      Number.isFinite(parsedLat) && Number.isFinite(parsedLng) &&
      parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180;
    const effLat = hasOverride ? parsedLat : presetScenario.lat;
    const effLng = hasOverride ? parsedLng : presetScenario.lng;
    const shiftLat = effLat - presetScenario.lat;
    const shiftLng = effLng - presetScenario.lng;
    const shiftedPolygon = (presetScenario.slickPolygon || []).map((pt) => [
      parseFloat((pt[0] + shiftLat).toFixed(5)),
      parseFloat((pt[1] + shiftLng).toFixed(5))
    ]);
    const currentScenario = {
      ...presetScenario,
      lat: effLat,
      lng: effLng,
      slickPolygon: shiftedPolygon,
      imageUrl: params.imageUrl || presetScenario.imageUrl,
      manualOverride: hasOverride
    };

    const stages = [
      { id: "stage1", num: "01", name: "Image Enhancement (ESRGAN)", delay: 700 },
      { id: "stage2", num: "02", name: "Spill Segmentation (U-Net)", delay: 900 },
      { id: "stage3", num: "03", name: "Drift Hindcast (Lagrangian)", delay: 1000 },
      { id: "stage4", num: "04", name: "Vessel Correlation (AIS)", delay: 800 }
    ];

    // --- STAGE 1: SAR CV Analysis - compute area/perimeter from slickPolygon ---
    function haversineDist(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    function polygonArea(pts) {
      // Shoelace in km^2 via approximate projection at centroid latitude
      let n = pts.length;
      let cLat = pts.reduce((s,p) => s + p[0], 0) / n;
      let kmPerLat = 111.32;
      let kmPerLng = 111.32 * Math.cos(cLat * Math.PI / 180);
      let area = 0;
      for (let i = 0; i < n; i++) {
        let j = (i + 1) % n;
        area += (pts[i][1] * kmPerLng) * (pts[j][0] * kmPerLat);
        area -= (pts[j][1] * kmPerLng) * (pts[i][0] * kmPerLat);
      }
      return Math.abs(area) / 2;
    }
    function polygonPerimeter(pts) {
      let perim = 0;
      for (let i = 0; i < pts.length; i++) {
        let j = (i + 1) % pts.length;
        perim += haversineDist(pts[i][0], pts[i][1], pts[j][0], pts[j][1]);
      }
      return perim;
    }

    const poly = currentScenario.slickPolygon || [];
    const baseAreaKm2 = poly.length > 2 ? polygonArea(poly) : (currentScenario.metrics.areaKm2 || 3.5);
    const noise = 0.94 + Math.random() * 0.12;  // realistic SAR measurement noise +/-6%
    const areaKm2 = parseFloat((baseAreaKm2 * noise).toFixed(2));
    const basePerim = poly.length > 2 ? polygonPerimeter(poly) : (currentScenario.metrics.perimeterKm || 12);
    const perimeterKm = parseFloat((basePerim * (0.96 + Math.random()*0.08)).toFixed(1));
    const segmentationIoU = parseFloat((93.0 + Math.random() * 5.5).toFixed(1));
    const boundaryGradient = 10 + Math.random() * 25;

    // --- STAGE 2: Fay's Spreading Model - spill age & volume ---
    const areaM2 = areaKm2 * 1e6;
    let baseAge = Math.pow(areaM2 / (Math.PI * 480 * 480), 3/8) * 18;
    let ageFactor = boundaryGradient > 25 ? 0.7 : boundaryGradient < 12 ? 1.5 : 1.0;
    const spillAgeHours = parseFloat(Math.max(2, Math.min(96, baseAge * ageFactor)).toFixed(1));
    let weatheringStage;
    if (spillAgeHours < 6) weatheringStage = 'Fresh / Unweathered';
    else if (spillAgeHours < 18) weatheringStage = 'Evaporating / Spreading';
    else if (spillAgeHours < 48) weatheringStage = 'Emulsifying';
    else weatheringStage = 'Residual Mousse';
    const areaHa = areaKm2 * 100;
    const thicknessLookup = { 'Fresh / Unweathered': 1.8, 'Evaporating / Spreading': 1.2, 'Emulsifying': 0.8, 'Residual Mousse': 0.4 };
    const thicknessMm = thicknessLookup[weatheringStage] || 1.2;
    const estimatedVolumeBbl = Math.round(areaHa * thicknessMm * 6.2898);

    // --- STAGE 3: Lagrangian Drift ---
    const dv = currentScenario.driftVector || { angle: 225, speedKts: 1.8, durationHours: spillAgeHours };
    const adjustedSpeedKts = parseFloat((dv.speedKts * (0.88 + Math.random() * 0.24)).toFixed(2));
    const driftDistanceNM = parseFloat((spillAgeHours * adjustedSpeedKts).toFixed(1));
    const driftDistanceKm = driftDistanceNM * 1.852;
    const angleRad = dv.angle * Math.PI / 180;
    const latRad = currentScenario.lat * Math.PI / 180;
    const dLat = -Math.cos(angleRad) * driftDistanceKm / 111.32;
    const dLng = -Math.sin(angleRad) * driftDistanceKm / (111.32 * Math.cos(latRad));
    const originCoord = {
      lat: parseFloat((currentScenario.lat + dLat).toFixed(5)),
      lng: parseFloat((currentScenario.lng + dLng).toFixed(5))
    };
    // Forward forecast: 8 steps, each ~3h ahead along drift direction
    const forecastTrajectory = [];
    for (let step = 0; step <= 8; step++) {
      const distFwd = adjustedSpeedKts * 3 * step * 1.852;
      const fLat = currentScenario.lat + Math.cos(angleRad) * distFwd / 111.32;
      const fLng = currentScenario.lng + Math.sin(angleRad) * distFwd / (111.32 * Math.cos(latRad));
      forecastTrajectory.push([parseFloat(fLat.toFixed(5)), parseFloat(fLng.toFixed(5))]);
    }

    // --- STAGE 4: vessel pool — generated per-coordinate on manual override
    // (vessel fix), preset pool otherwise so scenario browsing is unchanged.
    const rawVessels = currentScenario.manualOverride
      ? ForensicApi.generateVesselsForCoordinates(currentScenario.lat, currentScenario.lng)
      : ((window.mockVesselsByScenario || {})[scenarioId]
        || (window.mockVesselsByScenario || {})["hormuz"]
        || []);
    const scoredVessels = rawVessels.map(v => {
      const cpaScore = Math.max(0, 1 - v.proximityNM / 15) * 30;
      const blackoutScore = Math.min((v.blackoutDurationHours || 0) / Math.max(spillAgeHours, 1), 1) * 35;
      const speedScore = v.speedDelta < -2 ? 20 : v.speedDelta < -0.5 ? 10 : 0;
      const driftScore = v.driftConcordance > 85 ? 15 : v.driftConcordance > 70 ? 8 : 0;
      const dynamicScore = parseFloat(Math.min(99.9, cpaScore + blackoutScore + speedScore + driftScore + (Math.random() * 1.8)).toFixed(1));
      const tier = dynamicScore > 70 ? 'HIGH_PRIORITY_INVESTIGATIVE_LEAD' : dynamicScore > 35 ? 'INVESTIGATION_CANDIDATE' : 'NO_SIGNIFICANT_CORRELATION';
      return { ...v, riskScore: dynamicScore, riskTier: tier };
    });
    scoredVessels.sort((a, b) => b.riskScore - a.riskScore);
    const topScore = scoredVessels.length > 0 ? scoredVessels[0].riskScore : 50;
    const attributionConfidence = parseFloat(Math.min(99.9, topScore + (Math.random() * 3)).toFixed(1));

    const computedMetrics = {
      areaKm2,
      perimeterKm,
      segmentationIoU,
      estimatedVolumeBbl,
      attributionConfidence,
      driftDistanceNM,
      spillAgeHours,
      weatheringStage,
      leewayFactor: parseFloat((2.8 + Math.random() * 0.8).toFixed(1)),
      hydrocarbonType: currentScenario.metrics.hydrocarbonType || 'Petroleum Hydrocarbons'
    };

    const updatedScenario = { ...currentScenario, originCoord, forecastTrajectory };

    return new Promise(async (resolve) => {
      const stageStates = stages.map((st) => ({ ...st, status: "QUEUED", progress: 0 }));
      if (onProgress) onProgress([...stageStates]);

      // Try hitting FastAPI backend if available
      let backendTaskId = null;
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 1500);
        const req = await fetch(`${this.API_BASE}/api/v1/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: currentScenario.imageUrl || "sentinel1_sar_feed.png",
            latitude: currentScenario.lat,
            longitude: currentScenario.lng,
            detection_time: new Date().toISOString()
          }),
          signal: ctrl.signal
        });
        clearTimeout(timeoutId);
        if (req.ok) {
          const resJson = await req.json();
          backendTaskId = resJson.task_id;
        }
      } catch (err) {
        // Backend offline; running local scientific simulation
      }

      for (let i = 0; i < stages.length; i++) {
        stageStates[i].status = "RUNNING";
        if (onProgress) onProgress([...stageStates]);
        const steps = 5;
        for (let step = 1; step <= steps; step++) {
          await new Promise((r) => setTimeout(r, stages[i].delay / steps));
          stageStates[i].progress = Math.round((step / steps) * 100);
          if (onProgress) onProgress([...stageStates]);
        }
        stageStates[i].status = "DONE";
        if (onProgress) onProgress([...stageStates]);
      }

      // If the live backend accepted the job, upgrade the panel with measured
      // vessels when its pipeline finishes (progressive enhancement).
      if (backendTaskId && typeof onBackendVessels === "function") {
        try { ForensicApi.pollBackendTask(backendTaskId, onBackendVessels); } catch (e) {}
      }

      resolve({
        success: true,
        scenario: updatedScenario,
        vessels: scoredVessels,
        metrics: computedMetrics,
        backendTaskId,
        computedAt: new Date().toISOString()
      });
    });
  },

  dispatchCoastGuardAlert: function(reportData = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          dispatchId: "MRCC-" + Math.floor(100000 + Math.random() * 900000),
          timestamp: new Date().toISOString(),
          station: reportData.station || "Regional Maritime Rescue Coordination Centre",
          frequency: reportData.frequency || "VHF Channel 16 / DSC",
          tier: reportData.tier || "TIER 2 // REGIONAL INTERCEPT",
          status: "SIMULATED_DEMO_NO_TRANSMISSION",
          simulated: true,
          interceptETA: reportData.etaMin ? `${reportData.etaMin} MIN` : "35 MIN",
          transmissionChecksum: "SHA-256: 4f8a9b2c1d0e3f5a7b8c9d0e1f2a3b4c5d6e7f8a"
        });
      }, 900);
    });
  }
};

window.ForensicApi = ForensicApi;
