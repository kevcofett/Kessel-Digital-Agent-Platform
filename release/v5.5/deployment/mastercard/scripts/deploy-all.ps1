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
