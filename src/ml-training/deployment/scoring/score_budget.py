"""
Scoring Script for Budget Optimizer Model
Azure ML Managed Online Endpoint
"""

import json
import logging
import os
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def init():
    """
    Initialize the model for scoring.
    Called once when the endpoint starts.
    """
    global model, preprocessor
    
    # Get model path from environment
    model_path = os.environ.get('AZUREML_MODEL_DIR', './model')
    
    # Load model
    model = joblib.load(os.path.join(model_path, 'model.joblib'))
    
    # Load preprocessor if exists
    preprocessor_path = os.path.join(model_path, 'preprocessor.joblib')
    if os.path.exists(preprocessor_path):
        preprocessor = joblib.load(preprocessor_path)
    else:
        preprocessor = None
    
    logger.info("Budget Optimizer model initialized")


def run(raw_data: str) -> str:
    """
    Score input data and return predictions.
    
    Args:
        raw_data: JSON string with input data
        
    Returns:
        JSON string with predictions
    """
    try:
        # Parse input
        data = json.loads(raw_data)
        
        # Handle different input formats
        if 'data' in data:
            input_data = data['data']
        elif isinstance(data, list):
            input_data = data
        else:
            input_data = [data]
        
        # Convert to DataFrame
        df = pd.DataFrame(input_data)
        
        # Preprocess if preprocessor exists
        if preprocessor is not None:
            X = preprocessor.transform(df)
        else:
            X = df.values
        
        # Make predictions
        predictions = model.predict(X)
        
        # Calculate confidence intervals (simplified)
        std_estimate = np.std(predictions) * 0.1
        
        # Build response
        results = []
        for i, pred in enumerate(predictions):
            results.append({
                'optimal_spend': float(pred),
                'expected_return': float(pred * 1.15),
                'confidence_interval_lower': float(max(0, pred - 1.96 * std_estimate)),
                'confidence_interval_upper': float(pred + 1.96 * std_estimate),
                'marginal_return': float(np.gradient(predictions)[i]) if len(predictions) > 1 else 0.0,
                'channel_id': input_data[i].get('channel_id', f'channel_{i}'),
            })
        
        return json.dumps(results)
    
    except Exception as e:
        error_msg = f"Scoring error: {str(e)}"
        logger.error(error_msg)
        return json.dumps({"error": error_msg})


# For local testing
if __name__ == '__main__':
    # Mock initialization
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    
    # Create mock model for testing
    from sklearn.ensemble import GradientBoostingRegressor
    model = GradientBoostingRegressor()
    model.fit([[1, 2, 3], [4, 5, 6]], [1.0, 1.5])
    preprocessor = None
    
    # Test data
    test_input = json.dumps({
        "data": [
            {
                "channel_id": "search",
                "current_spend": 50000,
                "historical_roi_mean": 2.5,
                "audience_size": 500000,
                "competitive_intensity": 0.6,
                "seasonality_index": 1.1,
            }
        ]
    })
    
    result = run(test_input)
    print(f"Test result: {result}")
