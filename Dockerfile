# SANGAM FastAPI Backend — Minimal Production Container
FROM python:3.11-slim

# Install minimal system dependencies (libgomp1 required for LightGBM OpenMP runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy application, scientific models, processed validation data, and configurations
COPY backend/ /app/backend/
COPY models/ /app/models/
COPY data/processed/ /app/data/processed/

# Production environment variables
ENV PYTHONUNBUFFERED=1 \
    APP_ENV=production \
    API_HOST=0.0.0.0 \
    API_PORT=8000

EXPOSE 8000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Production ASGI server execution (single worker to fit comfortably within Render Free 512MB RAM)
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
