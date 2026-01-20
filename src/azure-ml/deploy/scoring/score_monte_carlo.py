"""
Monte Carlo Simulation Scoring Script
KDAP Azure ML Endpoint
Agent: ANL
Capability: ANL_MONTECARLO
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
        "default_iterations": 10000,
        "max_iterations": 100000,
        "percentiles": [5, 10, 25, 50, 75, 90, 95]
    }
    logger.info(f"Monte Carlo model initialized: {model_config}")


def sample_distribution(distribution: str, params: Dict, size: int) -> np.ndarray:
    """Sample from specified distribution."""
    if distribution == "normal":
        return np.random.normal(params.get("mean", 0), params.get("std", 1), size)
    elif distribution == "uniform":
        return np.random.uniform(params.get("min", 0), params.get("max", 1), size)
    elif distribution == "triangular":
        return np.random.triangular(
            params.get("min", 0), 
            params.get("mode", 0.5), 
            params.get("max", 1), 
            size
        )
    elif distribution == "lognormal":
        return np.random.lognormal(params.get("mean", 0), params.get("sigma", 1), size)
    elif distribution == "beta":
        return np.random.beta(params.get("alpha", 2), params.get("beta", 5), size)
    elif distribution == "poisson":
        return np.random.poisson(params.get("lambda", 5), size)
    else:
        # Default to normal
        return np.random.normal(params.get("mean", 0), params.get("std", 1), size)


def run(raw_data: str) -> str:
    """
    Score function for Monte Carlo simulation.
    
    Input Schema:
    {
        "variables": [
            {"name": str, "distribution": str, "params": object}
        ],
        "model": str (formula like "A * B + C"),
        "iterations": int
    }
    
    Output Schema:
    {
        "mean": float,
        "std_dev": float,
        "percentiles": object,
        "histogram": [{"bin_start": float, "bin_end": float, "count": int}],
        "variable_correlations": object
    }
    """
    try:
        data = json.loads(raw_data)
        
        variables = data.get("variables", [])
        model_formula = data.get("model", "")
        iterations = min(
            data.get("iterations", model_config["default_iterations"]),
            model_config["max_iterations"]
        )
        
        if not variables:
            return json.dumps({
                "error": "No variables provided",
                "mean": 0,
                "std_dev": 0,
                "percentiles": {},
                "histogram": []
            })
        
        # Generate samples for each variable
        samples = {}
        for var in variables:
            name = var["name"]
            distribution = var.get("distribution", "normal")
            params = var.get("params", {})
            samples[name] = sample_distribution(distribution, params, iterations)
        
        # Evaluate model formula
        # Create local namespace with variable samples
        local_vars = {name: arr for name, arr in samples.items()}
        local_vars["np"] = np
        
        if model_formula:
            try:
                results = eval(model_formula, {"__builtins__": {}, "np": np}, local_vars)
            except Exception as e:
                # If formula fails, sum all variables
                results = sum(samples.values())
        else:
            # Default: sum all variables
            results = sum(samples.values())
        
        results = np.array(results)
        
        # Calculate statistics
        mean = float(np.mean(results))
        std_dev = float(np.std(results))
        
        # Calculate percentiles
        percentiles = {
            str(p): float(np.percentile(results, p))
            for p in model_config["percentiles"]
        }
        
        # Generate histogram
        hist_counts, bin_edges = np.histogram(results, bins=20)
        histogram = [
            {
                "bin_start": float(bin_edges[i]),
                "bin_end": float(bin_edges[i+1]),
                "count": int(hist_counts[i]),
                "percentage": round(hist_counts[i] / iterations * 100, 2)
            }
            for i in range(len(hist_counts))
        ]
        
        # Calculate variable correlations with result
        correlations = {}
        for name, var_samples in samples.items():
            corr = np.corrcoef(var_samples, results)[0, 1]
            correlations[name] = round(float(corr), 4)
        
        response = {
            "mean": round(mean, 4),
            "std_dev": round(std_dev, 4),
            "percentiles": percentiles,
            "histogram": histogram,
            "variable_correlations": correlations,
            "simulation_info": {
                "iterations": iterations,
                "variables_count": len(variables),
                "model_formula": model_formula or "sum(variables)"
            }
        }
        
        logger.info(f"Monte Carlo completed: {iterations} iterations, mean={mean:.2f}")
        return json.dumps(response)
        
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        return json.dumps({
            "error": str(e),
            "mean": 0,
            "std_dev": 0,
            "percentiles": {},
            "histogram": []
        })
