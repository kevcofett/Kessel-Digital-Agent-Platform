# PHASE 8: MASTERCARD BRANCH CONFIGURATION
# Complete Branch Setup for Corporate Deployment

**Purpose:** Configure deploy/mastercard branch with all Mastercard-specific settings and scripts
**Prerequisites:** Phases 1-7 complete
**Output:** Fully configured Mastercard deployment branch

---

## OVERVIEW

This phase:
1. Organizes all Mastercard-specific files into proper directory structure
2. Creates deployment scripts for each component
3. Updates package.json with Mastercard-specific scripts
4. Creates deployment checklist and documentation
5. Configures branch for Microsoft stack default

---

## DIRECTORY STRUCTURE

```
release/v5.5/
├── agents/
│   ├── mpa/
│   │   ├── base/                      # Shared code (from Phase 1)
│   │   └── mastercard/                # Mastercard-specific
│   │       ├── instructions/
│   │       │   └── MPA_Copilot_Instructions_PRODUCTION.txt
│   │       ├── flows/                 # Power Automate exports
│   │       ├── dataverse/             # Dataverse artifacts
│   │       └── sharepoint/            # SharePoint config
│   ├── ca/
│   │   ├── base/
│   │   └── mastercard/
│   │       ├── instructions/
│   │       │   └── CA_Copilot_Instructions_PRODUCTION.txt
│   │       └── ...
│   └── eap/
│       ├── base/
│       └── mastercard/
│           ├── instructions/
│           │   └── EAP_Copilot_Instructions_PRODUCTION.txt
│           └── ...
└── deployment/
    └── mastercard/
        ├── .env.mastercard.template
        ├── DEPLOYMENT_CHECKLIST.md
        ├── DEPLOYMENT_RUNBOOK.md
        └── scripts/
            ├── deploy-all.ps1
            ├── deploy-dataverse.ps1
            ├── deploy-flows.ps1
            ├── deploy-sharepoint.ps1
            ├── deploy-copilot-studio.ps1
            ├── validate-environment.ps1
            └── validate-instructions.sh
```

---

## STEP 8.1: Create Deployment Directory Structure

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Create deployment directories
mkdir -p release/v5.5/deployment/mastercard/scripts

# Create agent mastercard directories (if not already created in Phase 6)
mkdir -p release/v5.5/agents/mpa/mastercard/{instructions,flows,dataverse,sharepoint}
mkdir -p release/v5.5/agents/ca/mastercard/{instructions,flows,dataverse,sharepoint}
mkdir -p release/v5.5/agents/eap/mastercard/{instructions,flows,dataverse,sharepoint}
```

---

## STEP 8.2: Create Deployment Checklist

**File:** `release/v5.5/deployment/mastercard/DEPLOYMENT_CHECKLIST.md`

```markdown
# MASTERCARD DEPLOYMENT CHECKLIST
# Pre-Deployment Verification and Steps

## PRE-REQUISITES

### Azure Access
- [ ] Azure AD tenant access confirmed
- [ ] App registration created with required permissions
- [ ] Client ID and secret generated
- [ ] API permissions granted and admin consented

### Power Platform Access
- [ ] Power Platform environment identified
- [ ] System Administrator or Environment Maker role assigned
- [ ] Dataverse database provisioned
- [ ] Copilot Studio license available

### SharePoint Access
- [ ] SharePoint site created or identified
- [ ] Document library created (AgentKnowledgeBase)
- [ ] App registration has Sites.ReadWrite.All permission

### Network Requirements
- [ ] Firewall rules allow Azure endpoints
- [ ] VPN configured if required
- [ ] API endpoints accessible from deployment machine

## ENVIRONMENT VARIABLES

Verify all required environment variables are set:

```bash
# Azure AD
echo "AZURE_TENANT_ID: ${AZURE_TENANT_ID:-(NOT SET)}"
echo "AZURE_CLIENT_ID: ${AZURE_CLIENT_ID:-(NOT SET)}"
echo "AZURE_CLIENT_SECRET: ${AZURE_CLIENT_SECRET:-(NOT SET)}"

# Azure OpenAI
echo "AZURE_OPENAI_ENDPOINT: ${AZURE_OPENAI_ENDPOINT:-(NOT SET)}"
echo "AZURE_OPENAI_DEPLOYMENT: ${AZURE_OPENAI_DEPLOYMENT:-(NOT SET)}"

# Dataverse
echo "DATAVERSE_ENVIRONMENT_URL: ${DATAVERSE_ENVIRONMENT_URL:-(NOT SET)}"

# SharePoint
echo "SHAREPOINT_SITE_URL: ${SHAREPOINT_SITE_URL:-(NOT SET)}"

# Copilot Studio
echo "COPILOT_STUDIO_BOT_ID: ${COPILOT_STUDIO_BOT_ID:-(NOT SET)}"
echo "COPILOT_STUDIO_ENV_URL: ${COPILOT_STUDIO_ENV_URL:-(NOT SET)}"
```

## DEPLOYMENT ORDER

Deploy components in this order:

### Phase 1: Infrastructure
1. [ ] Run validate-environment.ps1 to verify access
2. [ ] Verify Azure OpenAI deployment exists
3. [ ] Verify Dataverse environment accessible

### Phase 2: Dataverse
4. [ ] Run deploy-dataverse.ps1 to import solution
5. [ ] Verify all tables created
6. [ ] Import seed data (verticals, KPIs, channels, benchmarks)
7. [ ] Verify reference data populated

### Phase 3: SharePoint
8. [ ] Run deploy-sharepoint.ps1 to upload KB files
9. [ ] Verify all KB documents uploaded
10. [ ] Verify folder structure correct
11. [ ] Test document access via API

### Phase 4: Power Automate
12. [ ] Run deploy-flows.ps1 to import flows
13. [ ] Update flow connections
14. [ ] Test each flow manually
15. [ ] Enable flows for production

### Phase 5: Copilot Studio
16. [ ] Run deploy-copilot-studio.ps1
17. [ ] Paste agent instructions
18. [ ] Configure KB connection
19. [ ] Connect Power Automate flows
20. [ ] Test agent in studio
21. [ ] Publish agent

### Phase 6: Validation
22. [ ] Run end-to-end test conversation
23. [ ] Verify KB retrieval working
24. [ ] Verify Dataverse logging
25. [ ] Test fallback scenarios
26. [ ] Document any issues

## POST-DEPLOYMENT

### Monitoring Setup
- [ ] Azure Application Insights configured
- [ ] Dataverse audit logging enabled
- [ ] Power Automate flow run history accessible
- [ ] Alert rules configured

### Documentation
- [ ] Deployment date and version recorded
- [ ] Environment URLs documented
- [ ] Admin contacts identified
- [ ] Rollback procedure confirmed

### Handoff
- [ ] Admin training completed
- [ ] User documentation provided
- [ ] Support escalation path defined
- [ ] Go-live communication sent

## ROLLBACK PROCEDURE

If deployment fails:

1. Disable Copilot Studio agent (unpublish)
2. Disable Power Automate flows
3. Note: Dataverse data and SharePoint files can remain
4. Restore previous agent version if available
5. Document failure reason
6. Schedule remediation

## SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Deployer | | | |
| Technical Lead | | | |
| Business Owner | | | |
```

---

## STEP 8.3: Create Deployment Runbook

**File:** `release/v5.5/deployment/mastercard/DEPLOYMENT_RUNBOOK.md`

```markdown
# MASTERCARD DEPLOYMENT RUNBOOK
# Step-by-Step Deployment Instructions

## OVERVIEW

This runbook provides detailed instructions for deploying the agent platform to the Mastercard environment. Follow each section in order.

## 1. ENVIRONMENT SETUP

### 1.1 Load Environment Variables

```bash
# Navigate to deployment directory
cd /path/to/Kessel-Digital-Agent-Platform/release/v5.5/deployment/mastercard

# Copy template and fill in values
cp .env.mastercard.template .env

# Edit .env with actual values
# NEVER commit .env to source control

# Load environment variables
source .env
# Or on Windows: 
# foreach ($line in Get-Content .env) { if ($line -match '^([^#].+?)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2]) } }
```

### 1.2 Validate Environment

```powershell
# Run validation script
./scripts/validate-environment.ps1

# Expected output:
# ✓ Azure AD authentication successful
# ✓ Dataverse connection verified
# ✓ SharePoint access confirmed
# ✓ Azure OpenAI endpoint accessible
```

## 2. DATAVERSE DEPLOYMENT

### 2.1 Import Solution

```powershell
# Install Power Platform CLI if not installed
winget install Microsoft.PowerPlatformCLI

# Authenticate to Power Platform
pac auth create --environment $env:DATAVERSE_ENVIRONMENT_URL

# Import solution
./scripts/deploy-dataverse.ps1
```

### 2.2 Verify Tables

After import, verify these tables exist in Dataverse:
- cr_agentsessions
- cr_kbdocuments  
- cr_kbusagerecords
- cr_kbdocumentimpacts
- cr_kbupdateproposals
- cr_verticals
- cr_kpis
- cr_channels
- cr_benchmarks

### 2.3 Import Seed Data

```powershell
# Import reference data
pac data import --data ./seed-data/verticals.csv --target-table cr_verticals
pac data import --data ./seed-data/kpis.csv --target-table cr_kpis
pac data import --data ./seed-data/channels.csv --target-table cr_channels
pac data import --data ./seed-data/benchmarks.csv --target-table cr_benchmarks
```

## 3. SHAREPOINT DEPLOYMENT

### 3.1 Upload KB Documents

```powershell
# Run SharePoint deployment script
./scripts/deploy-sharepoint.ps1

# This will:
# - Connect to SharePoint site
# - Create folder structure
# - Upload all KB documents
# - Set metadata on documents
```

### 3.2 Verify Upload

Access SharePoint and verify:
- AgentKnowledgeBase library exists
- Folders created: MPA, CA, EAP
- All .txt files uploaded to correct folders
- Document count matches expected (MPA: 22+, CA: 35, EAP: 7)

## 4. POWER AUTOMATE DEPLOYMENT

### 4.1 Import Flows

```powershell
# Run flow deployment script
./scripts/deploy-flows.ps1

# This imports flows for:
# - Session initialization
# - KB retrieval
# - Response generation
# - Impact tracking
```

### 4.2 Update Connections

After import, manually update connections:
1. Open each flow in Power Automate
2. Update Dataverse connection to use correct environment
3. Update SharePoint connection to use correct site
4. Save and test each flow

### 4.3 Enable Flows

```powershell
# Enable all flows
pac flow enable --all
```

## 5. COPILOT STUDIO DEPLOYMENT

### 5.1 Create or Update Agent

```powershell
# Run Copilot Studio deployment
./scripts/deploy-copilot-studio.ps1

# This will:
# - Create agent if not exists
# - Update agent settings
# - Note: Instructions must be pasted manually
```

### 5.2 Configure Agent Instructions

1. Open Copilot Studio
2. Navigate to agent settings
3. Open Instructions section
4. Paste contents from appropriate file:
   - MPA: `agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_PRODUCTION.txt`
   - CA: `agents/ca/mastercard/instructions/CA_Copilot_Instructions_PRODUCTION.txt`
   - EAP: `agents/eap/mastercard/instructions/EAP_Copilot_Instructions_PRODUCTION.txt`
5. Save changes

### 5.3 Configure KB Connection

1. In Copilot Studio, go to Knowledge section
2. Add SharePoint as knowledge source
3. Select AgentKnowledgeBase library
4. Configure search settings
5. Test KB retrieval

### 5.4 Connect Flows

1. Go to Actions section in Copilot Studio
2. Add Power Automate flows as actions
3. Map flow inputs/outputs to topics
4. Test each flow action

### 5.5 Publish Agent

1. Run test conversations in Copilot Studio
2. Verify all functionality works
3. Click Publish
4. Select deployment channels (Teams, Web, etc.)
5. Complete publishing

## 6. VALIDATION

### 6.1 End-to-End Test

Run test scenarios:

```
Test 1: Basic Greeting
Input: "Hello"
Expected: Agent responds with greeting and offers assistance

Test 2: KB Retrieval
Input: "What frameworks are available for strategic analysis?"
Expected: Agent retrieves and summarizes relevant frameworks from KB

Test 3: Session Tracking
Input: Start new conversation, make several requests
Expected: Session data saved to Dataverse

Test 4: Error Handling
Input: Invalid or ambiguous request
Expected: Agent handles gracefully with clarifying questions
```

### 6.2 Performance Check

Verify response times:
- Initial response: < 5 seconds
- KB retrieval: < 3 seconds
- Flow execution: < 10 seconds

### 6.3 Logging Verification

Check Dataverse tables for:
- New session records created
- KB usage records logged
- No error records

## 7. TROUBLESHOOTING

### Common Issues

**Authentication Failures**
```
Error: AADSTS700016 - Application not found
Solution: Verify client ID and ensure app is registered in correct tenant
```

**Dataverse Connection Errors**
```
Error: Cannot connect to Dataverse
Solution: Verify environment URL format (https://org.crm.dynamics.com)
         Check app has Dataverse permissions
```

**SharePoint Upload Failures**
```
Error: Access denied to SharePoint
Solution: Verify Sites.ReadWrite.All permission granted
         Check site URL is correct
```

**Flow Execution Errors**
```
Error: Flow failed with connection error
Solution: Re-authenticate connections in Power Automate
         Check connection credentials not expired
```

### Getting Help

1. Check Azure AD sign-in logs for auth issues
2. Check Power Automate run history for flow errors
3. Check Dataverse system jobs for import errors
4. Contact Mastercard IT support for network issues

## 8. MAINTENANCE

### Regular Tasks

Weekly:
- Review flow run history for errors
- Check Dataverse storage usage
- Monitor agent conversation logs

Monthly:
- Review KB document freshness
- Update benchmark data if needed
- Check for platform updates

Quarterly:
- Review and update agent instructions
- Performance tuning based on usage patterns
- Security review of connections and permissions
```

---

## STEP 8.4: Create Validate Environment Script

**File:** `release/v5.5/deployment/mastercard/scripts/validate-environment.ps1`

```powershell
# Validate Mastercard Deployment Environment
# Run before deployment to verify all prerequisites

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "=== Mastercard Environment Validation ===" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
$results = @()

# Function to check environment variable
function Test-EnvVar {
    param([string]$Name, [string]$Description, [bool]$Required = $true)
    
    $value = [Environment]::GetEnvironmentVariable($Name)
    if ($value) {
        $masked = if ($Name -match "SECRET|KEY|PASSWORD") { "****" + $value.Substring([Math]::Max(0, $value.Length - 4)) } else { $value }
        Write-Host "  ✓ $Name = $masked" -ForegroundColor Green
        return $true
    } elseif ($Required) {
        Write-Host "  ✗ $Name - NOT SET (Required)" -ForegroundColor Red
        return $false
    } else {
        Write-Host "  - $Name - Not set (Optional)" -ForegroundColor Yellow
        return $true
    }
}

# Check required environment variables
Write-Host "Checking Environment Variables..." -ForegroundColor White

Write-Host "`nAzure AD:" -ForegroundColor Yellow
$results += Test-EnvVar "AZURE_TENANT_ID" "Azure AD Tenant"
$results += Test-EnvVar "AZURE_CLIENT_ID" "App Registration Client ID"
$results += Test-EnvVar "AZURE_CLIENT_SECRET" "App Registration Secret"

Write-Host "`nAzure OpenAI:" -ForegroundColor Yellow
$results += Test-EnvVar "AZURE_OPENAI_ENDPOINT" "Azure OpenAI Endpoint"
$results += Test-EnvVar "AZURE_OPENAI_DEPLOYMENT" "Azure OpenAI Deployment Name"
$results += Test-EnvVar "AZURE_OPENAI_API_KEY" "Azure OpenAI API Key" -Required $false

Write-Host "`nDataverse:" -ForegroundColor Yellow
$results += Test-EnvVar "DATAVERSE_ENVIRONMENT_URL" "Dataverse Environment URL"

Write-Host "`nSharePoint:" -ForegroundColor Yellow
$results += Test-EnvVar "SHAREPOINT_SITE_URL" "SharePoint Site URL"

Write-Host "`nCopilot Studio:" -ForegroundColor Yellow
$results += Test-EnvVar "COPILOT_STUDIO_BOT_ID" "Copilot Studio Bot ID" -Required $false
$results += Test-EnvVar "COPILOT_STUDIO_ENV_URL" "Copilot Studio Environment URL" -Required $false

# Check if all required passed
if ($results -contains $false) {
    $allPassed = $false
}

# Test Azure AD Authentication
Write-Host "`nTesting Azure AD Authentication..." -ForegroundColor White
try {
    $tenantId = $env:AZURE_TENANT_ID
    $clientId = $env:AZURE_CLIENT_ID
    $clientSecret = $env:AZURE_CLIENT_SECRET
    
    if ($tenantId -and $clientId -and $clientSecret) {
        $tokenUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
        $body = @{
            client_id = $clientId
            client_secret = $clientSecret
            scope = "https://graph.microsoft.com/.default"
            grant_type = "client_credentials"
        }
        
        $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
        
        if ($response.access_token) {
            Write-Host "  ✓ Azure AD authentication successful" -ForegroundColor Green
        }
    } else {
        Write-Host "  - Skipped (missing credentials)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Azure AD authentication failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Dataverse Connection
Write-Host "`nTesting Dataverse Connection..." -ForegroundColor White
try {
    $dataverseUrl = $env:DATAVERSE_ENVIRONMENT_URL
    if ($dataverseUrl) {
        # Get token for Dataverse
        $tokenUrl = "https://login.microsoftonline.com/$env:AZURE_TENANT_ID/oauth2/v2.0/token"
        $body = @{
            client_id = $env:AZURE_CLIENT_ID
            client_secret = $env:AZURE_CLIENT_SECRET
            scope = "$dataverseUrl/.default"
            grant_type = "client_credentials"
        }
        
        $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
        
        # Test Dataverse API
        $headers = @{
            Authorization = "Bearer $($tokenResponse.access_token)"
            "OData-MaxVersion" = "4.0"
            "OData-Version" = "4.0"
        }
        
        $whoamiUrl = "$dataverseUrl/api/data/v9.2/WhoAmI"
        $whoami = Invoke-RestMethod -Uri $whoamiUrl -Headers $headers -Method Get
        
        Write-Host "  ✓ Dataverse connection successful (User ID: $($whoami.UserId))" -ForegroundColor Green
    } else {
        Write-Host "  - Skipped (DATAVERSE_ENVIRONMENT_URL not set)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Dataverse connection failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test SharePoint Connection
Write-Host "`nTesting SharePoint Connection..." -ForegroundColor White
try {
    $sharePointUrl = $env:SHAREPOINT_SITE_URL
    if ($sharePointUrl) {
        # Extract tenant from SharePoint URL
        $uri = [System.Uri]$sharePointUrl
        $sharePointResource = "https://$($uri.Host)"
        
        # Get token for SharePoint
        $tokenUrl = "https://login.microsoftonline.com/$env:AZURE_TENANT_ID/oauth2/v2.0/token"
        $body = @{
            client_id = $env:AZURE_CLIENT_ID
            client_secret = $env:AZURE_CLIENT_SECRET
            scope = "$sharePointResource/.default"
            grant_type = "client_credentials"
        }
        
        $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
        
        # Test SharePoint API
        $headers = @{
            Authorization = "Bearer $($tokenResponse.access_token)"
            Accept = "application/json"
        }
        
        $siteInfoUrl = "$sharePointUrl/_api/web/title"
        $siteInfo = Invoke-RestMethod -Uri $siteInfoUrl -Headers $headers -Method Get
        
        Write-Host "  ✓ SharePoint connection successful" -ForegroundColor Green
    } else {
        Write-Host "  - Skipped (SHAREPOINT_SITE_URL not set)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ SharePoint connection failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Azure OpenAI Connection
Write-Host "`nTesting Azure OpenAI Connection..." -ForegroundColor White
try {
    $aoaiEndpoint = $env:AZURE_OPENAI_ENDPOINT
    $aoaiDeployment = $env:AZURE_OPENAI_DEPLOYMENT
    $aoaiKey = $env:AZURE_OPENAI_API_KEY
    
    if ($aoaiEndpoint -and $aoaiDeployment) {
        $headers = @{}
        
        if ($aoaiKey) {
            $headers["api-key"] = $aoaiKey
        } else {
            # Use Azure AD token
            $tokenUrl = "https://login.microsoftonline.com/$env:AZURE_TENANT_ID/oauth2/v2.0/token"
            $body = @{
                client_id = $env:AZURE_CLIENT_ID
                client_secret = $env:AZURE_CLIENT_SECRET
                scope = "https://cognitiveservices.azure.com/.default"
                grant_type = "client_credentials"
            }
            $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
            $headers["Authorization"] = "Bearer $($tokenResponse.access_token)"
        }
        
        $headers["Content-Type"] = "application/json"
        
        # Test with a simple completion
        $testUrl = "$aoaiEndpoint/openai/deployments/$aoaiDeployment/chat/completions?api-version=2024-02-01"
        $testBody = @{
            messages = @(
                @{ role = "user"; content = "Say 'OK'" }
            )
            max_tokens = 10
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method Post -Body $testBody
        
        Write-Host "  ✓ Azure OpenAI connection successful" -ForegroundColor Green
    } else {
        Write-Host "  - Skipped (endpoint or deployment not set)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Azure OpenAI connection failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Summary
Write-Host "`n=== Validation Summary ===" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✓ All validations passed - Ready for deployment" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some validations failed - Please fix issues before deployment" -ForegroundColor Red
    exit 1
}
```

---

## STEP 8.5: Create Deploy All Script

**File:** `release/v5.5/deployment/mastercard/scripts/deploy-all.ps1`

```powershell
# Deploy All Components to Mastercard
# Master deployment script that runs all component deployments

param(
    [string]$Agent = "all",  # mpa, ca, eap, or all
    [switch]$SkipValidation,
    [switch]$SkipDataverse,
    [switch]$SkipSharePoint,
    [switch]$SkipFlows,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Mastercard Deployment ===" -ForegroundColor Cyan
Write-Host "Agent: $Agent"
Write-Host "Dry Run: $DryRun"
Write-Host ""

# Step 1: Validate Environment
if (-not $SkipValidation) {
    Write-Host "Step 1: Validating Environment..." -ForegroundColor Yellow
    & "$scriptDir/validate-environment.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Environment validation failed. Aborting deployment." -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Step 2: Deploy Dataverse
if (-not $SkipDataverse) {
    Write-Host "Step 2: Deploying Dataverse Solution..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would deploy Dataverse solution" -ForegroundColor Gray
    } else {
        & "$scriptDir/deploy-dataverse.ps1" -Agent $Agent
    }
    Write-Host ""
}

# Step 3: Deploy SharePoint KB
if (-not $SkipSharePoint) {
    Write-Host "Step 3: Deploying SharePoint Knowledge Base..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would upload KB documents to SharePoint" -ForegroundColor Gray
    } else {
        & "$scriptDir/deploy-sharepoint.ps1" -Agent $Agent
    }
    Write-Host ""
}

# Step 4: Deploy Power Automate Flows
if (-not $SkipFlows) {
    Write-Host "Step 4: Deploying Power Automate Flows..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would import Power Automate flows" -ForegroundColor Gray
    } else {
        & "$scriptDir/deploy-flows.ps1" -Agent $Agent
    }
    Write-Host ""
}

# Step 5: Copilot Studio (manual step)
Write-Host "Step 5: Copilot Studio Configuration..." -ForegroundColor Yellow
Write-Host "  Copilot Studio requires manual configuration:" -ForegroundColor White
Write-Host "  1. Open Copilot Studio at https://copilotstudio.microsoft.com" -ForegroundColor Gray
Write-Host "  2. Create or open the agent for: $Agent" -ForegroundColor Gray
Write-Host "  3. Paste instructions from the appropriate file:" -ForegroundColor Gray

if ($Agent -eq "all" -or $Agent -eq "mpa") {
    Write-Host "     MPA: agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_PRODUCTION.txt" -ForegroundColor Gray
}
if ($Agent -eq "all" -or $Agent -eq "ca") {
    Write-Host "     CA: agents/ca/mastercard/instructions/CA_Copilot_Instructions_PRODUCTION.txt" -ForegroundColor Gray
}
if ($Agent -eq "all" -or $Agent -eq "eap") {
    Write-Host "     EAP: agents/eap/mastercard/instructions/EAP_Copilot_Instructions_PRODUCTION.txt" -ForegroundColor Gray
}

Write-Host "  4. Configure KB connection to SharePoint" -ForegroundColor Gray
Write-Host "  5. Connect Power Automate flows" -ForegroundColor Gray
Write-Host "  6. Test and publish agent" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "=== Deployment Summary ===" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "Dry run completed - no changes made" -ForegroundColor Yellow
} else {
    Write-Host "Automated deployment steps completed" -ForegroundColor Green
    Write-Host "Manual Copilot Studio configuration required" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Complete Copilot Studio configuration (see above)" -ForegroundColor Gray
Write-Host "2. Run validation tests" -ForegroundColor Gray
Write-Host "3. Complete deployment checklist" -ForegroundColor Gray
```

---

## STEP 8.6: Create Deploy SharePoint Script

**File:** `release/v5.5/deployment/mastercard/scripts/deploy-sharepoint.ps1`

```powershell
# Deploy KB Documents to SharePoint
# Uploads all knowledge base documents for specified agent(s)

param(
    [string]$Agent = "all"  # mpa, ca, eap, or all
)

$ErrorActionPreference = "Stop"
$repoRoot = (Get-Item $PSScriptRoot).Parent.Parent.Parent.Parent.FullName
$agentsDir = Join-Path $repoRoot "release/v5.5/agents"

Write-Host "=== SharePoint KB Deployment ===" -ForegroundColor Cyan
Write-Host "Agent: $Agent"
Write-Host ""

# Get authentication token
$tenantId = $env:AZURE_TENANT_ID
$clientId = $env:AZURE_CLIENT_ID
$clientSecret = $env:AZURE_CLIENT_SECRET
$siteUrl = $env:SHAREPOINT_SITE_URL
$libraryName = if ($env:SHAREPOINT_LIBRARY_NAME) { $env:SHAREPOINT_LIBRARY_NAME } else { "AgentKnowledgeBase" }

if (-not $siteUrl) {
    Write-Host "Error: SHAREPOINT_SITE_URL not set" -ForegroundColor Red
    exit 1
}

# Extract SharePoint resource URL
$uri = [System.Uri]$siteUrl
$sharePointResource = "https://$($uri.Host)"

# Get access token
Write-Host "Authenticating to SharePoint..." -ForegroundColor Yellow
$tokenUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
$body = @{
    client_id = $clientId
    client_secret = $clientSecret
    scope = "$sharePointResource/.default"
    grant_type = "client_credentials"
}

$tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
$accessToken = $tokenResponse.access_token

$headers = @{
    Authorization = "Bearer $accessToken"
    Accept = "application/json;odata=verbose"
    "Content-Type" = "application/json;odata=verbose"
}

# Function to upload file
function Upload-KBFile {
    param(
        [string]$LocalPath,
        [string]$FolderPath
    )
    
    $fileName = Split-Path $LocalPath -Leaf
    $fileContent = [System.IO.File]::ReadAllBytes($LocalPath)
    
    # Create folder if not exists
    $folderUrl = "$siteUrl/_api/web/GetFolderByServerRelativeUrl('$libraryName/$FolderPath')"
    try {
        $null = Invoke-RestMethod -Uri $folderUrl -Headers $headers -Method Get
    } catch {
        # Folder doesn't exist, create it
        Write-Host "  Creating folder: $FolderPath" -ForegroundColor Gray
        $createFolderUrl = "$siteUrl/_api/web/folders"
        $folderBody = @{
            "__metadata" = @{ "type" = "SP.Folder" }
            "ServerRelativeUrl" = "$libraryName/$FolderPath"
        } | ConvertTo-Json
        
        try {
            $null = Invoke-RestMethod -Uri $createFolderUrl -Headers $headers -Method Post -Body $folderBody
        } catch {
            # Folder might exist at parent level, continue
        }
    }
    
    # Upload file
    $uploadUrl = "$siteUrl/_api/web/GetFolderByServerRelativeUrl('$libraryName/$FolderPath')/Files/add(url='$fileName',overwrite=true)"
    
    try {
        $uploadHeaders = @{
            Authorization = "Bearer $accessToken"
            Accept = "application/json;odata=verbose"
        }
        
        $null = Invoke-RestMethod -Uri $uploadUrl -Headers $uploadHeaders -Method Post -Body $fileContent -ContentType "application/octet-stream"
        Write-Host "  ✓ Uploaded: $fileName" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ✗ Failed to upload $fileName`: $_" -ForegroundColor Red
        return $false
    }
}

# Function to deploy agent KB
function Deploy-AgentKB {
    param(
        [string]$AgentName
    )
    
    Write-Host "`nDeploying $($AgentName.ToUpper()) KB..." -ForegroundColor Yellow
    
    $kbPath = Join-Path $agentsDir "$AgentName/base/kb"
    
    if (-not (Test-Path $kbPath)) {
        Write-Host "  Warning: KB path not found: $kbPath" -ForegroundColor Yellow
        return 0, 0
    }
    
    $files = Get-ChildItem $kbPath -Filter "*.txt" -Recurse
    $uploaded = 0
    $failed = 0
    
    foreach ($file in $files) {
        $result = Upload-KBFile -LocalPath $file.FullName -FolderPath $AgentName.ToUpper()
        if ($result) { $uploaded++ } else { $failed++ }
    }
    
    Write-Host "  Uploaded: $uploaded, Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
    return $uploaded, $failed
}

# Deploy based on agent parameter
$totalUploaded = 0
$totalFailed = 0

if ($Agent -eq "all" -or $Agent -eq "mpa") {
    $u, $f = Deploy-AgentKB -AgentName "mpa"
    $totalUploaded += $u
    $totalFailed += $f
}

if ($Agent -eq "all" -or $Agent -eq "ca") {
    $u, $f = Deploy-AgentKB -AgentName "ca"
    $totalUploaded += $u
    $totalFailed += $f
}

if ($Agent -eq "all" -or $Agent -eq "eap") {
    $u, $f = Deploy-AgentKB -AgentName "eap"
    $totalUploaded += $u
    $totalFailed += $f
}

# Summary
Write-Host "`n=== SharePoint Deployment Summary ===" -ForegroundColor Cyan
Write-Host "Total Uploaded: $totalUploaded" -ForegroundColor Green
Write-Host "Total Failed: $totalFailed" -ForegroundColor $(if ($totalFailed -eq 0) { "Green" } else { "Red" })

if ($totalFailed -gt 0) {
    exit 1
}
```

---

## STEP 8.7: Create Deploy Dataverse Script

**File:** `release/v5.5/deployment/mastercard/scripts/deploy-dataverse.ps1`

```powershell
# Deploy Dataverse Solution and Seed Data
# Imports solution and reference data for specified agent(s)

param(
    [string]$Agent = "all",
    [switch]$SeedDataOnly
)

$ErrorActionPreference = "Stop"
$repoRoot = (Get-Item $PSScriptRoot).Parent.Parent.Parent.Parent.FullName

Write-Host "=== Dataverse Deployment ===" -ForegroundColor Cyan
Write-Host "Agent: $Agent"
Write-Host "Seed Data Only: $SeedDataOnly"
Write-Host ""

# Check for PAC CLI
$pacPath = Get-Command pac -ErrorAction SilentlyContinue
if (-not $pacPath) {
    Write-Host "Error: Power Platform CLI (pac) not found" -ForegroundColor Red
    Write-Host "Install with: winget install Microsoft.PowerPlatformCLI" -ForegroundColor Yellow
    exit 1
}

# Authenticate if needed
Write-Host "Checking authentication..." -ForegroundColor Yellow
$authList = pac auth list 2>&1
if ($authList -match "No profiles") {
    Write-Host "Creating authentication profile..." -ForegroundColor Yellow
    pac auth create --environment $env:DATAVERSE_ENVIRONMENT_URL
}

# Import solution (unless seed data only)
if (-not $SeedDataOnly) {
    Write-Host "`nImporting Dataverse solution..." -ForegroundColor Yellow
    
    $solutionPath = Join-Path $repoRoot "release/v5.5/dataverse/solution.zip"
    
    if (Test-Path $solutionPath) {
        pac solution import --path $solutionPath --activate-plugins --force-overwrite
        Write-Host "  ✓ Solution imported successfully" -ForegroundColor Green
    } else {
        Write-Host "  Warning: Solution file not found at $solutionPath" -ForegroundColor Yellow
        Write-Host "  Using existing customizations.xml from project..." -ForegroundColor Yellow
        
        # Alternative: use customizations.xml if available
        $customizationsPath = "/mnt/project/customizations.xml"
        if (Test-Path $customizationsPath) {
            Write-Host "  Found customizations.xml - manual import required via Power Platform" -ForegroundColor Yellow
        }
    }
}

# Import seed data
Write-Host "`nImporting seed data..." -ForegroundColor Yellow

$seedDataDir = Join-Path $repoRoot "release/v5.5/seed-data"

# Create seed-data directory if it doesn't exist
if (-not (Test-Path $seedDataDir)) {
    New-Item -ItemType Directory -Path $seedDataDir -Force | Out-Null
    
    # Copy seed data from project files
    $projectSeedFiles = @(
        "/mnt/project/mpa_vertical_seed.csv",
        "/mnt/project/mpa_kpi_seed_updated.csv",
        "/mnt/project/mpa_channel_seed_updated.csv",
        "/mnt/project/mpa_benchmark_seed.csv"
    )
    
    foreach ($file in $projectSeedFiles) {
        if (Test-Path $file) {
            Copy-Item $file $seedDataDir
        }
    }
}

# Import each seed file
$seedFiles = @{
    "cr_verticals" = "mpa_vertical_seed.csv"
    "cr_kpis" = "mpa_kpi_seed_updated.csv"
    "cr_channels" = "mpa_channel_seed_updated.csv"
    "cr_benchmarks" = "mpa_benchmark_seed.csv"
}

foreach ($table in $seedFiles.Keys) {
    $seedFile = Join-Path $seedDataDir $seedFiles[$table]
    
    if (Test-Path $seedFile) {
        Write-Host "  Importing $($seedFiles[$table]) to $table..." -ForegroundColor Gray
        try {
            pac data import --data $seedFile --target-table $table --verbose
            Write-Host "    ✓ Imported successfully" -ForegroundColor Green
        } catch {
            Write-Host "    ✗ Import failed: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  Warning: Seed file not found: $seedFile" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Dataverse Deployment Complete ===" -ForegroundColor Cyan
```

---

## STEP 8.8: Update Root Package.json

Add Mastercard-specific scripts to the root package.json:

**File:** `package.json` (root level) - Add these scripts:

```json
{
  "scripts": {
    "deploy:mastercard": "cd release/v5.5/deployment/mastercard/scripts && pwsh deploy-all.ps1",
    "deploy:mastercard:validate": "cd release/v5.5/deployment/mastercard/scripts && pwsh validate-environment.ps1",
    "deploy:mastercard:dataverse": "cd release/v5.5/deployment/mastercard/scripts && pwsh deploy-dataverse.ps1",
    "deploy:mastercard:sharepoint": "cd release/v5.5/deployment/mastercard/scripts && pwsh deploy-sharepoint.ps1",
    "deploy:mastercard:dry-run": "cd release/v5.5/deployment/mastercard/scripts && pwsh deploy-all.ps1 -DryRun",
    "validate:instructions": "cd release/v5.5/deployment/mastercard/scripts && bash validate-instructions.sh"
  }
}
```

---

## STEP 8.9: Create Branch Configuration

Create a branch-specific configuration file:

**File:** `release/v5.5/deployment/mastercard/branch-config.json`

```json
{
  "branch": "deploy/mastercard",
  "environment": "production",
  "organization": "mastercard",
  
  "defaults": {
    "stack": "microsoft",
    "allowStackSwitch": true
  },
  
  "agents": {
    "mpa": {
      "enabled": true,
      "instructionsFile": "agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_PRODUCTION.txt",
      "kbFolder": "MPA",
      "flows": ["session-init", "kb-retrieve", "generate-response", "track-impact"]
    },
    "ca": {
      "enabled": true,
      "instructionsFile": "agents/ca/mastercard/instructions/CA_Copilot_Instructions_PRODUCTION.txt",
      "kbFolder": "CA",
      "flows": ["session-init", "kb-retrieve", "generate-response"]
    },
    "eap": {
      "enabled": true,
      "instructionsFile": "agents/eap/mastercard/instructions/EAP_Copilot_Instructions_PRODUCTION.txt",
      "kbFolder": "EAP",
      "flows": ["session-init", "kb-retrieve"]
    }
  },
  
  "dataverse": {
    "solutionName": "KesselDigitalAgentPlatform",
    "solutionVersion": "5.5.0.0",
    "tables": [
      "cr_agentsessions",
      "cr_kbdocuments",
      "cr_kbusagerecords",
      "cr_kbdocumentimpacts",
      "cr_kbupdateproposals",
      "cr_verticals",
      "cr_kpis",
      "cr_channels",
      "cr_benchmarks"
    ]
  },
  
  "sharepoint": {
    "libraryName": "AgentKnowledgeBase",
    "folders": ["MPA", "CA", "EAP"]
  }
}
```

---

## STEP 8.10: Commit Phase 8

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

git add release/v5.5/deployment/mastercard/
git add release/v5.5/agents/*/mastercard/
git add package.json

git commit -m "feat(deployment): Phase 8 - Mastercard branch configuration

- Add DEPLOYMENT_CHECKLIST.md with pre-deployment verification
- Add DEPLOYMENT_RUNBOOK.md with step-by-step instructions
- Add validate-environment.ps1 for environment validation
- Add deploy-all.ps1 master deployment script
- Add deploy-sharepoint.ps1 for KB upload
- Add deploy-dataverse.ps1 for solution and seed data
- Add branch-config.json for deployment settings
- Add deployment scripts to root package.json
- Create mastercard directories for all agents"
```

---

## STEP 8.11: Create deploy/mastercard Branch

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Ensure we're on deploy/personal
git checkout deploy/personal

# Create mastercard branch from personal
git checkout -b deploy/mastercard

# Update the default stack to microsoft in the branch
# (The config files already default to microsoft, but make it explicit)

# Push the new branch
git push -u origin deploy/mastercard

# Switch back to personal for continued development
git checkout deploy/personal
```

---

## VALIDATION CHECKLIST

After executing this phase, verify:

- [ ] `release/v5.5/deployment/mastercard/` directory exists
- [ ] `DEPLOYMENT_CHECKLIST.md` created
- [ ] `DEPLOYMENT_RUNBOOK.md` created
- [ ] `scripts/validate-environment.ps1` created
- [ ] `scripts/deploy-all.ps1` created
- [ ] `scripts/deploy-sharepoint.ps1` created
- [ ] `scripts/deploy-dataverse.ps1` created
- [ ] `branch-config.json` created
- [ ] `.env.mastercard.template` exists (from Phase 7)
- [ ] Root `package.json` has Mastercard deployment scripts
- [ ] `deploy/mastercard` branch exists
- [ ] Branch pushed to origin

---

## VS CODE CLAUDE PROMPT

```
Execute PHASE_8_MASTERCARD_BRANCH_CONFIG.md

Read the phase document at:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core/PHASE_8_MASTERCARD_BRANCH_CONFIG.md

Execute Steps 8.1 through 8.11 in order:

1. Create deployment directory structure
2. Create DEPLOYMENT_CHECKLIST.md
3. Create DEPLOYMENT_RUNBOOK.md
4. Create validate-environment.ps1
5. Create deploy-all.ps1
6. Create deploy-sharepoint.ps1
7. Create deploy-dataverse.ps1
8. Update root package.json with deployment scripts
9. Create branch-config.json
10. Commit all changes
11. Create deploy/mastercard branch and push

CRITICAL:
- All PowerShell scripts must be syntactically correct
- Deploy scripts must handle errors gracefully
- Branch must be created from deploy/personal
- Push both branches to origin

Verify the deploy/mastercard branch exists after completion.
```

---

## END OF PHASE 8
