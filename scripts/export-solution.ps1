<#
.SYNOPSIS
    Exports the MPA v6.0 solution from Power Platform.

.DESCRIPTION
    Exports both managed and unmanaged versions of the solution,
    then unpacks for source control.

.PARAMETER EnvironmentUrl
    The Dataverse environment URL

.PARAMETER SolutionName
    The solution name (default: MPAv6MultiAgent)

.PARAMETER OutputPath
    Path for exported solutions (default: ./solutions)

.EXAMPLE
    .\export-solution.ps1 -EnvironmentUrl "https://aragorn-ai.crm.dynamics.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,

    [Parameter(Mandatory=$false)]
    [string]$SolutionName = "MPAv6MultiAgent",

    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "./solutions"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputPath = Join-Path $scriptDir $OutputPath

# Create output directory
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MPA v6.0 SOLUTION EXPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentUrl"
Write-Host "Solution: $SolutionName"
Write-Host "Output: $outputPath"
Write-Host ""

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

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Export managed solution
Write-Host "`n--- Exporting Managed Solution ---" -ForegroundColor Cyan
$managedPath = Join-Path $outputPath "${SolutionName}_${timestamp}_managed.zip"

try {
    pac solution export `
        --path $managedPath `
        --name $SolutionName `
        --managed `
        --environment $EnvironmentUrl

    Write-Host "  Exported: $managedPath" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $_" -ForegroundColor Red
}

# Export unmanaged solution
Write-Host "`n--- Exporting Unmanaged Solution ---" -ForegroundColor Cyan
$unmanagedPath = Join-Path $outputPath "${SolutionName}_${timestamp}_unmanaged.zip"

try {
    pac solution export `
        --path $unmanagedPath `
        --name $SolutionName `
        --environment $EnvironmentUrl

    Write-Host "  Exported: $unmanagedPath" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $_" -ForegroundColor Red
}

# Unpack for source control
Write-Host "`n--- Unpacking Solution ---" -ForegroundColor Cyan
$unpackedPath = Join-Path $outputPath "${SolutionName}_unpacked"

if (Test-Path $unmanagedPath) {
    try {
        pac solution unpack `
            --zipfile $unmanagedPath `
            --folder $unpackedPath `
            --packagetype Both

        Write-Host "  Unpacked to: $unpackedPath" -ForegroundColor Green
    } catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "EXPORT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$files = @(
    @{ Name = "Managed Solution"; Path = $managedPath },
    @{ Name = "Unmanaged Solution"; Path = $unmanagedPath },
    @{ Name = "Unpacked Source"; Path = $unpackedPath }
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        $size = if ((Get-Item $file.Path).PSIsContainer) {
            (Get-ChildItem $file.Path -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB
            "folder"
        } else {
            "{0:N2} KB" -f ((Get-Item $file.Path).Length / 1KB)
        }
        Write-Host "  $($file.Name): $size" -ForegroundColor Green
    } else {
        Write-Host "  $($file.Name): NOT CREATED" -ForegroundColor Red
    }
}

Write-Host "`nExport completed!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify solution contents" -ForegroundColor White
Write-Host "  2. Commit unpacked source to git" -ForegroundColor White
Write-Host "  3. Test import in target environment" -ForegroundColor White
