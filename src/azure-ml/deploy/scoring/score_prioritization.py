"""
RICE Prioritization Scoring Script
KDAP Azure ML Endpoint
Agent: CST
Capability: CST_PRIORITIZE
"""

import json
import logging
import numpy as np
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init():
    """Initialize the model."""
    global model_config
    model_config = {
        "version": "1.0.0",
        "default_weights": {
            "reach": 1.0,
            "impact": 2.0,
            "confidence": 1.0,
            "effort": 1.0
        },
        "effort_scale": 10  # Max effort points
    }
    logger.info(f"Prioritization model initialized: {model_config}")


def calculate_rice_score(
    reach: float, 
    impact: float, 
    confidence: float, 
    effort: float,
    weights: Dict[str, float]
) -> float:
    """
    Calculate RICE score with customizable weights.
    RICE = (Reach * Impact * Confidence) / Effort
    """
    if effort <= 0:
        effort = 0.1  # Prevent division by zero
    
    weighted_reach = reach * weights.get("reach", 1.0)
    weighted_impact = impact * weights.get("impact", 1.0)
    weighted_confidence = confidence * weights.get("confidence", 1.0)
    effort_weight = weights.get("effort", 1.0)
    
    # Normalize effort (higher effort = lower score)
    normalized_effort = (effort / model_config["effort_scale"]) * effort_weight
    
    score = (weighted_reach * weighted_impact * weighted_confidence) / max(normalized_effort, 0.1)
    return score


def run(raw_data: str) -> str:
    """
    Score function for RICE prioritization.
    
    Input Schema:
    {
        "initiatives": [
            {
                "name": str,
                "reach": float (0-100),
                "impact": float (0-3 scale),
                "confidence": float (0-1),
                "effort": float (person-weeks)
            }
        ],
        "weights": {"reach": float, "impact": float, "confidence": float, "effort": float}
    }
    
    Output Schema:
    {
        "ranked_initiatives": [{"name": str, "rice_score": float, "rank": int, "components": object}],
        "sensitivity_analysis": object,
        "recommendations": [str]
    }
    """
    try:
        data = json.loads(raw_data)
        
        initiatives = data.get("initiatives", [])
        weights = data.get("weights", model_config["default_weights"])
        
        if not initiatives:
            return json.dumps({
                "error": "No initiatives provided",
                "ranked_initiatives": [],
                "sensitivity_analysis": {},
                "recommendations": []
            })
        
        # Calculate RICE scores
        scored_initiatives = []
        for init in initiatives:
            name = init.get("name", "Unnamed")
            reach = init.get("reach", 50)
            impact = init.get("impact", 1)
            confidence = init.get("confidence", 0.5)
            effort = init.get("effort", 1)
            
            rice_score = calculate_rice_score(reach, impact, confidence, effort, weights)
            
            scored_initiatives.append({
                "name": name,
                "rice_score": round(rice_score, 2),
                "components": {
                    "reach": reach,
                    "impact": impact,
                    "confidence": confidence,
                    "effort": effort
                }
            })
        
        # Sort by RICE score descending
        scored_initiatives.sort(key=lambda x: -x["rice_score"])
        
        # Add ranks
        for i, init in enumerate(scored_initiatives):
            init["rank"] = i + 1
        
        # Sensitivity analysis
        sensitivity = {}
        for factor in ["reach", "impact", "confidence", "effort"]:
            # Calculate how much score changes with 10% factor change
            variations = []
            for init in initiatives:
                original = calculate_rice_score(
                    init.get("reach", 50),
                    init.get("impact", 1),
                    init.get("confidence", 0.5),
                    init.get("effort", 1),
                    weights
                )
                
                # Modify factor by 10%
                modified_init = init.copy()
                modified_init[factor] = modified_init.get(factor, 1) * 1.1
                
                modified = calculate_rice_score(
                    modified_init.get("reach", 50),
                    modified_init.get("impact", 1),
                    modified_init.get("confidence", 0.5),
                    modified_init.get("effort", 1),
                    weights
                )
                
                pct_change = ((modified - original) / original * 100) if original > 0 else 0
                variations.append(pct_change)
            
            sensitivity[factor] = {
                "avg_impact_pct": round(np.mean(variations), 2),
                "direction": "positive" if factor != "effort" else "negative"
            }
        
        # Generate recommendations
        recommendations = []
        top_3 = scored_initiatives[:3]
        
        if top_3:
            recommendations.append(f"Top priority: {top_3[0]['name']} (score: {top_3[0]['rice_score']})")
        
        # Find quick wins (high score, low effort)
        quick_wins = [
            i for i in scored_initiatives 
            if i["components"]["effort"] <= 2 and i["rice_score"] > np.median([x["rice_score"] for x in scored_initiatives])
        ]
        if quick_wins:
            recommendations.append(f"Quick wins identified: {', '.join(q['name'] for q in quick_wins[:3])}")
        
        # Find high-confidence items
        high_confidence = [
            i for i in scored_initiatives[:5]
            if i["components"]["confidence"] >= 0.8
        ]
        if high_confidence:
            recommendations.append(f"High confidence initiatives: {', '.join(h['name'] for h in high_confidence)}")
        
        # Most sensitive factor
        most_sensitive = max(sensitivity.items(), key=lambda x: abs(x[1]["avg_impact_pct"]))
        recommendations.append(f"Most sensitive factor: {most_sensitive[0]} ({most_sensitive[1]['avg_impact_pct']:.1f}% avg impact per 10% change)")
        
        response = {
            "ranked_initiatives": scored_initiatives,
            "sensitivity_analysis": sensitivity,
            "recommendations": recommendations,
            "summary": {
                "total_initiatives": len(initiatives),
                "weights_used": weights,
                "score_range": {
                    "min": round(min(i["rice_score"] for i in scored_initiatives), 2),
                    "max": round(max(i["rice_score"] for i in scored_initiatives), 2),
                    "median": round(np.median([i["rice_score"] for i in scored_initiatives]), 2)
                }
            }
        }
        
        logger.info(f"Prioritization complete: {len(initiatives)} initiatives ranked")
        return json.dumps(response)
        
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        return json.dumps({
            "error": str(e),
            "ranked_initiatives": [],
            "sensitivity_analysis": {},
            "recommendations": []
        })
