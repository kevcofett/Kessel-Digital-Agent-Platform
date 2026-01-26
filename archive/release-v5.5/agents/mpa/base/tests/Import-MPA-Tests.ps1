# Import-MPA-Tests.ps1
# Imports test cases from JSON file into Copilot Studio Kit via Dataverse Web API
# 
# Prerequisites:
#   - Az PowerShell module: Install-Module Az -Scope CurrentUser
#   - Authenticated to Azure: Connect-AzAccount
#
# Usage:
#   .\Import-MPA-Tests.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com"
#   .\Import-MPA-Tests.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com" -TestFile "custom_tests.json"
#   .\Import-MPA-Tests.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com" -WhatIf

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$TestFile = "mpa_test_cases.json",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Test type mapping (display name to Dataverse option set value)
$TestTypeValues = @{
    "Response Match" = 695100000
    "Attachments Match" = 695100001
    "Topic Match" = 695100002
    "Generative Answers" = 695100003
    "Multi-turn" = 695100004
    "Plan Validation" = 695100005
}

function Write-Log {
    param([string]$Message, [string]$Level = "Info")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "Info" { "Cyan" }
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        default { "White" }
    }
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

function Get-DataverseAccessToken {
    param([string]$ResourceUrl)
    $token = Get-AzAccessToken -ResourceUrl $ResourceUrl
    return $token.Token
}

function Invoke-DataverseApi {
    param(
        [string]$EnvironmentUrl,
        [string]$Token,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json; charset=utf-8"
        "OData-MaxVersion" = "4.0"
        "OData-Version" = "4.0"
        "Accept" = "application/json"
        "Prefer" = "return=representation"
    }
    
    $uri = "$EnvironmentUrl/api/data/v9.2/$Endpoint"
    
    $params = @{
        Uri = $uri
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress)
    }
    
    $response = Invoke-RestMethod @params
    return $response
}

function Find-ExistingTestSet {
    param(
        [string]$EnvironmentUrl,
        [string]$Token,
        [string]$Name
    )
    
    $filter = [System.Web.HttpUtility]::UrlEncode("cat_name eq '$Name'")
    $endpoint = "cat_copilotagenttestsets?`$filter=$filter&`$select=cat_copilotagenttestsetid,cat_name"
    
    try {
        $result = Invoke-DataverseApi -EnvironmentUrl $EnvironmentUrl -Token $Token -Method "GET" -Endpoint $endpoint
        if ($result.value -and $result.value.Count -gt 0) {
            return $result.value[0]
        }
    }
    catch {
        # Test set doesn't exist
    }
    return $null
}

function New-TestSet {
    param(
        [string]$EnvironmentUrl,
        [string]$Token,
        [string]$Name,
        [string]$Description
    )
    
    $body = @{
        "cat_name" = $Name
    }
    
    if ($Description) {
        $body["cat_description"] = $Description
    }
    
    $result = Invoke-DataverseApi -EnvironmentUrl $EnvironmentUrl -Token $Token -Method "POST" -Endpoint "cat_copilotagenttestsets" -Body $body
    return $result.cat_copilotagenttestsetid
}

function New-TestCase {
    param(
        [string]$EnvironmentUrl,
        [string]$Token,
        [string]$TestSetId,
        [PSCustomObject]$TestCase,
        [int]$Order
    )
    
    $testTypeValue = $TestTypeValues[$TestCase.testType]
    if (-not $testTypeValue) {
        $testTypeValue = $TestTypeValues["Generative Answers"]
    }
    
    $body = @{
        "cat_name" = "$($TestCase.id) $($TestCase.name)"
        "cat_testtype" = $testTypeValue
        "cat_testutterance" = $TestCase.utterance
        "cat_expectedresponse" = $TestCase.expectedBehavior
        "cat_order" = $Order
        "cat_AgentTestSet@odata.bind" = "/cat_copilotagenttestsets($TestSetId)"
    }
    
    $result = Invoke-DataverseApi -EnvironmentUrl $EnvironmentUrl -Token $Token -Method "POST" -Endpoint "cat_copilotagenttests" -Body $body
    return $result.cat_copilotagenttestid
}

function Delete-TestSet {
    param(
        [string]$EnvironmentUrl,
        [string]$Token,
        [string]$TestSetId
    )
    
    Invoke-DataverseApi -EnvironmentUrl $EnvironmentUrl -Token $Token -Method "DELETE" -Endpoint "cat_copilotagenttestsets($TestSetId)"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  MPA Test Suite Import Script" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Validate environment URL
if (-not $EnvironmentUrl.StartsWith("https://")) {
    $EnvironmentUrl = "https://$EnvironmentUrl"
}
$EnvironmentUrl = $EnvironmentUrl.TrimEnd("/")

# Resolve test file path
if (-not [System.IO.Path]::IsPathRooted($TestFile)) {
    $TestFile = Join-Path $ScriptDir $TestFile
}

if (-not (Test-Path $TestFile)) {
    Write-Log "Test file not found: $TestFile" -Level "Error"
    exit 1
}

Write-Log "Environment: $EnvironmentUrl"
Write-Log "Test File: $TestFile"
Write-Host ""

# Load test definitions
Write-Log "Loading test definitions..."
$testData = Get-Content $TestFile -Raw | ConvertFrom-Json

Write-Log "Test Set: $($testData.testSetName)" -Level "Info"
Write-Log "Test Cases: $($testData.testCases.Count)" -Level "Info"
Write-Host ""

# Check Azure authentication
Add-Type -AssemblyName System.Web

if (-not (Get-Module -ListAvailable -Name Az.Accounts)) {
    Write-Log "Az PowerShell module not found. Install with: Install-Module Az -Scope CurrentUser" -Level "Error"
    exit 1
}

Import-Module Az.Accounts -ErrorAction Stop

$context = Get-AzContext
if (-not $context) {
    Write-Log "Not logged in to Azure. Running Connect-AzAccount..." -Level "Warning"
    Connect-AzAccount
}

Write-Log "Authenticated as: $((Get-AzContext).Account.Id)" -Level "Success"
Write-Host ""

# Get access token
Write-Log "Acquiring Dataverse access token..."
$token = Get-DataverseAccessToken -ResourceUrl $EnvironmentUrl
Write-Log "Token acquired" -Level "Success"
Write-Host ""

# Check for existing test set
Write-Log "Checking for existing test set '$($testData.testSetName)'..."
$existingTestSet = Find-ExistingTestSet -EnvironmentUrl $EnvironmentUrl -Token $token -Name $testData.testSetName

if ($existingTestSet) {
    Write-Log "Found existing test set: $($existingTestSet.cat_copilotagenttestsetid)" -Level "Warning"
    
    if ($Force) {
        if ($PSCmdlet.ShouldProcess($testData.testSetName, "Delete existing test set")) {
            Write-Log "Deleting existing test set (Force mode)..." -Level "Warning"
            Delete-TestSet -EnvironmentUrl $EnvironmentUrl -Token $token -TestSetId $existingTestSet.cat_copilotagenttestsetid
            Write-Log "Deleted" -Level "Success"
        }
    }
    else {
        Write-Log "Test set already exists. Use -Force to replace it, or delete manually in the Kit UI." -Level "Error"
        Write-Log "Existing Test Set ID: $($existingTestSet.cat_copilotagenttestsetid)" -Level "Info"
        exit 1
    }
}

# Create Test Set
if ($PSCmdlet.ShouldProcess($testData.testSetName, "Create test set")) {
    Write-Log "Creating test set: $($testData.testSetName)"
    $testSetId = New-TestSet -EnvironmentUrl $EnvironmentUrl -Token $token -Name $testData.testSetName -Description $testData.description
    Write-Log "Created with ID: $testSetId" -Level "Success"
}
else {
    Write-Log "Would create test set: $($testData.testSetName)" -Level "Info"
    $testSetId = "00000000-0000-0000-0000-000000000000"
}

Write-Host ""

# Create Test Cases
Write-Log "Creating $($testData.testCases.Count) test cases..."
$order = 1
$created = 0

foreach ($testCase in $testData.testCases) {
    if ($PSCmdlet.ShouldProcess("$($testCase.id) $($testCase.name)", "Create test case")) {
        Write-Host "  [$order/$($testData.testCases.Count)] $($testCase.id) $($testCase.name)..." -NoNewline
        try {
            $testId = New-TestCase -EnvironmentUrl $EnvironmentUrl -Token $token -TestSetId $testSetId -TestCase $testCase -Order $order
            Write-Host " Created" -ForegroundColor Green
            $created++
        }
        catch {
            Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  Would create: $($testCase.id) $($testCase.name)" -ForegroundColor Cyan
    }
    $order++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Import Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Log "Test Set ID: $testSetId" -Level "Success"
Write-Log "Test Cases Created: $created / $($testData.testCases.Count)" -Level "Success"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open Power CAT Copilot Studio Kit" -ForegroundColor White
Write-Host "  2. Go to Test Sets > $($testData.testSetName)" -ForegroundColor White
Write-Host "  3. Create a Test Run with your Agent Configuration" -ForegroundColor White
Write-Host "  4. Enable 'Analyze Generated Answers' in Agent Configuration" -ForegroundColor White
Write-Host ""
