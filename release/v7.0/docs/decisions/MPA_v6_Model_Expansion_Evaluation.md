# MPA v6.0 MODEL EXPANSION EVALUATION

## Comprehensive Analysis of Sophisticated Models for Agent Integration

**Date:** January 18, 2026  
**Purpose:** Evaluate and recommend additional models for MPA v6.0 to maximize analytical sophistication  
**Status:** PENDING APPROVAL

---

## EXECUTIVE SUMMARY

Based on extensive review of prior planning sessions and industry best practices, this document identifies **78 additional models and algorithms** that can be integrated into MPA v6.0 across 7 categories. The current architecture specifies 13 Azure Functions and 26 AI Builder prompts. This expansion would add significant analytical depth while maintaining the capability abstraction layer for dual-environment deployment.

**Current State:** 13 function implementations + 26 AI Builder prompts  
**Proposed State:** 45+ function implementations + 50+ AI Builder prompts

---

## PART 1: MODELS ALREADY SPECIFIED (BASELINE)

### Currently in Azure Functions (13)

| ID | Function | Models Used |
|----|----------|-------------|
| ANL-001 | Marginal Return | Logarithmic/Power response curves, scipy.optimize |
| ANL-002 | Scenario Compare | Monte Carlo (1000+ iterations), Risk metrics (HHI) |
| ANL-003 | Projections | Linear extrapolation, confidence intervals |
| ANL-004 | Bayesian Inference | Prior/posterior updating, credible intervals |
| ANL-005 | Causal Analysis | Basic incrementality estimation |
| AUD-001 | Segment Priority | Weighted scoring, composite ranking |
| AUD-002 | LTV Calculation | BG/NBD model, Gamma-Gamma |
| AUD-003 | Propensity Scoring | Basic probability estimation |
| CHA-001 | Channel Optimization | SLSQP constrained optimization |
| SPO-001 | Fee Waterfall | Programmatic decomposition |
| SPO-002 | NBI Calculation | Net bidder impact formulas |
| PRF-001 | Anomaly Detection | Isolation Forest, statistical deviation |
| PRF-002 | Attribution Analysis | Basic MTA methods |

---

## PART 2: RECOMMENDED MODEL ADDITIONS BY AGENT

### 2.1 ANL AGENT - Analytics & Forecasting

#### A. STATISTICAL FOUNDATIONS (7 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Z-Score Analysis** | Standard deviation-based anomaly detection | Azure Function | HIGH |
| **Confidence Interval Calculator** | Multiple methods (Wilson, Agresti-Coull, bootstrap) | Azure Function | HIGH |
| **Power Analysis Engine** | Sample size, MDE, statistical power calculations | Azure Function | HIGH |
| **Variance Decomposition** | ANOVA-style variance attribution | Azure Function | MEDIUM |
| **Correlation Matrix Generator** | Pearson, Spearman, Kendall with significance | AI Builder | MEDIUM |
| **Distribution Fitting** | Fit data to normal, log-normal, Poisson, etc. | Azure Function | MEDIUM |
| **Outlier Detection (Statistical)** | Grubbs, ESD, IQR-based methods | Azure Function | HIGH |

#### B. REGRESSION & ECONOMETRIC MODELS (10 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **OLS Regression** | Standard linear regression with diagnostics | Azure Function | HIGH |
| **Ridge Regression** | L2 regularization for multicollinearity | Azure Function | HIGH |
| **Lasso Regression** | L1 regularization for feature selection | Azure Function | HIGH |
| **Elastic Net** | Combined L1/L2 regularization | Azure Function | MEDIUM |
| **Logistic Regression** | Binary outcome modeling | Azure Function | HIGH |
| **Polynomial Regression** | Non-linear relationship fitting | Azure Function | MEDIUM |
| **Quantile Regression** | Model different quantiles of distribution | Azure Function | MEDIUM |
| **Panel Data Models** | Fixed effects, random effects, Hausman test | Azure Function | LOW |
| **Instrumental Variables (2SLS)** | Address endogeneity | Azure Function | LOW |
| **Error Correction Model** | Time series cointegration | Azure Function | LOW |

#### C. BAYESIAN METHODS (8 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Bayesian A/B Testing** | Posterior probability of superiority, expected loss | Azure Function | HIGH |
| **Bayesian Linear Regression** | Full posterior estimation with credible intervals | Azure Function | HIGH |
| **Thompson Sampling** | Bandit algorithm for exploration/exploitation | Azure Function | HIGH |
| **Bayesian Hierarchical Models** | Partial pooling across markets/brands | Azure Function | MEDIUM |
| **Gaussian Process Regression** | Non-parametric Bayesian regression | Azure Function | LOW |
| **MCMC Sampling (HMC/NUTS)** | Full posterior sampling | Azure Function | MEDIUM |
| **Bayesian Network Inference** | DAG-based causal reasoning | Azure Function | LOW |
| **Bayesian Model Averaging** | Ensemble with model uncertainty | Azure Function | LOW |

#### D. SIMULATION METHODS (6 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Monte Carlo Simulation** | N-iteration outcome distribution (ALREADY PARTIAL) | Azure Function | HIGH |
| **Bootstrapping** | Non-parametric confidence estimation | Azure Function | HIGH |
| **Latin Hypercube Sampling** | Efficient parameter space exploration | Azure Function | MEDIUM |
| **Sensitivity Analysis (Sobol)** | Global sensitivity indices | Azure Function | MEDIUM |
| **Scenario Simulation Engine** | What-if with correlated uncertainties | Azure Function | HIGH |
| **Agent-Based Modeling** | Customer behavior simulation | Azure Function | LOW |

#### E. OPTIMIZATION ALGORITHMS (8 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **SLSQP** | Sequential quadratic programming (ALREADY HAVE) | Azure Function | HIGH |
| **Linear Programming (LP)** | Simplex/interior point methods | Azure Function | HIGH |
| **Mixed Integer Programming (MIP)** | Discrete allocation decisions | Azure Function | MEDIUM |
| **Genetic Algorithm** | Metaheuristic for complex optimization | Azure Function | LOW |
| **Simulated Annealing** | Global optimization with cooling schedule | Azure Function | LOW |
| **Multi-Objective Optimization** | Pareto frontier identification | Azure Function | MEDIUM |
| **Convex Optimization** | Guaranteed global optimum | Azure Function | MEDIUM |
| **Gradient-Free Optimization** | Nelder-Mead, Powell methods | Azure Function | MEDIUM |

#### F. FINANCIAL MODELS (7 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **NPV Calculator** | Net present value with discount rate sensitivity | Azure Function | HIGH |
| **IRR Calculator** | Internal rate of return with multiple solutions | Azure Function | HIGH |
| **Payback Period Analysis** | Simple and discounted payback | Azure Function | HIGH |
| **Break-Even Analysis** | Fixed/variable cost decomposition | Azure Function | HIGH |
| **Marginal Return Calculator** | Last dollar analysis, diminishing returns | Azure Function | HIGH |
| **Portfolio Risk Model** | Mean-variance, Sharpe ratio for channel mix | Azure Function | MEDIUM |
| **ROI Sensitivity Analysis** | Tornado charts, spider diagrams | AI Builder | MEDIUM |

---

### 2.2 AUD AGENT - Audience Intelligence

#### A. CUSTOMER VALUE MODELS (8 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **BG/NBD Model** | Non-contractual LTV (ALREADY HAVE) | Azure Function | HIGH |
| **Pareto/NBD Model** | Alternative non-contractual LTV | Azure Function | HIGH |
| **Gamma-Gamma Model** | Monetary value prediction (ALREADY HAVE) | Azure Function | HIGH |
| **Contractual LTV** | Subscription/recurring revenue models | Azure Function | HIGH |
| **Cohort-Based LTV** | Vintage analysis with decay curves | Azure Function | HIGH |
| **Survival Analysis (Cox PH)** | Hazard modeling for customer lifespan | Azure Function | MEDIUM |
| **Parametric Survival** | Weibull, exponential, log-normal lifespan | Azure Function | MEDIUM |
| **Competing Risks Model** | Multiple churn/value outcomes | Azure Function | LOW |

#### B. SEGMENTATION MODELS (6 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **RFM Scoring** | Recency, Frequency, Monetary quintiles | Azure Function | HIGH |
| **K-Means Clustering** | Unsupervised segment discovery | Azure Function | HIGH |
| **Hierarchical Clustering** | Dendrogram-based segmentation | Azure Function | MEDIUM |
| **DBSCAN** | Density-based clustering for outliers | Azure Function | LOW |
| **Gaussian Mixture Models** | Probabilistic segment assignment | Azure Function | MEDIUM |
| **Self-Organizing Maps (SOM)** | Neural network-based clustering | Azure Function | LOW |

#### C. PROPENSITY MODELS (7 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Logistic Regression (Propensity)** | Baseline propensity scoring | Azure Function | HIGH |
| **XGBoost Classifier** | Gradient boosting for propensity | Azure Function | HIGH |
| **LightGBM Classifier** | Fast gradient boosting | Azure Function | HIGH |
| **Random Forest Classifier** | Ensemble tree-based propensity | Azure Function | MEDIUM |
| **Neural Network Classifier** | Deep learning propensity | Azure Function | LOW |
| **Calibration (Platt/Isotonic)** | Probability calibration for scores | Azure Function | HIGH |
| **Uplift Modeling** | Incremental propensity (persuadables) | Azure Function | MEDIUM |

#### D. CHURN PREDICTION (5 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Logistic Churn Model** | Binary churn prediction | Azure Function | HIGH |
| **Survival Churn Model** | Time-to-churn with censoring | Azure Function | HIGH |
| **Sequence Models (LSTM)** | Behavioral sequence churn | Azure Function | LOW |
| **DeepSurv** | Deep learning survival analysis | Azure Function | LOW |
| **Churn Risk Scoring** | Multi-factor risk indexing | Azure Function | HIGH |

#### E. IDENTITY & MATCHING (4 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Fellegi-Sunter** | Probabilistic record linkage | Azure Function | MEDIUM |
| **Jaro-Winkler Distance** | String similarity matching | Azure Function | HIGH |
| **Graph-Based Entity Resolution** | Network clustering for identity | Azure Function | MEDIUM |
| **Household Inference** | Address clustering, composition | AI Builder | MEDIUM |

---

### 2.3 CHA AGENT - Channel Strategy

#### A. ALLOCATION MODELS (5 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Marginal Equalization** | Equalize marginal ROI across channels | Azure Function | HIGH |
| **Response Curve Fitting** | Hill, adstock, S-curve estimation | Azure Function | HIGH |
| **Saturation Detection** | Identify channel saturation points | Azure Function | HIGH |
| **Diminishing Returns Modeling** | Log/power curve fitting | Azure Function | HIGH |
| **Portfolio Optimization** | Mean-variance for channel risk | Azure Function | MEDIUM |

#### B. MMM COMPONENTS (4 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Adstock Transformation** | Carryover effect modeling | Azure Function | HIGH |
| **Saturation Transformation** | Hill function, S-curve | Azure Function | HIGH |
| **Decomposition Analysis** | Base vs incremental contribution | Azure Function | HIGH |
| **Synergy Detection** | Cross-channel interaction effects | Azure Function | MEDIUM |

---

### 2.4 PRF AGENT - Performance & Measurement

#### A. ATTRIBUTION MODELS (7 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Last-Click Attribution** | Baseline attribution | AI Builder | HIGH |
| **First-Click Attribution** | Awareness credit model | AI Builder | HIGH |
| **Linear Attribution** | Equal credit distribution | AI Builder | HIGH |
| **Time-Decay Attribution** | Recency-weighted credit | Azure Function | HIGH |
| **Position-Based Attribution** | U-shaped (40-20-40) model | Azure Function | HIGH |
| **Shapley Value Attribution** | Game-theoretic fair allocation | Azure Function | HIGH |
| **Markov Chain Attribution** | Transition probability model | Azure Function | MEDIUM |

#### B. INCREMENTALITY TESTING (6 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Geo-Holdout Analysis** | DMA-level lift measurement | Azure Function | HIGH |
| **Synthetic Control** | Construct counterfactual from donors | Azure Function | MEDIUM |
| **Difference-in-Differences (DID)** | Before/after with control | Azure Function | HIGH |
| **Propensity Score Matching** | Match test/control on covariates | Azure Function | HIGH |
| **Regression Discontinuity** | Sharp/fuzzy RD designs | Azure Function | LOW |
| **Interrupted Time Series** | Pre/post intervention analysis | Azure Function | MEDIUM |

#### C. TESTING FRAMEWORKS (8 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **A/B Test Calculator** | Sample size, significance, lift | Azure Function | HIGH |
| **A/A Test Validator** | Platform bias detection | Azure Function | HIGH |
| **MVT Analysis** | Full factorial, fractional factorial | Azure Function | HIGH |
| **Sequential Testing** | Alpha spending, early stopping | Azure Function | HIGH |
| **Multi-Armed Bandit** | Explore/exploit optimization | Azure Function | HIGH |
| **Contextual Bandit** | Feature-based action selection | Azure Function | MEDIUM |
| **Bayesian A/B** | Posterior probability, expected loss | Azure Function | HIGH |
| **Sample Ratio Mismatch (SRM)** | Detect randomization failures | Azure Function | HIGH |

#### D. ANOMALY DETECTION (5 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Isolation Forest** | Tree-based anomaly (ALREADY HAVE) | Azure Function | HIGH |
| **One-Class SVM** | Support vector anomaly detection | Azure Function | MEDIUM |
| **Autoencoder Anomaly** | Reconstruction error detection | Azure Function | LOW |
| **Local Outlier Factor** | Density-based detection | Azure Function | MEDIUM |
| **Prophet Anomaly** | Time series anomaly with seasonality | Azure Function | HIGH |

#### E. FORECASTING MODELS (6 models)

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **ARIMA/SARIMA** | Classical time series | Azure Function | HIGH |
| **Exponential Smoothing (ETS)** | Holt-Winters family | Azure Function | HIGH |
| **Prophet** | Facebook's forecasting library | Azure Function | HIGH |
| **XGBoost Time Series** | Feature-engineered forecasting | Azure Function | MEDIUM |
| **DeepAR** | RNN-based probabilistic forecasting | Azure Function | LOW |
| **Hierarchical Forecasting** | Top-down, bottom-up reconciliation | Azure Function | MEDIUM |

---

## PART 3: CONTACT STREAM OPTIMIZATION (CSO) MODELS

These specialized models optimize multi-touch customer journeys and are absorbed into AUD agent.

| Model | Description | Implementation | Priority |
|-------|-------------|----------------|----------|
| **Next Best Action (NBA)** | Optimal action selection engine | Azure Function | HIGH |
| **Markov Decision Process** | State-based action optimization | Azure Function | MEDIUM |
| **Reinforcement Learning (Q-Learning)** | Learn optimal policies | Azure Function | LOW |
| **Thompson Sampling (NBA)** | Bayesian bandit for action selection | Azure Function | HIGH |
| **Sequence Optimization** | Optimal contact ordering | Azure Function | MEDIUM |
| **Frequency Capping Optimizer** | Fatigue-aware contact limits | Azure Function | HIGH |
| **Channel Preference Scoring** | Per-customer channel affinity | Azure Function | HIGH |
| **Timing Optimization** | Send time optimization | Azure Function | MEDIUM |
| **Recency Decay Model** | Response decay over time | Azure Function | HIGH |
| **Cross-Sell Propensity** | Product recommendation scoring | Azure Function | HIGH |

---

## PART 4: PRIORITIZED IMPLEMENTATION ROADMAP

### Phase 1: Core Statistical Foundation (Week 1-2)
**22 models - Essential calculations**

HIGH PRIORITY additions:
- Z-Score Analysis
- Confidence Interval Calculator
- Power Analysis Engine
- OLS/Ridge/Lasso Regression
- Break-Even Analysis
- NPV/IRR Calculator
- Marginal Return Calculator (enhanced)

### Phase 2: Customer Intelligence (Week 2-3)
**18 models - Audience sophistication**

HIGH PRIORITY additions:
- Pareto/NBD Model
- Survival Analysis (Cox PH)
- XGBoost/LightGBM Classifiers
- Calibration Methods
- RFM Scoring (systematic)
- K-Means Clustering

### Phase 3: Testing & Measurement (Week 3-4)
**20 models - Experimental rigor**

HIGH PRIORITY additions:
- A/B Test Calculator (full)
- MVT Analysis
- Sequential Testing
- Shapley Attribution
- Geo-Holdout Analysis
- DID Estimator
- Prophet Anomaly/Forecasting

### Phase 4: Advanced Optimization (Week 4-5)
**18 models - Sophisticated optimization**

HIGH PRIORITY additions:
- Multi-Armed Bandit
- Linear Programming
- Monte Carlo (enhanced)
- Bayesian A/B Testing
- Response Curve Fitting
- Next Best Action Engine

---

## PART 5: IMPLEMENTATION APPROACH EVALUATION

### 5.1 Current Architecture Constraints

| Environment | Constraints |
|-------------|------------|
| **Personal (Aragorn AI)** | Full Azure access, Python runtime, scipy/numpy/sklearn available |
| **Mastercard** | AI Builder only, no Azure Functions, no HTTP connectors |

### 5.2 Automation Opportunities

#### A. SDK/CLI Automation (RECOMMENDED)

| Tool | Use Case | Automation Level |
|------|----------|------------------|
| **pac CLI** | Dataverse schema, seed data, solutions | HIGH |
| **Azure CLI** | Function App deployment, configuration | HIGH |
| **Azure Functions Core Tools** | Local development, deployment | HIGH |
| **Power Platform CLI** | Flow export/import | MEDIUM |
| **PowerShell** | AI Builder prompt creation | MEDIUM |

#### B. API-Based Automation

| API | Use Case | Automation Level |
|-----|----------|------------------|
| **Dataverse Web API** | Bulk data operations, schema updates | HIGH |
| **Power Automate Management API** | Flow deployment | MEDIUM |
| **Azure Functions API** | Function management | HIGH |
| **SharePoint REST API** | KB file upload | HIGH |

#### C. Infrastructure-as-Code

| Tool | Use Case | Recommendation |
|------|----------|----------------|
| **Bicep/ARM Templates** | Azure infrastructure | RECOMMENDED |
| **Power Platform ALM** | Solution management | RECOMMENDED |
| **GitHub Actions** | CI/CD pipeline | RECOMMENDED |

### 5.3 Recommended Build Approach

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        AUTOMATED DEPLOYMENT PIPELINE                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                             â”‚
â”‚  1. INFRASTRUCTURE (Bicep/ARM)                                              â”‚
â”‚     - Azure Function App                                                    â”‚
â”‚     - Application Insights                                                  â”‚
â”‚     - Key Vault (for secrets)                                              â”‚
â”‚     - Storage Account (for state)                                          â”‚
â”‚                                                                             â”‚
â”‚  2. DATAVERSE DEPLOYMENT (pac CLI)                                         â”‚
â”‚     - Schema import from JSON definitions                                   â”‚
â”‚     - Seed data load from CSV                                              â”‚
â”‚     - Capability registrations                                             â”‚
â”‚                                                                             â”‚
â”‚  3. AZURE FUNCTIONS (func CLI + Azure CLI)                                  â”‚
â”‚     - Package Python functions                                             â”‚
â”‚     - Deploy to Function App                                               â”‚
â”‚     - Configure function keys                                              â”‚
â”‚     - Update capability_implementation table                               â”‚
â”‚                                                                             â”‚
â”‚  4. AI BUILDER PROMPTS (PowerShell + API)                                  â”‚
â”‚     - Create prompts from templates                                        â”‚
â”‚     - Export as solution                                                   â”‚
â”‚     - Import to target environment                                         â”‚
â”‚                                                                             â”‚
â”‚  5. SHAREPOINT KB (PowerShell + REST API)                                  â”‚
â”‚     - Create folder structure                                              â”‚
â”‚     - Upload KB files                                                      â”‚
â”‚     - Set permissions                                                      â”‚
â”‚                                                                             â”‚
â”‚  6. COPILOT AGENTS (Solution Export/Import)                                â”‚
â”‚     - Configure in Personal environment                                    â”‚
â”‚     - Export as managed solution                                           â”‚
â”‚     - Import to Mastercard (with modifications)                            â”‚
â”‚                                                                             â”‚
â”‚  7. VALIDATION (Automated Tests)                                           â”‚
â”‚     - Unit tests for functions                                             â”‚
â”‚     - Integration tests for flows                                          â”‚
â”‚     - End-to-end scenario tests                                            â”‚
â”‚                                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 6: MODEL SELECTION CRITERIA

### 6.1 Selection Matrix

Each model evaluated on:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Business Value** | 30% | Direct impact on planning quality |
| **Implementation Feasibility** | 25% | Can be implemented in both environments |
| **Data Requirements** | 20% | Reasonable input data needs |
| **Computation Time** | 15% | Fits within timeout constraints |
| **Maintenance Burden** | 10% | Ongoing support requirements |

### 6.2 Models NOT Recommended (Too Complex/Low Value)

| Model | Reason for Exclusion |
|-------|---------------------|
| Full Neural Networks | Requires GPU, complex training |
| Agent-Based Modeling | Too complex for current scope |
| VAR/VECM | Requires extensive time series data |
| Graph Neural Networks | Specialized infrastructure needed |
| DeepAR | Requires training infrastructure |
| Full MMM (end-to-end) | Should be external tool integration |

---

## PART 7: APPROVAL REQUEST

### Summary of Additions

| Category | Current | Proposed | Net New |
|----------|---------|----------|---------|
| Azure Functions | 13 | 45 | +32 |
| AI Builder Prompts | 26 | 50 | +24 |
| Total Capabilities | 39 | 95 | +56 |

### HIGH Priority Models (42 total)

**ANL Agent (18):**
- Z-Score, Confidence Intervals, Power Analysis
- OLS/Ridge/Lasso Regression, Logistic Regression
- Bayesian A/B Testing, Thompson Sampling
- Monte Carlo (enhanced), Bootstrapping, Scenario Simulation
- NPV, IRR, Payback, Break-Even, Marginal Return
- LP Optimization

**AUD Agent (12):**
- Pareto/NBD, Contractual LTV, Cohort LTV
- RFM Scoring, K-Means Clustering
- XGBoost/LightGBM Classifiers, Calibration
- Churn Risk Scoring
- Jaro-Winkler Matching

**PRF Agent (12):**
- Full Attribution Suite (Time-Decay, Position, Shapley)
- A/B Test Calculator, MVT Analysis, Sequential Testing
- Bayesian A/B, SRM Detection
- Geo-Holdout, DID Estimator
- Prophet Anomaly/Forecasting
- ARIMA/ETS

### Questions for Approval

1. **Approve HIGH priority models (42)?** â†’ Proceed with implementation
2. **Include MEDIUM priority (additional 25)?** â†’ Extended timeline
3. **Automation approach acceptable?** â†’ SDK/CLI/API-first deployment
4. **Phased rollout OK?** â†’ 5-week implementation plan

---

## APPENDIX A: COMPLETE MODEL CATALOG

[78 models listed with full specifications - available on request]

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Status:** AWAITING APPROVAL
