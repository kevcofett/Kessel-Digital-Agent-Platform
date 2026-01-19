# VS Code: Advanced ML Features Deployment

## Context
Advanced ML KB extensions have been created for ANL, AUD, and PRF agents. Deploy these KB files to both Personal (Aragorn AI) and Mastercard environments.

## Repository
- Path: `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`
- Branch: `main`
- Commit: `22301180` - feat(ml): Add Advanced ML Features

---

## ML KB Files Summary

### ANL Agent ML Extensions (2 files, 16,589 chars)

| File | Size | Content |
|------|------|---------|
| ANL_KB_ML_Budget_Optimization_v1.txt | 7,834 | Response curves, optimization algorithms, Bayesian methods |
| ANL_KB_ML_Forecasting_v1.txt | 8,755 | Time series, ARIMA, LSTM, Prophet, ensemble methods |

### AUD Agent ML Extensions (2 files, 18,152 chars)

| File | Size | Content |
|------|------|---------|
| AUD_KB_ML_Propensity_Scoring_v1.txt | 9,123 | Classification models, feature engineering, calibration |
| AUD_KB_ML_Lookalike_Modeling_v1.txt | 9,029 | Similarity methods, embeddings, expansion strategies |

### PRF Agent ML Extensions (2 files, 17,852 chars)

| File | Size | Content |
|------|------|---------|
| PRF_KB_ML_Anomaly_Detection_v1.txt | 9,045 | Statistical methods, isolation forest, autoencoders |
| PRF_KB_ML_Performance_Optimization_v1.txt | 8,807 | Bid optimization, creative selection, RL |

**Total: 6 files, 52,593 characters**

---

## PHASE 1: SharePoint KB Upload

### 1.1 Personal Environment (Aragorn AI)

Upload these 6 ML KB files to Aragorn AI SharePoint:

**ANL ML Files:**
```
base/agents/anl/kb/ANL_KB_ML_Budget_Optimization_v1.txt
base/agents/anl/kb/ANL_KB_ML_Forecasting_v1.txt
```

**AUD ML Files:**
```
base/agents/aud/kb/AUD_KB_ML_Propensity_Scoring_v1.txt
base/agents/aud/kb/AUD_KB_ML_Lookalike_Modeling_v1.txt
```

**PRF ML Files:**
```
base/agents/prf/kb/PRF_KB_ML_Anomaly_Detection_v1.txt
base/agents/prf/kb/PRF_KB_ML_Performance_Optimization_v1.txt
```

### 1.2 Mastercard Environment

Upload same 6 files to Mastercard SharePoint.

---

## PHASE 2: Update Existing Agents in Copilot Studio

### 2.1 Update ANL Agent

**Personal Environment:**
1. Open ANL agent in Copilot Studio
2. Add Knowledge Sources:
   - `ANL_KB_ML_Budget_Optimization_v1.txt`
   - `ANL_KB_ML_Forecasting_v1.txt`
3. Save and Publish

**Mastercard Environment:**
Repeat same steps.

### 2.2 Update AUD Agent

**Personal Environment:**
1. Open AUD agent in Copilot Studio
2. Add Knowledge Sources:
   - `AUD_KB_ML_Propensity_Scoring_v1.txt`
   - `AUD_KB_ML_Lookalike_Modeling_v1.txt`
3. Save and Publish

**Mastercard Environment:**
Repeat same steps.

### 2.3 Update PRF Agent

**Personal Environment:**
1. Open PRF agent in Copilot Studio
2. Add Knowledge Sources:
   - `PRF_KB_ML_Anomaly_Detection_v1.txt`
   - `PRF_KB_ML_Performance_Optimization_v1.txt`
3. Save and Publish

**Mastercard Environment:**
Repeat same steps.

---

## PHASE 3: Dataverse Updates

### 3.1 Register ML Capabilities

Add to `eap_capability` table:

**ANL ML Capabilities:**

| capability_code | capability_name | agent_code |
|-----------------|-----------------|------------|
| ANL_ML_BUDGET_OPT | ML Budget Optimization | ANL |
| ANL_ML_FORECAST | ML Forecasting | ANL |

**AUD ML Capabilities:**

| capability_code | capability_name | agent_code |
|-----------------|-----------------|------------|
| AUD_ML_PROPENSITY | ML Propensity Scoring | AUD |
| AUD_ML_LOOKALIKE | ML Lookalike Modeling | AUD |

**PRF ML Capabilities:**

| capability_code | capability_name | agent_code |
|-----------------|-----------------|------------|
| PRF_ML_ANOMALY | ML Anomaly Detection | PRF |
| PRF_ML_PERF_OPT | ML Performance Optimization | PRF |

---

## PHASE 4: Smoke Tests

### 4.1 ANL ML Tests

**Budget Optimization:**
```
Input: "How can I use machine learning to optimize my budget allocation?"
Expected: References response curves, optimization algorithms, ML methods
```

**Forecasting:**
```
Input: "What ML techniques should I use for campaign forecasting?"
Expected: Covers time series methods, ARIMA, LSTM, Prophet
```

### 4.2 AUD ML Tests

**Propensity Scoring:**
```
Input: "Build a propensity model to predict purchase likelihood"
Expected: Discusses classification models, feature engineering, calibration
```

**Lookalike Modeling:**
```
Input: "How do I create a lookalike audience from my best customers?"
Expected: Covers similarity methods, seed preparation, expansion strategies
```

### 4.3 PRF ML Tests

**Anomaly Detection:**
```
Input: "Set up automated anomaly detection for campaign performance"
Expected: References statistical methods, isolation forest, alerting frameworks
```

**Performance Optimization:**
```
Input: "How can I use ML for bid optimization?"
Expected: Covers value-based bidding, reinforcement learning, multi-armed bandits
```

---

## Validation Checklist

### Personal Environment
- [ ] 2 ANL ML KB files uploaded to SharePoint
- [ ] 2 AUD ML KB files uploaded to SharePoint
- [ ] 2 PRF ML KB files uploaded to SharePoint
- [ ] ANL agent updated with ML KB files
- [ ] AUD agent updated with ML KB files
- [ ] PRF agent updated with ML KB files
- [ ] All agents republished
- [ ] 6 ML capabilities registered in Dataverse
- [ ] All smoke tests pass

### Mastercard Environment
- [ ] 2 ANL ML KB files uploaded to SharePoint
- [ ] 2 AUD ML KB files uploaded to SharePoint
- [ ] 2 PRF ML KB files uploaded to SharePoint
- [ ] ANL agent updated with ML KB files
- [ ] AUD agent updated with ML KB files
- [ ] PRF agent updated with ML KB files
- [ ] All agents republished
- [ ] 6 ML capabilities registered in Dataverse
- [ ] All smoke tests pass

---

## ML Capabilities Added

| Agent | Capability | Description |
|-------|------------|-------------|
| ANL | ML Budget Optimization | Response curves, Bayesian optimization, evolutionary algorithms |
| ANL | ML Forecasting | Time series, neural networks, ensemble methods |
| AUD | ML Propensity Scoring | Classification models, calibration, real-time scoring |
| AUD | ML Lookalike Modeling | Similarity methods, embeddings, audience expansion |
| PRF | ML Anomaly Detection | Statistical methods, isolation forest, autoencoders |
| PRF | ML Performance Optimization | Bid optimization, creative selection, RL |

---

## Rollback Plan

If issues occur:
1. Remove ML KB files from SharePoint
2. Remove ML KB sources from agent configurations
3. Republish agents without ML KB
4. Delete ML capability records from Dataverse
