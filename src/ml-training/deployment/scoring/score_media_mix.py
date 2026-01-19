"""
Scoring Script for Media Mix Model
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
    """Initialize the model for scoring."""
    global model, media_channels, control_variables
    
    model_path = os.environ.get('AZUREML_MODEL_DIR', './model')
    
    model = joblib.load(os.path.join(model_path, 'model.joblib'))
    
    metadata_path = os.path.join(model_path, 'metadata.json')
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            media_channels = metadata.get('media_channels', [])
            control_variables = metadata.get('control_variables', [])
    else:
        media_channels = []
        control_variables = []
    
    logger.info("Media Mix Model initialized")


def run(raw_data: str) -> str:
    """Score media mix or optimize budget."""
    try:
        data = json.loads(raw_data)
        
        action = data.get('action', 'predict')
        
        if action == 'predict':
            # Predict response for given spend
            input_data = data.get('data', data.get('spend', []))
            if not isinstance(input_data, list):
                input_data = [input_data]
            
            df = pd.DataFrame(input_data)
            
            # Ensure all columns present
            for col in media_channels + control_variables:
                if col not in df.columns:
                    df[col] = 0
            
            predictions = model.predict(df)
            
            results = []
            for i, pred in enumerate(predictions):
                results.append({
                    'predicted_revenue': float(pred),
                    'input': input_data[i],
                })
            
            return json.dumps({'predictions': results})
        
        elif action == 'optimize':
            # Optimize budget allocation
            total_budget = data.get('total_budget', 100000)
            constraints = data.get('constraints', None)
            
            # Simple optimization using model
            optimal = optimize_budget(total_budget, constraints)
            
            return json.dumps({
                'optimal_allocation': optimal,
                'total_budget': total_budget,
            })
        
        elif action == 'contributions':
            # Get channel contributions
            contributions = model.get_contributions().to_dict(orient='index')
            return json.dumps({'contributions': contributions})
        
        else:
            return json.dumps({'error': f'Unknown action: {action}'})
    
    except Exception as e:
        error_msg = f"Scoring error: {str(e)}"
        logger.error(error_msg)
        return json.dumps({"error": error_msg})


def optimize_budget(total_budget: float, constraints: Dict = None) -> Dict[str, float]:
    """Simple budget optimization."""
    # Equal split as baseline
    n_channels = len(media_channels)
    if n_channels == 0:
        return {}
    
    allocation = {ch: total_budget / n_channels for ch in media_channels}
    return allocation


if __name__ == '__main__':
    # Mock model for testing
    class MockModel:
        def predict(self, X):
            return np.random.uniform(100000, 200000, len(X))
        def get_contributions(self):
            return pd.DataFrame({'absolute': [1000], 'percentage': [50]}, index=['tv'])
    
    model = MockModel()
    media_channels = ['tv_spend', 'digital_spend']
    control_variables = []
    
    test_input = json.dumps({
        "action": "predict",
        "data": [{"tv_spend": 50000, "digital_spend": 30000}]
    })
    
    result = run(test_input)
    print(f"Test result: {result}")
