# ADIS Deployment Prompt for VS Code

## Context

ADIS (Audience Data Intelligence System) v1.0 has been built and is ready for deployment. This prompt guides deployment to Personal (Aragorn AI) and Mastercard environments.

## Repository Location

```
Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/adis/
```

## Deployment Steps

### Phase 1: Personal Environment (Aragorn AI)

#### 1.1 Dataverse Tables

Create 11 tables in this order (respects foreign key dependencies):

1. mpa_model_catalog - Model reference data
2. mpa_upload_job - Track file uploads
3. mpa_data_schema - Detected column schemas
4. mpa_customer_record - Normalized customer data
5. mpa_model_run - Analysis execution tracking
6. mpa_model_output - Per-customer analysis results
7. mpa_audience - Audience definitions
8. mpa_audience_rule - Audience filtering rules
9. mpa_audience_member - Customer-audience mapping
10. mpa_campaign_audience - Campaign budget linkage
11. mpa_performance_linkage - Actual performance data

Schema files: `base/adis/schema/ADIS_Schema_v1*.json`

#### 1.2 Seed Data Import

Import 4 CSV files to Dataverse:

```
base/adis/seed-data/mpa_model_catalog_seed.csv → mpa_model_catalog
base/adis/seed-data/mpa_rfm_segment_seed.csv → mpa_rfm_segment (reference)
base/adis/seed-data/mpa_channel_affinity_seed.csv → mpa_channel_affinity (reference)
base/adis/seed-data/mpa_channel_benchmark_seed.csv → mpa_channel_benchmark (reference)
```

#### 1.3 Azure Functions

Deploy 4 functions to Azure Function App:

```bash
# Create resource group
az group create --name rg-adis-personal --location eastus

# Create storage account
az storage account create --name stadispersonal --resource-group rg-adis-personal --sku Standard_LRS

# Create function app
az functionapp create --name func-adis-personal --resource-group rg-adis-personal --storage-account stadispersonal --consumption-plan-location eastus --runtime python --runtime-version 3.11 --functions-version 4

# Deploy each function
cd base/adis/functions/document-parser && func azure functionapp publish func-adis-personal
cd base/adis/functions/analysis-engine && func azure functionapp publish func-adis-personal
cd base/adis/functions/audience-manager && func azure functionapp publish func-adis-personal
cd base/adis/functions/ammo && func azure functionapp publish func-adis-personal
```

#### 1.4 Power Automate Flows

Import 4 flows and update function URLs:

1. ADIS_FileUpload_Flow.json
2. ADIS_RunAnalysis_Flow.json
3. ADIS_CreateAudience_Flow.json
4. ADIS_OptimizeBudget_Flow.json

Update `DocumentParserFunctionUrl`, `AnalysisEngineFunctionUrl`, `AudienceManagerFunctionUrl`, `AMMOFunctionUrl` parameters to: `https://func-adis-personal.azurewebsites.net`

#### 1.5 Knowledge Base Upload

Upload to SharePoint and add to Copilot Studio knowledge sources:

From `personal/kb/`:
- ADIS_User_Guide_v1.txt
- ADIS_Model_Catalog_v1.txt
- ADIS_Schema_Reference_v1.txt
- ADIS_Copilot_Integration_v1.txt
- ADIS_Copilot_Instructions_Addendum_v1.txt
- ADIS_Quick_Reference_v1.txt
- Analytics_Engine_v5_2.txt

#### 1.6 Copilot Studio Instructions

Update primary instructions to v6.4:
`personal/instructions/MPA_Copilot_Instructions_v6_4.txt`

Character count: 7,251 (within 7,999 limit)

#### 1.7 Testing

```bash
cd base/adis/tests
pip install pytest pandas numpy scipy scikit-learn
pytest test_adis.py -v --tb=short
```

Expected: 75+ tests passing

### Phase 2: Mastercard Environment

#### 2.1 Additional Requirements

- Enable PII hashing in all functions (set `PII_HASHING_ENABLED=true`)
- Disable external API access (set `EXTERNAL_API_ACCESS=false`)
- Use Mastercard-managed Azure resources
- Configure managed identity for function authentication

#### 2.2 Security Review

Before Mastercard deployment:
- [ ] Verify no external API calls in functions
- [ ] Confirm PII hashing is enabled
- [ ] Review data handling for compliance
- [ ] Validate library versions are approved

#### 2.3 Knowledge Base

From `mastercard/kb/`:
Same 7 documents as Personal environment

#### 2.4 Instructions

`mastercard/instructions/MPA_Copilot_Instructions_v6_4.txt`

## Validation Checklist

### Personal Environment
- [ ] 11 Dataverse tables created
- [ ] 4 seed data files imported
- [ ] 4 Azure Functions deployed and healthy
- [ ] 4 Power Automate flows imported and configured
- [ ] 7 KB documents in SharePoint
- [ ] KB sources added to Copilot Studio
- [ ] Instructions updated to v6.4
- [ ] Test suite passes

### Mastercard Environment
- [ ] All Personal steps completed
- [ ] PII hashing enabled
- [ ] External APIs disabled
- [ ] Security review completed
- [ ] Library compliance verified

## Key Files Reference

| Component | Location |
|-----------|----------|
| Build Manifest | base/adis/BUILD_MANIFEST.md |
| Deployment Guide | base/adis/VSCODE_ADIS_DEPLOYMENT_INSTRUCTIONS.md |
| Schema Files | base/adis/schema/ |
| Functions | base/adis/functions/ |
| Flows | base/adis/flows/ |
| Seed Data | base/adis/seed-data/ |
| KB Docs | personal/kb/ or mastercard/kb/ |
| Instructions v6.4 | personal/instructions/ or mastercard/instructions/ |
| Tests | base/adis/tests/ |

## Git Commits

```
f17b6ce7 feat(ADIS): Complete Audience Data Intelligence System v1.0
c4ac896b docs(ADIS): Add Copilot instructions addendum and VS Code deployment guide
94f58a54 feat(ADIS): Add deployment scripts, KB documents, and Analytics Engine integration
c3fb3d96 docs(ADIS): Add build manifest with complete inventory and deployment checklist
68dab478 feat(MPA): Add v6.4 instructions with ADIS integration and deploy KB to environments
```

## Support

If issues arise during deployment:
1. Check VSCODE_ADIS_DEPLOYMENT_INSTRUCTIONS.md troubleshooting section
2. Review Azure Function logs
3. Verify Dataverse permissions
4. Check Power Automate flow run history
