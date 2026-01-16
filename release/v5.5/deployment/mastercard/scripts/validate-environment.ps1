<#
.SYNOPSIS
    Validate environment prerequisites before deployment.

.DESCRIPTION
    Checks authentication, connectivity, and permissions for all
    target services (SharePoint, Dataverse, Power Automate).

.PARAMETER Environment
    Target environment: 'personal' or 'mastercard'

.EXAMPLE
    ./validate-environment.ps1 -Environment "personal"
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("personal", "mastercard")]
    [string]$Environment
)

Write-Host "========================================"
Write-Host "Environment Validation"
Write-Host "========================================"
Write-Host "Target: $Environment"
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "========================================"

$checks = @()
$allPassed = $true

function Add-Check {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Details
    )
    
    $script:checks += @{
        Name = $Name
        Passed = $Passed
        Details = $Details
    }
    
    if (-not $Passed) {
        $script:allPassed = $false
    }
    
    $status = if ($Passed) { "✓ PASS" } else { "✗ FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-Host "$status - $Name" -ForegroundColor $color
    if ($Details) {
        Write-Host "       $Details" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Checking Prerequisites..."
Write-Host "-----------------------------------------"

# Check 1: PowerShell version
$psVersion = $PSVersionTable.PSVersion
$psVersionOk = $psVersion.Major -ge 7
Add-Check -Name "PowerShell Version" -Passed $psVersionOk -Details "Version: $($psVersion.ToString())"

# Check 2: pac CLI installed
$pacInstalled = $null -ne (Get-Command pac -ErrorAction SilentlyContinue)
$pacVersion = if ($pacInstalled) { pac --version 2>$null } else { "Not installed" }
Add-Check -Name "Power Platform CLI (pac)" -Passed $pacInstalled -Details $pacVersion

# Check 3: Azure CLI installed
$azInstalled = $null -ne (Get-Command az -ErrorAction SilentlyContinue)
$azVersion = if ($azInstalled) { az --version 2>$null | Select-Object -First 1 } else { "Not installed" }
Add-Check -Name "Azure CLI (az)" -Passed $azInstalled -Details $azVersion

# Check 4: PnP PowerShell module
$pnpInstalled = $null -ne (Get-Module -ListAvailable -Name "PnP.PowerShell")
$pnpVersion = if ($pnpInstalled) { (Get-Module -ListAvailable -Name "PnP.PowerShell" | Select-Object -First 1).Version.ToString() } else { "Not installed" }
Add-Check -Name "PnP PowerShell Module" -Passed $pnpInstalled -Details $pnpVersion

Write-Host ""
Write-Host "Checking Authentication..."
Write-Host "-----------------------------------------"

# Check 5: Azure CLI authentication
$azAccount = $null
try {
    $azAccount = az account show 2>$null | ConvertFrom-Json
} catch {}
$azLoggedIn = $null -ne $azAccount
$azDetails = if ($azLoggedIn) { "Tenant: $($azAccount.tenantId.Substring(0,8))..." } else { "Run: az login" }
Add-Check -Name "Azure CLI Authentication" -Passed $azLoggedIn -Details $azDetails

# Check 6: pac CLI authentication
$pacAuth = pac auth list 2>&1
$pacLoggedIn = $pacAuth -notmatch "No profiles"
$pacDetails = if ($pacLoggedIn) { "Profile active" } else { "Run: pac auth create" }
Add-Check -Name "Power Platform CLI Auth" -Passed $pacLoggedIn -Details $pacDetails

Write-Host ""
Write-Host "Checking Environment Configuration..."
Write-Host "-----------------------------------------"

# Check 7: Environment file exists
$envFile = Join-Path $PSScriptRoot "../../.env.$Environment"
$envFileExists = Test-Path $envFile
Add-Check -Name "Environment File (.env.$Environment)" -Passed $envFileExists -Details $(if ($envFileExists) { "Found" } else { "Create: .env.$Environment" })

# Load environment variables if file exists
$envVars = @{}
if ($envFileExists) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $envVars[$matches[1]] = $matches[2]
        }
    }
}

# Check 8: Required environment variables
$requiredVars = @("SHAREPOINT_SITE", "SHAREPOINT_LIBRARY", "DATAVERSE_URL")
$missingVars = $requiredVars | Where-Object { -not $envVars[$_] }
$varsOk = $missingVars.Count -eq 0
$varsDetails = if ($varsOk) { "All required vars set" } else { "Missing: $($missingVars -join ', ')" }
Add-Check -Name "Required Environment Variables" -Passed $varsOk -Details $varsDetails

Write-Host ""
Write-Host "Checking Connectivity..."
Write-Host "-----------------------------------------"

# Check 9: SharePoint connectivity (if configured)
$spConnected = $false
$spDetails = "Not tested"
if ($envVars["SHAREPOINT_SITE"]) {
    try {
        # Quick connectivity test
        $response = Invoke-WebRequest -Uri $envVars["SHAREPOINT_SITE"] -Method Head -TimeoutSec 10 -UseBasicParsing 2>$null
        $spConnected = $response.StatusCode -eq 200
        $spDetails = "Site reachable"
    } catch {
        $spDetails = "Cannot reach site"
    }
} else {
    $spDetails = "SHAREPOINT_SITE not configured"
}
Add-Check -Name "SharePoint Connectivity" -Passed $spConnected -Details $spDetails

# Check 10: Dataverse connectivity
$dvConnected = $false
$dvDetails = "Not tested"
if ($pacLoggedIn) {
    try {
        $orgList = pac org list 2>&1
        $dvConnected = $orgList -notmatch "error"
        $dvDetails = if ($dvConnected) { "Dataverse accessible" } else { "Check permissions" }
    } catch {
        $dvDetails = "Connection test failed"
    }
}
Add-Check -Name "Dataverse Connectivity" -Passed $dvConnected -Details $dvDetails

Write-Host ""
Write-Host "========================================"
Write-Host "Validation Summary"
Write-Host "========================================"

$passCount = ($checks | Where-Object { $_.Passed }).Count
$failCount = ($checks | Where-Object { -not $_.Passed }).Count

Write-Host "Total Checks: $($checks.Count)"
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

if ($allPassed) {
    Write-Host ""
    Write-Host "✓ Environment ready for deployment" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "✗ Environment has issues that must be resolved" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fix these issues:"
    
    foreach ($check in ($checks | Where-Object { -not $_.Passed })) {
        Write-Host "  - $($check.Name): $($check.Details)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Common fixes:"
    Write-Host "  az login                    # Azure authentication"
    Write-Host "  pac auth create --environment [URL]  # Power Platform auth"
    Write-Host "  Install-Module PnP.PowerShell  # PnP module"
    
    exit 1
}
