from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings, system_config
from backend.app.api.routes import router
from backend.app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=====================================================")
    logger.info(" SANGAM Forecast Blending Engine Initialized")
    logger.info(" Ministry of Earth Sciences / NCMRWF")
    logger.info("=====================================================")
    yield
    logger.info("SANGAM Forecast Blending Engine Shutdown.")

app = FastAPI(
    title=system_config.get("system", {}).get("full_name", "SANGAM: Hybrid AI-NWP Multi-Model Forecast Blending System"),
    description="""
    **SANGAM — Ministry of Earth Sciences (MoES) / NCMRWF**
    *Problem Statement: 26081 — Hybrid AI-NWP Multi-Model Forecast Blending System*
    
    Dynamically blends operational NWP (ECMWF IFS, NOAA GFS) and AI weather models (ECMWF AIFS)
    using machine-learned atmospheric regime and skill-conditioned reliability weights.
    """,
    version=system_config.get("system", {}).get("version", "1.0.0"),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Production-hardened CORS configuration
if settings.app_env == "production":
    prod_origins = [o for o in (settings.cors_origins or []) if not ("localhost" in o or "127.0.0.1" in o)]
    if "*" in prod_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["*"],
        )
    elif prod_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=prod_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["*"],
        )
else:
    # Development mode: allow local development origins
    dev_origins = settings.cors_origins or [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    allow_cred = "*" not in dev_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=dev_origins,
        allow_credentials=allow_cred,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {
        "project": "SANGAM",
        "description": "Hybrid AI-NWP Multi-Model Forecast Blending System",
        "organization": "MoES / NCMRWF",
        "api_docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "forecast": "/api/forecast?lat=28.6139&lon=77.2090&lead_time=24",
            "models": "/api/models",
            "locations": "/api/locations",
            "weights": "/api/weights",
            "uncertainty": "/api/uncertainty",
            "extremes": "/api/extremes",
            "verification": "/api/verification"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main.py:app", host=settings.api_host, port=settings.api_port, reload=True)
