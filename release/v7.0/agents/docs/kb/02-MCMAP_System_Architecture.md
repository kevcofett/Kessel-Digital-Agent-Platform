# MASTERCARD CONSULTING & MARKETING AGENT PLATFORM (MCMAP)
# MASTERCARD DEPLOYMENT - SYSTEM ARCHITECTURE SPECIFICATION

**Document:** 02-MCMAP_System_Architecture.md
**Version:** 2.0
**Date:** January 31, 2026
**Classification:** Mastercard Internal
**Status:** Production Ready (v7.0)
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         SYSTEM CONTEXT DIAGRAM                               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚  â”‚              â”‚         â”‚                                   â”‚              â”‚
â”‚  â”‚    USERS     â”‚â—„â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚     MCMAP AGENT PLATFORM          â”‚              â”‚
â”‚  â”‚  (Browser/   â”‚         â”‚                                   â”‚              â”‚
â”‚  â”‚   Teams)     â”‚         â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚              â”‚
â”‚  â”‚              â”‚         â”‚  â”‚   Copilot Studio Agents     â”‚ â”‚              â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚  â”‚   (ORC, ANL, AUD, CHA,      â”‚ â”‚              â”‚
â”‚                           â”‚  â”‚    SPO, DOC, PRF, CST,      â”‚ â”‚              â”‚
â"‚                           â"‚  â"‚    CHG, CA, GHA)            â"‚ â"‚              â"‚
â”‚                           â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚              â”‚
â”‚                           â”‚                â”‚                  â”‚              â”‚
â”‚                           â”‚                â–¼                  â”‚              â”‚
â”‚                           â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚              â”‚
â”‚                           â”‚  â”‚   AI Builder Prompts (36)   â”‚ â”‚              â”‚
â”‚                           â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚              â”‚
â”‚                           â”‚                â”‚                  â”‚              â”‚
â”‚                           â”‚                â–¼                  â”‚              â”‚
â”‚                           â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚              â”‚
â”‚                           â”‚  â”‚   Power Automate Flows (5)  â”‚ â”‚              â”‚
â”‚                           â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚              â”‚
â”‚                           â”‚                â”‚                  â”‚              â”‚
â”‚                           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
â”‚                                            â”‚                                 â”‚
â”‚                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚                    â”‚                       â”‚                       â”‚        â”‚
â”‚                    â–¼                       â–¼                       â–¼        â”‚
â”‚           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚           â”‚  DATAVERSE   â”‚        â”‚  SHAREPOINT  â”‚        â”‚   AZURE AD   â”‚ â”‚
â”‚           â”‚ (14 Tables)  â”‚        â”‚  (80+ KB     â”‚        â”‚   (AuthN/    â”‚ â”‚
â”‚           â”‚              â”‚        â”‚   Files)     â”‚        â”‚    AuthZ)    â”‚ â”‚
â”‚           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 1.2 Key Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Total Agents | 11 | 7 MPA + 3 CA + 1 Growth (GHA) |
| Total KB Files | 80+ | Across all agents |
| Instruction Space | 88,000 chars | 8K x 11 agents |
| AI Builder Prompts | 36 | 26 base + 10 GHA (v7.0) |
| Dataverse Tables | 15 | EAP (8) + MPA (6) + Growth (1) |
| Power Automate Flows | 8 | 5 core + 3 GHA flows |
| SharePoint Libraries | 1 | Knowledge Base hosting |

### 1.3 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Presentation | Copilot Studio | Conversational interface |
| Orchestration | Power Automate | Workflow execution |
| Computation | AI Builder | Custom prompts, analysis |
| Data | Dataverse | Structured data storage |
| Knowledge | SharePoint | Unstructured KB content |
| Identity | Azure AD | Authentication & authorization |
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
| ADR-001 | 11 agents maximum | Routing complexity increases exponentially | Approved |
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        MCMAP COMPONENT ARCHITECTURE                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  TIER 1: PRESENTATION LAYER                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚                      COPILOT STUDIO AGENTS                             â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”              â”‚ â”‚
â”‚  â”‚  â”‚ ORC â”‚ â”‚ ANL â”‚ â”‚ AUD â”‚ â”‚ CHA â”‚ â”‚ SPO â”‚ â”‚ DOC â”‚ â”‚ PRF â”‚              â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜              â”‚ â”‚
â”‚  â”‚                                                                        â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”                                              â”‚ â”‚
â”‚  â”‚  â”‚ CST â”‚ â”‚ CHG â”‚ â”‚ CA  â”‚                                              â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”˜                                              â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  TIER 2: ORCHESTRATION LAYER                                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚                     POWER AUTOMATE FLOWS                               â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                   â”‚ â”‚
â”‚  â”‚  â”‚  Capability_Dispatch â”‚  â”‚  Session_Manager     â”‚                   â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                   â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                   â”‚ â”‚
â”‚  â”‚  â”‚  AIBuilder_Execute   â”‚  â”‚  Telemetry_Logger    â”‚                   â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                   â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                             â”‚ â”‚
â”‚  â”‚  â”‚  Document_Generate   â”‚                                             â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                             â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  TIER 3: COMPUTATION LAYER                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚                     AI BUILDER CUSTOM PROMPTS                          â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚ â”‚
â”‚  â”‚  â”‚  ANL: 6 prompts  â”‚  AUD: 5 prompts  â”‚  CHA: 3 prompts        â”‚   â”‚ â”‚
â”‚  â”‚  â”‚  SPO: 3 prompts  â”‚  PRF: 4 prompts  â”‚  DOC: 3 prompts        â”‚   â”‚ â”‚
â”‚  â”‚  â”‚  ORC: 2 prompts                                               â”‚   â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  TIER 4: DATA LAYER                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚                          DATAVERSE                                     â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚ â”‚
â”‚  â”‚  â”‚      EAP TABLES (8)         â”‚  â”‚      MPA TABLES (6)         â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  - eap_agent                â”‚  â”‚  - mpa_channel              â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  - eap_capability           â”‚  â”‚  - mpa_kpi                  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  - eap_capability_impl      â”‚  â”‚  - mpa_benchmark            â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  - eap_prompt               â”‚  â”‚  - mpa_vertical             â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  - eap_test_case            â”‚  â”‚  - mpa_partner              â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  - eap_telemetry            â”‚  â”‚  - mpa_session              â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  - eap_environment_config   â”‚  â”‚                             â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  - eap_session              â”‚  â”‚                             â”‚     â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  TIER 5: KNOWLEDGE LAYER                                                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚                         SHAREPOINT                                     â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚ â”‚
â”‚  â”‚  â”‚  KNOWLEDGE BASE LIBRARY (80+ Files)                             â”‚  â”‚ â”‚
â”‚  â”‚  â”‚  - Agent Instructions (10 files, 8K chars each)                 â”‚  â”‚ â”‚
â”‚  â”‚  â”‚  - Core KB Files (10 files, 20-25K chars each)                  â”‚  â”‚ â”‚
â”‚  â”‚  â”‚  - Deep Module KB Files (17+ files, 15-25K chars each)          â”‚  â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 3.2 Component Specifications

#### 3.2.1 Copilot Studio Agents

| Component | Specification |
|-----------|---------------|
| **Technology** | Microsoft Copilot Studio |
| **Instance Count** | 11 agents |
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
| **Growth (GHA_*)** | **10** | **AARRR lifecycle, growth strategy, experiments** |

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
| **GHA** | **Growth Hacking** | **Growth** | **8K chars** | **1** | **9** |

### 4.2 Agent Interaction Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        AGENT INTERACTION SEQUENCE                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  USER                ORC                SPECIALIST            CAPABILITY     â”‚
â”‚   â”‚                   â”‚                    â”‚                  DISPATCHER     â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚  1. Request       â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚  2. Classify       â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚     Intent         â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚  3. Route          â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚  4. Retrieve KB      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚  5. Execute          â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚     Capability       â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚  6. Return Result    â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚  7. Response       â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚  8. Final Reply   â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                    â”‚                      â”‚          â”‚
â”‚   â”‚                   â”‚                    â”‚                      â”‚          â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    CAPABILITY ABSTRACTION LAYER                              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  AGENT REQUEST                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  capability_code: "ANL_MARGINAL_RETURN"                                â”‚ â”‚
â”‚  â”‚  inputs_json: {"budget": 500000, "channel": "search"}                  â”‚ â”‚
â”‚  â”‚  session_id: "abc-123"                                                 â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  CAPABILITY DISPATCHER FLOW                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Step 1: Get environment_code from eap_environment_config              â”‚ â”‚
â”‚  â”‚          â†’ Returns: "MASTERCARD"                                       â”‚ â”‚
â”‚  â”‚                                                                        â”‚ â”‚
â”‚  â”‚  Step 2: Query eap_capability_implementation                           â”‚ â”‚
â”‚  â”‚          WHERE capability_code = "ANL_MARGINAL_RETURN"                 â”‚ â”‚
â”‚  â”‚          AND environment_code = "MASTERCARD"                           â”‚ â”‚
â”‚  â”‚          AND is_enabled = true                                         â”‚ â”‚
â”‚  â”‚          ORDER BY priority_order ASC                                   â”‚ â”‚
â”‚  â”‚          â†’ Returns: implementation_type = "AI_BUILDER_PROMPT"          â”‚ â”‚
â”‚  â”‚                     prompt_code = "ANL_MARGINAL_RETURN_PROMPT"         â”‚ â”‚
â”‚  â”‚                                                                        â”‚ â”‚
â”‚  â”‚  Step 3: Route to MPA_Impl_AIBuilder flow                              â”‚ â”‚
â”‚  â”‚          â†’ Execute AI Builder prompt                                   â”‚ â”‚
â”‚  â”‚          â†’ Return structured result                                    â”‚ â”‚
â”‚  â”‚                                                                        â”‚ â”‚
â”‚  â”‚  Step 4: Log to eap_telemetry                                          â”‚ â”‚
â”‚  â”‚          â†’ capability_code, implementation_type, latency_ms, success   â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  STRUCTURED RESULT                                                           â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  {                                                                     â”‚ â”‚
â”‚  â”‚    "success": true,                                                    â”‚ â”‚
â”‚  â”‚    "result": { "marginal_return": 1.23, "confidence": "HIGH" },       â”‚ â”‚
â”‚  â”‚    "implementation": "AI_BUILDER_PROMPT",                              â”‚ â”‚
â”‚  â”‚    "latency_ms": 847                                                   â”‚ â”‚
â”‚  â”‚  }                                                                     â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 5.2 Implementation Types

| Type | Description | Mastercard Support |
|------|-------------|-------------------|
| AI_BUILDER_PROMPT | AI Builder custom prompt | âœ“ PRIMARY |
| DATAVERSE_LOGIC | Power Fx calculation | âœ“ SUPPORTED |
| AZURE_FUNCTION | Azure Function call | âœ— BLOCKED BY DLP |
| HTTP_ENDPOINT | External HTTP call | âœ— BLOCKED BY DLP |

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

â”œâ”€â”€ instructions/                    # Agent instruction files (10 files)
â”‚   â”œâ”€â”€ ORC_Copilot_Instructions_v1.txt
â”‚   â”œâ”€â”€ ANL_Copilot_Instructions_v1.txt
â”‚   â”œâ”€â”€ AUD_Copilot_Instructions_v1.txt
â”‚   â”œâ”€â”€ CHA_Copilot_Instructions_v1.txt
â”‚   â”œâ”€â”€ SPO_Copilot_Instructions_v1.txt
â”‚   â”œâ”€â”€ DOC_Copilot_Instructions_v1.txt
â”‚   â”œâ”€â”€ PRF_Copilot_Instructions_v1.txt
â”‚   â”œâ”€â”€ CST_Copilot_Instructions_v1.txt
â”‚   â”œâ”€â”€ CHG_Copilot_Instructions_v1.txt
â”‚   â””â”€â”€ CA_Copilot_Instructions_v1.txt
â”‚
â”œâ”€â”€ core/                            # Core KB files (10 files)
â”‚   â”œâ”€â”€ ORC_KB_Routing_Logic_v1.txt
â”‚   â”œâ”€â”€ ANL_KB_Analytics_Core_v1.txt
â”‚   â”œâ”€â”€ AUD_KB_Audience_Core_v1.txt
â”‚   â”œâ”€â”€ CHA_KB_Channel_Core_v1.txt
â”‚   â”œâ”€â”€ SPO_KB_Supply_Core_v1.txt
â”‚   â”œâ”€â”€ DOC_KB_Document_Core_v1.txt
â”‚   â”œâ”€â”€ PRF_KB_Performance_Core_v1.txt
â”‚   â”œâ”€â”€ CST_KB_Consulting_Core_v1.txt
â”‚   â”œâ”€â”€ CHG_KB_Change_Core_v1.txt
â”‚   â””â”€â”€ CA_KB_Analysis_Core_v1.txt
â”‚
â”œâ”€â”€ deep-modules/                    # Deep module KB files (17+ files)
â”‚   â”œâ”€â”€ ANL_KB_MMM_Methods_v1.txt
â”‚   â”œâ”€â”€ ANL_KB_Bayesian_Inference_v1.txt
â”‚   â”œâ”€â”€ ANL_KB_Causal_Incrementality_v1.txt
â”‚   â”œâ”€â”€ ANL_KB_Budget_Optimization_v1.txt
â”‚   â”œâ”€â”€ AUD_KB_Identity_Resolution_v1.txt
â”‚   â”œâ”€â”€ AUD_KB_LTV_Modeling_v1.txt
â”‚   â”œâ”€â”€ AUD_KB_Propensity_ML_v1.txt
â”‚   â”œâ”€â”€ AUD_KB_Journey_Orchestration_v1.txt
â”‚   â”œâ”€â”€ CHA_KB_Allocation_Methods_v1.txt
â”‚   â”œâ”€â”€ CHA_KB_Emerging_Channels_v1.txt
â”‚   â”œâ”€â”€ CHA_KB_Brand_Performance_v1.txt
â”‚   â”œâ”€â”€ SPO_KB_Fee_Analysis_v1.txt
â”‚   â”œâ”€â”€ SPO_KB_Partner_Evaluation_v1.txt
â”‚   â”œâ”€â”€ PRF_KB_Attribution_Methods_v1.txt
â”‚   â”œâ”€â”€ PRF_KB_Incrementality_Testing_v1.txt
â”‚   â”œâ”€â”€ PRF_KB_Anomaly_Detection_v1.txt
â”‚   â””â”€â”€ DOC_KB_Export_Formats_v1.txt
â”‚
â””â”€â”€ shared/                          # EAP shared KB files (6 files)
    â”œâ”€â”€ EAP_KB_Data_Provenance_v1.txt
    â”œâ”€â”€ EAP_KB_Confidence_Levels_v1.txt
    â”œâ”€â”€ EAP_KB_Error_Handling_v1.txt
    â”œâ”€â”€ EAP_KB_Formatting_Standards_v1.txt
    â”œâ”€â”€ EAP_KB_Strategic_Principles_v1.txt
    â””â”€â”€ EAP_KB_Communication_Contract_v1.txt
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
| 2 | Hyphens only for lists (no bullets) | No â€¢, â—, â—‹, â˜… characters |
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    MPA_CAPABILITY_DISPATCHER FLOW                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  INPUT:                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  capability_code: string (e.g., "ANL_MARGINAL_RETURN")                 â”‚ â”‚
â”‚  â”‚  inputs_json: string (JSON payload for capability)                     â”‚ â”‚
â”‚  â”‚  session_id: string (session identifier)                               â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚  STEP 1: GET ENVIRONMENT                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Action: List rows from eap_environment_config                         â”‚ â”‚
â”‚  â”‚  Filter: is_active eq true                                             â”‚ â”‚
â”‚  â”‚  Output: environment_code (e.g., "MASTERCARD")                         â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚  STEP 2: GET IMPLEMENTATION                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Action: List rows from eap_capability_implementation                  â”‚ â”‚
â”‚  â”‚  Filter: capability_code eq @{capability_code}                         â”‚ â”‚
â”‚  â”‚          AND environment_code eq @{environment_code}                   â”‚ â”‚
â”‚  â”‚          AND is_enabled eq true                                        â”‚ â”‚
â”‚  â”‚  Order: priority_order asc                                             â”‚ â”‚
â”‚  â”‚  Top: 1                                                                â”‚ â”‚
â”‚  â”‚  Output: implementation_type, prompt_code, endpoint_url                â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚  STEP 3: ROUTE TO IMPLEMENTATION (SWITCH)                                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  CASE: implementation_type = "AI_BUILDER_PROMPT"                       â”‚ â”‚
â”‚  â”‚    â†’ Call MPA_Impl_AIBuilder (prompt_code, inputs_json)                â”‚ â”‚
â”‚  â”‚                                                                        â”‚ â”‚
â”‚  â”‚  CASE: implementation_type = "DATAVERSE_LOGIC"                         â”‚ â”‚
â”‚  â”‚    â†’ Execute Power Fx expression                                       â”‚ â”‚
â”‚  â”‚                                                                        â”‚ â”‚
â”‚  â”‚  DEFAULT:                                                              â”‚ â”‚
â”‚  â”‚    â†’ Return error (unsupported implementation)                         â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚  STEP 4: ERROR HANDLING                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  IF: Primary implementation fails                                      â”‚ â”‚
â”‚  â”‚  THEN: Query fallback_implementation_id                                â”‚ â”‚
â”‚  â”‚        Retry with fallback implementation                              â”‚ â”‚
â”‚  â”‚  ELSE: Return error response                                           â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚  STEP 5: LOG TELEMETRY                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Call: MPA_Telemetry_Logger                                            â”‚ â”‚
â”‚  â”‚  Data: capability_code, implementation_type, latency_ms,               â”‚ â”‚
â”‚  â”‚        success, session_id, timestamp                                  â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚  OUTPUT:                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  {                                                                     â”‚ â”‚
â”‚  â”‚    "success": boolean,                                                 â”‚ â”‚
â”‚  â”‚    "result": object,                                                   â”‚ â”‚
â”‚  â”‚    "implementation": string,                                           â”‚ â”‚
â”‚  â”‚    "latency_ms": number,                                               â”‚ â”‚
â”‚  â”‚    "error": string | null                                              â”‚ â”‚
â”‚  â”‚  }                                                                     â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 8. INTEGRATION PATTERNS

### 8.1 Microsoft Teams Integration

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     TEAMS INTEGRATION ARCHITECTURE                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  TEAMS CLIENT                                                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  User types: "@MCMAP What's the optimal channel mix for $500K?"         â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  TEAMS BOT FRAMEWORK                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Bot recognizes @mention â†’ Routes to Copilot Studio                    â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  COPILOT STUDIO                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  ORC Agent: Classifies intent â†’ Routes to CHA Agent                    â”‚ â”‚
â”‚  â”‚  CHA Agent: Retrieves KB â†’ Executes CHA_CHANNEL_MIX capability         â”‚ â”‚
â”‚  â”‚  Response: Returns channel mix recommendation                          â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â–¼                                        â”‚
â”‚  TEAMS CLIENT                                                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  User sees: "For a $500K budget, I recommend..."                       â”‚ â”‚
â”‚  â”‚  [Adaptive Card with channel breakdown]                                â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
| Microsoft Dataverse | Data | âœ“ Approved | Business |
| AI Builder | AI | âœ“ Approved | Business |
| SharePoint | Collaboration | âœ“ Approved | Business |
| Office 365 Outlook | Communication | âœ“ Approved | Business |
| Office 365 Users | Identity | âœ“ Approved | Business |
| Microsoft Teams | Collaboration | âœ“ Approved | Business |
| Approvals | Workflow | âœ“ Approved | Business |
| Excel Online (Business) | Data | âœ“ Approved | Business |
| HTTP | External | âœ— Blocked | Non-Business |
| Custom Connectors | Custom | âœ— Blocked | Non-Business |

---

## 10. DEPLOYMENT ARCHITECTURE

### 10.1 Solution Structure

```
POWER PLATFORM SOLUTIONS

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  MPA_v6_Platform (Managed Solution)                                         â”‚
â”‚  â”œâ”€â”€ Components                                                             â”‚
â”‚  â”‚   â”œâ”€â”€ Dataverse Tables (14)                                              â”‚
â”‚  â”‚   â”œâ”€â”€ Power Automate Flows (5)                                           â”‚
â”‚  â”‚   â”œâ”€â”€ AI Builder Prompts (36)                                            â”‚
â”‚  â”‚   â””â”€â”€ Environment Variables                                              â”‚
â”‚  â””â”€â”€ Dependencies                                                           â”‚
â”‚      â”œâ”€â”€ Dataverse (built-in)                                               â”‚
â”‚      â”œâ”€â”€ AI Builder (built-in)                                              â”‚
â”‚      â””â”€â”€ Power Automate (built-in)                                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  MPA_v6_Copilot_Agents (Managed Solution)                                   â”‚
â”‚  â”œâ”€â”€ Components                                                             â”‚
â”‚  â”‚   â””â”€â”€ Copilot Studio Agents (10)                                         â”‚
â”‚  â””â”€â”€ Dependencies                                                           â”‚
â”‚      â”œâ”€â”€ MPA_v6_Platform                                                    â”‚
â”‚      â””â”€â”€ SharePoint KB Files (external)                                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 10.2 Deployment Sequence

```
DEPLOYMENT ORDER

1. DATAVERSE SCHEMA
   â””â”€â”€ Create tables in dependency order
       â””â”€â”€ Tier 1: No dependencies (eap_agent, mpa_vertical, etc.)
       â””â”€â”€ Tier 2: Depends on Tier 1 (eap_capability, mpa_benchmark)
       â””â”€â”€ Tier 3: Depends on Tier 2 (eap_capability_implementation)
       â””â”€â”€ Tier 4: Session tables (mpa_session, eap_telemetry)

2. SEED DATA
   â””â”€â”€ Load reference data
       â””â”€â”€ Agent registry (eap_agent)
       â””â”€â”€ Capability registry (eap_capability)
       â””â”€â”€ Implementation mappings (eap_capability_implementation)
       â””â”€â”€ Benchmark data (mpa_benchmark)

3. AI BUILDER PROMPTS
   â””â”€â”€ Create and register 26 prompts
       â””â”€â”€ Register in eap_prompt table

4. POWER AUTOMATE FLOWS
   â””â”€â”€ Import and configure 5 flows
       â””â”€â”€ Configure connections
       â””â”€â”€ Enable flows

5. SHAREPOINT KB
   â””â”€â”€ Upload 80+ KB files
       â””â”€â”€ Create document library
       â””â”€â”€ Upload files
       â””â”€â”€ Verify accessibility

6. COPILOT STUDIO AGENTS
   â””â”€â”€ Create and configure 11 agents
       â””â”€â”€ Import agent definitions
       â””â”€â”€ Link knowledge sources
       â””â”€â”€ Configure topics
       â””â”€â”€ Publish agents

7. VALIDATION
   â””â”€â”€ Execute test suite
       â””â”€â”€ Unit tests
       â””â”€â”€ Integration tests
       â””â”€â”€ E2E tests
```

---

**Document Version:** 1.0  
**Classification:** Mastercard Internal  
**Last Updated:** January 23, 2026
