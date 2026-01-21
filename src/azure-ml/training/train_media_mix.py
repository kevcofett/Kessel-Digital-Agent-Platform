"""
Media Mix Model Training
Agent: CHA
Capability: MODEL_MEDIA_MIX
"""

import argparse
import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import mlflow
import mlflow.sklearn

def adstock_transform(x, decay=0.5, max_lag=8):
    """Apply adstock transformation to model carryover effects."""
    result = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        for j in range(min(i + 1, max_lag)):
            result[i] += x[i - j] * (decay ** j)
    return result

def saturation_transform(x, alpha=0.5):
    """Apply saturation transformation for diminishing returns."""
    x_max = x.max()
    if x_max == 0:
        return np.zeros_like(x)
    return 1 - np.exp(-alpha * x / x_max)

def generate_synthetic_data(n_weeks=156):
    """Generate synthetic MMM training data (3 years weekly)."""
    np.random.seed(42)
    
    data = {
        'week': range(n_weeks),
        'tv_spend': np.abs(np.random.normal(100000, 30000, n_weeks)),
        'digital_spend': np.abs(np.random.normal(80000, 25000, n_weeks)),
        'print_spend': np.abs(np.random.normal(20000, 8000, n_weeks)),
        'ooh_spend': np.abs(np.random.normal(30000, 10000, n_weeks)),
        'radio_spend': np.abs(np.random.normal(15000, 5000, n_weeks)),
    }
    
    seasonality = 1 + 0.3 * np.sin(2 * np.pi * np.arange(n_weeks) / 52)
    trend = 1 + 0.002 * np.arange(n_weeks)
    
    df = pd.DataFrame(data)
    
    for col in ['tv_spend', 'digital_spend', 'print_spend', 'ooh_spend', 'radio_spend']:
        decay = {'tv_spend': 0.7, 'digital_spend': 0.3, 'print_spend': 0.5, 
                 'ooh_spend': 0.6, 'radio_spend': 0.4}[col]
        df[f'{col}_adstock'] = adstock_transform(df[col].values, decay)
    
    base_sales = 500000
    tv_effect = 0.15 * saturation_transform(df['tv_spend_adstock'].values)
    digital_effect = 0.20 * saturation_transform(df['digital_spend_adstock'].values)
    print_effect = 0.05 * saturation_transform(df['print_spend_adstock'].values)
    ooh_effect = 0.08 * saturation_transform(df['ooh_spend_adstock'].values)
    radio_effect = 0.04 * saturation_transform(df['radio_spend_adstock'].values)
    
    df['sales'] = base_sales * (
        1 + tv_effect + digital_effect + print_effect + ooh_effect + radio_effect
    ) * seasonality * trend + np.random.normal(0, 20000, n_weeks)
    
    return df

def train_model(data_path=None, output_path='./outputs'):
    """Train the media mix model."""
    
    mlflow.start_run()
    
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data()
    
    spend_cols = ['tv_spend', 'digital_spend', 'print_spend', 'ooh_spend', 'radio_spend']
    
    for col in spend_cols:
        if f'{col}_adstock' not in df.columns:
            df[f'{col}_adstock'] = adstock_transform(df[col].values, decay=0.5)
        df[f'{col}_saturated'] = saturation_transform(df[f'{col}_adstock'].values)
    
    feature_cols = [f'{col}_saturated' for col in spend_cols]
    X = df[feature_cols]
    y = df['sales']
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', Ridge(alpha=1.0))
    ])
    
    pipeline.fit(X, y)
    
    train_score = pipeline.score(X, y)
    
    model = pipeline.named_steps['model']
    scaler = pipeline.named_steps['scaler']
    
    scaled_X = scaler.transform(X)
    contributions = {}
    for i, col in enumerate(feature_cols):
        channel = col.replace('_saturated', '')
        contributions[channel] = float(np.abs(model.coef_[i] * scaled_X[:, i].mean()))
    
    total_contrib = sum(contributions.values())
    contribution_pct = {k: v/total_contrib*100 for k, v in contributions.items()}
    
    mlflow.log_metric('train_r2', train_score)
    for channel, pct in contribution_pct.items():
        mlflow.log_metric(f'{channel}_contribution_pct', pct)
    
    mlflow.sklearn.log_model(pipeline, 'media_mix_model')
    
    os.makedirs(output_path, exist_ok=True)
    model_path = os.path.join(output_path, 'media_mix_model.joblib')
    joblib.dump(pipeline, model_path)
    
    metadata = {
        'feature_cols': feature_cols,
        'spend_cols': spend_cols,
        'contributions': contribution_pct
    }
    metadata_path = os.path.join(output_path, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    mlflow.end_run()
    
    print(f"Model trained successfully")
    print(f"Train R2: {train_score:.4f}")
    print(f"Channel contributions: {contribution_pct}")
    
    return pipeline

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-path', type=str, default=None)
    parser.add_argument('--output-path', type=str, default='./outputs')
    args = parser.parse_args()
    
    train_model(args.data_path, args.output_path)
