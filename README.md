# Orbital Risk Analysis

Orbital collision risk analysis system for LEO (*Low Earth Orbit*). Combines public satellite and space debris data with a *machine learning* pipeline to estimate, rank, and visualize the relative collision risk across different altitudes and orbital object types.

> **Disclaimer:** The model produces a *relative* risk estimate, based on a physical proxy for collision rate. It is not an operational conjunction analysis system and does not replace tools such as NASA's CARA (Conjunction Assessment Risk Analysis).

---

## Table of Contents

1. [Scientific and Technical Motivation](#scientific-and-technical-motivation)
2. [Astronomical and Physical Background](#astronomical-and-physical-background)
3. [System Architecture](#system-architecture)
4. [Data Pipeline](#data-pipeline)
5. [Machine Learning Model](#machine-learning-model)
6. [Backend API](#backend-api)
7. [Frontend](#frontend)
8. [Notebooks](#notebooks)
9. [Project Structure](#project-structure)
10. [How to Run](#how-to-run)
11. [Deployment](#deployment)
12. [Model and Domain Limitations](#model-and-domain-limitations)
13. [Next Steps](#next-steps)
14. [References](#references)

---

## Scientific and Technical Motivation

Near-Earth space has never been more congested. As of 2024, the public Space-Track catalog records over 27,000 active objects in low Earth orbit — among them operational satellites, discarded rocket stages, and fragments from past collisions. Constellations like Starlink add hundreds of objects per year, while historical events such as the 2007 Chinese ASAT test (Fengyun-1C) and the 2009 Iridium 33 × Cosmos 2251 collision still contribute thousands of trackable fragments.

The core problem is that each new object in LEO increases the probability of future collisions that, in turn, generate more debris — a potentially self-sustaining cycle described by the Kessler syndrome. Even millimeter-scale fragments travelling at 7–8 km/s carry enough kinetic energy to disable satellites.

This project addresses two practical questions:

1. **What is the relative collision risk of an object based on its orbit and local orbital environment?**
2. **Which LEO altitude bands are most critical today, and how does that risk evolve through 2035?**

The approach is computational: building physically motivated features per orbital object, training a regression model with altitude-stratified cross-validation, and exposing the results via a REST API and interactive dashboard.

---

## Astronomical and Physical Background

### What is LEO

*Low Earth Orbit* (LEO) is the region from 200 to 2,000 km altitude above Earth's surface. It is the most populated orbit: the International Space Station (ISS, ~400 km), internet constellations (Starlink, ~550 km), Earth observation satellites, and the largest concentration of space debris in the public catalog all operate here.

### Why this region is critical

- **High orbital velocity:** objects in LEO orbit at 7.5–7.9 km/s. The kinetic energy of a 1 kg fragment is equivalent to the explosion of hundreds of kilograms of TNT.
- **High object density:** most space missions historically operated in this band, accumulating debris over decades.
- **Residual atmospheric drag:** below ~600 km, upper-atmosphere drag causes natural orbital decay over decades or years. Above 900 km, objects remain in orbit for centuries.
- **Kessler effect:** if object density exceeds a critical threshold, collisions generate fragments that cause further collisions — a chain reaction that could render certain altitudes unusable.

### Relevant orbital mechanics

| Quantity | Definition | Impact on risk |
|---|---|---|
| **Altitude** | Distance to the surface (km). We use the mean of apogee and perigee. | Determines the local orbital environment (neighbor density). |
| **Inclination** | Angle between the orbital plane and the equator (0°–180°). | Objects with different inclinations cross at steep angles, increasing relative velocity. |
| **Eccentricity** | Orbital ellipticity (0 = circular, 1 = parabolic). | Circular orbits are more predictable; eccentric orbits vary altitude throughout each pass. |
| **Orbital period** | Time for one complete orbit (~88–130 min in LEO). | Derived from altitude; adds no independent information but is useful as a numerical feature. |
| **BSTAR** | TLE drag coefficient (area-to-mass ratio × drag coefficient). | Objects with high BSTAR decay faster; indicates fragile structure or large cross-section. |
| **Orbital velocity** | v ≈ √(μ/r), μ = 398,600 km³/s². | Decreases with altitude; combined with inclination dispersion, defines encounter relative velocity. |

### What drives collision risk

The collision rate of an object with nearby debris is approximated by the Kessler (1978) expression:

```
Rate ∝ n_debris × σ × v_rel
```

Where `n_debris` is the debris density in the neighborhood, `σ` is the combined cross-section, and `v_rel` is the relative velocity between objects. This project estimates `n_debris` by counting objects within a spherical shell of ±50 km around each altitude, and approximates `v_rel` via the inclination dispersion of neighbors.

### LEO congestion zones

Based on current catalog data:

- **400–500 km:** high density of active satellites (Starlink, ISS). High total volume, but lower debris fraction.
- **700–900 km:** critical debris zone. Concentrates fragments from Fengyun-1C, Cosmos 2251, and Iridium 33. About 85–90% of objects in this band are debris or uncontrolled rocket bodies. The RRI (*Relative Risk Index*) for this band reaches 6.3–6.8 on a 0-to-10 scale.
- **Above 1,000 km:** objects remain in orbit for centuries. The Starlink constellation actively avoids altitudes above 600 km to ensure decay within 5 years.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Data Sources                        │
│   Space-Track API (TLE / SATCAT)  ·  CelesTrak (actives)    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Offline Pipeline (Notebooks)               │
│  01_eda.ipynb → 02_features.ipynb → 03_model.ipynb          │
│                                                              │
│  data/raw/*.csv → data/processed/*.parquet + models/*.joblib │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI / Python)                  │
│  Loads model.joblib + processed_features.parquet             │
│  Serves REST API: /objects · /analytics/* · /predict         │
│  Deploy: Railway (Dockerfile)                                │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP / JSON
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js / React)                  │
│  Dashboard · Analytics · Objects · Prediction · Glossary     │
│  Deploy: Vercel                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Pipeline

### 1. Collection (`src/data_loader.py`)

Data is downloaded from the [Space-Track API](https://www.space-track.org) using the `spacetrack` library. Free credentials are required (see `.env.example`).

Two datasets are collected:
- **`satcat.csv`** — historical catalog since 1957 (68,467 objects).
- **`gp_leo.csv`** — current orbital elements of LEO objects, filtered by `mean_motion > 11.25` rev/day (equivalent to altitude < ~2,000 km) and `decay_date = null` (still in orbit).

### 2. Exploratory Analysis (`notebooks/01_eda.ipynb`)

- Filters to 27,994 LEO objects with valid orbital elements.
- Composition: 12,541 debris, 17,899 payloads, 2,394 rocket bodies, 645 unknown.
- Analyzes temporal distribution (accelerated growth post-2019 with constellations) and altitude distribution.
- Identifies critical events: Fengyun-1C ASAT test (2007) and Iridium/Cosmos collision (2009).

### 3. Feature Engineering (`notebooks/02_features.ipynb`)

For each of the 27,994 objects, 13 physically motivated features are computed:

**Base orbital features** (derived from TLEs):

| Feature | Description |
|---|---|
| `altitude_km` | Mean altitude: (apogee + perigee) / 2 |
| `inclination_deg` | Orbital inclination (degrees) |
| `eccentricity` | Eccentricity |
| `velocity_km_s` | Circular orbital velocity: √(μ/r) |
| `period_min` | Orbital period in minutes |
| `bstar_abs` | Absolute value of the BSTAR coefficient |

**Local orbital environment features** (±50 km neighborhood):

| Feature | Description |
|---|---|
| `local_density_km3` | Total object density (obj/km³) |
| `debris_fraction_local` | Fraction of debris among neighbors |
| `incl_dispersion_local` | Standard deviation of neighbors' inclinations (relative velocity proxy) |
| `alt_density_gradient` | Density gradient between adjacent altitude bands |

**Categorical features**:

| Feature | Description |
|---|---|
| `object_type_code` | 0=PAYLOAD, 1=ROCKET BODY, 2=DEBRIS, 3=UNKNOWN |
| `is_debris` | Binary debris flag |
| `is_uncontrolled` | Binary flag for non-maneuverable objects |

### 4. Target Construction (`CPS_log`)

The *Conjunction Proxy Score* (CPS) approximates the collision rate based on Kessler (1978):

```
CPS = debris_density_km3 × vrel_proxy

vrel_proxy = velocity_km_s × √(2 − 2 × cos(incl_dispersion_rad))
```

The raw CPS has values on the order of 10⁻⁸. To produce a target with statistically useful variance:

```
CPS_scaled = CPS / positive_median(CPS)   # median = 1.0
CPS_log    = log1p(CPS_scaled)             # distribution: mean=0.83, std=0.53
```

**Risk thresholds:**
- `LOW`: CPS_log < 0.40
- `MEDIUM`: 0.40 ≤ CPS_log ≤ 1.00
- `HIGH`: CPS_log > 1.00

---

## Machine Learning Model

### Validation strategy

To prevent spatial information leakage (objects at similar altitudes share the same environment), the split is performed by altitude band using `GroupKFold(5)`:

- **Train:** 80% of altitude bands (29 bands).
- **Test:** 20% of bands never seen by the model (7 bands).

### Models compared

| Model | CV RMSE | Test RMSE | Test MAE | R² (band-level) |
|---|---|---|---|---|
| Dummy (mean) | 0.707 | — | — | — |
| Ridge | 0.518 | — | — | — |
| **Random Forest** | **0.331** | **0.100** | **0.069** | **0.984** |
| HistGradientBoosting | 0.350 | — | — | — |

**Chosen model:** `RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)`

### Interpreting the metrics

The negative intra-group CV R² does not indicate model failure: within each altitude band, the standard deviation of CPS_log is ~0.033 (variance ≈ 0.001). Any prediction with RMSE > 0.033 yields R² < 0. The relevant metric is the **band-level R²**, which measures whether the model correctly ranks risk zones across different altitudes — and here the result is 0.984.

The model generalizes well: the 850–900 km band (the highest-risk zone) is predicted with a mean error of only 0.037 CPS_log units.

### Feature importance

The five most influential features (by Gini importance):

| Feature | Relative importance | Correlation with CPS_log |
|---|---|---|
| `debris_fraction_local` | 0.315 | +0.806 |
| `local_density_km3` | 0.284 | −0.301 |
| `is_debris` | 0.165 | +0.564 |
| `is_uncontrolled` | 0.112 | +0.549 |
| `incl_dispersion_local` | 0.048 | −0.604 |

The debris fraction in the neighborhood alone accounts for ~32% of the model's total feature importance.

### Model loading

The trained model is persisted in `models/best_model.joblib` (~56 MB). On backend startup, it is loaded as a singleton via `joblib.load`. The 13 input features are validated against an internal list before inference to prevent silent failures.

---

## Backend API

**Technologies:** FastAPI · Uvicorn · Pydantic v2 · Pandas · scikit-learn · PyArrow

**Initialization:** on startup via `lifespan`, the backend loads the model (`best_model.joblib`) and the processed dataset (`processed_features.parquet`), pre-computing Pearson correlations, histograms, and scatter plot samples.

### Endpoints

#### `GET /health`
Checks whether the server is operational.
```json
{ "status": "ok" }
```

---

#### `GET /objects`
Returns the paginated list of orbital objects with their predictions.

**Query params:** `page`, `limit`, `risk` (LOW | MEDIUM | HIGH), `search` (NORAD ID or type), `sort`, `order`

```json
{
  "items": [
    { "norad_cat_id": 25544, "object_type": "PAYLOAD", "altitude_km": 418.5,
      "predicted_CPS_log": 0.312, "risk_category": "LOW", "..." : "..." }
  ],
  "total": 27994,
  "page": 1,
  "pages": 560,
  "limit": 50
}
```

---

#### `GET /objects/{norad_id}`
Returns the full detail of a single object, including all 13 features and the prediction.

---

#### `GET /analytics/summary`
General catalog statistics: total objects, mean/std/min/max of CPS_log, risk category counts, and a 60-bin histogram.

---

#### `GET /analytics/by-altitude`
Aggregation by 50 km band: object count, mean CPS_log, and percentage of HIGH-risk objects per band.

---

#### `GET /analytics/scatter`
Stratified sample of 2,000 points for an altitude vs. CPS_log scatter plot, with risk category and object type.

---

#### `GET /analytics/by-type`
Breakdown by object type (PAYLOAD, ROCKET BODY, DEBRIS, UNKNOWN): count, mean CPS_log, and HIGH percentage.

---

#### `GET /analytics/feature-importance`
Random Forest Gini importances for each of the 13 features.

---

#### `GET /analytics/correlations`
Pearson correlations between each feature and CPS_log, computed over the full dataset.

---

#### `POST /predict`
Real-time prediction for a hypothetical object. Useful for exploratory scenarios ("what happens if I place a satellite at 800 km with an inclination of 87°?").

**Request body:**
```json
{
  "altitude_km": 750.0,
  "inclination_deg": 53.0,
  "eccentricity": 0.001,
  "velocity_km_s": 7.5,
  "period_min": 99.0,
  "bstar_abs": 0.0001,
  "local_density_km3": 6e-8,
  "debris_fraction_local": 0.36,
  "incl_dispersion_local": 17.7,
  "alt_density_gradient": 0.0,
  "object_type_code": 0,
  "is_debris": 0,
  "is_uncontrolled": 0
}
```

**Response:**
```json
{
  "predicted_CPS_log": 0.693,
  "risk_category": "MEDIUM",
  "input_features": { "...": "..." }
}
```

---

## Frontend

**Technologies:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts · SWR · Framer Motion

The frontend consumes the API via SWR hooks with a 35-second timeout (the Railway backend may have a cold start). It supports two languages (English and Portuguese) via React context without external i18n dependencies.

### Pages

| Route | Description |
|---|---|
| `/` | Main dashboard with KPIs, histogram, risk pie chart, and scatter plot |
| `/analytics` | Analysis by object type, correlations, and feature importance |
| `/objects` | Paginated, filterable table of all 27,994 objects |
| `/objects/[norad_id]` | Detail page for a single object |
| `/predicao` | Interactive prediction tool for hypothetical scenarios |
| `/glossario` | Definitions of technical terms used in the system |

### Key components

**Dashboard:**
- `KpiCards` — 4 KPIs: total objects, mean CPS_log, % high risk, % low risk.
- `RiskHistogram` — 60-bin histogram of CPS_log for the entire population.
- `RiskPieChart` — proportional distribution across LOW, MEDIUM, and HIGH.
- `AltitudeBarChart` — stacked bar chart by 50 km band.
- `RiskScatter` — interactive altitude vs. CPS_log scatter, 2,000 stratified points.

**Objects:**
- `ObjectsTable` — NORAD ID search, risk filter, sortable columns, pagination.
- `RiskBadge` — colored badge (green/amber/red) with risk icon.

**Prediction:**
- `PredictForm` — three panels: orbital parameters, local environment + object type, result.
  - Object type dropdown automatically adjusts `is_debris` and `is_uncontrolled`.
  - Result displays CPS_log, risk category, and a textual description of the thresholds.

---

## Notebooks

| Notebook | Purpose |
|---|---|
| `01_eda.ipynb` | Raw data exploration: composition, temporal distribution, altitude analysis, historical events. |
| `02_features.ipynb` | Feature engineering: computes local density, inclination dispersion, CPS_log, and RRI per altitude band. |
| `03_model.ipynb` | ML model training and evaluation; saves `best_model.joblib`. |
| `03_modelo_ml.ipynb` | Variant with temporal risk projections through 2035 using polynomial growth of the orbital population. |

---

## Project Structure

```
orbital-risk-analysis/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app, lifespan, CORS, router inclusion
│       ├── model.py            # Singleton for joblib model loading
│       ├── data_loader.py      # Loads Parquet, pre-computes histograms and scatter
│       ├── schemas.py          # Pydantic request/response schemas
│       ├── routes/
│       │   ├── objects.py      # GET /objects, GET /objects/{id}
│       │   ├── analytics.py    # GET /analytics/*
│       │   └── predict.py      # POST /predict
│       └── services/
│           └── prediction.py   # predict_single, predict_batch, risk_category
│
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard
│   │   ├── analytics/
│   │   ├── objects/
│   │   ├── predicao/
│   │   └── glossario/
│   ├── components/             # React components
│   ├── hooks/                  # SWR hooks (useAnalytics, useObjects)
│   └── lib/                    # api.ts, types.ts, i18n.ts, utils.ts
│
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_features.ipynb
│   ├── 03_model.ipynb
│   └── 03_modelo_ml.ipynb
│
├── data/
│   ├── raw/
│   │   ├── satcat.csv          # Historical catalog (68,467 objects)
│   │   ├── gp_leo.csv          # LEO orbital elements (28,038 objects)
│   │   └── celestrak_active_sats.csv
│   └── processed/
│       ├── processed_features.parquet   # ML dataset (27,994 × 19 columns)
│       ├── features_risco_leo.csv       # RRI per 100 km band (18 bands)
│       ├── features_por_faixa_50km.csv  # Aggregated by 50 km band
│       ├── irr_projetado_2024_2035.csv  # Risk projections through 2035
│       └── model_metrics.csv            # CV/test metrics for all 4 models
│
├── models/
│   └── best_model.joblib       # Trained Random Forest (~56 MB)
│
├── src/
│   └── data_loader.py          # Data collection script via Space-Track API
│
├── README.md                   # This file (English)
├── README.pt-br.md             # Portuguese version
├── Dockerfile                  # Backend (Python 3.12-slim)
├── railway.toml                # Railway config (builder: dockerfile)
├── pyproject.toml              # Python dependencies (uv/pip)
└── .env.example                # SPACETRACK_USER, SPACETRACK_PASS
```

---

## How to Run

### Prerequisites

- Python 3.12+
- Node.js 20+
- Free account at [Space-Track](https://www.space-track.org) (to collect fresh data)
- The files `data/processed/processed_features.parquet` and `models/best_model.joblib` must exist for the backend to run. If they do not exist yet, run the notebooks in the order described below.

### 1. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your Space-Track credentials
```

### 2. (Optional) Reprocess data and retrain the model

Run the notebooks in this order:

```
notebooks/01_eda.ipynb
notebooks/02_features.ipynb
notebooks/03_model.ipynb
```

Install development dependencies:

```bash
pip install -e .
# or, with uv:
uv sync
```

### 3. Backend (development)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Interactive documentation (Swagger): `http://localhost:8000/docs`.

### 4. Frontend (development)

```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local must contain: NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

### 5. Via Docker (backend)

```bash
docker build -t orbital-risk .
docker run -e PORT=8000 -p 8000:8000 orbital-risk
```

The Dockerfile automatically copies `models/` and `data/processed/` into the container.

---

## Deployment

| Layer | Platform | Configuration |
|---|---|---|
| Backend | [Railway](https://railway.app) | `railway.toml` with Dockerfile builder. Environment variable: `PORT`. |
| Frontend | [Vercel](https://vercel.com) | Native Next.js. Variable: `NEXT_PUBLIC_API_URL=https://<your-backend>.railway.app`. |

The frontend uses a 35-second request timeout to accommodate the cold start of Railway's free tier.

---

## Model and Domain Limitations

### Physical limitations

- **One-dimensional neighborhood:** local density is computed only by altitude (±50 km), ignoring RAAN (*Right Ascension of Ascending Node*) and argument of perigee. Two objects at the same altitude but with perpendicular orbital planes may never meet — or may meet at maximum frequency. The model does not distinguish between these cases.
- **No orbital propagation:** TLE elements are static. The model does not simulate orbit evolution over time (atmospheric drag decay, lunisolar perturbations, Yarkovsky effect).
- **Uniform cross-section:** all objects are treated as having the same collision area. In reality, a bolt and a 500 kg satellite present very different risks.
- **No maneuvers:** the model does not differentiate a satellite capable of avoiding a fragment from a passive object. Although `is_uncontrolled` is a feature, the effect of preventive maneuvers is not modeled.

### Target limitations (CPS_log)

- The *Conjunction Proxy Score* is a physically motivated heuristic, not a collision probability computed via real conjunction analysis (with TCA, miss distance, error ellipsoids, etc.).
- Median-based scaling introduces dependence on the training set: if the orbital population changes significantly, the risk thresholds (LOW/MEDIUM/HIGH) would need recalibration.

### Data limitations

- The Space-Track catalog covers radar-trackable objects (~10 cm in LEO). Smaller objects — which represent the majority of the real debris population — are invisible to the model.
- Objects classified as UNKNOWN (~1.4% of the dataset) have their type features set conservatively, which may underestimate or overestimate actual risk.
- The dataset is a static snapshot. The LEO population changes continuously with new launches and decays.

---

## Next Steps

### Modeling improvements

- **TLE propagation with SGP4:** use `sgp4` or `poliastro` to propagate orbits and compute real encounters (miss distance, TCA).
- **3D neighborhood:** replace the 1D density (±50 km by altitude) with a volumetric density that accounts for inclination and RAAN, better approximating the real encounter environment.
- **Collision Monte Carlo:** estimate absolute collision probabilities via simulation, incorporating TLE error ellipsoids.
- **Growth models:** incorporate approved constellation projections (Starlink Gen2, OneWeb, Amazon Kuiper) into future risk estimates.

### Data improvements

- **Automated updates:** periodic collection pipeline (daily or weekly) via the Space-Track API.
- **Integration with LeoLabs or ExoAnalytic:** higher-precision tracking data for small objects.
- **Real conjunction history:** use CARA (NASA) data or public CDM events to validate CPS_log against real collision probabilities.

### Product improvements

- **NORAD ID alerts:** notifications when the risk category of a specific object changes.
- **Temporal comparison:** visualize the risk evolution of an altitude band over months.
- **Simulation mode:** insert a hypothetical object into the dataset and observe how it affects the local neighbor density.

---

## References

- Kessler, D. J., & Cour-Palais, B. G. (1978). *Collision frequency of artificial satellites: The creation of a debris belt*. Journal of Geophysical Research, 83(A6), 2637–2646.
- Liou, J.-C., & Johnson, N. L. (2006). *Risks in space from orbiting debris*. Science, 311(5759), 340–341.
- Space-Track.org — public orbital object catalog maintained by the 18th Space Control Squadron (USA): https://www.space-track.org
- CelesTrak — public TLE repository and space traffic analysis: https://celestrak.org
- NASA Orbital Debris Program Office: https://orbitaldebris.jsc.nasa.gov
- European Space Agency, Space Debris Office — *ESA's Annual Space Environment Report*: https://www.esa.int/Space_Safety/Space_Debris
- Klinkrad, H. (2006). *Space Debris: Models and Risk Analysis*. Springer Praxis Books.

---

*MIT License. Copyright 2026 Lucas Müller.*
