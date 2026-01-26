"""
Calculate SPO (Supply Path Optimization) Azure Function

Analyzes and scores media partners/vendors for supply path optimization.
Reads partner data and scoring criteria from Dataverse.
"""

import azure.functions as func
import json
import logging
from typing import Dict, Any, List
from datetime import datetime

from ..shared.validators import validate_spo_request

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Calculate SPO Azure Function

    Evaluates media partners on:
    - Cost efficiency (fees, margins)
    - Inventory quality
    - Transparency
    - Brand safety
    - Technical capabilities
    """
    logger.info('CalculateSPO function processing request.')

    try:
        req_body = req.get_json()

        # Validate request
        validation = validate_spo_request(req_body)
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
        partners = req_body.get("partners", [])
        weights = req_body.get("weights", {
            "cost_efficiency": 0.25,
            "inventory_quality": 0.25,
            "transparency": 0.20,
            "brand_safety": 0.15,
            "technical": 0.15
        })
        channel = req_body.get("channel")
        budget = req_body.get("budget")

        # Score each partner
        scored_partners = []

        for partner in partners:
            partner_name = partner.get("name", "Unknown")

            # Extract or calculate component scores
            scores = {
                "cost_efficiency": calculate_cost_score(partner),
                "inventory_quality": calculate_quality_score(partner),
                "transparency": calculate_transparency_score(partner),
                "brand_safety": calculate_brand_safety_score(partner),
                "technical": calculate_technical_score(partner)
            }

            # Calculate weighted total
            total_score = sum(
                scores[component] * weights.get(component, 0.2)
                for component in scores
            )

            # Determine tier
            if total_score >= 80:
                tier = "Preferred"
            elif total_score >= 60:
                tier = "Approved"
            elif total_score >= 40:
                tier = "Conditional"
            else:
                tier = "Not Recommended"

            scored_partners.append({
                "name": partner_name,
                "total_score": round(total_score, 1),
                "tier": tier,
                "component_scores": {k: round(v, 1) for k, v in scores.items()},
                "strengths": identify_strengths(scores),
                "weaknesses": identify_weaknesses(scores),
                "recommendation": generate_partner_recommendation(tier, scores)
            })

        # Sort by total score descending
        scored_partners.sort(key=lambda x: x["total_score"], reverse=True)

        # Generate allocation recommendation
        allocation = calculate_partner_allocation(scored_partners, budget)

        result = {
            "status": "success",
            "spo_analysis": {
                "partners": scored_partners,
                "recommended_allocation": allocation,
                "weights_used": weights
            },
            "summary": {
                "total_partners": len(scored_partners),
                "preferred": sum(1 for p in scored_partners if p["tier"] == "Preferred"),
                "approved": sum(1 for p in scored_partners if p["tier"] == "Approved"),
                "conditional": sum(1 for p in scored_partners if p["tier"] == "Conditional"),
                "not_recommended": sum(1 for p in scored_partners if p["tier"] == "Not Recommended")
            },
            "metadata": {
                "channel": channel,
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
        logger.error(f"CalculateSPO error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def calculate_cost_score(partner: Dict[str, Any]) -> float:
    """Calculate cost efficiency score (0-100)."""
    score = 50.0

    tech_fee = partner.get("tech_fee_percent", 15)
    if tech_fee < 5:
        score += 30
    elif tech_fee < 10:
        score += 20
    elif tech_fee < 15:
        score += 10
    elif tech_fee > 20:
        score -= 20

    # Adjust for transparent pricing
    if partner.get("transparent_pricing", False):
        score += 10

    return min(100, max(0, score))


def calculate_quality_score(partner: Dict[str, Any]) -> float:
    """Calculate inventory quality score (0-100)."""
    score = 50.0

    viewability = partner.get("avg_viewability", 50)
    if viewability > 70:
        score += 25
    elif viewability > 60:
        score += 15
    elif viewability < 40:
        score -= 20

    invalid_traffic = partner.get("invalid_traffic_rate", 5)
    if invalid_traffic < 2:
        score += 20
    elif invalid_traffic < 5:
        score += 10
    elif invalid_traffic > 10:
        score -= 25

    return min(100, max(0, score))


def calculate_transparency_score(partner: Dict[str, Any]) -> float:
    """Calculate transparency score (0-100)."""
    score = 50.0

    if partner.get("full_url_reporting", False):
        score += 15
    if partner.get("supply_chain_disclosed", False):
        score += 15
    if partner.get("ads_txt_authorized", False):
        score += 10
    if partner.get("sellers_json_listed", False):
        score += 10

    return min(100, max(0, score))


def calculate_brand_safety_score(partner: Dict[str, Any]) -> float:
    """Calculate brand safety score (0-100)."""
    score = 50.0

    if partner.get("pre_bid_filtering", False):
        score += 15
    if partner.get("content_verification", False):
        score += 15
    if partner.get("blocklist_support", False):
        score += 10

    brand_safety_incidents = partner.get("brand_safety_incidents", 0)
    if brand_safety_incidents == 0:
        score += 10
    elif brand_safety_incidents > 3:
        score -= 20

    return min(100, max(0, score))


def calculate_technical_score(partner: Dict[str, Any]) -> float:
    """Calculate technical capabilities score (0-100)."""
    score = 50.0

    if partner.get("header_bidding", False):
        score += 10
    if partner.get("real_time_reporting", False):
        score += 10
    if partner.get("api_integration", False):
        score += 10
    if partner.get("cross_device_support", False):
        score += 10
    if partner.get("first_party_data_support", False):
        score += 10

    return min(100, max(0, score))


def identify_strengths(scores: Dict[str, float]) -> List[str]:
    """Identify partner strengths (scores >= 70)."""
    strength_labels = {
        "cost_efficiency": "Cost Efficiency",
        "inventory_quality": "Inventory Quality",
        "transparency": "Transparency",
        "brand_safety": "Brand Safety",
        "technical": "Technical Capabilities"
    }
    return [strength_labels[k] for k, v in scores.items() if v >= 70]


def identify_weaknesses(scores: Dict[str, float]) -> List[str]:
    """Identify partner weaknesses (scores < 50)."""
    weakness_labels = {
        "cost_efficiency": "Cost Efficiency",
        "inventory_quality": "Inventory Quality",
        "transparency": "Transparency",
        "brand_safety": "Brand Safety",
        "technical": "Technical Capabilities"
    }
    return [weakness_labels[k] for k, v in scores.items() if v < 50]


def generate_partner_recommendation(tier: str, scores: Dict[str, float]) -> str:
    """Generate recommendation text for partner."""
    if tier == "Preferred":
        return "Maximize spend with this partner. High scores across all dimensions."
    elif tier == "Approved":
        return "Include in media mix. Consider for incremental budget."
    elif tier == "Conditional":
        weaknesses = identify_weaknesses(scores)
        return f"Use with caution. Address concerns in: {', '.join(weaknesses)}"
    else:
        return "Avoid or phase out. Significant concerns identified."


def calculate_partner_allocation(
    scored_partners: List[Dict[str, Any]],
    budget: float
) -> Dict[str, Any]:
    """Calculate recommended budget allocation across partners."""
    if not budget or not scored_partners:
        return {}

    # Only allocate to Preferred and Approved partners
    eligible = [p for p in scored_partners if p["tier"] in ["Preferred", "Approved"]]

    if not eligible:
        # Fall back to top 3 partners regardless of tier
        eligible = scored_partners[:3]

    # Weight by score
    total_score = sum(p["total_score"] for p in eligible)

    allocation = {}
    for partner in eligible:
        percent = (partner["total_score"] / total_score) * 100
        allocation[partner["name"]] = {
            "percent": round(percent, 1),
            "budget": round(budget * (percent / 100), 2),
            "tier": partner["tier"]
        }

    return allocation
