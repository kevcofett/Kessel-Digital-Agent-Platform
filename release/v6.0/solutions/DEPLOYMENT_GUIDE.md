# KDAP v6.0 Solution Deployment Guide

**Version:** 6.1.0.0
**Generated:** 2026-01-21 11:23:32

## Overview

This package contains Power Platform solutions for deploying the Kessel Digital Agent Platform (KDAP) to Mastercard environments.

## Solution Packages

### Platform Solution (Deploy First)

| Package | Description |
|---------|-------------|
| EAPPlatform_6_1_0_0.zip | Core platform tables, flows, and connections |

### Agent Solutions (Deploy After Platform)

| Package | Agent | Description |
|---------|-------|-------------|
| EAPANLAgent_6_1_0_0.zip | Analytics Agent | Advanced analytics, budget optimization, forecasti... |
| EAPAUDAgent_6_1_0_0.zip | Audience Agent | Audience segmentation, propensity scoring, and tar... |
| EAPCHAAgent_6_1_0_0.zip | Channel Agent | Channel strategy, media mix modeling, and touchpoi... |
| EAPCHGAgent_6_1_0_0.zip | Change Management Agent | Change management, stakeholder mapping, and adopti... |
| EAPCSTAgent_6_1_0_0.zip | Consulting Agent | Strategic consulting, initiative prioritization, a... |
| EAPDOCAgent_6_1_0_0.zip | Document Agent | Document generation, brief creation, and content m... |
| EAPMKTAgent_6_1_0_0.zip | Marketing Agent | Marketing strategy, campaign planning, and market ... |
| EAPORCAgent_6_1_0_0.zip | Orchestrator Agent | Multi-agent coordination, workflow orchestration, ... |
| EAPPRFAgent_6_1_0_0.zip | Performance Agent | Performance analysis, anomaly detection, and attri... |
| EAPSPOAgent_6_1_0_0.zip | Sponsorship Agent | Sponsorship evaluation, partner assessment, and RO... |


## Deployment Order

**IMPORTANT:** Solutions must be deployed in this order:

1. **EAPPlatform** - Core platform (required by all agents)
2. **Agent solutions** - Can be deployed in any order after platform

## Prerequisites

Before importing solutions:

1. **Azure Resources**
   - Azure Functions deployed (7 ML endpoints)
   - Function keys configured
   - CORS enabled for Power Platform

2. **Power Platform**
   - Environment created (Production or Sandbox)
   - System Administrator role
   - Dataverse enabled

3. **Connections**
   - HTTP Premium connector license
   - Dataverse connector configured

4. **Source Environment Requirements (CRITICAL)**
   - All Dataverse tables must exist in source environment before solution export
   - Tables must have PrimaryNameAttribute properly defined
   - Custom columns must use publisher prefix (e.g., `eap_`, `mpa_`, `ca_`)
   - Solution packages MUST be exported via PAC CLI from source environment

## Import Steps

### Using Power Apps Admin Center

1. Navigate to https://admin.powerplatform.microsoft.com
2. Select target environment
3. Go to Solutions > Import
4. Upload solution ZIP file
5. Follow import wizard
6. Activate flows after import

### Using PAC CLI (Recommended)

PAC CLI is the **preferred method** for solution import/export based on deployment learnings.

**Exporting from Source Environment:**

```bash
# Authenticate to source environment
pac auth create --environment https://aragornai.crm.dynamics.com

# Export solution (all tables must exist first)
pac solution export --name EnterpriseAIPlatformv10 --path ./EAPPlatform_complete.zip --overwrite
```

**Importing to Target Environment:**

```bash
# Authenticate to target environment
pac auth create --environment https://[target-env].crm.dynamics.com

# Import platform first
pac solution import --path EAPPlatform_6_1_0_0.zip --activate-plugins

# Import agent solutions
pac solution import --path EAPANLAgent_6_1_0_0.zip --activate-plugins
pac solution import --path EAPAUDAgent_6_1_0_0.zip --activate-plugins
# ... repeat for other agents
```

**Important:** Do NOT use programmatically generated solution packages. Always export from a working Dataverse environment using PAC CLI.

## Post-Deployment Configuration

### 1. Configure Environment Variables

Set the following environment variables in each environment:

| Variable | Description | Example |
|----------|-------------|---------|
| eap_ml_base_url | Azure Functions base URL | https://kdap-ml-*.azurewebsites.net |
| eap_ml_function_key | Azure Functions key | (from Azure portal) |

### 2. Activate Flows

After import, manually activate all flows:
1. Go to Solutions > [Solution Name] > Cloud flows
2. Select each flow > Turn On

### 3. Configure Copilot Studio

1. Create/update Copilot topics to call the flows
2. Upload knowledge base files from each agent's /kb directory
3. Configure agent instructions from /instructions directory

## Verification

Run the validation script to verify deployment:

```bash
python validate_deployment.py --environment https://[env].crm.dynamics.com
```

## Troubleshooting

### Common Issues

1. **Missing dependencies**
   - Ensure EAPPlatform is imported first
   - Check all connectors are available

2. **Flow activation fails**
   - Verify connection references
   - Check connector licenses

3. **ML endpoint errors**
   - Verify Azure Functions are running
   - Check function key is correct

## Support

For deployment issues, contact:
- Kessel Digital: support@kesseldigital.com
- GitHub: https://github.com/Kessel-Digital/KDAP

