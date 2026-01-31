# MPA v6.0 UNIFIED BUILD PLAN

## Integrated Implementation: MPA + CA Agent Platform

**Date:** January 18, 2026  
**Version:** 1.0  
**Status:** APPROVED - Ready for Execution  
**Duration:** 6 Weeks

---

## EXECUTIVE SUMMARY

This document provides the complete, unified build plan for the Kessel Digital Agent Platform incorporating:
- **Media Planning Agent (MPA)** - 67 analytical capabilities across 5 specialist agents
- **Consulting Agent (CA)** - 60 frameworks + 35 analytical models for strategic consulting

### Platform Totals

| Component | MPA | CA | Combined |
|-----------|-----|----|---------:|
| Azure Functions | 45 | 35 | **80** |
| AI Builder Prompts | 50 | 24 | **74** |
| Capability Codes | 67 | 35 | **102** |
| Frameworks | 0 | 60 | **60** |
| KB Files | 37 | 14 | **51** |
| Dataverse Registrations | 134 | 70 | **204** |

---

## PART 1: WORKLOAD DISTRIBUTION

### 1.1 VS Code Claude Responsibilities

VS Code Claude handles all **code, automation, and deployment** tasks:

| Category | Tasks | Deliverables |
|----------|-------|--------------|
| **Azure Functions** | Python function development, testing | 80 functions (45 MPA + 35 CA) |
| **AI Builder Prompts** | Prompt creation, deployment | 74 prompts (50 MPA + 24 CA) |
| **Shared Utilities** | Statistical, ML, optimization libraries | 3 utility packages |
| **Dataverse Schema** | Table creation, seed data | 204 capability registrations |
| **Deployment Scripts** | CI/CD automation | pac CLI, Azure CLI scripts |
| **Test Suites** | Unit tests, integration tests | >90% coverage target |

### 1.2 Desktop Claude Responsibilities

Desktop Claude handles all **content, documentation, and KB** tasks:

| Category | Tasks | Deliverables |
|----------|-------|--------------|
| **MPA KB Expansion** | Expand 7 existing KB files | ~50K additional characters |
| **CA KB Creation** | Create 14 new KB files | ~280K characters total |
| **Instruction Files** | Create/update Copilot instructions | 2 files (MPA update, CA new) |
| **6-Rule Compliance** | Validate all KB files | 51 files validated |
| **Documentation** | Architecture docs, guides | Build plans, deployment guides |

---

## PART 2: MPA AGENT SPECIFICATIONS

### 2.1 MPA Azure Functions (45 Total)

#### ANL Agent - Analytics (25 functions)

| ID | Function | Priority | Week |
|----|----------|----------|------|
| ANL-001 | Marginal Return | EXISTING | - |
| ANL-002 | Scenario Compare | EXISTING | - |
| ANL-003 | Projection | EXISTING | - |
| ANL-004 | Bayesian Inference | EXISTING | - |
| ANL-005 | Causal Analysis | EXISTING | - |
| ANL-006 | Z-Score Analysis | HIGH | 1 |
| ANL-007 | Confidence Interval | HIGH | 1 |
| ANL-008 | Power Analysis | HIGH | 1 |
| ANL-009 | OLS Regression | HIGH | 1 |
| ANL-010 | Ridge Regression | HIGH | 1 |
| ANL-011 | Lasso Regression | HIGH | 1 |
| ANL-012 | Logistic Regression | HIGH | 1 |
| ANL-013 | Bayesian A/B Test | HIGH | 2 |
| ANL-014 | Thompson Sampling | HIGH | 2 |
| ANL-015 | Monte Carlo Enhanced | HIGH | 2 |
| ANL-016 | Bootstrap | HIGH | 2 |
| ANL-017 | Scenario Simulation | HIGH | 2 |
| ANL-018 | NPV Calculator | HIGH | 1 |
| ANL-019 | IRR Calculator | HIGH | 1 |
| ANL-020 | Payback Analysis | HIGH | 1 |
| ANL-021 | Break-Even Analysis | HIGH | 1 |
| ANL-022 | LP Optimizer | HIGH | 1 |
| ANL-023 | Sobol Sensitivity | MEDIUM | 2 |
| ANL-024 | Distribution Fitting | MEDIUM | 2 |
| ANL-025 | Variance Decomposition | MEDIUM | 2 |

#### AUD Agent - Audience (15 functions)

| ID | Function | Priority | Week |
|----|----------|----------|------|
| AUD-001 | Segment Priority | EXISTING | - |
| AUD-002 | LTV BG/NBD | EXISTING | - |
| AUD-003 | Propensity Score | EXISTING | - |
| AUD-004 | LTV Pareto/NBD | HIGH | 2 |
| AUD-005 | LTV Contractual | HIGH | 2 |
| AUD-006 | LTV Cohort | HIGH | 2 |
| AUD-007 | Survival Cox | MEDIUM | 2 |
| AUD-008 | RFM Scoring | HIGH | 2 |
| AUD-009 | K-Means Clustering | HIGH | 2 |
| AUD-010 | XGBoost Classifier | HIGH | 2 |
| AUD-011 | LightGBM Classifier | HIGH | 2 |
| AUD-012 | Probability Calibration | HIGH | 2 |
| AUD-013 | Churn Risk Score | HIGH | 2 |
| AUD-014 | Jaro-Winkler Match | HIGH | 2 |
| AUD-015 | Uplift Modeling | MEDIUM | 2 |

#### CHA Agent - Channel (6 functions)

| ID | Function | Priority | Week |
|----|----------|----------|------|
| CHA-001 | Channel Optimize | EXISTING | - |
| CHA-002 | Response Curve Fit | HIGH | 3 |
| CHA-003 | Saturation Detection | HIGH | 3 |
| CHA-004 | Adstock Transform | HIGH | 3 |
| CHA-005 | Synergy Detection | HIGH | 3 |
| CHA-006 | Portfolio Optimization | HIGH | 3 |

#### SPO Agent - Spend Operations (2 functions)

| ID | Function | Priority | Week |
|----|----------|----------|------|
| SPO-001 | Fee Waterfall | EXISTING | - |
| SPO-002 | NBI Calculate | EXISTING | - |

#### PRF Agent - Performance (16 functions)

| ID | Function | Priority | Week |
|----|----------|----------|------|
| PRF-001 | Anomaly Detection | EXISTING | - |
| PRF-002 | Attribution Basic | EXISTING | - |
| PRF-003 | Attribution Time-Decay | HIGH | 3 |
| PRF-004 | Attribution Position | HIGH | 3 |
| PRF-005 | Attribution Shapley | HIGH | 3 |
| PRF-006 | Attribution Markov | HIGH | 3 |
| PRF-007 | A/B Test Calculator | HIGH | 3 |
| PRF-008 | MVT Analysis | HIGH | 3 |
| PRF-009 | Sequential Testing | HIGH | 3 |
| PRF-010 | Bayesian A/B | HIGH | 3 |
| PRF-011 | SRM Detector | HIGH | 3 |
| PRF-012 | Geo Holdout | HIGH | 3 |
| PRF-013 | DID Estimator | HIGH | 3 |
| PRF-014 | Prophet Forecast | HIGH | 4 |
| PRF-015 | ARIMA Forecast | HIGH | 4 |
| PRF-016 | ETS Forecast | HIGH | 4 |

### 2.2 MPA AI Builder Prompts (50 Total)

| Agent | Existing | New | Total |
|-------|----------|-----|-------|
| ANL | 5 | 15 | 20 |
| AUD | 3 | 9 | 12 |
| CHA | 1 | 5 | 6 |
| SPO | 2 | 0 | 2 |
| PRF | 2 | 8 | 10 |
| **Total** | **13** | **37** | **50** |

### 2.3 MPA KB Files (37 Files - 7 Expanded)

| File | Current | Target | Delta |
|------|---------|--------|-------|
| ANL_KB_Analytics_Core_v1.txt | 25K | 30K | +5K |
| ANL_KB_Bayesian_Inference_v1.txt | 18K | 25K | +7K |
| ANL_KB_Budget_Optimization_v1.txt | 22K | 28K | +6K |
| AUD_KB_LTV_Modeling_v1.txt | 20K | 28K | +8K |
| AUD_KB_Propensity_ML_v1.txt | 18K | 25K | +7K |
| PRF_KB_Attribution_Methods_v1.txt | 20K | 28K | +8K |
| PRF_KB_Incrementality_Testing_v1.txt | 20K | 30K | +10K |
| **Total Expansion** | | | **+51K** |

---

## PART 3: CA AGENT SPECIFICATIONS

### 3.1 CA Framework Library (60 Total)

#### Pack 1: Domain-Specific (4)
MarTech Assessment, Media Planning, Loyalty Strategy, Data Strategy

#### Pack 2: Strategic Analysis (7)
SWOT, PESTEL, Scenario Planning, Ansoff Matrix, BCG Matrix, GE-McKinsey Nine-Box, Value Proposition Canvas

#### Pack 3: Competitive Analysis (6)
Porter's Five Forces, Competitor Profiling, Benchmarking, Strategic Group Analysis, Positioning Map, Win-Loss Analysis

#### Pack 4: Operational (8)
Value Chain, Process Mapping, Lean Six Sigma, Capacity Planning, Supply Chain, Cost-Benefit, Root Cause, RACI

#### Pack 5: Customer & Market (7)
Customer Journey, Jobs-to-be-Done, Kano Model, STP, Marketing Mix, Technology Adoption, RACE

#### Pack 6: Business Case & Investment (7) - NEW
TCO Analysis, NPV/IRR Decision Framework, Real Options Analysis, Opportunity Cost Framework, Risk-Adjusted Return Model, EVA, Payback & Break-Even

#### Pack 7: Organizational Change (6) - NEW
McKinsey 7-S, Kotter's 8-Step, ADKAR, Burke-Litwin, Lewin's Change Model, Bridges Transition

#### Pack 8: Strategic Planning & Prioritization (8) - NEW
OKRs, Balanced Scorecard, VRIO, Blue Ocean, Hoshin Kanri, MoSCoW, RICE, Weighted Decision Matrix

#### Pack 9: Problem Solving (7) - NEW
MECE, Issue Trees, Hypothesis-Driven, 5 Whys, Pareto (80/20), Fishbone, Force Field Analysis

### 3.2 CA Azure Functions (35 Total)

#### Financial Analysis Functions (12)

| ID | Function | Capability | Week |
|----|----------|------------|------|
| CA-FIN-001 | NPV Calculator | CA_CALCULATE_NPV | 4 |
| CA-FIN-002 | IRR Calculator | CA_CALCULATE_IRR | 4 |
| CA-FIN-003 | TCO Calculator | CA_CALCULATE_TCO | 4 |
| CA-FIN-004 | ROI Calculator | CA_CALCULATE_ROI | 4 |
| CA-FIN-005 | Payback Calculator | CA_CALCULATE_PAYBACK | 4 |
| CA-FIN-006 | Break-Even Calculator | CA_CALCULATE_BREAKEVEN | 4 |
| CA-FIN-007 | EVA Calculator | CA_CALCULATE_EVA | 4 |
| CA-FIN-008 | Opportunity Cost Analyzer | CA_ANALYZE_OPPORTUNITY_COST | 4 |
| CA-FIN-009 | Sensitivity Analyzer | CA_ANALYZE_SENSITIVITY | 4 |
| CA-FIN-010 | Scenario Modeler | CA_MODEL_SCENARIOS | 4 |
| CA-FIN-011 | Real Options Valuator | CA_VALUE_REAL_OPTIONS | 5 |
| CA-FIN-012 | Risk-Adjusted Return | CA_ADJUST_FOR_RISK | 5 |

#### Prioritization & Sequencing Functions (8)

| ID | Function | Capability | Week |
|----|----------|------------|------|
| CA-PRI-001 | RICE Scorer | CA_SCORE_RICE | 5 |
| CA-PRI-002 | Weighted Matrix Calculator | CA_CALCULATE_WEIGHTED_MATRIX | 5 |
| CA-PRI-003 | MoSCoW Allocator | CA_ALLOCATE_MOSCOW | 5 |
| CA-PRI-004 | Effort-Impact Matrix | CA_SCORE_EFFORT_IMPACT | 5 |
| CA-PRI-005 | Value vs Complexity Scorer | CA_SCORE_VALUE_COMPLEXITY | 5 |
| CA-PRI-006 | Dependency Mapper | CA_MAP_DEPENDENCIES | 5 |
| CA-PRI-007 | Resource Optimizer | CA_OPTIMIZE_RESOURCES | 5 |
| CA-PRI-008 | Portfolio Balancer | CA_BALANCE_PORTFOLIO | 5 |

#### Market & Competitive Functions (7)

| ID | Function | Capability | Week |
|----|----------|------------|------|
| CA-MKT-001 | TAM/SAM/SOM Calculator | CA_SIZE_MARKET | 5 |
| CA-MKT-002 | Market Attractiveness Scorer | CA_SCORE_MARKET_ATTRACTIVENESS | 5 |
| CA-MKT-003 | Competitive Position Analyzer | CA_ANALYZE_COMPETITIVE_POSITION | 5 |
| CA-MKT-004 | Market Share Estimator | CA_ESTIMATE_MARKET_SHARE | 5 |
| CA-MKT-005 | Growth Rate Projector | CA_PROJECT_GROWTH | 5 |
| CA-MKT-006 | Industry Maturity Assessor | CA_ASSESS_INDUSTRY_MATURITY | 5 |
| CA-MKT-007 | Concentration Index (HHI) | CA_CALCULATE_HHI | 5 |

#### Risk & Uncertainty Functions (8)

| ID | Function | Capability | Week |
|----|----------|------------|------|
| CA-RSK-001 | Risk Register Scorer | CA_SCORE_RISK_REGISTER | 6 |
| CA-RSK-002 | Monte Carlo Simulator | CA_RUN_MONTE_CARLO | 6 |
| CA-RSK-003 | Decision Tree Analyzer | CA_ANALYZE_DECISION_TREE | 6 |
| CA-RSK-004 | Sensitivity Tornado | CA_ANALYZE_SENSITIVITY_TORNADO | 6 |
| CA-RSK-005 | Scenario Probability Weighter | CA_WEIGHT_SCENARIO_PROBABILITY | 6 |
| CA-RSK-006 | Risk Mitigation Optimizer | CA_OPTIMIZE_RISK_MITIGATION | 6 |
| CA-RSK-007 | Dependency Risk Scorer | CA_SCORE_DEPENDENCY_RISK | 6 |
| CA-RSK-008 | Timeline Risk Assessor | CA_ASSESS_TIMELINE_RISK | 6 |

### 3.3 CA AI Builder Prompts (24 Total)

| Category | Prompts | Week |
|----------|---------|------|
| Financial Analysis | 10 | 6 |
| Prioritization | 4 | 6 |
| Market Analysis | 4 | 6 |
| Risk Analysis | 4 | 6 |
| Framework Application | 2 | 6 |

### 3.4 CA KB Files (14 New Files)

| File | Size Target | Week |
|------|-------------|------|
| CA_KB_Core_Methodology_v1.txt | 25K | 4 |
| CA_KB_Framework_Library_v1.txt | 30K | 4 |
| CA_KB_Financial_Analysis_v1.txt | 25K | 4 |
| CA_KB_Prioritization_Methods_v1.txt | 20K | 4 |
| CA_KB_Risk_Analysis_v1.txt | 20K | 5 |
| CA_KB_Market_Analysis_v1.txt | 20K | 5 |
| CA_KB_Change_Management_v1.txt | 20K | 5 |
| CA_KB_Business_Case_Development_v1.txt | 25K | 5 |
| CA_KB_Roadmap_Planning_v1.txt | 20K | 5 |
| CA_KB_Industry_Financial_Services_v1.txt | 15K | 6 |
| CA_KB_Industry_Healthcare_v1.txt | 15K | 6 |
| CA_KB_Industry_Retail_v1.txt | 15K | 6 |
| CA_KB_Industry_Technology_v1.txt | 15K | 6 |
| CA_KB_Reference_Data_v1.txt | 20K | 6 |
| **Total** | **~285K** | |

---

## PART 4: 6-WEEK IMPLEMENTATION TIMELINE

### WEEK 1: MPA Foundation (Days 1-5)

#### VS Code Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | Set up function app structure | host.json, shared/, requirements.txt | 4h |
| 1 | Create shared statistical utilities | distributions.py, hypothesis_tests.py | 4h |
| 2 | Implement ANL-006 to ANL-008 | Z-Score, Confidence Interval, Power Analysis | 6h |
| 2 | Unit tests for statistical functions | test_statistics.py | 2h |
| 3 | Implement ANL-009 to ANL-012 | OLS, Ridge, Lasso, Logistic regression | 8h |
| 4 | Implement ANL-018 to ANL-022 | NPV, IRR, Payback, Break-Even, LP | 8h |
| 5 | Unit tests for all Week 1 functions | 20+ test files | 6h |
| 5 | Integration testing | Test harness validation | 2h |

**Week 1 VS Code Deliverables:** 17 new functions, shared utilities, test suite

#### Desktop Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | Begin ANL_KB_Analytics_Core expansion | +5K characters (statistical foundations) | 4h |
| 2 | Complete ANL_KB_Analytics_Core | Regression overview, distribution selection | 4h |
| 3 | AUD_KB_LTV_Modeling expansion | +8K characters (Pareto/NBD, survival) | 6h |
| 4 | AUD_KB_Propensity_ML expansion | +7K characters (XGBoost/LGB, calibration) | 6h |
| 5 | Review and 6-Rule compliance check | All 4 files validated | 4h |

**Week 1 Desktop Deliverables:** 4 KB files expanded (+25K characters)

---

### WEEK 2: MPA Advanced Analytics (Days 6-10)

#### VS Code Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | Implement ANL-013, ANL-014 | Bayesian A/B Test, Thompson Sampling | 6h |
| 1 | Create Bayesian utility module | shared/bayesian_utils.py | 2h |
| 2 | Implement ANL-015 to ANL-017 | Monte Carlo, Bootstrap, Scenario Sim | 8h |
| 3 | Implement AUD-004 to AUD-009 | LTV variants, RFM, K-Means | 8h |
| 4 | Implement AUD-010 to AUD-015 | XGBoost, LightGBM, Calibration, Uplift | 8h |
| 5 | Unit tests for all Week 2 functions | 15+ test files | 6h |
| 5 | ML shared utilities | calibration.py, feature_engineering.py | 2h |

**Week 2 VS Code Deliverables:** 17 new functions, ML utilities, test suite

#### Desktop Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | ANL_KB_Bayesian_Inference expansion | +7K characters (A/B testing, Thompson) | 5h |
| 2 | ANL_KB_Budget_Optimization expansion | +6K characters (NPV/IRR framework) | 5h |
| 3 | PRF_KB_Attribution_Methods expansion | +8K characters (Shapley, Markov) | 6h |
| 4 | PRF_KB_Incrementality_Testing expansion | +10K characters (full testing suite) | 6h |
| 5 | Review and 6-Rule compliance check | All 4 files validated | 4h |

**Week 2 Desktop Deliverables:** 4 KB files expanded (+31K characters)

---

### WEEK 3: MPA Testing & Attribution (Days 11-15)

#### VS Code Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | Implement PRF-003 to PRF-006 | Time-Decay, Position, Shapley, Markov | 8h |
| 2 | Implement PRF-007 to PRF-011 | A/B, MVT, Sequential, Bayesian, SRM | 8h |
| 3 | Implement PRF-012, PRF-013 | Geo Holdout, DID Estimator | 6h |
| 3 | Attribution shared utilities | attribution_utils.py | 2h |
| 4 | Implement CHA-002 to CHA-006 | Response Curve, Saturation, Adstock, etc. | 8h |
| 5 | Unit tests for all Week 3 functions | 16+ test files | 6h |
| 5 | Cross-function integration tests | test_integration.py | 2h |

**Week 3 VS Code Deliverables:** 14 new functions, attribution utilities

#### Desktop Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | EAP shared KB updates | Session management, data provenance | 4h |
| 2 | MPA instruction file updates | Capability references | 4h |
| 3 | 6-Rule compliance validation | All 37 MPA KB files | 6h |
| 4 | Final MPA KB review | Cross-reference validation | 4h |
| 5 | MPA KB upload preparation | SharePoint package | 4h |

**Week 3 Desktop Deliverables:** Updated instruction files, validated KB package

---

### WEEK 4: MPA Completion + CA Foundation (Days 16-20)

#### VS Code Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | Implement PRF-014 to PRF-016 | Prophet, ARIMA, ETS forecasting | 8h |
| 2 | MPA integration testing | End-to-end test suite | 6h |
| 2 | MPA Dataverse registrations | 134 capability records | 2h |
| 3 | CA function app setup | ca-functions-personal/ structure | 4h |
| 3 | CA shared utilities | financial_utils.py, prioritization_utils.py | 4h |
| 4 | Implement CA-FIN-001 to CA-FIN-006 | NPV, IRR, TCO, ROI, Payback, Break-Even | 8h |
| 5 | Implement CA-FIN-007 to CA-FIN-010 | EVA, Opportunity Cost, Sensitivity, Scenario | 8h |

**Week 4 VS Code Deliverables:** 3 MPA functions, 10 CA functions, MPA deployment ready

#### Desktop Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | CA_KB_Core_Methodology_v1.txt | 25K characters | 6h |
| 2 | CA_KB_Framework_Library_v1.txt | 30K characters | 8h |
| 3 | CA_KB_Financial_Analysis_v1.txt | 25K characters | 6h |
| 4 | CA_KB_Prioritization_Methods_v1.txt | 20K characters | 5h |
| 5 | CA instruction file creation | CA_Copilot_Instructions_v1.txt | 4h |

**Week 4 Desktop Deliverables:** 4 CA KB files (100K characters), instruction file

---

### WEEK 5: CA Core Capabilities (Days 21-25)

#### VS Code Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | Implement CA-FIN-011, CA-FIN-012 | Real Options, Risk-Adjusted Return | 6h |
| 1 | Unit tests for CA financial functions | 12 test files | 2h |
| 2 | Implement CA-PRI-001 to CA-PRI-004 | RICE, Weighted Matrix, MoSCoW, Effort-Impact | 8h |
| 3 | Implement CA-PRI-005 to CA-PRI-008 | Value-Complexity, Dependencies, Resources, Portfolio | 8h |
| 4 | Implement CA-MKT-001 to CA-MKT-007 | TAM/SAM/SOM, Market Attractiveness, all market | 8h |
| 5 | Unit tests for CA prioritization + market | 15 test files | 6h |
| 5 | CA integration testing (partial) | test_ca_integration.py | 2h |

**Week 5 VS Code Deliverables:** 17 CA functions, test suite

#### Desktop Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | CA_KB_Risk_Analysis_v1.txt | 20K characters | 5h |
| 2 | CA_KB_Market_Analysis_v1.txt | 20K characters | 5h |
| 3 | CA_KB_Change_Management_v1.txt | 20K characters | 5h |
| 4 | CA_KB_Business_Case_Development_v1.txt | 25K characters | 6h |
| 5 | CA_KB_Roadmap_Planning_v1.txt | 20K characters | 5h |

**Week 5 Desktop Deliverables:** 5 CA KB files (105K characters)

---

### WEEK 6: CA Completion & Platform Integration (Days 26-30)

#### VS Code Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | Implement CA-RSK-001 to CA-RSK-004 | Risk Register, Monte Carlo, Decision Tree, Tornado | 8h |
| 2 | Implement CA-RSK-005 to CA-RSK-008 | Scenario Weight, Mitigation, Dependency, Timeline | 8h |
| 3 | Unit tests for CA risk functions | 8 test files | 4h |
| 3 | CA Dataverse registrations | 70 capability records | 2h |
| 3 | CA AI Builder prompts (12) | Financial + Prioritization prompts | 2h |
| 4 | CA AI Builder prompts (12) | Market + Risk + Framework prompts | 4h |
| 4 | Full platform integration testing | MPA + CA end-to-end | 4h |
| 5 | Production deployment - Personal env | deploy_functions.sh | 4h |
| 5 | Production deployment - Mastercard env | pac CLI solution import | 4h |

**Week 6 VS Code Deliverables:** 8 CA functions, 24 AI Builder prompts, production deployment

#### Desktop Claude Tasks

| Day | Task | Deliverables | Hours |
|-----|------|--------------|-------|
| 1 | CA_KB_Industry_Financial_Services_v1.txt | 15K characters | 4h |
| 1 | CA_KB_Industry_Healthcare_v1.txt | 15K characters | 4h |
| 2 | CA_KB_Industry_Retail_v1.txt | 15K characters | 4h |
| 2 | CA_KB_Industry_Technology_v1.txt | 15K characters | 4h |
| 3 | CA_KB_Reference_Data_v1.txt | 20K characters | 5h |
| 4 | Full 6-Rule compliance check | All 14 CA KB files | 4h |
| 5 | Final documentation review | All build docs | 4h |
| 5 | KB upload to SharePoint | 51 files total | 2h |

**Week 6 Desktop Deliverables:** 5 CA KB files (80K characters), validated package

---

## PART 5: DETAILED INSTRUCTION DOCUMENTS

### 5.1 VS Code Claude Instructions

```
================================================================================
VS CODE CLAUDE - UNIFIED BUILD INSTRUCTIONS
MPA v6.0 + CA Agent Platform Implementation
================================================================================

OVERVIEW
--------
You are responsible for all code, automation, and deployment tasks for the 
Kessel Digital Agent Platform. This includes 80 Azure Functions, 74 AI Builder
prompts, Dataverse schema updates, and deployment automation.

REPOSITORY
----------
Path: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
Branches: deploy/personal (Aragorn AI), deploy/mastercard (Mastercard)

================================================================================
WEEK 1: MPA FOUNDATION (Days 1-5)
================================================================================

DAY 1 TASKS:
1. Set up MPA function app structure:
   - Create mpa-functions-personal/ directory structure
   - Create host.json with proper configuration
   - Create requirements.txt with all dependencies
   - Create shared/ module with __init__.py

2. Create shared statistical utilities:
   - shared/statistics/distributions.py
   - shared/statistics/hypothesis_tests.py
   - shared/statistics/confidence_intervals.py
   - shared/statistics/effect_size.py

DAY 2 TASKS:
1. Implement ANL-006: Z-Score Analysis
   - anl_functions/zscore_analysis/
   - Input: values array, reference population
   - Output: z-scores, percentiles, outlier flags

2. Implement ANL-007: Confidence Interval
   - anl_functions/confidence_interval/
   - Input: sample data, confidence level
   - Output: CI bounds, margin of error

3. Implement ANL-008: Power Analysis
   - anl_functions/power_analysis/
   - Input: effect size, alpha, sample size (any 2)
   - Output: third parameter, sample size recommendations

4. Create unit tests for statistical functions

DAY 3 TASKS:
1. Implement ANL-009: OLS Regression
   - anl_functions/regression_ols/
   - Input: X, y, optional parameters
   - Output: coefficients, RÂ², p-values, diagnostics

2. Implement ANL-010: Ridge Regression
   - anl_functions/regression_ridge/
   - Input: X, y, alpha range
   - Output: coefficients, optimal alpha, CV scores

3. Implement ANL-011: Lasso Regression
   - anl_functions/regression_lasso/
   - Input: X, y, alpha range
   - Output: coefficients, feature selection, optimal alpha

4. Implement ANL-012: Logistic Regression
   - anl_functions/regression_logistic/
   - Input: X, y, regularization
   - Output: coefficients, odds ratios, AUC, confusion matrix

DAY 4 TASKS:
1. Implement ANL-018: NPV Calculator
   - anl_functions/npv_calculator/
   - Input: cash flows, discount rate(s)
   - Output: NPV, sensitivity table

2. Implement ANL-019: IRR Calculator
   - anl_functions/irr_calculator/
   - Input: cash flows
   - Output: IRR, MIRR, payback period

3. Implement ANL-020: Payback Analysis
   - anl_functions/payback_analysis/
   - Input: cash flows, discount rate
   - Output: simple payback, discounted payback

4. Implement ANL-021: Break-Even Analysis
   - anl_functions/breakeven_analysis/
   - Input: fixed costs, variable costs, price
   - Output: break-even units, revenue, margin of safety

5. Implement ANL-022: LP Optimizer
   - anl_functions/lp_optimizer/
   - Input: objective, constraints
   - Output: optimal allocation, shadow prices

DAY 5 TASKS:
1. Create comprehensive unit tests for all Week 1 functions
2. Run test suite and fix any failures
3. Create integration test harness
4. Document function signatures and examples
5. Commit and push to repository

DELIVERABLES: 17 functions, shared utilities, test suite
COMMIT MESSAGE: "feat(mpa): Week 1 - Statistical and financial functions"

================================================================================
WEEK 2: MPA ADVANCED ANALYTICS (Days 6-10)
================================================================================

DAY 1 (Day 6) TASKS:
1. Implement ANL-013: Bayesian A/B Test
   - anl_functions/bayesian_ab_test/
   - Input: control/treatment data
   - Output: posterior distributions, credible intervals, P(B>A)

2. Implement ANL-014: Thompson Sampling
   - anl_functions/thompson_sampling/
   - Input: arm rewards history
   - Output: next arm selection, expected regret

3. Create shared Bayesian utilities:
   - shared/bayesian_utils.py

DAY 2 (Day 7) TASKS:
1. Implement ANL-015: Monte Carlo Enhanced
   - anl_functions/monte_carlo_enhanced/
   - Input: model, parameter distributions, n_simulations
   - Output: outcome distribution, percentiles, confidence

2. Implement ANL-016: Bootstrap
   - anl_functions/bootstrap/
   - Input: data, statistic, n_bootstrap
   - Output: CI, standard error, distribution

3. Implement ANL-017: Scenario Simulation
   - anl_functions/scenario_simulation/
   - Input: scenarios with probabilities
   - Output: expected value, variance, risk metrics

DAY 3 (Day 8) TASKS:
1. Implement AUD-004: LTV Pareto/NBD
   - aud_functions/ltv_pareto_nbd/

2. Implement AUD-005: LTV Contractual
   - aud_functions/ltv_contractual/

3. Implement AUD-006: LTV Cohort
   - aud_functions/ltv_cohort/

4. Implement AUD-007: Survival Cox
   - aud_functions/survival_cox/

5. Implement AUD-008: RFM Scoring
   - aud_functions/rfm_scoring/

6. Implement AUD-009: K-Means Clustering
   - aud_functions/kmeans_clustering/

DAY 4 (Day 9) TASKS:
1. Implement AUD-010: XGBoost Classifier
   - aud_functions/xgboost_classifier/

2. Implement AUD-011: LightGBM Classifier
   - aud_functions/lightgbm_classifier/

3. Implement AUD-012: Probability Calibration
   - aud_functions/probability_calibration/

4. Implement AUD-013: Churn Risk Score
   - aud_functions/churn_risk_scoring/

5. Implement AUD-014: Jaro-Winkler Match
   - aud_functions/jaro_winkler_matching/

6. Implement AUD-015: Uplift Modeling
   - aud_functions/uplift_modeling/

DAY 5 (Day 10) TASKS:
1. Create ML shared utilities:
   - shared/ml/calibration.py
   - shared/ml/feature_engineering.py
   - shared/ml/model_selection.py

2. Create unit tests for all Week 2 functions
3. Integration testing
4. Commit and push

DELIVERABLES: 17 functions, ML utilities, test suite
COMMIT MESSAGE: "feat(mpa): Week 2 - Bayesian, simulation, and audience functions"

================================================================================
WEEK 3: MPA TESTING & ATTRIBUTION (Days 11-15)
================================================================================

DAY 1 (Day 11) TASKS:
1. Implement PRF-003: Attribution Time-Decay
2. Implement PRF-004: Attribution Position
3. Implement PRF-005: Attribution Shapley
4. Implement PRF-006: Attribution Markov
5. Create attribution shared utilities

DAY 2 (Day 12) TASKS:
1. Implement PRF-007: A/B Test Calculator
2. Implement PRF-008: MVT Analysis
3. Implement PRF-009: Sequential Testing
4. Implement PRF-010: Bayesian A/B
5. Implement PRF-011: SRM Detector

DAY 3 (Day 13) TASKS:
1. Implement PRF-012: Geo Holdout
2. Implement PRF-013: DID Estimator
3. Create incrementality shared utilities

DAY 4 (Day 14) TASKS:
1. Implement CHA-002: Response Curve Fit
2. Implement CHA-003: Saturation Detection
3. Implement CHA-004: Adstock Transform
4. Implement CHA-005: Synergy Detection
5. Implement CHA-006: Portfolio Optimization

DAY 5 (Day 15) TASKS:
1. Unit tests for all Week 3 functions
2. Cross-function integration tests
3. Commit and push

DELIVERABLES: 14 functions, attribution/incrementality utilities
COMMIT MESSAGE: "feat(mpa): Week 3 - Attribution, testing, and channel functions"

================================================================================
WEEK 4: MPA COMPLETION + CA FOUNDATION (Days 16-20)
================================================================================

DAY 1 (Day 16) TASKS:
1. Implement PRF-014: Prophet Forecast
2. Implement PRF-015: ARIMA Forecast
3. Implement PRF-016: ETS Forecast

DAY 2 (Day 17) TASKS:
1. MPA full integration testing
2. Run Dataverse registration script for MPA (134 records)
3. Validate all MPA function endpoints

DAY 3 (Day 18) TASKS:
1. Create CA function app structure:
   - ca-functions-personal/ directory
   - host.json, requirements.txt
   - shared/ utilities

2. Create CA shared utilities:
   - shared/financial_utils.py
   - shared/prioritization_utils.py
   - shared/risk_utils.py

DAY 4 (Day 19) TASKS:
1. Implement CA-FIN-001: NPV Calculator
2. Implement CA-FIN-002: IRR Calculator
3. Implement CA-FIN-003: TCO Calculator
4. Implement CA-FIN-004: ROI Calculator
5. Implement CA-FIN-005: Payback Calculator
6. Implement CA-FIN-006: Break-Even Calculator

DAY 5 (Day 20) TASKS:
1. Implement CA-FIN-007: EVA Calculator
2. Implement CA-FIN-008: Opportunity Cost Analyzer
3. Implement CA-FIN-009: Sensitivity Analyzer
4. Implement CA-FIN-010: Scenario Modeler
5. Unit tests for CA financial functions

DELIVERABLES: 3 MPA functions, 10 CA functions, MPA deployment ready
COMMIT MESSAGE: "feat(mpa): Week 4 - Forecasting complete; feat(ca): Week 4 - Financial foundation"

================================================================================
WEEK 5: CA CORE CAPABILITIES (Days 21-25)
================================================================================

DAY 1 (Day 21) TASKS:
1. Implement CA-FIN-011: Real Options Valuator
2. Implement CA-FIN-012: Risk-Adjusted Return
3. Unit tests for CA financial functions (all 12)

DAY 2 (Day 22) TASKS:
1. Implement CA-PRI-001: RICE Scorer
2. Implement CA-PRI-002: Weighted Matrix Calculator
3. Implement CA-PRI-003: MoSCoW Allocator
4. Implement CA-PRI-004: Effort-Impact Matrix

DAY 3 (Day 23) TASKS:
1. Implement CA-PRI-005: Value vs Complexity Scorer
2. Implement CA-PRI-006: Dependency Mapper
3. Implement CA-PRI-007: Resource Optimizer
4. Implement CA-PRI-008: Portfolio Balancer

DAY 4 (Day 24) TASKS:
1. Implement CA-MKT-001: TAM/SAM/SOM Calculator
2. Implement CA-MKT-002: Market Attractiveness Scorer
3. Implement CA-MKT-003: Competitive Position Analyzer
4. Implement CA-MKT-004: Market Share Estimator
5. Implement CA-MKT-005: Growth Rate Projector
6. Implement CA-MKT-006: Industry Maturity Assessor
7. Implement CA-MKT-007: Concentration Index (HHI)

DAY 5 (Day 25) TASKS:
1. Unit tests for prioritization functions (8)
2. Unit tests for market functions (7)
3. CA integration testing (partial)

DELIVERABLES: 17 CA functions, test suites
COMMIT MESSAGE: "feat(ca): Week 5 - Prioritization and market analysis functions"

================================================================================
WEEK 6: CA COMPLETION & PLATFORM INTEGRATION (Days 26-30)
================================================================================

DAY 1 (Day 26) TASKS:
1. Implement CA-RSK-001: Risk Register Scorer
2. Implement CA-RSK-002: Monte Carlo Simulator
3. Implement CA-RSK-003: Decision Tree Analyzer
4. Implement CA-RSK-004: Sensitivity Tornado

DAY 2 (Day 27) TASKS:
1. Implement CA-RSK-005: Scenario Probability Weighter
2. Implement CA-RSK-006: Risk Mitigation Optimizer
3. Implement CA-RSK-007: Dependency Risk Scorer
4. Implement CA-RSK-008: Timeline Risk Assessor

DAY 3 (Day 28) TASKS:
1. Unit tests for risk functions (8)
2. Run CA Dataverse registration script (70 records)
3. Create CA AI Builder prompts (12):
   - CA_NPV_Prompt, CA_IRR_Prompt, CA_TCO_Prompt
   - CA_ROI_Prompt, CA_Breakeven_Prompt, CA_Sensitivity_Prompt
   - CA_Scenario_Prompt, CA_RICE_Prompt, CA_WeightedMatrix_Prompt
   - CA_Dependency_Prompt, CA_TAM_Prompt, CA_Competitive_Prompt

DAY 4 (Day 29) TASKS:
1. Create remaining CA AI Builder prompts (12):
   - CA_RiskRegister_Prompt, CA_MonteCarlo_Prompt
   - CA_DecisionTree_Prompt, CA_FrameworkSelect_Prompt
   - CA_FrameworkApply_Prompt, CA_SWOT_Prompt
   - CA_Porter_Prompt, CA_BCG_Prompt
   - CA_McKinsey7S_Prompt, CA_ValueChain_Prompt
   - CA_PESTEL_Prompt, CA_BusinessCase_Prompt

2. Full platform integration testing (MPA + CA)

DAY 5 (Day 30) TASKS:
1. Production deployment to Personal environment:
   - Deploy MPA functions to Azure
   - Deploy CA functions to Azure
   - Validate all endpoints

2. Production deployment to Mastercard environment:
   - Export solution using pac CLI
   - Import to Mastercard environment
   - Validate AI Builder prompts

DELIVERABLES: 8 CA functions, 24 AI Builder prompts, production deployment
COMMIT MESSAGE: "feat(ca): Week 6 - Risk functions and prompts; deploy: Production release"

================================================================================
VALIDATION CHECKLIST
================================================================================

Before each commit, verify:
[ ] All new functions have unit tests
[ ] Test coverage >90%
[ ] No linting errors
[ ] Function signature documented
[ ] Error handling implemented
[ ] Telemetry logging added
[ ] Response schema validated

Before deployment, verify:
[ ] All tests pass
[ ] Integration tests pass
[ ] Dataverse registrations complete
[ ] AI Builder prompts validated
[ ] Environment variables configured

================================================================================
GIT WORKFLOW
================================================================================

1. Work on feature branch from deploy/personal
2. Commit frequently with descriptive messages
3. Push at end of each day
4. Create PR when week complete
5. Merge to deploy/personal after review
6. Cherry-pick to deploy/mastercard as needed

================================================================================
```

### 5.2 Desktop Claude Instructions

```
================================================================================
DESKTOP CLAUDE - UNIFIED BUILD INSTRUCTIONS
MPA v6.0 + CA Agent Platform Knowledge Base Development
================================================================================

OVERVIEW
--------
You are responsible for all content, documentation, and knowledge base tasks
for the Kessel Digital Agent Platform. This includes expanding 7 MPA KB files,
creating 14 new CA KB files, instruction files, and 6-Rule compliance validation.

CRITICAL REQUIREMENTS
--------------------
1. 6-RULE COMPLIANCE (ALL KB FILES):
   - ALL-CAPS headers only
   - Hyphens-only for lists (no bullets, numbers)
   - ASCII characters only (no emoji, special chars)
   - Zero visual dependencies (no tables, formatting)
   - Mandatory professional tone
   - Plain text only (.txt format)

2. CHARACTER LIMITS:
   - Copilot Instructions: 7,500-7,999 characters exactly
   - KB files: Under 36,000 characters (prefer 20-30K)
   - Never truncate or abbreviate content

3. DOCUMENT DELIVERY:
   - Provide download link after each completed file
   - Store in /mnt/user-data/outputs/
   - Include character count verification

================================================================================
WEEK 1: MPA KB EXPANSION - ANALYTICS & AUDIENCE (Days 1-5)
================================================================================

DAY 1 TASKS:
File: ANL_KB_Analytics_Core_v1.txt
Current: 25K â†’ Target: 30K (+5K)

Add sections:
- STATISTICAL FOUNDATIONS
  - Z-score interpretation and applications
  - Confidence interval methodology
  - Power analysis for sample sizing
  - Distribution selection guide

- REGRESSION OVERVIEW
  - When to use OLS vs Ridge vs Lasso
  - Logistic regression for classification
  - Model diagnostics and validation

DAY 2 TASKS:
Complete ANL_KB_Analytics_Core_v1.txt
- Distribution fitting methodology
- Variance decomposition explained
- Cross-reference to Azure Functions

DAY 3 TASKS:
File: AUD_KB_LTV_Modeling_v1.txt
Current: 20K â†’ Target: 28K (+8K)

Add sections:
- PARETO/NBD MODEL DETAILS
  - When to use vs BG/NBD
  - Parameter interpretation
  - Prediction methodology

- CONTRACTUAL VS NON-CONTRACTUAL
  - Model selection criteria
  - Subscription vs transaction businesses

- COX PROPORTIONAL HAZARDS
  - Survival analysis for churn
  - Hazard ratio interpretation

DAY 4 TASKS:
File: AUD_KB_Propensity_ML_v1.txt
Current: 18K â†’ Target: 25K (+7K)

Add sections:
- XGBOOST/LIGHTGBM CONFIGURATION
  - Hyperparameter tuning guide
  - Feature importance interpretation
  - Handling imbalanced classes

- PROBABILITY CALIBRATION
  - Platt scaling methodology
  - Isotonic regression
  - When calibration matters

- UPLIFT MODELING FRAMEWORK
  - Treatment effect estimation
  - Targeting optimization

DAY 5 TASKS:
1. Review all 4 expanded files
2. 6-Rule compliance validation
3. Character count verification
4. Create download links
5. Document any cross-reference updates needed

DELIVERABLES: 4 KB files expanded (+25K characters total)

================================================================================
WEEK 2: MPA KB EXPANSION - BAYESIAN & PERFORMANCE (Days 6-10)
================================================================================

DAY 1 (Day 6) TASKS:
File: ANL_KB_Bayesian_Inference_v1.txt
Current: 18K â†’ Target: 25K (+7K)

Add sections:
- BAYESIAN A/B TESTING
  - Prior selection methodology
  - Posterior interpretation
  - Credible intervals vs confidence intervals
  - Stopping rules

- THOMPSON SAMPLING
  - Multi-armed bandit application
  - Exploration vs exploitation
  - Implementation considerations

- MCMC INTERPRETATION
  - Convergence diagnostics
  - Chain mixing assessment

DAY 2 (Day 7) TASKS:
File: ANL_KB_Budget_Optimization_v1.txt
Current: 22K â†’ Target: 28K (+6K)

Add sections:
- NPV/IRR FRAMEWORK
  - Discount rate selection
  - Sensitivity analysis methodology
  - Multiple IRR handling

- BREAK-EVEN METHODS
  - Unit vs revenue break-even
  - Margin of safety calculation

- LP ALLOCATION
  - Constraint formulation
  - Shadow price interpretation

DAY 3 (Day 8) TASKS:
File: PRF_KB_Attribution_Methods_v1.txt
Current: 20K â†’ Target: 28K (+8K)

Add sections:
- SHAPLEY VALUE ATTRIBUTION
  - Game theory foundation
  - Computational considerations
  - Interpretation guide

- MARKOV CHAIN ATTRIBUTION
  - Transition probability matrix
  - Removal effect calculation
  - Path analysis

- MODEL SELECTION GUIDE
  - When to use each attribution model
  - Data requirements comparison

DAY 4 (Day 9) TASKS:
File: PRF_KB_Incrementality_Testing_v1.txt
Current: 20K â†’ Target: 30K (+10K)

Add sections:
- A/B TEST CALCULATOR METHODOLOGY
  - Sample size determination
  - Statistical significance
  - Practical significance

- MVT DESIGN AND ANALYSIS
  - Factorial design
  - Interaction effects
  - Result interpretation

- SEQUENTIAL TESTING FRAMEWORK
  - Alpha spending functions
  - Early stopping rules
  - Type I error control

- BAYESIAN A/B TESTING
  - Prior specification
  - Posterior updating
  - Decision rules

- SRM DETECTION
  - Sample ratio mismatch identification
  - Root cause investigation

DAY 5 (Day 10) TASKS:
1. Review all 4 expanded files
2. 6-Rule compliance validation
3. Character count verification
4. Create download links

DELIVERABLES: 4 KB files expanded (+31K characters total)

================================================================================
WEEK 3: MPA FINALIZATION (Days 11-15)
================================================================================

DAY 1 (Day 11) TASKS:
EAP shared KB updates:
- Review EAP_Session_Management_v1.txt
- Review EAP_Data_Provenance_v1.txt
- Ensure cross-references to new capabilities

DAY 2 (Day 12) TASKS:
MPA instruction file review:
- Verify MPA_Copilot_Instructions references new capabilities
- Update capability registry references
- Character count validation (7,500-7,999)

DAY 3 (Day 13) TASKS:
6-Rule compliance validation for all 37 MPA KB files:
- Run compliance checker
- Fix any violations
- Document compliance status

DAY 4 (Day 14) TASKS:
Final MPA KB review:
- Cross-reference accuracy
- Formula documentation complete
- No broken references

DAY 5 (Day 15) TASKS:
MPA KB upload preparation:
- Package all 37 files
- Verify file naming conventions
- Prepare SharePoint upload manifest

DELIVERABLES: Updated instruction file, validated KB package

================================================================================
WEEK 4: CA KB FOUNDATION (Days 16-20)
================================================================================

DAY 1 (Day 16) TASKS:
File: CA_KB_Core_Methodology_v1.txt
Target: 25K characters

Sections:
- CA AGENT IDENTITY AND PURPOSE
- DISCOVERY METHODOLOGY
  - Situation understanding
  - Stakeholder mapping
  - Constraint identification
- ANALYSIS APPROACH
  - Framework selection
  - Data gathering
  - Synthesis methodology
- RECOMMENDATION STANDARDS
  - Actionability requirements
  - Owner/timeline/impact format
- CONFIDENCE LEVELS
  - High/Medium/Low definitions
  - Source quality tiers

DAY 2 (Day 17) TASKS:
File: CA_KB_Framework_Library_v1.txt
Target: 30K characters

Sections:
- FRAMEWORK OVERVIEW (60 frameworks)
- PACK 1: DOMAIN-SPECIFIC (4)
- PACK 2: STRATEGIC ANALYSIS (7)
- PACK 3: COMPETITIVE ANALYSIS (6)
- PACK 4: OPERATIONAL (8)
- PACK 5: CUSTOMER AND MARKET (7)
- PACK 6: BUSINESS CASE AND INVESTMENT (7)
- PACK 7: ORGANIZATIONAL CHANGE (6)
- PACK 8: STRATEGIC PLANNING AND PRIORITIZATION (8)
- PACK 9: PROBLEM SOLVING (7)
- FRAMEWORK SELECTION GUIDE
- FRAMEWORK COMBINATION PATTERNS

DAY 3 (Day 18) TASKS:
File: CA_KB_Financial_Analysis_v1.txt
Target: 25K characters

Sections:
- NPV METHODOLOGY
  - Discount rate selection
  - Cash flow projection
  - Sensitivity analysis
- IRR INTERPRETATION
  - Multiple IRR handling
  - MIRR methodology
- TCO FRAMEWORK
  - Cost categories
  - Lifecycle phases
  - Hidden cost identification
- ROI CALCULATION
  - Benefit quantification
  - Attribution approaches
- BREAK-EVEN ANALYSIS
  - Unit economics
  - Margin of safety
- OPPORTUNITY COST FRAMEWORK
  - Alternative identification
  - Trade-off quantification

DAY 4 (Day 19) TASKS:
File: CA_KB_Prioritization_Methods_v1.txt
Target: 20K characters

Sections:
- RICE SCORING
  - Reach estimation
  - Impact scoring
  - Confidence levels
  - Effort estimation
- WEIGHTED DECISION MATRIX
  - Criteria selection
  - Weight assignment
  - Sensitivity testing
- MOSCOW METHODOLOGY
  - Must/Should/Could/Wont
  - Stakeholder alignment
- EFFORT-IMPACT MATRIX
  - Quick wins identification
  - Strategic investments
- DEPENDENCY MAPPING
  - Critical path identification
  - Risk sequencing

DAY 5 (Day 20) TASKS:
File: CA_Copilot_Instructions_v1.txt
Target: 7,500-7,999 characters

Create CA instruction file following MPA template:
- Identity and purpose
- Core capabilities
- Framework library overview
- Interaction approach
- Knowledge base usage
- Quality standards

DELIVERABLES: 4 CA KB files (100K characters), CA instruction file

================================================================================
WEEK 5: CA KB CORE (Days 21-25)
================================================================================

DAY 1 (Day 21) TASKS:
File: CA_KB_Risk_Analysis_v1.txt
Target: 20K characters

Sections:
- RISK IDENTIFICATION
  - Category taxonomy
  - Discovery methods
- PROBABILITY AND IMPACT SCORING
  - Scale definitions
  - Calibration techniques
- MONTE CARLO METHODOLOGY
  - Distribution selection
  - Simulation interpretation
- DECISION TREE ANALYSIS
  - Expected value calculation
  - Option valuation
- RISK MITIGATION PLANNING
  - Response strategies
  - Cost-effectiveness

DAY 2 (Day 22) TASKS:
File: CA_KB_Market_Analysis_v1.txt
Target: 20K characters

Sections:
- TAM/SAM/SOM METHODOLOGY
  - Top-down vs bottom-up
  - Growth projection
- MARKET ATTRACTIVENESS
  - Factor selection
  - Scoring methodology
- COMPETITIVE POSITION ANALYSIS
  - Relative strength assessment
  - Gap identification
- MARKET SHARE ESTIMATION
  - Data source hierarchy
  - Triangulation methods
- INDUSTRY LIFECYCLE
  - Stage identification
  - Strategic implications

DAY 3 (Day 23) TASKS:
File: CA_KB_Change_Management_v1.txt
Target: 20K characters

Sections:
- MCKINSKEY 7-S APPLICATION
  - Element assessment
  - Alignment analysis
  - Gap prioritization
- KOTTERS 8 STEPS
  - Urgency creation
  - Coalition building
  - Vision communication
- ADKAR MODEL
  - Individual change stages
  - Barrier identification
- READINESS ASSESSMENT
  - Capability evaluation
  - Willingness factors
- COMMUNICATION PLANNING
  - Stakeholder mapping
  - Message sequencing

DAY 4 (Day 24) TASKS:
File: CA_KB_Business_Case_Development_v1.txt
Target: 25K characters

Sections:
- BUSINESS CASE STRUCTURE
  - Executive summary
  - Problem statement
  - Solution options
  - Financial analysis
  - Risk assessment
  - Recommendation
- BENEFIT QUANTIFICATION
  - Revenue impact
  - Cost reduction
  - Risk mitigation value
- COST ESTIMATION
  - Direct costs
  - Indirect costs
  - Opportunity costs
- APPROVAL PROCESS
  - Stakeholder requirements
  - Decision criteria

DAY 5 (Day 25) TASKS:
File: CA_KB_Roadmap_Planning_v1.txt
Target: 20K characters

Sections:
- INITIATIVE SEQUENCING
  - Dependency analysis
  - Resource constraints
  - Risk considerations
- WAVE PLANNING
  - Quick wins first
  - Foundation building
  - Capability layering
- RESOURCE ALLOCATION
  - Capacity planning
  - Skill requirements
- MILESTONE DEFINITION
  - Measurable outcomes
  - Decision points
- GOVERNANCE STRUCTURE
  - Roles and responsibilities
  - Review cadence

DELIVERABLES: 5 CA KB files (105K characters)

================================================================================
WEEK 6: CA KB COMPLETION (Days 26-30)
================================================================================

DAY 1 (Day 26) TASKS:
File: CA_KB_Industry_Financial_Services_v1.txt
Target: 15K characters

Sections:
- INDUSTRY CHARACTERISTICS
- KEY CHALLENGES
- FRAMEWORK ADAPTATIONS
- REGULATORY CONSIDERATIONS
- BENCHMARK DATA

File: CA_KB_Industry_Healthcare_v1.txt
Target: 15K characters

Same structure adapted for healthcare vertical

DAY 2 (Day 27) TASKS:
File: CA_KB_Industry_Retail_v1.txt
Target: 15K characters

Same structure adapted for retail vertical

File: CA_KB_Industry_Technology_v1.txt
Target: 15K characters

Same structure adapted for technology vertical

DAY 3 (Day 28) TASKS:
File: CA_KB_Reference_Data_v1.txt
Target: 20K characters

Sections:
- BENCHMARK DATA SOURCES
- INDUSTRY STATISTICS
- CALCULATION REFERENCES
- EXTERNAL RESOURCES

DAY 4 (Day 29) TASKS:
6-Rule compliance validation for all 14 CA KB files:
- Run compliance checker
- Fix any violations
- Document compliance status

DAY 5 (Day 30) TASKS:
1. Final documentation review
2. KB upload to SharePoint (51 files total)
3. Create final deliverables summary
4. Archive completed work

DELIVERABLES: 5 CA KB files (80K characters), validated KB package

================================================================================
FILE NAMING CONVENTIONS
================================================================================

MPA KB Files: [AGENT]_KB_[Topic]_v1.txt
Examples:
- ANL_KB_Analytics_Core_v1.txt
- AUD_KB_LTV_Modeling_v1.txt
- PRF_KB_Attribution_Methods_v1.txt

CA KB Files: CA_KB_[Topic]_v1.txt
Examples:
- CA_KB_Core_Methodology_v1.txt
- CA_KB_Framework_Library_v1.txt
- CA_KB_Financial_Analysis_v1.txt

Instruction Files: [AGENT]_Copilot_Instructions_v[X].txt
Examples:
- MPA_Copilot_Instructions_v6.txt
- CA_Copilot_Instructions_v1.txt

================================================================================
QUALITY CHECKLIST
================================================================================

Before completing each file:
[ ] ALL-CAPS headers only
[ ] Hyphens-only for lists
[ ] ASCII characters only
[ ] No tables or formatting
[ ] Character count within target
[ ] All sections complete
[ ] Cross-references accurate
[ ] Download link provided

Before final delivery:
[ ] All 51 KB files validated
[ ] Both instruction files complete
[ ] SharePoint package ready
[ ] Documentation complete

================================================================================
```

---

## PART 6: GANTT SUMMARY

```
WEEK 1  |â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ| MPA Foundation
        VS Code: Statistical + Financial Functions (17)
        Desktop: ANL + AUD KB Expansion (4 files, +25K)

WEEK 2  |â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ| MPA Advanced Analytics
        VS Code: Bayesian + Simulation + AUD Functions (17)
        Desktop: Bayesian + PRF KB Expansion (4 files, +31K)

WEEK 3  |â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ| MPA Testing & Attribution
        VS Code: Attribution + Testing + CHA Functions (14)
        Desktop: EAP Updates + MPA Finalization

WEEK 4  |â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ| MPA Complete + CA Foundation
        VS Code: Forecasting (3) + CA Financial (10)
        Desktop: CA Core KB Files (4 files, 100K)

WEEK 5  |â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ| CA Core Capabilities
        VS Code: CA Prioritization + Market Functions (17)
        Desktop: CA Business/Risk/Change KB (5 files, 105K)

WEEK 6  |â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ| CA Complete + Deploy
        VS Code: CA Risk Functions (8) + AI Builder + Deploy
        Desktop: CA Industry KB (5 files, 80K) + Final Validation
```

---

## PART 7: CRITICAL PATH & DEPENDENCIES

### 7.1 Dependency Chain

```
MPA Functions â†’ MPA AI Builder â†’ MPA Dataverse â†’ MPA Deploy
     â†“
MPA KB Files â†’ MPA Instructions â†’ MPA Validation â†’ MPA Upload
     â†“
CA Functions â†’ CA AI Builder â†’ CA Dataverse â†’ CA Deploy
     â†“
CA KB Files â†’ CA Instructions â†’ CA Validation â†’ CA Upload
     â†“
PLATFORM INTEGRATION TEST â†’ PRODUCTION RELEASE
```

### 7.2 Critical Milestones

| Date | Milestone | Owner |
|------|-----------|-------|
| End Week 2 | MPA Functions Complete (45) | VS Code |
| End Week 2 | MPA KB Expansion Complete | Desktop |
| End Week 3 | MPA Validated & Upload Ready | Both |
| End Week 4 | MPA Deployed, CA Foundation Ready | Both |
| End Week 5 | CA Functions Complete (35) | VS Code |
| End Week 5 | CA KB Complete (14 files) | Desktop |
| End Week 6 | Full Platform Production Release | Both |

---

## PART 8: DELIVERABLES SUMMARY

### VS Code Claude Deliverables

| Week | Functions | Prompts | Other |
|------|-----------|---------|-------|
| 1 | 17 MPA | 0 | Shared utilities |
| 2 | 17 MPA | 0 | ML utilities |
| 3 | 14 MPA | 0 | Attribution utils |
| 4 | 3 MPA + 10 CA | 0 | MPA deploy |
| 5 | 17 CA | 0 | Test suites |
| 6 | 8 CA | 74 (50+24) | Full deploy |
| **Total** | **80** | **74** | |

### Desktop Claude Deliverables

| Week | KB Files | Characters | Other |
|------|----------|------------|-------|
| 1 | 4 MPA expanded | +25K | |
| 2 | 4 MPA expanded | +31K | |
| 3 | 0 | 0 | Validation, instructions |
| 4 | 4 CA new | 100K | CA instructions |
| 5 | 5 CA new | 105K | |
| 6 | 5 CA new | 80K | Final validation |
| **Total** | **51 files** | **~341K** | |

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Status:** APPROVED - Ready for Execution
