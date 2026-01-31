# Multi-Agent Copilot Studio Deployment Checklist

**Version:** 3.0.0
**Date:** January 31, 2026
**Branch:** deploy/mastercard
**Platform Version:** v7.0 (GHA Integration)

---

## CRITICAL: Agent AI Configuration Settings

**These settings must be configured for EVERY agent before publishing.**

### Complete Agent Settings Matrix

| Agent | Model | Web Search | General Knowledge | Deep Reasoning | Moderation |
|-------|-------|------------|-------------------|----------------|------------|
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
| **GHA** | Claude Opus 4.5 | ON | OFF | ON | Medium |

### Settings Location in Copilot Studio UI

| Setting | Location |
|---------|----------|
| Model | Settings → AI capabilities |
| Web Search | Overview tab toggle OR Settings → Knowledge → "Use information from web" |
| General Knowledge | Settings → Knowledge → "Use general knowledge" |
| Deep Reasoning | Settings → AI capabilities |
| Content Moderation | Settings → AI capabilities |

### CRITICAL RULES

1. **General Knowledge = OFF for ALL agents** - Prevents unvalidated "general industry knowledge" responses
2. **Web Search = Selective** - Only ON for agents needing current market data
3. **Deep Reasoning = Selective** - Only ON for complex analytical agents (ANL, SPO, PRF)

---

## Pre-Deployment Requirements

- [ ] Access to Copilot Studio environment
- [ ] Power Automate premium license for flows
- [ ] Azure subscription for DOC agent functions
- [ ] SharePoint site configured for document storage
- [ ] Dataverse tables created (eap_session, eap_agent, eap_audit)

---

## Agent Deployment Order

Deploy agents in this order to ensure dependencies are met:

1. **ORC** (Orchestrator) - Deploy first, handles routing
2. **ANL** (Analytics) - No dependencies
3. **AUD** (Audience) - No dependencies
4. **CHA** (Channel) - No dependencies
5. **SPO** (Supply Path) - No dependencies
6. **PRF** (Performance) - No dependencies
7. **DOC** (Document) - Requires Azure Functions
8. **CHG** (Change Management) - No dependencies
9. **CST** (Customer Strategy) - No dependencies
10. **MKT** (Marketing) - No dependencies
11. **GHA** (Growth Hacking) - v7.0 NEW, requires ORC routing updates

---

## 1. ORC (Orchestrator) Agent

### 1.1 Create Agent

1. Open Copilot Studio
2. Click "Create" > "New Agent"
3. Name: `Media Planning Orchestrator`
4. Description: `Routes media planning requests to specialist agents`
5. Agent Code: `ORC`

### 1.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Sonnet 4.5** |
| Web Search | **OFF** |
| General Knowledge | **OFF** |
| Deep Reasoning | **OFF** |
| Content Moderation | **Medium** |
| Generative AI Orchestration | **ON (Dynamic)** |

### 1.3 Configure Instructions

1. Navigate to agent settings → Instructions
2. Open file: `release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v3_CORRECTED.txt`
3. Copy entire content (6,157 characters)
4. Paste into Instructions field
5. Click Save

### 1.4 Upload Knowledge Base

Upload the following files to agent knowledge base:

| File | Size | Description |
|------|------|-------------|
| `ORC_KB_Workflow_Gates_v1.txt` | ~12KB | 10-step workflow and 5 gates |
| `ORC_KB_Error_Handling_v1.txt` | ~10KB | Error codes and recovery |

### 1.5 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| RouteToSpecialist | Main routing logic |
| GetSessionState | Retrieve session context |
| UpdateProgress | Update workflow step/gate |

### 1.6 Validation Checklist

- [ ] AI settings configured per table above
- [ ] Instructions saved without error (v3_CORRECTED)
- [ ] Both KB files indexed and ready
- [ ] All 3 flows connected and tested
- [ ] Test: "Help me create a media plan" → Should ask clarifying questions, NOT auto-route

---

## 2. AUD (Audience Intelligence) Agent

### 2.1 Create Agent

1. Name: `Audience Intelligence Agent`
2. Description: `Handles segmentation, targeting, and LTV analysis`
3. Agent Code: `AUD`

### 2.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Sonnet 4.5** |
| Web Search | **ON** |
| General Knowledge | **OFF** |
| Deep Reasoning | **OFF** |
| Content Moderation | **Medium** |

### 2.3 Configure Instructions

1. Open file: `release/v6.0/agents/aud/instructions/AUD_Copilot_Instructions_v2_CORRECTED.txt`
2. Copy content (6,767 characters)
3. Paste into Instructions field

### 2.4 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `AUD_KB_Segmentation_Methods_v1.txt` | ~14KB | RFM, behavioral, demographic |
| `AUD_KB_LTV_Models_v1.txt` | ~12KB | Lifetime value calculations |
| `AUD_KB_Targeting_Strategy_v1.txt` | ~11KB | Targeting approaches |

### 2.5 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| SegmentAudience | Audience segmentation |
| CalculateLTV | Customer lifetime value |

### 2.6 Validation Checklist

- [ ] AI settings configured per table above
- [ ] Instructions saved (v2_CORRECTED)
- [ ] Response under 400 words, prose only, no bullets
- [ ] Test: "Segment our customers using RFM analysis"

---

## 3. CHA (Channel Strategy) Agent

### 3.1 Create Agent

1. Name: `Channel Strategy Agent`
2. Description: `Manages channel selection and budget allocation`
3. Agent Code: `CHA`

### 3.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Sonnet 4.5** |
| Web Search | **ON** |
| General Knowledge | **OFF** |
| Deep Reasoning | **OFF** |
| Content Moderation | **Medium** |

### 3.3 Configure Instructions

1. Open file: `release/v6.0/agents/cha/instructions/CHA_Copilot_Instructions_v1.txt`
2. Copy content
3. Paste into Instructions field

### 3.4 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `CHA_KB_Channel_Registry_v1.txt` | ~13KB | Channel definitions |
| `CHA_KB_Channel_Playbooks_v1.txt` | ~10KB | Channel strategies |
| `CHA_KB_Allocation_Methods_v1.txt` | ~10KB | Budget allocation |

### 3.5 Validation Checklist

- [ ] AI settings configured per table above
- [ ] Test: "Allocate $500K across Meta, Google, and YouTube"

---

## 4. ANL (Analytics & Forecasting) Agent

### 4.1 Create Agent

1. Name: `Analytics and Forecasting Agent`
2. Description: `Provides projections, scenarios, and forecasting`
3. Agent Code: `ANL`

### 4.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Opus 4.5** |
| Web Search | **OFF** |
| General Knowledge | **OFF** |
| Deep Reasoning | **ON** |
| Content Moderation | **Medium** |

### 4.3 Configure Instructions

1. Open file: `release/v6.0/agents/anl/instructions/ANL_Copilot_Instructions_v1.txt`
2. Copy content
3. Paste into Instructions field

### 4.4 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `ANL_KB_Analytics_Engine_v1.txt` | ~36KB | RFM, LTV, decile analysis |
| `ANL_KB_Projection_Methods_v1.txt` | ~14KB | Projection methodologies |
| `ANL_KB_Scenario_Modeling_v1.txt` | ~12KB | Scenario comparison |
| `ANL_KB_Statistical_Tests_v1.txt` | ~10KB | Statistical methods |

### 4.5 Validation Checklist

- [ ] AI settings configured per table above (note: Deep Reasoning ON)
- [ ] Test: "Project results for a $500K budget over 12 weeks"

---

## 5. SPO (Supply Path Optimization) Agent

### 5.1 Create Agent

1. Name: `Supply Path Optimization Agent`
2. Description: `Optimizes programmatic supply paths and fees`
3. Agent Code: `SPO`

### 5.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Opus 4.5** |
| Web Search | **ON** |
| General Knowledge | **OFF** |
| Deep Reasoning | **ON** |
| Content Moderation | **Medium** |

### 5.3 Configure Instructions

1. Open file: `release/v6.0/agents/spo/instructions/SPO_Copilot_Instructions_v1.txt`
2. Copy content
3. Paste into Instructions field

### 5.4 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `SPO_KB_Fee_Analysis_v1.txt` | ~12KB | Fee stack breakdown |
| `SPO_KB_Partner_Evaluation_v1.txt` | ~13KB | Partner scoring |
| `SPO_KB_NBI_Calculation_v1.txt` | ~11KB | Net Benefit Index |

### 5.5 Validation Checklist

- [ ] AI settings configured per table above (note: Deep Reasoning ON)
- [ ] Test: "Analyze our fee stack - we're at 42% working media"

---

## 6. PRF (Performance Intelligence) Agent

### 6.1 Create Agent

1. Name: `Performance Intelligence Agent`
2. Description: `Monitors performance and extracts learnings`
3. Agent Code: `PRF`

### 6.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Opus 4.5** |
| Web Search | **ON** |
| General Knowledge | **OFF** |
| Deep Reasoning | **ON** |
| Content Moderation | **Medium** |

### 6.3 Configure Instructions

1. Open file: `release/v6.0/agents/prf/instructions/PRF_Copilot_Instructions_v1.txt`
2. Copy content
3. Paste into Instructions field

### 6.4 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `PRF_KB_Optimization_Triggers_v1.txt` | ~14KB | Threshold triggers |
| `PRF_KB_Anomaly_Detection_v1.txt` | ~13KB | Statistical detection |

### 6.5 Validation Checklist

- [ ] AI settings configured per table above (note: Deep Reasoning ON)
- [ ] Test: "Analyze performance trends for the last 4 weeks"

---

## 7. DOC (Document Generation) Agent

### 7.1 Create Agent

1. Name: `Document Generation Agent`
2. Description: `Generates media briefs and reports`
3. Agent Code: `DOC`

### 7.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Sonnet 4.5** |
| Web Search | **OFF** |
| General Knowledge | **OFF** |
| Deep Reasoning | **OFF** |
| Content Moderation | **Medium** |

### 7.3 Configure Instructions

1. Open file: `release/v6.0/agents/doc/instructions/DOC_Copilot_Instructions_v1.txt`
2. Copy content
3. Paste into Instructions field

### 7.4 Validation Checklist

- [ ] AI settings configured per table above
- [ ] Azure Functions deployed and connected
- [ ] Test: "Generate a media brief for our current plan"

---

## 8. CHG (Change Management) Agent

### 8.1 Create Agent

1. Name: `Change Management Agent`
2. Description: `Manages adoption planning and change initiatives`
3. Agent Code: `CHG`

### 8.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Sonnet 4.5** |
| Web Search | **OFF** |
| General Knowledge | **OFF** |
| Deep Reasoning | **OFF** |
| Content Moderation | **Medium** |

### 8.3 Validation Checklist

- [ ] AI settings configured per table above

---

## 9. CST (Customer Strategy) Agent

### 9.1 Create Agent

1. Name: `Customer Strategy Agent`
2. Description: `Provides strategic customer guidance`
3. Agent Code: `CST`

### 9.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Sonnet 4.5** |
| Web Search | **OFF** |
| General Knowledge | **OFF** |
| Deep Reasoning | **OFF** |
| Content Moderation | **Medium** |

### 9.3 Validation Checklist

- [ ] AI settings configured per table above

---

## 10. MKT (Marketing) Agent

### 10.1 Create Agent

1. Name: `Marketing Agent`
2. Description: `Provides marketing recommendations and guidance`
3. Agent Code: `MKT`

### 10.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Sonnet 4.5** |
| Web Search | **ON** |
| General Knowledge | **OFF** |
| Deep Reasoning | **OFF** |
| Content Moderation | **Medium** |

### 10.3 Validation Checklist

- [ ] AI settings configured per table above

---

## 11. GHA (Growth Hacking Agent) - v7.0 NEW

### 11.1 Create Agent

1. Name: `Growth Hacking Agent`
2. Description: `Growth strategy orchestration with AARRR lifecycle optimization`
3. Agent Code: `GHA`

### 11.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Opus 4.5** |
| Web Search | **ON** |
| General Knowledge | **OFF** |
| Deep Reasoning | **ON** |
| Content Moderation | **Medium** |

### 11.3 Configure Instructions

1. Open file: `release/v7.0/agents/gha/instructions/01_CoPilot_Core_Instructions_V3_6_REVISED.txt`
2. Copy content
3. Paste into Instructions field

### 11.4 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `GHA_KB_Growth_Core_v1.txt` | ~25KB | Core growth methodology, AARRR |
| `GHA_KB_Specialist_Requests_v1.txt` | ~15KB | Specialist coordination |
| `GHA_KB_Growth_Workflows_v1.txt` | ~18KB | Growth workflow definition |
| `GHA_KB_Behavioral_Psychology_v1.txt` | ~20KB | Hook Model, Fogg Model |
| `GHA_KB_Fintech_Growth_v1.txt` | ~22KB | Fintech/neobank strategies |
| `GHA_KB_Experiment_Design_v1.txt` | ~18KB | A/B testing, cohort analysis |
| `GHA_KB_Growth_Metrics_v1.txt` | ~15KB | North Star metrics, KPIs |
| `GHA_KB_Referral_Programs_v1.txt` | ~18KB | Viral mechanics, referral design |
| `GHA_KB_Lifecycle_Tactics_v1.txt` | ~20KB | Stage-specific tactics |
| `GHA_KB_Competitor_Analysis_v1.txt` | ~15KB | Competitive intelligence |

### 11.5 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| GetGrowthState | Retrieve growth session state |
| UpdateGrowthProgress | Update growth workflow progress |
| RequestSpecialistViaORC | Request specialist assistance |

### 11.6 Validation Checklist

- [ ] AI settings configured per table above (note: Deep Reasoning ON, Model Opus 4.5)
- [ ] All 10 KB files uploaded and indexed
- [ ] All 3 GHA flows connected and tested
- [ ] Test: "Help me develop a growth strategy for a fintech app"
- [ ] Verify: Routes through ORC correctly, requests specialists as needed

---

## Post-Deployment Validation

### System Test

After all agents are deployed, test the complete workflow:

**Input:**
```
help me create a media plan for Nike. They have $250,000 to acquire new customers. They are targeting runners in the US
```

**Expected ORC Behavior:**
1. Response under 300 words
2. No bullet points - prose only
3. Asks clarifying questions (timeline, KPIs)
4. Does NOT auto-route to specialists without user confirmation
5. Ends with question inviting user input

### Red Flags (Test FAILS)

- ❌ Multi-agent execution plan created immediately
- ❌ 4,000+ word response with bullet points
- ❌ "Based on general industry knowledge" statements
- ❌ Character encoding artifacts (â€", â€™)
- ❌ No clarifying questions asked

---

## Document References

| Document | Purpose |
|----------|---------|
| `MPA_v6_Agent_Configuration_Reference.md` | Complete settings rationale |
| `MPA_v6_Manual_Deployment_Instructions.md` | Step-by-step manual tasks |
| `sanitize_kb_files.py` | KB encoding sanitization script |

---

**Document Version:** 3.0.0 (v7.0 GHA Integration)
**Last Updated:** January 31, 2026
