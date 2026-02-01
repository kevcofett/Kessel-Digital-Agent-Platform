# KDAP v7.0 Solution Deployment Guide

**Version:** 7.0.0
**Generated:** 2026-02-01
**Target:** Mastercard Copilot Studio Environment

## Overview

This package contains the Power Platform solution for deploying the Kessel Digital Agent Platform (KDAP) v7.0 to the Mastercard environment.

## What's New in v7.0

- **Consolidated Solution Package** - Single ZIP replaces multiple agent-specific packages
- **Separate Data Import** - Reference data imported via Configuration Migration Tool
- **Power Platform Compliant Structure** - Clean solution ZIP with standard folders only

## Solution Packages

| Package | Size | Description |
|---------|------|-------------|
| `Consulting_and_Marketing_Agent_Platform_V7.0.zip` | 250 KB | Core platform: entities, flows, option sets |
| `KDAP_V7.0_Data_Import.zip` | 38 KB | Reference data (CMT format) |

## Prerequisites

Before importing:

1. **Power Platform Environment**
   - Copilot Studio environment provisioned
   - System Administrator role assigned
   - Dataverse enabled

2. **Tools Required**
   - PAC CLI (recommended) or Power Platform Admin Center
   - Configuration Migration Tool (for data import)

3. **Azure Resources** (if using ML endpoints)
   - Azure Functions deployed
   - Function keys configured
   - CORS enabled for Power Platform

## Deployment Steps

### Step 1: Import Solution Package

**Using PAC CLI (Recommended):**

```bash
# Authenticate to Mastercard environment
pac auth create --environment https://[mastercard-env].crm.dynamics.com

# Import solution
pac solution import --path Consulting_and_Marketing_Agent_Platform_V7.0.zip --activate-plugins
```

**Using Power Platform Admin Center:**

1. Navigate to https://admin.powerplatform.microsoft.com
2. Select Mastercard target environment
3. Go to Solutions → Import
4. Upload `Consulting_and_Marketing_Agent_Platform_V7.0.zip`
5. Follow import wizard
6. Activate flows after import

### Step 2: Import Reference Data

**Using Configuration Migration Tool:**

1. Download [Configuration Migration Tool](https://docs.microsoft.com/power-platform/admin/manage-configuration-data)
2. Run `DataMigrationUtility.exe`
3. Select **Import data**
4. Connect to Mastercard environment
5. Select `KDAP_V7.0_Data_Import.zip`
6. Review mappings → Import

**Data included:**

| Entity | Records | Description |
|--------|---------|-------------|
| eap_agents | 13 | Agent definitions (ORC, ANL, AUD, CHA, etc.) |
| eap_config | 13 | Platform configuration settings |
| eap_user_roles | 6 | User role definitions |
| ca_frameworks | 10 | Consulting agent frameworks |

### Step 3: Configure AI Builder Prompts

1. Navigate to make.powerapps.com → AI Builder → Models
2. Import `ai_builder_prompts_all_agents_v7.0.json`
3. Import `gha_ai_builder_prompts.json`
4. Activate all prompts

### Step 4: Configure Copilot Studio Agents

For each agent in `agents/` folder:

1. Open Copilot Studio
2. Create or update agent
3. Upload instructions from `agents/{code}/instructions/`
4. Configure knowledge base from `agents/{code}/kb/`
5. Import topics from `topics/all_agent_topics_v7.0.json`

**Agent codes:** ORC, ANL, AUD, CHA, CST, CHG, DOC, GHA, MKT, PRF, SPO, DOCS, DVO

## Post-Deployment Configuration

### 1. Environment Variables

Configure in Power Platform Admin Center → Environments → [Mastercard] → Settings:

| Variable | Description | Value |
|----------|-------------|-------|
| eap_ml_base_url | Azure Functions base URL | https://kdap-ml-mc.azurewebsites.net |
| eap_ml_function_key | Azure Functions key | (from Azure portal) |

### 2. Activate Cloud Flows

1. Go to Solutions → Consulting and Marketing Agent Platform
2. Select Cloud flows
3. Turn on each flow

### 3. Connection References

Verify these connections are configured:
- Dataverse connector
- HTTP Premium connector (for ML endpoints)

## Verification Checklist

After deployment, verify:

- [ ] Solution imported without errors
- [ ] All 24 Dataverse entities created
- [ ] Reference data imported (check eap_agents table)
- [ ] 28 Cloud flows activated
- [ ] AI Builder prompts active
- [ ] Copilot agents responding

**Quick validation:**

```bash
# Check solution status
pac solution list

# Verify entity count
pac paportal list --environment https://[mastercard-env].crm.dynamics.com
```

## Troubleshooting

### Import Fails with "Invalid Solution File"

**Cause:** ZIP contains non-standard folders
**Solution:** Use the cleaned `Consulting_and_Marketing_Agent_Platform_V7.0.zip` (250 KB version)

### Data Import Shows Zero Records

**Cause:** Entity schema mismatch
**Solution:** Ensure solution is imported before data import

### Flows Fail to Activate

**Cause:** Missing connection references
**Solution:**
1. Edit flow → Update connection references
2. Re-import with `--activate-plugins` flag

### Agent Not Responding

**Cause:** Topics not imported or KB files missing
**Solution:** Verify Copilot Studio agent configuration

## Rollback

If issues occur:

1. **Solution:** Solutions → [Solution] → Delete
2. **Data:** Manual cleanup required (no automatic rollback)
3. **Agents:** Delete from Copilot Studio

## File Reference

```
release/v7.0/solutions/
├── Consulting_and_Marketing_Agent_Platform_V7.0.zip    # Main solution (IMPORT THIS)
├── KDAP_V7.0_Data_Import.zip                           # Reference data
├── Consulting_and_Marketing_Agent_Platform_V7.0/       # Extracted contents
│   ├── agents/                                         # Copilot agent configs
│   ├── topics/                                         # Agent topics
│   ├── data/                                           # Seed data sources
│   ├── ai_builder_prompts_all_agents_v7.0.json        # AI Builder prompts
│   └── gha_ai_builder_prompts.json                    # GHA prompts
├── DEPLOYMENT_GUIDE.md                                 # This file
└── DEPLOYMENT_SEQUENCE_V7.0.md                         # Detailed sequence
```

## Support

For deployment issues:
- Kessel Digital: support@kesseldigital.com
- Internal: #kdap-support Slack channel
