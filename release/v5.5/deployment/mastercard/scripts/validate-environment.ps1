# Validate Mastercard Deployment Environment
# Run before deployment to verify all prerequisites

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "=== Mastercard Environment Validation ===" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
$results = @()

# Function to check environment variable
function Test-EnvVar {
    param([string]$Name, [string]$Description, [bool]$Required = $true)

    $value = [Environment]::GetEnvironmentVariable($Name)
    if ($value) {
        $masked = if ($Name -match "SECRET|KEY|PASSWORD") { "****" + $value.Substring([Math]::Max(0, $value.Length - 4)) } else { $value }
        Write-Host "  ✓ $Name = $masked" -ForegroundColor Green
        return $true
    } elseif ($Required) {
        Write-Host "  ✗ $Name - NOT SET (Required)" -ForegroundColor Red
        return $false
    } else {
        Write-Host "  - $Name - Not set (Optional)" -ForegroundColor Yellow
        return $true
    }
}

# Check required environment variables
Write-Host "Checking Environment Variables..." -ForegroundColor White

Write-Host "`nAzure AD:" -ForegroundColor Yellow
$results += Test-EnvVar "AZURE_TENANT_ID" "Azure AD Tenant"
$results += Test-EnvVar "AZURE_CLIENT_ID" "App Registration Client ID"
$results += Test-EnvVar "AZURE_CLIENT_SECRET" "App Registration Secret"

Write-Host "`nAzure OpenAI:" -ForegroundColor Yellow
$results += Test-EnvVar "AZURE_OPENAI_ENDPOINT" "Azure OpenAI Endpoint"
$results += Test-EnvVar "AZURE_OPENAI_DEPLOYMENT" "Azure OpenAI Deployment Name"
$results += Test-EnvVar "AZURE_OPENAI_API_KEY" "Azure OpenAI API Key" -Required $false

Write-Host "`nDataverse:" -ForegroundColor Yellow
$results += Test-EnvVar "DATAVERSE_ENVIRONMENT_URL" "Dataverse Environment URL"

Write-Host "`nSharePoint:" -ForegroundColor Yellow
$results += Test-EnvVar "SHAREPOINT_SITE_URL" "SharePoint Site URL"

Write-Host "`nCopilot Studio:" -ForegroundColor Yellow
$results += Test-EnvVar "COPILOT_STUDIO_BOT_ID" "Copilot Studio Bot ID" -Required $false
$results += Test-EnvVar "COPILOT_STUDIO_ENV_URL" "Copilot Studio Environment URL" -Required $false

# Check if all required passed
if ($results -contains $false) {
    $allPassed = $false
}

# Test Azure AD Authentication
Write-Host "`nTesting Azure AD Authentication..." -ForegroundColor White
try {
    $tenantId = $env:AZURE_TENANT_ID
    $clientId = $env:AZURE_CLIENT_ID
    $clientSecret = $env:AZURE_CLIENT_SECRET

    if ($tenantId -and $clientId -and $clientSecret) {
        $tokenUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
        $body = @{
            client_id = $clientId
            client_secret = $clientSecret
            scope = "https://graph.microsoft.com/.default"
            grant_type = "client_credentials"
        }

        $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

        if ($response.access_token) {
            Write-Host "  ✓ Azure AD authentication successful" -ForegroundColor Green
        }
    } else {
        Write-Host "  - Skipped (missing credentials)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Azure AD authentication failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Dataverse Connection
Write-Host "`nTesting Dataverse Connection..." -ForegroundColor White
try {
    $dataverseUrl = $env:DATAVERSE_ENVIRONMENT_URL
    if ($dataverseUrl) {
        # Get token for Dataverse
        $tokenUrl = "https://login.microsoftonline.com/$env:AZURE_TENANT_ID/oauth2/v2.0/token"
        $body = @{
            client_id = $env:AZURE_CLIENT_ID
            client_secret = $env:AZURE_CLIENT_SECRET
            scope = "$dataverseUrl/.default"
            grant_type = "client_credentials"
        }

        $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

        # Test Dataverse API
        $headers = @{
            Authorization = "Bearer $($tokenResponse.access_token)"
            "OData-MaxVersion" = "4.0"
            "OData-Version" = "4.0"
        }

        $whoamiUrl = "$dataverseUrl/api/data/v9.2/WhoAmI"
        $whoami = Invoke-RestMethod -Uri $whoamiUrl -Headers $headers -Method Get

        Write-Host "  ✓ Dataverse connection successful (User ID: $($whoami.UserId))" -ForegroundColor Green
    } else {
        Write-Host "  - Skipped (DATAVERSE_ENVIRONMENT_URL not set)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Dataverse connection failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test SharePoint Connection
Write-Host "`nTesting SharePoint Connection..." -ForegroundColor White
try {
    $sharePointUrl = $env:SHAREPOINT_SITE_URL
    if ($sharePointUrl) {
        # Extract tenant from SharePoint URL
        $uri = [System.Uri]$sharePointUrl
        $sharePointResource = "https://$($uri.Host)"

        # Get token for SharePoint
        $tokenUrl = "https://login.microsoftonline.com/$env:AZURE_TENANT_ID/oauth2/v2.0/token"
        $body = @{
            client_id = $env:AZURE_CLIENT_ID
            client_secret = $env:AZURE_CLIENT_SECRET
            scope = "$sharePointResource/.default"
            grant_type = "client_credentials"
        }

        $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

        # Test SharePoint API
        $headers = @{
            Authorization = "Bearer $($tokenResponse.access_token)"
            Accept = "application/json"
        }

        $siteInfoUrl = "$sharePointUrl/_api/web/title"
        $siteInfo = Invoke-RestMethod -Uri $siteInfoUrl -Headers $headers -Method Get

        Write-Host "  ✓ SharePoint connection successful" -ForegroundColor Green
    } else {
        Write-Host "  - Skipped (SHAREPOINT_SITE_URL not set)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ SharePoint connection failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Azure OpenAI Connection
Write-Host "`nTesting Azure OpenAI Connection..." -ForegroundColor White
try {
    $aoaiEndpoint = $env:AZURE_OPENAI_ENDPOINT
    $aoaiDeployment = $env:AZURE_OPENAI_DEPLOYMENT
    $aoaiKey = $env:AZURE_OPENAI_API_KEY

    if ($aoaiEndpoint -and $aoaiDeployment) {
        $headers = @{}

        if ($aoaiKey) {
            $headers["api-key"] = $aoaiKey
        } else {
            # Use Azure AD token
            $tokenUrl = "https://login.microsoftonline.com/$env:AZURE_TENANT_ID/oauth2/v2.0/token"
            $body = @{
                client_id = $env:AZURE_CLIENT_ID
                client_secret = $env:AZURE_CLIENT_SECRET
                scope = "https://cognitiveservices.azure.com/.default"
                grant_type = "client_credentials"
            }
            $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
            $headers["Authorization"] = "Bearer $($tokenResponse.access_token)"
        }

        $headers["Content-Type"] = "application/json"

        # Test with a simple completion
        $testUrl = "$aoaiEndpoint/openai/deployments/$aoaiDeployment/chat/completions?api-version=2024-02-01"
        $testBody = @{
            messages = @(
                @{ role = "user"; content = "Say 'OK'" }
            )
            max_tokens = 10
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method Post -Body $testBody

        Write-Host "  ✓ Azure OpenAI connection successful" -ForegroundColor Green
    } else {
        Write-Host "  - Skipped (endpoint or deployment not set)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Azure OpenAI connection failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Summary
Write-Host "`n=== Validation Summary ===" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✓ All validations passed - Ready for deployment" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some validations failed - Please fix issues before deployment" -ForegroundColor Red
    exit 1
}
