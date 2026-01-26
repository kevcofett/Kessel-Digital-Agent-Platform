"""
Search Benchmarks Azure Function

Searches and retrieves benchmark data from Dataverse.
Supports filtering by vertical, channel, and metric type.
"""

import azure.functions as func
import json
import logging
from typing import Dict, Any, List
from datetime import datetime

from ..shared.benchmark_service import get_benchmark_service
from ..shared.validators import validate_search_benchmarks_request

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Search Benchmarks Azure Function

    Searches benchmarks with filters:
    - vertical: Industry vertical (e.g., retail, ecommerce)
    - channel: Media channel (e.g., Paid Search, Paid Social)
    - metric_type: Metric type (e.g., CPM, CTR, CVR)

    Returns benchmark data with:
    - Low, median, high, best-in-class values
    - Confidence level
    - Data source and period
    """
    logger.info('SearchBenchmarks function processing request.')

    try:
        req_body = req.get_json()

        # Validate request
        validation = validate_search_benchmarks_request(req_body)
        if not validation.is_valid:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "VALIDATION_ERROR",
                    "message": validation.error_message,
                    "details": validation.errors
                }),
                status_code=400,
                mimetype="application/json"
            )

        # Extract filters
        vertical = req_body.get("vertical")
        channel = req_body.get("channel")
        metric_type = req_body.get("metric_type")
        include_inactive = req_body.get("include_inactive", False)

        # Get benchmark service
        benchmark_service = get_benchmark_service()

        # Search benchmarks
        benchmarks = benchmark_service.search_benchmarks(
            vertical=vertical,
            channel=channel,
            metric_type=metric_type,
            include_inactive=include_inactive
        )

        # Get available filter options
        available_verticals = benchmark_service.get_available_verticals()

        # Group results by channel if requested
        grouped = req_body.get("group_by")
        if grouped == "channel":
            grouped_results = {}
            for bm in benchmarks:
                ch = bm.get("channel", "Unknown")
                if ch not in grouped_results:
                    grouped_results[ch] = []
                grouped_results[ch].append(bm)
            benchmarks = grouped_results
        elif grouped == "vertical":
            grouped_results = {}
            for bm in benchmarks:
                v = bm.get("vertical", "Unknown")
                if v not in grouped_results:
                    grouped_results[v] = []
                grouped_results[v].append(bm)
            benchmarks = grouped_results

        result = {
            "status": "success",
            "benchmarks": benchmarks,
            "filters_applied": {
                "vertical": vertical,
                "channel": channel,
                "metric_type": metric_type,
                "include_inactive": include_inactive
            },
            "available_options": {
                "verticals": available_verticals
            },
            "metadata": {
                "total_results": len(benchmarks) if isinstance(benchmarks, list) else sum(len(v) for v in benchmarks.values()),
                "searchedAt": datetime.utcnow().isoformat(),
                "dataSource": "Dataverse"
            }
        }

        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )

    except json.JSONDecodeError:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INVALID_JSON",
                "message": "Request body must be valid JSON"
            }),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"SearchBenchmarks error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )
