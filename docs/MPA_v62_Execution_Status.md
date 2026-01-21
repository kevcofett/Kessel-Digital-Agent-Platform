# MPA v6.2 EXECUTION STATUS

**Version:** 1.0  
**Date:** January 19, 2026  
**Status:** In Progress  
**Scope:** Azure ML Endpoints, CA Framework Library, MKT Agent Integration

---

## EXECUTION ORDER

1. **Azure ML Endpoints** - Deploy 7 ML scoring endpoints to Azure
2. **CA Framework Library** - Verify 60 frameworks loaded to Dataverse
3. **MKT Agent** - Complete deployment to Copilot Studio

---

## COMPONENT 1: AZURE ML ENDPOINTS

### Status: IN REPO - NEEDS AZURE DEPLOYMENT

**Location:** `src/azure-ml/`

### Files Present

| Category | Files | Status |
|----------|-------|--------|
| Scoring Scripts | 7 | ✅ Complete |
| Environment YAMLs | 7 | ✅ Complete |
| Training Scripts | 4 | ✅ Complete |
| Deploy Script | 1 | ✅ Complete |
| TypeScript Client | 3 | ✅ Complete |
| Tests | 3 | ✅ Complete |

### Endpoints to Deploy

| Endpoint | Scoring Script | Capability Code |
|----------|----------------|-----------------|
| kdap-budget-optimizer | score_budget_optimization.py | ANL_BUDGET_OPTIMIZE |
| kdap-propensity | score_propensity.py | AUD_PROPENSITY_SCORE |
| kdap-anomaly-detector | score_anomaly.py | PRF_ANOMALY_DETECT |
| kdap-monte-carlo | score_monte_carlo.py | ANL_MONTECARLO |
| kdap-media-mix | score_media_mix.py | ANL_MEDIA_MIX |
| kdap-attribution | score_attribution.py | PRF_ATTRIBUTION |
| kdap-prioritizer | score_prioritization.py | CST_PRIORITIZE |

### Deployment Command

```bash
cd src/azure-ml/deploy
./deploy-all.sh
```

### Prerequisites

- Azure subscription configured
- Environment variables set:
  - AZURE_SUBSCRIPTION_ID
  - AZURE_RESOURCE_GROUP (default: kdap-resource-group)
  - AZURE_ML_WORKSPACE (default: kdap-ml-workspace)
  - AZURE_REGION (default: eastus)

### KB Files Present

| File | Agent | Location |
|------|-------|----------|
| EAP_KB_ML_Model_Specifications_v1.txt | EAP | release/v6.0/platform/eap/kb/ |
| EAP_KB_Azure_ML_Integration_v1.txt | EAP | release/v6.0/platform/eap/kb/ |
| ANL_KB_ML_Budget_Optimization_v1.txt | ANL | release/v6.0/agents/anl/kb/ |
| ANL_KB_ML_Forecasting_v1.txt | ANL | release/v6.0/agents/anl/kb/ |
| AUD_KB_ML_Propensity_Scoring_v1.txt | AUD | release/v6.0/agents/aud/kb/ |
| AUD_KB_ML_Lookalike_Modeling_v1.txt | AUD | release/v6.0/agents/aud/kb/ |
| PRF_KB_Anomaly_Detection_ML_v1.0.txt | PRF | release/v6.0/agents/prf/kb/ |
| PRF_KB_Forecasting_ML_v1.0.txt | PRF | release/v6.0/agents/prf/kb/ |

---

## COMPONENT 2: CA FRAMEWORK LIBRARY

### Status: COMPLETE IN REPO - VERIFY DATAVERSE LOAD

**Seed File:** `base/dataverse/seed/ca_framework_seed.csv`

### Framework Packs (60 Total)

| Pack | Category | Frameworks | Codes |
|------|----------|------------|-------|
| 1 | Domain-Specific | 4 | DS-01 to DS-04 |
| 2 | Strategic Analysis | 7 | ST-01 to ST-07 |
| 3 | Competitive Analysis | 6 | CP-01 to CP-06 |
| 4 | Operational | 8 | OP-01 to OP-08 |
| 5 | Customer & Market | 7 | CM-01 to CM-07 |
| 6 | Business Case & Investment | 7 | BC-01 to BC-07 |
| 7 | Organizational Change | 6 | OC-01 to OC-06 |
| 8 | Strategic Planning | 8 | SP-01 to SP-08 |
| 9 | Problem Solving | 7 | PS-01 to PS-07 |

### Verification Steps

1. Check ca_framework table exists in Dataverse
2. Verify 60 records loaded
3. Confirm CST agent can query frameworks

---

## COMPONENT 3: MKT AGENT

### Status: COMPLETE IN REPO - NEEDS COPILOT DEPLOYMENT

**Location:** `base/agents/mkt/`

### Files Present

| Type | File | Status |
|------|------|--------|
| Instructions | MKT_Copilot_Instructions_v1.txt | ✅ Complete |
| KB | MKT_KB_Brand_Positioning_v1.txt | ✅ Complete |
| KB | MKT_KB_Campaign_Strategy_v1.txt | ✅ Complete |
| KB | MKT_KB_Competitive_Analysis_v1.txt | ✅ Complete |
| KB | MKT_KB_Creative_Brief_v1.txt | ✅ Complete |
| KB | MKT_KB_Creative_Briefs_v1.txt | ✅ Duplicate? |
| KB | MKT_KB_GTM_Planning_v1.txt | ✅ Complete |
| Tests | MKT_Test_Scenarios.json | ✅ Complete |

### ORC Routing

- ✅ ORC instructions updated with MKT agent
- ✅ ORC KB has MKT routing triggers

### MKT Capabilities

| Capability | Description |
|------------|-------------|
| MKT_CAMPAIGN_STRATEGY | Develop campaign strategies |
| MKT_CREATIVE_BRIEF | Create creative briefs |
| MKT_BRAND_POSITIONING | Define brand positioning |
| MKT_GTM_PLAN | Build go-to-market plans |
| MKT_COMPETITIVE_ANALYSIS | Analyze competitive landscape |

### AI Builder Prompts Present

| Prompt | Location |
|--------|----------|
| MKT_BRAND_POSITIONING_PROMPT.json | base/platform/eap/prompts/ai_builder/ |
| MKT_CAMPAIGN_STRATEGY_PROMPT.json | base/platform/eap/prompts/ai_builder/ |
| MKT_CREATIVE_BRIEF_PROMPT.json | base/platform/eap/prompts/ai_builder/ |
| MKT_GTM_PLAN_PROMPT.json | base/platform/eap/prompts/ai_builder/ |

### Deployment Steps

1. Upload KB files to SharePoint MKT folder
2. Create MKT agent in Copilot Studio
3. Paste instructions from MKT_Copilot_Instructions_v1.txt
4. Connect KB to SharePoint
5. Create AI Builder prompts from JSON definitions
6. Register capabilities in eap_capability table
7. Test routing from ORC to MKT

---

## DECISION TREE UI

### Status: IN REPO - NEEDS HOSTING DEPLOYMENT

**Location:** `src/decision-tree-ui/`

### Components

| Component | Status |
|-----------|--------|
| React Components | ✅ Complete |
| Tree Definitions | ✅ Complete |
| Type Definitions | ✅ Complete |
| Tests | ✅ Complete |

### Deployment Target

- Azure Static Web Apps
- Or embed in Copilot Studio Adaptive Cards

---

## VS CODE EXECUTION CHECKLIST

### Azure ML Deployment

```bash
# 1. Set environment variables
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_RESOURCE_GROUP="kdap-resource-group"
export AZURE_ML_WORKSPACE="kdap-ml-workspace"

# 2. Login to Azure
az login

# 3. Deploy endpoints
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/src/azure-ml/deploy
./deploy-all.sh

# 4. Verify endpoints
az ml online-endpoint list --resource-group $AZURE_RESOURCE_GROUP --workspace-name $AZURE_ML_WORKSPACE
```

### MKT Agent Deployment

```bash
# 1. Upload KB to SharePoint
# Manual: Upload files from base/agents/mkt/kb/ to SharePoint

# 2. Create AI Builder prompts
# Use pac CLI or manual creation from JSON specs

# 3. Register capabilities
# Insert into eap_capability table
```

---

## COMMITS MADE THIS SESSION

| Commit | Message |
|--------|---------|
| 25a68037 | feat(mkt): Update MKT agent instructions with enhanced structure |
| 22e649c3 | feat(orc): Add MKT agent routing to orchestrator |

---

**Next Actions:**

1. VS Code to deploy Azure ML endpoints
2. VS Code to verify ca_framework Dataverse table
3. VS Code to deploy MKT agent to Copilot Studio
4. Both to run integration tests

---

**Document Version:** 1.0  
**Created:** January 19, 2026  
**Branch:** deploy/mastercard
