"""
Propensity Scoring Model Training
Agent: AUD
Capability: SCORE_PROPENSITY
"""

import argparse
import json
import os
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, average_precision_score
import mlflow
import mlflow.xgboost

def generate_synthetic_data(n_samples=50000):
    """Generate synthetic propensity training data."""
    np.random.seed(42)
    
    data = {
        'days_since_last_visit': np.random.exponential(30, n_samples),
        'total_visits_30d': np.random.poisson(5, n_samples),
        'pages_per_visit': np.random.uniform(1, 15, n_samples),
        'time_on_site_avg': np.random.exponential(180, n_samples),
        'email_opens_30d': np.random.poisson(3, n_samples),
        'email_clicks_30d': np.random.poisson(1, n_samples),
        'past_purchases': np.random.poisson(2, n_samples),
        'avg_order_value': np.random.lognormal(4, 1, n_samples),
        'cart_abandons_30d': np.random.poisson(1, n_samples),
        'product_views_30d': np.random.poisson(10, n_samples),
        'search_queries_30d': np.random.poisson(3, n_samples),
        'mobile_sessions_pct': np.random.uniform(0, 1, n_samples),
        'loyalty_tier': np.random.choice([0, 1, 2, 3], n_samples, p=[0.5, 0.3, 0.15, 0.05]),
        'days_since_signup': np.random.exponential(365, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    log_odds = (
        -2.0
        - 0.02 * df['days_since_last_visit']
        + 0.15 * df['total_visits_30d']
        + 0.05 * df['pages_per_visit']
        + 0.002 * df['time_on_site_avg']
        + 0.1 * df['email_clicks_30d']
        + 0.2 * df['past_purchases']
        + 0.0005 * df['avg_order_value']
        - 0.1 * df['cart_abandons_30d']
        + 0.05 * df['product_views_30d']
        + 0.3 * df['loyalty_tier']
        + np.random.normal(0, 0.5, n_samples)
    )
    
    prob = 1 / (1 + np.exp(-log_odds))
    df['converted'] = (np.random.random(n_samples) < prob).astype(int)
    
    return df

def train_model(data_path=None, output_path='./outputs'):
    """Train the propensity scoring model."""
    
    mlflow.start_run()
    
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data()
    
    feature_cols = [c for c in df.columns if c != 'converted']
    X = df[feature_cols]
    y = df['converted']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        min_child_weight=5,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=len(y_train[y_train==0]) / len(y_train[y_train==1]),
        random_state=42,
        use_label_encoder=False,
        eval_metric='auc'
    )
    
    model.fit(X_train, y_train)
    
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    auc_score = roc_auc_score(y_test, y_pred_proba)
    ap_score = average_precision_score(y_test, y_pred_proba)
    
    mlflow.log_metric('test_auc', auc_score)
    mlflow.log_metric('test_ap', ap_score)
    
    mlflow.xgboost.log_model(model, 'propensity_model')
    
    os.makedirs(output_path, exist_ok=True)
    model_path = os.path.join(output_path, 'propensity_model.joblib')
    joblib.dump(model, model_path)
    
    feature_path = os.path.join(output_path, 'feature_names.json')
    with open(feature_path, 'w') as f:
        json.dump(feature_cols, f)
    
    mlflow.end_run()
    
    print(f"Model trained successfully")
    print(f"Test AUC: {auc_score:.4f}")
    print(f"Test AP: {ap_score:.4f}")
    
    return model

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-path', type=str, default=None)
    parser.add_argument('--output-path', type=str, default='./outputs')
    args = parser.parse_args()
    
    train_model(args.data_path, args.output_path)
