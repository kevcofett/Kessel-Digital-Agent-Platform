"""
Anomaly Detection Model Training
Agent: PRF
Capability: DETECT_ANOMALIES
"""

import argparse
import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import mlflow
import mlflow.sklearn

def generate_synthetic_data(n_samples=20000, anomaly_rate=0.05):
    """Generate synthetic performance data with anomalies."""
    np.random.seed(42)
    
    n_normal = int(n_samples * (1 - anomaly_rate))
    n_anomaly = n_samples - n_normal
    
    normal_data = {
        'impressions': np.random.lognormal(12, 0.5, n_normal),
        'clicks': np.random.lognormal(8, 0.6, n_normal),
        'conversions': np.random.lognormal(4, 0.8, n_normal),
        'spend': np.random.lognormal(8, 0.4, n_normal),
        'ctr': np.random.beta(5, 95, n_normal),
        'cvr': np.random.beta(2, 98, n_normal),
        'cpc': np.random.lognormal(0.5, 0.3, n_normal),
        'cpa': np.random.lognormal(3, 0.5, n_normal),
        'roas': np.random.lognormal(1, 0.4, n_normal),
    }
    
    anomaly_data = {
        'impressions': np.concatenate([
            np.random.lognormal(15, 0.3, n_anomaly // 3),
            np.random.lognormal(8, 0.3, n_anomaly // 3),
            np.random.lognormal(12, 2, n_anomaly - 2*(n_anomaly // 3))
        ]),
        'clicks': np.concatenate([
            np.random.lognormal(11, 0.3, n_anomaly // 3),
            np.random.lognormal(5, 0.3, n_anomaly // 3),
            np.random.lognormal(8, 2, n_anomaly - 2*(n_anomaly // 3))
        ]),
        'conversions': np.concatenate([
            np.random.lognormal(7, 0.3, n_anomaly // 3),
            np.random.lognormal(1, 0.3, n_anomaly // 3),
            np.random.lognormal(4, 2, n_anomaly - 2*(n_anomaly // 3))
        ]),
        'spend': np.random.lognormal(8, 0.4, n_anomaly),
        'ctr': np.concatenate([
            np.random.beta(20, 80, n_anomaly // 2),
            np.random.beta(1, 99, n_anomaly - n_anomaly // 2)
        ]),
        'cvr': np.concatenate([
            np.random.beta(15, 85, n_anomaly // 2),
            np.random.beta(0.5, 99.5, n_anomaly - n_anomaly // 2)
        ]),
        'cpc': np.concatenate([
            np.random.lognormal(2, 0.3, n_anomaly // 2),
            np.random.lognormal(-1, 0.3, n_anomaly - n_anomaly // 2)
        ]),
        'cpa': np.concatenate([
            np.random.lognormal(5, 0.3, n_anomaly // 2),
            np.random.lognormal(1, 0.3, n_anomaly - n_anomaly // 2)
        ]),
        'roas': np.concatenate([
            np.random.lognormal(2.5, 0.3, n_anomaly // 2),
            np.random.lognormal(-0.5, 0.3, n_anomaly - n_anomaly // 2)
        ]),
    }
    
    normal_df = pd.DataFrame(normal_data)
    normal_df['is_anomaly'] = 0
    
    anomaly_df = pd.DataFrame(anomaly_data)
    anomaly_df['is_anomaly'] = 1
    
    df = pd.concat([normal_df, anomaly_df], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return df

def train_model(data_path=None, output_path='./outputs', contamination=0.05):
    """Train the anomaly detection model."""
    
    mlflow.start_run()
    
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data(anomaly_rate=contamination)
    
    feature_cols = [c for c in df.columns if c != 'is_anomaly']
    X = df[feature_cols]
    y_true = df['is_anomaly'] if 'is_anomaly' in df.columns else None
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', IsolationForest(
            n_estimators=200,
            max_samples='auto',
            contamination=contamination,
            max_features=0.8,
            bootstrap=True,
            random_state=42,
            n_jobs=-1
        ))
    ])
    
    pipeline.fit(X)
    
    if y_true is not None:
        y_pred = pipeline.predict(X)
        y_pred_binary = (y_pred == -1).astype(int)
        
        tp = ((y_pred_binary == 1) & (y_true == 1)).sum()
        fp = ((y_pred_binary == 1) & (y_true == 0)).sum()
        fn = ((y_pred_binary == 0) & (y_true == 1)).sum()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        mlflow.log_metric('precision', precision)
        mlflow.log_metric('recall', recall)
        mlflow.log_metric('f1_score', f1)
        
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1 Score: {f1:.4f}")
    
    mlflow.sklearn.log_model(pipeline, 'anomaly_detector')
    
    os.makedirs(output_path, exist_ok=True)
    model_path = os.path.join(output_path, 'anomaly_detector.joblib')
    joblib.dump(pipeline, model_path)
    
    feature_path = os.path.join(output_path, 'feature_names.json')
    with open(feature_path, 'w') as f:
        json.dump(feature_cols, f)
    
    mlflow.end_run()
    
    print(f"Model trained successfully")
    
    return pipeline

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-path', type=str, default=None)
    parser.add_argument('--output-path', type=str, default='./outputs')
    parser.add_argument('--contamination', type=float, default=0.05)
    args = parser.parse_args()
    
    train_model(args.data_path, args.output_path, args.contamination)
