# MPA v6.0 FINAL ARCHITECTURE

**Version:** 2.1  
**Date:** January 23, 2026  
**Status:** Production Ready  
**Environments:** Mastercard (DLP-restricted) + Personal (Full Azure)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Principles](#2-architecture-principles)
3. [Environment Capabilities Matrix](#3-environment-capabilities-matrix)
4. [Agent Architecture](#4-agent-architecture)
5. [Capability Abstraction Layer](#5-capability-abstraction-layer)
6. [Knowledge Base Architecture](#6-knowledge-base-architecture)
7. [Dataverse Integration](#7-dataverse-integration)
8. [Flow Architecture](#8-flow-architecture)
9. [AI Builder Integration](#9-ai-builder-integration)
10. [Azure Functions (Personal Environment)](#10-azure-functions-personal-environment)
11. [Testing Framework](#11-testing-framework)
12. [Observability](#12-observability)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Repository Structure](#14-repository-structure)
15. [Implementation Roadmap](#15-implementation-roadmap)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Architecture Overview

The Media Planning Agent (MPA) v6.0 implements a **10 Agents + Deep Modules** architecture with a **Capability Abstraction Layer** enabling deployment to two distinct environments:

- **Mastercard Environment**: DLP-restricted, AI Builder only, no HTTP/custom connectors
- **Personal Environment (Aragorn AI)**: Full Azure access, HTTP connectors, Azure Functions

### 1.2 Key Metrics

| Metric | Value |
|--------|-------|
| Total Agents | 10 |
| Agent KB Files | 135 |
| EAP Platform KB Files | 5 |
| Total KB Files | 140 |
| Instruction Space | 80,000 characters (8K × 10) |
| AI Builder Prompts | 69 |
| Dataverse Tables | 24 |
| Azure Functions (Personal) | 8+ |
| Vertical Overlays | 12 |

### 1.3 Core Innovations

1. **Capability Abstraction**: Same agent code routes to different implementations based on environment
2. **AI Builder Universal Fallback**: Every capability has an AI Builder implementation working in both environments
3. **Environment Parity**: Identical agents, KB, and orchestration - only implementation registrations differ
4. **Test-Driven Quality**: Golden test cases in Dataverse validate behavior pre-deployment
5. **Observability by Default**: All capability invocations logged to telemetry
6. **KB-First Retrieval**: Mandatory knowledge base retrieval before responding to domain questions
7. **Domain Scope Boundaries**: Explicit boundaries preventing cross-domain confusion
8. **Behavioral Safeguards**: Consistent guardrails across all agent instructions

### 1.4 Recent Updates (January 2026)

- Complete instruction file audit and remediation for all 10 agents
- KB Critical Path Enhancement with proactive intelligence patterns
- DOMAIN SCOPE boundaries added to all specialist agents
- MANDATORY RESPONSE SEQUENCE enforcing KB-first retrieval
- Consistent behavioral safeguards across all agent instructions
- Deep Reasoning keyword integration for extended analysis triggers
- ORC guardrails preventing autonomous plan completion and web search
---

## 2. ARCHITECTURE PRINCIPLES

### 2.1 Design Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Capability Abstraction** | Never hardcode implementation types | All computation routes through capability dispatcher |
| **Environment Parity** | Same agents work in both environments | Implementation registrations differ, not agent code |
| **No HTTP Dependencies in Shared Code** | Base flows must work without HTTP | AI Builder handles all shared computation |
| **AI Builder as Universal Fallback** | Every capability has AI Builder impl | Personal environment can override with Functions |
| **Deterministic Routing** | Routing via Dataverse, not KB retrieval | eap_agent table with capability tags |
| **Test-Driven Quality** | Golden test cases validate behavior | eap_test_case table, regression suite |
| **Observability by Default** | All calls logged | eap_telemetry captures every invocation |

### 2.2 Constraints by Environment

#### Mastercard Environment Constraints

```
AVAILABLE IN MASTERCARD
-----------------------------------------
âœ“ Copilot Studio (10 agents Ã— 8K instructions = 80K total)
âœ“ SharePoint KB hosting (36K char limit per file)
âœ“ Dataverse (full CRUD access)
âœ“ Power Automate Premium (approved connectors only)
âœ“ Power Apps (Canvas and Model-driven)
âœ“ Power Fx computations
âœ“ AI Builder Custom Prompts
âœ“ AI Builder Models
âœ“ Standard connectors:
  - Office 365 Outlook
  - Office 365 Users
  - Dataverse
  - SharePoint
  - Approvals
  - Microsoft Teams
  - Excel Online (Business)

BLOCKED BY DLP
-----------------------------------------
âœ— HTTP connector (all destinationsâ€”confirmed via testing)
âœ— Custom connectors (same DLP policy)
âœ— Azure Functions direct calls
âœ— External API calls

REQUIRES FORMAL APPROVAL (6-12 MONTHS)
-----------------------------------------
âŒ› DLP policy exceptions
âŒ› Azure Functions integration
âŒ› Azure OpenAI direct integration
âŒ› Custom connector approval
```

#### Personal Environment Capabilities

```
AVAILABLE IN PERSONAL (ARAGORN AI)
-----------------------------------------
âœ“ Everything in Mastercard environment, PLUS:
âœ“ HTTP connector (any endpoint)
âœ“ Custom connectors (full creation/use)
âœ“ Azure Functions
âœ“ Azure OpenAI direct integration
âœ“ Full Azure resource access
âœ“ External API integrations
```

### 2.3 Architecture Decision Records

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | 10 agents for v6.0 | Expanded from 7 to include CHG, CST, MKT for full coverage |
| ADR-002 | Deep modules per agent | Retrieval precision; focused content beats mega-documents |
| ADR-003 | NDS content â†’ ANL | Budget optimization belongs with analytics |
| ADR-004 | CSO content â†’ AUD | Journey orchestration belongs with audience |
| ADR-005 | UDM cancelled | Too specialized for v6 scope |
| ADR-006 | Routing in Dataverse | Deterministic routing beats RAG-based |
| ADR-007 | AI Builder primary compute | Works in both environments |
| ADR-008 | Capability abstraction | Enables environment-specific optimization |

---

## 3. ENVIRONMENT CAPABILITIES MATRIX

### 3.1 Feature Comparison

| Feature | Mastercard | Personal | Notes |
|---------|------------|----------|-------|
| Copilot Studio Agents | âœ“ | âœ“ | 10 agents, 8K chars each |
| SharePoint KB | âœ“ | âœ“ | 36K char limit per file |
| Dataverse | âœ“ | âœ“ | Full schema |
| Power Automate Premium | âœ“ | âœ“ | Approved connectors only in MC |
| AI Builder Custom Prompts | âœ“ | âœ“ | Primary computation layer |
| AI Builder Models | âœ“ | âœ“ | Document processing, prediction |
| HTTP Connector | âœ— | âœ“ | External API calls |
| Custom Connectors | âœ— | âœ“ | Partner integrations |
| Azure Functions | âœ— | âœ“ | Complex calculations |
| Azure OpenAI Direct | âœ— | âœ“ | Advanced AI scenarios |

### 3.2 Capability Implementation Matrix

| Capability | Mastercard Implementation | Personal Implementation |
|------------|---------------------------|-------------------------|
| Calculate Marginal Return | AI Builder Prompt | Azure Function (primary) â†’ AI Builder (fallback) |
| Compare Scenarios | AI Builder Prompt | Azure Function â†’ AI Builder |
| Generate Projections | AI Builder Prompt | Azure Function â†’ AI Builder |
| Segment Prioritization | AI Builder Prompt | Azure Function â†’ AI Builder |
| LTV Assessment | AI Builder Prompt | Azure Function â†’ AI Builder |
| Channel Mix Optimization | AI Builder Prompt | Azure Function â†’ AI Builder |
| Anomaly Detection | AI Builder Prompt | Azure Function â†’ AI Builder |
| Attribution Analysis | AI Builder Prompt | Azure Function â†’ AI Builder |

---

## 4. AGENT ARCHITECTURE

### 4.1 Agent Inventory

| Code | Name | Responsibility | Instructions | Core KB | Deep Modules |
|------|------|----------------|--------------|---------|--------------|
| ORC | Orchestrator | Intent classification, routing, session | 8K chars | 1 | 4 |
| ANL | Analytics | Projections, calculations, modeling, competitive analysis | 8K chars | 1 | 22 |
| AUD | Audience | Segmentation, targeting, journeys, lifecycle | 8K chars | 1 | 25 |
| CHA | Channel | Channel mix, allocation, flighting, frequency | 8K chars | 1 | 12 |
| CHG | Change Management | Adoption planning, readiness, stakeholders | 8K chars | 1 | 2 |
| CST | Consulting Strategy | Strategic frameworks, prioritization | 8K chars | 1 | 3 |
| DOC | Document | Document generation, export, automation | 8K chars | 1 | 6 |
| MKT | Marketing | Brand positioning, competitive messaging, GTM | 8K chars | 1 | 6 |
| PRF | Performance | Monitoring, attribution, optimization, learning | 8K chars | 1 | 31 |
| SPO | Supply Path | Programmatic optimization, NBI, fees | 8K chars | 1 | 14 |

### 4.2 Agent Interaction Pattern

```
USER MESSAGE
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    ORC - ORCHESTRATOR                            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ 1. Receive user message                                     â”‚â”‚
â”‚  â”‚ 2. Query eap_agent table for capability matching            â”‚â”‚
â”‚  â”‚ 3. Classify intent (ORC_INTENT AI Builder Prompt)           â”‚â”‚
â”‚  â”‚ 4. Route to specialist agent                                â”‚â”‚
â”‚  â”‚ 5. Aggregate response                                       â”‚â”‚
â”‚  â”‚ 6. Log to eap_telemetry                                     â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 SPECIALIST AGENT (ANL/AUD/CHA/SPO/DOC/PRF)       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ 1. Receive routed request from ORC                          â”‚â”‚
â”‚  â”‚ 2. Retrieve relevant KB (Core + Deep modules)               â”‚â”‚
â”‚  â”‚ 3. Identify required capabilities                           â”‚â”‚
â”‚  â”‚ 4. Call Capability Dispatcher Flow                          â”‚â”‚
â”‚  â”‚ 5. Process capability results                               â”‚â”‚
â”‚  â”‚ 6. Generate response with citations                         â”‚â”‚
â”‚  â”‚ 7. Return to ORC                                            â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 CAPABILITY DISPATCHER FLOW                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ 1. Receive capability_code + inputs                         â”‚â”‚
â”‚  â”‚ 2. Query eap_capability_implementation                      â”‚â”‚
â”‚  â”‚    - Filter: environment + is_enabled                       â”‚â”‚
â”‚  â”‚    - Sort: priority_order ASC                               â”‚â”‚
â”‚  â”‚ 3. Route to implementation:                                 â”‚â”‚
â”‚  â”‚    - AI_BUILDER_PROMPT â†’ MPA_Impl_AIBuilder flow            â”‚â”‚
â”‚  â”‚    - AZURE_FUNCTION â†’ MPA_Impl_AzureFunction flow           â”‚â”‚
â”‚  â”‚    - HTTP_ENDPOINT â†’ MPA_Impl_HTTPEndpoint flow             â”‚â”‚
â”‚  â”‚    - DATAVERSE_LOGIC â†’ MPA_Impl_DataverseLogic flow         â”‚â”‚
â”‚  â”‚ 4. Handle timeout/error â†’ try fallback_implementation       â”‚â”‚
â”‚  â”‚ 5. Return structured result                                 â”‚â”‚
â”‚  â”‚ 6. Log to eap_telemetry                                     â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.3 Agent Specifications

#### 4.3.1 ORC - Orchestrator Agent

**Responsibility:** Intent classification, agent routing, session management, response aggregation

**Capabilities Required:**
- ORC_INTENT: Classify user intent for routing
- ORC_VALIDATE_GATE: Validate workflow gate completion

**Routing Logic:**
```
INTENT â†’ AGENT MAPPING
-----------------------------------------
budget, projection, forecast, calculate â†’ ANL
audience, segment, target, persona, ltv â†’ AUD
channel, media, mix, allocation â†’ CHA
programmatic, ssp, dsp, fee, supply â†’ SPO
document, export, report, brief â†’ DOC
performance, attribution, optimize, anomaly â†’ PRF
workflow, step, gate, help â†’ ORC (self-handle)
```

**Instructions Emphasis:**
- Route deterministically using eap_agent capability tags
- Never retrieve routing logic from KB (KB is for explanations only)
- Log every routing decision to telemetry
- Support parallel agent invocation for complex requests

#### 4.3.2 ANL - Analytics Agent

**Responsibility:** Projections, calculations, statistical modeling, budget optimization

**Capabilities Required:**
- ANL_MARGINAL_RETURN: Calculate marginal return curves
- ANL_SCENARIO_COMPARE: Compare budget allocation scenarios
- ANL_PROJECTION: Generate performance projections
- ANL_CONFIDENCE: Assess confidence levels for estimates
- ANL_BAYESIAN: Apply Bayesian inference methods
- ANL_CAUSAL: Perform causal/incrementality analysis

**Deep Modules:**
1. ANL_KB_MMM_Methods_v1.txt - Media Mix Modeling methodology
2. ANL_KB_Bayesian_Inference_v1.txt - Bayesian priors, posteriors, uncertainty
3. ANL_KB_Causal_Incrementality_v1.txt - Causal ML, lift measurement
4. ANL_KB_Budget_Optimization_v1.txt - Marginal returns, response curves

**Absorbed Content (from cancelled NDS):**
- Marginal return estimation
- Spend/no-spend logic
- Multi-input integration
- Risk-adjusted allocation
- Budget response functions

#### 4.3.3 AUD - Audience Intelligence Agent

**Responsibility:** Segmentation, targeting, LTV modeling, journey orchestration

**Capabilities Required:**
- AUD_SEGMENT_PRIORITY: Prioritize audience segments by value
- AUD_LTV_ASSESS: Evaluate lifetime value potential
- AUD_JOURNEY_STATE: Determine customer journey state
- AUD_PROPENSITY: Calculate propensity scores
- AUD_IDENTITY: Resolve identity across touchpoints

**Deep Modules:**
1. AUD_KB_Identity_Resolution_v1.txt - Graph algorithms, entity matching
2. AUD_KB_LTV_Modeling_v1.txt - Cohort analysis, survival models
3. AUD_KB_Propensity_ML_v1.txt - ML classifiers, scoring
4. AUD_KB_Journey_Orchestration_v1.txt - State models, NBA, sequencing

**Absorbed Content (from cancelled CSO):**
- Journey state models
- Next-best-action frameworks
- Sequence timing optimization
- Frequency fatigue management
- Reinforcement learning for marketing

#### 4.3.4 CHA - Channel Strategy Agent

**Responsibility:** Channel selection, mix optimization, emerging channel guidance

**Capabilities Required:**
- CHA_CHANNEL_MIX: Optimize channel allocation
- CHA_CHANNEL_SELECT: Recommend channels for objectives
- CHA_EMERGING_ASSESS: Evaluate emerging channel fit

**Deep Modules:**
1. CHA_KB_Allocation_Methods_v1.txt - Budget distribution approaches
2. CHA_KB_Emerging_Channels_v1.txt - AI advertising, retail media, CTV
3. CHA_KB_Brand_Performance_v1.txt - Funnel balance, brand vs. activation

#### 4.3.5 SPO - Supply Path Optimization Agent

**Responsibility:** Programmatic supply path, fee transparency, partner evaluation

**Capabilities Required:**
- SPO_FEE_WATERFALL: Calculate fee decomposition
- SPO_PARTNER_SCORE: Evaluate partner quality
- SPO_NBI_CALCULATE: Compute net bidder impact

**Deep Modules:**
1. SPO_KB_Fee_Analysis_v1.txt - Fee waterfall, DSP/SSP breakdown
2. SPO_KB_Partner_Evaluation_v1.txt - Vendor assessment, NBI calculation

#### 4.3.6 DOC - Document Generation Agent

**Responsibility:** Document creation, template selection, export formatting

**Capabilities Required:**
- DOC_GENERATE: Generate document from session data
- DOC_TEMPLATE_SELECT: Choose appropriate template
- DOC_FORMAT_EXPORT: Export to specified format

**Deep Modules:**
1. DOC_KB_Export_Formats_v1.txt - DOCX/PDF/PPTX specifications

#### 4.3.7 PRF - Performance Intelligence Agent

**Responsibility:** Performance monitoring, attribution, optimization triggers

**Capabilities Required:**
- PRF_ANOMALY: Detect performance anomalies
- PRF_ATTRIBUTION: Analyze attribution across channels
- PRF_INCREMENTALITY: Measure incremental impact
- PRF_OPTIMIZE: Recommend optimization actions

**Deep Modules:**
1. PRF_KB_Attribution_Methods_v1.txt - MTA, Shapley, path analysis
2. PRF_KB_Incrementality_Testing_v1.txt - Geo tests, holdouts
3. PRF_KB_Anomaly_Detection_v1.txt - Statistical methods, ML detection

---

## 5. CAPABILITY ABSTRACTION LAYER

### 5.1 Architecture Overview

The Capability Abstraction Layer (CAL) enables environment-specific implementations without changing agent code:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         AGENT REQUEST                            â”‚
â”‚            (capability_code + inputs + context)                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   MPA_Capability_Dispatcher Flow                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ Input: capability_code, inputs_json, session_id              â”‚â”‚
â”‚  â”‚                                                              â”‚â”‚
â”‚  â”‚ Step 1: Get environment_code from config                     â”‚â”‚
â”‚  â”‚                                                              â”‚â”‚
â”‚  â”‚ Step 2: Query eap_capability_implementation                  â”‚â”‚
â”‚  â”‚         WHERE capability_code = @capability_code             â”‚â”‚
â”‚  â”‚         AND environment_code = @environment_code             â”‚â”‚
â”‚  â”‚         AND is_enabled = true                                â”‚â”‚
â”‚  â”‚         ORDER BY priority_order ASC                          â”‚â”‚
â”‚  â”‚                                                              â”‚â”‚
â”‚  â”‚ Step 3: Route by implementation_type:                        â”‚â”‚
â”‚  â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚â”‚
â”‚  â”‚         â”‚ AI_BUILDER_PROMPT    â”‚ â†’ MPA_Impl_AIBuilder    â”‚   â”‚â”‚
â”‚  â”‚         â”‚ AZURE_FUNCTION       â”‚ â†’ MPA_Impl_AzureFunctionâ”‚   â”‚â”‚
â”‚  â”‚         â”‚ HTTP_ENDPOINT        â”‚ â†’ MPA_Impl_HTTPEndpoint â”‚   â”‚â”‚
â”‚  â”‚         â”‚ DATAVERSE_LOGIC      â”‚ â†’ MPA_Impl_Dataverse    â”‚   â”‚â”‚
â”‚  â”‚         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚â”‚
â”‚  â”‚                                                              â”‚â”‚
â”‚  â”‚ Step 4: Execute with timeout handling                        â”‚â”‚
â”‚  â”‚                                                              â”‚â”‚
â”‚  â”‚ Step 5: On failure, try fallback_implementation_id           â”‚â”‚
â”‚  â”‚                                                              â”‚â”‚
â”‚  â”‚ Step 6: Log to eap_telemetry                                 â”‚â”‚
â”‚  â”‚                                                              â”‚â”‚
â”‚  â”‚ Output: result_json, confidence_level, execution_time_ms     â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 5.2 Capability Registry

#### 5.2.1 eap_capability Table

Defines what capabilities exist (environment-agnostic):

| capability_code | capability_name | agent_code | description |
|-----------------|-----------------|------------|-------------|
| ANL_MARGINAL_RETURN | Calculate Marginal Return | ANL | Estimate marginal return for budget allocation |
| ANL_SCENARIO_COMPARE | Compare Scenarios | ANL | Compare multiple budget allocation scenarios |
| ANL_PROJECTION | Generate Projections | ANL | Project campaign performance metrics |
| ANL_CONFIDENCE | Assess Confidence | ANL | Calculate confidence levels for estimates |
| ANL_BAYESIAN | Apply Bayesian Inference | ANL | Bayesian priors, posteriors, uncertainty |
| ANL_CAUSAL | Causal Analysis | ANL | Incrementality, lift measurement |
| AUD_SEGMENT_PRIORITY | Prioritize Segments | AUD | Rank audience segments by value |
| AUD_LTV_ASSESS | Assess LTV | AUD | Evaluate lifetime value potential |
| AUD_JOURNEY_STATE | Analyze Journey | AUD | Determine customer journey state |
| AUD_PROPENSITY | Calculate Propensity | AUD | Propensity scoring for targeting |
| AUD_IDENTITY | Resolve Identity | AUD | Identity graph resolution |
| CHA_CHANNEL_MIX | Optimize Mix | CHA | Recommend optimal channel allocation |
| CHA_CHANNEL_SELECT | Select Channels | CHA | Recommend channels for objectives |
| CHA_EMERGING_ASSESS | Assess Emerging Channels | CHA | Evaluate emerging channel fit |
| SPO_FEE_WATERFALL | Calculate Fee Waterfall | SPO | Decompose programmatic fees |
| SPO_PARTNER_SCORE | Score Partner | SPO | Evaluate partner quality |
| SPO_NBI_CALCULATE | Calculate NBI | SPO | Compute net bidder impact |
| DOC_GENERATE | Generate Document | DOC | Create document from session |
| DOC_TEMPLATE_SELECT | Select Template | DOC | Choose appropriate template |
| PRF_ANOMALY | Detect Anomalies | PRF | Identify performance anomalies |
| PRF_ATTRIBUTION | Analyze Attribution | PRF | Attribution across channels |
| PRF_INCREMENTALITY | Measure Incrementality | PRF | Incremental impact measurement |
| ORC_INTENT | Classify Intent | ORC | Determine user intent for routing |
| ORC_VALIDATE_GATE | Validate Gate | ORC | Check workflow gate completion |

#### 5.2.2 eap_capability_implementation Table

Defines how capabilities are implemented per environment:

**Mastercard Environment (AI Builder Only):**

| capability_code | environment_code | implementation_type | implementation_reference | priority_order | is_enabled |
|-----------------|------------------|---------------------|--------------------------|----------------|------------|
| ANL_MARGINAL_RETURN | MASTERCARD | AI_BUILDER_PROMPT | ANL_MarginalReturn_Prompt | 1 | true |
| ANL_SCENARIO_COMPARE | MASTERCARD | AI_BUILDER_PROMPT | ANL_ScenarioCompare_Prompt | 1 | true |
| ANL_PROJECTION | MASTERCARD | AI_BUILDER_PROMPT | ANL_Projection_Prompt | 1 | true |
| ... | ... | ... | ... | ... | ... |

**Personal Environment (Azure Functions Primary, AI Builder Fallback):**

| capability_code | environment_code | implementation_type | implementation_reference | priority_order | is_enabled | fallback_implementation_id |
|-----------------|------------------|---------------------|--------------------------|----------------|------------|----------------------------|
| ANL_MARGINAL_RETURN | PERSONAL | AZURE_FUNCTION | https://mpa-functions.azurewebsites.net/api/marginal-return | 1 | true | (AI Builder row ID) |
| ANL_MARGINAL_RETURN | PERSONAL | AI_BUILDER_PROMPT | ANL_MarginalReturn_Prompt | 2 | true | null |
| ANL_SCENARIO_COMPARE | PERSONAL | AZURE_FUNCTION | https://mpa-functions.azurewebsites.net/api/scenario-compare | 1 | true | (AI Builder row ID) |
| ANL_SCENARIO_COMPARE | PERSONAL | AI_BUILDER_PROMPT | ANL_ScenarioCompare_Prompt | 2 | true | null |
| ... | ... | ... | ... | ... | ... | ... |

### 5.3 Implementation Flows

#### 5.3.1 MPA_Impl_AIBuilder Flow

Executes AI Builder Custom Prompts:

```
Input: prompt_name, inputs_json, timeout_seconds
â”‚
â”œâ”€ Step 1: Lookup prompt configuration from eap_prompt table
â”‚
â”œâ”€ Step 2: Construct prompt with input variables
â”‚
â”œâ”€ Step 3: Call AI Builder Custom Prompt action
â”‚
â”œâ”€ Step 4: Parse structured output
â”‚
â”œâ”€ Step 5: Validate against output_schema
â”‚
â””â”€ Output: result_json, confidence_level
```

#### 5.3.2 MPA_Impl_AzureFunction Flow (Personal Environment Only)

Calls Azure Functions via HTTP:

```
Input: function_url, inputs_json, timeout_seconds
â”‚
â”œâ”€ Step 1: Prepare HTTP request with auth headers
â”‚
â”œâ”€ Step 2: POST to function_url with inputs_json
â”‚
â”œâ”€ Step 3: Handle response with timeout
â”‚
â”œâ”€ Step 4: Parse JSON response
â”‚
â”œâ”€ Step 5: Validate against expected schema
â”‚
â””â”€ Output: result_json, execution_time_ms
```

#### 5.3.3 MPA_Impl_HTTPEndpoint Flow (Personal Environment Only)

Calls external HTTP endpoints:

```
Input: endpoint_url, method, inputs_json, headers_json, timeout_seconds
â”‚
â”œâ”€ Step 1: Construct HTTP request
â”‚
â”œâ”€ Step 2: Execute request with timeout
â”‚
â”œâ”€ Step 3: Handle response
â”‚
â”œâ”€ Step 4: Transform response to standard format
â”‚
â””â”€ Output: result_json
```

#### 5.3.4 MPA_Impl_DataverseLogic Flow

Executes Dataverse-based computation (lookups, aggregations):

```
Input: logic_name, inputs_json
â”‚
â”œâ”€ Step 1: Load logic definition from eap_dataverse_logic
â”‚
â”œâ”€ Step 2: Execute Dataverse queries
â”‚
â”œâ”€ Step 3: Apply Power Fx transformations
â”‚
â”œâ”€ Step 4: Format result
â”‚
â””â”€ Output: result_json
```

### 5.4 Adding a New Capability

To add a new capability to the system:

1. **Define the capability** in eap_capability table:
   ```
   INSERT INTO eap_capability (capability_code, capability_name, agent_code, description, input_schema, output_schema)
   VALUES ('NEW_CAPABILITY', 'New Capability Name', 'ANL', 'Description', '{...}', '{...}')
   ```

2. **Create AI Builder Prompt** (required for both environments):
   - Create prompt in AI Builder
   - Register in eap_prompt table
   - Add implementation record for MASTERCARD environment:
   ```
   INSERT INTO eap_capability_implementation (capability_code, environment_code, implementation_type, implementation_reference, priority_order, is_enabled)
   VALUES ('NEW_CAPABILITY', 'MASTERCARD', 'AI_BUILDER_PROMPT', 'NEW_Capability_Prompt', 1, true)
   ```

3. **Create Azure Function** (optional, for Personal environment):
   - Deploy function to Azure
   - Add implementation record for PERSONAL environment with higher priority:
   ```
   INSERT INTO eap_capability_implementation (capability_code, environment_code, implementation_type, implementation_reference, priority_order, is_enabled, fallback_implementation_id)
   VALUES ('NEW_CAPABILITY', 'PERSONAL', 'AZURE_FUNCTION', 'https://...', 1, true, @ai_builder_impl_id)
   ```

4. **Add test cases** in eap_test_case table

5. **Update agent instructions** to reference new capability

---

## 6. KNOWLEDGE BASE ARCHITECTURE

### 6.1 KB Tier Pattern

Every agent follows the Core + Deep Modules pattern:

| Tier | Purpose | When Retrieved | Target Size |
|------|---------|----------------|-------------|
| **Core** | Foundational methodology, always-relevant guidance | Every query to this agent | 20-30K chars |
| **Deep** | Specialized methods for specific contexts | When specific topic detected in query | 15-25K chars |

### 6.2 Complete KB File Inventory

#### 6.2.1 ORC - Orchestrator (2 files)

| File | Type | Size Target | Purpose |
|------|------|-------------|---------|
| ORC_Copilot_Instructions_v1.txt | Instructions | 8K chars | Agent behavior, routing rules |
| ORC_KB_Routing_Logic_v1.txt | Core KB | 25K chars | Intent classification explanations, edge cases, workflow gates |

**Note:** ORC does not need deep modulesâ€”its job is routing, not analysis. Actual routing rules live in eap_agent table, not KB.

#### 6.2.2 ANL - Analytics (6 files)

| File | Type | Size Target | Purpose |
|------|------|-------------|---------|
| ANL_Copilot_Instructions_v1.txt | Instructions | 8K chars | Agent behavior, capability invocation |
| ANL_KB_Analytics_Core_v1.txt | Core KB | 25K chars | General projections, formulas, confidence framework |
| ANL_KB_MMM_Methods_v1.txt | Deep | 20K chars | Media Mix Modeling, decomposition, saturation curves |
| ANL_KB_Bayesian_Inference_v1.txt | Deep | 18K chars | Priors, posteriors, uncertainty quantification, MCMC |
| ANL_KB_Causal_Incrementality_v1.txt | Deep | 20K chars | Causal ML, lift measurement, counterfactuals, spend logic |
| ANL_KB_Budget_Optimization_v1.txt | Deep | 22K chars | Marginal returns, response curves, risk-adjusted allocation |

#### 6.2.3 AUD - Audience (6 files)

| File | Type | Size Target | Purpose |
|------|------|-------------|---------|
| AUD_Copilot_Instructions_v1.txt | Instructions | 8K chars | Agent behavior, capability invocation |
| AUD_KB_Audience_Core_v1.txt | Core KB | 25K chars | Segmentation principles, targeting methodology, 1P data strategy |
| AUD_KB_Identity_Resolution_v1.txt | Deep | 22K chars | Graph algorithms, household matching, entity resolution |
| AUD_KB_LTV_Modeling_v1.txt | Deep | 20K chars | Cohort analysis, survival models, value prediction, card portfolio |
| AUD_KB_Propensity_ML_v1.txt | Deep | 18K chars | ML classifiers, scoring, churn prediction, intent modeling |
| AUD_KB_Journey_Orchestration_v1.txt | Deep | 22K chars | State models, NBA, sequencing, frequency fatigue, RL for marketing |

#### 6.2.4 CHA - Channel (5 files)

| File | Type | Size Target | Purpose |
|------|------|-------------|---------|
| CHA_Copilot_Instructions_v1.txt | Instructions | 8K chars | Agent behavior, capability invocation |
| CHA_KB_Channel_Core_v1.txt | Core KB | 25K chars | Selection methodology, funnel mapping, planning principles |
| CHA_KB_Allocation_Methods_v1.txt | Deep | 20K chars | Budget distribution, optimization approaches |
| CHA_KB_Emerging_Channels_v1.txt | Deep | 22K chars | AI advertising, retail media networks, CTV advanced |
| CHA_KB_Brand_Performance_v1.txt | Deep | 20K chars | Funnel balance, brand building vs. performance activation |

#### 6.2.5 SPO - Supply Path (4 files)

| File | Type | Size Target | Purpose |
|------|------|-------------|---------|
| SPO_Copilot_Instructions_v1.txt | Instructions | 8K chars | Agent behavior, capability invocation |
| SPO_KB_SPO_Core_v1.txt | Core KB | 20K chars | Fee transparency, working media principles |
| SPO_KB_Fee_Analysis_v1.txt | Deep | 18K chars | Fee waterfall decomposition, DSP/SSP breakdown |
| SPO_KB_Partner_Evaluation_v1.txt | Deep | 18K chars | Vendor assessment methodology, NBI calculation |

#### 6.2.6 DOC - Document (3 files)

| File | Type | Size Target | Purpose |
|------|------|-------------|---------|
| DOC_Copilot_Instructions_v1.txt | Instructions | 8K chars | Agent behavior, template selection |
| DOC_KB_Document_Core_v1.txt | Core KB | 20K chars | Template selection, structure principles |
| DOC_KB_Export_Formats_v1.txt | Deep | 15K chars | DOCX/PDF/PPTX specifications, styling |

#### 6.2.7 PRF - Performance (5 files)

| File | Type | Size Target | Purpose |
|------|------|-------------|---------|
| PRF_Copilot_Instructions_v1.txt | Instructions | 8K chars | Agent behavior, capability invocation |
| PRF_KB_Performance_Core_v1.txt | Core KB | 22K chars | Monitoring principles, optimization triggers |
| PRF_KB_Attribution_Methods_v1.txt | Deep | 22K chars | MTA, Shapley, path analysis, MMM reconciliation |
| PRF_KB_Incrementality_Testing_v1.txt | Deep | 20K chars | Geo tests, holdouts, always-on experiments |
| PRF_KB_Anomaly_Detection_v1.txt | Deep | 18K chars | Statistical methods, ML detection, alert thresholds |

#### 6.2.8 EAP - Shared Platform (6 files)

| File | Purpose | Used By |
|------|---------|---------|
| EAP_KB_Data_Provenance_v1.txt | Source hierarchy, citation requirements | All agents |
| EAP_KB_Confidence_Levels_v1.txt | Uncertainty communication, confidence bands | All agents |
| EAP_KB_Error_Handling_v1.txt | Graceful degradation, fallback patterns | All agents |
| EAP_KB_Formatting_Standards_v1.txt | 6-Rule Framework, document compliance | All agents |
| EAP_KB_Strategic_Principles_v1.txt | Philosophy, approach, guardrails | All agents |
| EAP_KB_Communication_Contract_v1.txt | Inter-agent request/response protocol | All agents |

### 6.3 KB Content Guidelines

#### 6.3.1 What Goes in Core KB

- Foundational principles and methodology
- Decision frameworks used across all contexts within this agent's domain
- Guardrails and quality standards
- When to invoke which capability
- Cross-cutting guidance

#### 6.3.2 What Goes in Deep Modules

- Specialized algorithms and formulas
- Method-specific implementation details
- Advanced techniques requiring specific context
- Technical depth that would overwhelm general queries

#### 6.3.3 Retrieval Behavior Example

When user asks: "What's the projected ROI for this campaign?"
- ANL_KB_Analytics_Core is retrieved (general projection methodology)

When user asks: "How should I set priors for the MMM model?"
- ANL_KB_Bayesian_Inference is retrieved (specific methodology)
- ANL_KB_MMM_Methods may also be retrieved (MMM context)

This precision is why we keep separate modules instead of one massive file.

### 6.4 6-Rule Compliance Framework

All KB files must comply with these formatting rules for Copilot Studio compatibility:

| Rule | Requirement | Example |
|------|-------------|---------|
| 1 | ALL-CAPS headers | BUDGET ALLOCATION METHODOLOGY |
| 2 | Hyphens-only lists | - First item (not bullets or numbers) |
| 3 | ASCII characters only | No em-dashes, curly quotes, ellipses |
| 4 | Zero visual dependencies | Content must make sense without formatting |
| 5 | Mandatory language | Explicit "must", "should", "never" |
| 6 | Professional tone | Clear, authoritative, no hedging |

---

## 7. DATAVERSE INTEGRATION

### 7.1 Table Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      EAP PLATFORM TABLES                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ eap_agent                    Agent registry with capabilities   â”‚
â”‚ eap_capability               Capability definitions             â”‚
â”‚ eap_capability_implementation  Implementations per environment  â”‚
â”‚ eap_prompt                   AI Builder prompt registry         â”‚
â”‚ eap_test_case                Golden test scenarios              â”‚
â”‚ eap_telemetry                Observability/logging              â”‚
â”‚ eap_environment_config       Environment-specific settings      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      MPA DOMAIN TABLES                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ mpa_channel                  Channel reference data (43)        â”‚
â”‚ mpa_kpi                      KPI definitions (44)               â”‚
â”‚ mpa_benchmark                Vertical Ã— channel benchmarks (708)â”‚
â”‚ mpa_vertical                 Industry classifications (15)      â”‚
â”‚ mpa_partner                  Partner fees and capabilities      â”‚
â”‚ mpa_session                  User session state                 â”‚
â”‚ mpa_session_step             Step completion tracking           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.2 Key Table Relationships

```
eap_agent (1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ (N) eap_capability
      â”‚
      â”‚ agent_code
      â”‚
      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ (N) eap_capability_implementation


eap_capability (1) â”€â”€â”€â”€â”€â”€â”€â”€â”€ (N) eap_capability_implementation
      â”‚
      â”‚ capability_code
      â”‚
      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ (N) eap_test_case


mpa_vertical (1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ (N) mpa_benchmark
      â”‚
      â”‚ vertical_code
      â”‚
mpa_channel (1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ (N) mpa_benchmark
      â”‚
      â”‚ channel_code
      â”‚
mpa_kpi (1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ (N) mpa_benchmark
```

---

## 8. FLOW ARCHITECTURE

### 8.1 Flow Inventory

#### 8.1.1 Core Platform Flows (Both Environments)

| Flow Name | Purpose | Trigger |
|-----------|---------|---------|
| MPA_Capability_Dispatcher | Route capability requests to implementations | Called by agents |
| MPA_Impl_AIBuilder | Execute AI Builder prompts | Called by dispatcher |
| MPA_Impl_DataverseLogic | Execute Dataverse computations | Called by dispatcher |
| MPA_Session_Initialize | Create new session, initialize context | Agent conversation start |
| MPA_Session_Update | Update session state | After each step |
| MPA_Gate_Validate | Check workflow gate requirements | Before step transitions |
| MPA_Telemetry_Log | Record telemetry events | After capability execution |

#### 8.1.2 Personal Environment Flows (Personal Only)

| Flow Name | Purpose | Trigger |
|-----------|---------|---------|
| MPA_Impl_AzureFunction | Call Azure Functions via HTTP | Called by dispatcher |
| MPA_Impl_HTTPEndpoint | Call external HTTP endpoints | Called by dispatcher |

### 8.2 Flow Design Patterns

#### 8.2.1 Error Handling Pattern

All flows implement consistent error handling:

```
Try
â”‚
â”œâ”€ Execute main logic
â”‚
â”œâ”€ On Success: Return result_json
â”‚
â””â”€ On Failure:
   â”‚
   â”œâ”€ Log error to eap_telemetry
   â”‚
   â”œâ”€ If fallback_implementation exists:
   â”‚  â””â”€ Retry with fallback
   â”‚
   â””â”€ Else: Return error with graceful message
```

#### 8.2.2 Timeout Handling Pattern

```
Parallel Branch
â”‚
â”œâ”€ Branch 1: Execute capability
â”‚  â””â”€ Return result
â”‚
â””â”€ Branch 2: Delay(timeout_seconds)
   â””â”€ Cancel Branch 1, trigger fallback
```

---

## 9. AI BUILDER INTEGRATION

### 9.1 Prompt Registry

All AI Builder prompts are registered in the eap_prompt table for version control and configuration:

| prompt_code | prompt_name | agent_code | version | description | system_prompt_template | user_prompt_template | output_format |
|-------------|-------------|------------|---------|-------------|------------------------|----------------------|---------------|
| ANL_MARGINAL_RETURN | Calculate Marginal Return | ANL | 1.0 | Estimate marginal return curves | (template) | (template) | JSON |
| ANL_SCENARIO_COMPARE | Compare Scenarios | ANL | 1.0 | Compare budget scenarios | (template) | (template) | JSON |
| ... | ... | ... | ... | ... | ... | ... | ... |

### 9.2 Prompt Specifications

See separate document: **MPA_AI_Builder_Prompts_v6.0.md**

### 9.3 AI Builder Best Practices

1. **Structured Output**: Always request JSON output with defined schema
2. **Few-Shot Examples**: Include 2-3 examples in system prompt for consistency
3. **Temperature**: Use low temperature (0.1-0.3) for analytical tasks
4. **Token Management**: Keep prompts concise; move reference data to Dataverse
5. **Error Handling**: Always handle malformed responses gracefully

---

## 10. AZURE FUNCTIONS (PERSONAL ENVIRONMENT)

### 10.1 Function Inventory

| Function Name | Capability Code | Purpose | Runtime |
|---------------|-----------------|---------|---------|
| marginal-return | ANL_MARGINAL_RETURN | Calculate marginal return curves | Python 3.11 |
| scenario-compare | ANL_SCENARIO_COMPARE | Compare budget allocation scenarios | Python 3.11 |
| projection | ANL_PROJECTION | Generate performance projections | Python 3.11 |
| bayesian-inference | ANL_BAYESIAN | Apply Bayesian methods | Python 3.11 |
| segment-priority | AUD_SEGMENT_PRIORITY | Prioritize audience segments | Python 3.11 |
| ltv-assess | AUD_LTV_ASSESS | Evaluate lifetime value | Python 3.11 |
| anomaly-detect | PRF_ANOMALY | Detect performance anomalies | Python 3.11 |
| attribution | PRF_ATTRIBUTION | Analyze attribution | Python 3.11 |

### 10.2 Function Architecture

See separate document: **MPA_Azure_Functions_v6.0.md**

---

## 11. TESTING FRAMEWORK

### 11.1 Test Case Registry

Test cases are stored in eap_test_case table:

| Column | Type | Description |
|--------|------|-------------|
| test_case_id | PK | Unique identifier |
| scenario_name | Text | Human-readable name |
| scenario_category | Choice | ROUTING, CALCULATION, INTEGRATION, E2E |
| agent_code | Lookup | Target agent being tested |
| capability_code | Lookup | Specific capability if applicable |
| input_message | Multiline | User message to test |
| expected_agent | Lookup | Which agent should handle |
| expected_capability | Lookup | Which capability should be invoked |
| expected_output_contains | Multiline JSON | Key assertions on output |
| expected_citations | Multiline | Expected KB citations |
| tolerance_band | Number | Acceptable variance for numeric outputs |
| environment_code | Choice | BOTH, MASTERCARD, PERSONAL |
| is_active | Boolean | Include in test runs |
| last_run_date | DateTime | Most recent execution |
| last_run_result | Choice | PASS, FAIL, ERROR |
| last_run_details | Multiline | Execution details/errors |

### 11.2 Test Categories

| Category | Purpose | Example |
|----------|---------|---------|
| ROUTING | Verify ORC routes correctly | "Calculate my budget" â†’ ANL |
| CALCULATION | Verify capability produces correct output | Marginal return calculation accuracy |
| INTEGRATION | Verify end-to-end flow | Session â†’ Agent â†’ Capability â†’ Response |
| E2E | Full workflow scenarios | Complete media plan generation |
| REGRESSION | Catch behavior changes | Known-good outputs remain stable |

### 11.3 Test Execution

Tests are executed via Power Automate flow that:

1. Queries active test cases from eap_test_case
2. For each test case:
   a. Send input_message to appropriate agent
   b. Capture response
   c. Validate against expected_* fields
   d. Record result to last_run_* fields
3. Generate summary report
4. Alert on failures

---

## 12. OBSERVABILITY

### 12.1 Telemetry Schema

The eap_telemetry table captures all capability invocations:

| Column | Type | Description |
|--------|------|-------------|
| telemetry_id | PK | Unique identifier |
| session_id | Lookup | User session |
| timestamp | DateTime | Event time |
| event_type | Choice | CAPABILITY_INVOKE, CAPABILITY_SUCCESS, CAPABILITY_FAILURE, ROUTING, ERROR |
| agent_code | Text | Which agent |
| capability_code | Text | Which capability |
| implementation_type | Choice | AI_BUILDER, AZURE_FUNCTION, HTTP, DATAVERSE |
| inputs_json | Multiline | Input parameters (sanitized) |
| outputs_json | Multiline | Output results (sanitized) |
| execution_time_ms | Number | How long it took |
| confidence_level | Number | Output confidence (0-100) |
| error_message | Text | Error details if failed |
| kb_chunks_retrieved | Multiline JSON | Which KB content was retrieved |
| user_feedback | Choice | THUMBS_UP, THUMBS_DOWN, NONE |

### 12.2 Key Metrics to Monitor

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Capability Success Rate | % of capability calls that succeed | < 95% |
| Average Execution Time | Mean capability execution time | > 10 seconds |
| Routing Accuracy | % of intents routed to correct agent | < 90% |
| Fallback Rate | % of calls that needed fallback implementation | > 10% |
| User Satisfaction | % positive feedback | < 80% |
| KB Retrieval Hit Rate | % of queries that retrieve relevant KB | < 85% |

### 12.3 Dashboard Views

1. **Operations Dashboard**: Real-time success rates, latencies, error rates
2. **Agent Performance**: Per-agent metrics, capability usage
3. **User Experience**: Satisfaction scores, common failure patterns
4. **Capacity Planning**: Usage trends, peak times

---

## 13. DEPLOYMENT ARCHITECTURE

### 13.1 Environment Topology

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    MASTERCARD ENVIRONMENT                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ Copilot Studio (7 Agents)                                   â”‚â”‚
â”‚  â”‚     â†“                                                        â”‚â”‚
â”‚  â”‚ SharePoint (37 KB Files)                                    â”‚â”‚
â”‚  â”‚     â†“                                                        â”‚â”‚
â”‚  â”‚ Power Automate (Core Flows + AI Builder Impl)               â”‚â”‚
â”‚  â”‚     â†“                                                        â”‚â”‚
â”‚  â”‚ Dataverse (11 Tables)                                       â”‚â”‚
â”‚  â”‚     â†“                                                        â”‚â”‚
â”‚  â”‚ AI Builder (15+ Prompts)                                    â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    PERSONAL ENVIRONMENT                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ Copilot Studio (7 Agents) â† Same agents                     â”‚â”‚
â”‚  â”‚     â†“                                                        â”‚â”‚
â”‚  â”‚ SharePoint (37 KB Files) â† Same KB                          â”‚â”‚
â”‚  â”‚     â†“                                                        â”‚â”‚
â”‚  â”‚ Power Automate (Core Flows + Azure/HTTP Impl)               â”‚â”‚
â”‚  â”‚     â†“            â†“                                           â”‚â”‚
â”‚  â”‚ Dataverse    Azure Functions                                â”‚â”‚
â”‚  â”‚ (11 Tables)  (8 Functions)                                  â”‚â”‚
â”‚  â”‚     â†“                                                        â”‚â”‚
â”‚  â”‚ AI Builder (15+ Prompts) â† Fallback only                    â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 13.2 Deployment Process

#### 13.2.1 Shared Components (Both Environments)

1. **Dataverse Schema**: Deploy via solution export/import
2. **Seed Data**: Load from CSV files using dataflows
3. **KB Files**: Upload to SharePoint via pac CLI
4. **Core Flows**: Deploy via solution
5. **AI Builder Prompts**: Deploy via solution
6. **Copilot Agents**: Deploy via solution

#### 13.2.2 Environment-Specific Components

**Mastercard:**
- Load eap_capability_impl_mastercard.csv (AI Builder only)
- Verify no HTTP/custom connector references

**Personal:**
- Deploy Azure Functions
- Load eap_capability_impl_personal.csv (Azure Functions + AI Builder fallback)
- Deploy additional flows (MPA_Impl_AzureFunction, MPA_Impl_HTTPEndpoint)

### 13.3 CI/CD Pipeline

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         GIT REPOSITORY                           â”‚
â”‚                    (Kessel-Digital-Agent-Platform)               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      BUILD STAGE                                 â”‚
â”‚  - Validate KB files (6-Rule compliance, char limits)           â”‚
â”‚  - Run unit tests on Azure Functions                            â”‚
â”‚  - Package solution                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â–¼                                   â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   DEPLOY TO PERSONAL    â”‚       â”‚  DEPLOY TO MASTERCARD   â”‚
â”‚  - Deploy solution      â”‚       â”‚  - Deploy solution      â”‚
â”‚  - Deploy Functions     â”‚       â”‚  - Load MC seed data    â”‚
â”‚  - Load Personal seed   â”‚       â”‚  - Run regression tests â”‚
â”‚  - Run regression tests â”‚       â”‚                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 14. REPOSITORY STRUCTURE

```
Kessel-Digital-Agent-Platform/
â”‚
â”œâ”€â”€ base/                                    # Shared across both environments
â”‚   â”œâ”€â”€ agents/
â”‚   â”‚   â”œâ”€â”€ orc/
â”‚   â”‚   â”‚   â”œâ”€â”€ instructions/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ ORC_Copilot_Instructions_v1.txt
â”‚   â”‚   â”‚   â””â”€â”€ kb/
â”‚   â”‚   â”‚       â””â”€â”€ ORC_KB_Routing_Logic_v1.txt
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ anl/
â”‚   â”‚   â”‚   â”œâ”€â”€ instructions/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ ANL_Copilot_Instructions_v1.txt
â”‚   â”‚   â”‚   â””â”€â”€ kb/
â”‚   â”‚   â”‚       â”œâ”€â”€ ANL_KB_Analytics_Core_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ ANL_KB_MMM_Methods_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ ANL_KB_Bayesian_Inference_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ ANL_KB_Causal_Incrementality_v1.txt
â”‚   â”‚   â”‚       â””â”€â”€ ANL_KB_Budget_Optimization_v1.txt
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ aud/
â”‚   â”‚   â”‚   â”œâ”€â”€ instructions/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ AUD_Copilot_Instructions_v1.txt
â”‚   â”‚   â”‚   â””â”€â”€ kb/
â”‚   â”‚   â”‚       â”œâ”€â”€ AUD_KB_Audience_Core_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ AUD_KB_Identity_Resolution_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ AUD_KB_LTV_Modeling_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ AUD_KB_Propensity_ML_v1.txt
â”‚   â”‚   â”‚       â””â”€â”€ AUD_KB_Journey_Orchestration_v1.txt
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ cha/
â”‚   â”‚   â”‚   â”œâ”€â”€ instructions/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ CHA_Copilot_Instructions_v1.txt
â”‚   â”‚   â”‚   â””â”€â”€ kb/
â”‚   â”‚   â”‚       â”œâ”€â”€ CHA_KB_Channel_Core_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ CHA_KB_Allocation_Methods_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ CHA_KB_Emerging_Channels_v1.txt
â”‚   â”‚   â”‚       â””â”€â”€ CHA_KB_Brand_Performance_v1.txt
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ spo/
â”‚   â”‚   â”‚   â”œâ”€â”€ instructions/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ SPO_Copilot_Instructions_v1.txt
â”‚   â”‚   â”‚   â””â”€â”€ kb/
â”‚   â”‚   â”‚       â”œâ”€â”€ SPO_KB_SPO_Core_v1.txt
â”‚   â”‚   â”‚       â”œâ”€â”€ SPO_KB_Fee_Analysis_v1.txt
â”‚   â”‚   â”‚       â””â”€â”€ SPO_KB_Partner_Evaluation_v1.txt
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ doc/
â”‚   â”‚   â”‚   â”œâ”€â”€ instructions/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ DOC_Copilot_Instructions_v1.txt
â”‚   â”‚   â”‚   â””â”€â”€ kb/
â”‚   â”‚   â”‚       â”œâ”€â”€ DOC_KB_Document_Core_v1.txt
â”‚   â”‚   â”‚       â””â”€â”€ DOC_KB_Export_Formats_v1.txt
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ prf/
â”‚   â”‚       â”œâ”€â”€ instructions/
â”‚   â”‚       â”‚   â””â”€â”€ PRF_Copilot_Instructions_v1.txt
â”‚   â”‚       â””â”€â”€ kb/
â”‚   â”‚           â”œâ”€â”€ PRF_KB_Performance_Core_v1.txt
â”‚   â”‚           â”œâ”€â”€ PRF_KB_Attribution_Methods_v1.txt
â”‚   â”‚           â”œâ”€â”€ PRF_KB_Incrementality_Testing_v1.txt
â”‚   â”‚           â””â”€â”€ PRF_KB_Anomaly_Detection_v1.txt
â”‚   â”‚
â”‚   â”œâ”€â”€ platform/
â”‚   â”‚   â””â”€â”€ eap/
â”‚   â”‚       â”œâ”€â”€ kb/
â”‚   â”‚       â”‚   â”œâ”€â”€ EAP_KB_Data_Provenance_v1.txt
â”‚   â”‚       â”‚   â”œâ”€â”€ EAP_KB_Confidence_Levels_v1.txt
â”‚   â”‚       â”‚   â”œâ”€â”€ EAP_KB_Error_Handling_v1.txt
â”‚   â”‚       â”‚   â”œâ”€â”€ EAP_KB_Formatting_Standards_v1.txt
â”‚   â”‚       â”‚   â”œâ”€â”€ EAP_KB_Strategic_Principles_v1.txt
â”‚   â”‚       â”‚   â””â”€â”€ EAP_KB_Communication_Contract_v1.txt
â”‚   â”‚       â”‚
â”‚   â”‚       â”œâ”€â”€ prompts/                     # AI Builder prompt definitions
â”‚   â”‚       â”‚   â”œâ”€â”€ ANL_MarginalReturn_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ ANL_ScenarioCompare_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ ANL_Projection_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ ANL_Confidence_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ AUD_SegmentPriority_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ AUD_LTVAssess_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ AUD_JourneyState_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ CHA_ChannelMix_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ CHA_ChannelSelect_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ PRF_Anomaly_Prompt.json
â”‚   â”‚       â”‚   â”œâ”€â”€ PRF_Attribution_Prompt.json
â”‚   â”‚       â”‚   â””â”€â”€ ORC_Intent_Prompt.json
â”‚   â”‚       â”‚
â”‚   â”‚       â””â”€â”€ flows/
â”‚   â”‚           â”œâ”€â”€ MPA_Capability_Dispatcher.json
â”‚   â”‚           â”œâ”€â”€ MPA_Impl_AIBuilder.json
â”‚   â”‚           â”œâ”€â”€ MPA_Impl_DataverseLogic.json
â”‚   â”‚           â”œâ”€â”€ MPA_Session_Initialize.json
â”‚   â”‚           â”œâ”€â”€ MPA_Session_Update.json
â”‚   â”‚           â”œâ”€â”€ MPA_Gate_Validate.json
â”‚   â”‚           â””â”€â”€ MPA_Telemetry_Log.json
â”‚   â”‚
â”‚   â”œâ”€â”€ dataverse/
â”‚   â”‚   â”œâ”€â”€ schema/
â”‚   â”‚   â”‚   â”œâ”€â”€ eap_agent.json
â”‚   â”‚   â”‚   â”œâ”€â”€ eap_capability.json
â”‚   â”‚   â”‚   â”œâ”€â”€ eap_capability_implementation.json
â”‚   â”‚   â”‚   â”œâ”€â”€ eap_prompt.json
â”‚   â”‚   â”‚   â”œâ”€â”€ eap_test_case.json
â”‚   â”‚   â”‚   â”œâ”€â”€ eap_telemetry.json
â”‚   â”‚   â”‚   â”œâ”€â”€ mpa_channel.json
â”‚   â”‚   â”‚   â”œâ”€â”€ mpa_kpi.json
â”‚   â”‚   â”‚   â”œâ”€â”€ mpa_benchmark.json
â”‚   â”‚   â”‚   â”œâ”€â”€ mpa_vertical.json
â”‚   â”‚   â”‚   â””â”€â”€ mpa_partner.json
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ seed/
â”‚   â”‚       â”œâ”€â”€ eap_agent_seed.csv
â”‚   â”‚       â”œâ”€â”€ eap_capability_seed.csv
â”‚   â”‚       â”œâ”€â”€ eap_prompt_seed.csv
â”‚   â”‚       â”œâ”€â”€ mpa_channel_seed.csv
â”‚   â”‚       â”œâ”€â”€ mpa_kpi_seed.csv
â”‚   â”‚       â”œâ”€â”€ mpa_benchmark_seed.csv
â”‚   â”‚       â””â”€â”€ mpa_vertical_seed.csv
â”‚   â”‚
â”‚   â””â”€â”€ tests/
â”‚       â”œâ”€â”€ scenarios/
â”‚       â”‚   â”œâ”€â”€ routing_tests.json
â”‚       â”‚   â”œâ”€â”€ calculation_tests.json
â”‚       â”‚   â”œâ”€â”€ integration_tests.json
â”‚       â”‚   â””â”€â”€ e2e_tests.json
â”‚       â”‚
â”‚       â””â”€â”€ validators/
â”‚           â”œâ”€â”€ validate_kb_file.sh
â”‚           â”œâ”€â”€ validate_prompt.py
â”‚           â””â”€â”€ validate_schema.py
â”‚
â”œâ”€â”€ environments/
â”‚   â”œâ”€â”€ mastercard/
â”‚   â”‚   â”œâ”€â”€ seed/
â”‚   â”‚   â”‚   â””â”€â”€ eap_capability_impl_mastercard.csv
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ config/
â”‚   â”‚       â””â”€â”€ environment_config.json
â”‚   â”‚
â”‚   â””â”€â”€ personal/
â”‚       â”œâ”€â”€ flows/
â”‚       â”‚   â”œâ”€â”€ MPA_Impl_AzureFunction.json
â”‚       â”‚   â””â”€â”€ MPA_Impl_HTTPEndpoint.json
â”‚       â”‚
â”‚       â”œâ”€â”€ functions/
â”‚       â”‚   â”œâ”€â”€ marginal-return/
â”‚       â”‚   â”‚   â”œâ”€â”€ function.json
â”‚       â”‚   â”‚   â””â”€â”€ __init__.py
â”‚       â”‚   â”‚
â”‚       â”‚   â”œâ”€â”€ scenario-compare/
â”‚       â”‚   â”‚   â”œâ”€â”€ function.json
â”‚       â”‚   â”‚   â””â”€â”€ __init__.py
â”‚       â”‚   â”‚
â”‚       â”‚   â”œâ”€â”€ projection/
â”‚       â”‚   â”‚   â”œâ”€â”€ function.json
â”‚       â”‚   â”‚   â””â”€â”€ __init__.py
â”‚       â”‚   â”‚
â”‚       â”‚   â”œâ”€â”€ bayesian-inference/
â”‚       â”‚   â”‚   â”œâ”€â”€ function.json
â”‚       â”‚   â”‚   â””â”€â”€ __init__.py
â”‚       â”‚   â”‚
â”‚       â”‚   â”œâ”€â”€ segment-priority/
â”‚       â”‚   â”‚   â”œâ”€â”€ function.json
â”‚       â”‚   â”‚   â””â”€â”€ __init__.py
â”‚       â”‚   â”‚
â”‚       â”‚   â”œâ”€â”€ ltv-assess/
â”‚       â”‚   â”‚   â”œâ”€â”€ function.json
â”‚       â”‚   â”‚   â””â”€â”€ __init__.py
â”‚       â”‚   â”‚
â”‚       â”‚   â”œâ”€â”€ anomaly-detect/
â”‚       â”‚   â”‚   â”œâ”€â”€ function.json
â”‚       â”‚   â”‚   â””â”€â”€ __init__.py
â”‚       â”‚   â”‚
â”‚       â”‚   â”œâ”€â”€ attribution/
â”‚       â”‚   â”‚   â”œâ”€â”€ function.json
â”‚       â”‚   â”‚   â””â”€â”€ __init__.py
â”‚       â”‚   â”‚
â”‚       â”‚   â”œâ”€â”€ host.json
â”‚       â”‚   â”œâ”€â”€ local.settings.json
â”‚       â”‚   â””â”€â”€ requirements.txt
â”‚       â”‚
â”‚       â”œâ”€â”€ seed/
â”‚       â”‚   â””â”€â”€ eap_capability_impl_personal.csv
â”‚       â”‚
â”‚       â””â”€â”€ config/
â”‚           â””â”€â”€ environment_config.json
â”‚
â”œâ”€â”€ deploy/
â”‚   â”œâ”€â”€ scripts/
â”‚   â”‚   â”œâ”€â”€ deploy-base.ps1
â”‚   â”‚   â”œâ”€â”€ deploy-mastercard.ps1
â”‚   â”‚   â”œâ”€â”€ deploy-personal.ps1
â”‚   â”‚   â””â”€â”€ validate-all.sh
â”‚   â”‚
â”‚   â”œâ”€â”€ mastercard/
â”‚   â”‚   â””â”€â”€ solution/
â”‚   â”‚
â”‚   â””â”€â”€ personal/
â”‚       â””â”€â”€ solution/
â”‚
â””â”€â”€ docs/
    â”œâ”€â”€ architecture/
    â”‚   â”œâ”€â”€ MPA_Architecture_v6.0.md
    â”‚   â”œâ”€â”€ MPA_Dataverse_Schema_v6.0.md
    â”‚   â”œâ”€â”€ MPA_AI_Builder_Prompts_v6.0.md
    â”‚   â””â”€â”€ MPA_Azure_Functions_v6.0.md
    â”‚
    â”œâ”€â”€ operations/
    â”‚   â”œâ”€â”€ VSCODE_Instructions.md
    â”‚   â””â”€â”€ DESKTOP_Instructions.md
    â”‚
    â””â”€â”€ decisions/
        â””â”€â”€ MPA_v6_Architecture_Decisions_Summary.md
```

---

## 15. IMPLEMENTATION ROADMAP

### 15.1 Phase 1: Foundation (Days 1-3)

**Objective:** Establish shared infrastructure

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create repository structure | VS Code | Directory structure per spec |
| Deploy Dataverse schema | VS Code | 11 tables created |
| Load seed data | VS Code | Reference data loaded |
| Create EAP shared KB (6 files) | Desktop | EAP_KB_*.txt files |
| Deploy core flows | VS Code | 7 platform flows |

### 15.2 Phase 2: Core KB Files (Days 4-6)

**Objective:** Create foundational KB for each agent

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create ORC KB | Desktop | ORC_KB_Routing_Logic_v1.txt |
| Create ANL Core KB | Desktop | ANL_KB_Analytics_Core_v1.txt |
| Create AUD Core KB | Desktop | AUD_KB_Audience_Core_v1.txt |
| Create CHA Core KB | Desktop | CHA_KB_Channel_Core_v1.txt |
| Create SPO Core KB | Desktop | SPO_KB_SPO_Core_v1.txt |
| Create DOC Core KB | Desktop | DOC_KB_Document_Core_v1.txt |
| Create PRF Core KB | Desktop | PRF_KB_Performance_Core_v1.txt |

### 15.3 Phase 3: ANL Deep Modules (Days 7-9)

**Objective:** Create analytics depth modules, absorbing NDS content

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create ANL_KB_Budget_Optimization | Desktop | Includes NDS marginal return, response curves |
| Create ANL_KB_Causal_Incrementality | Desktop | Includes NDS spend logic |
| Create ANL_KB_MMM_Methods | Desktop | Media Mix Modeling methodology |
| Create ANL_KB_Bayesian_Inference | Desktop | Bayesian methods |

### 15.4 Phase 4: AUD Deep Modules (Days 10-12)

**Objective:** Create audience depth modules, absorbing CSO content

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create AUD_KB_Journey_Orchestration | Desktop | Includes all CSO content |
| Create AUD_KB_Identity_Resolution | Desktop | Identity graph, household |
| Create AUD_KB_LTV_Modeling | Desktop | LTV, card portfolio |
| Create AUD_KB_Propensity_ML | Desktop | ML propensity models |

### 15.5 Phase 5: Remaining Deep Modules (Days 13-15)

**Objective:** Complete all deep modules

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create CHA deep modules (3) | Desktop | Allocation, Emerging, Brand |
| Create SPO deep modules (2) | Desktop | Fee Analysis, Partner Eval |
| Create DOC deep module (1) | Desktop | Export Formats |
| Create PRF deep modules (3) | Desktop | Attribution, Incrementality, Anomaly |

### 15.6 Phase 6: AI Builder Prompts (Days 16-18)

**Objective:** Create all AI Builder prompts

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create ANL prompts (6) | VS Code | AI Builder prompts deployed |
| Create AUD prompts (4) | VS Code | AI Builder prompts deployed |
| Create CHA prompts (3) | VS Code | AI Builder prompts deployed |
| Create SPO prompts (3) | VS Code | AI Builder prompts deployed |
| Create PRF prompts (4) | VS Code | AI Builder prompts deployed |
| Create ORC prompts (2) | VS Code | AI Builder prompts deployed |

### 15.7 Phase 7: Azure Functions - Personal (Days 19-21)

**Objective:** Create enhanced implementations for Personal environment

| Task | Owner | Deliverable |
|------|-------|-------------|
| Deploy Azure Function App | VS Code | Function App created |
| Implement ANL functions | VS Code | 4 functions deployed |
| Implement AUD functions | VS Code | 2 functions deployed |
| Implement PRF functions | VS Code | 2 functions deployed |
| Configure capability implementations | VS Code | eap_capability_impl_personal.csv loaded |

### 15.8 Phase 8: Agent Configuration (Days 22-24)

**Objective:** Configure Copilot Studio agents

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create agent instructions (7) | Desktop | Instruction files |
| Configure Copilot agents | VS Code | 10 agents configured in Copilot Studio |
| Connect KB sources | VS Code | SharePoint KB linked |
| Configure capabilities | VS Code | Capability mappings configured |

### 15.9 Phase 9: Testing & Validation (Days 25-27)

**Objective:** Comprehensive testing

| Task | Owner | Deliverable |
|------|-------|-------------|
| Load test cases | VS Code | eap_test_case populated |
| Run routing tests | VS Code | Routing validated |
| Run calculation tests | VS Code | Calculations validated |
| Run E2E tests | VS Code | Full workflows validated |
| Fix issues | Both | All tests passing |

### 15.10 Phase 10: Deployment (Days 28-30)

**Objective:** Production deployment

| Task | Owner | Deliverable |
|------|-------|-------------|
| Deploy to Personal | VS Code | Personal environment live |
| Run smoke tests | VS Code | Personal validated |
| Deploy to Mastercard | VS Code | Mastercard environment live |
| Run smoke tests | VS Code | Mastercard validated |
| Documentation finalization | Both | All docs complete |

---

## APPENDICES

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| CAL | Capability Abstraction Layer |
| DLP | Data Loss Prevention (Mastercard security policy) |
| EAP | Enterprise Agent Platform (shared infrastructure) |
| KB | Knowledge Base |
| MPA | Media Planning Agent |
| NBA | Next-Best-Action |
| NBI | Net Bidder Impact (programmatic metric) |
| ORC | Orchestrator Agent |

### Appendix B: Related Documents

- MPA_Dataverse_Schema_v6.0.md - Complete table specifications
- MPA_AI_Builder_Prompts_v6.0.md - Detailed prompt specifications
- MPA_Azure_Functions_v6.0.md - Function specifications (Personal)
- VSCODE_Instructions.md - Repository and deployment operations
- DESKTOP_Instructions.md - Content creation instructions

### Appendix C: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-18 | Claude | Initial release |
| 2.0 | 2026-01-22 | Claude | Updated for v6.6: 10 agents, 135 KB files, 69 AI Builder prompts, 24 Dataverse tables |

---

**Document Version:** 2.0  
**Created:** January 18, 2026  
**Updated:** January 22, 2026  
**Status:** Production Ready
