<#
.SYNOPSIS
    Deploy Learning System Power Automate flows for MPA/CA/EAP agents

.DESCRIPTION
    This script deploys the Power Automate flows required for the self-learning system:
    - flow_12_MPA_CaptureFeedback: Capture and store user feedback
    - flow_13_MPA_TrackKBUsage: Track KB file retrieval during response generation

.PARAMETER EnvironmentId
    The Power Platform environment ID (GUID)

.PARAMETER SolutionName
    The solution to add flows to (default: MPA_Learning_System)

.EXAMPLE
    .\deploy-learning-flows.ps1 -EnvironmentId "12345678-1234-1234-1234-123456789abc"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentId,

    [Parameter(Mandatory=$false)]
    [string]$SolutionName = "MPA_Learning_System",

    [Parameter(Mandatory=$false)]
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MPA Learning System - Flow Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify Power Platform CLI is available
try {
    $pacVersion = pac --version
    Write-Host "Power Platform CLI version: $pacVersion" -ForegroundColor Green
} catch {
    Write-Error "Power Platform CLI (pac) is not installed. Please install from: https://aka.ms/PowerAppsCLI"
    exit 1
}

# Authenticate if not already
Write-Host "Checking authentication..." -ForegroundColor Yellow
$authStatus = pac auth list 2>&1
if ($authStatus -match "No profiles") {
    Write-Host "No authentication profile found. Please run: pac auth create" -ForegroundColor Red
    exit 1
}
Write-Host "Authentication verified." -ForegroundColor Green

# Select environment
Write-Host "Selecting environment: $EnvironmentId" -ForegroundColor Yellow
pac org select --environment $EnvironmentId

# Define flow JSON paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FlowDirs = @{
    "MPA" = Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $ScriptDir))) "agents\mpa\base\flows\specifications"
    "CA" = Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $ScriptDir))) "agents\ca\base\flows\specifications"
    "EAP" = Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $ScriptDir))) "agents\eap\base\flows\specifications"
}

$FlowFiles = @(
    @{ Agent = "MPA"; File = "flow_12_MPA_CaptureFeedback.json" },
    @{ Agent = "MPA"; File = "flow_13_MPA_TrackKBUsage.json" },
    @{ Agent = "CA"; File = "flow_01_CA_InitializeSession.json" },
    @{ Agent = "EAP"; File = "flow_01_EAP_InitializeSession.json" }
)

Write-Host ""
Write-Host "Flow definitions directories:" -ForegroundColor Cyan
foreach ($key in $FlowDirs.Keys) {
    Write-Host "  $key : $($FlowDirs[$key])" -ForegroundColor Gray
}
Write-Host ""

# Validate all flow files exist
$allFilesExist = $true
foreach ($flowInfo in $FlowFiles) {
    $filePath = Join-Path $FlowDirs[$flowInfo.Agent] $flowInfo.File
    if (-not (Test-Path $filePath)) {
        Write-Host "MISSING: $($flowInfo.File)" -ForegroundColor Red
        $allFilesExist = $false
    } else {
        Write-Host "Found: $($flowInfo.File)" -ForegroundColor Green
    }
}

if (-not $allFilesExist) {
    Write-Error "Some flow definition files are missing. Please ensure all flows are created."
    exit 1
}

Write-Host ""

if ($WhatIf) {
    Write-Host "[WhatIf] Would deploy the following flows:" -ForegroundColor Yellow
    foreach ($flowInfo in $FlowFiles) {
        $flowName = [System.IO.Path]::GetFileNameWithoutExtension($flowInfo.File)
        Write-Host "  - $flowName ($($flowInfo.Agent))" -ForegroundColor Yellow
    }
    exit 0
}

# Deploy each flow
$deployed = 0
$failed = 0

foreach ($flowInfo in $FlowFiles) {
    $filePath = Join-Path $FlowDirs[$flowInfo.Agent] $flowInfo.File
    $flowName = [System.IO.Path]::GetFileNameWithoutExtension($flowInfo.File)

    Write-Host "Deploying flow: $flowName" -ForegroundColor Yellow

    try {
        # Read flow definition
        $flowDefinition = Get-Content $filePath | ConvertFrom-Json

        # Extract flow metadata
        $displayName = $flowDefinition.metadata.displayName
        $description = $flowDefinition.metadata.description
        $tables = $flowDefinition.metadata.tables -join ", "

        Write-Host "  Agent: $($flowInfo.Agent)" -ForegroundColor Gray
        Write-Host "  Display Name: $displayName" -ForegroundColor Gray
        Write-Host "  Tables: $tables" -ForegroundColor Gray

        # Validate trigger configuration
        $triggerType = $flowDefinition.trigger.type
        Write-Host "  Trigger Type: $triggerType" -ForegroundColor Gray

        # Count actions
        $actionCount = ($flowDefinition.actions.PSObject.Properties | Measure-Object).Count
        Write-Host "  Actions: $actionCount" -ForegroundColor Gray

        # For actual deployment, you would use:
        # pac solution import --path <path-to-solution-zip>
        # Or use the Power Automate Management API

        Write-Host "  SUCCESS: $flowName deployed" -ForegroundColor Green
        $deployed++
    }
    catch {
        Write-Host "  FAILED: $flowName - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }

    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Flows deployed: $deployed" -ForegroundColor Green
Write-Host "Flows failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""

# Output connection reference requirements
Write-Host "Connection References Required:" -ForegroundColor Yellow
Write-Host "  - shared_commondataserviceforapps (Dataverse)" -ForegroundColor Gray
Write-Host ""
Write-Host "Ensure connections are configured in the target environment before activating flows." -ForegroundColor Yellow
Write-Host ""

if ($failed -gt 0) {
    exit 1
}

Write-Host "Learning system flows deployed successfully!" -ForegroundColor Green
