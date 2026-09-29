# SANGAM Production Deployment Architecture & Guide

This document specifies the production deployment architecture, configuration, and verification procedures for **SANGAM (Hybrid AI–NWP Multi-Model Forecast Blending System)**.

> **Status**: PREPARATION ONLY — NOT YET DEPLOYED.
> Scientific implementation and engineering baseline are frozen at commits `cb2fc82` and `0c3f442`.

---

## 1. Target Deployment Architecture

SANGAM utilizes a decoupled, serverless edge-plus-managed runtime architecture. No virtual machine (VM), custom Nginx daemon, systemd unit, or Kubernetes cluster is required.

```
                             ┌────────────────────────┐
                             │   Client Web Browser   │
                             └───────────┬────────────┘
                                         │ HTTPS (:443)
                                         ▼
                      ┌──────────────────────────────────────┐
                      │      Cloudflare Edge Network         │
                      │  (Cloudflare Worker + Static Assets) │
                      └───────┬──────────────────────┬───────┘
                              │                      │
             /*, /assets/*,   │                      │  /api/* (Reverse Proxy)
             Client SPA Routes│                      │
                              ▼                      ▼
                   ┌──────────────────┐    ┌───────────────────────────┐
                   │ Static SPA Build │    │  Managed FastAPI Backend  │
                   │ (frontend/dist/) │    │  (Container / Python PaaS)│
                   └──────────────────┘    │  uvicorn backend.app:app  │
                                           └─────────────┬─────────────┘
                                                         │
                                         ┌───────────────┼───────────────┐
                                         ▼               ▼               ▼
                                  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                                  │models/*.txt │ │data/proc/*. │ │backend/conf/│
                                  │  (LightGBM) │ │    json     │ │   *.yaml    │
                                  └─────────────┘ └─────────────┘ └─────────────┘
```

- **Frontend Edge Gateway**: Cloudflare Worker with Static Assets serving compiled React 19/Vite artifacts with Single-Page Application (SPA) routing fallback.
- **API Proxy**: The same Cloudflare Worker proxies all `/api/*` traffic transparently to the managed FastAPI service.
- **Backend Service**: Managed Python 3.10+ runtime or minimal container executing Uvicorn with ASGI multi-process workers.
- **Scientific Engine**: Dynamic weighting engine, NWP/AI ingestion, simplex normalizer, and verification modules running entirely within the backend process.

---

## 2. Frontend Production Build

The frontend is built using Vite and TypeScript:

```bash
cd frontend
npm run build
```

This compiles TypeScript (`tsc -b`) and generates production assets in `frontend/dist/`:
- `frontend/dist/index.html` — Application root HTML document.
- `frontend/dist/assets/index-*.js` — Minified React application bundle.
- `frontend/dist/assets/index-*.css` — Compiled CSS design system.
- `frontend/dist/data/` — Static boundary GeoJSON and MapLibre style sheets.
- `frontend/dist/maplibre/` — Self-hosted MapLibre Web Workers (`maplibre-gl-worker.mjs`, `maplibre-gl-shared.mjs`).
- `frontend/dist/plots/` — Pre-rendered verification and lead-time analysis diagnostic plots.

---

## 3. Cloudflare Worker Configuration

The edge gateway is configured in [`wrangler.jsonc`](../wrangler.jsonc):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "sangam-forecast",
  "main": "worker/index.js",
  "compatibility_date": "2026-03-01",
  "assets": {
    "directory": "./frontend/dist",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application"
  },
  "vars": {
    "BACKEND_API_URL": "http://127.0.0.1:8000"
  }
}
```

---

## 4. Static Asset Configuration

Cloudflare Workers Static Assets binds the `./frontend/dist` directory to the worker context as `env.ASSETS`.
- Edge caching and HTTP range requests are handled natively by Cloudflare.
- Content-type headers and brotli/gzip encodings are automatically applied.

---

## 5. Single-Page Application (SPA) Fallback

React Router routes (e.g. `/model-intelligence`, `/verification`) do not correspond to static disk files on the edge.
- Cloudflare Workers Static Assets is configured with:
  ```jsonc
  "not_found_handling": "single-page-application"
  ```
- When a client requests any non-asset path (e.g., `/model-intelligence`), the worker serves `frontend/dist/index.html` with an HTTP `200` status code, enabling client-side routing without 404 errors.

---

## 6. `/api/*` Proxy Configuration

The Worker entrypoint [`worker/index.js`](../worker/index.js) intercepts incoming HTTP requests:

1. **Path Discrimination**: If `url.pathname.startsWith('/api')`, the request is directed to the API proxy branch.
2. **Upstream URL Resolution**: The target URL is generated by combining `env.BACKEND_API_URL` with the original pathname and query parameters (`url.pathname + url.search`).
3. **Header Propagation**:
   - `X-Forwarded-Host` and `X-Forwarded-Proto` are attached.
   - Client headers and request body (for `POST`, `PUT`, etc.) are forwarded without modification.
4. **Resilience & Diagnostics**:
   - Returns structured `502 Bad Gateway` if `BACKEND_API_URL` is unset.
   - Returns structured `504 Gateway Timeout` if the managed FastAPI service is unreachable.
   - Appends `X-Proxied-By: SANGAM-Cloudflare-Worker` header to responses.

### Supported Frontend API Configurations

#### Configuration A: Same-Origin / Proxied (Recommended)
- Set in frontend environment:
  ```bash
  VITE_API_URL=/api
  ```
- All client requests target `/api/*` on the same domain as the web page.
- **Zero CORS preflight overhead**; maximum browser security and caching.

#### Configuration B: Dedicated API Domain
- Set at build time:
  ```bash
  VITE_API_URL=https://api.yourdomain.gov.in
  ```
- Client calls bypass the Worker proxy and query the FastAPI backend directly. Requires configuring `CORS_ORIGINS` on the backend.

---

## 7. FastAPI Backend Deployment

The backend service runs using an ASGI server.

### Option A: Native Managed Python PaaS (Render, Railway, Koyeb)
- **Runtime**: Python 3.11
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**:
  ```bash
  uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT --workers 4
  ```

### Option B: Containerized Deployment (Cloud Run, Fly.io, AWS App Runner)
Using the repository's production [`Dockerfile`](../Dockerfile):
```bash
docker build -t sangam-backend:latest .
docker run -p 8000:8000 sangam-backend:latest
```

---

## 8. Required Backend Runtime Resources

The backend container/environment MUST retain the following directory structure:

```
/app
├── backend/
│   ├── app/                # Application routes, models, and blending algorithms
│   └── config/             # Required YAML configurations
│       ├── settings.yaml
│       ├── heuristics.yaml
│       └── extreme_events.yaml
├── models/                 # Trained LightGBM booster text dumps
│   ├── target_w_ifs_lgb.txt
│   ├── target_w_gfs_lgb.txt
│   ├── target_w_icon_lgb.txt
│   ├── target_w_aifs_lgb.txt
│   ├── target_w_ens_lgb.txt
│   └── target_w_bfs_lgb.txt
└── data/processed/         # Validation results and lead-time analysis
    ├── real_evaluation_results.json
    └── lead_time_analysis.json
```

---

## 9. Environment Variables Specification

| Component | Variable Name | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| **Backend** | `APP_NAME` | `SANGAM` | System display name. |
| **Backend** | `APP_ENV` | `production` | Environment mode (`development` or `production`). |
| **Backend** | `API_HOST` | `0.0.0.0` | Host IP interface to bind to. |
| **Backend** | `API_PORT` | `8000` | Port number to listen on. |
| **Backend** | `CORS_ORIGINS` | *(empty in proxied setup)* | Comma-separated list or JSON array of authorized origins. |
| **Backend** | `DEFAULT_DATA_MODE`| `auto` | Data provider mode (`auto`, `live`, or `demo`). |
| **Backend** | `OPEN_METEO_BASE_URL` | `https://api.open-meteo.com/v1` | Live NWP and atmospheric ingestion API base URL. |
| **Backend** | `OPEN_METEO_ENSEMBLE_URL`| `https://ensemble-api.open-meteo.com/v1` | Ensemble ingestion API base URL. |
| **Frontend** | `VITE_API_URL` | `/api` | Base path for frontend API calls. |
| **Worker** | `BACKEND_API_URL` | `https://backend.internal` | Target URL of the managed FastAPI service. |

---

## 10. CORS Hardening

In production (`APP_ENV=production`), CORS behavior is hardened in [`backend/app/main.py`](../backend/app/main.py):

1. **Proxied Architecture (Worker `/api/*`)**:
   - The browser communicates same-origin with the Cloudflare Worker.
   - When `CORS_ORIGINS` is unset, no cross-origin headers are returned, preventing unauthorized third-party websites from making cross-origin AJAX calls to the backend.
2. **Dedicated API Domain**:
   - Set `CORS_ORIGINS=https://sangam.yourdomain.gov.in`.
   - The backend validates the origin and permits cross-origin requests exclusively from the designated frontend domain.
   - Wildcards (`*`) with credentials (`allow_credentials=True`) are strictly forbidden per modern browser CORS specifications.

---

## 11. Production Health Check

### Health Check Endpoint: `GET /api/health`

Used by container orchestrators, load balancers, and Cloudflare Worker health probes.

**Sample Request**:
```bash
curl -s http://localhost:8000/api/health
```

**Expected JSON Response (HTTP 200)**:
```json
{
  "status": "healthy",
  "system": "SANGAM",
  "version": "1.0.0",
  "timestamp": "2026-09-30T00:50:00.000000+00:00",
  "providers_available": [
    "OpenMeteoProvider (Live)",
    "BFSProvider (Indian NWP 6km Architecture)",
    "DemoProvider (Offline/Simulated)"
  ],
  "models_integrated": [
    "ECMWF IFS (NWP Global (Deterministic))",
    "ECMWF AIFS (AI Weather Model)",
    "NOAA GFS (NWP Global)",
    "DWD ICON (NWP Global)",
    "ECMWF Ensemble (EPS) (Ensemble NWP)",
    "Bharat Forecast System (BFS) (Indigenous Indian NWP (MoES / IITM))"
  ]
}
```

### Complete SANGAM API Endpoint Reference

| Endpoint | Method | Parameters | Description |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | None | Service liveness, metadata, and registered model list. |
| `/api/locations` | `GET` | None | Preset Indian meteorological monitoring locations. |
| `/api/models` | `GET` | None | Full model registry with validation status and track taxonomy. |
| `/api/forecast` | `GET` | `lat`, `lon`, `lead_time`, `mode`, `variable` | End-to-end multi-model forecast blending pipeline. |
| `/api/verification` | `GET` | `region`, `lead_time`, `dataset` | Empirical verification metrics (Track A synthetic vs Track B ERA5). |
| `/api/extremes` | `GET` | `lat`, `lon`, `lead_time`, `mode` | Extreme event detection (heavy rainfall, heatwave, wind gusts). |
| `/api/lead-time-analysis`| `GET`| None | Empirical out-of-sample lead-time degradation metrics. |
| `/api/weights` | `GET` | `lat`, `lon`, `lead_time`, `mode` | Isolated dynamic model weights and simplex attribution. |
| `/api/uncertainty` | `GET` | `lat`, `lon`, `lead_time`, `mode` | Ensemble spread, disagreement index, and confidence score. |

---

## 12. Production Smoke Test Procedure

Execute after deploying Worker and backend services:

```bash
TARGET_URL="https://your-deployment-domain.workers.dev"

# 1. Verify Root SPA Loads
curl -I -s "${TARGET_URL}/" | head -n 1
# Expected: HTTP/2 200

# 2. Verify SPA Fallback for Client-Side Routes
curl -I -s "${TARGET_URL}/model-intelligence" | head -n 1
# Expected: HTTP/2 200

# 3. Verify Static Asset Delivery
curl -I -s "${TARGET_URL}/data/india-boundary.json" | head -n 1
# Expected: HTTP/2 200 (Content-Type: application/json)

# 4. Verify API Proxying Through Worker
curl -s "${TARGET_URL}/api/health" | grep -q '"status":"healthy"' && echo "API Health: PASSED"

# 5. Verify Blending Pipeline
curl -s "${TARGET_URL}/api/forecast?lat=28.6139&lon=77.2090&lead_time=24" | grep -q '"blended_forecast"' && echo "Forecast Blending: PASSED"
```

---

## 13. Custom Domain & DNS Configuration

1. In Cloudflare Dashboard:
   - Navigate to **Workers & Pages** → **sangam-forecast** → **Settings** → **Domains & Routes**.
   - Select **Add Custom Domain** (e.g. `sangam.weather.gov.in`).
   - Cloudflare provisions the SSL/TLS certificate automatically and routes all traffic to the Worker.
2. For the Managed Backend:
   - Assign an internal or sub-domain (e.g. `api-internal.weather.gov.in`).
   - Set `BACKEND_API_URL=https://api-internal.weather.gov.in` in the Worker environment secrets via:
     ```bash
     wrangler secret put BACKEND_API_URL
     ```

---

## 14. Rollback Procedure

### Cloudflare Worker Rollback
- Cloudflare preserves previous deployment versions.
- Roll back to the preceding deployment with:
  ```bash
  wrangler rollback [deployment-id]
  ```
  or select **Rollback** in the Cloudflare Dashboard under **Deployments**.

### Managed Backend Rollback
- If containerized, retag and redeploy the prior verified Docker image digest.
- If using Git-based PaaS deployment, redeploy previous commit `cb2fc82`.

---

## 15. Local Verification Procedure

To verify the complete architecture locally before deployment:

1. **Start Backend**:
   ```bash
   uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
   ```
2. **Build Frontend**:
   ```bash
   cd frontend && npm run build && cd ..
   ```
3. **Preview Edge Routing**:
   ```bash
   # Using Vite's built-in preview proxy:
   cd frontend && npm run preview
   ```
   Or using Cloudflare Wrangler:
   ```bash
   npx wrangler dev
   ```
4. Verify by accessing `http://localhost:4173/` or `http://localhost:8787/`.
