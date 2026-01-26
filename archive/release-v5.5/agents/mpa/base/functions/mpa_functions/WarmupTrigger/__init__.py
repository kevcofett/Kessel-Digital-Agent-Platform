"""
Warmup Trigger Azure Function

Timer-triggered function that runs every 5 minutes to keep all MPA functions warm.
Prevents cold start latency by hitting health endpoints of each function.

This function:
1. Runs on a 5-minute schedule
2. Calls the /health endpoint of each MPA function
3. Logs results to Application Insights
4. Continues warmup cycle even if individual functions fail
"""

import azure.functions as func
import logging
import json
import os
import requests
from datetime import datetime
from typing import Dict, List, Any
from concurrent.futures import ThreadPoolExecutor, as_completed

logger = logging.getLogger(__name__)

# Configuration for functions to warm up
# Uses the centralized /health/{function} endpoint
FUNCTIONS_TO_WARM = [
    {"name": "CalculateBudgetAllocation", "route": "health/allocation"},
    {"name": "CalculateGap", "route": "health/gap"},
    {"name": "CalculateSPO", "route": "health/spo"},
    {"name": "GenerateDocument", "route": "health/document"},
    {"name": "RunProjections", "route": "health/projections"},
    {"name": "SearchBenchmarks", "route": "health/benchmarks"},
    {"name": "SessionManager", "route": "health/session"},
    {"name": "ValidateGate", "route": "health/validate-gate"},
]

# Get base URL from environment or use default
FUNCTION_APP_URL = os.environ.get(
    "MPA_FUNCTION_APP_URL",
    "https://func-mpa-api-dev.azurewebsites.net/api"
)

# Timeout for health check requests (seconds)
HEALTH_CHECK_TIMEOUT = int(os.environ.get("MPA_HEALTH_CHECK_TIMEOUT", "10"))

# Maximum concurrent warmup requests
MAX_CONCURRENT_WARMUPS = int(os.environ.get("MPA_MAX_CONCURRENT_WARMUPS", "4"))


def check_function_health(function_config: Dict[str, str]) -> Dict[str, Any]:
    """
    Check the health of a single function.

    Args:
        function_config: Dictionary with 'name' and 'route' keys

    Returns:
        Dictionary with health check results
    """
    function_name = function_config["name"]
    route = function_config["route"]
    url = f"{FUNCTION_APP_URL}/{route}"

    start_time = datetime.utcnow()

    try:
        response = requests.get(url, timeout=HEALTH_CHECK_TIMEOUT)
        end_time = datetime.utcnow()
        duration_ms = (end_time - start_time).total_seconds() * 1000

        if response.status_code == 200:
            try:
                health_data = response.json()
            except json.JSONDecodeError:
                health_data = {"raw_response": response.text[:200]}

            return {
                "function": function_name,
                "status": "healthy",
                "response_time_ms": round(duration_ms, 2),
                "http_status": response.status_code,
                "health_data": health_data,
                "url": url,
                "checked_at": end_time.isoformat()
            }
        else:
            return {
                "function": function_name,
                "status": "unhealthy",
                "response_time_ms": round(duration_ms, 2),
                "http_status": response.status_code,
                "error": f"Unexpected status code: {response.status_code}",
                "url": url,
                "checked_at": end_time.isoformat()
            }

    except requests.Timeout:
        return {
            "function": function_name,
            "status": "timeout",
            "error": f"Request timed out after {HEALTH_CHECK_TIMEOUT}s",
            "url": url,
            "checked_at": datetime.utcnow().isoformat()
        }
    except requests.RequestException as e:
        return {
            "function": function_name,
            "status": "error",
            "error": str(e),
            "url": url,
            "checked_at": datetime.utcnow().isoformat()
        }


def main(timer: func.TimerRequest) -> None:
    """
    Warmup Trigger - Timer Function

    Runs every 5 minutes to warm up all MPA functions.
    Logs results to Application Insights for monitoring.
    """
    warmup_start = datetime.utcnow()
    logger.info(f"WarmupTrigger started at {warmup_start.isoformat()}")

    if timer.past_due:
        logger.warning("WarmupTrigger is running late (past due)")

    results: List[Dict[str, Any]] = []
    healthy_count = 0
    unhealthy_count = 0
    error_count = 0

    # Run health checks concurrently
    with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_WARMUPS) as executor:
        future_to_function = {
            executor.submit(check_function_health, func_config): func_config
            for func_config in FUNCTIONS_TO_WARM
        }

        for future in as_completed(future_to_function):
            func_config = future_to_function[future]
            try:
                result = future.result()
                results.append(result)

                if result["status"] == "healthy":
                    healthy_count += 1
                    logger.info(
                        f"Warmup OK: {result['function']} - "
                        f"{result['response_time_ms']}ms"
                    )
                elif result["status"] == "unhealthy":
                    unhealthy_count += 1
                    logger.warning(
                        f"Warmup UNHEALTHY: {result['function']} - "
                        f"HTTP {result.get('http_status', 'N/A')}"
                    )
                else:
                    error_count += 1
                    logger.error(
                        f"Warmup ERROR: {result['function']} - "
                        f"{result.get('error', 'Unknown error')}"
                    )

            except Exception as e:
                error_count += 1
                logger.error(
                    f"Warmup EXCEPTION for {func_config['name']}: {str(e)}"
                )
                results.append({
                    "function": func_config["name"],
                    "status": "exception",
                    "error": str(e),
                    "checked_at": datetime.utcnow().isoformat()
                })

    warmup_end = datetime.utcnow()
    total_duration_ms = (warmup_end - warmup_start).total_seconds() * 1000

    # Log summary
    summary = {
        "warmup_cycle": {
            "started_at": warmup_start.isoformat(),
            "completed_at": warmup_end.isoformat(),
            "duration_ms": round(total_duration_ms, 2),
            "functions_checked": len(FUNCTIONS_TO_WARM),
            "healthy": healthy_count,
            "unhealthy": unhealthy_count,
            "errors": error_count
        },
        "results": results
    }

    if error_count == 0 and unhealthy_count == 0:
        logger.info(
            f"WarmupTrigger completed successfully: "
            f"{healthy_count}/{len(FUNCTIONS_TO_WARM)} functions healthy, "
            f"total time {total_duration_ms:.0f}ms"
        )
    else:
        logger.warning(
            f"WarmupTrigger completed with issues: "
            f"{healthy_count} healthy, {unhealthy_count} unhealthy, "
            f"{error_count} errors"
        )

    # Log detailed results for Application Insights custom metrics
    logger.info(f"WarmupTrigger summary: {json.dumps(summary)}")
