# ADIS VS Code Deployment Instructions

## Overview

This document provides step-by-step instructions for deploying the Audience Data Intelligence System (ADIS) to both Personal (Aragorn AI) and Mastercard environments.

## Prerequisites

- Azure CLI installed and authenticated
- Power Platform CLI (pac) installed
- Node.js 18+ for Azure Functions development
- Python 3.11+ for function execution
- Access to target Dataverse environments
- Git repository cloned and on `feature/v6.0-retrieval-enhancement` branch

## Repository Location

```
Kessel-Digital-Agent-Platform/
└── release/v5.5/agents/mpa/base/adis/
    ├── schema/           # Dataverse table definitions
    ├── functions/        # Azure Functions (Python)
    ├── flows/            # Power Automate definitions
    ├── docs/             # Knowledge Base documents
    ├── seed-data/        # Reference data CSVs
    └── tests/            # Test suite
```

---

## Phase 1: Dataverse Table Creation

### Step 1.1: Review Schema Files

Location: `release/v5.5/agents/mpa/base/adis/schema/`

Files to review:
- `ADIS_Schema_v1.json` - Upload jobs, data schemas, customer records
- `ADIS_Schema_v1_Part2.json` - Model runs, model outputs, audiences
- `ADIS_Schema_v1_Part3.json` - Audience rules, members, campaigns, performance

### Step 1.2: Create Tables in Personal Environment

```bash
# Navigate to schema directory
cd release/v5.5/agents/mpa/base/adis/schema

# Use Power Platform CLI to create tables
# Note: You may need to create a solution first or use existing MPA solution

pac auth create --environment "Aragorn AI"
pac solution init --publisher-name "KesselDigital" --publisher-prefix "mpa"

# For each table in the schema files, create using Dataverse API or Power Apps
```

Tables to create (in order due to relationships):
1. `mpa_upload_job` (depends on mpa_session)
2. `mpa_data_schema` (depends on mpa_upload_job)
3. `mpa_customer_record` (depends on mpa_upload_job)
4. `mpa_model_run` (depends on mpa_upload_job, mpa_session)
5. `mpa_model_output` (depends on mpa_model_run, mpa_customer_record)
6. `mpa_audience` (depends on mpa_model_run, mpa_session)
7. `mpa_audience_rule` (depends on mpa_audience)
8. `mpa_audience_member` (depends on mpa_audience, mpa_customer_record)
9. `mpa_campaign_audience` (depends on mpa_session, mpa_audience)
10. `mpa_performance_linkage` (depends on mpa_campaign_audience)
11. `mpa_model_catalog` (standalone reference table)

### Step 1.3: Import Seed Data

```bash
# Navigate to seed data directory
cd release/v5.5/agents/mpa/base/adis/seed-data

# Import model catalog seed
pac data import --data mpa_model_catalog_seed.csv --entity mpa_model_catalog

# Import RFM segment definitions
pac data import --data mpa_rfm_segment_seed.csv --entity mpa_rfm_segments

# Import channel affinity data
pac data import --data mpa_channel_affinity_seed.csv --entity mpa_channel_affinity

# Import channel benchmarks
pac data import --data mpa_channel_benchmark_seed.csv --entity mpa_channel_benchmarks
```

---

## Phase 2: Azure Functions Deployment

### Step 2.1: Create Azure Function App

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create --name rg-adis-personal --location eastus

# Create storage account
az storage account create \
  --name stadispersonal \
  --resource-group rg-adis-personal \
  --location eastus \
  --sku Standard_LRS

# Create Function App (Python)
az functionapp create \
  --name func-adis-personal \
  --resource-group rg-adis-personal \
  --storage-account stadispersonal \
  --consumption-plan-location eastus \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4
```

### Step 2.2: Deploy Document Parser Function

```bash
cd release/v5.5/agents/mpa/base/adis/functions/document-parser

# Install dependencies locally for testing
pip install -r requirements.txt

# Deploy to Azure
func azure functionapp publish func-adis-personal
```

### Step 2.3: Deploy Analysis Engine Function

```bash
cd release/v5.5/agents/mpa/base/adis/functions/analysis-engine

# Install dependencies (includes lifetimes, scikit-learn)
pip install -r requirements.txt

# Deploy to Azure
func azure functionapp publish func-adis-personal
```

### Step 2.4: Deploy Audience Manager Function

```bash
cd release/v5.5/agents/mpa/base/adis/functions/audience-manager

pip install -r requirements.txt
func azure functionapp publish func-adis-personal
```

### Step 2.5: Deploy AMMO Optimizer Function

```bash
cd release/v5.5/agents/mpa/base/adis/functions/ammo

pip install -r requirements.txt
func azure functionapp publish func-adis-personal
```

### Step 2.6: Verify Function Deployment

```bash
# Test health endpoints
curl https://func-adis-personal.azurewebsites.net/api/health
```

Expected response for each function:
```json
{
  "status": "healthy",
  "service": "[service name]",
  "version": "1.0"
}
```

---

## Phase 3: Power Automate Flow Import

### Step 3.1: Update Flow Parameters

Before importing, update the function URLs in each flow JSON file:

Location: `release/v5.5/agents/mpa/base/adis/flows/`

Update the `parameters` section in each file:

```json
"parameters": {
  "DocumentParserFunctionUrl": {
    "defaultValue": "https://func-adis-personal.azurewebsites.net"
  }
}
```

### Step 3.2: Import Flows

```bash
cd release/v5.5/agents/mpa/base/adis/flows

# Import each flow using Power Automate CLI or manual import
# Flow import order:
# 1. ADIS_FileUpload_Flow.json
# 2. ADIS_RunAnalysis_Flow.json
# 3. ADIS_CreateAudience_Flow.json
# 4. ADIS_OptimizeBudget_Flow.json
```

### Step 3.3: Configure Flow Connections

After import, configure:
- Dataverse connection for CRUD operations
- HTTP connector for Azure Function calls
- Copilot Studio trigger connection

---

## Phase 4: Knowledge Base Update

### Step 4.1: Copy KB Documents to SharePoint

Location: `release/v5.5/agents/mpa/base/adis/docs/`

Documents to upload:
- `ADIS_User_Guide_v1.txt`
- `ADIS_Model_Catalog_v1.txt`
- `ADIS_Schema_Reference_v1.txt`
- `ADIS_Copilot_Integration_v1.txt`
- `ADIS_Copilot_Instructions_Addendum_v1.txt`

Upload to: SharePoint site linked to Copilot Studio knowledge base

### Step 4.2: Update Copilot Studio Knowledge Sources

1. Open Copilot Studio
2. Navigate to Knowledge sources
3. Add new SharePoint document library reference
4. Verify indexing completes for all ADIS documents

### Step 4.3: Update Primary Copilot Instructions

Append ADIS integration section from `ADIS_Copilot_Instructions_Addendum_v1.txt` to the main MPA instructions, or reference it as a supplementary knowledge source.

---

## Phase 5: Testing

### Step 5.1: Run Unit Tests

```bash
cd release/v5.5/agents/mpa/base/adis/tests

# Install test dependencies
pip install pytest pandas numpy scikit-learn

# Run tests
pytest test_adis.py -v
```

### Step 5.2: End-to-End Testing

Test sequence in Copilot Studio:

1. **Upload Test**
   - Message: "I want to upload customer transaction data"
   - Upload test Excel file with customer_id, transaction_date, amount columns
   - Verify schema detection response

2. **Analysis Test**
   - Message: "Run RFM analysis on my uploaded data"
   - Verify segment distribution response

3. **Audience Test**
   - Message: "Create an audience of Champions customers"
   - Verify audience creation with channel recommendations

4. **Optimization Test**
   - Message: "Optimize my $100,000 budget across this audience"
   - Verify AMMO allocation recommendations

---

## Phase 6: Mastercard Environment (After Personal Validation)

### Additional Considerations for Mastercard:

1. **Azure Functions**: Deploy to isolated Premium tier
2. **Libraries**: Verify all Python libraries are pre-approved
3. **PII Handling**: Enable customer_key_hash generation, disable raw PII storage
4. **External APIs**: Remove web search fallbacks, use pre-loaded benchmarks only
5. **Authentication**: Configure managed identity for Dataverse access

### Mastercard-Specific Configuration

```bash
# Create Mastercard resource group
az group create --name rg-adis-mastercard --location eastus

# Use Premium isolated tier
az functionapp create \
  --name func-adis-mastercard \
  --resource-group rg-adis-mastercard \
  --storage-account stadismastercard \
  --plan asp-adis-mastercard-premium \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4
```

---

## Validation Checklist

### Personal Environment
- [ ] All 11 Dataverse tables created
- [ ] Seed data imported (4 tables)
- [ ] All 4 Azure Functions deployed and healthy
- [ ] All 4 Power Automate flows imported and active
- [ ] Knowledge base documents indexed
- [ ] Copilot instructions updated
- [ ] Unit tests passing
- [ ] End-to-end tests passing

### Mastercard Environment
- [ ] Tables created in managed Dataverse
- [ ] Functions deployed to isolated tier
- [ ] PII hashing enabled
- [ ] External API access disabled
- [ ] Flows configured with Mastercard connections
- [ ] Security review completed
- [ ] End-to-end tests passing

---

## Troubleshooting

### Function Deployment Fails
- Verify Python version is 3.11
- Check requirements.txt for incompatible packages
- Review Azure Function logs for startup errors

### Flow Import Fails
- Verify Dataverse table names match
- Check connector permissions
- Validate JSON syntax

### Schema Detection Issues
- Ensure uploaded files are not password protected
- Check file encoding (UTF-8 preferred)
- Verify file size under 250MB

### Analysis Errors
- Confirm minimum record counts are met
- Verify required columns are mapped correctly
- Check for excessive null values

---

## Support

For issues during deployment:
1. Review Azure Function logs
2. Check Power Automate flow run history
3. Verify Dataverse data using Power Apps
4. Reference ADIS documentation in `/docs/` folder
