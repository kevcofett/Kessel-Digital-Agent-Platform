# VS CODE CLAUDE: CONTINUATION PROMPT - MPA V5.5 DEPLOYMENT

================================================================================
CRITICAL INSTRUCTIONS - READ BEFORE EXECUTING ANYTHING
================================================================================

DO NOT use memories or prior context from previous conversations.
DO NOT assume you know what was completed.
DO NOT repeat work that status files indicate is already done.
DO NOT make assumptions - READ STATUS FILES FIRST.

This prompt is for resuming interrupted or incomplete deployment verification.
Your job is to assess current state, complete remaining work, and ensure git is updated.

================================================================================
SITUATION CONTEXT
================================================================================

An MPA v5.5 deployment verification process may have been interrupted or incomplete.
The process was organized into 13 phases across two objectives:

OBJECTIVE 1 (Phases 1-8): Personal Environment Verification (Aragorn AI)
OBJECTIVE 2 (Phases 9-12): Mastercard Transfer Package Preparation
Phase 13: Final Summary Generation

Status files are created as each phase completes. Your first task is to determine
what was already completed by reading these status files.

================================================================================
STEP 1: ASSESS CURRENT STATE
================================================================================

Run these commands to understand what exists:

```bash
# Check deployment status files
echo "=== DEPLOYMENT STATUS FILES ==="
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/

# Read any existing status files
echo "=== STATUS FILE CONTENTS ==="
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/*.md 2>/dev/null || echo "No status files found"

# Check for overnight summary
echo "=== OVERNIGHT SUMMARY ==="
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/OVERNIGHT_EXECUTION_SUMMARY.md 2>/dev/null || echo "No overnight summary found"

# Check transfer verification
echo "=== TRANSFER VERIFICATION ==="
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/transfer-packages/mastercard/TRANSFER_VERIFICATION.md 2>/dev/null || echo "No transfer verification found"

# Check git status
echo "=== GIT STATUS ==="
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git status
git log --oneline -5
git branch -vv
```

================================================================================
STEP 2: DETERMINE COMPLETION STATE
================================================================================

Based on files found in Step 1, mark which phases are complete:

| Phase | Required Status File | Complete? |
|-------|---------------------|-----------|
| 1-2 | DATAVERSE_TABLE_STATUS.md | [ ] |
| 3 | AZURE_FUNCTIONS_STATUS.md | [ ] |
| 4 | SHAREPOINT_KB_STATUS.md | [ ] |
| 5 | POWER_AUTOMATE_STATUS.md | [ ] |
| 6 | COPILOT_STUDIO_STATUS.md | [ ] |
| 7 | DEPLOYMENT_SUMMARY.md | [ ] |
| 8 | Git push to deploy/personal | [ ] |
| 9-11 | TRANSFER_VERIFICATION.md | [ ] |
| 12 | Git merge to main | [ ] |
| 13 | OVERNIGHT_EXECUTION_SUMMARY.md | [ ] |

================================================================================
STEP 3: EXECUTE INCOMPLETE PHASES
================================================================================

For any phase marked incomplete above, execute it using these specifications:

---

### PHASE 1-2: DATAVERSE TABLE VERIFICATION

If DATAVERSE_TABLE_STATUS.md is missing:

1. Query Dataverse for existing tables:
```bash
# Use Azure Functions to verify tables
curl -X GET "https://func-aragorn-mpa.azurewebsites.net/api/health" \
  -H "x-functions-key: lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ=="
```

2. Create status file documenting:
   - Which tables exist
   - Seed data record counts
   - Any missing tables or data

---

### PHASE 3: AZURE FUNCTIONS VERIFICATION

If AZURE_FUNCTIONS_STATUS.md is missing:

1. Test each function endpoint:
```bash
# Health check
curl -X GET "https://func-aragorn-mpa.azurewebsites.net/api/health" \
  -H "x-functions-key: lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ=="

# Benchmark search
curl -X POST "https://func-aragorn-mpa.azurewebsites.net/api/benchmarks/search" \
  -H "x-functions-key: lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==" \
  -H "Content-Type: application/json" \
  -d '{"vertical": "RETAIL"}'
```

2. Create status file documenting:
   - Each function's health status
   - Any authentication issues
   - Recommendations for fixes

---

### PHASE 4: SHAREPOINT KB VERIFICATION

If SHAREPOINT_KB_STATUS.md is missing:

1. Verify local KB files exist:
```bash
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb/
```

2. Count files and verify naming (_v5_5.txt suffix)

3. Create status file documenting:
   - Number of KB files found locally
   - Upload status to SharePoint
   - Indexing status if known

---

### PHASE 5: POWER AUTOMATE FLOW VERIFICATION

If POWER_AUTOMATE_STATUS.md is missing:

1. List flow definitions:
```bash
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/platform/eap-core/base/flows/
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/flows/
```

2. Create status file documenting:
   - Flow definitions found
   - Build status (manual build required in portal)
   - Checklist for user

---

### PHASE 6: COPILOT STUDIO VERIFICATION

If COPILOT_STUDIO_STATUS.md is missing:

1. Verify instructions file:
```bash
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/copilot/MPA_Copilot_Instructions_v5_5.txt | wc -c
```

2. Create status file documenting:
   - Instructions character count (should be ~7,808)
   - Configuration checklist for user
   - KB connection requirements

---

### PHASE 7: DEPLOYMENT SUMMARY

If DEPLOYMENT_SUMMARY.md is missing:

Create comprehensive summary of:
- All verification results
- Issues requiring user action
- Recommendations prioritized by criticality
- Next steps checklist

---

### PHASE 8: GIT COMMIT (deploy/personal)

If changes not committed to deploy/personal:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git add -A
git status
git commit -m "DEPLOY-PERS: MPA v5.5 deployment verification status reports"
git push origin deploy/personal
```

---

### PHASE 9-11: TRANSFER PACKAGE VERIFICATION

If TRANSFER_VERIFICATION.md is missing:

1. Verify all artifacts exist:
```bash
# KB files
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb/*.txt | wc -l

# Seed data
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/platform/eap-core/base/seed-data/*.csv

# Schemas
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/platform/eap-core/base/schema/tables/*.json

# Flow definitions
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/platform/eap-core/base/flows/*.json
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/flows/*.json

# Transfer package
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/transfer-packages/mastercard/
```

2. Create TRANSFER_VERIFICATION.md documenting:
   - All artifact categories verified
   - File counts and validation
   - Ready for Mastercard deployment confirmation

---

### PHASE 12: GIT OPERATIONS (merge to main)

If main branch not updated:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git checkout main
git merge deploy/personal -m "Merge: MPA v5.5 deployment verification and transfer package"
git push origin main
git checkout deploy/personal
```

---

### PHASE 13: OVERNIGHT EXECUTION SUMMARY

If OVERNIGHT_EXECUTION_SUMMARY.md is missing:

Create comprehensive summary at repo root with:
- Mission status (COMPLETE / PARTIAL / FAILED)
- Phase-by-phase completion status
- All files created
- Key findings and issues
- User action items with specific commands
- Git operation status
- Next steps

================================================================================
STEP 4: FINAL GIT VERIFICATION
================================================================================

After completing all phases:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify all changes committed
git status

# Verify deploy/personal is pushed
git log origin/deploy/personal --oneline -3

# Verify main is updated
git log origin/main --oneline -3

# Show current branch
git branch -vv
```

================================================================================
STEP 5: GENERATE COMPLETION REPORT
================================================================================

Create or update OVERNIGHT_EXECUTION_SUMMARY.md with:

```markdown
# MPA v5.5 CONTINUATION EXECUTION SUMMARY

**Execution Date:** [TODAY'S DATE]
**Continuation From:** [WHAT WAS ALREADY DONE]
**Branch:** deploy/personal → main
**Repository:** Kessel-Digital-Agent-Platform

---

## WHAT WAS ALREADY COMPLETE

[List phases that were already done when you started]

## WHAT THIS SESSION COMPLETED

[List phases you completed in this session]

## CURRENT STATUS

| Phase | Status |
|-------|--------|
| 1-2 Dataverse | [DONE/PENDING] |
| 3 Azure Functions | [DONE/PENDING] |
| 4 SharePoint KB | [DONE/PENDING] |
| 5 Power Automate | [DONE/PENDING] |
| 6 Copilot Studio | [DONE/PENDING] |
| 7 Deployment Summary | [DONE/PENDING] |
| 8 Git Push (deploy/personal) | [DONE/PENDING] |
| 9-11 Transfer Package | [DONE/PENDING] |
| 12 Git Merge (main) | [DONE/PENDING] |
| 13 Final Summary | [DONE/PENDING] |

## USER ACTION ITEMS

[List any remaining items requiring user action]

## GIT STATUS

- deploy/personal pushed: [YES/NO]
- main merged and pushed: [YES/NO]
- Latest commit: [HASH]
```

================================================================================
ENVIRONMENT REFERENCE
================================================================================

PERSONAL ENVIRONMENT (ARAGORN AI):
- Tenant ID: 3933d83c-778f-4bf2-b5d7-1eea5844e9a3
- Dataverse URL: https://aragornai.crm.dynamics.com
- Environment ID: c672b470-9cc7-e9d8-a0e2-ca83751f800c
- SharePoint: https://kesseldigitalcom.sharepoint.com/sites/KesselDigital
- KB Library: MediaPlanningKB
- Azure Functions: https://func-aragorn-mpa.azurewebsites.net
- Function Key: lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==

REPOSITORY:
- Path: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
- GitHub: https://github.com/kevcofett/Kessel-Digital-Agent-Platform
- Primary Branch: deploy/personal
- Production Branch: main

KEY DIRECTORIES:
- Status Files: release/v5.5/deployment-status/
- Transfer Package: release/v5.5/transfer-packages/mastercard/
- KB Files: release/v5.5/agents/mpa/base/kb/
- Scripts: release/v5.5/scripts/
- Prompts: release/v5.5/prompts/

================================================================================
EXECUTION COMPLETE CRITERIA
================================================================================

You are done when:

1. [ ] All 13 phases have status files or are confirmed complete
2. [ ] All changes committed to deploy/personal
3. [ ] deploy/personal pushed to origin
4. [ ] main branch merged from deploy/personal
5. [ ] main pushed to origin
6. [ ] OVERNIGHT_EXECUTION_SUMMARY.md exists and is current
7. [ ] Final status printed to console

================================================================================
END OF PROMPT
================================================================================
