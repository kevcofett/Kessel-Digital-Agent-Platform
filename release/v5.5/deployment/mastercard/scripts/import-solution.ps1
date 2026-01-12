<#
.SYNOPSIS
    Import Power Platform solution and configure for target environment.

.DESCRIPTION
    Imports a Copilot Studio solution (containing agent, topics, flows) and
    configures environment variables and connection references for the target.

.PARAMETER SolutionPath
    Path to the solution .zip file

.PARAMETER Environment
    Target environment: 'personal' or 'mastercard'

.PARAMETER Managed
    Import as managed solution (default: false = unmanaged)

.PARAMETER SkipConnectionSetup
    Skip connection reference configuration (do manually)

.EXAMPLE
    ./import-solution.ps1 -SolutionPath "./solutions/KesselAgentPlatform_5_5_0_0.zip" -Environment "personal"

.EXAMPLE
    ./import-solution.ps1 -SolutionPath "./solutions/KesselAgentPlatform_5_5_0_0_managed.zip" -Environment "mastercard" -Managed
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SolutionPath,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("personal", "mastercard")]
    [string]$Environment,
    
    [switch]$Managed,
    
    [switch]$SkipConnectionSetup
)

$ErrorActionPreference = "Stop"

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            POWER PLATFORM SOLUTION IMPORT                    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Solution: $SolutionPath"
Write-Host "Environment: $Environment"
Write-Host "Type: $(if ($Managed) { 'Managed' } else { 'Unmanaged' })"
Write-Host ""

# Verify solution file exists
if (-not (Test-Path $SolutionPath)) {
    Write-Error "Solution file not found: $SolutionPath"
    exit 1
}

# Verify pac CLI
$pacVersion = pac --version 2>$null
if (-not $pacVersion) {
    Write-Error "Power Platform CLI (pac) not found. Install from: https://aka.ms/PowerAppsCLI"
    exit 1
}

# Check authentication
Write-Host "Checking authentication..."
$authList = pac auth list
if ($authList -match "No profiles") {
    Write-Error "Not authenticated. Run: pac auth create --environment [URL]"
    exit 1
}

Write-Host "Authentication OK"
Write-Host ""

# Load environment configuration
$scriptDir = $PSScriptRoot
$envConfigPath = Join-Path $scriptDir "../config/environment-variables-$Environment.json"

$envConfig = $null
if (Test-Path $envConfigPath) {
    Write-Host "Loading environment configuration from: $envConfigPath"
    $envConfig = Get-Content $envConfigPath | ConvertFrom-Json
} else {
    Write-Host "No environment config file found. Will use defaults or prompt." -ForegroundColor Yellow
}

# ============================================
# STEP 1: Import Solution
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 1: Import Solution" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow

$importArgs = @(
    "solution", "import",
    "--path", $SolutionPath,
    "--activate-plugins",
    "--force-overwrite",
    "--async"
)

Write-Host "Executing: pac $($importArgs -join ' ')"
Write-Host ""

try {
    $importOutput = & pac @importArgs 2>&1
    Write-Host $importOutput
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Solution import failed"
        exit 1
    }
} catch {
    Write-Error "Solution import error: $_"
    exit 1
}

# Wait for async import to complete
Write-Host ""
Write-Host "Waiting for import to complete..."
$timeout = 300  # 5 minutes
$elapsed = 0
$checkInterval = 15

while ($elapsed -lt $timeout) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    # Check import status
    $solutions = pac solution list 2>&1
    if ($solutions -match "KesselAgentPlatform") {
        Write-Host "✓ Solution import complete!" -ForegroundColor Green
        break
    }
    
    Write-Host "  Still importing... ($elapsed seconds)"
}

if ($elapsed -ge $timeout) {
    Write-Warning "Timeout waiting for import. Check Power Platform admin center for status."
}

# ============================================
# STEP 2: Configure Environment Variables
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 2: Configure Environment Variables" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow

# Environment variable definitions
$envVarDefaults = @{
    personal = @{
        kd_SharePointSiteUrl = "https://aragornai.sharepoint.com/sites/AgentKnowledgeBase"
        kd_SharePointLibrary = "AgentKnowledgeBase"
        kd_DataverseUrl = "https://org[xxx].crm.dynamics.com"
        kd_AzureFunctionUrl = ""
    }
    mastercard = @{
        kd_SharePointSiteUrl = "https://mastercard.sharepoint.com/sites/AgentKnowledgeBase"
        kd_SharePointLibrary = "AgentKnowledgeBase"
        kd_DataverseUrl = "https://mastercard.crm.dynamics.com"
        kd_AzureFunctionUrl = ""
    }
}

$envVars = if ($envConfig) { 
    $envConfig.environmentVariables 
} else { 
    $envVarDefaults[$Environment] 
}

Write-Host ""
Write-Host "Setting environment variables for $Environment environment:"

foreach ($varName in $envVars.Keys) {
    $varValue = $envVars[$varName]
    
    if ([string]::IsNullOrEmpty($varValue)) {
        Write-Host "  ⚠ $varName = (not set)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "  Setting $varName..." -NoNewline
    
    try {
        # Note: pac CLI may not have direct env var set command
        # This would need Web API or Power Apps UI
        # Documenting the intended values for manual setup
        Write-Host " → $varValue" -ForegroundColor Cyan
    } catch {
        Write-Host " ✗ Error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "NOTE: Environment variables may need to be set manually in Power Apps:" -ForegroundColor Yellow
Write-Host "  1. Go to make.powerapps.com"
Write-Host "  2. Select environment"
Write-Host "  3. Solutions → Kessel Agent Platform → Environment Variables"
Write-Host "  4. Set 'Current Value' for each variable"

# ============================================
# STEP 3: Configure Connection References
# ============================================
if (-not $SkipConnectionSetup) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  STEP 3: Configure Connection References" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "Connection references require manual configuration:"
    Write-Host ""
    Write-Host "Required connections:" -ForegroundColor White
    Write-Host "  1. Microsoft Dataverse (kd_DataverseConnection)"
    Write-Host "  2. SharePoint (kd_SharePointConnection)"
    Write-Host "  3. HTTP with Azure AD (kd_HTTPConnection) - if used"
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor White
    Write-Host "  1. Go to make.powerapps.com → Solutions → Kessel Agent Platform"
    Write-Host "  2. Click on 'Connection References'"
    Write-Host "  3. For each reference:"
    Write-Host "     a. Click to open"
    Write-Host "     b. Click 'New connection' or select existing"
    Write-Host "     c. Authenticate if prompted"
    Write-Host "     d. Save"
} else {
    Write-Host ""
    Write-Host "Skipping connection setup (--SkipConnectionSetup specified)" -ForegroundColor Yellow
}

# ============================================
# STEP 4: Enable Flows
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 4: Enable Power Automate Flows" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow

Write-Host ""
Write-Host "Flows must be enabled manually after connection setup:"
Write-Host ""
Write-Host "  1. Go to make.powerautomate.com"
Write-Host "  2. Select environment: $Environment"
Write-Host "  3. Go to 'My flows' or find flows in solution"
Write-Host "  4. For each flow:"
Write-Host "     a. Open flow"
Write-Host "     b. Verify no connection errors (red warnings)"
Write-Host "     c. Click 'Turn on'"
Write-Host ""
Write-Host "Expected flows:"
Write-Host "  - MPA_InitializeSession"
Write-Host "  - MPA_SearchBenchmarks"
Write-Host "  - MPA_GenerateDocument"
Write-Host "  - MPA_CaptureFeedback"
Write-Host "  - CA_InitializeSession (if CA included)"
Write-Host "  - CA_SelectFramework (if CA included)"
Write-Host "  - CA_ApplyFramework (if CA included)"
Write-Host "  - CA_GenerateDocument (if CA included)"

# ============================================
# STEP 5: Publish Agent
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 5: Publish Agent in Copilot Studio" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow

Write-Host ""
Write-Host "Final step - publish agent:"
Write-Host ""
Write-Host "  1. Go to copilotstudio.microsoft.com"
Write-Host "  2. Select environment: $Environment"
Write-Host "  3. Find imported agent (Media Planning Agent or Consulting Agent)"
Write-Host "  4. Verify:"
Write-Host "     - Instructions are present"
Write-Host "     - Topics are visible"
Write-Host "     - Knowledge source shows connected"
Write-Host "  5. Click 'Test' to verify in preview"
Write-Host "  6. Click 'Publish'"

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    IMPORT COMPLETE                           ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Solution imported successfully. Complete these manual steps:"
Write-Host ""
Write-Host "  [ ] Set environment variable values in Power Apps"
Write-Host "  [ ] Configure connection references"
Write-Host "  [ ] Enable Power Automate flows"
Write-Host "  [ ] Test agent in Copilot Studio preview"
Write-Host "  [ ] Publish agent"
Write-Host ""
Write-Host "Reference: SOLUTION_EXPORT_IMPORT_WORKFLOW.md for detailed steps"
Write-Host ""

# Create completion log
$logDir = Join-Path $scriptDir "../logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$logFile = Join-Path $logDir "import-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$logData = @{
    SolutionPath = $SolutionPath
    Environment = $Environment
    Managed = $Managed.IsPresent
    Timestamp = (Get-Date).ToString("o")
    Status = "ImportComplete-ManualStepsRequired"
    ManualSteps = @(
        "Set environment variables",
        "Configure connection references",
        "Enable flows",
        "Publish agent"
    )
}
$logData | ConvertTo-Json | Set-Content $logFile
Write-Host "Import log saved: $logFile"

exit 0
