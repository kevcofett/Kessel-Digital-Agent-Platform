# VS Code: Personal Environment (Aragorn AI) Deployment

## Context
KDAP v6.0 build is complete. All code is merged to main and pushed to GitHub. Now deploy to Personal (Aragorn AI) Power Platform environment.

## Repository
- Path: `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`
- Branch: `deploy/personal`
- Tag: `v6.0.0`

---

## PHASE 1: SharePoint KB Upload

### 1.1 Identify KB Files to Upload

Upload these KB files to the Aragorn AI SharePoint knowledge base:

**EAP Shared KB (6 files):**
```
base/platform/eap/kb/EAP_KB_Data_Provenance_v1.txt
base/platform/eap/kb/EAP_KB_Confidence_Levels_v1.txt
base/platform/eap/kb/EAP_KB_Error_Handling_v1.txt
base/platform/eap/kb/EAP_KB_Formatting_Standards_v1.txt
base/platform/eap/kb/EAP_KB_Strategic_Principles_v1.txt
base/platform/eap/kb/EAP_KB_Communication_Contract_v1.txt
```

**CST Agent KB (4 files):**
```
base/agents/cst/kb/CST_KB_Consulting_Core_v1.txt
base/agents/cst/kb/CST_KB_Strategic_Frameworks_v1.txt
base/agents/cst/kb/CST_KB_Prioritization_Methods_v1.txt
base/agents/cst/kb/CST_KB_Industry_Context_v1.txt
```

**CHG Agent KB (3 files):**
```
base/agents/chg/kb/CHG_KB_Change_Core_v1.txt
base/agents/chg/kb/CHG_KB_Stakeholder_Methods_v1.txt
base/agents/chg/kb/CHG_KB_Adoption_Planning_v1.txt
```

**ANL Extension (1 file):**
```
release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt
```

**DOC Extension (1 file):**
```
release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt
```

**ORC Routing Update (1 file):**
```
release/v6.0/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt
```

### 1.2 Upload Process

1. Navigate to Aragorn AI SharePoint site
2. Go to Documents > Knowledge Base (or equivalent KB folder)
3. Upload all 16 KB files listed above
4. Verify all files uploaded successfully

---

## PHASE 2: Copilot Studio Agent Updates

### 2.1 Update ORC (Orchestrator) Agent

1. Open Copilot Studio > Aragorn AI environment
2. Select ORC agent
3. Update Instructions:
   - Copy content from: `release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt`
   - Paste into Copilot Instructions field
   - Verify character count < 8,000
4. Update Knowledge Sources:
   - Add `ORC_KB_Routing_Logic_v1.txt` from SharePoint
5. Save and Publish

### 2.2 Create CST (Consulting Strategy) Agent

1. Create new Copilot agent named "CST - Consulting Strategy"
2. Set Instructions:
   - Copy content from: `base/agents/cst/instructions/CST_Copilot_Instructions_v1.txt`
3. Add Knowledge Sources from SharePoint:
   - `CST_KB_Consulting_Core_v1.txt`
   - `CST_KB_Strategic_Frameworks_v1.txt`
   - `CST_KB_Prioritization_Methods_v1.txt`
   - `CST_KB_Industry_Context_v1.txt`
   - All 6 EAP shared KB files
4. Save and Publish

### 2.3 Create CHG (Change Management) Agent

1. Create new Copilot agent named "CHG - Change Management"
2. Set Instructions:
   - Copy content from: `base/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt`
3. Add Knowledge Sources from SharePoint:
   - `CHG_KB_Change_Core_v1.txt`
   - `CHG_KB_Stakeholder_Methods_v1.txt`
   - `CHG_KB_Adoption_Planning_v1.txt`
   - All 6 EAP shared KB files
4. Save and Publish

### 2.4 Update ANL (Analytics) Agent

1. Select existing ANL agent
2. Add Knowledge Source:
   - `ANL_KB_Financial_Investment_v1.txt`
3. Save and Publish

### 2.5 Update DOC (Document) Agent

1. Select existing DOC agent
2. Add Knowledge Source:
   - `DOC_KB_Consulting_Templates_v1.txt`
3. Save and Publish

---

## PHASE 3: Azure Functions Deployment (Personal Only)

### 3.1 Deploy Financial Calculation Functions

Functions are located at: `environments/personal/functions/`

Deploy these 4 functions to Azure:
- `anl-npv-function` - NPV calculations
- `anl-irr-function` - IRR calculations
- `anl-montecarlo-function` - Monte Carlo simulations
- `anl-sensitivity-function` - Sensitivity analysis

### 3.2 Deployment Commands

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/environments/personal/functions

# Login to Azure (if needed)
az login

# Deploy to existing Function App (or create new)
func azure functionapp publish <function-app-name>
```

### 3.3 Configure Function App Settings

Ensure these settings are configured in Azure:
- Python runtime: 3.9+
- CORS: Allow Copilot Studio origins
- Authentication: Configure as needed

---

## PHASE 4: Dataverse Updates

### 4.1 Register New Capabilities

Add these records to `eap_capability` table:

**CST Capabilities:**
| capability_code | capability_name | agent_code |
|-----------------|-----------------|------------|
| CST_FRAMEWORK_SELECT | Framework Selection | CST |
| CST_ENGAGEMENT_GUIDE | Engagement Guidance | CST |
| CST_STRATEGIC_ANALYZE | Strategic Analysis | CST |
| CST_PRIORITIZE | Prioritization | CST |

**CHG Capabilities:**
| capability_code | capability_name | agent_code |
|-----------------|-----------------|------------|
| CHG_READINESS | Readiness Assessment | CHG |
| CHG_STAKEHOLDER | Stakeholder Analysis | CHG |
| CHG_ADOPTION | Adoption Planning | CHG |

**ANL Financial Capabilities:**
| capability_code | capability_name | agent_code |
|-----------------|-----------------|------------|
| ANL_NPV | NPV Calculation | ANL |
| ANL_IRR | IRR Calculation | ANL |
| ANL_TCO | TCO Analysis | ANL |
| ANL_MONTECARLO | Monte Carlo Simulation | ANL |
| ANL_SENSITIVITY | Sensitivity Analysis | ANL |
| ANL_PAYBACK | Payback Period | ANL |

### 4.2 Load CA Framework Seed Data

Import framework records from: `base/dataverse/seed/ca_framework_seed.csv`

This adds 60 consulting framework records (DS-01 through PS-07).

---

## PHASE 5: Smoke Tests

### 5.1 ORC Routing Tests

Test these routing scenarios:
1. "Help me select a consulting framework" → Should route to CST
2. "Assess organizational readiness for change" → Should route to CHG
3. "Calculate NPV for this investment" → Should route to ANL
4. "Generate a business case document" → Should route to DOC

### 5.2 CST Agent Tests

1. "What framework should I use for market entry analysis?"
2. "Help me prioritize these strategic initiatives"
3. "Guide me through a competitive analysis"

### 5.3 CHG Agent Tests

1. "Assess stakeholder readiness for our digital transformation"
2. "Create an adoption plan for new CRM rollout"
3. "Map stakeholder influence for this change initiative"

### 5.4 ANL Financial Tests

1. "Calculate NPV with 10% discount rate, cash flows: -100K, 30K, 40K, 50K, 60K"
2. "Run sensitivity analysis on these marketing scenarios"
3. "What's the IRR for this investment?"

---

## Validation Checklist

- [ ] 16 KB files uploaded to SharePoint
- [ ] ORC agent updated with new routing rules
- [ ] CST agent created and published
- [ ] CHG agent created and published
- [ ] ANL agent updated with financial KB
- [ ] DOC agent updated with consulting templates KB
- [ ] 4 Azure Functions deployed (if applicable)
- [ ] 13 new capabilities registered in Dataverse
- [ ] 60 framework records loaded
- [ ] All smoke tests pass

---

## Rollback Plan

If issues occur:
1. Revert ORC instructions to previous version
2. Unpublish CST and CHG agents
3. Remove new KB files from SharePoint
4. Delete new capability records from Dataverse

Previous stable state: v5.5 deployment
