Project Specification: V.A.R.U.N.A.
Vision-based Algorithm for Rapid Unrefined-oil & Nautical Analysis

1. Problem Definition
Traditional offshore oil spill monitoring suffers from a massive forensic gap. Although satellite remote sensing (such as Sentinel-1 SAR or Sentinel-2 EO) can detect geographic anomalies, the raw open-source imagery is often too coarse to capture thin oil slicks or small vessels accurately. Furthermore, rogue vessels frequently exploit a major loophole: they intentionally deactivate their Automatic Identification System (AIS) transponders—going "dark"—precisely when illegally discharging bilge water or unrefined cargo oil in the open seas.
Even when a spill is detected, ocean winds and currents cause rapid dispersion. Simple linear backtracking is highly inaccurate, making it mathematically complex to pinpoint the exact time and coordinate of the discharge. As a result, maritime authorities are left with scattered datasets but no concrete, legally validated workflow to connect physical ocean anomalies with maritime registry telemetry to prove liability.

2. Target Users
Coast Guard Investigators & Command Centers: Officers who require rapid alerts, high-confidence backtracking coordinates, and authenticated data to intercept polluting vessels or deploy cleanup crews.
Environmental Protection Agencies: National and regional environmental bureaus tracking maritime pollution, enforcing coastal safety regulations, and issuing fines.
Port and Harbor Authorities: Officials tracking ship activities in high-density anchorage zones, monitoring bunkering operations, and securing regional waters.
Maritime Legal Tribunals: Judicial entities requiring technically validated, tamper-proof forensic packages to prosecute environmental violators and hold shipowners accountable under international maritime law.

3. MVP Features
To solve these challenges, we have designed VARUNA around seven core engineering pillars:
Super-Resolution Pre-processing (ESRGAN Upscaling): Before processing, raw satellite tiles are passed through a Convolutional Neural Network (CNN) trained on paired high- and low-resolution images. This upscales coarse Sentinel data by 4x, sharpening object edges, reconstructing fine structural details, and making micro-slicks visible.
U-Net Semantic Segmentation & Land Masking: An automated deep learning model classifies pixels into water vs. oil slick geometries. To eliminate false alarms, the pipeline automatically applies an ESA Land Mask, filtering out terrestrial features, coastal cliffs, and beach shadows.
Lagrangian Particle Drift Engine (Hindcasting & Forecasting): Rather than using basic straight-line backtracking, the physics engine models the spill as 1,000 digital particles. By integrating historical wind vectors from NOAA GFS and sea surface current grids from Copernicus, the engine simulates dynamic reverse movement through time to pinpoint the convergent discharge origin and timestamp.
Spatio-Temporal PostGIS Correlation Engine: The backend generates a spatial search cylinder around the calculated spill origin coordinate and time window. It runs an automated geospatial query on a PostgreSQL database to filter historical ship routes and extract every vessel that physically crossed the zone.
"Dark Vessel" AIS Dropout Tracker: To counter intentional evasion, VARUNA scans incoming AIS telemetry for sudden signal drops. It automatically plots a dead-reckoned trajectory across the blackout period, flagging dark vessels whose estimated paths intersect with the spill origin.
Behavioral Anomaly Scorer: An algorithm analyzes vessel paths and ranks suspect ships based on behavioral anomalies. It flags rapid speed drops (which commercial ships must undergo to discharge bilge) and maneuvering irregularities like loops or zigzags.
Automated "Legal Case File" PDF Generator: Operators can export a digitally signed, tamper-proof PDF evidentiary brief with a single click. The document compiles upscaled satellite captures, reverse drift simulation charts, historical vessel logs, and anomaly ranking metrics into a court-ready package.

4. Tech Stack
Our team is implementing a modern, highly scalable architecture:
Frontend: Next.js (React), TypeScript, Tailwind CSS, and Mapbox GL JS (or Leaflet) to render interactive geospatial layers, spatial boundaries, and dynamic drift vectors.
Backend: FastAPI (Python) for asynchronous REST APIs, paired with Celery asynchronous workers and Redis to offload heavy computational tasks like image upscaling and physics simulations.
Database: PostgreSQL with the PostGIS spatial extension to store vessel trajectories as spatial lines and oil slicks as polygons, enabling rapid geometric intersection queries.
AI/ML & Simulation: PyTorch for training the ESRGAN and U-Net models, combined with python-based Lagrangian particle trajectory tracking.

5. Userflow
Data Ingestion: The operator selects a geographical region and time frame on the interactive map or uploads a raw Sentinel image.
Image Enhancement: The backend triggers ESRGAN to upscale the image, while the land mask strips away shoreline noise.
Slick Segmentation: The U-Net model segments the oil slick, calculating its physical area, perimeter, and geometric centroid.
Drift Modeling: The Lagrangian engine runs a backward particle simulation using wind and current variables to output the exact origin point and timestamp.
Vessel Correlation: PostGIS queries historical AIS data around that spatio-temporal origin window, filtering out irrelevant traffic.
Telemetry Analysis: The system identifies AIS blackout windows, runs dead-reckoning calculations, scores ship behaviors, and ranks the potential culprits.
Evidence Export: The operator inspects the suspect tracks on the GIS dashboard and downloads the authenticated forensic case file.

6. Out of Scope (MVP)
Real-time Commercial Satellite Tasking: Direct software integration to physically task and steer commercial satellite constellations (the MVP focuses on API-based archival and scheduled open-source feeds).
Spectroscopic Chemical Fingerprinting: Real-time chemical analysis of physical oil samples (the MVP focuses strictly on remote-sensing imagery and trajectory correlation).

7. Success Matrix
Oil Segmentation Accuracy: Greater than 90% Intersection over Union (IoU) on validation datasets.
Image Upscaling Quality: Greater than 0.85 Structural Similarity Index (SSIM) on upscaled Sentinel frames.
Drift Simulation Accuracy: Less than 500 meters spatial deviation over a 24-hour backward ocean simulation window.
Spatio-Temporal Query Latency: Less than 2.0 seconds to query and filter 100,000+ vessel nodes in the PostGIS database.

8. Impact and Benefits
Grounded Forensic Accountability: By combining remote sensing with maritime ship tracking, VARUNA turns scattered satellite data into concrete, legally binding evidence. It bridges the gap between environmental monitoring and maritime law enforcement, giving authorities the precise data they need to prosecute offenders.
Eliminating the "Dark Vessel" Loophole: The "Dark Vessel" AIS Dropout Tracker completely neutralizes the primary evasion method used by maritime polluters. Turning off transponders to dump oil secretly now generates an immediate, high-priority suspicion score based on spatial dead-reckoning.
Cost-Effective Precision Monitoring: Implementing deep-learning-based Super-Resolution (ESRGAN) allows us to enhance free, open-source 10m Sentinel radar datasets up to high-clarity imagery. This avoids the extreme financial cost of purchasing commercial high-resolution imagery, making the platform highly accessible for developing nations and regional authorities.
Rapid Ecological Safeguarding: Immediate automated alerts and forward-drifting predictions enable marine clean-up crews to deploy physical boom barriers efficiently, mitigating irreversible damage to coral reefs, marine reserves, and coastal ecosystems.

Team VARUNA (Smart India Hackathon 2026):
Srijan Hazra (Team Lead & Data Analysis)
Sourasis Karak (Backend & Core ML Design)
Shibam Kundu (Data Engineering)
Pallabi Sarkar (UI/UX Designer & Product Analyst) 
Debarpan Chakroborty (Frontend)
Sourav Sarkar (Database Administrator)

