# VS CODE DEPLOYMENT INSTRUCTIONS - MASTERCARD ENVIRONMENT
# Corporate Production Environment

**Created:** 2026-01-12
**Updated:** 2026-01-12
**Environment:** Mastercard (Production)
**Purpose:** Deploy MPA and CA to Mastercard corporate environment

---

## KEY URLS - MASTERCARD ENVIRONMENT

| Service | URL |
|---------|-----|
| SharePoint Site | https://mastercard.sharepoint.com/sites/CAEConsultingProduct |
| SharePoint Library | Shared Documents |
| SharePoint All Items | https://mastercard.sharepoint.com/sites/CAEConsultingProduct/Shared%20Documents/Forms/AllItems.aspx |
| Power Apps | https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818/home |
| Power Automate | <https://make.powerautomate.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818/home> |
| Copilot Studio | https://copilotstudio.microsoft.com (select Mastercard environment) |

### Agent KB Folder URLs
| Agent | Folder URL |
|-------|------------|
| MPA | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgCZ7qTFJCgASKcb204jJRn0AfB5alCc74AMyE2etdchqA4?e=urKrHq |
| CA | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/IgDzc0ufDknYTpTghwRGqCXGAUvoLc-7BLhVv8c7TrZEPAI?e=JrfOGP |
| EAP | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgAMlDUM-pK9Rqol_B77NT8JAWaSvFONRHLabpRleGIwxko?e=24fqOR |

### Environment IDs
- Power Apps Environment ID: `ea9d500a-9299-e7b2-8754-53ebea0cb818`
- Power Automate Environment ID: `ea9d500a-9299-e7b2-8754-53ebea0cb818`
- Dataverse URL: `orgcc6eaaec.crm.dynamics.com`
- Organization ID: `74145e53-ba5e-f011-8ee3-000d3a3b2c23`

---

## DEPLOYMENT APPROACH OPTIONS

### OPTION A: Solution Import (RECOMMENDED)
**Use when:** You have a fully-built and tested solution exported from dev environment
**Pros:** Automated, consistent, includes all components (agent, flows, topics, variables)
**Requirement:** Must have exported solution.zip file

### OPTION B: Component-by-Component 
**Use when:** Initial build with no existing solution, or granular updates needed
**Pros:** More control over individual components
**Cons:** More manual steps, higher risk of configuration drift

---

## OPTION A: SOLUTION IMPORT DEPLOYMENT (RECOMMENDED)

### Prerequisites
1. Solution file ready: `MediaPlanningAgentv52_updated.zip` (in `release/v5.5/solutions/`)
2. Power Platform CLI installed (`pac` command available)
3. Authenticated to Mastercard environment

### Solution Files Overview

| File | Description | Use For |
|------|-------------|---------|
| `MediaPlanningAgentv52_updated.zip` | MPA flows with plural entity names | **RECOMMENDED** |
| `AragornAI_1.0.1.0.zip` | Full platform including Copilot agent | Full deployment |
| `ConsultingAgentBase.zip` | CA tables only | CA tables setup |

### Step A.1: Verify Solution is Ready (Already Done)

The solution has been exported and updated with plural entity names:
- Location: `release/v5.5/solutions/MediaPlanningAgentv52_updated.zip`
- Contains: 13 MPA Power Automate flows with correct Dataverse entity names
- Status: ✅ Ready for import

### Step A.2: Deploy SharePoint KB Files First

KB files must be deployed before solution import so agent can connect:

```powershell
# Connect to Mastercard SharePoint
Connect-PnPOnline -Url "https://mastercard.sharepoint.com/sites/CAEConsultingProduct" -Interactive

# Deploy MPA KB files
./deploy-sharepoint.ps1 `
    -SourcePath "../../agents/mpa/base/kb" `
    -TargetFolder "MPA" `
    -Environment "mastercard"

# Deploy CA KB files
./deploy-sharepoint.ps1 `
    -SourcePath "../../agents/ca/base/kb" `
    -TargetFolder "CA" `
    -Environment "mastercard"

# Deploy EAP KB files
./deploy-sharepoint.ps1 `
    -SourcePath "../../platform/eap-core/base/kb" `
    -TargetFolder "EAP" `
    -Environment "mastercard"
```

**Verify uploads:**
- MPA folder: https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgCZ7qTFJCgASKcb204jJRn0AfB5alCc74AMyE2etdchqA4
- CA folder: https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/IgDzc0ufDknYTpTghwRGqCXGAUvoLc-7BLhVv8c7TrZEPAI
- EAP folder: https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgAMlDUM-pK9Rqol_B77NT8JAWaSvFONRHLabpRleGIwxko

### Step A.3: Import Solution to Mastercard

#### Option 1: Using PAC CLI (Recommended)

```powershell
# Navigate to solutions directory
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/solutions

# Authenticate to Mastercard environment
pac auth create --environment "https://orgcc6eaaec.crm.dynamics.com"

# Import MPA solution (unmanaged - allows testing and modifications)
pac solution import --path "MediaPlanningAgentv52_updated.zip" --async

# Check import status
pac solution list
```

#### Option 2: Using Power Platform Admin Center (GUI)

1. Open <https://make.powerapps.com>
2. Select Mastercard environment from environment picker
3. Go to **Solutions** → **Import solution**
4. Click **Browse** and select: `release/v5.5/solutions/MediaPlanningAgentv52_updated.zip`
5. Click **Next** → Review components → **Import**
6. Wait for import to complete (may take 5-10 minutes)

#### Solution Files Reference

| File | Contains | Use For |
|------|----------|---------|
| `MediaPlanningAgentv52_updated.zip` | 13 MPA flows with plural entity names | **MPA Deployment (RECOMMENDED)** |
| `AragornAI_1.0.1.0.zip` | Full platform including Copilot agent | Complete fresh deployment |
| `ConsultingAgentv1.zip` | CA flows and components | CA deployment |
| `ConsultingAgentBase.zip` | CA Dataverse tables only | CA tables setup |

**Detailed guide:** [SOLUTION_EXPORT_IMPORT_WORKFLOW.md](../SOLUTION_EXPORT_IMPORT_WORKFLOW.md)

### Step A.4: Configure Environment Variables

After import, set Mastercard-specific values:

1. Open Power Apps: https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818/home
2. Go to Solutions → Kessel Agent Platform → Environment Variables
3. Set these values:

| Variable | Mastercard Value |
|----------|------------------|
| kd_SharePointSiteUrl | https://mastercard.sharepoint.com/sites/CAEConsultingProduct |
| kd_SharePointLibrary | Shared Documents |
| kd_DataverseUrl | `https://orgcc6eaaec.crm.dynamics.com` |
| kd_AzureFunctionUrl | (if applicable) |

### Step A.5: Configure Connection References

1. In Solutions → Kessel Agent Platform → Connection References
2. For each reference:
   - **kd_DataverseConnection**: Create/select Dataverse connection with Mastercard service account
   - **kd_SharePointConnection**: Create/select SharePoint connection to CAEConsultingProduct site
   - **kd_HTTPConnection**: Create/select HTTP with Azure AD connection (if used)
3. Authenticate each connection with appropriate Mastercard credentials

### Step A.6: Enable Power Automate Flows

1. Open Power Automate: <https://make.powerautomate.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818/home>
2. Find imported flows (search "MPA_" or "CA_")
3. For each flow:
   - Open flow
   - Verify no red connection warnings
   - Click **Turn on**

**Expected flows:**
- MPA_InitializeSession
- MPA_SearchBenchmarks
- MPA_GenerateDocument
- MPA_CaptureFeedback
- CA_InitializeSession
- CA_SelectFramework
- CA_ApplyFramework
- CA_GenerateDocument
- CA_CaptureFeedback

### Step A.7: Reconnect Knowledge Sources

SharePoint knowledge sources need to be reconnected in each environment:

1. Open Copilot Studio: https://copilotstudio.microsoft.com
2. Select Mastercard environment
3. Open imported agent (MPA or CA)
4. Go to **Knowledge**
5. If SharePoint shows disconnected:
   - Remove existing source
   - Click **+ Add knowledge** → **SharePoint**
   - Site: https://mastercard.sharepoint.com/sites/CAEConsultingProduct
   - Library: Shared Documents
   - Folder: MPA (or CA, or EAP)
   - Click **Add**
   - Wait for indexing (may take 5-15 minutes)

### Step A.8: Publish and Test

1. In Copilot Studio, click **Publish**
2. Test in preview panel:
   - "Hello" → Should get greeting
   - "What's a typical CPM for CTV?" → Should get KB response with citation
   - "Start a new media plan" → Should trigger flow and create session

---

## OPTION B: COMPONENT-BY-COMPONENT DEPLOYMENT

Use this approach for initial builds or when solution export is not available.

### Prerequisites

#### Change Management
- [ ] Change ticket approved
- [ ] Deployment window scheduled
- [ ] Rollback plan documented
- [ ] Stakeholders notified

#### Authentication
```powershell
# Service Principal credentials from Key Vault
$tenantId = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "tenant-id" --query value -o tsv)
$clientId = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "sp-client-id" --query value -o tsv)
$clientSecret = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "sp-client-secret" --query value -o tsv)

# Azure CLI with service principal
az login --service-principal -u $clientId -p $clientSecret --tenant $tenantId

# Power Platform CLI with service principal
pac auth create --applicationId $clientId --clientSecret $clientSecret --tenant $tenantId --environment "https://mastercard.crm.dynamics.com"

# PnP PowerShell
Connect-PnPOnline -Url "https://mastercard.sharepoint.com/sites/CAEConsultingProduct" -Interactive
```

### Step B.1: Deploy SharePoint KB Files

```powershell
# Deploy MPA KB files (32 files)
./deploy-sharepoint.ps1 `
    -SourcePath "../../agents/mpa/base/kb" `
    -TargetFolder "MPA" `
    -Environment "mastercard" `
    -Verbose

# Deploy CA KB files (35 files)
./deploy-sharepoint.ps1 `
    -SourcePath "../../agents/ca/base/kb" `
    -TargetFolder "CA" `
    -Environment "mastercard" `
    -Verbose

# Deploy EAP KB files (7 files)
./deploy-sharepoint.ps1 `
    -SourcePath "../../platform/eap-core/base/kb" `
    -TargetFolder "EAP" `
    -Environment "mastercard" `
    -Verbose
```

### Step B.2: Deploy Dataverse Tables

```powershell
# Deploy MPA tables
./deploy-dataverse.ps1 `
    -SolutionPath "../../agents/mpa/base/dataverse" `
    -Environment "mastercard"

# Deploy CA tables
./deploy-dataverse.ps1 `
    -SolutionPath "../../agents/ca/base/schema/tables" `
    -Environment "mastercard"

# Deploy learning tables
./deploy-learning-tables.ps1 -Environment "mastercard"
```

### Step B.3: Import Seed Data

```powershell
./import-seed-data.ps1 `
    -DataPath "../../agents/mpa/base/data/seed" `
    -Environment "mastercard"
```

### Step B.4: Deploy Power Automate Flows

```powershell
# Deploy MPA flows
./deploy-flows.ps1 `
    -FlowsPath "../../agents/mpa/base/flows/specifications" `
    -Environment "mastercard"

# Deploy CA flows
./deploy-flows.ps1 `
    -FlowsPath "../../agents/ca/base/schema/flows" `
    -Environment "mastercard"
```

**MANUAL STEP:** Update flow connections in Power Automate UI

### Step B.5: Configure Copilot Studio Agents (MANUAL)

This step MUST be done manually in Copilot Studio:

#### MPA Agent

1. **Open Copilot Studio** → Select Mastercard environment → Create/open agent

2. **Set Instructions**
   - Settings → Instructions
   - Copy from: `/release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt`
   - Verify < 8,000 characters
   - Save

3. **Connect Knowledge Source**
   - Knowledge → Add → SharePoint
   - Site: https://mastercard.sharepoint.com/sites/CAEConsultingProduct
   - Library: Shared Documents
   - Folder: MPA

4. **Create Topics** (7 total)
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

6. **Test and Publish**

#### CA Agent

1. **Create/Open CA Agent**

2. **Set Instructions**
   - Copy from: `/release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt`

3. **Connect Knowledge Source**
   - Folder: CA

4. **Create Topics** (8 total)
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

## POST-DEPLOYMENT VALIDATION

### Automated Tests
```powershell
./test-integration.ps1 -Environment "mastercard"
```

### Manual Validation Checklist

| Test | Steps | Expected Result | Pass |
|------|-------|-----------------|------|
| MPA Greeting | Say "Hello" | Welcome message | [ ] |
| MPA KB Query | "What's a typical CPM?" | Response with citation | [ ] |
| MPA Flow | "Start a new plan" | Session created | [ ] |
| CA Greeting | Say "Hello" | Welcome message | [ ] |
| CA Framework | "Tell me about SWOT" | Framework explanation | [ ] |

---

## ROLLBACK PROCEDURE

### If Solution Import Issues

```powershell
# Remove imported solution
pac solution delete --solution-name "KesselAgentPlatform"

# Re-import previous version (if available)
pac solution import --path "./backups/previous-solution.zip"
```

### If Individual Component Issues

- **KB Files:** Re-upload specific files from backup
- **Flows:** Disable problematic flows, restore from backup
- **Agent:** Disable in Copilot Studio (do not delete)

---

## RELATED DOCUMENTATION

| Document | Purpose |
|----------|---------|
| [SOLUTION_EXPORT_STEP_BY_STEP.md](../SOLUTION_EXPORT_STEP_BY_STEP.md) | First-time solution export guide |
| [SOLUTION_EXPORT_IMPORT_WORKFLOW.md](../SOLUTION_EXPORT_IMPORT_WORKFLOW.md) | Complete export/import workflow |
| [export-solution.ps1](./scripts/export-solution.ps1) | Export automation script |
| [import-solution.ps1](./scripts/import-solution.ps1) | Import automation script |
| [MASTERCARD_CORE_INSTRUCTIONS.md](../MASTERCARD_CORE_INSTRUCTIONS.md) | Overall deployment guide |

---

## SIGN-OFF

| Step | Completed By | Date | Notes |
|------|--------------|------|-------|
| SharePoint KB deployed | | | |
| Solution imported | | | |
| Environment variables set | | | |
| Connections configured | | | |
| Flows enabled | | | |
| Knowledge sources connected | | | |
| MPA tested | | | |
| CA tested | | | |
| Go-live approved | | | |

---
