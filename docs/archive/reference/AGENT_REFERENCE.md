# KDAP Agent Reference Guide

## Overview

KDAP v6.0 includes 11 specialized AI agents, each with dedicated knowledge bases and capabilities.

---

## Agent Inventory

### ORC - Orchestrator Agent
**Role:** Routes user requests to the appropriate specialist agent.

| Attribute | Value |
|-----------|-------|
| Instruction File | `ORC_Copilot_Instructions_v1.txt` |
| KB Files | 4 |
| Capabilities | Intent classification, agent routing, session management |

**Routing Logic:**
- Calculations/projections → ANL
- Audience/segmentation → AUD
- Channel strategy → CHA
- Performance analysis → PRF
- Supply path → SPO
- Document generation → DOC
- Marketing strategy → MKT

---

### ANL - Analytics Agent
**Role:** Handles all calculations, projections, and statistical analysis.

| Attribute | Value |
|-----------|-------|
| Instruction File | `ANL_Copilot_Instructions_v1.txt` |
| KB Files | 19 (release) + 6 (base) |
| Capabilities | ROAS, CAC, LTV, MMM, incrementality, forecasting |

**Key Knowledge Bases:**
| File | Content |
|------|---------|
| `ANL_KB_Analytics_Engine_v1.txt` | Core formulas and calculations |
| `ANL_KB_MMM_Advanced_v1.txt` | Marketing Mix Modeling methodology |
| `ANL_KB_Incrementality_Methods_v1.txt` | Causal inference approaches |
| `ANL_KB_Scenario_Modeling_v1.txt` | What-if analysis patterns |
| `ANL_KB_ML_Budget_Optimization_v1.txt` | ML-powered allocation |
| `ANL_KB_ML_Forecasting_v1.txt` | Predictive modeling |

**Formula Reference:**
```
ROAS = (Revenue - Spend) / Spend
CAC = Total Marketing Spend / New Customers Acquired
LTV = (AOV × Purchase Frequency × Margin) / Churn Rate
Incremental Lift = (Test - Control) / Control
```

---

### AUD - Audience Agent
**Role:** Customer segmentation, targeting, and value modeling.

| Attribute | Value |
|-----------|-------|
| Instruction File | `AUD_Copilot_Instructions_v1.txt` |
| KB Files | 23 (release) + 6 (base) |
| Capabilities | RFM, segmentation, propensity, lookalike, LTV |

**Key Knowledge Bases:**
| File | Content |
|------|---------|
| `AUD_KB_Audience_Fundamentals_v1.txt` | Segmentation basics |
| `AUD_KB_Customer_Segmentation_v1.txt` | Advanced segmentation |
| `AUD_KB_Lifetime_Value_v1.txt` | LTV calculation methods |
| `AUD_KB_ML_Propensity_Scoring_v1.txt` | ML-powered propensity |
| `AUD_KB_ML_Lookalike_Modeling_v1.txt` | Audience expansion |
| `AUD_KB_Identity_Resolution_v1.txt` | Cross-device identity |

**Segmentation Methods:**
- RFM (Recency, Frequency, Monetary)
- Behavioral clustering
- Value-based tiers
- Lifecycle stages
- Propensity scores

---

### CHA - Channel Agent
**Role:** Channel strategy, allocation, and media mix optimization.

| Attribute | Value |
|-----------|-------|
| Instruction File | `CHA_Copilot_Instructions_v1.txt` |
| KB Files | 5 (base) |
| Capabilities | Channel selection, budget allocation, platform playbooks |

**Key Knowledge Bases:**
| File | Content |
|------|---------|
| `CHA_KB_Channel_Selection_v1.txt` | Channel recommendation logic |
| `CHA_KB_Digital_Playbooks_v1.txt` | Digital channel tactics |
| `CHA_KB_Traditional_Playbooks_v1.txt` | Traditional media tactics |
| `CHA_KB_Media_Mix_Tactics_v1.txt` | Mix optimization |
| `CHA_KB_Cross_Channel_Attribution_v1.txt` | Attribution methods |

**Supported Channels:**
- Digital: Search, Social, Display, Video, CTV
- Traditional: TV, Radio, OOH, Print
- Emerging: Retail Media, Audio Streaming, DOOH

---

### PRF - Performance Agent
**Role:** Campaign monitoring, optimization, and reporting.

| Attribute | Value |
|-----------|-------|
| Instruction File | `PRF_Copilot_Instructions_v1.txt` |
| KB Files | 6 (base) |
| Capabilities | Monitoring, anomaly detection, A/B testing, optimization |

**Key Knowledge Bases:**
| File | Content |
|------|---------|
| `PRF_KB_RealTime_Monitoring_v1.txt` | Alert frameworks |
| `PRF_KB_AB_Testing_v1.txt` | Statistical testing |
| `PRF_KB_Attribution_Modeling_v1.txt` | Attribution methods |
| `PRF_KB_ROI_Reporting_v1.txt` | Reporting templates |
| `PRF_KB_ML_Anomaly_Detection_v1.txt` | ML-powered alerts |
| `PRF_KB_ML_Performance_Optimization_v1.txt` | Auto-optimization |

---

### SPO - Supply Path Agent
**Role:** Supply path optimization and ad tech strategy.

| Attribute | Value |
|-----------|-------|
| Instruction File | `SPO_Copilot_Instructions_v1.txt` |
| KB Files | 6 |
| Capabilities | SPO analysis, DSP strategy, inventory quality |

**Key Knowledge Bases:**
| File | Content |
|------|---------|
| `SPO_KB_Supply_Path_Fundamentals_v1.txt` | SPO basics |
| `SPO_KB_DSP_Strategy_v1.txt` | DSP selection and setup |
| `SPO_KB_Inventory_Quality_v1.txt` | Quality assessment |

---

### DOC - Document Agent
**Role:** Media plan generation and presentation creation.

| Attribute | Value |
|-----------|-------|
| Instruction File | `DOC_Copilot_Instructions_v1.txt` |
| KB Files | 5 |
| Capabilities | Plan generation, PowerPoint, flowcharts |

**Output Formats:**
- Media Plan Document (Word)
- Executive Summary (PowerPoint)
- Channel Flowchart
- Budget Breakdown

---

### MKT - Marketing Agent
**Role:** Campaign strategy, creative briefs, and brand positioning.

| Attribute | Value |
|-----------|-------|
| Instruction File | `MKT_Copilot_Instructions_v1.txt` |
| KB Files | 6 (base) |
| Capabilities | Campaign strategy, creative briefs, competitive analysis |

**Key Knowledge Bases:**
| File | Content |
|------|---------|
| `MKT_KB_Campaign_Strategy_v1.txt` | Campaign planning |
| `MKT_KB_Creative_Briefs_v1.txt` | Brief templates |
| `MKT_KB_Brand_Positioning_v1.txt` | Brand strategy |
| `MKT_KB_GTM_Planning_v1.txt` | Go-to-market |
| `MKT_KB_Competitive_Analysis_v1.txt` | Competitive intel |

---

### CST - Consulting Strategy Agent
**Role:** Strategic frameworks and business analysis.

| Attribute | Value |
|-----------|-------|
| Instruction File | `CST_Copilot_Instructions_v1.txt` |
| KB Files | 4 (base) |
| Capabilities | SWOT, Porter's, BCG, business case |

**Key Knowledge Bases:**
| File | Content |
|------|---------|
| `CST_KB_Consulting_Core_v1.txt` | Framework fundamentals |
| `CST_KB_Strategic_Frameworks_v1.txt` | Analysis frameworks |
| `CST_KB_Prioritization_Methods_v1.txt` | Decision frameworks |
| `CST_KB_Industry_Context_v1.txt` | Industry patterns |

---

### CHG - Change Management Agent
**Role:** Transformation planning and stakeholder alignment.

| Attribute | Value |
|-----------|-------|
| Instruction File | `CHG_Copilot_Instructions_v1.txt` |
| KB Files | 3 (base) |
| Capabilities | Change planning, adoption, stakeholder management |

**Key Knowledge Bases:**
| File | Content |
|------|---------|
| `CHG_KB_Change_Core_v1.txt` | Change fundamentals |
| `CHG_KB_Adoption_Planning_v1.txt` | Adoption strategies |
| `CHG_KB_Stakeholder_Methods_v1.txt` | Stakeholder engagement |

---

## KB File Inventory Summary

| Agent | base/agents | release/v6.0 | Vertical Supplements |
|-------|-------------|--------------|----------------------|
| ORC | 4 | 4 | - |
| ANL | 6 | 19 | 4 |
| AUD | 6 | 23 | 4 |
| CHA | 5 | - | 4 |
| PRF | 6 | - | 4 |
| SPO | - | 6 | 4 |
| DOC | - | 5 | 4 |
| MKT | 6 | - | 4 |
| CST | 4 | - | - |
| CHG | 3 | - | - |
| **Total** | **40** | **57** | **28** |

---

## Vertical Overlays

Each vertical provides agent-specific guidance:

| Vertical | Agents Covered | Key Compliance |
|----------|----------------|----------------|
| Financial Services | All 7 | Fair lending, GLBA, FCRA |
| Healthcare | All 7 | HIPAA, PHI protection |
| B2B | All 7 | ABM, sales alignment |
| Retail | All 7 | Omnichannel, PCI |

**File Location:** `release/v6.0/verticals/agent_supplements/{vertical}/`

---

## 6-Rule Compliance

All KB files must follow:

1. **ALL-CAPS HEADERS** - Section headers in uppercase
2. **HYPHENS ONLY** - Lists use hyphens, not bullets
3. **ASCII ONLY** - No special characters or emoji
4. **ZERO VISUAL DEPENDENCIES** - No images or tables
5. **MANDATORY LANGUAGE** - Professional tone
6. **AGENT-READY** - Decision logic included

**Character Limits:**
- Copilot Instructions: 7,500-7,999 characters
- KB Files: Under 36,000 characters
- SharePoint: 7MB / 20 pages / 15K words

---

## File Locations

```
base/agents/{agent}/kb/          # Source KB files
release/v6.0/agents/{agent}/kb/  # Release KB files
release/v6.0/verticals/          # Vertical overlays
```
