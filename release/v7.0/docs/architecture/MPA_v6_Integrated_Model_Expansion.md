# MPA v6.0 INTEGRATED MODEL EXPANSION

## Seamless Integration of 42 HIGH Priority + 25 MEDIUM Priority Models

**Date:** January 18, 2026  
**Status:** APPROVED - Integration in Progress  
**Purpose:** Integrate expanded model catalog into existing MPA v6.0 architecture

---

## PART 1: ARCHITECTURE IMPACT SUMMARY

### 1.1 Before/After Comparison

| Component | Before | After | Delta |
|-----------|--------|-------|-------|
| Azure Functions | 13 | 45 | +32 |
| AI Builder Prompts | 26 | 50 | +24 |
| Capability Codes | 26 | 67 | +41 |
| Dataverse Registrations | 50 | 134 | +84 |
| KB Files (content update) | 37 | 37 | 0 (content expanded) |

### 1.2 Workload Distribution

| Task | Tool | Rationale |
|------|------|-----------|
| Azure Function code creation | VS Code Claude | Python code, requires testing |
| AI Builder prompt creation | VS Code Claude | Template-based, API deployable |
| KB content expansion | Desktop Claude | Long-form content, 6-Rule compliance |
| Dataverse schema updates | VS Code Claude | pac CLI automation |
| Deployment scripts | VS Code Claude | Shell/PowerShell automation |

---

## PART 2: EXPANDED AZURE FUNCTIONS CATALOG

### 2.1 Function Directory Structure (Updated)

```
mpa-functions-personal/
â”œâ”€â”€ host.json
â”œâ”€â”€ local.settings.json
â”œâ”€â”€ requirements.txt
â”œâ”€â”€ shared/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ models.py
â”‚   â”œâ”€â”€ validators.py
â”‚   â”œâ”€â”€ exceptions.py
â”‚   â”œâ”€â”€ logging_config.py
â”‚   â”œâ”€â”€ telemetry.py
â”‚   â”œâ”€â”€ dataverse_client.py
â”‚   â”œâ”€â”€ statistics/              # NEW: Shared statistical utilities
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ distributions.py
â”‚   â”‚   â”œâ”€â”€ hypothesis_tests.py
â”‚   â”‚   â”œâ”€â”€ confidence_intervals.py
â”‚   â”‚   â””â”€â”€ effect_size.py
â”‚   â”œâ”€â”€ optimization/            # NEW: Shared optimization utilities
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ linear_programming.py
â”‚   â”‚   â”œâ”€â”€ response_curves.py
â”‚   â”‚   â””â”€â”€ constraints.py
â”‚   â””â”€â”€ ml/                      # NEW: Shared ML utilities
â”‚       â”œâ”€â”€ __init__.py
â”‚       â”œâ”€â”€ calibration.py
â”‚       â”œâ”€â”€ feature_engineering.py
â”‚       â””â”€â”€ model_selection.py
â”‚
â”œâ”€â”€ anl_functions/               # EXPANDED: 13 â†’ 25 functions
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ marginal_return/         # EXISTING
â”‚   â”œâ”€â”€ scenario_compare/        # EXISTING
â”‚   â”œâ”€â”€ projection/              # EXISTING
â”‚   â”œâ”€â”€ bayesian/                # EXISTING
â”‚   â”œâ”€â”€ causal/                  # EXISTING
â”‚   â”œâ”€â”€ zscore_analysis/         # NEW
â”‚   â”œâ”€â”€ confidence_interval/     # NEW
â”‚   â”œâ”€â”€ power_analysis/          # NEW
â”‚   â”œâ”€â”€ regression_ols/          # NEW
â”‚   â”œâ”€â”€ regression_ridge/        # NEW
â”‚   â”œâ”€â”€ regression_lasso/        # NEW
â”‚   â”œâ”€â”€ regression_logistic/     # NEW
â”‚   â”œâ”€â”€ bayesian_ab_test/        # NEW
â”‚   â”œâ”€â”€ thompson_sampling/       # NEW
â”‚   â”œâ”€â”€ monte_carlo_enhanced/    # NEW
â”‚   â”œâ”€â”€ bootstrap/               # NEW
â”‚   â”œâ”€â”€ scenario_simulation/     # NEW
â”‚   â”œâ”€â”€ npv_calculator/          # NEW
â”‚   â”œâ”€â”€ irr_calculator/          # NEW
â”‚   â”œâ”€â”€ payback_analysis/        # NEW
â”‚   â”œâ”€â”€ breakeven_analysis/      # NEW
â”‚   â”œâ”€â”€ lp_optimizer/            # NEW
â”‚   â”œâ”€â”€ sensitivity_sobol/       # NEW
â”‚   â””â”€â”€ distribution_fitting/    # NEW
â”‚
â”œâ”€â”€ aud_functions/               # EXPANDED: 3 â†’ 15 functions
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ segment_priority/        # EXISTING
â”‚   â”œâ”€â”€ ltv_bgnbd/               # EXISTING (renamed)
â”‚   â”œâ”€â”€ propensity/              # EXISTING
â”‚   â”œâ”€â”€ ltv_pareto_nbd/          # NEW
â”‚   â”œâ”€â”€ ltv_contractual/         # NEW
â”‚   â”œâ”€â”€ ltv_cohort/              # NEW
â”‚   â”œâ”€â”€ survival_cox/            # NEW
â”‚   â”œâ”€â”€ rfm_scoring/             # NEW
â”‚   â”œâ”€â”€ kmeans_clustering/       # NEW
â”‚   â”œâ”€â”€ xgboost_classifier/      # NEW
â”‚   â”œâ”€â”€ lightgbm_classifier/     # NEW
â”‚   â”œâ”€â”€ probability_calibration/ # NEW
â”‚   â”œâ”€â”€ churn_risk_scoring/      # NEW
â”‚   â”œâ”€â”€ jaro_winkler_matching/   # NEW
â”‚   â””â”€â”€ uplift_modeling/         # NEW
â”‚
â”œâ”€â”€ cha_functions/               # EXPANDED: 1 â†’ 6 functions
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ optimize/                # EXISTING
â”‚   â”œâ”€â”€ response_curve_fit/      # NEW
â”‚   â”œâ”€â”€ saturation_detection/    # NEW
â”‚   â”œâ”€â”€ adstock_transform/       # NEW
â”‚   â”œâ”€â”€ synergy_detection/       # NEW
â”‚   â””â”€â”€ portfolio_optimization/  # NEW
â”‚
â”œâ”€â”€ spo_functions/               # UNCHANGED: 2 functions
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ fee_waterfall/
â”‚   â””â”€â”€ nbi_calculate/
â”‚
â””â”€â”€ prf_functions/               # EXPANDED: 2 â†’ 16 functions
    â”œâ”€â”€ __init__.py
    â”œâ”€â”€ anomaly/                 # EXISTING
    â”œâ”€â”€ attribution/             # EXISTING
    â”œâ”€â”€ attribution_time_decay/  # NEW
    â”œâ”€â”€ attribution_position/    # NEW
    â”œâ”€â”€ attribution_shapley/     # NEW
    â”œâ”€â”€ attribution_markov/      # NEW
    â”œâ”€â”€ ab_test_calculator/      # NEW
    â”œâ”€â”€ mvt_analysis/            # NEW
    â”œâ”€â”€ sequential_testing/      # NEW
    â”œâ”€â”€ bayesian_ab/             # NEW
    â”œâ”€â”€ srm_detector/            # NEW
    â”œâ”€â”€ geo_holdout/             # NEW
    â”œâ”€â”€ did_estimator/           # NEW
    â”œâ”€â”€ prophet_forecast/        # NEW
    â”œâ”€â”€ arima_forecast/          # NEW
    â””â”€â”€ ets_forecast/            # NEW
```

### 2.2 Complete Function Catalog (45 Functions)

#### ANL Agent Functions (25)

| ID | Function | Endpoint | Capability Code | Priority |
|----|----------|----------|-----------------|----------|
| ANL-001 | Marginal Return | /api/anl/marginal-return | CALCULATE_MARGINAL_RETURN | HIGH |
| ANL-002 | Scenario Compare | /api/anl/scenario-compare | COMPARE_SCENARIOS | HIGH |
| ANL-003 | Projection | /api/anl/projection | GENERATE_PROJECTIONS | HIGH |
| ANL-004 | Bayesian Inference | /api/anl/bayesian | APPLY_BAYESIAN_INFERENCE | HIGH |
| ANL-005 | Causal Analysis | /api/anl/causal | ANALYZE_CAUSALITY | HIGH |
| ANL-006 | Z-Score Analysis | /api/anl/zscore | CALCULATE_ZSCORE | HIGH |
| ANL-007 | Confidence Interval | /api/anl/confidence-interval | CALCULATE_CONFIDENCE_INTERVAL | HIGH |
| ANL-008 | Power Analysis | /api/anl/power-analysis | CALCULATE_POWER | HIGH |
| ANL-009 | OLS Regression | /api/anl/regression-ols | FIT_REGRESSION_OLS | HIGH |
| ANL-010 | Ridge Regression | /api/anl/regression-ridge | FIT_REGRESSION_RIDGE | HIGH |
| ANL-011 | Lasso Regression | /api/anl/regression-lasso | FIT_REGRESSION_LASSO | HIGH |
| ANL-012 | Logistic Regression | /api/anl/regression-logistic | FIT_REGRESSION_LOGISTIC | HIGH |
| ANL-013 | Bayesian A/B Test | /api/anl/bayesian-ab | BAYESIAN_AB_TEST | HIGH |
| ANL-014 | Thompson Sampling | /api/anl/thompson-sampling | THOMPSON_SAMPLING | HIGH |
| ANL-015 | Monte Carlo Enhanced | /api/anl/monte-carlo | RUN_MONTE_CARLO | HIGH |
| ANL-016 | Bootstrap | /api/anl/bootstrap | RUN_BOOTSTRAP | HIGH |
| ANL-017 | Scenario Simulation | /api/anl/scenario-simulation | RUN_SCENARIO_SIMULATION | HIGH |
| ANL-018 | NPV Calculator | /api/anl/npv | CALCULATE_NPV | HIGH |
| ANL-019 | IRR Calculator | /api/anl/irr | CALCULATE_IRR | HIGH |
| ANL-020 | Payback Analysis | /api/anl/payback | CALCULATE_PAYBACK | HIGH |
| ANL-021 | Break-Even Analysis | /api/anl/breakeven | CALCULATE_BREAKEVEN | HIGH |
| ANL-022 | LP Optimizer | /api/anl/lp-optimize | OPTIMIZE_LP | HIGH |
| ANL-023 | Sobol Sensitivity | /api/anl/sensitivity-sobol | ANALYZE_SENSITIVITY_SOBOL | MEDIUM |
| ANL-024 | Distribution Fitting | /api/anl/distribution-fit | FIT_DISTRIBUTION | MEDIUM |
| ANL-025 | Variance Decomposition | /api/anl/variance-decomposition | DECOMPOSE_VARIANCE | MEDIUM |

#### AUD Agent Functions (15)

| ID | Function | Endpoint | Capability Code | Priority |
|----|----------|----------|-----------------|----------|
| AUD-001 | Segment Priority | /api/aud/segment-priority | PRIORITIZE_SEGMENTS | HIGH |
| AUD-002 | LTV BG/NBD | /api/aud/ltv-bgnbd | CALCULATE_LTV_BGNBD | HIGH |
| AUD-003 | Propensity Score | /api/aud/propensity | SCORE_PROPENSITY | HIGH |
| AUD-004 | LTV Pareto/NBD | /api/aud/ltv-pareto | CALCULATE_LTV_PARETO | HIGH |
| AUD-005 | LTV Contractual | /api/aud/ltv-contractual | CALCULATE_LTV_CONTRACTUAL | HIGH |
| AUD-006 | LTV Cohort | /api/aud/ltv-cohort | CALCULATE_LTV_COHORT | HIGH |
| AUD-007 | Survival Cox | /api/aud/survival-cox | FIT_SURVIVAL_COX | MEDIUM |
| AUD-008 | RFM Scoring | /api/aud/rfm-score | CALCULATE_RFM | HIGH |
| AUD-009 | K-Means Clustering | /api/aud/kmeans | CLUSTER_KMEANS | HIGH |
| AUD-010 | XGBoost Classifier | /api/aud/xgboost-classify | CLASSIFY_XGBOOST | HIGH |
| AUD-011 | LightGBM Classifier | /api/aud/lightgbm-classify | CLASSIFY_LIGHTGBM | HIGH |
| AUD-012 | Probability Calibration | /api/aud/calibrate | CALIBRATE_PROBABILITY | HIGH |
| AUD-013 | Churn Risk Score | /api/aud/churn-risk | SCORE_CHURN_RISK | HIGH |
| AUD-014 | Jaro-Winkler Match | /api/aud/jaro-winkler | MATCH_JARO_WINKLER | HIGH |
| AUD-015 | Uplift Modeling | /api/aud/uplift | MODEL_UPLIFT | MEDIUM |

#### CHA Agent Functions (6)

| ID | Function | Endpoint | Capability Code | Priority |
|----|----------|----------|-----------------|----------|
| CHA-001 | Channel Optimize | /api/cha/optimize | OPTIMIZE_CHANNEL_MIX | HIGH |
| CHA-002 | Response Curve Fit | /api/cha/response-curve | FIT_RESPONSE_CURVE | HIGH |
| CHA-003 | Saturation Detection | /api/cha/saturation | DETECT_SATURATION | HIGH |
| CHA-004 | Adstock Transform | /api/cha/adstock | TRANSFORM_ADSTOCK | HIGH |
| CHA-005 | Synergy Detection | /api/cha/synergy | DETECT_SYNERGY | MEDIUM |
| CHA-006 | Portfolio Optimization | /api/cha/portfolio | OPTIMIZE_PORTFOLIO | MEDIUM |

#### SPO Agent Functions (2) - Unchanged

| ID | Function | Endpoint | Capability Code | Priority |
|----|----------|----------|-----------------|----------|
| SPO-001 | Fee Waterfall | /api/spo/fee-waterfall | CALCULATE_FEE_WATERFALL | HIGH |
| SPO-002 | NBI Calculate | /api/spo/nbi | CALCULATE_NBI | HIGH |

#### PRF Agent Functions (16)

| ID | Function | Endpoint | Capability Code | Priority |
|----|----------|----------|-----------------|----------|
| PRF-001 | Anomaly Detection | /api/prf/anomaly | DETECT_ANOMALIES | HIGH |
| PRF-002 | Attribution Basic | /api/prf/attribution | ANALYZE_ATTRIBUTION | HIGH |
| PRF-003 | Attribution Time-Decay | /api/prf/attribution-time-decay | ATTRIBUTE_TIME_DECAY | HIGH |
| PRF-004 | Attribution Position | /api/prf/attribution-position | ATTRIBUTE_POSITION | HIGH |
| PRF-005 | Attribution Shapley | /api/prf/attribution-shapley | ATTRIBUTE_SHAPLEY | HIGH |
| PRF-006 | Attribution Markov | /api/prf/attribution-markov | ATTRIBUTE_MARKOV | MEDIUM |
| PRF-007 | A/B Test Calculator | /api/prf/ab-test | CALCULATE_AB_TEST | HIGH |
| PRF-008 | MVT Analysis | /api/prf/mvt | ANALYZE_MVT | HIGH |
| PRF-009 | Sequential Testing | /api/prf/sequential-test | TEST_SEQUENTIAL | HIGH |
| PRF-010 | Bayesian A/B | /api/prf/bayesian-ab | TEST_BAYESIAN_AB | HIGH |
| PRF-011 | SRM Detector | /api/prf/srm | DETECT_SRM | HIGH |
| PRF-012 | Geo Holdout | /api/prf/geo-holdout | ANALYZE_GEO_HOLDOUT | HIGH |
| PRF-013 | DID Estimator | /api/prf/did | ESTIMATE_DID | HIGH |
| PRF-014 | Prophet Forecast | /api/prf/prophet | FORECAST_PROPHET | HIGH |
| PRF-015 | ARIMA Forecast | /api/prf/arima | FORECAST_ARIMA | HIGH |
| PRF-016 | ETS Forecast | /api/prf/ets | FORECAST_ETS | HIGH |

---

## PART 3: EXPANDED AI BUILDER PROMPTS CATALOG

### 3.1 AI Builder Prompts (50 Total)

AI Builder prompts serve as:
1. **Primary implementation** in Mastercard environment
2. **Fallback implementation** in Personal environment

#### New Prompts to Add (24)

| Agent | Prompt Name | Capability Code | Description |
|-------|-------------|-----------------|-------------|
| ANL | ANL_ZScore_Prompt | CALCULATE_ZSCORE | Statistical deviation analysis |
| ANL | ANL_ConfidenceInterval_Prompt | CALCULATE_CONFIDENCE_INTERVAL | CI calculation methods |
| ANL | ANL_PowerAnalysis_Prompt | CALCULATE_POWER | Sample size/power estimation |
| ANL | ANL_Regression_Prompt | FIT_REGRESSION_OLS | General regression guidance |
| ANL | ANL_BayesianAB_Prompt | BAYESIAN_AB_TEST | Bayesian test interpretation |
| ANL | ANL_MonteCarlo_Prompt | RUN_MONTE_CARLO | Simulation guidance |
| ANL | ANL_NPV_Prompt | CALCULATE_NPV | NPV calculation and interpretation |
| ANL | ANL_IRR_Prompt | CALCULATE_IRR | IRR calculation and interpretation |
| ANL | ANL_Breakeven_Prompt | CALCULATE_BREAKEVEN | Break-even analysis |
| AUD | AUD_LTVPareto_Prompt | CALCULATE_LTV_PARETO | Pareto/NBD LTV guidance |
| AUD | AUD_LTVCohort_Prompt | CALCULATE_LTV_COHORT | Cohort-based LTV analysis |
| AUD | AUD_RFM_Prompt | CALCULATE_RFM | RFM scoring methodology |
| AUD | AUD_Clustering_Prompt | CLUSTER_KMEANS | Segmentation guidance |
| AUD | AUD_ChurnRisk_Prompt | SCORE_CHURN_RISK | Churn risk assessment |
| AUD | AUD_Calibration_Prompt | CALIBRATE_PROBABILITY | Score calibration guidance |
| CHA | CHA_ResponseCurve_Prompt | FIT_RESPONSE_CURVE | Response curve interpretation |
| CHA | CHA_Saturation_Prompt | DETECT_SATURATION | Saturation point analysis |
| CHA | CHA_Adstock_Prompt | TRANSFORM_ADSTOCK | Adstock effect guidance |
| PRF | PRF_Shapley_Prompt | ATTRIBUTE_SHAPLEY | Shapley attribution interpretation |
| PRF | PRF_ABTest_Prompt | CALCULATE_AB_TEST | A/B test analysis |
| PRF | PRF_MVT_Prompt | ANALYZE_MVT | MVT interpretation |
| PRF | PRF_GeoHoldout_Prompt | ANALYZE_GEO_HOLDOUT | Geo test analysis |
| PRF | PRF_DID_Prompt | ESTIMATE_DID | DID interpretation |
| PRF | PRF_Forecast_Prompt | FORECAST_PROPHET | Forecasting guidance |

---

## PART 4: DATAVERSE CAPABILITY REGISTRATIONS

### 4.1 New Capability Codes (41 Additional)

Add to `eap_capability` table:

```csv
capability_code,capability_name,agent_code,description,is_active,version
CALCULATE_ZSCORE,Calculate Z-Score,ANL,Statistical deviation analysis,true,1.0
CALCULATE_CONFIDENCE_INTERVAL,Calculate Confidence Interval,ANL,CI estimation methods,true,1.0
CALCULATE_POWER,Calculate Power,ANL,Power analysis and sample size,true,1.0
FIT_REGRESSION_OLS,Fit OLS Regression,ANL,Ordinary least squares regression,true,1.0
FIT_REGRESSION_RIDGE,Fit Ridge Regression,ANL,L2 regularized regression,true,1.0
FIT_REGRESSION_LASSO,Fit Lasso Regression,ANL,L1 regularized regression,true,1.0
FIT_REGRESSION_LOGISTIC,Fit Logistic Regression,ANL,Binary outcome modeling,true,1.0
BAYESIAN_AB_TEST,Bayesian A/B Test,ANL,Bayesian test analysis,true,1.0
THOMPSON_SAMPLING,Thompson Sampling,ANL,Bandit action selection,true,1.0
RUN_MONTE_CARLO,Run Monte Carlo,ANL,Monte Carlo simulation,true,1.0
RUN_BOOTSTRAP,Run Bootstrap,ANL,Bootstrap resampling,true,1.0
RUN_SCENARIO_SIMULATION,Run Scenario Simulation,ANL,What-if scenario modeling,true,1.0
CALCULATE_NPV,Calculate NPV,ANL,Net present value,true,1.0
CALCULATE_IRR,Calculate IRR,ANL,Internal rate of return,true,1.0
CALCULATE_PAYBACK,Calculate Payback,ANL,Payback period analysis,true,1.0
CALCULATE_BREAKEVEN,Calculate Break-Even,ANL,Break-even point analysis,true,1.0
OPTIMIZE_LP,Optimize LP,ANL,Linear programming optimization,true,1.0
ANALYZE_SENSITIVITY_SOBOL,Analyze Sobol Sensitivity,ANL,Global sensitivity analysis,true,1.0
FIT_DISTRIBUTION,Fit Distribution,ANL,Statistical distribution fitting,true,1.0
DECOMPOSE_VARIANCE,Decompose Variance,ANL,ANOVA-style decomposition,true,1.0
CALCULATE_LTV_PARETO,Calculate LTV Pareto,AUD,Pareto/NBD LTV model,true,1.0
CALCULATE_LTV_CONTRACTUAL,Calculate LTV Contractual,AUD,Subscription LTV model,true,1.0
CALCULATE_LTV_COHORT,Calculate LTV Cohort,AUD,Cohort-based LTV,true,1.0
FIT_SURVIVAL_COX,Fit Cox Survival,AUD,Cox proportional hazards,true,1.0
CALCULATE_RFM,Calculate RFM,AUD,RFM scoring,true,1.0
CLUSTER_KMEANS,Cluster K-Means,AUD,K-means segmentation,true,1.0
CLASSIFY_XGBOOST,Classify XGBoost,AUD,XGBoost propensity,true,1.0
CLASSIFY_LIGHTGBM,Classify LightGBM,AUD,LightGBM propensity,true,1.0
CALIBRATE_PROBABILITY,Calibrate Probability,AUD,Score calibration,true,1.0
SCORE_CHURN_RISK,Score Churn Risk,AUD,Churn risk assessment,true,1.0
MATCH_JARO_WINKLER,Match Jaro-Winkler,AUD,String similarity matching,true,1.0
MODEL_UPLIFT,Model Uplift,AUD,Uplift/persuadability modeling,true,1.0
FIT_RESPONSE_CURVE,Fit Response Curve,CHA,Response curve estimation,true,1.0
DETECT_SATURATION,Detect Saturation,CHA,Channel saturation detection,true,1.0
TRANSFORM_ADSTOCK,Transform Adstock,CHA,Adstock effect modeling,true,1.0
DETECT_SYNERGY,Detect Synergy,CHA,Cross-channel synergy,true,1.0
OPTIMIZE_PORTFOLIO,Optimize Portfolio,CHA,Portfolio optimization,true,1.0
ATTRIBUTE_TIME_DECAY,Attribute Time-Decay,PRF,Time-decay attribution,true,1.0
ATTRIBUTE_POSITION,Attribute Position-Based,PRF,Position-based attribution,true,1.0
ATTRIBUTE_SHAPLEY,Attribute Shapley,PRF,Shapley value attribution,true,1.0
ATTRIBUTE_MARKOV,Attribute Markov,PRF,Markov chain attribution,true,1.0
CALCULATE_AB_TEST,Calculate A/B Test,PRF,A/B test statistics,true,1.0
ANALYZE_MVT,Analyze MVT,PRF,Multivariate test analysis,true,1.0
TEST_SEQUENTIAL,Test Sequential,PRF,Sequential testing,true,1.0
TEST_BAYESIAN_AB,Test Bayesian A/B,PRF,Bayesian A/B testing,true,1.0
DETECT_SRM,Detect SRM,PRF,Sample ratio mismatch,true,1.0
ANALYZE_GEO_HOLDOUT,Analyze Geo Holdout,PRF,Geo-based incrementality,true,1.0
ESTIMATE_DID,Estimate DID,PRF,Difference-in-differences,true,1.0
FORECAST_PROPHET,Forecast Prophet,PRF,Prophet forecasting,true,1.0
FORECAST_ARIMA,Forecast ARIMA,PRF,ARIMA forecasting,true,1.0
FORECAST_ETS,Forecast ETS,PRF,ETS forecasting,true,1.0
```

### 4.2 Implementation Registrations

For each capability, register in `eap_capability_implementation`:

**Personal Environment (Azure Function + AI Builder Fallback):**
```csv
capability_code,environment_code,implementation_type,implementation_reference,priority_order,is_enabled,timeout_seconds
CALCULATE_ZSCORE,PERSONAL,AZURE_FUNCTION,/api/anl/zscore,1,true,15
CALCULATE_ZSCORE,PERSONAL,AI_BUILDER_PROMPT,ANL_ZScore_Prompt,2,true,30
...
```

**Mastercard Environment (AI Builder Only):**
```csv
capability_code,environment_code,implementation_type,implementation_reference,priority_order,is_enabled,timeout_seconds
CALCULATE_ZSCORE,MASTERCARD,AI_BUILDER_PROMPT,ANL_ZScore_Prompt,1,true,30
...
```

---

## PART 5: UPDATED REQUIREMENTS.TXT

```
# Core Azure Functions
azure-functions>=1.17.0

# Data Processing
numpy>=1.24.0
pandas>=2.0.0
scipy>=1.11.0

# Machine Learning
scikit-learn>=1.3.0
xgboost>=2.0.0
lightgbm>=4.0.0

# Bayesian / Probabilistic
lifetimes>=0.11.3          # BG/NBD, Pareto/NBD, Gamma-Gamma
pymc>=5.0.0                # Bayesian inference (optional, for advanced)

# Optimization
cvxpy>=1.4.0               # Convex optimization
pulp>=2.7.0                # Linear programming

# Time Series / Forecasting
prophet>=1.1.0             # Facebook Prophet
statsmodels>=0.14.0        # ARIMA, ETS, statistical tests

# Survival Analysis
lifelines>=0.27.0          # Cox PH, Kaplan-Meier

# String Matching
jellyfish>=1.0.0           # Jaro-Winkler, Levenshtein

# Validation
pydantic>=2.0.0

# API
fastapi>=0.104.0

# Logging
structlog>=23.0.0

# Testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
```

---

## PART 6: VS CODE CLAUDE TASKS

### 6.1 Function Implementation Order

**Phase 1: Statistical Foundations (Week 1)**
```
Priority: Create shared statistical utilities first
Files to create:
- shared/statistics/distributions.py
- shared/statistics/hypothesis_tests.py
- shared/statistics/confidence_intervals.py
- shared/statistics/effect_size.py

Then implement:
- anl_functions/zscore_analysis/
- anl_functions/confidence_interval/
- anl_functions/power_analysis/
- anl_functions/regression_ols/
- anl_functions/regression_ridge/
- anl_functions/regression_lasso/
- anl_functions/regression_logistic/
```

**Phase 2: Financial Models (Week 1-2)**
```
- anl_functions/npv_calculator/
- anl_functions/irr_calculator/
- anl_functions/payback_analysis/
- anl_functions/breakeven_analysis/
- anl_functions/lp_optimizer/
```

**Phase 3: Bayesian & Simulation (Week 2)**
```
- anl_functions/bayesian_ab_test/
- anl_functions/thompson_sampling/
- anl_functions/monte_carlo_enhanced/
- anl_functions/bootstrap/
- anl_functions/scenario_simulation/
```

**Phase 4: Customer Intelligence (Week 2-3)**
```
- aud_functions/ltv_pareto_nbd/
- aud_functions/ltv_contractual/
- aud_functions/ltv_cohort/
- aud_functions/rfm_scoring/
- aud_functions/kmeans_clustering/
- aud_functions/xgboost_classifier/
- aud_functions/lightgbm_classifier/
- aud_functions/probability_calibration/
- aud_functions/churn_risk_scoring/
- aud_functions/jaro_winkler_matching/
```

**Phase 5: Testing & Attribution (Week 3-4)**
```
- prf_functions/attribution_time_decay/
- prf_functions/attribution_position/
- prf_functions/attribution_shapley/
- prf_functions/ab_test_calculator/
- prf_functions/mvt_analysis/
- prf_functions/sequential_testing/
- prf_functions/bayesian_ab/
- prf_functions/srm_detector/
- prf_functions/geo_holdout/
- prf_functions/did_estimator/
```

**Phase 6: Forecasting & Channel (Week 4)**
```
- prf_functions/prophet_forecast/
- prf_functions/arima_forecast/
- prf_functions/ets_forecast/
- cha_functions/response_curve_fit/
- cha_functions/saturation_detection/
- cha_functions/adstock_transform/
```

### 6.2 Deployment Automation Scripts

**deploy_functions.sh**
```bash
#!/bin/bash
# Deploy all Azure Functions to Personal environment

set -e

FUNCTION_APP="mpa-functions-personal"
RESOURCE_GROUP="mpa-rg-personal"

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Running unit tests ==="
pytest tests/ -v --tb=short

echo "=== Deploying to Azure ==="
func azure functionapp publish $FUNCTION_APP

echo "=== Updating capability registrations ==="
python scripts/update_capability_registrations.py

echo "=== Smoke testing endpoints ==="
python scripts/smoke_test_functions.py

echo "=== Deployment complete ==="
```

**update_capability_registrations.py**
```python
#!/usr/bin/env python3
"""
Update eap_capability_implementation with new function URLs
"""
import os
import json
from dataverse_client import DataverseClient

FUNCTION_APP_URL = os.getenv('FUNCTION_APP_URL', 
    'https://mpa-functions-personal.azurewebsites.net')

IMPLEMENTATIONS = [
    # ANL Functions
    {"capability_code": "CALCULATE_ZSCORE", "endpoint": "/api/anl/zscore"},
    {"capability_code": "CALCULATE_CONFIDENCE_INTERVAL", "endpoint": "/api/anl/confidence-interval"},
    {"capability_code": "CALCULATE_POWER", "endpoint": "/api/anl/power-analysis"},
    # ... (all 45 functions)
]

def main():
    client = DataverseClient()
    
    for impl in IMPLEMENTATIONS:
        full_url = f"{FUNCTION_APP_URL}{impl['endpoint']}"
        
        # Upsert implementation record
        client.upsert_capability_implementation(
            capability_code=impl['capability_code'],
            environment_code='PERSONAL',
            implementation_type='AZURE_FUNCTION',
            implementation_reference=full_url,
            priority_order=1,
            is_enabled=True
        )
        print(f"Registered: {impl['capability_code']} -> {full_url}")

if __name__ == '__main__':
    main()
```

---

## PART 7: DESKTOP CLAUDE TASKS

### 7.1 KB Content Expansion

Desktop Claude must expand the following KB files to include methodology for new models:

#### ANL_KB_Analytics_Core_v1.txt
Add sections:
- Statistical Foundations (Z-Score, CI, Power Analysis)
- Regression Methods Overview
- Distribution Selection Guide

#### ANL_KB_Bayesian_Inference_v1.txt
Add sections:
- Bayesian A/B Testing Methodology
- Thompson Sampling for Optimization
- MCMC Interpretation Guide

#### ANL_KB_Budget_Optimization_v1.txt
Add sections:
- NPV/IRR Decision Framework
- Break-Even Analysis Methods
- Linear Programming for Allocation

#### AUD_KB_LTV_Modeling_v1.txt
Add sections:
- Pareto/NBD Model Details
- Contractual vs Non-Contractual LTV
- Survival Analysis (Cox PH) for Lifespan

#### AUD_KB_Propensity_ML_v1.txt
Add sections:
- XGBoost/LightGBM Configuration
- Probability Calibration (Platt, Isotonic)
- Uplift Modeling Framework

#### PRF_KB_Attribution_Methods_v1.txt
Add sections:
- Shapley Value Attribution
- Markov Chain Attribution
- Attribution Model Selection Guide

#### PRF_KB_Incrementality_Testing_v1.txt
Add sections:
- A/B Test Calculator Methodology
- MVT Design and Analysis
- Sequential Testing Framework
- Bayesian A/B Testing
- SRM Detection

### 7.2 KB File Character Targets (Updated)

| File | Original Target | Updated Target | Reason |
|------|-----------------|----------------|--------|
| ANL_KB_Analytics_Core_v1.txt | 25K | 30K | +Statistical foundations |
| ANL_KB_Bayesian_Inference_v1.txt | 18K | 25K | +Bayesian A/B, Thompson |
| ANL_KB_Budget_Optimization_v1.txt | 22K | 28K | +NPV/IRR/Breakeven |
| AUD_KB_LTV_Modeling_v1.txt | 20K | 28K | +Pareto/NBD, Survival |
| AUD_KB_Propensity_ML_v1.txt | 18K | 25K | +XGBoost/LGB, Calibration |
| PRF_KB_Attribution_Methods_v1.txt | 20K | 28K | +Shapley, Markov |
| PRF_KB_Incrementality_Testing_v1.txt | 20K | 30K | +Full testing suite |

---

## PART 8: UPDATED DEPLOYMENT TIMELINE

### Week 1: Foundation
| Day | VS Code Claude | Desktop Claude |
|-----|---------------|----------------|
| 1 | Set up function app structure, shared utilities | Begin ANL_KB_Analytics_Core expansion |
| 2 | Implement statistical functions (ANL-006 to ANL-008) | Continue ANL KB files |
| 3 | Implement regression functions (ANL-009 to ANL-012) | AUD_KB_LTV_Modeling expansion |
| 4 | Implement financial functions (ANL-018 to ANL-021) | AUD_KB_Propensity_ML expansion |
| 5 | Unit tests for Week 1 functions | Complete ANL + AUD KB expansions |

### Week 2: Advanced Analytics
| Day | VS Code Claude | Desktop Claude |
|-----|---------------|----------------|
| 1 | Implement Bayesian functions (ANL-013, ANL-014) | ANL_KB_Bayesian_Inference expansion |
| 2 | Implement simulation functions (ANL-015 to ANL-017) | ANL_KB_Budget_Optimization expansion |
| 3 | Implement AUD functions (AUD-004 to AUD-009) | PRF_KB_Attribution_Methods expansion |
| 4 | Implement AUD ML functions (AUD-010 to AUD-015) | PRF_KB_Incrementality_Testing expansion |
| 5 | Unit tests for Week 2 functions | Complete PRF KB expansions |

### Week 3: Testing & Attribution
| Day | VS Code Claude | Desktop Claude |
|-----|---------------|----------------|
| 1 | Implement attribution functions (PRF-003 to PRF-006) | EAP shared KB updates |
| 2 | Implement testing functions (PRF-007 to PRF-011) | Instruction file updates |
| 3 | Implement incrementality functions (PRF-012, PRF-013) | 6-Rule compliance validation |
| 4 | Implement CHA functions (CHA-002 to CHA-006) | Final KB review |
| 5 | Unit tests for Week 3 functions | KB upload to SharePoint |

### Week 4: Forecasting & Integration
| Day | VS Code Claude | Desktop Claude |
|-----|---------------|----------------|
| 1 | Implement forecasting functions (PRF-014 to PRF-016) | AI Builder prompt creation |
| 2 | Integration testing | AI Builder prompt testing |
| 3 | Dataverse capability registrations | Solution packaging |
| 4 | End-to-end testing | Solution deployment |
| 5 | Production deployment | Validation testing |

---

## PART 9: VALIDATION CRITERIA

### 9.1 Function Validation

Each Azure Function must pass:
- [ ] Unit tests with >90% code coverage
- [ ] Input validation for all edge cases
- [ ] Output schema compliance
- [ ] Performance within timeout (30s default)
- [ ] Error handling returns proper codes
- [ ] Telemetry logging complete

### 9.2 AI Builder Validation

Each AI Builder prompt must pass:
- [ ] Output parses as valid JSON
- [ ] All required fields present
- [ ] Numeric values within expected ranges
- [ ] Consistent with Azure Function output
- [ ] Temperature/token settings optimized

### 9.3 KB Validation

Each KB file must pass:
- [ ] 6-Rule compliance check
- [ ] Character count within target
- [ ] All new model sections included
- [ ] Cross-references accurate
- [ ] Formulas correctly documented

---

## APPENDIX A: FUNCTION TEMPLATE

```python
# Standard function template for new Azure Functions
import azure.functions as func
import logging
import json
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from shared.models import StandardRequest, StandardResponse
from shared.validators import validate_inputs
from shared.telemetry import log_execution
from shared.exceptions import ValidationError, CalculationError

# Request/Response Models
class CalculateXRequest(BaseModel):
    """Request model for Calculate X capability"""
    capability_code: str = Field(default="CALCULATE_X")
    session_id: str
    request_id: str
    inputs: dict  # Define specific input schema

class CalculateXResponse(BaseModel):
    """Response model for Calculate X capability"""
    status: str
    capability_code: str
    request_id: str
    execution_time_ms: int
    result: dict  # Define specific output schema
    confidence: float
    confidence_level: str
    metadata: dict

# Main function
async def main(req: func.HttpRequest) -> func.HttpResponse:
    start_time = datetime.utcnow()
    
    try:
        # Parse request
        request_data = CalculateXRequest(**req.get_json())
        
        # Validate inputs
        validate_inputs(request_data.inputs)
        
        # Execute calculation
        result = calculate_x(request_data.inputs)
        
        # Build response
        execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        response = CalculateXResponse(
            status="success",
            capability_code=request_data.capability_code,
            request_id=request_data.request_id,
            execution_time_ms=execution_time,
            result=result,
            confidence=0.95,
            confidence_level="high",
            metadata={
                "function_version": "1.0.0",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        # Log telemetry
        log_execution(request_data, response, execution_time)
        
        return func.HttpResponse(
            body=response.json(),
            mimetype="application/json",
            status_code=200
        )
        
    except ValidationError as e:
        return func.HttpResponse(
            body=json.dumps({"error": str(e), "code": "VALIDATION_ERROR"}),
            mimetype="application/json",
            status_code=400
        )
    except Exception as e:
        logging.exception("Unexpected error")
        return func.HttpResponse(
            body=json.dumps({"error": "Internal error", "code": "INTERNAL_ERROR"}),
            mimetype="application/json",
            status_code=500
        )

def calculate_x(inputs: dict) -> dict:
    """
    Core calculation logic
    """
    # Implement model-specific calculation
    pass
```

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Status:** APPROVED - Integration in Progress
