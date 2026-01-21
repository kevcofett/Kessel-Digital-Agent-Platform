"""
Anomaly Detection Scoring Script
KDAP Azure ML Endpoint
Agent: PRF
Capability: PRF_ANOMALY
"""

import json
import logging
import numpy as np
from typing import Dict, List, Any
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init():
    """Initialize the model."""
    global model_config
    model_config = {
        "version": "1.0.0",
        "default_window": 30,
        "z_score_threshold": 2.5,
        "severity_thresholds": {
            "low": 2.0,
            "medium": 3.0,
            "high": 4.0,
            "critical": 5.0
        }
    }
    logger.info(f"Anomaly Detection model initialized: {model_config}")


def calculate_baseline(values: np.ndarray, window: int = 30) -> Dict:
    """Calculate rolling baseline statistics."""
    if len(values) < window:
        window = len(values)
    
    rolling_mean = np.convolve(values, np.ones(window)/window, mode='valid')
    rolling_std = np.array([
        np.std(values[max(0, i-window):i+1]) 
        for i in range(len(values))
    ])
    
    return {
        "mean": float(np.mean(values)),
        "std": float(np.std(values)),
        "rolling_mean": rolling_mean.tolist(),
        "rolling_std": rolling_std.tolist(),
        "window": window
    }


def get_severity(z_score: float) -> str:
    """Determine anomaly severity based on z-score."""
    abs_z = abs(z_score)
    if abs_z >= model_config["severity_thresholds"]["critical"]:
        return "critical"
    elif abs_z >= model_config["severity_thresholds"]["high"]:
        return "high"
    elif abs_z >= model_config["severity_thresholds"]["medium"]:
        return "medium"
    elif abs_z >= model_config["severity_thresholds"]["low"]:
        return "low"
    return "none"


def run(raw_data: str) -> str:
    """
    Score function for anomaly detection.
    
    Input Schema:
    {
        "metrics": [{"timestamp": str, "value": number}],
        "sensitivity": float (0.5-3.0, default 1.0),
        "metric_name": str
    }
    
    Output Schema:
    {
        "anomalies": [{"timestamp": str, "value": float, "severity": str, "expected": float, "z_score": float}],
        "baseline": object,
        "summary": object
    }
    """
    try:
        data = json.loads(raw_data)
        
        metrics = data.get("metrics", [])
        sensitivity = data.get("sensitivity", 1.0)
        metric_name = data.get("metric_name", "metric")
        
        if not metrics or len(metrics) < 5:
            return json.dumps({
                "anomalies": [],
                "baseline": {},
                "summary": {"error": "Insufficient data points (minimum 5 required)"}
            })
        
        # Extract values and timestamps
        timestamps = [m["timestamp"] for m in metrics]
        values = np.array([m["value"] for m in metrics])
        
        # Calculate baseline
        baseline = calculate_baseline(values, model_config["default_window"])
        
        # Adjust threshold based on sensitivity
        threshold = model_config["z_score_threshold"] / sensitivity
        
        # Detect anomalies
        anomalies = []
        mean = baseline["mean"]
        std = baseline["std"] if baseline["std"] > 0 else 1e-10
        
        for i, (ts, val) in enumerate(zip(timestamps, values)):
            z_score = (val - mean) / std
            
            if abs(z_score) > threshold:
                severity = get_severity(z_score)
                anomalies.append({
                    "timestamp": ts,
                    "value": float(val),
                    "severity": severity,
                    "expected": float(mean),
                    "z_score": round(float(z_score), 3),
                    "deviation_pct": round(((val - mean) / mean) * 100, 2) if mean != 0 else 0
                })
        
        # Sort by severity
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        anomalies.sort(key=lambda x: severity_order.get(x["severity"], 4))
        
        summary = {
            "metric_name": metric_name,
            "total_points": len(metrics),
            "anomalies_detected": len(anomalies),
            "anomaly_rate": round(len(anomalies) / len(metrics) * 100, 2),
            "sensitivity_used": sensitivity,
            "threshold_z_score": threshold,
            "severity_breakdown": {
                sev: len([a for a in anomalies if a["severity"] == sev])
                for sev in ["critical", "high", "medium", "low"]
            }
        }
        
        response = {
            "anomalies": anomalies,
            "baseline": {
                "mean": baseline["mean"],
                "std": baseline["std"],
                "window": baseline["window"]
            },
            "summary": summary
        }
        
        logger.info(f"Detected {len(anomalies)} anomalies in {len(metrics)} data points")
        return json.dumps(response)
        
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        return json.dumps({
            "error": str(e),
            "anomalies": [],
            "baseline": {},
            "summary": {}
        })
