# Multi-Agent Copilot Studio Deployment Checklist

**Version:** 1.0.0
**Date:** January 2026
**Branch:** feature/multi-agent-architecture

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
7. **DOC** (Document) - Deploy last, requires Azure Functions

---

## 1. ORC (Orchestrator) Agent

### 1.1 Create Agent

1. Open Copilot Studio
2. Click "Create" > "New Agent"
3. Name: `Media Planning Orchestrator`
4. Description: `Routes media planning requests to specialist agents`
5. Agent Code: `ORC`

### 1.2 Configure Instructions

1. Navigate to agent settings > Instructions
2. Open file: `release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt`
3. Copy entire content (7,999 characters)
4. Paste into Instructions field
5. Click Save

### 1.3 Upload Knowledge Base

Upload the following files to agent knowledge base:

| File | Size | Description |
|------|------|-------------|
| `ORC_KB_Workflow_Gates_v1.txt` | ~12KB | 10-step workflow and 5 gates |
| `ORC_KB_Error_Handling_v1.txt` | ~10KB | Error codes and recovery |

**Steps:**
1. Go to Knowledge Base tab
2. Click "Add knowledge source" > "Upload files"
3. Upload each file
4. Wait for indexing (1-2 minutes per file)
5. Verify status shows "Ready"

### 1.4 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| RouteToSpecialist | Main routing logic |
| GetSessionState | Retrieve session context |
| UpdateProgress | Update workflow step/gate |

**Steps:**
1. Go to Actions tab
2. Click "Add action" > "Power Automate"
3. Select or create each flow
4. Configure input/output mappings
5. Test each flow individually

### 1.5 Validation

- [ ] Instructions saved without error
- [ ] Both KB files indexed and ready
- [ ] All 3 flows connected and tested
- [ ] Test routing: "Help me create a media plan" (should acknowledge and begin workflow)

---

## 2. ANL (Analytics & Forecasting) Agent

### 2.1 Create Agent

1. Name: `Analytics and Forecasting Agent`
2. Description: `Provides projections, scenarios, and forecasting`
3. Agent Code: `ANL`

### 2.2 Configure Instructions

1. Open file: `release/v6.0/agents/anl/instructions/ANL_Copilot_Instructions_v1.txt`
2. Copy content (7,797 characters)
3. Paste into Instructions field

### 2.3 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `ANL_KB_Analytics_Engine_v1.txt` | ~36KB | RFM, LTV, decile analysis |
| `ANL_KB_Projection_Methods_v1.txt` | ~14KB | Projection methodologies |
| `ANL_KB_Scenario_Modeling_v1.txt` | ~12KB | Scenario comparison |
| `ANL_KB_Statistical_Tests_v1.txt` | ~10KB | Statistical methods |

### 2.4 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| CalculateProjection | Media performance projections |
| RunScenario | Multi-scenario comparison |

### 2.5 Validation

- [ ] Test: "Project results for a $500K budget over 12 weeks"
- [ ] Test: "Compare conservative vs aggressive budget scenarios"
- [ ] Verify confidence intervals included in responses

---

## 3. AUD (Audience Intelligence) Agent

### 3.1 Create Agent

1. Name: `Audience Intelligence Agent`
2. Description: `Handles segmentation, targeting, and LTV analysis`
3. Agent Code: `AUD`

### 3.2 Configure Instructions

1. Open file: `release/v6.0/agents/aud/instructions/AUD_Copilot_Instructions_v1.txt`
2. Copy content (4,881 characters)
3. Paste into Instructions field

### 3.3 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `AUD_KB_Segmentation_Methods_v1.txt` | ~14KB | RFM, behavioral, demographic |
| `AUD_KB_LTV_Models_v1.txt` | ~12KB | Lifetime value calculations |
| `AUD_KB_Targeting_Strategy_v1.txt` | ~11KB | Targeting approaches |

### 3.4 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| SegmentAudience | Audience segmentation |
| CalculateLTV | Customer lifetime value |

### 3.5 Validation

- [ ] Test: "Segment our customers using RFM analysis"
- [ ] Test: "Calculate LTV for our top segments"
- [ ] Verify segment sizes and priorities in responses

---

## 4. CHA (Channel Strategy) Agent

### 4.1 Create Agent

1. Name: `Channel Strategy Agent`
2. Description: `Manages channel selection and budget allocation`
3. Agent Code: `CHA`

### 4.2 Configure Instructions

1. Open file: `release/v6.0/agents/cha/instructions/CHA_Copilot_Instructions_v1.txt`
2. Copy content (7,187 characters)
3. Paste into Instructions field

### 4.3 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `CHA_KB_Channel_Registry_v1.txt` | ~13KB | Channel definitions |
| `CHA_KB_Channel_Playbooks_v1.txt` | ~10KB | Channel strategies |
| `CHA_KB_Allocation_Methods_v1.txt` | ~10KB | Budget allocation |

### 4.4 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| CalculateAllocation | Budget allocation |
| LookupBenchmarks | Performance benchmarks |

### 4.5 Validation

- [ ] Test: "Allocate $500K across Meta, Google, and YouTube"
- [ ] Test: "What are the benchmarks for e-commerce on Meta?"
- [ ] Verify allocation percentages sum to 100%

---

## 5. SPO (Supply Path Optimization) Agent

### 5.1 Create Agent

1. Name: `Supply Path Optimization Agent`
2. Description: `Optimizes programmatic supply paths and fees`
3. Agent Code: `SPO`

### 5.2 Configure Instructions

1. Open file: `release/v6.0/agents/spo/instructions/SPO_Copilot_Instructions_v1.txt`
2. Copy content (5,364 characters)
3. Paste into Instructions field

### 5.3 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `SPO_KB_Fee_Analysis_v1.txt` | ~12KB | Fee stack breakdown |
| `SPO_KB_Partner_Evaluation_v1.txt` | ~13KB | Partner scoring |
| `SPO_KB_NBI_Calculation_v1.txt` | ~11KB | Net Benefit Index |

### 5.4 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| CalculateNBI | Net Benefit Index |
| AnalyzeFees | Fee stack analysis |
| EvaluatePartner | Partner evaluation |

### 5.5 Validation

- [ ] Test: "Analyze our fee stack - we're at 42% working media"
- [ ] Test: "Calculate NBI for switching from open exchange to PMP"
- [ ] Verify NBI formula correctly applied

---

## 6. PRF (Performance Intelligence) Agent

### 6.1 Create Agent

1. Name: `Performance Intelligence Agent`
2. Description: `Monitors performance and extracts learnings`
3. Agent Code: `PRF`

### 6.2 Configure Instructions

1. Open file: `release/v6.0/agents/prf/instructions/PRF_Copilot_Instructions_v1.txt`
2. Copy content (6,436 characters)
3. Paste into Instructions field

### 6.3 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `PRF_KB_Optimization_Triggers_v1.txt` | ~14KB | Threshold triggers |
| `PRF_KB_Anomaly_Detection_v1.txt` | ~13KB | Statistical detection |
| `PRF_KB_Learning_Extraction_v1.txt` | ~13KB | Learning catalog |

### 6.4 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| AnalyzePerformance | Variance analysis |
| DetectAnomalies | Anomaly detection |
| ExtractLearnings | Learning extraction |

### 6.5 Validation

- [ ] Test: "Our CPA is 25% above target - what should we do?"
- [ ] Test: "CTR dropped from 0.15% to 0.08% - is this an anomaly?"
- [ ] Verify severity levels (GREEN/YELLOW/ORANGE/RED) in responses

---

## 7. DOC (Document Generation) Agent

### 7.1 Create Agent

1. Name: `Document Generation Agent`
2. Description: `Generates media plans, presentations, and reports`
3. Agent Code: `DOC`

### 7.2 Configure Instructions

1. Open file: `release/v6.0/agents/doc/instructions/DOC_Copilot_Instructions_v1.txt`
2. Copy content (4,268 characters)
3. Paste into Instructions field

### 7.3 Upload Knowledge Base

| File | Size | Description |
|------|------|-------------|
| `DOC_KB_Template_Library_v1.txt` | ~12KB | Document templates |
| `DOC_KB_Formatting_Rules_v1.txt` | ~8KB | Formatting standards |
| `DOC_KB_Export_Specifications_v1.txt` | ~7KB | Export formats |

### 7.4 Deploy Azure Functions

**Prerequisites:**
- Azure Functions Core Tools installed
- Node.js 18+ installed

**Deployment Steps:**

```bash
cd release/v6.0/agents/doc/functions/document-generator
npm install docx
func azure functionapp publish <YOUR_FUNCTION_APP_NAME>

cd ../presentation-generator
npm install pptxgenjs
func azure functionapp publish <YOUR_FUNCTION_APP_NAME>
```

### 7.5 Connect Power Automate Flows

| Flow Name | Purpose |
|-----------|---------|
| GenerateDocument | Document orchestration |

**Flow Configuration:**
- Set `DOC_AZURE_FUNCTION_URL` environment variable
- Configure SharePoint connection for document storage

### 7.6 Validation

- [ ] Azure Functions deployed and responding
- [ ] Test: "Generate the full media plan document"
- [ ] Test: "Create a PowerPoint presentation for the client"
- [ ] Verify documents download correctly

---

## Post-Deployment Integration Testing

### Cross-Agent Routing Tests

| Test | Input | Expected Agent |
|------|-------|----------------|
| 1 | "Help me create a media plan" | ORC |
| 2 | "Project results for $500K" | ANL |
| 3 | "Segment our audience using RFM" | AUD |
| 4 | "Allocate budget across channels" | CHA |
| 5 | "Analyze our fee stack" | SPO |
| 6 | "Generate the plan document" | DOC |
| 7 | "Our CPA is above target" | PRF |

### End-to-End Workflow Test

1. Start new session with ORC
2. Complete Steps 1-2 (objectives, audience) - should route to AUD
3. Complete Steps 3-5 (channels, allocation) - should route to CHA
4. Request projections - should route to ANL
5. Request document - should route to DOC
6. Verify document generated with all sections

### Performance Benchmarks

| Metric | Target | Acceptable |
|--------|--------|------------|
| ORC routing decision | < 1s | < 2s |
| Specialist response | < 3s | < 5s |
| Document generation | < 10s | < 15s |
| Full workflow (10 steps) | < 3min | < 5min |

---

## Rollback Procedure

If issues are encountered:

1. **Immediate:** Disable multi-agent feature flag
2. **Within 1 hour:** Revert to monolithic MPA
3. **Document:** Log all issues in GitHub issue tracker

### Feature Flag Commands

```
# Disable multi-agent routing
Set-FeatureFlag -Name "multi_agent_enabled" -Value $false

# Revert to monolithic
Set-FeatureFlag -Name "use_mpa_v55" -Value $true
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| Product Owner | | | |

---

## Appendix: File Locations

| Agent | Instructions Path | KB Path |
|-------|-------------------|---------|
| ORC | `release/v6.0/agents/orc/instructions/` | `release/v6.0/agents/orc/kb/` |
| ANL | `release/v6.0/agents/anl/instructions/` | `release/v6.0/agents/anl/kb/` |
| AUD | `release/v6.0/agents/aud/instructions/` | `release/v6.0/agents/aud/kb/` |
| CHA | `release/v6.0/agents/cha/instructions/` | `release/v6.0/agents/cha/kb/` |
| SPO | `release/v6.0/agents/spo/instructions/` | `release/v6.0/agents/spo/kb/` |
| DOC | `release/v6.0/agents/doc/instructions/` | `release/v6.0/agents/doc/kb/` |
| PRF | `release/v6.0/agents/prf/instructions/` | `release/v6.0/agents/prf/kb/` |
