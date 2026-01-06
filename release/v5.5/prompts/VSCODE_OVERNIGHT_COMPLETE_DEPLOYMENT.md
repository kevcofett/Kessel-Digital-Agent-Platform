# VS CODE CLAUDE: MPA V5.5 COMPLETE DEPLOYMENT - OVERNIGHT EXECUTION PROMPT

================================================================================
CRITICAL INSTRUCTIONS - READ FIRST
================================================================================

DO NOT use any memories, context, or information from previous conversations.
DO NOT assume anything is complete or incomplete based on prior sessions.
DO NOT reference any past work or previous attempts.

START FRESH. VERIFY EVERYTHING. TRUST ONLY WHAT YOU CAN CONFIRM EXISTS RIGHT NOW.

This prompt contains ALL information you need. Do not search for additional context.

================================================================================
MISSION OVERVIEW
================================================================================

You have TWO objectives tonight:

OBJECTIVE 1: Complete MPA v5.5 deployment to Personal Environment (Aragorn AI)
OBJECTIVE 2: Prepare Mastercard transfer package and push to main branch

Execute phases in order. Complete each phase fully before moving to the next.
Push to git after completing each major objective.

================================================================================
REPOSITORY LOCATIONS
================================================================================

PRIMARY REPO (use this for all work):
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

LEGACY REPO (reference only, do not modify):
/Users/kevinbauer/Kessel-Digital/Media_Planning_Agent

GITHUB REMOTE:
https://github.com/kevcofett/Kessel-Digital-Agent-Platform

CURRENT BRANCH: deploy/personal

================================================================================
ENVIRONMENT CONFIGURATION - PERSONAL (ARAGORN AI)
================================================================================

Tenant ID: 3933d83c-778f-4bf2-b5d7-1eea5844e9a3
Tenant Name: kesseldigitalcom.onmicrosoft.com

Dataverse URL: https://aragornai.crm.dynamics.com
Dataverse API: https://aragornai.api.crm.dynamics.com/api/data/v9.2
Environment ID: c672b470-9cc7-e9d8-a0e2-ca83751f800c
Organization ID: d53abdc5-f7e7-f011-aa23-6045bd003938
Publisher Prefix: eap (for EAP tables) and mpa (for MPA tables)

SharePoint Site: https://kesseldigitalcom.sharepoint.com/sites/KesselDigital
KB Library Name: MediaPlanningKB

Azure Functions URL: https://func-aragorn-mpa.azurewebsites.net
Function Key: lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==

Copilot Studio: https://copilotstudio.microsoft.com/environments/c672b470-9cc7-e9d8-a0e2-ca83751f800c

================================================================================
================================================================================
OBJECTIVE 1: PERSONAL ENVIRONMENT DEPLOYMENT
================================================================================
================================================================================

================================================================================
PHASE 1: DATAVERSE TABLE VERIFICATION
================================================================================

STEP 1.1: Query Existing Tables
-------------------------------

Use the Dataverse Web API to list all custom tables. You need to check if these 11 tables exist:

EAP PLATFORM TABLES (5):
- eap_session
- eap_user  
- eap_client
- eap_featureflag
- eap_agentregistry

MPA AGENT TABLES (6):
- mpa_mediaplan
- mpa_plansection
- mpa_benchmark
- mpa_vertical
- mpa_channel
- mpa_kpi

API Call to list tables:
```
GET https://aragornai.api.crm.dynamics.com/api/data/v9.2/EntityDefinitions?$select=LogicalName,DisplayName&$filter=IsCustomEntity eq true
```

STEP 1.2: Create Status Report
------------------------------

Create a file at: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/DATAVERSE_TABLE_STATUS.md

Format:
```
# DATAVERSE TABLE STATUS
Generated: [TIMESTAMP]

## EAP Tables
| Table | Status | Record Count |
|-------|--------|--------------|
| eap_session | EXISTS/MISSING | [count] |
| eap_user | EXISTS/MISSING | [count] |
| eap_client | EXISTS/MISSING | [count] |
| eap_featureflag | EXISTS/MISSING | [count] |
| eap_agentregistry | EXISTS/MISSING | [count] |

## MPA Tables
| Table | Status | Record Count |
|-------|--------|--------------|
| mpa_mediaplan | EXISTS/MISSING | [count] |
| mpa_plansection | EXISTS/MISSING | [count] |
| mpa_benchmark | EXISTS/MISSING | [count] |
| mpa_vertical | EXISTS/MISSING | [count] |
| mpa_channel | EXISTS/MISSING | [count] |
| mpa_kpi | EXISTS/MISSING | [count] |
```

STEP 1.3: Create Missing Tables ONLY
------------------------------------

IF any tables are MISSING, create them using these schema files:

EAP Schemas: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/platform/eap-core/base/schema/tables/
- eap_session.json
- eap_user.json
- eap_client.json
- eap_featureflag.json
- eap_agentregistry.json

MPA Schemas: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/schema/
- Check for mpa_*.json files

DO NOT recreate tables that already exist.

Use Power Apps maker portal or Dataverse Web API to create tables.

================================================================================
PHASE 2: SEED DATA VERIFICATION
================================================================================

STEP 2.1: Query Record Counts
-----------------------------

For each reference table that EXISTS, query the record count:

```
GET https://aragornai.api.crm.dynamics.com/api/data/v9.2/mpa_benchmarks?$count=true&$top=0
GET https://aragornai.api.crm.dynamics.com/api/data/v9.2/mpa_channels?$count=true&$top=0
GET https://aragornai.api.crm.dynamics.com/api/data/v9.2/mpa_kpis?$count=true&$top=0
GET https://aragornai.api.crm.dynamics.com/api/data/v9.2/mpa_verticals?$count=true&$top=0
GET https://aragornai.api.crm.dynamics.com/api/data/v9.2/eap_featureflags?$count=true&$top=0
GET https://aragornai.api.crm.dynamics.com/api/data/v9.2/eap_agentregistries?$count=true&$top=0
```

EXPECTED COUNTS:
- mpa_benchmark: ~794 records
- mpa_channel: ~42 records
- mpa_kpi: ~42 records
- mpa_vertical: ~12 records
- eap_featureflag: ~24 records
- eap_agentregistry: ~2 records (MPA, CA)

STEP 2.2: Update Status Report
------------------------------

Add to DATAVERSE_TABLE_STATUS.md:

```
## Seed Data Status
| Table | Expected | Actual | Status |
|-------|----------|--------|--------|
| mpa_benchmark | ~794 | [count] | OK/LOW/EMPTY |
| mpa_channel | ~42 | [count] | OK/LOW/EMPTY |
| mpa_kpi | ~42 | [count] | OK/LOW/EMPTY |
| mpa_vertical | ~12 | [count] | OK/LOW/EMPTY |
| eap_featureflag | ~24 | [count] | OK/LOW/EMPTY |
| eap_agentregistry | ~2 | [count] | OK/LOW/EMPTY |
```

STEP 2.3: Import Missing Seed Data ONLY
---------------------------------------

IF any table has significantly fewer records than expected (less than 50% of expected):

Seed data CSV files are at:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/data/seed/
- mpa_benchmark_seed.csv
- mpa_channel_seed.csv
- mpa_kpi_seed.csv
- mpa_vertical_seed.csv

Feature flags CSV:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/platform/config/feature_flags.csv

Import script:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/scripts/seed_data_import.py

CRITICAL: Do NOT reimport data to tables that already have data. This will create duplicates.

================================================================================
PHASE 3: AZURE FUNCTIONS VERIFICATION
================================================================================

STEP 3.1: Health Check
----------------------

Call the health endpoint:

```bash
curl -X GET "https://func-aragorn-mpa.azurewebsites.net/api/health?code=lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ=="
```

STEP 3.2: Test Key Functions
----------------------------

Test SearchBenchmarks:
```bash
curl -X POST "https://func-aragorn-mpa.azurewebsites.net/api/benchmarks/search?code=lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==" \
  -H "Content-Type: application/json" \
  -d '{"vertical": "RETAIL", "channel": "PAID_SEARCH", "limit": 5}'
```

STEP 3.3: Document Function Status
----------------------------------

Create file: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/AZURE_FUNCTIONS_STATUS.md

```
# AZURE FUNCTIONS STATUS
Generated: [TIMESTAMP]
Base URL: https://func-aragorn-mpa.azurewebsites.net

## Health Check
Status: [PASS/FAIL]
Response: [response body]

## Function Tests
| Function | Endpoint | Status | Notes |
|----------|----------|--------|-------|
| HealthCheck | /api/health | [PASS/FAIL] | |
| SearchBenchmarks | /api/benchmarks/search | [PASS/FAIL] | |
| CalculateBudgetAllocation | /api/allocation | [NOT TESTED] | |
| CalculateGap | /api/gap | [NOT TESTED] | |
| RunProjections | /api/projections | [NOT TESTED] | |
| ValidateGate | /api/validate-gate | [NOT TESTED] | |
| GenerateDocument | /api/document | [NOT TESTED] | |
| SessionManager | /api/session | [NOT TESTED] | |
| CheckFeatureEnabled | /api/features/{flag} | [NOT TESTED] | |
| CalculateSPO | /api/spo | [NOT TESTED] | |
| GenerateMediaPlanDocument | /api/generate-media-plan-document | [NOT TESTED] | |
| WarmupTrigger | (timer trigger) | [N/A] | |
```

Azure Functions should already be deployed. If health check fails, note the error but continue.

================================================================================
PHASE 4: SHAREPOINT KB VERIFICATION
================================================================================

STEP 4.1: Check Library Exists
------------------------------

SharePoint Site: https://kesseldigitalcom.sharepoint.com/sites/KesselDigital
Expected Library: MediaPlanningKB

Use SharePoint REST API or Graph API to check:
```
GET https://graph.microsoft.com/v1.0/sites/kesseldigitalcom.sharepoint.com:/sites/KesselDigital:/lists
```

STEP 4.2: List Files in Library
-------------------------------

If library exists, list all files:
```
GET https://graph.microsoft.com/v1.0/sites/{site-id}/lists/{list-id}/items?$expand=fields
```

EXPECTED FILES (22 total, all with _v5_5 suffix):
1. AI_ADVERTISING_GUIDE_v5_5.txt
2. Analytics_Engine_v5_5.txt
3. BRAND_PERFORMANCE_FRAMEWORK_v5_5.txt
4. Confidence_Level_Framework_v5_5.txt
5. Data_Provenance_Framework_v5_5.txt
6. FIRST_PARTY_DATA_STRATEGY_v5_5.txt
7. Gap_Detection_Playbook_v5_5.txt
8. MEASUREMENT_FRAMEWORK_v5_5.txt
9. MPA_Conversation_Examples_v5_5.txt
10. MPA_Expert_Lens_Audience_Strategy_v5_5.txt
11. MPA_Expert_Lens_Budget_Allocation_v5_5.txt
12. MPA_Expert_Lens_Channel_Mix_v5_5.txt
13. MPA_Expert_Lens_Measurement_Attribution_v5_5.txt
14. MPA_Implications_Audience_Targeting_v5_5.txt
15. MPA_Implications_Budget_Decisions_v5_5.txt
16. MPA_Implications_Channel_Shifts_v5_5.txt
17. MPA_Implications_Measurement_Choices_v5_5.txt
18. MPA_Implications_Timing_Pacing_v5_5.txt
19. MPA_Supporting_Instructions_v5_5.txt
20. Output_Templates_v5_5.txt
21. RETAIL_MEDIA_NETWORKS_v5_5.txt
22. Strategic_Wisdom_v5_5.txt

STEP 4.3: Document KB Status
----------------------------

Create file: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/SHAREPOINT_KB_STATUS.md

```
# SHAREPOINT KB STATUS
Generated: [TIMESTAMP]
Site: https://kesseldigitalcom.sharepoint.com/sites/KesselDigital
Library: MediaPlanningKB

## Library Status
Exists: [YES/NO]

## File Inventory
| File | Status | Version |
|------|--------|---------|
| AI_ADVERTISING_GUIDE_v5_5.txt | EXISTS/MISSING | v5_5 |
| Analytics_Engine_v5_5.txt | EXISTS/MISSING | v5_5 |
... [list all 22]

## Summary
Total Expected: 22
Total Found: [count]
Missing Files: [list]
Outdated Files: [list any with v5_1, v5_2, v5_3]
```

STEP 4.4: Upload Missing Files ONLY
-----------------------------------

IF library is missing: Create it first
IF files are missing: Upload from /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb/
IF old versions exist (v5_1, v5_2, v5_3): Delete them before uploading v5_5

Upload script: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/scripts/upload_kb_files.py

DO NOT re-upload files that already exist with v5_5 version.

================================================================================
PHASE 5: POWER AUTOMATE FLOW VERIFICATION
================================================================================

STEP 5.1: List Existing Flows
-----------------------------

Use Power Automate Management API or check the portal:
https://make.powerautomate.com/environments/c672b470-9cc7-e9d8-a0e2-ca83751f800c/flows

EXPECTED FLOWS (12 total):

MPA Flows (11):
1. MPA - Create Session (or MPA_CreateSession or similar)
2. MPA - Process Media Brief
3. MPA - Update Plan Data
4. MPA - Run Projections
5. MPA - Validate Gate
6. MPA - Generate Document
7. MPA - Get Plan Summary
8. MPA - Search Benchmarks
9. MPA - Calculate Gap
10. MPA - Calculate Budget Allocation
11. MPA - Log Error

EAP Flow (1):
12. EAP - Initialize Session

STEP 5.2: Check Flow Health
---------------------------

For each flow that exists:
- Is it turned ON?
- Are connections valid (no broken connection icons)?
- Any recent run failures?

STEP 5.3: Document Flow Status
------------------------------

Create file: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/POWER_AUTOMATE_STATUS.md

```
# POWER AUTOMATE FLOW STATUS
Generated: [TIMESTAMP]
Environment: c672b470-9cc7-e9d8-a0e2-ca83751f800c

## Flow Inventory
| Flow Name | Status | State | Connections | Last Run |
|-----------|--------|-------|-------------|----------|
| MPA - Create Session | EXISTS/MISSING | ON/OFF | OK/BROKEN | [date] |
| MPA - Process Media Brief | EXISTS/MISSING | ON/OFF | OK/BROKEN | [date] |
... [list all 12]

## Summary
Total Expected: 12
Total Found: [count]
Working (ON + OK connections): [count]
Broken (OFF or bad connections): [count]
Missing: [count]

## Missing Flows
[List any that need to be created]

## Broken Flows
[List any that need fixing and what is wrong]
```

STEP 5.4: Note Required Actions
-------------------------------

DO NOT attempt to create flows programmatically tonight. 

Instead, document exactly what needs to be done manually:

For each MISSING flow, note:
- Flow name
- Definition file location: /release/v5.5/agents/mpa/base/flows/definitions/flow_XX_*.json
- Brief description of what it does

For each BROKEN flow, note:
- Flow name
- What is broken (connection? action?)
- How to fix it

================================================================================
PHASE 6: COPILOT STUDIO VERIFICATION
================================================================================

STEP 6.1: Check Agent Exists
----------------------------

Navigate to: https://copilotstudio.microsoft.com/environments/c672b470-9cc7-e9d8-a0e2-ca83751f800c

Look for an agent named:
- "Media Planning Agent" or
- "MPA" or
- Similar name

STEP 6.2: Check Agent Configuration
-----------------------------------

IF agent exists, check:
- Instructions: Do they reference v5.5?
- Knowledge: Is SharePoint MediaPlanningKB connected?
- Actions: Are Power Automate flows connected?
- Topics: Are conversation topics configured?
- Published: Is the agent published?

STEP 6.3: Document Agent Status
-------------------------------

Create file: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/COPILOT_STUDIO_STATUS.md

```
# COPILOT STUDIO STATUS
Generated: [TIMESTAMP]
Environment: c672b470-9cc7-e9d8-a0e2-ca83751f800c

## Agent Status
Agent Exists: [YES/NO]
Agent Name: [name if exists]
Agent ID: [id if exists]

## Configuration
| Component | Status | Details |
|-----------|--------|---------|
| Instructions | [CURRENT/OUTDATED/MISSING] | [version reference found] |
| SharePoint KB | [CONNECTED/NOT CONNECTED] | [library name] |
| Flow Actions | [X/12 CONNECTED] | [list connected] |
| Topics | [CONFIGURED/NOT CONFIGURED] | [count] |
| Published | [YES/NO] | [last publish date] |

## Required Actions
[List what needs to be done to complete configuration]
```

STEP 6.4: Note Required Actions
-------------------------------

DO NOT attempt to configure Copilot Studio programmatically tonight.

Document what needs to be done manually:

Instructions file location:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/copilot/MPA_v55_Instructions_Uplift.txt

Character count should be under 8,000.

================================================================================
PHASE 7: CREATE DEPLOYMENT SUMMARY
================================================================================

STEP 7.1: Create Master Status File
-----------------------------------

Create file: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/DEPLOYMENT_SUMMARY.md

```
# MPA V5.5 DEPLOYMENT SUMMARY - PERSONAL ENVIRONMENT
================================================================================
Generated: [TIMESTAMP]
Environment: Aragorn AI (Kessel-Digital)
================================================================================

## OVERALL STATUS: [READY FOR TESTING / NEEDS WORK / BLOCKED]

## Component Status

| Component | Status | Completion | Action Required |
|-----------|--------|------------|-----------------|
| Dataverse Tables | [GREEN/YELLOW/RED] | [X/11] | [Yes/No] |
| Seed Data | [GREEN/YELLOW/RED] | [X/6 tables] | [Yes/No] |
| Azure Functions | [GREEN/YELLOW/RED] | [X/12] | [Yes/No] |
| SharePoint KB | [GREEN/YELLOW/RED] | [X/22 files] | [Yes/No] |
| Power Automate Flows | [GREEN/YELLOW/RED] | [X/12] | [Yes/No] |
| Copilot Studio | [GREEN/YELLOW/RED] | [configured?] | [Yes/No] |

## Actions Completed This Session
- [List everything you actually did]

## Manual Actions Required
- [List everything that still needs human intervention]

## Blocking Issues
- [List any issues that prevent deployment]

## Next Steps for User
1. [First thing user should do]
2. [Second thing]
3. [etc.]

================================================================================
```

================================================================================
PHASE 8: GIT COMMIT AND PUSH - OBJECTIVE 1 COMPLETE
================================================================================

STEP 8.1: Create Deployment Status Directory if Needed
------------------------------------------------------

```bash
mkdir -p /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status
```

STEP 8.2: Stage All Changes
---------------------------

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git add -A
git status
```

STEP 8.3: Commit
----------------

```bash
git commit -m "Deployment verification: Personal environment (Aragorn AI)

Status Reports Generated:
- DATAVERSE_TABLE_STATUS.md
- AZURE_FUNCTIONS_STATUS.md  
- SHAREPOINT_KB_STATUS.md
- POWER_AUTOMATE_STATUS.md
- COPILOT_STUDIO_STATUS.md
- DEPLOYMENT_SUMMARY.md

[Include brief summary of what was found]"
```

STEP 8.4: Push to Remote
------------------------

```bash
git push origin deploy/personal
```

STEP 8.5: Confirm Push
----------------------

Verify the push succeeded. If it fails due to authentication, document the error.

================================================================================
================================================================================
OBJECTIVE 2: MASTERCARD TRANSFER PACKAGE PREPARATION
================================================================================
================================================================================

================================================================================
PHASE 9: VERIFY TRANSFER PACKAGE EXISTS
================================================================================

STEP 9.1: Check Package Contents
--------------------------------

Verify these files exist:

```bash
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/transfer-packages/mastercard/
```

EXPECTED FILES:
- environment.mastercard.json
- feature_flags_corporate.csv
- TRANSFER_INSTRUCTIONS.md

STEP 9.2: Verify Environment Template
-------------------------------------

Read the Mastercard environment file:
```bash
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/transfer-packages/mastercard/environment.mastercard.json
```

Confirm it has {PLACEHOLDER} values for Mastercard-specific configuration:
- {MASTERCARD_TENANT_ID}
- {MASTERCARD_DATAVERSE_URL}
- {MASTERCARD_SHAREPOINT_SITE_URL}
- etc.

STEP 9.3: Verify Feature Flags
------------------------------

```bash
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/transfer-packages/mastercard/feature_flags_corporate.csv
```

Confirm corporate defaults:
- mpa_enable_web_search: false
- mpa_enable_external_api: false
- sec_enable_audit_logging: true
- sec_enable_row_level_security: true

================================================================================
PHASE 10: VERIFY ALL V5.5 ARTIFACTS FOR TRANSFER
================================================================================

STEP 10.1: Verify KB Files
--------------------------

```bash
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb/ | wc -l
```

Should be 22 files.

STEP 10.2: Verify Seed Data
---------------------------

```bash
wc -l /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/data/seed/*.csv
```

Expected:
- mpa_benchmark_seed.csv: ~795 lines
- mpa_channel_seed.csv: ~43 lines
- mpa_kpi_seed.csv: ~43 lines
- mpa_vertical_seed.csv: ~13 lines

STEP 10.3: Verify Flow Definitions
----------------------------------

```bash
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/flows/definitions/ | wc -l
```

Should be 12 files.

STEP 10.4: Verify Copilot Instructions
--------------------------------------

```bash
wc -c /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/copilot/MPA_v55_Instructions_Uplift.txt
```

Should be under 8,000 characters.

STEP 10.5: Verify Azure Functions
---------------------------------

```bash
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/functions/mpa_functions/
```

Should show 12 function directories.

STEP 10.6: Verify EAP Schemas
-----------------------------

```bash
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/platform/eap-core/base/schema/tables/
```

Should show 5 JSON files.

================================================================================
PHASE 11: CREATE TRANSFER VERIFICATION REPORT
================================================================================

Create file: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/transfer-packages/mastercard/TRANSFER_VERIFICATION.md

```
# MASTERCARD TRANSFER PACKAGE VERIFICATION
================================================================================
Generated: [TIMESTAMP]
Source: Kessel-Digital-Agent-Platform v5.5
================================================================================

## PACKAGE STATUS: [READY FOR TRANSFER / INCOMPLETE]

## Package Contents Verification

### Configuration Files
| File | Status | Notes |
|------|--------|-------|
| environment.mastercard.json | [PRESENT/MISSING] | [placeholder count] |
| feature_flags_corporate.csv | [PRESENT/MISSING] | [row count] |
| TRANSFER_INSTRUCTIONS.md | [PRESENT/MISSING] | |

### Knowledge Base Files
Total: [count]/22
Status: [COMPLETE/INCOMPLETE]
Missing: [list any missing]

### Seed Data Files
| File | Lines | Status |
|------|-------|--------|
| mpa_benchmark_seed.csv | [count] | [OK/LOW] |
| mpa_channel_seed.csv | [count] | [OK/LOW] |
| mpa_kpi_seed.csv | [count] | [OK/LOW] |
| mpa_vertical_seed.csv | [count] | [OK/LOW] |

### Flow Definitions
Total: [count]/12
Status: [COMPLETE/INCOMPLETE]
Missing: [list any missing]

### Copilot Instructions
File: MPA_v55_Instructions_Uplift.txt
Size: [count] characters
Status: [OK (<8000) / TOO LARGE]

### Azure Functions
Total: [count]/12
Status: [COMPLETE/INCOMPLETE]
Missing: [list any missing]

### EAP Platform Schemas
Total: [count]/5
Status: [COMPLETE/INCOMPLETE]
Missing: [list any missing]

## Transfer Instructions

The user should:

1. On Mastercard machine, clone:
   git clone https://github.com/kevcofett/Kessel-Digital-Agent-Platform.git Mastercard-Agent-Platform

2. Navigate to transfer package:
   cd Mastercard-Agent-Platform/release/v5.5/transfer-packages/mastercard/

3. Read TRANSFER_INSTRUCTIONS.md for detailed setup steps

4. Replace all {PLACEHOLDER} values in environment.mastercard.json

5. Follow deployment phases in TRANSFER_INSTRUCTIONS.md

================================================================================
```

================================================================================
PHASE 12: FINAL GIT OPERATIONS
================================================================================

STEP 12.1: Stage All Changes
----------------------------

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git add -A
git status
```

Review what will be committed.

STEP 12.2: Commit Transfer Verification
---------------------------------------

```bash
git commit -m "Add Mastercard transfer verification and deployment status reports

Transfer Package:
- TRANSFER_VERIFICATION.md confirms all artifacts present
- Package ready for git clone to Mastercard environment

Deployment Status (Aragorn AI):
- Comprehensive verification of all components
- Status reports for Dataverse, Azure, SharePoint, Flows, Copilot
- Summary of required manual actions

Generated by VS Code Claude overnight execution"
```

STEP 12.3: Push to deploy/personal
----------------------------------

```bash
git push origin deploy/personal
```

STEP 12.4: Merge to main
------------------------

```bash
git checkout main
git pull origin main
git merge deploy/personal -m "Merge deploy/personal: Deployment verification and transfer package"
git push origin main
```

STEP 12.5: Return to deploy/personal
------------------------------------

```bash
git checkout deploy/personal
```

STEP 12.6: Verify All Pushes Succeeded
--------------------------------------

```bash
git log --oneline -5
git branch -vv
```

Confirm:
- deploy/personal is up to date with origin/deploy/personal
- main is up to date with origin/main

================================================================================
PHASE 13: FINAL SUMMARY
================================================================================

Create file: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/OVERNIGHT_EXECUTION_SUMMARY.md

```
# OVERNIGHT EXECUTION SUMMARY
================================================================================
Executed: [TIMESTAMP]
================================================================================

## OBJECTIVE 1: PERSONAL ENVIRONMENT VERIFICATION
Status: [COMPLETE/PARTIAL]

### What Was Verified
- Dataverse Tables: [X/11 exist]
- Seed Data: [status]
- Azure Functions: [health check result]
- SharePoint KB: [X/22 files]
- Power Automate Flows: [X/12 exist]
- Copilot Studio: [status]

### Actions Taken
[List everything done]

### Manual Actions Required
[List everything user needs to do]

## OBJECTIVE 2: MASTERCARD TRANSFER PACKAGE
Status: [COMPLETE/PARTIAL]

### Package Verification
- All artifacts present: [YES/NO]
- Configuration templates ready: [YES/NO]
- Instructions complete: [YES/NO]

### Transfer Instructions for User
1. On Mastercard machine: git clone https://github.com/kevcofett/Kessel-Digital-Agent-Platform.git
2. Read release/v5.5/transfer-packages/mastercard/TRANSFER_INSTRUCTIONS.md
3. Replace placeholders in environment.mastercard.json
4. Deploy following phase-by-phase instructions

## GIT STATUS
- deploy/personal pushed: [YES/NO]
- main merged and pushed: [YES/NO]
- Latest commit: [hash]

## ISSUES ENCOUNTERED
[List any errors or problems]

## RECOMMENDATIONS
[Any suggestions for the user]

================================================================================
```

================================================================================
EXECUTION COMPLETE
================================================================================

When you finish all phases:

1. Ensure all status files are created in /release/v5.5/deployment-status/
2. Ensure TRANSFER_VERIFICATION.md is in /release/v5.5/transfer-packages/mastercard/
3. Ensure OVERNIGHT_EXECUTION_SUMMARY.md is in repo root
4. Ensure all changes are committed and pushed to BOTH deploy/personal AND main
5. Print the contents of OVERNIGHT_EXECUTION_SUMMARY.md as your final output

================================================================================
END OF PROMPT
================================================================================
