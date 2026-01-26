# MPA v6.2 AZURE ML COMPLETE BUILD

**Version:** 1.0  
**Date:** January 19, 2026  
**Status:** Ready for Execution  
**Scope:** Azure ML Endpoint Deployment + Model Training + KB Integration

---

## TABLE OF CONTENTS

1. [Overview](#1-overview)
2. [Azure ML Workspace Setup](#2-azure-ml-workspace-setup)
3. [Model Training Scripts](#3-model-training-scripts)
4. [Endpoint Deployment](#4-endpoint-deployment)
5. [Power Automate Integration](#5-power-automate-integration)
6. [KB Files for ML Capabilities](#6-kb-files-for-ml-capabilities)
7. [Capability Registrations](#7-capability-registrations)
8. [Testing and Validation](#8-testing-and-validation)
9. [Execution Checklist](#9-execution-checklist)

---

## 1. OVERVIEW

### 1.1 ML Endpoints to Deploy

| Endpoint | Agent | Purpose | Model Type |
|----------|-------|---------|------------|
| kdap-budget-optimizer | ANL | Optimal budget allocation | Gradient Boosting |
| kdap-response-curve | ANL | Diminishing returns modeling | Polynomial Regression |
| kdap-monte-carlo | ANL | Risk simulation | Monte Carlo Simulation |
| kdap-propensity | AUD | Conversion likelihood | XGBoost Classifier |
| kdap-churn-predictor | AUD | Churn risk scoring | Random Forest |
| kdap-anomaly-detector | PRF | Performance anomaly detection | Isolation Forest |
| kdap-attribution | PRF | Shapley value attribution | SHAP + LightGBM |
| kdap-media-mix | CHA | Media mix modeling | Bayesian MMM |
| kdap-prioritizer | CST | RICE scoring optimization | Weighted Ensemble |

### 1.2 Dependencies

- Azure ML SDK v2
- Python 3.11
- scikit-learn 1.3+
- XGBoost 2.0+
- LightGBM 4.0+
- PyMC 5.0+ (for Bayesian MMM)
- SHAP 0.42+

---

## 2. AZURE ML WORKSPACE SETUP

### 2.1 Create Workspace

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "your-subscription-id"

# Create resource group
az group create --name kdap-ml-rg --location eastus

# Create ML workspace
az ml workspace create \
  --name kdap-ml-workspace \
  --resource-group kdap-ml-rg \
  --location eastus

# Create compute cluster for training
az ml compute create \
  --name kdap-cpu-cluster \
  --type AmlCompute \
  --min-instances 0 \
  --max-instances 4 \
  --size Standard_DS3_v2 \
  --workspace-name kdap-ml-workspace \
  --resource-group kdap-ml-rg
```

### 2.2 Environment Configuration

Create file: `src/azure-ml/deploy/environments/base-env.yaml`

```yaml
name: kdap-ml-base
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.11
  - pip
  - pip:
    - azureml-inference-server-http
    - scikit-learn==1.3.2
    - xgboost==2.0.3
    - lightgbm==4.1.0
    - shap==0.42.1
    - pandas==2.1.4
    - numpy==1.26.3
    - scipy==1.11.4
    - joblib==1.3.2
```

---

## 3. MODEL TRAINING SCRIPTS

### 3.1 Budget Optimization Model

Create file: `src/azure-ml/training/train_budget_optimizer.py`

```python
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
    
    # Features: channel spends, historical performance, market conditions
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
    
    # Generate target: optimal allocation score (0-100)
    # Based on diminishing returns and synergy effects
    total_spend = df.sum(axis=1)
    efficiency = df['historical_roas'] * 10
    market_fit = (1 - df['market_competition']) * 20
    seasonal_boost = df['seasonality_factor'] * 15
    brand_mult = df['brand_awareness'] * 25
    
    # Add diminishing returns penalty for over-concentration
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
    
    # Load or generate data
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data()
    
    # Prepare features and target
    feature_cols = [c for c in df.columns if c != 'optimal_score']
    X = df[feature_cols]
    y = df['optimal_score']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Create pipeline
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
    
    # Train
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    train_score = pipeline.score(X_train, y_train)
    test_score = pipeline.score(X_test, y_test)
    cv_scores = cross_val_score(pipeline, X, y, cv=5)
    
    # Log metrics
    mlflow.log_metric('train_r2', train_score)
    mlflow.log_metric('test_r2', test_score)
    mlflow.log_metric('cv_mean_r2', cv_scores.mean())
    mlflow.log_metric('cv_std_r2', cv_scores.std())
    
    # Log model
    mlflow.sklearn.log_model(pipeline, 'budget_optimizer')
    
    # Save locally
    os.makedirs(output_path, exist_ok=True)
    model_path = os.path.join(output_path, 'budget_optimizer.joblib')
    joblib.dump(pipeline, model_path)
    
    # Save feature names
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
```

### 3.2 Propensity Scoring Model

Create file: `src/azure-ml/training/train_propensity.py`

```python
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
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score, precision_recall_curve, average_precision_score
import mlflow
import mlflow.xgboost

def generate_synthetic_data(n_samples=50000):
    """Generate synthetic propensity training data."""
    np.random.seed(42)
    
    # User features
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
    
    # Generate conversion probability
    log_odds = (
        -2.0  # base
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
    
    # Load or generate data
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data()
    
    # Prepare features and target
    feature_cols = [c for c in df.columns if c != 'converted']
    X = df[feature_cols]
    y = df['converted']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Create model
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
    
    # Train
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    auc_score = roc_auc_score(y_test, y_pred_proba)
    ap_score = average_precision_score(y_test, y_pred_proba)
    
    # Log metrics
    mlflow.log_metric('test_auc', auc_score)
    mlflow.log_metric('test_ap', ap_score)
    
    # Log model
    mlflow.xgboost.log_model(model, 'propensity_model')
    
    # Save locally
    os.makedirs(output_path, exist_ok=True)
    model_path = os.path.join(output_path, 'propensity_model.joblib')
    joblib.dump(model, model_path)
    
    # Save feature names
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
```

### 3.3 Anomaly Detection Model

Create file: `src/azure-ml/training/train_anomaly_detector.py`

```python
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
    
    # Normal data
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
    
    # Anomaly data (various types)
    anomaly_data = {
        'impressions': np.concatenate([
            np.random.lognormal(15, 0.3, n_anomaly // 3),  # Spike
            np.random.lognormal(8, 0.3, n_anomaly // 3),   # Drop
            np.random.lognormal(12, 2, n_anomaly - 2*(n_anomaly // 3))  # High variance
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
            np.random.beta(20, 80, n_anomaly // 2),  # High CTR
            np.random.beta(1, 99, n_anomaly - n_anomaly // 2)  # Low CTR
        ]),
        'cvr': np.concatenate([
            np.random.beta(15, 85, n_anomaly // 2),
            np.random.beta(0.5, 99.5, n_anomaly - n_anomaly // 2)
        ]),
        'cpc': np.concatenate([
            np.random.lognormal(2, 0.3, n_anomaly // 2),  # High CPC
            np.random.lognormal(-1, 0.3, n_anomaly - n_anomaly // 2)  # Low CPC
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
    
    # Load or generate data
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data(anomaly_rate=contamination)
    
    # Prepare features
    feature_cols = [c for c in df.columns if c != 'is_anomaly']
    X = df[feature_cols]
    y_true = df['is_anomaly'] if 'is_anomaly' in df.columns else None
    
    # Create pipeline
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
    
    # Train
    pipeline.fit(X)
    
    # Evaluate if labels available
    if y_true is not None:
        y_pred = pipeline.predict(X)
        y_pred_binary = (y_pred == -1).astype(int)
        
        # Calculate metrics
        tp = ((y_pred_binary == 1) & (y_true == 1)).sum()
        fp = ((y_pred_binary == 1) & (y_true == 0)).sum()
        fn = ((y_pred_binary == 0) & (y_true == 1)).sum()
        tn = ((y_pred_binary == 0) & (y_true == 0)).sum()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        mlflow.log_metric('precision', precision)
        mlflow.log_metric('recall', recall)
        mlflow.log_metric('f1_score', f1)
        
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1 Score: {f1:.4f}")
    
    # Log model
    mlflow.sklearn.log_model(pipeline, 'anomaly_detector')
    
    # Save locally
    os.makedirs(output_path, exist_ok=True)
    model_path = os.path.join(output_path, 'anomaly_detector.joblib')
    joblib.dump(pipeline, model_path)
    
    # Save feature names
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
```

### 3.4 Media Mix Model

Create file: `src/azure-ml/training/train_media_mix.py`

```python
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
    return 1 - np.exp(-alpha * x / x.max())

def generate_synthetic_data(n_weeks=156):
    """Generate synthetic MMM training data (3 years weekly)."""
    np.random.seed(42)
    
    # Generate spend data by channel
    data = {
        'week': range(n_weeks),
        'tv_spend': np.abs(np.random.normal(100000, 30000, n_weeks)),
        'digital_spend': np.abs(np.random.normal(80000, 25000, n_weeks)),
        'print_spend': np.abs(np.random.normal(20000, 8000, n_weeks)),
        'ooh_spend': np.abs(np.random.normal(30000, 10000, n_weeks)),
        'radio_spend': np.abs(np.random.normal(15000, 5000, n_weeks)),
    }
    
    # Add seasonality
    seasonality = 1 + 0.3 * np.sin(2 * np.pi * np.arange(n_weeks) / 52)
    
    # Add trend
    trend = 1 + 0.002 * np.arange(n_weeks)
    
    df = pd.DataFrame(data)
    
    # Apply adstock
    for col in ['tv_spend', 'digital_spend', 'print_spend', 'ooh_spend', 'radio_spend']:
        decay = {'tv_spend': 0.7, 'digital_spend': 0.3, 'print_spend': 0.5, 
                 'ooh_spend': 0.6, 'radio_spend': 0.4}[col]
        df[f'{col}_adstock'] = adstock_transform(df[col].values, decay)
    
    # Generate sales based on spend with different elasticities
    base_sales = 500000
    tv_effect = 0.15 * saturation_transform(df['tv_spend_adstock'])
    digital_effect = 0.20 * saturation_transform(df['digital_spend_adstock'])
    print_effect = 0.05 * saturation_transform(df['print_spend_adstock'])
    ooh_effect = 0.08 * saturation_transform(df['ooh_spend_adstock'])
    radio_effect = 0.04 * saturation_transform(df['radio_spend_adstock'])
    
    df['sales'] = base_sales * (
        1 + tv_effect + digital_effect + print_effect + ooh_effect + radio_effect
    ) * seasonality * trend + np.random.normal(0, 20000, n_weeks)
    
    return df

def train_model(data_path=None, output_path='./outputs'):
    """Train the media mix model."""
    
    mlflow.start_run()
    
    # Load or generate data
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data()
    
    # Create transformed features
    spend_cols = ['tv_spend', 'digital_spend', 'print_spend', 'ooh_spend', 'radio_spend']
    
    for col in spend_cols:
        if f'{col}_adstock' not in df.columns:
            df[f'{col}_adstock'] = adstock_transform(df[col].values, decay=0.5)
        df[f'{col}_saturated'] = saturation_transform(df[f'{col}_adstock'].values)
    
    # Prepare features
    feature_cols = [f'{col}_saturated' for col in spend_cols]
    X = df[feature_cols]
    y = df['sales']
    
    # Create pipeline
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', Ridge(alpha=1.0))
    ])
    
    # Train
    pipeline.fit(X, y)
    
    # Evaluate
    train_score = pipeline.score(X, y)
    
    # Calculate contribution by channel
    model = pipeline.named_steps['model']
    scaler = pipeline.named_steps['scaler']
    
    scaled_X = scaler.transform(X)
    contributions = {}
    for i, col in enumerate(feature_cols):
        channel = col.replace('_saturated', '')
        contributions[channel] = float(np.abs(model.coef_[i] * scaled_X[:, i].mean()))
    
    total_contrib = sum(contributions.values())
    contribution_pct = {k: v/total_contrib*100 for k, v in contributions.items()}
    
    # Log metrics
    mlflow.log_metric('train_r2', train_score)
    for channel, pct in contribution_pct.items():
        mlflow.log_metric(f'{channel}_contribution_pct', pct)
    
    # Log model
    mlflow.sklearn.log_model(pipeline, 'media_mix_model')
    
    # Save locally
    os.makedirs(output_path, exist_ok=True)
    model_path = os.path.join(output_path, 'media_mix_model.joblib')
    joblib.dump(pipeline, model_path)
    
    # Save metadata
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
```

---

## 4. ENDPOINT DEPLOYMENT

### 4.1 Online Endpoint Configuration

Create file: `src/azure-ml/deploy/online-endpoint-config.yaml`

```yaml
$schema: https://azuremlschemas.azureedge.net/latest/managedOnlineEndpoint.schema.json
name: kdap-ml-endpoint
auth_mode: key
```

### 4.2 Model Deployment Configuration

Create file: `src/azure-ml/deploy/budget-optimizer-deployment.yaml`

```yaml
$schema: https://azuremlschemas.azureedge.net/latest/managedOnlineDeployment.schema.json
name: budget-optimizer-v1
endpoint_name: kdap-ml-endpoint
model:
  path: ./models/budget_optimizer
code_configuration:
  code: ./scoring
  scoring_script: score_budget_optimization.py
environment:
  conda_file: ./environments/budget-optimization-env.yaml
  image: mcr.microsoft.com/azureml/openmpi4.1.0-ubuntu20.04:latest
instance_type: Standard_DS3_v2
instance_count: 1
```

### 4.3 Master Deployment Script

Create file: `src/azure-ml/deploy/deploy-all-endpoints.sh`

```bash
#!/bin/bash
set -e

echo "=== KDAP ML Endpoint Deployment ==="
echo "Starting deployment at $(date)"

# Configuration
RESOURCE_GROUP="kdap-ml-rg"
WORKSPACE="kdap-ml-workspace"
ENDPOINT_NAME="kdap-ml-endpoint"

# Navigate to deploy directory
cd "$(dirname "$0")"

echo "Step 1: Creating online endpoint..."
az ml online-endpoint create \
  --name $ENDPOINT_NAME \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE \
  --file online-endpoint-config.yaml \
  || echo "Endpoint may already exist, continuing..."

echo "Step 2: Training models..."
cd ../training
python train_budget_optimizer.py --output-path ../models/budget_optimizer
python train_propensity.py --output-path ../models/propensity
python train_anomaly_detector.py --output-path ../models/anomaly_detector
python train_media_mix.py --output-path ../models/media_mix

echo "Step 3: Deploying Budget Optimizer..."
cd ../deploy
az ml online-deployment create \
  --name budget-optimizer-v1 \
  --endpoint-name $ENDPOINT_NAME \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE \
  --file budget-optimizer-deployment.yaml \
  --all-traffic

echo "Step 4: Deploying Propensity Scorer..."
az ml online-deployment create \
  --name propensity-scorer-v1 \
  --endpoint-name $ENDPOINT_NAME \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE \
  --file propensity-deployment.yaml

echo "Step 5: Deploying Anomaly Detector..."
az ml online-deployment create \
  --name anomaly-detector-v1 \
  --endpoint-name $ENDPOINT_NAME \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE \
  --file anomaly-detector-deployment.yaml

echo "Step 6: Deploying Media Mix Model..."
az ml online-deployment create \
  --name media-mix-v1 \
  --endpoint-name $ENDPOINT_NAME \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE \
  --file media-mix-deployment.yaml

echo "Step 7: Getting endpoint details..."
az ml online-endpoint show \
  --name $ENDPOINT_NAME \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE

echo "=== Deployment Complete ==="
echo "Finished at $(date)"
```

---

## 5. POWER AUTOMATE INTEGRATION

### 5.1 ML Capability Dispatcher Flow

Create flow: `MPA_ML_Capability_Dispatcher`

```yaml
trigger:
  type: manual
  inputs:
    capability_code:
      type: string
      required: true
    session_id:
      type: string
      required: true
    inputs:
      type: object
      required: true

actions:
  - name: Get_ML_Endpoint_Config
    type: Dataverse_GetRecord
    inputs:
      table: eap_capability_implementation
      filter: "capability_code eq '${capability_code}' and implementation_type eq 'AZURE_ML'"
      
  - name: Check_If_ML_Available
    type: Condition
    expression: "@not(empty(outputs('Get_ML_Endpoint_Config')))"
    
  - name: Call_ML_Endpoint
    type: HTTP
    runAfter: Check_If_ML_Available
    condition: "@equals(outputs('Check_If_ML_Available'), true)"
    inputs:
      method: POST
      uri: "@outputs('Get_ML_Endpoint_Config')?['implementation_reference']"
      headers:
        Authorization: "Bearer @{outputs('Get_ML_Key')}"
        Content-Type: application/json
      body:
        session_id: "@triggerBody()?['session_id']"
        inputs: "@triggerBody()?['inputs']"
        
  - name: Fallback_To_AI_Builder
    type: AI_Builder_Prompt
    runAfter: Check_If_ML_Available
    condition: "@equals(outputs('Check_If_ML_Available'), false)"
    inputs:
      prompt_code: "@concat(triggerBody()?['capability_code'], '_PROMPT')"
      inputs: "@triggerBody()?['inputs']"
      
  - name: Log_Telemetry
    type: Dataverse_CreateRecord
    inputs:
      table: eap_telemetry
      record:
        capability_code: "@triggerBody()?['capability_code']"
        session_id: "@triggerBody()?['session_id']"
        implementation_type: "@if(outputs('Check_If_ML_Available'), 'AZURE_ML', 'AI_BUILDER')"
        execution_time_ms: "@outputs('execution_duration')"
        status: "@if(outputs('result_status'), 'success', 'error')"

outputs:
  result: "@coalesce(outputs('Call_ML_Endpoint'), outputs('Fallback_To_AI_Builder'))"
```

---

## 6. KB FILES FOR ML CAPABILITIES

### 6.1 ANL_KB_ML_Models_v1.txt

Create file: `release/v6.0/agents/anl/kb/ANL_KB_ML_Models_v1.txt`

