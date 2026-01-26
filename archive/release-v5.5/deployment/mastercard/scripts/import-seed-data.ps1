<#
.SYNOPSIS
    Import seed data into Dataverse tables.

.DESCRIPTION
    Imports CSV/JSON seed data files into Dataverse tables using pac CLI.

.PARAMETER DataPath
    Path to folder containing seed data files

.PARAMETER Environment
    Target environment: 'personal' or 'mastercard'

.EXAMPLE
    ./import-seed-data.ps1 -DataPath "./release/v5.5/agents/mpa/base/data/seed" -Environment "personal"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$DataPath,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("personal", "mastercard")]
    [string]$Environment
)

Write-Host "========================================"
Write-Host "Seed Data Import"
Write-Host "========================================"
Write-Host "Environment: $Environment"
Write-Host "Data Path: $DataPath"
Write-Host "========================================"

# Verify path exists
if (-not (Test-Path $DataPath)) {
    Write-Error "Data path not found: $DataPath"
    exit 1
}

# Find seed data files
$csvFiles = Get-ChildItem -Path $DataPath -Filter "*.csv" -File
$jsonFiles = Get-ChildItem -Path $DataPath -Filter "*.json" -File

$totalFiles = $csvFiles.Count + $jsonFiles.Count
Write-Host "Found $($csvFiles.Count) CSV files, $($jsonFiles.Count) JSON files"

if ($totalFiles -eq 0) {
    Write-Warning "No seed data files found"
    exit 0
}

# Table name mapping (file name to Dataverse table name)
$tableMapping = @{
    "mpa_vertical_seed" = "mpa_verticals"
    "mpa_kpi_seed" = "mpa_kpis"
    "mpa_kpi_seed_updated" = "mpa_kpis"
    "mpa_channel_seed" = "mpa_channels"
    "mpa_channel_seed_updated" = "mpa_channels"
    "mpa_benchmark_seed" = "mpa_benchmarks"
    "mpa_benchmark_seed_additions" = "mpa_benchmarks"
    "ca_frameworks" = "ca_frameworks"
    "ca_benchmarks" = "ca_benchmarks"
    "eap_industries" = "eap_industries"
    "eap_frameworks" = "eap_frameworks"
    "eap_roles" = "eap_roles"
}

$imported = 0
$failed = 0
$errors = @()

# Process CSV files
foreach ($csv in $csvFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($csv.Name)
    $tableName = $tableMapping[$baseName]
    
    if (-not $tableName) {
        # Default: use file name as table name
        $tableName = $baseName -replace "_seed$", "" -replace "_seed_updated$", "" -replace "_additions$", ""
    }
    
    Write-Host "Importing: $($csv.Name) → $tableName..." -NoNewline
    
    try {
        # Read CSV to get row count
        $data = Import-Csv -Path $csv.FullName
        $rowCount = $data.Count
        
        # pac data import for CSV
        pac data import `
            --data $csv.FullName `
            --verbose 2>&1 | Out-Null
        
        Write-Host " ✓ ($rowCount rows)" -ForegroundColor Green
        $imported++
        
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        $failed++
        $errors += @{
            File = $csv.Name
            Error = $_.Exception.Message
        }
    }
}

# Process JSON files
foreach ($json in $jsonFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($json.Name)
    $tableName = $tableMapping[$baseName]
    
    if (-not $tableName) {
        $tableName = $baseName
    }
    
    Write-Host "Importing: $($json.Name) → $tableName..." -NoNewline
    
    try {
        # Read JSON to get record count
        $data = Get-Content $json.FullName | ConvertFrom-Json
        $recordCount = if ($data -is [array]) { $data.Count } else { 1 }
        
        # Convert JSON to CSV for pac import
        $tempCsv = [System.IO.Path]::GetTempFileName() + ".csv"
        
        if ($data -is [array]) {
            $data | Export-Csv -Path $tempCsv -NoTypeInformation
        } else {
            @($data) | Export-Csv -Path $tempCsv -NoTypeInformation
        }
        
        pac data import `
            --data $tempCsv `
            --verbose 2>&1 | Out-Null
        
        Remove-Item $tempCsv -Force
        
        Write-Host " ✓ ($recordCount records)" -ForegroundColor Green
        $imported++
        
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        $failed++
        $errors += @{
            File = $json.Name
            Error = $_.Exception.Message
        }
    }
}

# Summary
Write-Host ""
Write-Host "========================================"
Write-Host "Import Complete"
Write-Host "========================================"
Write-Host "Total files: $totalFiles"
Write-Host "Imported: $imported" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  $($err.File): $($err.Error)"
    }
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify table exists in Dataverse"
    Write-Host "  2. Check column names match CSV headers"
    Write-Host "  3. Verify data types are compatible"
    Write-Host "  4. Check for duplicate primary key values"
}

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}
