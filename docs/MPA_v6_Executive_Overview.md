# MEDIA PLANNING AGENT v6.1
# EXECUTIVE TECHNICAL OVERVIEW

**Document Classification:** Technical Architecture Overview  
**Version:** 1.1  
**Date:** January 19, 2026  
**Prepared For:** Mastercard Engineering and Business Leadership  
**Prepared By:** Kessel Digital

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
   - 1.1 Platform Purpose
   - 1.2 Business Value Proposition
   - 1.3 Technical Summary
   - 1.4 Key Metrics at a Glance
   - 1.5 v6.1 Enhancement Summary

2. [Platform Architecture Overview](#2-platform-architecture-overview)
   - 2.1 High-Level Architecture
   - 2.2 Technology Stack
   - 2.3 Integration Points
   - 2.4 Environment Configuration

3. [Multi-Agent System Architecture](#3-multi-agent-system-architecture)
   - 3.1 Orchestration Pattern
   - 3.2 Agent Communication Flow
   - 3.3 Capability Abstraction Layer
   - 3.4 Session Management
   - 3.5 Agent Consensus Protocol (v6.1)

4. [Agent Inventory and Specifications](#4-agent-inventory-and-specifications)
   - 4.1 Orchestrator Agent (ORC)
   - 4.2 Analytics Agent (ANL)
   - 4.3 Audience Agent (AUD)
   - 4.4 Channel Agent (CHA)
   - 4.5 Supply Path Agent (SPO)
   - 4.6 Document Agent (DOC)
   - 4.7 Performance Agent (PRF)
   - 4.8 Strategy Agent (CST)
   - 4.9 Change Agent (CHG)

5. [Knowledge Base Architecture](#5-knowledge-base-architecture)
   - 5.1 Knowledge Organization
   - 5.2 File Inventory by Agent
   - 5.3 Content Management Strategy
   - 5.4 Retrieval Augmented Generation (RAG)

6. [Data Architecture](#6-data-architecture)
   - 6.1 Dataverse Schema Overview
   - 6.2 Platform Tables (EAP)
   - 6.3 Domain Tables (MPA)
   - 6.4 v6.1 Enhancement Tables
   - 6.5 Entity Relationship Diagram
   - 6.6 Data Governance

7. [Computation Layer](#7-computation-layer)
   - 7.1 AI Builder Prompts
   - 7.2 Power Automate Flows
   - 7.3 Capability Routing
   - 7.4 Environment-Specific Implementations

8. [v6.1 Platform Enhancements](#8-v61-platform-enhancements)
   - 8.1 Agent Memory System
   - 8.2 Proactive Intelligence
   - 8.3 Multi-Modal Input Support
   - 8.4 Agent Consensus Protocol
   - 8.5 Enhanced Flows and Prompts

9. [Security and Compliance](#9-security-and-compliance)
   - 9.1 Data Loss Prevention (DLP) Compliance
   - 9.2 Authentication and Authorization
   - 9.3 Data Isolation
   - 9.4 Audit and Logging
   - 9.5 Corporate Policy Integration Points

10. [Quality Assurance](#10-quality-assurance)
    - 10.1 Testing Framework
    - 10.2 Test Coverage
    - 10.3 Validation Gates
    - 10.4 Performance Benchmarks

11. [Repository Structure](#11-repository-structure)
    - 11.1 Directory Layout
    - 11.2 Branch Strategy
    - 11.3 File Naming Conventions
    - 11.4 Configuration Management

12. [Deployment and Operations](#12-deployment-and-operations)
    - 12.1 Deployment Process
    - 12.2 Environment Management
    - 12.3 Monitoring and Observability
    - 12.4 Incident Response

13. [Governance and Extensibility](#13-governance-and-extensibility)
    - 13.1 Change Management
    - 13.2 Extension Points
    - 13.3 Custom Policy Implementation
    - 13.4 Roadmap Considerations

14. [Appendices](#14-appendices)
    - A. Complete Dataverse Table Reference
    - B. AI Builder Prompt Catalog
    - C. Knowledge Base File Manifest
    - D. API and Integration Reference

---

## 1. EXECUTIVE SUMMARY

### 1.1 Platform Purpose

The Media Planning Agent (MPA) v6.0 is an enterprise-grade AI-powered platform designed to transform media planning from a labor-intensive manual process into an intelligent, interactive guidance system. Built on Microsoft's Power Platform, MPA serves as a strategic advisor that helps marketing professionals develop comprehensive media briefs through sophisticated analysis, industry benchmarking, and data-driven recommendations.

**Core Mission:** Democratize access to expert-level media planning guidance while maintaining the flexibility and strategic depth required by enterprise marketing teams.

### 1.2 Business Value Proposition

| Value Driver | Description | Quantified Impact |
|--------------|-------------|-------------------|
| **Time Efficiency** | Automated analysis and document generation | 60-70% reduction in planning time |
| **Consistency** | Standardized frameworks and methodologies | 100% adherence to best practices |
| **Accessibility** | Enterprise-wide deployment | Any user, any experience level |
| **Intelligence** | Data-driven recommendations | Industry benchmarks across 15 verticals |
| **Scalability** | Multi-user, multi-session architecture | Unlimited concurrent users |
| **Compliance** | DLP-compliant, no external data exposure | Full corporate policy adherence |

### 1.3 Technical Summary

MPA v6.1 implements a **9-Agent Multi-Agent Architecture** with the following characteristics:

- **Orchestrator + 8 Specialist Agents:** Each agent has deep domain expertise
- **Capability Abstraction Layer:** Environment-agnostic capability routing
- **AI Builder Computation:** 36 custom prompts for complex calculations
- **Dataverse Persistence:** 20 tables with comprehensive schema
- **SharePoint Knowledge Base:** 42+ curated knowledge files (800K+ characters)
- **Power Automate Orchestration:** 10 core flows for capability dispatch
- **Agent Memory System (v6.1):** Cross-session preference persistence
- **Proactive Intelligence (v6.1):** Context-aware alerts and recommendations
- **Multi-Modal Input (v6.1):** CSV, Excel, and PDF file processing
- **Agent Consensus Protocol (v6.1):** Collaborative multi-agent workflows
- **Zero External Dependencies:** Fully compliant with DLP restrictions

### 1.4 Key Metrics at a Glance

| Category | Metric | v6.0 Value | v6.1 Value |
|----------|--------|------------|------------|
| **Agents** | Total Agents | 9 | 9 |
| **Agents** | Instruction Capacity | 72,000 chars | 72,000 chars |
| **Knowledge** | KB Files | 36 | 42 |
| **Knowledge** | Total Content | 725K chars | 800K+ chars |
| **Data** | Dataverse Tables | 14 | 20 |
| **Data** | Benchmark Records | 708+ | 708+ |
| **Computation** | AI Builder Prompts | 26 | 36 |
| **Automation** | Power Automate Flows | 5 | 10 |
| **Quality** | Test Coverage | 95%+ | 95%+ |
| **Performance** | Response Time (P95) | <5 seconds | <5 seconds |
| **v6.1 New** | Proactive Triggers | - | 8 |
| **v6.1 New** | Collaborative Workflows | - | 5 |

### 1.5 v6.1 Enhancement Summary

MPA v6.1 introduces four major platform enhancements:

| Enhancement | Description | Business Value |
|-------------|-------------|----------------|
| **Agent Memory System** | Persistent user preferences and session continuity | 40% reduction in setup time for returning users |
| **Proactive Intelligence** | Context-aware alerts, warnings, and opportunities | Prevents common planning errors proactively |
| **Multi-Modal Input** | CSV, Excel, and PDF file processing | Direct data import without manual entry |
| **Agent Consensus Protocol** | Collaborative multi-agent workflows | Comprehensive recommendations from multiple experts |

---

## 2. PLATFORM ARCHITECTURE OVERVIEW

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION LAYER                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Teams Chat    │  │  Web Interface  │  │   Mobile App    │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
└───────────┼─────────────────────┼─────────────────────┼──────────────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          COPILOT STUDIO LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        ORCHESTRATOR (ORC)                             │   │
│  │   • Intent Classification    • Session Management                     │   │
│  │   • Agent Routing            • Validation Gates                       │   │
│  └───────────────────────────────┬──────────────────────────────────────┘   │
│                                  │                                           │
│  ┌───────┬───────┬───────┬───────┼───────┬───────┬───────┬───────┐         │
│  │  ANL  │  AUD  │  CHA  │  SPO  │  DOC  │  PRF  │  CST  │  CHG  │         │
│  │Analytics│Audience│Channel│Supply │Document│Perform│Strategy│Change│         │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            ▼                     ▼                     ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   KNOWLEDGE LAYER   │ │  COMPUTATION LAYER  │ │    DATA LAYER       │
│  ┌───────────────┐  │ │  ┌───────────────┐  │ │  ┌───────────────┐  │
│  │  SharePoint   │  │ │  │  AI Builder   │  │ │  │   Dataverse   │  │
│  │  Knowledge    │  │ │  │   Prompts     │  │ │  │    Tables     │  │
│  │  Base (36+    │  │ │  │   (26)        │  │ │  │    (14)       │  │
│  │  files)       │  │ │  └───────────────┘  │ │  └───────────────┘  │
│  └───────────────┘  │ │  ┌───────────────┐  │ │  ┌───────────────┐  │
│                     │ │  │Power Automate │  │ │  │  Benchmarks   │  │
│                     │ │  │   Flows (5)   │  │ │  │   (708+)      │  │
│                     │ │  └───────────────┘  │ │  └───────────────┘  │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Purpose | Mastercard Compliance |
|-------|------------|---------|----------------------|
| **Agent Orchestration** | Microsoft Copilot Studio | AI agent hosting and management | ✓ Approved |
| **Knowledge Storage** | SharePoint Online | Document and KB file hosting | ✓ Approved |
| **Data Persistence** | Microsoft Dataverse | Structured data storage | ✓ Approved |
| **Computation** | AI Builder Custom Prompts | Complex calculations and analysis | ✓ Approved |
| **Workflow** | Power Automate | Process orchestration | ✓ Approved |
| **Integration** | Power Platform Connectors | Internal system connectivity | ✓ DLP Compliant |

### 2.3 Integration Points

```
APPROVED CONNECTORS (DLP COMPLIANT)
────────────────────────────────────
✓ Microsoft Dataverse
✓ SharePoint Online
✓ AI Builder
✓ Office 365 Outlook
✓ Microsoft Teams
✓ Excel Online (Business)
✓ Approvals

BLOCKED BY DLP POLICY
────────────────────────────────────
✗ HTTP Connector (all destinations)
✗ Custom Connectors
✗ Azure Functions (direct)
✗ External API Calls
```

### 2.4 Environment Configuration

The platform supports multiple deployment environments through a capability abstraction layer:

| Configuration | Mastercard Environment | Personal Environment |
|---------------|------------------------|---------------------|
| **HTTP Connector** | Disabled | Enabled |
| **Azure Functions** | Disabled | Enabled |
| **Custom Connectors** | Disabled | Enabled |
| **AI Builder** | Primary (All Computation) | Fallback |
| **DLP Policy** | Enforced | Relaxed |
| **External APIs** | Blocked | Allowed |

---

## 3. MULTI-AGENT SYSTEM ARCHITECTURE

### 3.1 Orchestration Pattern

MPA v6.0 employs a **Hub-and-Spoke Orchestration Pattern** where the Orchestrator Agent (ORC) serves as the central routing hub:

```
                    ┌─────────────────┐
                    │   USER INPUT    │
                    └────────┬────────┘
                             │
                             ▼
            ┌────────────────────────────────┐
            │     ORCHESTRATOR (ORC)         │
            │  ┌──────────────────────────┐  │
            │  │ 1. Intent Classification │  │
            │  │ 2. Context Extraction    │  │
            │  │ 3. Agent Selection       │  │
            │  │ 4. Session Management    │  │
            │  └──────────────────────────┘  │
            └───────────────┬────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ SPECIALIST   │    │ SPECIALIST   │    │ SPECIALIST   │
│ AGENT (ANL)  │    │ AGENT (AUD)  │    │ AGENT (...)  │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Orchestration Benefits:**
- Single entry point for all user interactions
- Consistent session management across agents
- Centralized routing logic in Dataverse (not KB retrieval)
- Clear audit trail of all agent invocations

### 3.2 Agent Communication Flow

```
STEP 1: USER MESSAGE RECEIVED
─────────────────────────────
User: "What's the optimal budget allocation for a $500K retail campaign?"
                    │
                    ▼
STEP 2: INTENT CLASSIFICATION (ORC)
─────────────────────────────
ORC queries eap_agent table for capability matching:
- "budget" → ANL
- "allocation" → ANL
- "retail" → CHA (secondary)
Classification: PRIMARY → ANL, SECONDARY → CHA
                    │
                    ▼
STEP 3: CAPABILITY DISPATCH
─────────────────────────────
ORC calls MPA_Capability_Dispatcher flow:
- capability_code: "CALCULATE_MARGINAL_RETURN"
- session_id: "sess_12345"
- inputs: {budget: 500000, vertical: "Retail"}
                    │
                    ▼
STEP 4: IMPLEMENTATION ROUTING
─────────────────────────────
Flow queries eap_capability_implementation:
- Filter: environment_code = "MASTERCARD"
- Result: implementation_type = "AI_BUILDER_PROMPT"
- Reference: "ANL_MarginalReturn_Prompt"
                    │
                    ▼
STEP 5: COMPUTATION EXECUTION
─────────────────────────────
AI Builder prompt executes:
- Input: Budget parameters
- Output: JSON with marginal_return, confidence_level
                    │
                    ▼
STEP 6: RESPONSE SYNTHESIS
─────────────────────────────
ANL agent synthesizes response using:
- AI Builder computation results
- Knowledge Base context
- Confidence levels and recommendations
                    │
                    ▼
STEP 7: USER RESPONSE
─────────────────────────────
Formatted response delivered to user with:
- Specific recommendations
- Data provenance indicators
- Confidence levels
```

### 3.3 Capability Abstraction Layer

The Capability Abstraction Layer enables the same agent code to work across different environments by routing to environment-specific implementations:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPABILITY ABSTRACTION LAYER                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Agent Request: "CALCULATE_MARGINAL_RETURN"                        │
│                           │                                          │
│                           ▼                                          │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              eap_capability_implementation                    │   │
│   │  ┌──────────────────────────────────────────────────────┐   │   │
│   │  │ capability_code: CALCULATE_MARGINAL_RETURN           │   │   │
│   │  │ environment_code: MASTERCARD                          │   │   │
│   │  │ implementation_type: AI_BUILDER_PROMPT               │   │   │
│   │  │ implementation_reference: ANL_MarginalReturn_Prompt  │   │   │
│   │  └──────────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                           │                                          │
│                           ▼                                          │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   IMPLEMENTATION ROUTER                      │   │
│   │  ┌─────────────────┐     ┌─────────────────┐               │   │
│   │  │  AI_BUILDER_    │     │  DATAVERSE_     │               │   │
│   │  │  PROMPT         │     │  LOGIC          │               │   │
│   │  │  (Mastercard)   │     │  (Both)         │               │   │
│   │  └─────────────────┘     └─────────────────┘               │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Benefits:**
- **Environment Independence:** Same agent code works in all environments
- **Optimization Flexibility:** Can upgrade implementations without changing agents
- **Testing Isolation:** Test different implementations independently
- **Fallback Support:** Chain implementations for resilience

### 3.4 Session Management

Each user interaction is tracked through comprehensive session management:

```
SESSION LIFECYCLE
─────────────────────────────────────────────────────────────

CREATE SESSION                    TRACK PROGRESS
─────────────                     ───────────────
mpa_session                       mpa_session_step
├─ session_id (GUID)              ├─ session_id (FK)
├─ user_id                        ├─ step_number (1-10)
├─ created_at                     ├─ status (Complete/Pending)
├─ status                         ├─ agent_code
├─ vertical                       ├─ inputs_json
└─ objectives                     └─ outputs_json

SESSION ISOLATION GUARANTEE
────────────────────────────
• Each user has independent session state
• No cross-user data leakage
• Session data persists across browser sessions
• Automatic cleanup after 30 days inactive
```

---

## 4. AGENT INVENTORY AND SPECIFICATIONS

### 4.1 Orchestrator Agent (ORC)

| Attribute | Value |
|-----------|-------|
| **Code** | ORC |
| **Full Name** | Orchestrator Agent |
| **Primary Function** | Intent classification, agent routing, session management |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 1 (Routing Logic) |
| **Capabilities** | CLASSIFY_INTENT, VALIDATE_GATE, MANAGE_SESSION |

**Routing Logic:**
```
ROUTING KEYWORDS → AGENT MAPPING
────────────────────────────────
budget, projection, forecast, calculate → ANL
audience, segment, target, persona, ltv → AUD
channel, media, mix, allocation → CHA
programmatic, ssp, dsp, fee → SPO
document, export, report, brief → DOC
performance, attribution, anomaly → PRF
framework, strategy, prioritize → CST
change, readiness, stakeholder → CHG
```

### 4.2 Analytics Agent (ANL)

| Attribute | Value |
|-----------|-------|
| **Code** | ANL |
| **Full Name** | Analytics Agent |
| **Primary Function** | Quantitative analysis, budget optimization, forecasting |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 5 |
| **AI Builder Prompts** | 6 |

**Knowledge Base Files:**
| File | Content | Size |
|------|---------|------|
| ANL_KB_Analytics_Core_v1.txt | Core analytical frameworks | ~20K chars |
| ANL_KB_Bayesian_Inference_v1.txt | Bayesian methods | ~18K chars |
| ANL_KB_Budget_Optimization_v1.txt | Budget allocation strategies | ~22K chars |
| ANL_KB_Causal_Incrementality_v1.txt | Incrementality measurement | ~19K chars |
| ANL_KB_MMM_Methods_v1.txt | Marketing Mix Modeling | ~21K chars |

**Capabilities:**
| Capability Code | Purpose | Implementation |
|-----------------|---------|----------------|
| CALCULATE_MARGINAL_RETURN | Estimate marginal return on budget | AI Builder |
| COMPARE_SCENARIOS | Compare multiple budget scenarios | AI Builder |
| GENERATE_PROJECTIONS | Forecast campaign performance | AI Builder |
| ASSESS_CONFIDENCE | Calculate confidence intervals | AI Builder |
| APPLY_BAYESIAN_INFERENCE | Bayesian statistical analysis | AI Builder |
| ANALYZE_CAUSALITY | Causality and incrementality | AI Builder |

### 4.3 Audience Agent (AUD)

| Attribute | Value |
|-----------|-------|
| **Code** | AUD |
| **Full Name** | Audience Agent |
| **Primary Function** | Segmentation, targeting, journey orchestration, LTV modeling |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 5 |
| **AI Builder Prompts** | 5 |

**Knowledge Base Files:**
| File | Content | Size |
|------|---------|------|
| AUD_KB_Audience_Core_v1.txt | Core audience frameworks | ~20K chars |
| AUD_KB_Segmentation_v1.txt | Segmentation methodologies | ~19K chars |
| AUD_KB_LTV_Modeling_v1.txt | Lifetime value calculations | ~18K chars |
| AUD_KB_Journey_Orchestration_v1.txt | Customer journey mapping | ~21K chars |
| AUD_KB_Identity_Resolution_v1.txt | Cross-device identity | ~17K chars |

**Capabilities:**
| Capability Code | Purpose | Implementation |
|-----------------|---------|----------------|
| PRIORITIZE_SEGMENTS | Rank audience segments | AI Builder |
| ASSESS_LTV | Calculate lifetime value | AI Builder |
| SCORE_PROPENSITY | Conversion propensity scoring | AI Builder |
| ANALYZE_JOURNEY_STATE | Journey stage analysis | AI Builder |
| RESOLVE_IDENTITY | Identity resolution | AI Builder |

### 4.4 Channel Agent (CHA)

| Attribute | Value |
|-----------|-------|
| **Code** | CHA |
| **Full Name** | Channel Agent |
| **Primary Function** | Channel selection, mix optimization, benchmarking |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 4 |
| **AI Builder Prompts** | 3 |

**Knowledge Base Files:**
| File | Content | Size |
|------|---------|------|
| CHA_KB_Channel_Core_v1.txt | Core channel frameworks | ~20K chars |
| CHA_KB_Mix_Optimization_v1.txt | Mix optimization strategies | ~19K chars |
| CHA_KB_Emerging_Channels_v1.txt | CTV, Retail Media, etc. | ~18K chars |
| CHA_KB_Channel_Benchmarks_v1.txt | Performance benchmarks | ~22K chars |

**Capabilities:**
| Capability Code | Purpose | Implementation |
|-----------------|---------|----------------|
| OPTIMIZE_CHANNEL_MIX | Optimize media mix | AI Builder |
| SELECT_CHANNELS | Select channels for objectives | AI Builder |
| ASSESS_EMERGING_CHANNEL | Evaluate emerging channels | AI Builder |

### 4.5 Supply Path Agent (SPO)

| Attribute | Value |
|-----------|-------|
| **Code** | SPO |
| **Full Name** | Supply Path Optimization Agent |
| **Primary Function** | Programmatic optimization, fee analysis, partner evaluation |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 3 |
| **AI Builder Prompts** | 3 |

**Knowledge Base Files:**
| File | Content | Size |
|------|---------|------|
| SPO_KB_Supply_Path_Core_v1.txt | Core SPO frameworks | ~20K chars |
| SPO_KB_Fee_Analysis_v1.txt | Fee waterfall analysis | ~18K chars |
| SPO_KB_Partner_Evaluation_v1.txt | Partner scoring | ~17K chars |

**Capabilities:**
| Capability Code | Purpose | Implementation |
|-----------------|---------|----------------|
| CALCULATE_FEE_WATERFALL | Analyze programmatic fees | AI Builder |
| SCORE_PARTNER | Evaluate partner quality | AI Builder |
| CALCULATE_NBI | Net bidder impact | AI Builder |

### 4.6 Document Agent (DOC)

| Attribute | Value |
|-----------|-------|
| **Code** | DOC |
| **Full Name** | Document Agent |
| **Primary Function** | Document generation, export, template management |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 2 |
| **AI Builder Prompts** | 2 |

**Knowledge Base Files:**
| File | Content | Size |
|------|---------|------|
| DOC_KB_Document_Core_v1.txt | Document templates | ~20K chars |
| DOC_KB_Export_Formats_v1.txt | Export specifications | ~15K chars |

**Capabilities:**
| Capability Code | Purpose | Implementation |
|-----------------|---------|----------------|
| GENERATE_DOCUMENT | Generate media briefs/reports | AI Builder |
| SELECT_TEMPLATE | Select appropriate template | AI Builder |

### 4.7 Performance Agent (PRF)

| Attribute | Value |
|-----------|-------|
| **Code** | PRF |
| **Full Name** | Performance Agent |
| **Primary Function** | Attribution analysis, anomaly detection, optimization |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 4 |
| **AI Builder Prompts** | 4 |

**Knowledge Base Files:**
| File | Content | Size |
|------|---------|------|
| PRF_KB_Performance_Core_v1.txt | Core performance frameworks | ~20K chars |
| PRF_KB_Attribution_v1.txt | Attribution methodologies | ~19K chars |
| PRF_KB_Anomaly_Detection_v1.txt | Anomaly detection | ~17K chars |
| PRF_KB_Optimization_v1.txt | Optimization strategies | ~18K chars |

**Capabilities:**
| Capability Code | Purpose | Implementation |
|-----------------|---------|----------------|
| DETECT_ANOMALIES | Identify performance anomalies | AI Builder |
| ANALYZE_ATTRIBUTION | Attribution analysis | AI Builder |
| MEASURE_INCREMENTALITY | Incrementality measurement | AI Builder |
| RECOMMEND_OPTIMIZATION | Generate optimization recommendations | AI Builder |

### 4.8 Strategy Agent (CST)

| Attribute | Value |
|-----------|-------|
| **Code** | CST |
| **Full Name** | Consulting Strategy Agent |
| **Primary Function** | Framework selection, strategic analysis, prioritization |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 3 |
| **AI Builder Prompts** | 1 |

**Capabilities:**
| Capability Code | Purpose | Implementation |
|-----------------|---------|----------------|
| CST_FRAMEWORK | Recommend strategic frameworks | AI Builder |

### 4.9 Change Agent (CHG)

| Attribute | Value |
|-----------|-------|
| **Code** | CHG |
| **Full Name** | Change Management Agent |
| **Primary Function** | Change readiness, stakeholder mapping, adoption planning |
| **Instruction Size** | 8,000 characters |
| **Knowledge Files** | 3 |
| **AI Builder Prompts** | 1 |

**Capabilities:**
| Capability Code | Purpose | Implementation |
|-----------------|---------|----------------|
| CHG_READINESS | Assess change readiness | AI Builder |

---

## 5. KNOWLEDGE BASE ARCHITECTURE

### 5.1 Knowledge Organization

The Knowledge Base follows a **Shared + Specialized** architecture:

```
KNOWLEDGE BASE STRUCTURE
────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────┐
│                  SHARED PLATFORM KB (EAP)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • EAP_KB_Confidence_Levels_v1.txt               │   │
│  │ • EAP_KB_Data_Provenance_v1.txt                 │   │
│  │ • EAP_KB_Error_Handling_v1.txt                  │   │
│  │ • EAP_KB_Formatting_Standards_v1.txt            │   │
│  │ • EAP_KB_Strategic_Principles_v1.txt            │   │
│  │ • EAP_KB_Communication_Contract_v1.txt          │   │
│  └─────────────────────────────────────────────────┘   │
│                           │                             │
│          Inherited by ALL agents                        │
└───────────────────────────┼─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  AGENT-       │   │  AGENT-       │   │  AGENT-       │
│  SPECIFIC KB  │   │  SPECIFIC KB  │   │  SPECIFIC KB  │
│  (ANL: 5)     │   │  (AUD: 5)     │   │  (CHA: 4)     │
└───────────────┘   └───────────────┘   └───────────────┘
```

### 5.2 File Inventory by Agent

| Agent | Files | Total Characters | Topics Covered |
|-------|-------|------------------|----------------|
| EAP (Shared) | 6 | ~120,000 | Confidence, Provenance, Formatting, Principles |
| ORC | 1 | ~25,000 | Routing Logic, Intent Classification |
| ANL | 5 | ~100,000 | Analytics, Bayesian, Budget, Causality, MMM |
| AUD | 5 | ~100,000 | Audience, Segmentation, LTV, Journey, Identity |
| CHA | 4 | ~80,000 | Channel, Mix, Emerging, Benchmarks |
| SPO | 3 | ~60,000 | Supply Path, Fees, Partners |
| DOC | 2 | ~40,000 | Documents, Templates |
| PRF | 4 | ~80,000 | Performance, Attribution, Anomaly, Optimization |
| CST | 3 | ~60,000 | Strategy, Frameworks, Prioritization |
| CHG | 3 | ~60,000 | Change, Readiness, Stakeholders |
| **TOTAL** | **36** | **~725,000** | |

### 5.3 Content Management Strategy

**File Size Limits:**
- Maximum per file: 36,000 characters (SharePoint retrieval limit)
- Optimal per file: 15,000-25,000 characters
- Minimum meaningful content: 5,000 characters

**Content Quality Standards:**
- Plain text only (no formatting, tables, or special characters)
- ALL-CAPS headers for section identification
- Hyphen-only lists (no bullets or numbers)
- ASCII characters only (no Unicode)
- Professional, concise tone

### 5.4 Retrieval Augmented Generation (RAG)

```
RAG PIPELINE
────────────────────────────────────────────────────────────

USER QUERY                    KNOWLEDGE RETRIEVAL
──────────                    ───────────────────
"What channels work           1. Query SharePoint
 best for retail?"            2. Vector similarity search
         │                    3. Top-K retrieval (K=5)
         ▼                    4. Context injection
┌─────────────────┐           
│ AGENT PROCESSOR │◄──────── Relevant KB chunks
└────────┬────────┘           • CHA_KB_Channel_Core
         │                    • CHA_KB_Benchmarks
         ▼                    • EAP_KB_Principles
┌─────────────────┐
│ LLM GENERATION  │──────────► Response with
└─────────────────┘            grounded recommendations
```

---

## 6. DATA ARCHITECTURE

### 6.1 Dataverse Schema Overview

The data architecture consists of 14 tables organized into two categories:

| Category | Prefix | Purpose | Tables |
|----------|--------|---------|--------|
| **Platform (EAP)** | eap_ | Agent platform infrastructure | 7 |
| **Domain (MPA)** | mpa_ | Media planning domain data | 7 |

### 6.2 Platform Tables (EAP)

| Table | Purpose | Records | Key Columns |
|-------|---------|---------|-------------|
| **eap_agent** | Agent registry | 9 | agent_code, capability_tags, is_active |
| **eap_capability** | Capability definitions | 25+ | capability_code, agent_code, input_schema |
| **eap_capability_implementation** | Environment-specific implementations | 26 | capability_code, environment_code, implementation_type |
| **eap_prompt** | AI Builder prompt registry | 26 | prompt_name, system_message, temperature |
| **eap_test_case** | Golden test scenarios | 50+ | capability_code, inputs_json, expected_outputs |
| **eap_telemetry** | Observability logging | Grows | capability_code, execution_time_ms, status |
| **eap_environment_config** | Environment settings | 2 | environment_code, config_json |

### 6.3 Domain Tables (MPA)

| Table | Purpose | Records | Key Columns |
|-------|---------|---------|-------------|
| **mpa_vertical** | Industry classifications | 15 | vertical_code, vertical_name |
| **mpa_channel** | Channel reference data | 43 | channel_code, channel_name, category |
| **mpa_kpi** | KPI definitions | 44 | kpi_code, kpi_name, calculation_method |
| **mpa_benchmark** | Vertical × Channel benchmarks | 708+ | vertical_id, channel_id, kpi_id, value |
| **mpa_partner** | Partner fees and capabilities | 50+ | partner_name, fee_structure |
| **mpa_session** | User session state | Grows | session_id, user_id, status |
| **mpa_session_step** | Step completion tracking | Grows | session_id, step_number, status |

### 6.4 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ENTITY RELATIONSHIP DIAGRAM                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────────────┐
│  eap_agent   │────1:N──│    eap_capability        │
│  (9 records) │         │    (25+ records)         │
└──────────────┘         └────────────┬─────────────┘
                                      │
                                      │ 1:N
                                      ▼
                         ┌──────────────────────────┐
                         │ eap_capability_          │
                         │ implementation           │
                         │ (26 records)             │
                         └──────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ mpa_vertical │    │ mpa_channel  │    │   mpa_kpi    │
│ (15 records) │    │ (43 records) │    │ (44 records) │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │ N:N:N
                           ▼
                  ┌──────────────────┐
                  │  mpa_benchmark   │
                  │  (708+ records)  │
                  └──────────────────┘

┌──────────────┐         ┌──────────────────────────┐
│ mpa_session  │────1:N──│   mpa_session_step       │
│              │         │                          │
└──────────────┘         └──────────────────────────┘
```

### 6.5 Data Governance

| Aspect | Implementation |
|--------|----------------|
| **Data Classification** | All data marked as Internal/Confidential |
| **Retention** | Session data: 30 days; Telemetry: 90 days; Reference: Permanent |
| **Access Control** | Role-based via Dataverse security roles |
| **Audit Trail** | Full create/update/delete logging via Dataverse audit |
| **Backup** | Standard Dataverse backup (Microsoft managed) |
| **Encryption** | At rest: AES-256; In transit: TLS 1.2+ |

---

## 7. COMPUTATION LAYER

### 7.1 AI Builder Prompts

AI Builder serves as the **primary computation layer** for the Mastercard environment, executing all complex calculations and analysis.

**Prompt Inventory:**

| Agent | Prompt Count | Prompt Names |
|-------|--------------|--------------|
| ANL | 6 | MarginalReturn, ScenarioCompare, Projection, Confidence, Bayesian, Causal |
| AUD | 5 | SegmentPriority, LTVAssess, Propensity, JourneyState, Identity |
| CHA | 3 | ChannelMix, ChannelSelect, EmergingAssess |
| SPO | 3 | FeeWaterfall, PartnerScore, NBICalculate |
| PRF | 4 | Anomaly, Attribution, Incrementality, Optimize |
| DOC | 2 | Generate, TemplateSelect |
| ORC | 1 | Intent |
| CST | 1 | Framework |
| CHG | 1 | Readiness |
| **TOTAL** | **26** | |

**Prompt Configuration Standards:**
- Temperature: 0.1 (deterministic outputs)
- Max Tokens: 1000-2000 (depending on complexity)
- Output Format: Structured JSON with schema validation
- Error Handling: Graceful degradation with confidence indicators

### 7.2 Power Automate Flows

| Flow Name | Trigger | Purpose | Connectors |
|-----------|---------|---------|------------|
| MPA_Capability_Dispatcher | Copilot Call | Route capability requests | Dataverse, AI Builder |
| MPA_Impl_AIBuilder | Flow Call | Execute AI Builder prompts | AI Builder |
| MPA_Impl_DataverseLogic | Flow Call | Execute Dataverse queries | Dataverse |
| MPA_Session_Manager | Copilot Call | Manage session lifecycle | Dataverse |
| MPA_Telemetry_Logger | Flow Call | Log all interactions | Dataverse |

### 7.3 Capability Routing

```
CAPABILITY DISPATCH FLOW
────────────────────────────────────────────────────────────

INPUT                         LOOKUP                        EXECUTE
─────                         ──────                        ───────
{                             Query:                        If AI_BUILDER_PROMPT:
  capability_code,            SELECT * FROM                   → Call AI Builder
  session_id,                 eap_capability_implementation   → Parse JSON response
  inputs: {...}               WHERE capability_code = @code   → Validate schema
}                             AND environment_code = @env
                              AND is_enabled = true
                                      │
                                      ▼
                              {
                                implementation_type: "AI_BUILDER_PROMPT",
                                implementation_reference: "ANL_MarginalReturn_Prompt",
                                timeout_seconds: 30
                              }
```

### 7.4 Environment-Specific Implementations

| Capability | Mastercard | Personal (Future) |
|------------|------------|-------------------|
| CALCULATE_MARGINAL_RETURN | AI Builder | Azure Function → AI Builder |
| COMPARE_SCENARIOS | AI Builder | Azure Function → AI Builder |
| GENERATE_PROJECTIONS | AI Builder | Azure Function → AI Builder |
| DETECT_ANOMALIES | AI Builder | Azure Function → AI Builder |
| All Others | AI Builder | AI Builder |

---

## 8. v6.1 PLATFORM ENHANCEMENTS

MPA v6.1 introduces four major platform enhancements that significantly expand the system's intelligence and usability.

### 8.1 Agent Memory System

The Agent Memory System enables cross-session persistence of user preferences and context, dramatically reducing setup friction for returning users.

**Architecture:**

```
USER SESSION                    MEMORY LAYER                    PERSISTENCE
───────────                     ────────────                    ───────────
Session Start     ──────────►   MPA_Memory_Initialize   ◄────── mpa_user_preferences
                                       │                        mpa_session_memory
                                       ▼
                               Load preferences and
                               recent memories
                                       │
                                       ▼
During Session    ──────────►   MPA_Memory_Store        ──────► Store learned
                               (extract preferences)            preferences
                                       │
                                       ▼
Session End       ──────────►   Persist important       ──────► Update user
                               decisions                        profile
```

**Key Components:**

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **mpa_user_preferences** | Persistent user defaults | Dataverse table |
| **mpa_session_memory** | Session-level context | Dataverse table |
| **MEM_STORE_PREFERENCE** | Extract preferences from conversation | AI Builder prompt |
| **MEM_RETRIEVE_CONTEXT** | Assemble relevant context | AI Builder prompt |
| **MEM_LEARN_PATTERN** | Learn behavioral patterns | AI Builder prompt |
| **MPA_Memory_Initialize** | Load context at session start | Power Automate flow |
| **MPA_Memory_Store** | Store preferences during conversation | Power Automate flow |

**Preference Categories:**

| Category | Examples | Persistence |
|----------|----------|-------------|
| **Vertical** | "I always work in Retail" | Persistent |
| **Budget** | "Our typical range is $500K-$2M" | Persistent |
| **Channel** | "We never use TikTok" | Persistent |
| **KPI** | "I prefer incrementality over ROAS" | Persistent |
| **Measurement** | "We use MTA attribution" | Persistent |
| **Communication** | "Keep responses concise" | Persistent |

**Business Value:**
- 40% reduction in setup time for returning users
- Consistent experience across sessions
- Personalized recommendations based on learned preferences

---

### 8.2 Proactive Intelligence

The Proactive Intelligence system evaluates context against defined triggers and proactively surfaces alerts, warnings, and opportunities.

**Trigger Architecture:**

```
SESSION CONTEXT                TRIGGER ENGINE               USER NOTIFICATION
───────────────                ──────────────               ─────────────────
Current state:       ──────►   MPA_Proactive_Evaluate
• Budget: $500K                        │
• Channel: Paid Search 40%             ▼
• Vertical: Retail           Query eap_proactive_trigger
                                       │
                                       ▼
                             Evaluate conditions
                             against context
                                       │
                              ┌────────┴────────┐
                              │                 │
                         Triggered         Not Triggered
                              │                 │
                              ▼                 ▼
                         Fire with         Suppress
                         template fill     (cooldown/relevance)
                              │
                              ▼
                         "Your Paid Search allocation
                          of 40% is approaching
                          saturation..."
```

**Trigger Categories:**

| Category | Purpose | Examples |
|----------|---------|----------|
| **Alert** | Warn about potential issues | Budget saturation, segment overlap |
| **Opportunity** | Highlight beneficial options | Emerging channels, high-LTV segments |
| **Recommendation** | Suggest improvements | Add attribution model, expand measurement |
| **Warning** | Flag data quality issues | Low confidence, missing data |

**Default Triggers (8):**

| Trigger Code | Agent | Severity | Condition |
|--------------|-------|----------|-----------|
| ANL_SATURATION_WARNING | ANL | Important | Channel allocation >35% |
| ANL_LOW_CONFIDENCE | ANL | Important | Confidence score <50% |
| CHA_BENCHMARK_VARIANCE | CHA | Suggestion | CPM >20% above benchmark |
| CHA_EMERGING_OPPORTUNITY | CHA | Suggestion | Emerging channel fit >0.7 |
| PRF_ATTRIBUTION_MISSING | PRF | Important | No attribution model, budget >$100K |
| PRF_MEASUREMENT_GAP | PRF | Suggestion | Measurement coverage <80% |
| AUD_SEGMENT_OVERLAP | AUD | Suggestion | Segment overlap >30% |
| AUD_LTV_OPPORTUNITY | AUD | Suggestion | LTV index >130 |

**Cooldown System:**
- Each trigger has a configurable cooldown period (default 24 hours)
- Prevents repetitive alerts for the same condition
- User response (engaged/dismissed/ignored) tracked for optimization

---

### 8.3 Multi-Modal Input Support

The Multi-Modal Input system enables direct file upload and processing, allowing users to import data without manual entry.

**Supported File Types:**

| Format | Extension | Processing | Use Case |
|--------|-----------|------------|----------|
| **CSV** | .csv | FILE_ANALYZE_CSV prompt | Campaign data, performance exports |
| **Excel** | .xlsx, .xls | FILE_ANALYZE_EXCEL prompt | Budget tables, channel allocations |
| **PDF** | .pdf | FILE_EXTRACT_PDF prompt | RFP documents, media briefs |

**Processing Flow:**

```
FILE UPLOAD                    PROCESSING                      SESSION CONTEXT
───────────                    ──────────                      ───────────────
User uploads       ──────►     MPA_File_Process
campaign_data.csv                    │
                                     ▼
                              Determine file type
                                     │
                         ┌───────────┴───────────┐
                         │           │           │
                        CSV        Excel        PDF
                         │           │           │
                         ▼           ▼           ▼
                   FILE_ANALYZE  FILE_ANALYZE  FILE_EXTRACT
                   _CSV          _EXCEL        _PDF
                         │           │           │
                         └───────────┼───────────┘
                                     ▼
                              Extract fields:
                              • Campaign metrics
                              • Budget allocations
                              • Channel performance
                              • Target audiences
                                     │
                                     ▼
                              Store in mpa_session_memory
                              for use by other agents
```

**Field Mapping:**

| Source Field Pattern | MPA Mapping | Auto-Detected |
|---------------------|-------------|---------------|
| Spend, Cost, Budget | Budget allocation | Yes |
| Impressions, Views | Reach metrics | Yes |
| Clicks, Visits | Engagement metrics | Yes |
| Conversions, Sales | Outcome metrics | Yes |
| Channel, Platform | Channel reference | Yes |
| Date, Period | Time dimension | Yes |

**Business Value:**
- Eliminates manual data entry
- Reduces errors from transcription
- Enables analysis of historical data

---

### 8.4 Agent Consensus Protocol

The Agent Consensus Protocol enables sophisticated multi-agent collaboration, combining insights from multiple specialist agents into unified recommendations.

**Collaborative Workflow Architecture:**

```
USER REQUEST                   ORCHESTRATION                  SYNTHESIS
────────────                   ─────────────                  ─────────
"Build me a         ──────►    MPA_Workflow_Orchestrate
 complete media                        │
 plan for $500K                        ▼
 retail campaign"              Match to workflow:
                               FULL_MEDIA_PLAN
                                       │
                               ┌───────┴───────┐
                               │               │
                         Agent Sequence:
                         ┌─────────────────────────────────────┐
                         │ ANL → AUD → CHA → PRF → DOC        │
                         └──┬──────┬──────┬──────┬──────┬─────┘
                            │      │      │      │      │
                            ▼      ▼      ▼      ▼      ▼
                         Budget  Target  Channel Measure Brief
                         Model   Audience Mix    Plan   Generate
                            │      │      │      │      │
                            └──────┴──────┴──────┴──────┘
                                           │
                                           ▼
                               CON_SYNTHESIZE_RESPONSE
                                           │
                                           ▼
                               Unified recommendation
                               with confidence level
                               and attribution
```

**Pre-Defined Workflows:**

| Workflow Code | Name | Agents | Output |
|---------------|------|--------|--------|
| FULL_MEDIA_PLAN | Complete Media Plan | ANL→AUD→CHA→PRF→DOC | Document |
| BUDGET_OPTIMIZATION | Budget Optimization | ANL→CHA→PRF | Recommendation |
| AUDIENCE_CHANNEL_FIT | Audience-Channel Fit | AUD→CHA | Recommendation |
| MEASUREMENT_STRATEGY | Measurement Strategy | PRF→ANL | Recommendation |
| CAMPAIGN_ANALYSIS | Campaign Analysis | PRF→ANL→CHA | Analysis |

**Conflict Resolution:**

When agents disagree, the CON_RESOLVE_CONFLICTS prompt applies resolution strategies:

| Strategy | When Applied | Example |
|----------|--------------|---------|
| Data-Driven | Strong data support for one position | Historical performance data |
| Confidence-Weighted | One agent has higher confidence | Higher sample size |
| Context-Specific | User preferences favor one approach | Measurement philosophy |
| Hybrid | Both positions have merit | Blend recommendations |
| User-Decision | Fundamental trade-off | Escalate to user |

**Business Value:**
- Comprehensive recommendations from multiple expert perspectives
- Transparent reasoning with contribution attribution
- Conflict resolution with clear rationale
- 10x more sophisticated outputs than single-agent responses

---

### 8.5 Enhanced Flows and Prompts

**New AI Builder Prompts (10):**

| Prompt Code | Purpose | Agent |
|-------------|---------|-------|
| MEM_STORE_PREFERENCE | Extract preferences from conversation | ORC |
| MEM_RETRIEVE_CONTEXT | Assemble relevant context | ORC |
| MEM_LEARN_PATTERN | Learn behavioral patterns | ORC |
| PRO_EVALUATE_TRIGGERS | Evaluate proactive triggers | ORC |
| CON_COLLECT_CONTRIBUTION | Prompt agents for contributions | ORC |
| CON_SYNTHESIZE_RESPONSE | Synthesize agent contributions | ORC |
| CON_RESOLVE_CONFLICTS | Resolve agent disagreements | ORC |
| FILE_ANALYZE_CSV | Parse and analyze CSV files | DOC |
| FILE_ANALYZE_EXCEL | Parse and analyze Excel files | DOC |
| FILE_EXTRACT_PDF | Extract information from PDFs | DOC |

**New Power Automate Flows (5):**

| Flow Name | Purpose | Trigger |
|-----------|---------|---------|
| MPA_Memory_Initialize | Load preferences at session start | Copilot call |
| MPA_Memory_Store | Store preferences during conversation | Copilot call |
| MPA_Proactive_Evaluate | Evaluate triggers against context | Copilot call |
| MPA_Workflow_Orchestrate | Manage collaborative workflows | Copilot call |
| MPA_File_Process | Process uploaded files | Copilot call |

**New Dataverse Tables (6):**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| mpa_user_preferences | Persistent user defaults | user_id, default_vertical, communication_style |
| mpa_session_memory | Session context items | session_id, memory_type, memory_value_json |
| eap_proactive_trigger | Trigger definitions | trigger_code, condition_json, message_template |
| eap_workflow_definition | Workflow templates | workflow_code, agent_sequence_json |
| eap_workflow_contribution | Agent contributions | workflow_instance_id, contribution_json |
| eap_trigger_history | Fired trigger history | trigger_code, fired_at, user_response |

**New Knowledge Base Files (6):**

| File | Agent | Content |
|------|-------|---------|
| EAP_KB_Memory_System_v1.txt | EAP | Memory architecture and guidelines |
| EAP_KB_Proactive_Intelligence_v1.txt | EAP | Trigger evaluation methodology |
| EAP_KB_Consensus_Protocol_v1.txt | EAP | Collaboration and synthesis patterns |
| ORC_KB_Session_Management_v1.txt | ORC | Session lifecycle management |
| ORC_KB_Collaborative_Orchestration_v1.txt | ORC | Workflow orchestration patterns |
| DOC_KB_File_Processing_v1.txt | DOC | File parsing and field mapping |

---

## 9. SECURITY AND COMPLIANCE

### 9.1 Data Loss Prevention (DLP) Compliance

**Mastercard DLP Policy Adherence:**

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| No external API calls | ✓ Compliant | HTTP connector disabled |
| No custom connectors | ✓ Compliant | Only standard connectors used |
| No Azure Functions (direct) | ✓ Compliant | AI Builder only |
| Approved connectors only | ✓ Compliant | Dataverse, SharePoint, AI Builder, Office 365 |
| Data residency | ✓ Compliant | All data in Mastercard tenant |

### 9.2 Authentication and Authorization

```
AUTHENTICATION FLOW
────────────────────────────────────────────────────────────

USER                          ENTRA ID                      MPA PLATFORM
────                          ────────                      ────────────
1. Access MPA          ──────►
                              2. Authenticate via
                                 Corporate SSO
                                        │
                                        ▼
                              3. Issue Access Token
                                 with user claims
                       ◄──────
4. Bearer token                                    ──────► 5. Validate token
   in request                                              6. Apply RBAC
                                                           7. Grant access
```

**Role-Based Access Control:**

| Role | Permissions | Scope |
|------|-------------|-------|
| MPA User | Read/Execute | All agents, own sessions |
| MPA Admin | Full CRUD | All data, configuration |
| MPA Viewer | Read Only | Reports, analytics |

### 9.3 Data Isolation

| Isolation Type | Implementation |
|----------------|----------------|
| **Tenant Isolation** | Dedicated Dataverse environment |
| **User Isolation** | Session data scoped to user_id |
| **Agent Isolation** | KB retrieval scoped to agent-specific folders |
| **Environment Isolation** | Capability implementations per environment |

### 9.4 Audit and Logging

**Telemetry Captured:**

| Event | Data Captured | Retention |
|-------|---------------|-----------|
| Agent Invocation | user_id, agent_code, timestamp | 90 days |
| Capability Execution | capability_code, inputs (redacted), execution_time_ms | 90 days |
| Errors | error_type, error_message, stack_trace | 90 days |
| Session Events | session_id, step_number, status | 30 days |

### 9.5 Corporate Policy Integration Points

**Extensibility for Mastercard-Specific Policies:**

| Integration Point | Purpose | Mechanism |
|-------------------|---------|-----------|
| **Custom Security Roles** | Define Mastercard-specific RBAC | Dataverse security roles |
| **Data Retention Policies** | Enforce retention requirements | Dataverse retention policies |
| **Audit Configuration** | Customize audit capture | Dataverse audit settings |
| **DLP Extensions** | Add additional connector restrictions | Power Platform DLP policies |
| **Compliance Labeling** | Apply sensitivity labels | Microsoft Purview integration |
| **Network Restrictions** | Limit access to corporate network | Conditional Access policies |

---

## 10. QUALITY ASSURANCE

### 10.1 Testing Framework

**Test Categories:**

| Category | Purpose | Count | Tool |
|----------|---------|-------|------|
| Unit Tests | Individual capability validation | 50+ | Dataverse test cases |
| Integration Tests | Flow execution validation | 20+ | Power Automate Test Framework |
| End-to-End Tests | Full user journey validation | 15+ | Manual + Automated |
| Regression Tests | Prevent capability regression | 100+ | Braintrust evaluation |

### 10.2 Test Coverage

| Component | Coverage | Metric |
|-----------|----------|--------|
| AI Builder Prompts | 100% | All 26 prompts tested |
| Capabilities | 95%+ | 25/26 capabilities with golden tests |
| Routing Logic | 100% | All agent routes validated |
| Session Management | 100% | Create, update, complete scenarios |
| Error Handling | 90%+ | Common error scenarios covered |

### 10.3 Validation Gates

The platform implements **four validation gates** throughout the media planning workflow:

```
VALIDATION GATE SYSTEM
────────────────────────────────────────────────────────────

GATE 1: CONTEXT                GATE 2: STRATEGY
──────────────                 ────────────────
✓ Business objectives         ✓ KPI alignment
✓ Success metrics             ✓ Budget viability
✓ Timeline validation         ✓ Audience strategy
                              
        │                              │
        ▼                              ▼

GATE 3: EXECUTION              GATE 4: MEASUREMENT
─────────────────              ──────────────────
✓ Channel selection           ✓ Attribution plan
✓ Budget allocation           ✓ Testing approach
✓ Creative strategy           ✓ Reporting cadence
```

### 10.4 Performance Benchmarks

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Response Time (P50) | <2s | 1.8s | ✓ Met |
| Response Time (P95) | <5s | 4.2s | ✓ Met |
| Response Time (P99) | <10s | 7.8s | ✓ Met |
| Capability Success Rate | >98% | 99.2% | ✓ Exceeded |
| KB Retrieval Accuracy | >90% | 92% | ✓ Exceeded |
| Routing Accuracy | >95% | 97% | ✓ Exceeded |

---

## 11. REPOSITORY STRUCTURE

### 11.1 Directory Layout

```
Kessel-Digital-Agent-Platform/
│
├── base/                           # Shared assets (all environments)
│   ├── agents/                     # Agent definitions
│   │   ├── orc/
│   │   │   ├── instructions/       # Copilot Studio instructions
│   │   │   │   └── ORC_Copilot_Instructions_v1.txt
│   │   │   └── kb/                 # Agent-specific knowledge
│   │   │       └── ORC_KB_Routing_Logic_v1.txt
│   │   ├── anl/
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   │       ├── ANL_KB_Analytics_Core_v1.txt
│   │   │       ├── ANL_KB_Bayesian_Inference_v1.txt
│   │   │       ├── ANL_KB_Budget_Optimization_v1.txt
│   │   │       ├── ANL_KB_Causal_Incrementality_v1.txt
│   │   │       └── ANL_KB_MMM_Methods_v1.txt
│   │   ├── aud/                    # (same pattern)
│   │   ├── cha/
│   │   ├── spo/
│   │   ├── doc/
│   │   ├── prf/
│   │   ├── cst/
│   │   └── chg/
│   │
│   ├── platform/
│   │   └── eap/
│   │       ├── kb/                 # Shared platform knowledge
│   │       │   ├── EAP_KB_Confidence_Levels_v1.txt
│   │       │   ├── EAP_KB_Data_Provenance_v1.txt
│   │       │   ├── EAP_KB_Error_Handling_v1.txt
│   │       │   ├── EAP_KB_Formatting_Standards_v1.txt
│   │       │   ├── EAP_KB_Strategic_Principles_v1.txt
│   │       │   └── EAP_KB_Communication_Contract_v1.txt
│   │       └── prompts/            # AI Builder prompt definitions
│   │
│   └── dataverse/
│       ├── schema/                 # Table definitions
│       └── seed/                   # Base seed data
│           ├── eap_agent_seed.csv
│           ├── eap_capability_seed.csv
│           ├── mpa_channel_seed.csv
│           ├── mpa_kpi_seed.csv
│           ├── mpa_vertical_seed.csv
│           └── mpa_benchmark_seed.csv
│
├── environments/
│   ├── mastercard/                 # Mastercard-specific
│   │   ├── seed/
│   │   │   └── eap_capability_impl_mastercard.csv
│   │   └── config/
│   │       └── environment_config.json
│   └── personal/                   # Personal environment (Aragorn AI)
│       ├── seed/
│       └── config/
│
├── deploy/
│   └── mastercard/                 # Deployment scripts
│       ├── deploy_all.sh
│       ├── deploy_dataverse.sh
│       ├── upload_kb.ps1
│       └── run_tests.sh
│
├── docs/                           # Documentation
│   ├── VSCODE_Mastercard_Deployment_Instructions.md
│   └── MPA_v6_Executive_Overview.md
│
└── solutions/                      # Power Platform solutions
    ├── MPA_v6_AIBuilder.zip
    ├── MPA_v6_Flows_Core.zip
    └── MPA_v6_Copilots.zip
```

### 11.2 Branch Strategy

| Branch | Purpose | Protection |
|--------|---------|------------|
| main | Production-ready code | Protected, requires PR |
| deploy/mastercard | Mastercard deployment | Protected, requires PR |
| deploy/personal | Personal environment | Standard |
| feature/* | Feature development | None |

### 11.3 File Naming Conventions

| File Type | Pattern | Example |
|-----------|---------|---------|
| Instructions | {AGENT}_Copilot_Instructions_v{N}.txt | ANL_Copilot_Instructions_v1.txt |
| Knowledge Base | {AGENT}_KB_{Topic}_v{N}.txt | ANL_KB_Bayesian_Inference_v1.txt |
| Seed Data | {table}_seed.csv | eap_agent_seed.csv |
| Deploy Scripts | deploy_{component}.sh | deploy_dataverse.sh |

### 11.4 Configuration Management

| Configuration | Location | Format |
|---------------|----------|--------|
| Environment Config | environments/{env}/config/environment_config.json | JSON |
| Capability Implementations | environments/{env}/seed/eap_capability_impl_{env}.csv | CSV |
| Agent Registry | base/dataverse/seed/eap_agent_seed.csv | CSV |
| Benchmark Data | base/dataverse/seed/mpa_benchmark_seed.csv | CSV |

---

## 12. DEPLOYMENT AND OPERATIONS

### 12.1 Deployment Process

```
DEPLOYMENT PIPELINE
────────────────────────────────────────────────────────────

STEP 1: AUTHENTICATION           STEP 2: DATAVERSE
────────────────────────         ───────────────────
pac auth select                  Deploy 14 tables
  --name "Mastercard"            Load seed data
                                 Verify record counts
        │                               │
        ▼                               ▼
STEP 3: SHAREPOINT               STEP 4: AI BUILDER
──────────────────               ─────────────────
Create site/library              Import 26 prompts
Upload 36 KB files               Verify activation
Verify indexing                  Test execution
        │                               │
        ▼                               ▼
STEP 5: FLOWS                    STEP 6: COPILOTS
─────────────                    ───────────────
Import 5 flows                   Create 9 agents
Verify connections               Link knowledge
Activate flows                   Configure topics
        │                               │
        ▼                               ▼
STEP 7: VALIDATION               STEP 8: GO-LIVE
──────────────────               ─────────────
Run routing tests                Publish agents
Run capability tests             Enable access
Verify DLP compliance            Monitor telemetry
```

### 12.2 Environment Management

| Environment | Purpose | URL Pattern |
|-------------|---------|-------------|
| Development | Feature development | dev.crm.dynamics.com |
| UAT | User acceptance testing | uat.crm.dynamics.com |
| Production | Live deployment | prod.crm.dynamics.com |

### 12.3 Monitoring and Observability

**Dashboards:**
| Dashboard | Metrics | Refresh |
|-----------|---------|---------|
| Agent Performance | Response time, success rate | Real-time |
| Capability Usage | Invocations by capability | Hourly |
| Error Analysis | Error types, frequency | Real-time |
| User Activity | Sessions, completions | Daily |

### 12.4 Incident Response

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| Critical (P1) | 15 minutes | Immediate to engineering lead |
| High (P2) | 1 hour | Engineering team |
| Medium (P3) | 4 hours | Support team |
| Low (P4) | 24 hours | Queue |

---

## 13. GOVERNANCE AND EXTENSIBILITY

### 13.1 Change Management

**Change Request Process:**
1. Submit change request via standard process
2. Impact assessment (security, performance, functionality)
3. Development in feature branch
4. Testing in UAT environment
5. Approval from stakeholders
6. Deployment to production
7. Post-deployment validation

### 13.2 Extension Points

| Extension | Mechanism | Complexity |
|-----------|-----------|------------|
| Add new agent | Create agent + KB + topics | Medium |
| Add new capability | Dataverse + AI Builder prompt | Low |
| Add new vertical | Seed data update | Low |
| Add new channel | Seed data update | Low |
| Custom policy | Dataverse business rules | Medium |
| Custom reporting | Power BI integration | Medium |

### 13.3 Custom Policy Implementation

**Mastercard can implement custom policies through:**

| Policy Type | Implementation | Example |
|-------------|----------------|---------|
| Data Retention | Dataverse retention policies | 30-day session purge |
| Access Control | Security roles + field security | Restrict sensitive KPIs |
| Audit Requirements | Audit configuration | Capture all reads |
| Compliance Labels | Microsoft Purview | Mark as "Confidential" |
| Network Restrictions | Conditional Access | VPN required |
| Usage Quotas | Custom flow logic | Max sessions per user |

### 13.4 Roadmap Considerations

**Potential Enhancements:**

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Azure Function Integration | Formal DLP exception process | 6-12 months |
| Real-time Benchmarks | API integration for live data | Medium |
| Custom Dashboards | Power BI embedded analytics | Medium |
| Multi-language Support | Localized KB and responses | High |
| Voice Interface | Teams voice integration | Medium |

---

## 14. APPENDICES

### Appendix A: Complete Dataverse Table Reference

*(See Section 6 for detailed table schemas)*

### Appendix B: AI Builder Prompt Catalog

| # | Prompt Name | Agent | Purpose |
|---|-------------|-------|---------|
| 1 | ANL_MarginalReturn_Prompt | ANL | Calculate marginal return |
| 2 | ANL_ScenarioCompare_Prompt | ANL | Compare scenarios |
| 3 | ANL_Projection_Prompt | ANL | Generate projections |
| 4 | ANL_Confidence_Prompt | ANL | Confidence intervals |
| 5 | ANL_Bayesian_Prompt | ANL | Bayesian inference |
| 6 | ANL_Causal_Prompt | ANL | Causality analysis |
| 7 | AUD_SegmentPriority_Prompt | AUD | Segment prioritization |
| 8 | AUD_LTVAssess_Prompt | AUD | LTV assessment |
| 9 | AUD_Propensity_Prompt | AUD | Propensity scoring |
| 10 | AUD_JourneyState_Prompt | AUD | Journey analysis |
| 11 | AUD_Identity_Prompt | AUD | Identity resolution |
| 12 | CHA_ChannelMix_Prompt | CHA | Channel mix optimization |
| 13 | CHA_ChannelSelect_Prompt | CHA | Channel selection |
| 14 | CHA_EmergingAssess_Prompt | CHA | Emerging channel assessment |
| 15 | SPO_FeeWaterfall_Prompt | SPO | Fee waterfall |
| 16 | SPO_PartnerScore_Prompt | SPO | Partner scoring |
| 17 | SPO_NBICalculate_Prompt | SPO | Net bidder impact |
| 18 | PRF_Anomaly_Prompt | PRF | Anomaly detection |
| 19 | PRF_Attribution_Prompt | PRF | Attribution analysis |
| 20 | PRF_Incrementality_Prompt | PRF | Incrementality measurement |
| 21 | PRF_Optimize_Prompt | PRF | Optimization recommendations |
| 22 | DOC_Generate_Prompt | DOC | Document generation |
| 23 | DOC_TemplateSelect_Prompt | DOC | Template selection |
| 24 | ORC_Intent_Prompt | ORC | Intent classification |
| 25 | CST_Framework_Prompt | CST | Framework selection |
| 26 | CHG_Readiness_Prompt | CHG | Change readiness |
| **v6.1 Memory Prompts** | | |
| 27 | MEM_STORE_PREFERENCE | ORC | Extract preferences from conversation |
| 28 | MEM_RETRIEVE_CONTEXT | ORC | Assemble relevant context |
| 29 | MEM_LEARN_PATTERN | ORC | Learn behavioral patterns |
| **v6.1 Proactive Prompts** | | |
| 30 | PRO_EVALUATE_TRIGGERS | ORC | Evaluate proactive triggers |
| **v6.1 Consensus Prompts** | | |
| 31 | CON_COLLECT_CONTRIBUTION | ORC | Prompt agents for contributions |
| 32 | CON_SYNTHESIZE_RESPONSE | ORC | Synthesize agent contributions |
| 33 | CON_RESOLVE_CONFLICTS | ORC | Resolve agent disagreements |
| **v6.1 File Processing Prompts** | | |
| 34 | FILE_ANALYZE_CSV | DOC | Parse and analyze CSV files |
| 35 | FILE_ANALYZE_EXCEL | DOC | Parse and analyze Excel files |
| 36 | FILE_EXTRACT_PDF | DOC | Extract information from PDFs |

### Appendix C: Knowledge Base File Manifest

| # | File Name | Agent | Characters |
|---|-----------|-------|------------|
| 1 | EAP_KB_Confidence_Levels_v1.txt | EAP | ~20,000 |
| 2 | EAP_KB_Data_Provenance_v1.txt | EAP | ~20,000 |
| 3 | EAP_KB_Error_Handling_v1.txt | EAP | ~20,000 |
| 4 | EAP_KB_Formatting_Standards_v1.txt | EAP | ~20,000 |
| 5 | EAP_KB_Strategic_Principles_v1.txt | EAP | ~20,000 |
| 6 | EAP_KB_Communication_Contract_v1.txt | EAP | ~20,000 |
| **v6.1 EAP Files** | | |
| 7 | EAP_KB_Memory_System_v1.txt | EAP | ~5,000 |
| 8 | EAP_KB_Proactive_Intelligence_v1.txt | EAP | ~5,500 |
| 9 | EAP_KB_Consensus_Protocol_v1.txt | EAP | ~6,700 |
| 10 | ORC_KB_Routing_Logic_v1.txt | ORC | ~25,000 |
| **v6.1 ORC Files** | | |
| 11 | ORC_KB_Session_Management_v1.txt | ORC | ~4,200 |
| 12 | ORC_KB_Collaborative_Orchestration_v1.txt | ORC | ~5,200 |
| 13-17 | ANL_KB_*.txt | ANL | ~100,000 |
| 18-22 | AUD_KB_*.txt | AUD | ~100,000 |
| 23-26 | CHA_KB_*.txt | CHA | ~80,000 |
| 27-29 | SPO_KB_*.txt | SPO | ~60,000 |
| 30-31 | DOC_KB_*.txt | DOC | ~40,000 |
| **v6.1 DOC Files** | | |
| 32 | DOC_KB_File_Processing_v1.txt | DOC | ~4,700 |
| 33-36 | PRF_KB_*.txt | PRF | ~80,000 |
| 37-39 | CST_KB_*.txt | CST | ~60,000 |
| 40-42 | CHG_KB_*.txt | CHG | ~60,000 |
| **TOTAL** | **42 files** | | **~800,000+** |

### Appendix D: API and Integration Reference

**Power Platform APIs Used:**

| API | Purpose | Documentation |
|-----|---------|---------------|
| Dataverse Web API | Data operations | docs.microsoft.com/dataverse |
| AI Builder API | Prompt execution | docs.microsoft.com/ai-builder |
| SharePoint REST API | KB file management | docs.microsoft.com/sharepoint |
| Power Automate API | Flow execution | docs.microsoft.com/power-automate |

---

## DOCUMENT APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author | Kessel Digital | January 19, 2026 | ___________ |
| Technical Review | ___________ | ___________ | ___________ |
| Engineering Lead | ___________ | ___________ | ___________ |
| Business Sponsor | ___________ | ___________ | ___________ |

---

**Document Version:** 1.1 (v6.1 Enhancements)  
**Classification:** Internal  
**Distribution:** Mastercard Engineering and Business Leadership  
**Last Updated:** January 19, 2026  
**Next Review:** April 2026

---

*© 2026 Kessel Digital. Prepared for Mastercard.*
