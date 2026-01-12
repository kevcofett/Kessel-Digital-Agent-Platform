# Deploy Dataverse Solution and Seed Data
# Imports solution and reference data for specified agent(s)

param(
    [string]$Agent = "all",
    [switch]$SeedDataOnly
)

$ErrorActionPreference = "Stop"
$repoRoot = (Get-Item $PSScriptRoot).Parent.Parent.Parent.Parent.FullName

Write-Host "=== Dataverse Deployment ===" -ForegroundColor Cyan
Write-Host "Agent: $Agent"
Write-Host "Seed Data Only: $SeedDataOnly"
Write-Host ""

# Check for PAC CLI
$pacPath = Get-Command pac -ErrorAction SilentlyContinue
if (-not $pacPath) {
    Write-Host "Error: Power Platform CLI (pac) not found" -ForegroundColor Red
    Write-Host "Install with: winget install Microsoft.PowerPlatformCLI" -ForegroundColor Yellow
    exit 1
}

# Authenticate if needed
Write-Host "Checking authentication..." -ForegroundColor Yellow
$authList = pac auth list 2>&1
if ($authList -match "No profiles") {
    Write-Host "Creating authentication profile..." -ForegroundColor Yellow
    pac auth create --environment $env:DATAVERSE_ENVIRONMENT_URL
}

# Import solution (unless seed data only)
if (-not $SeedDataOnly) {
    Write-Host "`nImporting Dataverse solution..." -ForegroundColor Yellow

    $solutionPath = Join-Path $repoRoot "release/v5.5/dataverse/solution.zip"

    if (Test-Path $solutionPath) {
        pac solution import --path $solutionPath --activate-plugins --force-overwrite
        Write-Host "  ✓ Solution imported successfully" -ForegroundColor Green
    } else {
        Write-Host "  Warning: Solution file not found at $solutionPath" -ForegroundColor Yellow
        Write-Host "  Using existing customizations.xml from project..." -ForegroundColor Yellow

        # Alternative: use customizations.xml if available
        $customizationsPath = "/mnt/project/customizations.xml"
        if (Test-Path $customizationsPath) {
            Write-Host "  Found customizations.xml - manual import required via Power Platform" -ForegroundColor Yellow
        }
    }
}

# Import seed data
Write-Host "`nImporting seed data..." -ForegroundColor Yellow

$seedDataDir = Join-Path $repoRoot "release/v5.5/seed-data"

# Create seed-data directory if it doesn't exist
if (-not (Test-Path $seedDataDir)) {
    New-Item -ItemType Directory -Path $seedDataDir -Force | Out-Null

    # Copy seed data from project files
    $projectSeedFiles = @(
        "/mnt/project/mpa_vertical_seed.csv",
        "/mnt/project/mpa_kpi_seed_updated.csv",
        "/mnt/project/mpa_channel_seed_updated.csv",
        "/mnt/project/mpa_benchmark_seed.csv"
    )

    foreach ($file in $projectSeedFiles) {
        if (Test-Path $file) {
            Copy-Item $file $seedDataDir
        }
    }
}

# Import each seed file
$seedFiles = @{
    "cr_verticals" = "mpa_vertical_seed.csv"
    "cr_kpis" = "mpa_kpi_seed_updated.csv"
    "cr_channels" = "mpa_channel_seed_updated.csv"
    "cr_benchmarks" = "mpa_benchmark_seed.csv"
}

foreach ($table in $seedFiles.Keys) {
    $seedFile = Join-Path $seedDataDir $seedFiles[$table]

    if (Test-Path $seedFile) {
        Write-Host "  Importing $($seedFiles[$table]) to $table..." -ForegroundColor Gray
        try {
            pac data import --data $seedFile --target-table $table --verbose
            Write-Host "    ✓ Imported successfully" -ForegroundColor Green
        } catch {
            Write-Host "    ✗ Import failed: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  Warning: Seed file not found: $seedFile" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Dataverse Deployment Complete ===" -ForegroundColor Cyan
