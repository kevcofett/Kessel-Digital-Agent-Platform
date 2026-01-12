# VS CODE DEPLOYMENT INSTRUCTIONS - MASTERCARD ENVIRONMENT
# Corporate Production Environment

**Created:** 2026-01-12
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
| Power Automate | https://make.powerautomate.com/environments/Default-f06fa858-824b-4a85-aacv-f372cfdc282e/home |
| Copilot Studio | https://copilotstudio.microsoft.com (select Mastercard environment) |

### Agent KB Folder URLs
| Agent | Folder URL |
|-------|------------|
| MPA | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgCZ7qTFJCgASKcb204jJRn0AfB5alCc74AMyE2etdchqA4?e=urKrHq |
| CA | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/IgDzc0ufDknYTpTghwRGqCXGAUvoLc-7BLhVv8c7TrZEPAI?e=JrfOGP |
| EAP | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgAMlDUM-pK9Rqol_B77NT8JAWaSvFONRHLabpRleGIwxko?e=24fqOR |

### Environment IDs
- Power Apps Environment ID: `ea9d500a-9299-e7b2-8754-53ebea0cb818`
- Power Automate Environment ID: `Default-f06fa858-824b-4a85-aacv-f372cfdc282e`

---

## IMPORTANT NOTES

### Security Considerations
- All credentials via Azure Key Vault (no hardcoded secrets)
- Use service principal for automation where possible
- All actions logged for audit
- Follow Mastercard change management process
- Obtain approval before production deployment

### Environment Differences from Personal
| Aspect | Personal | Mastercard |
|--------|----------|------------|
| Auth | Interactive | Service Principal |
| Secrets | Local .env | Azure Key Vault |
| Approval | None | Change ticket required |
| Rollback | Flexible | Documented procedure |
| Access | Full admin | Role-based |

---

## PREREQUISITES

### 1. Change Management
- [ ] Change ticket approved
- [ ] Deployment window scheduled
- [ ] Rollback plan documented
- [ ] Stakeholders notified

### 2. Service Principal Authentication
```powershell
# Service Principal credentials from Key Vault
$tenantId = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "tenant-id" --query value -o tsv)
$clientId = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "sp-client-id" --query value -o tsv)
$clientSecret = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "sp-client-secret" --query value -o tsv)

# Azure CLI with service principal
az login --service-principal -u $clientId -p $clientSecret --tenant $tenantId

# Power Platform CLI with service principal
pac auth create --applicationId $clientId --clientSecret $clientSecret --tenant $tenantId --environment "https://mastercard.crm.dynamics.com"
```

### 3. Environment Configuration
Environment variables loaded from Key Vault:

```powershell
# Load Mastercard environment config
$env:ENVIRONMENT = "mastercard"
$env:TENANT_ID = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "tenant-id" --query value -o tsv)
$env:DATAVERSE_URL = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "dataverse-url" --query value -o tsv)
$env:SHAREPOINT_SITE = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "sharepoint-site" --query value -o tsv)
$env:SHAREPOINT_LIBRARY = "Shared Documents"
$env:AZURE_SUBSCRIPTION = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "azure-subscription" --query value -o tsv)
$env:AZURE_RESOURCE_GROUP = (az keyvault secret show --vault-name "MC-Agent-KeyVault" --name "azure-rg" --query value -o tsv)
```

### 4. Required Permissions
Verify service principal has:
- SharePoint: Site Collection Administrator or Contribute
- Dataverse: System Administrator or System Customizer
- Power Automate: Environment Admin
- Azure: Contributor on resource group

---

## DEPLOYMENT SEQUENCE

### STEP 0: Pre-Deployment Validation

```powershell
# Run from repository root
cd /path/to/Kessel-Digital-Agent-Platform
git checkout deploy/mastercard
git pull origin deploy/mastercard

# Validate environment connectivity
./release/v5.5/deployment/mastercard/scripts/validate-environment.ps1 -Environment "mastercard"

# Expected output: All checks PASS
# If ANY check fails, STOP and resolve before proceeding
```

### STEP 1: Create Backup (Required)

```powershell
# Backup existing SharePoint KB files
$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
./release/v5.5/deployment/mastercard/scripts/backup-sharepoint.ps1 `
    -Environment "mastercard" `
    -BackupPath "./backups/$timestamp"

# Backup existing Dataverse data
pac solution export `
    --path "./backups/$timestamp/solution-backup.zip" `
    --name "AgentPlatformSolution" `
    --managed false
```

### STEP 2: Deploy SharePoint KB Files

```powershell
# Deploy MPA KB files (32 files)
./release/v5.5/deployment/mastercard/scripts/deploy-sharepoint.ps1 `
    -SourcePath "./release/v5.5/agents/mpa/base/kb" `
    -TargetFolder "MPA" `
    -Environment "mastercard" `
    -Verbose

# Verify MPA upload
$mpaCount = (Get-PnPListItem -List "Shared Documents" -FolderServerRelativeUrl "/sites/CAEConsultingProduct/Shared Documents/MPA").Count
Write-Host "MPA files uploaded: $mpaCount (expected: 32)"

# Deploy CA KB files (35 files)
./release/v5.5/deployment/mastercard/scripts/deploy-sharepoint.ps1 `
    -SourcePath "./release/v5.5/agents/ca/base/kb" `
    -TargetFolder "CA" `
    -Environment "mastercard" `
    -Verbose

# Verify CA upload
$caCount = (Get-PnPListItem -List "Shared Documents" -FolderServerRelativeUrl "/sites/CAEConsultingProduct/Shared Documents/CA").Count
Write-Host "CA files uploaded: $caCount (expected: 35)"
```

### STEP 3: Deploy Dataverse Solution

```powershell
# Import solution with tables
pac solution import `
    --path "./release/v5.5/solutions/AgentPlatformSolution.zip" `
    --activate-plugins `
    --force-overwrite `
    --async

# Wait for import to complete
Start-Sleep -Seconds 60

# Verify solution imported
pac solution list | Select-String "AgentPlatform"

# Deploy Phase 10 learning tables (if not in solution)
./release/v5.5/deployment/mastercard/scripts/deploy-learning-tables.ps1 `
    -Environment "mastercard"
```

### STEP 4: Import Seed Data

```powershell
# MPA seed data - use pac data import or custom script
./release/v5.5/deployment/mastercard/scripts/import-seed-data.ps1 `
    -DataPath "./release/v5.5/agents/mpa/base/data/seed" `
    -Environment "mastercard"

# Verify record counts
# mpa_vertical: 13 records
# mpa_kpi: 43 records
# mpa_channel: 43 records
# mpa_benchmark: 60 records
```

### STEP 5: Deploy Power Automate Flows

```powershell
# Deploy MPA flows
./release/v5.5/deployment/mastercard/scripts/deploy-flows.ps1 `
    -FlowsPath "./release/v5.5/agents/mpa/base/flows/specifications" `
    -Environment "mastercard"

# Deploy CA flows
./release/v5.5/deployment/mastercard/scripts/deploy-flows.ps1 `
    -FlowsPath "./release/v5.5/agents/ca/base/schema/flows" `
    -Environment "mastercard"

# Deploy Phase 10 learning flows
./release/v5.5/deployment/mastercard/scripts/deploy-learning-flows.ps1 `
    -Environment "mastercard"
```

**MANUAL STEP:** Update flow connections
1. Open Power Automate in Mastercard environment
2. For each flow, update connection references
3. Use Mastercard service account connections
4. Enable each flow

### STEP 6: Deploy Azure Functions (If Applicable)

```powershell
# Check if Azure Functions are used in Mastercard
# If yes, deploy via Azure CLI

az functionapp deployment source config-zip `
    --resource-group $env:AZURE_RESOURCE_GROUP `
    --name "mc-agent-functions" `
    --src "./release/v5.5/azure/functions.zip"

# Update app settings
az functionapp config appsettings set `
    --resource-group $env:AZURE_RESOURCE_GROUP `
    --name "mc-agent-functions" `
    --settings "DATAVERSE_URL=$env:DATAVERSE_URL"
```

---

## MANUAL STEPS - COPILOT STUDIO

### MPA Agent (Media Planning Agent)

1. **Access Copilot Studio**
   - URL: https://copilotstudio.microsoft.com
   - Ensure logged in with Mastercard credentials
   - Select Mastercard environment

2. **Open/Create MPA Agent**
   - If exists: Open "Media Planning Agent"
   - If new: Create → Name: "Media Planning Agent"

3. **Update Instructions**
   - Settings → Instructions
   - Clear existing
   - Copy from: `/release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt`
   - Paste and Save
   - Confirm character count < 8,000

4. **Configure Knowledge Source**
   - Knowledge → Add → SharePoint
   - Site URL: [Mastercard SharePoint]
   - Library: AgentKnowledgeBase
   - Folder: MPA
   - Enable: "Use SharePoint as knowledge source"
   - Search settings:
     - Max chunks: 5
     - Min confidence: 0.65
     - Enable citations: Yes

5. **Create/Update Topics**
   
   Reference: `MASTERCARD_FULL_DEPLOYMENT_SPECIFICATION.md` Section 7

   | Topic | Trigger Phrases |
   |-------|----------------|
   | Greeting | hello, hi, start, help |
   | Start Planning | start planning, new plan, create plan |
   | Search Benchmarks | benchmark, CPM, typical, industry |
   | Generate Document | generate, create document, download |
   | Provide Feedback | feedback, rate, helpful |
   | Search Channels | channel, display, CTV, social, search |
   | Fallback | (system fallback) |

6. **Connect Flows**
   - Start Planning → Call flow: MPA_InitializeSession
   - Search Benchmarks → Call flow: MPA_SearchBenchmarks
   - Generate Document → Call flow: MPA_GenerateDocument
   - Provide Feedback → Call flow: MPA_CaptureFeedback

7. **Test Agent**
   - Test panel → "Hello"
   - Test panel → "What's a typical CPM for CTV?"
   - Test panel → "Start a new media plan"
   - Verify KB citations appear
   - Verify flows execute (check Dataverse for records)

8. **Publish**
   - Only after all tests pass
   - Publish → Confirm

### CA Agent (Consulting Agent)

1. **Open/Create CA Agent**
   - Create → Name: "Consulting Agent"

2. **Update Instructions**
   - Copy from: `/release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt`

3. **Configure Knowledge Source**
   - Library: AgentKnowledgeBase
   - Folder: CA

4. **Create Topics**
   
   Reference: `/release/v5.5/agents/ca/base/copilot/CA_TOPIC_DEFINITIONS.md`

   | Topic | Trigger Phrases |
   |-------|----------------|
   | Greeting | hello, hi, help |
   | Start Analysis | analyze, start analysis, begin |
   | Select Framework | framework, SWOT, Porter, BCG |
   | Apply Framework | apply, run analysis, execute |
   | Generate Report | report, document, export |
   | Benchmark Query | benchmark, industry, KPI |
   | Provide Feedback | feedback, helpful, rate |
   | Fallback | (system fallback) |

5. **Connect Flows**
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
# Run integration test suite
./release/v5.5/deployment/mastercard/scripts/test-integration.ps1 `
    -Environment "mastercard"
```

### Manual Validation Checklist

| Test | Steps | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| MPA Greeting | Say "Hello" | Welcome message | |
| MPA KB Query | Ask "What's a typical CPM?" | Response with KB citation | |
| MPA Flow | Start a plan | Session ID returned | |
| MPA Document | Request document | Download link or text | |
| CA Greeting | Say "Hello" | Welcome message | |
| CA Framework | Ask about SWOT | Framework explanation with citation | |
| CA Analysis | Start analysis | Structured output | |

---

## ROLLBACK PROCEDURE

If critical issues found post-deployment:

### Immediate Rollback (< 1 hour)
```powershell
# 1. Disable agents in Copilot Studio
# Manual: Copilot Studio → Agent → Settings → Disable

# 2. Restore SharePoint backup
./release/v5.5/deployment/mastercard/scripts/restore-sharepoint.ps1 `
    -BackupPath "./backups/[timestamp]" `
    -Environment "mastercard"

# 3. Restore Dataverse solution
pac solution import `
    --path "./backups/[timestamp]/solution-backup.zip" `
    --force-overwrite
```

### Partial Rollback
- If only KB issues: Re-upload specific files
- If only flow issues: Disable specific flows
- If only one agent: Disable that agent only

---

## MONITORING

### Day 1 Monitoring
- Check Copilot Studio analytics every 2 hours
- Monitor Power Automate flow runs
- Review Dataverse audit logs
- Address any user-reported issues immediately

### Week 1 Monitoring
- Daily analytics review
- KB hit rate analysis
- Flow success rate
- User satisfaction feedback

---

## CONTACTS

| Role | Contact | When |
|------|---------|------|
| Deployment Lead | [Name] | During deployment |
| Mastercard IT | [Contact] | Environment issues |
| Kessel Digital | [Contact] | Agent/content issues |
| Microsoft Support | [Case] | Platform issues |

---

## SIGN-OFF

| Step | Completed By | Date | Notes |
|------|--------------|------|-------|
| Pre-deployment validation | | | |
| SharePoint deployment | | | |
| Dataverse deployment | | | |
| Flow deployment | | | |
| MPA configuration | | | |
| CA configuration | | | |
| Testing complete | | | |
| Go-live approval | | | |
| Post-deployment validation | | | |

---
