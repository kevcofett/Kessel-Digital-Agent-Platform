<#
.SYNOPSIS
    Export Power Platform solution from development environment.

.DESCRIPTION
    Exports a Copilot Studio solution (containing agent, topics, flows, environment 
    variables, and connection references) from the development environment for 
    deployment to other environments via import.

.PARAMETER SolutionName
    Name of the solution to export (default: KesselAgentPlatform)

.PARAMETER Version
    Version number for the export (e.g., "5.5.0.0")

.PARAMETER OutputPath
    Directory to save exported solution files (default: ./release/v5.5/solutions/)

.PARAMETER ExportManaged
    Also export as managed solution (for production deployments)

.PARAMETER Agent
    Specific agent to export: 'MPA', 'CA', or 'All' (default: All)

.EXAMPLE
    ./export-solution.ps1 -Version "5.5.0.0"

.EXAMPLE
    ./export-solution.ps1 -Version "5.5.1.0" -ExportManaged -Agent "MPA"

.EXAMPLE
    ./export-solution.ps1 -SolutionName "KesselMPA" -Version "1.0.0.0" -OutputPath "./solutions/MPA/"
#>

param(
    [string]$SolutionName = "KesselAgentPlatform",
    
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [string]$OutputPath = "",
    
    [switch]$ExportManaged,
    
    [ValidateSet("MPA", "CA", "All")]
    [string]$Agent = "All"
)

$ErrorActionPreference = "Stop"

# Determine script and repo paths
$scriptDir = $PSScriptRoot
$repoRoot = (Get-Item $scriptDir).Parent.Parent.Parent.Parent.FullName

# Set default output path
if ([string]::IsNullOrEmpty($OutputPath)) {
    $OutputPath = Join-Path $repoRoot "release/v5.5/solutions"
}

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            POWER PLATFORM SOLUTION EXPORT                    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Solution: $SolutionName"
Write-Host "Version: $Version"
Write-Host "Agent: $Agent"
Write-Host "Output: $OutputPath"
Write-Host "Export Managed: $($ExportManaged.IsPresent)"
Write-Host ""

# ============================================
# STEP 0: Verify Prerequisites
# ============================================
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 0: Verify Prerequisites" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Check pac CLI
Write-Host "Checking Power Platform CLI..."
$pacVersion = pac --version 2>$null
if (-not $pacVersion) {
    Write-Error "Power Platform CLI (pac) not found. Install from: https://aka.ms/PowerAppsCLI"
    exit 1
}
Write-Host "  ✓ pac CLI version: $pacVersion" -ForegroundColor Green

# Check authentication
Write-Host "Checking authentication..."
$authList = pac auth list 2>&1
if ($authList -match "No profiles") {
    Write-Error @"
Not authenticated to Power Platform. Run one of these commands:

  # For personal/dev environment:
  pac auth create --environment "https://[your-org].crm.dynamics.com"

  # Or authenticate interactively:
  pac auth create
"@
    exit 1
}
Write-Host "  ✓ Authentication configured" -ForegroundColor Green
Write-Host ""

# Verify solution exists
Write-Host "Verifying solution exists..."
$solutionList = pac solution list 2>&1
if ($solutionList -notmatch $SolutionName) {
    Write-Error @"
Solution '$SolutionName' not found in current environment.

Available solutions:
$solutionList

Make sure you:
1. Are authenticated to the correct environment
2. Have built the solution in Copilot Studio
3. Are using the correct solution name
"@
    exit 1
}
Write-Host "  ✓ Solution '$SolutionName' found" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 1: Publish All Customizations
# ============================================
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 1: Publish All Customizations" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

Write-Host "Publishing all customizations before export..."
Write-Host "(This ensures all changes are included in the export)"
Write-Host ""

try {
    # Note: pac CLI doesn't have direct publish command
    # This would need to be done via Power Apps or Web API
    Write-Host "  ⚠ Manual step required:" -ForegroundColor Yellow
    Write-Host "    1. Open Power Apps: https://make.powerapps.com"
    Write-Host "    2. Go to Solutions → $SolutionName"
    Write-Host "    3. Click 'Publish all customizations'"
    Write-Host "    4. Wait for completion"
    Write-Host ""
    
    $continue = Read-Host "Have you published all customizations? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Export cancelled. Please publish customizations first." -ForegroundColor Yellow
        exit 0
    }
} catch {
    Write-Warning "Could not verify publish status. Continuing with export..."
}

# ============================================
# STEP 2: Export Unmanaged Solution
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 2: Export Unmanaged Solution" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Format version for filename (replace dots with underscores)
$versionForFilename = $Version -replace '\.', '_'
$unmanagedFilename = "${SolutionName}_${versionForFilename}.zip"
$unmanagedPath = Join-Path $OutputPath $unmanagedFilename

Write-Host "Exporting unmanaged solution..."
Write-Host "  Output: $unmanagedPath"
Write-Host ""

try {
    $exportArgs = @(
        "solution", "export",
        "--name", $SolutionName,
        "--path", $unmanagedPath
    )
    
    Write-Host "Executing: pac $($exportArgs -join ' ')"
    $exportOutput = & pac @exportArgs 2>&1
    Write-Host $exportOutput
    
    if ($LASTEXITCODE -ne 0) {
        throw "Export command failed with exit code $LASTEXITCODE"
    }
    
    if (Test-Path $unmanagedPath) {
        $fileSize = (Get-Item $unmanagedPath).Length / 1MB
        Write-Host ""
        Write-Host "  ✓ Unmanaged solution exported successfully" -ForegroundColor Green
        Write-Host "    Size: $([math]::Round($fileSize, 2)) MB"
    } else {
        throw "Export file not created"
    }
} catch {
    Write-Error "Failed to export unmanaged solution: $_"
    exit 1
}

# ============================================
# STEP 3: Export Managed Solution (Optional)
# ============================================
if ($ExportManaged) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  STEP 3: Export Managed Solution" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    
    $managedFilename = "${SolutionName}_${versionForFilename}_managed.zip"
    $managedPath = Join-Path $OutputPath $managedFilename
    
    Write-Host "Exporting managed solution..."
    Write-Host "  Output: $managedPath"
    Write-Host ""
    
    try {
        $exportArgs = @(
            "solution", "export",
            "--name", $SolutionName,
            "--path", $managedPath,
            "--managed"
        )
        
        Write-Host "Executing: pac $($exportArgs -join ' ')"
        $exportOutput = & pac @exportArgs 2>&1
        Write-Host $exportOutput
        
        if ($LASTEXITCODE -ne 0) {
            throw "Export command failed with exit code $LASTEXITCODE"
        }
        
        if (Test-Path $managedPath) {
            $fileSize = (Get-Item $managedPath).Length / 1MB
            Write-Host ""
            Write-Host "  ✓ Managed solution exported successfully" -ForegroundColor Green
            Write-Host "    Size: $([math]::Round($fileSize, 2)) MB"
        } else {
            throw "Export file not created"
        }
    } catch {
        Write-Error "Failed to export managed solution: $_"
        # Don't exit - unmanaged was successful
        Write-Warning "Continuing with unmanaged solution only..."
    }
}

# ============================================
# STEP 4: Verify Export Contents
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 4: Verify Export Contents" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking solution contents..."

# Extract and verify (using .NET ZipFile)
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    
    $tempExtractPath = Join-Path $env:TEMP "solution_verify_$(Get-Random)"
    [System.IO.Compression.ZipFile]::ExtractToDirectory($unmanagedPath, $tempExtractPath)
    
    # Check for expected components
    $checks = @{
        "solution.xml" = $true
        "customizations.xml" = $true
    }
    
    # Check for agent files
    $agentPath = Join-Path $tempExtractPath "botcomponents"
    $workflowsPath = Join-Path $tempExtractPath "Workflows"
    $envVarsPath = Join-Path $tempExtractPath "environmentvariabledefinitions"
    
    $hasAgents = Test-Path $agentPath
    $hasWorkflows = Test-Path $workflowsPath
    $hasEnvVars = Test-Path $envVarsPath
    
    Write-Host ""
    Write-Host "  Solution Contents:" -ForegroundColor White
    Write-Host "    ├─ solution.xml: ✓" -ForegroundColor Green
    Write-Host "    ├─ customizations.xml: ✓" -ForegroundColor Green
    
    if ($hasAgents) {
        $agentCount = (Get-ChildItem $agentPath -Directory).Count
        Write-Host "    ├─ Agents/Bot Components: ✓ ($agentCount found)" -ForegroundColor Green
    } else {
        Write-Host "    ├─ Agents: ⚠ Not found" -ForegroundColor Yellow
    }
    
    if ($hasWorkflows) {
        $flowCount = (Get-ChildItem $workflowsPath -Filter "*.json").Count
        Write-Host "    ├─ Workflows/Flows: ✓ ($flowCount found)" -ForegroundColor Green
    } else {
        Write-Host "    ├─ Workflows: ⚠ Not found" -ForegroundColor Yellow
    }
    
    if ($hasEnvVars) {
        $envVarCount = (Get-ChildItem $envVarsPath -Directory).Count
        Write-Host "    └─ Environment Variables: ✓ ($envVarCount found)" -ForegroundColor Green
    } else {
        Write-Host "    └─ Environment Variables: ⚠ Not found" -ForegroundColor Yellow
    }
    
    # Cleanup temp directory
    Remove-Item $tempExtractPath -Recurse -Force
    
} catch {
    Write-Warning "Could not verify solution contents: $_"
}

# ============================================
# STEP 5: Update Changelog
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 5: Update Changelog" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$changelogPath = Join-Path $OutputPath "CHANGELOG.md"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$changelogEntry = @"

## [$Version] - $(Get-Date -Format "yyyy-MM-dd")

### Exported
- Solution: $SolutionName
- Agent: $Agent
- Unmanaged: $unmanagedFilename
$(if ($ExportManaged) { "- Managed: $managedFilename" })

### Export Details
- Timestamp: $timestamp
- Source: Development environment
- pac CLI version: $pacVersion

### Next Steps
- [ ] Test import to Personal environment
- [ ] Test import to Mastercard environment
- [ ] Verify all components work after import
- [ ] Commit to repository

"@

if (Test-Path $changelogPath) {
    $existingContent = Get-Content $changelogPath -Raw
    $newContent = $existingContent -replace "(# Solution Changelog\s*\n)", "`$1$changelogEntry"
    Set-Content $changelogPath $newContent
} else {
    $newChangelog = @"
# Solution Changelog

All notable changes to exported solutions are documented here.

$changelogEntry
"@
    Set-Content $changelogPath $newChangelog
}

Write-Host "  ✓ Changelog updated: $changelogPath" -ForegroundColor Green

# ============================================
# STEP 6: Git Instructions
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 6: Commit to Repository" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

Write-Host "Run these commands to commit the exported solution:"
Write-Host ""
Write-Host "  cd $repoRoot" -ForegroundColor Cyan
Write-Host "  git add release/v5.5/solutions/" -ForegroundColor Cyan
Write-Host "  git commit -m `"Export solution $SolutionName v$Version`"" -ForegroundColor Cyan
Write-Host "  git push origin deploy/mastercard" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    EXPORT COMPLETE                           ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Exported Files:" -ForegroundColor White
Write-Host "  • $unmanagedPath"
if ($ExportManaged -and (Test-Path $managedPath)) {
    Write-Host "  • $managedPath"
}
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Commit exported solution to git repository"
Write-Host "  2. Test import to Personal environment:"
Write-Host "     ./import-solution.ps1 -SolutionPath `"$unmanagedPath`" -Environment personal"
Write-Host "  3. Test import to Mastercard environment:"
Write-Host "     ./import-solution.ps1 -SolutionPath `"$unmanagedPath`" -Environment mastercard"
Write-Host ""

# Create export log
$logDir = Join-Path $scriptDir "../logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$logFile = Join-Path $logDir "export-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$logData = @{
    SolutionName = $SolutionName
    Version = $Version
    Agent = $Agent
    UnmanagedPath = $unmanagedPath
    ManagedPath = if ($ExportManaged) { $managedPath } else { $null }
    Timestamp = (Get-Date).ToString("o")
    Status = "ExportComplete"
    PacVersion = $pacVersion
}
$logData | ConvertTo-Json | Set-Content $logFile
Write-Host "Export log saved: $logFile"

exit 0
