"""
KDAP ML Model Serving API
FastAPI-based inference server for all KDAP models
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from model_loader import ModelRegistry, ModelNotFoundError

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Prometheus metrics
PREDICTION_COUNTER = Counter(
    'kdap_predictions_total',
    'Total predictions made',
    ['model_name', 'status']
)
PREDICTION_LATENCY = Histogram(
    'kdap_prediction_latency_seconds',
    'Prediction latency in seconds',
    ['model_name']
)

# Global model registry
model_registry: Optional[ModelRegistry] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    global model_registry
    
    # Startup
    logger.info("Starting KDAP Model Server...")
    model_path = os.getenv('MODEL_PATH', '/models')
    model_registry = ModelRegistry(model_path)
    await model_registry.load_all_models()
    logger.info(f"Loaded {len(model_registry.models)} models")
    
    yield
    
    # Shutdown
    logger.info("Shutting down KDAP Model Server...")
    if model_registry:
        await model_registry.unload_all_models()


# Create FastAPI app
app = FastAPI(
    title="KDAP ML Model Server",
    description="Inference API for KDAP machine learning models",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# =============================================================================
# Request/Response Models
# =============================================================================

class PredictionRequest(BaseModel):
    """Base prediction request."""
    features: Dict[str, Any] = Field(..., description="Input features for prediction")
    return_probabilities: bool = Field(False, description="Return probability scores")
    explain: bool = Field(False, description="Include feature explanations")


class BudgetOptimizationRequest(BaseModel):
    """Budget optimization specific request."""
    total_budget: float = Field(..., description="Total budget to allocate")
    channels: List[str] = Field(..., description="Available channels")
    historical_performance: Optional[Dict[str, float]] = Field(None, description="Historical ROI by channel")
    constraints: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Min/max per channel")


class PropensityRequest(BaseModel):
    """Propensity scoring request."""
    customers: List[Dict[str, Any]] = Field(..., description="Customer feature records")
    threshold: Optional[float] = Field(None, description="Classification threshold")


class AnomalyDetectionRequest(BaseModel):
    """Anomaly detection request."""
    metrics: List[Dict[str, Any]] = Field(..., description="Time series metric data")
    sensitivity: Optional[float] = Field(0.95, description="Detection sensitivity (0-1)")


class ChurnPredictionRequest(BaseModel):
    """Churn prediction request."""
    customers: List[Dict[str, Any]] = Field(..., description="Customer feature records")
    return_risk_factors: bool = Field(False, description="Include risk factor analysis")


class MediaMixRequest(BaseModel):
    """Media mix modeling request."""
    time_series_data: List[Dict[str, Any]] = Field(..., description="Weekly/monthly performance data")
    optimize_budget: Optional[float] = Field(None, description="Budget to optimize allocation")


class LookalikeRequest(BaseModel):
    """Lookalike audience request."""
    seed_audience: List[Dict[str, Any]] = Field(..., description="Seed customer profiles")
    candidate_pool: List[Dict[str, Any]] = Field(..., description="Candidate customers to score")
    top_n: int = Field(1000, description="Number of top matches to return")


class ResponseCurveRequest(BaseModel):
    """Response curve analysis request."""
    channel: str = Field(..., description="Channel to analyze")
    spend_data: List[Dict[str, float]] = Field(..., description="Historical spend/response pairs")
    curve_type: str = Field("hill", description="Curve type: hill, adbudg, log, power, logistic")


class PredictionResponse(BaseModel):
    """Standard prediction response."""
    model_name: str
    predictions: List[Any]
    probabilities: Optional[List[float]] = None
    explanations: Optional[List[Dict[str, float]]] = None
    metadata: Dict[str, Any] = {}
    latency_ms: float


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: str
    models_loaded: int
    model_names: List[str]


# =============================================================================
# API Endpoints
# =============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        models_loaded=len(model_registry.models) if model_registry else 0,
        model_names=list(model_registry.models.keys()) if model_registry else []
    )


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )


@app.get("/models")
async def list_models():
    """List available models."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    return {
        "models": [
            {
                "name": name,
                "type": model.model_type,
                "version": model.version,
                "loaded_at": model.loaded_at.isoformat()
            }
            for name, model in model_registry.models.items()
        ]
    }


@app.post("/predict/{model_name}", response_model=PredictionResponse)
async def predict(model_name: str, request: PredictionRequest):
    """Generic prediction endpoint for any model."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    start_time = datetime.utcnow()
    
    try:
        with PREDICTION_LATENCY.labels(model_name=model_name).time():
            result = await model_registry.predict(
                model_name,
                request.features,
                return_probabilities=request.return_probabilities,
                explain=request.explain
            )
        
        PREDICTION_COUNTER.labels(model_name=model_name, status='success').inc()
        
        latency_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        return PredictionResponse(
            model_name=model_name,
            predictions=result['predictions'],
            probabilities=result.get('probabilities'),
            explanations=result.get('explanations'),
            metadata=result.get('metadata', {}),
            latency_ms=latency_ms
        )
        
    except ModelNotFoundError:
        PREDICTION_COUNTER.labels(model_name=model_name, status='not_found').inc()
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    except Exception as e:
        PREDICTION_COUNTER.labels(model_name=model_name, status='error').inc()
        logger.exception(f"Prediction error for {model_name}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/budget/optimize")
async def optimize_budget(request: BudgetOptimizationRequest):
    """Budget optimization endpoint."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    try:
        result = await model_registry.run_budget_optimization(
            total_budget=request.total_budget,
            channels=request.channels,
            historical_performance=request.historical_performance,
            constraints=request.constraints
        )
        return result
    except Exception as e:
        logger.exception("Budget optimization error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/propensity/score")
async def score_propensity(request: PropensityRequest):
    """Propensity scoring endpoint."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    try:
        result = await model_registry.score_propensity(
            customers=request.customers,
            threshold=request.threshold
        )
        return result
    except Exception as e:
        logger.exception("Propensity scoring error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/anomaly/detect")
async def detect_anomalies(request: AnomalyDetectionRequest):
    """Anomaly detection endpoint."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    try:
        result = await model_registry.detect_anomalies(
            metrics=request.metrics,
            sensitivity=request.sensitivity
        )
        return result
    except Exception as e:
        logger.exception("Anomaly detection error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/churn/predict")
async def predict_churn(request: ChurnPredictionRequest):
    """Churn prediction endpoint."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    try:
        result = await model_registry.predict_churn(
            customers=request.customers,
            return_risk_factors=request.return_risk_factors
        )
        return result
    except Exception as e:
        logger.exception("Churn prediction error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/mmm/analyze")
async def analyze_media_mix(request: MediaMixRequest):
    """Media mix analysis endpoint."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    try:
        result = await model_registry.analyze_media_mix(
            time_series_data=request.time_series_data,
            optimize_budget=request.optimize_budget
        )
        return result
    except Exception as e:
        logger.exception("Media mix analysis error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/lookalike/score")
async def score_lookalike(request: LookalikeRequest):
    """Lookalike audience scoring endpoint."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    try:
        result = await model_registry.score_lookalike(
            seed_audience=request.seed_audience,
            candidate_pool=request.candidate_pool,
            top_n=request.top_n
        )
        return result
    except Exception as e:
        logger.exception("Lookalike scoring error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/response-curve/analyze")
async def analyze_response_curve(request: ResponseCurveRequest):
    """Response curve analysis endpoint."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    try:
        result = await model_registry.analyze_response_curve(
            channel=request.channel,
            spend_data=request.spend_data,
            curve_type=request.curve_type
        )
        return result
    except Exception as e:
        logger.exception("Response curve analysis error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/models/{model_name}/reload", status_code=202)
async def reload_model(model_name: str, background_tasks: BackgroundTasks):
    """Reload a specific model."""
    if not model_registry:
        raise HTTPException(status_code=503, detail="Model registry not initialized")
    
    background_tasks.add_task(model_registry.reload_model, model_name)
    return {"message": f"Model '{model_name}' reload initiated"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "serve:app",
        host="0.0.0.0",
        port=int(os.getenv('PORT', 8080)),
        workers=int(os.getenv('WORKERS', 2)),
        log_level=os.getenv('LOG_LEVEL', 'info').lower()
    )
