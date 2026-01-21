"""
Media Mix Modeling Scoring Script
KDAP Azure ML Endpoint
Agent: CHA
Capability: CHA_MEDIA_MIX
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
        "adstock_default": 0.5,
        "saturation_default": 0.8,
        "base_contribution_pct": 0.30
    }
    logger.info(f"Media Mix model initialized: {model_config}")


def apply_adstock(spend: np.ndarray, decay: float) -> np.ndarray:
    """Apply adstock transformation (carryover effect)."""
    adstocked = np.zeros_like(spend, dtype=float)
    adstocked[0] = spend[0]
    for i in range(1, len(spend)):
        adstocked[i] = spend[i] + decay * adstocked[i-1]
    return adstocked


def apply_saturation(x: np.ndarray, alpha: float) -> np.ndarray:
    """Apply Hill saturation curve."""
    return x ** alpha / (1 + x ** alpha)


def run(raw_data: str) -> str:
    """
    Score function for Media Mix Modeling.
    
    Input Schema:
    {
        "spend_data": {
            "channel_code": [spend_values_array]
        },
        "outcome_data": [outcome_values_array],
        "external_factors": {
            "factor_name": [factor_values_array]
        }
    }
    
    Output Schema:
    {
        "channel_contributions": {"channel": {"contribution_pct": float, "roi": float}},
        "optimal_mix": {"channel": float},
        "incrementality": {"channel": float},
        "model_diagnostics": object
    }
    """
    try:
        data = json.loads(raw_data)
        
        spend_data = data.get("spend_data", {})
        outcome_data = np.array(data.get("outcome_data", []))
        external_factors = data.get("external_factors", {})
        
        if not spend_data or len(outcome_data) == 0:
            return json.dumps({
                "error": "Insufficient data provided",
                "channel_contributions": {},
                "optimal_mix": {},
                "incrementality": {}
            })
        
        n_periods = len(outcome_data)
        total_outcome = float(np.sum(outcome_data))
        
        # Process each channel
        channel_contributions = {}
        transformed_spends = {}
        
        for channel, spend_values in spend_data.items():
            spend = np.array(spend_values)
            if len(spend) != n_periods:
                continue
            
            # Apply adstock (carryover)
            adstocked = apply_adstock(spend, model_config["adstock_default"])
            
            # Apply saturation
            normalized = adstocked / (np.max(adstocked) + 1e-10)
            saturated = apply_saturation(normalized, model_config["saturation_default"])
            
            transformed_spends[channel] = saturated
            
            # Estimate contribution (simplified - would use regression in production)
            correlation = np.corrcoef(saturated, outcome_data)[0, 1] if np.std(saturated) > 0 else 0
            contribution_weight = max(0, correlation)
            
            total_spend = float(np.sum(spend))
            mean_outcome_per_spend = total_outcome / max(total_spend, 1)
            
            channel_contributions[channel] = {
                "contribution_pct": round(contribution_weight * 100, 2),
                "total_spend": total_spend,
                "estimated_contribution": round(contribution_weight * total_outcome * 0.7, 2),  # 70% media-attributed
                "roi": round(contribution_weight * mean_outcome_per_spend, 4),
                "correlation": round(correlation, 4)
            }
        
        # Calculate optimal mix based on ROI
        total_roi = sum(c["roi"] for c in channel_contributions.values())
        optimal_mix = {
            channel: round(c["roi"] / total_roi * 100, 2) if total_roi > 0 else 0
            for channel, c in channel_contributions.items()
        }
        
        # Calculate incrementality (lift over baseline)
        base_outcome = total_outcome * model_config["base_contribution_pct"]
        media_outcome = total_outcome - base_outcome
        
        incrementality = {
            channel: round(c["contribution_pct"] / 100 * media_outcome, 2)
            for channel, c in channel_contributions.items()
        }
        
        model_diagnostics = {
            "n_periods": n_periods,
            "n_channels": len(channel_contributions),
            "total_outcome": total_outcome,
            "base_contribution": base_outcome,
            "media_contribution": media_outcome,
            "r_squared": round(sum(c["correlation"]**2 for c in channel_contributions.values()) / len(channel_contributions), 4) if channel_contributions else 0
        }
        
        response = {
            "channel_contributions": channel_contributions,
            "optimal_mix": optimal_mix,
            "incrementality": incrementality,
            "model_diagnostics": model_diagnostics
        }
        
        logger.info(f"MMM complete: {len(channel_contributions)} channels analyzed")
        return json.dumps(response)
        
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        return json.dumps({
            "error": str(e),
            "channel_contributions": {},
            "optimal_mix": {},
            "incrementality": {}
        })
