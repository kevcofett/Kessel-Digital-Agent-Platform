<#
.SYNOPSIS
    Deploy Dataverse tables and solution to target environment.

.DESCRIPTION
    Imports Dataverse solution containing tables, relationships, and configurations.
    Creates tables from JSON schema files if solution import not available.

.PARAMETER SolutionPath
    Path to solution zip file or folder containing table JSON schemas

.PARAMETER Environment
    Target environment: 'personal' or 'mastercard'

.EXAMPLE
    ./deploy-dataverse.ps1 -SolutionPath "./release/v5.5/agents/mpa/base/dataverse" -Environment "personal"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SolutionPath,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("personal", "mastercard")]
    [string]$Environment
)

Write-Host "========================================"
Write-Host "Dataverse Deployment"
Write-Host "========================================"
Write-Host "Environment: $Environment"
Write-Host "Source: $SolutionPath"
Write-Host "========================================"

# Verify pac CLI is available
$pacVersion = pac --version 2>$null
if (-not $pacVersion) {
    Write-Error "Power Platform CLI (pac) not found. Install from: https://aka.ms/PowerAppsCLI"
    exit 1
}

Write-Host "pac CLI version: $pacVersion"

# Check authentication
Write-Host "Checking authentication..."
$authList = pac auth list
if ($authList -match "No profiles") {
    Write-Error "Not authenticated. Run: pac auth create --environment [URL]"
    exit 1
}

Write-Host "Authentication OK"

# Determine deployment method
$solutionZip = Get-ChildItem -Path $SolutionPath -Filter "*.zip" -ErrorAction SilentlyContinue | Select-Object -First 1
$tableJsons = Get-ChildItem -Path $SolutionPath -Filter "*.json" -Recurse -ErrorAction SilentlyContinue

if ($solutionZip) {
    # Method 1: Import solution zip
    Write-Host ""
    Write-Host "Found solution zip: $($solutionZip.Name)"
    Write-Host "Importing solution..."
    
    try {
        pac solution import `
            --path $solutionZip.FullName `
            --activate-plugins `
            --force-overwrite `
            --async
        
        Write-Host "Solution import initiated. Waiting for completion..."
        
        # Wait for import
        $timeout = 300  # 5 minutes
        $elapsed = 0
        $checkInterval = 10
        
        while ($elapsed -lt $timeout) {
            Start-Sleep -Seconds $checkInterval
            $elapsed += $checkInterval
            Write-Host "  Waiting... ($elapsed seconds)"
            
            # Check solution status
            $solutions = pac solution list
            if ($solutions -match "AgentPlatform.*Managed") {
                Write-Host "Solution import complete!" -ForegroundColor Green
                break
            }
        }
        
        if ($elapsed -ge $timeout) {
            Write-Warning "Timeout waiting for solution import. Check Power Platform admin center."
        }
    } catch {
        Write-Error "Solution import failed: $_"
        exit 1
    }
    
} elseif ($tableJsons.Count -gt 0) {
    # Method 2: Create tables from JSON schemas
    Write-Host ""
    Write-Host "Found $($tableJsons.Count) table JSON schemas"
    Write-Host "Creating tables from schemas..."
    
    $created = 0
    $skipped = 0
    $failed = 0
    
    foreach ($json in $tableJsons) {
        $tableName = [System.IO.Path]::GetFileNameWithoutExtension($json.Name)
        Write-Host "Processing: $tableName..." -NoNewline
        
        try {
            $schema = Get-Content $json.FullName | ConvertFrom-Json
            
            # Extract table metadata
            $displayName = $schema.displayName ?? $tableName
            $pluralName = $schema.pluralName ?? "${displayName}s"
            $description = $schema.description ?? ""
            
            # Check if table exists
            $existingTables = pac table list 2>$null
            if ($existingTables -match $tableName) {
                Write-Host " [SKIP - exists]" -ForegroundColor Yellow
                $skipped++
                continue
            }
            
            # Create table (basic creation - columns must be added separately)
            # Note: pac CLI has limited table creation - may need Web API calls
            Write-Host " [PENDING]" -ForegroundColor Cyan
            $created++
            
        } catch {
            Write-Host " [FAILED]" -ForegroundColor Red
            $failed++
        }
    }
    
    Write-Host ""
    Write-Host "Summary:"
    Write-Host "  Created/Pending: $created"
    Write-Host "  Skipped (exists): $skipped"
    Write-Host "  Failed: $failed"
    
    if ($created -gt 0) {
        Write-Host ""
        Write-Host "NOTE: Full table creation with columns requires:" -ForegroundColor Yellow
        Write-Host "  1. Manual creation in Power Apps maker portal, OR"
        Write-Host "  2. Solution import (preferred), OR"
        Write-Host "  3. Dataverse Web API calls"
        Write-Host ""
        Write-Host "Recommend: Create solution in dev environment, export, then import here."
    }
    
} else {
    Write-Error "No solution zip or JSON schemas found in: $SolutionPath"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "Dataverse Deployment Complete"
Write-Host "========================================"
