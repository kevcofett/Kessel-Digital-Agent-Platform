"""
Propensity Scoring Script
KDAP Azure ML Endpoint
Agent: AUD
Capability: AUD_PROPENSITY
"""

import json
import logging
import numpy as np
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init():
    """Initialize the model."""
    global model_config, feature_weights
    model_config = {
        "version": "1.0.0",
        "score_bins": [0.2, 0.4, 0.6, 0.8],
        "tier_labels": ["Very Low", "Low", "Medium", "High", "Very High"]
    }
    # Default feature weights (would be loaded from trained model)
    feature_weights = {
        "recency_days": -0.02,
        "frequency": 0.15,
        "monetary_value": 0.001,
        "engagement_score": 0.25,
        "tenure_months": 0.01,
        "channel_affinity": 0.20
    }
    logger.info(f"Propensity model initialized: {model_config}")


def sigmoid(x):
    """Sigmoid activation function."""
    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))


def get_tier(score: float) -> str:
    """Assign tier based on score."""
    for i, threshold in enumerate(model_config["score_bins"]):
        if score < threshold:
            return model_config["tier_labels"][i]
    return model_config["tier_labels"][-1]


def run(raw_data: str) -> str:
    """
    Score function for propensity.
    
    Input Schema:
    {
        "audience_features": [
            {
                "id": str,
                "recency_days": int,
                "frequency": int,
                "monetary_value": float,
                "engagement_score": float,
                "tenure_months": int,
                "channel_affinity": float
            }
        ],
        "target_action": str,
        "model_version": str
    }
    
    Output Schema:
    {
        "scores": [{"id": str, "score": float, "tier": str}],
        "feature_importance": object
    }
    """
    try:
        data = json.loads(raw_data)
        
        audience = data.get("audience_features", [])
        target_action = data.get("target_action", "conversion")
        
        if not audience:
            return json.dumps({
                "scores": [],
                "feature_importance": {}
            })
        
        scores = []
        for member in audience:
            member_id = member.get("id", "unknown")
            
            # Calculate linear combination
            linear_score = 0
            for feature, weight in feature_weights.items():
                value = member.get(feature, 0)
                linear_score += weight * value
            
            # Apply sigmoid to get probability
            probability = float(sigmoid(linear_score))
            tier = get_tier(probability)
            
            scores.append({
                "id": member_id,
                "score": round(probability, 4),
                "tier": tier
            })
        
        # Calculate feature importance (normalized weights)
        total_weight = sum(abs(w) for w in feature_weights.values())
        feature_importance = {
            k: round(abs(v) / total_weight, 4) 
            for k, v in feature_weights.items()
        }
        
        response = {
            "scores": scores,
            "feature_importance": feature_importance,
            "model_info": {
                "version": model_config["version"],
                "target_action": target_action,
                "records_scored": len(scores)
            }
        }
        
        logger.info(f"Scored {len(scores)} audience members for {target_action}")
        return json.dumps(response)
        
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        return json.dumps({
            "error": str(e),
            "scores": [],
            "feature_importance": {}
        })
