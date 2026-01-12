# VS CODE DEPLOYMENT EXECUTION PROMPT
# Copy this entire prompt to VS Code to deploy to MSFT environments

---

## DEPLOYMENT EXECUTION

Read the appropriate deployment guide based on target environment:

**For Personal (Aragorn AI) Environment:**
```
/release/v5.5/deployment/personal/VSCODE_DEPLOY_TO_PERSONAL.md
```

**For Mastercard (Production) Environment:**
```
/release/v5.5/deployment/mastercard/VSCODE_DEPLOY_TO_MASTERCARD.md
```

---

## EXECUTION STEPS

### PHASE 1: ENVIRONMENT SETUP

1. Verify which environment to deploy to (ask user if unclear)

2. Check authentication status:
```bash
# Azure CLI
az account show

# Power Platform CLI  
pac auth list

# If not authenticated, prompt user to authenticate first
```

3. Load environment configuration:
```bash
# Personal
export ENVIRONMENT=personal
source .env.personal

# OR Mastercard
export ENVIRONMENT=mastercard
# Load from Key Vault (see deployment guide)
```

### PHASE 2: AUTOMATED DEPLOYMENT

Execute these scripts in order:

```bash
# 1. Validate environment
pwsh ./release/v5.5/deployment/mastercard/scripts/validate-environment.ps1 -Environment $ENVIRONMENT

# 2. Deploy SharePoint KB files
pwsh ./release/v5.5/deployment/mastercard/scripts/deploy-sharepoint.ps1 -SourcePath "./release/v5.5/agents/mpa/base/kb" -TargetFolder "MPA" -Environment $ENVIRONMENT

pwsh ./release/v5.5/deployment/mastercard/scripts/deploy-sharepoint.ps1 -SourcePath "./release/v5.5/agents/ca/base/kb" -TargetFolder "CA" -Environment $ENVIRONMENT

# 3. Deploy Dataverse tables
pwsh ./release/v5.5/deployment/mastercard/scripts/deploy-dataverse.ps1 -Environment $ENVIRONMENT

pwsh ./release/v5.5/deployment/mastercard/scripts/deploy-learning-tables.ps1 -Environment $ENVIRONMENT

# 4. Import seed data
pwsh ./release/v5.5/deployment/mastercard/scripts/import-seed-data.ps1 -DataPath "./release/v5.5/agents/mpa/base/data/seed" -Environment $ENVIRONMENT

# 5. Deploy flows
pwsh ./release/v5.5/deployment/mastercard/scripts/deploy-flows.ps1 -FlowsPath "./release/v5.5/agents/mpa/base/flows/specifications" -Environment $ENVIRONMENT

pwsh ./release/v5.5/deployment/mastercard/scripts/deploy-flows.ps1 -FlowsPath "./release/v5.5/agents/ca/base/schema/flows" -Environment $ENVIRONMENT

pwsh ./release/v5.5/deployment/mastercard/scripts/deploy-learning-flows.ps1 -Environment $ENVIRONMENT
```

### PHASE 3: REPORT AUTOMATED RESULTS

After running scripts, report:
- SharePoint: File counts per folder (MPA, CA, EAP)
- Dataverse: Tables created/updated
- Flows: Flows deployed and their status
- Any errors encountered

### PHASE 4: MANUAL STEPS REMINDER

Inform user these steps CANNOT be automated and must be done manually in Copilot Studio:

**MPA Agent:**
1. Paste instructions from: `/release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt`
2. Connect SharePoint KB (folder: MPA)
3. Create 7 topics (see MASTERCARD_FULL_DEPLOYMENT_SPECIFICATION.md Section 7)
4. Connect flows to topics
5. Test and publish

**CA Agent:**
1. Paste instructions from: `/release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt`
2. Connect SharePoint KB (folder: CA)
3. Create 8 topics (see CA_TOPIC_DEFINITIONS.md)
4. Connect flows to topics
5. Test and publish

### PHASE 5: VALIDATION

After manual steps complete, run validation:
```bash
pwsh ./release/v5.5/deployment/mastercard/scripts/test-integration.ps1 -Environment $ENVIRONMENT
```

---

## ERROR HANDLING

If any script fails:
1. Capture the full error message
2. Check authentication status
3. Verify permissions
4. Check for dependency issues
5. Report specific step that failed and error

Do NOT proceed to next step if current step fails.

---

## SCRIPT DEPENDENCIES

If scripts don't exist or fail, VS Code should create/fix them:

### deploy-sharepoint.ps1
Required parameters: -SourcePath, -TargetFolder, -Environment
Uses: PnP PowerShell (Connect-PnPOnline, Add-PnPFile)

### deploy-dataverse.ps1
Required parameters: -SolutionPath, -Environment
Uses: pac CLI (pac solution import)

### deploy-flows.ps1
Required parameters: -FlowsPath, -Environment
Uses: pac CLI (pac flow create)

### import-seed-data.ps1
Required parameters: -DataPath, -Environment
Uses: pac CLI (pac data import) or custom Dataverse API calls

### validate-environment.ps1
Required parameters: -Environment
Checks: Auth status, connectivity, permissions

### test-integration.ps1
Required parameters: -Environment
Tests: KB retrieval, flow execution, response quality

---

## FILE LOCATIONS REFERENCE

| Category | Path |
|----------|------|
| MPA KB | /release/v5.5/agents/mpa/base/kb/ |
| CA KB | /release/v5.5/agents/ca/base/kb/ |
| EAP KB | /release/v5.5/platform/eap-core/base/kb/ |
| MPA Instructions | /release/v5.5/agents/mpa/extensions/mastercard/instructions/ |
| CA Instructions | /release/v5.5/agents/ca/extensions/mastercard/instructions/ |
| MPA Flows | /release/v5.5/agents/mpa/base/flows/specifications/ |
| CA Flows | /release/v5.5/agents/ca/base/schema/flows/ |
| Seed Data | /release/v5.5/agents/mpa/base/data/seed/ |
| Scripts | /release/v5.5/deployment/mastercard/scripts/ |

---

## EXPECTED OUTCOMES

### SharePoint
- MPA folder: 32 .txt files
- CA folder: 35 .txt files  
- EAP folder: 7 .txt files (if deployed)

### Dataverse
- mpa_* tables: 29+ tables with seed data
- ca_* tables: 9 tables
- Phase 10 tables: mpa_feedback, mpa_kb_usage, mpa_success_patterns

### Power Automate
- MPA flows: 13 flows (flow_01 through flow_13)
- CA flows: 8 flows (flow_50 through flow_57)
- All flows enabled with valid connections

### Copilot Studio (Manual)
- MPA agent: Published with 7 topics
- CA agent: Published with 8 topics
- Both agents: KB connected, flows connected

---
