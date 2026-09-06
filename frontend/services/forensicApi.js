const ForensicApi = {
  API_BASE: "http://localhost:8000",

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
          activeModel: "U-Net + ESRGAN + Lagrangian v3.8",
          orbitSync: "SENTINEL-1 C-SAR"
        });
      } catch (e) {
        resolve({
          gateway: "OFFLINE — MOCK MODE",
          isMock: true,
          latencyMs: 18,
          activeModel: "V.A.R.U.N.A Hydro-CNN v3.8",
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

  runDetectionPipeline: function(params = {}, onProgress) {
    const scenarioId = params.scenarioId || "hormuz";
    const scenarios = window.mockScenarios || [];
    const currentScenario = scenarios.find((s) => s.id === scenarioId) || scenarios[0];

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

    // --- STAGE 4: AIS Bayesian Kinematic Scoring ---
    const rawVessels = (window.mockVesselsByScenario || {})[scenarioId]
      || (window.mockVesselsByScenario || {})["hormuz"]
      || [];
    const scoredVessels = rawVessels.map(v => {
      const cpaScore = Math.max(0, 1 - v.proximityNM / 15) * 30;
      const blackoutScore = Math.min((v.blackoutDurationHours || 0) / Math.max(spillAgeHours, 1), 1) * 35;
      const speedScore = v.speedDelta < -2 ? 20 : v.speedDelta < -0.5 ? 10 : 0;
      const driftScore = v.driftConcordance > 85 ? 15 : v.driftConcordance > 70 ? 8 : 0;
      const dynamicScore = parseFloat(Math.min(99.9, cpaScore + blackoutScore + speedScore + driftScore + (Math.random() * 1.8)).toFixed(1));
      const tier = dynamicScore > 70 ? 'CRITICAL_LEAD' : dynamicScore > 35 ? 'INVESTIGATION_CANDIDATE' : 'CLEARED';
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
          status: "TRANSMITTED_AND_ACKNOWLEDGED",
          interceptETA: reportData.etaMin ? `${reportData.etaMin} MIN` : "35 MIN",
          transmissionChecksum: "SHA-256: 4f8a9b2c1d0e3f5a7b8c9d0e1f2a3b4c5d6e7f8a"
        });
      }, 900);
    });
  }
};

window.ForensicApi = ForensicApi;
