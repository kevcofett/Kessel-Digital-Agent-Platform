<#
.SYNOPSIS
    Deploy SharePoint Knowledge Base files to target environment.

.DESCRIPTION
    Uploads all KB files from specified source folder to SharePoint document library.
    Supports both Personal and Mastercard environments.

.PARAMETER SourcePath
    Local path to KB files folder

.PARAMETER TargetFolder
    SharePoint folder name (MPA, CA, or EAP)

.PARAMETER Environment
    Target environment: 'personal' or 'mastercard'

.EXAMPLE
    ./deploy-sharepoint.ps1 -SourcePath "./release/v5.5/agents/mpa/base/kb" -TargetFolder "MPA" -Environment "personal"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SourcePath,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("MPA", "CA", "EAP")]
    [string]$TargetFolder,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("personal", "mastercard")]
    [string]$Environment
)

# Load environment configuration
$envFile = Join-Path $PSScriptRoot "../../.env.$Environment"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Environment-specific settings
$config = @{
    personal = @{
        SiteUrl = $env:SHAREPOINT_SITE
        Library = $env:SHAREPOINT_LIBRARY
    }
    mastercard = @{
        SiteUrl = $env:SHAREPOINT_SITE
        Library = $env:SHAREPOINT_LIBRARY
    }
}

$siteUrl = $config[$Environment].SiteUrl
$library = $config[$Environment].Library

if (-not $siteUrl) {
    Write-Error "SharePoint site URL not configured. Set SHAREPOINT_SITE in .env.$Environment"
    exit 1
}

Write-Host "========================================"
Write-Host "SharePoint KB Deployment"
Write-Host "========================================"
Write-Host "Environment: $Environment"
Write-Host "Source: $SourcePath"
Write-Host "Target: $siteUrl/$library/$TargetFolder"
Write-Host "========================================"

# Verify source path exists
if (-not (Test-Path $SourcePath)) {
    Write-Error "Source path not found: $SourcePath"
    exit 1
}

# Count source files
$sourceFiles = Get-ChildItem -Path $SourcePath -Filter "*.txt" -File
$fileCount = $sourceFiles.Count

Write-Host "Found $fileCount .txt files to upload"

# Check for PnP PowerShell module
if (-not (Get-Module -ListAvailable -Name "PnP.PowerShell")) {
    Write-Host "Installing PnP.PowerShell module..."
    Install-Module -Name PnP.PowerShell -Force -AllowClobber -Scope CurrentUser
}

Import-Module PnP.PowerShell

# Connect to SharePoint
try {
    Write-Host "Connecting to SharePoint..."
    
    if ($Environment -eq "mastercard") {
        # Use service principal for Mastercard
        $clientId = $env:SP_CLIENT_ID
        $clientSecret = $env:SP_CLIENT_SECRET
        $tenantId = $env:TENANT_ID

        if ($clientId -and $clientSecret) {
            Connect-PnPOnline -Url $siteUrl -ClientId $clientId -ClientSecret $clientSecret -Tenant $tenantId
        } else {
            # Fallback to interactive
            Connect-PnPOnline -Url $siteUrl -Interactive
        }
    } else {
        # Interactive login for personal with registered app
        $pnpClientId = $env:PNP_CLIENT_ID
        if ($pnpClientId) {
            Connect-PnPOnline -Url $siteUrl -Interactive -ClientId $pnpClientId
        } else {
            Connect-PnPOnline -Url $siteUrl -Interactive
        }
    }
    
    Write-Host "Connected successfully"
} catch {
    Write-Error "Failed to connect to SharePoint: $_"
    exit 1
}

# Create target folder if it doesn't exist
try {
    $folderPath = "$library/$TargetFolder"
    $existingFolder = Get-PnPFolder -Url $folderPath -ErrorAction SilentlyContinue
    
    if (-not $existingFolder) {
        Write-Host "Creating folder: $TargetFolder"
        Add-PnPFolder -Name $TargetFolder -Folder $library
    }
} catch {
    Write-Host "Folder may already exist, continuing..."
}

# Upload files
$uploaded = 0
$failed = 0
$errors = @()

foreach ($file in $sourceFiles) {
    try {
        Write-Host "Uploading: $($file.Name)..." -NoNewline
        
        Add-PnPFile -Path $file.FullName -Folder "$library/$TargetFolder" -ErrorAction Stop
        
        Write-Host " ✓" -ForegroundColor Green
        $uploaded++
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        $failed++
        $errors += @{
            File = $file.Name
            Error = $_.Exception.Message
        }
    }
}

# Summary
Write-Host ""
Write-Host "========================================"
Write-Host "Upload Complete"
Write-Host "========================================"
Write-Host "Total files: $fileCount"
Write-Host "Uploaded: $uploaded" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  $($err.File): $($err.Error)"
    }
}

# Verify upload
Write-Host ""
Write-Host "Verifying upload..."
$uploadedFiles = Get-PnPFolderItem -FolderSiteRelativeUrl "$library/$TargetFolder" -ItemType File
$uploadedCount = $uploadedFiles.Count

Write-Host "Files in SharePoint: $uploadedCount"

if ($uploadedCount -eq $fileCount) {
    Write-Host "✓ All files uploaded successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠ File count mismatch. Expected: $fileCount, Found: $uploadedCount" -ForegroundColor Yellow
    exit 1
}
