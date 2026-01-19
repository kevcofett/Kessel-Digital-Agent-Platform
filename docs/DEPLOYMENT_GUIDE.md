# KDAP v6.0 Deployment Guide

## Overview

This guide covers deployment of the Kessel Digital Agent Platform v6.0 to both Personal (Aragorn AI) and Mastercard environments.

## Prerequisites

- Power Platform CLI (pac) installed and authenticated
- Access to both target environments
- Azure subscription for Azure Functions (Personal only)
- SharePoint access for KB file hosting

## Deployment Order

1. Dataverse Schema
2. Seed Data
3. Copilot Studio Agents
4. SharePoint KB Files
5. Power Automate Flows
6. Azure Functions (Personal only)
7. Capability Registration

---

## Phase 1: Dataverse Schema Deployment

### Tables to Create

| Table | Description | File |
|-------|-------------|------|
| ca_framework | 60 consulting frameworks | base/dataverse/schema/ca_framework.json |
| ca_project | Consulting engagement tracking | base/dataverse/schema/ca_project.json |
| ca_deliverable | Consulting deliverable tracking | base/dataverse/schema/ca_deliverable.json |

### Deployment Commands

```bash
# Authenticate to Personal environment
pac auth create --name Personal --environment "Aragorn AI"

# Deploy tables (manual via Power Platform or solution import)
# Option 1: Use Power Platform Admin Center
# Option 2: Import solution containing table definitions

# Validate deployment
pac org who
```

### Validation Queries

```sql
-- Verify tables exist
SELECT COUNT(*) FROM ca_framework
SELECT COUNT(*) FROM ca_project
SELECT COUNT(*) FROM ca_deliverable
```

---

## Phase 2: Seed Data Loading

### ca_framework (60 Records)

```bash
# Source file: base/dataverse/seed/ca_framework_seed.csv
# Load via Dataverse import or Power Automate

# Category distribution:
# - Strategic: 11
# - Competitive: 6
# - Operational: 8
# - Customer: 7
# - Financial: 7
# - Change: 6
# - Planning: 8
# - Problem: 7
```

### eap_capability (15 New Records)

```bash
# Source file: base/dataverse/seed/eap_capability_ca_seed.csv

# Distribution:
# - CST: 4 capabilities
# - CHG: 3 capabilities
# - ANL: 6 capabilities (financial)
# - DOC: 2 capabilities (consulting)
```

### Validation

```sql
SELECT COUNT(*) FROM ca_framework -- Should be 60
SELECT category_code, COUNT(*) FROM ca_framework GROUP BY category_code

SELECT agent_code, COUNT(*) FROM eap_capability
WHERE capability_code LIKE 'CST_%' OR capability_code LIKE 'CHG_%'
   OR capability_code LIKE 'ANL_%' OR capability_code LIKE 'DOC_%'
GROUP BY agent_code
```

---

## Phase 3: Copilot Studio Agents

### New Agents

| Agent | Instruction File | KB Files |
|-------|------------------|----------|
| CST | base/agents/cst/instructions/CST_Copilot_Instructions_v1.txt | 4 KB files |
| CHG | base/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt | 3 KB files |

### Updated Agents

| Agent | Changes |
|-------|---------|
| ORC | Added CST/CHG routing rules |
| ANL | Added financial capabilities (NPV, IRR, TCO, etc.) |
| DOC | Added consulting templates (Business Case, Roadmap) |

### Deployment Steps

1. Navigate to Copilot Studio
2. For new agents (CST, CHG):
   - Create new agent
   - Copy instruction file content to System Instructions
   - Configure KB sources (SharePoint)
   - Link to capability dispatcher flow
3. For updated agents (ORC, ANL, DOC):
   - Update System Instructions
   - Add new KB sources if needed
   - Test routing

---

## Phase 4: SharePoint KB Files

### File Inventory

| Agent | Files | Total Size |
|-------|-------|------------|
| CST | 4 KB files | ~55KB |
| CHG | 3 KB files | ~55KB |
| EAP (shared) | 6 KB files | ~42KB |
| ANL (extension) | 1 KB file | ~20KB |
| DOC (extension) | 1 KB file | ~20KB |

### Deployment

```bash
# Upload to SharePoint document library
# Structure:
# /KDAP/KB/CST/
# /KDAP/KB/CHG/
# /KDAP/KB/EAP/
# /KDAP/KB/ANL/
# /KDAP/KB/DOC/
```

### Validation

- Verify files accessible from Copilot Studio
- Check file sizes under 200KB limit
- Test KB retrieval in test queries

---

## Phase 5: Power Automate Flows

### Capability Dispatcher Updates

Add routing for new capabilities:
- CST_FRAMEWORK_SELECT
- CST_ENGAGEMENT_GUIDE
- CST_STRATEGIC_ANALYZE
- CST_PRIORITIZE
- CHG_READINESS
- CHG_STAKEHOLDER
- CHG_ADOPTION
- ANL_NPV, ANL_IRR, ANL_TCO, ANL_MONTECARLO, ANL_SENSITIVITY, ANL_PAYBACK
- DOC_BUSINESSCASE, DOC_ROADMAP

---

## Phase 6: Azure Functions (Personal Only)

### Functions to Deploy

| Function | Endpoint | Purpose |
|----------|----------|---------|
| anl-npv | /api/anl-npv | NPV calculation |
| anl-irr | /api/anl-irr | IRR calculation |
| anl-montecarlo | /api/anl-montecarlo | Monte Carlo simulation |
| anl-sensitivity | /api/anl-sensitivity | Sensitivity analysis |

### Deployment

```bash
cd environments/personal/functions
func azure functionapp publish kdap-anl-functions
```

### Note

These functions are NOT available in Mastercard environment due to DLP restrictions.
AI Builder prompts serve as fallback.

---

## Phase 7: Capability Registration

### eap_capability_implementation

Register implementations for each capability:

**Personal Environment:**
- AI_BUILDER_PROMPT (priority 2, fallback)
- AZURE_FUNCTION (priority 1, preferred) - for ANL financial functions

**Mastercard Environment:**
- AI_BUILDER_PROMPT only (priority 1)

---

## Environment-Specific Notes

### Personal (Aragorn AI)

- Full functionality including Azure Functions
- HTTP connectors allowed
- Used for development and testing

### Mastercard

- DLP restricted - no external HTTP calls
- AI Builder prompts only for computation
- Approved connectors only
- No Azure Function access

---

## Rollback Procedures

### Agent Rollback

1. Keep previous agent versions (export before update)
2. Re-import previous solution if needed

### Database Rollback

1. Keep backup of capability registrations
2. Delete new records if rollback needed
3. Re-register previous implementations

### Function Rollback

1. Keep previous deployment package
2. Redeploy previous version via func azure functionapp publish

---

## Troubleshooting

### Agent Not Routing Correctly

1. Check ORC instruction file for routing rules
2. Verify agent codes match
3. Check capability dispatcher flow

### KB Not Retrieving

1. Verify SharePoint file accessibility
2. Check file format (must be plain text)
3. Verify Copilot Studio KB source configuration

### Azure Function Failing

1. Check function logs in Azure Portal
2. Verify input payload format
3. Check function app status

### Capability Not Executing

1. Verify capability registered in eap_capability
2. Check implementation registered in eap_capability_implementation
3. Verify is_enabled = true

---

## Support

- GitHub Issues: https://github.com/kevcofett/Kessel-Digital-Agent-Platform/issues
- Documentation: /docs/
