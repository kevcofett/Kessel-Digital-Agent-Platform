"""
Scoring Script for Propensity Model
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
    """
    global model, calibrated_model, preprocessor, optimal_threshold
    
    model_path = os.environ.get('AZUREML_MODEL_DIR', './model')
    
    # Load model
    model = joblib.load(os.path.join(model_path, 'model.joblib'))
    
    # Load calibrated model if exists
    calibrated_path = os.path.join(model_path, 'calibrated_model.joblib')
    if os.path.exists(calibrated_path):
        calibrated_model = joblib.load(calibrated_path)
    else:
        calibrated_model = None
    
    # Load preprocessor
    preprocessor_path = os.path.join(model_path, 'preprocessor.joblib')
    if os.path.exists(preprocessor_path):
        preprocessor = joblib.load(preprocessor_path)
    else:
        preprocessor = None
    
    # Load metadata for threshold
    metadata_path = os.path.join(model_path, 'metadata.json')
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            optimal_threshold = metadata.get('optimal_threshold', 0.5)
    else:
        optimal_threshold = 0.5
    
    logger.info("Propensity model initialized")


def assign_segment(score: float) -> str:
    """Assign customer segment based on propensity score."""
    if score >= 0.8:
        return 'High Propensity'
    elif score >= 0.5:
        return 'Medium Propensity'
    elif score >= 0.2:
        return 'Low Propensity'
    else:
        return 'Very Low Propensity'


def run(raw_data: str) -> str:
    """
    Score input data and return propensity predictions.
    """
    try:
        data = json.loads(raw_data)
        
        if 'data' in data:
            input_data = data['data']
        elif isinstance(data, list):
            input_data = data
        else:
            input_data = [data]
        
        df = pd.DataFrame(input_data)
        
        # Extract customer IDs before preprocessing
        customer_ids = df.get('customer_id', pd.Series([f'customer_{i}' for i in range(len(df))]))
        
        # Preprocess
        if preprocessor is not None:
            X = preprocessor.transform(df)
        else:
            X = df.values
        
        # Get model for prediction
        scoring_model = calibrated_model if calibrated_model else model
        
        # Predict probabilities
        if hasattr(scoring_model, 'predict_proba'):
            y_proba = scoring_model.predict_proba(X)[:, 1]
        else:
            y_proba = scoring_model.predict(X)
        
        # Calculate percentile ranks
        percentile_ranks = pd.Series(y_proba).rank(pct=True) * 100
        
        # Build results
        results = []
        for i, prob in enumerate(y_proba):
            results.append({
                'customer_id': str(customer_ids.iloc[i]) if hasattr(customer_ids, 'iloc') else str(customer_ids[i]),
                'propensity_score': float(prob),
                'confidence': float(abs(prob - 0.5) * 2),
                'percentile_rank': float(percentile_ranks.iloc[i]),
                'segment_assignment': assign_segment(prob),
            })
        
        return json.dumps(results)
    
    except Exception as e:
        error_msg = f"Scoring error: {str(e)}"
        logger.error(error_msg)
        return json.dumps({"error": error_msg})


if __name__ == '__main__':
    # Test locally
    from sklearn.linear_model import LogisticRegression
    model = LogisticRegression()
    model.fit([[1, 2], [3, 4], [5, 6]], [0, 1, 1])
    calibrated_model = None
    preprocessor = None
    optimal_threshold = 0.5
    
    test_input = json.dumps({
        "data": [
            {
                "customer_id": "CUST_001",
                "recency_days": 10,
                "frequency_count": 5,
                "monetary_value": 250,
                "engagement_score": 75,
            }
        ]
    })
    
    result = run(test_input)
    print(f"Test result: {result}")
