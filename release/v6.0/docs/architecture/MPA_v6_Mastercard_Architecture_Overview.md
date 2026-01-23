# MPA v6.0 MASTERCARD ARCHITECTURE OVERVIEW

**Version:** 2.2  
**Date:** January 23, 2026  
**Status:** Production Ready  
**Target Environment:** Mastercard (DLP-Restricted)  
**Branch:** deploy/mastercard

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Platform Metrics](#2-platform-metrics)
3. [Agent Architecture](#3-agent-architecture)
4. [Knowledge Base Architecture](#4-knowledge-base-architecture)
5. [AI Builder Integration](#5-ai-builder-integration)
6. [Dataverse Schema](#6-dataverse-schema)
7. [Capability Framework](#7-capability-framework)
8. [Deployment Constraints](#8-deployment-constraints)
9. [v6.6 Capability Expansions](#9-v66-capability-expansions)
10. [Conversational Topic Architecture](#10-conversational-topic-architecture)
11. [Deep Reasoning Integration](#11-deep-reasoning-integration)
12. [Behavioral Safeguards](#12-behavioral-safeguards)
13. [KB-First Retrieval Pattern](#13-kb-first-retrieval-pattern)
14. [Instruction Audit Remediation](#14-instruction-audit-remediation)
15. [Implementation Checklist](#15-implementation-checklist)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Architecture Overview

The Media Planning Agent (MPA) v6.0 implements a **10 Agents + Deep Modules** architecture optimized for Mastercard's DLP-restricted environment. The platform operates entirely within approved Power Platform connectors, using AI Builder Custom Prompts as the primary computation layer.

### 1.2 Environment Context

The Mastercard environment operates under strict Data Loss Prevention (DLP) policies that block:
- HTTP connectors (all external destinations)
- Custom connectors
- Azure Functions direct integration
- External API calls

All capabilities must be implemented using AI Builder prompts, Power Automate approved connectors, and Dataverse operations.

### 1.3 Key Differentiators

- **No HTTP Dependencies**: All computation through AI Builder prompts
- **SharePoint KB Hosting**: Knowledge base files deployed to SharePoint library
- **Dataverse-Only Data Layer**: All session state, configuration, and telemetry in Dataverse
- **Copilot Studio Agents**: 10 specialized agents with 8K character instruction limits
- **Conversational Topics**: v7 topic architecture for new Copilot Studio interface
- **KB-First Retrieval**: Mandatory knowledge base retrieval before responding to domain questions
- **Domain Scope Boundaries**: Explicit boundaries preventing cross-domain confusion

### 1.4 Recent Updates (January 2026)

- Complete instruction file audit and remediation for all 10 agents
- KB Critical Path Enhancement with proactive intelligence patterns
- DOMAIN SCOPE boundaries added to all specialist agents
- MANDATORY RESPONSE SEQUENCE enforcing KB-first retrieval
- Consistent behavioral safeguards across all agent instructions
- Deep Reasoning keyword integration for extended analysis triggers
- ORC guardrails preventing autonomous plan completion and web search

---

## 2. PLATFORM METRICS

### 2.1 Current Metrics (v6.0 + v6.6 Expansions + Remediation)

| Metric | Value | Notes |
|--------|-------|-------|
| Total Agents | 10 | ORC, ANL, AUD, CHA, CHG, CST, DOC, MKT, PRF, SPO |
| Agent KB Files | 135 | Distributed across all agents |
| EAP Platform KB Files | 5 | Shared platform knowledge |
| Total KB Files | 140 | All knowledge base content |
| Instruction Space | 80,000 chars | 8K per agent x 10 agents |
| Instruction Utilization | 47-60% | Post-remediation optimization |
| AI Builder Prompts | 69 | Copilot-compliant .txt format |
| Dataverse Tables | 24 | EAP platform + MPA domain tables |
| Power Automate Flows | 28+ | Session, routing, computation, telemetry |
| Vertical Overlays | 12 | Industry-specific supplements |

### 2.2 KB File Distribution by Agent

| Agent | KB Files | Primary Domain |
|-------|----------|----------------|
| ANL | 23 | Analytics, projections, modeling, competitive intelligence |
| AUD | 26 | Audience segmentation, targeting, lifecycle management |
| CHA | 13 | Channel mix, allocation, flighting optimization |
| CHG | 3 | Change management, adoption planning |
| CST | 4 | Consulting strategy, frameworks |
| DOC | 7 | Document generation, automation |
| MKT | 7 | Marketing strategy, competitive positioning |
| ORC | 5 | Orchestration, routing, workflow gates |
| PRF | 32 | Performance monitoring, attribution, learning extraction |
| SPO | 15 | Supply path optimization, programmatic fees |

### 2.3 EAP Platform KB Files

| File | Purpose |
|------|---------|
| EAP_KB_Azure_ML_Integration_v1.txt | ML model integration patterns |
| EAP_KB_ML_Model_Specifications_v1.txt | Model specifications and endpoints |
| EAP_KB_Proactive_Intelligence_v1.txt | Proactive insight triggers and patterns |
| EAP_KB_Realtime_Benchmarks_v1.txt | Benchmark data and calculation triggers |
| EAP_KB_Visual_Decision_Trees_v1.txt | Visual decision support patterns |

---

## 3. AGENT ARCHITECTURE

### 3.1 Complete Agent Inventory

| Code | Name | Responsibility | Instructions | Core KB | Deep Modules |
|------|------|----------------|--------------|---------|--------------|
| ORC | Orchestrator | Intent classification, routing, session management | 8K chars | 1 | 4 |
| ANL | Analytics | Projections, calculations, modeling, competitive analysis | 8K chars | 1 | 22 |
| AUD | Audience | Segmentation, targeting, journeys, lifecycle | 8K chars | 1 | 25 |
| CHA | Channel | Channel mix, allocation, flighting, frequency | 8K chars | 1 | 12 |
| CHG | Change Management | Adoption planning, readiness, stakeholder mapping | 8K chars | 1 | 2 |
| CST | Consulting Strategy | Strategic frameworks, prioritization, engagement | 8K chars | 1 | 3 |
| DOC | Document | Document generation, templates, automation | 8K chars | 1 | 6 |
| MKT | Marketing | Brand positioning, competitive messaging, GTM | 8K chars | 1 | 6 |
| PRF | Performance | Monitoring, attribution, optimization, learning extraction | 8K chars | 1 | 31 |
| SPO | Supply Path | Programmatic optimization, NBI, fees | 8K chars | 1 | 14 |

### 3.2 Agent Interaction Pattern

```
USER MESSAGE
     │
     ▼
┌───────────────────────────────────────────────────────────────────┐
│                    ORC - ORCHESTRATOR                              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 1. Receive user message                                       │ │
│  │ 2. Query eap_agent table for capability matching              │ │
│  │ 3. Classify intent via AI Builder prompt                      │ │
│  │ 4. Route to specialist agent via conversational topic         │ │
│  │ 5. Maintain session state in Dataverse                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
     │
     ▼ (Handoff via Conversational Topic)
┌───────────────────────────────────────────────────────────────────┐
│              SPECIALIST AGENTS (ANL, AUD, CHA, etc.)               │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 1. Receive context from ORC handoff                           │ │
│  │ 2. MANDATORY: Retrieve relevant KB via SharePoint search      │ │
│  │ 3. Execute capabilities via AI Builder prompts                │ │
│  │ 4. Store results in session memory                            │ │
│  │ 5. Return to ORC or continue conversation                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

### 3.3 Routing Logic

Routing is deterministic via Dataverse lookup, not RAG-based retrieval:

- **Primary Routing**: Intent keywords to `eap_agent.capability_tags` matching
- **Secondary Routing**: Topic classification via AI Builder `ORC_INTENT` prompt
- **Fallback Routing**: ORC handles unmatched intents with clarification

### 3.4 Domain Scope Boundaries

Each specialist agent has explicit DOMAIN SCOPE instructions that:
- Define exactly what questions fall within the agent's expertise
- List specific topics that should be redirected to other agents
- Prevent cross-domain confusion and hallucination
- Require routing acknowledgment before handoff

---

## 4. KNOWLEDGE BASE ARCHITECTURE

### 4.1 KB Structure Pattern

Each agent follows a consistent KB structure:

```
{AGENT}/kb/
├── {AGENT}_KB_Core_v1.txt              # Always retrieved - foundational methodology
├── {AGENT}_KB_Module1_v1.txt           # Deep module - retrieved by context
├── {AGENT}_KB_Module2_v1.txt           # Deep module - retrieved by context
└── ...
```

### 4.2 KB File Compliance Requirements

All KB files must comply with Copilot Studio retrieval requirements:

| Requirement | Specification |
|-------------|---------------|
| Format | Plain text (.txt) |
| Character Limit | 36,000 characters maximum |
| Headers | ALL-CAPS for section headers |
| Lists | Hyphens only (no bullets, no numbers) |
| Characters | ASCII only (no Unicode, no special chars) |
| Encoding | UTF-8 without BOM |

### 4.3 SharePoint KB Deployment

KB files are deployed to a SharePoint document library linked to Copilot Studio:

**SharePoint Library Structure:**
```
/sites/MasterCardCopilotKB/
├── Shared Documents/
│   ├── ANL/
│   │   ├── ANL_KB_Analytics_Engine_v1.txt
│   │   ├── ANL_KB_Budget_Pacing_v1.txt
│   │   ├── ANL_KB_Competitive_Intelligence_v1.txt
│   │   └── ... (23 files)
│   ├── AUD/
│   │   ├── AUD_KB_Audience_Lifecycle_v1.txt
│   │   └── ... (26 files)
│   ├── CHA/
│   │   └── ... (13 files)
│   ├── CHG/
│   │   └── ... (3 files)
│   ├── CST/
│   │   └── ... (4 files)
│   ├── DOC/
│   │   └── ... (7 files)
│   ├── MKT/
│   │   └── ... (7 files)
│   ├── ORC/
│   │   └── ... (5 files)
│   ├── PRF/
│   │   └── ... (32 files)
│   ├── SPO/
│   │   └── ... (15 files)
│   └── EAP/
│       └── ... (5 files)
```

---

## 5. AI BUILDER INTEGRATION

### 5.1 AI Builder Prompt Catalog

The platform includes 69 AI Builder Custom Prompts distributed across agents:

| Agent | Prompts | Key Capabilities |
|-------|---------|------------------|
| ANL | 12 | Breakeven, NPV, IRR, Payback, Monte Carlo, SOV, Pace Forecast |
| AUD | 10 | NBA, Cohort Migration, Decay Prediction, Lookalike Scoring |
| CHA | 8 | Response Curves, Flighting, Frequency, Daypart Analysis |
| CHG | 3 | Adoption, Readiness, Stakeholder Mapping |
| CST | 4 | Framework Selection, Prioritization, Strategic Analysis |
| DOC | 6 | QBR, Deck, Business Case, RFP, Comp Report |
| MKT | 6 | Brand Positioning, Campaign Strategy, GTM, Competitive Gaps |
| PRF | 16 | Attribution (4 models), Forecasting (4 methods), Testing (5), Learning Extraction (4) |
| SPO | 4 | NBI Calculation, Fee Analysis, Partner Evaluation |

### 5.2 AI Builder Prompt Format

All prompts follow Copilot-compliant plain text format:

**Example: ANL_BREAKEVEN_CALC_PROMPT.txt**
```
PROMPT NAME: ANL-BREAKEVEN-CALC

PURPOSE
Calculate breakeven point for marketing investment based on provided parameters.

INPUT PARAMETERS
- investment_amount: Total marketing investment in dollars
- average_order_value: Average revenue per conversion
- conversion_rate: Expected conversion rate (decimal)
- margin_percent: Profit margin percentage

OUTPUT FORMAT
Return JSON with:
- breakeven_units: Number of conversions needed
- breakeven_revenue: Revenue required to break even
- days_to_breakeven: Estimated days based on daily conversion rate
- confidence_level: High/Medium/Low based on data quality

CALCULATION LOGIC
- Calculate cost per conversion
- Determine contribution margin per unit
- Divide investment by contribution margin
- Apply confidence adjustment based on data completeness
```

### 5.3 Mastercard-Specific Prompt Configuration

In Mastercard environment, all prompts are deployed via AI Builder Custom Prompt interface:

- Navigate to make.powerapps.com then AI Builder then Custom prompts
- Create new prompt with name matching `{AGENT}_{CAPABILITY}_PROMPT`
- Copy prompt content from `.txt` file
- Configure input parameters as Dynamic content
- Save and test with sample inputs
- Enable for use in Power Automate flows

---

## 6. DATAVERSE SCHEMA

### 6.1 Table Categories

**EAP Platform Tables (15):**
| Table | Purpose |
|-------|---------|
| eap_agent | Agent registry with capability tags |
| eap_capability | Capability definitions and metadata |
| eap_capability_implementation | Implementation mappings by environment |
| eap_client | Client configuration |
| eap_featureflag | Feature toggles |
| eap_proactive_trigger | Proactive intelligence triggers |
| eap_prompt | AI Builder prompt registry |
| eap_session | Active session tracking |
| eap_telemetry | Usage and performance logging |
| eap_test_case | Golden test cases |
| eap_trigger_history | Trigger execution history |
| eap_user | User profiles and preferences |
| eap_workflow_contribution | Workflow step contributions |
| eap_workflow_definition | Workflow definitions |

**MPA Domain Tables (6):**
| Table | Purpose |
|-------|---------|
| mpa_benchmark | Industry benchmarks by vertical/channel |
| mpa_channel | Channel registry with attributes |
| mpa_kpi | KPI definitions and targets |
| mpa_partner | Partner/vendor registry |
| mpa_session_memory | Session-scoped memory store |
| mpa_vertical | Industry vertical definitions |
| mpa_user_preferences | User-specific preferences |

**CA Domain Tables (3):**
| Table | Purpose |
|-------|---------|
| ca_deliverable | Consulting deliverables |
| ca_framework | Strategic frameworks |
| ca_project | Project tracking |

### 6.2 Key Table Schemas

**eap_agent Schema:**
```
- eap_agentid (Uniqueidentifier, PK)
- agent_code (Text, 20, Required, Unique) - e.g., "ANL", "AUD"
- agent_name (Text, 100, Required)
- description (Multiline Text, 4000)
- capability_tags (Text, 500) - Comma-separated keywords for routing
- routing_priority (Whole Number, Default: 100)
- is_active (Boolean, Default: true)
- version (Text, 20, Default: "1.0")
```

**eap_capability Schema:**
```
- eap_capabilityid (Uniqueidentifier, PK)
- capability_code (Text, 50, Required, Unique) - e.g., "ANL_BREAKEVEN_CALC"
- capability_name (Text, 100, Required)
- agent_code (Text, 20, Required)
- description (Multiline Text, 2000)
- input_schema (Multiline Text, 8000) - JSON schema
- output_schema (Multiline Text, 8000) - JSON schema
- is_active (Boolean, Default: true)
```

**eap_session Schema:**
```
- eap_sessionid (Uniqueidentifier, PK)
- session_code (Text, 50, Required, Unique)
- user_id (Lookup to eap_user)
- client_id (Lookup to eap_client)
- current_agent (Text, 20)
- workflow_stage (Text, 50)
- started_at (DateTime)
- last_activity (DateTime)
- is_active (Boolean, Default: true)
```

---

## 7. CAPABILITY FRAMEWORK

### 7.1 Capability Abstraction Layer

The Capability Abstraction Layer routes requests to environment-appropriate implementations:

```
AGENT REQUEST
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│           CAPABILITY DISPATCHER (Power Automate)                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 1. Look up capability_code in eap_capability               │  │
│  │ 2. Query eap_capability_implementation for environment     │  │
│  │ 3. Get implementation with lowest priority_order           │  │
│  │ 4. Route to implementation (AI Builder in Mastercard)      │  │
│  │ 5. Return result with execution metadata                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│              MASTERCARD: AI BUILDER PROMPT                       │
│  - All capabilities implemented via Custom Prompts               │
│  - No HTTP connectors required                                   │
│  - DLP-compliant by design                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Capability Registration

Capabilities are registered in `eap_capability_implementation`:

| capability_id | implementation_type | environment_code | priority_order | configuration |
|---------------|---------------------|------------------|----------------|---------------|
| ANL_BREAKEVEN | AI_BUILDER | MASTERCARD | 1 | {"prompt_name": "ANL_BREAKEVEN_CALC"} |
| ANL_BREAKEVEN | AI_BUILDER | PERSONAL | 2 | {"prompt_name": "ANL_BREAKEVEN_CALC"} |
| ANL_BREAKEVEN | AZURE_FUNCTION | PERSONAL | 1 | {"function_url": "..."} |

In Mastercard, only AI_BUILDER implementations are available and active.

---

## 8. DEPLOYMENT CONSTRAINTS

### 8.1 Mastercard DLP Restrictions

**BLOCKED (DLP Policy):**
- HTTP connector (all external destinations)
- Custom connectors
- Azure Functions direct calls
- External API integrations
- WebSocket connections

**ALLOWED:**
- Copilot Studio (10 agents)
- SharePoint (KB hosting)
- Dataverse (all operations)
- Power Automate Premium (approved connectors)
- AI Builder Custom Prompts
- AI Builder Models
- Standard connectors: Office 365, Teams, SharePoint, Approvals

### 8.2 Copilot Studio Constraints

| Constraint | Limit | Mitigation |
|------------|-------|------------|
| Instructions | 8,000 characters | Deep modules in KB |
| KB file size | 36,000 characters | Split into modules |
| Topic complexity | Limited nesting | Conversational topics |
| Handoff data | ~4,000 characters | Session memory in Dataverse |
| Concurrent sessions | Environment-dependent | Session isolation |

### 8.3 Power Automate Constraints

| Constraint | Limit | Mitigation |
|------------|-------|------------|
| Flow run duration | 30 days max | Checkpoint patterns |
| Actions per flow | 500 max | Flow composition |
| Nested depth | 8 levels | Flatten logic |
| HTTP blocked | DLP | AI Builder alternatives |

---

## 9. V6.6 CAPABILITY EXPANSIONS

### 9.1 Expansion Overview

v6.6 added 24 new capabilities across 6 expansion areas:

| Expansion | Focus Area | New Capabilities | Agents |
|-----------|------------|------------------|--------|
| 10 | Competitive Intelligence | 4 | ANL, MKT |
| 11 | Budget Pacing and Scenarios | 4 | ANL |
| 12 | Audience Lifecycle | 4 | AUD |
| 13 | Flighting Optimization | 4 | CHA |
| 14 | Learning Extraction | 4 | PRF |
| 15 | Document Automation | 4 | DOC |

### 9.2 Expansion 10: Competitive Intelligence Suite

**New Capabilities:**
- `ANL_COMP_SPEND` - Analyze competitive spending patterns
- `ANL_SOV_ANALYZE` - Share of voice analysis
- `MKT_COMP_GAPS` - Identify competitive gaps
- `MKT_COMP_MESSAGING` - Competitive messaging analysis

**New KB Files:**
- `ANL_KB_Competitive_Intelligence_v1.txt`
- `MKT_KB_Competitive_Positioning_v1.txt`

### 9.3 Expansion 11: Budget Pacing and Scenario Engine

**New Capabilities:**
- `ANL_BREAKEVEN_CALC` - Breakeven point calculation
- `ANL_PACE_FORECAST` - Budget pacing forecast
- `ANL_PACE_RECOMMEND` - Pacing recommendations
- `ANL_SCENARIO_COMPARE` - Multi-scenario comparison

**New KB Files:**
- `ANL_KB_Budget_Pacing_v1.txt`

### 9.4 Expansion 12: Audience Lifecycle Management

**New Capabilities:**
- `AUD_COHORT_MIGRATE` - Cohort migration analysis
- `AUD_DECAY_PREDICT` - Audience decay prediction
- `AUD_LOOKALIKE_SCORE` - Lookalike scoring
- `AUD_REFRESH_RECOMMEND` - Audience refresh recommendations

**New KB Files:**
- `AUD_KB_Audience_Lifecycle_v1.txt`

### 9.5 Expansion 13: Flighting and Timing Optimization

**New Capabilities:**
- `CHA_DAYPART_ANALYZE` - Daypart performance analysis
- `CHA_FLIGHT_OPTIMIZE` - Flight timing optimization
- `CHA_FREQ_CROSS` - Cross-platform frequency management
- `CHA_SEASON_ADJUST` - Seasonal adjustment recommendations

**New KB Files:**
- `CHA_KB_Flighting_Optimization_v1.txt`

### 9.6 Expansion 14: Learning Extraction and Insight Synthesis

**New Capabilities:**
- `PRF_INSIGHT_CROSS` - Cross-campaign insight synthesis
- `PRF_LEARNING_EXTRACT` - Learning extraction from campaigns
- `PRF_PATTERN_DETECT` - Performance pattern detection
- `PRF_PLAYBOOK_GEN` - Playbook generation

**New KB Files:**
- `PRF_KB_Learning_Extraction_v1.txt`
- `PRF_KB_Learning_Extraction_v2.txt`

### 9.7 Expansion 15: Document Automation Suite

**New Capabilities:**
- `DOC_COMP_REPORT` - Competitive report generation
- `DOC_DECK_CREATE` - Presentation deck creation
- `DOC_QBR_GENERATE` - Quarterly business review generation
- `DOC_RFP_RESPOND` - RFP response generation

**New KB Files:**
- `DOC_KB_Document_Automation_v1.txt`

---

## 10. CONVERSATIONAL TOPIC ARCHITECTURE

### 10.1 v7 Topic Structure

The v7 architecture uses conversational topics for the new Copilot Studio interface:

**Topic Types:**
- **System Topics** - Built-in Copilot behaviors
- **Routing Topics** - Intent classification and agent handoff
- **Specialist Topics** - Domain-specific conversation flows
- **Fallback Topics** - Error handling and clarification

### 10.2 Routing Topic Pattern

```
TOPIC: Route_To_Analytics

TRIGGER PHRASES:
- analyze my budget
- calculate projections
- forecast performance
- run scenarios
- show analytics

CONVERSATION FLOW:
- Confirm intent classification
- Extract key parameters from user message
- Store context in session memory (Dataverse)
- Invoke handoff to ANL agent
- Pass conversation context via Activity.Text
```

### 10.3 Specialist Agent Topic Pattern

```
TOPIC: ANL_Budget_Analysis

TRIGGER: Handoff from ORC with budget intent

CONVERSATION FLOW:
- Receive context from handoff
- MANDATORY: Retrieve relevant KB (ANL_KB_Budget_Pacing_v1.txt)
- Ask clarifying questions if needed
- Execute capability via Power Automate flow
- Present results with recommendations
- Offer follow-up actions or return to ORC
```

### 10.4 KB Retrieval Integration

Instructions must include explicit KB retrieval guidance:

```
KNOWLEDGE BASE RETRIEVAL

ALWAYS search the knowledge base before responding to domain questions.
Use these retrieval patterns:

For budget questions:
- Search: "budget pacing forecast allocation"
- Primary KB: ANL_KB_Budget_Pacing_v1.txt

For scenario analysis:
- Search: "scenario comparison modeling"
- Primary KB: ANL_KB_Scenario_Modeling_v1.txt

NEVER respond to domain questions without first retrieving relevant KB content.
```

---

## 11. DEEP REASONING INTEGRATION

### 11.1 Deep Reasoning Triggers

All agent instructions include Deep Reasoning keyword integration that triggers extended analysis mode:

**Trigger Keywords:**
- "deep analysis"
- "comprehensive review"
- "detailed examination"
- "thorough assessment"
- "full investigation"

### 11.2 Deep Reasoning Behavior

When Deep Reasoning is triggered:
- Agent retrieves Core KB first for foundational methodology
- Then retrieves relevant Deep Module KB for specialized content
- Cross-references multiple KB sources when topic spans domains
- Synthesizes findings into coherent recommendation
- Indicates when deep research mode is engaged and what sources inform the response

### 11.3 Deep Modules by Agent

| Agent | Deep Modules Available |
|-------|------------------------|
| ANL | MMM Methods, Bayesian Inference, Causal Incrementality, Budget Optimization, Competitive Intelligence |
| AUD | Identity Resolution, LTV Modeling, Propensity ML, Journey Orchestration, Lifecycle Management |
| CHA | Allocation Methods, Emerging Channels, Platform Playbooks, Flighting Optimization |
| PRF | Attribution Methods, Anomaly Detection, Learning Extraction, Pattern Detection |
| SPO | Fee Analysis, Partner Evaluation, NBI Calculation, Working Media Analysis |

---

## 12. BEHAVIORAL SAFEGUARDS

### 12.1 Consistent Safeguards Pattern

All agent instructions now include consistent safeguards that:
- Prevent autonomous plan completion without user confirmation
- Block web search and external data retrieval attempts
- Enforce KB-first retrieval before any domain response
- Require explicit routing acknowledgment before handoffs
- Maintain workflow stage boundaries

### 12.2 ORC-Specific Guardrails

The Orchestrator includes additional guardrails:
- Cannot proceed through gates without explicit user validation
- Cannot generate documents without DOC agent involvement
- Cannot make projections without ANL agent calculations
- Cannot skip workflow steps for expedience
- Cannot expose internal routing mechanics to users

### 12.3 Specialist Safeguards

Each specialist agent includes:
- DOMAIN SCOPE section defining exact expertise boundaries
- Explicit list of topics requiring routing to other agents
- PROHIBITED BEHAVIORS preventing cross-domain responses
- MANDATORY routing for out-of-scope questions

---

## 13. KB-FIRST RETRIEVAL PATTERN

### 13.1 Mandatory Response Sequence

All specialist agents enforce the KB-First Retrieval Pattern:

```
MANDATORY RESPONSE SEQUENCE

STEP 1: RETRIEVE
Before responding to any domain question:
- Search knowledge base for relevant content
- Identify primary KB file for topic
- Extract relevant methodology and data

STEP 2: REASON
Apply KB methodology to user's specific context:
- Map user inputs to KB frameworks
- Apply calculations from KB guidance
- Identify gaps requiring clarification

STEP 3: RESPOND
Provide response grounded in KB:
- Cite KB source for recommendations
- Include confidence level
- Offer next steps based on workflow

NEVER skip Step 1. NEVER reason without KB context.
```

### 13.2 Retrieval Search Patterns

Each agent has specific search patterns for common query types:

**ANL Search Patterns:**
- Budget questions: "budget pacing forecast allocation projection"
- Scenario analysis: "scenario comparison monte carlo sensitivity"
- ROI calculations: "roi roas ltv cac breakeven payback"

**AUD Search Patterns:**
- Segmentation: "segment rfm cohort clustering"
- Targeting: "lookalike targeting audience decay"
- LTV: "lifetime value modeling prediction"

**CHA Search Patterns:**
- Allocation: "channel allocation budget distribution"
- Mix optimization: "media mix response curve diminishing"
- Frequency: "frequency capping cross-platform"

---

## 14. INSTRUCTION AUDIT REMEDIATION

### 14.1 Audit Summary

Complete instruction file audit performed January 22, 2026 identified and remediated:

| Issue Category | Files Affected | Resolution |
|----------------|----------------|------------|
| 6-Rule Compliance (numbered lists) | All 10 | Converted to hyphens |
| Self-Learning Section | 8 agents | Added standard template |
| Proactive Intelligence | 6 agents | Added trigger patterns |
| Confidence Communication | 6 agents | Added level definitions |
| Deep Research Mode | 9 agents | Added retrieval guidance |
| Cross-Routing Rules | 5 agents | Added routing destinations |

### 14.2 Post-Remediation Metrics

| Agent | Pre-Audit Chars | Post-Audit Chars | Utilization |
|-------|-----------------|------------------|-------------|
| ORC | 4,307 | ~5,200 | 65% |
| ANL | 4,080 | ~5,000 | 63% |
| AUD | 4,145 | ~5,500 | 69% |
| CHA | 4,413 | ~5,300 | 66% |
| CHG | 3,777 | ~4,800 | 60% |
| CST | 3,397 | ~4,500 | 56% |
| DOC | 3,960 | ~4,900 | 61% |
| MKT | 3,996 | ~5,400 | 68% |
| PRF | 4,791 | ~5,500 | 69% |
| SPO | 4,125 | ~5,300 | 66% |

### 14.3 6-Rule Compliance Checklist

All instruction files verified against:
- **Rule 1**: ALL-CAPS section headers PASS
- **Rule 2**: Hyphens-only lists (no numbered lists) PASS
- **Rule 3**: ASCII characters only PASS
- **Rule 4**: Zero visual dependencies PASS
- **Rule 5**: Mandatory language (no hedging) PASS
- **Rule 6**: Professional tone PASS

---

## 15. IMPLEMENTATION CHECKLIST

### 15.1 Pre-Deployment Checklist

**Environment Setup:**
- [ ] Verify Mastercard Power Platform environment access
- [ ] Confirm AI Builder licensing (Premium)
- [ ] Create SharePoint site for KB hosting
- [ ] Verify Dataverse database provisioned
- [ ] Confirm user permissions for Copilot Studio

**Repository Preparation:**
- [ ] Clone deploy/mastercard branch
- [ ] Verify all KB files are plain text (.txt)
- [ ] Run compliance validation script
- [ ] Confirm all prompts in Copilot-compliant format
- [ ] Verify instruction files pass 6-Rule compliance

### 15.2 Dataverse Deployment

**Table Creation Order (Dependency-Based):**

**Tier 1 - No Dependencies:**
- eap_agent
- eap_client
- eap_user
- eap_featureflag
- mpa_vertical
- mpa_channel
- mpa_kpi
- mpa_partner

**Tier 2 - Platform Tables:**
- eap_capability (depends on eap_agent)
- eap_prompt (depends on eap_agent)
- mpa_benchmark (depends on mpa_vertical, mpa_channel, mpa_kpi)

**Tier 3 - Implementation Tables:**
- eap_capability_implementation (depends on eap_capability)
- eap_test_case (depends on eap_capability)

**Tier 4 - Session Tables:**
- eap_session (depends on eap_user, eap_client)
- mpa_session_memory (depends on eap_session)
- eap_telemetry
- eap_proactive_trigger
- eap_trigger_history
- eap_workflow_definition
- eap_workflow_contribution

### 15.3 KB Deployment

**SharePoint Library Setup:**
- Create SharePoint site: `MasterCardCopilotKB`
- Create document library: `Shared Documents`
- Create folders for each agent: ANL, AUD, CHA, CHG, CST, DOC, MKT, ORC, PRF, SPO, EAP
- Upload KB files to respective folders
- Link library to Copilot Studio knowledge source

### 15.4 AI Builder Prompt Deployment

**For Each Prompt (69 total):**
- Navigate to make.powerapps.com then AI Builder then Custom prompts
- Click "Create custom prompt"
- Set name matching file name (e.g., `ANL_BREAKEVEN_CALC`)
- Copy prompt content from `base/platform/eap/prompts/ai_builder_txt/{PROMPT}.txt`
- Configure input parameters
- Save and test
- Enable for use in flows

### 15.5 Agent Deployment

**For Each Agent (10 total):**
- Navigate to Copilot Studio
- Create new agent with name: `EAP_{AGENT}_Agent` (e.g., `EAP_ANL_Agent`)
- Copy instructions from `release/v6.0/agents/{agent}/instructions/{AGENT}_Copilot_Instructions_v1.txt`
- Verify character count is 8,000 or less
- Verify 6-Rule compliance
- Link SharePoint KB folder as knowledge source
- Create conversational topics per MPA_v7_Conversational_Topic_Guide.md
- Configure handoff topics for routing
- Publish agent

### 15.6 Post-Deployment Validation

**Functional Tests:**
- [ ] ORC correctly classifies intents
- [ ] Routing to specialists works
- [ ] KB retrieval returns relevant content (KB-First enforced)
- [ ] AI Builder prompts execute correctly
- [ ] Session memory persists across turns
- [ ] Telemetry captures all interactions
- [ ] Domain scope boundaries respected
- [ ] Deep Reasoning triggers activate correctly

**Integration Tests:**
- [ ] Full workflow: Budget planning scenario
- [ ] Full workflow: Audience targeting scenario
- [ ] Full workflow: Performance analysis scenario
- [ ] Handoff chain: ORC to ANL to PRF to ORC

---

## APPENDICES

### Appendix A: File Locations

| Content Type | Repository Path |
|--------------|-----------------|
| Agent Instructions | `release/v6.0/agents/{agent}/instructions/` |
| KB Files | `release/v6.0/agents/{agent}/kb/` |
| EAP KB Files | `release/v6.0/platform/eap/kb/` |
| AI Builder Prompts (TXT) | `base/platform/eap/prompts/ai_builder_txt/` |
| AI Builder Prompts (JSON) | `base/platform/eap/prompts/ai_builder/` |
| Dataverse Schemas | `base/dataverse/schema/` |
| Seed Data | `release/v6.0/platform/seed/` |
| Solution Packages | `release/v6.0/solutions/` |
| Deployment Scripts | `release/v6.0/scripts/` |

### Appendix B: Related Documents

| Document | Location |
|----------|----------|
| Dataverse Schema | `release/v6.0/docs/architecture/MPA_v6_Dataverse_Schema.md` |
| AI Builder Prompts | `release/v6.0/docs/architecture/MPA_v6_AI_Builder_Prompts.md` |
| Deployment Instructions | `release/v6.0/docs/VSCODE_DEPLOYMENT_INSTRUCTIONS.md` |
| Conversational Topic Guide | `docs/MPA_v7_Conversational_Topic_Guide.md` |
| Manual Deployment Plan | `release/v6.0/docs/MASTERCARD_MANUAL_DEPLOYMENT_PLAN.md` |
| Instruction Audit Report | `release/v6.0/docs/INSTRUCTION_AUDIT_REPORT.md` |
| KB Critical Path Audit | `docs/KB_CRITICAL_PATH_AUDIT_REPORT.md` |

### Appendix C: Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-18 | Initial v6.0 architecture |
| 2.0 | 2026-01-22 | Updated for v6.6 expansions, 10 agents, 69 prompts, 135 KB files |
| 2.1 | 2026-01-22 | Added Deep Reasoning integration section |
| 2.2 | 2026-01-23 | Added Behavioral Safeguards, KB-First Retrieval Pattern, Instruction Audit Remediation sections; updated metrics for EAP KB files |

---

**Document Version:** 2.2  
**Last Updated:** January 23, 2026  
**Author:** Claude (KDAP Architecture Assistant)  
**Status:** Production Ready for Mastercard Deployment
