"""
Calculate Gap Azure Function

Analyzes gaps between target KPIs and projected performance.
Provides recommendations using the 6 Options Framework.
"""

import azure.functions as func
import json
import logging
from typing import Dict, Any, List
from datetime import datetime

from ..shared.kpi_service import get_kpi_service
from ..shared.validators import validate_gap_request

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Calculate Gap Azure Function

    Analyzes gaps between:
    - Target KPIs (impressions, clicks, conversions, ROAS, etc.)
    - Projected performance

    Returns gap analysis with:
    - Gap magnitude and direction
    - Status (on_track, at_risk, behind)
    - 6 Options Framework recommendations
    """
    logger.info('CalculateGap function processing request.')

    try:
        req_body = req.get_json()

        # Validate request
        validation = validate_gap_request(req_body)
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
        targets = req_body.get("targets", {})
        projections = req_body.get("projections", {})
        budget = req_body.get("budget")
        channels = req_body.get("channels", [])

        # Get KPI service for directions
        kpi_service = get_kpi_service()

        # Calculate gaps for each metric
        gap_analysis = {}
        overall_status = "on_track"
        critical_gaps = []
        recommendations = []

        for metric, target_value in targets.items():
            projected_value = projections.get(metric, 0)

            # Get KPI definition for direction
            kpi_def = kpi_service.get_kpi_definition(metric.upper())
            direction = kpi_def.get("direction", "Higher is Better") if kpi_def else "Higher is Better"

            # Calculate gap
            if target_value == 0:
                gap_percent = 0 if projected_value == 0 else 100
            else:
                gap_percent = ((projected_value - target_value) / target_value) * 100

            # Determine status based on direction
            if direction == "Lower is Better":
                # For metrics like CPA, CPM - lower is better
                if projected_value <= target_value:
                    status = "on_track"
                elif projected_value <= target_value * 1.1:
                    status = "at_risk"
                else:
                    status = "behind"
            else:
                # For metrics like ROAS, conversions - higher is better
                if projected_value >= target_value:
                    status = "on_track"
                elif projected_value >= target_value * 0.9:
                    status = "at_risk"
                else:
                    status = "behind"

            gap_analysis[metric] = {
                "target": target_value,
                "projected": projected_value,
                "gap": round(projected_value - target_value, 2),
                "gap_percent": round(gap_percent, 1),
                "status": status,
                "direction": direction
            }

            # Track critical gaps
            if status == "behind":
                critical_gaps.append(metric)
                if overall_status != "behind":
                    overall_status = "behind"
            elif status == "at_risk" and overall_status == "on_track":
                overall_status = "at_risk"

        # Generate 6 Options Framework recommendations for gaps
        if critical_gaps:
            recommendations = generate_6_options(critical_gaps, gap_analysis, budget, channels)

        result = {
            "status": "success",
            "gapAnalysis": {
                "overallStatus": overall_status,
                "byMetric": gap_analysis,
                "criticalGaps": critical_gaps,
                "metricsAnalyzed": len(gap_analysis)
            },
            "recommendations": recommendations,
            "metadata": {
                "calculatedAt": datetime.utcnow().isoformat(),
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
        logger.error(f"CalculateGap error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def generate_6_options(
    critical_gaps: List[str],
    gap_analysis: Dict[str, Any],
    budget: float,
    channels: List[str]
) -> List[Dict[str, Any]]:
    """
    Generate recommendations using the 6 Options Framework.

    Options:
    1. Increase Budget - Add more spend to close gaps
    2. Optimize Mix - Reallocate budget to better-performing channels
    3. Improve Efficiency - Optimize creative, targeting, bidding
    4. Extend Timeline - More time to achieve targets
    5. Adjust Targets - Revise targets to be more realistic
    6. Accept Gap - Acknowledge constraints and move forward
    """
    recommendations = []

    for metric in critical_gaps:
        gap_data = gap_analysis.get(metric, {})
        gap_percent = abs(gap_data.get("gap_percent", 0))

        metric_recommendations = []

        # Option 1: Increase Budget
        if budget and gap_percent > 10:
            additional_budget = budget * (gap_percent / 100) * 1.2
            metric_recommendations.append({
                "option": "Increase Budget",
                "description": f"Add ${additional_budget:,.0f} to close {metric} gap",
                "impact": "High" if gap_percent > 25 else "Medium",
                "effort": "Low",
                "risk": "Low"
            })

        # Option 2: Optimize Mix
        if len(channels) > 1:
            metric_recommendations.append({
                "option": "Optimize Mix",
                "description": f"Reallocate budget to higher-performing channels for {metric}",
                "impact": "Medium",
                "effort": "Medium",
                "risk": "Low"
            })

        # Option 3: Improve Efficiency
        metric_recommendations.append({
            "option": "Improve Efficiency",
            "description": f"Optimize creative, targeting, and bidding to improve {metric}",
            "impact": "Medium",
            "effort": "High",
            "risk": "Medium"
        })

        # Option 4: Extend Timeline
        if gap_percent < 30:
            metric_recommendations.append({
                "option": "Extend Timeline",
                "description": f"Extend campaign duration to achieve {metric} target",
                "impact": "Medium",
                "effort": "Low",
                "risk": "Low"
            })

        # Option 5: Adjust Targets
        metric_recommendations.append({
            "option": "Adjust Targets",
            "description": f"Revise {metric} target to align with realistic projections",
            "impact": "High",
            "effort": "Low",
            "risk": "Medium"
        })

        # Option 6: Accept Gap
        metric_recommendations.append({
            "option": "Accept Gap",
            "description": f"Acknowledge {metric} gap and document constraints",
            "impact": "None",
            "effort": "Low",
            "risk": "High"
        })

        recommendations.append({
            "metric": metric,
            "gap_percent": gap_percent,
            "options": metric_recommendations
        })

    return recommendations
