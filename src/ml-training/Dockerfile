# KDAP ML Training Docker Image
# Multi-stage build for optimized production image

# =============================================================================
# Stage 1: Builder - Install dependencies and compile
# =============================================================================
FROM python:3.11-slim as builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# =============================================================================
# Stage 2: Runtime - Minimal production image
# =============================================================================
FROM python:3.11-slim as runtime

LABEL maintainer="Kessel Digital <dev@kesseldigital.com>"
LABEL description="KDAP ML Training Environment"
LABEL version="1.0.0"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PATH="/opt/venv/bin:$PATH" \
    # MLflow settings
    MLFLOW_TRACKING_URI="" \
    MLFLOW_EXPERIMENT_NAME="kdap-ml" \
    # Model settings
    MODEL_OUTPUT_DIR=/models \
    DATA_DIR=/data \
    # Azure ML settings
    AZURE_ML_WORKSPACE="" \
    AZURE_ML_SUBSCRIPTION="" \
    AZURE_ML_RESOURCE_GROUP=""

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash mluser

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY kdap_ml/ ./kdap_ml/
COPY train.py .
COPY config/ ./config/

# Create directories for data and models
RUN mkdir -p /data /models /logs && \
    chown -R mluser:mluser /app /data /models /logs

# Switch to non-root user
USER mluser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import kdap_ml; print('OK')" || exit 1

# Default command shows help
ENTRYPOINT ["python", "train.py"]
CMD ["--help"]
