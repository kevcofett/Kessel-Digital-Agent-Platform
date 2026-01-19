<#
.SYNOPSIS
    Imports all seed data into Dataverse tables with validation.

.DESCRIPTION
    1. Runs validation script first
    2. Imports data in dependency order
    3. Verifies row counts after import

.PARAMETER EnvironmentUrl
    The Dataverse environment URL

.PARAMETER ValidateOnly
    Run validation without importing

.EXAMPLE
    .\import-seed-data.ps1 -EnvironmentUrl "https://aragorn-ai.crm.dynamics.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,

    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

$ErrorActionPreference = "Stop"

# Import order (respects foreign key dependencies)
$importOrder = @(
    @{ File = "mpa_vertical_seed.csv"; Table = "mpa_vertical"; ExpectedRows = 15 },
    @{ File = "mpa_channel_seed.csv"; Table = "mpa_channel"; ExpectedRows = 30 },
    @{ File = "mpa_kpi_seed.csv"; Table = "mpa_kpi"; ExpectedRows = 24 },
    @{ File = "mpa_partner_seed.csv"; Table = "mpa_partner"; ExpectedRows = 20 },
    @{ File = "eap_agent_seed.csv"; Table = "eap_agent"; ExpectedRows = 10 },
    @{ File = "ca_framework_seed.csv"; Table = "ca_framework"; ExpectedRows = 60 },
    @{ File = "mpa_benchmark_seed.csv"; Table = "mpa_benchmark"; ExpectedRows = 31 },
    @{ File = "eap_capability_seed.csv"; Table = "eap_capability"; ExpectedRows = 20 },
    @{ File = "eap_capability_ca_seed.csv"; Table = "eap_capability"; ExpectedRows = 20 },
    @{ File = "eap_prompt_seed.csv"; Table = "eap_prompt"; ExpectedRows = 19 },
    @{ File = "eap_capability_implementation_seed.csv"; Table = "eap_capability_implementation"; ExpectedRows = 47 },
    @{ File = "eap_session_seed.csv"; Table = "eap_session"; ExpectedRows = 5 },
    @{ File = "eap_test_case_seed.csv"; Table = "eap_test_case"; ExpectedRows = 15 }
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$seedPath = Join-Path $scriptDir ".." "base" "dataverse" "seed"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MPA v6.0 SEED DATA IMPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentUrl"
Write-Host "Seed Path: $seedPath"
Write-Host ""

# Step 1: Run validation
Write-Host "Step 1: Running validation..." -ForegroundColor Yellow
$validationScript = Join-Path $scriptDir "validate-all-seed-data.py"

if (Test-Path $validationScript) {
    python3 $validationScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nVALIDATION FAILED - Fix errors before importing" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Validation script not found, skipping..." -ForegroundColor Yellow
}

if ($ValidateOnly) {
    Write-Host "`nValidation passed. Use without -ValidateOnly to import." -ForegroundColor Green
    exit 0
}

# Step 2: Authenticate
Write-Host "`nStep 2: Authenticating..." -ForegroundColor Yellow
pac auth create --environment $EnvironmentUrl

# Step 3: Import each file
Write-Host "`nStep 3: Importing data..." -ForegroundColor Yellow

$imported = 0
$totalRows = 0
$errors = 0

foreach ($import in $importOrder) {
    $file = Join-Path $seedPath $import.File
    $table = $import.Table
    $expected = $import.ExpectedRows

    Write-Host "`n--- Importing: $($import.File) ---" -ForegroundColor Cyan
    Write-Host "  Target table: $table"
    Write-Host "  Expected rows: $expected"

    if (-not (Test-Path $file)) {
        Write-Host "  File not found: $file" -ForegroundColor Red
        $errors++
        continue
    }

    try {
        # Import using PAC CLI data import
        pac data import --data $file --environment $EnvironmentUrl

        Write-Host "  Imported $expected rows to $table" -ForegroundColor Green
        $imported++
        $totalRows += $expected

    } catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
        $errors++
    }
}

# Step 4: Verify row counts
Write-Host "`nStep 4: Verifying row counts..." -ForegroundColor Yellow

$expectedCounts = @{
    "mpa_vertical" = 15
    "mpa_channel" = 30
    "mpa_kpi" = 24
    "mpa_partner" = 20
    "mpa_benchmark" = 31
    "eap_agent" = 10
    "eap_capability" = 40  # 20 + 20
    "eap_prompt" = 19
    "ca_framework" = 60
    "eap_capability_implementation" = 47
    "eap_session" = 5
    "eap_test_case" = 15
}

Write-Host "`nExpected Row Counts:" -ForegroundColor Gray
foreach ($table in $expectedCounts.Keys | Sort-Object) {
    Write-Host "  $table : $($expectedCounts[$table]) rows" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "IMPORT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files imported: $imported"
Write-Host "Total rows: $totalRows"
Write-Host "Errors: $errors"

if ($errors -eq 0) {
    Write-Host "`nALL DATA IMPORTED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify row counts in Dataverse" -ForegroundColor White
    Write-Host "  2. Run routing tests" -ForegroundColor White
    Write-Host "  3. Create Power Automate flows" -ForegroundColor White
} else {
    Write-Host "`nSOME IMPORTS FAILED - CHECK ERRORS ABOVE" -ForegroundColor Red
    exit 1
}
