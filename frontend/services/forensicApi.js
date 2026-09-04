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
      { id: "stage4", num: "04", name: "Vessel Correlation (PostGIS)", delay: 800 }
    ];

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
        // Backend offline or unreachable; will run local simulation stages
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

      const vessels = window.mockVesselsByScenario[scenarioId] || window.mockVesselsByScenario["hormuz"];
      resolve({
        success: true,
        scenario: currentScenario,
        vessels: vessels,
        metrics: currentScenario.metrics,
        backendTaskId: backendTaskId,
        timestamp: new Date().toISOString()
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
