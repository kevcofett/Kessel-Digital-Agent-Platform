# MASTERCARD FULL DEPLOYMENT SPECIFICATION
# Complete Step-by-Step for VS Code to Deploy to MSFT Environment

**Version:** 1.0
**Created:** 2026-01-12
**Target Environment:** Mastercard Microsoft 365 / Power Platform
**Prerequisite:** VS Code with repo access and MSFT admin credentials

---

## TABLE OF CONTENTS

1. Pre-Deployment Validation
2. SharePoint Deployment
3. Dataverse Deployment
4. Power Automate Flows Deployment
5. Azure Functions Deployment
6. Copilot Studio Configuration
7. Topic Configuration
8. Knowledge Source Configuration
9. Testing and Validation
10. Go-Live Checklist

---

## SECTION 1: PRE-DEPLOYMENT VALIDATION

### 1.1 Required Access

Verify you have these permissions:

| System | Required Role | Validation Command |
|--------|--------------|-------------------|
| Azure AD | Application Administrator | `az ad app list --display-name "MPA-Agent"` |
| SharePoint | Site Collection Admin | `m365 spo site get --url $SHAREPOINT_URL` |
| Dataverse | System Administrator | `pac auth create --environment $DATAVERSE_URL` |
| Power Automate | Environment Maker | `pac solution list` |
| Copilot Studio | Bot Author | Manual verification in portal |
| Azure | Contributor | `az account show` |

### 1.2 Environment Variables Required

Create `/release/v5.5/deployment/mastercard/.env` from template:

```bash
# Azure AD / Authentication
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Dataverse
DATAVERSE_ENVIRONMENT_URL=https://org12345.crm.dynamics.com
DATAVERSE_SOLUTION_NAME=MediaPlanningAgent55

# SharePoint
SHAREPOINT_SITE_URL=https://mastercard.sharepoint.com/sites/AIAgents
SHAREPOINT_KB_LIBRARY=AgentKnowledgeBase

# Power Automate
POWER_AUTOMATE_ENVIRONMENT_ID=Default-abc123

# Azure Functions
AZURE_FUNCTION_APP_NAME=mpa-functions-prod
AZURE_STORAGE_CONNECTION=DefaultEndpointsProtocol=https;...

# Copilot Studio
COPILOT_BOT_ID=your-bot-id
COPILOT_ENVIRONMENT_ID=your-env-id
```

### 1.3 Validation Script

```powershell
# validate-deployment-readiness.ps1

param(
    [string]$EnvFile = ".env"
)

# Load environment
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

$checks = @()

# Check Azure AD
Write-Host "Checking Azure AD..." -NoNewline
try {
    az login --service-principal -u $env:AZURE_CLIENT_ID -p $env:AZURE_CLIENT_SECRET --tenant $env:AZURE_TENANT_ID | Out-Null
    $checks += @{Name="Azure AD"; Status="PASS"}
    Write-Host " PASS" -ForegroundColor Green
} catch {
    $checks += @{Name="Azure AD"; Status="FAIL"; Error=$_.Exception.Message}
    Write-Host " FAIL" -ForegroundColor Red
}

# Check Dataverse
Write-Host "Checking Dataverse..." -NoNewline
try {
    pac auth create --environment $env:DATAVERSE_ENVIRONMENT_URL | Out-Null
    $checks += @{Name="Dataverse"; Status="PASS"}
    Write-Host " PASS" -ForegroundColor Green
} catch {
    $checks += @{Name="Dataverse"; Status="FAIL"; Error=$_.Exception.Message}
    Write-Host " FAIL" -ForegroundColor Red
}

# Check SharePoint
Write-Host "Checking SharePoint..." -NoNewline
try {
    m365 login --authType certificate --certificateFile ./cert.pem --thumbprint $env:CERT_THUMBPRINT | Out-Null
    m365 spo site get --url $env:SHAREPOINT_SITE_URL | Out-Null
    $checks += @{Name="SharePoint"; Status="PASS"}
    Write-Host " PASS" -ForegroundColor Green
} catch {
    $checks += @{Name="SharePoint"; Status="FAIL"; Error=$_.Exception.Message}
    Write-Host " FAIL" -ForegroundColor Red
}

# Summary
Write-Host "`nDeployment Readiness Summary:"
$checks | ForEach-Object {
    $color = if ($_.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "  $($_.Name): $($_.Status)" -ForegroundColor $color
}

$failed = ($checks | Where-Object { $_.Status -eq "FAIL" }).Count
if ($failed -gt 0) {
    Write-Host "`n$failed check(s) failed. Fix before proceeding." -ForegroundColor Red
    exit 1
}
```

---

## SECTION 2: SHAREPOINT DEPLOYMENT

### 2.1 Folder Structure

Create this structure in SharePoint:

```
AgentKnowledgeBase/
├── MPA/
│   ├── Core/
│   │   ├── Process_10Step_Framework_v5_5.txt
│   │   ├── Pathway_Selection_Guide_v5_5.txt
│   │   └── ...
│   ├── Benchmarks/
│   │   ├── Benchmarks_Performance_v5_5.txt
│   │   └── ...
│   ├── Channels/
│   │   ├── Channel_Display_Programmatic_v5_5.txt
│   │   └── ...
│   └── Reference/
│       ├── Glossary_Terms_v5_5.txt
│       └── ...
├── CA/
│   ├── Frameworks/
│   ├── Industry/
│   └── Reference/
└── EAP/
    ├── Platform/
    └── Integration/
```

### 2.2 Upload Script

```powershell
# deploy-sharepoint-kb.ps1

param(
    [string]$SourcePath = "../../agents",
    [string]$SiteUrl = $env:SHAREPOINT_SITE_URL,
    [string]$LibraryName = $env:SHAREPOINT_KB_LIBRARY
)

# Connect to SharePoint
Connect-PnPOnline -Url $SiteUrl -Interactive

# Create library if not exists
$library = Get-PnPList -Identity $LibraryName -ErrorAction SilentlyContinue
if (-not $library) {
    New-PnPList -Title $LibraryName -Template DocumentLibrary
    Write-Host "Created library: $LibraryName"
}

# Agent configurations
$agents = @(
    @{
        Name = "MPA"
        SourceFolder = "mpa/base/kb"
        Categories = @{
            "Core" = @("Process_", "Pathway_", "Validation_", "Output_")
            "Benchmarks" = @("Benchmark")
            "Channels" = @("Channel_")
            "Reference" = @("Glossary_", "KPI_", "Vertical_")
        }
    },
    @{
        Name = "CA"
        SourceFolder = "ca/base/kb"
        Categories = @{
            "Frameworks" = @("FRAMEWORK_", "CUSTOM_")
            "Industry" = @("INDUSTRY_", "REFERENCE_")
            "Reference" = @("REGISTRY_", "BEHAVIORAL_")
        }
    },
    @{
        Name = "EAP"
        SourceFolder = "eap/base/kb"
        Categories = @{
            "Platform" = @("BENCHMARK_", "FRAMEWORK_", "TOOLS_")
            "Integration" = @("REGISTRY_", "REFERENCE_")
        }
    }
)

$uploadCount = 0
$errorCount = 0

foreach ($agent in $agents) {
    Write-Host "`nProcessing $($agent.Name)..." -ForegroundColor Cyan
    
    # Create agent folder
    $agentFolder = "$LibraryName/$($agent.Name)"
    Resolve-PnPFolder -SiteRelativePath $agentFolder | Out-Null
    
    # Create category folders
    foreach ($category in $agent.Categories.Keys) {
        $categoryFolder = "$agentFolder/$category"
        Resolve-PnPFolder -SiteRelativePath $categoryFolder | Out-Null
    }
    
    # Get source files
    $sourcePath = Join-Path $SourcePath $agent.SourceFolder
    $files = Get-ChildItem -Path $sourcePath -Filter "*.txt" -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        # Determine category
        $targetCategory = "Reference" # Default
        foreach ($category in $agent.Categories.Keys) {
            foreach ($prefix in $agent.Categories[$category]) {
                if ($file.Name -like "$prefix*") {
                    $targetCategory = $category
                    break
                }
            }
        }
        
        $targetPath = "$agentFolder/$targetCategory"
        
        try {
            Add-PnPFile -Path $file.FullName -Folder $targetPath -ErrorAction Stop | Out-Null
            Write-Host "  Uploaded: $($file.Name) -> $targetPath" -ForegroundColor Green
            $uploadCount++
        }
        catch {
            Write-Host "  Failed: $($file.Name) - $_" -ForegroundColor Red
            $errorCount++
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SharePoint Deployment Complete"
Write-Host "  Files Uploaded: $uploadCount"
Write-Host "  Errors: $errorCount"
Write-Host "========================================" -ForegroundColor Cyan
```

### 2.3 Verification

```powershell
# verify-sharepoint-kb.ps1

$expectedCounts = @{
    "MPA" = 32
    "CA" = 36
    "EAP" = 8
}

$library = Get-PnPList -Identity $env:SHAREPOINT_KB_LIBRARY
$items = Get-PnPListItem -List $library -PageSize 500

foreach ($agent in $expectedCounts.Keys) {
    $count = ($items | Where-Object { $_["FileRef"] -like "*/$agent/*" }).Count
    $expected = $expectedCounts[$agent]
    
    if ($count -eq $expected) {
        Write-Host "$agent`: $count files (PASS)" -ForegroundColor Green
    } else {
        Write-Host "$agent`: $count files (EXPECTED $expected)" -ForegroundColor Yellow
    }
}
```

---

## SECTION 3: DATAVERSE DEPLOYMENT

### 3.1 Solution Package

The solution package contains all tables. Location:
`/release/v5.5/flows/deployed/MediaPlanningAgentv55.zip`

### 3.2 Table Deployment Order

Deploy in this order due to relationships:

```
Phase 1: Core Platform Tables (EAP)
  - eap_user
  - eap_client
  - eap_session
  - eap_audit_logs
  - eap_documents

Phase 2: Reference Tables (MPA)
  - mpa_vertical
  - mpa_kpi
  - mpa_channel
  - mpa_benchmark

Phase 3: Planning Tables (MPA)
  - mpa_mediaplan
  - mpa_planversion
  - mpa_plandata
  - mpa_audiences

Phase 4: Performance Tables (MPA)
  - mpa_campaignperformance
  - mpa_performancekpis
  - mpa_dataimportlog

Phase 5: Optimization Tables (MPA)
  - mpa_inflightsession
  - mpa_inflightdataentry
  - mpa_optimizationrecommendation
  - mpa_optimizationaction

Phase 6: Learning Tables (MPA)
  - mpa_planlearning
  - mpa_learningapplication
  - mpa_postmortemreport
  - mpa_postmortemfinding

Phase 7: NEW Learning Tables (Phase 10)
  - mpa_feedback
  - mpa_kb_usage
  - mpa_success_patterns
```

### 3.3 Import Script

```powershell
# deploy-dataverse.ps1

param(
    [string]$SolutionPath = "../../flows/deployed/MediaPlanningAgentv55.zip",
    [switch]$IncludeLearningTables
)

# Authenticate
pac auth create --environment $env:DATAVERSE_ENVIRONMENT_URL

# Import main solution
Write-Host "Importing solution..." -ForegroundColor Cyan
pac solution import --path $SolutionPath --async --publish-changes

# Wait for completion
$timeout = 300 # 5 minutes
$elapsed = 0
while ($elapsed -lt $timeout) {
    $status = pac solution list --json | ConvertFrom-Json | Where-Object { $_.UniqueName -eq "MediaPlanningAgent55" }
    if ($status) {
        Write-Host "Solution imported successfully" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 10
    $elapsed += 10
    Write-Host "Waiting... ($elapsed seconds)"
}

# Import learning tables if requested
if ($IncludeLearningTables) {
    Write-Host "`nCreating learning tables..." -ForegroundColor Cyan
    
    $learningTables = @(
        "../agents/mpa/mastercard/dataverse/mpa_feedback.json",
        "../agents/mpa/mastercard/dataverse/mpa_kb_usage.json",
        "../agents/mpa/mastercard/dataverse/mpa_success_patterns.json"
    )
    
    foreach ($tableDef in $learningTables) {
        if (Test-Path $tableDef) {
            $table = Get-Content $tableDef | ConvertFrom-Json
            Write-Host "  Creating table: $($table.table.schemaName)"
            # Use Dataverse Web API to create table
            # Implementation depends on authentication method
        }
    }
}

Write-Host "`nDataverse deployment complete" -ForegroundColor Green
```

### 3.4 Seed Data Import

```powershell
# import-seed-data.ps1

param(
    [string]$SeedDataPath = "../../seed-data"
)

$seedFiles = @(
    @{Table="mpa_vertical"; File="mpa_vertical_seed.csv"},
    @{Table="mpa_kpi"; File="mpa_kpi_seed_updated.csv"},
    @{Table="mpa_channel"; File="mpa_channel_seed_updated.csv"},
    @{Table="mpa_benchmark"; File="mpa_benchmark_seed.csv"}
)

foreach ($seed in $seedFiles) {
    $filePath = Join-Path $SeedDataPath $seed.File
    
    if (Test-Path $filePath) {
        Write-Host "Importing $($seed.Table)..." -NoNewline
        
        try {
            pac data import --data $filePath --target-table $seed.Table --connection $env:DATAVERSE_CONNECTION
            Write-Host " Done" -ForegroundColor Green
        }
        catch {
            Write-Host " Failed: $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "File not found: $filePath" -ForegroundColor Yellow
    }
}
```

---

## SECTION 4: POWER AUTOMATE FLOWS DEPLOYMENT

### 4.1 Flow Inventory

| Flow # | Name | Purpose | Dependencies |
|--------|------|---------|--------------|
| 01 | MPA_InitializeSession | Create new session | eap_session |
| 02 | MPA_CreatePlan | Create media plan | mpa_mediaplan |
| 03 | MPA_SaveSection | Save plan section | mpa_plandata |
| 04 | MPA_ValidatePlan | Validate plan | mpa_mediaplan |
| 05 | MPA_GenerateDocument | Generate Word/PDF | Azure Functions |
| 06 | MPA_SearchBenchmarks | Search benchmarks | mpa_benchmark |
| 07 | MPA_SearchChannels | Search channels | mpa_channel |
| 08 | MPA_ImportPerformance | Import perf data | mpa_campaignperformance |
| 09 | MPA_CreatePostMortem | Create post-mortem | mpa_postmortemreport |
| 10 | MPA_PromoteLearning | Promote learning | mpa_planlearning |
| 11 | MPA_ProcessMediaBrief | Process brief | mpa_mediaplan |
| 12 | MPA_CaptureFeedback | Capture feedback | mpa_feedback |
| 13 | MPA_TrackKBUsage | Track KB usage | mpa_kb_usage |

### 4.2 Flow Deployment Script

```powershell
# deploy-flows.ps1

param(
    [string]$FlowSpecPath = "../../agents/mpa/base/flows/specifications",
    [string]$EnvironmentId = $env:POWER_AUTOMATE_ENVIRONMENT_ID
)

# Get all flow specifications
$flowFiles = Get-ChildItem -Path $FlowSpecPath -Filter "flow_*.json" | Sort-Object Name

Write-Host "Deploying $($flowFiles.Count) flows to environment $EnvironmentId" -ForegroundColor Cyan

$deployed = 0
$failed = 0

foreach ($flowFile in $flowFiles) {
    $flowSpec = Get-Content $flowFile.FullName | ConvertFrom-Json
    $flowName = $flowSpec.metadata.flowName
    
    Write-Host "  Deploying: $flowName..." -NoNewline
    
    try {
        # Check if flow exists
        $existingFlow = pac flow list --environment $EnvironmentId --json | 
            ConvertFrom-Json | 
            Where-Object { $_.displayName -eq $flowSpec.metadata.displayName }
        
        if ($existingFlow) {
            # Update existing flow
            pac flow update --environment $EnvironmentId --id $existingFlow.name --definition $flowFile.FullName
            Write-Host " Updated" -ForegroundColor Yellow
        }
        else {
            # Create new flow
            pac flow create --environment $EnvironmentId --definition $flowFile.FullName
            Write-Host " Created" -ForegroundColor Green
        }
        $deployed++
    }
    catch {
        Write-Host " Failed: $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nFlow Deployment Summary:"
Write-Host "  Deployed: $deployed"
Write-Host "  Failed: $failed"

# Update connections
Write-Host "`nIMPORTANT: Update flow connections manually in Power Automate portal"
Write-Host "  1. Open each flow"
Write-Host "  2. Update Dataverse connection"
Write-Host "  3. Update SharePoint connection (if applicable)"
Write-Host "  4. Save and enable flow"
```

### 4.3 Connection Configuration

After deployment, configure these connections in Power Automate portal:

| Connection | Type | Configuration |
|------------|------|---------------|
| Dataverse | shared_commondataserviceforapps | Environment: Mastercard Production |
| SharePoint | shared_sharepointonline | Site: $SHAREPOINT_SITE_URL |
| HTTP | shared_webcontents | For Azure Functions calls |
| Office 365 | shared_office365users | For user info lookup |

---

## SECTION 5: AZURE FUNCTIONS DEPLOYMENT

### 5.1 Functions Required

| Function | Purpose | Trigger |
|----------|---------|---------|
| GenerateDocument | Create Word/PDF from plan | HTTP |
| ProcessMediaBrief | Parse uploaded brief | HTTP |
| CalculateBenchmarks | Compute benchmark comparisons | HTTP |
| IndexKBDocuments | Sync KB to search index | Timer/HTTP |

### 5.2 Deployment Script

```powershell
# deploy-azure-functions.ps1

param(
    [string]$FunctionAppName = $env:AZURE_FUNCTION_APP_NAME,
    [string]$ResourceGroup = $env:AZURE_RESOURCE_GROUP,
    [string]$FunctionPath = "../../agents/mpa/base/functions"
)

# Login to Azure
az login --service-principal -u $env:AZURE_CLIENT_ID -p $env:AZURE_CLIENT_SECRET --tenant $env:AZURE_TENANT_ID

# Check if Function App exists
$app = az functionapp show --name $FunctionAppName --resource-group $ResourceGroup 2>$null

if (-not $app) {
    Write-Host "Creating Function App..." -ForegroundColor Yellow
    
    az functionapp create `
        --name $FunctionAppName `
        --resource-group $ResourceGroup `
        --consumption-plan-location eastus `
        --runtime node `
        --runtime-version 18 `
        --functions-version 4 `
        --storage-account $env:AZURE_STORAGE_ACCOUNT
}

# Deploy functions
Write-Host "Deploying functions..." -ForegroundColor Cyan

Push-Location $FunctionPath
npm install
npm run build

func azure functionapp publish $FunctionAppName
Pop-Location

# Configure app settings
Write-Host "Configuring app settings..." -ForegroundColor Cyan

az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --settings `
        "DATAVERSE_URL=$env:DATAVERSE_ENVIRONMENT_URL" `
        "SHAREPOINT_URL=$env:SHAREPOINT_SITE_URL" `
        "AZURE_OPENAI_ENDPOINT=$env:AZURE_OPENAI_ENDPOINT" `
        "AZURE_OPENAI_KEY=$env:AZURE_OPENAI_KEY"

Write-Host "Azure Functions deployment complete" -ForegroundColor Green
```

---

## SECTION 6: COPILOT STUDIO CONFIGURATION

### 6.1 Agent Settings

Configure these settings in Copilot Studio:

**General Settings:**
- Name: Media Planning Agent (MPA)
- Description: AI-powered media planning assistant
- Icon: Upload from `/assets/mpa-icon.png`
- Primary Language: English (US)

**Generative AI Settings:**
- Enable Generative Answers: Yes
- Moderation: Standard
- Classic fallback: Disabled

### 6.2 Instructions Upload

**CRITICAL:** The instructions must be pasted manually into Copilot Studio.

1. Open Copilot Studio
2. Select the agent
3. Go to "Overview" → "Instructions"
4. Copy contents from: `/release/v5.5/agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_PRODUCTION.txt`
5. Paste into Instructions field
6. Click Save

**Character Limit:** Instructions must be under 8,000 characters.

### 6.3 Verification

After pasting instructions:
1. Open Test panel
2. Send: "What can you help me with?"
3. Verify agent responds with capabilities overview
4. Send: "What are the 10 steps in media planning?"
5. Verify agent describes the framework

---

## SECTION 7: TOPIC CONFIGURATION

### 7.1 Topic Definitions

Create these topics in Copilot Studio:

#### Topic: Greeting
```yaml
Name: Greeting
Trigger Phrases:
  - Hello
  - Hi
  - Hey
  - Good morning
  - Good afternoon
  - Help
  - What can you do
Response: |
  Hello! I'm the Media Planning Agent. I can help you with:
  
  - Creating comprehensive media plans
  - Finding industry benchmarks
  - Recommending channel allocations
  - Generating plan documents
  
  What would you like to work on today?
```

#### Topic: Start Planning
```yaml
Name: Start Planning Session
Trigger Phrases:
  - Start a new media plan
  - Create media plan
  - New campaign plan
  - Help me plan media
  - Begin planning
  - I need to plan a campaign
Condition: None
Action: 
  Type: Power Automate Flow
  Flow: MPA_InitializeSession
  Inputs:
    user_id: System.User.Id
    pathway: "GUIDED"
Response: |
  I've started a new planning session: {Topic.session_code}
  
  Let's begin with Step 1: Define Campaign Objectives.
  
  What are the primary business goals for this campaign?
  (e.g., brand awareness, lead generation, sales conversion)
```

#### Topic: Search Benchmarks
```yaml
Name: Search Benchmarks
Trigger Phrases:
  - What's a typical CPM
  - Benchmark data for
  - Industry benchmarks
  - What's a good CTR
  - Average performance
  - How does that compare
  - Expected results for
Condition: None
Action:
  Type: Power Automate Flow
  Flow: MPA_SearchBenchmarks
  Inputs:
    query: Activity.Text
    vertical: Global.CurrentVertical
Response: |
  Based on industry benchmarks:
  
  {Topic.benchmark_results}
  
  Note: These are median values. Your results may vary based on targeting, creative quality, and market conditions.
  
  Would you like me to explain any of these metrics in more detail?
```

#### Topic: Generate Document
```yaml
Name: Generate Document
Trigger Phrases:
  - Generate the document
  - Create the plan document
  - Export the plan
  - Download the plan
  - Create PDF
  - Create Word document
Condition: Global.HasActivePlan = true
Action:
  Type: Power Automate Flow
  Flow: MPA_GenerateDocument
  Inputs:
    plan_id: Global.CurrentPlanId
    format: "DOCX"
Response: |
  I've generated your media plan document.
  
  📄 [Download {Topic.document_name}]({Topic.document_url})
  
  The document includes:
  - Executive summary
  - Channel allocation details
  - Timeline and pacing
  - Budget breakdown
  - Benchmark appendix
```

#### Topic: Provide Feedback
```yaml
Name: Provide Feedback
Trigger Phrases:
  - That was helpful
  - That wasn't helpful
  - Good answer
  - Not what I needed
  - This is wrong
  - Great suggestion
  - I disagree
  - Perfect
Condition: None
Action:
  Type: Power Automate Flow
  Flow: MPA_CaptureFeedback
  Inputs:
    session_id: Global.SessionId
    feedback_type: |
      IF(CONTAINS(Activity.Text, "helpful") OR CONTAINS(Activity.Text, "great") OR CONTAINS(Activity.Text, "perfect"), "POSITIVE",
      IF(CONTAINS(Activity.Text, "wrong") OR CONTAINS(Activity.Text, "not") OR CONTAINS(Activity.Text, "disagree"), "NEGATIVE",
      "NEUTRAL"))
    feedback_text: Activity.Text
    agent_type: "MPA"
Response: |
  Thank you for your feedback! This helps me improve my recommendations.
  
  {IF Topic.feedback_type = "NEGATIVE"}
  I'm sorry that wasn't helpful. Could you tell me more about what you were looking for?
  {/IF}
```

#### Topic: Search Channels
```yaml
Name: Search Channels
Trigger Phrases:
  - Tell me about display
  - What channels should I use
  - CTV options
  - Paid social channels
  - Programmatic options
  - Search advertising
  - Retail media
  - Channel recommendations
Condition: None
Action:
  Type: Power Automate Flow
  Flow: MPA_SearchChannels
  Inputs:
    query: Activity.Text
    objective: Global.CurrentObjective
Response: |
  Based on your objective ({Global.CurrentObjective}):
  
  {Topic.channel_info}
  
  Would you like me to recommend specific budget allocation for this channel?
```

#### Topic: Fallback
```yaml
Name: Fallback
Trigger: System.UnknownIntent
Action:
  Type: Generative Answers
  Data Sources: SharePoint KB
Response: |
  {GenerativeAnswer}
  
  Is there anything else you'd like to know about media planning?
```

### 7.2 Topic Import Script

Unfortunately, Copilot Studio topics cannot be fully automated via CLI. Create documentation for manual setup:

```markdown
## Manual Topic Setup Instructions

1. Open Copilot Studio → Select Agent → Topics
2. Click "+ New Topic" → "From Blank"
3. For each topic in the specification:
   a. Set Name
   b. Add Trigger Phrases (one per line)
   c. Add Condition node (if applicable)
   d. Add Action node → Select Power Automate flow
   e. Map input variables
   f. Add Message node with response template
   g. Save and Test
4. Enable all topics
5. Publish agent
```

---

## SECTION 8: KNOWLEDGE SOURCE CONFIGURATION

### 8.1 Add SharePoint as Knowledge Source

1. In Copilot Studio, go to "Knowledge"
2. Click "+ Add Knowledge"
3. Select "SharePoint"
4. Enter Site URL: `$SHAREPOINT_SITE_URL`
5. Select Library: `AgentKnowledgeBase`
6. Configure:
   - Include all folders: Yes
   - File types: .txt
   - Refresh frequency: Daily
7. Click "Add"

### 8.2 Configure Search Settings

In Knowledge settings:
- Maximum chunks to retrieve: 5
- Minimum confidence: 0.7
- Enable citation: Yes
- Citation format: "Based on Knowledge Base"

### 8.3 Test Knowledge Retrieval

Test queries:
1. "What is a typical CPM for CTV?"
   - Should cite Benchmarks_Performance_v5_5.txt
2. "What are the 10 steps in media planning?"
   - Should cite Process_10Step_Framework_v5_5.txt
3. "How do I calculate ROAS?"
   - Should cite KPI_Definitions_v5_5.txt

---

## SECTION 9: TESTING AND VALIDATION

### 9.1 Smoke Tests

| Test | Input | Expected Output |
|------|-------|-----------------|
| Greeting | "Hello" | Welcome message with capabilities |
| KB Retrieval | "What's a typical CPM for display?" | Benchmark data with citation |
| Flow Execution | "Start a new media plan" | Session code returned |
| Document Gen | "Generate the plan document" | Download link provided |
| Feedback | "That was helpful" | Thank you message |

### 9.2 Integration Tests

```powershell
# test-integration.ps1

$tests = @(
    @{
        Name = "Session Creation"
        Input = "Start a new media plan for a retail client"
        Validation = { $_.Contains("session") -and $_.Contains("Step 1") }
    },
    @{
        Name = "Benchmark Search"
        Input = "What's a typical CPM for CTV advertising?"
        Validation = { $_.Contains("CPM") -and $_.Contains("Knowledge Base") }
    },
    @{
        Name = "Channel Recommendation"
        Input = "What channels work best for brand awareness?"
        Validation = { $_.Contains("awareness") -and ($_.Contains("CTV") -or $_.Contains("Display")) }
    }
)

foreach ($test in $tests) {
    Write-Host "Testing: $($test.Name)..." -NoNewline
    
    # Send message to Copilot (via Direct Line API or test harness)
    $response = Invoke-CopilotTest -Message $test.Input
    
    if (& $test.Validation $response) {
        Write-Host " PASS" -ForegroundColor Green
    }
    else {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "  Response: $response"
    }
}
```

### 9.3 Performance Tests

Target metrics:
- First response: < 3 seconds
- KB retrieval: < 2 seconds
- Flow execution: < 5 seconds
- Document generation: < 15 seconds

---

## SECTION 10: GO-LIVE CHECKLIST

### Pre-Go-Live

- [ ] All SharePoint KB files uploaded (76 files)
- [ ] All Dataverse tables created with seed data
- [ ] All Power Automate flows deployed and enabled
- [ ] Azure Functions deployed and responding
- [ ] Copilot Studio agent configured with instructions
- [ ] All topics created and tested
- [ ] Knowledge source connected and indexed
- [ ] All smoke tests passing
- [ ] All integration tests passing
- [ ] Performance metrics met

### Go-Live

- [ ] Publish Copilot Studio agent
- [ ] Enable Teams channel
- [ ] Enable Web channel (if applicable)
- [ ] Notify stakeholders
- [ ] Monitor initial usage
- [ ] Review error logs

### Post-Go-Live

- [ ] Monitor conversation logs (Day 1)
- [ ] Review feedback data (Week 1)
- [ ] Analyze KB usage patterns (Week 1)
- [ ] Performance tuning (Week 2)
- [ ] User training (Week 2)

---

## END OF DEPLOYMENT SPECIFICATION
