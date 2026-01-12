# MASTERCARD BRANCH PREPARATION - DETAILED PLAN
# Leveraging Existing Project Assets

**Status:** Analysis Complete - Ready for Execution
**Existing Assets Identified:** 40+ relevant documents

---

## EXISTING ASSETS INVENTORY

### ✅ COPILOT STUDIO INSTRUCTIONS (MPA Ready)

| File | Size | Status |
|------|------|--------|
| `MPA_Copilot_Instructions_v5_7.txt` | 7.5K | ✅ Ready for Mastercard |
| `MPA_Copilot_Instructions_v5_5_FINAL.txt` | 8.0K | ✅ Backup version |
| `MPA_Copilot_Instructions_v5_6.txt` | 8.0K | ✅ Alternative |

**NEED TO CREATE:**
- [ ] CA_Copilot_Instructions_PRODUCTION.txt
- [ ] EAP_Copilot_Instructions_PRODUCTION.txt

---

### ✅ DATAVERSE SCHEMA (Complete Solution Exists)

| File | Size | Description |
|------|------|-------------|
| `customizations.xml` | 1.7MB | **Complete Dataverse solution** |
| `solution.xml` | 6.0K | Solution manifest |
| `ChatGPT_Dataverse_Table_Creation_Guide.md` | 18K | Table creation guide |
| `MPA_EAP_Complete_Table_Creation_Guide.md` | 26K | Complete table specs |
| `ChatGPT_Atlas_Table_Creation_Instructions.md` | 19K | Atlas table guide |

**STATUS:** ✅ Solution already built - just need to import

---

### ✅ POWER AUTOMATE FLOWS (Specifications Complete)

| File | Size | Description |
|------|------|-------------|
| `MPA_PowerAutomate_Complete_Specification_v7.md` | 50K | Complete flow specs |
| `ChatGPT_MPA_Flow_Build_Instructions_v7.md` | 29K | Build instructions |
| `ChatGPT_PowerAutomate_Dataverse_Prompt.md` | 17K | Dataverse integration |
| `deploy_mpa_flows_v5.py` | 111K | Automated deployment script |
| `MPA_PowerAutomate_Manual_Build_Guide.md` | 24K | Manual build guide |

**STATUS:** ✅ Flow specifications complete - deployment script exists

---

### ✅ SHAREPOINT CONFIGURATION (Guides Exist)

| File | Size | Description |
|------|------|-------------|
| `SharePoint_Complete_Taxonomy.md` | 15K | Complete folder taxonomy |
| `SharePoint_Clean_Setup_Guide.md` | 10K | Setup instructions |

**STATUS:** ✅ Documentation complete

---

### ✅ SEED DATA (All CSVs Ready)

| File | Size | Description |
|------|------|-------------|
| `mpa_benchmark_seed.csv` | 80K | Benchmark data |
| `mpa_benchmark_seed_additions.csv` | 11K | Additional benchmarks |
| `mpa_channel_seed_updated.csv` | 7.0K | Channel reference data |
| `mpa_kpi_seed_updated.csv` | 7.0K | KPI reference data |
| `mpa_vertical_seed.csv` | 1.0K | Vertical reference data |
| `MPA_Benchmark_Seed_Data.xlsx` | 53K | Excel version |

**STATUS:** ✅ All seed data ready for import

---

### ✅ MASTERCARD-SPECIFIC GUIDES

| File | Size | Description |
|------|------|-------------|
| `Mastercard_Corporate_Extensions_Guide.md` | 31K | Corporate customizations |
| `MPA_Mastercard_Placeholder_Worksheet.md` | 19K | Placeholder mappings |

**STATUS:** ✅ Corporate requirements documented

---

### ✅ DEPLOYMENT GUIDES

| File | Size | Description |
|------|------|-------------|
| `MPA_COMPLETE_STEP_BY_STEP_DEPLOYMENT_GUIDE.md` | 108K | **Master deployment guide** |
| `MPA_Manual_Setup_Instructions.md` | 37K | Manual setup steps |
| `MPA_Deployment_README.txt` | 7.0K | Deployment overview |

**STATUS:** ✅ Comprehensive deployment documentation exists

---

## GAP ANALYSIS: WHAT'S MISSING

### HIGH PRIORITY GAPS

| Gap | Required For | Estimated Effort |
|-----|--------------|------------------|
| CA Copilot Instructions | CA Mastercard deployment | 2-3 hours |
| EAP Copilot Instructions | EAP Mastercard deployment | 2-3 hours |
| Environment Toggle Code | Runtime switching | 1-2 hours |
| Branch Configuration | deploy/mastercard setup | 1 hour |

### MEDIUM PRIORITY GAPS

| Gap | Required For | Estimated Effort |
|-----|--------------|------------------|
| CA Power Automate Flows | CA workflow automation | 4-6 hours |
| EAP Power Automate Flows | EAP workflow automation | 2-4 hours |
| CA Dataverse Tables | CA data storage | 2-3 hours |
| EAP Dataverse Tables | EAP data storage | 2-3 hours |

---

## PREPARATION PHASES

### PHASE 6: Create CA & EAP Copilot Instructions

**Input Documents:**
- MPA_Copilot_Instructions_v5_7.txt (template)
- CA knowledge base files (from Consulting_Agent/kb/)
- EAP knowledge base files (from Enterprise_AI_Platform/kb/)

**Output:**
- CA_Copilot_Instructions_PRODUCTION.txt (8K char limit)
- EAP_Copilot_Instructions_PRODUCTION.txt (8K char limit)

**Constraints:**
- Maximum 8,000 characters
- Plain text only (no markdown)
- ASCII characters only
- No tables (use prose or simple lists)
- Must include: purpose, capabilities, KB usage, workflow, boundaries

---

### PHASE 7: Configure Environment Toggle System

**Purpose:** Enable runtime switching between Claude and Microsoft stacks

**Files to Create:**

```typescript
// packages/agent-core/src/config/stack-toggle.ts

export type StackType = 'claude' | 'microsoft';

export interface StackConfig {
  stack: StackType;
  
  // Claude Stack
  claude?: {
    apiKey: string;
    model: string;
  };
  
  // Microsoft Stack
  microsoft?: {
    copilotStudio: {
      environmentUrl: string;
      botId: string;
      tenantId: string;
    };
    azureOpenAI: {
      endpoint: string;
      deploymentName: string;
      apiKey: string;
    };
    dataverse: {
      environmentUrl: string;
      tenantId: string;
    };
    sharePoint: {
      siteUrl: string;
      libraryName: string;
    };
  };
}

export function getActiveStack(): StackType {
  return process.env.AGENT_STACK as StackType || 'claude';
}

export function isClaudeStack(): boolean {
  return getActiveStack() === 'claude';
}

export function isMicrosoftStack(): boolean {
  return getActiveStack() === 'microsoft';
}
```

---

### PHASE 8: Create Branch-Specific Package Configuration

**deploy/personal branch:**
```json
// package.json additions
{
  "config": {
    "stack": "claude",
    "environment": "personal"
  },
  "scripts": {
    "start": "AGENT_STACK=claude node dist/index.js",
    "eval": "AGENT_STACK=claude npx braintrust eval"
  }
}
```

**deploy/mastercard branch:**
```json
// package.json additions
{
  "config": {
    "stack": "microsoft",
    "environment": "mastercard"
  },
  "scripts": {
    "start": "AGENT_STACK=microsoft node dist/index.js",
    "deploy:dataverse": "pac solution import",
    "deploy:flows": "python deploy_mpa_flows_v5.py",
    "deploy:sharepoint": "pwsh Upload-KB-SharePoint.ps1"
  }
}
```

---

### PHASE 9: Organize Mastercard-Specific Files

**Directory Structure for deploy/mastercard:**

```
release/v5.5/
├── agents/
│   ├── mpa/
│   │   ├── mastercard/                        # NEW - Mastercard specific
│   │   │   ├── instructions/
│   │   │   │   └── MPA_Copilot_Instructions_PRODUCTION.txt
│   │   │   ├── flows/
│   │   │   │   └── (flow JSON exports)
│   │   │   ├── dataverse/
│   │   │   │   ├── solution.zip
│   │   │   │   └── seed-data/
│   │   │   └── sharepoint/
│   │   │       └── kb-manifest.json
│   │   └── base/                              # Shared code
│   │       ├── kb/
│   │       ├── rag/
│   │       └── tests/
│   ├── ca/
│   │   ├── mastercard/                        # NEW
│   │   │   ├── instructions/
│   │   │   │   └── CA_Copilot_Instructions_PRODUCTION.txt
│   │   │   └── ...
│   │   └── base/
│   └── eap/
│       ├── mastercard/                        # NEW
│       │   ├── instructions/
│       │   │   └── EAP_Copilot_Instructions_PRODUCTION.txt
│       │   └── ...
│       └── base/
└── deployment/
    └── mastercard/
        ├── DEPLOYMENT_CHECKLIST.md
        ├── ENV_TEMPLATE.env
        └── scripts/
            ├── deploy-all.ps1
            ├── deploy-dataverse.ps1
            ├── deploy-flows.ps1
            └── deploy-sharepoint.ps1
```

---

## EXECUTION PLAN

### Step 1: Read Existing Copilot Instructions
```bash
# Check current MPA instructions format
cat /mnt/project/MPA_Copilot_Instructions_v5_7.txt | head -100
```

### Step 2: Read CA Knowledge Base for Context
```bash
# Understand CA domain for instructions
ls /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/
```

### Step 3: Read EAP Knowledge Base for Context
```bash
# Understand EAP domain for instructions
ls /Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform/kb/
```

### Step 4: Generate CA Instructions
Using MPA as template, create CA-specific instructions with:
- Consulting-specific workflows
- Strategy/operations/transformation focus
- Financial services, healthcare, retail verticals
- Case study and methodology references

### Step 5: Generate EAP Instructions
Using MPA as template, create EAP-specific instructions with:
- AI platform deployment workflows
- Architecture, security, governance focus
- RAG, LLM, MLOps terminology
- Integration and infrastructure patterns

### Step 6: Create Stack Toggle Code
Implement runtime switching between Claude and Microsoft

### Step 7: Configure deploy/mastercard Branch
Set up branch-specific configurations and scripts

### Step 8: Copy Existing Assets to Mastercard Structure
Organize existing files into the mastercard/ directories

---

## VS CODE CLAUDE EXECUTION PROMPT

```
Execute Mastercard Branch Preparation.

Read MASTERCARD_BRANCH_DETAILED_PLAN.md located at:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core/MASTERCARD_BRANCH_DETAILED_PLAN.md

Phase 6: Create Copilot Instructions
1. Read MPA_Copilot_Instructions_v5_7.txt as template
2. Create CA_Copilot_Instructions_PRODUCTION.txt (8K max)
3. Create EAP_Copilot_Instructions_PRODUCTION.txt (8K max)
4. Validate both are under 8,000 characters

Phase 7: Create Stack Toggle
1. Create src/config/stack-toggle.ts
2. Update provider-factory.ts to use stack toggle
3. Add conditional provider loading

Phase 8: Configure Mastercard Branch
1. Create mastercard/ directories in each agent
2. Copy existing MPA Copilot instructions
3. Add CA and EAP instructions
4. Create deployment scripts directory

Phase 9: Update Branch Configuration
1. Modify package.json for mastercard scripts
2. Create .env.mastercard template
3. Commit to deploy/mastercard branch

Report completion status.
```

---

## DOCUMENTS I WILL CREATE

| Document | Purpose | Estimated Size |
|----------|---------|----------------|
| `PHASE_6_COPILOT_INSTRUCTIONS.md` | Create CA/EAP instructions | 2,000 lines |
| `PHASE_7_STACK_TOGGLE.md` | Runtime switching code | 500 lines |
| `PHASE_8_MASTERCARD_BRANCH_CONFIG.md` | Branch-specific setup | 800 lines |
| `CA_Copilot_Instructions_PRODUCTION.txt` | CA agent instructions | 8,000 chars |
| `EAP_Copilot_Instructions_PRODUCTION.txt` | EAP agent instructions | 8,000 chars |

---

## SUMMARY

**Already Have (Ready to Use):**
- ✅ MPA Copilot Instructions
- ✅ Complete Dataverse Solution (customizations.xml)
- ✅ Power Automate Specifications
- ✅ All Seed Data CSVs
- ✅ SharePoint Taxonomy
- ✅ Deployment Guides

**Need to Create:**
- CA Copilot Instructions
- EAP Copilot Instructions
- Stack Toggle System
- Branch-Specific Configuration

**Estimated Additional Work:** 8-10 hours

Shall I proceed with creating Phases 6-8?
