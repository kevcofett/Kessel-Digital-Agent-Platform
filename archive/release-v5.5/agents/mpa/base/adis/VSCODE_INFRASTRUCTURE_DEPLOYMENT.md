# VS Code ADIS Infrastructure Deployment

## Overview

Deploy ADIS infrastructure to Personal (Aragorn AI) environment:
1. Dataverse tables (11 tables)
2. Azure Functions (4 functions)

## Prerequisites Check

Before starting, verify these tools are installed:

```bash
# Check Azure CLI
az --version

# Check Power Platform CLI
pac --version

# Check Azure Functions Core Tools
func --version

# Check Python
python3 --version
```

If any are missing, install them:
- Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
- Power Platform CLI: `dotnet tool install --global Microsoft.PowerApps.CLI.Tool`
- Azure Functions Core Tools: `brew install azure-functions-core-tools@4`

## Phase 1: Authentication

### 1.1 Azure Login

```bash
# Login to Azure
az login

# Set subscription (replace with your subscription ID)
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Verify
az account show
```

### 1.2 Power Platform Login

```bash
# Login to Power Platform
pac auth create --environment "https://org[YOUR_ORG_ID].crm.dynamics.com"

# List environments to verify
pac org list
```

## Phase 2: Dataverse Tables

### 2.1 Navigate to Schema Directory

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/adis
```

### 2.2 Create Tables via PAC CLI

Tables must be created in this order (foreign key dependencies):

```bash
# Table 1: mpa_model_catalog (no dependencies)
pac table create --name mpa_model_catalog --display-name "Model Catalog" --description "ADIS analytical model definitions"

# Table 2: mpa_upload_job
pac table create --name mpa_upload_job --display-name "Upload Job" --description "Track customer data file uploads"

# Table 3: mpa_data_schema
pac table create --name mpa_data_schema --display-name "Data Schema" --description "Detected column schemas from uploads"

# Table 4: mpa_customer_record
pac table create --name mpa_customer_record --display-name "Customer Record" --description "Normalized customer data"

# Table 5: mpa_model_run
pac table create --name mpa_model_run --display-name "Model Run" --description "Analysis execution tracking"

# Table 6: mpa_model_output
pac table create --name mpa_model_output --display-name "Model Output" --description "Per-customer analysis results"

# Table 7: mpa_audience
pac table create --name mpa_audience --display-name "Audience" --description "Audience segment definitions"

# Table 8: mpa_audience_rule
pac table create --name mpa_audience_rule --display-name "Audience Rule" --description "Audience filtering rules"

# Table 9: mpa_audience_member
pac table create --name mpa_audience_member --display-name "Audience Member" --description "Customer-audience mapping"

# Table 10: mpa_campaign_audience
pac table create --name mpa_campaign_audience --display-name "Campaign Audience" --description "Campaign budget allocation by audience"

# Table 11: mpa_performance_linkage
pac table create --name mpa_performance_linkage --display-name "Performance Linkage" --description "Actual performance data for attribution"
```

### 2.3 Add Columns to Tables

After tables exist, add columns. Use the schema JSON files as reference:

```bash
# Read schema for column definitions
cat schema/ADIS_Schema_v1.json | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))"
```

Key columns for each table (add via pac column create or Power Apps UI):

**mpa_upload_job columns:**
```bash
pac column create --table mpa_upload_job --name mpa_job_name --display-name "Job Name" --type Text --max-length 200
pac column create --table mpa_upload_job --name mpa_file_name --display-name "File Name" --type Text --max-length 500
pac column create --table mpa_upload_job --name mpa_file_type --display-name "File Type" --type Picklist
pac column create --table mpa_upload_job --name mpa_file_size_bytes --display-name "File Size" --type WholeNumber
pac column create --table mpa_upload_job --name mpa_processing_status --display-name "Status" --type Picklist
pac column create --table mpa_upload_job --name mpa_row_count --display-name "Row Count" --type WholeNumber
pac column create --table mpa_upload_job --name mpa_column_count --display-name "Column Count" --type WholeNumber
pac column create --table mpa_upload_job --name mpa_error_message --display-name "Error Message" --type Multiline
```

**mpa_model_output columns (critical for RFM):**
```bash
pac column create --table mpa_model_output --name mpa_segment_code --display-name "Segment Code" --type Text --max-length 50
pac column create --table mpa_model_output --name mpa_segment_name --display-name "Segment Name" --type Text --max-length 100
pac column create --table mpa_model_output --name mpa_score_primary --display-name "Primary Score" --type Decimal
pac column create --table mpa_model_output --name mpa_r_score --display-name "Recency Score" --type WholeNumber
pac column create --table mpa_model_output --name mpa_f_score --display-name "Frequency Score" --type WholeNumber
pac column create --table mpa_model_output --name mpa_m_score --display-name "Monetary Score" --type WholeNumber
pac column create --table mpa_model_output --name mpa_rfm_combined --display-name "RFM Combined" --type Text --max-length 10
pac column create --table mpa_model_output --name mpa_predicted_ltv --display-name "Predicted LTV" --type Currency
```

### 2.4 Import Seed Data

```bash
# Import model catalog seed data
pac data import --data seed-data/mpa_model_catalog_seed.csv --entity mpa_model_catalog

# Verify import
pac data export --entity mpa_model_catalog --output ./verify_model_catalog.csv
```

## Phase 3: Azure Functions

### 3.1 Create Azure Resources

```bash
# Set variables
RESOURCE_GROUP="rg-adis-personal"
LOCATION="eastus"
STORAGE_ACCOUNT="stadispersonal"
FUNCTION_APP="func-adis-personal"

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
  --functions-version 4
```

### 3.2 Configure Function App Settings

```bash
# Set environment variables
az functionapp config appsettings set \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "DATAVERSE_URL=https://org[YOUR_ORG_ID].crm.dynamics.com" \
    "PII_HASHING_ENABLED=false" \
    "EXTERNAL_API_ACCESS=true"
```

### 3.3 Deploy Functions

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/adis/functions

# Deploy document-parser
cd document-parser
pip install -r requirements.txt
func azure functionapp publish func-adis-personal
cd ..

# Deploy analysis-engine
cd analysis-engine
pip install -r requirements.txt
func azure functionapp publish func-adis-personal
cd ..

# Deploy audience-manager
cd audience-manager
pip install -r requirements.txt
func azure functionapp publish func-adis-personal
cd ..

# Deploy ammo
cd ammo
pip install -r requirements.txt
func azure functionapp publish func-adis-personal
cd ..
```

### 3.4 Verify Deployment

```bash
# Check function app status
az functionapp show --name func-adis-personal --resource-group rg-adis-personal --query "state"

# Test health endpoints
curl https://func-adis-personal.azurewebsites.net/api/health
```

## Phase 4: Verification

### 4.1 Verify Dataverse Tables

```bash
# List all tables with mpa_ prefix
pac table list | grep mpa_
```

Expected: 11 tables listed

### 4.2 Verify Azure Functions

```bash
# List deployed functions
az functionapp function list --name func-adis-personal --resource-group rg-adis-personal --output table
```

Expected functions:
- document-parser
- analysis-engine
- audience-manager
- ammo

### 4.3 Test Function Endpoints

```bash
# Test document-parser health
curl -s https://func-adis-personal.azurewebsites.net/api/health | jq

# Test analysis-engine health
curl -s https://func-adis-personal.azurewebsites.net/api/health | jq

# Test audience-manager health
curl -s https://func-adis-personal.azurewebsites.net/api/health | jq

# Test ammo health
curl -s https://func-adis-personal.azurewebsites.net/api/health | jq
```

## Troubleshooting

### Dataverse Issues

**Table creation fails:**
```bash
# Check authentication
pac auth list

# Re-authenticate if needed
pac auth create --environment "https://org[YOUR_ORG_ID].crm.dynamics.com"
```

**Column creation fails:**
- Verify table exists first
- Check column name doesn't exceed limits
- Ensure data type is valid

### Azure Function Issues

**Deployment fails:**
```bash
# Check function app logs
az functionapp log tail --name func-adis-personal --resource-group rg-adis-personal

# Check deployment status
az functionapp deployment list --name func-adis-personal --resource-group rg-adis-personal
```

**Health endpoint returns error:**
```bash
# Check function app settings
az functionapp config appsettings list --name func-adis-personal --resource-group rg-adis-personal

# Restart function app
az functionapp restart --name func-adis-personal --resource-group rg-adis-personal
```

## Next Steps After Infrastructure

1. Import Power Automate flows (4 flows)
2. Update flow parameters with function URL: `https://func-adis-personal.azurewebsites.net`
3. Upload KB documents to SharePoint
4. Update Copilot Studio instructions to v6.4
5. Run end-to-end test with sample customer file

## Environment Variables Reference

| Variable | Personal Value | Mastercard Value |
|----------|---------------|------------------|
| RESOURCE_GROUP | rg-adis-personal | rg-adis-mastercard |
| FUNCTION_APP | func-adis-personal | func-adis-mastercard |
| STORAGE_ACCOUNT | stadispersonal | stadismastercard |
| DATAVERSE_URL | Your org URL | Mastercard org URL |
| PII_HASHING_ENABLED | false | true |
| EXTERNAL_API_ACCESS | true | false |
