"""
Budget Optimization Model Training
Agent: ANL
Capability: CALCULATE_OPTIMAL_ALLOCATION
"""

import argparse
import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import mlflow
import mlflow.sklearn

def generate_synthetic_data(n_samples=10000):
    """Generate synthetic budget optimization training data."""
    np.random.seed(42)
    
    data = {
        'paid_search_spend': np.random.uniform(10000, 500000, n_samples),
        'paid_social_spend': np.random.uniform(5000, 300000, n_samples),
        'display_spend': np.random.uniform(5000, 200000, n_samples),
        'video_spend': np.random.uniform(10000, 400000, n_samples),
        'tv_spend': np.random.uniform(0, 1000000, n_samples),
        'historical_roas': np.random.uniform(1.5, 8.0, n_samples),
        'market_competition': np.random.uniform(0.3, 0.9, n_samples),
        'seasonality_factor': np.random.uniform(0.7, 1.3, n_samples),
        'brand_awareness': np.random.uniform(0.1, 0.8, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    total_spend = df[['paid_search_spend', 'paid_social_spend', 'display_spend', 
                      'video_spend', 'tv_spend']].sum(axis=1)
    efficiency = df['historical_roas'] * 10
    market_fit = (1 - df['market_competition']) * 20
    seasonal_boost = df['seasonality_factor'] * 15
    brand_mult = df['brand_awareness'] * 25
    
    concentration = df[['paid_search_spend', 'paid_social_spend', 
                        'display_spend', 'video_spend', 'tv_spend']].max(axis=1) / total_spend
    concentration_penalty = concentration * 30
    
    df['optimal_score'] = np.clip(
        efficiency + market_fit + seasonal_boost + brand_mult - concentration_penalty + 
        np.random.normal(0, 5, n_samples),
        0, 100
    )
    
    return df

def train_model(data_path=None, output_path='./outputs'):
    """Train the budget optimization model."""
    
    mlflow.start_run()
    
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data()
    
    feature_cols = [c for c in df.columns if c != 'optimal_score']
    X = df[feature_cols]
    y = df['optimal_score']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', GradientBoostingRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    
    train_score = pipeline.score(X_train, y_train)
    test_score = pipeline.score(X_test, y_test)
    cv_scores = cross_val_score(pipeline, X, y, cv=5)
    
    mlflow.log_metric('train_r2', train_score)
    mlflow.log_metric('test_r2', test_score)
    mlflow.log_metric('cv_mean_r2', cv_scores.mean())
    mlflow.log_metric('cv_std_r2', cv_scores.std())
    
    mlflow.sklearn.log_model(pipeline, 'budget_optimizer')
    
    os.makedirs(output_path, exist_ok=True)
    model_path = os.path.join(output_path, 'budget_optimizer.joblib')
    joblib.dump(pipeline, model_path)
    
    feature_path = os.path.join(output_path, 'feature_names.json')
    with open(feature_path, 'w') as f:
        json.dump(feature_cols, f)
    
    mlflow.end_run()
    
    print(f"Model trained successfully")
    print(f"Train R2: {train_score:.4f}")
    print(f"Test R2: {test_score:.4f}")
    print(f"CV R2: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
    
    return pipeline

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-path', type=str, default=None)
    parser.add_argument('--output-path', type=str, default='./outputs')
    args = parser.parse_args()
    
    train_model(args.data_path, args.output_path)
