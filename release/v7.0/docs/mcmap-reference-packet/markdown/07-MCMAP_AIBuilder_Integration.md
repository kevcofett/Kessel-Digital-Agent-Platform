# MCMAP AI Builder & Integration Specification

**Document:** 06-MCMAP_AIBuilder_Integration.md  
**Version:** 1.0  
**Date:** January 23, 2026  
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
+-----------------------------------------------------------------+
|                     AI BUILDER IN MCMAP                          |
+-----------------------------------------------------------------+
|                                                                 |
|  User Query                                                     |
|      |                                                          |
|      v                                                          |
|  +---------------+                                             |
|  | Copilot Agent |  (10 Agents, 8K chars each)                 |
|  +-------+-------+                                             |
|          |                                                      |
|          v                                                      |
|  +---------------------------+                                 |
|  | Capability Dispatcher Flow |  (Routes to implementation)    |
|  +-----------+---------------+                                 |
|              |                                                  |
|              v                                                  |
|  +---------------------------+                                 |
|  | eap_capability_impl Table |  (Lookup implementation)        |
|  +-----------+---------------+                                 |
|              |                                                  |
|              v                                                  |
|  +---------------------------+                                 |
|  |   AI Builder Prompt       |  (26 Custom Prompts)            |
|  |   - Structured Input      |                                 |
|  |   - JSON Output           |                                 |
|  |   - Low Temperature       |                                 |
|  +-----------+---------------+                                 |
|              |                                                  |
|              v                                                  |
|  +---------------------------+                                 |
|  |   Telemetry Logging       |  (eap_telemetry table)          |
|  +---------------------------+                                 |
|                                                                 |
+-----------------------------------------------------------------+
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
| Current Model | Claude Sonnet 4 / Claude Opus 4 (varies by agent) |
| Model Flexibility | Can be switched to ChatGPT or other models as engineering provides within Microsoft tech stack |
| Max Input Tokens | 8,000 |
| Max Output Tokens | 2,500 |
| Default Temperature | 0.1 - 0.3 |
| Timeout | 30 - 60 seconds |
| Rate Limit | 60 requests/minute (environment limit) |

**Model Portability Note:** Claude models can easily be switched out for ChatGPT models or others as engineering provides within the Microsoft tech stack. The Capability Abstraction Layer ensures model changes require only configuration updates, not code changes.

### 1.4 Agent Configuration Table

The following table shows the current LLM model deployed for each agent, web search status, and other critical settings:

| Agent | LLM Model | Web Search | Temperature | Max Tokens | Critical Settings |
|-------|-----------|------------|-------------|------------|-------------------|
| **ORC** | Claude Sonnet 4 | Turned Off | 0.1 | 500 | Intent classification, low variance |
| **ANL** | Claude Opus 4 | Turned Off | 0.1-0.2 | 2,000 | Statistical precision required |
| **AUD** | Claude Sonnet 4 | Turned Off | 0.3 | 1,500 | Audience modeling |
| **CHA** | Claude Sonnet 4 | Turned On | 0.3 | 2,500 | Current benchmark data |
| **SPO** | Claude Opus 4 | Turned Off | 0.1 | 1,500 | Fee calculation precision |
| **DOC** | Claude Sonnet 4 | Turned Off | 0.5 | 4,000 | Document generation flexibility |
| **PRF** | Claude Opus 4 | Turned Off | 0.2 | 2,000 | Attribution analysis |
| **CST** | Claude Sonnet 4 | Turned On | 0.3 | 2,000 | Framework recommendations |
| **CHG** | Claude Sonnet 4 | Turned Off | 0.3 | 1,500 | Change management |
| **CA** | Claude Opus 4 | Turned Off | 0.2 | 2,000 | Business case analysis |
| **DOCS** | Claude Sonnet 4 | Turned Off | 0.3 | 1,500 | Documentation lookup |

**Key:** Web Search status indicates whether real-time web data retrieval is currently enabled for that agent. All settings can be easily adjusted.

---

## 2. Prompt Inventory

### 2.1 Complete Prompt Registry

MCMAP uses 26 AI Builder Custom Prompts organized by agent domain:

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
+-----------------------------------------------------------------+
|                    PROMPT STRUCTURE                             |
+-----------------------------------------------------------------+
|                                                                 |
|  SYSTEM MESSAGE                                                 |
|  +-- Role Definition                                            |
|  +-- Methodology/Framework                                      |
|  +-- Output Requirements                                        |
|  +-- Constraints                                                |
|  +-- Output Schema (JSON)                                       |
|                                                                 |
|  USER MESSAGE TEMPLATE                                          |
|  +-- Input Variables ({{variable}} syntax)                      |
|  +-- Context Data (JSON blocks)                                 |
|                                                                 |
|  FEW-SHOT EXAMPLES (2-3)                                        |
|  +-- Example Input                                              |
|  +-- Example Output                                             |
|                                                                 |
+-----------------------------------------------------------------+
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
| Methodology | Logarithmic response curves: Response = k x ln(1 + Spend/c) |
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
+-----------------------------------------------------------------+
|                MPA_Capability_Dispatcher                        |
+-----------------------------------------------------------------+
|                                                                 |
|  HTTP Request Trigger                                           |
|  +-- capability_code: string                                    |
|  +-- session_id: string                                         |
|  +-- parameters_json: object                                    |
|         |                                                       |
|         v                                                       |
|  Query eap_environment_config                                   |
|  +-- Get environment_code (MASTERCARD)                          |
|         |                                                       |
|         v                                                       |
|  Query eap_capability_implementation                            |
|  +-- Filter: capability_code AND environment_code               |
|  +-- Order: priority_order ASC                                  |
|  +-- Top: 1 (highest priority enabled)                          |
|         |                                                       |
|         v                                                       |
|  Switch on implementation_type                                  |
|  +-- AI_BUILDER_PROMPT -> Call MPA_Impl_AIBuilder               |
|  +-- DATAVERSE_LOGIC -> Execute inline Dataverse query          |
|  +-- POWER_FX -> Execute Power Fx expression                    |
|         |                                                       |
|         v                                                       |
|  Call MPA_Telemetry_Logger                                      |
|  +-- Log execution details                                      |
|         |                                                       |
|         v                                                       |
|  HTTP Response                                                  |
|  +-- Return result_json                                         |
|                                                                 |
+-----------------------------------------------------------------+
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
+-----------------------------------------------------------------+
|              CAPABILITY ABSTRACTION LAYER                       |
+-----------------------------------------------------------------+
|                                                                 |
|  Agent Request                                                  |
|  +-- capability_code: ANL_MARGINAL_RETURN                       |
|         |                                                       |
|         v                                                       |
|  +---------------------------------+                           |
|  |    Capability Dispatcher        |                           |
|  +---------------------------------+                           |
|         |                                                       |
|         v                                                       |
|  +---------------------------------+                           |
|  | Query eap_capability_impl       |                           |
|  | WHERE capability_code = X       |                           |
|  |   AND environment = MASTERCARD  |                           |
|  |   AND is_enabled = true         |                           |
|  | ORDER BY priority_order         |                           |
|  +---------------------------------+                           |
|         |                                                       |
|         v                                                       |
|  +---------------------------------+                           |
|  | Implementation Types:           |                           |
|  | +-- AI_BUILDER_PROMPT          |  (All capabilities)       |
|  | +-- DATAVERSE_LOGIC            |  (Lookups, CRUD)          |
|  | +-- POWER_FX                   |  (Simple calculations)    |
|  +---------------------------------+                           |
|         |                                                       |
|         v                                                       |
|  Route to Implementation -> Execute -> Return Result              |
|                                                                 |
+-----------------------------------------------------------------+
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

### 8.1 Copilot Studio -> Flow Integration

Copilot agents invoke flows using the Power Automate action:

```
+-----------------------------------------------------------------+
|            COPILOT -> FLOW INTEGRATION                           |
+-----------------------------------------------------------------+
|                                                                 |
|  Copilot Studio Agent                                           |
|  +-- Topic: Calculate Projections                               |
|       +-- Power Automate Action                                 |
|            +-- Flow: MPA_Capability_Dispatcher                  |
|            +-- Input:                                           |
|            |   +-- capability_code: ANL_PROJECTION              |
|            |   +-- session_id: {sessionId}                      |
|            |   +-- parameters_json: {budget, channels, ...}     |
|            +-- Output:                                          |
|                +-- result_json: {projections, confidence, ...}  |
|                                                                 |
+-----------------------------------------------------------------+
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

## 11. Agent Expansion Opportunities

The following table outlines short and medium-term agent expansion opportunities across teams, departments, and business units:

### Short-Term Expansion Opportunities (3-6 months)

| Business Area | Agent Opportunity | Value Driver | MCMAP Connection |
|---------------|-------------------|--------------|------------------|
| **Sales Enablement** | Proposal Generator Agent | Faster sales cycles, consistent quality | DOC + ANL patterns |
| **Client Success** | Account Health Monitor | Retention, upsell identification | PRF + AUD patterns |
| **Finance** | Forecast & Variance Agent | Better planning accuracy | ANL patterns |
| **HR Onboarding** | New Hire Navigator | Faster productivity, better experience | CST patterns |
| **Legal/Compliance** | Policy Q&A Agent | Reduced legal inquiries | KB + ORC patterns |
| **IT Support** | Tier 1 Support Agent | Reduced ticket volume | ORC + CST patterns |

### Medium-Term Expansion Opportunities (6-12 months)

| Business Area | Agent Opportunity | Value Driver | MCMAP Connection |
|---------------|-------------------|--------------|------------------|
| **Product Development** | Market Research Agent | Faster insights, competitive intel | CHA + AUD patterns |
| **Procurement** | Vendor Assessment Agent | Better supplier decisions | ANL + SPO patterns |
| **Risk Management** | Compliance Monitor Agent | Continuous compliance | PRF patterns |
| **Partner Ecosystem** | Partner Enablement Agent | Faster partner onboarding | DOC + CST patterns |
| **Data Products** | Insights Assistant Agent | Self-service analytics | ANL + AUD patterns |
| **Client Delivery** | Project Health Agent | Proactive issue detection | PRF + CHG patterns |

### External/Client-Facing Expansion (12+ months)

| Offering | Agent Opportunity | Revenue Model | MCMAP Connection |
|----------|-------------------|---------------|------------------|
| **Licensed Agents** | Clients deploy branded agents | Subscription | Full platform |
| **Agent-as-a-Service** | Hosted agents via API | Usage-based | All agent patterns |
| **Partner Extensions** | Third parties build on MCMAP | Revenue share | Platform SDK |
| **Data-Enhanced Agents** | Agents with MC data products | Premium licensing | AUD + ANL + data |

---

## 12. The Ask: AI Governance Partnership

**Bring MCMAP into full Mastercard AI governance model:**

| Ask | Description | Benefit |
|-----|-------------|---------|
| **AI Governance Integration** | Incorporate MCMAP into MC's enterprise AI governance framework | Formal oversight, policy alignment |
| **Platform Expansion Support** | Resources to enhance and expand platform for internal and external use cases | Accelerated capability delivery |
| **Strategic Partnership** | Establish ongoing collaboration between AI business leads and strategic business units | Business-driven development |
| **Dedicated Engineering Pods** | Engineering pods assigned to AI Business leads | Rapid iteration capacity |
| **Dev Environment Access** | Development environments firewalled from MC data for demos, prototypes, and sales | Safe innovation space |

**Development Environment Requirements:**

Safe environments that enable rapid prototyping without risk to production data:
- Isolated from Mastercard production data
- Full platform capabilities for building and testing
- Ability to demonstrate to clients and prospects
- Support for rapid iteration on new agent concepts
- Access for sales and delivery teams to create client-specific demos

**Operational Model:**

Minimal engineering support required. The platform is designed so that consultants and staff can build to suit within MC DLP constraints. Engineering involvement focuses on:
- Platform infrastructure maintenance
- Security and compliance oversight
- Performance optimization
- New capability enablement (when needed)

---

## Document References

| Document | Purpose |
|----------|---------|
| [00-MCMAP_Strategic_Platform_Vision.md](./00-MCMAP_Strategic_Platform_Vision.md) | Strategic overview |
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
