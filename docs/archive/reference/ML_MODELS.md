# KDAP Machine Learning Models

## Overview

KDAP includes 7 ML models for marketing analytics, deployed via Azure Machine Learning.

---

## Model Inventory

| Model | Agent | Purpose | Algorithm |
|-------|-------|---------|-----------|
| Churn Predictor | AUD | Customer retention risk | CatBoost Classifier |
| Media Mix Model | ANL | Channel contribution | Bayesian Regression |
| Lookalike Model | AUD | Audience expansion | Ensemble (KNN + RF + GB) |
| Response Curve | ANL | Diminishing returns | Parametric Curves |
| Budget Optimizer | ANL | Allocation optimization | Constrained Optimization |
| Propensity Model | AUD | Conversion likelihood | Gradient Boosting |
| Anomaly Detector | PRF | Performance alerts | Isolation Forest |

---

## Churn Predictor

**Purpose:** Predict customer churn risk for retention targeting.

**Algorithm:** CatBoost Classifier with categorical feature handling.

**Input Features:**
| Feature | Type | Description |
|---------|------|-------------|
| tenure_months | int | Customer tenure |
| monthly_spend | float | Average monthly spend |
| transaction_count | int | Number of transactions |
| support_tickets | int | Support ticket count |
| last_activity_days | int | Days since last activity |
| email_engagement | float | Email open rate (0-1) |
| product_category | string | Primary product category |

**Output:**
```json
{
  "churn_probability": 0.73,
  "risk_tier": "HIGH",
  "confidence": 0.89,
  "top_factors": [
    {"feature": "last_activity_days", "impact": 0.35},
    {"feature": "support_tickets", "impact": 0.28}
  ]
}
```

**Risk Tiers:**
- LOW: < 0.3 probability
- MEDIUM: 0.3 - 0.6 probability
- HIGH: > 0.6 probability

---

## Media Mix Model (MMM)

**Purpose:** Measure marketing channel contribution to revenue.

**Algorithm:** Bayesian regression with adstock transformations.

**Input Features:**
| Feature | Type | Description |
|---------|------|-------------|
| {channel}_spend | float | Weekly channel spend |
| {channel}_impressions | int | Weekly impressions |
| seasonality | float | Seasonal index |
| holiday_flag | int | Holiday week indicator |
| price_index | float | Relative pricing |
| competitor_activity | float | Competitor SOV |

**Adstock Parameters:**
| Channel | Decay Rate | Saturation |
|---------|------------|------------|
| TV | 0.85 | Log |
| Digital | 0.60 | Hill |
| Social | 0.50 | Hill |
| Search | 0.30 | Linear |
| OOH | 0.70 | Log |

**Output:**
```json
{
  "channel_contributions": {
    "tv": {"revenue": 150000, "roi": 2.5, "share": 0.35},
    "digital": {"revenue": 120000, "roi": 3.2, "share": 0.28},
    "social": {"revenue": 80000, "roi": 2.8, "share": 0.19}
  },
  "base_revenue": 75000,
  "total_attributed": 350000,
  "model_fit": {"r_squared": 0.87, "mape": 0.08}
}
```

---

## Lookalike Model

**Purpose:** Find prospects similar to high-value customers.

**Algorithm:** Ensemble of KNN, Random Forest, and Gradient Boosting.

**Seed Audience Features:**
| Feature | Type | Description |
|---------|------|-------------|
| age_bucket | string | Age range |
| income_bucket | string | Income range |
| location_dma | string | DMA region |
| interests | list | Interest categories |
| purchase_history | list | Category purchases |
| engagement_score | float | Site engagement |

**Output:**
```json
{
  "prospects": [
    {
      "prospect_id": "PROS_001234",
      "similarity_score": 0.92,
      "predicted_ltv": 850,
      "match_factors": ["interests", "purchase_history"]
    }
  ],
  "expansion_factor": 15.3,
  "estimated_reach": 2500000
}
```

---

## Response Curve Model

**Purpose:** Model diminishing returns for budget allocation.

**Curve Types:**
| Type | Formula | Use Case |
|------|---------|----------|
| Log | y = a * log(x + 1) | General purpose |
| Hill | y = a * x^n / (k^n + x^n) | S-curve saturation |
| Adbudg | y = a * x^n / (b + x^n) | Advertising response |
| Exponential | y = a * (1 - e^(-bx)) | Rapid saturation |
| Linear | y = a * x + b | No saturation (rare) |

**Input:**
```json
{
  "channel": "search",
  "spend_levels": [10000, 25000, 50000, 75000, 100000],
  "historical_data": [...],
  "curve_type": "hill"
}
```

**Output:**
```json
{
  "curve_parameters": {"a": 150000, "n": 0.6, "k": 50000},
  "saturation_point": 85000,
  "optimal_spend": 62000,
  "marginal_returns": [
    {"spend": 10000, "marginal_roi": 4.2},
    {"spend": 50000, "marginal_roi": 2.1},
    {"spend": 100000, "marginal_roi": 0.8}
  ]
}
```

---

## Budget Optimizer

**Purpose:** Optimal budget allocation across channels.

**Algorithm:** Sequential Least Squares Programming (SLSQP) with constraints.

**Constraints:**
| Constraint | Type | Description |
|------------|------|-------------|
| Total Budget | Equality | Sum = budget |
| Channel Min | Inequality | Spend >= minimum |
| Channel Max | Inequality | Spend <= maximum |
| Mix Ratios | Inequality | Digital >= X% |

**Input:**
```json
{
  "total_budget": 500000,
  "channels": ["tv", "digital", "social", "search"],
  "constraints": {
    "tv": {"min": 50000, "max": 200000},
    "digital": {"min": 100000, "max": 300000}
  },
  "objective": "maximize_revenue"
}
```

**Output:**
```json
{
  "optimal_allocation": {
    "tv": 150000,
    "digital": 180000,
    "social": 95000,
    "search": 75000
  },
  "projected_revenue": 1850000,
  "projected_roi": 2.7,
  "confidence_interval": [1700000, 2000000]
}
```

---

## Propensity Model

**Purpose:** Predict conversion likelihood for targeting.

**Algorithm:** Gradient Boosting with probability calibration.

**Features:**
| Feature | Type | Description |
|---------|------|-------------|
| page_views | int | Site page views |
| session_duration | float | Avg session minutes |
| cart_additions | int | Items added to cart |
| email_clicks | int | Email link clicks |
| days_since_visit | int | Recency |
| device_type | string | Mobile/Desktop/Tablet |

**Output:**
```json
{
  "conversion_probability": 0.45,
  "propensity_decile": 8,
  "recommended_action": "high_value_offer",
  "expected_value": 125.50
}
```

---

## Anomaly Detector

**Purpose:** Detect performance anomalies for alerting.

**Algorithm:** Isolation Forest with seasonal decomposition.

**Input Metrics:**
- impressions, clicks, conversions, spend, ctr, cvr, cpc, cpm, roas

**Alert Thresholds:**
| Severity | Threshold | Action |
|----------|-----------|--------|
| INFO | 1.5σ | Log only |
| WARNING | 2.0σ | Notification |
| CRITICAL | 3.0σ | Alert + pause |

**Output:**
```json
{
  "anomalies": [
    {
      "metric": "ctr",
      "timestamp": "2026-01-19T10:00:00Z",
      "expected": 0.025,
      "actual": 0.008,
      "deviation": -3.2,
      "severity": "CRITICAL",
      "possible_causes": ["creative fatigue", "audience saturation"]
    }
  ]
}
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Azure ML Workspace                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Churn     │  │    MMM      │  │  Lookalike  │     │
│  │  Endpoint   │  │  Endpoint   │  │  Endpoint   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐     │
│  │  Response   │  │   Budget    │  │  Propensity │     │
│  │   Curve     │  │  Optimizer  │  │   Model     │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│                 ┌────────┴────────┐                     │
│                 │ Anomaly Detector│                     │
│                 └─────────────────┘                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │    Azure Functions       │
            │    (RunMLInference)      │
            └──────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │    Power Automate        │
            │    (ML Flow Trigger)     │
            └──────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │    Copilot Studio        │
            │    (ANL/AUD/PRF Agents)  │
            └──────────────────────────┘
```

---

## Training Pipeline

```bash
# Generate training data
python -m kdap_ml.data generate --model churn --samples 50000

# Train model
python -m kdap_ml train --model churn --config config/churn_predictor.yaml

# Evaluate
python -m kdap_ml evaluate --model churn --test-split 0.2

# Deploy
python -m kdap_ml deploy --model churn --environment production
```

---

## Model Monitoring

### Metrics Tracked
- Prediction latency (p50, p95, p99)
- Prediction volume
- Feature drift
- Prediction drift
- Model accuracy (periodic revalidation)

### Retraining Triggers
- Feature drift > 0.15
- Accuracy drop > 5%
- Monthly schedule
- Manual trigger

---

## File Locations

```
src/ml-training/
├── kdap_ml/              # Model implementations
│   ├── churn_predictor.py
│   ├── media_mix.py
│   ├── lookalike.py
│   ├── response_curve.py
│   ├── budget_optimizer.py
│   ├── propensity.py
│   └── anomaly_detector.py
├── config/               # Model configurations
├── deployment/           # Azure ML deployment
├── data/                # Data pipelines
└── tests/               # Unit tests
```
