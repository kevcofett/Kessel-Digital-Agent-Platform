# KDAP v6.0 - Agent Capabilities Summary

## Platform Overview

The Kessel Digital Agent Platform (KDAP) v6.0 comprises 10 specialized agents across two domains:
- **MPA Domain**: Media Planning Agent capabilities (7 agents)
- **CA Domain**: Consulting Agent capabilities (2 agents)
- **Shared**: Cross-domain services (1 agent)

**Total: 10 Agents | 35+ Capabilities | 55+ KB Files**

---

## Agent Registry

| Code | Name | Domain | Capabilities | KB Files |
|------|------|--------|--------------|----------|
| ORC | Orchestrator | Shared | 4 | 5 |
| ANL | Analytics | MPA | 12 | 17 |
| AUD | Audience | MPA | 6 | 22 |
| CHA | Channel | MPA | 5 | 11 |
| SPO | Supply Path | MPA | 4 | 16 |
| DOC | Document | Shared | 6 | 6 |
| PRF | Performance | MPA | 5 | 25 |
| CST | Consulting Strategy | CA | 4 | 4 |
| CHG | Change Management | CA | 3 | 3 |

---

## ORC - Orchestrator Agent

**Purpose:** Central coordinator routing requests to specialist agents

| Capability | Description |
|------------|-------------|
| ORC_INTENT | Classify user intent and determine routing |
| ORC_GATE_VALIDATE | Validate gate completion before advancement |
| ORC_SESSION_MANAGE | Manage session state across interactions |
| ORC_CONTEXT_PRESERVE | Maintain context for multi-turn conversations |

**Routing Matrix:**
- Strategic frameworks, prioritization → CST
- Change management, stakeholders → CHG
- Budget projections, financial analysis → ANL
- Audience segments, targeting → AUD
- Channel mix, allocation → CHA
- Programmatic, fees → SPO
- Documents, exports → DOC
- Campaign performance → PRF

---

## ANL - Analytics Agent

**Purpose:** Projections, forecasting, statistical analysis, financial calculations

### MPA Capabilities
| Capability | Description | Implementation |
|------------|-------------|----------------|
| ANL_PROJECTION | Budget projections and forecasting | AI Builder |
| ANL_SCENARIO | Scenario comparison and modeling | AI Builder + Azure |
| ANL_MARGINAL_RETURN | Diminishing returns analysis | Azure Function |
| ANL_BAYESIAN | Bayesian inference for uncertainty | Azure Function |
| ANL_CAUSAL | Causal inference analysis | AI Builder |
| ANL_INCREMENTALITY | Incrementality measurement | AI Builder |

### CA Financial Capabilities (v6.0 Extension)
| Capability | Description | Implementation |
|------------|-------------|----------------|
| ANL_NPV | Net present value with sensitivity | AI Builder + Azure |
| ANL_IRR | Internal rate of return, MIRR, payback | AI Builder + Azure |
| ANL_TCO | Total cost of ownership | AI Builder |
| ANL_MONTECARLO | Monte Carlo simulation | Azure Function |
| ANL_SENSITIVITY | Tornado/spider sensitivity analysis | AI Builder + Azure |
| ANL_PAYBACK | Payback period and break-even | AI Builder |

**Note:** Azure Functions available in Personal environment only. Mastercard uses AI Builder fallback.

---

## AUD - Audience Agent

**Purpose:** Segmentation, targeting, customer value analysis

| Capability | Description |
|------------|-------------|
| AUD_SEGMENT_PRIORITY | Prioritize audience segments by value |
| AUD_LTV_ASSESS | Customer lifetime value assessment |
| AUD_JOURNEY_STATE | Customer journey state analysis |
| AUD_PROPENSITY | Propensity scoring for targeting |
| AUD_PERSONA | Persona development and profiling |
| AUD_TARGETING | Targeting strategy recommendations |

---

## CHA - Channel Agent

**Purpose:** Media mix, channel selection, budget allocation

| Capability | Description |
|------------|-------------|
| CHA_CHANNEL_MIX | Optimal channel mix recommendations |
| CHA_CHANNEL_SELECT | Channel selection for objectives |
| CHA_ALLOCATION | Budget allocation across channels |
| CHA_BENCHMARK | Channel benchmark comparisons |
| CHA_FREQUENCY | Frequency and reach optimization |

---

## SPO - Supply Path Agent

**Purpose:** Programmatic optimization, fee analysis, partner selection

| Capability | Description |
|------------|-------------|
| SPO_FEE_WATERFALL | Fee waterfall analysis |
| SPO_PARTNER_SCORE | Partner/vendor scoring |
| SPO_NBI | Net buying index calculation |
| SPO_PATH_OPTIMIZE | Supply path optimization |

---

## DOC - Document Agent

**Purpose:** Document generation, exports, presentations

### MPA Capabilities
| Capability | Description |
|------------|-------------|
| DOC_GENERATE | Generate media plan documents |
| DOC_TEMPLATE_SELECT | Select appropriate templates |
| DOC_EXPORT | Export in various formats |
| DOC_EXECUTIVE_SUMMARY | Generate executive summaries |

### CA Capabilities (v6.0 Extension)
| Capability | Description |
|------------|-------------|
| DOC_BUSINESSCASE | Generate business case documents |
| DOC_ROADMAP | Generate implementation roadmaps |

---

## PRF - Performance Agent

**Purpose:** Campaign optimization, post-mortem analysis

| Capability | Description |
|------------|-------------|
| PRF_ANOMALY | Anomaly detection in performance |
| PRF_ATTRIBUTION | Attribution analysis |
| PRF_INCREMENTALITY | Campaign incrementality measurement |
| PRF_OPTIMIZE | Optimization recommendations |
| PRF_POSTMORTEM | Post-campaign analysis |

---

## CST - Consulting Strategy Agent (NEW in v6.0)

**Purpose:** Strategic consulting methodology, framework selection, prioritization

| Capability | Description | Implementation |
|------------|-------------|----------------|
| CST_FRAMEWORK_SELECT | Recommend consulting frameworks | AI Builder |
| CST_ENGAGEMENT_GUIDE | Guide through consulting phases | AI Builder |
| CST_STRATEGIC_ANALYZE | Apply strategic frameworks (SWOT, Porter, etc.) | AI Builder |
| CST_PRIORITIZE | Prioritize using RICE, MoSCoW, Weighted Matrix | AI Builder |

**Framework Library:** 60 frameworks in ca_framework table across 9 categories

**Routes To:**
- ANL for financial calculations
- DOC for document generation
- CHG for change management

---

## CHG - Change Management Agent (NEW in v6.0)

**Purpose:** Organizational change methodology, stakeholder analysis, adoption planning

| Capability | Description | Implementation |
|------------|-------------|----------------|
| CHG_READINESS | Assess organizational change readiness | AI Builder |
| CHG_STAKEHOLDER | Map stakeholders using Power/Interest grid | AI Builder |
| CHG_ADOPTION | Create adoption and rollout plans | AI Builder |

**Methodologies:** Kotter 8-Step, ADKAR, Lewin, Bridges, McKinsey 7-S

**Routes To:**
- CST for framework selection
- ANL for financial impact
- DOC for change communications

---

## Cross-Agent Workflows

### Business Case Generation
```
User Request → ORC → CST (framework) → ANL (financials) → DOC (document)
```

### Transformation Roadmap
```
User Request → ORC → CST (assessment) → CHG (change plan) → DOC (roadmap)
```

### Media Plan Creation
```
User Request → ORC → AUD (audience) → CHA (channels) → ANL (projections) → DOC (plan)
```

### Campaign Optimization
```
User Request → ORC → PRF (analysis) → ANL (projections) → CHA (reallocation)
```

---

## Implementation Types

| Type | Description | Availability |
|------|-------------|--------------|
| AI_BUILDER_PROMPT | GPT-4 custom prompts in AI Builder | Both environments |
| AZURE_FUNCTION | Python/Node functions in Azure | Personal only |
| POWER_FX | Power Fx formulas | Both environments |
| FLOW | Power Automate flows | Both environments |

**Fallback Pattern:** Azure Functions have AI Builder fallbacks for Mastercard compatibility.

---

## Environment Differences

| Feature | Personal (Aragorn AI) | Mastercard |
|---------|----------------------|------------|
| Azure Functions | ✓ Available | ✗ DLP Blocked |
| HTTP Connectors | ✓ Available | ✗ DLP Blocked |
| AI Builder | ✓ Available | ✓ Available |
| Dataverse | ✓ Available | ✓ Available |
| SharePoint KB | ✓ Available | ✓ Available |

---

## Quick Reference - When to Route Where

| User Says... | Route To |
|--------------|----------|
| "SWOT analysis", "Porter", "framework" | CST |
| "prioritize", "RICE", "MoSCoW" | CST |
| "change readiness", "stakeholder map" | CHG |
| "adoption plan", "rollout strategy" | CHG |
| "NPV", "IRR", "ROI calculation" | ANL |
| "forecast", "projection", "scenario" | ANL |
| "audience", "segment", "persona" | AUD |
| "channel mix", "budget allocation" | CHA |
| "programmatic", "DSP", "fees" | SPO |
| "generate document", "create report" | DOC |
| "campaign performance", "optimization" | PRF |

---

**Document Version:** 1.0
**Platform Version:** KDAP v6.0
**Last Updated:** January 2026
