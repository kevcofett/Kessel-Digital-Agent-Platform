"""
Scoring Script for Churn Predictor Model
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
    global model, preprocessor, categorical_features, risk_tiers, optimal_threshold
    
    model_path = os.environ.get('AZUREML_MODEL_DIR', './model')
    
    model = joblib.load(os.path.join(model_path, 'model.joblib'))
    
    preprocessor_path = os.path.join(model_path, 'preprocessor.joblib')
    if os.path.exists(preprocessor_path):
        preprocessor = joblib.load(preprocessor_path)
    else:
        preprocessor = None
    
    metadata_path = os.path.join(model_path, 'metadata.json')
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            categorical_features = metadata.get('categorical_features', [])
            optimal_threshold = metadata.get('optimal_threshold', 0.5)
    else:
        categorical_features = []
        optimal_threshold = 0.5
    
    risk_tiers = {
        'high_risk': {'threshold': 0.7, 'action': 'immediate_intervention'},
        'medium_risk': {'threshold': 0.4, 'action': 'proactive_engagement'},
        'low_risk': {'threshold': 0.2, 'action': 'monitor'},
        'minimal_risk': {'threshold': 0.0, 'action': 'standard_nurture'},
    }
    
    logger.info("Churn Predictor model initialized")


def assign_risk_tier(prob: float) -> Dict[str, str]:
    """Assign risk tier based on churn probability."""
    if prob >= risk_tiers['high_risk']['threshold']:
        return {'tier': 'High Risk', 'action': risk_tiers['high_risk']['action']}
    elif prob >= risk_tiers['medium_risk']['threshold']:
        return {'tier': 'Medium Risk', 'action': risk_tiers['medium_risk']['action']}
    elif prob >= risk_tiers['low_risk']['threshold']:
        return {'tier': 'Low Risk', 'action': risk_tiers['low_risk']['action']}
    else:
        return {'tier': 'Minimal Risk', 'action': risk_tiers['minimal_risk']['action']}


def run(raw_data: str) -> str:
    """Score customers for churn risk."""
    try:
        data = json.loads(raw_data)
        
        if 'data' in data:
            input_data = data['data']
        elif 'customers' in data:
            input_data = data['customers']
        elif isinstance(data, list):
            input_data = data
        else:
            input_data = [data]
        
        df = pd.DataFrame(input_data)
        
        # Extract customer IDs
        customer_ids = df.get('customer_id', pd.Series([f'customer_{i}' for i in range(len(df))]))
        
        # Handle categorical features
        for col in categorical_features:
            if col in df.columns:
                df[col] = df[col].fillna('missing').astype(str)
        
        # Predict
        y_proba = model.predict_proba(df)[:, 1]
        
        # Build results
        results = []
        for i, prob in enumerate(y_proba):
            risk = assign_risk_tier(prob)
            results.append({
                'customer_id': str(customer_ids.iloc[i]) if hasattr(customer_ids, 'iloc') else str(customer_ids[i]),
                'churn_probability': float(prob),
                'risk_tier': risk['tier'],
                'recommended_action': risk['action'],
                'confidence': float(abs(prob - 0.5) * 2),
            })
        
        # Summary
        summary = {
            'total_customers': len(results),
            'high_risk_count': sum(1 for r in results if r['risk_tier'] == 'High Risk'),
            'medium_risk_count': sum(1 for r in results if r['risk_tier'] == 'Medium Risk'),
            'avg_churn_probability': float(np.mean(y_proba)),
        }
        
        return json.dumps({
            'predictions': results,
            'summary': summary,
        })
    
    except Exception as e:
        error_msg = f"Scoring error: {str(e)}"
        logger.error(error_msg)
        return json.dumps({"error": error_msg})


if __name__ == '__main__':
    from catboost import CatBoostClassifier
    model = CatBoostClassifier()
    model.fit([[1, 2], [3, 4], [5, 6]], [0, 1, 1], verbose=False)
    categorical_features = []
    optimal_threshold = 0.5
    risk_tiers = {
        'high_risk': {'threshold': 0.7, 'action': 'immediate_intervention'},
        'medium_risk': {'threshold': 0.4, 'action': 'proactive_engagement'},
        'low_risk': {'threshold': 0.2, 'action': 'monitor'},
        'minimal_risk': {'threshold': 0.0, 'action': 'standard_nurture'},
    }
    
    test_input = json.dumps({
        "data": [
            {"customer_id": "CUST_001", "days_since_last_purchase": 60, "nps_score": 5}
        ]
    })
    
    result = run(test_input)
    print(f"Test result: {result}")
