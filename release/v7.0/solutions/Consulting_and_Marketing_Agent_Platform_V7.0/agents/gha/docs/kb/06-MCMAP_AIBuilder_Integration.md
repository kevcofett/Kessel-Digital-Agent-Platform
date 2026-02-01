# MCMAP AI Builder & Integration Specification

**Document:** 06-MCMAP_AIBuilder_Integration.md
**Version:** 7.0
**Date:** January 31, 2026  
**Classification:** Mastercard Internal - Technical Reference  
**Audience:** Engineering Teams, Platform Architects, Integration Developers

---

## Table of Contents

1. [AI Builder Architecture](#1-ai-builder-architecture)
2. [Prompt Inventory](#2-prompt-inventory)
3. [Prompt Design Standards](#3-prompt-design-standards)
4. [Agent-Specific Prompts](#4-agent-specific-prompts)
5. [Power Automate Flows](#5-power-automate-flows)
6. [Capability Abstraction Layer](#6-capability-abstraction-layer)
7. [Connector Configuration](#7-connector-configuration)
8. [Integration Patterns](#8-integration-patterns)
9. [Error Handling](#9-error-handling)
10. [Performance Optimization](#10-performance-optimization)

---

## 1. AI Builder Architecture

### 1.1 Role in MCMAP

AI Builder Custom Prompts serve as the universal computation layer for MCMAP, providing analytical processing that works within Mastercard's DLP-restricted environment without requiring HTTP connectors or external APIs.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     AI BUILDER IN MCMAP                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  User Query                                                     â”‚
â”‚      â”‚                                                          â”‚
â”‚      â–¼                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                             â”‚
â”‚  â”‚ Copilot Agent â”‚  (10 Agents, 8K chars each)                 â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜                                             â”‚
â”‚          â”‚                                                      â”‚
â”‚          â–¼                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                 â”‚
â”‚  â”‚ Capability Dispatcher Flow â”‚  (Routes to implementation)    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                 â”‚
â”‚              â”‚                                                  â”‚
â”‚              â–¼                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                 â”‚
â”‚  â”‚ eap_capability_impl Table â”‚  (Lookup implementation)        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                 â”‚
â”‚              â”‚                                                  â”‚
â”‚              â–¼                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                 â”‚
â”‚  â”‚   AI Builder Prompt       â”‚  (36 Custom Prompts - v7.0)            â”‚
â”‚  â”‚   - Structured Input      â”‚                                 â”‚
â”‚  â”‚   - JSON Output           â”‚                                 â”‚
â”‚  â”‚   - Low Temperature       â”‚                                 â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                 â”‚
â”‚              â”‚                                                  â”‚
â”‚              â–¼                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                 â”‚
â”‚  â”‚   Telemetry Logging       â”‚  (eap_telemetry table)          â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                 â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 1.2 Key Benefits

| Benefit | Description |
|---------|-------------|
| **DLP Compliant** | Works within Mastercard's security policies without HTTP connectors |
| **Structured Output** | Returns validated JSON for reliable downstream processing |
| **Deterministic** | Low temperature settings ensure consistent analytical results |
| **Auditable** | All invocations logged to telemetry for compliance |
| **Extensible** | New prompts can be added without agent instruction changes |

### 1.3 Technical Specifications

| Specification | Value |
|---------------|-------|
| Model | GPT-4 (Azure OpenAI via AI Builder) |
| Max Input Tokens | 8,000 |
| Max Output Tokens | 2,500 |
| Default Temperature | 0.1 - 0.3 |
| Timeout | 30 - 60 seconds |
| Rate Limit | 60 requests/minute (environment limit) |

---

## 2. Prompt Inventory

### 2.1 Complete Prompt Registry

MCMAP uses 36 AI Builder Custom Prompts organized by agent domain (v7.0 adds 10 GHA prompts):

| Agent | Prompt Code | Prompt Name | Purpose | Temperature |
|-------|-------------|-------------|---------|-------------|
| **ANL** | ANL_MarginalReturn | Marginal Return Calculator | Estimate diminishing returns curves | 0.1 |
| **ANL** | ANL_ScenarioCompare | Scenario Comparison | Compare budget allocation scenarios | 0.2 |
| **ANL** | ANL_Projection | Performance Projection | Generate campaign projections | 0.2 |
| **ANL** | ANL_Confidence | Confidence Assessment | Quantify prediction uncertainty | 0.2 |
| **ANL** | ANL_Bayesian | Bayesian Inference | Apply Bayesian methods to estimates | 0.2 |
| **ANL** | ANL_Causal | Causal Analysis | Assess incrementality and lift | 0.2 |
| **AUD** | AUD_SegmentPriority | Segment Prioritization | Rank audience segments by value | 0.3 |
| **AUD** | AUD_LTVAssess | LTV Assessment | Evaluate lifetime value potential | 0.3 |
| **AUD** | AUD_JourneyState | Journey State Detection | Determine customer journey position | 0.3 |
| **AUD** | AUD_Propensity | Propensity Scoring | Calculate conversion propensity | 0.2 |
| **AUD** | AUD_Identity | Identity Resolution | Resolve cross-device identity | 0.2 |
| **CHA** | CHA_ChannelMix | Channel Mix Optimizer | Recommend budget allocation | 0.3 |
| **CHA** | CHA_ChannelSelect | Channel Selection | Recommend channels for objectives | 0.3 |
| **CHA** | CHA_EmergingAssess | Emerging Channel Assessment | Evaluate new channel opportunities | 0.4 |
| **SPO** | SPO_FeeWaterfall | Fee Waterfall Analysis | Decompose programmatic fees | 0.1 |
| **SPO** | SPO_PartnerScore | Partner Evaluation | Score supply partners | 0.2 |
| **SPO** | SPO_NBICalculate | Net Bidder Impact | Calculate NBI metrics | 0.1 |
| **DOC** | DOC_Generate | Document Generator | Create document from session | 0.5 |
| **DOC** | DOC_TemplateSelect | Template Selection | Choose appropriate template | 0.3 |
| **DOC** | DOC_FormatExport | Format Export | Prepare export format | 0.3 |
| **PRF** | PRF_Anomaly | Anomaly Detection | Detect performance anomalies | 0.2 |
| **PRF** | PRF_Attribution | Attribution Analysis | Analyze multi-touch attribution | 0.2 |
| **PRF** | PRF_Incrementality | Incrementality Measurement | Measure incremental impact | 0.2 |
| **PRF** | PRF_Optimize | Optimization Recommender | Recommend optimizations | 0.3 |
| **ORC** | ORC_IntentClassify | Intent Classification | Classify user intent for routing | 0.1 |
| **ORC** | ORC_GateValidate | Gate Validation | Validate workflow gate completion | 0.1 |
| **GHA** | GHA_IntentClassify | Classify Growth Intent | Classify growth-specific intent and AARRR stage | 0.1 |
| **GHA** | GHA_FrameworkSelect | Select Growth Framework | Select appropriate growth framework | 0.2 |
| **GHA** | GHA_LifecycleAnalyze | Analyze AARRR Lifecycle | Analyze funnel stages for optimization | 0.2 |
| **GHA** | GHA_NorthStarDefine | Define North Star Metric | Define and validate North Star metrics | 0.3 |
| **GHA** | GHA_TacticRecommend | Recommend Growth Tactics | Recommend tactics by lifecycle stage | 0.3 |
| **GHA** | GHA_PsychologyApply | Apply Behavioral Psychology | Apply psychological principles to growth | 0.3 |
| **GHA** | GHA_CompetitorGrowth | Analyze Competitor Growth | Analyze competitor growth strategies | 0.3 |
| **GHA** | GHA_ExperimentDesign | Design Growth Experiment | Design experiments with success criteria | 0.3 |
| **GHA** | GHA_GrowthProject | Project Growth Outcomes | Project outcomes by AARRR stage | 0.2 |
| **GHA** | GHA_GrowthSynthesize | Synthesize Growth Strategy | Synthesize specialist contributions | 0.4 |

### 2.2 Prompt Registration Table

All prompts are registered in the `eap_prompt` Dataverse table:

| Column | Type | Description |
|--------|------|-------------|
| prompt_id | GUID (PK) | Unique identifier |
| prompt_code | Text | Unique prompt code (e.g., ANL_MarginalReturn) |
| prompt_name | Text | Display name |
| agent_code | Lookup | Associated agent |
| capability_code | Lookup | Associated capability |
| version | Text | Prompt version (e.g., 1.0) |
| system_message | Multiline | System prompt content |
| user_template | Multiline | User message template with variables |
| output_schema | Multiline JSON | Expected output structure |
| temperature | Decimal | AI Builder temperature setting |
| max_tokens | Integer | Maximum output tokens |
| is_active | Boolean | Currently deployed |
| created_at | DateTime | Creation timestamp |
| modified_at | DateTime | Last modification |

---

## 3. Prompt Design Standards

### 3.1 Standard Prompt Structure

Every AI Builder prompt follows this structure:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    PROMPT STRUCTURE                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  SYSTEM MESSAGE                                                 â”‚
â”‚  â”œâ”€â”€ Role Definition                                            â”‚
â”‚  â”œâ”€â”€ Methodology/Framework                                      â”‚
â”‚  â”œâ”€â”€ Output Requirements                                        â”‚
â”‚  â”œâ”€â”€ Constraints                                                â”‚
â”‚  â””â”€â”€ Output Schema (JSON)                                       â”‚
â”‚                                                                 â”‚
â”‚  USER MESSAGE TEMPLATE                                          â”‚
â”‚  â”œâ”€â”€ Input Variables ({{variable}} syntax)                      â”‚
â”‚  â””â”€â”€ Context Data (JSON blocks)                                 â”‚
â”‚                                                                 â”‚
â”‚  FEW-SHOT EXAMPLES (2-3)                                        â”‚
â”‚  â”œâ”€â”€ Example Input                                              â”‚
â”‚  â””â”€â”€ Example Output                                             â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 3.2 Standard Output Format

All prompts return JSON with this base structure:

```json
{
  "result": {
    // Capability-specific output fields
  },
  "confidence": 0.85,
  "reasoning": "Brief explanation of methodology",
  "sources": ["source1", "source2"],
  "warnings": ["any caveats or limitations"]
}
```

### 3.3 Error Response Format

When prompts cannot complete successfully:

```json
{
  "error": true,
  "error_code": "INSUFFICIENT_DATA",
  "error_message": "Description of what's missing",
  "suggestions": ["How to resolve"]
}
```

### 3.4 Temperature Guidelines

| Task Type | Temperature | Rationale | Examples |
|-----------|-------------|-----------|----------|
| Calculations | 0.1 | Maximum consistency for numerical outputs | Marginal returns, NBI, fee waterfall |
| Classification | 0.2 | Low variance for routing decisions | Intent classification, gate validation |
| Analysis | 0.2-0.3 | Slight flexibility for interpretation | Attribution, scenario comparison |
| Recommendations | 0.3-0.4 | Allow reasoning creativity | Channel selection, optimization |
| Content Generation | 0.5-0.7 | More variation for documents | Document generation |

### 3.5 Variable Naming Conventions

| Convention | Format | Example |
|------------|--------|---------|
| Input Parameters | snake_case | {{total_budget}} |
| JSON Blocks | _json suffix | {{historical_data_json}} |
| Lists | _list suffix | {{channels_list}} |
| Timestamps | _at suffix | {{created_at}} |
| Booleans | is_ prefix | {{is_brand_campaign}} |

---

## 4. Agent-Specific Prompts

### 4.1 ANL Agent Prompts (Analytics)

#### ANL_MarginalReturn Prompt

**Purpose:** Calculate marginal return curves for budget allocation optimization.

**Capability Code:** ANL_MARGINAL_RETURN

**System Message Components:**

| Component | Content |
|-----------|---------|
| Role | Marketing analytics expert specializing in media effectiveness measurement |
| Methodology | Logarithmic response curves: Response = k Ã— ln(1 + Spend/c) |
| Key Outputs | Marginal returns at current, +10%, +25%, +50% spend levels |
| Constraints | Never recommend allocations exceeding stated budget |

**Output Schema:**

```json
{
  "channel_code": "string",
  "current_spend": "number",
  "marginal_returns": {
    "at_current": "number",
    "at_plus_10pct": "number",
    "at_plus_25pct": "number",
    "at_plus_50pct": "number"
  },
  "saturation_point": "number",
  "response_curve": {
    "model": "logarithmic|s_curve|linear",
    "parameters": { "k": "number", "c": "number" }
  },
  "confidence": "number",
  "confidence_interval_80": { "low": "number", "high": "number" },
  "confidence_interval_95": { "low": "number", "high": "number" },
  "reasoning": "string",
  "data_quality_flags": ["string"]
}
```

**Configuration:** Temperature: 0.1 | Max Tokens: 1000 | Timeout: 30s

---

#### ANL_ScenarioCompare Prompt

**Purpose:** Compare multiple budget allocation scenarios with statistical analysis.

**Capability Code:** ANL_SCENARIO_COMPARE

**Evaluation Criteria:**
- Expected total return
- Return variance / risk
- Efficiency (return per dollar)
- Alignment with objectives
- Practical feasibility

**Output Schema:**

```json
{
  "scenarios_ranked": [
    {
      "scenario_id": "string",
      "rank": "number",
      "expected_return": "number",
      "return_variance": "number",
      "efficiency_score": "number",
      "risk_level": "LOW|MEDIUM|HIGH",
      "objective_alignment_score": "number",
      "pros": ["string"],
      "cons": ["string"]
    }
  ],
  "recommendation": {
    "primary": "scenario_id",
    "alternative": "scenario_id",
    "reasoning": "string"
  },
  "sensitivity_analysis": {
    "key_assumptions": ["string"],
    "if_optimistic": { "best_scenario": "scenario_id", "delta": "number" },
    "if_pessimistic": { "best_scenario": "scenario_id", "delta": "number" }
  },
  "confidence": "number"
}
```

**Configuration:** Temperature: 0.2 | Max Tokens: 2000 | Timeout: 45s

---

#### ANL_Causal Prompt

**Purpose:** Perform causal/incrementality analysis distinguishing true lift from correlation.

**Capability Code:** ANL_CAUSAL

**Causal Inference Methods:**
- Difference-in-differences
- Regression discontinuity
- Propensity score matching
- Synthetic control
- Instrumental variables

**Output Schema:**

```json
{
  "causal_question": "string",
  "estimated_effect": {
    "point_estimate": "number",
    "credible_interval_80": { "low": "number", "high": "number" },
    "credible_interval_95": { "low": "number", "high": "number" }
  },
  "incrementality_rate": "number",
  "baseline_estimate": "number",
  "attributed_total": "number",
  "true_incremental": "number",
  "methodology": {
    "approach": "string",
    "assumptions": ["string"],
    "limitations": ["string"]
  },
  "confounders_identified": [
    {
      "confounder": "string",
      "severity": "LOW|MEDIUM|HIGH",
      "mitigation": "string"
    }
  ],
  "validation_recommendations": ["string"],
  "confidence": "number"
}
```

**Configuration:** Temperature: 0.2 | Max Tokens: 2000 | Timeout: 45s

---

### 4.2 AUD Agent Prompts (Audience)

#### AUD_SegmentPriority Prompt

**Purpose:** Prioritize audience segments by value and strategic fit.

**Capability Code:** AUD_SEGMENT_PRIORITY

**Prioritization Criteria:**
- Estimated lifetime value (LTV)
- Conversion propensity
- Reach / scale potential
- Alignment with campaign objectives
- Cost efficiency (CPM, CPA expectations)
- Data quality / activation readiness

**Output Schema:**

```json
{
  "segments_prioritized": [
    {
      "segment_id": "string",
      "segment_name": "string",
      "priority_rank": "number",
      "composite_score": "number",
      "criterion_scores": {
        "ltv_score": "number",
        "propensity_score": "number",
        "reach_score": "number",
        "alignment_score": "number",
        "efficiency_score": "number",
        "data_quality_score": "number"
      },
      "estimated_size": "number",
      "recommended_budget_pct": "number",
      "key_strengths": ["string"],
      "key_risks": ["string"]
    }
  ],
  "segments_excluded": [
    {
      "segment_id": "string",
      "reason": "string"
    }
  ],
  "recommended_tier_allocation": {
    "tier_1_pct": "number",
    "tier_2_pct": "number",
    "tier_3_pct": "number"
  },
  "reasoning": "string",
  "confidence": "number"
}
```

**Configuration:** Temperature: 0.3 | Max Tokens: 2000 | Timeout: 30s

---

#### AUD_LTVAssess Prompt

**Purpose:** Evaluate lifetime value potential for audience segments.

**Capability Code:** AUD_LTV_ASSESS

**LTV Components:**
- Average order value (AOV)
- Purchase frequency
- Customer lifespan
- Gross margin
- Retention rate

**Output Schema:**

```json
{
  "segment_id": "string",
  "ltv_estimate": {
    "point_estimate": "number",
    "range_low": "number",
    "range_high": "number",
    "time_horizon_months": "number"
  },
  "ltv_components": {
    "avg_order_value": "number",
    "purchase_frequency_annual": "number",
    "expected_lifespan_months": "number",
    "gross_margin_pct": "number",
    "retention_rate_annual": "number"
  },
  "ltv_tier": "PREMIUM|HIGH|MEDIUM|LOW|AT_RISK",
  "vs_benchmark": {
    "benchmark_ltv": "number",
    "index": "number"
  },
  "value_drivers": ["string"],
  "risk_factors": ["string"],
  "data_quality": {
    "score": "number",
    "gaps": ["string"]
  },
  "confidence": "number"
}
```

**Configuration:** Temperature: 0.3 | Max Tokens: 1500 | Timeout: 30s

---

### 4.3 CHA Agent Prompts (Channel)

#### CHA_ChannelMix Prompt

**Purpose:** Recommend optimal channel budget allocation.

**Capability Code:** CHA_CHANNEL_MIX

**Optimization Methodology:**
- Map objectives to channel strengths
- Apply funnel coverage principles
- Optimize for efficiency within constraints
- Balance reach and frequency goals
- Consider synergy effects between channels

**Output Schema:**

```json
{
  "recommended_mix": [
    {
      "channel_code": "string",
      "channel_name": "string",
      "allocation_pct": "number",
      "allocation_amount": "number",
      "role_in_mix": "string",
      "expected_contribution": {
        "reach_pct": "number",
        "conversion_pct": "number"
      },
      "rationale": "string"
    }
  ],
  "total_budget": "number",
  "funnel_coverage": {
    "awareness_pct": "number",
    "consideration_pct": "number",
    "conversion_pct": "number"
  },
  "efficiency_metrics": {
    "blended_cpm": "number",
    "blended_cpc": "number",
    "expected_roas": "number"
  },
  "synergy_effects": ["string"],
  "risks_and_mitigations": [
    {
      "risk": "string",
      "mitigation": "string"
    }
  ],
  "confidence": "number"
}
```

**Configuration:** Temperature: 0.3 | Max Tokens: 2500 | Timeout: 45s

---

### 4.4 SPO Agent Prompts (Supply Path)

#### SPO_FeeWaterfall Prompt

**Purpose:** Calculate and decompose programmatic fee structure.

**Capability Code:** SPO_FEE_WATERFALL

**Fee Waterfall Components:**
1. Gross Media Spend (100%)
2. DSP Fee (typically 10-15%)
3. Data Fees (varies)
4. Verification Fees (typically 2-5%)
5. SSP Take Rate (typically 10-20%)
6. Publisher Share (varies)
7. Working Media (what reaches consumer)

**Output Schema:**

```json
{
  "gross_spend": "number",
  "fee_layers": [
    {
      "layer_name": "string",
      "absolute_amount": "number",
      "percentage": "number",
      "benchmark_range": { "low": "number", "high": "number" },
      "vs_benchmark": "BELOW|WITHIN|ABOVE",
      "optimization_potential": "number"
    }
  ],
  "working_media": {
    "amount": "number",
    "percentage": "number"
  },
  "total_fees": {
    "amount": "number",
    "percentage": "number"
  },
  "optimization_opportunities": [
    {
      "opportunity": "string",
      "potential_savings": "number",
      "implementation_complexity": "LOW|MEDIUM|HIGH"
    }
  ],
  "confidence": "number"
}
```

**Configuration:** Temperature: 0.1 | Max Tokens: 1500 | Timeout: 30s

---

### 4.5 PRF Agent Prompts (Performance)

#### PRF_Anomaly Prompt

**Purpose:** Detect performance anomalies requiring attention.

**Capability Code:** PRF_ANOMALY

**Detection Methods:**
- Statistical process control (SPC)
- Z-score analysis
- Moving average deviation
- Percentage change thresholds
- Seasonal adjustment

**Output Schema:**

```json
{
  "anomalies_detected": [
    {
      "metric": "string",
      "current_value": "number",
      "expected_value": "number",
      "deviation_pct": "number",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "detection_method": "string",
      "likely_causes": ["string"],
      "recommended_actions": ["string"]
    }
  ],
  "metrics_normal": [
    {
      "metric": "string",
      "current_value": "number",
      "status": "HEALTHY"
    }
  ],
  "overall_health": "CRITICAL|WARNING|HEALTHY",
  "time_period_analyzed": "string",
  "confidence": "number"
}
```

**Configuration:** Temperature: 0.2 | Max Tokens: 2000 | Timeout: 30s

---

### 4.6 ORC Agent Prompts (Orchestrator)

#### ORC_IntentClassify Prompt

**Purpose:** Classify user intent for agent routing.

**Capability Code:** ORC_INTENT_CLASSIFY

**Classification Categories:**
- ANALYTICS: Budget projections, scenario modeling, calculations
- AUDIENCE: Segmentation, targeting, LTV assessment
- CHANNEL: Channel selection, mix optimization
- SUPPLY_PATH: Fee analysis, partner evaluation
- PERFORMANCE: Attribution, anomaly detection
- DOCUMENT: Report generation, export
- CONSULTING: Strategic frameworks, change management
- GENERAL: Greetings, help, clarification

**Output Schema:**

```json
{
  "primary_intent": "string",
  "primary_agent": "string",
  "confidence": "number",
  "secondary_intents": [
    {
      "intent": "string",
      "agent": "string",
      "confidence": "number"
    }
  ],
  "entities_extracted": {
    "budget": "number|null",
    "channels": ["string"],
    "objectives": ["string"],
    "time_period": "string|null"
  },
  "routing_recommendation": {
    "agent_code": "string",
    "capability_code": "string|null",
    "reasoning": "string"
  }
}
```

**Configuration:** Temperature: 0.1 | Max Tokens: 500 | Timeout: 15s

---

### 4.7 GHA Agent Prompts (Growth Hacking - v7.0)

GHA (Growth Hacking Agent) is a Growth Strategy Orchestrator added in v7.0. It uses 10 specialized prompts for growth strategy development, AARRR lifecycle optimization, and multi-agent coordination.

#### GHA_IntentClassify Prompt

**Purpose:** Classify growth-specific user intent and determine AARRR stage focus.

**Capability Code:** GHA_INTENT_CLASSIFY

**Classification Categories:**
- FULL_GROWTH_STRATEGY: Comprehensive growth plan
- LIFECYCLE_OPTIMIZATION: AARRR funnel improvement
- ACQUISITION_FOCUS through REVENUE_FOCUS: Stage-specific optimization
- FRAMEWORK_REQUEST: Growth framework application
- EXPERIMENT_DESIGN: Growth experiment creation

**Configuration:** Temperature: 0.1 | Max Tokens: 800 | Timeout: 15s

---

#### GHA_LifecycleAnalyze Prompt

**Purpose:** Analyze AARRR funnel stages to identify bottlenecks and opportunities.

**Capability Code:** GHA_LIFECYCLE_ANALYZE

**Analysis Components:**
- Stage health assessment (Acquisition, Activation, Retention, Referral, Revenue)
- Conversion rates between stages
- Bottleneck identification and severity scoring
- Opportunity prioritization by impact and effort

**Configuration:** Temperature: 0.2 | Max Tokens: 2500 | Timeout: 45s

---

#### GHA_NorthStarDefine Prompt

**Purpose:** Help define and validate appropriate North Star metrics for growth focus.

**Capability Code:** GHA_NORTH_STAR_DEFINE

**Framework:**
- Value reflection (measures customer value)
- Leading indicator (predicts future growth)
- Actionable (teams can influence)
- Input/output metric hierarchy

**Configuration:** Temperature: 0.3 | Max Tokens: 2000 | Timeout: 30s

---

#### GHA_TacticRecommend Prompt

**Purpose:** Recommend specific, prioritized growth tactics by lifecycle stage.

**Capability Code:** GHA_TACTIC_RECOMMEND

**Tactic Categories:**
- Acquisition: Content, paid, viral, partnerships, PLG
- Activation: Onboarding, personalization, value acceleration
- Retention: Engagement loops, feature education, community
- Referral: Incentive programs, viral mechanics, advocacy
- Revenue: Pricing, expansion, conversion optimization

**Configuration:** Temperature: 0.3 | Max Tokens: 2500 | Timeout: 45s

---

#### GHA_PsychologyApply Prompt

**Purpose:** Apply psychological principles and behavioral design to growth mechanics.

**Capability Code:** GHA_PSYCHOLOGY_APPLY

**Frameworks Applied:**
- Hook Model (Trigger, Action, Variable Reward, Investment)
- Fogg Behavior Model (B = MAP)
- Cognitive biases (loss aversion, social proof, scarcity)
- Habit formation principles

**Configuration:** Temperature: 0.3 | Max Tokens: 2500 | Timeout: 45s

---

#### GHA_CompetitorGrowth Prompt

**Purpose:** Analyze competitor growth strategies with fintech/neobank focus.

**Capability Code:** GHA_COMPETITOR_GROWTH

**Analysis Areas:**
- Growth model identification (paid, viral, content, PLG)
- AARRR analysis by competitor
- Fintech-specific patterns (referral bonuses, gamification, rewards)
- Differentiation opportunities

**Configuration:** Temperature: 0.3 | Max Tokens: 3000 | Timeout: 60s

---

#### GHA_ExperimentDesign Prompt

**Purpose:** Design rigorous growth experiments with hypothesis and success criteria.

**Capability Code:** GHA_EXPERIMENT_DESIGN

**Design Components:**
- Hypothesis formulation (falsifiable, measurable)
- Experiment type selection (A/B, cohort, holdout, painted door)
- Sample size calculation and duration
- Metric hierarchy (primary, secondary, guardrail)
- Decision criteria (ship, iterate, kill)

**Configuration:** Temperature: 0.3 | Max Tokens: 2500 | Timeout: 45s

---

#### GHA_GrowthProject Prompt

**Purpose:** Project growth outcomes by AARRR stage with scenario analysis.

**Capability Code:** GHA_GROWTH_PROJECT

**Projection Components:**
- Baseline projections (without changes)
- Tactic impact modeling (optimistic/base/pessimistic)
- Compounding effects between stages
- North Star metric trajectory
- Investment requirements and ROI

**Configuration:** Temperature: 0.2 | Max Tokens: 3000 | Timeout: 45s

---

#### GHA_GrowthSynthesize Prompt

**Purpose:** Synthesize specialist contributions into unified growth strategy.

**Capability Code:** GHA_GROWTH_SYNTHESIZE

**Synthesis Components:**
- Integration of ANL (projections), AUD (segments), CHA (channels)
- Unified narrative creation
- Conflict resolution between specialists
- Confidence aggregation
- Handoff context for MPA/CA domains

**Configuration:** Temperature: 0.4 | Max Tokens: 4000 | Timeout: 60s

---

## 5. Power Automate Flows

### 5.1 Flow Inventory

MCMAP uses 5 core Power Automate flows:

| Flow Name | Purpose | Trigger | DLP Compliant |
|-----------|---------|---------|---------------|
| MPA_Capability_Dispatcher | Route capability requests | HTTP Request (Copilot) | Yes |
| MPA_Session_Manager | Session CRUD operations | HTTP Request (Copilot) | Yes |
| MPA_Impl_AIBuilder | Execute AI Builder prompts | Called by Dispatcher | Yes |
| MPA_Telemetry_Logger | Log observability events | Called by all flows | Yes |
| MPA_Document_Generate | Generate output documents | Called by DOC agent | Yes |

### 5.2 MPA_Capability_Dispatcher Flow

**Purpose:** Main routing flow that receives capability requests and dispatches to implementations.

**Flow Diagram:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                MPA_Capability_Dispatcher                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  HTTP Request Trigger                                           â”‚
â”‚  â”œâ”€â”€ capability_code: string                                    â”‚
â”‚  â”œâ”€â”€ session_id: string                                         â”‚
â”‚  â””â”€â”€ parameters_json: object                                    â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Query eap_environment_config                                   â”‚
â”‚  â””â”€â”€ Get environment_code (MASTERCARD)                          â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Query eap_capability_implementation                            â”‚
â”‚  â””â”€â”€ Filter: capability_code AND environment_code               â”‚
â”‚  â””â”€â”€ Order: priority_order ASC                                  â”‚
â”‚  â””â”€â”€ Top: 1 (highest priority enabled)                          â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Switch on implementation_type                                  â”‚
â”‚  â”œâ”€â”€ AI_BUILDER_PROMPT â†’ Call MPA_Impl_AIBuilder               â”‚
â”‚  â”œâ”€â”€ DATAVERSE_LOGIC â†’ Execute inline Dataverse query          â”‚
â”‚  â””â”€â”€ POWER_FX â†’ Execute Power Fx expression                    â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Call MPA_Telemetry_Logger                                      â”‚
â”‚  â””â”€â”€ Log execution details                                      â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  HTTP Response                                                  â”‚
â”‚  â””â”€â”€ Return result_json                                         â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Key Actions:**

| Action | Type | Purpose |
|--------|------|---------|
| Parse JSON | Parse JSON | Validate incoming request |
| Get Environment | Dataverse List Rows | Retrieve current environment config |
| Get Implementation | Dataverse List Rows | Find capability implementation |
| Switch Router | Switch | Route to implementation type |
| AI Builder Call | Child Flow | Execute AI Builder prompt |
| Log Telemetry | Child Flow | Record execution metrics |
| Compose Response | Compose | Format response JSON |

### 5.3 MPA_Impl_AIBuilder Flow

**Purpose:** Execute AI Builder custom prompts with proper input/output handling.

**Input Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt_code | string | Yes | AI Builder prompt identifier |
| input_json | object | Yes | Input parameters for prompt |
| session_id | string | Yes | Session for telemetry |

**Flow Steps:**

1. Query `eap_prompt` table for prompt configuration
2. Parse system message and user template
3. Substitute variables in user template with input values
4. Call AI Builder Custom Prompt action
5. Parse JSON response
6. Validate against expected schema
7. Return result or error

**Output:**

```json
{
  "success": true,
  "result": { /* prompt output */ },
  "execution_time_ms": 2340,
  "prompt_code": "ANL_MarginalReturn",
  "confidence": 0.85
}
```

### 5.4 MPA_Session_Manager Flow

**Purpose:** Manage user session lifecycle in Dataverse.

**Operations:**

| Operation | Input | Output |
|-----------|-------|--------|
| CREATE | user_id, agent_code | session_id, created_at |
| READ | session_id | Full session record |
| UPDATE | session_id, updates_json | Updated session |
| DELETE | session_id | Confirmation |

**Session Schema (eap_session):**

| Field | Type | Description |
|-------|------|-------------|
| session_id | GUID | Primary key |
| user_id | Text | User identifier |
| agent_code | Text | Current agent |
| state_json | Multiline | Session state |
| context_json | Multiline | Conversation context |
| created_at | DateTime | Creation time |
| updated_at | DateTime | Last update |
| expires_at | DateTime | Expiration (90 days default) |

### 5.5 MPA_Telemetry_Logger Flow

**Purpose:** Log all capability invocations for observability and audit.

**Input Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | GUID | User session |
| event_type | Choice | CAPABILITY_INVOKE, SUCCESS, FAILURE, ROUTING, ERROR |
| agent_code | Text | Agent involved |
| capability_code | Text | Capability invoked |
| implementation_type | Choice | AI_BUILDER, DATAVERSE, POWER_FX |
| inputs_json | Object | Input parameters (sanitized) |
| outputs_json | Object | Output results (sanitized) |
| execution_time_ms | Integer | Execution duration |
| error_message | Text | Error details if applicable |

**Data Sanitization:**

- PII fields are redacted before logging
- Large payloads are truncated to 10KB
- Sensitive values are masked

---

## 6. Capability Abstraction Layer

### 6.1 Architecture Overview

The Capability Abstraction Layer (CAL) enables the same agent code to route to different implementations based on environment configuration.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              CAPABILITY ABSTRACTION LAYER                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  Agent Request                                                  â”‚
â”‚  â””â”€â”€ capability_code: ANL_MARGINAL_RETURN                       â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                           â”‚
â”‚  â”‚    Capability Dispatcher        â”‚                           â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                           â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                           â”‚
â”‚  â”‚ Query eap_capability_impl       â”‚                           â”‚
â”‚  â”‚ WHERE capability_code = X       â”‚                           â”‚
â”‚  â”‚   AND environment = MASTERCARD  â”‚                           â”‚
â”‚  â”‚   AND is_enabled = true         â”‚                           â”‚
â”‚  â”‚ ORDER BY priority_order         â”‚                           â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                           â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                           â”‚
â”‚  â”‚ Implementation Types:           â”‚                           â”‚
â”‚  â”‚ â”œâ”€â”€ AI_BUILDER_PROMPT          â”‚  (All capabilities)       â”‚
â”‚  â”‚ â”œâ”€â”€ DATAVERSE_LOGIC            â”‚  (Lookups, CRUD)          â”‚
â”‚  â”‚ â””â”€â”€ POWER_FX                   â”‚  (Simple calculations)    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                           â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Route to Implementation â†’ Execute â†’ Return Result              â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.2 Implementation Registration

Each capability has one or more implementations registered per environment:

**eap_capability_implementation Table:**

| capability_code | environment_code | impl_type | impl_reference | priority | is_enabled |
|-----------------|------------------|-----------|----------------|----------|------------|
| ANL_MARGINAL_RETURN | MASTERCARD | AI_BUILDER_PROMPT | ANL_MarginalReturn | 1 | true |
| ANL_SCENARIO_COMPARE | MASTERCARD | AI_BUILDER_PROMPT | ANL_ScenarioCompare | 1 | true |
| AUD_SEGMENT_PRIORITY | MASTERCARD | AI_BUILDER_PROMPT | AUD_SegmentPriority | 1 | true |
| CHA_CHANNEL_MIX | MASTERCARD | AI_BUILDER_PROMPT | CHA_ChannelMix | 1 | true |
| SPO_FEE_WATERFALL | MASTERCARD | AI_BUILDER_PROMPT | SPO_FeeWaterfall | 1 | true |
| PRF_ANOMALY | MASTERCARD | AI_BUILDER_PROMPT | PRF_Anomaly | 1 | true |
| ORC_INTENT_CLASSIFY | MASTERCARD | AI_BUILDER_PROMPT | ORC_IntentClassify | 1 | true |

### 6.3 Adding New Capabilities

To add a new capability:

1. **Define capability** in `eap_capability`:
   - capability_code, capability_name, agent_code
   - input_schema, output_schema (JSON)
   - description

2. **Create AI Builder prompt**:
   - Design system message with methodology
   - Create user template with variables
   - Add few-shot examples
   - Set temperature and token limits

3. **Register prompt** in `eap_prompt`:
   - Link to capability_code
   - Store system_message and user_template
   - Configure temperature and max_tokens

4. **Register implementation** in `eap_capability_implementation`:
   - capability_code, environment_code = MASTERCARD
   - implementation_type = AI_BUILDER_PROMPT
   - implementation_reference = prompt_code
   - priority_order = 1, is_enabled = true

5. **Add test cases** in `eap_test_case`

6. **Update agent instructions** to reference new capability

---

## 7. Connector Configuration

### 7.1 Approved Connectors

All flows use only Mastercard DLP-approved connectors:

| Connector | Usage | DLP Status |
|-----------|-------|------------|
| **Dataverse** | Primary data store, configuration, telemetry | Approved |
| **AI Builder** | Custom prompts for all analytical processing | Approved |
| **SharePoint** | Knowledge base document hosting | Approved |
| **Office 365 Outlook** | Email notifications (optional) | Approved |
| **Office 365 Users** | User profile lookup | Approved |
| **Microsoft Teams** | Bot integration, notifications | Approved |
| **Approvals** | Workflow approvals (future) | Approved |
| **Excel Online** | Data import/export | Approved |

### 7.2 Blocked Connectors

These connectors are NOT used and blocked by DLP:

| Connector | Block Reason |
|-----------|--------------|
| HTTP | DLP policy - data exfiltration risk |
| HTTP with Azure AD | DLP policy - same as HTTP |
| Custom Connectors | DLP policy - unvetted endpoints |
| Azure Functions | DLP policy - external compute |
| SQL Server | DLP policy - external database |
| Azure Blob Storage | DLP policy - external storage |

### 7.3 Connection References

Flows use connection references for environment-independent deployment:

| Reference Name | Connector | Purpose |
|----------------|-----------|---------|
| MPA_Dataverse_Connection | Dataverse | All Dataverse operations |
| MPA_AIBuilder_Connection | AI Builder | Prompt execution |
| MPA_SharePoint_Connection | SharePoint | KB document access |
| MPA_Teams_Connection | Teams | Bot integration |

---

## 8. Integration Patterns

### 8.1 Copilot Studio â†’ Flow Integration

Copilot agents invoke flows using the Power Automate action:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            COPILOT â†’ FLOW INTEGRATION                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  Copilot Studio Agent                                           â”‚
â”‚  â””â”€â”€ Topic: Calculate Projections                               â”‚
â”‚       â””â”€â”€ Power Automate Action                                 â”‚
â”‚            â”œâ”€â”€ Flow: MPA_Capability_Dispatcher                  â”‚
â”‚            â”œâ”€â”€ Input:                                           â”‚
â”‚            â”‚   â””â”€â”€ capability_code: ANL_PROJECTION              â”‚
â”‚            â”‚   â””â”€â”€ session_id: {sessionId}                      â”‚
â”‚            â”‚   â””â”€â”€ parameters_json: {budget, channels, ...}     â”‚
â”‚            â””â”€â”€ Output:                                          â”‚
â”‚                â””â”€â”€ result_json: {projections, confidence, ...}  â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 8.2 Teams Integration

MCMAP integrates with Microsoft Teams via Copilot Studio's built-in Teams channel:

| Integration Point | Description |
|-------------------|-------------|
| Bot Registration | Copilot agents deployed as Teams bots |
| Adaptive Cards | Rich responses with interactive elements |
| Deep Links | Links to SharePoint documents, Power Apps |
| Notifications | Proactive messages via Teams connector |

### 8.3 SharePoint Knowledge Base

Knowledge base documents are hosted in SharePoint and accessed via Copilot Studio's built-in KB retrieval:

| Configuration | Value |
|---------------|-------|
| Site | Mastercard SharePoint tenant |
| Library | MCMAP_Knowledge_Base |
| Structure | /agents/{agent_code}/core/, /agents/{agent_code}/deep/ |
| Access | Read-only for agents |
| Update Process | Solution deployment with pac CLI |

### 8.4 Power Apps Integration

Canvas and Model-Driven apps can interact with MCMAP:

| App Type | Integration Method | Use Case |
|----------|-------------------|----------|
| Canvas App | Direct Dataverse + Flow calls | Custom UI for media planning |
| Model-Driven | Native Dataverse forms | Admin configuration |
| SPFx Web Part | API via Copilot | Embedded assistant |

---

## 9. Error Handling

### 9.1 Error Categories

| Category | Code Range | Description | Handling |
|----------|------------|-------------|----------|
| Validation | 1000-1999 | Input validation failures | Return specific field errors |
| Processing | 2000-2999 | AI Builder/computation errors | Retry with backoff |
| Data | 3000-3999 | Dataverse/data access errors | Fallback to cached |
| Timeout | 4000-4999 | Execution timeouts | Simplify request |
| System | 5000-5999 | Platform/infrastructure errors | Alert and escalate |

### 9.2 Error Response Schema

```json
{
  "error": true,
  "error_code": "2001",
  "error_category": "PROCESSING",
  "error_message": "AI Builder prompt returned invalid JSON",
  "error_details": {
    "prompt_code": "ANL_MarginalReturn",
    "raw_response": "truncated...",
    "parse_error": "Unexpected token at position 245"
  },
  "suggestions": [
    "Simplify input parameters",
    "Check for special characters in input"
  ],
  "correlation_id": "abc-123-def",
  "timestamp": "2026-01-23T10:30:00Z"
}
```

### 9.3 Retry Strategy

| Error Type | Retry Count | Backoff | Fallback |
|------------|-------------|---------|----------|
| AI Builder timeout | 2 | Exponential (2s, 4s) | Return partial result |
| Dataverse throttling | 3 | Linear (1s, 2s, 3s) | Queue for later |
| Parse error | 1 | Immediate | Return raw with warning |
| Authentication | 0 | None | Escalate to user |

### 9.4 Graceful Degradation

When capabilities fail, MCMAP degrades gracefully:

| Failure | Degradation Strategy |
|---------|---------------------|
| AI Builder unavailable | Return cached benchmark data |
| Telemetry logging fails | Continue operation, queue logs |
| KB retrieval fails | Use agent instruction defaults |
| Session lookup fails | Create new session |

---

## 10. Performance Optimization

### 10.1 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Capability response time | < 5 seconds | 3.2s avg |
| AI Builder prompt latency | < 3 seconds | 2.1s avg |
| Dataverse query time | < 500ms | 180ms avg |
| End-to-end user response | < 8 seconds | 5.8s avg |

### 10.2 Optimization Techniques

| Technique | Implementation | Impact |
|-----------|----------------|--------|
| **Prompt Efficiency** | Minimal system messages, focused examples | -30% token usage |
| **Parallel Execution** | Concurrent Dataverse queries | -40% latency |
| **Caching** | Benchmark data cached in session | -60% repeat queries |
| **Index Optimization** | Indexed columns for common filters | -50% query time |
| **Response Streaming** | Progressive UI updates | Better UX |

### 10.3 Token Management

AI Builder tokens are a limited resource:

| Strategy | Description |
|----------|-------------|
| Concise Prompts | System messages under 1000 tokens |
| Selective Context | Only include relevant data in user message |
| Truncation | Large inputs summarized before sending |
| Batching | Multiple small requests combined |

### 10.4 Monitoring Queries

Key queries for performance monitoring:

**Average Response Time by Capability:**
```
eap_telemetry
| Filter: event_type = CAPABILITY_SUCCESS
| Group: capability_code
| Aggregate: AVG(execution_time_ms)
| Order: AVG DESC
```

**Error Rate by Agent:**
```
eap_telemetry
| Filter: created_on > TODAY - 7
| Group: agent_code, event_type
| Aggregate: COUNT(*)
| Calculate: error_rate = FAILURE / (SUCCESS + FAILURE)
```

---

## Document References

| Document | Purpose |
|----------|---------|
| [01-MCMAP_Executive_Summary.md](./01-MCMAP_Executive_Summary.md) | Executive overview |
| [02-MCMAP_System_Architecture.md](./02-MCMAP_System_Architecture.md) | Technical architecture |
| [03-MCMAP_Security_Compliance.md](./03-MCMAP_Security_Compliance.md) | Security framework |
| [04-MCMAP_Agent_Capabilities.md](./04-MCMAP_Agent_Capabilities.md) | Agent reference |
| [05-MCMAP_Data_Architecture.md](./05-MCMAP_Data_Architecture.md) | Data governance |
| [07-MCMAP_Operational_Runbook.md](./07-MCMAP_Operational_Runbook.md) | Operations guide |
| [08-MCMAP_Quality_Assurance.md](./08-MCMAP_Quality_Assurance.md) | Testing framework |

---

**Document Control:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-23 | MCMAP Team | Initial release |

---

*MCMAP AI Builder & Integration Specification - Mastercard Internal*
