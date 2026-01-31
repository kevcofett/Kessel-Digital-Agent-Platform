# MPA v6.0 MASTERCARD MANUAL DEPLOYMENT PLAN

**Date:** 2026-01-21
**Environment:** Mastercard Power Platform
**Instance URL:** https://orgcc6eaaec.crm.dynamics.com
**Environment ID:** ea9d500a-9299-e7b2-8754-53ebea0cb818

---

## DEPLOYMENT OVERVIEW

This document provides the complete manual deployment plan for MPA v6.0/v6.1 to the Mastercard environment. Execute steps in the exact order shown.

**Total Deployment Steps:** 8 Phases
**Estimated Components:**
- 1 Dataverse Solution (28 tables)
- 29 Seed Data CSV files
- 25 Power Automate flows
- 83 AI Builder prompts
- 10 Copilot Studio Agents (with instructions)
- 200+ Knowledge Base documents

---

## PRE-DEPLOYMENT CHECKLIST

Before starting deployment, verify:

```
[ ] Access to Mastercard Power Platform Admin Center
[ ] PAC CLI authenticated to MC environment
[ ] Azure AD app registration credentials available
[ ] Access to Mastercard SharePoint site (CAEConsultingProduct)
[ ] Copilot Studio access for MC tenant
[ ] Power Automate access for MC environment
[ ] All files synced from deploy/mastercard branch
```

### Environment Configuration

Reference file: `release/v6.0/deployment/mastercard/.env.mastercard`

Key values needed:
- AZURE_TENANT_ID: f06fa858-824b-4a85-aacb-f372cfdc282e
- AZURE_CLIENT_ID: 80e5350f-a956-4e17-8f75-e079931c4ab0
- DATAVERSE_ENVIRONMENT_URL: https://orgcc6eaaec.crm.dynamics.com
- SHAREPOINT_SITE_URL: https://mastercard.sharepoint.com/sites/CAEConsultingProduct

---

## PHASE 1: DATAVERSE SOLUTION IMPORT

**Priority:** CRITICAL - Must complete first
**Dependencies:** None

### Step 1.1: Authenticate to Mastercard Environment

```powershell
# Clear existing auth
pac auth clear

# Create new auth for Mastercard
pac auth create --environment https://orgcc6eaaec.crm.dynamics.com

# Verify connection
pac org who
```

Expected output should show:
- Organization: Mastercard (or similar)
- Environment ID: ea9d500a-9299-e7b2-8754-53ebea0cb818

### Step 1.2: Import Platform Solution

**Solution File:** `release/v6.0/solutions/EAPPlatform_v10_full.zip`

This solution contains all 28 Dataverse tables:

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

#### Import via PAC CLI:

```powershell
pac solution import \
    --path "release/v6.0/solutions/EAPPlatform_v10_full.zip" \
    --activate-plugins \
    --publish-changes
```

#### Import via Power Platform Admin Center (Manual):

1. Navigate to: https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818
2. Select "Solutions" from left navigation
3. Click "Import solution"
4. Browse to: `release/v6.0/solutions/EAPPlatform_v10_full.zip`
5. Click "Next" and follow wizard
6. Wait for import to complete (may take 5-15 minutes)
7. Verify all 28 tables appear under "Tables"

### Step 1.3: Verify Solution Import

```powershell
# List all tables with eap_, mpa_, ca_ prefix
pac org list-tables | Select-String "eap_|mpa_|ca_"
```

Verify you see all 28 tables listed.

---

## PHASE 2: SEED DATA IMPORT

**Priority:** HIGH - Required for agents to function
**Dependencies:** Phase 1 complete

### Step 2.1: Seed Data Import Order

Import seed data in this exact order to respect foreign key dependencies:

**Tier 1 - Base Configuration (No dependencies):**
1. `mpa_vertical_seed.csv` -> mpa_vertical (15 rows)
2. `mpa_channel_seed.csv` -> mpa_channel (30 rows)
3. `mpa_kpi_seed.csv` -> mpa_kpi (24 rows)
4. `ca_framework_seed.csv` -> ca_framework (60 rows)

**Tier 2 - Reference Data (Depends on Tier 1):**
5. `mpa_partner_seed.csv` -> mpa_partner (20 rows)
6. `mpa_benchmark_seed.csv` -> mpa_benchmark (31 rows)
7. `eap_capability_seed.csv` -> eap_capability (20 rows)
8. `eap_capability_ca_seed.csv` -> eap_capability (20 more rows, merge)

**Tier 3 - Operational Data (Depends on Tier 2):**
9. `eap_capability_implementation_seed.csv` -> eap_capability_implementation (47 rows)
10. `eap_prompt_seed.csv` -> eap_prompt (19 rows)
11. `eap_session_seed.csv` -> eap_session (5 rows)
12. `eap_test_case_seed.csv` -> eap_test_case (15 rows)

### Step 2.2: Data Import Methods

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

**Option C - PAC CLI (if available):**

```powershell
# Example for mpa_vertical
pac data import \
    --data "base/dataverse/seed/mpa_vertical_seed.csv" \
    --table mpa_vertical
```

### Step 2.3: Verify Seed Data Import

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
| eap_prompt | 19 |
| eap_capability_implementation | 47 |

---

## PHASE 3: KNOWLEDGE BASE UPLOAD TO SHAREPOINT

**Priority:** HIGH - Required for Copilot Studio agents
**Dependencies:** SharePoint site access

### Step 3.1: SharePoint Folder Structure

Navigate to Mastercard SharePoint site and verify/create folder structure:

**SharePoint Site:** https://mastercard.sharepoint.com/sites/CAEConsultingProduct

**Required Folder Structure:**
```
Shared Documents/
├── MPA_Agent_KB/
│   ├── ORC/           (Orchestrator Agent)
│   ├── ANL/           (Analytics Agent)
│   ├── AUD/           (Audience Agent)
│   ├── CHA/           (Channel Agent)
│   ├── SPO/           (Supply Path Agent)
│   ├── DOC/           (Document Agent)
│   ├── PRF/           (Performance Agent)
│   ├── CHG/           (Change Management Agent)
│   ├── CST/           (Strategy Agent)
│   └── MKT/           (Marketing Agent)
├── CA_Agent_KB/       (Consulting Agent KB files)
└── EAP_Platform_KB/   (Platform-level KB files)
```

### Step 3.2: KB Document Upload by Agent

Upload KB files from repository to SharePoint folders:

**Source Location:** `release/v6.0/solutions/agents/{agent_code}/kb/`

| Agent | Source Path | SharePoint Target | Files |
|-------|-------------|-------------------|-------|
| ORC | `release/v6.0/solutions/agents/orc/kb/` | MPA_Agent_KB/ORC/ | 3 files |
| ANL | `release/v6.0/solutions/agents/anl/kb/` | MPA_Agent_KB/ANL/ | 9 files |
| AUD | `release/v6.0/solutions/agents/aud/kb/` | MPA_Agent_KB/AUD/ | 9 files |
| CHA | `release/v6.0/solutions/agents/cha/kb/` | MPA_Agent_KB/CHA/ | 10 files |
| SPO | `release/v6.0/solutions/agents/spo/kb/` | MPA_Agent_KB/SPO/ | 7 files |
| DOC | `release/v6.0/solutions/agents/doc/kb/` | MPA_Agent_KB/DOC/ | 5 files |
| PRF | `release/v6.0/solutions/agents/prf/kb/` | MPA_Agent_KB/PRF/ | 7 files |
| CHG | `release/v6.0/solutions/agents/chg/kb/` | MPA_Agent_KB/CHG/ | 7 files |
| CST | `release/v6.0/solutions/agents/cst/kb/` | MPA_Agent_KB/CST/ | 7 files |
| MKT | `release/v6.0/solutions/agents/mkt/kb/` | MPA_Agent_KB/MKT/ | 7 files |

**Upload Steps:**
1. Open SharePoint folder (e.g., MPA_Agent_KB/ANL/)
2. Click "Upload" > "Files"
3. Select all .txt files from corresponding source folder
4. Wait for upload to complete
5. Verify file count matches expected
6. Repeat for each agent

### Step 3.3: Pre-Configured SharePoint Folder URLs

The following SharePoint folder URLs are pre-configured in `.env.mastercard`:

- **MPA KB:** https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgCZ7qTFJCgASKcb204jJRn0AfB5alCc74AMyE2etdchqA4?e=urKrHq
- **CA KB:** https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/IgDzc0ufDknYTpTghwRGqCXGAUvoLc-7BLhVv8c7TrZEPAI?e=JrfOGP
- **EAP KB:** https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgAMlDUM-pK9Rqol_B77NT8JAWaSvFONRHLabpRleGIwxko?e=24fqOR

---

## PHASE 4: COPILOT STUDIO AGENT CONFIGURATION

**Priority:** HIGH - Core agent functionality
**Dependencies:** Phase 3 complete (KB files in SharePoint)

### Step 4.1: Access Copilot Studio

Navigate to: https://copilotstudio.microsoft.com

Select the Mastercard environment:
- Tenant ID: f06fa858-824b-4a85-aacb-f372cfdc282e
- Environment ID: ea9d500a-9299-e7b2-8754-53ebea0cb818

### Step 4.2: Create/Configure Agents

For each agent (ORC, ANL, AUD, CHA, SPO, DOC, PRF, CHG, CST, MKT):

1. **Create New Agent** (or open existing)
   - Name: `MPA {Agent Name} Agent v6.0`
   - Example: `MPA Analytics Agent v6.0`

2. **Upload Instructions**
   - Source: `release/v6.0/solutions/agents/{code}/instructions/{CODE}_Copilot_Instructions_v1.txt`
   - Paste into "Instructions" field in Copilot Studio
   - Character limit: 7,500-8,000 characters

3. **Connect Knowledge Source**
   - Add SharePoint as knowledge source
   - Point to: `MPA_Agent_KB/{AGENT_CODE}/`
   - Enable "Use knowledge in responses"

4. **Configure Topics** (if custom topics exist)
   - Import from: `release/v6.0/agents/{code}/topics/`

5. **Test Agent**
   - Use built-in test pane
   - Verify KB retrieval works
   - Test sample queries

### Step 4.3: Agent Instruction Files

| Agent | Instruction File |
|-------|------------------|
| ORC | `ORC_Copilot_Instructions_v1.txt` |
| ANL | `ANL_Copilot_Instructions_v1.txt` |
| AUD | `AUD_Copilot_Instructions_v1.txt` |
| CHA | `CHA_Copilot_Instructions_v1.txt` |
| SPO | `SPO_Copilot_Instructions_v1.txt` |
| DOC | `DOC_Copilot_Instructions_v1.txt` |
| PRF | `PRF_Copilot_Instructions_v1.txt` |
| CHG | `CHG_Copilot_Instructions_v1.txt` |
| CST | `CST_Copilot_Instructions_v1.txt` |
| MKT | `MKT_Copilot_Instructions_v1.txt` |

---

## PHASE 5: POWER AUTOMATE FLOW DEPLOYMENT

**Priority:** MEDIUM - Enables automation
**Dependencies:** Phase 1 complete (Dataverse tables exist)

### Step 5.1: Flow Files Location

**Solution-Ready Flows:** `release/v6.0/platform/flows/solution-ready/`

Total: 25 flows ready for import

### Step 5.2: Flow Import Method

**Option A - Import as Solution Component:**

1. Go to: https://make.powerautomate.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818
2. Navigate to "Solutions"
3. Open or create a solution for MPA flows
4. Click "Add existing" > "Automation" > "Cloud flow"
5. Import each JSON file

**Option B - Import Individual Flows:**

1. Go to Power Automate
2. Click "Import" > "Import package"
3. Upload flow JSON file
4. Configure connections
5. Import and activate

### Step 5.3: Flow Inventory

| Flow Name | Agent | File |
|-----------|-------|------|
| MPARouteToSpecialist | ORC | MPARouteToSpecialist-268F3713-FF44-4A79-83D0-8E58FE278E07.json |
| MPAGetSessionState | ORC | MPAGetSessionState-EDFEB9FB-5BDA-4509-AB9E-FAED1C4BB3EE.json |
| MPAUpdateProgress | ORC | MPAUpdateProgress-8314DEFC-7608-4381-9E77-CE5F2E3780FA.json |
| MPACalculateProjection | ANL | MPACalculateProjection-ADDA0BDE-3889-4F02-A87F-00B5E7905880.json |
| MPARunScenario | ANL | MPARunScenario-091176BD-FD8A-479D-B52F-D90FFE4F92B4.json |
| MPASegmentAudience | AUD | MPASegmentAudience-4ED4C720-4627-4BEC-AC45-9D08F187B7C0.json |
| MPACalculateLTV | AUD | MPACalculateLTV-87DB092C-7455-4CA5-B9FB-4777FBAF97D2.json |
| MPACalculateAllocation | CHA | MPACalculateAllocation-4C24FE73-4350-4EB9-BD3D-2452614775E0.json |
| MPALookupBenchmarks | CHA | MPALookupBenchmarks-008E68B3-52F5-4547-B6D5-C32BF39FDA6B.json |
| MPACalculateNBI | SPO | MPACalculateNBI-81D37957-8E59-4712-9D45-EF3A9955D1D7.json |
| MPAAnalyzeFees | SPO | MPAAnalyzeFees-9585C3FF-7097-47BD-9F79-F3D037B60B27.json |
| MPAEvaluatePartner | SPO | MPAEvaluatePartner-7C4E5AEE-CA2F-48A3-9E9A-587001A01746.json |
| MPAGenerateDocument | DOC | MPAGenerateDocument-CA6A84C9-5A53-4455-A955-A886E3B98D18.json |
| MPAAnalyzePerformance | PRF | MPAAnalyzePerformance-89410582-D3FD-4068-B6EB-9C21FC3E8C07.json |
| MPADetectAnomalies | PRF | MPADetectAnomalies-51A444CC-6815-4AB1-98F1-9FD5FD2D591E.json |
| MPAExtractLearnings | PRF | MPAExtractLearnings-FAA7CAB7-5643-42B6-A0E1-59C30ACB0F7F.json |
| MPAAssessReadiness | CHG | MPAAssessReadiness-E5D8D4B8-A19A-44D8-93E2-6F0AB1274758.json |
| MPAMapStakeholders | CHG | MPAMapStakeholders-74BE0010-866C-4A3C-9C6E-5122ADF132BA.json |
| MPAPlanAdoption | CHG | MPAPlanAdoption-91134CAB-DC67-4AD7-B77E-5759396FCD0F.json |
| MPASelectFramework | CST | MPASelectFramework-9C4D6DDB-CAAC-4893-8216-05F4043F680B.json |
| MPAApplyAnalysis | CST | MPAApplyAnalysis-68794A87-63CA-4B7B-949B-81E978ACBADF.json |
| MPAPrioritizeInitiatives | CST | MPAPrioritizeInitiatives-90EDF890-3403-4686-A1E4-1D1E8163D858.json |
| MPADevelopStrategy | MKT | MPADevelopStrategy-B58A063D-BBCA-431F-B37B-EAC6A9E37971.json |
| MPACreateBrief | MKT | MPACreateBrief-AEE62237-4012-4B21-8973-641988266263.json |
| MPAAnalyzeCompetitive | MKT | MPAAnalyzeCompetitive-758504A6-86DF-4681-919E-531E831221C6.json |

### Step 5.4: Configure Flow Connections

After importing flows, configure connections for:
- Dataverse connector -> MC Dataverse environment
- SharePoint connector -> MC SharePoint
- AI Builder connector (if used)

---

## PHASE 6: AI BUILDER PROMPT DEPLOYMENT

**Priority:** MEDIUM - Enables AI capabilities
**Dependencies:** Phase 1 complete

### Step 6.1: Prompt Files Location

**Prompts Directory:** `base/platform/eap/prompts/`

Total: 83 prompt definition files

### Step 6.2: Deployment Script

Use the provided deployment script:

```bash
python release/v6.0/scripts/deploy_ai_builder_prompts.py \
    --environment https://orgcc6eaaec.crm.dynamics.com \
    --prompts-dir base/platform/eap/prompts/
```

### Step 6.3: Manual Prompt Creation

If script cannot be used, create prompts manually in AI Builder:

1. Go to: https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818
2. Navigate to "AI Builder" > "Prompts"
3. Click "Create prompt"
4. Copy content from prompt definition file
5. Configure input/output schema
6. Save and test

---

## PHASE 7: INTEGRATION TESTING

**Priority:** HIGH - Validate deployment
**Dependencies:** Phases 1-6 complete

### Step 7.1: Dataverse Validation

Verify all tables have expected row counts:

```sql
-- Run in Dataverse SQL endpoint or FetchXML
SELECT COUNT(*) FROM mpa_vertical   -- Expected: 15
SELECT COUNT(*) FROM mpa_channel    -- Expected: 30
SELECT COUNT(*) FROM mpa_kpi        -- Expected: 24
SELECT COUNT(*) FROM mpa_benchmark  -- Expected: 31
SELECT COUNT(*) FROM ca_framework   -- Expected: 60
```

### Step 7.2: Agent Routing Tests

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

### Step 7.3: KB Retrieval Tests

For each agent, verify KB retrieval:
1. Ask domain-specific question
2. Verify response cites KB content
3. Check source attribution

### Step 7.4: Flow Execution Tests

Test critical flows:
1. Trigger flow manually
2. Verify Dataverse operations work
3. Check error handling

---

## PHASE 8: POST-DEPLOYMENT VALIDATION

**Priority:** CRITICAL - Final verification
**Dependencies:** All phases complete

### Step 8.1: Deployment Checklist

```
[ ] All 28 Dataverse tables exist and are accessible
[ ] All seed data imported with correct row counts
[ ] All KB documents uploaded to SharePoint
[ ] All 10 Copilot Studio agents configured with instructions
[ ] All agent KB sources connected
[ ] All 25 Power Automate flows imported and activated
[ ] AI Builder prompts deployed
[ ] Routing tests pass (9/9)
[ ] KB retrieval tests pass (10/10)
[ ] Flow execution tests pass
```

### Step 8.2: Environment Variables Check

Verify these environment variables are set in MC environment:
- AZURE_TENANT_ID
- DATAVERSE_ENVIRONMENT_URL
- SHAREPOINT_SITE_URL

### Step 8.3: Sign-Off

Document deployment completion:
- Date completed: _______________
- Deployed by: _______________
- Verified by: _______________
- Issues encountered: _______________

---

## TROUBLESHOOTING

### Common Issues

**Solution Import Fails - Missing Components:**
- Cause: Tables not in solution
- Fix: Use PAC CLI to add missing tables to solution before export

**Seed Data Import Fails:**
- Cause: Foreign key constraint violation
- Fix: Import in correct dependency order (Tier 1 -> 2 -> 3)

**KB Not Retrieved:**
- Cause: SharePoint connection not configured
- Fix: Re-add SharePoint as knowledge source in Copilot Studio

**Flow Fails - Connection Error:**
- Cause: Connection references not configured
- Fix: Update connection references in flow settings

---

## SUPPORT CONTACTS

For deployment issues:
- Technical Support: [Your contact]
- Repository: Kessel-Digital-Agent-Platform
- Branch: deploy/mastercard

---

**Document Version:** 1.0
**Created:** 2026-01-21
**Author:** Claude Code
