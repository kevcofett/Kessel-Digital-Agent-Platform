# MASTERCARD CONSULTING & MARKETING AGENT PLATFORM (MCMAP)
# MASTERCARD DEPLOYMENT - AGENT CAPABILITIES REFERENCE

**Document:** 04-MCMAP_Agent_Capabilities.md
**Version:** 2.0
**Date:** January 31, 2026
**Classification:** Mastercard Internal
**Status:** Production Ready (v7.0)
**Audience:** Business Users, Product Owners, Engineering Teams

---

## TABLE OF CONTENTS

1. [Agent System Overview](#1-agent-system-overview)
2. [ORC - Orchestrator Agent](#2-orc---orchestrator-agent)
3. [ANL - Analytics Agent](#3-anl---analytics-agent)
4. [AUD - Audience Intelligence Agent](#4-aud---audience-intelligence-agent)
5. [CHA - Channel Strategy Agent](#5-cha---channel-strategy-agent)
6. [SPO - Supply Path Optimization Agent](#6-spo---supply-path-optimization-agent)
7. [DOC - Document Generation Agent](#7-doc---document-generation-agent)
8. [PRF - Performance Intelligence Agent](#8-prf---performance-intelligence-agent)
9. [CST - Consulting Strategy Agent](#9-cst---consulting-strategy-agent)
10. [CHG - Change Management Agent](#10-chg---change-management-agent)
11. [CA - Consulting Analysis Agent](#11-ca---consulting-analysis-agent)
12. [GHA - Growth Hacking Agent (v7.0 NEW)](#12-gha---growth-hacking-agent-v70-new)
13. [Capability Cross-Reference](#13-capability-cross-reference)
14. [Usage Examples](#14-usage-examples)

---

## 1. AGENT SYSTEM OVERVIEW

### 1.1 Agent Architecture

MCMAP employs a multi-agent architecture where specialized agents collaborate to provide comprehensive media planning and strategic consulting support:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      MCMAP AGENT ECOSYSTEM                                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                       â”‚
â”‚                        â”‚     ORC     â”‚                                       â”‚
â”‚                        â”‚ Orchestratorâ”‚                                       â”‚
â”‚                        â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜                                       â”‚
â”‚                               â”‚                                              â”‚
â”‚          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                        â”‚
â”‚          â”‚                    â”‚                    â”‚                        â”‚
â”‚          â–¼                    â–¼                    â–¼                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                 â”‚
â”‚  â”‚   MPA DOMAIN  â”‚   â”‚   CA DOMAIN   â”‚   â”‚   SUPPORT     â”‚                 â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                 â”‚
â”‚  â”‚ ANL Analytics â”‚   â”‚ CST Strategy  â”‚   â”‚ DOC Document  â”‚                 â”‚
â”‚  â”‚ AUD Audience  â”‚   â”‚ CHG Change    â”‚   â”‚ PRF Perform   â”‚                 â”‚
â”‚  â”‚ CHA Channel   â”‚   â”‚ CA  Analysis  â”‚   â”‚               â”‚                 â”‚
â”‚  â”‚ SPO Supply    â”‚   â”‚               â”‚   â”‚               â”‚                 â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                 â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 1.2 Agent Inventory Summary

| Code | Name | Domain | Primary Function | Capabilities |
|------|------|--------|------------------|--------------|
| ORC | Orchestrator | Platform | Intent routing, session management | 2 |
| ANL | Analytics | MPA | Projections, calculations, modeling | 6 |
| AUD | Audience | MPA | Segmentation, LTV, journeys | 5 |
| CHA | Channel | MPA | Channel selection, mix optimization | 3 |
| SPO | Supply Path | MPA | Programmatic optimization, fees | 3 |
| DOC | Document | Support | Document generation, export | 3 |
| PRF | Performance | Support | Attribution, anomaly detection | 4 |
| CST | Consulting | CA | Strategic frameworks, prioritization | 4 |
| CHG | Change | CA | Adoption planning, stakeholders | 3 |
| CA | Consulting | CA | Strategic analysis, business cases | 3 |
| **GHA** | **Growth Hacking** | **Growth** | **AARRR lifecycle, growth strategy** | **10** |
| **TOTAL** | | | | **46** |

### 1.3 How to Invoke Agents

Users interact with MCMAP through natural language. The Orchestrator (ORC) automatically routes requests to the appropriate specialist agent:

| User Intent | Routed To | Example Query |
|-------------|-----------|---------------|
| Budget, projections, forecasts | ANL | "Project Q2 performance for $500K spend" |
| Audience, segments, targeting | AUD | "Prioritize audience segments by LTV" |
| Channel, media mix, allocation | CHA | "Recommend channel mix for awareness" |
| Programmatic, fees, supply path | SPO | "Analyze DSP fee waterfall" |
| Documents, reports, exports | DOC | "Generate media brief document" |
| Performance, attribution | PRF | "Detect anomalies in campaign data" |
| Frameworks, strategy, analysis | CST | "Apply Porter's Five Forces" |
| Change, adoption, stakeholders | CHG | "Assess organizational readiness" |
| Business case, consulting | CA | "Create business case for initiative" |
| **Growth, AARRR, lifecycle** | **GHA** | **"Develop growth strategy for fintech app"** |

---

## 2. ORC - ORCHESTRATOR AGENT

### 2.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | ORC |
| **Full Name** | Orchestrator Agent |
| **Domain** | Platform Infrastructure |
| **Primary Function** | Intent classification, agent routing, session management |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core |

### 2.2 Responsibilities

- Classify user intent from natural language input
- Route requests to appropriate specialist agents
- Manage session state and conversation context
- Aggregate responses from multiple agents
- Validate workflow gate completion
- Log all routing decisions to telemetry

### 2.3 Capabilities

| Capability Code | Name | Description |
|-----------------|------|-------------|
| **ORC_INTENT** | Intent Classification | Analyzes user message to determine intent category and route to appropriate specialist agent |
| **ORC_VALIDATE_GATE** | Gate Validation | Validates that required workflow steps are complete before proceeding |

### 2.4 Routing Logic

```
INTENT KEYWORD MAPPING

Keywords                              â†’ Agent
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
budget, projection, forecast          â†’ ANL
calculate, model, scenario            â†’ ANL
audience, segment, target             â†’ AUD
persona, ltv, lifetime value          â†’ AUD
channel, media, mix                   â†’ CHA
allocation, spend distribution        â†’ CHA
programmatic, ssp, dsp                â†’ SPO
fee, supply path, partner             â†’ SPO
document, export, report              â†’ DOC
brief, presentation                   â†’ DOC
performance, attribution              â†’ PRF
anomaly, optimize, kpi                â†’ PRF
framework, strategy, porter           â†’ CST
prioritize, rice, moscow              â†’ CST
change, adoption, readiness           â†' CHG
stakeholder, resistance               â†' CHG
business case, consulting             â†' CA
growth, aarrr, lifecycle              â†' GHA
acquisition, retention, referral      â†' GHA
north star, viral, growth hack        â†' GHA
workflow, step, gate, help            â†' ORC (self)
```

---

## 3. ANL - ANALYTICS AGENT

### 3.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | ANL |
| **Full Name** | Analytics Agent |
| **Domain** | Media Planning Analytics |
| **Primary Function** | Projections, calculations, statistical modeling, budget optimization |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 4 Deep Modules |

### 3.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| ANL_KB_Analytics_Core_v1.txt | Core methodology, principles | ~25K chars |
| ANL_KB_MMM_Methods_v1.txt | Media Mix Modeling methodology | ~20K chars |
| ANL_KB_Bayesian_Inference_v1.txt | Bayesian priors, posteriors, uncertainty | ~18K chars |
| ANL_KB_Causal_Incrementality_v1.txt | Causal ML, lift measurement | ~20K chars |
| ANL_KB_Budget_Optimization_v1.txt | Marginal returns, response curves | ~22K chars |

### 3.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **ANL_MARGINAL_RETURN** | Calculate Marginal Return | Computes marginal return curves for budget allocation | budget, channel, historical_data | return_curve, optimal_point, confidence |
| **ANL_SCENARIO_COMPARE** | Compare Scenarios | Evaluates multiple budget allocation scenarios | scenarios[], kpis[] | comparison_matrix, recommendation |
| **ANL_PROJECTION** | Generate Projections | Creates performance projections based on inputs | budget, channels[], timeframe | projections{}, confidence_bands |
| **ANL_CONFIDENCE** | Assess Confidence | Evaluates confidence levels for estimates | estimate, data_quality, methodology | confidence_level, factors |
| **ANL_BAYESIAN** | Bayesian Inference | Applies Bayesian methods for parameter estimation | prior, likelihood, data | posterior, credible_interval |
| **ANL_CAUSAL** | Causal Analysis | Performs incrementality/causal impact analysis | treatment, control, outcome | lift, significance, confidence |

### 3.4 Example Queries

| Query | Capability Used | Sample Response |
|-------|-----------------|-----------------|
| "Project Q2 performance with $500K budget" | ANL_PROJECTION | Detailed projections by channel with confidence intervals |
| "Compare 60/40 vs 70/30 search/social split" | ANL_SCENARIO_COMPARE | Side-by-side comparison with recommendation |
| "What's the marginal return on additional search spend?" | ANL_MARGINAL_RETURN | Return curve analysis with diminishing returns point |
| "How confident should we be in these projections?" | ANL_CONFIDENCE | Confidence assessment with contributing factors |

---

## 4. AUD - AUDIENCE INTELLIGENCE AGENT

### 4.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | AUD |
| **Full Name** | Audience Intelligence Agent |
| **Domain** | Audience Strategy |
| **Primary Function** | Segmentation, targeting, LTV modeling, journey orchestration |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 4 Deep Modules |

### 4.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| AUD_KB_Audience_Core_v1.txt | Core audience methodology | ~25K chars |
| AUD_KB_Identity_Resolution_v1.txt | Graph algorithms, entity matching | ~18K chars |
| AUD_KB_LTV_Modeling_v1.txt | Cohort analysis, survival models | ~20K chars |
| AUD_KB_Propensity_ML_v1.txt | ML classifiers, scoring | ~18K chars |
| AUD_KB_Journey_Orchestration_v1.txt | State models, NBA, sequencing | ~22K chars |

### 4.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **AUD_SEGMENT_PRIORITY** | Segment Prioritization | Ranks audience segments by value potential | segments[], criteria | priority_ranking, rationale |
| **AUD_LTV_ASSESS** | LTV Assessment | Evaluates lifetime value potential | segment, behavior_data | ltv_estimate, confidence, drivers |
| **AUD_JOURNEY_STATE** | Journey State | Determines customer journey position | customer_signals | journey_stage, next_best_action |
| **AUD_PROPENSITY** | Propensity Scoring | Calculates conversion/action propensity | segment, features | propensity_score, confidence |
| **AUD_IDENTITY** | Identity Resolution | Resolves identity across touchpoints | identifiers[] | resolved_profile, match_confidence |

### 4.4 Example Queries

| Query | Capability Used | Sample Response |
|-------|-----------------|-----------------|
| "Prioritize our audience segments for Q2" | AUD_SEGMENT_PRIORITY | Ranked segments with value rationale |
| "What's the LTV potential for high-value segment?" | AUD_LTV_ASSESS | LTV estimate with confidence and drivers |
| "Where is this customer in their journey?" | AUD_JOURNEY_STATE | Journey stage with next-best-action |
| "Score this segment for conversion propensity" | AUD_PROPENSITY | Propensity score with confidence |

---

## 5. CHA - CHANNEL STRATEGY AGENT

### 5.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | CHA |
| **Full Name** | Channel Strategy Agent |
| **Domain** | Channel Planning |
| **Primary Function** | Channel selection, mix optimization, emerging channel guidance |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 3 Deep Modules |

### 5.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| CHA_KB_Channel_Core_v1.txt | Core channel methodology | ~25K chars |
| CHA_KB_Allocation_Methods_v1.txt | Budget distribution approaches | ~18K chars |
| CHA_KB_Emerging_Channels_v1.txt | AI advertising, retail media, CTV | ~20K chars |
| CHA_KB_Brand_Performance_v1.txt | Funnel balance, brand vs. activation | ~18K chars |

### 5.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **CHA_CHANNEL_MIX** | Channel Mix Optimization | Optimizes budget allocation across channels | budget, objectives, constraints | allocation{}, rationale |
| **CHA_CHANNEL_SELECT** | Channel Selection | Recommends channels for objectives | objectives, audience, budget | recommended_channels[], fit_scores |
| **CHA_EMERGING_ASSESS** | Emerging Channel Assessment | Evaluates fit of emerging channels | channel, objectives, audience | fit_assessment, risks, opportunities |

### 5.4 Example Queries

| Query | Capability Used | Sample Response |
|-------|-----------------|-----------------|
| "Recommend channel mix for $500K awareness campaign" | CHA_CHANNEL_MIX | Allocation with rationale |
| "Which channels best reach our target audience?" | CHA_CHANNEL_SELECT | Ranked channels with fit scores |
| "Should we invest in retail media networks?" | CHA_EMERGING_ASSESS | Fit assessment with risks/opportunities |

---

## 6. SPO - SUPPLY PATH OPTIMIZATION AGENT

### 6.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | SPO |
| **Full Name** | Supply Path Optimization Agent |
| **Domain** | Programmatic Media |
| **Primary Function** | Programmatic supply path analysis, fee transparency, partner evaluation |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 2 Deep Modules |

### 6.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| SPO_KB_Supply_Core_v1.txt | Core SPO methodology | ~25K chars |
| SPO_KB_Fee_Analysis_v1.txt | Fee waterfall, DSP/SSP breakdown | ~20K chars |
| SPO_KB_Partner_Evaluation_v1.txt | Vendor assessment, NBI calculation | ~18K chars |

### 6.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **SPO_FEE_WATERFALL** | Fee Waterfall Analysis | Decomposes fee structure across supply chain | spend, partners[] | fee_breakdown{}, working_media_% |
| **SPO_PARTNER_SCORE** | Partner Evaluation | Scores partner quality and value | partner, metrics | quality_score, recommendation |
| **SPO_NBI_CALCULATE** | Net Bidder Impact | Computes net bidder impact metric | bid_data, outcomes | nbi_score, interpretation |

### 6.4 Example Queries

| Query | Capability Used | Sample Response |
|-------|-----------------|-----------------|
| "Break down our programmatic fees" | SPO_FEE_WATERFALL | Fee waterfall with working media % |
| "Evaluate this DSP partner's value" | SPO_PARTNER_SCORE | Quality score with recommendation |
| "Calculate NBI for our top SSPs" | SPO_NBI_CALCULATE | NBI scores with interpretation |

---

## 7. DOC - DOCUMENT GENERATION AGENT

### 7.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | DOC |
| **Full Name** | Document Generation Agent |
| **Domain** | Output Generation |
| **Primary Function** | Document creation, template selection, export formatting |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 1 Deep Module |

### 7.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| DOC_KB_Document_Core_v1.txt | Core document methodology | ~25K chars |
| DOC_KB_Export_Formats_v1.txt | DOCX/PDF/PPTX specifications | ~15K chars |

### 7.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **DOC_GENERATE** | Generate Document | Creates document from session data | session_data, template | document_content |
| **DOC_TEMPLATE_SELECT** | Template Selection | Chooses appropriate template | document_type, context | template_id, rationale |
| **DOC_FORMAT_EXPORT** | Format Export | Exports to specified format | content, format | formatted_document |

### 7.4 Supported Document Types

| Document Type | Template | Typical Use |
|---------------|----------|-------------|
| Media Brief | MEDIA_BRIEF_v1 | Campaign planning summary |
| Media Plan | MEDIA_PLAN_v1 | Detailed media allocation |
| Performance Report | PERFORMANCE_REPORT_v1 | Campaign performance analysis |
| Business Case | BUSINESS_CASE_v1 | Investment justification |
| Executive Summary | EXEC_SUMMARY_v1 | Leadership briefing |

---

## 8. PRF - PERFORMANCE INTELLIGENCE AGENT

### 8.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | PRF |
| **Full Name** | Performance Intelligence Agent |
| **Domain** | Performance Management |
| **Primary Function** | Performance monitoring, attribution, anomaly detection |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 3 Deep Modules |

### 8.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| PRF_KB_Performance_Core_v1.txt | Core performance methodology | ~25K chars |
| PRF_KB_Attribution_Methods_v1.txt | MTA, Shapley, path analysis | ~20K chars |
| PRF_KB_Incrementality_Testing_v1.txt | Geo tests, holdouts | ~18K chars |
| PRF_KB_Anomaly_Detection_v1.txt | Statistical methods, ML detection | ~18K chars |

### 8.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **PRF_ANOMALY** | Anomaly Detection | Detects performance anomalies | metrics_data, baselines | anomalies[], severity, causes |
| **PRF_ATTRIBUTION** | Attribution Analysis | Analyzes attribution across channels | conversion_data, touchpoints | attribution{}, confidence |
| **PRF_INCREMENTALITY** | Incrementality Measurement | Measures incremental impact | test_data, control_data | lift, significance, confidence |
| **PRF_OPTIMIZE** | Optimization Recommendations | Recommends optimization actions | performance_data | recommendations[], priority |

### 8.4 Example Queries

| Query | Capability Used | Sample Response |
|-------|-----------------|-----------------|
| "Detect anomalies in last week's data" | PRF_ANOMALY | Anomalies with severity and likely causes |
| "Analyze attribution for Q1 conversions" | PRF_ATTRIBUTION | Attribution breakdown by channel |
| "What's the incremental lift from TV?" | PRF_INCREMENTALITY | Lift measurement with confidence |
| "What optimizations should we make?" | PRF_OPTIMIZE | Prioritized optimization recommendations |

---

## 9. CST - CONSULTING STRATEGY AGENT

### 9.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | CST |
| **Full Name** | Consulting Strategy Agent |
| **Domain** | Strategic Consulting |
| **Primary Function** | Strategic framework application, prioritization methods |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 3 Deep Modules |

### 9.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| CST_KB_Consulting_Core_v1.txt | Core consulting methodology | ~25K chars |
| CST_KB_Strategic_Frameworks_v1.txt | Porter's, McKinsey, BCG, etc. | ~22K chars |
| CST_KB_Prioritization_Methods_v1.txt | RICE, weighted matrix, MoSCoW | ~18K chars |
| CST_KB_Industry_Context_v1.txt | Industry-specific guidance | ~15K chars |

### 9.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **CST_FRAMEWORK_SELECT** | Framework Selection | Recommends frameworks for challenge type | challenge, context | recommended_frameworks[], rationale |
| **CST_ENGAGEMENT_GUIDE** | Engagement Guide | Guides consulting engagement phases | engagement_type | phase_guidance, deliverables |
| **CST_STRATEGIC_ANALYZE** | Strategic Analysis | Applies strategic frameworks | framework, inputs | analysis_output, insights |
| **CST_PRIORITIZE** | Prioritization | Applies prioritization methods | items[], criteria | prioritized_list, scores |

### 9.4 Supported Frameworks

| Framework | Use Case | Output |
|-----------|----------|--------|
| Porter's Five Forces | Industry competition analysis | Force analysis with strategic implications |
| McKinsey 7S | Organizational alignment | Alignment assessment with gaps |
| BCG Matrix | Portfolio analysis | Quadrant placement with recommendations |
| SWOT Analysis | Situational assessment | SWOT matrix with strategic options |
| Value Chain | Operations analysis | Value chain map with opportunities |
| PESTEL | Macro environment | Factor analysis with implications |

---

## 10. CHG - CHANGE MANAGEMENT AGENT

### 10.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | CHG |
| **Full Name** | Change Management Agent |
| **Domain** | Organizational Change |
| **Primary Function** | Change readiness, stakeholder management, adoption planning |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 2 Deep Modules |

### 10.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| CHG_KB_Change_Core_v1.txt | Core change methodology | ~25K chars |
| CHG_KB_Stakeholder_Methods_v1.txt | Stakeholder mapping and engagement | ~18K chars |
| CHG_KB_Adoption_Planning_v1.txt | Adoption planning and measurement | ~18K chars |

### 10.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **CHG_READINESS** | Readiness Assessment | Assesses organizational change readiness | organization_context | readiness_score, gaps, recommendations |
| **CHG_STAKEHOLDER** | Stakeholder Mapping | Maps stakeholders and influence | change_initiative | stakeholder_map, engagement_plan |
| **CHG_ADOPTION** | Adoption Planning | Plans adoption approach | initiative, timeline | adoption_plan, milestones, metrics |

### 10.4 Change Frameworks Supported

| Framework | Application |
|-----------|-------------|
| Kotter's 8-Step | Large-scale organizational change |
| ADKAR | Individual change management |
| Lewin's Model | Understanding change dynamics |
| Bridges Transition | Managing human side of change |

---

## 11. CA - CONSULTING ANALYSIS AGENT

### 11.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | CA |
| **Full Name** | Consulting Analysis Agent |
| **Domain** | Business Analysis |
| **Primary Function** | Business case development, strategic analysis |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 3 Deep Modules |

### 11.2 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| CA_KB_Analysis_Core_v1.txt | Core analysis methodology | ~25K chars |
| CA_KB_Business_Case_v1.txt | Business case development | ~20K chars |
| CA_KB_Financial_Analysis_v1.txt | Financial modeling guidance | ~18K chars |
| CA_KB_Recommendation_v1.txt | Recommendation formulation | ~15K chars |

### 11.3 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **CA_BUSINESS_CASE** | Business Case Development | Creates structured business case | initiative, financials | business_case_document |
| **CA_FINANCIAL_ANALYZE** | Financial Analysis | Performs financial analysis | financial_data | npv, roi, payback, sensitivity |
| **CA_RECOMMEND** | Recommendation Formulation | Formulates actionable recommendations | analysis_findings | recommendations[], rationale |

---

## 12. GHA - GROWTH HACKING AGENT (v7.0 NEW)

### 12.1 Agent Profile

| Attribute | Value |
|-----------|-------|
| **Code** | GHA |
| **Full Name** | Growth Hacking Agent (Aragorn AI) |
| **Domain** | Growth Strategy |
| **Primary Function** | AARRR lifecycle optimization, growth strategy orchestration, specialist coordination |
| **Instructions Size** | 8,000 characters |
| **KB Files** | 1 Core + 9 Deep Modules |

### 12.2 Responsibilities

- Develop comprehensive growth strategies using AARRR framework
- Define and validate North Star metrics for growth initiatives
- Coordinate with specialist agents (ANL, AUD, CHA, DOC) via ORC
- Apply behavioral psychology frameworks (Hook Model, Fogg Model)
- Design and recommend growth experiments
- Analyze competitor growth strategies (fintech/neobank focus)
- Generate growth projections with compounding effects
- Provide ICE-scored tactic recommendations by lifecycle stage

### 12.3 Knowledge Base Files

| File | Purpose | Size |
|------|---------|------|
| GHA_KB_Growth_Core_v1.txt | Core growth methodology, AARRR framework | ~25K chars |
| GHA_KB_Specialist_Requests_v1.txt | When/how to request specialist assistance | ~15K chars |
| GHA_KB_Growth_Workflows_v1.txt | Growth workflow definition, gates | ~18K chars |
| GHA_KB_Behavioral_Psychology_v1.txt | Hook Model, Fogg Model, cognitive biases | ~20K chars |
| GHA_KB_Fintech_Growth_v1.txt | Fintech/neobank growth strategies | ~22K chars |
| GHA_KB_Experiment_Design_v1.txt | A/B testing, cohort analysis methods | ~18K chars |
| GHA_KB_Growth_Metrics_v1.txt | North Star metrics, growth KPIs | ~15K chars |
| GHA_KB_Referral_Programs_v1.txt | Viral mechanics, referral design | ~18K chars |
| GHA_KB_Lifecycle_Tactics_v1.txt | Stage-specific tactics library | ~20K chars |
| GHA_KB_Competitor_Analysis_v1.txt | Competitive growth intelligence | ~15K chars |

### 12.4 Capabilities

| Capability Code | Name | Description | Input | Output |
|-----------------|------|-------------|-------|--------|
| **GHA_AARRR_ANALYZE** | AARRR Lifecycle Analysis | Analyzes customer lifecycle across Acquisition, Activation, Retention, Referral, Revenue stages | business_context, metrics | lifecycle_assessment, stage_opportunities |
| **GHA_NORTH_STAR** | North Star Definition | Defines and validates primary growth metric | business_model, objectives | north_star_metric, success_criteria |
| **GHA_FRAMEWORK_SELECT** | Growth Framework Selection | Recommends growth frameworks for context | challenge_type, industry | recommended_frameworks[], rationale |
| **GHA_TACTIC_RECOMMEND** | Tactic Recommendation | Provides ICE-scored tactics by lifecycle stage | lifecycle_stage, constraints | tactics[], ice_scores, implementation |
| **GHA_BEHAVIORAL_APPLY** | Behavioral Psychology | Applies Hook Model, Fogg Model, cognitive biases | user_journey, objectives | behavioral_triggers, design_recommendations |
| **GHA_COMPETITOR_ANALYZE** | Competitor Growth Analysis | Analyzes competitor growth strategies | competitors[], industry | competitive_insights, opportunities |
| **GHA_EXPERIMENT_DESIGN** | Experiment Design | Designs A/B tests, cohort analysis, painted door tests | hypothesis, success_metric | experiment_plan, sample_size, duration |
| **GHA_PROJECTION** | Growth Projection | Projects growth outcomes with compounding effects | baseline, tactics[], timeframe | projections{}, scenarios, confidence |
| **GHA_SPECIALIST_REQUEST** | Specialist Coordination | Requests specialist analysis via ORC | request_type, context | specialist_route, request_payload |
| **GHA_GROWTH_DOCUMENT** | Growth Plan Documentation | Generates comprehensive growth strategy documents | growth_plan_state | growth_strategy_document |

### 12.5 Supported Growth Frameworks

| Framework | Application | Output |
|-----------|-------------|--------|
| AARRR (Pirate Metrics) | Full-funnel lifecycle analysis | Stage-by-stage optimization plan |
| Hook Model | Habit-forming product design | Trigger-Action-Reward-Investment loop |
| Fogg Behavior Model | Behavior change design | Motivation-Ability-Prompt analysis |
| Growth Loops | Sustainable growth mechanics | Self-reinforcing loop design |
| Jobs-to-Be-Done (JTBD) | Customer motivation analysis | Job map with growth opportunities |
| ICE Framework | Tactic prioritization | Scored tactic backlog |

### 12.6 Cross-Agent Coordination

GHA can request specialist assistance through ORC:

| Specialist | Request Trigger | Output Used For |
|------------|-----------------|-----------------|
| ANL | Need growth projections, ROI/ROAS calculations | Quantifying growth initiatives |
| AUD | Need segment analysis, LTV tiers | Targeting growth efforts |
| CHA | Need channel recommendations | Growth channel selection |
| DOC | Need growth strategy documentation | Final deliverable generation |

### 12.7 Example Queries

| Query | Capability Used | Sample Response |
|-------|-----------------|-----------------|
| "Develop a growth strategy for our fintech app" | GHA_AARRR_ANALYZE, GHA_FRAMEWORK_SELECT | Comprehensive AARRR analysis with framework recommendations |
| "What should our North Star metric be?" | GHA_NORTH_STAR | North Star recommendation with validation criteria |
| "Design a referral program for credit card activation" | GHA_TACTIC_RECOMMEND, GHA_BEHAVIORAL_APPLY | Referral program design with behavioral triggers |
| "How do competitors like Nubank grow acquisition?" | GHA_COMPETITOR_ANALYZE | Competitive growth intelligence report |
| "Project growth impact of proposed tactics" | GHA_PROJECTION | Growth projections with scenarios |
| "Design an experiment to test onboarding flow" | GHA_EXPERIMENT_DESIGN | A/B test plan with sample size and duration |

---

## 13. CAPABILITY CROSS-REFERENCE

### 13.1 Capability by Agent

| Agent | Capability Count | Capability Codes |
|-------|------------------|------------------|
| ORC | 2 | ORC_INTENT, ORC_VALIDATE_GATE |
| ANL | 6 | ANL_MARGINAL_RETURN, ANL_SCENARIO_COMPARE, ANL_PROJECTION, ANL_CONFIDENCE, ANL_BAYESIAN, ANL_CAUSAL |
| AUD | 5 | AUD_SEGMENT_PRIORITY, AUD_LTV_ASSESS, AUD_JOURNEY_STATE, AUD_PROPENSITY, AUD_IDENTITY |
| CHA | 3 | CHA_CHANNEL_MIX, CHA_CHANNEL_SELECT, CHA_EMERGING_ASSESS |
| SPO | 3 | SPO_FEE_WATERFALL, SPO_PARTNER_SCORE, SPO_NBI_CALCULATE |
| DOC | 3 | DOC_GENERATE, DOC_TEMPLATE_SELECT, DOC_FORMAT_EXPORT |
| PRF | 4 | PRF_ANOMALY, PRF_ATTRIBUTION, PRF_INCREMENTALITY, PRF_OPTIMIZE |
| CST | 4 | CST_FRAMEWORK_SELECT, CST_ENGAGEMENT_GUIDE, CST_STRATEGIC_ANALYZE, CST_PRIORITIZE |
| CHG | 3 | CHG_READINESS, CHG_STAKEHOLDER, CHG_ADOPTION |
| CA | 3 | CA_BUSINESS_CASE, CA_FINANCIAL_ANALYZE, CA_RECOMMEND |
| **GHA** | **10** | **GHA_AARRR_ANALYZE, GHA_NORTH_STAR, GHA_FRAMEWORK_SELECT, GHA_TACTIC_RECOMMEND, GHA_BEHAVIORAL_APPLY, GHA_COMPETITOR_ANALYZE, GHA_EXPERIMENT_DESIGN, GHA_PROJECTION, GHA_SPECIALIST_REQUEST, GHA_GROWTH_DOCUMENT** |

### 13.2 Capability by Function

| Function | Capabilities |
|----------|--------------|
| **Analysis** | ANL_PROJECTION, ANL_SCENARIO_COMPARE, ANL_BAYESIAN, ANL_CAUSAL, CA_FINANCIAL_ANALYZE, GHA_AARRR_ANALYZE, GHA_COMPETITOR_ANALYZE |
| **Optimization** | ANL_MARGINAL_RETURN, CHA_CHANNEL_MIX, PRF_OPTIMIZE |
| **Assessment** | ANL_CONFIDENCE, AUD_LTV_ASSESS, CHA_EMERGING_ASSESS, CHG_READINESS |
| **Scoring** | AUD_PROPENSITY, SPO_PARTNER_SCORE, SPO_NBI_CALCULATE |
| **Detection** | PRF_ANOMALY, AUD_IDENTITY |
| **Generation** | DOC_GENERATE, CA_BUSINESS_CASE, CA_RECOMMEND, GHA_GROWTH_DOCUMENT |
| **Strategy** | CST_FRAMEWORK_SELECT, CST_STRATEGIC_ANALYZE, CST_PRIORITIZE, GHA_FRAMEWORK_SELECT, GHA_TACTIC_RECOMMEND |
| **Growth** | GHA_NORTH_STAR, GHA_BEHAVIORAL_APPLY, GHA_EXPERIMENT_DESIGN, GHA_PROJECTION, GHA_SPECIALIST_REQUEST |

---

## 14. USAGE EXAMPLES

### 14.1 Media Planning Workflow

```
USER: "Help me plan a $500K awareness campaign for Q2"

MCMAP WORKFLOW:
1. ORC classifies intent â†’ Routes to CHA for channel strategy
2. CHA recommends channel mix using CHA_CHANNEL_MIX
3. ORC routes to ANL for projections
4. ANL generates projections using ANL_PROJECTION
5. ORC routes to DOC for documentation
6. DOC generates media brief using DOC_GENERATE
7. Final output: Channel mix recommendation with projections and brief
```

### 14.2 Performance Analysis Workflow

```
USER: "Analyze Q1 performance and identify issues"

MCMAP WORKFLOW:
1. ORC classifies intent â†’ Routes to PRF
2. PRF detects anomalies using PRF_ANOMALY
3. PRF analyzes attribution using PRF_ATTRIBUTION
4. PRF recommends optimizations using PRF_OPTIMIZE
5. Final output: Performance analysis with anomalies and recommendations
```

### 14.3 Strategic Consulting Workflow

```
USER: "Help me build a business case for digital transformation"

MCMAP WORKFLOW:
1. ORC classifies intent â†’ Routes to CST for framework
2. CST selects framework using CST_FRAMEWORK_SELECT
3. CST applies analysis using CST_STRATEGIC_ANALYZE
4. ORC routes to CA for business case
5. CA builds case using CA_BUSINESS_CASE
6. ORC routes to CHG for change plan
7. CHG assesses readiness using CHG_READINESS
8. Final output: Business case with strategic analysis and change plan
```

### 14.4 Growth Strategy Workflow (v7.0 NEW)

```
USER: "Help me develop a growth strategy for a fintech app"

MCMAP WORKFLOW:
1. ORC classifies intent â†' Routes to GHA (Growth Strategy)
2. GHA analyzes AARRR lifecycle using GHA_AARRR_ANALYZE
3. GHA defines North Star metric using GHA_NORTH_STAR
4. GHA requests AUD via ORC â†' Segment analysis for growth targeting
5. GHA requests ANL via ORC â†' Growth projections
6. GHA requests CHA via ORC â†' Growth channel recommendations
7. GHA synthesizes specialist contributions
8. GHA applies behavioral frameworks using GHA_BEHAVIORAL_APPLY
9. GHA designs experiments using GHA_EXPERIMENT_DESIGN
10. GHA requests DOC via ORC â†' Growth strategy documentation
11. Final output: Comprehensive growth strategy with projections and experiments
```

---

**Document Version:** 2.0
**Classification:** Mastercard Internal
**Last Updated:** January 31, 2026
**Platform Version:** v7.0 (GHA Integration)
