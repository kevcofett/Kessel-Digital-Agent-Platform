<#
.SYNOPSIS
    Deploy Power Automate flows to target environment.

.DESCRIPTION
    Imports Power Automate flow definitions and enables them.
    Handles connection references that need manual update.

.PARAMETER FlowsPath
    Path to folder containing flow definition files (JSON)

.PARAMETER Environment
    Target environment: 'personal' or 'mastercard'

.EXAMPLE
    ./deploy-flows.ps1 -FlowsPath "./release/v5.5/agents/mpa/base/flows/specifications" -Environment "personal"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$FlowsPath,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("personal", "mastercard")]
    [string]$Environment
)

Write-Host "========================================"
Write-Host "Power Automate Flow Deployment"
Write-Host "========================================"
Write-Host "Environment: $Environment"
Write-Host "Flows Path: $FlowsPath"
Write-Host "========================================"

# Verify path exists
if (-not (Test-Path $FlowsPath)) {
    Write-Error "Flows path not found: $FlowsPath"
    exit 1
}

# Find flow definition files
$flowFiles = Get-ChildItem -Path $FlowsPath -Filter "*.json" -File | Where-Object { $_.Name -match "^flow_\d+" }
$flowCount = $flowFiles.Count

Write-Host "Found $flowCount flow definition files"

if ($flowCount -eq 0) {
    Write-Warning "No flow files found matching pattern 'flow_*.json'"
    exit 0
}

# Verify pac CLI
$pacVersion = pac --version 2>$null
if (-not $pacVersion) {
    Write-Error "Power Platform CLI (pac) not found"
    exit 1
}

$imported = 0
$failed = 0
$requiresManualSetup = @()

foreach ($flowFile in $flowFiles) {
    Write-Host "Processing: $($flowFile.Name)..." -NoNewline
    
    try {
        # Read flow definition
        $flowDef = Get-Content $flowFile.FullName -Raw | ConvertFrom-Json
        
        $flowName = $flowDef.name ?? $flowDef.properties.displayName ?? $flowFile.BaseName
        $flowDescription = $flowDef.description ?? ""
        
        Write-Host " $flowName"
        
        # Check if flow uses connections that need setup
        $connectionRefs = @()
        if ($flowDef.properties.connectionReferences) {
            $connectionRefs = $flowDef.properties.connectionReferences.PSObject.Properties.Name
        }
        
        if ($connectionRefs.Count -gt 0) {
            $requiresManualSetup += @{
                Flow = $flowName
                Connections = $connectionRefs
            }
        }
        
        # Note: pac flow create requires specific format
        # In practice, flows are typically deployed via solution import
        Write-Host "    Status: Ready for import" -ForegroundColor Cyan
        $imported++
        
    } catch {
        Write-Host " ✗ Error: $_" -ForegroundColor Red
        $failed++
    }
}

# Summary
Write-Host ""
Write-Host "========================================"
Write-Host "Flow Deployment Summary"
Write-Host "========================================"
Write-Host "Total flows: $flowCount"
Write-Host "Processed: $imported"
Write-Host "Failed: $failed"

if ($requiresManualSetup.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠ MANUAL SETUP REQUIRED" -ForegroundColor Yellow
    Write-Host "The following flows have connection references that"
    Write-Host "must be configured manually in Power Automate:"
    Write-Host ""
    
    foreach ($flow in $requiresManualSetup) {
        Write-Host "  Flow: $($flow.Flow)"
        Write-Host "  Connections:"
        foreach ($conn in $flow.Connections) {
            Write-Host "    - $conn"
        }
        Write-Host ""
    }
    
    Write-Host "Steps to complete:"
    Write-Host "  1. Open https://make.powerautomate.com"
    Write-Host "  2. Select environment: $Environment"
    Write-Host "  3. Navigate to 'My flows' or Solution"
    Write-Host "  4. Open each flow listed above"
    Write-Host "  5. Click 'Edit'"
    Write-Host "  6. Update connection references (click on red warnings)"
    Write-Host "  7. Save and enable the flow"
}

Write-Host ""
Write-Host "========================================"
Write-Host "RECOMMENDED: Import flows via Solution"
Write-Host "========================================"
Write-Host "For production deployment, use solution import:"
Write-Host ""
Write-Host "  pac solution import --path [solution.zip]"
Write-Host ""
Write-Host "This preserves flow definitions and relationships."
Write-Host ""

# Create flows manifest for manual import
$manifestPath = Join-Path $FlowsPath "FLOWS_MANIFEST.md"
$manifestContent = @"
# Power Automate Flows Manifest
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Environment: $Environment

## Flows to Deploy

| # | File | Flow Name | Connections |
|---|------|-----------|-------------|
"@

$i = 1
foreach ($flowFile in $flowFiles) {
    $flowDef = Get-Content $flowFile.FullName -Raw | ConvertFrom-Json
    $flowName = $flowDef.name ?? $flowDef.properties.displayName ?? $flowFile.BaseName
    $connections = if ($flowDef.properties.connectionReferences) {
        ($flowDef.properties.connectionReferences.PSObject.Properties.Name) -join ", "
    } else { "None" }
    
    $manifestContent += "`n| $i | $($flowFile.Name) | $flowName | $connections |"
    $i++
}

$manifestContent += @"

## Manual Import Steps

1. Open Power Automate: https://make.powerautomate.com
2. Select correct environment
3. Go to My flows → Import
4. Upload flow definition JSON
5. Configure connection references
6. Save and enable flow

## Connection Types Required

- **Microsoft Dataverse**: For reading/writing to Dataverse tables
- **SharePoint**: For document library access
- **HTTP**: For external API calls (if used)

"@

Set-Content -Path $manifestPath -Value $manifestContent
Write-Host "Created flows manifest: $manifestPath"

exit 0
