<#
.SYNOPSIS
    Master deployment script - orchestrates full deployment to target environment.

.DESCRIPTION
    Runs all deployment steps in order:
    1. Validate environment
    2. Deploy SharePoint KB files
    3. Deploy Dataverse tables
    4. Import seed data
    5. Deploy Power Automate flows
    6. Run integration tests
    7. Generate manual steps checklist

.PARAMETER Environment
    Target environment: 'personal' or 'mastercard'

.PARAMETER SkipValidation
    Skip environment validation (use if already validated)

.PARAMETER Agent
    Which agent(s) to deploy: 'mpa', 'ca', 'eap', or 'all'

.EXAMPLE
    ./deploy-all.ps1 -Environment "personal" -Agent "all"
    
.EXAMPLE
    ./deploy-all.ps1 -Environment "mastercard" -Agent "mpa" -SkipValidation
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("personal", "mastercard")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("mpa", "ca", "eap", "all")]
    [string]$Agent = "all",
    
    [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"
$startTime = Get-Date
$scriptDir = $PSScriptRoot

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         KESSEL DIGITAL AGENT PLATFORM DEPLOYMENT             ║" -ForegroundColor Cyan
Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  Environment: $($Environment.PadRight(45))║" -ForegroundColor Cyan
Write-Host "║  Agent(s):    $($Agent.PadRight(45))║" -ForegroundColor Cyan
Write-Host "║  Time:        $($(Get-Date -Format 'yyyy-MM-dd HH:mm:ss').PadRight(45))║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Define paths relative to repo root
$repoRoot = (Get-Item $scriptDir).Parent.Parent.Parent.Parent.FullName
$releasePath = Join-Path $repoRoot "release/v5.5"

$paths = @{
    mpa = @{
        kb = Join-Path $releasePath "agents/mpa/base/kb"
        flows = Join-Path $releasePath "agents/mpa/base/flows/specifications"
        seed = Join-Path $releasePath "agents/mpa/base/data/seed"
        dataverse = Join-Path $releasePath "agents/mpa/base/dataverse"
    }
    ca = @{
        kb = Join-Path $releasePath "agents/ca/base/kb"
        flows = Join-Path $releasePath "agents/ca/base/schema/flows"
        seed = Join-Path $releasePath "agents/ca/base/seed_data"
        dataverse = Join-Path $releasePath "agents/ca/base/schema/tables"
    }
    eap = @{
        kb = Join-Path $releasePath "platform/eap-core/base/kb"
        flows = Join-Path $releasePath "platform/eap-core/base/flows"
        seed = Join-Path $releasePath "platform/eap-core/base/seed_data"
        dataverse = Join-Path $releasePath "platform/eap-core/base/schema/tables"
    }
}

$stepNumber = 0
$steps = @()

function Write-Step {
    param([string]$Title)
    $script:stepNumber++
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  STEP $stepNumber`: $Title" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
}

function Add-StepResult {
    param(
        [string]$Step,
        [bool]$Success,
        [string]$Duration,
        [string]$Details
    )
    $script:steps += @{
        Step = $Step
        Success = $Success
        Duration = $Duration
        Details = $Details
    }
}

# ============================================
# STEP 1: Environment Validation
# ============================================
if (-not $SkipValidation) {
    Write-Step "Environment Validation"
    
    $validateStart = Get-Date
    try {
        & "$scriptDir/validate-environment.ps1" -Environment $Environment
        $validateResult = $LASTEXITCODE -eq 0
    } catch {
        $validateResult = $false
    }
    $validateDuration = ((Get-Date) - $validateStart).ToString("mm\:ss")
    
    Add-StepResult -Step "Validation" -Success $validateResult -Duration $validateDuration -Details ""
    
    if (-not $validateResult) {
        Write-Host ""
        Write-Host "✗ Environment validation failed. Fix issues before deploying." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Skipping validation (--SkipValidation specified)" -ForegroundColor Yellow
}

# Determine which agents to deploy
$agentsToDeploy = if ($Agent -eq "all") { @("mpa", "ca") } else { @($Agent) }

# ============================================
# STEP 2: Deploy SharePoint KB Files
# ============================================
Write-Step "Deploy SharePoint KB Files"

foreach ($agentName in $agentsToDeploy) {
    $kbPath = $paths[$agentName].kb
    
    if (Test-Path $kbPath) {
        Write-Host "Deploying $($agentName.ToUpper()) KB files..."
        $kbStart = Get-Date
        
        try {
            & "$scriptDir/deploy-sharepoint.ps1" `
                -SourcePath $kbPath `
                -TargetFolder $agentName.ToUpper() `
                -Environment $Environment
            
            $kbResult = $LASTEXITCODE -eq 0
        } catch {
            $kbResult = $false
            Write-Host "Error: $_" -ForegroundColor Red
        }
        
        $kbDuration = ((Get-Date) - $kbStart).ToString("mm\:ss")
        Add-StepResult -Step "SharePoint KB ($agentName)" -Success $kbResult -Duration $kbDuration -Details ""
    } else {
        Write-Host "KB path not found for $agentName`: $kbPath" -ForegroundColor Yellow
    }
}

# ============================================
# STEP 3: Deploy Dataverse Tables
# ============================================
Write-Step "Deploy Dataverse Tables"

foreach ($agentName in $agentsToDeploy) {
    $dvPath = $paths[$agentName].dataverse
    
    if (Test-Path $dvPath) {
        Write-Host "Deploying $($agentName.ToUpper()) Dataverse tables..."
        $dvStart = Get-Date
        
        try {
            & "$scriptDir/deploy-dataverse.ps1" `
                -SolutionPath $dvPath `
                -Environment $Environment
            
            $dvResult = $true  # Script handles its own errors
        } catch {
            $dvResult = $false
            Write-Host "Error: $_" -ForegroundColor Red
        }
        
        $dvDuration = ((Get-Date) - $dvStart).ToString("mm\:ss")
        Add-StepResult -Step "Dataverse Tables ($agentName)" -Success $dvResult -Duration $dvDuration -Details ""
    }
}

# ============================================
# STEP 4: Import Seed Data
# ============================================
Write-Step "Import Seed Data"

foreach ($agentName in $agentsToDeploy) {
    $seedPath = $paths[$agentName].seed
    
    if (Test-Path $seedPath) {
        Write-Host "Importing $($agentName.ToUpper()) seed data..."
        $seedStart = Get-Date
        
        try {
            & "$scriptDir/import-seed-data.ps1" `
                -DataPath $seedPath `
                -Environment $Environment
            
            $seedResult = $LASTEXITCODE -eq 0
        } catch {
            $seedResult = $false
            Write-Host "Error: $_" -ForegroundColor Red
        }
        
        $seedDuration = ((Get-Date) - $seedStart).ToString("mm\:ss")
        Add-StepResult -Step "Seed Data ($agentName)" -Success $seedResult -Duration $seedDuration -Details ""
    }
}

# ============================================
# STEP 5: Deploy Power Automate Flows
# ============================================
Write-Step "Deploy Power Automate Flows"

foreach ($agentName in $agentsToDeploy) {
    $flowsPath = $paths[$agentName].flows
    
    if (Test-Path $flowsPath) {
        Write-Host "Deploying $($agentName.ToUpper()) flows..."
        $flowStart = Get-Date
        
        try {
            & "$scriptDir/deploy-flows.ps1" `
                -FlowsPath $flowsPath `
                -Environment $Environment
            
            $flowResult = $true
        } catch {
            $flowResult = $false
            Write-Host "Error: $_" -ForegroundColor Red
        }
        
        $flowDuration = ((Get-Date) - $flowStart).ToString("mm\:ss")
        Add-StepResult -Step "Flows ($agentName)" -Success $flowResult -Duration $flowDuration -Details ""
    }
}

# ============================================
# STEP 6: Run Integration Tests
# ============================================
Write-Step "Integration Tests"

$testStart = Get-Date
try {
    & "$scriptDir/test-integration.ps1" -Environment $Environment
    $testResult = $LASTEXITCODE -eq 0
} catch {
    $testResult = $false
}
$testDuration = ((Get-Date) - $testStart).ToString("mm\:ss")

Add-StepResult -Step "Integration Tests" -Success $testResult -Duration $testDuration -Details ""

# ============================================
# Summary
# ============================================
$totalDuration = ((Get-Date) - $startTime).ToString("mm\:ss")

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    DEPLOYMENT SUMMARY                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step Results:" -ForegroundColor White
Write-Host "─────────────────────────────────────────────────────────────────"
foreach ($step in $steps) {
    $status = if ($step.Success) { "✓" } else { "✗" }
    $color = if ($step.Success) { "Green" } else { "Red" }
    Write-Host "  $status $($step.Step.PadRight(35)) [$($step.Duration)]" -ForegroundColor $color
}
Write-Host "─────────────────────────────────────────────────────────────────"
Write-Host "  Total Time: $totalDuration"
Write-Host ""

$successCount = ($steps | Where-Object { $_.Success }).Count
$failCount = ($steps | Where-Object { -not $_.Success }).Count

if ($failCount -eq 0) {
    Write-Host "✓ All automated deployment steps completed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠ $failCount step(s) had issues. Review output above." -ForegroundColor Yellow
}

# ============================================
# Manual Steps Checklist
# ============================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║              MANUAL STEPS REQUIRED                           ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""
Write-Host "Complete these steps in the indicated order:" -ForegroundColor White
Write-Host ""

$manualStep = 1

Write-Host "POWER AUTOMATE (https://make.powerautomate.com)" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"
Write-Host "  $manualStep. Select environment: $Environment"; $manualStep++
Write-Host "  $manualStep. Open each imported flow"; $manualStep++
Write-Host "  $manualStep. Update connection references (Dataverse, SharePoint)"; $manualStep++
Write-Host "  $manualStep. Save and enable each flow"; $manualStep++
Write-Host ""

Write-Host "COPILOT STUDIO (https://copilotstudio.microsoft.com)" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"

foreach ($agentName in $agentsToDeploy) {
    $agentUpper = $agentName.ToUpper()
    Write-Host ""
    Write-Host "  $agentUpper Agent:" -ForegroundColor Cyan
    Write-Host "  $manualStep. Open/Create '$agentUpper' agent in Copilot Studio"; $manualStep++
    Write-Host "  $manualStep. Paste instructions from repo file"; $manualStep++
    Write-Host "  $manualStep. Connect SharePoint KB source (folder: $agentUpper)"; $manualStep++
    Write-Host "  $manualStep. Create topics (see COPILOT_STUDIO_MANUAL_STEPS.md)"; $manualStep++
    Write-Host "  $manualStep. Connect flows to topics"; $manualStep++
    Write-Host "  $manualStep. Test in preview panel"; $manualStep++
    Write-Host "  $manualStep. Publish agent"; $manualStep++
}

Write-Host ""
Write-Host "VERIFICATION" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"
Write-Host "  $manualStep. Test: Say 'Hello' to each agent"; $manualStep++
Write-Host "  $manualStep. Test: Ask a KB question (verify citation)"; $manualStep++
Write-Host "  $manualStep. Test: Start a planning/analysis session"; $manualStep++
Write-Host ""

Write-Host "Reference Documentation:" -ForegroundColor White
Write-Host "  • $releasePath/deployment/COPILOT_STUDIO_MANUAL_STEPS.md"
Write-Host "  • $releasePath/agents/$($agentsToDeploy[0])/base/copilot/topics/"
Write-Host ""

# Save deployment log
$logFile = Join-Path $scriptDir "../../deployment-log-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$deploymentLog = @{
    Environment = $Environment
    Agents = $agentsToDeploy
    StartTime = $startTime.ToString("o")
    EndTime = (Get-Date).ToString("o")
    Duration = $totalDuration
    Steps = $steps
    Success = ($failCount -eq 0)
}
$deploymentLog | ConvertTo-Json -Depth 3 | Set-Content $logFile
Write-Host "Deployment log saved: $logFile" -ForegroundColor Gray

if ($failCount -gt 0) {
    exit 1
} else {
    exit 0
}
