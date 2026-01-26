# KDAP v6.6 EXPANSION BUILD PLAN

**Version:** 1.0  
**Date:** January 20, 2026  
**Status:** APPROVED - EXECUTION READY  
**Scope:** 6 Capability Expansions (24 New Capabilities)  
**Owners:** Desktop Claude (Content), VS Code Claude (Infrastructure)

---

## EXECUTIVE SUMMARY

This document defines the complete build plan for KDAP v6.6, adding 24 new capabilities across 6 agents through 6 strategic expansions. The expansions address critical functional gaps identified in competitive intelligence, learning extraction, budget pacing, audience lifecycle, flighting optimization, and document automation.

**Total Deliverables:**
- 6 KB Files (120,000+ characters)
- 24 AI Builder Prompt JSONs
- 24 Azure Function Specifications
- 24 Capability Registrations
- 48 Test Scenarios
- 6 Power Automate Flow Definitions

---

## EXPANSION EXECUTION ORDER

| Order | Expansion | Agent(s) | Capabilities | Priority |
|-------|-----------|----------|--------------|----------|
| 1 | Learning Extraction & Insight Synthesis | PRF | 4 | Critical |
| 2 | Competitive Intelligence Suite | ANL, MKT | 4 | Critical |
| 3 | Budget Pacing & Scenario Engine | ANL | 4 | High |
| 4 | Audience Lifecycle Management | AUD | 4 | High |
| 5 | Flighting & Timing Optimization | CHA | 4 | High |
| 6 | Document Automation Suite | DOC | 4 | Medium |

---

## EXPANSION 14: LEARNING EXTRACTION & INSIGHT SYNTHESIS

**Agent:** PRF (Performance)  
**Owner:** Desktop Claude  
**VS Code:** Azure Functions, Power Automate Flow

### Capabilities

| Code | Name | Implementation | Timeout |
|------|------|----------------|---------|
| PRF_LEARNING_EXTRACT | Learning Extractor | Azure Function | 60s |
| PRF_INSIGHT_CROSS | Cross-Campaign Insights | Azure Function | 45s |
| PRF_PATTERN_DETECT | Pattern Detector | Azure Function | 45s |
| PRF_PLAYBOOK_GEN | Playbook Generator | AI Builder | 30s |

### KB File Specification

**File:** `release/v6.0/agents/prf/kb/PRF_KB_Learning_Extraction_v1.txt`  
**Target Size:** 22,000 characters  
**6-Rule Compliance:** Required

**Content Structure:**

```
LEARNING EXTRACTION METHODOLOGY
- What constitutes a "learning" vs observation
- Confidence thresholds for actionable insights
- Attribution of learning to specific variables
- Temporal validity of learnings

CROSS-CAMPAIGN INSIGHT AGGREGATION
- Normalization across campaign types
- Statistical significance for pattern claims
- Weighting by recency and sample size
- Conflicting insight resolution

PATTERN DETECTION ALGORITHMS
- Success pattern identification criteria
- Failure pattern warning thresholds
- Recurring vs one-time pattern classification
- Pattern persistence scoring

PLAYBOOK GENERATION FRAMEWORK
- Playbook structure and sections
- Condition-action rule extraction
- Confidence scoring for recommendations
- Version control for playbook updates

INTEGRATION WITH PERFORMANCE DATA
- Required data inputs and schemas
- Minimum data requirements
- Data quality validation
- Historical lookback windows
```

### AI Builder Prompts

**PRF_LEARNING_EXTRACT_PROMPT.json:**
```json
{
  "prompt_code": "PRF_LEARNING_EXTRACT",
  "prompt_name": "Extract Campaign Learnings",
  "model": "gpt-4",
  "system_message": "You are a marketing analytics expert specializing in extracting actionable learnings from campaign performance data. Analyze the provided data to identify what worked, what did not work, and why. Focus on statistically significant findings with clear causation, not just correlation.",
  "user_template": "Campaign Data: {{campaign_data_json}}\nPerformance Metrics: {{metrics_json}}\nBenchmarks: {{benchmarks_json}}\n\nExtract key learnings with confidence scores.",
  "output_format": "json",
  "output_schema": {
    "learnings": [
      {
        "learning_id": "string",
        "category": "string",
        "finding": "string",
        "evidence": "string",
        "confidence": "number",
        "actionability": "string",
        "applicable_contexts": ["string"]
      }
    ],
    "summary": "string",
    "data_quality_score": "number"
  },
  "max_tokens": 3000,
  "temperature": 0.2
}
```

**PRF_INSIGHT_CROSS_PROMPT.json:**
```json
{
  "prompt_code": "PRF_INSIGHT_CROSS",
  "prompt_name": "Cross-Campaign Insight Aggregation",
  "model": "gpt-4",
  "system_message": "You are a marketing strategist who synthesizes insights across multiple campaigns to identify overarching patterns and strategic implications. Weight recent campaigns more heavily and flag conflicting findings.",
  "user_template": "Campaign Learnings Array: {{learnings_array_json}}\nTime Range: {{time_range}}\nBusiness Context: {{context}}\n\nSynthesize cross-campaign insights.",
  "output_format": "json",
  "output_schema": {
    "cross_campaign_insights": [
      {
        "insight_id": "string",
        "insight": "string",
        "supporting_campaigns": ["string"],
        "confidence": "number",
        "strategic_implication": "string"
      }
    ],
    "conflicts": [
      {
        "finding_a": "string",
        "finding_b": "string",
        "resolution_recommendation": "string"
      }
    ],
    "meta_patterns": ["string"]
  },
  "max_tokens": 2500,
  "temperature": 0.2
}
```

**PRF_PATTERN_DETECT_PROMPT.json:**
```json
{
  "prompt_code": "PRF_PATTERN_DETECT",
  "prompt_name": "Detect Performance Patterns",
  "model": "gpt-4",
  "system_message": "You are a data scientist specializing in pattern recognition for marketing performance. Identify recurring success patterns and failure patterns across the provided data. Distinguish between persistent patterns and anomalies.",
  "user_template": "Historical Performance Data: {{historical_data_json}}\nPattern Detection Parameters: {{parameters}}\n\nDetect and classify patterns.",
  "output_format": "json",
  "output_schema": {
    "success_patterns": [
      {
        "pattern_id": "string",
        "pattern_description": "string",
        "occurrence_count": "number",
        "persistence_score": "number",
        "conditions": ["string"],
        "expected_outcome": "string"
      }
    ],
    "failure_patterns": [
      {
        "pattern_id": "string",
        "pattern_description": "string",
        "occurrence_count": "number",
        "warning_indicators": ["string"],
        "mitigation_actions": ["string"]
      }
    ],
    "anomalies": ["string"]
  },
  "max_tokens": 2500,
  "temperature": 0.1
}
```

**PRF_PLAYBOOK_GEN_PROMPT.json:**
```json
{
  "prompt_code": "PRF_PLAYBOOK_GEN",
  "prompt_name": "Generate Optimization Playbook",
  "model": "gpt-4",
  "system_message": "You are a marketing operations expert who creates actionable playbooks from performance data and learnings. Generate clear condition-action rules that practitioners can follow. Include confidence levels and exceptions.",
  "user_template": "Learnings: {{learnings_json}}\nPatterns: {{patterns_json}}\nBusiness Rules: {{rules_json}}\n\nGenerate optimization playbook.",
  "output_format": "json",
  "output_schema": {
    "playbook_name": "string",
    "playbook_version": "string",
    "rules": [
      {
        "rule_id": "string",
        "condition": "string",
        "action": "string",
        "confidence": "number",
        "exceptions": ["string"],
        "source_learnings": ["string"]
      }
    ],
    "decision_tree": "string",
    "review_cadence": "string"
  },
  "max_tokens": 3000,
  "temperature": 0.2
}
```

### Azure Function Specifications

**Location:** `src/azure-functions/prf/learning/`

| Function | Runtime | Memory | Timeout |
|----------|---------|--------|---------|
| prf-learning-extract | Python 3.11 | 512MB | 60s |
| prf-insight-cross | Python 3.11 | 512MB | 45s |
| prf-pattern-detect | Python 3.11 | 1GB | 45s |

**Dependencies:**
- pandas >= 2.0
- numpy >= 1.24
- scikit-learn >= 1.3
- scipy >= 1.11

### Test Scenarios

| ID | Scenario | Expected Outcome |
|----|----------|------------------|
| PRF-L-01 | Extract learnings from successful campaign | 3+ learnings with confidence > 0.7 |
| PRF-L-02 | Extract learnings from failed campaign | Failure patterns identified |
| PRF-L-03 | Cross-campaign with conflicting data | Conflicts surfaced with resolution |
| PRF-L-04 | Pattern detection with sparse data | Graceful handling, minimum patterns |
| PRF-L-05 | Playbook generation from mixed learnings | Valid playbook with confidence scores |
| PRF-L-06 | Learning extraction with missing metrics | Data quality warning, partial results |
| PRF-L-07 | Cross-campaign with 10+ campaigns | Aggregation completes under timeout |
| PRF-L-08 | Pattern persistence over 12 months | Persistence scores calculated correctly |

### VS Code Tasks

1. Create Azure Function scaffolding in `src/azure-functions/prf/learning/`
2. Implement `prf-learning-extract` function with pandas aggregation
3. Implement `prf-insight-cross` function with weighting logic
4. Implement `prf-pattern-detect` function with scikit-learn clustering
5. Create Power Automate flow `PRF_Learning_Extraction_Flow` to orchestrate
6. Register capabilities in eap_capability table
7. Deploy functions to Azure (personal environment)

---

## EXPANSION 10: COMPETITIVE INTELLIGENCE SUITE

**Agents:** ANL (Analytics), MKT (Marketing)  
**Owner:** Desktop Claude  
**VS Code:** Azure Functions, Power Automate Flows

### Capabilities

| Code | Name | Agent | Implementation | Timeout |
|------|------|-------|----------------|---------|
| ANL_SOV_ANALYZE | Share of Voice Analyzer | ANL | Azure Function | 45s |
| ANL_COMP_SPEND | Competitive Spend Estimator | ANL | Azure Function | 60s |
| MKT_COMP_MESSAGING | Competitive Messaging Map | MKT | AI Builder | 30s |
| MKT_COMP_GAPS | White Space Identifier | MKT | AI Builder | 30s |

### KB File Specifications

**File 1:** `release/v6.0/agents/anl/kb/ANL_KB_Competitive_Intelligence_v1.txt`  
**Target Size:** 20,000 characters

**Content Structure:**

```
SHARE OF VOICE METHODOLOGY
- SOV calculation formulas by channel
- Impression-based vs spend-based SOV
- Category definition and boundary setting
- Temporal aggregation windows
- Data source reliability weighting

COMPETITIVE SPEND ESTIMATION
- Signal-based spend inference methods
- Impression-to-spend conversion models
- Seasonality adjustment factors
- Confidence intervals for estimates
- Validation against known benchmarks

COMPETITIVE SET DEFINITION
- Direct vs indirect competitor classification
- Market share correlation analysis
- Competitive intensity scoring
- Dynamic competitor set updates

DATA INTEGRATION
- Third-party data source specifications
- Data freshness requirements
- Cross-source reconciliation
- Missing data imputation methods
```

**File 2:** `release/v6.0/agents/mkt/kb/MKT_KB_Competitive_Positioning_v1.txt`  
**Target Size:** 18,000 characters

**Content Structure:**

```
COMPETITIVE MESSAGING ANALYSIS
- Message taxonomy and classification
- Positioning dimension mapping
- Tone and voice characterization
- Claims and proof point cataloging
- Message frequency tracking

WHITE SPACE IDENTIFICATION
- Uncontested positioning opportunities
- Underserved audience segments
- Messaging gap analysis
- Timing and seasonal gaps
- Channel presence gaps

POSITIONING MAP CONSTRUCTION
- Dimension selection methodology
- Competitor placement criteria
- Perceptual vs actual positioning
- Dynamic map updates

STRATEGIC RECOMMENDATIONS
- Differentiation opportunity scoring
- Risk assessment for positioning moves
- Resource requirements estimation
- Competitive response anticipation
```

### AI Builder Prompts

**ANL_SOV_ANALYZE_PROMPT.json:**
```json
{
  "prompt_code": "ANL_SOV_ANALYZE",
  "prompt_name": "Analyze Share of Voice",
  "model": "gpt-4",
  "system_message": "You are a competitive intelligence analyst specializing in share of voice measurement. Calculate and interpret SOV metrics across channels, identifying trends and competitive dynamics.",
  "user_template": "Your Brand Data: {{brand_data_json}}\nCompetitor Data: {{competitor_data_json}}\nCategory Definition: {{category}}\nTime Period: {{time_period}}\n\nCalculate SOV and provide competitive analysis.",
  "output_format": "json",
  "output_schema": {
    "sov_summary": {
      "your_sov_pct": "number",
      "sov_trend": "string",
      "sov_by_channel": "object"
    },
    "competitor_breakdown": [
      {
        "competitor": "string",
        "sov_pct": "number",
        "trend": "string",
        "key_channels": ["string"]
      }
    ],
    "insights": ["string"],
    "recommendations": ["string"]
  },
  "max_tokens": 2000,
  "temperature": 0.1
}
```

**ANL_COMP_SPEND_PROMPT.json:**
```json
{
  "prompt_code": "ANL_COMP_SPEND",
  "prompt_name": "Estimate Competitive Spend",
  "model": "gpt-4",
  "system_message": "You are a media investment analyst who estimates competitor advertising spend from available signals. Provide estimates with confidence intervals and methodology transparency.",
  "user_template": "Competitor: {{competitor}}\nAvailable Signals: {{signals_json}}\nIndustry Benchmarks: {{benchmarks_json}}\nTime Period: {{time_period}}\n\nEstimate advertising spend.",
  "output_format": "json",
  "output_schema": {
    "competitor": "string",
    "estimated_total_spend": "number",
    "confidence_interval": {
      "low": "number",
      "high": "number"
    },
    "spend_by_channel": "object",
    "methodology_notes": "string",
    "data_quality_score": "number"
  },
  "max_tokens": 1500,
  "temperature": 0.1
}
```

**MKT_COMP_MESSAGING_PROMPT.json:**
```json
{
  "prompt_code": "MKT_COMP_MESSAGING",
  "prompt_name": "Map Competitive Messaging",
  "model": "gpt-4",
  "system_message": "You are a brand strategist who analyzes competitive messaging to create positioning maps. Identify key dimensions, plot competitors, and surface differentiation opportunities.",
  "user_template": "Your Brand Messaging: {{brand_messaging}}\nCompetitor Messaging: {{competitor_messaging_json}}\nCategory Context: {{category}}\n\nCreate competitive messaging map.",
  "output_format": "json",
  "output_schema": {
    "positioning_dimensions": [
      {
        "dimension": "string",
        "your_position": "number",
        "competitor_positions": "object"
      }
    ],
    "messaging_themes": [
      {
        "theme": "string",
        "your_usage": "string",
        "competitor_usage": "object"
      }
    ],
    "differentiation_score": "number",
    "positioning_recommendations": ["string"]
  },
  "max_tokens": 2500,
  "temperature": 0.3
}
```

**MKT_COMP_GAPS_PROMPT.json:**
```json
{
  "prompt_code": "MKT_COMP_GAPS",
  "prompt_name": "Identify White Space Opportunities",
  "model": "gpt-4",
  "system_message": "You are a strategic planner who identifies uncontested market positions and messaging gaps. Analyze the competitive landscape to find white space opportunities.",
  "user_template": "Competitive Landscape: {{landscape_json}}\nYour Capabilities: {{capabilities}}\nTarget Audiences: {{audiences_json}}\n\nIdentify white space opportunities.",
  "output_format": "json",
  "output_schema": {
    "white_space_opportunities": [
      {
        "opportunity_id": "string",
        "description": "string",
        "gap_type": "string",
        "opportunity_score": "number",
        "resource_requirement": "string",
        "competitive_risk": "string"
      }
    ],
    "underserved_audiences": ["string"],
    "messaging_gaps": ["string"],
    "channel_gaps": ["string"],
    "priority_ranking": ["string"]
  },
  "max_tokens": 2500,
  "temperature": 0.3
}
```

### Azure Function Specifications

**Location:** `src/azure-functions/anl/competitive/`

| Function | Runtime | Memory | Timeout |
|----------|---------|--------|---------|
| anl-sov-analyze | Python 3.11 | 512MB | 45s |
| anl-comp-spend | Python 3.11 | 512MB | 60s |

**Dependencies:**
- pandas >= 2.0
- numpy >= 1.24
- requests >= 2.31

### Test Scenarios

| ID | Scenario | Expected Outcome |
|----|----------|------------------|
| CI-01 | SOV analysis with 5 competitors | SOV percentages sum to ~100% |
| CI-02 | SOV with missing competitor data | Graceful handling, confidence adjusted |
| CI-03 | Spend estimation with strong signals | Narrow confidence interval |
| CI-04 | Spend estimation with weak signals | Wide interval, methodology noted |
| CI-05 | Messaging map with 3 competitors | Valid positioning dimensions |
| CI-06 | White space with saturated market | Niche opportunities identified |
| CI-07 | White space with clear gaps | High-confidence opportunities |
| CI-08 | Cross-channel SOV aggregation | Weighted composite calculated |

### VS Code Tasks

1. Create Azure Function scaffolding in `src/azure-functions/anl/competitive/`
2. Implement `anl-sov-analyze` with multi-channel aggregation
3. Implement `anl-comp-spend` with confidence interval calculation
4. Create Power Automate flow `ANL_Competitive_Intel_Flow`
5. Register capabilities in eap_capability table
6. Deploy functions to Azure (personal environment)

---

## EXPANSION 11: BUDGET PACING & SCENARIO ENGINE

**Agent:** ANL (Analytics)  
**Owner:** Desktop Claude  
**VS Code:** Azure Functions

### Capabilities

| Code | Name | Implementation | Timeout |
|------|------|----------------|---------|
| ANL_PACE_RECOMMEND | Pacing Recommender | Azure Function | 30s |
| ANL_PACE_FORECAST | Pacing Forecaster | Azure Function | 45s |
| ANL_SCENARIO_COMPARE | Scenario Comparator | Azure Function | 60s |
| ANL_BREAKEVEN_CALC | Break-Even Calculator | AI Builder | 20s |

### KB File Specification

**File:** `release/v6.0/agents/anl/kb/ANL_KB_Budget_Pacing_v1.txt`  
**Target Size:** 20,000 characters

**Content Structure:**

```
PACING STRATEGY FUNDAMENTALS
- Front-loaded vs back-loaded vs even pacing
- Pacing curve shapes and formulas
- Seasonal adjustment factors
- Event-driven pacing modifications
- Budget reserve strategies

PACING RECOMMENDATION LOGIC
- Objective-to-pacing mapping
- Competitive timing considerations
- Inventory availability factors
- Performance feedback loops
- Risk tolerance calibration

SPEND TRAJECTORY FORECASTING
- Current pace calculation
- Projected end-of-period spend
- Variance from plan detection
- Course correction recommendations
- Confidence intervals for forecasts

SCENARIO COMPARISON FRAMEWORK
- Scenario definition standards
- Comparison metrics selection
- Trade-off visualization
- Sensitivity analysis
- Decision criteria weighting

BREAK-EVEN ANALYSIS
- Break-even formula derivations
- Fixed vs variable cost allocation
- Time-to-break-even calculation
- Risk-adjusted break-even
- Scenario-specific break-even
```

### AI Builder Prompts

**ANL_PACE_RECOMMEND_PROMPT.json:**
```json
{
  "prompt_code": "ANL_PACE_RECOMMEND",
  "prompt_name": "Recommend Budget Pacing",
  "model": "gpt-4",
  "system_message": "You are a media investment strategist who recommends optimal budget pacing strategies. Consider objectives, seasonality, competitive dynamics, and inventory factors.",
  "user_template": "Total Budget: {{budget}}\nTime Period: {{period}}\nObjectives: {{objectives_json}}\nSeasonality Data: {{seasonality}}\nConstraints: {{constraints}}\n\nRecommend pacing strategy.",
  "output_format": "json",
  "output_schema": {
    "recommended_pacing": "string",
    "pacing_curve": [
      {
        "period": "string",
        "pct_of_budget": "number",
        "rationale": "string"
      }
    ],
    "alternative_options": ["string"],
    "risk_factors": ["string"],
    "monitoring_triggers": ["string"]
  },
  "max_tokens": 2000,
  "temperature": 0.2
}
```

**ANL_PACE_FORECAST_PROMPT.json:**
```json
{
  "prompt_code": "ANL_PACE_FORECAST",
  "prompt_name": "Forecast Budget Pacing",
  "model": "gpt-4",
  "system_message": "You are a financial analyst who forecasts budget spend trajectories. Analyze current spending patterns and project end-of-period outcomes with variance analysis.",
  "user_template": "Budget Plan: {{plan_json}}\nActual Spend to Date: {{actual_json}}\nDays Elapsed: {{days_elapsed}}\nDays Remaining: {{days_remaining}}\n\nForecast spend trajectory.",
  "output_format": "json",
  "output_schema": {
    "current_pace_pct": "number",
    "projected_end_spend": "number",
    "projected_variance_pct": "number",
    "trajectory": "string",
    "forecast_by_period": "array",
    "correction_recommendations": ["string"],
    "confidence": "number"
  },
  "max_tokens": 1500,
  "temperature": 0.1
}
```

**ANL_SCENARIO_COMPARE_PROMPT.json:**
```json
{
  "prompt_code": "ANL_SCENARIO_COMPARE",
  "prompt_name": "Compare Budget Scenarios",
  "model": "gpt-4",
  "system_message": "You are a strategic planner who compares multiple budget scenarios. Analyze trade-offs, highlight key differences, and provide decision support.",
  "user_template": "Scenarios: {{scenarios_json}}\nEvaluation Criteria: {{criteria_json}}\nWeights: {{weights}}\n\nCompare scenarios and recommend.",
  "output_format": "json",
  "output_schema": {
    "scenario_scores": [
      {
        "scenario_name": "string",
        "weighted_score": "number",
        "scores_by_criterion": "object"
      }
    ],
    "trade_off_analysis": "string",
    "recommended_scenario": "string",
    "recommendation_rationale": "string",
    "sensitivity_notes": ["string"]
  },
  "max_tokens": 2500,
  "temperature": 0.2
}
```

**ANL_BREAKEVEN_CALC_PROMPT.json:**
```json
{
  "prompt_code": "ANL_BREAKEVEN_CALC",
  "prompt_name": "Calculate Break-Even",
  "model": "gpt-4",
  "system_message": "You are a financial analyst who calculates break-even points for marketing investments. Provide clear break-even analysis with assumptions documented.",
  "user_template": "Investment Amount: {{investment}}\nExpected Revenue per Conversion: {{revenue}}\nConversion Rate: {{conv_rate}}\nFixed Costs: {{fixed}}\nVariable Costs: {{variable}}\n\nCalculate break-even.",
  "output_format": "json",
  "output_schema": {
    "break_even_units": "number",
    "break_even_revenue": "number",
    "time_to_break_even": "string",
    "margin_of_safety": "number",
    "assumptions": ["string"],
    "sensitivity": {
      "if_conv_rate_drops_10pct": "object",
      "if_revenue_drops_10pct": "object"
    }
  },
  "max_tokens": 1500,
  "temperature": 0.1
}
```

### Azure Function Specifications

**Location:** `src/azure-functions/anl/pacing/`

| Function | Runtime | Memory | Timeout |
|----------|---------|--------|---------|
| anl-pace-recommend | Python 3.11 | 256MB | 30s |
| anl-pace-forecast | Python 3.11 | 512MB | 45s |
| anl-scenario-compare | Python 3.11 | 512MB | 60s |

### Test Scenarios

| ID | Scenario | Expected Outcome |
|----|----------|------------------|
| BP-01 | Pacing for brand awareness objective | Front-loaded recommended |
| BP-02 | Pacing for performance objective | Even/back-loaded recommended |
| BP-03 | Forecast with overspend trajectory | Correction recommendations |
| BP-04 | Forecast with underspend trajectory | Acceleration recommendations |
| BP-05 | Compare 3 budget scenarios | Ranked with trade-offs |
| BP-06 | Break-even with high fixed costs | Longer time-to-break-even |
| BP-07 | Pacing with seasonal peak | Budget concentrated at peak |
| BP-08 | Scenario compare with equal scores | Tie-breaker logic applied |

### VS Code Tasks

1. Create Azure Function scaffolding in `src/azure-functions/anl/pacing/`
2. Implement `anl-pace-recommend` with curve generation
3. Implement `anl-pace-forecast` with trajectory projection
4. Implement `anl-scenario-compare` with weighted scoring
5. Create Power Automate flow `ANL_Budget_Pacing_Flow`
6. Register capabilities in eap_capability table
7. Deploy functions to Azure (personal environment)

---

## EXPANSION 12: AUDIENCE LIFECYCLE MANAGEMENT

**Agent:** AUD (Audience)  
**Owner:** Desktop Claude  
**VS Code:** Azure Functions

### Capabilities

| Code | Name | Implementation | Timeout |
|------|------|----------------|---------|
| AUD_COHORT_MIGRATE | Cohort Migration Analyzer | Azure Function | 45s |
| AUD_DECAY_PREDICT | Audience Decay Predictor | Azure Function | 45s |
| AUD_REFRESH_RECOMMEND | Refresh Recommender | AI Builder | 30s |
| AUD_LOOKALIKE_SCORE | Lookalike Quality Scorer | Azure Function | 30s |

### KB File Specification

**File:** `release/v6.0/agents/aud/kb/AUD_KB_Audience_Lifecycle_v1.txt`  
**Target Size:** 22,000 characters

**Content Structure:**

```
AUDIENCE LIFECYCLE STAGES
- Acquisition stage characteristics
- Engagement stage indicators
- Maturation stage signals
- Decline stage warning signs
- Reactivation potential scoring

COHORT MIGRATION ANALYSIS
- Cohort definition methodology
- Migration tracking metrics
- Graduation criteria by stage
- Churn prediction integration
- Migration velocity measurement

AUDIENCE DECAY MODELING
- Decay curve formulations
- Half-life estimation methods
- Decay rate by audience type
- External factor adjustments
- Decay acceleration triggers

REFRESH STRATEGY OPTIMIZATION
- Refresh frequency determination
- Cost-benefit of refresh cycles
- Partial vs full refresh decisions
- Refresh timing optimization
- Quality maintenance thresholds

LOOKALIKE MODEL VALIDATION
- Overlap analysis methodology
- Performance correlation scoring
- Model drift detection
- Seed quality assessment
- Expansion rate optimization
```

### AI Builder Prompts

**AUD_COHORT_MIGRATE_PROMPT.json:**
```json
{
  "prompt_code": "AUD_COHORT_MIGRATE",
  "prompt_name": "Analyze Cohort Migration",
  "model": "gpt-4",
  "system_message": "You are an audience analytics expert who analyzes how user cohorts move through lifecycle stages. Track migration patterns and identify acceleration or deceleration factors.",
  "user_template": "Cohort Data: {{cohort_data_json}}\nStage Definitions: {{stages}}\nTime Period: {{period}}\n\nAnalyze cohort migration patterns.",
  "output_format": "json",
  "output_schema": {
    "migration_matrix": "object",
    "stage_distribution": "object",
    "migration_velocity": "number",
    "acceleration_factors": ["string"],
    "deceleration_factors": ["string"],
    "at_risk_cohorts": ["string"],
    "recommendations": ["string"]
  },
  "max_tokens": 2000,
  "temperature": 0.2
}
```

**AUD_DECAY_PREDICT_PROMPT.json:**
```json
{
  "prompt_code": "AUD_DECAY_PREDICT",
  "prompt_name": "Predict Audience Decay",
  "model": "gpt-4",
  "system_message": "You are an audience scientist who models audience decay over time. Predict when audience quality will fall below actionable thresholds.",
  "user_template": "Audience Profile: {{audience_json}}\nHistorical Decay Data: {{decay_history}}\nCurrent Quality Score: {{quality_score}}\n\nPredict decay trajectory.",
  "output_format": "json",
  "output_schema": {
    "current_half_life_days": "number",
    "predicted_quality_by_week": "array",
    "threshold_breach_date": "string",
    "decay_rate": "number",
    "decay_drivers": ["string"],
    "mitigation_options": ["string"]
  },
  "max_tokens": 1500,
  "temperature": 0.1
}
```

**AUD_REFRESH_RECOMMEND_PROMPT.json:**
```json
{
  "prompt_code": "AUD_REFRESH_RECOMMEND",
  "prompt_name": "Recommend Audience Refresh",
  "model": "gpt-4",
  "system_message": "You are an audience operations strategist who optimizes audience refresh cycles. Balance freshness against cost and operational complexity.",
  "user_template": "Audience Inventory: {{inventory_json}}\nDecay Predictions: {{decay_json}}\nRefresh Costs: {{costs}}\nPerformance Requirements: {{requirements}}\n\nRecommend refresh strategy.",
  "output_format": "json",
  "output_schema": {
    "refresh_schedule": [
      {
        "audience_id": "string",
        "recommended_refresh_date": "string",
        "refresh_type": "string",
        "urgency": "string",
        "cost_estimate": "number"
      }
    ],
    "priority_ranking": ["string"],
    "cost_summary": "object",
    "quality_impact": "string"
  },
  "max_tokens": 2000,
  "temperature": 0.2
}
```

**AUD_LOOKALIKE_SCORE_PROMPT.json:**
```json
{
  "prompt_code": "AUD_LOOKALIKE_SCORE",
  "prompt_name": "Score Lookalike Quality",
  "model": "gpt-4",
  "system_message": "You are a data scientist who validates lookalike model quality. Assess overlap, performance correlation, and recommend optimization actions.",
  "user_template": "Seed Audience: {{seed_json}}\nLookalike Audience: {{lookalike_json}}\nPerformance Data: {{performance}}\nExpansion Rate: {{expansion_rate}}\n\nScore lookalike quality.",
  "output_format": "json",
  "output_schema": {
    "quality_score": "number",
    "overlap_pct": "number",
    "performance_correlation": "number",
    "seed_quality_assessment": "string",
    "expansion_recommendation": "string",
    "drift_detected": "boolean",
    "optimization_actions": ["string"]
  },
  "max_tokens": 1500,
  "temperature": 0.1
}
```

### Azure Function Specifications

**Location:** `src/azure-functions/aud/lifecycle/`

| Function | Runtime | Memory | Timeout |
|----------|---------|--------|---------|
| aud-cohort-migrate | Python 3.11 | 512MB | 45s |
| aud-decay-predict | Python 3.11 | 512MB | 45s |
| aud-lookalike-score | Python 3.11 | 256MB | 30s |

### Test Scenarios

| ID | Scenario | Expected Outcome |
|----|----------|------------------|
| AL-01 | Cohort migration with clear progression | Migration matrix populated |
| AL-02 | Cohort with high churn rate | At-risk cohorts identified |
| AL-03 | Decay prediction for fresh audience | Long half-life predicted |
| AL-04 | Decay prediction for stale audience | Short half-life, urgent refresh |
| AL-05 | Refresh recommendation with budget | Prioritized within budget |
| AL-06 | Lookalike with high overlap | Quality warning, narrow recommendation |
| AL-07 | Lookalike with drift | Drift detected, retraining recommended |
| AL-08 | Refresh for 20+ audiences | Batch processing completes |

### VS Code Tasks

1. Create Azure Function scaffolding in `src/azure-functions/aud/lifecycle/`
2. Implement `aud-cohort-migrate` with transition matrix
3. Implement `aud-decay-predict` with exponential decay model
4. Implement `aud-lookalike-score` with overlap calculation
5. Create Power Automate flow `AUD_Lifecycle_Management_Flow`
6. Register capabilities in eap_capability table
7. Deploy functions to Azure (personal environment)

---

## EXPANSION 13: FLIGHTING & TIMING OPTIMIZATION

**Agent:** CHA (Channel)  
**Owner:** Desktop Claude  
**VS Code:** Azure Functions

### Capabilities

| Code | Name | Implementation | Timeout |
|------|------|----------------|---------|
| CHA_FLIGHT_OPTIMIZE | Flight Pattern Optimizer | Azure Function | 45s |
| CHA_DAYPART_ANALYZE | Daypart Analyzer | Azure Function | 30s |
| CHA_SEASON_ADJUST | Seasonality Adjuster | Azure Function | 30s |
| CHA_FREQ_CROSS | Cross-Channel Frequency Manager | Azure Function | 45s |

### KB File Specification

**File:** `release/v6.0/agents/cha/kb/CHA_KB_Flighting_Optimization_v1.txt`  
**Target Size:** 20,000 characters

**Content Structure:**

```
FLIGHTING PATTERN FUNDAMENTALS
- Continuous flighting definition
- Pulsing pattern strategies
- Burst/heavy-up timing
- Dark period management
- Competitive flighting response

FLIGHTING OPTIMIZATION METHODOLOGY
- Objective-to-pattern mapping
- Reach/frequency trade-offs by pattern
- Budget efficiency by flighting type
- Decay rate considerations
- Momentum maintenance strategies

DAYPART ANALYSIS
- Daypart definition standards
- Performance variation measurement
- Daypart-by-channel interaction
- Cost efficiency by daypart
- Audience availability mapping

SEASONALITY ADJUSTMENT
- Seasonal index calculation
- Category-specific patterns
- Event overlay methodology
- Weather and external factors
- Year-over-year normalization

CROSS-CHANNEL FREQUENCY MANAGEMENT
- Unified frequency measurement
- Overlap estimation methods
- Frequency cap optimization
- Diminishing returns by frequency
- Channel-specific tolerance levels
```

### AI Builder Prompts

**CHA_FLIGHT_OPTIMIZE_PROMPT.json:**
```json
{
  "prompt_code": "CHA_FLIGHT_OPTIMIZE",
  "prompt_name": "Optimize Flight Pattern",
  "model": "gpt-4",
  "system_message": "You are a media planning expert who optimizes flighting patterns. Recommend the optimal timing pattern based on objectives, budget, and competitive context.",
  "user_template": "Campaign Objectives: {{objectives}}\nBudget: {{budget}}\nDuration: {{duration}}\nChannel Mix: {{channels}}\nCompetitive Activity: {{competitive}}\n\nOptimize flighting pattern.",
  "output_format": "json",
  "output_schema": {
    "recommended_pattern": "string",
    "flight_schedule": [
      {
        "period": "string",
        "intensity": "string",
        "budget_pct": "number",
        "channels_active": ["string"]
      }
    ],
    "rationale": "string",
    "expected_reach_curve": "array",
    "alternative_patterns": ["string"]
  },
  "max_tokens": 2000,
  "temperature": 0.2
}
```

**CHA_DAYPART_ANALYZE_PROMPT.json:**
```json
{
  "prompt_code": "CHA_DAYPART_ANALYZE",
  "prompt_name": "Analyze Daypart Performance",
  "model": "gpt-4",
  "system_message": "You are a media analytics expert who analyzes performance variation by time of day and day of week. Identify optimal timing windows.",
  "user_template": "Performance Data by Daypart: {{daypart_data}}\nChannel: {{channel}}\nObjective: {{objective}}\n\nAnalyze daypart performance.",
  "output_format": "json",
  "output_schema": {
    "best_dayparts": ["string"],
    "worst_dayparts": ["string"],
    "performance_index_by_daypart": "object",
    "cost_efficiency_by_daypart": "object",
    "recommendations": ["string"],
    "budget_reallocation_opportunity": "number"
  },
  "max_tokens": 1500,
  "temperature": 0.1
}
```

**CHA_SEASON_ADJUST_PROMPT.json:**
```json
{
  "prompt_code": "CHA_SEASON_ADJUST",
  "prompt_name": "Calculate Seasonality Adjustments",
  "model": "gpt-4",
  "system_message": "You are a forecasting analyst who calculates seasonal adjustment factors. Provide indices for budget allocation and performance expectations.",
  "user_template": "Historical Data: {{historical}}\nCategory: {{category}}\nPlanning Period: {{period}}\nKey Events: {{events}}\n\nCalculate seasonal adjustments.",
  "output_format": "json",
  "output_schema": {
    "seasonal_indices": [
      {
        "period": "string",
        "index": "number",
        "driver": "string"
      }
    ],
    "peak_periods": ["string"],
    "trough_periods": ["string"],
    "event_overlays": "object",
    "budget_allocation_recommendation": "object"
  },
  "max_tokens": 1500,
  "temperature": 0.1
}
```

**CHA_FREQ_CROSS_PROMPT.json:**
```json
{
  "prompt_code": "CHA_FREQ_CROSS",
  "prompt_name": "Manage Cross-Channel Frequency",
  "model": "gpt-4",
  "system_message": "You are a media strategist who manages frequency across channels. Optimize total exposure while avoiding fatigue.",
  "user_template": "Channel Reach Data: {{reach_data}}\nCurrent Frequency Caps: {{caps}}\nOverlap Estimates: {{overlap}}\nPerformance by Frequency: {{perf_by_freq}}\n\nOptimize cross-channel frequency.",
  "output_format": "json",
  "output_schema": {
    "unified_frequency_estimate": "number",
    "optimal_frequency_target": "number",
    "recommended_caps_by_channel": "object",
    "overlap_adjusted_reach": "number",
    "fatigue_risk_assessment": "string",
    "rebalancing_recommendations": ["string"]
  },
  "max_tokens": 2000,
  "temperature": 0.2
}
```

### Azure Function Specifications

**Location:** `src/azure-functions/cha/flighting/`

| Function | Runtime | Memory | Timeout |
|----------|---------|--------|---------|
| cha-flight-optimize | Python 3.11 | 512MB | 45s |
| cha-daypart-analyze | Python 3.11 | 256MB | 30s |
| cha-season-adjust | Python 3.11 | 256MB | 30s |
| cha-freq-cross | Python 3.11 | 512MB | 45s |

### Test Scenarios

| ID | Scenario | Expected Outcome |
|----|----------|------------------|
| FT-01 | Flight optimization for awareness | Continuous/pulsing recommended |
| FT-02 | Flight optimization for promo | Burst around event recommended |
| FT-03 | Daypart analysis with clear winner | Reallocation opportunity identified |
| FT-04 | Daypart analysis with flat performance | No reallocation recommended |
| FT-05 | Seasonality with holiday peak | High index for Q4 |
| FT-06 | Cross-channel frequency high overlap | Cap reductions recommended |
| FT-07 | Cross-channel frequency low overlap | Current caps validated |
| FT-08 | Flighting with competitive burst | Counter-programming suggested |

### VS Code Tasks

1. Create Azure Function scaffolding in `src/azure-functions/cha/flighting/`
2. Implement `cha-flight-optimize` with pattern generation
3. Implement `cha-daypart-analyze` with index calculation
4. Implement `cha-season-adjust` with decomposition
5. Implement `cha-freq-cross` with overlap adjustment
6. Create Power Automate flow `CHA_Flighting_Optimization_Flow`
7. Register capabilities in eap_capability table
8. Deploy functions to Azure (personal environment)

---

## EXPANSION 15: DOCUMENT AUTOMATION SUITE

**Agent:** DOC (Document)  
**Owner:** Desktop Claude  
**VS Code:** Power Automate Flows, SharePoint Templates

### Capabilities

| Code | Name | Implementation | Timeout |
|------|------|----------------|---------|
| DOC_QBR_GENERATE | QBR Generator | AI Builder + Flow | 90s |
| DOC_RFP_RESPOND | RFP Response Assistant | AI Builder | 60s |
| DOC_COMP_REPORT | Competitive Report Generator | AI Builder + Flow | 60s |
| DOC_DECK_CREATE | Presentation Deck Creator | AI Builder + Flow | 90s |

### KB File Specification

**File:** `release/v6.0/agents/doc/kb/DOC_KB_Document_Automation_v1.txt`  
**Target Size:** 22,000 characters

**Content Structure:**

```
QUARTERLY BUSINESS REVIEW STRUCTURE
- Executive summary requirements
- Performance scorecard layout
- Trend analysis sections
- Strategic recommendations format
- Next quarter planning framework

QBR GENERATION METHODOLOGY
- Data aggregation requirements
- Narrative generation rules
- Visualization selection logic
- Insight prioritization criteria
- Action item extraction

RFP RESPONSE FRAMEWORK
- Response structure templates
- Capability mapping methodology
- Proof point selection
- Differentiation highlighting
- Compliance checklist integration

COMPETITIVE REPORT STANDARDS
- Report structure by audience
- Data visualization guidelines
- Insight density targets
- Recommendation formatting
- Confidentiality handling

PRESENTATION DECK AUTOMATION
- Slide structure templates
- Content-to-slide mapping
- Visual hierarchy rules
- Narrative flow patterns
- Appendix organization
```

### AI Builder Prompts

**DOC_QBR_GENERATE_PROMPT.json:**
```json
{
  "prompt_code": "DOC_QBR_GENERATE",
  "prompt_name": "Generate QBR Document",
  "model": "gpt-4",
  "system_message": "You are a strategic account manager who creates compelling Quarterly Business Reviews. Generate executive-ready content that highlights performance, insights, and strategic recommendations.",
  "user_template": "Performance Data: {{performance_json}}\nPrevious Quarter Goals: {{goals}}\nClient Context: {{context}}\nKey Initiatives: {{initiatives}}\n\nGenerate QBR content.",
  "output_format": "json",
  "output_schema": {
    "executive_summary": "string",
    "performance_scorecard": "object",
    "key_wins": ["string"],
    "challenges": ["string"],
    "trend_analysis": "string",
    "strategic_recommendations": [
      {
        "recommendation": "string",
        "rationale": "string",
        "expected_impact": "string",
        "priority": "string"
      }
    ],
    "next_quarter_priorities": ["string"],
    "action_items": ["string"]
  },
  "max_tokens": 4000,
  "temperature": 0.3
}
```

**DOC_RFP_RESPOND_PROMPT.json:**
```json
{
  "prompt_code": "DOC_RFP_RESPOND",
  "prompt_name": "Assist RFP Response",
  "model": "gpt-4",
  "system_message": "You are a proposal writer who crafts winning RFP responses. Map capabilities to requirements, highlight differentiators, and ensure compliance.",
  "user_template": "RFP Requirements: {{requirements_json}}\nOur Capabilities: {{capabilities_json}}\nPast Performance: {{past_perf}}\nDifferentiators: {{differentiators}}\n\nGenerate RFP response sections.",
  "output_format": "json",
  "output_schema": {
    "requirement_responses": [
      {
        "requirement_id": "string",
        "requirement_text": "string",
        "response": "string",
        "compliance_status": "string",
        "proof_points": ["string"]
      }
    ],
    "executive_summary_draft": "string",
    "differentiator_highlights": ["string"],
    "compliance_checklist": "object",
    "gaps_identified": ["string"]
  },
  "max_tokens": 4000,
  "temperature": 0.3
}
```

**DOC_COMP_REPORT_PROMPT.json:**
```json
{
  "prompt_code": "DOC_COMP_REPORT",
  "prompt_name": "Generate Competitive Report",
  "model": "gpt-4",
  "system_message": "You are a competitive intelligence analyst who creates actionable competitive reports. Structure insights for strategic decision-making.",
  "user_template": "Competitive Data: {{comp_data_json}}\nFocus Areas: {{focus}}\nAudience: {{audience}}\nTime Period: {{period}}\n\nGenerate competitive report.",
  "output_format": "json",
  "output_schema": {
    "executive_summary": "string",
    "competitive_landscape": "string",
    "competitor_profiles": [
      {
        "competitor": "string",
        "positioning": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "recent_moves": ["string"]
      }
    ],
    "strategic_implications": ["string"],
    "recommended_responses": ["string"],
    "monitoring_priorities": ["string"]
  },
  "max_tokens": 3500,
  "temperature": 0.3
}
```

**DOC_DECK_CREATE_PROMPT.json:**
```json
{
  "prompt_code": "DOC_DECK_CREATE",
  "prompt_name": "Create Presentation Deck",
  "model": "gpt-4",
  "system_message": "You are a presentation designer who structures compelling slide decks. Create slide outlines with clear narrative flow and visual recommendations.",
  "user_template": "Content Brief: {{brief}}\nKey Messages: {{messages}}\nAudience: {{audience}}\nDeck Length: {{length}}\n\nCreate deck structure.",
  "output_format": "json",
  "output_schema": {
    "deck_title": "string",
    "narrative_arc": "string",
    "slides": [
      {
        "slide_number": "number",
        "slide_title": "string",
        "slide_type": "string",
        "key_message": "string",
        "content_bullets": ["string"],
        "visual_recommendation": "string",
        "speaker_notes": "string"
      }
    ],
    "appendix_slides": ["string"]
  },
  "max_tokens": 4000,
  "temperature": 0.3
}
```

### Power Automate Flow Specifications

| Flow | Trigger | Actions |
|------|---------|---------|
| DOC_QBR_Generation_Flow | Manual/Scheduled | Aggregate data → AI Builder → Generate Word → Save to SharePoint |
| DOC_Competitive_Report_Flow | Manual | Fetch competitive data → AI Builder → Generate Word → Save |
| DOC_Deck_Creation_Flow | Manual | Get brief → AI Builder → Generate PowerPoint outline → Save |

### Test Scenarios

| ID | Scenario | Expected Outcome |
|----|----------|------------------|
| DA-01 | QBR with strong performance | Wins highlighted, recommendations focused |
| DA-02 | QBR with weak performance | Challenges addressed, recovery plan |
| DA-03 | RFP with full compliance | All requirements mapped |
| DA-04 | RFP with gaps | Gaps identified, mitigation suggested |
| DA-05 | Competitive report 5 competitors | All profiles complete |
| DA-06 | Deck creation 10 slides | Narrative flow coherent |
| DA-07 | QBR generation under 90s | Performance requirement met |
| DA-08 | RFP response with 20 requirements | All responses generated |

### VS Code Tasks

1. Create Power Automate flows for document generation
2. Create SharePoint document templates (QBR, Competitive Report)
3. Create PowerPoint template for deck generation
4. Register capabilities in eap_capability table
5. Configure flow connections to AI Builder
6. Test document generation end-to-end

---

## CAPABILITY REGISTRATION SEED DATA

**File:** `base/dataverse/seed/eap_capability_v66_seed.csv`

```csv
capability_code,capability_name,description,agent_code,input_schema,output_schema,is_active,version,timeout_default_seconds
PRF_LEARNING_EXTRACT,Extract Campaign Learnings,Extract actionable learnings from campaign performance data,PRF,"{""campaign_data"":""object"",""metrics"":""object""}","{""learnings"":""array"",""summary"":""string""}",true,1.0,60
PRF_INSIGHT_CROSS,Cross-Campaign Insights,Aggregate insights across multiple campaigns,PRF,"{""learnings_array"":""array"",""time_range"":""string""}","{""insights"":""array"",""conflicts"":""array""}",true,1.0,45
PRF_PATTERN_DETECT,Detect Performance Patterns,Identify recurring success and failure patterns,PRF,"{""historical_data"":""object"",""parameters"":""object""}","{""success_patterns"":""array"",""failure_patterns"":""array""}",true,1.0,45
PRF_PLAYBOOK_GEN,Generate Optimization Playbook,Create actionable playbooks from learnings,PRF,"{""learnings"":""array"",""patterns"":""array""}","{""playbook"":""object"",""rules"":""array""}",true,1.0,30
ANL_SOV_ANALYZE,Analyze Share of Voice,Calculate and analyze share of voice metrics,ANL,"{""brand_data"":""object"",""competitor_data"":""object""}","{""sov_summary"":""object"",""insights"":""array""}",true,1.0,45
ANL_COMP_SPEND,Estimate Competitive Spend,Estimate competitor advertising spend from signals,ANL,"{""competitor"":""string"",""signals"":""object""}","{""estimated_spend"":""number"",""confidence"":""object""}",true,1.0,60
MKT_COMP_MESSAGING,Map Competitive Messaging,Create competitive messaging positioning map,MKT,"{""brand_messaging"":""string"",""competitor_messaging"":""object""}","{""positioning_map"":""object"",""recommendations"":""array""}",true,1.0,30
MKT_COMP_GAPS,Identify White Space,Identify uncontested positioning opportunities,MKT,"{""landscape"":""object"",""capabilities"":""object""}","{""opportunities"":""array"",""gaps"":""array""}",true,1.0,30
ANL_PACE_RECOMMEND,Recommend Budget Pacing,Recommend optimal budget pacing strategy,ANL,"{""budget"":""number"",""period"":""string"",""objectives"":""array""}","{""pacing_curve"":""array"",""rationale"":""string""}",true,1.0,30
ANL_PACE_FORECAST,Forecast Budget Pacing,Forecast spend trajectory and variance,ANL,"{""plan"":""object"",""actual"":""object""}","{""trajectory"":""string"",""variance"":""number""}",true,1.0,45
ANL_SCENARIO_COMPARE,Compare Budget Scenarios,Compare multiple budget scenarios with trade-offs,ANL,"{""scenarios"":""array"",""criteria"":""object""}","{""scores"":""array"",""recommendation"":""string""}",true,1.0,60
ANL_BREAKEVEN_CALC,Calculate Break-Even,Calculate break-even point for investments,ANL,"{""investment"":""number"",""revenue"":""number"",""costs"":""object""}","{""break_even"":""object"",""sensitivity"":""object""}",true,1.0,20
AUD_COHORT_MIGRATE,Analyze Cohort Migration,Analyze how cohorts move through lifecycle stages,AUD,"{""cohort_data"":""object"",""stages"":""array""}","{""migration_matrix"":""object"",""at_risk"":""array""}",true,1.0,45
AUD_DECAY_PREDICT,Predict Audience Decay,Model audience quality decay over time,AUD,"{""audience"":""object"",""history"":""object""}","{""half_life"":""number"",""trajectory"":""array""}",true,1.0,45
AUD_REFRESH_RECOMMEND,Recommend Audience Refresh,Recommend optimal refresh strategy,AUD,"{""inventory"":""array"",""costs"":""object""}","{""schedule"":""array"",""cost_summary"":""object""}",true,1.0,30
AUD_LOOKALIKE_SCORE,Score Lookalike Quality,Validate lookalike model quality,AUD,"{""seed"":""object"",""lookalike"":""object""}","{""quality_score"":""number"",""drift"":""boolean""}",true,1.0,30
CHA_FLIGHT_OPTIMIZE,Optimize Flight Pattern,Recommend optimal flighting pattern,CHA,"{""objectives"":""array"",""budget"":""number"",""duration"":""string""}","{""pattern"":""string"",""schedule"":""array""}",true,1.0,45
CHA_DAYPART_ANALYZE,Analyze Daypart Performance,Analyze performance by time of day,CHA,"{""daypart_data"":""object"",""channel"":""string""}","{""best_dayparts"":""array"",""reallocation"":""number""}",true,1.0,30
CHA_SEASON_ADJUST,Calculate Seasonality Adjustments,Calculate seasonal adjustment factors,CHA,"{""historical"":""object"",""category"":""string""}","{""indices"":""array"",""peaks"":""array""}",true,1.0,30
CHA_FREQ_CROSS,Manage Cross-Channel Frequency,Optimize frequency across channels,CHA,"{""reach_data"":""object"",""caps"":""object""}","{""unified_freq"":""number"",""recommended_caps"":""object""}",true,1.0,45
DOC_QBR_GENERATE,Generate QBR Document,Generate Quarterly Business Review,DOC,"{""performance"":""object"",""goals"":""object""}","{""document_url"":""string"",""summary"":""string""}",true,1.0,90
DOC_RFP_RESPOND,Assist RFP Response,Generate RFP response sections,DOC,"{""requirements"":""array"",""capabilities"":""object""}","{""responses"":""array"",""gaps"":""array""}",true,1.0,60
DOC_COMP_REPORT,Generate Competitive Report,Generate competitive analysis report,DOC,"{""comp_data"":""object"",""focus"":""array""}","{""document_url"":""string"",""profiles"":""array""}",true,1.0,60
DOC_DECK_CREATE,Create Presentation Deck,Create presentation deck structure,DOC,"{""brief"":""object"",""messages"":""array""}","{""slides"":""array"",""narrative"":""string""}",true,1.0,90
```

---

## EXECUTION TIMELINE

| Day | Desktop Claude | VS Code Claude |
|-----|----------------|----------------|
| 1 | Expansion 14: PRF KB + 4 Prompts | Azure Function scaffolding (PRF learning) |
| 2 | Expansion 10: ANL KB + MKT KB + 4 Prompts | Azure Functions (PRF) + Deploy |
| 3 | Expansion 11: ANL Pacing KB + 4 Prompts | Azure Functions (ANL competitive) |
| 4 | Expansion 12: AUD Lifecycle KB + 4 Prompts | Azure Functions (ANL pacing) |
| 5 | Expansion 13: CHA Flighting KB + 4 Prompts | Azure Functions (AUD lifecycle) |
| 6 | Expansion 15: DOC Automation KB + 4 Prompts | Azure Functions (CHA flighting) |
| 7 | Test scenario creation + validation | Power Automate flows (DOC) |
| 8 | Agent instruction updates | Capability registration + E2E testing |

---

## VS CODE EXECUTION INSTRUCTIONS

### PHASE 1: AZURE FUNCTION SCAFFOLDING

```bash
# Navigate to repository
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Create directory structure for all expansions
mkdir -p src/azure-functions/prf/learning
mkdir -p src/azure-functions/anl/competitive
mkdir -p src/azure-functions/anl/pacing
mkdir -p src/azure-functions/aud/lifecycle
mkdir -p src/azure-functions/cha/flighting

# Initialize each function app
cd src/azure-functions/prf/learning
func init --python
func new --name prf-learning-extract --template "HTTP trigger"
func new --name prf-insight-cross --template "HTTP trigger"
func new --name prf-pattern-detect --template "HTTP trigger"

cd ../../../anl/competitive
func init --python
func new --name anl-sov-analyze --template "HTTP trigger"
func new --name anl-comp-spend --template "HTTP trigger"

cd ../pacing
func init --python
func new --name anl-pace-recommend --template "HTTP trigger"
func new --name anl-pace-forecast --template "HTTP trigger"
func new --name anl-scenario-compare --template "HTTP trigger"

cd ../../aud/lifecycle
func init --python
func new --name aud-cohort-migrate --template "HTTP trigger"
func new --name aud-decay-predict --template "HTTP trigger"
func new --name aud-lookalike-score --template "HTTP trigger"

cd ../../cha/flighting
func init --python
func new --name cha-flight-optimize --template "HTTP trigger"
func new --name cha-daypart-analyze --template "HTTP trigger"
func new --name cha-season-adjust --template "HTTP trigger"
func new --name cha-freq-cross --template "HTTP trigger"
```

### PHASE 2: FUNCTION IMPLEMENTATION REQUIREMENTS

Each function must implement:

1. **Input validation** - Validate JSON schema matches capability definition
2. **Core logic** - Implement calculation/analysis as specified
3. **Output formatting** - Return JSON matching output schema
4. **Error handling** - Return structured error responses
5. **Logging** - Log to Application Insights
6. **Timeout handling** - Respect timeout limits

**Standard function structure:**

```python
import logging
import json
import azure.functions as func
from datetime import datetime

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Function triggered')
    
    try:
        req_body = req.get_json()
        # Validate input
        # Execute logic
        # Format output
        result = {"status": "success", "data": output}
        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"status": "error", "message": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
```

### PHASE 3: POWER AUTOMATE FLOWS

Create these flows in Power Automate:

| Flow Name | Trigger | Key Actions |
|-----------|---------|-------------|
| PRF_Learning_Extraction_Flow | HTTP Request | Call Azure Function → Log to Dataverse |
| ANL_Competitive_Intel_Flow | HTTP Request | Call Azure Function → Cache results |
| ANL_Budget_Pacing_Flow | HTTP Request | Call Azure Function → Update session |
| AUD_Lifecycle_Management_Flow | HTTP Request | Call Azure Function → Trigger alerts |
| CHA_Flighting_Optimization_Flow | HTTP Request | Call Azure Function → Update plan |
| DOC_QBR_Generation_Flow | Manual | Aggregate data → AI Builder → Generate Word |
| DOC_Competitive_Report_Flow | Manual | Fetch data → AI Builder → Generate Word |
| DOC_Deck_Creation_Flow | Manual | Get brief → AI Builder → Generate outline |

### PHASE 4: CAPABILITY REGISTRATION

```bash
# After Desktop Claude creates the seed CSV, load to Dataverse
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify seed file exists
cat base/dataverse/seed/eap_capability_v66_seed.csv

# Use Power Platform CLI to import
pac data import --file base/dataverse/seed/eap_capability_v66_seed.csv --table eap_capability
```

### PHASE 5: DEPLOYMENT

```bash
# Deploy all function apps to Azure
cd src/azure-functions/prf/learning
func azure functionapp publish kdap-prf-learning --python

cd ../../../anl/competitive
func azure functionapp publish kdap-anl-competitive --python

cd ../pacing
func azure functionapp publish kdap-anl-pacing --python

cd ../../aud/lifecycle
func azure functionapp publish kdap-aud-lifecycle --python

cd ../../cha/flighting
func azure functionapp publish kdap-cha-flighting --python
```

### PHASE 6: VALIDATION

```bash
# Test each endpoint
curl -X POST https://kdap-prf-learning.azurewebsites.net/api/prf-learning-extract \
  -H "Content-Type: application/json" \
  -d '{"campaign_data": {...}, "metrics": {...}}'

# Verify Dataverse capabilities
pac data export --table eap_capability --output capabilities_verify.csv
```

---

## DELIVERABLE CHECKLIST

### Desktop Claude Deliverables

| # | Deliverable | Location | Status |
|---|-------------|----------|--------|
| 1 | PRF_KB_Learning_Extraction_v1.txt | release/v6.0/agents/prf/kb/ | Pending |
| 2 | ANL_KB_Competitive_Intelligence_v1.txt | release/v6.0/agents/anl/kb/ | Pending |
| 3 | MKT_KB_Competitive_Positioning_v1.txt | release/v6.0/agents/mkt/kb/ | Pending |
| 4 | ANL_KB_Budget_Pacing_v1.txt | release/v6.0/agents/anl/kb/ | Pending |
| 5 | AUD_KB_Audience_Lifecycle_v1.txt | release/v6.0/agents/aud/kb/ | Pending |
| 6 | CHA_KB_Flighting_Optimization_v1.txt | release/v6.0/agents/cha/kb/ | Pending |
| 7 | DOC_KB_Document_Automation_v1.txt | release/v6.0/agents/doc/kb/ | Pending |
| 8 | 24 AI Builder Prompt JSONs | base/platform/eap/prompts/ai_builder/ | Pending |
| 9 | eap_capability_v66_seed.csv | base/dataverse/seed/ | Pending |
| 10 | 48 Test Scenarios | base/tests/ | Pending |

### VS Code Claude Deliverables

| # | Deliverable | Location | Status |
|---|-------------|----------|--------|
| 1 | prf-learning-extract function | src/azure-functions/prf/learning/ | Pending |
| 2 | prf-insight-cross function | src/azure-functions/prf/learning/ | Pending |
| 3 | prf-pattern-detect function | src/azure-functions/prf/learning/ | Pending |
| 4 | anl-sov-analyze function | src/azure-functions/anl/competitive/ | Pending |
| 5 | anl-comp-spend function | src/azure-functions/anl/competitive/ | Pending |
| 6 | anl-pace-recommend function | src/azure-functions/anl/pacing/ | Pending |
| 7 | anl-pace-forecast function | src/azure-functions/anl/pacing/ | Pending |
| 8 | anl-scenario-compare function | src/azure-functions/anl/pacing/ | Pending |
| 9 | aud-cohort-migrate function | src/azure-functions/aud/lifecycle/ | Pending |
| 10 | aud-decay-predict function | src/azure-functions/aud/lifecycle/ | Pending |
| 11 | aud-lookalike-score function | src/azure-functions/aud/lifecycle/ | Pending |
| 12 | cha-flight-optimize function | src/azure-functions/cha/flighting/ | Pending |
| 13 | cha-daypart-analyze function | src/azure-functions/cha/flighting/ | Pending |
| 14 | cha-season-adjust function | src/azure-functions/cha/flighting/ | Pending |
| 15 | cha-freq-cross function | src/azure-functions/cha/flighting/ | Pending |
| 16 | 8 Power Automate Flows | Power Platform | Pending |
| 17 | Capability registrations | Dataverse | Pending |
| 18 | Azure deployments | Azure | Pending |

---

## SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| KB Files Created | 7 |
| AI Builder Prompts | 24 |
| Azure Functions | 15 |
| Power Automate Flows | 8 |
| Capabilities Registered | 24 |
| Test Scenarios | 48 |
| 6-Rule Compliance | 100% |
| Function Response Time | < specified timeout |
| E2E Test Pass Rate | 95%+ |

---

**Document Version:** 1.0  
**Created:** January 20, 2026  
**Branch:** deploy/mastercard  
**Next Action:** Desktop Claude begins Expansion 14 KB file
