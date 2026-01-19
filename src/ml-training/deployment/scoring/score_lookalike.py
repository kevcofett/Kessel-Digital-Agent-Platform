"""
Scoring Script for Lookalike Model
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
    global model, feature_cols, expansion_tiers
    
    model_path = os.environ.get('AZUREML_MODEL_DIR', './model')
    
    model = joblib.load(os.path.join(model_path, 'model.joblib'))
    
    metadata_path = os.path.join(model_path, 'metadata.json')
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            feature_cols = metadata.get('feature_names', [])
    else:
        feature_cols = model.feature_names_ if hasattr(model, 'feature_names_') else []
    
    expansion_tiers = {
        'tier_1': {'percentile': 99, 'expected_match_rate': 0.85},
        'tier_2': {'percentile': 95, 'expected_match_rate': 0.70},
        'tier_3': {'percentile': 90, 'expected_match_rate': 0.55},
        'tier_4': {'percentile': 80, 'expected_match_rate': 0.40},
        'tier_5': {'percentile': 70, 'expected_match_rate': 0.30},
    }
    
    logger.info("Lookalike Model initialized")


def assign_tier(percentile: float) -> Dict[str, Any]:
    """Assign expansion tier based on percentile."""
    for tier_name, config in sorted(expansion_tiers.items(), key=lambda x: x[1]['percentile'], reverse=True):
        if percentile >= config['percentile']:
            return {
                'tier': tier_name.replace('_', ' ').title(),
                'expected_match_rate': config['expected_match_rate'],
            }
    return {'tier': 'Not Qualified', 'expected_match_rate': 0.0}


def run(raw_data: str) -> str:
    """Score customers for lookalike similarity."""
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
        
        # Ensure feature columns present
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0
        
        # Score
        X = df[feature_cols] if feature_cols else df.drop(columns=['customer_id'], errors='ignore')
        similarity_scores = model.predict_proba(X)[:, 1]
        
        # Calculate percentiles
        percentile_ranks = pd.Series(similarity_scores).rank(pct=True) * 100
        
        # Build results
        results = []
        for i, score in enumerate(similarity_scores):
            tier_info = assign_tier(percentile_ranks.iloc[i])
            results.append({
                'customer_id': str(customer_ids.iloc[i]) if hasattr(customer_ids, 'iloc') else str(customer_ids[i]),
                'similarity_score': float(score),
                'percentile_rank': float(percentile_ranks.iloc[i]),
                'expansion_tier': tier_info['tier'],
                'match_probability': float(tier_info['expected_match_rate']),
            })
        
        # Sort by similarity
        results = sorted(results, key=lambda x: x['similarity_score'], reverse=True)
        
        # Summary
        tier_counts = {}
        for r in results:
            tier = r['expansion_tier']
            tier_counts[tier] = tier_counts.get(tier, 0) + 1
        
        summary = {
            'total_scored': len(results),
            'tier_distribution': tier_counts,
            'avg_similarity': float(np.mean(similarity_scores)),
        }
        
        return json.dumps({
            'lookalikes': results,
            'summary': summary,
        })
    
    except Exception as e:
        error_msg = f"Scoring error: {str(e)}"
        logger.error(error_msg)
        return json.dumps({"error": error_msg})


if __name__ == '__main__':
    # Mock model for testing
    class MockModel:
        feature_names_ = ['feature1', 'feature2']
        def predict_proba(self, X):
            return np.column_stack([
                np.random.uniform(0, 0.5, len(X)),
                np.random.uniform(0.5, 1, len(X))
            ])
    
    model = MockModel()
    feature_cols = ['feature1', 'feature2']
    
    test_input = json.dumps({
        "data": [
            {"customer_id": "CUST_001", "feature1": 10, "feature2": 20},
            {"customer_id": "CUST_002", "feature1": 15, "feature2": 25},
        ]
    })
    
    result = run(test_input)
    print(f"Test result: {result}")
