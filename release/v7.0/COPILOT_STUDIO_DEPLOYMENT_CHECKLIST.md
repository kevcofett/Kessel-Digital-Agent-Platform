# Multi-Agent Copilot Studio Deployment Checklist

**Version:** 4.0.0
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
| **DOCS** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |

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
3. **Deep Reasoning = Selective** - Only ON for complex analytical agents (ANL, SPO, PRF, GHA)

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
12. **DOCS** (Documentation) - Optional, requires ORC routing updates

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
2. Open file: `release/v7.0/agents/orc/instructions/ORC_Copilot_Instructions_v7.0.txt`
3. Verify character count is within 7,500-7,999 limit
4. Copy entire content and paste into Instructions field
5. Click Save

### 1.4 Upload Knowledge Base

Upload the following files to agent knowledge base:

| File | Description |
|------|-------------|
| `ORC_KB_Workflow_Gates_v7.0.txt` | 10-step workflow and 5 gates |
| `ORC_KB_Error_Handling_v7.0.txt` | Error codes and recovery |
| `ORC_KB_Routing_Rules_v7.0.txt` | Agent routing logic |
| `ORC_KB_GHA_Integration_v7.0.txt` | Growth agent integration |
| `ORC_KB_Specialist_Requests_v7.0.txt` | Specialist request patterns |
| `ORC_KB_Proactive_Intelligence_v7.0.txt` | Proactive trigger thresholds |
| `ORC_KB_Learning_Extraction_v7.0.txt` | Learning loop patterns |

### 1.5 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| RouteToSpecialist | Main routing logic |
| GetSessionState | Retrieve session context |
| UpdateProgress | Update workflow step/gate |

### 1.6 Validation Checklist

- [ ] AI settings configured per table above
- [ ] Instructions saved without error (v7.0)
- [ ] All 7 KB files indexed and ready
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

1. Open file: `release/v7.0/agents/aud/instructions/AUD_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 2.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `AUD_KB_Segmentation_Methods_v7.0.txt` | RFM, behavioral, demographic |
| `AUD_KB_LTV_Models_v7.0.txt` | Lifetime value calculations |
| `AUD_KB_LTV_Prediction_v7.0.txt` | LTV prediction methods |
| `AUD_KB_Targeting_Strategy_v7.0.txt` | Targeting approaches |
| `AUD_KB_Lookalike_Strategy_v7.0.txt` | Lookalike modeling |
| `AUD_KB_Identity_Resolution_v7.0.txt` | Cross-device identity |
| `AUD_KB_Household_Resolution_v7.0.txt` | Household resolution |
| `AUD_KB_Privacy_Compliance_v7.0.txt` | Privacy frameworks |
| `AUD_KB_First_Party_Data_v7.0.txt` | First-party data strategy |
| `AUD_KB_Propensity_Modeling_v7.0.txt` | Propensity models |
| `AUD_KB_Behavioral_Scoring_v7.0.txt` | Behavioral scoring |
| `AUD_KB_RFM_Analysis_v7.0.txt` | RFM analysis |
| `AUD_KB_Cluster_Analysis_v7.0.txt` | Cluster analysis |
| `AUD_KB_GHA_Integration_v7.0.txt` | Growth agent integration |
| `AUD_KB_Error_Handling_v7.0.txt` | Error handling patterns |
| `AUD_KB_Learning_Extraction_v7.0.txt` | Learning extraction |
| `AUD_KB_Proactive_Intelligence_v7.0.txt` | Proactive triggers |
| `AUD_KB_Specialist_Requests_v7.0.txt` | Specialist coordination |

### 2.5 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| SegmentAudience | Audience segmentation |
| CalculateLTV | Customer lifetime value |

### 2.6 Validation Checklist

- [ ] AI settings configured per table above
- [ ] Instructions saved (v7.0)
- [ ] All KB files indexed
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

1. Open file: `release/v7.0/agents/cha/instructions/CHA_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 3.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `CHA_KB_Channel_Registry_v7.0.txt` | Channel definitions |
| `CHA_KB_Channel_Playbooks_v7.0.txt` | Channel strategies |
| `CHA_KB_Allocation_Methods_v7.0.txt` | Budget allocation |
| `CHA_KB_Response_Curves_v7.0.txt` | Response curve analysis |
| `CHA_KB_Google_Ads_Guide_v7.0.txt` | Google Ads platform guide |
| `CHA_KB_Meta_Ads_Guide_v7.0.txt` | Meta Ads platform guide |
| `CHA_KB_LinkedIn_B2B_Guide_v7.0.txt` | LinkedIn B2B guide |
| `CHA_KB_Emerging_Channels_v7.0.txt` | Emerging channels |
| `CHA_KB_Programmatic_DSP_Guide_v7.0.txt` | Programmatic DSP guide |
| `CHA_KB_Flighting_Optimization_v7.0.txt` | Flighting optimization |
| `CHA_KB_Cross_Channel_Frequency_v7.0.txt` | Cross-channel frequency |
| `CHA_KB_GHA_Integration_v7.0.txt` | Growth agent integration |
| `CHA_KB_Error_Handling_v7.0.txt` | Error handling |

### 3.5 Validation Checklist

- [ ] AI settings configured per table above
- [ ] All KB files indexed
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

1. Open file: `release/v7.0/agents/anl/instructions/ANL_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 4.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `ANL_KB_Projection_Methods_v7.0.txt` | Projection methodologies |
| `ANL_KB_Forecasting_Methods_v7.0.txt` | Forecasting methods |
| `ANL_KB_Statistical_Tests_v7.0.txt` | Statistical methods |
| `ANL_KB_Statistical_Significance_v7.0.txt` | Significance testing |
| `ANL_KB_Scenario_Modeling_v7.0.txt` | Scenario comparison |
| `ANL_KB_Sensitivity_Analysis_v7.0.txt` | Sensitivity analysis |
| `ANL_KB_MMM_Advanced_v7.0.txt` | Media Mix Modeling |
| `ANL_KB_MMM_Data_Requirements_v7.0.txt` | MMM data requirements |
| `ANL_KB_ML_Models_v7.0.txt` | Machine learning models |
| `ANL_KB_ML_Budget_Optimization_v7.0.txt` | ML budget optimization |
| `ANL_KB_GHA_Integration_v7.0.txt` | Growth agent integration |
| `ANL_KB_Error_Handling_v7.0.txt` | Error handling |
| `ANL_KB_Learning_Extraction_v7.0.txt` | Learning extraction |
| `ANL_KB_Proactive_Intelligence_v7.0.txt` | Proactive triggers |
| `ANL_KB_Specialist_Requests_v7.0.txt` | Specialist coordination |

### 4.5 Validation Checklist

- [ ] AI settings configured per table above (note: Deep Reasoning ON)
- [ ] All KB files indexed
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

1. Open file: `release/v7.0/agents/spo/instructions/SPO_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 5.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `SPO_KB_Fee_Analysis_v7.0.txt` | Fee stack breakdown |
| `SPO_KB_Partner_Evaluation_v7.0.txt` | Partner scoring |
| `SPO_KB_NBI_Calculation_v7.0.txt` | Net Benefit Index |
| `SPO_KB_Supply_Path_Mapping_v7.0.txt` | Supply path mapping |
| `SPO_KB_DSP_Comparison_v7.0.txt` | DSP comparison |
| `SPO_KB_SSP_Optimization_v7.0.txt` | SSP optimization |
| `SPO_KB_Transparency_Standards_v7.0.txt` | Transparency standards |
| `SPO_KB_GHA_Integration_v7.0.txt` | Growth agent integration |
| `SPO_KB_Error_Handling_v7.0.txt` | Error handling |
| `SPO_KB_Learning_Extraction_v7.0.txt` | Learning extraction |
| `SPO_KB_Proactive_Intelligence_v7.0.txt` | Proactive triggers |
| `SPO_KB_Specialist_Requests_v7.0.txt` | Specialist coordination |

### 5.5 Validation Checklist

- [ ] AI settings configured per table above (note: Deep Reasoning ON)
- [ ] All KB files indexed
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

1. Open file: `release/v7.0/agents/prf/instructions/PRF_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 6.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `PRF_KB_Optimization_Triggers_v7.0.txt` | Threshold triggers |
| `PRF_KB_Anomaly_Detection_v7.0.txt` | Statistical detection |
| `PRF_KB_Performance_Benchmarks_v7.0.txt` | Performance benchmarks |
| `PRF_KB_Attribution_Methods_v7.0.txt` | Attribution methods |
| `PRF_KB_Learning_Loop_v7.0.txt` | Learning loop patterns |
| `PRF_KB_GHA_Integration_v7.0.txt` | Growth agent integration |
| `PRF_KB_Error_Handling_v7.0.txt` | Error handling |
| `PRF_KB_Learning_Extraction_v7.0.txt` | Learning extraction |
| `PRF_KB_Proactive_Intelligence_v7.0.txt` | Proactive triggers |
| `PRF_KB_Specialist_Requests_v7.0.txt` | Specialist coordination |

### 6.5 Validation Checklist

- [ ] AI settings configured per table above (note: Deep Reasoning ON)
- [ ] All KB files indexed
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

1. Open file: `release/v7.0/agents/doc/instructions/DOC_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 7.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `DOC_KB_Template_Library_v7.0.txt` | Document templates |
| `DOC_KB_Consulting_Templates_v7.0.txt` | Consulting templates |
| `DOC_KB_Formatting_Rules_v7.0.txt` | Formatting rules |
| `DOC_KB_Visualization_Guide_v7.0.txt` | Visualization guide |
| `DOC_KB_Executive_Summaries_v7.0.txt` | Executive summaries |
| `DOC_KB_Document_Automation_v7.0.txt` | Document automation |
| `DOC_KB_Export_Specifications_v7.0.txt` | Export specifications |
| `DOC_KB_GHA_Integration_v7.0.txt` | Growth agent integration |
| `DOC_KB_Error_Handling_v7.0.txt` | Error handling |
| `DOC_KB_Learning_Extraction_v7.0.txt` | Learning extraction |
| `DOC_KB_Proactive_Intelligence_v7.0.txt` | Proactive triggers |
| `DOC_KB_Specialist_Requests_v7.0.txt` | Specialist coordination |

### 7.5 Validation Checklist

- [ ] AI settings configured per table above
- [ ] All KB files indexed
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

### 8.3 Configure Instructions

1. Open file: `release/v7.0/agents/chg/instructions/CHG_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 8.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `CHG_KB_Change_Frameworks_v7.0.txt` | Change management frameworks |
| `CHG_KB_Adoption_Patterns_v7.0.txt` | Adoption patterns |
| `CHG_KB_Stakeholder_Management_v7.0.txt` | Stakeholder management |

### 8.5 Validation Checklist

- [ ] AI settings configured per table above
- [ ] All KB files indexed

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

### 9.3 Configure Instructions

1. Open file: `release/v7.0/agents/cst/instructions/CST_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 9.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `CST_KB_Customer_Frameworks_v7.0.txt` | Customer strategy frameworks |
| `CST_KB_Journey_Mapping_v7.0.txt` | Customer journey mapping |
| `CST_KB_Value_Propositions_v7.0.txt` | Value proposition development |
| `CST_KB_Competitive_Analysis_v7.0.txt` | Competitive analysis |

### 9.5 Validation Checklist

- [ ] AI settings configured per table above
- [ ] All KB files indexed

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

### 10.3 Configure Instructions

1. Open file: `release/v7.0/agents/mkt/instructions/MKT_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 10.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `MKT_KB_Marketing_Frameworks_v7.0.txt` | Marketing frameworks |
| `MKT_KB_Campaign_Strategy_v7.0.txt` | Campaign strategy |
| `MKT_KB_Brand_Guidelines_v7.0.txt` | Brand guidelines |
| `MKT_KB_Content_Strategy_v7.0.txt` | Content strategy |
| `MKT_KB_Measurement_Framework_v7.0.txt` | Measurement framework |

### 10.5 Validation Checklist

- [ ] AI settings configured per table above
- [ ] All KB files indexed

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

1. Open file: `release/v7.0/agents/gha/instructions/GHA_Copilot_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 11.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `GHA_KB_Growth_Workflows_v7.0.txt` | 8-step workflow, 4 gates |
| `GHA_KB_Specialist_Requests_v7.0.txt` | Specialist coordination via ORC |
| `GHA_KB_Frameworks_v7.0.txt` | 32 growth frameworks (AARRR, Hook Model, etc.) |
| `GHA_KB_Behavioral_Psychology_v7.0.txt` | Psychological principles for growth tactics |
| `GHA_KB_Growth_Channels_v7.0.txt` | Growth channel taxonomy |
| `GHA_KB_Competitor_Benchmarks_v7.0.txt` | Benchmark data for growth metrics |
| `GHA_KB_Growth_KPIs_v7.0.txt` | KPI definitions |
| `GHA_KB_Fintech_Cases_v7.0.txt` | Credit card/fintech growth case studies |
| `GHA_KB_Growth_Architecture_v7.0.txt` | Growth architecture patterns |
| `GHA_KB_Campaign_Patterns_v7.0.txt` | Growth campaign structures |
| `GHA_KB_Error_Handling_v7.0.txt` | Error handling patterns |
| `GHA_KB_Learning_Extraction_v7.0.txt` | Learning extraction |
| `GHA_KB_Proactive_Intelligence_v7.0.txt` | Proactive triggers |

### 11.5 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| GetGrowthState | Retrieve growth session state |
| UpdateGrowthProgress | Update growth workflow progress |
| RequestSpecialistViaORC | Request specialist assistance |

### 11.6 Validation Checklist

- [ ] AI settings configured per table above (note: Deep Reasoning ON, Model Opus 4.5)
- [ ] All 13 KB files uploaded and indexed
- [ ] All 3 GHA flows connected and tested
- [ ] Test: "Help me develop a growth strategy for a fintech app"
- [ ] Verify: Routes through ORC correctly, requests specialists as needed

---

## 12. DOCS (Documentation Assistant) Agent - Optional

### 12.1 Create Agent

1. Name: `MCMAP Documentation Assistant`
2. Description: `Documentation navigation and platform architecture guidance`
3. Agent Code: `DOCS`

### 12.2 Configure AI Settings

| Setting | Value |
|---------|-------|
| Model | **Claude Sonnet 4.5** |
| Web Search | **OFF** |
| General Knowledge | **OFF** |
| Deep Reasoning | **OFF** |
| Content Moderation | **Medium** |

### 12.3 Configure Instructions

1. Open file: `release/v7.0/agents/docs/instructions/DOCS_Instructions_v7.0.txt`
2. Verify character count is within 7,500-7,999 limit
3. Copy content and paste into Instructions field

### 12.4 Upload Knowledge Base

| File | Description |
|------|-------------|
| `DOCS_KB_ABAC_Summary_v7.0.txt` | ABAC system quick reference |
| `DOCS_KB_Access_Control_Reference_v7.0.txt` | Access control implementation |

### 12.5 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| DOCS_Check_Content_Access | Verify user access to protected content |

### 12.6 Validation Checklist

- [ ] AI settings configured per table above
- [ ] All KB files indexed
- [ ] Flow connected and tested
- [ ] Test: "Show me the platform architecture" with different persona levels

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
| `MPA_v7_Agent_Configuration_Reference.md` | Complete settings rationale |
| `MPA_v7_Manual_Deployment_Instructions.md` | Step-by-step manual tasks |
| `sanitize_kb_files.py` | KB encoding sanitization script |

---

**Document Version:** 4.0.0 (v7.0 Full Compliance)
**Last Updated:** January 31, 2026
