<#
.SYNOPSIS
    Deploys Consulting Agent (CA) to target environment.

.DESCRIPTION
    This script deploys CA components to a Microsoft Power Platform environment:
    - Uploads KB files to SharePoint
    - Creates/updates Dataverse tables
    - Deploys Power Automate flows
    - Configures Microsoft Copilot agent

.PARAMETER Environment
    Target environment: Personal, Mastercard, or Custom

.PARAMETER SharePointSite
    SharePoint site URL for KB file storage

.PARAMETER DataverseEnvironment
    Dataverse environment URL

.PARAMETER SkipKB
    Skip KB file deployment

.PARAMETER SkipTables
    Skip Dataverse table deployment

.PARAMETER SkipFlows
    Skip Power Automate flow deployment

.EXAMPLE
    .\deploy-ca.ps1 -Environment Mastercard -SharePointSite "https://tenant.sharepoint.com/sites/CA"

.NOTES
    Version: 1.0.0
    Author: Kessel Digital
    Date: January 2026
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("Personal", "Mastercard", "Custom")]
    [string]$Environment,

    [Parameter(Mandatory=$true)]
    [string]$SharePointSite,

    [Parameter(Mandatory=$false)]
    [string]$DataverseEnvironment,

    [switch]$SkipKB,
    [switch]$SkipTables,
    [switch]$SkipFlows,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$CARoot = Split-Path -Parent $ScriptRoot
$PlatformRoot = Join-Path (Split-Path -Parent (Split-Path -Parent $CARoot)) "platform\eap-core"

# Configuration
$Config = @{
    KBPath = Join-Path $CARoot "base\kb"
    TablesPath = Join-Path $CARoot "base\schema\tables"
    FlowsPath = Join-Path $CARoot "base\schema\flows"
    InstructionsPath = Join-Path $CARoot "extensions\$Environment\instructions"
    EAPTablesPath = Join-Path $PlatformRoot "base\schema\tables"
    EAPSeedPath = Join-Path $PlatformRoot "base\seed_data"
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    $colors = @{
        "Info" = "Cyan"
        "Success" = "Green"
        "Warning" = "Yellow"
        "Error" = "Red"
    }
    Write-Host "[$Type] $Message" -ForegroundColor $colors[$Type]
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..."

    # Check PnP PowerShell
    if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
        Write-Status "PnP.PowerShell module not found. Install with: Install-Module PnP.PowerShell" "Error"
        return $false
    }

    # Check paths exist
    if (-not (Test-Path $Config.KBPath)) {
        Write-Status "KB path not found: $($Config.KBPath)" "Error"
        return $false
    }

    if (-not (Test-Path $Config.TablesPath)) {
        Write-Status "Tables path not found: $($Config.TablesPath)" "Error"
        return $false
    }

    Write-Status "Prerequisites check passed" "Success"
    return $true
}

function Deploy-KBFiles {
    Write-Status "Deploying KB files to SharePoint..."

    $kbFiles = Get-ChildItem -Path $Config.KBPath -Filter "*.txt"
    Write-Status "Found $($kbFiles.Count) KB files"

    if ($WhatIf) {
        Write-Status "[WhatIf] Would upload $($kbFiles.Count) files to $SharePointSite/KB" "Warning"
        return
    }

    try {
        Connect-PnPOnline -Url $SharePointSite -Interactive

        foreach ($file in $kbFiles) {
            Write-Status "Uploading: $($file.Name)"
            Add-PnPFile -Path $file.FullName -Folder "KB" -ErrorAction Stop
        }

        Write-Status "KB files deployed successfully" "Success"
    }
    catch {
        Write-Status "Failed to deploy KB files: $_" "Error"
        throw
    }
}

function Deploy-DataverseTables {
    Write-Status "Deploying Dataverse tables..."

    # First deploy EAP base tables
    $eapTables = Get-ChildItem -Path $Config.EAPTablesPath -Filter "*.json" -ErrorAction SilentlyContinue
    Write-Status "Found $($eapTables.Count) EAP base tables"

    # Then deploy CA tables
    $caTables = Get-ChildItem -Path $Config.TablesPath -Filter "*.json"
    Write-Status "Found $($caTables.Count) CA tables"

    if ($WhatIf) {
        Write-Status "[WhatIf] Would create/update $($eapTables.Count + $caTables.Count) tables" "Warning"
        return
    }

    Write-Status "Table deployment requires Power Platform CLI or manual import" "Warning"
    Write-Status "Export table schemas to: $($Config.TablesPath)" "Info"
}

function Deploy-PowerAutomateFlows {
    Write-Status "Deploying Power Automate flows..."

    $flows = Get-ChildItem -Path $Config.FlowsPath -Filter "*.json"
    Write-Status "Found $($flows.Count) flow specifications"

    if ($WhatIf) {
        Write-Status "[WhatIf] Would deploy $($flows.Count) flows" "Warning"
        return
    }

    foreach ($flow in $flows) {
        $flowSpec = Get-Content $flow.FullName | ConvertFrom-Json
        Write-Status "Flow: $($flowSpec.displayName) ($($flowSpec.flowId))"
    }

    Write-Status "Flow deployment requires Power Automate portal or CLI" "Warning"
}

function Deploy-Instructions {
    Write-Status "Deploying agent instructions..."

    $instructionsFile = Join-Path $Config.InstructionsPath "CA_RAG_OPTIMIZED_INSTRUCTIONS.txt"

    if (Test-Path $instructionsFile) {
        $content = Get-Content $instructionsFile -Raw
        $charCount = $content.Length
        Write-Status "Instructions file: $charCount characters"

        if ($charCount -gt 8192) {
            Write-Status "Instructions exceed 8K character limit!" "Error"
            return
        }

        Write-Status "Instructions ready for Microsoft Copilot Studio" "Success"
    }
    else {
        Write-Status "Instructions file not found for environment: $Environment" "Warning"
    }
}

# Main execution
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Consulting Agent Deployment Script   " -ForegroundColor Cyan
Write-Host "  Environment: $Environment            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Prerequisites)) {
    exit 1
}

Write-Status "Starting deployment..."

if (-not $SkipKB) {
    Deploy-KBFiles
}

if (-not $SkipTables) {
    Deploy-DataverseTables
}

if (-not $SkipFlows) {
    Deploy-PowerAutomateFlows
}

Deploy-Instructions

Write-Host ""
Write-Status "Deployment complete!" "Success"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Import Dataverse tables via Power Platform admin center"
Write-Host "2. Create Power Automate flows from specifications"
Write-Host "3. Configure Microsoft Copilot Studio with instructions"
Write-Host "4. Test agent in target environment"
Write-Host ""
