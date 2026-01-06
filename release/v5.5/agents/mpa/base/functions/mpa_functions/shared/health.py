"""
Health Check Utilities for MPA Azure Functions

Provides standardized health check responses for all MPA functions.
Used by the WarmupTrigger to verify function availability.
"""

import azure.functions as func
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Get cache manager for stats (optional, may not be initialized)
_cache_manager = None


def get_cache_stats() -> Optional[Dict[str, Any]]:
    """
    Get cache statistics if cache manager is available.

    Returns:
        Dictionary with cache stats, or None if unavailable
    """
    global _cache_manager
    if _cache_manager is None:
        try:
            from .cache_manager import CacheManager
            _cache_manager = CacheManager()
        except Exception:
            return None

    try:
        return _cache_manager.get_stats()
    except Exception:
        return None


def create_health_response(
    function_name: str,
    status: str = "healthy",
    include_cache_stats: bool = True,
    additional_info: Optional[Dict[str, Any]] = None
) -> func.HttpResponse:
    """
    Create a standardized health check response.

    Args:
        function_name: Name of the function (e.g., "SearchBenchmarks")
        status: Health status ("healthy", "degraded", "unhealthy")
        include_cache_stats: Whether to include cache statistics
        additional_info: Optional additional information to include

    Returns:
        HttpResponse with JSON health check data
    """
    response_data: Dict[str, Any] = {
        "status": status,
        "function": function_name,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": os.environ.get("MPA_VERSION", "5.2.0"),
        "environment": os.environ.get("MPA_ENVIRONMENT", "development")
    }

    # Add cache stats if requested and available
    if include_cache_stats:
        cache_stats = get_cache_stats()
        if cache_stats:
            response_data["cache"] = cache_stats

    # Add any additional info
    if additional_info:
        response_data.update(additional_info)

    return func.HttpResponse(
        json.dumps(response_data),
        status_code=200,
        mimetype="application/json"
    )


def is_health_check_request(req: func.HttpRequest) -> bool:
    """
    Check if the request is a health check request.

    Health check requests are:
    - GET requests to /health endpoint
    - GET requests with ?health=true query parameter

    Args:
        req: The HTTP request

    Returns:
        True if this is a health check request
    """
    # Check if request method is GET
    if req.method != "GET":
        return False

    # Check if route ends with /health
    route = req.route_params.get("restOfPath", "")
    if route.endswith("/health") or route == "health":
        return True

    # Check for health query parameter
    if req.params.get("health", "").lower() == "true":
        return True

    return False


def handle_health_check(
    req: func.HttpRequest,
    function_name: str,
    additional_checks: Optional[Dict[str, bool]] = None
) -> Optional[func.HttpResponse]:
    """
    Handle health check if the request is a health check request.

    This is a convenience function that combines is_health_check_request
    and create_health_response.

    Args:
        req: The HTTP request
        function_name: Name of the function
        additional_checks: Optional dictionary of component checks
            (e.g., {"dataverse": True, "cache": True})

    Returns:
        HttpResponse if this is a health check request, None otherwise

    Example:
        health_response = handle_health_check(req, "SearchBenchmarks")
        if health_response:
            return health_response
        # Continue with normal request processing
    """
    if not is_health_check_request(req):
        return None

    # Determine status based on additional checks
    status = "healthy"
    if additional_checks:
        if not all(additional_checks.values()):
            status = "degraded"

    additional_info = {}
    if additional_checks:
        additional_info["components"] = additional_checks

    return create_health_response(
        function_name=function_name,
        status=status,
        include_cache_stats=True,
        additional_info=additional_info if additional_info else None
    )
