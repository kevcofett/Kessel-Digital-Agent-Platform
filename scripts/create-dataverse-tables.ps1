<#
.SYNOPSIS
    Creates all 15 Dataverse tables for MPA v6.0 from JSON schema definitions.

.DESCRIPTION
    Reads JSON schema files and creates corresponding Dataverse tables using PAC CLI.
    Creates tables in dependency order to respect foreign key relationships.

.PARAMETER EnvironmentUrl
    The Dataverse environment URL (e.g., https://org.crm.dynamics.com)

.PARAMETER SchemaPath
    Path to schema JSON files (default: ../base/dataverse/schema)

.EXAMPLE
    .\create-dataverse-tables.ps1 -EnvironmentUrl "https://aragorn-ai.crm.dynamics.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,

    [Parameter(Mandatory=$false)]
    [string]$SchemaPath = "../base/dataverse/schema"
)

$ErrorActionPreference = "Stop"

# Table creation order (respects dependencies)
$tableOrder = @(
    # Tier 1 - Base tables
    "mpa_vertical",
    "mpa_channel",
    "mpa_kpi",
    "mpa_partner",
    "eap_agent",
    "ca_framework",
    # Tier 2 - First dependencies
    "mpa_benchmark",
    "eap_capability",
    "eap_prompt",
    "ca_project",
    # Tier 3 - Second dependencies
    "eap_capability_implementation",
    "eap_session",
    "ca_deliverable",
    # Tier 4 - Third dependencies
    "eap_test_case",
    "eap_telemetry"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MPA v6.0 DATAVERSE TABLE CREATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentUrl"
Write-Host "Schema Path: $SchemaPath"
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

$created = 0
$skipped = 0
$errors = 0

foreach ($tableName in $tableOrder) {
    $schemaFile = Join-Path $SchemaPath "$tableName.json"

    Write-Host "`n--- Creating: $tableName ---" -ForegroundColor Cyan

    if (-not (Test-Path $schemaFile)) {
        Write-Host "  Schema file not found: $schemaFile" -ForegroundColor Yellow
        $skipped++
        continue
    }

    try {
        # Read schema
        $schema = Get-Content $schemaFile -Raw | ConvertFrom-Json

        Write-Host "  Display Name: $($schema.display_name)"
        Write-Host "  Columns: $($schema.columns.Count)"

        # Create table using PAC CLI
        pac table create `
            --name $schema.table_name `
            --display-name $schema.display_name `
            --description $schema.description `
            --environment $EnvironmentUrl

        # Create columns
        foreach ($column in $schema.columns) {
            if ($column.primary_key -or $column.auto_generated) {
                continue  # Skip auto-generated columns
            }

            Write-Host "    Creating column: $($column.name)" -ForegroundColor Gray

            $columnType = switch ($column.type) {
                "nvarchar" { "string" }
                "int" { "integer" }
                "decimal" { "decimal" }
                "bit" { "boolean" }
                "datetime" { "datetime" }
                "uniqueidentifier" { "guid" }
                default { $column.type }
            }

            $maxLength = if ($column.max_length) { "--max-length $($column.max_length)" } else { "" }

            pac table column create `
                --table $schema.table_name `
                --name $column.name `
                --display-name $column.display_name `
                --type $columnType `
                --required $column.required `
                $maxLength `
                --environment $EnvironmentUrl
        }

        Write-Host "  Created: $tableName" -ForegroundColor Green
        $created++

    } catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
        $errors++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TABLE CREATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Created: $created"
Write-Host "Skipped: $skipped"
Write-Host "Errors: $errors"

if ($errors -eq 0) {
    Write-Host "`nALL TABLES CREATED SUCCESSFULLY" -ForegroundColor Green
} else {
    Write-Host "`nSOME TABLES FAILED - CHECK ERRORS ABOVE" -ForegroundColor Red
    exit 1
}
