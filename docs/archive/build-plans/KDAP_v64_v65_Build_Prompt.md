# KDAP v6.4-6.5 BUILD PROMPT: Advanced Analytics & ML Models

**Date:** January 20, 2026  
**Scope:** Recommendations 4-9 from MPA Enhancement Roadmap  
**Owner:** Claude Desktop  
**Deliverables:** KB Files, AI Builder Prompts, Azure Function Specs, Capability Registrations

---

## CONTEXT

You are continuing development of the Kessel Digital Agent Platform (KDAP), a 10-agent enterprise AI system built on Microsoft Power Platform. The platform is at v6.2 with v6.1 enhancements (Memory, Proactive Intelligence, Multi-Modal, Consensus Protocol) currently being deployed by VS Code.

**Repository:** `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`  
**Branch:** `deploy/mastercard`  
**Architecture Docs:** See `/mnt/project/` for all planning documents

---

## YOUR TASK

Create all artifacts for 6 capability expansions across 3 agents (PRF, AUD, CHA). Each expansion requires:
1. KB file(s) - 6-Rule compliant, 15,000-25,000 characters
2. AI Builder prompt JSON definitions
3. Azure Function specifications (for Personal environment)
4. Capability registrations for eap_capability table
5. Test scenarios

---

## CAPABILITY EXPANSIONS TO BUILD

### EXPANSION 4: Advanced Attribution Models (PRF Agent)

**New Capabilities:**
| Capability Code | Name | Implementation |
|-----------------|------|----------------|
| PRF_ATTRIB_SHAPLEY | Shapley Value Attribution | Azure Function |
| PRF_ATTRIB_TIMEDECAY | Time-Decay Attribution | Azure Function |
| PRF_ATTRIB_MARKOV | Markov Chain Attribution | Azure Function |
| PRF_ATTRIB_POSITION | Position-Based Attribution | Azure Function |

**Deliverables:**
- `PRF_KB_Advanced_Attribution_v1.txt` (NEW - 20,000 chars)
- 4 AI Builder prompt JSONs in `base/platform/eap/prompts/ai_builder/`
- Azure Function specs in `src/azure-functions/prf/`
- 4 capability registrations
- 8 test scenarios

**Content Requirements for KB:**
- Shapley value theory and game-theoretic fair allocation
- Time-decay half-life calculations and parameter selection
- Markov chain transition probability methodology
- Position-based weighting schemes (U-shaped, W-shaped, custom)
- When to use each model based on customer journey complexity
- Calculation examples with sample data
- Comparison matrix showing strengths/weaknesses
- Integration with existing PRF_ATTRIBUTION capability

---

### EXPANSION 5: Incrementality Testing Suite (PRF Agent)

**New Capabilities:**
| Capability Code | Name | Implementation |
|-----------------|------|----------------|
| PRF_INCR_GEOHOLDOUT | Geo-Holdout Analysis | Azure Function |
| PRF_INCR_DID | Difference-in-Differences | Azure Function |
| PRF_INCR_PSM | Propensity Score Matching | Azure Function |
| PRF_INCR_SYNTH | Synthetic Control | Azure Function |

**Deliverables:**
- `PRF_KB_Incrementality_Methods_v1.txt` (NEW - 25,000 chars)
- 4 AI Builder prompt JSONs
- Azure Function specs
- 4 capability registrations
- 8 test scenarios

**Content Requirements for KB:**
- Geo-holdout DMA selection methodology and statistical power
- DID parallel trends assumption and validation
- Propensity score estimation and matching algorithms
- Synthetic control donor pool construction
- Lift calculation formulas with confidence intervals
- Sample size requirements for each method
- Decision tree: which method for which scenario
- Common pitfalls and how to avoid them

---

### EXPANSION 6: A/B Testing Calculator Suite (PRF Agent)

**New Capabilities:**
| Capability Code | Name | Implementation |
|-----------------|------|----------------|
| PRF_TEST_SAMPLESIZE | Sample Size Calculator | Azure Function |
| PRF_TEST_SIGNIFICANCE | Significance Tester | Azure Function |
| PRF_TEST_SEQUENTIAL | Sequential Testing | Azure Function |
| PRF_TEST_BAYESIAN | Bayesian A/B Test | Azure Function |
| PRF_TEST_SRM | Sample Ratio Mismatch Detector | Azure Function |

**Deliverables:**
- `PRF_KB_AB_Testing_Methods_v1.txt` (NEW - 22,000 chars)
- 5 AI Builder prompt JSONs
- Azure Function specs
- 5 capability registrations
- 10 test scenarios

**Content Requirements for KB:**
- Power analysis fundamentals (alpha, beta, MDE, baseline)
- Sample size formulas for conversion and continuous metrics
- Z-test and t-test implementations
- Sequential testing with alpha spending functions
- Bayesian posterior probability calculations
- SRM detection chi-square methodology
- Early stopping rules and peeking penalties
- Multi-variant test considerations

---

### EXPANSION 7: Next-Best-Action Engine (AUD Agent)

**New Capabilities:**
| Capability Code | Name | Implementation |
|-----------------|------|----------------|
| AUD_NBA_SELECT | Next-Best-Action Selector | Azure Function |
| AUD_NBA_THOMPSON | Thompson Sampling Bandit | Azure Function |
| AUD_NBA_SEQUENCE | Sequence Optimizer | Azure Function |
| AUD_NBA_FREQCAP | Frequency Cap Optimizer | Azure Function |
| AUD_NBA_CHANNEL | Channel Preference Scorer | Azure Function |

**Deliverables:**
- `AUD_KB_Next_Best_Action_v1.txt` (NEW - 25,000 chars)
- 5 AI Builder prompt JSONs
- Azure Function specs
- 5 capability registrations
- 10 test scenarios

**Content Requirements for KB:**
- Multi-armed bandit theory and exploration/exploitation tradeoff
- Thompson Sampling with Beta-Bernoulli conjugate priors
- Markov Decision Process for action sequencing
- Fatigue modeling and frequency cap optimization
- Channel affinity scoring methodology
- Context features for personalization
- Real-time vs batch NBA implementation
- Integration with AUD_KB_Journey_Orchestration

---

### EXPANSION 8: Response Curve Fitting (CHA Agent)

**New Capabilities:**
| Capability Code | Name | Implementation |
|-----------------|------|----------------|
| CHA_CURVE_HILL | Hill Function Fitter | Azure Function |
| CHA_CURVE_SCURVE | S-Curve Detector | Azure Function |
| CHA_CURVE_SATURATION | Saturation Point Calculator | Azure Function |
| CHA_CURVE_DIMINISHING | Diminishing Returns Analyzer | Azure Function |

**Deliverables:**
- `CHA_KB_Response_Curves_v1.txt` (NEW - 20,000 chars)
- 4 AI Builder prompt JSONs
- Azure Function specs
- 4 capability registrations
- 8 test scenarios

**Content Requirements for KB:**
- Hill function (Emax model) parameterization
- S-curve (logistic) fitting methodology
- Saturation point detection algorithms
- Marginal return calculation at any spend level
- Adstock transformation for carryover effects
- Channel-specific curve shape expectations
- Curve fitting diagnostics and goodness-of-fit
- Integration with budget optimization

---

### EXPANSION 9: Forecasting Models (PRF Agent)

**New Capabilities:**
| Capability Code | Name | Implementation |
|-----------------|------|----------------|
| PRF_FORECAST_PROPHET | Prophet Forecaster | Azure Function |
| PRF_FORECAST_ARIMA | ARIMA Forecaster | Azure Function |
| PRF_FORECAST_ETS | ETS Forecaster | Azure Function |
| PRF_FORECAST_ENSEMBLE | Ensemble Forecaster | Azure Function |

**Deliverables:**
- `PRF_KB_Forecasting_Methods_v1.txt` (NEW - 22,000 chars)
- 4 AI Builder prompt JSONs
- Azure Function specs
- 4 capability registrations
- 8 test scenarios

**Content Requirements for KB:**
- Prophet decomposition (trend, seasonality, holidays)
- ARIMA order selection (p,d,q) methodology
- ETS state space models and smoothing parameters
- Ensemble weighting strategies
- Forecast accuracy metrics (MAPE, RMSE, MASE)
- Prediction intervals and uncertainty quantification
- Anomaly detection during forecasting
- Model selection decision framework

---

## FILE NAMING AND LOCATIONS

**KB Files:**
```
release/v6.0/agents/prf/kb/PRF_KB_Advanced_Attribution_v1.txt
release/v6.0/agents/prf/kb/PRF_KB_Incrementality_Methods_v1.txt
release/v6.0/agents/prf/kb/PRF_KB_AB_Testing_Methods_v1.txt
release/v6.0/agents/prf/kb/PRF_KB_Forecasting_Methods_v1.txt
release/v6.0/agents/aud/kb/AUD_KB_Next_Best_Action_v1.txt
release/v6.0/agents/cha/kb/CHA_KB_Response_Curves_v1.txt
```

**AI Builder Prompts:**
```
base/platform/eap/prompts/ai_builder/PRF_ATTRIB_SHAPLEY_PROMPT.json
base/platform/eap/prompts/ai_builder/PRF_ATTRIB_TIMEDECAY_PROMPT.json
... (one per capability)
```

**Azure Function Specs:**
```
src/azure-functions/prf/attribution/
src/azure-functions/prf/incrementality/
src/azure-functions/prf/testing/
src/azure-functions/prf/forecasting/
src/azure-functions/aud/nba/
src/azure-functions/cha/curves/
```

**Capability Seed Data:**
```
base/dataverse/seed/eap_capability_v64_seed.csv
```

---

## 6-RULE COMPLIANCE (MANDATORY)

All KB files MUST comply:
1. **ALL-CAPS HEADERS** - Section headers in uppercase
2. **HYPHENS-ONLY LISTS** - Use hyphens (-), never bullets or numbers in lists
3. **ASCII CHARACTERS ONLY** - No smart quotes, em-dashes, or special characters
4. **ZERO VISUAL DEPENDENCIES** - No tables, diagrams, or formatting that requires rendering
5. **MANDATORY LANGUAGE** - Use "must", "always", "never" for rules
6. **PROFESSIONAL TONE** - Direct, authoritative, no hedging

**Validation Command:**
```bash
grep -P '[–—""'']' filename.txt  # Should return nothing
```

---

## AI BUILDER PROMPT JSON TEMPLATE

```json
{
  "prompt_code": "PRF_ATTRIB_SHAPLEY",
  "prompt_name": "Shapley Value Attribution",
  "model": "gpt-4",
  "system_message": "You are a marketing measurement expert specializing in multi-touch attribution...",
  "user_template": "Touchpoint Data: {{touchpoints_json}}\nConversions: {{conversions}}\n\nCalculate Shapley values for each channel.",
  "output_format": "json",
  "output_schema": {
    "channel_attributions": [{"channel": "string", "shapley_value": "number", "contribution_pct": "number"}],
    "convergence_iterations": "number",
    "confidence": "number"
  },
  "max_tokens": 2000,
  "temperature": 0.1
}
```

---

## CAPABILITY REGISTRATION FORMAT

```csv
capability_code,capability_name,description,agent_code,input_schema,output_schema,is_active
PRF_ATTRIB_SHAPLEY,Shapley Value Attribution,Game-theoretic fair allocation of conversion credit across touchpoints,PRF,"{""touchpoints"": ""array"", ""conversions"": ""number""}","{""channel_attributions"": ""array"", ""confidence"": ""number""}",true
```

---

## EXECUTION ORDER

1. **Phase 1:** Create all 6 KB files (commit after each)
2. **Phase 2:** Create all 26 AI Builder prompt JSONs
3. **Phase 3:** Create Azure Function specifications
4. **Phase 4:** Create capability seed data CSV
5. **Phase 5:** Create test scenarios JSON
6. **Phase 6:** Update agent instructions to reference new capabilities

---

## DELIVERY REQUIREMENTS

- **NEVER truncate, abbreviate, or use placeholders**
- **Commit to git after each major file**
- **Provide download links at phase completion**
- **Character count validation before finalizing KB files**
- **All formulas must be complete and calculable**

---

## REFERENCE DOCUMENTS

Read these from `/mnt/project/` before starting:
- `MPA_v6_Model_Expansion_Evaluation.md` - Full model specifications
- `MPA_v6_AI_Builder_Prompts.md` - Existing prompt patterns
- `MPA_v6_Azure_Functions.md` - Function architecture
- `MPA_v6_Architecture_Final.md` - Overall system design

---

## SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| KB Files Created | 6 |
| AI Builder Prompts | 26 |
| Azure Function Specs | 26 |
| Capabilities Registered | 26 |
| Test Scenarios | 52 |
| 6-Rule Compliance | 100% |

---

**START EXECUTION WITH EXPANSION 4: ADVANCED ATTRIBUTION MODELS**

Create `PRF_KB_Advanced_Attribution_v1.txt` first, then proceed sequentially.
