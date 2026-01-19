# KDAP Deployment Guide

## Overview

This guide covers deploying KDAP v6.0 to Microsoft Power Platform environments.

---

## Prerequisites

### Azure Resources
- [ ] Azure AD tenant with admin access
- [ ] Azure subscription for Functions and ML
- [ ] App registrations for Dataverse and SharePoint

### Power Platform
- [ ] Power Platform environment (Production or Sandbox)
- [ ] Copilot Studio license
- [ ] Power Automate premium connectors
- [ ] Dataverse database provisioned

### Tools
- [ ] pac CLI: `npm install -g @microsoft/pac-cli`
- [ ] Azure CLI: `az login`
- [ ] Python 3.9+ with pip
- [ ] Node.js 18+ with npm

---

## Environment Configuration

### 1. Create Environment Config

Copy the template and fill in your values:

```bash
cp deploy/config/template.env deploy/config/{environment}.env
```

**Required Variables:**
```bash
# Azure AD
AZURE_TENANT_ID=your-tenant-id
AZURE_SUBSCRIPTION_ID=your-subscription-id

# Dataverse
DATAVERSE_URL=https://your-org.crm.dynamics.com
DATAVERSE_CLIENT_ID=your-app-client-id
DATAVERSE_CLIENT_SECRET=your-app-secret

# SharePoint
SHAREPOINT_SITE=https://your-tenant.sharepoint.com/sites/YourSite
SHAREPOINT_CLIENT_ID=your-sharepoint-client-id
SHAREPOINT_CLIENT_SECRET=your-sharepoint-secret

# Power Platform
ENVIRONMENT_ID=your-environment-guid
ENVIRONMENT_URL=your-environment-url
```

### 2. App Registrations

Create Azure AD app registrations with these permissions:

**Dataverse App:**
- Dynamics CRM > user_impersonation
- Application permission: Environment Maker

**SharePoint App:**
- SharePoint > Sites.ReadWrite.All
- Application permission: Sites.Selected

---

## Deployment Steps

### Step 1: Deploy Dataverse Schema

```bash
# Import solution
pac auth create --environment $ENVIRONMENT_URL
pac solution import --path solutions/KDAP_v6.0_managed.zip

# Or deploy individual tables
python deploy/deploy_dataverse.py --env personal
```

**Tables Created:**
| Table | Purpose |
|-------|---------|
| mpa_session | Session management |
| mpa_benchmark | Industry benchmarks |
| mpa_kpi | KPI definitions |
| mpa_channel | Channel reference data |
| mpa_vertical | Vertical configurations |

### Step 2: Upload Knowledge Base to SharePoint

```bash
python deploy/deploy_sharepoint.py --env personal
```

**SharePoint Structure:**
```
MPAKnowledgeBase/
├── EAP/                    # Shared platform KB
├── Agents/
│   ├── ANL/               # Analytics agent KB
│   ├── AUD/               # Audience agent KB
│   ├── CHA/               # Channel agent KB
│   ├── PRF/               # Performance agent KB
│   ├── SPO/               # Supply path agent KB
│   ├── DOC/               # Document agent KB
│   └── MKT/               # Marketing agent KB
└── Verticals/
    ├── Financial_Services/
    ├── Healthcare/
    ├── B2B/
    └── Retail/
```

### Step 3: Deploy Power Automate Flows

```bash
python deploy/deploy_flows.py --env personal
```

**Flows Deployed:**
| Flow | Trigger | Purpose |
|------|---------|---------|
| MPA-CreateSession | HTTP | Initialize session |
| MPA-SearchBenchmarks | HTTP | Query benchmarks |
| MPA-GetKPIDefinitions | HTTP | Load KPI data |
| MPA-GenerateDocument | HTTP | Create media plan |
| MPA-SaveProgress | HTTP | Persist session state |

### Step 4: Configure Copilot Studio Agents

This step requires manual configuration in Copilot Studio:

1. **Create New Copilot**
   - Name: `MPA Analytics Agent (ANL)`
   - Description: From README
   - Language: English

2. **Add Knowledge Sources**
   - Connect SharePoint: `MPAKnowledgeBase/Agents/ANL`
   - Enable Generative AI

3. **Set Instructions**
   - Copy from: `release/v6.0/agents/anl/instructions/ANL_Copilot_Instructions_v1.txt`
   - Verify: 7,500-7,999 characters

4. **Configure Topics**
   - Add fallback topic
   - Configure routing topics

5. **Test and Publish**
   - Test in embedded chat
   - Publish to channels

**Repeat for each agent:** ORC, ANL, AUD, CHA, PRF, SPO, DOC, MKT, CST, CHG

### Step 5: Seed Reference Data

```bash
python deploy/deploy_dataverse.py --env personal --seed-only
```

**Seed Files:**
| File | Records |
|------|---------|
| mpa_benchmark_seed.csv | ~200 |
| mpa_kpi_seed.csv | ~50 |
| mpa_channel_seed.csv | ~30 |
| mpa_vertical_seed.csv | ~12 |

### Step 6: Deploy Azure Functions

```bash
# Deploy function app
az functionapp deployment source config-zip \
  --resource-group kdap-rg \
  --name kdap-functions \
  --src dist/functions.zip

# Set environment variables
az functionapp config appsettings set \
  --name kdap-functions \
  --resource-group kdap-rg \
  --settings @deploy/config/function_settings.json
```

**Functions:**
| Function | Trigger | Purpose |
|----------|---------|---------|
| GenerateMediaPlan | HTTP | Document generation |
| CalculateProjections | HTTP | Analytics calculations |
| RunMLInference | HTTP | ML model predictions |

### Step 7: Configure ML Endpoints (Optional)

```bash
# Deploy ML models to Azure ML
python src/ml-training/deployment/azure_ml_deploy.py \
  --model churn \
  --environment $ENVIRONMENT_NAME
```

---

## Validation

### 1. Test Dataverse Connection

```bash
python -c "
from deploy.utils.dataverse_connector import DataverseConnector
conn = DataverseConnector()
print(conn.query_table('mpa_benchmarks', top=5))
"
```

### 2. Verify SharePoint Upload

Navigate to SharePoint site and verify:
- All KB folders exist
- Files are uploaded
- No duplicate files

### 3. Test Flow Execution

```bash
curl -X POST $FLOW_URL/api/MPA-CreateSession \
  -H "Content-Type: application/json" \
  -d '{"userId": "test@example.com"}'
```

### 4. Test Copilot Agents

In Copilot Studio:
1. Open test chat
2. Send: "Calculate ROAS for $100K spend, $300K revenue"
3. Verify ANL agent responds with correct calculation

---

## Environment-Specific Notes

### Personal (Aragorn AI)
- Branch: `deploy/personal`
- SharePoint: Kessel Digital tenant
- Dataverse: Aragorn AI environment

### Corporate (Mastercard)
- Branch: `deploy/mastercard`
- Additional compliance requirements
- Separate Azure subscription
- VPN/network restrictions may apply

---

## Troubleshooting

### "Authentication failed"
- Verify app registration permissions
- Check client secret expiration
- Confirm tenant ID

### "SharePoint upload failed"
- Verify site URL format
- Check Sites.Selected permissions
- Confirm folder structure exists

### "Flow not triggering"
- Check HTTP trigger URL
- Verify flow is turned on
- Check connection authorizations

### "Copilot not responding"
- Verify KB sources are connected
- Check instruction character count
- Review topic configuration

---

## Rollback

To rollback to previous version:

```bash
# Revert to previous solution version
pac solution delete --solution-name KDAP_v6
pac solution import --path solutions/KDAP_v5.5_managed.zip

# Restore KB files
git checkout v5.5 -- release/v5.5/agents/*/kb/
python deploy/deploy_sharepoint.py --env personal --path release/v5.5
```

---

## Post-Deployment

### Enable Monitoring
1. Configure Application Insights
2. Set up flow run alerts
3. Enable Copilot analytics

### User Onboarding
1. Share Copilot Studio link
2. Provide user guide
3. Schedule training session

### Ongoing Maintenance
- Monthly KB updates
- Quarterly benchmark refresh
- Annual solution upgrade
