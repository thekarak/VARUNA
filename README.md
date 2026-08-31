# V.A.R.U.N.A.

### Vision-based Algorithm for Rapid Unrefined-oil & Nautical Analysis

**An AI-powered maritime forensic intelligence platform for detecting oil spills, reconstructing their drift origin, correlating vessel movements, and identifying suspicious AIS-dark activity.**

Developed by **Team VARUNA**
**JIS College of Engineering**
**Smart India Hackathon 2026**

---

## Overview

Oil spill detection in offshore environments remains a challenging problem for maritime authorities. Satellite remote sensing can reveal suspicious surface anomalies, while Automatic Identification System (AIS) data can provide valuable information about vessel movements. However, these datasets are often analyzed independently.

A particularly difficult scenario occurs when a vessel disables its AIS transponder during a suspected pollution event. By the time an oil slick is detected, ocean currents and wind can also transport the slick far from its original discharge location, making simple geographic or linear backtracking unreliable.

**V.A.R.U.N.A.** addresses this gap by combining:

* Satellite-based oil slick detection
* AI-assisted image enhancement
* Semantic segmentation
* Ocean-current and wind-driven drift simulation
* Historical AIS trajectory analysis
* AIS blackout detection
* Vessel behavioral anomaly scoring
* Geospatial correlation using PostGIS
* Automated forensic evidence generation

The objective is to transform fragmented maritime datasets into a **structured, traceable, and evidence-oriented investigation workflow**.

---

## Problem Statement

Traditional offshore oil-spill monitoring faces three major challenges:

### 1. Low-resolution and ambiguous imagery

Open satellite datasets such as Sentinel-1 and Sentinel-2 provide extensive coverage but may not always provide sufficient visual detail for identifying small or thin slicks and vessels.

### 2. AIS "dark vessel" problem

Vessels can temporarily stop transmitting AIS information. When this occurs during a suspected pollution event, authorities may lack direct telemetry evidence connecting the vessel to the incident.

### 3. Difficult spill-source reconstruction

Once an oil slick is detected, winds and ocean currents continuously transport it. Simple linear backtracking cannot accurately represent this dynamic behavior.

VARUNA combines these independent information sources into a unified spatio-temporal investigation pipeline.

---

# Core Solution

VARUNA follows a multi-stage intelligence pipeline:

```text
Satellite Imagery
       |
       v
Image Enhancement
       |
       v
Land Masking
       |
       v
Oil Slick Segmentation
       |
       v
Slick Geometry Extraction
       |
       v
Lagrangian Drift Hindcasting
       |
       v
Estimated Spill Origin
       |
       v
Spatio-Temporal AIS Correlation
       |
       v
AIS Blackout Detection
       |
       v
Dead-Reckoning Analysis
       |
       v
Behavioral Anomaly Scoring
       |
       v
Suspect Vessel Ranking
       |
       v
Forensic Evidence Package
```

---

# Key Features

## 1. AI-Based Image Super-Resolution

VARUNA uses an ESRGAN-based image enhancement pipeline to improve the effective visual resolution of satellite imagery before downstream analysis.

The system is designed to:

* Upscale satellite imagery
* Improve object boundaries
* Enhance visual representation of surface anomalies
* Provide higher-resolution inputs for segmentation
* Generate interpretable before/after imagery for investigators

> Super-resolution is treated as an enhancement step and does not create physically verified satellite observations that were not present in the original imagery.

---

## 2. U-Net Oil Slick Segmentation

A U-Net-based semantic segmentation model identifies potential oil-slick regions within the processed imagery.

The segmentation pipeline extracts:

* Oil slick mask
* Area
* Perimeter
* Centroid
* Bounding geometry
* Shape characteristics

An automated land mask is applied to reduce false positives caused by:

* Coastlines
* Beaches
* Coastal shadows
* Cliffs
* Terrestrial structures

---

## 3. Lagrangian Particle Drift Engine

Instead of assuming that an oil slick moves in a straight line, VARUNA models the spill as a collection of simulated particles.

The system uses environmental variables such as:

* Historical wind vectors
* Ocean surface currents
* Time-dependent movement
* Particle dispersion

A conceptual simulation flow is:

```text
Detected Slick
      |
      v
Generate Particle Cloud
      |
      v
Retrieve Historical Wind
      |
      +
      |
Retrieve Ocean Current
      |
      v
Backward Particle Integration
      |
      v
Convergence Analysis
      |
      v
Estimated Discharge Region
```

The engine supports both:

**Hindcasting:**
Estimating where the spill originated.

**Forecasting:**
Estimating where the detected slick may move in the future.

---

## 4. Spatio-Temporal Vessel Correlation

Once the probable spill origin and time window are estimated, VARUNA searches historical vessel trajectories within the corresponding spatial and temporal region.

PostGIS enables spatial operations such as:

* Line-polygon intersection
* Point-in-polygon analysis
* Distance-based searches
* Trajectory intersection
* Time-window filtering

This allows the system to answer questions such as:

> Which vessels were physically present near the estimated spill origin during the relevant time period?

---

## 5. AIS Dark Vessel Detection

VARUNA identifies suspicious AIS transmission gaps by analyzing vessel telemetry.

The system detects:

* Sudden AIS signal loss
* AIS blackout duration
* Last known position
* First position after signal recovery
* Estimated trajectory during the blackout
* Spatial relationship between the estimated trajectory and spill origin

A dead-reckoning model is then used to estimate the vessel's probable movement during the communication gap.

```text
Last AIS Position
       |
       v
AIS Signal Lost
       |
       v
Dead-Reckoning
       |
       v
Estimated Vessel Path
       |
       v
AIS Signal Restored
       |
       v
Trajectory Validation
       |
       v
Spill-Origin Intersection?
```

AIS disappearance alone is **not treated as proof of illegal activity**. Instead, it contributes to a broader investigation score.

---

## 6. Behavioral Anomaly Scoring

VARUNA analyzes vessel movement patterns to identify behaviors that may warrant investigation.

Potential indicators include:

* Abrupt speed reduction
* Unusual stops
* Sudden course changes
* Loitering
* Repeated turns
* Loops or zig-zag patterns
* AIS blackout proximity
* Spatial overlap with estimated spill origin
* Temporal proximity to the suspected discharge window

The output is an **investigative suspicion score**, rather than a definitive determination of guilt.

Example:

```text
Vessel A
--------------------------------
Spill proximity       : High
Temporal overlap      : High
AIS blackout           : Detected
Trajectory intersection: High
Behavior anomaly      : Medium
--------------------------------
Investigation Score   : 87/100
```

---

# 7. Automated Forensic Case File

Investigators can generate a structured evidence package containing:

* Original satellite imagery
* Enhanced satellite imagery
* Oil slick segmentation mask
* Slick geometry
* Estimated spill origin
* Drift simulation results
* Wind/current information
* Historical vessel tracks
* AIS blackout intervals
* Dead-reckoned trajectories
* Behavioral anomaly metrics
* Vessel ranking
* Data provenance and timestamps

The generated report is designed to provide a **traceable technical investigation record** that can support subsequent human review and legal proceedings.

---

# Target Users

### Coast Guard and Maritime Command Centers

* Detect suspicious oil slicks
* Identify nearby vessels
* Investigate AIS-dark activity
* Support rapid response operations

### Environmental Protection Agencies

* Monitor marine pollution
* Investigate recurring spill zones
* Support environmental enforcement

### Port and Harbor Authorities

* Monitor vessel activity
* Investigate suspicious behavior near ports and anchorages
* Analyze historical vessel movement

### Maritime Investigators and Legal Authorities

* Review reconstructed vessel trajectories
* Examine supporting datasets
* Generate structured forensic documentation

---

# System Architecture

```text
                         +----------------------+
                         |   Satellite Sources  |
                         | Sentinel-1 / S2      |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Image Preprocessing  |
                         | ESRGAN + Land Mask   |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | U-Net Segmentation   |
                         | Oil Slick Detection  |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Slick Geometry       |
                         | Area / Centroid      |
                         +----------+-----------+
                                    |
                                    v
+----------------+       +----------------------+       +----------------+
| NOAA GFS       | ----> | Lagrangian Drift    | <---- | Copernicus     |
| Wind Data      |       | Simulation Engine   |       | Current Data   |
+----------------+       +----------+-----------+       +----------------+
                                    |
                                    v
                         +----------------------+
                         | Spill Origin         |
                         | Estimation            |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | PostGIS Correlation  |
                         | AIS Trajectory Query |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Dark Vessel Tracker  |
                         | + Dead Reckoning     |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Behavioral Anomaly   |
                         | Scoring Engine       |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Investigator         |
                         | Dashboard            |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Forensic Case File   |
                         | PDF Generator        |
                         +----------------------+
```

---

# Technology Stack

## Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Mapbox GL JS / Leaflet**

Used for:

* Interactive GIS dashboard
* Satellite layer visualization
* Vessel tracking
* Spill polygons
* Drift trajectories
* Investigation timelines
* Suspect vessel ranking

---

## Backend

* **Python**
* **FastAPI**
* **Celery**
* **Redis**

FastAPI provides the core API layer, while Celery and Redis are used to handle computationally expensive asynchronous operations such as:

* Image super-resolution
* ML inference
* Particle simulations
* Large-scale trajectory processing
* Report generation

---

## Database

### PostgreSQL + PostGIS

Used for storing and querying:

* Vessel positions
* Vessel trajectories
* AIS events
* Oil slick polygons
* Spill origin coordinates
* Investigation regions
* Spatial relationships

PostGIS enables high-performance geospatial operations over large vessel datasets.

---

## AI / Machine Learning

* **PyTorch**
* **ESRGAN**
* **U-Net**
* **Scikit-learn**

### AI Pipeline

```text
Satellite Image
      |
      v
ESRGAN
      |
      v
Enhanced Image
      |
      v
U-Net
      |
      v
Oil Slick Mask
      |
      v
Geometric Analysis
```

---

## Ocean Simulation

The Lagrangian drift engine models oil movement using environmental forcing data.

Primary inputs include:

* Wind velocity fields
* Ocean surface currents
* Historical timestamps
* Initial slick geometry

The simulation generates particle trajectories that are analyzed for spatial convergence during hindcasting.

---

# Data Sources

VARUNA is designed around open and publicly accessible data sources where possible.

Potential datasets include:

| Dataset                    | Purpose                          |
| -------------------------- | -------------------------------- |
| Sentinel-1 SAR             | Marine surface anomaly detection |
| Sentinel-2                 | Optical environmental imagery    |
| NOAA GFS                   | Historical wind fields           |
| Copernicus Marine Data     | Ocean current information        |
| AIS datasets               | Vessel trajectory analysis       |
| ESA Land Cover / Land Mask | Land and coastline filtering     |

Dataset availability, licensing, temporal coverage, and resolution are validated before use in the operational pipeline.

---

# User Workflow

## Step 1 — Select Investigation Area

The operator selects a geographic region and time window from the GIS dashboard.

## Step 2 — Ingest Satellite Data

A satellite image is uploaded or retrieved from an available archival source.

## Step 3 — Enhance Imagery

The image is processed through the super-resolution pipeline.

## Step 4 — Detect Oil Slick

U-Net performs semantic segmentation and generates the probable slick geometry.

## Step 5 — Reconstruct Spill Origin

The Lagrangian engine performs backward particle simulation using historical wind and current data.

## Step 6 — Correlate Vessel Activity

PostGIS searches historical AIS trajectories around the estimated origin and discharge window.

## Step 7 — Analyze AIS Blackouts

The system identifies suspicious transmission gaps and estimates potential vessel trajectories.

## Step 8 — Score Vessel Behavior

Multiple spatial, temporal, telemetry, and behavioral indicators are combined into an investigation ranking.

## Step 9 — Review Evidence

Investigators inspect the reconstructed event on the interactive dashboard.

## Step 10 — Generate Case File

A structured forensic report is generated for further human investigation and documentation.

---

# Success Metrics

The MVP targets the following engineering benchmarks:

| Metric                     |                      Target |
| -------------------------- | --------------------------: |
| Oil Segmentation Accuracy  |                   > 90% IoU |
| Image Enhancement Quality  |                 > 0.85 SSIM |
| Drift Simulation Deviation |       < 500 m over 24 hours |
| PostGIS Query Latency      |                 < 2 seconds |
| Vessel Dataset             | 100,000+ trajectory records |

These targets are **development goals** and will be validated experimentally using appropriate validation datasets and benchmark scenarios.

---

# MVP Scope

The initial MVP focuses on demonstrating the complete investigation pipeline:

```text
Satellite Image
       +
Environmental Data
       +
AIS Data
       |
       v
Detection
       |
       v
Drift Reconstruction
       |
       v
Vessel Correlation
       |
       v
Anomaly Analysis
       |
       v
Forensic Visualization
       |
       v
Evidence Report
```

The emphasis is on **end-to-end integration** rather than attempting to build a production-scale maritime surveillance system within the hackathon timeframe.

---

# Out of Scope

The following capabilities are outside the MVP:

### Commercial Satellite Tasking

VARUNA will not directly task commercial satellite constellations.

The MVP focuses on archival and publicly accessible satellite data.

### Spectroscopic Oil Identification

The system does not perform laboratory-grade chemical fingerprinting or spectroscopic identification of oil samples.

### Autonomous Enforcement

VARUNA does not autonomously accuse, prosecute, intercept, or penalize vessels.

All investigation results require human verification.

---

# Responsible AI and Evidence Handling

Because maritime pollution investigations can have legal and financial consequences, VARUNA follows an evidence-oriented design philosophy.

### The system does not treat:

* AIS disappearance as proof of wrongdoing
* An anomaly score as proof of guilt
* A satellite classification as chemical confirmation
* A reconstructed trajectory as an exact historical path

Instead, these signals are combined to identify **investigative leads** that can be reviewed by qualified authorities.

The forensic report preserves the distinction between:

**Observed Data → Model Output → Inference → Investigation Lead**

This separation is essential for responsible deployment.

---

# Project Structure

A proposed repository structure:

```text
VARUNA/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── maps/
│   └── services/
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── workers/
│   └── main.py
│
├── ml/
│   ├── esrgan/
│   ├── unet/
│   ├── datasets/
│   ├── training/
│   └── inference/
│
├── simulation/
│   ├── lagrangian/
│   ├── wind/
│   ├── currents/
│   └── hindcasting/
│
├── database/
│   ├── migrations/
│   ├── schemas/
│   └── postgis/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── samples/
│
├── reports/
│   └── templates/
│
├── notebooks/
│
├── tests/
│
├── docker/
│
├── docs/
│
├── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# Installation

## Prerequisites

* Python 3.11+
* Node.js 20+
* PostgreSQL
* PostGIS
* Redis
* Docker
* Git

## Clone Repository

```bash
git clone https://github.com/<your-organization>/VARUNA.git
cd VARUNA
```

## Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Database

Create a PostgreSQL database and enable PostGIS:

```sql
CREATE DATABASE varuna;

\c varuna

CREATE EXTENSION postgis;
```

## Environment Variables

Create a `.env` file based on:

```text
DATABASE_URL=
REDIS_URL=
SATELLITE_DATA_URL=
AIS_DATA_PATH=
WIND_DATA_PATH=
CURRENT_DATA_PATH=
```

---

# Development Roadmap

### Phase 1 — Data Pipeline

* [ ] Satellite data ingestion
* [ ] AIS data ingestion
* [ ] Wind/current data ingestion
* [ ] Dataset preprocessing
* [ ] Land masking

### Phase 2 — AI Pipeline

* [ ] ESRGAN integration
* [ ] U-Net training
* [ ] Slick segmentation
* [ ] Slick geometry extraction
* [ ] Model evaluation

### Phase 3 — Drift Simulation

* [ ] Particle initialization
* [ ] Wind integration
* [ ] Current integration
* [ ] Hindcasting
* [ ] Forecasting
* [ ] Convergence estimation

### Phase 4 — Maritime Intelligence

* [ ] PostGIS trajectory storage
* [ ] Spatio-temporal search
* [ ] AIS dropout detection
* [ ] Dead reckoning
* [ ] Behavioral anomaly scoring

### Phase 5 — Investigation Dashboard

* [ ] Interactive map
* [ ] Satellite layers
* [ ] Slick visualization
* [ ] Particle trajectories
* [ ] Vessel tracks
* [ ] Investigation timeline
* [ ] Suspect ranking

### Phase 6 — Evidence Generation

* [ ] Automated report generation
* [ ] Data provenance
* [ ] Evidence metadata
* [ ] Digital integrity verification
* [ ] PDF export

---

# Expected Impact

VARUNA aims to bridge the gap between **environmental remote sensing and maritime intelligence**.

Instead of presenting investigators with isolated datasets, the platform provides a unified workflow:

```text
"What happened?"
        |
        v
Satellite Analysis

"Where did it originate?"
        |
        v
Ocean Drift Hindcasting

"Which vessels were there?"
        |
        v
AIS Correlation

"Was any vessel behaving unusually?"
        |
        v
Behavioral Analysis

"What evidence can investigators review?"
        |
        v
Forensic Case File
```

This approach can help reduce investigation time, prioritize suspicious maritime events, and provide environmental authorities with a structured basis for further investigation.

---

# Team

## Team VARUNA

**JIS College of Engineering**

| Member                   | Responsibility                  |
| ------------------------ | ------------------------------- |
| **Srijan Hazra**         | Team Lead & Data Analysis       |
| **Sourasis Karak**       | Backend & Core ML Design        |
| **Shibam Kundu**         | Data Engineering                |
| **Pallabi Sarkar**       | UI/UX Design & Product Analysis |
| **Debarpan Chakroborty** | Frontend Development            |
| **Sourav Sarkar**        | Database Administration         |

---

# Institution

### JIS College of Engineering

Team VARUNA is a student-led project developed as part of the **Smart India Hackathon 2026** initiative.

---

# Project Status

**Status:** MVP / Active Development

VARUNA is currently being developed as a research-oriented prototype demonstrating the integration of:

* Remote sensing
* Deep learning
* Oceanographic modeling
* AIS analytics
* Geospatial databases
* Maritime behavioral intelligence

---

# Disclaimer

VARUNA is a **student research and engineering prototype**.

Its outputs are intended to assist investigators by identifying potential relationships between satellite observations, environmental drift, and vessel activity. Model predictions and anomaly scores should not be interpreted as definitive proof of illegal activity without independent verification and appropriate evidentiary procedures.

---

# License

This project is intended to be released as an open-source project.

The final license will be specified by the project team before public release.

---

## Built by Team VARUNA

**JIS College of Engineering | Smart India Hackathon 2026**
