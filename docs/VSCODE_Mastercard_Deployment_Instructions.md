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
