# VS CODE DEPLOYMENT INSTRUCTIONS - PERSONAL ENVIRONMENT
# Aragorn AI Development Environment

**Created:** 2026-01-12
**Updated:** 2026-01-12
**Environment:** Personal (Aragorn AI)
**Purpose:** Deploy MPA, CA, EAP to personal dev/test environment

---

## KEY URLS - PERSONAL ENVIRONMENT

| Service | URL |
|---------|-----|
| SharePoint Site | https://aragornai.sharepoint.com/sites/AgentKnowledgeBase |
| SharePoint Library | AgentKnowledgeBase |
| Power Apps | https://make.powerapps.com (select your environment) |
| Power Automate | https://make.powerautomate.com (select your environment) |
| Copilot Studio | https://copilotstudio.microsoft.com (select your environment) |

---

## DEPLOYMENT APPROACH OPTIONS

### OPTION A: Solution Export/Import (RECOMMENDED FOR MULTI-ENV)
**Use when:** Deploying tested configuration to another environment
**Pros:** Automated, consistent, includes all components
**Best for:** Exporting from personal to Mastercard

### OPTION B: Component-by-Component (INITIAL BUILD)
**Use when:** Building agent for the first time
**Pros:** Full control, can test incrementally
**Best for:** Initial development in personal environment

---

## OPTION A: SOLUTION-BASED DEPLOYMENT

### A.1: If Deploying TO Personal FROM Another Environment

```powershell
# Navigate to deployment scripts
cd /path/to/Kessel-Digital-Agent-Platform/release/v5.5/deployment/mastercard/scripts

# Authenticate to your personal environment
pac auth create --environment "https://[your-org].crm.dynamics.com"

# Import solution
./import-solution.ps1 `
    -SolutionPath "../../solutions/KesselAgentPlatform_5_5_0_0.zip" `
    -Environment "personal"
```

### A.2: If Exporting FROM Personal TO Mastercard

This is the primary workflow - build in personal, export, import to Mastercard.

```powershell
# Authenticate to personal dev environment
pac auth create --environment "https://[your-org].crm.dynamics.com"

# Export solution (unmanaged and managed)
./export-solution.ps1 -Version "5.5.0.0" -ExportManaged

# Commit to repository
cd /path/to/Kessel-Digital-Agent-Platform
git add release/v5.5/solutions/
git commit -m "Export solution v5.5.0.0 for deployment"
git push origin deploy/mastercard
git checkout deploy/personal
git merge deploy/mastercard
git push origin deploy/personal
```

**Full export guide:** [SOLUTION_EXPORT_STEP_BY_STEP.md](../SOLUTION_EXPORT_STEP_BY_STEP.md)

### A.3: Post-Import Configuration for Personal

After importing a solution to personal environment:

1. **Set Environment Variables**
   | Variable | Personal Value |
   |----------|----------------|
   | kd_SharePointSiteUrl | https://aragornai.sharepoint.com/sites/AgentKnowledgeBase |
   | kd_SharePointLibrary | AgentKnowledgeBase |
   | kd_DataverseUrl | https://[your-org].crm.dynamics.com |

2. **Configure Connection References**
   - kd_DataverseConnection → Your Dataverse connection
   - kd_SharePointConnection → Your SharePoint connection

3. **Enable Flows** in Power Automate

4. **Reconnect Knowledge Source** in Copilot Studio

5. **Publish Agent**

---

## OPTION B: COMPONENT-BY-COMPONENT DEPLOYMENT (INITIAL BUILD)

Use this for initial development when building the agent from scratch.

### Prerequisites

```powershell
# Azure CLI login
az login

# Power Platform CLI login
pac auth create --environment "https://[your-org].crm.dynamics.com"

# PnP PowerShell login
Connect-PnPOnline -Url "https://aragornai.sharepoint.com/sites/AgentKnowledgeBase" -Interactive
```

### Environment Variables

Create `.env.personal` in repository root:

```bash
ENVIRONMENT=personal
TENANT_ID=[your-azure-tenant-id]
DATAVERSE_URL=https://[your-org].crm.dynamics.com
SHAREPOINT_SITE=https://aragornai.sharepoint.com/sites/AgentKnowledgeBase
SHAREPOINT_LIBRARY=AgentKnowledgeBase
AZURE_SUBSCRIPTION=[your-subscription-id]
AZURE_RESOURCE_GROUP=[your-resource-group]
```

### Step B.1: Validate Environment

```powershell
cd /path/to/Kessel-Digital-Agent-Platform

$env:ENVIRONMENT = "personal"
./release/v5.5/deployment/mastercard/scripts/validate-environment.ps1
```

### Step B.2: Deploy SharePoint KB Files

```powershell
cd release/v5.5/deployment/mastercard/scripts

# Deploy MPA KB files (32 files)
./deploy-sharepoint.ps1 `
    -SourcePath "../../agents/mpa/base/kb" `
    -TargetFolder "MPA" `
    -Environment "personal"

# Deploy CA KB files (35 files)
./deploy-sharepoint.ps1 `
    -SourcePath "../../agents/ca/base/kb" `
    -TargetFolder "CA" `
    -Environment "personal"

# Deploy EAP KB files (7 files)
./deploy-sharepoint.ps1 `
    -SourcePath "../../platform/eap-core/base/kb" `
    -TargetFolder "EAP" `
    -Environment "personal"
```

**Verify:** Check SharePoint library:
- MPA folder: 32 files
- CA folder: 35 files
- EAP folder: 7 files

### Step B.3: Deploy Dataverse Tables

```powershell
# Deploy core MPA tables
./deploy-dataverse.ps1 `
    -SolutionPath "../../agents/mpa/base/dataverse" `
    -Environment "personal"

# Deploy Phase 10 learning tables
./deploy-learning-tables.ps1 -Environment "personal"

# Deploy CA tables
./deploy-dataverse.ps1 `
    -SolutionPath "../../agents/ca/base/schema/tables" `
    -Environment "personal"

# Deploy EAP base tables
./deploy-dataverse.ps1 `
    -SolutionPath "../../platform/eap-core/base/schema/tables" `
    -Environment "personal"
```

**Verify in Power Apps:**
- mpa_* tables (29+)
- ca_* tables (9)
- eap_* tables (46 base)

### Step B.4: Import Seed Data

```powershell
# MPA seed data
pac data import --data "../../agents/mpa/base/data/seed/mpa_vertical_seed.csv" --environment $env:DATAVERSE_URL
pac data import --data "../../agents/mpa/base/data/seed/mpa_kpi_seed.csv" --environment $env:DATAVERSE_URL
pac data import --data "../../agents/mpa/base/data/seed/mpa_channel_seed.csv" --environment $env:DATAVERSE_URL
pac data import --data "../../agents/mpa/base/data/seed/mpa_benchmark_seed.csv" --environment $env:DATAVERSE_URL
```

### Step B.5: Deploy Power Automate Flows

```powershell
# Deploy MPA flows (13 flows)
./deploy-flows.ps1 `
    -FlowsPath "../../agents/mpa/base/flows/specifications" `
    -Environment "personal"

# Deploy Phase 10 learning flows
./deploy-learning-flows.ps1 -Environment "personal"

# Deploy CA flows (8 flows)
./deploy-flows.ps1 `
    -FlowsPath "../../agents/ca/base/schema/flows" `
    -Environment "personal"
```

**MANUAL STEP:** Update connections for each flow in Power Automate UI

### Step B.6: Configure Copilot Studio Agents (MANUAL)

#### Create Solution Container (Important for Export Later)

Before building the agent, create a solution to contain all components:

1. Open Power Apps: https://make.powerapps.com
2. Select your environment
3. Go to **Solutions** → **+ New solution**
4. Fill in:
   - Display name: Kessel Agent Platform
   - Name: KesselAgentPlatform
   - Publisher: Select or create (prefix: `kd`)
   - Version: 5.5.0.0
5. Click **Create**

#### Add Environment Variables to Solution

1. In Solution → **+ New** → **More** → **Environment variable**
2. Create:
   - kd_SharePointSiteUrl (Text)
   - kd_SharePointLibrary (Text)
   - kd_DataverseUrl (Text)
   - kd_AzureFunctionUrl (Text)

#### Add Connection References to Solution

1. In Solution → **+ New** → **More** → **Connection reference**
2. Create:
   - kd_DataverseConnection (Microsoft Dataverse)
   - kd_SharePointConnection (SharePoint)
   - kd_HTTPConnection (HTTP with Azure AD) - if needed

#### MPA Agent Configuration

1. **Open Copilot Studio** → Create new agent in solution context

2. **Paste Instructions**
   - Go to Settings → Instructions
   - Copy from: `/release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt`
   - Verify under 8,000 characters
   - Save

3. **Connect Knowledge Source**
   - Knowledge → Add → SharePoint
   - Site: https://aragornai.sharepoint.com/sites/AgentKnowledgeBase
   - Library: AgentKnowledgeBase
   - Folder: MPA

4. **Create Topics** (7 topics)
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
   - "Hello"
   - "What's a typical CPM for display?"
   - "Start a new media plan"

7. **Publish**

#### CA Agent Configuration

1. **Create CA Agent** in same solution

2. **Paste Instructions**
   - Copy from: `/release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt`

3. **Connect Knowledge Source**
   - Folder: CA

4. **Create Topics** (8 topics)
   - Greeting
   - Start Analysis
   - Select Framework
   - Apply Framework
   - Generate Report
   - Benchmark Query
   - Provide Feedback
   - Fallback

5. **Connect Flows to Topics**

6. **Test and Publish**

---

## EXPORTING FOR MASTERCARD DEPLOYMENT

After your agent is fully built and tested in personal environment:

### Step 1: Verify Solution Contains Everything

In Power Apps → Solutions → Kessel Agent Platform, verify:
- [ ] 1-2 Agents (MPA, CA)
- [ ] 7-8 Topics per agent
- [ ] 4-8 Cloud Flows
- [ ] 4 Environment Variables
- [ ] 2-3 Connection References
- [ ] Required Dataverse tables

### Step 2: Publish All Customizations

1. In Solution, click **Publish all customizations**
2. Wait for completion

### Step 3: Export Solution

```powershell
cd /path/to/Kessel-Digital-Agent-Platform/release/v5.5/deployment/mastercard/scripts

# Authenticate to personal environment
pac auth create --environment "https://[your-org].crm.dynamics.com"

# Export both unmanaged and managed
./export-solution.ps1 -Version "5.5.0.0" -ExportManaged
```

Or manually in Power Apps:
1. Solutions → Kessel Agent Platform → Export
2. Export as Unmanaged → Download
3. Export as Managed → Download
4. Save both to `/release/v5.5/solutions/`

### Step 4: Commit and Push

```bash
git add release/v5.5/solutions/
git commit -m "Export KesselAgentPlatform v5.5.0.0 for Mastercard"
git push origin deploy/mastercard
git checkout deploy/personal
git merge deploy/mastercard
git push origin deploy/personal
```

### Step 5: Import to Mastercard

See [VSCODE_DEPLOY_TO_MASTERCARD.md](./mastercard/VSCODE_DEPLOY_TO_MASTERCARD.md)

---

## VERIFICATION CHECKLIST

| Component | Check | Expected |
|-----------|-------|----------|
| SharePoint MPA | File count | 32 files |
| SharePoint CA | File count | 35 files |
| SharePoint EAP | File count | 7 files |
| Dataverse MPA | Table count | 29+ tables |
| Dataverse CA | Table count | 9 tables |
| Power Automate MPA | Flow count | 13 flows enabled |
| Power Automate CA | Flow count | 8 flows enabled |
| Copilot MPA | Test greeting | Response received |
| Copilot MPA | Test KB query | Citation present |
| Copilot CA | Test greeting | Response received |
| Solution | All components | Everything in solution |

---

## TROUBLESHOOTING

### Authentication Issues
```powershell
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
- Use connection references (not direct connections) for portability

### Solution Export Issues
- Verify all components are in solution
- Publish all customizations before export
- Check for missing dependencies

---

## RELATED DOCUMENTATION

| Document | Purpose |
|----------|---------|
| [SOLUTION_EXPORT_STEP_BY_STEP.md](../SOLUTION_EXPORT_STEP_BY_STEP.md) | Complete export guide |
| [SOLUTION_EXPORT_IMPORT_WORKFLOW.md](../SOLUTION_EXPORT_IMPORT_WORKFLOW.md) | Full workflow |
| [export-solution.ps1](../mastercard/scripts/export-solution.ps1) | Export script |
| [import-solution.ps1](../mastercard/scripts/import-solution.ps1) | Import script |
| [VSCODE_DEPLOY_TO_MASTERCARD.md](../mastercard/VSCODE_DEPLOY_TO_MASTERCARD.md) | Mastercard deployment |

---
