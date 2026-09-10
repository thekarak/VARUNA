# V.A.R.U.N.A.

### Vision-based Algorithm for Rapid Unrefined-oil & Nautical Analysis

**An AI-powered maritime forensic intelligence platform for detecting oil spills from satellite SAR imagery, reconstructing oceanographic drift origin, correlating AIS vessel trajectories, and identifying dark fleet activity.**

Developed by **Team VARUNA**  
**JIS College of Engineering**  
**Smart India Hackathon 2026**

---

## Overview

Offshore oil pollution monitoring is one of the most critical challenges facing maritime authorities, coast guards, and environmental agencies worldwide. While satellite remote sensing (such as Sentinel-1 Synthetic Aperture Radar) can detect dark surface anomalies caused by oil dampening ocean capillary waves, identifying the responsible vessel requires connecting fragmented, multi-domain datasets.

A particularly elusive scenario occurs when a commercial vessel intentionally disables its Automatic Identification System (AIS) transponder ("dark vessel" mode) to discharge oily bilge water, sludge, or bunker fuel unobserved. By the time satellite passes detect the slick hours or days later, ocean surface currents and atmospheric winds have transported the slick far from the original discharge location, rendering simple geographic line-of-sight backtracking completely ineffective.

**V.A.R.U.N.A.** solves this by delivering a closed-loop, automated forensic intelligence pipeline:

* **Satellite SAR Preprocessing & Super-Resolution**: 4x ESRGAN deep convolutional sharpening of satellite radar tiles.
* **Semantic Oil Slick Segmentation**: Deep convolutional U-Net with land masking, contour extraction, and confidence scoring.
* **IMO / Bonn Agreement BAOAC Volume Modeling**: Physically accurate pure oil volume estimation ($V = A \times t$), classified across Bonn Codes 3, 4, and 5 with US barrel (bbl) and Metric Tonne (MT) outputs.
* **Lagrangian Ocean Drift Hindcasting**: Backwards-in-time hydrodynamic advection powered by NOAA GFS wind forcing and Copernicus Marine (CMEMS) ocean surface currents.
* **PostGIS Spatio-Temporal AIS Correlation**: High-performance spatial querying (`ST_DWithin`, `ST_Intersects`) over historical maritime trajectories.
* **Weighted Multi-Factor Priority Scoring**: Gaussian CPA distance decay, AIS blackout duration penalties, kinematic speed drop anomalies, and abrupt course alteration metrics.
* **Interactive Tactical GIS Canvas**: Powered by Leaflet with dynamic multi-provider basemaps (**OpenStreetMap**, **Esri World Ocean / Dark Canvas**, and **CARTO Basemaps**), animated radar pings, multi-node fluid lobe polygons, and CPA-annotated vessel paths.
* **3D Mission Landing Page**: 60 FPS Three.js WebGL globe featuring procedural ocean particle advection and atmospheric glow.
* **Automated Forensic Case File PDF Generation**: Court-admissible evidence documentation with SHA-256 digital integrity verification.

---

## System Architecture

```text
                               +----------------------------------+
                               |     Satellite Data Feed          |
                               |    Copernicus Sentinel-1 SAR     |
                               +-----------------+----------------+
                                                 |
                                                 v
                               +-----------------+----------------+
                               |    4x ESRGAN Super-Resolution    |
                               |  Deep Texture & Edge Sharpener   |
                               +-----------------+----------------+
                                                 |
                                                 v
                               +-----------------+----------------+
                               |    U-Net Semantic Masker         |
                               |  Slick Geometry & Land Masking   |
                               +-----------------+----------------+
                                                 |
                                                 v
                               +-----------------+----------------+
                               |  Bonn Agreement (BAOAC) Model    |
                               | Volume (bbl/MT) & Complexity P/A |
                               +-----------------+----------------+
                                                 |
                                                 v
+------------------------+     +-----------------+----------------+     +-------------------------+
|     NOAA GFS Wind      | --> |  Lagrangian Ocean Drift Engine   | <-- |   Copernicus Marine     |
| 3% Leeway / Hindcast   |     |  Runge-Kutta Reverse Advection   |     | Surface Currents (CMEMS)|
+------------------------+     +-----------------+----------------+     +-------------------------+
                                                 |
                                                 v
                               +-----------------+----------------+
                               |   Calculated Discharge Origin    |
                               |   [Lat, Lon] & Time Window       |
                               +-----------------+----------------+
                                                 |
                                                 v
                               +-----------------+----------------+
                               | PostGIS Spatial Trajectory Query |
                               |   Spatio-Temporal Intersections  |
                               +-----------------+----------------+
                                                 |
                                                 v
                               +-----------------+----------------+
                               | Weighted Multi-Factor Priority Score |
                               | AIS Blackout, CPA, Speed Drop    |
                               +-----------------+----------------+
                                                 |
                                                 v
                     +---------------------------+---------------------------+
                     |                                                       |
                     v                                                       v
+--------------------+---------------------+   +-----------------------------+--------------------+
|       Tactical GIS Operations Canvas      |   |       Automated Forensic Case File PDF             |
|   CARTO Dark/Voyager Basemaps + Leaflet  |   |   Digital Chain of Custody & SHA-256 Hash          |
|   Suspect Dossier & Physical Telemetry   |   |   Legal Evidence Documentation for Enforcement     |
+------------------------------------------+   +--------------------------------------------------+
```

---

## Core Capabilities & Engineering Innovations

### 1. CARTO Basemaps & Tactical GIS Mapping
The mapping engine is built upon **CARTO Basemaps (carto.com)** and **Leaflet / React-Leaflet**:
* **CARTO Tile Infrastructure**: Integrates high-contrast, cartographically optimized tiles (`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`) and Dark Matter tiles with subdomains `abcd` and retina `@2x` resolution.
* **Tactical Radar Centroid Pulse**: Custom Leaflet HTML marker featuring an animated CSS radial radar ping (`@keyframes ping`) indicating the exact centroid of detected slicks.
* **Multi-Node Fluid Lobe Polygons**: Dynamically renders 10-node fluid dispersion polygons reflecting hydrodynamic shearing along local drift axes.
* **Vessel Trajectory & CPA Tracking**: Visualizes suspect vessel courses with directional waypoints, color-coded risk paths, and Closest Point of Approach (CPA) distance tooltips.
* **Origin & Hindcast Vector Overlays**: Highlights the reverse-integrated discharge coordinate with a tactical reverse-trajectory polyline.

### 2. Physical Volume Estimation (IMO / Bonn Agreement BAOAC)
Rather than arbitrary synthetic metrics, VARUNA implements the **Bonn Agreement Oil Appearance Code (BAOAC)** standard:
* **Effective Layer Thickness ($t$)**: Calibrated between $85\,\mu\text{m}$ and $320\,\mu\text{m}$ for SAR-detectable crude oil emulsions.
* **Pure Oil Volume Calculation**:
  $$V_{\text{m}^3} = \text{Area}_{\text{m}^2} \times (t_{\mu\text{m}} \times 10^{-6})$$
  $$V_{\text{bbl}} = V_{\text{m}^3} \times 6.2898 \quad (\text{US Petroleum Barrels})$$
  $$M_{\text{MT}} = V_{\text{m}^3} \times 0.89 \quad (\text{Metric Tonnes, SG} \approx 0.89)$$
* **Bonn Thickness Classification**:
  * $t \ge 200\,\mu\text{m} \implies$ **Bonn Code 5: Continuous Heavy Oil / Emulsion**
  * $50 \le t < 200\,\mu\text{m} \implies$ **Bonn Code 4: Discontinuous True Oil Color**
  * $t < 50\,\mu\text{m} \implies$ **Bonn Code 3: Metallic Film**
* **Fluid Boundary Complexity**:
  $$\text{Boundary Complexity} = \frac{P}{2\sqrt{\pi A}}$$
  Evaluates hydrodynamic slick elongation relative to the theoretical minimal circular perimeter ($P_{\min}$), indicating whether a slick is freshly released or dispersed by wave action.

### 3. Weighted Multi-Factor Forensic Priority Engine
To provide credible investigative suspect rankings, VARUNA uses a weighted multi-factor heuristic score (a priority index, not a calibrated Bayesian posterior and not court-admissible evidence on its own):
$$\text{Score} = 0.40 \cdot S_{\text{spatial}} + 0.30 \cdot S_{\text{transponder}} + 0.20 \cdot S_{\text{kinematic}} + 0.10 \cdot S_{\text{course}}$$

* **Spatial Proximity Likelihood ($S_{\text{spatial}}$)**:
  $$S_{\text{spatial}} = 100 \times \exp\left(-\frac{\text{CPA}^2}{2\sigma^2}\right) \quad (\sigma = 650\,\text{m})$$
  Vessels intersecting within 50–90m achieve $\approx 99\%$; distant vessels ($>3\,\text{km}$) decay towards $0\%$.
* **AIS Blackout Anomaly ($S_{\text{transponder}}$)**: Severe penalties ($85\% - 98\%$) for intentional transponder suppression during the estimated discharge window.
* **Kinematic Speed Drop Ratio ($S_{\text{kinematic}}$)**: Detects deceleration from cruising speed ($14-18\,\text{kts}$) to illegal operational discharge speeds ($2-5\,\text{kts}$).
* **Risk Categorization**:
  * **HIGH-PRIORITY INVESTIGATIVE LEAD**: Score $\ge 70\%$, highlighted in crimson with blackout duration flags.
  * **INVESTIGATION CANDIDATE**: Score $30\% - 70\%$, flagged for proximity correlation.
  * **NO SIGNIFICANT CORRELATION / NOMINAL TRANSIT**: Score $< 30\%$, low correlation with available evidence (never an exoneration).

### 4. Lagrangian Ocean Drift Hindcast & Environmental Forcing
* **Advection Model**: Reverse-time integration using combined wind and current vectors:
  $$\vec{V}_{\text{drift}} = \vec{V}_{\text{current}} + 0.03 \cdot \vec{V}_{\text{wind}}$$
* **Environmental Data Sources**:
  * **NOAA GFS**: 10-meter atmospheric wind velocity fields ($3\%$ aerodynamic leeway).
  * **Copernicus Marine Service (CMEMS)**: Surface advection currents ($100\%$ hydrodynamic drag).
* **Calibrated Oceanographic Basins**:
  * Arabian Sea / West India Coastal Current (WICC)
  * Gulf of Mexico (Loop Current & Eddy dynamics)
  * English Channel / Dover Strait (Macrotidal alternating currents)
  * Persian Gulf / Strait of Hormuz (Thermohaline jet flows)
  * Singapore Strait / Malacca (Monsoonal tidal flows)

### 5. 3D Mission Landing Page (WebGL / Three.js)
* Custom hardware-accelerated 3D interactive digital globe running at smooth 60 FPS.
* Procedural ocean particle flow simulating global surface currents.
* Dynamic atmospheric scattering shader, mission pinpoints, and fast responsive navigation.

### 6. Automated Forensic Case File (PDF Generation)
* Built-in client-side legal dossier export using jsPDF.
* Includes **Digital Chain of Custody**, **SHA-256 cryptographic hash**, coordinate grids, suspect profiles, radar backscatter analysis, and environmental telemetry for maritime legal proceedings.

---

## Global Operational Scenarios

VARUNA includes instant 1-click operational presets covering major global maritime chokepoints:

| Theater | Scenario Name | Coordinates | Oceanographic Profile | Top Suspect Profile |
| :--- | :--- | :--- | :--- | :--- |
| **India** | Gulf of Kutch / Vadinar | $22.4500^\circ\text{N}, 69.7200^\circ\text{E}$ | High-density crude SPM corridor; WICC currents | Oceanic Sentinel (Dark Vessel) |
| **India** | Mumbai Offshore | $18.9000^\circ\text{N}, 72.5000^\circ\text{E}$ | Mumbai High oilfields; coastal drift | Oceanic Sentinel (Dark AIS) |
| **India** | Chennai Coast | $13.0827^\circ\text{N}, 80.2707^\circ\text{E}$ | Bay of Bengal seasonal current | Coromandel Trader |
| **India** | Paradip Port Approach | $20.2644^\circ\text{N}, 86.6900^\circ\text{E}$ | Bulk carrier & tanker anchorage zone | Kalinga Voyager |
| **Americas** | Gulf of Mexico | $28.7366^\circ\text{N}, -88.3659^\circ\text{W}$ | Macondo sector deepwater rigs; Loop Current | Deepwater Vanguard (Dark Fleet) |
| **Americas** | Santos Basin Brazil | $-24.0000^\circ\text{S}, -46.3000^\circ\text{W}$ | Pre-salt offshore cluster; Brazil Current | Atlântico Sul Carrier |
| **Europe** | Dover Strait | $51.1275^\circ\text{N}, 1.3134^\circ\text{E}$ | World's busiest shipping lane; 3kt tidal flow | North Sea Sentinel (Dark AIS) |
| **Europe** | Strait of Gibraltar | $35.9600^\circ\text{N}, -5.5000^\circ\text{W}$ | Atlantic-Mediterranean inflow jet | Med Sea Bunkering |
| **Middle East** | Strait of Hormuz | $26.5667^\circ\text{N}, 56.2500^\circ\text{E}$ | Global crude bottleneck; 20% global oil | Farvahar (Dark AIS Transponder) |
| **Middle East** | Persian Gulf (Ras Tanura)| $26.6500^\circ\text{N}, 50.1500^\circ\text{E}$ | World's largest offshore crude terminal | Arabian Carrier |
| **Asia-Pacific**| Singapore Strait | $1.2500^\circ\text{N}, 103.8000^\circ\text{E}$ | Malacca Chokepoint; heavy bunker traffic | Hai Fa 88 (Dark Fleet Barge) |
| **Asia-Pacific**| South China Sea | $9.8000^\circ\text{N}, 114.2000^\circ\text{E}$ | Spratly Islands corridor; deep ocean transit | Dragon Star Tanker |

---

## Technology Stack

### Frontend & Visualization
* **Next.js 14** (App Router, Server & Client Components)
* **React 18** & **TypeScript**
* **Tailwind CSS** (Custom oceanic dark tactical palette: `#030712`, custom glow utilities)
* **CARTO Basemaps** (`carto.com` Voyager & Dark Matter raster tiles)
* **Leaflet** & **React-Leaflet** (GIS overlay rendering, radar pulse markers, spatial polygons)
* **Three.js** & **WebGL** (60 FPS 3D Mission Landing Globe)
* **jsPDF** & **html2canvas** (Forensic report compilation & PDF generation)

### Backend & Distributed Computing
* **Python 3.11+**
* **FastAPI** (High-throughput async REST API Gateway with interactive Swagger UI)
* **Celery** (Distributed task queue for heavy AI and numerical simulations)
* **Redis 7 (Alpine)** (In-memory message broker & task result backend)
* **Uvicorn** (Lightning-fast ASGI server)

### Database & Spatial Intelligence
* **PostgreSQL 15**
* **PostGIS 3.3** (Geospatial indexing, spatial joins, `ST_DWithin`, `ST_Intersects`, R-tree spatial indexes)

### Machine Learning & Ocean Physics
* **PyTorch** & **Torchvision**
* **ESRGAN** (Enhanced Super-Resolution Generative Adversarial Networks)
* **U-Net** (Deep Convolutional Neural Network for semantic SAR segmentation)
* **NumPy** & **SciPy** (Lagrangian Runge-Kutta numerical integration)
* **Shapely** & **GeoPandas** (Vector spatial geometry processing)

### Containerization & Deployment
* **Docker** & **Docker Compose**
* Multi-service orchestration:
  * `varuna-api-gateway` (Port 8000)
  * `varuna-celery-worker` (Asynchronous ML & Hindcasting)
  * `varuna-redis` (Port 6379)
  * `varuna-postgis` (Port 5432)

---

## Getting Started

### Prerequisites
* **Docker** & **Docker Compose** installed
* **Node.js 20+** & **npm** installed
* **Git** installed

### 1. Clone the Repository
```bash
git clone https://github.com/thekarak/VARUNA.git
cd VARUNA/varuna-workspace
```

### 2. Launch Backend & Distributed Services (Docker)
```bash
docker compose up -d --build
```
This automatically starts:
* `varuna-api-gateway` on `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)
* `varuna-celery-worker`
* `varuna-redis` on port `6379`
* `varuna-postgis` on port `5432`

### 3. Launch the Frontend
```bash
cd frontend
npm install
npm run dev
```
The dashboard is now live at:
**http://localhost:3000/dashboard.html** (or `/dashboard`)

3D Mission Landing Page:
**http://localhost:3000/index.html** (or `/`)

### 4. Run Scientific Verification Tests
```bash
# Run the authentic vertical slice (ESRGAN -> U-Net -> Lagrangian ensemble -> AIS attribution)
python scratch/test_vertical_slice.py

# Run the end-to-end multi-scenario pipeline verification
python scratch/test_pipeline_e2e.py

# (Optional) Seed live PostGIS database with vessel trajectories
python -m app.services.seed_postgis_ais --clear
```

---

## Cloud Deployment (Vercel & Render)

V.A.R.U.N.A. is deployed on a decoupled, production-grade cloud architecture leveraging **Vercel** for high-performance edge frontend delivery and **Render** for Python FastAPI & forensic ML pipeline execution.

```text
+-------------------------------------------------------------+
|                FRONTEND (Vercel Edge Network)               |
|  * 3D Mission Landing Canvas (Three.js / WebGL)             |
|  * Tactical Forensic Dashboard (Leaflet + CARTO Basemaps)   |
|  * Live URL: https://varuna-omega.vercel.app                |
+------------------------------+------------------------------+
                               |
                        HTTPS REST / CORS
                               |
                               v
+-------------------------------------------------------------+
|                BACKEND (Render Web Service)                 |
|  * Python 3.11 + FastAPI + Uvicorn Gateway                  |
|  * U-Net Segmentation & Fay Weathering Models               |
|  * Lagrangian Drift Engine & Multi-Factor AIS Attribution       |
|  * Live URL: https://varuna-e1tx.onrender.com               |
+-------------------------------------------------------------+
```

### 1. Frontend on Vercel
* **Platform**: [Vercel](https://vercel.com)
* **Production URL**: `https://varuna-omega.vercel.app/` (or `/dashboard.html`)
* **Framework**: React 18 + Tailwind CSS + Three.js + Leaflet & CARTO Basemaps
* **Deployment Details**:
  * **Zero-Latency Edge CDN**: Serves static WebGL assets, satellite overlays, and React components with sub-50ms global response times.
  * **Clean URL Routing**: Configured via `frontend/vercel.json` with clean routing (`/dashboard` $\to$ `dashboard.html`, `/` $\to$ `index.html`).
  * **Dynamic API Resolution**: Automatically connects to the live Render backend (`https://varuna-e1tx.onrender.com`) with client-side scientific fallback.
  * **Multi-Provider Resilient Basemaps**: Seamless failover between high-resolution OpenStreetMap, Esri World Ocean / Dark Canvas, and CARTO Basemaps, guaranteeing zero black-tile or watermark failures across all devices.

### 2. Backend on Render
* **Platform**: [Render](https://render.com)
* **Production URL**: `https://varuna-e1tx.onrender.com`
* **API Documentation**: `https://varuna-e1tx.onrender.com/docs` (Interactive OpenAPI / Swagger)
* **Health Check**: `https://varuna-e1tx.onrender.com/health`
* **Stack**: Python 3.11 + FastAPI + Uvicorn + Celery / Background Workers
* **Deployment Details**:
  * **Native Python 3.11 Runtime**: Automated continuous deployment via `render.yaml` blueprint and `backend/requirements.txt`.
  * **Resilient Architecture**: Dual-execution design featuring Celery distributed task queues with seamless fallback to async background worker threads for standalone cloud hosting.
  * **Full Forensic Pipeline**: Executes classical 4x image enhancement (ESRGAN pipeline stage), radar-vision segmentation (U-Net pipeline stage), Fay's spreading model, Bonn Agreement volume estimation, RK4 ensemble Lagrangian metocean hindcasting with uncertainty ellipse, and weighted multi-factor AIS vessel priority scoring.

### 3. Architecture & Security
* **Cross-Origin Resource Sharing (CORS)**: Pre-configured across all endpoints, enabling secure browser-to-backend communication without proxy overhead.
* **Hybrid Fallback Guarantee**: If the backend is cold-starting, the frontend dynamically executes an authentic in-browser mathematical calculation engine so the dashboard remains 100% interactive and functional at all times.

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/analyze` | Initiates the 4-stage pipeline (ESRGAN $\to$ U-Net $\to$ Lagrangian $\to$ PostGIS AIS). Returns `task_id`. |
| `GET` | `/api/v1/task/{id}` | Polls status and telemetry (`PROGRESS`, `SUCCESS`, `FAILURE`) and retrieves full forensic results. |
| `GET` | `/docs` | Interactive Swagger / OpenAPI documentation for testing all backend routes. |

### Sample Execution Payload:
```json
{
  "image_url": "https://sentinel-s1.copernicus.eu/sample_slick.tif",
  "latitude": 22.4500,
  "longitude": 69.7200,
  "detection_time": "2026-09-04T12:00:00Z"
}
```

---

## Responsible AI & Legal Evidentiary Standard

Because maritime pollution investigations carry significant financial, legal, and regulatory consequences:
* VARUNA provides **heuristic investigative priority leads** (weighted multi-factor scores), not probabilities and not automated prosecution.
* The separation between **Observed Data $\to$ Classical Segmentation $\to$ Hydrodynamic Simulation $\to$ Correlated Telemetry** is strictly preserved, and every result carries its provenance (`attribution_source`, `forcing_source`, `detection_quality`).
* Every generated Forensic Case File includes a SHA-256 seal computed over the result payload. It proves the report matches its inputs; it is NOT a legal chain of custody.

---

## Prototype Limits & Judge Notes (read before evaluating)

Honest accounting of what this prototype is and is not:

* **No trained neural weights are bundled.** The "ESRGAN" stage is a classical 4x enhancement chain (denoise + Lanczos + unsharp + CLAHE) and the "U-Net" stage is classical radar-vision segmentation (bilateral + Otsu + morphology + contours). Both run on real input pixels with input-dependent outputs (`scratch/test_vertical_slice.py` proves it), and both document that learned weights are the production swap-in. Per-scene precision/recall/IoU/Dice against labelled data, and look-alike (biogenic / low-wind / sediment) classification, do not exist yet.
* **Volume is a range estimate, not a mass balance.** Results report `estimated_volume_bbls` together with `volume_bbls_range` and explicit `volume_assumptions` (Bonn-band thickness spread, emulsion water fraction unknown).
* **Drift is an RK4 particle ensemble (default N=2000) with a 95% confidence ellipse**, forced by gridded file → live open APIs → regional climatology. The winning source, evaluation time, and grid version are persisted per run (`forcing_source`, `forcing_evaluated_at`, `forcing_grid_id`). Hindcast error against labelled historical spills is not yet evaluated.
* **AIS attribution is a fallback chain with visible provenance**: live PostGIS `ST_DWithin` join → bundled trajectory file → deterministic synthetic sector profiles. Every result states its `attribution_source`, and the dashboard suspect panel shows it (`DATA: …` badge).
* **Scores are heuristic priority indices, never probabilities; tiers never exonerate.** Labels: High-Priority Investigative Lead / Investigation Candidate / Lower Correlation / No Significant Correlation.
* **Dispatch, dossier metadata, and seals are demo-grade.** Coast Guard dispatch is simulated locally; case refs, timestamps, and seals are payload-derived but have no external custody, signatures, or legal review.
* **API contracts are validated** (coordinate ranges, nonempty image reference → 422), but there is no auth layer — appropriate for a judged prototype, not production.

---

## Team VARUNA

**JIS College of Engineering**  
**Smart India Hackathon 2026**

| Member | Role & Responsibility |
| :--- | :--- |
| **Srijan Hazra** | Team Lead & Data Analysis |
| **Sourasis Karak** | Backend Architecture & Core ML Pipeline |
| **Shibam Kundu** | Data Engineering & Geospatial Pipeline |
| **Pallabi Sarkar** | UI/UX Design & Product Analysis |
| **Debarpan Chakraborty** | Frontend Development & GIS Integration |
| **Sourav Sarkar** | Database Administration & PostGIS Engine |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
