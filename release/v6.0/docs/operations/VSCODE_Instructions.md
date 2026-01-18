# MPA v6.0 VS Code Implementation Instructions

**Document:** VSCODE_Instructions.md  
**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Implementation Ready  
**Purpose:** Complete instructions for VS Code Claude to set up repository structure, deploy Dataverse schema, configure flows, and manage deployments for both Mastercard and Personal environments

---

## TABLE OF CONTENTS

1. [Overview](#part-1-overview)
2. [Pre-Requisites](#part-2-pre-requisites)
3. [Repository Setup](#part-3-repository-setup)
4. [Dataverse Deployment](#part-4-dataverse-deployment)
5. [Flow Deployment](#part-5-flow-deployment)
6. [SharePoint Configuration](#part-6-sharepoint-configuration)
7. [AI Builder Deployment](#part-7-ai-builder-deployment)
8. [Azure Functions Deployment](#part-8-azure-functions-deployment)
9. [Copilot Agent Configuration](#part-9-copilot-agent-configuration)
10. [Environment-Specific Configuration](#part-10-environment-specific-configuration)
11. [Testing and Validation](#part-11-testing-and-validation)
12. [Git Workflow](#part-12-git-workflow)
13. [Troubleshooting](#part-13-troubleshooting)

---

## PART 1: OVERVIEW

### 1.1 Scope

This document provides complete instructions for VS Code Claude to:

1. Set up the repository structure for MPA v6.0
2. Deploy Dataverse schema and seed data
3. Configure Power Automate flows
4. Deploy AI Builder prompts
5. Deploy Azure Functions (Personal environment only)
6. Configure Copilot Studio agents
7. Manage deployments across both environments

### 1.2 Environment Summary

| Environment | Identifier | Capabilities |
|-------------|------------|--------------|
| Personal | Aragorn AI | Full Azure access, HTTP connector, Azure Functions |
| Mastercard | Mastercard Managed | AI Builder only, no HTTP, DLP-restricted |

### 1.3 Document Dependencies

Read these documents before proceeding:
- **MPA_v6_Architecture_Final.md** - Complete architecture specification
- **MPA_v6_Dataverse_Schema.md** - Database schema details
- **MPA_v6_AI_Builder_Prompts.md** - Prompt specifications
- **MPA_v6_Azure_Functions.md** - Function specifications (Personal only)

---

## PART 2: PRE-REQUISITES

### 2.1 Required Tools

```bash
# Verify installations
node --version    # v18+ required
npm --version     # v9+ required
pac --version     # Power Platform CLI (latest)
az --version      # Azure CLI (latest)
func --version    # Azure Functions Core Tools v4
git --version     # Git (latest)
python --version  # Python 3.11+ (for Azure Functions)
```

### 2.2 Install Missing Tools

```bash
# Power Platform CLI
npm install -g pac-cli

# Azure CLI (macOS)
brew install azure-cli

# Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Python dependencies for Functions
pip install azure-functions numpy scipy pandas scikit-learn pydantic
```

### 2.3 Authentication Setup

```bash
# Authenticate to Power Platform (Personal)
pac auth create --environment "https://aragorn-ai.crm.dynamics.com"

# Authenticate to Power Platform (Mastercard)  
pac auth create --environment "https://mastercard.crm.dynamics.com"

# List auth profiles
pac auth list

# Switch between profiles
pac auth select --index 1  # Personal
pac auth select --index 2  # Mastercard

# Azure CLI login
az login
az account set --subscription "Your-Subscription-ID"
```

### 2.4 Verify Access

```bash
# Test Dataverse connection
pac org who

# Test Azure access
az account show

# List available environments
pac admin list --json
```

---

## PART 3: REPOSITORY SETUP

### 3.1 Clone and Initialize

```bash
# Clone repository
cd ~/Projects
git clone https://github.com/kessel-digital/Kessel-Digital-Agent-Platform.git
cd Kessel-Digital-Agent-Platform

# Verify branch
git branch -a
git checkout main
git pull origin main

# Create v6.0 feature branch if not exists
git checkout -b feature/v6.0-implementation
```

### 3.2 Create Directory Structure

```bash
# Create base directory structure
mkdir -p base/agents/{orc,anl,aud,cha,spo,doc,prf}/{instructions,kb,flows,tests}
mkdir -p base/platform/eap/{kb,prompts,flows}
mkdir -p base/dataverse/{schema,seed}
mkdir -p base/tests/scenarios

# Create environment-specific directories
mkdir -p environments/mastercard/{seed,config}
mkdir -p environments/personal/{flows,functions,seed,config}

# Create deployment directories
mkdir -p deploy/{mastercard,personal}

# Create documentation directory
mkdir -p docs/architecture
```

### 3.3 Verify Structure

```bash
# Display tree structure
find . -type d -name ".git" -prune -o -type d -print | head -50
```

Expected output:
```
.
./base
./base/agents
./base/agents/orc
./base/agents/orc/instructions
./base/agents/orc/kb
./base/agents/orc/flows
./base/agents/orc/tests
./base/agents/anl
./base/agents/anl/instructions
./base/agents/anl/kb
./base/agents/anl/flows
./base/agents/anl/tests
./base/agents/aud
./base/agents/aud/instructions
./base/agents/aud/kb
./base/agents/aud/flows
./base/agents/aud/tests
./base/agents/cha
./base/agents/cha/instructions
./base/agents/cha/kb
./base/agents/cha/flows
./base/agents/cha/tests
./base/agents/spo
./base/agents/spo/instructions
./base/agents/spo/kb
./base/agents/spo/flows
./base/agents/spo/tests
./base/agents/doc
./base/agents/doc/instructions
./base/agents/doc/kb
./base/agents/doc/flows
./base/agents/doc/tests
./base/agents/prf
./base/agents/prf/instructions
./base/agents/prf/kb
./base/agents/prf/flows
./base/agents/prf/tests
./base/platform
./base/platform/eap
./base/platform/eap/kb
./base/platform/eap/prompts
./base/platform/eap/flows
./base/dataverse
./base/dataverse/schema
./base/dataverse/seed
./base/tests
./base/tests/scenarios
./environments
./environments/mastercard
./environments/mastercard/seed
./environments/mastercard/config
./environments/personal
./environments/personal/flows
./environments/personal/functions
./environments/personal/seed
./environments/personal/config
./deploy
./deploy/mastercard
./deploy/personal
./docs
./docs/architecture
```

### 3.4 Create Placeholder Files

```bash
# Create .gitkeep files to preserve empty directories
find . -type d -empty -exec touch {}/.gitkeep \;

# Create README files
echo "# MPA v6.0 Base Components" > base/README.md
echo "# Environment-Specific Configurations" > environments/README.md
echo "# Deployment Scripts and Artifacts" > deploy/README.md
echo "# Architecture Documentation" > docs/README.md
```

### 3.5 Initial Commit

```bash
git add -A
git commit -m "feat(v6): Initialize repository structure for MPA v6.0

- Create base/ directory for shared components
- Create environments/ for Mastercard and Personal configs
- Create deploy/ for deployment artifacts
- Structure supports 7 agents + EAP shared layer
- Ready for Dataverse schema and KB content"

git push origin feature/v6.0-implementation
```

---

## PART 4: DATAVERSE DEPLOYMENT

### 4.1 Create Schema Definition Files

Create the schema definition for each table. These will be used by `pac` CLI to create tables.

**File: base/dataverse/schema/eap_agent.json**
```json
{
  "logicalName": "eap_agent",
  "displayName": "EAP Agent",
  "description": "Agent registry for MPA multi-agent system",
  "primaryNameAttribute": "eap_agent_name",
  "attributes": [
    {
      "logicalName": "eap_agent_code",
      "displayName": "Agent Code",
      "type": "String",
      "maxLength": 10,
      "isRequired": true
    },
    {
      "logicalName": "eap_agent_name",
      "displayName": "Agent Name",
      "type": "String",
      "maxLength": 100,
      "isRequired": true
    },
    {
      "logicalName": "eap_agent_description",
      "displayName": "Description",
      "type": "Memo",
      "maxLength": 2000
    },
    {
      "logicalName": "eap_capability_tags",
      "displayName": "Capability Tags",
      "type": "Memo",
      "maxLength": 4000,
      "description": "Comma-separated capability tags for routing"
    },
    {
      "logicalName": "eap_required_inputs",
      "displayName": "Required Inputs",
      "type": "Memo",
      "maxLength": 2000,
      "description": "JSON schema of required inputs"
    },
    {
      "logicalName": "eap_fallback_agent",
      "displayName": "Fallback Agent",
      "type": "Lookup",
      "referencedEntity": "eap_agent"
    },
    {
      "logicalName": "eap_status",
      "displayName": "Status",
      "type": "Choice",
      "options": [
        {"value": 1, "label": "Active"},
        {"value": 2, "label": "Deprecated"},
        {"value": 3, "label": "Testing"}
      ]
    },
    {
      "logicalName": "eap_version",
      "displayName": "Version",
      "type": "String",
      "maxLength": 20
    },
    {
      "logicalName": "eap_instruction_char_count",
      "displayName": "Instruction Char Count",
      "type": "Integer"
    }
  ]
}
```

**File: base/dataverse/schema/eap_capability.json**
```json
{
  "logicalName": "eap_capability",
  "displayName": "EAP Capability",
  "description": "Capability definitions for agent routing",
  "primaryNameAttribute": "eap_capability_name",
  "attributes": [
    {
      "logicalName": "eap_capability_code",
      "displayName": "Capability Code",
      "type": "String",
      "maxLength": 100,
      "isRequired": true
    },
    {
      "logicalName": "eap_capability_name",
      "displayName": "Capability Name",
      "type": "String",
      "maxLength": 200,
      "isRequired": true
    },
    {
      "logicalName": "eap_capability_description",
      "displayName": "Description",
      "type": "Memo",
      "maxLength": 2000
    },
    {
      "logicalName": "eap_agent",
      "displayName": "Owner Agent",
      "type": "Lookup",
      "referencedEntity": "eap_agent",
      "isRequired": true
    },
    {
      "logicalName": "eap_input_schema",
      "displayName": "Input Schema",
      "type": "Memo",
      "maxLength": 10000,
      "description": "JSON schema for expected inputs"
    },
    {
      "logicalName": "eap_output_schema",
      "displayName": "Output Schema",
      "type": "Memo",
      "maxLength": 10000,
      "description": "JSON schema for expected outputs"
    },
    {
      "logicalName": "eap_is_active",
      "displayName": "Is Active",
      "type": "Boolean",
      "defaultValue": true
    }
  ]
}
```

**File: base/dataverse/schema/eap_capability_implementation.json**
```json
{
  "logicalName": "eap_capability_implementation",
  "displayName": "EAP Capability Implementation",
  "description": "Implementation mappings per environment",
  "primaryNameAttribute": "eap_implementation_name",
  "attributes": [
    {
      "logicalName": "eap_implementation_name",
      "displayName": "Implementation Name",
      "type": "String",
      "maxLength": 200,
      "isRequired": true
    },
    {
      "logicalName": "eap_capability",
      "displayName": "Capability",
      "type": "Lookup",
      "referencedEntity": "eap_capability",
      "isRequired": true
    },
    {
      "logicalName": "eap_environment_code",
      "displayName": "Environment Code",
      "type": "Choice",
      "options": [
        {"value": 1, "label": "PERSONAL"},
        {"value": 2, "label": "MASTERCARD"}
      ],
      "isRequired": true
    },
    {
      "logicalName": "eap_implementation_type",
      "displayName": "Implementation Type",
      "type": "Choice",
      "options": [
        {"value": 1, "label": "AI_BUILDER_PROMPT"},
        {"value": 2, "label": "AZURE_FUNCTION"},
        {"value": 3, "label": "HTTP_ENDPOINT"},
        {"value": 4, "label": "DATAVERSE_LOGIC"}
      ],
      "isRequired": true
    },
    {
      "logicalName": "eap_implementation_reference",
      "displayName": "Implementation Reference",
      "type": "String",
      "maxLength": 500,
      "description": "Prompt name, Function URL, or Flow GUID"
    },
    {
      "logicalName": "eap_configuration_json",
      "displayName": "Configuration",
      "type": "Memo",
      "maxLength": 10000,
      "description": "Additional configuration JSON"
    },
    {
      "logicalName": "eap_priority_order",
      "displayName": "Priority Order",
      "type": "Integer",
      "defaultValue": 1,
      "description": "Lower = preferred"
    },
    {
      "logicalName": "eap_is_enabled",
      "displayName": "Is Enabled",
      "type": "Boolean",
      "defaultValue": true
    },
    {
      "logicalName": "eap_fallback_implementation",
      "displayName": "Fallback Implementation",
      "type": "Lookup",
      "referencedEntity": "eap_capability_implementation"
    },
    {
      "logicalName": "eap_timeout_seconds",
      "displayName": "Timeout (seconds)",
      "type": "Integer",
      "defaultValue": 30
    }
  ]
}
```

### 4.2 Create Seed Data Files

**File: base/dataverse/seed/eap_agent_seed.csv**
```csv
eap_agent_code,eap_agent_name,eap_agent_description,eap_capability_tags,eap_status,eap_version
ORC,Orchestrator Agent,"Routes requests, manages workflow, validates gates","routing,workflow,session,validation",1,1.0.0
ANL,Analytics Agent,"Projections, calculations, statistical analysis, optimization","analytics,projection,calculation,mmm,bayesian,causal,budget",1,1.0.0
AUD,Audience Agent,"Segmentation, targeting, LTV, propensity, journey orchestration","audience,segmentation,targeting,ltv,propensity,journey,identity",1,1.0.0
CHA,Channel Agent,"Channel selection, allocation, emerging channels","channel,allocation,mix,emerging,brand,performance",1,1.0.0
SPO,Supply Path Agent,"Programmatic optimization, fee analysis, partner evaluation","supply,programmatic,fee,partner,nbi,transparency",1,1.0.0
DOC,Document Agent,"Document generation, templates, export formatting","document,template,export,formatting,docx,pdf,pptx",1,1.0.0
PRF,Performance Agent,"Performance monitoring, anomaly detection, attribution","performance,anomaly,attribution,incrementality,optimization",1,1.0.0
```

**File: base/dataverse/seed/eap_capability_seed.csv**
```csv
eap_capability_code,eap_capability_name,eap_agent_code,eap_capability_description,eap_is_active
CLASSIFY_INTENT,Classify User Intent,ORC,"Determine user intent for routing",true
VALIDATE_GATE,Validate Workflow Gate,ORC,"Check if gate requirements are met",true
CALCULATE_MARGINAL_RETURN,Calculate Marginal Return,ANL,"Estimate marginal return curves for budget allocation",true
COMPARE_SCENARIOS,Compare Scenarios,ANL,"Compare multiple budget allocation scenarios",true
GENERATE_PROJECTIONS,Generate Projections,ANL,"Project campaign performance metrics",true
ASSESS_CONFIDENCE,Assess Confidence,ANL,"Calculate confidence levels for estimates",true
APPLY_BAYESIAN_INFERENCE,Apply Bayesian Inference,ANL,"Update parameter estimates with observed data",true
ANALYZE_CAUSALITY,Analyze Causality,ANL,"Estimate causal effects and incrementality",true
PRIORITIZE_SEGMENTS,Prioritize Segments,AUD,"Rank audience segments by expected value",true
ASSESS_LTV,Assess LTV,AUD,"Evaluate customer lifetime value",true
ANALYZE_JOURNEY_STATE,Analyze Journey State,AUD,"Determine customer journey state",true
SCORE_PROPENSITY,Score Propensity,AUD,"Calculate propensity scores",true
RESOLVE_IDENTITY,Resolve Identity,AUD,"Resolve identity across touchpoints",true
OPTIMIZE_CHANNEL_MIX,Optimize Channel Mix,CHA,"Recommend optimal channel allocation",true
SELECT_CHANNELS,Select Channels,CHA,"Recommend channels for objectives",true
ASSESS_EMERGING_CHANNEL,Assess Emerging Channel,CHA,"Evaluate emerging channel opportunities",true
CALCULATE_FEE_WATERFALL,Calculate Fee Waterfall,SPO,"Calculate programmatic fee decomposition",true
SCORE_PARTNER,Score Partner,SPO,"Evaluate partner quality",true
CALCULATE_NBI,Calculate NBI,SPO,"Compute net bidder impact",true
DETECT_ANOMALIES,Detect Anomalies,PRF,"Identify performance anomalies",true
ANALYZE_ATTRIBUTION,Analyze Attribution,PRF,"Assess attribution across channels",true
MEASURE_INCREMENTALITY,Measure Incrementality,PRF,"Measure incremental impact",true
RECOMMEND_OPTIMIZATION,Recommend Optimization,PRF,"Recommend optimization actions",true
GENERATE_DOCUMENT,Generate Document,DOC,"Generate document content",true
SELECT_TEMPLATE,Select Template,DOC,"Select appropriate template",true
FORMAT_EXPORT,Format Export,DOC,"Format document for export",true
```

**File: environments/personal/seed/eap_capability_impl_personal.csv**
```csv
eap_capability_code,eap_environment_code,eap_implementation_type,eap_implementation_reference,eap_priority_order,eap_is_enabled,eap_timeout_seconds
CALCULATE_MARGINAL_RETURN,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/anl/marginal-return,1,true,30
CALCULATE_MARGINAL_RETURN,PERSONAL,AI_BUILDER_PROMPT,ANL_MarginalReturn_Prompt,2,true,30
COMPARE_SCENARIOS,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/anl/scenario-compare,1,true,45
COMPARE_SCENARIOS,PERSONAL,AI_BUILDER_PROMPT,ANL_ScenarioCompare_Prompt,2,true,45
GENERATE_PROJECTIONS,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/anl/projection,1,true,45
GENERATE_PROJECTIONS,PERSONAL,AI_BUILDER_PROMPT,ANL_Projection_Prompt,2,true,45
ASSESS_CONFIDENCE,PERSONAL,AI_BUILDER_PROMPT,ANL_Confidence_Prompt,1,true,30
APPLY_BAYESIAN_INFERENCE,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/anl/bayesian,1,true,45
APPLY_BAYESIAN_INFERENCE,PERSONAL,AI_BUILDER_PROMPT,ANL_Bayesian_Prompt,2,true,45
ANALYZE_CAUSALITY,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/anl/causal,1,true,45
ANALYZE_CAUSALITY,PERSONAL,AI_BUILDER_PROMPT,ANL_Causal_Prompt,2,true,45
PRIORITIZE_SEGMENTS,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/aud/segment-priority,1,true,30
PRIORITIZE_SEGMENTS,PERSONAL,AI_BUILDER_PROMPT,AUD_SegmentPriority_Prompt,2,true,30
ASSESS_LTV,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/aud/ltv,1,true,30
ASSESS_LTV,PERSONAL,AI_BUILDER_PROMPT,AUD_LTVAssess_Prompt,2,true,30
SCORE_PROPENSITY,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/aud/propensity,1,true,25
SCORE_PROPENSITY,PERSONAL,AI_BUILDER_PROMPT,AUD_Propensity_Prompt,2,true,25
ANALYZE_JOURNEY_STATE,PERSONAL,AI_BUILDER_PROMPT,AUD_JourneyState_Prompt,1,true,30
RESOLVE_IDENTITY,PERSONAL,AI_BUILDER_PROMPT,AUD_Identity_Prompt,1,true,25
OPTIMIZE_CHANNEL_MIX,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/cha/optimize,1,true,45
OPTIMIZE_CHANNEL_MIX,PERSONAL,AI_BUILDER_PROMPT,CHA_ChannelMix_Prompt,2,true,45
SELECT_CHANNELS,PERSONAL,AI_BUILDER_PROMPT,CHA_ChannelSelect_Prompt,1,true,30
ASSESS_EMERGING_CHANNEL,PERSONAL,AI_BUILDER_PROMPT,CHA_EmergingAssess_Prompt,1,true,30
CALCULATE_FEE_WATERFALL,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/spo/fee-waterfall,1,true,25
CALCULATE_FEE_WATERFALL,PERSONAL,AI_BUILDER_PROMPT,SPO_FeeWaterfall_Prompt,2,true,25
SCORE_PARTNER,PERSONAL,AI_BUILDER_PROMPT,SPO_PartnerScore_Prompt,1,true,25
CALCULATE_NBI,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/spo/nbi,1,true,25
CALCULATE_NBI,PERSONAL,AI_BUILDER_PROMPT,SPO_NBICalculate_Prompt,2,true,25
DETECT_ANOMALIES,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/prf/anomaly,1,true,30
DETECT_ANOMALIES,PERSONAL,AI_BUILDER_PROMPT,PRF_Anomaly_Prompt,2,true,30
ANALYZE_ATTRIBUTION,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/prf/attribution,1,true,45
ANALYZE_ATTRIBUTION,PERSONAL,AI_BUILDER_PROMPT,PRF_Attribution_Prompt,2,true,45
MEASURE_INCREMENTALITY,PERSONAL,AI_BUILDER_PROMPT,PRF_Incrementality_Prompt,1,true,30
RECOMMEND_OPTIMIZATION,PERSONAL,AI_BUILDER_PROMPT,PRF_Optimize_Prompt,1,true,35
CLASSIFY_INTENT,PERSONAL,AI_BUILDER_PROMPT,ORC_Intent_Prompt,1,true,15
VALIDATE_GATE,PERSONAL,DATAVERSE_LOGIC,MPA_ValidateGate_Flow,1,true,10
GENERATE_DOCUMENT,PERSONAL,AI_BUILDER_PROMPT,DOC_Generate_Prompt,1,true,60
SELECT_TEMPLATE,PERSONAL,AI_BUILDER_PROMPT,DOC_TemplateSelect_Prompt,1,true,20
FORMAT_EXPORT,PERSONAL,DATAVERSE_LOGIC,MPA_FormatExport_Flow,1,true,30
```

**File: environments/mastercard/seed/eap_capability_impl_mastercard.csv**
```csv
eap_capability_code,eap_environment_code,eap_implementation_type,eap_implementation_reference,eap_priority_order,eap_is_enabled,eap_timeout_seconds
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

### 4.3 Dataverse Deployment Script

**File: deploy/deploy_dataverse.sh**
```bash
#!/bin/bash

# MPA v6.0 Dataverse Deployment Script
# Usage: ./deploy_dataverse.sh [personal|mastercard]

set -e

ENVIRONMENT=${1:-personal}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "MPA v6.0 Dataverse Deployment"
echo "Environment: $ENVIRONMENT"
echo "=========================================="

# Select auth profile
if [ "$ENVIRONMENT" == "personal" ]; then
    pac auth select --name "Aragorn-AI"
elif [ "$ENVIRONMENT" == "mastercard" ]; then
    pac auth select --name "Mastercard"
else
    echo "Error: Invalid environment. Use 'personal' or 'mastercard'"
    exit 1
fi

# Verify connection
echo ""
echo "Verifying connection..."
pac org who

# Deploy tables (in dependency order)
echo ""
echo "Creating Dataverse tables..."

# Note: In production, use pac solution import with a pre-built solution
# For development, tables are created manually or via solution

echo ""
echo "Loading seed data..."

# Load agents first (no dependencies)
echo "Loading eap_agent..."
pac data import --data "$ROOT_DIR/base/dataverse/seed/eap_agent_seed.csv" --table eap_agent

# Load capabilities (depends on agents)
echo "Loading eap_capability..."
pac data import --data "$ROOT_DIR/base/dataverse/seed/eap_capability_seed.csv" --table eap_capability

# Load MPA domain data
echo "Loading mpa_channel..."
pac data import --data "$ROOT_DIR/base/dataverse/seed/mpa_channel_seed.csv" --table mpa_channel

echo "Loading mpa_kpi..."
pac data import --data "$ROOT_DIR/base/dataverse/seed/mpa_kpi_seed.csv" --table mpa_kpi

echo "Loading mpa_vertical..."
pac data import --data "$ROOT_DIR/base/dataverse/seed/mpa_vertical_seed.csv" --table mpa_vertical

echo "Loading mpa_benchmark..."
pac data import --data "$ROOT_DIR/base/dataverse/seed/mpa_benchmark_seed.csv" --table mpa_benchmark

# Load environment-specific implementation mappings
echo ""
echo "Loading environment-specific implementations..."
if [ "$ENVIRONMENT" == "personal" ]; then
    pac data import --data "$ROOT_DIR/environments/personal/seed/eap_capability_impl_personal.csv" --table eap_capability_implementation
else
    pac data import --data "$ROOT_DIR/environments/mastercard/seed/eap_capability_impl_mastercard.csv" --table eap_capability_implementation
fi

echo ""
echo "=========================================="
echo "Dataverse deployment complete!"
echo "=========================================="
```

### 4.4 Run Dataverse Deployment

```bash
# Make script executable
chmod +x deploy/deploy_dataverse.sh

# Deploy to Personal environment
./deploy/deploy_dataverse.sh personal

# Deploy to Mastercard environment
./deploy/deploy_dataverse.sh mastercard
```

---

## PART 5: FLOW DEPLOYMENT

### 5.1 Core Platform Flows

These flows are shared across both environments.

**Flow: MPA_Capability_Dispatcher**

Purpose: Routes capability requests to the appropriate implementation.

```
Trigger: When called from Copilot (HTTP request)

Input:
- capability_code: string
- session_id: string
- request_id: string
- inputs: object
- options: object (optional)

Process:
1. Query eap_capability_implementation
   - Filter: capability_code = @capability_code
   - Filter: environment_code = @environment_code (from config)
   - Filter: is_enabled = true
   - Sort: priority_order ascending
   - Top: 1

2. Get implementation details
   - implementation_type
   - implementation_reference
   - timeout_seconds

3. Branch by implementation_type:
   - AI_BUILDER_PROMPT: Call AI Builder prompt
   - AZURE_FUNCTION: Call HTTP action (Personal only)
   - DATAVERSE_LOGIC: Call child flow
   - HTTP_ENDPOINT: Call HTTP action (Personal only)

4. Handle response/error
   - Log to eap_telemetry
   - Return result or error

Output:
- status: success|error
- result: object
- confidence: number
- execution_time_ms: number
```

**Flow: MPA_Session_Manager**

Purpose: Create and manage MPA sessions.

```
Trigger: When called from Copilot

Actions:
1. Initialize:
   - Generate session_id (GUID)
   - Create mpa_session record
   - Set status = ACTIVE
   - Set created_at = now()

2. Update:
   - Update mpa_session record
   - Increment turn_count
   - Update current_step if changed

3. Complete:
   - Set status = COMPLETED
   - Set completed_at = now()
   - Calculate duration
```

### 5.2 Export Flows from Personal Environment

```bash
# Authenticate to Personal environment
pac auth select --name "Aragorn-AI"

# Export solution containing flows
pac solution export \
  --path ./deploy/personal/MPA_v6_Flows.zip \
  --name MPA_v6_Platform_Flows \
  --managed false

# Unpack for source control
pac solution unpack \
  --zipfile ./deploy/personal/MPA_v6_Flows.zip \
  --folder ./base/platform/eap/flows \
  --packagetype Both
```

### 5.3 Import Flows to Mastercard Environment

```bash
# Authenticate to Mastercard environment
pac auth select --name "Mastercard"

# Import solution
pac solution import \
  --path ./deploy/personal/MPA_v6_Flows.zip \
  --activate-plugins true \
  --force-overwrite true

# Note: HTTP connector actions will fail in Mastercard
# Those flows must be modified to use AI Builder only
```

---

## PART 6: SHAREPOINT CONFIGURATION

### 6.1 Create KB Document Library

In SharePoint Admin Center or via PowerShell:

```powershell
# Connect to SharePoint
Connect-PnPOnline -Url "https://yourtenant.sharepoint.com/sites/MPA" -Interactive

# Create document library for KB files
New-PnPList -Title "MPA Knowledge Base" -Template DocumentLibrary -Url "MPAKnowledgeBase"

# Create folder structure
$folders = @(
    "EAP",
    "Agents/ORC",
    "Agents/ANL",
    "Agents/AUD",
    "Agents/CHA",
    "Agents/SPO",
    "Agents/DOC",
    "Agents/PRF"
)

foreach ($folder in $folders) {
    Add-PnPFolder -Name $folder -Folder "MPAKnowledgeBase"
}
```

### 6.2 Upload KB Files

```bash
# Script to upload KB files to SharePoint
# File: deploy/upload_kb.sh

#!/bin/bash

ENVIRONMENT=${1:-personal}
SITE_URL="https://yourtenant.sharepoint.com/sites/MPA"
LIBRARY="MPAKnowledgeBase"

# Upload EAP shared files
for file in base/platform/eap/kb/*.txt; do
    echo "Uploading $file to EAP/"
    # Use Graph API or PnP PowerShell for upload
done

# Upload agent-specific files
for agent in orc anl aud cha spo doc prf; do
    AGENT_UPPER=$(echo $agent | tr '[:lower:]' '[:upper:]')
    for file in base/agents/$agent/kb/*.txt; do
        echo "Uploading $file to Agents/$AGENT_UPPER/"
        # Use Graph API or PnP PowerShell for upload
    done
done
```

### 6.3 Configure Copilot Studio Knowledge Source

In Copilot Studio for each agent:

1. Navigate to **Knowledge** tab
2. Click **Add knowledge**
3. Select **SharePoint**
4. Browse to: `https://yourtenant.sharepoint.com/sites/MPA/MPAKnowledgeBase`
5. Select relevant folders:
   - For ORC: Select `EAP/` and `Agents/ORC/`
   - For ANL: Select `EAP/` and `Agents/ANL/`
   - (repeat for each agent)
6. Click **Add**
7. Wait for indexing to complete

---

## PART 7: AI BUILDER DEPLOYMENT

### 7.1 Create AI Builder Prompts

AI Builder Custom Prompts are created in the Power Platform maker portal.

**Process for each prompt:**

1. Navigate to **AI Builder** > **Explore** > **Custom prompts**
2. Click **Create custom prompt**
3. Enter prompt details from MPA_v6_AI_Builder_Prompts.md:
   - Name: e.g., `ANL_MarginalReturn_Prompt`
   - Description: From prompt specification
   - System message: From `system_message` field
   - User message template: From `user_message_template` field
4. Configure settings:
   - Temperature: From specification
   - Max tokens: From specification
5. Add input parameters:
   - Add each input variable from the specification
6. Test the prompt
7. Save and publish

### 7.2 AI Builder Prompt Deployment Script

For automation, use Power Platform CLI or Power Automate:

**File: deploy/deploy_prompts.ps1**
```powershell
# Deploy AI Builder prompts
# Note: AI Builder prompts cannot be directly deployed via pac CLI
# Use solution export/import or manual creation

$prompts = @(
    @{
        Name = "ANL_MarginalReturn_Prompt"
        SystemMessage = @"
You are an expert marketing analytics specialist...
"@
        UserTemplate = "{{inputs_json}}"
        Temperature = 0.1
    },
    # Add all prompts...
)

foreach ($prompt in $prompts) {
    Write-Host "Creating prompt: $($prompt.Name)"
    # Use Power Platform API or manual process
}
```

### 7.3 Export/Import Prompts via Solution

```bash
# Export solution with AI Builder components
pac solution export \
  --path ./deploy/MPA_v6_AIBuilder.zip \
  --name MPA_v6_AIBuilder_Prompts \
  --managed false

# Import to target environment
pac auth select --name "Mastercard"
pac solution import \
  --path ./deploy/MPA_v6_AIBuilder.zip \
  --activate-plugins true
```

---

## PART 8: AZURE FUNCTIONS DEPLOYMENT

**Note: Personal environment only**

### 8.1 Initialize Function App

```bash
cd environments/personal/functions

# Initialize Azure Functions project
func init mpa-functions --python

cd mpa-functions

# Create function structure
mkdir -p shared anl_functions aud_functions cha_functions spo_functions prf_functions tests

# Copy shared utilities
# (Files from MPA_v6_Azure_Functions.md)
```

### 8.2 Create Function App in Azure

```bash
# Variables
RESOURCE_GROUP="mpa-personal-rg"
STORAGE_ACCOUNT="mpapersonalstore"
FUNCTION_APP="mpa-functions-personal"
LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create storage account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

# Create function app
az functionapp create \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --storage-account $STORAGE_ACCOUNT \
  --consumption-plan-location $LOCATION \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --os-type Linux

# Configure Application Insights
az monitor app-insights component create \
  --app mpa-functions-insights \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Link App Insights to Function App
INSIGHTS_KEY=$(az monitor app-insights component show \
  --app mpa-functions-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

az functionapp config appsettings set \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$INSIGHTS_KEY"
```

### 8.3 Deploy Functions

```bash
cd environments/personal/functions/mpa-functions

# Install dependencies
pip install -r requirements.txt

# Local testing
func start

# Deploy to Azure
func azure functionapp publish mpa-functions-personal

# Verify deployment
func azure functionapp list-functions mpa-functions-personal
```

### 8.4 Configure Function Keys

```bash
# Get function keys
az functionapp keys list \
  --name mpa-functions-personal \
  --resource-group mpa-personal-rg

# Store function key in Dataverse or Key Vault
# Update eap_capability_implementation records with key in configuration_json
```

---

## PART 9: COPILOT AGENT CONFIGURATION

### 9.1 Create Copilot Agents

For each of the 7 agents:

1. Navigate to **Copilot Studio**
2. Click **Create** > **New copilot**
3. Configure:
   - Name: e.g., `MPA Analytics Agent (ANL)`
   - Description: From architecture document
   - Language: English
4. Set up knowledge sources (SharePoint folders)
5. Configure instructions (from instruction files)
6. Add topics for capability invocation
7. Test in embedded chat
8. Publish

### 9.2 Agent Configuration Files

**File: base/agents/anl/config/copilot_config.json**
```json
{
  "agentCode": "ANL",
  "agentName": "MPA Analytics Agent",
  "description": "Handles projections, calculations, statistical analysis, and optimization for media planning",
  "instructionFile": "ANL_Copilot_Instructions_v1.txt",
  "knowledgeSources": [
    "SharePoint:MPAKnowledgeBase/EAP",
    "SharePoint:MPAKnowledgeBase/Agents/ANL"
  ],
  "capabilities": [
    "CALCULATE_MARGINAL_RETURN",
    "COMPARE_SCENARIOS",
    "GENERATE_PROJECTIONS",
    "ASSESS_CONFIDENCE",
    "APPLY_BAYESIAN_INFERENCE",
    "ANALYZE_CAUSALITY"
  ],
  "settings": {
    "greeting": "I'm the Analytics Agent. I can help with projections, calculations, scenario comparisons, and statistical analysis. What would you like to analyze?",
    "fallbackMessage": "I'm not able to help with that specific request. Let me route you to the appropriate agent.",
    "maxTurns": 20
  }
}
```

### 9.3 Export/Import Copilot Agents

```bash
# Export copilot as solution component
pac solution export \
  --path ./deploy/MPA_v6_Copilots.zip \
  --name MPA_v6_Copilot_Agents \
  --managed false

# Import to target environment
pac auth select --name "Mastercard"
pac solution import \
  --path ./deploy/MPA_v6_Copilots.zip
```

---

## PART 10: ENVIRONMENT-SPECIFIC CONFIGURATION

### 10.1 Personal Environment Config

**File: environments/personal/config/environment_config.json**
```json
{
  "environment": {
    "code": "PERSONAL",
    "name": "Aragorn AI",
    "dataverseUrl": "https://aragorn-ai.crm.dynamics.com",
    "sharePointUrl": "https://aragorn-ai.sharepoint.com/sites/MPA"
  },
  "capabilities": {
    "httpConnector": true,
    "azureFunctions": true,
    "customConnectors": true
  },
  "functionApp": {
    "url": "https://mpa-functions-personal.azurewebsites.net",
    "keyVaultReference": "mpa-functions-key"
  },
  "aiBuilder": {
    "enabled": true,
    "fallbackOnly": false
  },
  "features": {
    "advancedAnalytics": true,
    "realTimeOptimization": true,
    "experimentalFeatures": true
  }
}
```

### 10.2 Mastercard Environment Config

**File: environments/mastercard/config/environment_config.json**
```json
{
  "environment": {
    "code": "MASTERCARD",
    "name": "Mastercard Managed",
    "dataverseUrl": "https://mastercard.crm.dynamics.com",
    "sharePointUrl": "https://mastercard.sharepoint.com/sites/MPA"
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
  }
}
```

### 10.3 Load Environment Config

Create a flow that loads environment configuration at runtime:

```
Flow: MPA_Load_Environment_Config

Trigger: When called

Process:
1. Get environment URL from current connection
2. Query eap_environment_config table
3. Return configuration object

Output:
- environment_code
- capabilities
- feature_flags
```

---

## PART 11: TESTING AND VALIDATION

### 11.1 Create Test Scenarios

**File: base/tests/scenarios/routing_tests.json**
```json
{
  "testSuite": "Routing Tests",
  "tests": [
    {
      "testId": "ROUTE_001",
      "name": "Route budget question to ANL",
      "input": "What's the optimal budget allocation for my campaign?",
      "expectedAgent": "ANL",
      "expectedCapability": "CALCULATE_MARGINAL_RETURN"
    },
    {
      "testId": "ROUTE_002",
      "name": "Route audience question to AUD",
      "input": "Which customer segments should I target?",
      "expectedAgent": "AUD",
      "expectedCapability": "PRIORITIZE_SEGMENTS"
    },
    {
      "testId": "ROUTE_003",
      "name": "Route channel question to CHA",
      "input": "Which channels should I use for brand awareness?",
      "expectedAgent": "CHA",
      "expectedCapability": "SELECT_CHANNELS"
    }
  ]
}
```

### 11.2 Run Validation Tests

**File: deploy/run_tests.sh**
```bash
#!/bin/bash

ENVIRONMENT=${1:-personal}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "MPA v6.0 Validation Tests"
echo "Environment: $ENVIRONMENT"
echo "=========================================="

# Select auth profile
if [ "$ENVIRONMENT" == "personal" ]; then
    pac auth select --name "Aragorn-AI"
else
    pac auth select --name "Mastercard"
fi

# Run Dataverse validation
echo ""
echo "Validating Dataverse tables..."

# Check eap_agent records
AGENT_COUNT=$(pac data export --table eap_agent --json | jq length)
echo "  eap_agent records: $AGENT_COUNT (expected: 7)"

# Check eap_capability records
CAP_COUNT=$(pac data export --table eap_capability --json | jq length)
echo "  eap_capability records: $CAP_COUNT (expected: 26)"

# Check implementations
IMPL_COUNT=$(pac data export --table eap_capability_implementation --json | jq length)
echo "  eap_capability_implementation records: $IMPL_COUNT"

# Run routing tests
echo ""
echo "Running routing tests..."
# (Would call test flow or external test runner)

# Run capability tests
echo ""
echo "Running capability tests..."
# (Would invoke capabilities and validate responses)

echo ""
echo "=========================================="
echo "Validation complete!"
echo "=========================================="
```

### 11.3 Load Test Scenarios to Dataverse

```bash
# Load test scenarios
pac data import \
  --data ./base/tests/scenarios/routing_tests.json \
  --table eap_test_case
```

---

## PART 12: GIT WORKFLOW

### 12.1 Branch Strategy

```
main                    # Production-ready code
â”œâ”€â”€ develop            # Integration branch
â”‚   â”œâ”€â”€ feature/v6.0-dataverse     # Dataverse schema work
â”‚   â”œâ”€â”€ feature/v6.0-flows         # Flow development
â”‚   â”œâ”€â”€ feature/v6.0-kb-content    # KB file content
â”‚   â”œâ”€â”€ feature/v6.0-functions     # Azure Functions
â”‚   â””â”€â”€ feature/v6.0-agents        # Copilot agent config
â”œâ”€â”€ deploy/personal    # Personal environment deployment
â””â”€â”€ deploy/mastercard  # Mastercard environment deployment
```

### 12.2 Commit Messages

Follow conventional commits:

```bash
# Features
git commit -m "feat(anl): Add marginal return calculation logic"
git commit -m "feat(dataverse): Add eap_capability_implementation table"

# Fixes
git commit -m "fix(routing): Correct intent classification for budget queries"

# Documentation
git commit -m "docs(arch): Update architecture with capability abstraction"

# Chores
git commit -m "chore(deps): Update numpy to 1.24.0"
```

### 12.3 Deployment Workflow

```bash
# Personal environment deployment
git checkout deploy/personal
git merge develop
./deploy/deploy_all.sh personal
git tag -a v6.0.0-personal -m "Deploy v6.0.0 to Personal"
git push origin deploy/personal --tags

# Mastercard environment deployment
git checkout deploy/mastercard
git merge develop
./deploy/deploy_all.sh mastercard
git tag -a v6.0.0-mastercard -m "Deploy v6.0.0 to Mastercard"
git push origin deploy/mastercard --tags
```

### 12.4 Full Deployment Script

**File: deploy/deploy_all.sh**
```bash
#!/bin/bash

# MPA v6.0 Full Deployment Script
# Usage: ./deploy_all.sh [personal|mastercard]

set -e

ENVIRONMENT=${1:-personal}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "MPA v6.0 Full Deployment"
echo "Environment: $ENVIRONMENT"
echo "=========================================="

# Step 1: Dataverse
echo ""
echo "Step 1: Deploying Dataverse..."
$SCRIPT_DIR/deploy_dataverse.sh $ENVIRONMENT

# Step 2: SharePoint KB
echo ""
echo "Step 2: Uploading KB files..."
$SCRIPT_DIR/upload_kb.sh $ENVIRONMENT

# Step 3: AI Builder Prompts
echo ""
echo "Step 3: Deploying AI Builder prompts..."
# Manual step or solution import

# Step 4: Flows
echo ""
echo "Step 4: Deploying flows..."
# pac solution import

# Step 5: Azure Functions (Personal only)
if [ "$ENVIRONMENT" == "personal" ]; then
    echo ""
    echo "Step 5: Deploying Azure Functions..."
    cd environments/personal/functions/mpa-functions
    func azure functionapp publish mpa-functions-personal
    cd $SCRIPT_DIR
fi

# Step 6: Copilot Agents
echo ""
echo "Step 6: Deploying Copilot agents..."
# pac solution import

# Step 7: Validation
echo ""
echo "Step 7: Running validation..."
$SCRIPT_DIR/run_tests.sh $ENVIRONMENT

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
```

---

## PART 13: TROUBLESHOOTING

### 13.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `pac auth` fails | Token expired | Run `pac auth clear` then `pac auth create` |
| Dataverse import fails | Schema mismatch | Verify table schema matches seed file columns |
| Flow fails in Mastercard | HTTP connector used | Remove HTTP actions, use AI Builder only |
| AI Builder timeout | Prompt too complex | Simplify prompt or increase timeout |
| SharePoint indexing slow | Large files | Wait 24 hours, or reduce file sizes |

### 13.2 Debug Commands

```bash
# Check current auth
pac org who

# List solutions
pac solution list

# Export logs
pac solution export --path ./debug.zip --name YourSolution

# Check Power Automate flow runs
# Use Power Automate portal or API

# Check Azure Function logs
az functionapp logs show \
  --name mpa-functions-personal \
  --resource-group mpa-personal-rg
```

### 13.3 Rollback Procedure

```bash
# Rollback Dataverse data
pac data delete --table eap_capability_implementation
pac data import --data ./backup/eap_capability_impl_backup.csv --table eap_capability_implementation

# Rollback solution
pac solution delete --solution-name MPA_v6_Platform_Flows
pac solution import --path ./backup/MPA_v6_Flows_previous.zip

# Rollback Azure Functions
func azure functionapp publish mpa-functions-personal --slot staging
# Test staging slot
# Swap slots when ready
az functionapp deployment slot swap \
  --name mpa-functions-personal \
  --resource-group mpa-personal-rg \
  --slot staging
```

---

## APPENDIX A: FILE CHECKLIST

### Base Files (Shared)

- [ ] base/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt
- [ ] base/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt
- [ ] base/agents/anl/instructions/ANL_Copilot_Instructions_v1.txt
- [ ] base/agents/anl/kb/ANL_KB_Analytics_Core_v1.txt
- [ ] base/agents/anl/kb/ANL_KB_MMM_Methods_v1.txt
- [ ] base/agents/anl/kb/ANL_KB_Bayesian_Inference_v1.txt
- [ ] base/agents/anl/kb/ANL_KB_Causal_Incrementality_v1.txt
- [ ] base/agents/anl/kb/ANL_KB_Budget_Optimization_v1.txt
- [ ] base/agents/aud/instructions/AUD_Copilot_Instructions_v1.txt
- [ ] base/agents/aud/kb/AUD_KB_Audience_Core_v1.txt
- [ ] base/agents/aud/kb/AUD_KB_Identity_Resolution_v1.txt
- [ ] base/agents/aud/kb/AUD_KB_LTV_Modeling_v1.txt
- [ ] base/agents/aud/kb/AUD_KB_Propensity_ML_v1.txt
- [ ] base/agents/aud/kb/AUD_KB_Journey_Orchestration_v1.txt
- [ ] base/agents/cha/instructions/CHA_Copilot_Instructions_v1.txt
- [ ] base/agents/cha/kb/CHA_KB_Channel_Core_v1.txt
- [ ] base/agents/cha/kb/CHA_KB_Allocation_Methods_v1.txt
- [ ] base/agents/cha/kb/CHA_KB_Emerging_Channels_v1.txt
- [ ] base/agents/cha/kb/CHA_KB_Brand_Performance_v1.txt
- [ ] base/agents/spo/instructions/SPO_Copilot_Instructions_v1.txt
- [ ] base/agents/spo/kb/SPO_KB_SPO_Core_v1.txt
- [ ] base/agents/spo/kb/SPO_KB_Fee_Analysis_v1.txt
- [ ] base/agents/spo/kb/SPO_KB_Partner_Evaluation_v1.txt
- [ ] base/agents/doc/instructions/DOC_Copilot_Instructions_v1.txt
- [ ] base/agents/doc/kb/DOC_KB_Document_Core_v1.txt
- [ ] base/agents/doc/kb/DOC_KB_Export_Formats_v1.txt
- [ ] base/agents/prf/instructions/PRF_Copilot_Instructions_v1.txt
- [ ] base/agents/prf/kb/PRF_KB_Performance_Core_v1.txt
- [ ] base/agents/prf/kb/PRF_KB_Attribution_Methods_v1.txt
- [ ] base/agents/prf/kb/PRF_KB_Incrementality_Testing_v1.txt
- [ ] base/agents/prf/kb/PRF_KB_Anomaly_Detection_v1.txt
- [ ] base/platform/eap/kb/EAP_KB_Data_Provenance_v1.txt
- [ ] base/platform/eap/kb/EAP_KB_Confidence_Levels_v1.txt
- [ ] base/platform/eap/kb/EAP_KB_Error_Handling_v1.txt
- [ ] base/platform/eap/kb/EAP_KB_Formatting_Standards_v1.txt
- [ ] base/platform/eap/kb/EAP_KB_Strategic_Principles_v1.txt
- [ ] base/platform/eap/kb/EAP_KB_Communication_Contract_v1.txt

### Dataverse Seed Files

- [ ] base/dataverse/seed/eap_agent_seed.csv
- [ ] base/dataverse/seed/eap_capability_seed.csv
- [ ] base/dataverse/seed/mpa_channel_seed.csv
- [ ] base/dataverse/seed/mpa_kpi_seed.csv
- [ ] base/dataverse/seed/mpa_vertical_seed.csv
- [ ] base/dataverse/seed/mpa_benchmark_seed.csv

### Environment-Specific Files

- [ ] environments/personal/seed/eap_capability_impl_personal.csv
- [ ] environments/personal/config/environment_config.json
- [ ] environments/mastercard/seed/eap_capability_impl_mastercard.csv
- [ ] environments/mastercard/config/environment_config.json

---

## APPENDIX B: COMMAND QUICK REFERENCE

```bash
# Authentication
pac auth create --environment "https://org.crm.dynamics.com"
pac auth list
pac auth select --index N

# Dataverse
pac data import --data file.csv --table table_name
pac data export --table table_name --json

# Solutions
pac solution export --path file.zip --name SolutionName
pac solution import --path file.zip
pac solution list

# Azure Functions
func start                    # Local run
func azure functionapp publish AppName

# Azure CLI
az login
az account set --subscription "Name"
az functionapp create ...
az functionapp config appsettings set ...
```

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Author:** Claude (via claude.ai)  
**Status:** Implementation Ready
