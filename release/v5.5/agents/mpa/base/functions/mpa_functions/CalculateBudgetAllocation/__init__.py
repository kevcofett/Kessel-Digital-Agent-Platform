"""
Calculate Budget Allocation Azure Function

Generates optimal budget allocation across channels based on objectives and benchmarks.
ALL reference data comes from Dataverse.
"""

import azure.functions as func
import json
import logging
from typing import Dict, Any, List
from datetime import datetime

from ..shared.benchmark_service import get_benchmark_service
from ..shared.channel_service import get_channel_service
from ..shared.validators import validate_budget_allocation_request

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Calculate Budget Allocation Azure Function

    Generates recommended budget allocation based on:
    - Campaign objective (awareness, consideration, conversions)
    - Available channels
    - Channel performance benchmarks from Dataverse
    - Minimum budget requirements per channel
    """
    logger.info('CalculateBudgetAllocation function processing request.')

    try:
        req_body = req.get_json()

        # Validate request
        validation = validate_budget_allocation_request(req_body)
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

        # Extract parameters
        budget = req_body.get("budget", 0)
        channels = req_body.get("channels", [])
        objective = req_body.get("objective", "awareness")
        vertical = req_body.get("vertical", "general")
        constraints = req_body.get("constraints", {})

        # Get services
        benchmark_service = get_benchmark_service()
        channel_service = get_channel_service()

        # Get channel data with objective scores
        scored_channels = channel_service.get_channels_for_objective(objective, budget)
        channel_lookup = {ch["name"]: ch for ch in scored_channels}

        warnings = []
        allocations = {}
        channel_details = {}

        # Calculate scores for requested channels
        total_score = 0
        valid_channels = []

        for channel_name in channels:
            channel_data = channel_lookup.get(channel_name)

            if not channel_data:
                # Try to get channel directly
                channel_data = channel_service.get_channel(channel_name)
                if not channel_data:
                    warnings.append(f"Channel not found: {channel_name}")
                    continue

            # Check minimum budget constraint
            min_budget = channel_data.get("min_budget", 0)
            max_allocation = constraints.get(channel_name, {}).get("max_percent", 100)

            if budget * (max_allocation / 100) < min_budget:
                warnings.append(f"{channel_name} excluded: minimum budget ${min_budget} not met")
                continue

            # Get objective fit score
            objective_score = channel_data.get("objective_score", 50)

            # Get performance benchmarks
            benchmarks = benchmark_service.get_channel_benchmarks(channel_name, vertical)
            efficiency_score = calculate_efficiency_score(benchmarks, objective)

            # Combined score
            combined_score = (objective_score * 0.6) + (efficiency_score * 0.4)

            valid_channels.append({
                "name": channel_name,
                "score": combined_score,
                "objective_score": objective_score,
                "efficiency_score": efficiency_score,
                "min_budget": min_budget,
                "funnel_position": channel_data.get("funnel_position"),
                "benchmarks": benchmarks
            })
            total_score += combined_score

        if not valid_channels:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "NO_VALID_CHANNELS",
                    "message": "No valid channels available for allocation",
                    "warnings": warnings
                }),
                status_code=400,
                mimetype="application/json"
            )

        # Calculate allocation percentages based on scores
        remaining_budget = budget
        for channel in valid_channels:
            base_percent = (channel["score"] / total_score) * 100
            allocated_budget = budget * (base_percent / 100)

            # Ensure minimum budget is met
            if allocated_budget < channel["min_budget"]:
                allocated_budget = channel["min_budget"]
                base_percent = (allocated_budget / budget) * 100

            # Apply max constraint
            max_percent = constraints.get(channel["name"], {}).get("max_percent", 100)
            if base_percent > max_percent:
                base_percent = max_percent
                allocated_budget = budget * (base_percent / 100)

            allocations[channel["name"]] = round(base_percent, 1)
            channel_details[channel["name"]] = {
                "allocation_percent": round(base_percent, 1),
                "allocated_budget": round(allocated_budget, 2),
                "objective_fit": channel["objective_score"],
                "efficiency_score": round(channel["efficiency_score"], 1),
                "funnel_position": channel["funnel_position"],
                "min_budget": channel["min_budget"],
                "benchmarks": {
                    "cpm": channel["benchmarks"].get("cpm", {}).get("median"),
                    "ctr": channel["benchmarks"].get("ctr", {}).get("median"),
                    "cvr": channel["benchmarks"].get("cvr", {}).get("median")
                }
            }

        # Normalize to 100%
        total_allocated = sum(allocations.values())
        if total_allocated != 100:
            adjustment = 100 / total_allocated
            for channel_name in allocations:
                allocations[channel_name] = round(allocations[channel_name] * adjustment, 1)
                channel_details[channel_name]["allocation_percent"] = allocations[channel_name]
                channel_details[channel_name]["allocated_budget"] = round(
                    budget * (allocations[channel_name] / 100), 2
                )

        result = {
            "status": "success",
            "allocation": {
                "totalBudget": budget,
                "objective": objective,
                "vertical": vertical,
                "percentages": allocations,
                "byChannel": channel_details
            },
            "metadata": {
                "calculatedAt": datetime.utcnow().isoformat(),
                "channelsRequested": len(channels),
                "channelsAllocated": len(allocations),
                "dataSource": "Dataverse"
            }
        }

        if warnings:
            result["warnings"] = warnings

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
        logger.error(f"CalculateBudgetAllocation error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def calculate_efficiency_score(benchmarks: Dict[str, Any], objective: str) -> float:
    """
    Calculate channel efficiency score based on benchmarks and objective.

    Score is 0-100 where higher is better.
    """
    if not benchmarks:
        return 50.0  # Default score

    score = 50.0

    # Objective-specific scoring
    if objective == "awareness":
        # Lower CPM is better for awareness
        cpm = benchmarks.get("cpm", {}).get("median", 10)
        if cpm < 5:
            score += 30
        elif cpm < 10:
            score += 20
        elif cpm < 20:
            score += 10

    elif objective == "consideration":
        # Higher CTR is better for consideration
        ctr = benchmarks.get("ctr", {}).get("median", 1)
        if ctr > 3:
            score += 30
        elif ctr > 2:
            score += 20
        elif ctr > 1:
            score += 10

    elif objective == "conversions":
        # Higher CVR and lower CPA is better
        cvr = benchmarks.get("cvr", {}).get("median", 2)
        if cvr > 5:
            score += 30
        elif cvr > 3:
            score += 20
        elif cvr > 2:
            score += 10

    return min(100, max(0, score))
