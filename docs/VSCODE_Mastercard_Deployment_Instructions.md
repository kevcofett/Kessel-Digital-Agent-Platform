# MPA v6.0 VS CODE MASTERCARD DEPLOYMENT INSTRUCTIONS

**Document:** VSCODE_Mastercard_Deployment_Instructions.md  
**Version:** 1.0  
**Date:** January 19, 2026  
**Target Environment:** Mastercard (DLP-Restricted)  
**Purpose:** Complete automated deployment instructions for VS Code Claude to replicate Personal environment deployment in Mastercard

---

## TABLE OF CONTENTS

1. [Overview and Constraints](#part-1-overview-and-constraints)
2. [Pre-Requisites](#part-2-pre-requisites)
3. [Authentication Setup](#part-3-authentication-setup)
4. [Repository Setup](#part-4-repository-setup)
5. [Dataverse Deployment](#part-5-dataverse-deployment)
6. [SharePoint Configuration](#part-6-sharepoint-configuration)
7. [AI Builder Prompt Deployment](#part-7-ai-builder-prompt-deployment)
8. [Power Automate Flow Deployment](#part-8-power-automate-flow-deployment)
9. [Copilot Studio Agent Deployment](#part-9-copilot-studio-agent-deployment)
10. [Topic Configuration](#part-10-topic-configuration)
11. [Validation Testing](#part-11-validation-testing)
12. [Troubleshooting](#part-12-troubleshooting)
13. [Rollback Procedures](#part-13-rollback-procedures)

---

## PART 1: OVERVIEW AND CONSTRAINTS

### 1.1 Deployment Scope

This document provides complete instructions to deploy MPA v6.0 to the Mastercard environment. The deployment replicates functionality from the Personal (Aragorn AI) environment with Mastercard-specific constraints.

### 1.2 Component Inventory

| Component | Count | Notes |
|-----------|-------|-------|
| Dataverse Tables | 14 | Same schema as Personal |
| Seed Data Files | 10 | Mastercard-specific implementation mappings |
| KB Files (SharePoint) | 30+ | Same content as Personal |
| AI Builder Prompts | 26 | Primary computation layer |
| Power Automate Flows | 5 | Core flows only (no HTTP/Azure) |
| Copilot Studio Agents | 9 | Same agents as Personal |
| Topics per Agent | 3-5 | Same topics as Personal |

### 1.3 Mastercard Environment Constraints

**CRITICAL - THESE CONSTRAINTS MUST BE ENFORCED:**

| Constraint | Impact | Solution |
|------------|--------|----------|
| No HTTP Connector | Cannot call external APIs | Use AI Builder prompts only |
| No Azure Functions | Cannot use Python calculations | Use AI Builder prompts only |
| No Custom Connectors | Cannot create custom integrations | Use approved connectors only |
| DLP Policy Active | Blocks unapproved data flows | Verify all connectors approved |
| Approved Connectors Only | Limited integration options | Dataverse, SharePoint, AI Builder, Office 365 |

### 1.4 Implementation Differences from Personal

| Capability | Personal Implementation | Mastercard Implementation |
|------------|------------------------|---------------------------|
| CALCULATE_MARGINAL_RETURN | Azure Function (primary) + AI Builder (fallback) | AI Builder only |
| COMPARE_SCENARIOS | Azure Function + AI Builder | AI Builder only |
| GENERATE_PROJECTIONS | Azure Function + AI Builder | AI Builder only |
| DETECT_ANOMALIES | Azure Function + AI Builder | AI Builder only |
| ANALYZE_ATTRIBUTION | Azure Function + AI Builder | AI Builder only |
| All other capabilities | AI Builder | AI Builder (same) |

---

## PART 2: PRE-REQUISITES

### 2.1 Required Tools

```bash
# Verify all tools are installed
node --version          # v18+ required
npm --version           # v9+ required
pac --version           # Power Platform CLI (latest)
git --version           # Git (latest)
python --version        # Python 3.11+ (for scripts)
pwsh --version          # PowerShell 7+ (for SharePoint)
```

### 2.2 Install Missing Tools

```bash
# Power Platform CLI (if not installed)
npm install -g @microsoft/pac-cli

# PowerShell modules for SharePoint
pwsh -Command "Install-Module -Name PnP.PowerShell -Force -AllowClobber"

# Python dependencies for automation scripts
pip install requests msal pandas pyyaml
```

### 2.3 Required Permissions

| System | Required Role | Verification Command |
|--------|---------------|---------------------|
| Power Platform | System Administrator | `pac org who` |
| Dataverse | System Administrator | `pac org who` |
| SharePoint | Site Collection Administrator | Check in SharePoint Admin |
| Copilot Studio | Copilot Author | Create test copilot |
| Power Automate | Environment Maker | Create test flow |
| AI Builder | AI Builder access | Create test prompt |

---

## PART 3: AUTHENTICATION SETUP

### 3.1 Create Mastercard Authentication Profile

```bash
# Clear any existing auth (if needed)
pac auth clear

# Create auth profile for Mastercard environment
pac auth create \
  --name "Mastercard" \
  --environment "https://[mastercard-org-id].crm.dynamics.com" \
  --tenant "[mastercard-tenant-id]"

# Verify authentication
pac auth list

# Select Mastercard profile
pac auth select --name "Mastercard"

# Verify connection
pac org who
```

Expected output:
```
Connected to: Mastercard
Environment ID: [env-id]
User: [your-email]
```

### 3.2 Verify Environment Access

```bash
# List available environments
pac admin list

# Verify Mastercard environment details
pac org select --environment "[mastercard-environment-id]"

# Check solution list
pac solution list
```

### 3.3 SharePoint Authentication

```powershell
# Connect to Mastercard SharePoint
Connect-PnPOnline `
  -Url "https://[mastercard-tenant].sharepoint.com/sites/MPA" `
  -Interactive

# Verify connection
Get-PnPSite
```

---

## PART 4: REPOSITORY SETUP

### 4.1 Clone and Configure Repository

```bash
# Navigate to projects directory
cd ~/Projects

# Clone repository (if not already cloned)
git clone https://github.com/kessel-digital/Kessel-Digital-Agent-Platform.git
cd Kessel-Digital-Agent-Platform

# Fetch all branches
git fetch --all

# Checkout Mastercard deployment branch
git checkout deploy/mastercard

# Pull latest changes
git pull origin deploy/mastercard

# Verify branch
git branch
# Should show: * deploy/mastercard
```

### 4.2 Repository Structure

Verify the following structure exists:

```
Kessel-Digital-Agent-Platform/
├── base/
│   ├── agents/
│   │   ├── orc/
│   │   │   ├── instructions/
│   │   │   │   └── ORC_Copilot_Instructions_v1.txt
│   │   │   └── kb/
│   │   │       └── ORC_KB_Routing_Logic_v1.txt
│   │   ├── anl/
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   │       ├── ANL_KB_Analytics_Core_v1.txt
│   │   │       ├── ANL_KB_Bayesian_Inference_v1.txt
│   │   │       ├── ANL_KB_Budget_Optimization_v1.txt
│   │   │       ├── ANL_KB_Causal_Incrementality_v1.txt
│   │   │       └── ANL_KB_MMM_Methods_v1.txt
│   │   ├── aud/
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── cha/
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── spo/
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── doc/
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   └── prf/
│   │       ├── instructions/
│   │       └── kb/
│   ├── platform/
│   │   └── eap/
│   │       ├── kb/
│   │       │   ├── EAP_KB_Confidence_Levels_v1.txt
│   │       │   ├── EAP_KB_Data_Provenance_v1.txt
│   │       │   ├── EAP_KB_Error_Handling_v1.txt
│   │       │   ├── EAP_KB_Formatting_Standards_v1.txt
│   │       │   ├── EAP_KB_Strategic_Principles_v1.txt
│   │       │   └── EAP_KB_Communication_Contract_v1.txt
│   │       └── prompts/
│   └── dataverse/
│       ├── schema/
│       └── seed/
│           ├── eap_agent_seed.csv
│           ├── eap_capability_seed.csv
│           ├── mpa_channel_seed.csv
│           ├── mpa_kpi_seed.csv
│           ├── mpa_vertical_seed.csv
│           └── mpa_benchmark_seed.csv
├── environments/
│   └── mastercard/
│       ├── seed/
│       │   └── eap_capability_impl_mastercard.csv
│       └── config/
│           └── environment_config.json
└── deploy/
    └── mastercard/
        ├── deploy_all.sh
        ├── deploy_dataverse.sh
        ├── upload_kb.sh
        └── run_tests.sh
```

### 4.3 Verify All Files Present

```bash
# Count KB files
find base/agents -name "*.txt" | wc -l
# Expected: 23+ agent KB files

find base/platform/eap/kb -name "*.txt" | wc -l
# Expected: 6 EAP KB files

# Count seed files
ls -la base/dataverse/seed/*.csv | wc -l
# Expected: 6 seed files

# Verify Mastercard-specific files
ls -la environments/mastercard/seed/
# Should contain: eap_capability_impl_mastercard.csv

ls -la environments/mastercard/config/
# Should contain: environment_config.json
```

---

## PART 5: DATAVERSE DEPLOYMENT

### 5.1 Create Dataverse Tables

The following 14 tables must be created in dependency order:

**Tier 1 - No Dependencies:**
```bash
# 1. eap_agent
pac solution component add \
  --solution-name MPA_v6_Platform \
  --component-type Table \
  --component-name eap_agent

# 2. eap_environment_config
# 3. mpa_vertical
# 4. mpa_channel
# 5. mpa_kpi
# 6. mpa_partner
```

**Tier 2 - Depends on Tier 1:**
```bash
# 7. eap_capability (depends on eap_agent)
# 8. eap_prompt (depends on eap_agent)
# 9. mpa_benchmark (depends on mpa_vertical, mpa_channel, mpa_kpi)
```

**Tier 3 - Depends on Tier 2:**
```bash
# 10. eap_capability_implementation (depends on eap_capability)
# 11. eap_test_case (depends on eap_capability)
```

**Tier 4 - Session Tables:**
```bash
# 12. mpa_session
# 13. mpa_session_step (depends on mpa_session)
# 14. eap_telemetry
```

### 5.2 Table Schema Definitions

**Table: eap_agent**
```
Columns:
- eap_agentid (Uniqueidentifier, PK)
- agent_code (Text, 20, Required, Unique)
- agent_name (Text, 100, Required)
- description (Multiline Text, 4000)
- capability_tags (Text, 500)
- routing_priority (Whole Number, Default: 100)
- is_active (Boolean, Default: true)
- version (Text, 20, Default: "1.0")
```

**Table: eap_capability**
```
Columns:
- eap_capabilityid (Uniqueidentifier, PK)
- capability_code (Text, 50, Required, Unique)
- capability_name (Text, 100, Required)
- agent_code (Text, 20, Required)
- description (Multiline Text, 2000)
- input_schema (Multiline Text, 8000)
- output_schema (Multiline Text, 8000)
- is_active (Boolean, Default: true)
```

**Table: eap_capability_implementation**
```
Columns:
- eap_capability_implementationid (Uniqueidentifier, PK)
- capability_code (Text, 50, Required)
- environment_code (Choice: MASTERCARD, PERSONAL, Required)
- implementation_type (Choice: AI_BUILDER_PROMPT, DATAVERSE_LOGIC, Required)
- implementation_reference (Text, 500, Required)
- priority_order (Whole Number, Default: 1)
- is_enabled (Boolean, Default: true)
- timeout_seconds (Whole Number, Default: 30)
- fallback_implementation_id (Lookup, Self-referential)
```

### 5.3 Load Seed Data

Execute in dependency order:

```bash
#!/bin/bash
# deploy/mastercard/deploy_dataverse.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "=========================================="
echo "MPA v6.0 Dataverse Deployment - Mastercard"
echo "=========================================="

# Select Mastercard auth profile
pac auth select --name "Mastercard"

# Verify connection
echo "Verifying connection..."
pac org who

# Load seed data in dependency order
echo ""
echo "Loading seed data..."

# Tier 1: No dependencies
echo "Loading eap_agent..."
pac data import \
  --data "$ROOT_DIR/base/dataverse/seed/eap_agent_seed.csv" \
  --table eap_agent

echo "Loading mpa_vertical..."
pac data import \
  --data "$ROOT_DIR/base/dataverse/seed/mpa_vertical_seed.csv" \
  --table mpa_vertical

echo "Loading mpa_channel..."
pac data import \
  --data "$ROOT_DIR/base/dataverse/seed/mpa_channel_seed.csv" \
  --table mpa_channel

echo "Loading mpa_kpi..."
pac data import \
  --data "$ROOT_DIR/base/dataverse/seed/mpa_kpi_seed.csv" \
  --table mpa_kpi

# Tier 2: Depends on Tier 1
echo "Loading eap_capability..."
pac data import \
  --data "$ROOT_DIR/base/dataverse/seed/eap_capability_seed.csv" \
  --table eap_capability

echo "Loading mpa_benchmark..."
pac data import \
  --data "$ROOT_DIR/base/dataverse/seed/mpa_benchmark_seed.csv" \
  --table mpa_benchmark

# Tier 3: Mastercard-specific implementations (AI Builder only)
echo "Loading eap_capability_implementation (Mastercard)..."
pac data import \
  --data "$ROOT_DIR/environments/mastercard/seed/eap_capability_impl_mastercard.csv" \
  --table eap_capability_implementation

echo ""
echo "=========================================="
echo "Dataverse deployment complete!"
echo "=========================================="
```

### 5.4 Mastercard Capability Implementation Seed Data

**File: environments/mastercard/seed/eap_capability_impl_mastercard.csv**

```csv
capability_code,environment_code,implementation_type,implementation_reference,priority_order,is_enabled,timeout_seconds
CALCULATE_MARGINAL_RETURN,MASTERCARD,AI_BUILDER_PROMPT,ANL_MarginalReturn_Prompt,1,true,30
COMPARE_SCENARIOS,MASTERCARD,AI_BUILDER_PROMPT,ANL_ScenarioCompare_Prompt,1,true,45
GENERATE_PROJECTIONS,MASTERCARD,AI_BUILDER_PROMPT,ANL_Projection_Prompt,1,true,45
ASSESS_CONFIDENCE,MASTERCARD,AI_BUILDER_PROMPT,ANL_Confidence_Prompt,1,true,30
APPLY_BAYESIAN_INFERENCE,MASTERCARD,AI_BUILDER_PROMPT,ANL_Bayesian_Prompt,1,true,45
ANALYZE_CAUSALITY,MASTERCARD,AI_BUILDER_PROMPT,ANL_Causal_Prompt,1,true,45
PRIORITIZE_SEGMENTS,MASTERCARD,AI_BUILDER_PROMPT,AUD_SegmentPriority_Prompt,1,true,30
ASSESS_LTV,MASTERCARD,AI_BUILDER_PROMPT,AUD_LTVAssess_Prompt,1,true,30
SCORE_PROPENSITY,MASTERCARD,AI_BUILDER_PROMPT,AUD_Propensity_Prompt,1,true,25
ANALYZE_JOURNEY_STATE,MASTERCARD,AI_BUILDER_PROMPT,AUD_JourneyState_Prompt,1,true,30
RESOLVE_IDENTITY,MASTERCARD,AI_BUILDER_PROMPT,AUD_Identity_Prompt,1,true,25
OPTIMIZE_CHANNEL_MIX,MASTERCARD,AI_BUILDER_PROMPT,CHA_ChannelMix_Prompt,1,true,45
SELECT_CHANNELS,MASTERCARD,AI_BUILDER_PROMPT,CHA_ChannelSelect_Prompt,1,true,30
ASSESS_EMERGING_CHANNEL,MASTERCARD,AI_BUILDER_PROMPT,CHA_EmergingAssess_Prompt,1,true,30
CALCULATE_FEE_WATERFALL,MASTERCARD,AI_BUILDER_PROMPT,SPO_FeeWaterfall_Prompt,1,true,25
SCORE_PARTNER,MASTERCARD,AI_BUILDER_PROMPT,SPO_PartnerScore_Prompt,1,true,25
CALCULATE_NBI,MASTERCARD,AI_BUILDER_PROMPT,SPO_NBICalculate_Prompt,1,true,25
DETECT_ANOMALIES,MASTERCARD,AI_BUILDER_PROMPT,PRF_Anomaly_Prompt,1,true,30
ANALYZE_ATTRIBUTION,MASTERCARD,AI_BUILDER_PROMPT,PRF_Attribution_Prompt,1,true,45
MEASURE_INCREMENTALITY,MASTERCARD,AI_BUILDER_PROMPT,PRF_Incrementality_Prompt,1,true,30
RECOMMEND_OPTIMIZATION,MASTERCARD,AI_BUILDER_PROMPT,PRF_Optimize_Prompt,1,true,35
CLASSIFY_INTENT,MASTERCARD,AI_BUILDER_PROMPT,ORC_Intent_Prompt,1,true,15
VALIDATE_GATE,MASTERCARD,DATAVERSE_LOGIC,MPA_ValidateGate_Flow,1,true,10
GENERATE_DOCUMENT,MASTERCARD,AI_BUILDER_PROMPT,DOC_Generate_Prompt,1,true,60
SELECT_TEMPLATE,MASTERCARD,AI_BUILDER_PROMPT,DOC_TemplateSelect_Prompt,1,true,20
FORMAT_EXPORT,MASTERCARD,DATAVERSE_LOGIC,MPA_FormatExport_Flow,1,true,30
```

### 5.5 Verify Dataverse Deployment

```bash
# Verify table record counts
echo "Verifying deployment..."

pac data export --table eap_agent --json | jq '. | length'
# Expected: 7 agents

pac data export --table eap_capability --json | jq '. | length'
# Expected: 25+ capabilities

pac data export --table eap_capability_implementation --json | jq '. | length'
# Expected: 26 implementations

pac data export --table mpa_channel --json | jq '. | length'
# Expected: 43 channels

pac data export --table mpa_vertical --json | jq '. | length'
# Expected: 15 verticals

pac data export --table mpa_benchmark --json | jq '. | length'
# Expected: 708+ benchmarks
```

---

## PART 6: SHAREPOINT CONFIGURATION

### 6.1 Create SharePoint Site (If Not Exists)

```powershell
# Connect to SharePoint Admin
Connect-PnPOnline `
  -Url "https://[mastercard-tenant]-admin.sharepoint.com" `
  -Interactive

# Create MPA site
New-PnPSite `
  -Type TeamSite `
  -Title "MPA" `
  -Alias "MPA" `
  -Description "Media Planning Agent Knowledge Base"

# Wait for site creation
Start-Sleep -Seconds 60
```

### 6.2 Create Document Library and Folder Structure

```powershell
# Connect to MPA site
Connect-PnPOnline `
  -Url "https://[mastercard-tenant].sharepoint.com/sites/MPA" `
  -Interactive

# Create document library
New-PnPList `
  -Title "MPAKnowledgeBase" `
  -Template DocumentLibrary `
  -Url "MPAKnowledgeBase"

# Create folder structure
$folders = @(
    "EAP",
    "Agents/ORC",
    "Agents/ANL",
    "Agents/AUD",
    "Agents/CHA",
    "Agents/SPO",
    "Agents/DOC",
    "Agents/PRF",
    "Agents/CST",
    "Agents/CHG"
)

foreach ($folder in $folders) {
    Add-PnPFolder `
      -Name $folder `
      -Folder "MPAKnowledgeBase" `
      -ErrorAction SilentlyContinue
}

Write-Host "Folder structure created successfully"
```

### 6.3 Upload KB Files

```powershell
# deploy/mastercard/upload_kb.ps1

param(
    [string]$RootDir = "..",
    [string]$SiteUrl = "https://[mastercard-tenant].sharepoint.com/sites/MPA",
    [string]$Library = "MPAKnowledgeBase"
)

# Connect to SharePoint
Connect-PnPOnline -Url $SiteUrl -Interactive

# Upload EAP shared KB files
$eapFiles = Get-ChildItem "$RootDir/base/platform/eap/kb/*.txt"
foreach ($file in $eapFiles) {
    Write-Host "Uploading $($file.Name) to EAP/"
    Add-PnPFile `
      -Path $file.FullName `
      -Folder "$Library/EAP" `
      -ErrorAction SilentlyContinue
}

# Upload agent-specific KB files
$agents = @("orc", "anl", "aud", "cha", "spo", "doc", "prf", "cst", "chg")

foreach ($agent in $agents) {
    $agentUpper = $agent.ToUpper()
    $agentPath = "$RootDir/base/agents/$agent/kb"
    
    if (Test-Path $agentPath) {
        $files = Get-ChildItem "$agentPath/*.txt"
        foreach ($file in $files) {
            Write-Host "Uploading $($file.Name) to Agents/$agentUpper/"
            Add-PnPFile `
              -Path $file.FullName `
              -Folder "$Library/Agents/$agentUpper" `
              -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ""
Write-Host "KB upload complete!"
```

### 6.4 KB File Inventory

| Folder | Files | Total Size |
|--------|-------|------------|
| EAP/ | 6 files | ~120K chars |
| Agents/ORC/ | 1 file | ~25K chars |
| Agents/ANL/ | 5 files | ~100K chars |
| Agents/AUD/ | 5 files | ~100K chars |
| Agents/CHA/ | 4 files | ~80K chars |
| Agents/SPO/ | 3 files | ~60K chars |
| Agents/DOC/ | 2 files | ~40K chars |
| Agents/PRF/ | 4 files | ~80K chars |
| Agents/CST/ | 3 files | ~60K chars |
| Agents/CHG/ | 3 files | ~60K chars |
| **TOTAL** | **36 files** | **~725K chars** |

### 6.5 Verify KB Upload

```powershell
# Get all files in library
$allFiles = Get-PnPListItem `
  -List "MPAKnowledgeBase" `
  -Fields "FileLeafRef","FileDirRef"

# Count files by folder
$allFiles | Group-Object { $_.FieldValues.FileDirRef } | 
    Select-Object Name, Count | 
    Format-Table
```

### 6.6 Note SharePoint URLs

Record these URLs for Copilot Studio configuration:

```
EAP Shared KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/EAP

ORC KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/ORC

ANL KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/ANL

AUD KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/AUD

CHA KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/CHA

SPO KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/SPO

DOC KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/DOC

PRF KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/PRF

CST KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/CST

CHG KB:
https://[mastercard-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/CHG
```

---

## PART 7: AI BUILDER PROMPT DEPLOYMENT

### 7.1 AI Builder Prompt Inventory

**CRITICAL: AI Builder is the PRIMARY computation layer for Mastercard environment.**

| Agent | Prompt Name | Purpose |
|-------|-------------|---------|
| ANL | ANL_MarginalReturn_Prompt | Calculate marginal return on budget allocation |
| ANL | ANL_ScenarioCompare_Prompt | Compare multiple budget scenarios |
| ANL | ANL_Projection_Prompt | Generate performance projections |
| ANL | ANL_Confidence_Prompt | Calculate confidence intervals |
| ANL | ANL_Bayesian_Prompt | Apply Bayesian inference |
| ANL | ANL_Causal_Prompt | Analyze causality and incrementality |
| AUD | AUD_SegmentPriority_Prompt | Prioritize audience segments |
| AUD | AUD_LTVAssess_Prompt | Assess lifetime value |
| AUD | AUD_Propensity_Prompt | Score conversion propensity |
| AUD | AUD_JourneyState_Prompt | Analyze customer journey state |
| AUD | AUD_Identity_Prompt | Resolve identity across data |
| CHA | CHA_ChannelMix_Prompt | Optimize channel mix |
| CHA | CHA_ChannelSelect_Prompt | Select channels for objectives |
| CHA | CHA_EmergingAssess_Prompt | Assess emerging channels |
| SPO | SPO_FeeWaterfall_Prompt | Calculate programmatic fee waterfall |
| SPO | SPO_PartnerScore_Prompt | Score partner quality |
| SPO | SPO_NBICalculate_Prompt | Calculate net bidder impact |
| PRF | PRF_Anomaly_Prompt | Detect performance anomalies |
| PRF | PRF_Attribution_Prompt | Analyze attribution |
| PRF | PRF_Incrementality_Prompt | Measure incrementality |
| PRF | PRF_Optimize_Prompt | Generate optimization recommendations |
| DOC | DOC_Generate_Prompt | Generate documents |
| DOC | DOC_TemplateSelect_Prompt | Select document templates |
| ORC | ORC_Intent_Prompt | Classify user intent |
| CST | CST_Framework_Prompt | Recommend frameworks |
| CHG | CHG_Readiness_Prompt | Assess change readiness |

### 7.2 Create AI Builder Prompts

**Method 1: Solution Export/Import (Recommended)**

```bash
# Export prompts from Personal environment
pac auth select --name "Aragorn-AI"
pac solution export \
  --path ./deploy/MPA_v6_AIBuilder.zip \
  --name MPA_v6_AIBuilder_Prompts \
  --managed false

# Import to Mastercard environment
pac auth select --name "Mastercard"
pac solution import \
  --path ./deploy/MPA_v6_AIBuilder.zip \
  --activate-plugins true
```

**Method 2: Manual Creation (If Solution Import Fails)**

For each prompt, navigate to:
1. Go to: `https://make.powerapps.com`
2. Select Mastercard environment
3. Navigate to **AI Builder** > **Explore** > **Custom prompts**
4. Click **Create custom prompt**

**Example: ANL_MarginalReturn_Prompt**

```yaml
Name: ANL_MarginalReturn_Prompt
Description: Calculates marginal return for budget allocation decisions

System Message: |
  You are an expert marketing analytics specialist. Calculate the marginal return 
  for a budget allocation scenario. Use logarithmic response curves to model 
  diminishing returns. Provide confidence intervals for your estimates.
  
  Always output valid JSON in this exact format:
  {
    "marginal_return": <number>,
    "confidence_level": "HIGH|MEDIUM|LOW",
    "confidence_interval": {"low": <number>, "high": <number>},
    "saturation_pct": <number>,
    "recommendation": "<string>",
    "methodology": "<string>"
  }

User Message Template: |
  Calculate marginal return for:
  Channel: {{channel}}
  Current Budget: ${{current_budget}}
  Proposed Increase: ${{proposed_increase}}
  Vertical: {{vertical}}
  Historical Performance: {{historical_data}}

Temperature: 0.1
Max Tokens: 1000

Input Parameters:
- channel (Text, Required)
- current_budget (Number, Required)
- proposed_increase (Number, Required)
- vertical (Text, Required)
- historical_data (Text, Optional)
```

### 7.3 Verify AI Builder Prompts

```bash
# List all AI Builder prompts
pac ai-builder list --type custom-prompt

# Test a specific prompt
pac ai-builder test \
  --name "ANL_MarginalReturn_Prompt" \
  --input '{"channel":"Paid Search","current_budget":50000,"proposed_increase":10000,"vertical":"Retail"}'
```

---

## PART 8: POWER AUTOMATE FLOW DEPLOYMENT

### 8.1 Flow Inventory for Mastercard

**CRITICAL: Only deploy these flows (no HTTP/Azure Function flows):**

| Flow Name | Purpose | Connectors Used |
|-----------|---------|-----------------|
| MPA_Capability_Dispatcher | Route capability requests | Dataverse, AI Builder |
| MPA_Impl_AIBuilder | Execute AI Builder prompts | AI Builder |
| MPA_Impl_DataverseLogic | Execute Dataverse queries | Dataverse |
| MPA_Session_Manager | Manage session lifecycle | Dataverse |
| MPA_Telemetry_Logger | Log all interactions | Dataverse |

**DO NOT DEPLOY THESE (Personal environment only):**
- MPA_Impl_AzureFunction
- MPA_Impl_HTTPEndpoint

### 8.2 Deploy Flows via Solution

```bash
# Export core flows from Personal (without Azure/HTTP flows)
pac auth select --name "Aragorn-AI"
pac solution export \
  --path ./deploy/MPA_v6_Flows_Core.zip \
  --name MPA_v6_Platform_Flows_Core \
  --managed false

# Import to Mastercard
pac auth select --name "Mastercard"
pac solution import \
  --path ./deploy/MPA_v6_Flows_Core.zip \
  --activate-plugins true
```

### 8.3 Flow Configurations

**Flow: MPA_Capability_Dispatcher**

```yaml
Trigger: When called from Copilot

Input Parameters:
  - capability_code (Text)
  - session_id (Text)
  - request_id (Text)
  - inputs (Object)

Process:
  1. Query eap_capability_implementation
     - Filter: capability_code = @capability_code
     - Filter: environment_code = "MASTERCARD"
     - Filter: is_enabled = true
     - Sort: priority_order ascending
     - Top: 1
  
  2. Get implementation details:
     - implementation_type
     - implementation_reference
     - timeout_seconds
  
  3. Route based on implementation_type:
     - AI_BUILDER_PROMPT → Call MPA_Impl_AIBuilder
     - DATAVERSE_LOGIC → Call MPA_Impl_DataverseLogic
  
  4. Return result

Output:
  - status (success/error)
  - result (Object)
  - execution_time_ms (Number)
```

**Flow: MPA_Impl_AIBuilder**

```yaml
Trigger: When called (from MPA_Capability_Dispatcher)

Input Parameters:
  - prompt_name (Text)
  - inputs_json (Text)
  - timeout_seconds (Number)

Process:
  1. Lookup prompt configuration from eap_prompt
  2. Construct prompt with input variables
  3. Call AI Builder Custom Prompt action
  4. Parse JSON response
  5. Validate against output schema

Output:
  - result_json (Text)
  - confidence_level (Text)
```

### 8.4 Verify Flow Deployment

```bash
# List deployed flows
pac solution list

# Check flow connections
# Navigate to Power Automate portal and verify:
# 1. All flows show "On" status
# 2. No connection errors
# 3. All connectors are Dataverse/AI Builder only
```

---

## PART 9: COPILOT STUDIO AGENT DEPLOYMENT

### 9.1 Agent Inventory

| Agent Code | Display Name | Purpose |
|------------|--------------|---------|
| ORC | MPA v6 Orchestrator | Route requests to specialist agents |
| ANL | MPA v6 Analytics Agent | Budget projections, scenarios, calculations |
| AUD | MPA v6 Audience Agent | Segmentation, LTV, journey analysis |
| CHA | MPA v6 Channel Agent | Channel selection, mix optimization |
| SPO | MPA v6 Supply Path Agent | Programmatic optimization |
| DOC | MPA v6 Document Agent | Document generation |
| PRF | MPA v6 Performance Agent | Attribution, anomaly detection |
| CST | MPA v6 Strategy Agent | Framework selection, strategic analysis |
| CHG | MPA v6 Change Agent | Change readiness, stakeholder mapping |

### 9.2 Create Agents via CLI

```bash
# Create ORC Agent
pac copilot create \
  --name "MPA_v6_Orchestrator" \
  --display-name "MPA v6 Orchestrator" \
  --description "Routes media planning requests to specialist agents" \
  --language "en-US"

# Create ANL Agent
pac copilot create \
  --name "MPA_v6_Analytics_Agent" \
  --display-name "MPA v6 Analytics Agent" \
  --description "Budget projections, scenario analysis, statistical calculations" \
  --language "en-US"

# Create AUD Agent
pac copilot create \
  --name "MPA_v6_Audience_Agent" \
  --display-name "MPA v6 Audience Agent" \
  --description "Audience segmentation, LTV modeling, journey orchestration" \
  --language "en-US"

# Create CHA Agent
pac copilot create \
  --name "MPA_v6_Channel_Agent" \
  --display-name "MPA v6 Channel Agent" \
  --description "Channel selection, mix optimization, benchmarking" \
  --language "en-US"

# Create SPO Agent
pac copilot create \
  --name "MPA_v6_Supply_Path_Agent" \
  --display-name "MPA v6 Supply Path Agent" \
  --description "Programmatic optimization, fee analysis, partner evaluation" \
  --language "en-US"

# Create DOC Agent
pac copilot create \
  --name "MPA_v6_Document_Agent" \
  --display-name "MPA v6 Document Agent" \
  --description "Generate media briefs, reports, and presentations" \
  --language "en-US"

# Create PRF Agent
pac copilot create \
  --name "MPA_v6_Performance_Agent" \
  --display-name "MPA v6 Performance Agent" \
  --description "Attribution analysis, anomaly detection, optimization" \
  --language "en-US"

# Create CST Agent
pac copilot create \
  --name "MPA_v6_Strategy_Agent" \
  --display-name "MPA v6 Strategy Agent" \
  --description "Framework selection, strategic analysis, prioritization" \
  --language "en-US"

# Create CHG Agent
pac copilot create \
  --name "MPA_v6_Change_Agent" \
  --display-name "MPA v6 Change Agent" \
  --description "Change readiness, stakeholder mapping, adoption planning" \
  --language "en-US"
```

### 9.3 Configure Agent Instructions

For each agent, upload the instruction file from the repository:

```bash
# Location of instruction files
base/agents/[agent]/instructions/[AGENT]_Copilot_Instructions_v1.txt
```

**Example: ANL Agent Instructions (Summary)**

```
IDENTITY AND PURPOSE
You are the Analytics Agent (ANL) for the Media Planning Agent platform.
You specialize in quantitative analysis, budget optimization, statistical 
methods, and performance forecasting.

CAPABILITIES
You execute these capabilities by calling Power Automate flows:

1. CALCULATE_MARGINAL_RETURN - Estimate marginal return for budget allocation
   Flow: MPA_Capability_Dispatcher
   Capability Code: CALCULATE_MARGINAL_RETURN

2. COMPARE_SCENARIOS - Compare multiple budget scenarios
   Flow: MPA_Capability_Dispatcher
   Capability Code: COMPARE_SCENARIOS

3. GENERATE_PROJECTIONS - Forecast campaign performance
   Flow: MPA_Capability_Dispatcher
   Capability Code: GENERATE_PROJECTIONS

ANALYTICAL PRINCIPLES
- Apply diminishing returns modeling
- Always communicate uncertainty with confidence intervals
- Distinguish correlation from causation
- Challenge ROAS as primary KPI when appropriate
```

### 9.4 Configure Knowledge Sources

For each agent, add SharePoint knowledge sources:

```
# In Copilot Studio UI:
1. Open agent
2. Navigate to Knowledge tab
3. Click "Add knowledge"
4. Select "SharePoint"
5. Browse to appropriate folders
6. Click "Add"
7. Wait for indexing

# Knowledge configuration per agent:
ORC: EAP/ + Agents/ORC/
ANL: EAP/ + Agents/ANL/
AUD: EAP/ + Agents/AUD/
CHA: EAP/ + Agents/CHA/
SPO: EAP/ + Agents/SPO/
DOC: EAP/ + Agents/DOC/
PRF: EAP/ + Agents/PRF/
CST: EAP/ + Agents/CST/
CHG: EAP/ + Agents/CHG/
```

---

## PART 10: TOPIC CONFIGURATION

### 10.1 Topic Structure Per Agent

Each agent requires 3-5 topics:

| Topic Type | Purpose | Trigger |
|------------|---------|---------|
| Primary | Main capability execution | Trigger phrases |
| Secondary | Additional capabilities | Trigger phrases |
| Fallback | Handle unknown intents | OnUnknownIntent |
| Routing | Route to other agents | Agent-specific phrases |

### 10.2 ANL Agent Topics

**Topic: CalculateProjection**
```yaml
Name: CalculateProjection
Display Name: Calculate Projection
Trigger Phrases:
  - "Calculate projection"
  - "Project performance"
  - "Forecast campaign"
  - "What will happen if"
  - "Estimate results"

Nodes:
  - Question: "What is your total budget?"
    Variable: Topic.Budget
  - Question: "Campaign duration in weeks?"
    Variable: Topic.Duration
  - Question: "Which channels are you considering?"
    Variable: Topic.Channels
  - Action: Call MPA_Capability_Dispatcher
    Capability: GENERATE_PROJECTIONS
  - Message: Display results
```

**Topic: RunScenario**
```yaml
Name: RunScenario
Display Name: Run Scenario Analysis
Trigger Phrases:
  - "Compare scenarios"
  - "Run scenario"
  - "What if analysis"
  - "Budget comparison"

Nodes:
  - Question: "Describe your scenarios"
    Variable: Topic.Scenarios
  - Question: "What is your total budget?"
    Variable: Topic.Budget
  - Action: Call MPA_Capability_Dispatcher
    Capability: COMPARE_SCENARIOS
  - Message: Display comparison
```

**Topic: Fallback**
```yaml
Name: Fallback
Trigger: OnUnknownIntent
Nodes:
  - Message: "I can help with analytics and calculations..."
```

### 10.3 Create Topics via Solution Import

```bash
# Export topics from Personal environment
pac auth select --name "Aragorn-AI"
pac solution export \
  --path ./deploy/MPA_v6_Topics.zip \
  --name MPA_v6_Copilot_Topics \
  --managed false

# Import to Mastercard
pac auth select --name "Mastercard"
pac solution import \
  --path ./deploy/MPA_v6_Topics.zip
```

---

## PART 11: VALIDATION TESTING

### 11.1 Pre-Deployment Checklist

```
[ ] Dataverse tables created (14 tables)
[ ] Seed data loaded (7+ records in eap_agent)
[ ] SharePoint KB uploaded (36 files)
[ ] AI Builder prompts created (26 prompts)
[ ] Power Automate flows deployed (5 flows)
[ ] Copilot agents created (9 agents)
[ ] Topics configured (40+ topics)
[ ] Knowledge sources linked
```

### 11.2 Routing Tests

```bash
# Test routing from ORC to specialist agents

# Test 1: Route to ANL
echo "Test: Budget allocation query"
# Input: "What's the optimal budget allocation for a $500K campaign?"
# Expected: Routes to ANL agent

# Test 2: Route to AUD
echo "Test: Audience segmentation query"
# Input: "Which customer segments should I target?"
# Expected: Routes to AUD agent

# Test 3: Route to CHA
echo "Test: Channel selection query"
# Input: "Which channels work best for retail?"
# Expected: Routes to CHA agent

# Test 4: Route to PRF
echo "Test: Performance analysis query"
# Input: "Why did last week's performance drop?"
# Expected: Routes to PRF agent
```

### 11.3 Capability Execution Tests

```bash
# Test each capability with valid inputs

# Test CALCULATE_MARGINAL_RETURN
curl -X POST \
  "https://[flow-url]/api/MPA_Capability_Dispatcher" \
  -H "Content-Type: application/json" \
  -d '{
    "capability_code": "CALCULATE_MARGINAL_RETURN",
    "session_id": "test-001",
    "inputs": {
      "channel": "Paid Search",
      "current_budget": 50000,
      "proposed_increase": 10000,
      "vertical": "Retail"
    }
  }'

# Expected response:
# {
#   "status": "success",
#   "result": {
#     "marginal_return": 1.15,
#     "confidence_level": "MEDIUM",
#     ...
#   }
# }
```

### 11.4 End-to-End Test Scenarios

**Scenario 1: Complete Media Planning Flow**
```
1. User: "I need to plan a $500K campaign for retail"
2. ORC routes to appropriate agent
3. Agent collects information via topic questions
4. Capabilities execute via AI Builder
5. Results returned with confidence levels
```

**Scenario 2: Document Generation**
```
1. User: "Generate a media brief for my campaign"
2. DOC agent invoked
3. DOC_Generate_Prompt executes
4. Document returned in requested format
```

### 11.5 Mastercard-Specific Validation

**CRITICAL: Verify no DLP violations:**

```bash
# Check flow connections
# All flows should ONLY use:
# - Microsoft Dataverse
# - AI Builder
# - Office 365 (if needed)

# Verify NO flows use:
# - HTTP connector
# - Custom connectors
# - Azure Functions
# - Any external APIs
```

---

## PART 12: TROUBLESHOOTING

### 12.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `pac auth` fails | Token expired | `pac auth clear` then `pac auth create` |
| Dataverse import fails | Schema mismatch | Verify table schema matches seed columns |
| AI Builder prompt fails | Rate limiting | Wait and retry, check quota |
| Flow fails | DLP violation | Remove HTTP/custom connector actions |
| KB not indexing | File too large | Split files under 36K chars |
| Agent not responding | Knowledge not linked | Re-add SharePoint knowledge source |

### 12.2 Debug Commands

```bash
# Check current auth
pac org who

# List solutions
pac solution list

# Check flow run history
# Navigate to Power Automate portal

# Check AI Builder quota
# Navigate to AI Builder in Power Apps

# View Dataverse errors
pac data export --table eap_telemetry --filter "statecode eq 1"
```

### 12.3 DLP Verification

```bash
# In Power Platform Admin Center:
# 1. Go to Environments > Mastercard
# 2. Click "Policies"
# 3. Verify DLP policies are active
# 4. Check blocked connectors list includes HTTP

# Verify flows comply:
# 1. Open each flow in Power Automate
# 2. Click "Flow checker"
# 3. Verify no DLP warnings
```

---

## PART 13: ROLLBACK PROCEDURES

### 13.1 Dataverse Rollback

```bash
# Delete and reimport seed data
pac data delete --table eap_capability_implementation

# Reimport from backup
pac data import \
  --data ./backup/eap_capability_impl_mastercard_backup.csv \
  --table eap_capability_implementation
```

### 13.2 Solution Rollback

```bash
# Delete current solution
pac solution delete --solution-name MPA_v6_Platform

# Import previous version
pac solution import \
  --path ./backup/MPA_v6_Platform_previous.zip
```

### 13.3 Full Environment Reset

```bash
# WARNING: Only use if complete reset needed

# 1. Delete all MPA solutions
pac solution delete --solution-name MPA_v6_AIBuilder_Prompts
pac solution delete --solution-name MPA_v6_Platform_Flows_Core
pac solution delete --solution-name MPA_v6_Copilot_Agents

# 2. Delete Dataverse data (in reverse dependency order)
pac data delete --table mpa_session_step
pac data delete --table mpa_session
pac data delete --table eap_telemetry
pac data delete --table eap_capability_implementation
pac data delete --table eap_capability
pac data delete --table eap_agent

# 3. Reimport everything
./deploy/mastercard/deploy_all.sh
```

---

## APPENDIX A: COMPLETE DEPLOYMENT SCRIPT

```bash
#!/bin/bash
# deploy/mastercard/deploy_all.sh
# Complete MPA v6.0 Mastercard Deployment

set -e

echo "=========================================="
echo "MPA v6.0 MASTERCARD FULL DEPLOYMENT"
echo "=========================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Step 1: Verify prerequisites
echo "Step 1: Verifying prerequisites..."
pac --version || { echo "pac CLI not found"; exit 1; }
node --version || { echo "Node.js not found"; exit 1; }

# Step 2: Select Mastercard environment
echo ""
echo "Step 2: Selecting Mastercard environment..."
pac auth select --name "Mastercard"
pac org who

# Step 3: Deploy Dataverse
echo ""
echo "Step 3: Deploying Dataverse schema and seed data..."
$SCRIPT_DIR/deploy_dataverse.sh

# Step 4: Upload KB files
echo ""
echo "Step 4: Uploading KB files to SharePoint..."
pwsh $SCRIPT_DIR/upload_kb.ps1 -RootDir "$ROOT_DIR"

# Step 5: Import AI Builder prompts
echo ""
echo "Step 5: Importing AI Builder prompts..."
pac solution import \
  --path "$SCRIPT_DIR/solutions/MPA_v6_AIBuilder.zip" \
  --activate-plugins true

# Step 6: Import flows
echo ""
echo "Step 6: Importing Power Automate flows..."
pac solution import \
  --path "$SCRIPT_DIR/solutions/MPA_v6_Flows_Core.zip" \
  --activate-plugins true

# Step 7: Import Copilot agents
echo ""
echo "Step 7: Importing Copilot agents..."
pac solution import \
  --path "$SCRIPT_DIR/solutions/MPA_v6_Copilots.zip"

# Step 8: Run validation tests
echo ""
echo "Step 8: Running validation tests..."
$SCRIPT_DIR/run_tests.sh

echo ""
echo "=========================================="
echo "DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify agents in Copilot Studio"
echo "2. Link knowledge sources to agents"
echo "3. Run end-to-end tests"
echo "4. Publish agents"
```

---

## APPENDIX B: ENVIRONMENT CONFIGURATION

**File: environments/mastercard/config/environment_config.json**

```json
{
  "environment": {
    "code": "MASTERCARD",
    "name": "Mastercard Managed",
    "dataverseUrl": "https://[mastercard-org-id].crm.dynamics.com",
    "sharePointUrl": "https://[mastercard-tenant].sharepoint.com/sites/MPA"
  },
  "capabilities": {
    "httpConnector": false,
    "azureFunctions": false,
    "customConnectors": false
  },
  "functionApp": null,
  "aiBuilder": {
    "enabled": true,
    "fallbackOnly": false
  },
  "features": {
    "advancedAnalytics": true,
    "realTimeOptimization": false,
    "experimentalFeatures": false
  },
  "dlp": {
    "enabled": true,
    "approvedConnectors": [
      "Microsoft Dataverse",
      "AI Builder",
      "SharePoint",
      "Office 365"
    ]
  }
}
```

---

## APPENDIX C: QUICK REFERENCE

### Command Reference

```bash
# Authentication
pac auth create --name "Mastercard" --environment "[url]"
pac auth select --name "Mastercard"
pac auth list
pac org who

# Dataverse
pac data import --data [file.csv] --table [table_name]
pac data export --table [table_name] --json

# Solutions
pac solution import --path [file.zip]
pac solution export --path [file.zip] --name [solution_name]
pac solution list

# Copilot
pac copilot create --name [name] --display-name [display]
pac copilot list
```

### File Paths

```
Repository: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
Branch: deploy/mastercard

Instructions: base/agents/[agent]/instructions/
KB Files: base/agents/[agent]/kb/
Seed Data: base/dataverse/seed/
MC Seed: environments/mastercard/seed/
Deploy Scripts: deploy/mastercard/
```

### URLs

```
Power Platform Admin: https://admin.powerplatform.microsoft.com
Power Apps: https://make.powerapps.com
Power Automate: https://make.powerautomate.com
Copilot Studio: https://copilotstudio.microsoft.com
SharePoint: https://[mastercard-tenant].sharepoint.com/sites/MPA
```

---

**Document Version:** 1.0  
**Created:** January 19, 2026  
**Author:** Claude  
**Status:** Ready for Execution
