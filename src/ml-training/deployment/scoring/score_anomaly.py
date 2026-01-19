"""
Scoring Script for Anomaly Detection Model
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
    Initialize the models for scoring.
    """
    global isolation_forest, lof, scaler, baseline_stats, feature_extractor
    
    model_path = os.environ.get('AZUREML_MODEL_DIR', './model')
    
    # Load Isolation Forest
    isolation_forest = joblib.load(os.path.join(model_path, 'isolation_forest.joblib'))
    
    # Load LOF
    lof_path = os.path.join(model_path, 'lof.joblib')
    if os.path.exists(lof_path):
        lof = joblib.load(lof_path)
    else:
        lof = None
    
    # Load scaler
    scaler_path = os.path.join(model_path, 'scaler.joblib')
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
    else:
        scaler = None
    
    # Load baseline stats
    stats_path = os.path.join(model_path, 'baseline_stats.json')
    if os.path.exists(stats_path):
        with open(stats_path, 'r') as f:
            baseline_stats = json.load(f)
    else:
        baseline_stats = {'mean': 0, 'std': 1}
    
    # Load feature extractor
    extractor_path = os.path.join(model_path, 'feature_extractor.joblib')
    if os.path.exists(extractor_path):
        feature_extractor = joblib.load(extractor_path)
    else:
        feature_extractor = None
    
    logger.info("Anomaly Detection model initialized")


def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract time series features from metric data."""
    df = df.copy()
    
    if 'metric_value' not in df.columns:
        return df
    
    # Lag features
    for lag in [1, 7, 14, 28]:
        df[f'metric_value_lag_{lag}'] = df['metric_value'].shift(lag)
    
    # Rolling statistics
    for window in [7, 28]:
        df[f'rolling_mean_{window}d'] = df['metric_value'].rolling(window, min_periods=1).mean()
        df[f'rolling_std_{window}d'] = df['metric_value'].rolling(window, min_periods=1).std()
    
    # Percentage changes
    df['pct_change_1d'] = df['metric_value'].pct_change(1)
    df['pct_change_7d'] = df['metric_value'].pct_change(7)
    
    # Z-scores
    if 'rolling_mean_7d' in df.columns and 'rolling_std_7d' in df.columns:
        df['zscore_7d'] = (df['metric_value'] - df['rolling_mean_7d']) / (df['rolling_std_7d'].replace(0, np.nan))
    
    return df


def determine_anomaly_type(row: pd.Series) -> str:
    """Determine the type of anomaly."""
    if pd.notna(row.get('pct_change_1d')):
        if row['pct_change_1d'] > 0.2:
            return 'spike'
        elif row['pct_change_1d'] < -0.2:
            return 'dip'
    
    if pd.notna(row.get('zscore_7d')):
        if abs(row['zscore_7d']) > 3:
            return 'trend'
    
    return 'pattern'


def run(raw_data: str) -> str:
    """
    Detect anomalies in input data.
    """
    try:
        data = json.loads(raw_data)
        
        # Get sensitivity from parameters
        sensitivity = data.get('parameters', {}).get('sensitivity', 'medium')
        sensitivity_thresholds = {
            'low': 0.3,
            'medium': 0.5,
            'high': 0.7,
            'critical': 0.9,
        }
        threshold = sensitivity_thresholds.get(sensitivity, 0.5)
        
        # Get input data
        if 'data' in data:
            input_data = data['data']
        elif 'metrics' in data:
            input_data = data['metrics']
        elif isinstance(data, list):
            input_data = data
        else:
            input_data = [data]
        
        df = pd.DataFrame(input_data)
        
        # Extract features
        df_features = extract_features(df)
        
        # Get feature columns
        feature_cols = [col for col in df_features.columns if col not in [
            'timestamp', 'date', 'metric_name', 'metric_value', 'is_anomaly'
        ]]
        
        X = df_features[feature_cols].fillna(0)
        
        # Scale if scaler available
        if scaler is not None:
            X = scaler.transform(X)
        
        # Get Isolation Forest scores
        if_scores = -isolation_forest.score_samples(X)
        if_scores = (if_scores - if_scores.min()) / (if_scores.max() - if_scores.min() + 1e-10)
        
        # Get LOF scores if available
        if lof is not None:
            lof_scores = -lof.score_samples(X)
            lof_scores = (lof_scores - lof_scores.min()) / (lof_scores.max() - lof_scores.min() + 1e-10)
            anomaly_scores = 0.6 * if_scores + 0.4 * lof_scores
        else:
            anomaly_scores = if_scores
        
        # Build results
        results = []
        for i in range(len(df)):
            is_anomaly = anomaly_scores[i] >= threshold
            
            result = {
                'metric_name': str(df.iloc[i].get('metric_name', f'metric_{i}')),
                'is_anomaly': bool(is_anomaly),
                'anomaly_score': float(anomaly_scores[i]),
                'expected_value': float(df_features.iloc[i].get('rolling_mean_7d', baseline_stats['mean'])),
                'confidence': float(abs(anomaly_scores[i] - 0.5) * 2),
            }
            
            if is_anomaly:
                result['anomaly_type'] = determine_anomaly_type(df_features.iloc[i])
                result['deviation'] = float(
                    df.iloc[i].get('metric_value', 0) - result['expected_value']
                )
            
            results.append(result)
        
        # Add summary
        summary = {
            'total_anomalies': sum(1 for r in results if r['is_anomaly']),
            'critical_count': sum(1 for r in results if r['anomaly_score'] >= 0.9),
            'warning_count': sum(1 for r in results if 0.7 <= r['anomaly_score'] < 0.9),
        }
        
        return json.dumps({
            'results': results,
            'summary': summary,
        })
    
    except Exception as e:
        error_msg = f"Scoring error: {str(e)}"
        logger.error(error_msg)
        return json.dumps({"error": error_msg})


if __name__ == '__main__':
    # Test locally
    from sklearn.ensemble import IsolationForest
    isolation_forest = IsolationForest(n_estimators=100, random_state=42)
    isolation_forest.fit(np.random.randn(100, 5))
    lof = None
    scaler = None
    baseline_stats = {'mean': 100, 'std': 10}
    
    test_input = json.dumps({
        "data": [
            {
                "metric_name": "conversion_rate",
                "metric_value": 150,  # Anomalous value
                "timestamp": "2024-01-01",
            }
        ],
        "parameters": {
            "sensitivity": "medium"
        }
    })
    
    result = run(test_input)
    print(f"Test result: {result}")
