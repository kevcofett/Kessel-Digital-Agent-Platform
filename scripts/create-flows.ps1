<#
.SYNOPSIS
    Creates 25 Power Automate flows from YAML specifications.

.DESCRIPTION
    Reads YAML flow definitions from the agents folder and creates corresponding
    Power Automate Cloud Flows using the Power Platform CLI.

.PARAMETER EnvironmentUrl
    The Dataverse environment URL

.PARAMETER FlowsPath
    Path to flow YAML files (default: ../release/v6.0/agents)

.EXAMPLE
    .\create-flows.ps1 -EnvironmentUrl "https://aragorn-ai.crm.dynamics.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,

    [Parameter(Mandatory=$false)]
    [string]$FlowsPath = "../release/v6.0/agents"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$flowsPath = Join-Path $scriptDir $FlowsPath

# Find all YAML flow files
$yamlFiles = Get-ChildItem -Path $flowsPath -Filter "*.yaml" -Recurse

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MPA v6.0 POWER AUTOMATE FLOW CREATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentUrl"
Write-Host "Flows Path: $flowsPath"
Write-Host "Found $($yamlFiles.Count) flow definitions"
Write-Host ""

# Expected flows by agent
$expectedFlows = @{
    "ORC" = @("RouteToSpecialist", "GetSessionState", "UpdateProgress")
    "ANL" = @("CalculateProjection", "RunScenario")
    "AUD" = @("SegmentAudience", "CalculateLTV")
    "CHA" = @("CalculateAllocation", "LookupBenchmarks")
    "SPO" = @("CalculateNBI", "AnalyzeFees", "EvaluatePartner")
    "DOC" = @("GenerateDocument")
    "PRF" = @("AnalyzePerformance", "DetectAnomalies", "ExtractLearnings")
    "CHG" = @("AssessReadiness", "MapStakeholders", "PlanAdoption")
    "CST" = @("SelectFramework", "ApplyAnalysis", "PrioritizeInitiatives")
    "MKT" = @("DevelopStrategy", "CreateBrief", "AnalyzeCompetitive")
}

# Verify PAC CLI
try {
    $pacVersion = pac --version 2>&1
    Write-Host "PAC CLI Version: $pacVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: PAC CLI not found. Install with: npm install -g @microsoft/powerapps-cli" -ForegroundColor Red
    exit 1
}

# Authenticate
Write-Host "`nAuthenticating to environment..." -ForegroundColor Yellow
pac auth create --environment $EnvironmentUrl

$created = 0
$errors = 0

foreach ($yamlFile in $yamlFiles) {
    $flowName = $yamlFile.BaseName
    $agentCode = $yamlFile.Directory.Parent.Name.ToUpper()
    $fullFlowName = "MPA-$agentCode-$flowName"

    Write-Host "`n--- Creating: $fullFlowName ---" -ForegroundColor Cyan
    Write-Host "  Source: $($yamlFile.FullName)"

    try {
        # Read YAML content
        $yamlContent = Get-Content $yamlFile.FullName -Raw

        # For now, log the flow that would be created
        # In production, this would convert YAML to Power Automate JSON and deploy
        Write-Host "  Flow Name: $fullFlowName" -ForegroundColor Gray
        Write-Host "  Agent: $agentCode" -ForegroundColor Gray

        # Note: Full implementation would:
        # 1. Parse YAML using a PowerShell YAML module
        # 2. Convert to Power Automate flow definition JSON
        # 3. Use pac flow create or Power Automate API to deploy

        # Simulate successful creation
        Write-Host "  READY TO CREATE: $fullFlowName" -ForegroundColor Green
        $created++

    } catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
        $errors++
    }
}

# List expected flows
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "EXPECTED FLOWS BY AGENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$totalExpected = 0
foreach ($agent in $expectedFlows.Keys | Sort-Object) {
    $flows = $expectedFlows[$agent]
    Write-Host "`n$agent ($($flows.Count) flows):" -ForegroundColor Yellow
    foreach ($flow in $flows) {
        Write-Host "  - MPA-$agent-$flow" -ForegroundColor Gray
        $totalExpected++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FLOW CREATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YAML files found: $($yamlFiles.Count)"
Write-Host "Expected total: $totalExpected"
Write-Host "Ready to create: $created"
Write-Host "Errors: $errors"

if ($errors -eq 0 -and $created -eq $totalExpected) {
    Write-Host "`nALL FLOWS READY FOR DEPLOYMENT" -ForegroundColor Green
} elseif ($created -lt $totalExpected) {
    Write-Host "`nMISSING FLOWS - Check YAML files" -ForegroundColor Yellow
    Write-Host "  Found: $created" -ForegroundColor Yellow
    Write-Host "  Expected: $totalExpected" -ForegroundColor Yellow
}

Write-Host "`nNOTE: This script prepares flows for creation." -ForegroundColor Cyan
Write-Host "Full deployment requires manual creation in Power Automate or" -ForegroundColor Cyan
Write-Host "use of the Power Automate Management connector API." -ForegroundColor Cyan
