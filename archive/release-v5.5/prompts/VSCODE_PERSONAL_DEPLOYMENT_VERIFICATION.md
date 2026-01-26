# VS CODE CLAUDE PROMPT: MPA V5.5 PERSONAL DEPLOYMENT VERIFICATION AND COMPLETION

## CRITICAL CONTEXT

You are completing the MPA v5.5 deployment to the Aragorn AI environment. IMPORTANT: Much of this work may already be complete from previous sessions. Your job is to:

1. VERIFY what exists before creating anything
2. ONLY create/deploy what is missing
3. Report status clearly

## ENVIRONMENT DETAILS

```
Dataverse URL: https://aragornai.crm.dynamics.com
API URL: https://aragornai.api.crm.dynamics.com/api/data/v9.2
Azure Functions: https://func-aragorn-mpa.azurewebsites.net
SharePoint: https://kesseldigitalcom.sharepoint.com/sites/KesselDigital
Copilot Studio Environment: c672b470-9cc7-e9d8-a0e2-ca83751f800c
```

## REPO LOCATIONS

```
Platform Repo: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
MPA Repo: /Users/kevinbauer/Kessel-Digital/Media_Planning_Agent
```

---

## PHASE 1: DATAVERSE TABLE VERIFICATION

### Step 1.1: Check Existing Tables

First, verify which tables already exist in Dataverse. Use the Dataverse Web API or Power Apps maker portal.

EXPECTED EAP TABLES (5):
- eap_session
- eap_user
- eap_client
- eap_featureflag
- eap_agentregistry

EXPECTED MPA TABLES (6):
- mpa_mediaplan
- mpa_plansection
- mpa_benchmark
- mpa_vertical
- mpa_channel
- mpa_kpi

### Step 1.2: Report Table Status

Create a status report showing:
```
TABLE STATUS REPORT
-------------------
[EXISTS/MISSING] eap_session
[EXISTS/MISSING] eap_user
[EXISTS/MISSING] eap_client
[EXISTS/MISSING] eap_featureflag
[EXISTS/MISSING] eap_agentregistry
[EXISTS/MISSING] mpa_mediaplan
[EXISTS/MISSING] mpa_plansection
[EXISTS/MISSING] mpa_benchmark
[EXISTS/MISSING] mpa_vertical
[EXISTS/MISSING] mpa_channel
[EXISTS/MISSING] mpa_kpi
```

### Step 1.3: Create ONLY Missing Tables

If any tables are missing, create them using schemas from:
- EAP: `/Kessel-Digital-Agent-Platform/release/v5.5/platform/eap-core/base/schema/tables/`
- MPA: `/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/schema/`

DO NOT recreate tables that already exist.

---

## PHASE 2: SEED DATA VERIFICATION

### Step 2.1: Check Existing Data

Query each reference table to check record counts:

```
SEED DATA STATUS
----------------
mpa_benchmark: [COUNT] records (expected: ~794)
mpa_channel: [COUNT] records (expected: ~42)
mpa_kpi: [COUNT] records (expected: ~42)
mpa_vertical: [COUNT] records (expected: ~12)
eap_featureflag: [COUNT] records (expected: ~24)
eap_agentregistry: [COUNT] records (expected: ~2, MPA + CA placeholder)
```

### Step 2.2: Import ONLY Missing Data

If record counts are significantly below expected:
- Seed data CSVs are at: `/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/data/seed/`
- Feature flags CSV at: `/Kessel-Digital-Agent-Platform/release/v5.5/platform/config/feature_flags.csv`

Use the import script at: `/Kessel-Digital-Agent-Platform/release/v5.5/scripts/seed_data_import.py`

DO NOT reimport data that already exists (will cause duplicates).

---

## PHASE 3: POWER AUTOMATE FLOW VERIFICATION

### Step 3.1: Check Existing Flows

List all flows in the environment. Look for flows matching these names:

EXPECTED MPA FLOWS (11):
- MPA - Create Session (or MPA_CreateSession)
- MPA - Process Media Brief
- MPA - Update Plan Data
- MPA - Run Projections
- MPA - Validate Gate
- MPA - Generate Document
- MPA - Get Plan Summary
- MPA - Search Benchmarks
- MPA - Calculate Gap
- MPA - Calculate Budget Allocation
- MPA - Log Error

EXPECTED EAP FLOW (1):
- EAP - Initialize Session

### Step 3.2: Report Flow Status

```
FLOW STATUS REPORT
------------------
[EXISTS/MISSING/BROKEN] MPA - Create Session
[EXISTS/MISSING/BROKEN] MPA - Process Media Brief
... (list all)
[EXISTS/MISSING/BROKEN] EAP - Initialize Session

BROKEN = Flow exists but has errors or missing connections
```

### Step 3.3: Fix or Create ONLY What's Needed

- If flow EXISTS and WORKS: Skip it
- If flow is BROKEN: Fix connection references
- If flow is MISSING: Create from definition in `/release/v5.5/agents/mpa/base/flows/definitions/`

Flow build guide: `/release/v5.5/scripts/deployment/POWER_AUTOMATE_FLOW_BUILD_GUIDE.md`

---

## PHASE 4: SHAREPOINT KB VERIFICATION

### Step 4.1: Check KB Library

1. Navigate to: https://kesseldigitalcom.sharepoint.com/sites/KesselDigital
2. Check if "MediaPlanningKB" document library exists
3. If exists, count files and check versions

EXPECTED: 22 files with _v5_5 suffix

### Step 4.2: Report KB Status

```
SHAREPOINT KB STATUS
--------------------
Library Exists: [YES/NO]
File Count: [COUNT] (expected: 22)
Files with v5_5 version: [COUNT]
Files with older versions: [LIST]
Missing files: [LIST]
```

### Step 4.3: Upload ONLY Missing/Outdated Files

- KB files at: `/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb/`
- Delete any v5_1, v5_2, v5_3 versions before uploading v5_5
- Upload script: `/release/v5.5/scripts/upload_kb_files.py`

---

## PHASE 5: COPILOT STUDIO VERIFICATION

### Step 5.1: Check Agent Configuration

1. Open Copilot Studio: https://copilotstudio.microsoft.com
2. Select environment: c672b470-9cc7-e9d8-a0e2-ca83751f800c
3. Find "Media Planning Agent" (or similar name)

### Step 5.2: Report Agent Status

```
COPILOT STUDIO STATUS
---------------------
Agent Exists: [YES/NO]
Agent Name: [NAME]
Instructions Version: [CHECK for v5.5 references]
KB Connected: [YES/NO] - Library: [NAME]
Flow Actions Configured: [COUNT] (expected: 11-12)
Topics Configured: [COUNT]
Published: [YES/NO]
```

### Step 5.3: Update ONLY What's Needed

IF agent exists but needs update:
- Instructions file: `/release/v5.5/agents/mpa/base/copilot/MPA_v55_Instructions_Uplift.txt`
- Verify KB connection points to MediaPlanningKB
- Add any missing flow actions

IF agent doesn't exist:
- Create new agent
- Paste full instructions
- Configure KB and flows

---

## PHASE 6: AZURE FUNCTIONS VERIFICATION

### Step 6.1: Health Check

Call the health endpoint:
```bash
curl https://func-aragorn-mpa.azurewebsites.net/api/health
```

### Step 6.2: Report Function Status

```
AZURE FUNCTIONS STATUS
----------------------
Health Check: [PASS/FAIL]
Response: [RESPONSE]

If health check fails, check:
- Function App running in Azure Portal
- Application settings configured
- Connection strings valid
```

Azure Functions should already be fully deployed. If issues exist, they are likely configuration, not deployment.

---

## FINAL DELIVERABLE

After completing all phases, provide a summary:

```
================================================================================
MPA V5.5 DEPLOYMENT STATUS - ARAGORN AI
================================================================================

DATAVERSE TABLES:     [X/11] Complete
SEED DATA:            [COMPLETE/PARTIAL/MISSING]
POWER AUTOMATE FLOWS: [X/12] Complete
SHAREPOINT KB:        [X/22] Files uploaded, indexing [COMPLETE/PENDING]
COPILOT STUDIO:       [CONFIGURED/NEEDS WORK]
AZURE FUNCTIONS:      [HEALTHY/ISSUES]

ACTIONS TAKEN THIS SESSION:
- [List what you actually did]

REMAINING WORK:
- [List anything still pending]

READY FOR TESTING: [YES/NO]
================================================================================
```

---

## IMPORTANT RULES

1. VERIFY BEFORE ACTING - Check what exists before creating anything
2. NO DUPLICATES - Never reimport data or recreate existing resources
3. INCREMENTAL - Only do what is needed to reach 100% completion
4. REPORT CLEARLY - Always show what exists vs what you changed
5. ASK IF UNSURE - If you cannot verify something, ask before proceeding
