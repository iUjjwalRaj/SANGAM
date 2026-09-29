# Deployment Readiness Report for SANGAM

## Overview
This report assesses the readiness of the **SANGAM** system for production deployment on the user’s existing Cloudflare infrastructure and a custom subdomain (e.g., `https://sangam.<my-domain>`). The assessment focuses on:
1. **Architecture suitability** – serverless vs. container/VM deployment.
2. **Backend dependencies** – Python packages, native extensions, file‑system access, and long‑running processes.
3. **Frontend build** – static asset generation and CDN serving.
4. **Data dependencies** – live provider APIs, offline datasets, and storage requirements.
5. **Failure handling** – strategies for provider outages and timeout handling.
6. **Security & secrets management** – safe handling of API keys and environment variables.
7. **Operational considerations** – logging, monitoring, scaling, and CI/CD.

---

## 1. Architecture Options
| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Cloudflare Workers (Edge)** | Deploy FastAPI via a Workers‑compatible runtime (e.g., `wrangler` with `python` support) and serve the static React build from Workers KV or Cloudflare Pages. | Low latency, automatic scaling, built‑in DDoS protection. | Workers have a **max execution time of 50 ms for CPU‑bound work** and a **memory limit of 128 MiB**. The backend uses heavy numerical libraries (`numpy`, `scipy`, `scikit‑learn`, `lightgbm`) which exceed Workers limits and rely on compiled C extensions.
| **Cloud Run (Fully‑managed containers)** | Package the FastAPI backend into a Docker image and deploy to Cloud Run; serve the static React build via Cloudflare Pages (CDN). | Supports any Linux libraries, unlimited request time (up to 60 min), automatic scaling, easy integration with Cloudflare DNS. | Slightly higher latency than pure edge, but still performant. Requires Docker image build and container registry.
| **VM / Compute Engine** | Deploy backend on a VM (e.g., Ubuntu) behind Cloudflare proxy; static assets served via Cloudflare Pages. | Full control over environment, can run background workers, simple to prototype. | Maintenance overhead (patching, scaling), not serverless.

**Recommendation:** Use **Cloud Run** for the backend because it satisfies the heavy numerical dependencies and provides a managed, autoscaling environment. The frontend should be built once (`npm run build`) and hosted on **Cloudflare Pages** for optimal CDN delivery.

---

## 2. Backend Dependency Audit
- **Python version:** `>=3.11` (specified in `backend/requirements.txt`).
- **Heavy libraries:** `numpy`, `pandas`, `scipy`, `scikit‑learn`, `lightgbm`, `xarray`. All compile compiled extensions; they are supported in standard Linux containers.
- **File‑system usage:**
  - Reads static JSON data under `backend/data/processed/` (e.g., `lead_time_analysis.json`).
  - Writes temporary logs via `backend/app/utils/logger.py`. No mutable state is persisted between requests.
- **Long‑running processes:** None. Inference is performed per request and finishes within seconds. The UVicorn server runs with `--reload` only for development; production will use the default worker mode.
- **Network calls:**
  - Live provider (`OpenMeteoProvider`) uses `httpx` for outbound HTTP requests.
  - BFSProvider may fetch model files from a mounted volume or remote storage (currently a placeholder). Ensure any required model files are bundled into the container image or made available via a Cloud Storage bucket.

**Conclusion:** All dependencies are container‑friendly; no native OS‑specific assumptions beyond a standard Linux environment.

---

## 3. Frontend Build & Delivery
- The React/Vite frontend builds to a static `dist/` directory (`npm run build`).
- The build output can be uploaded to **Cloudflare Pages** directly from the repository (GitHub integration) or via the CLI (`wrangler pages publish`).
- No server‑side rendering is required; all API calls go to the FastAPI backend hosted on Cloud Run.

---

## 4. Data Dependencies & Storage
| Data Type | Source | Persistence Requirement |
|----------|--------|--------------------------|
| **Synthetic demo data** | `backend/data/demo/` (Git‑tracked) | Read‑only, bundled in image. |
| **Real historical ERA5 reanalysis** | `backend/data/processed/` (JSON/Parquet) | Read‑only, bundled or mounted as read‑only volume. |
| **Live provider responses** | Open‑Meteo public API (no auth) | Stateless, fetched at request time. |
| **BFS model files** (if used) | Currently placeholder; future files may be large. | Should be stored in a Cloud Storage bucket and accessed via signed URLs or mounted volume. |

**Action:** Verify that all real‑world data files are < 100 MiB each (Cloud Run container file size limit). If larger, store them in a bucket and read at runtime.

---

## 5. Failure & Fallback Strategies
1. **Live provider timeout/failure** – The `ForecastProviderManager` already falls back to `DemoProvider`. Ensure an HTTP timeout (e.g., `httpx.Timeout(5.0)`) is configured to avoid hanging requests.
2. **BFSProvider unavailability** – Log a warning and skip BFS forecasts; the blending engine will continue with the validated track only.
3. **Container health checks** – Cloud Run health checks will restart the container on failures.
4. **Graceful degradation** – UI should display a banner if live data is unavailable, indicating that forecasts are based on the deterministic demo dataset.

---

## 6. Security & Secrets Management
- **Open‑Meteo** does not require an API key, but any future provider (e.g., proprietary Indian NWP) may need credentials.
- Store secrets in **Cloudflare Workers KV** (if using Workers) or **Google Secret Manager** (if using Cloud Run) and inject them as environment variables at deployment time.
- Ensure `.env.example` is not committed with real values; the repo already respects this via `.gitignore`.

---

## 7. Operational Considerations
- **CI/CD**: Use GitHub Actions to lint, run tests (`pytest`), build the Docker image, and push to Google Container Registry (GCR). Deploy to Cloud Run on merge to `main`.
- **Monitoring**: Enable Cloud Run **Cloud Logging** and **Cloud Monitoring**. Export logs to Cloudflare if desired.
- **Scaling**: Cloud Run will automatically scale to zero when idle and up to the configured maximum concurrency (default 80). Adjust concurrency if request latency spikes.
- **Observability**: Add request‑ID headers and propagate them through the backend for traceability.
- **Rollback**: Tag releases (`v1.0.0`, `v1.1.0`) and keep previous container images for quick rollback.

---

## 8. Checklist Before Deployment
- [ ] Validate that all heavy data files are either bundled (< 100 MiB) or stored in a bucket with read‑only access.
- [ ] Add explicit HTTP timeouts in `backend/app/forecasting/open_meteo.py` and any other external clients.
- [ ] Create a Dockerfile (if not present) that installs `backend/requirements.txt` and copies the `backend/app` package.
- [ ] Configure `cloudbuild.yaml` / GitHub Action for CI/CD.
- [ ] Set up Cloudflare Pages to build from the `frontend/` directory.
- [ ] Reserve a subdomain (`sangam.<my-domain>`) in Cloudflare DNS and point it to the Cloud Run service via a CNAME.
- [ ] Test the full stack in a staging environment (Cloud Run preview URL + Pages preview).

---

**Prepared by:** Antigravity AI Assistant
**Date:** 2026‑09‑29

*This document is intended for internal use to guide the production launch of SANGAM. No code changes have been made.*
