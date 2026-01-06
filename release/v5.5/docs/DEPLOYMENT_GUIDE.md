# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Agent Platform to your environment.

## Prerequisites

### Accounts & Access

- [ ] Microsoft 365 admin access or Dataverse environment access
- [ ] Copilot Studio license
- [ ] Azure subscription (for Azure Functions)
- [ ] GitHub access to clone repository

### Tools

- [ ] Git client installed
- [ ] VS Code (recommended)
- [ ] Power Platform CLI (`pac`) installed
- [ ] Azure CLI (`az`) installed
- [ ] Python 3.9+ (for seed data scripts)

## Deployment Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/kevcofett/Kessel-Digital-Agent-Platform.git
cd Kessel-Digital-Agent-Platform

# Checkout your environment branch
git checkout deploy/personal    # For personal environment
# OR
git checkout deploy/corporate   # For corporate environment
```

### Step 2: Configure Environment

```bash
# Copy template to environment config
cp release/v5.5/platform/config/environment.template.json \
   release/v5.5/platform/config/environment.json

# Edit environment.json with your values
```

**Required Configuration:**

| Field | Example | Description |
|-------|---------|-------------|
| organization.code | Kessel-Digital | Your organization identifier |
| tenant.tenantId | {GUID} | Azure AD tenant ID |
| dataverse.environmentUrl | https://yourenv.crm.dynamics.com | Dataverse URL |
| sharepoint.siteUrl | https://tenant.sharepoint.com/sites/YourSite | SharePoint site |

### Step 3: Create Dataverse Tables

#### Option A: Using Power Platform CLI

```bash
# Authenticate
pac auth create --url https://yourenv.crm.dynamics.com

# Import EAP tables
pac solution import --path release/v5.5/platform/eap-core/base/schema/

# Import MPA tables  
pac solution import --path release/v5.5/agents/mpa/base/schema/
```

#### Option B: Manual Creation

Follow the schema files in `/base/schema/tables/` to create tables manually in Power Apps Maker Portal.

### Step 4: Import Seed Data

```bash
# Navigate to seed data folder
cd release/v5.5/agents/mpa/base/data/seed

# Import verticals
pac data import --file mpa_vertical_seed.csv --table mpa_vertical

# Import channels
pac data import --file mpa_channel_seed.csv --table mpa_channel

# Import KPIs
pac data import --file mpa_kpi_seed.csv --table mpa_kpi

# Import benchmarks
pac data import --file mpa_benchmark_seed.csv --table mpa_benchmark
```

### Step 5: Configure SharePoint

1. Create SharePoint document library named per your config (e.g., "MediaPlanningKB")
2. Upload all files from `/release/v5.5/agents/mpa/base/kb/`
3. Wait 1-4 hours for indexing

```bash
# List KB files to upload
ls release/v5.5/agents/mpa/base/kb/
# 22 .txt files
```

### Step 6: Deploy Azure Functions

```bash
# Navigate to functions folder
cd release/v5.5/agents/mpa/base/functions/mpa_functions

# Deploy to Azure
func azure functionapp publish {YOUR-FUNCTION-APP-NAME}
```

Or deploy via VS Code Azure Functions extension.

### Step 7: Create Copilot Studio Agent

1. Open Copilot Studio
2. Create new agent
3. Paste instructions from `release/v5.5/agents/mpa/base/copilot/MPA_v55_Instructions_Uplift.txt`
4. Connect SharePoint knowledge base
5. Configure flow actions from `flow_actions.json`

### Step 8: Import Power Automate Flows

1. Navigate to Power Automate
2. Import flows from `/release/v5.5/agents/mpa/base/flows/definitions/`
3. Configure connection references
4. Enable flows

### Step 9: Configure Feature Flags

```bash
# Import feature flags to Dataverse
# Use the flags from feature_flags.template.json
# Set is_enabled based on your environment:
# - Personal: Most features enabled
# - Corporate: Security features enabled, external features disabled
```

### Step 10: Register Agent

Insert record into `eap_agentregistry`:

```json
{
  "eap_agentcode": "MPA",
  "eap_agentname": "Media Planning Agent",
  "eap_agentversion": "5.5",
  "eap_status": 1,
  "eap_kbsharepointlibrary": "MediaPlanningKB",
  "eap_featureflagprefix": "mpa_"
}
```

### Step 11: Test Deployment

1. Open Copilot Studio test panel
2. Send: "Hello, I'd like to create a media plan"
3. Verify agent responds with strategic advisor persona
4. Test document generation
5. Verify KB is being consulted

## Verification Checklist

- [ ] Dataverse tables created (eap_* and mpa_*)
- [ ] Seed data imported (verticals, channels, KPIs, benchmarks)
- [ ] SharePoint KB uploaded and indexed
- [ ] Azure Functions deployed and accessible
- [ ] Copilot Studio agent configured
- [ ] Power Automate flows imported and enabled
- [ ] Feature flags configured
- [ ] Agent registered in eap_agentregistry
- [ ] Test conversation successful

## Troubleshooting

### "KB not found" errors

- Verify SharePoint library name matches config
- Wait for indexing (up to 4 hours)
- Check Copilot Studio knowledge source configuration

### Flow connection errors

- Re-authenticate connection references
- Verify Dataverse URL in connections
- Check user has appropriate security roles

### Function timeout errors

- Verify Azure Function app is running
- Check Application Insights for errors
- Verify environment variables configured

## Post-Deployment

### For Personal Environment

You're done! Start using the agent.

### For Corporate Environment

See [Corporate Deployment Addendum](CORPORATE_DEPLOYMENT_ADDENDUM.md) for additional steps:
- Access control hierarchy setup
- Audit logging configuration
- Teams channel deployment
- Security hardening

## Support

For issues:
1. Check troubleshooting section above
2. Review logs in Application Insights
3. Create GitHub issue with details
