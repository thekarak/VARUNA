const mockScenarios = [
  {
    id: "hormuz",
    name: "Strait of Hormuz // Fujairah Exit",
    region: "Persian Gulf & Gulf of Oman",
    lat: 24.6367,
    lng: 54.3292,
    zoom: 11,
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    originCoord: { lat: 24.3522, lng: 54.0386 },
    slickPolygon: [
      [24.648, 54.312],
      [24.662, 54.335],
      [24.655, 54.362],
      [24.631, 54.358],
      [24.618, 54.332],
      [24.629, 54.305]
    ],
    driftVector: { angle: 225, speedKts: 1.84, durationHours: 18.4 },
    primaryVesselMmsi: "538009214",
    metrics: {
      areaKm2: 4.82,
      perimeterKm: 14.6,
      driftDistanceNM: 18.4,
      segmentationIoU: 96.4,
      estimatedVolumeBbl: 320,
      leewayFactor: 3.1,
      attributionConfidence: 94.8,
      hydrocarbonType: "Heavy Crude Sludge / Bilge Residue"
    },
    coastGuardStations: [
      { id: "cg-uae", name: "UAE Coast Guard Command", base: "Abu Dhabi Naval Base", distanceNM: 18.2, channel: "VHF Ch 16 / 72", status: "ONLINE", phone: "+971 2 611 1111", etaMin: 35 },
      { id: "cg-oman", name: "Oman Maritime Security Centre (MSC)", base: "Muscat Operational HQ", distanceNM: 34.6, channel: "VHF Ch 16 / 68", status: "ONLINE", phone: "+968 24 322 000", etaMin: 50 },
      { id: "cg-marlo", name: "Bahrain MARLO / US 5th Fleet", base: "Manama Liaison Sector", distanceNM: 52.0, channel: "Inmarsat-C / DSC", status: "ONLINE", phone: "+973 17 854 000", etaMin: 75 }
    ]
  },
  {
    id: "malacca",
    name: "Malacca Strait Gateway",
    region: "Southeast Asia Bottleneck",
    lat: 2.2417,
    lng: 102.1394,
    zoom: 11,
    imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
    originCoord: { lat: 2.1145, lng: 102.012 },
    slickPolygon: [
      [2.254, 102.125],
      [2.268, 102.148],
      [2.251, 102.162],
      [2.232, 102.151],
      [2.224, 102.131],
      [2.238, 102.118]
    ],
    driftVector: { angle: 210, speedKts: 2.1, durationHours: 14.2 },
    primaryVesselMmsi: "636019842",
    metrics: {
      areaKm2: 3.94,
      perimeterKm: 12.8,
      driftDistanceNM: 15.2,
      segmentationIoU: 95.1,
      estimatedVolumeBbl: 260,
      leewayFactor: 3.4,
      attributionConfidence: 91.6,
      hydrocarbonType: "Medium Fuel Oil / Slops"
    },
    coastGuardStations: [
      { id: "cg-mmea", name: "Malaysian Maritime Enforcement Agency (MMEA)", base: "Port Klang Sector Command", distanceNM: 12.4, channel: "VHF Ch 16 / 68", status: "ONLINE", phone: "+60 3 8995 7000", etaMin: 25 },
      { id: "cg-mpa", name: "Singapore Maritime & Port Authority (MRCC)", base: "Tanjong Pagar POCC", distanceNM: 22.8, channel: "VHF Ch 16 / 12", status: "ONLINE", phone: "+65 6226 5539", etaMin: 40 },
      { id: "cg-bakamla", name: "Indonesian Coast Guard (BAKAMLA)", base: "Batam Regional Sector", distanceNM: 28.5, channel: "VHF Ch 16 / 70", status: "ONLINE", phone: "+62 21 500 000", etaMin: 55 }
    ]
  },
  {
    id: "northsea",
    name: "North Sea Brent Corridor",
    region: "North Atlantic Offshore",
    lat: 58.1708,
    lng: 1.7139,
    zoom: 10,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    originCoord: { lat: 58.021, lng: 1.542 },
    slickPolygon: [
      [58.188, 1.685],
      [58.201, 1.722],
      [58.182, 1.758],
      [58.156, 1.741],
      [58.148, 1.702],
      [58.169, 1.678]
    ],
    driftVector: { angle: 240, speedKts: 2.45, durationHours: 12.8 },
    primaryVesselMmsi: "257088120",
    metrics: {
      areaKm2: 6.12,
      perimeterKm: 18.2,
      driftDistanceNM: 21.6,
      segmentationIoU: 97.2,
      estimatedVolumeBbl: 410,
      leewayFactor: 2.9,
      attributionConfidence: 96.1,
      hydrocarbonType: "Condensate & Oily Sludge"
    },
    coastGuardStations: [
      { id: "cg-hmcg", name: "HM Coastguard (Aberdeen MRCC)", base: "Aberdeen Marine Operations", distanceNM: 42.1, channel: "VHF Ch 16 / 67", status: "ONLINE", phone: "+44 1224 592334", etaMin: 45 },
      { id: "cg-kust", name: "Royal Netherlands Coastguard (Kustwacht)", base: "Den Helder Command Center", distanceNM: 68.3, channel: "VHF Ch 16 / 23", status: "ONLINE", phone: "+31 223 542 300", etaMin: 70 },
      { id: "cg-norway", name: "Norwegian Joint Rescue Centre (JRCC)", base: "Stavanger Operations", distanceNM: 84.7, channel: "Inmarsat / DSC", status: "ONLINE", phone: "+47 51 51 70 00", etaMin: 90 }
    ]
  },
  {
    id: "mediterranean",
    name: "Crete South Basin",
    region: "Eastern Mediterranean",
    lat: 34.8694,
    lng: 25.6444,
    zoom: 11,
    imageUrl: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=800&q=80",
    originCoord: { lat: 34.712, lng: 25.483 },
    slickPolygon: [
      [34.882, 25.625],
      [34.896, 25.655],
      [34.881, 25.679],
      [34.858, 25.662],
      [34.851, 25.632],
      [34.867, 25.615]
    ],
    driftVector: { angle: 215, speedKts: 1.65, durationHours: 16.0 },
    primaryVesselMmsi: "371994000",
    metrics: {
      areaKm2: 3.25,
      perimeterKm: 11.4,
      driftDistanceNM: 13.8,
      segmentationIoU: 94.0,
      estimatedVolumeBbl: 210,
      leewayFactor: 3.2,
      attributionConfidence: 89.2,
      hydrocarbonType: "Heavy Bunker Bilge Flushing"
    },
    coastGuardStations: [
      { id: "cg-hellenic", name: "Hellenic Coast Guard (JRCC Piraeus)", base: "Heraklion Port Authority / Crete", distanceNM: 26.3, channel: "VHF Ch 16 / 19", status: "ONLINE", phone: "+30 210 411 2500", etaMin: 38 },
      { id: "cg-italy", name: "Italian Coast Guard (Guardia Costiera)", base: "Rome MRCC Command", distanceNM: 112.0, channel: "VHF Ch 16 / 70", status: "STANDBY", phone: "+39 06 5908 4527", etaMin: 110 },
      { id: "cg-emsa", name: "EMSA CleanSeaNet Operational Cell", base: "Lisbon Satellite Relay", distanceNM: 0, channel: "Satellite Uplink", status: "ONLINE", phone: "+351 21 1209 200", etaMin: 15 }
    ]
  }
];

const mockVesselsByScenario = {
  hormuz: [
    {
      mmsi: "538009214",
      imo: "9412896",
      name: "OCEAN TITAN",
      type: "VLCC Crude Oil Tanker",
      flag: "Marshall Islands",
      flagCode: "MH",
      dwt: 318000,
      owner: "Titan Shipping Overseas S.A.",
      riskScore: 94.8,
      proximityNM: 0.82,
      driftConcordance: 96.5,
      speedDelta: -4.2,
      courseDelta: 28.5,
      blackoutDurationHours: 14.8,
      warningTags: ["Speed Drop (-4.2 kts)", "AIS Void (14.8h)", "Trajectory Intercept", "Night Window"],
      speedHistory: [14.6, 14.4, 14.2, 11.5, 9.2, 8.1, 8.0, 8.4, 12.0, 13.8, 14.1, 14.3],
      trail: [
        { lat: 24.18, lng: 53.85, status: "active", time: "T-22h" },
        { lat: 24.26, lng: 53.94, status: "active", time: "T-20h" },
        { lat: 24.32, lng: 54.01, status: "blackout_start", time: "T-18.4h" },
        { lat: 24.35, lng: 54.04, status: "blackout_interpolated", time: "T-16h" },
        { lat: 24.42, lng: 54.12, status: "blackout_interpolated", time: "T-10h" },
        { lat: 24.52, lng: 54.22, status: "blackout_end", time: "T-4h" },
        { lat: 24.68, lng: 54.38, status: "active", time: "T-1h" },
        { lat: 24.78, lng: 54.49, status: "active", time: "T0" }
      ]
    },
    {
      mmsi: "636014421",
      imo: "9382104",
      name: "STAR PROSPERITY",
      type: "Chemical / Products Tanker",
      flag: "Liberia",
      flagCode: "LR",
      dwt: 51200,
      owner: "Star Maritime Corp.",
      riskScore: 82.4,
      proximityNM: 2.14,
      driftConcordance: 79.2,
      speedDelta: -1.8,
      courseDelta: 12.0,
      blackoutDurationHours: 6.2,
      warningTags: ["AIS Void (6.2h)", "Draft Anomaly"],
      speedHistory: [13.2, 13.1, 12.9, 11.4, 11.2, 11.6, 12.8, 13.0, 13.1, 13.2, 13.0, 13.1],
      trail: [
        { lat: 24.12, lng: 53.95, status: "active", time: "T-22h" },
        { lat: 24.28, lng: 54.09, status: "active", time: "T-18h" },
        { lat: 24.44, lng: 54.23, status: "active", time: "T-12h" },
        { lat: 24.58, lng: 54.35, status: "active", time: "T-6h" },
        { lat: 24.74, lng: 54.48, status: "active", time: "T0" }
      ]
    },
    {
      mmsi: "354189000",
      imo: "9615523",
      name: "PACIFIC VOYAGER",
      type: "Post-Panamax Container Ship",
      flag: "Panama",
      flagCode: "PA",
      dwt: 142000,
      owner: "Pacific Express Lines Inc.",
      riskScore: 68.7,
      proximityNM: 4.86,
      driftConcordance: 64.0,
      speedDelta: -0.4,
      courseDelta: 4.2,
      blackoutDurationHours: 0,
      warningTags: ["Course Deviation"],
      speedHistory: [19.2, 19.4, 19.1, 19.3, 19.0, 19.2, 19.1, 19.4, 19.2, 19.3, 19.2, 19.1],
      trail: [
        { lat: 24.08, lng: 53.82, status: "active", time: "T-22h" },
        { lat: 24.31, lng: 54.12, status: "active", time: "T-16h" },
        { lat: 24.54, lng: 54.42, status: "active", time: "T-8h" },
        { lat: 24.79, lng: 54.72, status: "active", time: "T0" }
      ]
    },
    {
      mmsi: "244670000",
      imo: "9287654",
      name: "NORDIC GLORY",
      type: "Capesize Bulk Carrier",
      flag: "Netherlands",
      flagCode: "NL",
      dwt: 178000,
      owner: "Nordic Bulk Carriers B.V.",
      riskScore: 38.2,
      proximityNM: 8.42,
      driftConcordance: 41.5,
      speedDelta: 0.2,
      courseDelta: 2.1,
      blackoutDurationHours: 0,
      warningTags: ["Nominal Passage"],
      speedHistory: [12.0, 12.1, 11.9, 12.0, 12.1, 12.0, 11.9, 12.1, 12.0, 12.0, 11.9, 12.1],
      trail: [
        { lat: 24.01, lng: 53.72, status: "active", time: "T-22h" },
        { lat: 24.25, lng: 54.02, status: "active", time: "T-16h" },
        { lat: 24.49, lng: 54.32, status: "active", time: "T-8h" },
        { lat: 24.72, lng: 54.62, status: "active", time: "T0" }
      ]
    }
  ],
  malacca: [
    {
      mmsi: "636019842",
      imo: "9451120",
      name: "ASIAN LEADER",
      type: "Aframax Crude Tanker",
      flag: "Liberia",
      flagCode: "LR",
      dwt: 115000,
      owner: "Asian Tanker Fleet Co.",
      riskScore: 91.6,
      proximityNM: 0.94,
      driftConcordance: 93.8,
      speedDelta: -3.8,
      courseDelta: 22.0,
      blackoutDurationHours: 11.4,
      warningTags: ["Speed Drop (-3.8 kts)", "AIS Void (11.4h)", "Trajectory Intercept"],
      speedHistory: [13.8, 13.5, 13.2, 10.1, 9.4, 9.6, 12.5, 13.4, 13.6, 13.8],
      trail: [
        { lat: 2.02, lng: 101.91, status: "active", time: "T-18h" },
        { lat: 2.08, lng: 101.98, status: "blackout_start", time: "T-14.2h" },
        { lat: 2.12, lng: 102.02, status: "blackout_interpolated", time: "T-10h" },
        { lat: 2.19, lng: 102.09, status: "blackout_end", time: "T-4h" },
        { lat: 2.29, lng: 102.19, status: "active", time: "T0" }
      ]
    },
    {
      mmsi: "563044100",
      imo: "9722001",
      name: "SINGAPORE PIONEER",
      type: "Ultra-Large Container Vessel",
      flag: "Singapore",
      flagCode: "SG",
      dwt: 210000,
      owner: "Lion City Line Pte.",
      riskScore: 71.4,
      proximityNM: 3.12,
      driftConcordance: 68.2,
      speedDelta: -0.8,
      courseDelta: 6.0,
      blackoutDurationHours: 0,
      warningTags: ["High Density Route"],
      speedHistory: [18.4, 18.2, 18.5, 18.3, 18.1, 18.4, 18.2, 18.3],
      trail: [
        { lat: 1.95, lng: 101.82, status: "active", time: "T-18h" },
        { lat: 2.15, lng: 102.04, status: "active", time: "T-10h" },
        { lat: 2.35, lng: 102.26, status: "active", time: "T0" }
      ]
    }
  ],
  northsea: [
    {
      mmsi: "257088120",
      imo: "9319800",
      name: "BERGEN EXPLORER",
      type: "Shuttle Tanker",
      flag: "Norway",
      flagCode: "NO",
      dwt: 126000,
      owner: "Bergen Offshore Lines AS",
      riskScore: 96.1,
      proximityNM: 0.65,
      driftConcordance: 97.4,
      speedDelta: -4.8,
      courseDelta: 34.0,
      blackoutDurationHours: 9.8,
      warningTags: ["Abrupt Speed Drop", "AIS Void (9.8h)", "Loitering Pattern", "Offshore Field Discharge"],
      speedHistory: [14.0, 13.8, 13.6, 9.0, 8.8, 8.5, 11.2, 13.4, 13.8, 14.0],
      trail: [
        { lat: 57.91, lng: 1.42, status: "active", time: "T-16h" },
        { lat: 58.01, lng: 1.52, status: "blackout_start", time: "T-12.8h" },
        { lat: 58.05, lng: 1.57, status: "blackout_interpolated", time: "T-8h" },
        { lat: 58.12, lng: 1.66, status: "blackout_end", time: "T-3h" },
        { lat: 58.22, lng: 1.78, status: "active", time: "T0" }
      ]
    }
  ],
  mediterranean: [
    {
      mmsi: "371994000",
      imo: "9234882",
      name: "AEGEAN PEARL",
      type: "Bulk Carrier",
      flag: "Panama",
      flagCode: "PA",
      dwt: 82000,
      owner: "Aegean Cargo Maritime",
      riskScore: 89.2,
      proximityNM: 1.15,
      driftConcordance: 88.5,
      speedDelta: -2.9,
      courseDelta: 18.2,
      blackoutDurationHours: 8.5,
      warningTags: ["AIS Void (8.5h)", "Speed Delta (-2.9 kts)", "Night Transit"],
      speedHistory: [12.8, 12.6, 12.5, 9.6, 9.5, 11.0, 12.4, 12.6, 12.7],
      trail: [
        { lat: 34.61, lng: 25.35, status: "active", time: "T-20h" },
        { lat: 34.69, lng: 25.45, status: "blackout_start", time: "T-16h" },
        { lat: 34.74, lng: 25.51, status: "blackout_interpolated", time: "T-10h" },
        { lat: 34.81, lng: 25.59, status: "blackout_end", time: "T-4h" },
        { lat: 34.92, lng: 25.71, status: "active", time: "T0" }
      ]
    }
  ]
};

const initialPipelineStages = [
  {
    id: "stage1",
    num: "01",
    name: "Image Enhancement",
    desc: "Sentinel-1 dual-pol speckle filtering & radiometric calibration",
    status: "DONE",
    durationMs: 750
  },
  {
    id: "stage2",
    num: "02",
    name: "Spill Segmentation",
    desc: "U-Net CNN boundary mask & multi-spectral polygon extraction",
    status: "DONE",
    durationMs: 950
  },
  {
    id: "stage3",
    num: "03",
    name: "Drift Hindcast",
    desc: "Runge-Kutta 4th-order hydrodynamic reverse drift vector modeling",
    status: "DONE",
    durationMs: 1100
  },
  {
    id: "stage4",
    num: "04",
    name: "Vessel Correlation",
    desc: "S-AIS / T-AIS kinematic dead-reckoning & Bayesian liability ranking",
    status: "DONE",
    durationMs: 850
  }
];

window.mockScenarios = mockScenarios;
window.mockVesselsByScenario = mockVesselsByScenario;
window.initialPipelineStages = initialPipelineStages;
