# KDAP ML Training

Machine Learning model training and deployment for the Kessel Digital Agent Platform.

## Overview

This module provides training pipelines for three core ML models:

| Model | Agent | Algorithm | Purpose |
|-------|-------|-----------|---------|
| Budget Optimizer | ANL | LightGBM | Predict optimal media spend allocation |
| Propensity Scorer | AUD | XGBoost | Score customer conversion likelihood |
| Anomaly Detector | PRF | Isolation Forest + LOF | Detect performance metric anomalies |

## Quick Start

### Installation

```bash
cd src/ml-training
pip install -r requirements.txt
```

### Training Models

```bash
# Train budget optimizer with synthetic data
python train.py budget --output ./models --mlflow

# Train propensity model with custom data
python train.py propensity --data ./data/customers.csv --target converted --tune

# Train anomaly detector
python train.py anomaly --samples 5000 --output ./models
```

### CLI Commands

```bash
# Budget Optimizer
python train.py budget [OPTIONS]
  --data PATH        Training data file (CSV/Parquet)
  --target NAME      Target column name
  --samples N        Number of synthetic samples (if no data)
  --output DIR       Output directory for models
  --tune            Enable hyperparameter tuning
  --trials N        Number of tuning trials
  --mlflow          Log to MLflow

# Propensity Model
python train.py propensity [OPTIONS]
  (same options as budget)

# Anomaly Detector
python train.py anomaly [OPTIONS]
  --data PATH       Training data file
  --target NAME     Target column (optional for unsupervised)
  --samples N       Number of synthetic samples
  --output DIR      Output directory
  --mlflow         Log to MLflow

# Deploy to Azure ML
python train.py deploy [OPTIONS]
  --model-path PATH       Local model file
  --model-name NAME       Azure ML model name
  --endpoint-name NAME    Endpoint name
  --deployment-name NAME  Deployment name
  --scoring-script PATH   Scoring script
  --instance-type TYPE    VM size (default: Standard_DS2_v2)
  --instance-count N      Number of instances
```

## Project Structure

```
src/ml-training/
├── requirements.txt          # Python dependencies
├── train.py                  # CLI entry point
├── config/
│   ├── config.yaml          # Global configuration
│   ├── budget_optimizer.yaml
│   ├── propensity.yaml
│   └── anomaly_detector.yaml
├── kdap_ml/
│   ├── __init__.py
│   ├── config.py            # Configuration management
│   ├── preprocessing.py     # Data preprocessing utilities
│   ├── base.py              # Base trainer class
│   ├── budget_optimizer.py  # Budget optimization model
│   ├── propensity.py        # Propensity scoring model
│   └── anomaly_detector.py  # Anomaly detection model
└── deployment/
    ├── azure_ml_deploy.py   # Azure ML deployment
    └── scoring/
        ├── score_budget.py
        ├── score_propensity.py
        └── score_anomaly.py
```

## Model Details

### Budget Optimizer (ANL Agent)

**Algorithm**: LightGBM Regressor

**Features**:
- Current spend, historical ROI
- Audience size, competitive intensity
- Seasonality index, market share
- Channel-specific metrics (CPM, CTR, CVR)

**Output**:
```json
{
  "optimal_spend": 75000.0,
  "expected_return": 86250.0,
  "confidence_interval_lower": 68000.0,
  "confidence_interval_upper": 82000.0,
  "marginal_return": 0.15,
  "channel_id": "search"
}
```

### Propensity Scorer (AUD Agent)

**Algorithm**: XGBoost Classifier with Isotonic Calibration

**Features**:
- RFM metrics (recency, frequency, monetary)
- Engagement scores, tenure
- Email interaction rates
- Channel preferences

**Output**:
```json
{
  "customer_id": "CUST_001",
  "propensity_score": 0.78,
  "confidence": 0.56,
  "percentile_rank": 85.3,
  "segment_assignment": "High Propensity"
}
```

### Anomaly Detector (PRF Agent)

**Algorithm**: Ensemble (Isolation Forest + Local Outlier Factor)

**Features**:
- Time series lags (1d, 7d, 14d, 28d)
- Rolling statistics (mean, std)
- Z-scores, percentage changes
- Contextual features (day of week, seasonality)

**Output**:
```json
{
  "is_anomaly": true,
  "anomaly_score": 0.85,
  "anomaly_type": "spike",
  "expected_value": 100.0,
  "deviation": 50.0,
  "confidence": 0.70
}
```

## Configuration

### Environment Variables

```bash
# Azure ML
AZURE_SUBSCRIPTION_ID=<subscription-id>
AZURE_RESOURCE_GROUP=<resource-group>
AZURE_ML_WORKSPACE=kdap-ml-workspace
AZURE_REGION=eastus

# MLflow
MLFLOW_TRACKING_URI=<tracking-uri>

# Environment
KDAP_ENV=dev  # or prod
```

### Model Configuration

Each model has a YAML config file in `config/`:

```yaml
model:
  name: budget_optimizer
  type: regression
  algorithm: lightgbm

features:
  numerical:
    - current_spend
    - historical_roi_mean
  categorical:
    - channel_id
    - objective_type

hyperparameters:
  lightgbm:
    num_leaves: 31
    learning_rate: 0.05
    n_estimators: 1000

tuning:
  method: optuna
  n_trials: 100
  metric: rmse
```

## Azure ML Deployment

### 1. Register Model

```python
from deployment.azure_ml_deploy import AzureMLDeployer

deployer = AzureMLDeployer()
model = deployer.register_model(
    model_path="./models/budget_optimizer.joblib",
    model_name="kdap-budget-optimizer",
)
```

### 2. Create Endpoint

```python
endpoint = deployer.create_endpoint(
    endpoint_name="kdap-budget-optimizer",
    auth_mode="key",
)
```

### 3. Deploy

```python
result = deployer.deploy_model(
    model_path="./models/budget_optimizer.joblib",
    model_name="kdap-budget-optimizer",
    endpoint_name="kdap-budget-optimizer",
    deployment_name="budget-optimizer-v1",
    scoring_script="score_budget.py",
)
```

### 4. Test Endpoint

```python
result = deployer.test_endpoint(
    endpoint_name="kdap-budget-optimizer",
    test_data={
        "data": [{
            "channel_id": "search",
            "current_spend": 50000,
            "historical_roi_mean": 2.5,
        }]
    }
)
```

## Evaluation Metrics

### Regression (Budget Optimizer)
- RMSE: Root Mean Square Error
- MAE: Mean Absolute Error
- MAPE: Mean Absolute Percentage Error
- R²: Coefficient of Determination

### Classification (Propensity)
- AUC-ROC: Area Under ROC Curve
- AUC-PR: Area Under Precision-Recall Curve
- F1 Score
- Precision / Recall

### Anomaly Detection
- Precision: True positives / Predicted positives
- Recall: True positives / Actual positives
- F1 Score
- Detected anomaly rate

## MLflow Integration

All trainers support MLflow logging:

```python
trainer = BudgetOptimizerTrainer()
trainer.train(X_train, y_train, X_val, y_val)
run_id = trainer.log_to_mlflow(run_name="budget-v1")
```

Tracked items:
- Hyperparameters
- Metrics
- Model artifacts
- Configuration files

## Testing

```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=kdap_ml tests/
```

## License

Proprietary - Kessel Digital
