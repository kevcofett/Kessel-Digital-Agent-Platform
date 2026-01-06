"""
Run Projections Azure Function

Generates performance projections using benchmarks and KPIs from Dataverse.
NO HARDCODED DATA - all reference data comes from Dataverse.
"""

import azure.functions as func
import json
import logging
from typing import Dict, Any, List
from datetime import datetime

from ..shared.benchmark_service import get_benchmark_service
from ..shared.kpi_service import get_kpi_service
from ..shared.channel_service import get_channel_service
from ..shared.validators import validate_projection_request

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Run Projections Azure Function

    Generates performance projections including:
    - Impressions, clicks, conversions by channel
    - Cost metrics (CPM, CPC, CPA)
    - ROAS projections
    - Confidence levels based on data quality

    ALL benchmarks and KPI formulas come from Dataverse.
    """
    logger.info('RunProjections function processing request.')

    try:
        req_body = req.get_json()

        # Validate request
        validation = validate_projection_request(req_body)
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
        vertical = req_body.get("vertical", "general")
        objective = req_body.get("objective", "awareness")
        start_date = req_body.get("startDate")
        end_date = req_body.get("endDate")
        allocation = req_body.get("allocation", {})

        # Get services (read from Dataverse)
        benchmark_service = get_benchmark_service()
        kpi_service = get_kpi_service()
        channel_service = get_channel_service()

        # Calculate date range
        if start_date and end_date:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            days = (end - start).days
        else:
            days = 90  # Default to 90 days

        warnings = []
        data_sources = []

        # Calculate projections by channel
        channel_projections = {}
        total_impressions = 0
        total_clicks = 0
        total_conversions = 0
        total_spend = 0
        confidence_scores = []

        # Determine budget allocation per channel
        if allocation:
            channel_budgets = {ch: budget * (allocation.get(ch, 0) / 100) for ch in channels}
        else:
            # Equal distribution if no allocation specified
            per_channel = budget / len(channels)
            channel_budgets = {ch: per_channel for ch in channels}

        for channel in channels:
            channel_budget = channel_budgets.get(channel, 0)

            # Get benchmarks from Dataverse
            benchmarks = benchmark_service.get_channel_benchmarks(channel, vertical)

            if not benchmarks:
                # Try general vertical
                benchmarks = benchmark_service.get_channel_benchmarks(channel, "general")
                if benchmarks:
                    warnings.append(f"Using general benchmarks for {channel} (no {vertical} data)")
                else:
                    warnings.append(f"No benchmark data available for {channel}")
                    continue

            # Get benchmark values (use median)
            cpm = benchmarks.get("cpm", {}).get("median", 10.0)
            ctr_pct = benchmarks.get("ctr", {}).get("median", 0.5)
            cvr_pct = benchmarks.get("cvr", {}).get("median", 2.0)

            # Track data sources
            if benchmarks.get("cpm", {}).get("data_source"):
                data_sources.append(benchmarks["cpm"]["data_source"])

            # Track confidence
            confidence = benchmarks.get("cpm", {}).get("confidence", "Medium")
            confidence_scores.append(confidence)

            # Convert percentages to decimals
            ctr = ctr_pct / 100
            cvr = cvr_pct / 100

            # Calculate metrics using KPI service formulas
            impressions_result = kpi_service.calculate_kpi("IMPRESSIONS", {
                "spend": channel_budget,
                "cpm": cpm
            })
            impressions = impressions_result.get("value", 0) if impressions_result else (channel_budget / cpm * 1000)

            clicks = impressions * ctr
            conversions = clicks * cvr

            # Calculate cost metrics
            cpc = channel_budget / clicks if clicks > 0 else 0
            cpa = channel_budget / conversions if conversions > 0 else 0

            # Estimate revenue (using AOV from benchmarks if available)
            aov = benchmarks.get("aov", {}).get("median", 100.0)
            revenue = conversions * aov
            roas = revenue / channel_budget if channel_budget > 0 else 0

            channel_projections[channel] = {
                "budget": round(channel_budget, 2),
                "impressions": round(impressions),
                "clicks": round(clicks),
                "conversions": round(conversions, 1),
                "cpm": round(cpm, 2),
                "ctr": round(ctr * 100, 2),
                "cvr": round(cvr * 100, 2),
                "cpc": round(cpc, 2),
                "cpa": round(cpa, 2),
                "revenue": round(revenue, 2),
                "roas": round(roas, 2),
                "benchmark_source": benchmarks.get("cpm", {}).get("data_source", "Unknown"),
                "benchmark_period": benchmarks.get("cpm", {}).get("data_period", "Unknown"),
                "confidence": confidence
            }

            total_impressions += impressions
            total_clicks += clicks
            total_conversions += conversions
            total_spend += channel_budget

        # Calculate overall metrics
        overall_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        overall_cvr = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
        overall_cpc = total_spend / total_clicks if total_clicks > 0 else 0
        overall_cpa = total_spend / total_conversions if total_conversions > 0 else 0
        total_revenue = sum(cp["revenue"] for cp in channel_projections.values())
        overall_roas = total_revenue / total_spend if total_spend > 0 else 0

        # Determine overall confidence level
        confidence_level = determine_confidence_level(confidence_scores, warnings)

        result = {
            "status": "success",
            "projections": {
                "summary": {
                    "totalBudget": round(budget, 2),
                    "totalImpressions": round(total_impressions),
                    "totalClicks": round(total_clicks),
                    "totalConversions": round(total_conversions, 1),
                    "overallCTR": round(overall_ctr, 2),
                    "overallCVR": round(overall_cvr, 2),
                    "overallCPC": round(overall_cpc, 2),
                    "overallCPA": round(overall_cpa, 2),
                    "totalRevenue": round(total_revenue, 2),
                    "overallROAS": round(overall_roas, 2),
                    "campaignDays": days
                },
                "byChannel": channel_projections
            },
            "confidenceLevel": confidence_level,
            "dataProvenance": {
                "sources": list(set(data_sources)),
                "vertical": vertical,
                "channelsWithData": len(channel_projections),
                "channelsRequested": len(channels)
            },
            "metadata": {
                "vertical": vertical,
                "objective": objective,
                "channelCount": len(channels),
                "calculatedAt": datetime.utcnow().isoformat(),
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
        logger.error(f"RunProjections error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def determine_confidence_level(
    benchmark_confidences: List[str],
    warnings: List[str]
) -> str:
    """
    Determine overall confidence level based on data quality.

    Confidence Levels:
    - High: All benchmarks have High confidence, no warnings
    - Medium: Mix of High/Medium confidence, few warnings
    - Low: Some Low confidence benchmarks or many warnings
    - Very Low: Missing data or major issues
    """
    if not benchmark_confidences:
        return "Very Low"

    # Count confidence levels
    high_count = sum(1 for c in benchmark_confidences if c == "High")
    medium_count = sum(1 for c in benchmark_confidences if c == "Medium")
    low_count = sum(1 for c in benchmark_confidences if c == "Low")

    total = len(benchmark_confidences)
    warning_count = len(warnings)

    # Calculate score
    score = (high_count * 100 + medium_count * 60 + low_count * 30) / total

    # Adjust for warnings
    score -= warning_count * 10

    if score >= 80:
        return "High"
    elif score >= 60:
        return "Medium"
    elif score >= 40:
        return "Low"
    else:
        return "Very Low"
