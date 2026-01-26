"""
Health Check Azure Function

Provides health check endpoints for all MPA functions.
Supports both individual function health checks and aggregate health status.

Routes:
- GET /health - Aggregate health status of all functions
- GET /health/{function} - Individual function health check
  - /health/allocation
  - /health/gap
  - /health/spo
  - /health/document
  - /health/projections
  - /health/benchmarks
  - /health/session
  - /health/validate-gate
"""

import azure.functions as func
import json
import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Function route mappings
FUNCTION_ROUTES = {
    "allocation": "CalculateBudgetAllocation",
    "gap": "CalculateGap",
    "spo": "CalculateSPO",
    "document": "GenerateDocument",
    "projections": "RunProjections",
    "benchmarks": "SearchBenchmarks",
    "session": "SessionManager",
    "validate-gate": "ValidateGate",
}


def get_function_health(function_name: str) -> Dict[str, Any]:
    """
    Get health status for a specific function.

    Args:
        function_name: The function name

    Returns:
        Health status dictionary
    """
    try:
        # Import cache manager for stats
        from ..shared.cache_manager import CacheManager
        cache = CacheManager()
        cache_stats = cache.get_stats()
    except Exception:
        cache_stats = None

    return {
        "status": "healthy",
        "function": function_name,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": os.environ.get("MPA_VERSION", "5.2.0"),
        "environment": os.environ.get("MPA_ENVIRONMENT", "development"),
        "cache": cache_stats
    }


def get_aggregate_health() -> Dict[str, Any]:
    """
    Get aggregate health status for all functions.

    Returns:
        Aggregate health status dictionary
    """
    function_statuses = {}
    all_healthy = True

    for route, function_name in FUNCTION_ROUTES.items():
        try:
            status = get_function_health(function_name)
            function_statuses[function_name] = {
                "status": status["status"],
                "route": f"/{route}/health"
            }
            if status["status"] != "healthy":
                all_healthy = False
        except Exception as e:
            function_statuses[function_name] = {
                "status": "error",
                "route": f"/{route}/health",
                "error": str(e)
            }
            all_healthy = False

    return {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": os.environ.get("MPA_VERSION", "5.2.0"),
        "environment": os.environ.get("MPA_ENVIRONMENT", "development"),
        "functions": function_statuses,
        "total_functions": len(FUNCTION_ROUTES),
        "healthy_functions": sum(
            1 for f in function_statuses.values()
            if f["status"] == "healthy"
        )
    }


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Health Check Azure Function

    Handles health check requests for all MPA functions.
    Supports individual function health checks and aggregate status.

    Route: /health/{function?}
    - /health - Aggregate health of all functions
    - /health/allocation - CalculateBudgetAllocation health
    - /health/gap - CalculateGap health
    - etc.
    """
    logger.info("HealthCheck function processing request.")

    try:
        # Get the function parameter from route
        function_route = req.route_params.get("function", "")

        # If no specific function, return aggregate health
        if not function_route:
            health_data = get_aggregate_health()
            return func.HttpResponse(
                json.dumps(health_data),
                status_code=200,
                mimetype="application/json"
            )

        # Check if this is a valid function route
        if function_route in FUNCTION_ROUTES:
            function_name = FUNCTION_ROUTES[function_route]
            health_data = get_function_health(function_name)
            return func.HttpResponse(
                json.dumps(health_data),
                status_code=200,
                mimetype="application/json"
            )

        # Unknown function - return 404 with available options
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "NOT_FOUND",
                "message": f"Unknown function: {function_route}",
                "available_functions": list(FUNCTION_ROUTES.keys()),
                "available_routes": [
                    f"/health/{route}" for route in FUNCTION_ROUTES.keys()
                ] + ["/health"]
            }),
            status_code=404,
            mimetype="application/json"
        )

    except Exception as e:
        logger.error(f"HealthCheck error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )
