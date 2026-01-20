# KDAP v6.6 EXPANSION BUILD PLAN

**Version:** 1.0
**Date:** January 20, 2026
**Status:** APPROVED - READY FOR EXECUTION
**Scope:** Expansions 10-15 (24 new capabilities across 6 agents)

---

## EXECUTION ORDER

| Phase | Expansion | Agent(s) | Capabilities | Owner |
|-------|-----------|----------|--------------|-------|
| 1 | 14: Learning Extraction | PRF | 4 | Desktop |
| 2 | 10: Competitive Intelligence | ANL, MKT | 4 | Desktop |
| 3 | 11: Budget Pacing | ANL | 4 | Desktop |
| 4 | 12: Audience Lifecycle | AUD | 4 | Desktop |
| 5 | 13: Flighting Optimization | CHA | 4 | Desktop |
| 6 | 15: Document Automation | DOC | 4 | Desktop |

**VS Code Responsibilities:**
- Azure Function deployment
- Power Automate flow creation
- Dataverse table updates
- Copilot Studio capability registration

---

## PHASE 1: LEARNING EXTRACTION AND INSIGHT SYNTHESIS (PRF)

### Capabilities

| Code | Name | Implementation |
|------|------|----------------|
| PRF_LEARNING_EXTRACT | Learning Extractor | AI Builder + Azure Function |
| PRF_INSIGHT_CROSS | Cross-Campaign Insights | AI Builder + Azure Function |
| PRF_PATTERN_DETECT | Pattern Detection | Azure Function |
| PRF_PLAYBOOK_GEN | Playbook Generator | AI Builder |

### Desktop Deliverables

**KB File:** PRF_KB_Learning_Extraction_v2.txt (expand existing)
- Target: 25,000 characters
- Location: release/v6.0/agents/prf/kb/

Content requirements:
- Learning extraction methodology from campaign data
- Success and failure pattern categorization taxonomy
- Cross-campaign insight aggregation rules
- Playbook generation templates and structure
- Confidence scoring for extracted learnings
- Temporal relevance decay for historical insights
- Contradictory learning resolution logic
- Integration with PRF attribution and anomaly detection

**AI Builder Prompts:** 4 JSON files
- PRF_LEARNING_EXTRACT_PROMPT.json
- PRF_INSIGHT_CROSS_PROMPT.json
- PRF_PATTERN_DETECT_PROMPT.json
- PRF_PLAYBOOK_GEN_PROMPT.json

Location: base/platform/eap/prompts/ai_builder/

**Capability Seed Data:**
- File: base/dataverse/seed/eap_capability_learning_seed.csv
- 4 records with full schema

**Test Scenarios:**
- File: base/tests/prf/learning_extraction_tests.json
- 8 test cases

### VS Code Deliverables

**Azure Functions:** 2 functions
- Location: src/azure-functions/prf/learning/

1. prf-learning-extractor
   - Input: Campaign performance data, historical learnings
   - Output: Extracted learnings with confidence scores
   - Logic: NLP pattern matching, statistical significance filtering

2. prf-pattern-detector
   - Input: Multiple campaign datasets
   - Output: Recurring patterns with frequency and impact scores
   - Logic: Time-series pattern recognition, clustering

**Power Automate Flow:** 1 flow
- Name: PRF-Learning-Aggregation-Flow
- Trigger: Scheduled (weekly) or manual
- Actions:
  - Query recent campaign data from Dataverse
  - Call prf-learning-extractor function
  - Store learnings in mpa_learning table
  - Trigger PRF_PLAYBOOK_GEN if threshold met

**Dataverse Updates:**
- New table: mpa_learning
  - mpa_learning_id (PK, GUID)
  - campaign_id (Lookup)
  - learning_type (OptionSet: Success, Failure, Insight, Pattern)
  - learning_text (Text, 2000)
  - confidence_score (Decimal)
  - source_metrics (Text, 1000)
  - created_on (DateTime)
  - is_active (Boolean)

---

## PHASE 2: COMPETITIVE INTELLIGENCE SUITE (ANL + MKT)

### Capabilities

| Code | Name | Agent | Implementation |
|------|------|-------|----------------|
| ANL_SOV_ANALYZE | Share of Voice Analysis | ANL | AI Builder + Azure Function |
| ANL_COMP_SPEND | Competitive Spend Estimation | ANL | Azure Function |
| MKT_COMP_MESSAGING | Competitive Messaging Map | MKT | AI Builder |
| MKT_COMP_GAPS | White Space Identification | MKT | AI Builder |

### Desktop Deliverables

**KB Files:** 2 files

1. ANL_KB_Competitive_Analysis_v1.txt (NEW)
   - Target: 22,000 characters
   - Location: release/v6.0/agents/anl/kb/

   Content requirements:
   - Share of Voice calculation methodologies
   - Competitive spend estimation from public signals
   - SOV to SOM correlation analysis
   - Competitive benchmarking frameworks
   - Data source quality assessment
   - Confidence intervals for estimates
   - Trend detection in competitive positioning
   - Integration with budget optimization

2. MKT_KB_Competitive_Intelligence_v1.txt (NEW)
   - Target: 20,000 characters
   - Location: release/v6.0/agents/mkt/kb/

   Content requirements:
   - Competitive messaging analysis framework
   - Positioning map methodology (perceptual mapping)
   - White space identification process
   - Message differentiation scoring
   - Competitive content audit structure
   - Gap analysis between brand and competitors
   - Opportunity prioritization matrix
   - Integration with brand positioning

**AI Builder Prompts:** 4 JSON files
- ANL_SOV_ANALYZE_PROMPT.json
- ANL_COMP_SPEND_PROMPT.json
- MKT_COMP_MESSAGING_PROMPT.json
- MKT_COMP_GAPS_PROMPT.json

Location: base/platform/eap/prompts/ai_builder/

**Capability Seed Data:**
- File: base/dataverse/seed/eap_capability_competitive_seed.csv
- 4 records

**Test Scenarios:**
- File: base/tests/competitive/competitive_intelligence_tests.json
- 8 test cases

### VS Code Deliverables

**Azure Functions:** 2 functions
- Location: src/azure-functions/anl/competitive/

1. anl-sov-calculator
   - Input: Brand mention data, category data, time period
   - Output: SOV percentages, trend direction, confidence
   - Logic: Volume aggregation, normalization, trend analysis

2. anl-comp-spend-estimator
   - Input: Competitive signals (ad impressions, placements, frequency)
   - Output: Estimated spend ranges with confidence intervals
   - Logic: Regression from known benchmarks, range estimation

**Power Automate Flow:** 1 flow
- Name: ANL-Competitive-Monitor-Flow
- Trigger: Scheduled (daily)
- Actions:
  - Fetch competitive data from configured sources
  - Call anl-sov-calculator
  - Store results in mpa_competitive_intel table
  - Alert if significant SOV change detected

**Dataverse Updates:**
- New table: mpa_competitive_intel
  - mpa_competitive_intel_id (PK, GUID)
  - competitor_name (Text, 200)
  - metric_type (OptionSet: SOV, SpendEstimate, Messaging, Position)
  - metric_value (Decimal)
  - confidence_level (OptionSet: High, Medium, Low)
  - period_start (DateTime)
  - period_end (DateTime)
  - data_source (Text, 500)
  - created_on (DateTime)

---

## PHASE 3: BUDGET PACING AND SCENARIO ENGINE (ANL)

### Capabilities

| Code | Name | Implementation |
|------|------|----------------|
| ANL_PACE_RECOMMEND | Pacing Recommendations | AI Builder + Azure Function |
| ANL_PACE_FORECAST | Spend Trajectory Forecast | Azure Function |
| ANL_SCENARIO_COMPARE | Scenario Comparison | AI Builder + Azure Function |
| ANL_BREAKEVEN_CALC | Break-Even Calculator | Azure Function |

### Desktop Deliverables

**KB File:** ANL_KB_Budget_Pacing_v1.txt (NEW)
- Target: 24,000 characters
- Location: release/v6.0/agents/anl/kb/

Content requirements:
- Pacing strategy fundamentals (linear, front-loaded, back-loaded, S-curve)
- Pacing recommendation logic based on objectives
- Spend trajectory forecasting methodology
- Variance detection and correction recommendations
- Scenario modeling framework (base, optimistic, pessimistic)
- Multi-scenario comparison with trade-off analysis
- Break-even analysis formulas and interpretation
- Payback period calculations
- Sensitivity analysis for key assumptions
- Integration with budget allocation and forecasting

**AI Builder Prompts:** 4 JSON files
- ANL_PACE_RECOMMEND_PROMPT.json
- ANL_PACE_FORECAST_PROMPT.json
- ANL_SCENARIO_COMPARE_PROMPT.json
- ANL_BREAKEVEN_CALC_PROMPT.json

Location: base/platform/eap/prompts/ai_builder/

**Capability Seed Data:**
- File: base/dataverse/seed/eap_capability_pacing_seed.csv
- 4 records

**Test Scenarios:**
- File: base/tests/anl/budget_pacing_tests.json
- 8 test cases

### VS Code Deliverables

**Azure Functions:** 3 functions
- Location: src/azure-functions/anl/pacing/

1. anl-pace-forecaster
   - Input: Budget, start date, end date, pacing strategy, current spend
   - Output: Daily/weekly projected spend, variance from plan
   - Logic: Time-series projection with strategy curves

2. anl-scenario-engine
   - Input: Base assumptions, variation ranges, metrics to compare
   - Output: Scenario matrix with outcomes and trade-offs
   - Logic: Monte Carlo simulation, sensitivity tables

3. anl-breakeven-calculator
   - Input: Fixed costs, variable costs, revenue assumptions
   - Output: Break-even point, payback period, sensitivity
   - Logic: Financial modeling formulas

**Power Automate Flow:** 1 flow
- Name: ANL-Pacing-Monitor-Flow
- Trigger: Scheduled (daily)
- Actions:
  - Query current spend vs plan from Dataverse
  - Call anl-pace-forecaster
  - Calculate variance percentage
  - Alert if variance exceeds threshold
  - Store pacing snapshot

**Dataverse Updates:**
- New table: mpa_pacing_snapshot
  - mpa_pacing_snapshot_id (PK, GUID)
  - campaign_id (Lookup)
  - snapshot_date (DateTime)
  - planned_spend_to_date (Currency)
  - actual_spend_to_date (Currency)
  - variance_pct (Decimal)
  - forecast_end_spend (Currency)
  - pacing_status (OptionSet: OnTrack, Underpacing, Overpacing)
  - recommendation (Text, 1000)

---

## PHASE 4: AUDIENCE LIFECYCLE MANAGEMENT (AUD)

### Capabilities

| Code | Name | Implementation |
|------|------|----------------|
| AUD_COHORT_MIGRATE | Cohort Migration Analysis | Azure Function |
| AUD_DECAY_PREDICT | Audience Decay Prediction | Azure Function |
| AUD_REFRESH_RECOMMEND | Refresh Frequency Optimizer | AI Builder |
| AUD_LOOKALIKE_SCORE | Lookalike Quality Scorer | Azure Function |

### Desktop Deliverables

**KB File:** AUD_KB_Lifecycle_Management_v1.txt (NEW)
- Target: 23,000 characters
- Location: release/v6.0/agents/aud/kb/

Content requirements:
- Audience lifecycle stages and transitions
- Cohort migration analysis methodology
- Audience decay curves and half-life estimation
- Freshness scoring framework
- Optimal refresh frequency determination
- Lookalike model quality validation metrics
- Seed audience health assessment
- Match rate degradation patterns
- Reactivation vs acquisition trade-offs
- Integration with propensity and segmentation

**AI Builder Prompts:** 4 JSON files
- AUD_COHORT_MIGRATE_PROMPT.json
- AUD_DECAY_PREDICT_PROMPT.json
- AUD_REFRESH_RECOMMEND_PROMPT.json
- AUD_LOOKALIKE_SCORE_PROMPT.json

Location: base/platform/eap/prompts/ai_builder/

**Capability Seed Data:**
- File: base/dataverse/seed/eap_capability_lifecycle_seed.csv
- 4 records

**Test Scenarios:**
- File: base/tests/aud/lifecycle_management_tests.json
- 8 test cases

### VS Code Deliverables

**Azure Functions:** 3 functions
- Location: src/azure-functions/aud/lifecycle/

1. aud-cohort-analyzer
   - Input: Cohort definitions, time periods, transition events
   - Output: Migration matrix, graduation rates, churn rates
   - Logic: State transition analysis, survival curves

2. aud-decay-predictor
   - Input: Audience creation date, historical match rates, segment type
   - Output: Decay curve, half-life estimate, refresh urgency score
   - Logic: Exponential decay fitting, segment-specific parameters

3. aud-lookalike-validator
   - Input: Seed audience profile, lookalike audience profile, performance data
   - Output: Quality score, drift metrics, expansion recommendations
   - Logic: Distribution comparison, performance correlation

**Power Automate Flow:** 1 flow
- Name: AUD-Lifecycle-Monitor-Flow
- Trigger: Scheduled (weekly)
- Actions:
  - Query all active audiences from Dataverse
  - Call aud-decay-predictor for each
  - Flag audiences below freshness threshold
  - Generate refresh recommendations
  - Store lifecycle snapshots

**Dataverse Updates:**
- New table: mpa_audience_lifecycle
  - mpa_audience_lifecycle_id (PK, GUID)
  - audience_id (Lookup)
  - snapshot_date (DateTime)
  - freshness_score (Decimal)
  - estimated_decay_pct (Decimal)
  - days_until_refresh (Integer)
  - quality_trend (OptionSet: Improving, Stable, Declining)
  - recommendation (Text, 500)

---

## PHASE 5: FLIGHTING AND TIMING OPTIMIZATION (CHA)

### Capabilities

| Code | Name | Implementation |
|------|------|----------------|
| CHA_FLIGHT_OPTIMIZE | Flighting Pattern Optimizer | AI Builder + Azure Function |
| CHA_DAYPART_ANALYZE | Daypart Performance Analyzer | Azure Function |
| CHA_SEASONALITY_ADJUST | Seasonality Adjuster | Azure Function |
| CHA_FREQ_CROSS | Cross-Channel Frequency Manager | AI Builder |

### Desktop Deliverables

**KB File:** CHA_KB_Flighting_Optimization_v1.txt (NEW)
- Target: 22,000 characters
- Location: release/v6.0/agents/cha/kb/

Content requirements:
- Flighting pattern types and when to use each
- Continuous vs pulsing vs bursting strategies
- Daypart optimization methodology
- Day-of-week performance patterns by channel
- Seasonality detection and adjustment
- Holiday and event planning considerations
- Cross-channel frequency capping logic
- Recency and frequency trade-offs
- Wear-out detection and mitigation
- Integration with response curves and budget allocation

**AI Builder Prompts:** 4 JSON files
- CHA_FLIGHT_OPTIMIZE_PROMPT.json
- CHA_DAYPART_ANALYZE_PROMPT.json
- CHA_SEASONALITY_ADJUST_PROMPT.json
- CHA_FREQ_CROSS_PROMPT.json

Location: base/platform/eap/prompts/ai_builder/

**Capability Seed Data:**
- File: base/dataverse/seed/eap_capability_flighting_seed.csv
- 4 records

**Test Scenarios:**
- File: base/tests/cha/flighting_optimization_tests.json
- 8 test cases

### VS Code Deliverables

**Azure Functions:** 3 functions
- Location: src/azure-functions/cha/flighting/

1. cha-flight-optimizer
   - Input: Campaign duration, budget, objectives, historical patterns
   - Output: Recommended flight schedule, spend by period
   - Logic: Optimization against objective function with constraints

2. cha-daypart-analyzer
   - Input: Performance data by hour/day, channel
   - Output: Heatmap scores, optimal windows, avoid windows
   - Logic: Statistical analysis, index calculations

3. cha-seasonality-adjuster
   - Input: Historical performance, forecast period, baseline
   - Output: Seasonal adjustment factors, adjusted forecasts
   - Logic: Decomposition, index application

**Power Automate Flow:** 1 flow
- Name: CHA-Flighting-Recommendation-Flow
- Trigger: On campaign creation
- Actions:
  - Get campaign parameters
  - Retrieve historical seasonality data
  - Call cha-flight-optimizer
  - Store recommended schedule
  - Notify planner

**Dataverse Updates:**
- New table: mpa_flight_schedule
  - mpa_flight_schedule_id (PK, GUID)
  - campaign_id (Lookup)
  - channel_code (Text, 50)
  - period_start (DateTime)
  - period_end (DateTime)
  - period_budget (Currency)
  - period_weight (Decimal)
  - flight_type (OptionSet: Continuous, Pulse, Burst, Dark)
  - daypart_preference (Text, 200)

---

## PHASE 6: DOCUMENT AUTOMATION SUITE (DOC)

### Capabilities

| Code | Name | Implementation |
|------|------|----------------|
| DOC_QBR_GENERATE | QBR Generator | AI Builder |
| DOC_RFP_RESPOND | RFP Response Assistant | AI Builder |
| DOC_COMP_REPORT | Competitive Report Generator | AI Builder |
| DOC_DECK_CREATE | Presentation Deck Creator | AI Builder + Power Automate |

### Desktop Deliverables

**KB File:** DOC_KB_Document_Automation_v1.txt (NEW)
- Target: 25,000 characters
- Location: release/v6.0/agents/doc/kb/

Content requirements:
- QBR structure and content requirements
- QBR data aggregation logic
- RFP response best practices
- RFP content library organization
- Competitive report structure
- Data visualization selection rules
- Presentation deck architecture
- Slide type templates and when to use
- Executive summary generation rules
- Appendix and supporting materials organization
- Brand compliance for documents
- Integration with session data and learnings

**AI Builder Prompts:** 4 JSON files
- DOC_QBR_GENERATE_PROMPT.json
- DOC_RFP_RESPOND_PROMPT.json
- DOC_COMP_REPORT_PROMPT.json
- DOC_DECK_CREATE_PROMPT.json

Location: base/platform/eap/prompts/ai_builder/

**Capability Seed Data:**
- File: base/dataverse/seed/eap_capability_document_seed.csv
- 4 records

**Test Scenarios:**
- File: base/tests/doc/document_automation_tests.json
- 8 test cases

### VS Code Deliverables

**Power Automate Flows:** 3 flows

1. DOC-QBR-Generation-Flow
   - Trigger: Manual or scheduled (quarterly)
   - Actions:
     - Aggregate performance data for period
     - Call DOC_QBR_GENERATE prompt
     - Generate Word document
     - Store in SharePoint
     - Notify stakeholders

2. DOC-RFP-Response-Flow
   - Trigger: Manual with RFP document upload
   - Actions:
     - Parse RFP requirements
     - Match to content library
     - Call DOC_RFP_RESPOND prompt for gaps
     - Assemble response document
     - Route for review

3. DOC-Deck-Creation-Flow
   - Trigger: Manual with parameters
   - Actions:
     - Gather session data and learnings
     - Call DOC_DECK_CREATE prompt
     - Generate PowerPoint structure
     - Populate with data and charts
     - Store and notify

**Dataverse Updates:**
- New table: mpa_document_template
  - mpa_document_template_id (PK, GUID)
  - template_name (Text, 200)
  - template_type (OptionSet: QBR, RFP, CompReport, Deck, Brief)
  - template_url (Text, 500)
  - required_data_fields (Text, 2000)
  - is_active (Boolean)

- New table: mpa_document_generated
  - mpa_document_generated_id (PK, GUID)
  - template_id (Lookup)
  - session_id (Lookup)
  - document_url (Text, 500)
  - generated_on (DateTime)
  - generated_by (Lookup to user)
  - status (OptionSet: Draft, Review, Final)

---

## FILE LOCATIONS SUMMARY

### KB Files (6 new)

```
release/v6.0/agents/prf/kb/PRF_KB_Learning_Extraction_v2.txt
release/v6.0/agents/anl/kb/ANL_KB_Competitive_Analysis_v1.txt
release/v6.0/agents/mkt/kb/MKT_KB_Competitive_Intelligence_v1.txt
release/v6.0/agents/anl/kb/ANL_KB_Budget_Pacing_v1.txt
release/v6.0/agents/aud/kb/AUD_KB_Lifecycle_Management_v1.txt
release/v6.0/agents/cha/kb/CHA_KB_Flighting_Optimization_v1.txt
release/v6.0/agents/doc/kb/DOC_KB_Document_Automation_v1.txt
```

### AI Builder Prompts (24 new)

```
base/platform/eap/prompts/ai_builder/PRF_LEARNING_EXTRACT_PROMPT.json
base/platform/eap/prompts/ai_builder/PRF_INSIGHT_CROSS_PROMPT.json
base/platform/eap/prompts/ai_builder/PRF_PATTERN_DETECT_PROMPT.json
base/platform/eap/prompts/ai_builder/PRF_PLAYBOOK_GEN_PROMPT.json
base/platform/eap/prompts/ai_builder/ANL_SOV_ANALYZE_PROMPT.json
base/platform/eap/prompts/ai_builder/ANL_COMP_SPEND_PROMPT.json
base/platform/eap/prompts/ai_builder/MKT_COMP_MESSAGING_PROMPT.json
base/platform/eap/prompts/ai_builder/MKT_COMP_GAPS_PROMPT.json
base/platform/eap/prompts/ai_builder/ANL_PACE_RECOMMEND_PROMPT.json
base/platform/eap/prompts/ai_builder/ANL_PACE_FORECAST_PROMPT.json
base/platform/eap/prompts/ai_builder/ANL_SCENARIO_COMPARE_PROMPT.json
base/platform/eap/prompts/ai_builder/ANL_BREAKEVEN_CALC_PROMPT.json
base/platform/eap/prompts/ai_builder/AUD_COHORT_MIGRATE_PROMPT.json
base/platform/eap/prompts/ai_builder/AUD_DECAY_PREDICT_PROMPT.json
base/platform/eap/prompts/ai_builder/AUD_REFRESH_RECOMMEND_PROMPT.json
base/platform/eap/prompts/ai_builder/AUD_LOOKALIKE_SCORE_PROMPT.json
base/platform/eap/prompts/ai_builder/CHA_FLIGHT_OPTIMIZE_PROMPT.json
base/platform/eap/prompts/ai_builder/CHA_DAYPART_ANALYZE_PROMPT.json
base/platform/eap/prompts/ai_builder/CHA_SEASONALITY_ADJUST_PROMPT.json
base/platform/eap/prompts/ai_builder/CHA_FREQ_CROSS_PROMPT.json
base/platform/eap/prompts/ai_builder/DOC_QBR_GENERATE_PROMPT.json
base/platform/eap/prompts/ai_builder/DOC_RFP_RESPOND_PROMPT.json
base/platform/eap/prompts/ai_builder/DOC_COMP_REPORT_PROMPT.json
base/platform/eap/prompts/ai_builder/DOC_DECK_CREATE_PROMPT.json
```

### Capability Seed Files (6 new)

```
base/dataverse/seed/eap_capability_learning_seed.csv
base/dataverse/seed/eap_capability_competitive_seed.csv
base/dataverse/seed/eap_capability_pacing_seed.csv
base/dataverse/seed/eap_capability_lifecycle_seed.csv
base/dataverse/seed/eap_capability_flighting_seed.csv
base/dataverse/seed/eap_capability_document_seed.csv
```

### Azure Functions (14 new)

```
src/azure-functions/prf/learning/prf-learning-extractor/
src/azure-functions/prf/learning/prf-pattern-detector/
src/azure-functions/anl/competitive/anl-sov-calculator/
src/azure-functions/anl/competitive/anl-comp-spend-estimator/
src/azure-functions/anl/pacing/anl-pace-forecaster/
src/azure-functions/anl/pacing/anl-scenario-engine/
src/azure-functions/anl/pacing/anl-breakeven-calculator/
src/azure-functions/aud/lifecycle/aud-cohort-analyzer/
src/azure-functions/aud/lifecycle/aud-decay-predictor/
src/azure-functions/aud/lifecycle/aud-lookalike-validator/
src/azure-functions/cha/flighting/cha-flight-optimizer/
src/azure-functions/cha/flighting/cha-daypart-analyzer/
src/azure-functions/cha/flighting/cha-seasonality-adjuster/
```

### Power Automate Flows (8 new)

```
PRF-Learning-Aggregation-Flow
ANL-Competitive-Monitor-Flow
ANL-Pacing-Monitor-Flow
AUD-Lifecycle-Monitor-Flow
CHA-Flighting-Recommendation-Flow
DOC-QBR-Generation-Flow
DOC-RFP-Response-Flow
DOC-Deck-Creation-Flow
```

### Dataverse Tables (8 new)

```
mpa_learning
mpa_competitive_intel
mpa_pacing_snapshot
mpa_audience_lifecycle
mpa_flight_schedule
mpa_document_template
mpa_document_generated
```

### Test Files (6 new)

```
base/tests/prf/learning_extraction_tests.json
base/tests/competitive/competitive_intelligence_tests.json
base/tests/anl/budget_pacing_tests.json
base/tests/aud/lifecycle_management_tests.json
base/tests/cha/flighting_optimization_tests.json
base/tests/doc/document_automation_tests.json
```

---

## 6-RULE COMPLIANCE CHECKLIST

All KB files MUST pass:

1. ALL-CAPS HEADERS - Section headers uppercase
2. HYPHENS-ONLY LISTS - No bullets or numbers
3. ASCII CHARACTERS ONLY - No smart quotes or special characters
4. ZERO VISUAL DEPENDENCIES - No tables or diagrams
5. MANDATORY LANGUAGE - Use must, always, never
6. PROFESSIONAL TONE - Direct, no hedging

Validation command:
```bash
grep -P '[–�—""'']' filename.txt  # Should return nothing
```

---

## EXECUTION TIMELINE

| Phase | Start | Desktop Complete | VS Code Complete |
|-------|-------|------------------|------------------|
| 1 | Immediate | +2 hours | +4 hours |
| 2 | Phase 1 done | +2 hours | +4 hours |
| 3 | Phase 2 done | +2 hours | +3 hours |
| 4 | Phase 3 done | +2 hours | +4 hours |
| 5 | Phase 4 done | +2 hours | +3 hours |
| 6 | Phase 5 done | +2 hours | +4 hours |

**Total Estimated Time:** 12 hours Desktop, 22 hours VS Code

---

## SUCCESS METRICS

| Metric | Target |
|--------|--------|
| KB Files Created | 7 |
| AI Builder Prompts | 24 |
| Azure Functions | 14 |
| Power Automate Flows | 8 |
| Dataverse Tables | 8 |
| Capabilities Registered | 24 |
| Test Scenarios | 48 |
| 6-Rule Compliance | 100% |

---

## DESKTOP EXECUTION INSTRUCTIONS

For each phase:

1. Create KB file with full content (no placeholders)
2. Validate 6-Rule compliance
3. Create all AI Builder prompt JSON files
4. Create capability seed CSV
5. Create test scenarios JSON
6. Commit all files to git
7. Push to deploy/mastercard
8. Provide download link
9. Move to next phase

Commit message format:
```
feat(agent): Add Expansion N - Description
```

---

## VS CODE EXECUTION INSTRUCTIONS

### PHASE 1: Learning Extraction (PRF)

```bash
# 1. Create Azure Function directories
mkdir -p src/azure-functions/prf/learning/prf-learning-extractor
mkdir -p src/azure-functions/prf/learning/prf-pattern-detector

# 2. Create function files for prf-learning-extractor
# - function.json (HTTP trigger, POST)
# - __init__.py (Python handler)
# - requirements.txt (dependencies)

# 3. Create function files for prf-pattern-detector
# - function.json
# - __init__.py
# - requirements.txt

# 4. Create Dataverse table: mpa_learning
# Use pac CLI or manual creation in make.powerapps.com
# Schema:
#   mpa_learning_id: GUID (PK)
#   campaign_id: Lookup (mpa_campaign)
#   learning_type: OptionSet (Success=1, Failure=2, Insight=3, Pattern=4)
#   learning_text: Text (2000)
#   confidence_score: Decimal (0-1)
#   source_metrics: Text (1000)
#   created_on: DateTime
#   is_active: Boolean

# 5. Create Power Automate flow: PRF-Learning-Aggregation-Flow
# Trigger: Recurrence (Weekly, Monday 6AM)
# Actions:
#   - List rows from mpa_campaign (filter: status = Complete, modified > 7 days ago)
#   - For each campaign:
#     - HTTP POST to prf-learning-extractor with campaign data
#     - Parse JSON response
#     - Create row in mpa_learning for each extracted learning
#   - Condition: If learnings count > 5
#     - HTTP POST to PRF_PLAYBOOK_GEN AI Builder prompt
#     - Store playbook result

# 6. Register capabilities in eap_capability table
# Import from: base/dataverse/seed/eap_capability_learning_seed.csv

# 7. Deploy functions to Azure
cd src/azure-functions/prf/learning
func azure functionapp publish kdap-functions --python

# 8. Test endpoint
curl -X POST https://kdap-functions.azurewebsites.net/api/prf-learning-extractor \
  -H "Content-Type: application/json" \
  -d '{"campaign_id": "test", "performance_data": {}}'
```

### PHASE 2: Competitive Intelligence (ANL + MKT)

```bash
# 1. Create Azure Function directories
mkdir -p src/azure-functions/anl/competitive/anl-sov-calculator
mkdir -p src/azure-functions/anl/competitive/anl-comp-spend-estimator

# 2. Create function files for anl-sov-calculator
# Input schema:
#   brand_mentions: array of {source, count, date}
#   category_mentions: array of {source, count, date}
#   time_period: {start, end}
# Output schema:
#   sov_percentage: decimal
#   trend: string (up/down/stable)
#   confidence: decimal
#   breakdown_by_source: array

# 3. Create function files for anl-comp-spend-estimator
# Input schema:
#   competitor: string
#   signals: array of {channel, impressions, placements, frequency}
#   benchmarks: object of CPM ranges by channel
# Output schema:
#   spend_estimate_low: currency
#   spend_estimate_mid: currency
#   spend_estimate_high: currency
#   confidence: decimal
#   methodology: string

# 4. Create Dataverse table: mpa_competitive_intel
# Schema:
#   mpa_competitive_intel_id: GUID (PK)
#   competitor_name: Text (200)
#   metric_type: OptionSet (SOV=1, SpendEstimate=2, Messaging=3, Position=4)
#   metric_value: Decimal
#   confidence_level: OptionSet (High=1, Medium=2, Low=3)
#   period_start: DateTime
#   period_end: DateTime
#   data_source: Text (500)
#   created_on: DateTime

# 5. Create Power Automate flow: ANL-Competitive-Monitor-Flow
# Trigger: Recurrence (Daily, 7AM)
# Actions:
#   - Get competitive data sources from configuration
#   - For each competitor:
#     - HTTP POST to anl-sov-calculator
#     - Create/update row in mpa_competitive_intel
#   - Condition: If SOV change > 5%
#     - Send Teams notification to configured channel

# 6. Register capabilities
# Import from: base/dataverse/seed/eap_capability_competitive_seed.csv

# 7. Deploy and test
func azure functionapp publish kdap-functions --python
```

### PHASE 3: Budget Pacing (ANL)

```bash
# 1. Create Azure Function directories
mkdir -p src/azure-functions/anl/pacing/anl-pace-forecaster
mkdir -p src/azure-functions/anl/pacing/anl-scenario-engine
mkdir -p src/azure-functions/anl/pacing/anl-breakeven-calculator

# 2. Create anl-pace-forecaster
# Input: budget, start_date, end_date, pacing_strategy, current_spend, current_date
# Output: daily_forecast[], cumulative_forecast[], variance_from_plan, recommendation

# 3. Create anl-scenario-engine
# Input: base_assumptions{}, variations[], metrics_to_compare[]
# Output: scenarios[], comparison_matrix, sensitivity_analysis

# 4. Create anl-breakeven-calculator
# Input: fixed_costs, variable_cost_per_unit, revenue_per_unit, investment_amount
# Output: breakeven_units, breakeven_revenue, payback_periods, sensitivity{}

# 5. Create Dataverse table: mpa_pacing_snapshot
# Schema per build plan above

# 6. Create Power Automate flow: ANL-Pacing-Monitor-Flow
# Trigger: Recurrence (Daily)
# Monitor all active campaigns for pacing variance

# 7. Register capabilities and deploy
```

### PHASE 4: Audience Lifecycle (AUD)

```bash
# 1. Create Azure Function directories
mkdir -p src/azure-functions/aud/lifecycle/aud-cohort-analyzer
mkdir -p src/azure-functions/aud/lifecycle/aud-decay-predictor
mkdir -p src/azure-functions/aud/lifecycle/aud-lookalike-validator

# 2. Create aud-cohort-analyzer
# Input: cohort_definitions[], time_periods[], transition_events[]
# Output: migration_matrix, graduation_rates, churn_rates, survival_curve

# 3. Create aud-decay-predictor
# Input: audience_id, creation_date, historical_match_rates[], segment_type
# Output: decay_curve[], half_life_days, current_freshness_score, refresh_urgency

# 4. Create aud-lookalike-validator
# Input: seed_profile{}, lookalike_profile{}, performance_data{}
# Output: quality_score, drift_metrics{}, expansion_recommendation

# 5. Create Dataverse table: mpa_audience_lifecycle
# Schema per build plan above

# 6. Create Power Automate flow: AUD-Lifecycle-Monitor-Flow
# Trigger: Recurrence (Weekly)
# Scan all audiences, flag those needing refresh

# 7. Register capabilities and deploy
```

### PHASE 5: Flighting Optimization (CHA)

```bash
# 1. Create Azure Function directories
mkdir -p src/azure-functions/cha/flighting/cha-flight-optimizer
mkdir -p src/azure-functions/cha/flighting/cha-daypart-analyzer
mkdir -p src/azure-functions/cha/flighting/cha-seasonality-adjuster

# 2. Create cha-flight-optimizer
# Input: duration_days, total_budget, objective, historical_patterns[]
# Output: flight_schedule[], period_budgets[], rationale

# 3. Create cha-daypart-analyzer
# Input: performance_by_hour[], channel
# Output: heatmap_scores[][], optimal_windows[], avoid_windows[]

# 4. Create cha-seasonality-adjuster
# Input: historical_data[], forecast_period, baseline
# Output: seasonal_factors[], adjusted_forecast[]

# 5. Create Dataverse table: mpa_flight_schedule
# Schema per build plan above

# 6. Create Power Automate flow: CHA-Flighting-Recommendation-Flow
# Trigger: When campaign created
# Auto-generate recommended flight schedule

# 7. Register capabilities and deploy
```

### PHASE 6: Document Automation (DOC)

```bash
# 1. No new Azure Functions needed (all AI Builder)

# 2. Create Dataverse tables:
#    - mpa_document_template
#    - mpa_document_generated
# Schemas per build plan above

# 3. Create Power Automate flows:

# DOC-QBR-Generation-Flow
# Trigger: Manual or Scheduled (Quarterly)
# Actions:
#   - Get date range parameters
#   - Query performance data aggregates
#   - Query learnings from mpa_learning
#   - Call DOC_QBR_GENERATE AI Builder prompt
#   - Create Word document using Word Online connector
#   - Save to SharePoint
#   - Create row in mpa_document_generated
#   - Send notification

# DOC-RFP-Response-Flow
# Trigger: Manual with file upload
# Actions:
#   - Parse uploaded RFP (PDF/Word)
#   - Extract requirements
#   - Query content library for matches
#   - Call DOC_RFP_RESPOND for gaps
#   - Assemble response document
#   - Save draft for review

# DOC-Deck-Creation-Flow
# Trigger: Manual with parameters
# Actions:
#   - Get session_id parameter
#   - Query session data
#   - Query related learnings
#   - Call DOC_DECK_CREATE prompt
#   - Create PowerPoint using Office connector
#   - Populate slides
#   - Save and notify

# 4. Register capabilities
# Import from: base/dataverse/seed/eap_capability_document_seed.csv

# 5. Upload document templates to SharePoint
# Location: /sites/KDAP/DocumentTemplates/
# Templates needed:
#   - QBR_Template_v1.docx
#   - RFP_Response_Template_v1.docx
#   - Competitive_Report_Template_v1.docx
#   - Presentation_Deck_Template_v1.pptx
```

---

## VALIDATION CHECKLIST

After all phases complete:

```bash
# 1. Verify KB files exist and pass compliance
for f in release/v6.0/agents/*/kb/*_v1.txt; do
  echo "Checking $f"
  wc -c "$f"
  grep -P '[–—""'']' "$f" && echo "FAIL: Non-ASCII" || echo "PASS"
done

# 2. Verify AI Builder prompts
ls -la base/platform/eap/prompts/ai_builder/*.json | wc -l
# Should be 69 (45 existing + 24 new)

# 3. Verify capability seeds
cat base/dataverse/seed/eap_capability_*_seed.csv | grep -v "^eap_capabilityid" | wc -l
# Should show all new capabilities

# 4. Verify Azure Functions deployed
az functionapp function list --name kdap-functions --resource-group kdap-resource-group

# 5. Verify Power Automate flows
# Manual check in make.powerapps.com

# 6. Run test suites
# Execute tests from base/tests/
```

---

## COMMIT STRATEGY

Desktop commits after each phase:
```
feat(prf): Add Expansion 14 - Learning Extraction capabilities
feat(anl,mkt): Add Expansion 10 - Competitive Intelligence capabilities
feat(anl): Add Expansion 11 - Budget Pacing capabilities
feat(aud): Add Expansion 12 - Audience Lifecycle capabilities
feat(cha): Add Expansion 13 - Flighting Optimization capabilities
feat(doc): Add Expansion 15 - Document Automation capabilities
```

VS Code commits after infrastructure:
```
feat(azure): Add Learning Extraction Azure Functions
feat(azure): Add Competitive Intelligence Azure Functions
feat(azure): Add Budget Pacing Azure Functions
feat(azure): Add Audience Lifecycle Azure Functions
feat(azure): Add Flighting Optimization Azure Functions
feat(dataverse): Add v6.6 Dataverse tables
feat(flows): Add v6.6 Power Automate flows
```

---

**Document Version:** 1.0
**Created:** January 20, 2026
**Branch:** deploy/mastercard
**Next Action:** Desktop begins Phase 1 - Learning Extraction
