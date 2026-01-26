# deploy-sharepoint-kb.ps1
# Deploys Knowledge Base files to SharePoint document library
# Automates file upload for MPA, CA, and EAP agents

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("personal", "mastercard")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("MPA", "CA", "EAP", "ALL")]
    [string]$Agent = "ALL",
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$ScriptRoot = $PSScriptRoot
$RepoRoot = (Get-Item $ScriptRoot).Parent.Parent.Parent.FullName

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SharePoint KB Deployment Script" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Agent(s): $Agent" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment configuration
$envFile = Join-Path $RepoRoot ".env.$Environment"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
    Write-Host "[OK] Loaded environment from $envFile" -ForegroundColor Green
} else {
    Write-Host "[WARN] No .env.$Environment file found. Using defaults." -ForegroundColor Yellow
}

# Get SharePoint configuration
$SharePointSite = $env:SHAREPOINT_SITE
$SharePointLibrary = $env:SHAREPOINT_LIBRARY
if (-not $SharePointLibrary) { $SharePointLibrary = "AgentKnowledgeBase" }

if (-not $SharePointSite) {
    Write-Host "[ERROR] SHAREPOINT_SITE not configured. Set in .env.$Environment" -ForegroundColor Red
    exit 1
}

Write-Host "SharePoint Site: $SharePointSite" -ForegroundColor Gray
Write-Host "SharePoint Library: $SharePointLibrary" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# AGENT PATHS CONFIGURATION
# ============================================================================

$AgentPaths = @{
    "MPA" = @{
        SourcePath = Join-Path $RepoRoot "release/v5.5/agents/mpa/base/kb"
        TargetFolder = "MPA"
        ExpectedCount = 32
    }
    "CA" = @{
        SourcePath = Join-Path $RepoRoot "release/v5.5/agents/ca/base/kb"
        TargetFolder = "CA"
        ExpectedCount = 35
    }
    "EAP" = @{
        SourcePath = Join-Path $RepoRoot "release/v5.5/platform/eap-core/base/kb"
        TargetFolder = "EAP"
        ExpectedCount = 7
    }
}

# ============================================================================
# FUNCTIONS
# ============================================================================

function Test-PnPConnection {
    try {
        $ctx = Get-PnPContext -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Connect-ToSharePoint {
    param([string]$SiteUrl)
    
    Write-Host "Connecting to SharePoint..." -ForegroundColor Yellow
    
    if ($Environment -eq "mastercard") {
        # Use certificate or client credentials for Mastercard
        # This requires app registration
        Write-Host "[INFO] For Mastercard, ensure you have authenticated via:" -ForegroundColor Gray
        Write-Host "  Connect-PnPOnline -Url '$SiteUrl' -ClientId 'xxx' -Tenant 'xxx'" -ForegroundColor Gray
        
        # Try interactive as fallback
        Connect-PnPOnline -Url $SiteUrl -Interactive
    } else {
        # Interactive for personal
        Connect-PnPOnline -Url $SiteUrl -Interactive
    }
    
    if (Test-PnPConnection) {
        Write-Host "[OK] Connected to SharePoint" -ForegroundColor Green
    } else {
        throw "Failed to connect to SharePoint"
    }
}

function Ensure-Folder {
    param([string]$FolderPath)
    
    try {
        $folder = Get-PnPFolder -Url "$SharePointLibrary/$FolderPath" -ErrorAction SilentlyContinue
        if ($folder) {
            Write-Host "[OK] Folder exists: $FolderPath" -ForegroundColor Green
        }
    } catch {
        Write-Host "[CREATE] Creating folder: $FolderPath" -ForegroundColor Yellow
        if (-not $WhatIf) {
            Add-PnPFolder -Name $FolderPath -Folder $SharePointLibrary
        }
    }
}

function Upload-KBFiles {
    param(
        [string]$SourcePath,
        [string]$TargetFolder,
        [int]$ExpectedCount
    )
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host "Uploading: $TargetFolder" -ForegroundColor Cyan
    Write-Host "Source: $SourcePath" -ForegroundColor Gray
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Verify source exists
    if (-not (Test-Path $SourcePath)) {
        Write-Host "[ERROR] Source path not found: $SourcePath" -ForegroundColor Red
        return @{ Success = $false; Uploaded = 0; Expected = $ExpectedCount }
    }
    
    # Get files
    $files = Get-ChildItem -Path $SourcePath -Filter "*.txt" -File
    $fileCount = $files.Count
    
    Write-Host "Found $fileCount files (expected: $ExpectedCount)" -ForegroundColor Gray
    
    if ($fileCount -eq 0) {
        Write-Host "[WARN] No .txt files found in $SourcePath" -ForegroundColor Yellow
        return @{ Success = $false; Uploaded = 0; Expected = $ExpectedCount }
    }
    
    # Ensure target folder exists
    Ensure-Folder -FolderPath $TargetFolder
    
    # Upload each file
    $uploaded = 0
    $failed = 0
    
    foreach ($file in $files) {
        $targetPath = "$SharePointLibrary/$TargetFolder"
        
        try {
            if ($WhatIf) {
                Write-Host "  [WHATIF] Would upload: $($file.Name)" -ForegroundColor Cyan
            } else {
                Add-PnPFile -Path $file.FullName -Folder $targetPath -ErrorAction Stop | Out-Null
                Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
            }
            $uploaded++
        } catch {
            Write-Host "  [FAIL] $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
            $failed++
        }
    }
    
    Write-Host ""
    Write-Host "Results: $uploaded uploaded, $failed failed" -ForegroundColor $(if ($failed -gt 0) { "Yellow" } else { "Green" })
    
    return @{
        Success = ($failed -eq 0)
        Uploaded = $uploaded
        Failed = $failed
        Expected = $ExpectedCount
    }
}

function Verify-Upload {
    param(
        [string]$TargetFolder,
        [int]$ExpectedCount
    )
    
    Write-Host ""
    Write-Host "Verifying $TargetFolder..." -ForegroundColor Yellow
    
    try {
        $items = Get-PnPFolderItem -FolderSiteRelativeUrl "$SharePointLibrary/$TargetFolder" -ItemType File
        $actualCount = $items.Count
        
        if ($actualCount -eq $ExpectedCount) {
            Write-Host "[OK] $TargetFolder: $actualCount files (matches expected)" -ForegroundColor Green
            return $true
        } elseif ($actualCount -gt 0) {
            Write-Host "[WARN] $TargetFolder: $actualCount files (expected $ExpectedCount)" -ForegroundColor Yellow
            return $true
        } else {
            Write-Host "[ERROR] $TargetFolder: No files found" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "[ERROR] Could not verify $TargetFolder: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

try {
    # Connect to SharePoint
    if (-not (Test-PnPConnection)) {
        Connect-ToSharePoint -SiteUrl $SharePointSite
    }
    
    # Determine which agents to deploy
    $agentsToDeploy = @()
    if ($Agent -eq "ALL") {
        $agentsToDeploy = @("MPA", "CA", "EAP")
    } else {
        $agentsToDeploy = @($Agent)
    }
    
    # Deploy each agent
    $results = @{}
    foreach ($agentName in $agentsToDeploy) {
        $config = $AgentPaths[$agentName]
        $result = Upload-KBFiles `
            -SourcePath $config.SourcePath `
            -TargetFolder $config.TargetFolder `
            -ExpectedCount $config.ExpectedCount
        $results[$agentName] = $result
    }
    
    # Verify uploads
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "VERIFICATION" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    foreach ($agentName in $agentsToDeploy) {
        $config = $AgentPaths[$agentName]
        Verify-Upload -TargetFolder $config.TargetFolder -ExpectedCount $config.ExpectedCount
    }
    
    # Summary
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $allSuccess = $true
    foreach ($agentName in $results.Keys) {
        $r = $results[$agentName]
        $status = if ($r.Success) { "[OK]" } else { "[FAIL]" }
        $color = if ($r.Success) { "Green" } else { "Red" }
        Write-Host "$status $agentName: $($r.Uploaded)/$($r.Expected) files" -ForegroundColor $color
        if (-not $r.Success) { $allSuccess = $false }
    }
    
    if ($allSuccess) {
        Write-Host ""
        Write-Host "All KB files deployed successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host ""
        Write-Host "Some deployments failed. Check errors above." -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "[FATAL] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}
