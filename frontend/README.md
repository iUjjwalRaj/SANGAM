# Frontend Subsystem

## Purpose
The `frontend/` directory contains the modern web application for SANGAM. Built with React 19, TypeScript, and Vite, it delivers a meteorological forecasting dashboard featuring interactive vector mapping via MapLibre GL, multi-model forecast comparison tables, dynamic reliability weight meters, uncertainty visualizers, and historical validation audit reports.

---

## Where It Fits in SANGAM

```
                   [ User / Meteorologist ]
                              │
                              ▼
            ┌────────────────────────────────────┐
            │       React 19 Application         │
            │     (`frontend/src/App.tsx`)       │
            └─────────────────┬──────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
  [ Pages ]             [ Components ]          [ Cartography ]
`src/pages/`           `src/components/`       `ForecastMap.tsx`
 - OverviewPage         - ModelWeightBar        - Leaflet 1.9.4
 - ForecastPage         - UncertaintyCard       - MapLibre GL
 - ModelIntelPage       - ExtremeWeatherAlert   - Local Style JSON
 - ValidationPage       - VerificationModal     - SOI Aligned Overlay
 - IndianNWPPage        - Header / Navigation   - Static Worker Bundle
 - ExplainabilityPage
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                              ▼
                     [ API Service Layer ]
                   `src/services/api.ts`
                              │
                              │ HTTP / REST (/api/*)
                              ▼
                     [ SANGAM Backend API ]
```

---

## Contents

| File / Directory | Purpose |
|:---|:---|
| `package.json` | Node dependencies, scripts (`dev`, `build`, `preview`), and project metadata. |
| `vite.config.ts` | Vite bundler settings, dependency optimization, and `/api` reverse-proxy routing. |
| `src/App.tsx` | Main routing shell, navigation header, and theme persistence state manager. |
| `src/index.css` | Comprehensive semantic design system (Light, Dark, OLED color tokens and typography). |
| `src/pages/` | Distinct view pages: `OverviewPage`, `ForecastPage`, `ModelIntelligencePage`, `ValidationPage`, `IndianNWPPage`, `ExplainabilityPage`. |
| `src/components/` | Modular UI components: `ForecastMap`, `ForecastTable`, `ModelWeightBar`, `UncertaintyCard`, `ExtremeWeatherAlert`, `VerificationModal`, `LeadTimePanel`, `IndianModelSection`. |
| `src/services/api.ts` | Frontend REST client communicating with the backend API via standardized relative `/api` paths. |
| `src/types/` | Strongly typed TypeScript domain interfaces mirroring backend Pydantic schemas. |
| `public/data/` | Static data assets: `maplibre-style.json` (OpenFreeMap Liberty derived style), `india-boundary.json` (DataMeet simplified land boundary overlay), and `BOUNDARIES.md` (licensing & provenance audit). |
| `public/maplibre/` | Pre-bundled static Web Worker files (`maplibre-gl-worker.mjs`, `maplibre-gl-shared.mjs`) ensuring seamless worker loading across dev and production. |

---

## Inputs
- **User Interactions**: Location selections (pre-set cities or arbitrary map clicks), forecast lead-time adjustments (slider $T+24\text{h}$ to $T+120\text{h}$), and theme toggles (`light`, `dark`, `oled`).
- **Backend API Data**: JSON responses from `/api/forecast`, `/api/locations`, `/api/models`, `/api/verification`, and `/api/lead-time-analysis`.
- **Map Vector Tiles**: PBF vector tile streams from OpenFreeMap (`https://tiles.openfreemap.org/planet`).

---

## Outputs
- **Interactive Geospatial Visualizations**: Responsive canvas maps rendering terrain, roads, place labels, and national boundaries.
- **Forecast Displays**: Blended consensus numbers, raw candidate forecasts, and dynamic reliability percentages.
- **Uncertainty & Risk Cards**: Lower/upper bound intervals and early warning alerts for severe weather.
- **Scientific Audit Panels**: Comprehensive benchmark tables and bootstrap confidence interval visualizers.

---

## Dependencies
- **Internal**: Depends on the SANGAM Backend running at `/api` (or proxied to `http://localhost:8000`).
- **External**: Node.js 18+, `react` (v19), `react-dom`, `react-router-dom` (v7), `leaflet`, `maplibre-gl`, `@maplibre/maplibre-gl-leaflet`, `lucide-react`.

---

## Used By
- **Operational Meteorologists & Disaster Authorities**: For evaluating multi-model forecast consensus and severe hazard warnings.
- **Researchers & Evaluators**: For auditing empirical validation results, regional decompositions, and feature attributions.

---

## How to Run & Test

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start local development server (port 5173 with proxy to backend)
npm run dev

# Run TypeScript type verification
npx tsc -b --noEmit

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Important Design Decisions
1. **Isolated Vector Cartography**: To avoid displaying competing international/disputed boundaries under the India-specific boundary overlay, standard raster OSM tiles were replaced with a MapLibre vector style where `boundary_2` (international borders) and `boundary_disputed` are set to `visibility: "none"`, while preserving state boundaries and geographic context.
2. **Static Web Worker Bundle**: Placed `maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs` directly in `public/maplibre/` with `setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')`. This avoids bundler chunking regressions in production builds.
3. **Tri-Theme Engine**: Built entirely in Vanilla CSS using CSS custom properties (`--bg-primary`, `--card-bg`, `--accent-primary`), enabling zero-re-render switching between Light, Dark, and battery-saving OLED themes.

---

## Important Constraints
- **Cartographic Provenance**: The India boundary overlay must always be described as *"aligned with the Survey of India representation"* with attribution to DataMeet (CC0). It must never be claimed as a direct Survey of India dataset.
- **Third-Party Attribution**: Mandatory attribution to OpenFreeMap, OpenMapTiles, and OpenStreetMap contributors must be preserved in map controls.
- **Metric Integrity**: Historical validation metrics must be displayed as **Mean Absolute Error (MAE)**, not RMSE.
- **No Fabricated SHAP**: Explainability must surface factual weight attribution and regime priors rather than synthetic feature importance bars.

---

## Related Documentation
- 📖 [Root README](../README.md)
- 📖 [Detailed Technical Explanation](../DETAILED_EXPLANATION.md)
- 🗺️ [Boundary & Cartography Provenance](public/data/BOUNDARIES.md)
- ⚙️ [Backend Subsystem README](../backend/README.md)
