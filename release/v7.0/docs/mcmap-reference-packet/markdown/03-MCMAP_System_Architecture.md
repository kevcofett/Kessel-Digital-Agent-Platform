# MASTERCARD CONSULTING & MARKETING AGENT PLATFORM (MCMAP)
# MASTERCARD DEPLOYMENT - SYSTEM ARCHITECTURE SPECIFICATION

**Document:** 02-MCMAP_System_Architecture.md  
**Version:** 1.0  
**Date:** January 23, 2026  
**Classification:** Mastercard Internal  
**Status:** Production Ready  
**Audience:** Engineering, Architecture, Integration Teams

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Design Principles](#2-design-principles)
3. [Component Architecture](#3-component-architecture)
4. [Agent Architecture](#4-agent-architecture)
5. [Capability Abstraction Layer](#5-capability-abstraction-layer)
6. [Knowledge Base Architecture](#6-knowledge-base-architecture)
7. [Flow Architecture](#7-flow-architecture)
8. [Integration Patterns](#8-integration-patterns)
9. [Environment Configuration](#9-environment-configuration)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 System Context

MCMAP operates within Mastercard's Microsoft Power Platform environment, providing AI-powered media planning and strategic consulting capabilities through a multi-agent orchestration system.

```
+-----------------------------------------------------------------------------+
|                         SYSTEM CONTEXT DIAGRAM                               |
+-----------------------------------------------------------------------------+
|                                                                              |
|  +--------------+         +----------------------------------+              |
|  |              |         |                                   |              |
|  |    USERS     |<------->|     MCMAP AGENT PLATFORM          |              |
|  |  (Browser/   |         |                                   |              |
|  |   Teams)     |         |  +-----------------------------+ |              |
|  |              |         |  |   Copilot Studio Agents     | |              |
|  +--------------+         |  |   (ORC, ANL, AUD, CHA,      | |              |
|                           |  |    SPO, DOC, PRF, CST,      | |              |
|                           |  |    CHG, CA)                 | |              |
|                           |  +-----------------------------+ |              |
|                           |                |                  |              |
|                           |                v                  |              |
|                           |  +-----------------------------+ |              |
|                           |  |   AI Builder Prompts (26)   | |              |
|                           |  +-----------------------------+ |              |
|                           |                |                  |              |
|                           |                v                  |              |
|                           |  +-----------------------------+ |              |
|                           |  |   Power Automate Flows (5)  | |              |
|                           |  +-----------------------------+ |              |
|                           |                |                  |              |
|                           +----------------+------------------+              |
|                                            |                                 |
|                    +-----------------------+-----------------------+        |
|                    |                       |                       |        |
|                    v                       v                       v        |
|           +--------------+        +--------------+        +--------------+ |
|           |  DATAVERSE   |        |  SHAREPOINT  |        |   AZURE AD   | |
|           | (14 Tables)  |        |  (37+ KB     |        |   (AuthN/    | |
|           |              |        |   Files)     |        |    AuthZ)    | |
|           +--------------+        +--------------+        +--------------+ |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 1.2 Key Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Total Agents | 10 | 7 MPA + 3 CA |
| Total KB Files | 37+ | Across all agents |
| Instruction Space | 80,000 chars | 8K x 10 agents |
| AI Builder Prompts | 26 | Registered in eap_prompt |
| Dataverse Tables | 18 | EAP (8) + MPA (6) + Security (4) |
| Power Automate Flows | 8 | 5 Core + 3 Security (ABAC) |
| SharePoint Libraries | 1 | Knowledge Base hosting |
| ABAC Rules | 20+ | Content access control rules |

### 1.3 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Presentation | Copilot Studio | Conversational interface |
| Orchestration | Power Automate | Workflow execution |
| Computation | AI Builder | Custom prompts, analysis |
| Data | Dataverse | Structured data storage |
| Knowledge | SharePoint | Unstructured KB content |
| Identity | Azure AD | Authentication & authorization |
| Access Control | ABAC (Dataverse + Flows) | Attribute-based content protection |
| Monitoring | Power Platform Analytics | Observability |

---

## 2. DESIGN PRINCIPLES

### 2.1 Core Architecture Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Capability Abstraction** | Never hardcode implementation types | All computation routes through capability dispatcher |
| **Environment Parity** | Same agents work in all environments | Implementation registrations differ, not agent code |
| **DLP Compliance First** | Base flows must work without HTTP | AI Builder handles all shared computation |
| **AI Builder as Universal** | Every capability has AI Builder impl | Ensures portability across environments |
| **Deterministic Routing** | Routing via Dataverse, not KB retrieval | eap_agent table with capability tags |
| **Test-Driven Quality** | Golden test cases validate behavior | eap_test_case table, regression suite |
| **Observability by Default** | All calls logged | eap_telemetry captures every invocation |
| **Fail-Safe Fallbacks** | Graceful degradation on errors | Fallback implementations for all capabilities |

### 2.2 Architecture Decision Records

| ADR ID | Decision | Rationale | Status |
|--------|----------|-----------|--------|
| ADR-001 | 10 agents maximum | Routing complexity increases exponentially | Approved |
| ADR-002 | Deep modules per agent | Retrieval precision; focused content beats mega-documents | Approved |
| ADR-003 | Routing in Dataverse | Deterministic routing beats RAG-based routing | Approved |
| ADR-004 | AI Builder primary compute | Works in both DLP and non-DLP environments | Approved |
| ADR-005 | Capability abstraction layer | Enables environment-specific optimization | Approved |
| ADR-006 | SharePoint for KB hosting | Native integration, familiar tooling | Approved |
| ADR-007 | Session state in Dataverse | Enables multi-turn conversations | Approved |
| ADR-008 | Telemetry table design | Enables comprehensive observability | Approved |

---

## 3. COMPONENT ARCHITECTURE

### 3.1 Component Hierarchy

```
+-----------------------------------------------------------------------------+
|                        MCMAP COMPONENT ARCHITECTURE                           |
+-----------------------------------------------------------------------------+
|                                                                              |
|  TIER 1: PRESENTATION LAYER                                                  |
|  +------------------------------------------------------------------------+ |
|  |                      COPILOT STUDIO AGENTS                             | |
|  |  +-----+ +-----+ +-----+ +-----+ +-----+ +-----+ +-----+              | |
|  |  | ORC | | ANL | | AUD | | CHA | | SPO | | DOC | | PRF |              | |
|  |  +-----+ +-----+ +-----+ +-----+ +-----+ +-----+ +-----+              | |
|  |                                                                        | |
|  |  +-----+ +-----+ +-----+                                              | |
|  |  | CST | | CHG | | CA  |                                              | |
|  |  +-----+ +-----+ +-----+                                              | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  TIER 2: ORCHESTRATION LAYER                                                |
|  +------------------------------------------------------------------------+ |
|  |                     POWER AUTOMATE FLOWS                               | |
|  |  +----------------------+  +----------------------+                   | |
|  |  |  Capability_Dispatch |  |  Session_Manager     |                   | |
|  |  +----------------------+  +----------------------+                   | |
|  |  +----------------------+  +----------------------+                   | |
|  |  |  AIBuilder_Execute   |  |  Telemetry_Logger    |                   | |
|  |  +----------------------+  +----------------------+                   | |
|  |  +----------------------+                                             | |
|  |  |  Document_Generate   |                                             | |
|  |  +----------------------+                                             | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  TIER 3: COMPUTATION LAYER                                                  |
|  +------------------------------------------------------------------------+ |
|  |                     AI BUILDER CUSTOM PROMPTS                          | |
|  |  +----------------------------------------------------------------+   | |
|  |  |  ANL: 6 prompts  |  AUD: 5 prompts  |  CHA: 3 prompts        |   | |
|  |  |  SPO: 3 prompts  |  PRF: 4 prompts  |  DOC: 3 prompts        |   | |
|  |  |  ORC: 2 prompts                                               |   | |
|  |  +----------------------------------------------------------------+   | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  TIER 4: DATA LAYER                                                         |
|  +------------------------------------------------------------------------+ |
|  |                          DATAVERSE                                     | |
|  |  +-----------------------------+  +-----------------------------+     | |
|  |  |      EAP TABLES (8)         |  |      MPA TABLES (6)         |     | |
|  |  |  - eap_agent                |  |  - mpa_channel              |     | |
|  |  |  - eap_capability           |  |  - mpa_kpi                  |     | |
|  |  |  - eap_capability_impl      |  |  - mpa_benchmark            |     | |
|  |  |  - eap_prompt               |  |  - mpa_vertical             |     | |
|  |  |  - eap_test_case            |  |  - mpa_partner              |     | |
|  |  |  - eap_telemetry            |  |  - mpa_session              |     | |
|  |  |  - eap_environment_config   |  |                             |     | |
|  |  |  - eap_session              |  |                             |     | |
|  |  +-----------------------------+  +-----------------------------+     | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  TIER 5: KNOWLEDGE LAYER                                                    |
|  +------------------------------------------------------------------------+ |
|  |                         SHAREPOINT                                     | |
|  |  +-----------------------------------------------------------------+  | |
|  |  |  KNOWLEDGE BASE LIBRARY (37+ Files)                             |  | |
|  |  |  - Agent Instructions (10 files, 8K chars each)                 |  | |
|  |  |  - Core KB Files (10 files, 20-25K chars each)                  |  | |
|  |  |  - Deep Module KB Files (17+ files, 15-25K chars each)          |  | |
|  |  +-----------------------------------------------------------------+  | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 3.2 Component Specifications

#### 3.2.1 Copilot Studio Agents

| Component | Specification |
|-----------|---------------|
| **Technology** | Microsoft Copilot Studio |
| **Instance Count** | 10 agents |
| **Instructions Limit** | 8,000 characters per agent |
| **Knowledge Source** | SharePoint document library |
| **Topics** | 3-5 topics per agent |
| **Authentication** | Azure AD single sign-on |

#### 3.2.2 Power Automate Flows

| Flow Name | Trigger | Purpose |
|-----------|---------|---------|
| **MPA_Capability_Dispatcher** | HTTP (Internal) | Routes capability requests to implementations |
| **MPA_Session_Manager** | HTTP (Internal) | Manages session creation and state |
| **MPA_Impl_AIBuilder** | Child Flow | Executes AI Builder prompts |
| **MPA_Telemetry_Logger** | Child Flow | Logs capability invocations |
| **MPA_Document_Generate** | Child Flow | Generates output documents |

#### 3.2.3 AI Builder Prompts

| Prompt Category | Count | Function |
|-----------------|-------|----------|
| Analytics (ANL_*) | 6 | Projections, calculations, modeling |
| Audience (AUD_*) | 5 | Segmentation, LTV, journey analysis |
| Channel (CHA_*) | 3 | Channel selection, mix optimization |
| Supply Path (SPO_*) | 3 | Fee analysis, partner evaluation |
| Performance (PRF_*) | 4 | Attribution, anomaly detection |
| Document (DOC_*) | 3 | Document generation, templates |
| Orchestrator (ORC_*) | 2 | Intent classification, validation |

---

## 4. AGENT ARCHITECTURE

### 4.1 Agent Inventory

| Code | Name | Domain | Instructions | Core KB | Deep Modules |
|------|------|--------|--------------|---------|--------------|
| ORC | Orchestrator | Platform | 8K chars | 1 | 0 |
| ANL | Analytics | MPA | 8K chars | 1 | 4 |
| AUD | Audience | MPA | 8K chars | 1 | 4 |
| CHA | Channel | MPA | 8K chars | 1 | 3 |
| SPO | Supply Path | MPA | 8K chars | 1 | 2 |
| DOC | Document | MPA | 8K chars | 1 | 1 |
| PRF | Performance | MPA | 8K chars | 1 | 3 |
| CST | Consulting Strategy | CA | 8K chars | 1 | 3 |
| CHG | Change Management | CA | 8K chars | 1 | 2 |
| CA | Consulting Agent | CA | 8K chars | 1 | 3 |

### 4.2 Agent Interaction Flow

```
+-----------------------------------------------------------------------------+
|                        AGENT INTERACTION SEQUENCE                            |
+-----------------------------------------------------------------------------+
|                                                                              |
|  USER                ORC                SPECIALIST            CAPABILITY     |
|   |                   |                    |                  DISPATCHER     |
|   |                   |                    |                      |          |
|   |  1. Request       |                    |                      |          |
|   |------------------>|                    |                      |          |
|   |                   |                    |                      |          |
|   |                   |  2. Classify       |                      |          |
|   |                   |     Intent         |                      |          |
|   |                   |--------------------+                      |          |
|   |                   |                    |                      |          |
|   |                   |  3. Route          |                      |          |
|   |                   |------------------> |                      |          |
|   |                   |                    |                      |          |
|   |                   |                    |  4. Retrieve KB      |          |
|   |                   |                    |-----------------+    |          |
|   |                   |                    |<----------------+    |          |
|   |                   |                    |                      |          |
|   |                   |                    |  5. Execute          |          |
|   |                   |                    |     Capability       |          |
|   |                   |                    |--------------------->|          |
|   |                   |                    |                      |          |
|   |                   |                    |  6. Return Result    |          |
|   |                   |                    |<---------------------|          |
|   |                   |                    |                      |          |
|   |                   |  7. Response       |                      |          |
|   |                   |<-------------------|                      |          |
|   |                   |                    |                      |          |
|   |  8. Final Reply   |                    |                      |          |
|   |<------------------|                    |                      |          |
|   |                   |                    |                      |          |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 4.3 Agent Routing Logic

| Intent Pattern | Routed Agent | Example Queries |
|----------------|--------------|-----------------|
| budget, projection, forecast, calculate | ANL | "Project Q2 performance" |
| audience, segment, target, persona, ltv | AUD | "Prioritize audience segments" |
| channel, media, mix, allocation | CHA | "Recommend channel mix" |
| programmatic, ssp, dsp, fee, supply | SPO | "Analyze supply path fees" |
| document, export, report, brief | DOC | "Generate media brief" |
| performance, attribution, optimize, anomaly | PRF | "Detect anomalies in campaign" |
| framework, strategy, analysis, prioritize | CST | "Apply Porter's Five Forces" |
| change, adoption, stakeholder, readiness | CHG | "Assess change readiness" |
| workflow, step, gate, help | ORC | "What step am I on?" |

---

## 5. CAPABILITY ABSTRACTION LAYER

### 5.1 Architecture Overview

The Capability Abstraction Layer (CAL) enables environment-specific implementations without modifying agent code:

```
+-----------------------------------------------------------------------------+
|                    CAPABILITY ABSTRACTION LAYER                              |
+-----------------------------------------------------------------------------+
|                                                                              |
|  AGENT REQUEST                                                               |
|  +------------------------------------------------------------------------+ |
|  |  capability_code: "ANL_MARGINAL_RETURN"                                | |
|  |  inputs_json: {"budget": 500000, "channel": "search"}                  | |
|  |  session_id: "abc-123"                                                 | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  CAPABILITY DISPATCHER FLOW                                                  |
|  +------------------------------------------------------------------------+ |
|  |  Step 1: Get environment_code from eap_environment_config              | |
|  |          -> Returns: "MASTERCARD"                                       | |
|  |                                                                        | |
|  |  Step 2: Query eap_capability_implementation                           | |
|  |          WHERE capability_code = "ANL_MARGINAL_RETURN"                 | |
|  |          AND environment_code = "MASTERCARD"                           | |
|  |          AND is_enabled = true                                         | |
|  |          ORDER BY priority_order ASC                                   | |
|  |          -> Returns: implementation_type = "AI_BUILDER_PROMPT"          | |
|  |                     prompt_code = "ANL_MARGINAL_RETURN_PROMPT"         | |
|  |                                                                        | |
|  |  Step 3: Route to MPA_Impl_AIBuilder flow                              | |
|  |          -> Execute AI Builder prompt                                   | |
|  |          -> Return structured result                                    | |
|  |                                                                        | |
|  |  Step 4: Log to eap_telemetry                                          | |
|  |          -> capability_code, implementation_type, latency_ms, success   | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  STRUCTURED RESULT                                                           |
|  +------------------------------------------------------------------------+ |
|  |  {                                                                     | |
|  |    "success": true,                                                    | |
|  |    "result": { "marginal_return": 1.23, "confidence": "HIGH" },       | |
|  |    "implementation": "AI_BUILDER_PROMPT",                              | |
|  |    "latency_ms": 847                                                   | |
|  |  }                                                                     | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 5.2 Implementation Types

| Type | Description | Mastercard Support |
|------|-------------|-------------------|
| AI_BUILDER_PROMPT | AI Builder custom prompt | [CHECK] PRIMARY |
| DATAVERSE_LOGIC | Power Fx calculation | [CHECK] SUPPORTED |
| AZURE_FUNCTION | Azure Function call | [X] BLOCKED BY DLP |
| HTTP_ENDPOINT | External HTTP call | [X] BLOCKED BY DLP |

### 5.3 Capability Registry

All capabilities are registered in the `eap_capability` Dataverse table:

| Capability Code | Agent | Description |
|-----------------|-------|-------------|
| ANL_MARGINAL_RETURN | ANL | Calculate marginal return curves |
| ANL_SCENARIO_COMPARE | ANL | Compare budget allocation scenarios |
| ANL_PROJECTION | ANL | Generate performance projections |
| ANL_CONFIDENCE | ANL | Assess confidence levels |
| ANL_BAYESIAN | ANL | Apply Bayesian inference |
| ANL_CAUSAL | ANL | Perform causal analysis |
| AUD_SEGMENT_PRIORITY | AUD | Prioritize audience segments |
| AUD_LTV_ASSESS | AUD | Evaluate lifetime value |
| AUD_JOURNEY_STATE | AUD | Determine journey state |
| AUD_PROPENSITY | AUD | Calculate propensity scores |
| AUD_IDENTITY | AUD | Resolve identity |
| CHA_CHANNEL_MIX | CHA | Optimize channel allocation |
| CHA_CHANNEL_SELECT | CHA | Recommend channels |
| CHA_EMERGING_ASSESS | CHA | Evaluate emerging channels |
| SPO_FEE_WATERFALL | SPO | Calculate fee decomposition |
| SPO_PARTNER_SCORE | SPO | Evaluate partner quality |
| SPO_NBI_CALCULATE | SPO | Compute net bidder impact |
| PRF_ANOMALY | PRF | Detect anomalies |
| PRF_ATTRIBUTION | PRF | Analyze attribution |
| PRF_INCREMENTALITY | PRF | Measure incremental impact |
| PRF_OPTIMIZE | PRF | Recommend optimizations |
| DOC_GENERATE | DOC | Generate document |
| DOC_TEMPLATE_SELECT | DOC | Choose template |
| DOC_FORMAT_EXPORT | DOC | Export to format |
| ORC_INTENT | ORC | Classify user intent |
| ORC_VALIDATE_GATE | ORC | Validate workflow gate |

---

## 6. KNOWLEDGE BASE ARCHITECTURE

### 6.1 KB File Structure

```
SHAREPOINT: /sites/MCMAP/Shared Documents/Knowledge Base/

+-- instructions/                    # Agent instruction files (10 files)
|   +-- ORC_Copilot_Instructions_v1.txt
|   +-- ANL_Copilot_Instructions_v1.txt
|   +-- AUD_Copilot_Instructions_v1.txt
|   +-- CHA_Copilot_Instructions_v1.txt
|   +-- SPO_Copilot_Instructions_v1.txt
|   +-- DOC_Copilot_Instructions_v1.txt
|   +-- PRF_Copilot_Instructions_v1.txt
|   +-- CST_Copilot_Instructions_v1.txt
|   +-- CHG_Copilot_Instructions_v1.txt
|   +-- CA_Copilot_Instructions_v1.txt
|
+-- core/                            # Core KB files (10 files)
|   +-- ORC_KB_Routing_Logic_v1.txt
|   +-- ANL_KB_Analytics_Core_v1.txt
|   +-- AUD_KB_Audience_Core_v1.txt
|   +-- CHA_KB_Channel_Core_v1.txt
|   +-- SPO_KB_Supply_Core_v1.txt
|   +-- DOC_KB_Document_Core_v1.txt
|   +-- PRF_KB_Performance_Core_v1.txt
|   +-- CST_KB_Consulting_Core_v1.txt
|   +-- CHG_KB_Change_Core_v1.txt
|   +-- CA_KB_Analysis_Core_v1.txt
|
+-- deep-modules/                    # Deep module KB files (17+ files)
|   +-- ANL_KB_MMM_Methods_v1.txt
|   +-- ANL_KB_Bayesian_Inference_v1.txt
|   +-- ANL_KB_Causal_Incrementality_v1.txt
|   +-- ANL_KB_Budget_Optimization_v1.txt
|   +-- AUD_KB_Identity_Resolution_v1.txt
|   +-- AUD_KB_LTV_Modeling_v1.txt
|   +-- AUD_KB_Propensity_ML_v1.txt
|   +-- AUD_KB_Journey_Orchestration_v1.txt
|   +-- CHA_KB_Allocation_Methods_v1.txt
|   +-- CHA_KB_Emerging_Channels_v1.txt
|   +-- CHA_KB_Brand_Performance_v1.txt
|   +-- SPO_KB_Fee_Analysis_v1.txt
|   +-- SPO_KB_Partner_Evaluation_v1.txt
|   +-- PRF_KB_Attribution_Methods_v1.txt
|   +-- PRF_KB_Incrementality_Testing_v1.txt
|   +-- PRF_KB_Anomaly_Detection_v1.txt
|   +-- DOC_KB_Export_Formats_v1.txt
|
+-- shared/                          # EAP shared KB files (6 files)
    +-- EAP_KB_Data_Provenance_v1.txt
    +-- EAP_KB_Confidence_Levels_v1.txt
    +-- EAP_KB_Error_Handling_v1.txt
    +-- EAP_KB_Formatting_Standards_v1.txt
    +-- EAP_KB_Strategic_Principles_v1.txt
    +-- EAP_KB_Communication_Contract_v1.txt
```

### 6.2 KB File Specifications

| Category | Files | Char Limit | Total Capacity |
|----------|-------|------------|----------------|
| Instructions | 10 | 8,000 | 80,000 chars |
| Core KB | 10 | 36,000 | 360,000 chars |
| Deep Modules | 17+ | 36,000 | 612,000+ chars |
| EAP Shared | 6 | 36,000 | 216,000 chars |
| **TOTAL** | **43+** | - | **~1.3M chars** |

### 6.3 KB Content Guidelines (6-Rule Framework)

All KB files must comply with the 6-Rule Framework:

| Rule | Requirement | Validation |
|------|-------------|------------|
| 1 | ALL-CAPS section headers | Regex: ^[A-Z][A-Z0-9 ]+$ |
| 2 | Hyphens only for lists (no bullets) | No , --, --<, ~... characters |
| 3 | ASCII characters only | No Unicode special chars |
| 4 | Zero visual dependencies | No emoji, tables, formatting |
| 5 | Mandatory language patterns | Required phrases per section |
| 6 | Professional tone | No colloquialisms |

---

## 7. FLOW ARCHITECTURE

### 7.1 Flow Inventory

| Flow Name | Type | Trigger | Purpose |
|-----------|------|---------|---------|
| MPA_Capability_Dispatcher | Instant | Child Flow | Main capability routing |
| MPA_Session_Manager | Instant | Child Flow | Session CRUD operations |
| MPA_Impl_AIBuilder | Instant | Child Flow | AI Builder execution |
| MPA_Telemetry_Logger | Instant | Child Flow | Observability logging |
| MPA_Document_Generate | Instant | Child Flow | Document creation |

### 7.2 Capability Dispatcher Flow

```
+-----------------------------------------------------------------------------+
|                    MPA_CAPABILITY_DISPATCHER FLOW                            |
+-----------------------------------------------------------------------------+
|                                                                              |
|  INPUT:                                                                      |
|  +------------------------------------------------------------------------+ |
|  |  capability_code: string (e.g., "ANL_MARGINAL_RETURN")                 | |
|  |  inputs_json: string (JSON payload for capability)                     | |
|  |  session_id: string (session identifier)                               | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
|  STEP 1: GET ENVIRONMENT                                                     |
|  +------------------------------------------------------------------------+ |
|  |  Action: List rows from eap_environment_config                         | |
|  |  Filter: is_active eq true                                             | |
|  |  Output: environment_code (e.g., "MASTERCARD")                         | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
|  STEP 2: GET IMPLEMENTATION                                                  |
|  +------------------------------------------------------------------------+ |
|  |  Action: List rows from eap_capability_implementation                  | |
|  |  Filter: capability_code eq @{capability_code}                         | |
|  |          AND environment_code eq @{environment_code}                   | |
|  |          AND is_enabled eq true                                        | |
|  |  Order: priority_order asc                                             | |
|  |  Top: 1                                                                | |
|  |  Output: implementation_type, prompt_code, endpoint_url                | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
|  STEP 3: ROUTE TO IMPLEMENTATION (SWITCH)                                    |
|  +------------------------------------------------------------------------+ |
|  |  CASE: implementation_type = "AI_BUILDER_PROMPT"                       | |
|  |    -> Call MPA_Impl_AIBuilder (prompt_code, inputs_json)                | |
|  |                                                                        | |
|  |  CASE: implementation_type = "DATAVERSE_LOGIC"                         | |
|  |    -> Execute Power Fx expression                                       | |
|  |                                                                        | |
|  |  DEFAULT:                                                              | |
|  |    -> Return error (unsupported implementation)                         | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
|  STEP 4: ERROR HANDLING                                                      |
|  +------------------------------------------------------------------------+ |
|  |  IF: Primary implementation fails                                      | |
|  |  THEN: Query fallback_implementation_id                                | |
|  |        Retry with fallback implementation                              | |
|  |  ELSE: Return error response                                           | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
|  STEP 5: LOG TELEMETRY                                                       |
|  +------------------------------------------------------------------------+ |
|  |  Call: MPA_Telemetry_Logger                                            | |
|  |  Data: capability_code, implementation_type, latency_ms,               | |
|  |        success, session_id, timestamp                                  | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
|  OUTPUT:                                                                     |
|  +------------------------------------------------------------------------+ |
|  |  {                                                                     | |
|  |    "success": boolean,                                                 | |
|  |    "result": object,                                                   | |
|  |    "implementation": string,                                           | |
|  |    "latency_ms": number,                                               | |
|  |    "error": string | null                                              | |
|  |  }                                                                     | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
+-----------------------------------------------------------------------------+
```

---

## 8. INTEGRATION PATTERNS

### 8.1 Microsoft Teams Integration

```
+-----------------------------------------------------------------------------+
|                     TEAMS INTEGRATION ARCHITECTURE                           |
+-----------------------------------------------------------------------------+
|                                                                              |
|  TEAMS CLIENT                                                                |
|  +------------------------------------------------------------------------+ |
|  |  User types: "@MCMAP What's the optimal channel mix for $500K?"         | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  TEAMS BOT FRAMEWORK                                                         |
|  +------------------------------------------------------------------------+ |
|  |  Bot recognizes @mention -> Routes to Copilot Studio                    | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  COPILOT STUDIO                                                              |
|  +------------------------------------------------------------------------+ |
|  |  ORC Agent: Classifies intent -> Routes to CHA Agent                    | |
|  |  CHA Agent: Retrieves KB -> Executes CHA_CHANNEL_MIX capability         | |
|  |  Response: Returns channel mix recommendation                          | |
|  +------------------------------------------------------------------------+ |
|                                     |                                        |
|                                     v                                        |
|  TEAMS CLIENT                                                                |
|  +------------------------------------------------------------------------+ |
|  |  User sees: "For a $500K budget, I recommend..."                       | |
|  |  [Adaptive Card with channel breakdown]                                | |
|  +------------------------------------------------------------------------+ |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 8.2 SharePoint Integration

| Integration Point | Purpose | Method |
|-------------------|---------|--------|
| Knowledge Base | KB file hosting | Document Library |
| Document Output | Generated documents | Site Assets |
| User Portal | Custom entry point | SPFx Web Part |

### 8.3 Power Apps Integration

| Integration Point | Purpose | Method |
|-------------------|---------|--------|
| Canvas App | Custom UI wrapper | Copilot Studio Embed |
| Model-Driven App | Admin interface | Dataverse tables |

---

## 9. ENVIRONMENT CONFIGURATION

### 9.1 Mastercard Environment

```json
{
  "environment": {
    "code": "MASTERCARD",
    "name": "Mastercard Managed",
    "dataverseUrl": "https://[mastercard-org-id].crm.dynamics.com",
    "sharePointUrl": "https://[mastercard-tenant].sharepoint.com/sites/MCMAP"
  },
  "capabilities": {
    "httpConnector": false,
    "azureFunctions": false,
    "customConnectors": false
  },
  "aiBuilder": {
    "enabled": true,
    "fallbackOnly": false
  },
  "features": {
    "advancedAnalytics": true,
    "realTimeOptimization": false,
    "experimentalFeatures": false
  },
  "dlp": {
    "enabled": true,
    "approvedConnectors": [
      "Microsoft Dataverse",
      "AI Builder",
      "SharePoint",
      "Office 365",
      "Microsoft Teams",
      "Approvals",
      "Excel Online"
    ]
  }
}
```

### 9.2 Connector Approval Status

| Connector | Category | Status | DLP Group |
|-----------|----------|--------|-----------|
| Microsoft Dataverse | Data | [CHECK] Approved | Business |
| AI Builder | AI | [CHECK] Approved | Business |
| SharePoint | Collaboration | [CHECK] Approved | Business |
| Office 365 Outlook | Communication | [CHECK] Approved | Business |
| Office 365 Users | Identity | [CHECK] Approved | Business |
| Microsoft Teams | Collaboration | [CHECK] Approved | Business |
| Approvals | Workflow | [CHECK] Approved | Business |
| Excel Online (Business) | Data | [CHECK] Approved | Business |
| HTTP | External | Currently Turned Off | Non-Business |
| Custom Connectors | Custom | Currently Turned Off | Non-Business |

---

## 9.3 Platform Portability Assessment

MCMAP is designed for technology independence. While deployed on Microsoft Power Platform, the architecture adapts to alternative stacks:

| Layer | Current Implementation | Alternative Options | Portability Effort |
|-------|------------------------|---------------------|-------------------|
| **Orchestration** | Power Automate | LangGraph, LangChain, AutoGen | Medium - pattern translation |
| **Computation** | AI Builder | Direct LLM APIs, Azure OpenAI, Claude | Low - prompt reuse |
| **Data Storage** | Dataverse | **DataBricks**, PostgreSQL, MongoDB | Medium - schema mapping |
| **Knowledge Base** | SharePoint | Any RAG implementation, Vector DBs | Low - content portable |
| **Identity** | Azure AD | Any OIDC provider | Low - standard protocols |
| **Agents** | Copilot Studio | Custom agents, third-party platforms | Medium - logic portable |

**DataBricks Integration Path:**

For organizations using DataBricks as their primary data platform:
- MCMAP's data layer (Dataverse tables) can be replicated to DataBricks
- Capability implementations can query DataBricks directly via approved connectors
- Analytics and ML capabilities can leverage DataBricks compute
- Knowledge base can integrate with DataBricks-hosted document stores

**Key Portability Principles:**
- Abstracted orchestration enables framework migration
- Standard prompt contracts work with any LLM provider  
- Database independence through clean schema design
- API-first capabilities for external integration
- Modular knowledge base works with any RAG implementation

---

## 9.4 Future Integration Roadmap

MCMAP is designed to easily plug in additional agents and data sets as needs evolve:

| Integration Type | Description | Enablement Path |
|------------------|-------------|-----------------|
| **New Agents** | Additional specialist agents | Register with ORC, create KB, define capabilities |
| **External Data Sets** | Third-party data integration | Approved connector + capability implementation |
| **Partner Systems** | Client or partner platform integration | API exposure through capability layer |
| **MC Data Products** | SpendingPulse, Audiences, Commerce Media | Capability implementations with data access |
| **Analytics Platforms** | DataBricks, Snowflake, BigQuery | Connector enablement + query capabilities |

---

## 10. DEPLOYMENT ARCHITECTURE

### 10.1 Solution Structure

```
POWER PLATFORM SOLUTIONS

+-----------------------------------------------------------------------------+
|  MPA_v6_Platform (Managed Solution)                                         |
|  +-- Components                                                             |
|  |   +-- Dataverse Tables (18)                                              |
|  |   +-- Power Automate Flows (5)                                           |
|  |   +-- AI Builder Prompts (26)                                            |
|  |   +-- Environment Variables                                              |
|  +-- Dependencies                                                           |
|      +-- Dataverse (built-in)                                               |
|      +-- AI Builder (built-in)                                              |
|      +-- Power Automate (built-in)                                          |
+-----------------------------------------------------------------------------+
|  MPA_v6_Copilot_Agents (Managed Solution)                                   |
|  +-- Components                                                             |
|  |   +-- Copilot Studio Agents (10)                                         |
|  +-- Dependencies                                                           |
|      +-- MPA_v6_Platform                                                    |
|      +-- SharePoint KB Files (external)                                     |
+-----------------------------------------------------------------------------+
```

### 10.2 Deployment Sequence

```
DEPLOYMENT ORDER

1. DATAVERSE SCHEMA
   +-- Create tables in dependency order
       +-- Tier 1: No dependencies (eap_agent, mpa_vertical, etc.)
       +-- Tier 2: Depends on Tier 1 (eap_capability, mpa_benchmark)
       +-- Tier 3: Depends on Tier 2 (eap_capability_implementation)
       +-- Tier 4: Session tables (mpa_session, eap_telemetry)

2. SEED DATA
   +-- Load reference data
       +-- Agent registry (eap_agent)
       +-- Capability registry (eap_capability)
       +-- Implementation mappings (eap_capability_implementation)
       +-- Benchmark data (mpa_benchmark)

3. AI BUILDER PROMPTS
   +-- Create and register 26 prompts
       +-- Register in eap_prompt table

4. POWER AUTOMATE FLOWS
   +-- Import and configure 5 flows
       +-- Configure connections
       +-- Enable flows

5. SHAREPOINT KB
   +-- Upload 37+ KB files
       +-- Create document library
       +-- Upload files
       +-- Verify accessibility

6. COPILOT STUDIO AGENTS
   +-- Create and configure 10 agents
       +-- Import agent definitions
       +-- Link knowledge sources
       +-- Configure topics
       +-- Publish agents

7. VALIDATION
   +-- Execute test suite
       +-- Unit tests
       +-- Integration tests
       +-- E2E tests
```

---

**Document Version:** 1.0  
**Classification:** Mastercard Internal  
**Last Updated:** January 23, 2026
