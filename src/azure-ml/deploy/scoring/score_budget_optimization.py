"""
Budget Optimization Scoring Script
KDAP Azure ML Endpoint
Agent: ANL
Capability: ANL_BUDGET_OPTIMIZE
"""

import json
import logging
import numpy as np
from scipy.optimize import minimize
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init():
    """Initialize the model - called once when the endpoint starts."""
    global model_config
    model_config = {
        "version": "1.0.0",
        "default_diminishing_factor": 0.85,
        "min_allocation_pct": 0.05,
        "max_allocation_pct": 0.60,
    }
    logger.info(f"Budget Optimization model initialized: {model_config}")


def run(raw_data: str) -> str:
    """
    Score function - called for each request.
    
    Input Schema:
    {
        "total_budget": number,
        "channels": [{"code": str, "min_pct": float, "max_pct": float, "historical_roi": float}],
        "constraints": {"min_channels": int, "max_per_channel_pct": float},
        "objective": "maximize_roi" | "maximize_reach" | "balanced"
    }
    
    Output Schema:
    {
        "allocations": [{"channel": str, "amount": number, "percentage": float}],
        "expected_roi": number,
        "confidence": number,
        "optimization_details": object
    }
    """
    try:
        data = json.loads(raw_data)
        
        total_budget = data.get("total_budget", 100000)
        channels = data.get("channels", [])
        constraints = data.get("constraints", {})
        objective = data.get("objective", "maximize_roi")
        
        if not channels:
            return json.dumps({
                "error": "No channels provided",
                "allocations": [],
                "expected_roi": 0,
                "confidence": 0
            })
        
        # Extract channel data
        n_channels = len(channels)
        channel_codes = [c["code"] for c in channels]
        historical_rois = np.array([c.get("historical_roi", 1.0) for c in channels])
        min_pcts = np.array([c.get("min_pct", model_config["min_allocation_pct"]) for c in channels])
        max_pcts = np.array([c.get("max_pct", model_config["max_allocation_pct"]) for c in channels])
        
        # Define objective function with diminishing returns
        def objective_function(weights):
            # Apply diminishing returns curve
            effective_weights = np.power(weights, model_config["default_diminishing_factor"])
            
            if objective == "maximize_roi":
                return -np.sum(effective_weights * historical_rois)
            elif objective == "maximize_reach":
                # Maximize diversity (entropy-like)
                entropy = -np.sum(weights * np.log(weights + 1e-10))
                return -entropy
            else:  # balanced
                roi_component = np.sum(effective_weights * historical_rois)
                diversity = -np.sum(weights * np.log(weights + 1e-10))
                return -(0.6 * roi_component + 0.4 * diversity)
        
        # Constraints
        cons = [
            {"type": "eq", "fun": lambda w: np.sum(w) - 1.0}  # Sum to 1
        ]
        
        # Bounds
        bounds = [(min_pcts[i], max_pcts[i]) for i in range(n_channels)]
        
        # Initial guess (equal distribution)
        x0 = np.ones(n_channels) / n_channels
        
        # Optimize
        result = minimize(
            objective_function,
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=cons,
            options={"maxiter": 1000}
        )
        
        # Build allocations
        optimal_weights = result.x
        allocations = []
        for i, code in enumerate(channel_codes):
            allocations.append({
                "channel": code,
                "amount": round(total_budget * optimal_weights[i], 2),
                "percentage": round(optimal_weights[i] * 100, 2)
            })
        
        # Calculate expected ROI
        effective_weights = np.power(optimal_weights, model_config["default_diminishing_factor"])
        expected_roi = float(np.sum(effective_weights * historical_rois))
        
        # Confidence based on optimization convergence
        confidence = 0.95 if result.success else 0.70
        
        response = {
            "allocations": allocations,
            "expected_roi": round(expected_roi, 4),
            "confidence": confidence,
            "optimization_details": {
                "success": result.success,
                "iterations": result.nit,
                "objective_value": float(-result.fun),
                "message": result.message
            }
        }
        
        logger.info(f"Optimization complete: {len(allocations)} channels, ROI={expected_roi:.2f}")
        return json.dumps(response)
        
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        return json.dumps({
            "error": str(e),
            "allocations": [],
            "expected_roi": 0,
            "confidence": 0
        })
