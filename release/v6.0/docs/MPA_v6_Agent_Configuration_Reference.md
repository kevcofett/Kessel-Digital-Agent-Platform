# MPA v6.0 AGENT CONFIGURATION REFERENCE

**Version:** 1.0  
**Date:** January 22, 2026  
**Status:** Production Ready  
**Applies To:** Mastercard and Personal (Aragorn AI) Environments

---

## EXECUTIVE SUMMARY

This document provides the authoritative configuration settings for all 10 agents in the MPA v6.0 platform. These settings were validated through test failure analysis and represent the production-approved configuration.

---

## SECTION 1: COMPLETE AGENT SETTINGS TABLE

### 1.1 Primary Settings Matrix

| Agent | Model | Web Search | General Knowledge | Deep Reasoning | Content Moderation |
|-------|-------|------------|-------------------|----------------|-------------------|
| **ORC** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **AUD** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |
| **CHA** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |
| **ANL** | Claude Opus 4.5 | OFF | OFF | ON | Medium |
| **SPO** | Claude Opus 4.5 | ON | OFF | ON | Medium |
| **DOC** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **PRF** | Claude Opus 4.5 | ON | OFF | ON | Medium |
| **CHG** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **CST** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **MKT** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |

### 1.2 Orchestration Setting

| Agent | Generative AI Orchestration |
|-------|----------------------------|
| **ORC** | ON (Dynamic) |
| **All Specialists** | As configured by platform |

---

## SECTION 2: SETTING DEFINITIONS

### 2.1 Model Selection

| Model | Use For | Characteristics |
|-------|---------|-----------------|
| **Claude Sonnet 4.5** | User-facing agents, format-sensitive outputs | Fast, excellent instruction-following, concise |
| **Claude Opus 4.5** | Complex analytical tasks | Deep reasoning, multi-step analysis, synthesis |

**Assignment Logic:**
- Sonnet: ORC, AUD, CHA, DOC, CHG, CST, MKT (7 agents)
- Opus: ANL, SPO, PRF (3 agents)

### 2.2 Web Search

| Setting | Behavior |
|---------|----------|
| **ON** | Agent can use Bing to search for current data |
| **OFF** | Agent relies only on KB and user-provided context |

**ON for:** AUD, CHA, SPO, PRF, MKT (need current market data)
**OFF for:** ORC, ANL, DOC, CHG, CST (use KB/calculations only)

### 2.3 General Knowledge

| Setting | Behavior |
|---------|----------|
| **ON** | Agent uses GPT foundational training data when KB lacks info |
| **OFF** | Agent only uses KB, web search (if enabled), or acknowledges gap |

**CRITICAL: OFF for ALL 10 agents.** This prevents unvalidated "general industry knowledge" responses.

### 2.4 Deep Reasoning

| Setting | Behavior |
|---------|----------|
| **ON** | Extended analysis, multi-step thinking, thorough synthesis |
| **OFF** | Direct responses, follows instructions tightly, concise |

**ON for:** ANL, SPO, PRF (complex calculations and analysis)
**OFF for:** ORC, AUD, CHA, DOC, CHG, CST, MKT (instruction compliance priority)

### 2.5 Content Moderation

| Level | Behavior |
|-------|----------|
| **High** | Aggressive filtering - may block legitimate business discussions |
| **Medium** | Balanced - blocks harmful content, allows business terminology |
| **Low** | Minimal filtering - too permissive for enterprise |

**Medium for ALL agents** - appropriate for Mastercard enterprise environment.

---

## SECTION 3: RATIONALE BY AGENT

### 3.1 ORC (Orchestrator)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Sonnet | Routing decisions should be fast, not overthought |
| Web Search | OFF | Orchestrator routes - doesn't need external data |
| General Knowledge | OFF | Must rely on KB and specialists |
| Deep Reasoning | OFF | Clarifying questions should be direct and concise |

### 3.2 AUD (Audience)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Sonnet | Must respect word limits and format rules |
| Web Search | ON | May need current platform capabilities, audience sizing |
| General Knowledge | OFF | Segment recommendations must come from validated KB |
| Deep Reasoning | OFF | Should be concise first, expand on request |

### 3.3 CHA (Channel)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Sonnet | Channel recommendations need structure, not overthinking |
| Web Search | ON | Channel benchmarks and platform capabilities change |
| General Knowledge | OFF | Channel guidance from curated KB only |
| Deep Reasoning | OFF | Recommendations should be actionable, not academic |

### 3.4 ANL (Analytics)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Opus | Complex Bayesian analysis, projections need deep reasoning |
| Web Search | OFF | Calculations based on user inputs and KB formulas |
| General Knowledge | OFF | Statistical methods from validated KB only |
| Deep Reasoning | ON | Budget optimization, diminishing returns analysis is complex |

### 3.5 SPO (Supply Path)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Opus | Fee analysis, optimization requires deep calculation |
| Web Search | ON | DSP/SSP fees and capabilities change frequently |
| General Knowledge | OFF | Supply path guidance from validated KB only |
| Deep Reasoning | ON | Working media ratio calculations are complex |

### 3.6 DOC (Document)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Sonnet | Template-driven - should follow structure precisely |
| Web Search | OFF | Generates from session data, not external sources |
| General Knowledge | OFF | Document content from session and KB only |
| Deep Reasoning | OFF | Should follow templates, not reason about them |

### 3.7 PRF (Performance)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Opus | Attribution modeling, anomaly detection needs deep analysis |
| Web Search | ON | May need current attribution methodologies, platform changes |
| General Knowledge | OFF | Performance analysis from validated KB only |
| Deep Reasoning | ON | Incrementality testing, MTA analysis is complex |

### 3.8 CHG (Change Management)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Sonnet | Follows adoption playbooks - structured guidance |
| Web Search | OFF | Change management from internal frameworks |
| General Knowledge | OFF | Adoption guidance from curated KB only |
| Deep Reasoning | OFF | Should follow playbooks, not overthink |

### 3.9 CST (Customer Strategy)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Sonnet | Strategy recommendations should be direct |
| Web Search | OFF | Strategy frameworks from internal KB |
| General Knowledge | OFF | Customer strategy from validated frameworks only |
| Deep Reasoning | OFF | Consultative, not academic |

### 3.10 MKT (Marketing)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Sonnet | Marketing guidance should be actionable |
| Web Search | ON | Market trends, competitive intel benefits from current data |
| General Knowledge | OFF | Marketing frameworks from validated KB only |
| Deep Reasoning | OFF | Recommendations should be practical, not theoretical |

---

## SECTION 4: INSTRUCTION FILE VERSIONS

| Agent | Current Instruction File | Character Count |
|-------|-------------------------|-----------------|
| ORC | ORC_Copilot_Instructions_v3_CORRECTED.txt | 6,157 |
| AUD | AUD_Copilot_Instructions_v2_CORRECTED.txt | 6,767 |
| CHA | CHA_Copilot_Instructions_v1.txt | Pending update |
| ANL | ANL_Copilot_Instructions_v1.txt | Pending update |
| SPO | SPO_Copilot_Instructions_v1.txt | Pending update |
| DOC | DOC_Copilot_Instructions_v1.txt | Pending update |
| PRF | PRF_Copilot_Instructions_v1.txt | Pending update |
| CHG | CHG_Copilot_Instructions_v1.txt | Pending update |
| CST | CST_Copilot_Instructions_v1.txt | Pending update |
| MKT | MKT_Copilot_Instructions_v1.txt | Pending update |

**Note:** All agents require instruction updates to include format compliance rules (prose-only, word limits, confidence attribution).

---

## SECTION 5: DEPLOYMENT CHECKLIST

For each agent, verify these settings in Copilot Studio:

### 5.1 Overview Tab
- [ ] Instructions updated to _CORRECTED version (or pending update)
- [ ] Web Search toggle set per table above

### 5.2 Settings Tab (Knowledge)
- [ ] General Knowledge → OFF
- [ ] Use information from web → Per table above

### 5.3 Settings Tab (AI)
- [ ] Model → Per table above
- [ ] Deep Reasoning → Per table above
- [ ] Content Moderation → Medium

### 5.4 Final Steps
- [ ] Save all changes
- [ ] Publish agent
- [ ] Test with validation scenario

---

## SECTION 6: VALIDATION TEST

After configuring all agents, test ORC with:

**Input:**
```
help me create a media plan for Nike. They have $250,000 to acquire new customers. They are targeting runners in the US
```

**Expected Behavior:**
1. Response under 300 words
2. No bullet points - prose only
3. Asks clarifying questions (timeline, KPIs)
4. Does NOT auto-route to specialists without user confirmation
5. Ends with question inviting user input

**Red Flags (Test FAILS):**
- Multi-agent execution plan created immediately
- 4,000+ word response with bullet points
- "Based on general industry knowledge" statements
- Character encoding artifacts
- No clarifying questions asked

---

## SECTION 7: CHANGE LOG

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-22 | 1.0 | Initial configuration based on test failure analysis |

---

**Document Status:** Production Ready  
**Next Review:** After validation testing
