# VS CODE DEPLOYMENT INSTRUCTIONS - PERSONAL ENVIRONMENT
# Aragorn AI Development Environment

**Created:** 2026-01-12
**Environment:** Personal (Aragorn AI)
**Purpose:** Deploy MPA, CA, EAP to personal dev/test environment

---

## PREREQUISITES

Before executing, ensure these are configured:

### 1. Authentication
```powershell
# Azure CLI login
az login

# Power Platform CLI login
pac auth create --environment "https://[your-org].crm.dynamics.com"

# PnP PowerShell login
Connect-PnPOnline -Url "https://[your-tenant].sharepoint.com/sites/[your-site]" -Interactive
```

### 2. Environment Variables
Create or update `.env.personal` in repository root:

```
# Personal Environment Configuration
ENVIRONMENT=personal
TENANT_ID=[your-azure-tenant-id]
DATAVERSE_URL=https://[your-org].crm.dynamics.com
SHAREPOINT_SITE=https://[your-tenant].sharepoint.com/sites/AgentKnowledgeBase
SHAREPOINT_LIBRARY=AgentKnowledgeBase
AZURE_SUBSCRIPTION=[your-subscription-id]
AZURE_RESOURCE_GROUP=[your-resource-group]
AZURE_FUNCTION_APP=[your-function-app-name]
COPILOT_ENVIRONMENT_ID=[your-copilot-environment-id]
```

### 3. Required Tools
- Azure CLI (`az`)
- Power Platform CLI (`pac`)
- PnP PowerShell module
- PowerShell 7+

---

## DEPLOYMENT SEQUENCE

Execute in this order. Each step must complete before the next.

### STEP 1: Validate Environment

```powershell
# Run from repository root
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Load environment
$env:ENVIRONMENT = "personal"
. ./release/v5.5/deployment/mastercard/scripts/validate-environment.ps1

# Expected: All checks pass
```

**If validation fails:** Fix the issue before proceeding. Common issues:
- Authentication expired → Re-run az login / pac auth create
- Missing permissions → Contact admin
- Wrong environment → Check .env.personal values

### STEP 2: Deploy SharePoint KB Files

```powershell
# Deploy MPA KB files (32 files)
./release/v5.5/deployment/mastercard/scripts/deploy-sharepoint.ps1 `
    -SourcePath "./release/v5.5/agents/mpa/base/kb" `
    -TargetFolder "MPA" `
    -Environment "personal"

# Deploy CA KB files (35 files)
./release/v5.5/deployment/mastercard/scripts/deploy-sharepoint.ps1 `
    -SourcePath "./release/v5.5/agents/ca/base/kb" `
    -TargetFolder "CA" `
    -Environment "personal"

# Deploy EAP KB files (7 files)
./release/v5.5/deployment/mastercard/scripts/deploy-sharepoint.ps1 `
    -SourcePath "./release/v5.5/platform/eap-core/base/kb" `
    -TargetFolder "EAP" `
    -Environment "personal"
```

**Verify:** Check SharePoint library has correct file counts:
- MPA folder: 32 files
- CA folder: 35 files
- EAP folder: 7 files

### STEP 3: Deploy Dataverse Tables

```powershell
# Deploy core MPA tables
./release/v5.5/deployment/mastercard/scripts/deploy-dataverse.ps1 `
    -SolutionPath "./release/v5.5/agents/mpa/base/dataverse" `
    -Environment "personal"

# Deploy Phase 10 learning tables
./release/v5.5/deployment/mastercard/scripts/deploy-learning-tables.ps1 `
    -Environment "personal"

# Deploy CA tables
./release/v5.5/deployment/mastercard/scripts/deploy-dataverse.ps1 `
    -SolutionPath "./release/v5.5/agents/ca/base/schema/tables" `
    -Environment "personal"

# Deploy EAP base tables
./release/v5.5/deployment/mastercard/scripts/deploy-dataverse.ps1 `
    -SolutionPath "./release/v5.5/platform/eap-core/base/schema/tables" `
    -Environment "personal"
```

**Verify:** In Power Apps, check Dataverse tables exist:
- mpa_* tables (29+)
- ca_* tables (9)
- eap_* tables (46 base)

### STEP 4: Import Seed Data

```powershell
# MPA seed data
pac data import `
    --data "./release/v5.5/agents/mpa/base/data/seed/mpa_vertical_seed.csv" `
    --environment $env:DATAVERSE_URL

pac data import `
    --data "./release/v5.5/agents/mpa/base/data/seed/mpa_kpi_seed.csv" `
    --environment $env:DATAVERSE_URL

pac data import `
    --data "./release/v5.5/agents/mpa/base/data/seed/mpa_channel_seed.csv" `
    --environment $env:DATAVERSE_URL

pac data import `
    --data "./release/v5.5/agents/mpa/base/data/seed/mpa_benchmark_seed.csv" `
    --environment $env:DATAVERSE_URL

# CA seed data (if exists)
# pac data import --data "./release/v5.5/agents/ca/base/seed_data/*.csv" --environment $env:DATAVERSE_URL
```

**Verify:** Query Dataverse tables to confirm row counts match CSV files.

### STEP 5: Deploy Power Automate Flows

```powershell
# Deploy MPA flows (13 flows)
./release/v5.5/deployment/mastercard/scripts/deploy-flows.ps1 `
    -FlowsPath "./release/v5.5/agents/mpa/base/flows/specifications" `
    -Environment "personal"

# Deploy Phase 10 learning flows
./release/v5.5/deployment/mastercard/scripts/deploy-learning-flows.ps1 `
    -Environment "personal"

# Deploy CA flows (8 flows)
./release/v5.5/deployment/mastercard/scripts/deploy-flows.ps1 `
    -FlowsPath "./release/v5.5/agents/ca/base/schema/flows" `
    -Environment "personal"
```

**MANUAL STEP REQUIRED:** After flow import, update connection references:
1. Open Power Automate
2. Find each imported flow
3. Edit → Update connections (Dataverse, SharePoint, HTTP)
4. Save and enable flow

### STEP 6: Deploy Azure Functions (Optional)

```powershell
# Only if Azure Functions are configured
./release/v5.5/deployment/mastercard/scripts/deploy-azure-functions.ps1 `
    -Environment "personal"
```

**Verify:** Test function endpoints return 200 OK.

---

## MANUAL STEPS - COPILOT STUDIO

These cannot be automated and must be done in Copilot Studio UI.

### MPA Agent Configuration

1. **Open Copilot Studio** → Create or open MPA agent

2. **Paste Instructions**
   - Go to Settings → Instructions
   - Copy content from: `/release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt`
   - Paste and Save
   - Verify under 8,000 characters

3. **Connect Knowledge Source**
   - Go to Knowledge → Add
   - Select SharePoint
   - Site: [Your SharePoint site]
   - Library: AgentKnowledgeBase
   - Folder: MPA
   - Save

4. **Create Topics** (7 topics)
   Reference: Section 7 of `MASTERCARD_FULL_DEPLOYMENT_SPECIFICATION.md`
   - Greeting
   - Start Planning
   - Search Benchmarks
   - Generate Document
   - Provide Feedback
   - Search Channels
   - Fallback

5. **Connect Flows to Topics**
   - Start Planning → MPA_InitializeSession
   - Search Benchmarks → MPA_SearchBenchmarks
   - Generate Document → MPA_GenerateDocument
   - Provide Feedback → MPA_CaptureFeedback

6. **Test in Preview**
   - Test: "Hello"
   - Test: "What's a typical CPM for display?"
   - Test: "Start a new media plan"

7. **Publish** when tests pass

### CA Agent Configuration

1. **Open Copilot Studio** → Create or open CA agent

2. **Paste Instructions**
   - Copy from: `/release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt`
   - Paste and Save

3. **Connect Knowledge Source**
   - Library: AgentKnowledgeBase
   - Folder: CA

4. **Create Topics** (8 topics)
   Reference: `/release/v5.5/agents/ca/base/copilot/CA_TOPIC_DEFINITIONS.md`
   - Greeting
   - Start Analysis
   - Select Framework
   - Apply Framework
   - Generate Report
   - Benchmark Query
   - Provide Feedback
   - Fallback

5. **Connect Flows to Topics**
   - Start Analysis → CA_InitializeSession
   - Select Framework → CA_SelectFramework
   - Apply Framework → CA_ApplyFramework
   - Generate Report → CA_GenerateDocument
   - Provide Feedback → CA_CaptureFeedback

6. **Test and Publish**

---

## VERIFICATION CHECKLIST

After all steps complete:

| Component | Check | Expected |
|-----------|-------|----------|
| SharePoint MPA | File count | 32 files |
| SharePoint CA | File count | 35 files |
| SharePoint EAP | File count | 7 files |
| Dataverse MPA | Table count | 29+ tables |
| Dataverse CA | Table count | 9 tables |
| Dataverse EAP | Table count | 46+ tables |
| Power Automate MPA | Flow count | 13 flows enabled |
| Power Automate CA | Flow count | 8 flows enabled |
| Copilot MPA | Test greeting | Response received |
| Copilot MPA | Test KB query | Citation present |
| Copilot CA | Test greeting | Response received |
| Copilot CA | Test framework | Framework suggested |

---

## TROUBLESHOOTING

### Authentication Issues
```powershell
# Clear and re-authenticate
pac auth clear
pac auth create --environment "https://[org].crm.dynamics.com"

az logout
az login
```

### SharePoint Upload Failures
- Check permissions on library
- Verify file size under 7MB
- Check for special characters in filenames

### Dataverse Import Failures
- Check solution dependencies
- Verify table relationships
- Check for duplicate records in seed data

### Flow Connection Issues
- Connections must be updated manually after import
- Each user needs their own connection references
- Check Dataverse/SharePoint permissions

---

## ROLLBACK

If deployment fails and rollback needed:

```powershell
# Disable flows (don't delete)
# Flows can be re-enabled after fix

# SharePoint files can be deleted and re-uploaded
# Dataverse tables: Delete solution (removes tables)

# Copilot: Disable agent, don't delete
```

---
