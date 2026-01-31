# MASTERCARD COMPLETE DEPLOYMENT GUIDE

**Version:** 7.0.0.0
**Date:** January 31, 2026
**Environment:** Mastercard Power Platform
**Classification:** Mastercard Internal - Deployment Reference

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Prerequisites](#2-prerequisites)
3. [Environment Configuration](#3-environment-configuration)
4. [Phase 1: Solution Package Import](#4-phase-1-solution-package-import)
5. [Phase 2: Seed Data Import](#5-phase-2-seed-data-import)
6. [Phase 3: SharePoint Knowledge Base Upload](#6-phase-3-sharepoint-knowledge-base-upload)
7. [Phase 4: Copilot Studio Agent Configuration](#7-phase-4-copilot-studio-agent-configuration)
8. [Phase 5: Power Automate Flow Deployment](#8-phase-5-power-automate-flow-deployment)
9. [Phase 6: AI Builder Prompt Deployment](#9-phase-6-ai-builder-prompt-deployment)
10. [Phase 7: Integration Testing](#10-phase-7-integration-testing)
11. [Phase 8: Post-Deployment Validation](#11-phase-8-post-deployment-validation)
12. [Troubleshooting](#12-troubleshooting)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary

This document provides complete, step-by-step deployment instructions for KDAP v7.0 to the Mastercard Power Platform environment. v7.0 introduces the GHA (Growth Hacking Agent) as a Growth Strategy Orchestrator with multi-agent coordination capabilities.

### What's New in v7.0

- **GHA Agent**: Growth Strategy Orchestrator with AARRR lifecycle optimization
- **10 New AI Builder Prompts**: GHA-specific prompts for growth strategy
- **3 New Power Automate Flows**: GetGrowthState, UpdateGrowthProgress, RequestSpecialistViaORC
- **Cross-Domain Integration**: GHA coordinates with ANL, AUD, CHA, DOC specialists
- **Updated Agent Solutions**: AUD, CHA, DOC solutions updated with GHA integration descriptions

### Deployment Components Summary

| Component | Count | Description |
|-----------|-------|-------------|
| Dataverse Tables | 28+ | Platform and agent tables |
| Seed Data Files | 13+ | Configuration and reference data |
| Copilot Studio Agents | 11 | ORC, ANL, AUD, CHA, SPO, DOC, PRF, CHG, CST, MKT, GHA |
| Power Automate Flows | 28+ | Agent workflows and integrations |
| AI Builder Prompts | 36 | 26 base + 10 GHA prompts |
| KB Documents | 200+ | Agent knowledge base files |

---

## 2. Prerequisites

### 2.1 Access Requirements

Verify you have the following access before starting:

```
[ ] Power Platform Admin Center access (https://admin.powerplatform.microsoft.com)
[ ] Copilot Studio access for MC tenant (https://copilotstudio.microsoft.com)
[ ] Power Automate access for MC environment
[ ] SharePoint access (CAEConsultingProduct site)
[ ] PAC CLI installed and authenticated
[ ] Azure AD credentials for app registration
[ ] Git access to deploy/mastercard branch
```

### 2.2 Software Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| PAC CLI | Latest | Solution import/export |
| Node.js | 18+ | Validation scripts |
| PowerShell | 7+ | Automation scripts |
| VS Code | Latest | File editing |

### 2.3 License Requirements

- Power Platform Premium license
- AI Builder credits/capacity
- Copilot Studio license
- HTTP Premium connector

---

## 3. Environment Configuration

### 3.1 Mastercard Environment Identifiers

| Identifier | Value |
|------------|-------|
| **Instance URL** | `https://orgcc6eaaec.crm.dynamics.com` |
| **Environment ID** | `ea9d500a-9299-e7b2-8754-53ebea0cb818` |
| **Organization ID** | `75145e53-ba5e-f011-8ee3-000d3a3b2c23` |
| **Tenant ID** | `f06fa858-824b-4a85-aacb-f372cfdc282e` |
| **Unique Name** | `unq75145e53ba5ef0118ee3000d3a3b2` |

### 3.2 Environment Variables

Create/verify these environment variables in the MC environment:

| Variable | Value |
|----------|-------|
| AZURE_TENANT_ID | f06fa858-824b-4a85-aacb-f372cfdc282e |
| AZURE_CLIENT_ID | 80e5350f-a956-4e17-8f75-e079931c4ab0 |
| DATAVERSE_ENVIRONMENT_URL | https://orgcc6eaaec.crm.dynamics.com |
| SHAREPOINT_SITE_URL | https://mastercard.sharepoint.com/sites/CAEConsultingProduct |

### 3.3 SharePoint Pre-Configured URLs

| Folder | URL |
|--------|-----|
| MPA KB | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgCZ7qTFJCgASKcb204jJRn0AfB5alCc74AMyE2etdchqA4 |
| CA KB | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/IgDzc0ufDknYTpTghwRGqCXGAUvoLc-7BLhVv8c7TrZEPAI |
| EAP KB | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgAMlDUM-pK9Rqol_B77NT8JAWaSvFONRHLabpRleGIwxko |

---

## 4. Phase 1: Solution Package Import

**Priority:** CRITICAL - Must complete first
**Estimated Time:** 15-30 minutes

### 4.1 Authenticate to Mastercard Environment

```powershell
# Clear existing authentication
pac auth clear

# Create new auth for Mastercard
pac auth create --environment https://orgcc6eaaec.crm.dynamics.com

# Verify connection
pac org who
```

Expected output should show:
- Organization: Mastercard
- Environment ID: ea9d500a-9299-e7b2-8754-53ebea0cb818

### 4.2 Import Platform Solution (Required First)

**Solution File:** `release/v7.0/solutions/EAPPlatform_7_0_0_0.zip`

This solution contains all 28+ Dataverse tables:

**EAP Tables (10):**
1. eap_capability_implementation
2. eap_client
3. eap_featureflag
4. eap_proactive_trigger
5. eap_session
6. eap_telemetry
7. eap_trigger_history
8. eap_user
9. eap_workflow_contribution
10. eap_workflow_definition

**MPA Tables (11):**
1. mpa_audience
2. mpa_benchmark
3. mpa_channel
4. mpa_kpi
5. mpa_mediaplan
6. mpa_planallocation
7. mpa_plandata
8. mpa_planversion
9. mpa_session_memory
10. mpa_user_preferences
11. mpa_vertical

**CA Tables (7):**
1. ca_analysis
2. ca_benchmarks
3. ca_deliverable
4. ca_framework
5. ca_framework_usage
6. ca_learning
7. ca_recommendation

**GHA Tables (v7.0 - New):**
1. eap_growth_sessions (growth plan state)

#### Import via PAC CLI (Recommended):

```powershell
pac solution import \
    --path "release/v7.0/solutions/EAPPlatform_7_0_0_0.zip" \
    --activate-plugins \
    --publish-changes
```

#### Import via Power Platform Admin Center (Manual):

1. Navigate to: https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818
2. Select "Solutions" from left navigation
3. Click "Import solution"
4. Browse to: `release/v7.0/solutions/EAPPlatform_7_0_0_0.zip`
5. Click "Next" and follow wizard
6. Wait for import to complete (5-15 minutes)
7. Verify all tables appear under "Tables"

### 4.3 Import Agent Solutions

Import agent solutions in this order after platform:

```powershell
# Orchestrator Agent (deploy first after platform)
pac solution import --path "release/v7.0/solutions/EAPORCAgent_7_0_0_0.zip" --activate-plugins

# Analytics Agent
pac solution import --path "release/v7.0/solutions/EAPANLAgent_7_0_0_0.zip" --activate-plugins

# Audience Agent (updated for GHA integration)
pac solution import --path "release/v7.0/solutions/EAPAUDAgent_7_0_0_0.zip" --activate-plugins

# Channel Agent (updated for GHA integration)
pac solution import --path "release/v7.0/solutions/EAPCHAAgent_7_0_0_0.zip" --activate-plugins

# Supply Path Agent
pac solution import --path "release/v7.0/solutions/EAPSPOAgent_7_0_0_0.zip" --activate-plugins

# Document Agent (updated for GHA integration)
pac solution import --path "release/v7.0/solutions/EAPDOCAgent_7_0_0_0.zip" --activate-plugins

# Performance Agent
pac solution import --path "release/v7.0/solutions/EAPPRFAgent_7_0_0_0.zip" --activate-plugins

# Change Management Agent
pac solution import --path "release/v7.0/solutions/EAPCHGAgent_7_0_0_0.zip" --activate-plugins

# Consulting Agent
pac solution import --path "release/v7.0/solutions/EAPCSTAgent_7_0_0_0.zip" --activate-plugins

# Marketing Agent
pac solution import --path "release/v7.0/solutions/EAPMKTAgent_7_0_0_0.zip" --activate-plugins

# Growth Hacking Agent (v7.0 - NEW)
pac solution import --path "release/v7.0/solutions/EAPGHAAgent_7_0_0_0.zip" --activate-plugins
```

### 4.4 Verify Solution Import

```powershell
# List all tables with eap_, mpa_, ca_ prefix
pac org list-tables | Select-String "eap_|mpa_|ca_"
```

Verify you see all 28+ tables listed.

---

## 5. Phase 2: Seed Data Import

**Priority:** HIGH - Required for agents to function
**Dependencies:** Phase 1 complete
**Estimated Time:** 30-45 minutes

### 5.1 Seed Data Import Order

Import seed data in this exact order to respect foreign key dependencies:

**Tier 1 - Base Configuration (No dependencies):**

| Order | File | Table | Expected Rows |
|-------|------|-------|---------------|
| 1 | mpa_vertical_seed.csv | mpa_vertical | 15 |
| 2 | mpa_channel_seed.csv | mpa_channel | 30 |
| 3 | mpa_kpi_seed.csv | mpa_kpi | 24 |
| 4 | ca_framework_seed.csv | ca_framework | 60 |

**Tier 2 - Reference Data (Depends on Tier 1):**

| Order | File | Table | Expected Rows |
|-------|------|-------|---------------|
| 5 | mpa_partner_seed.csv | mpa_partner | 20 |
| 6 | mpa_benchmark_seed.csv | mpa_benchmark | 31 |
| 7 | eap_capability_seed.csv | eap_capability | 20 |
| 8 | eap_capability_ca_seed.csv | eap_capability | 20 (merge) |

**Tier 3 - Operational Data (Depends on Tier 2):**

| Order | File | Table | Expected Rows |
|-------|------|-------|---------------|
| 9 | eap_capability_implementation_seed.csv | eap_capability_implementation | 47 |
| 10 | eap_prompt_seed.csv | eap_prompt | 19 |
| 11 | eap_session_seed.csv | eap_session | 5 |
| 12 | eap_test_case_seed.csv | eap_test_case | 15 |

**Tier 4 - v7.0 GHA Data:**

| Order | File | Table | Expected Rows |
|-------|------|-------|---------------|
| 13 | eap_prompt_gha_v7.xml | eap_prompt | 10 (GHA prompts) |
| 14 | eap_capability_impl_gha_v7.xml | eap_capability_implementation | 10 (GHA capabilities) |

### 5.2 Data Import Methods

**Option A - Power Apps Data Import Wizard:**

1. Go to: https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818
2. Navigate to "Tables"
3. Select target table (e.g., mpa_vertical)
4. Click "Import" > "Import data from Excel"
5. Upload the corresponding CSV file
6. Map columns and complete import
7. Repeat for each table in order

**Option B - Dataverse Excel Add-in:**

1. Open Excel with Dataverse Add-in
2. Connect to: https://orgcc6eaaec.crm.dynamics.com
3. Load CSV data
4. Publish to Dataverse

### 5.3 Verify Seed Data Import

After importing all files, verify row counts:

| Table | Expected Rows |
|-------|---------------|
| mpa_vertical | 15 |
| mpa_channel | 30 |
| mpa_kpi | 24 |
| mpa_partner | 20 |
| mpa_benchmark | 31 |
| ca_framework | 60 |
| eap_capability | 40 |
| eap_prompt | 29 (19 + 10 GHA) |
| eap_capability_implementation | 57 (47 + 10 GHA) |

---

## 6. Phase 3: SharePoint Knowledge Base Upload

**Priority:** HIGH - Required for Copilot Studio agents
**Dependencies:** SharePoint site access
**Estimated Time:** 45-60 minutes

### 6.1 Required Folder Structure

Create/verify this folder structure in SharePoint Shared Documents:

```
Shared Documents/
├── MPA_Agent_KB/
│   ├── ORC/           (3 files)
│   ├── ANL/           (9 files)
│   ├── AUD/           (9 files)
│   ├── CHA/           (10 files)
│   ├── SPO/           (7 files)
│   ├── DOC/           (5 files)
│   ├── PRF/           (7 files)
│   ├── CHG/           (7 files)
│   ├── CST/           (7 files)
│   ├── MKT/           (7 files)
│   └── GHA/           (10+ files - v7.0 NEW)
├── CA_Agent_KB/
└── EAP_Platform_KB/
```

### 6.2 KB Document Upload by Agent

Upload KB files from repository to SharePoint folders:

| Agent | Source Path | Target Folder | Files |
|-------|-------------|---------------|-------|
| ORC | `release/v7.0/agents/orc/kb/` | MPA_Agent_KB/ORC/ | ORC_KB_*.txt |
| ANL | `release/v7.0/agents/anl/kb/` | MPA_Agent_KB/ANL/ | ANL_KB_*.txt |
| AUD | `release/v7.0/agents/aud/kb/` | MPA_Agent_KB/AUD/ | AUD_KB_*.txt |
| CHA | `release/v7.0/agents/cha/kb/` | MPA_Agent_KB/CHA/ | CHA_KB_*.txt |
| SPO | `release/v7.0/agents/spo/kb/` | MPA_Agent_KB/SPO/ | SPO_KB_*.txt |
| DOC | `release/v7.0/agents/doc/kb/` | MPA_Agent_KB/DOC/ | DOC_KB_*.txt |
| PRF | `release/v7.0/agents/prf/kb/` | MPA_Agent_KB/PRF/ | PRF_KB_*.txt |
| CHG | `release/v7.0/agents/chg/kb/` | MPA_Agent_KB/CHG/ | CHG_KB_*.txt |
| CST | `release/v7.0/agents/cst/kb/` | MPA_Agent_KB/CST/ | CST_KB_*.txt |
| MKT | `release/v7.0/agents/mkt/kb/` | MPA_Agent_KB/MKT/ | MKT_KB_*.txt |
| **GHA** | `release/v7.0/agents/gha/kb/` | MPA_Agent_KB/GHA/ | GHA_KB_*.txt |

### 6.3 Upload Procedure

For each agent:

1. Open SharePoint folder (e.g., MPA_Agent_KB/GHA/)
2. Click "Upload" > "Files"
3. Select all .txt files from corresponding source folder
4. Wait for upload to complete
5. Verify file count matches expected
6. Repeat for each agent folder

---

## 7. Phase 4: Copilot Studio Agent Configuration

**Priority:** HIGH - Core agent functionality
**Dependencies:** Phase 3 complete (KB files in SharePoint)
**Estimated Time:** 2-3 hours

### 7.1 Access Copilot Studio

Navigate to: https://copilotstudio.microsoft.com

Select the Mastercard environment:
- Tenant ID: f06fa858-824b-4a85-aacb-f372cfdc282e
- Environment ID: ea9d500a-9299-e7b2-8754-53ebea0cb818

### 7.2 Agent AI Settings Matrix

**CRITICAL: Configure these settings for EVERY agent before publishing.**

| Agent | Model | Web Search | General Knowledge | Deep Reasoning | Moderation |
|-------|-------|------------|-------------------|----------------|------------|
| **ORC** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **ANL** | Claude Opus 4.5 | OFF | OFF | ON | Medium |
| **AUD** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |
| **CHA** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |
| **SPO** | Claude Opus 4.5 | ON | OFF | ON | Medium |
| **DOC** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **PRF** | Claude Opus 4.5 | ON | OFF | ON | Medium |
| **CHG** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **CST** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **MKT** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |
| **GHA** | Claude Opus 4.5 | ON | OFF | ON | Medium |

**Settings Location in Copilot Studio UI:**

| Setting | Location |
|---------|----------|
| Model | Settings -> AI capabilities |
| Web Search | Overview tab toggle OR Settings -> Knowledge -> "Use information from web" |
| General Knowledge | Settings -> Knowledge -> "Use general knowledge" |
| Deep Reasoning | Settings -> AI capabilities |
| Content Moderation | Settings -> AI capabilities |

**CRITICAL RULES:**
1. **General Knowledge = OFF for ALL agents** - Prevents unvalidated responses
2. **Web Search = Selective** - Only ON for agents needing current market data
3. **Deep Reasoning = Selective** - Only ON for complex analytical agents (ANL, SPO, PRF, GHA)

### 7.3 Agent Deployment Order

Deploy agents in this order to ensure dependencies are met:

1. **ORC** (Orchestrator) - Deploy first, handles routing
2. **ANL** (Analytics) - No dependencies
3. **AUD** (Audience) - No dependencies
4. **CHA** (Channel) - No dependencies
5. **SPO** (Supply Path) - No dependencies
6. **PRF** (Performance) - No dependencies
7. **DOC** (Document) - Requires Azure Functions
8. **CHG** (Change Management) - No dependencies
9. **CST** (Consulting Strategy) - No dependencies
10. **MKT** (Marketing) - No dependencies
11. **GHA** (Growth Hacking) - Depends on ORC for specialist routing

### 7.4 Agent Configuration Steps

For each agent (example: GHA):

**Step 1: Create Agent**
1. Click "Create" > "New Agent"
2. Name: `MPA Growth Hacking Agent v7.0`
3. Description: `Growth Strategy Orchestrator with AARRR lifecycle optimization`
4. Agent Code: `GHA`

**Step 2: Configure AI Settings**
1. Navigate to Settings -> AI capabilities
2. Set Model: Claude Opus 4.5
3. Enable Web Search: ON
4. Disable General Knowledge: OFF
5. Enable Deep Reasoning: ON
6. Set Content Moderation: Medium

**Step 3: Upload Instructions**
1. Navigate to agent settings -> Instructions
2. Open file: `release/v7.0/agents/gha/instructions/01_CoPilot_Core_Instructions_V3_6_REVISED.txt`
3. Copy entire content (must be under 8,000 characters)
4. Paste into Instructions field
5. Click Save

**Step 4: Connect Knowledge Source**
1. Go to "Knowledge" settings
2. Click "Add knowledge source"
3. Select "SharePoint"
4. Connect to: https://mastercard.sharepoint.com/sites/CAEConsultingProduct
5. Select folder: MPA_Agent_KB/GHA/
6. Enable "Use knowledge in responses"
7. Save and wait for indexing

**Step 5: Connect Flows** (if applicable)
1. Go to "Actions" or "Topics"
2. Add Power Automate flows:
   - GetGrowthState
   - UpdateGrowthProgress
   - RequestSpecialistViaORC

**Step 6: Test Agent**
1. Use built-in test pane
2. Verify KB retrieval works
3. Test sample queries

### 7.5 Agent Instruction Files Reference

| Agent | Instruction File | Character Count |
|-------|------------------|-----------------|
| ORC | ORC_Copilot_Instructions_v3_CORRECTED.txt | ~6,157 |
| ANL | ANL_Copilot_Instructions_v1.txt | ~6,500 |
| AUD | AUD_Copilot_Instructions_v2_CORRECTED.txt | ~6,767 |
| CHA | CHA_Copilot_Instructions_v1.txt | ~6,200 |
| SPO | SPO_Copilot_Instructions_v1.txt | ~6,400 |
| DOC | DOC_Copilot_Instructions_v1.txt | ~5,800 |
| PRF | PRF_Copilot_Instructions_v1.txt | ~6,100 |
| CHG | CHG_Copilot_Instructions_v1.txt | ~5,900 |
| CST | CST_Copilot_Instructions_v1.txt | ~6,300 |
| MKT | MKT_Copilot_Instructions_v1.txt | ~6,000 |
| GHA | 01_CoPilot_Core_Instructions_V3_6_REVISED.txt | ~7,500 |

---

## 8. Phase 5: Power Automate Flow Deployment

**Priority:** MEDIUM - Enables automation
**Dependencies:** Phase 1 complete (Dataverse tables exist)
**Estimated Time:** 1-2 hours

### 8.1 Flow Inventory

**Total Flows:** 28+ (25 base + 3 GHA flows)

| Agent | Flow Name | Purpose |
|-------|-----------|---------|
| ORC | RouteToSpecialist | Main routing logic |
| ORC | GetSessionState | Retrieve session context |
| ORC | UpdateProgress | Update workflow step/gate |
| ANL | CalculateProjection | Budget projections |
| ANL | RunScenario | Scenario comparison |
| AUD | SegmentAudience | Audience segmentation |
| AUD | CalculateLTV | Customer lifetime value |
| CHA | CalculateAllocation | Channel budget allocation |
| CHA | LookupBenchmarks | Benchmark retrieval |
| SPO | CalculateNBI | Net Benefit Index calculation |
| SPO | AnalyzeFees | Fee stack analysis |
| SPO | EvaluatePartner | Partner scoring |
| DOC | GenerateDocument | Document generation |
| PRF | AnalyzePerformance | Performance analysis |
| PRF | DetectAnomalies | Anomaly detection |
| PRF | ExtractLearnings | Learning extraction |
| CHG | AssessReadiness | Change readiness assessment |
| CHG | MapStakeholders | Stakeholder mapping |
| CHG | PlanAdoption | Adoption planning |
| CST | SelectFramework | Framework selection |
| CST | ApplyAnalysis | Strategic analysis |
| CST | PrioritizeInitiatives | Initiative prioritization |
| MKT | DevelopStrategy | Campaign strategy |
| MKT | CreateBrief | Creative brief |
| MKT | AnalyzeCompetitive | Competitive analysis |
| **GHA** | GetGrowthState | Growth session state retrieval |
| **GHA** | UpdateGrowthProgress | Growth workflow progression |
| **GHA** | RequestSpecialistViaORC | Specialist request routing |

### 8.2 Flow Import Method

**Option A - Import as Solution Component:**

1. Go to: https://make.powerautomate.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818
2. Navigate to "Solutions"
3. Open the EAP solution
4. Click "Add existing" > "Automation" > "Cloud flow"
5. Import each JSON file from `release/v7.0/platform/flows/solution-ready/`

**Option B - Import Individual Flows:**

1. Go to Power Automate
2. Click "Import" > "Import package"
3. Upload flow JSON file
4. Configure connections
5. Import and activate

### 8.3 Flow JSON Files Location

**Directory:** `release/v7.0/platform/flows/solution-ready/`

Each flow has a JSON file named with its GUID:
- MPARouteToSpecialist-268F3713-FF44-4A79-83D0-8E58FE278E07.json
- MPAGetSessionState-EDFEB9FB-5BDA-4509-AB9E-FAED1C4BB3EE.json
- (etc.)

### 8.4 Configure Flow Connections

After importing flows, configure connections for:
- Dataverse connector -> MC Dataverse environment
- SharePoint connector -> MC SharePoint
- AI Builder connector (for prompts)
- HTTP Premium connector (for external calls)

### 8.5 Activate Flows

After import, manually activate all flows:
1. Go to Solutions > [Solution Name] > Cloud flows
2. Select each flow > Turn On
3. Verify no connection errors

---

## 9. Phase 6: AI Builder Prompt Deployment

**Priority:** MEDIUM - Enables AI capabilities
**Dependencies:** Phase 1 complete
**Estimated Time:** 2-3 hours

### 9.1 Prompt Inventory

**Total Prompts:** 36 (26 base + 10 GHA)

**Base Prompts (26):**

| Agent | Prompt Code | Purpose | Temperature |
|-------|-------------|---------|-------------|
| ANL | ANL_MarginalReturn | Marginal return calculation | 0.1 |
| ANL | ANL_ScenarioCompare | Scenario comparison | 0.2 |
| ANL | ANL_Projection | Performance projection | 0.2 |
| ANL | ANL_Confidence | Confidence assessment | 0.2 |
| ANL | ANL_Bayesian | Bayesian inference | 0.2 |
| AUD | AUD_SegmentBuild | Audience segmentation | 0.2 |
| AUD | AUD_PropensityScore | Propensity scoring | 0.2 |
| AUD | AUD_JourneyMap | Journey mapping | 0.3 |
| AUD | AUD_LTVCalculate | LTV calculation | 0.2 |
| CHA | CHA_MixOptimize | Channel mix optimization | 0.2 |
| CHA | CHA_BudgetAllocate | Budget allocation | 0.2 |
| CHA | CHA_BenchmarkLookup | Benchmark lookup | 0.1 |
| CHA | CHA_ChannelRecommend | Channel recommendation | 0.3 |
| DOC | DOC_BriefGenerate | Brief generation | 0.4 |
| DOC | DOC_ReportCompile | Report compilation | 0.3 |
| DOC | DOC_TemplateSelect | Template selection | 0.3 |
| DOC | DOC_FormatExport | Format export | 0.3 |
| PRF | PRF_Anomaly | Anomaly detection | 0.2 |
| PRF | PRF_Attribution | Attribution analysis | 0.2 |
| PRF | PRF_Incrementality | Incrementality measurement | 0.2 |
| PRF | PRF_Optimize | Optimization recommender | 0.3 |
| ORC | ORC_IntentClassify | Intent classification | 0.1 |
| ORC | ORC_GateValidate | Gate validation | 0.1 |
| (+ 3 more base prompts) | | | |

**GHA Prompts (10 - v7.0 NEW):**

| Prompt Code | Purpose | Temperature | Max Tokens |
|-------------|---------|-------------|------------|
| GHA_IntentClassify | Classify growth intent and AARRR stage | 0.1 | 800 |
| GHA_FrameworkSelect | Select growth framework | 0.2 | 1500 |
| GHA_LifecycleAnalyze | Analyze AARRR funnel | 0.2 | 2500 |
| GHA_NorthStarDefine | Define North Star metric | 0.3 | 2000 |
| GHA_TacticRecommend | Recommend growth tactics | 0.3 | 2500 |
| GHA_PsychologyApply | Apply behavioral psychology | 0.3 | 2500 |
| GHA_CompetitorGrowth | Analyze competitor growth | 0.3 | 3000 |
| GHA_ExperimentDesign | Design growth experiments | 0.3 | 2500 |
| GHA_GrowthProject | Project growth outcomes | 0.2 | 3000 |
| GHA_GrowthSynthesize | Synthesize specialist contributions | 0.4 | 4000 |

### 9.2 Access AI Builder

1. Go to: https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818
2. Navigate to "AI Builder" > "Prompts"
3. Click "Create prompt" > "Create text with GPT"

### 9.3 Manual Prompt Creation

AI Builder prompts must be created manually in the UI. For each prompt:

1. **Navigate to AI Builder:**
   - https://make.powerapps.com > AI Builder > Prompts

2. **Create New Prompt:**
   - Click "Create prompt" > "Create text with GPT"
   - Name the prompt (e.g., "GHA_IntentClassify")

3. **Configure Prompt:**
   - Copy System Message from deployment doc
   - Copy User Template from deployment doc
   - Add Input Parameters
   - Set Temperature and Max Tokens

4. **Test and Save:**
   - Use "Test" feature with sample inputs
   - Verify JSON output is valid
   - Save prompt

### 9.4 GHA Prompt Deployment Reference

Full GHA prompt specifications are in:
- `release/v7.0/scripts/deploy_ai_builder_prompts_gha_v7.md`
- `release/v7.0/scripts/gha_ai_builder_prompts.json` (JSON format for copy/paste)

### 9.5 Add Prompts to Solution

After creating all prompts:

1. Navigate to Solutions
2. Open the EAP solution
3. Add existing > AI models > Select all prompts
4. Save solution

---

## 10. Phase 7: Integration Testing

**Priority:** HIGH - Validate deployment
**Dependencies:** Phases 1-6 complete
**Estimated Time:** 1-2 hours

### 10.1 Dataverse Validation

Verify all tables have expected row counts:

```sql
-- Run in Dataverse SQL endpoint or FetchXML
SELECT COUNT(*) FROM mpa_vertical   -- Expected: 15
SELECT COUNT(*) FROM mpa_channel    -- Expected: 30
SELECT COUNT(*) FROM mpa_kpi        -- Expected: 24
SELECT COUNT(*) FROM mpa_benchmark  -- Expected: 31
SELECT COUNT(*) FROM ca_framework   -- Expected: 60
```

### 10.2 Agent Routing Tests

Test the Orchestrator agent with these queries:

| Test Query | Expected Agent |
|------------|----------------|
| "Calculate projections for $500K budget" | ANL |
| "Segment our audience by RFM" | AUD |
| "Recommend channel mix" | CHA |
| "Analyze supply path fees" | SPO |
| "Generate media plan document" | DOC |
| "Detect performance anomalies" | PRF |
| "Assess change readiness" | CHG |
| "Select strategic framework" | CST |
| "Develop campaign strategy" | MKT |
| **"Help me develop a growth strategy"** | **GHA** |
| **"Optimize our AARRR funnel"** | **GHA** |
| **"Design a referral program"** | **GHA** |

### 10.3 GHA-Specific Tests

| Test Query | Expected Behavior |
|------------|-------------------|
| "Analyze our growth lifecycle" | GHA responds with AARRR analysis |
| "Define our North Star metric" | GHA helps define growth metrics |
| "I need analytics on growth projections" | GHA routes to ANL via ORC |
| "Segment users for growth tactics" | GHA routes to AUD via ORC |

### 10.4 KB Retrieval Tests

For each agent, verify KB retrieval:
1. Ask domain-specific question
2. Verify response cites KB content
3. Check source attribution

### 10.5 Flow Execution Tests

Test critical flows:
1. Trigger flow manually
2. Verify Dataverse operations work
3. Check error handling

---

## 11. Phase 8: Post-Deployment Validation

**Priority:** CRITICAL - Final verification
**Dependencies:** All phases complete

### 11.1 Deployment Checklist

```
[ ] All 28+ Dataverse tables exist and are accessible
[ ] All seed data imported with correct row counts
[ ] All KB documents uploaded to SharePoint (200+)
[ ] All 11 Copilot Studio agents configured with instructions
[ ] All agent KB sources connected
[ ] All 28+ Power Automate flows imported and activated
[ ] All 36 AI Builder prompts deployed
[ ] Routing tests pass (10/10)
[ ] KB retrieval tests pass (11/11)
[ ] Flow execution tests pass
[ ] GHA integration tests pass
```

### 11.2 Agent Validation Summary

| Agent | Instructions | KB Connected | Flows Active | Test Pass |
|-------|--------------|--------------|--------------|-----------|
| ORC | [ ] | [ ] | [ ] | [ ] |
| ANL | [ ] | [ ] | [ ] | [ ] |
| AUD | [ ] | [ ] | [ ] | [ ] |
| CHA | [ ] | [ ] | [ ] | [ ] |
| SPO | [ ] | [ ] | [ ] | [ ] |
| DOC | [ ] | [ ] | [ ] | [ ] |
| PRF | [ ] | [ ] | [ ] | [ ] |
| CHG | [ ] | [ ] | [ ] | [ ] |
| CST | [ ] | [ ] | [ ] | [ ] |
| MKT | [ ] | [ ] | [ ] | [ ] |
| GHA | [ ] | [ ] | [ ] | [ ] |

### 11.3 Sign-Off

Document deployment completion:

| Field | Value |
|-------|-------|
| Date completed | _______________ |
| Deployed by | _______________ |
| Verified by | _______________ |
| Version | 7.0.0.0 |
| Issues encountered | _______________ |

---

## 12. Troubleshooting

### 12.1 Common Issues

**Solution Import Fails - Missing Components:**
- Cause: Tables not in solution
- Fix: Use PAC CLI to add missing tables to solution before export

**Seed Data Import Fails:**
- Cause: Foreign key constraint violation
- Fix: Import in correct dependency order (Tier 1 -> 2 -> 3 -> 4)

**KB Not Retrieved:**
- Cause: SharePoint connection not configured
- Fix: Re-add SharePoint as knowledge source in Copilot Studio

**Flow Fails - Connection Error:**
- Cause: Connection references not configured
- Fix: Update connection references in flow settings

**AI Builder Prompt Fails:**
- Cause: Model not available or token limit exceeded
- Fix: Verify AI Builder license and reduce max_tokens if needed

**GHA Not Routing to Specialists:**
- Cause: ORC routing logic not updated
- Fix: Verify ORC KB files include GHA routing rules

### 12.2 Validation Scripts

Run validation script to verify deployment:

```bash
python release/v7.0/scripts/validate_deployment.py \
    --environment https://orgcc6eaaec.crm.dynamics.com
```

### 12.3 Support Contacts

For deployment issues:
- Technical Support: support@kesseldigital.com
- Repository: Kessel-Digital-Agent-Platform
- Branch: deploy/mastercard

---

## 13. Appendix

### 13.1 File Reference

| Document | Location | Purpose |
|----------|----------|---------|
| Solution Packages | `release/v7.0/solutions/` | Dataverse solutions |
| Seed Data | `base/dataverse/seed/` | Reference data CSVs |
| Agent Instructions | `release/v7.0/agents/{code}/instructions/` | Copilot instructions |
| KB Files | `release/v7.0/agents/{code}/kb/` | Knowledge base documents |
| Flow Specs | `release/v7.0/platform/flows/` | Power Automate definitions |
| AI Builder Prompts | `release/v7.0/scripts/deploy_ai_builder_prompts_*.md` | Prompt specifications |
| GHA Prompts JSON | `release/v7.0/scripts/gha_ai_builder_prompts.json` | JSON format for copy/paste |

### 13.2 Version History

| Version | Date | Changes |
|---------|------|---------|
| 7.0.0.0 | 2026-01-31 | Initial v7.0 release with GHA integration |

### 13.3 Related Documents

- [COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md](../COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md) - Agent AI settings
- [VSCODE_DEPLOYMENT_INSTRUCTIONS.md](./VSCODE_DEPLOYMENT_INSTRUCTIONS.md) - Detailed technical instructions
- [MASTERCARD_MANUAL_DEPLOYMENT_PLAN.md](./MASTERCARD_MANUAL_DEPLOYMENT_PLAN.md) - Manual deployment steps
- [DEPLOYMENT_GUIDE.md](../solutions/DEPLOYMENT_GUIDE.md) - Solution-level guidance

---

**Document Version:** 7.0.0.0
**Created:** January 31, 2026
**Author:** Claude Code

*KDAP v7.0 Mastercard Complete Deployment Guide - Mastercard Internal*
