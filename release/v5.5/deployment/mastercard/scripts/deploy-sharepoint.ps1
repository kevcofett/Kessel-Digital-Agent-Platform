# Deploy KB Documents to SharePoint
# Uploads all knowledge base documents for specified agent(s)

param(
    [string]$Agent = "all"  # mpa, ca, eap, or all
)

$ErrorActionPreference = "Stop"
$repoRoot = (Get-Item $PSScriptRoot).Parent.Parent.Parent.Parent.FullName
$agentsDir = Join-Path $repoRoot "release/v5.5/agents"

Write-Host "=== SharePoint KB Deployment ===" -ForegroundColor Cyan
Write-Host "Agent: $Agent"
Write-Host ""

# Get authentication token
$tenantId = $env:AZURE_TENANT_ID
$clientId = $env:AZURE_CLIENT_ID
$clientSecret = $env:AZURE_CLIENT_SECRET
$siteUrl = $env:SHAREPOINT_SITE_URL
$libraryName = if ($env:SHAREPOINT_LIBRARY_NAME) { $env:SHAREPOINT_LIBRARY_NAME } else { "AgentKnowledgeBase" }

if (-not $siteUrl) {
    Write-Host "Error: SHAREPOINT_SITE_URL not set" -ForegroundColor Red
    exit 1
}

# Extract SharePoint resource URL
$uri = [System.Uri]$siteUrl
$sharePointResource = "https://$($uri.Host)"

# Get access token
Write-Host "Authenticating to SharePoint..." -ForegroundColor Yellow
$tokenUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
$body = @{
    client_id = $clientId
    client_secret = $clientSecret
    scope = "$sharePointResource/.default"
    grant_type = "client_credentials"
}

$tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
$accessToken = $tokenResponse.access_token

$headers = @{
    Authorization = "Bearer $accessToken"
    Accept = "application/json;odata=verbose"
    "Content-Type" = "application/json;odata=verbose"
}

# Function to upload file
function Upload-KBFile {
    param(
        [string]$LocalPath,
        [string]$FolderPath
    )

    $fileName = Split-Path $LocalPath -Leaf
    $fileContent = [System.IO.File]::ReadAllBytes($LocalPath)

    # Create folder if not exists
    $folderUrl = "$siteUrl/_api/web/GetFolderByServerRelativeUrl('$libraryName/$FolderPath')"
    try {
        $null = Invoke-RestMethod -Uri $folderUrl -Headers $headers -Method Get
    } catch {
        # Folder doesn't exist, create it
        Write-Host "  Creating folder: $FolderPath" -ForegroundColor Gray
        $createFolderUrl = "$siteUrl/_api/web/folders"
        $folderBody = @{
            "__metadata" = @{ "type" = "SP.Folder" }
            "ServerRelativeUrl" = "$libraryName/$FolderPath"
        } | ConvertTo-Json

        try {
            $null = Invoke-RestMethod -Uri $createFolderUrl -Headers $headers -Method Post -Body $folderBody
        } catch {
            # Folder might exist at parent level, continue
        }
    }

    # Upload file
    $uploadUrl = "$siteUrl/_api/web/GetFolderByServerRelativeUrl('$libraryName/$FolderPath')/Files/add(url='$fileName',overwrite=true)"

    try {
        $uploadHeaders = @{
            Authorization = "Bearer $accessToken"
            Accept = "application/json;odata=verbose"
        }

        $null = Invoke-RestMethod -Uri $uploadUrl -Headers $uploadHeaders -Method Post -Body $fileContent -ContentType "application/octet-stream"
        Write-Host "  ✓ Uploaded: $fileName" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ✗ Failed to upload $fileName`: $_" -ForegroundColor Red
        return $false
    }
}

# Function to deploy agent KB
function Deploy-AgentKB {
    param(
        [string]$AgentName
    )

    Write-Host "`nDeploying $($AgentName.ToUpper()) KB..." -ForegroundColor Yellow

    $kbPath = Join-Path $agentsDir "$AgentName/base/kb"

    if (-not (Test-Path $kbPath)) {
        Write-Host "  Warning: KB path not found: $kbPath" -ForegroundColor Yellow
        return 0, 0
    }

    $files = Get-ChildItem $kbPath -Filter "*.txt" -Recurse
    $uploaded = 0
    $failed = 0

    foreach ($file in $files) {
        $result = Upload-KBFile -LocalPath $file.FullName -FolderPath $AgentName.ToUpper()
        if ($result) { $uploaded++ } else { $failed++ }
    }

    Write-Host "  Uploaded: $uploaded, Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
    return $uploaded, $failed
}

# Deploy based on agent parameter
$totalUploaded = 0
$totalFailed = 0

if ($Agent -eq "all" -or $Agent -eq "mpa") {
    $u, $f = Deploy-AgentKB -AgentName "mpa"
    $totalUploaded += $u
    $totalFailed += $f
}

if ($Agent -eq "all" -or $Agent -eq "ca") {
    $u, $f = Deploy-AgentKB -AgentName "ca"
    $totalUploaded += $u
    $totalFailed += $f
}

if ($Agent -eq "all" -or $Agent -eq "eap") {
    $u, $f = Deploy-AgentKB -AgentName "eap"
    $totalUploaded += $u
    $totalFailed += $f
}

# Summary
Write-Host "`n=== SharePoint Deployment Summary ===" -ForegroundColor Cyan
Write-Host "Total Uploaded: $totalUploaded" -ForegroundColor Green
Write-Host "Total Failed: $totalFailed" -ForegroundColor $(if ($totalFailed -eq 0) { "Green" } else { "Red" })

if ($totalFailed -gt 0) {
    exit 1
}
