# KDAP v7.0 Deployment Sequence

## Overview

The KDAP v7.0 solution consists of multiple components that must be deployed in a specific order to ensure proper functionality.

## Deployment Order

### Step 1: Power Platform Solution (Dataverse Entities & Workflows)

**File:** `Consulting_and_Marketing_Agent_Platform_V7.0.zip`

**Method:** Power Platform Admin Center or `pac solution import`

```bash
pac solution import --path Consulting_and_Marketing_Agent_Platform_V7.0.zip --activate-plugins
```

**What it deploys:**
- Dataverse custom entities (eap_*, mpa_*, ca_*)
- Cloud flows (Power Automate workflows)
- Option sets
- Entity relationships

---

### Step 2: Reference Data Import

**File:** `KDAP_V7.0_Data_Import.zip`

**Method:** Configuration Migration Tool (CMT) or XrmToolBox

**CMT Steps:**
1. Download [Configuration Migration Tool](https://docs.microsoft.com/power-platform/admin/manage-configuration-data)
2. Launch DataMigrationUtility.exe
3. Select "Import data"
4. Connect to target environment
5. Select `KDAP_V7.0_Data_Import.zip`
6. Review mappings and import

**What it deploys:**
| Entity | Records | Description |
|--------|---------|-------------|
| eap_agents | 13 | Agent definitions (ORC, ANL, AUD, etc.) |
| eap_config | 13 | Platform configuration settings |
| eap_user_roles | 6 | User role definitions |
| ca_frameworks | 10 | Consulting agent frameworks |

---

### Step 3: AI Builder Prompts

**Files:**
- `ai_builder_prompts_all_agents_v7.0.json`
- `gha_ai_builder_prompts.json`

**Method:** Power Platform Maker Portal → AI Builder → Import

**Steps:**
1. Navigate to make.powerapps.com
2. Go to AI Builder → Models
3. Import each prompt JSON file
4. Activate prompts after import

---

### Step 4: Copilot Studio Agents & Topics

**Location:** `agents/` folder (13 agent directories)

**Method:** Copilot Studio Portal or `pac copilot` CLI

**Per-Agent Deployment:**
```
agents/
├── orc/  → Orchestrator agent
├── anl/  → Analytics agent
├── aud/  → Audience agent
├── cha/  → Channel agent
├── cst/  → Cost agent
├── chg/  → Change agent
├── doc/  → Document agent
├── gha/  → Growth Hacking agent
├── mkt/  → Marketing agent
├── prf/  → Performance agent
├── spo/  → Sponsorship agent
├── docs/ → Documentation agent
└── dvo/  → DevOps agent
```

**Steps for each agent:**
1. Open Copilot Studio
2. Create new agent or import existing
3. Upload agent instructions from `{agent}/instructions/`
4. Configure knowledge base files from `{agent}/kb/`
5. Import topics from `topics/all_agent_topics_v7.0.json`

---

### Step 5: Databricks Integration (Optional)

**Location:** `databricks/`

**Files:**
- `DATABRICKS_CONFIG_v7.0.md` - Configuration guide
- `DATABRICKS_INTEGRATION_SPEC_v7.0.md` - Integration specifications
- `schemas/` - Data schemas

**Method:** Follow instructions in DATABRICKS_CONFIG_v7.0.md

---

## Validation Checklist

After deployment, verify:

- [ ] All Dataverse entities created (check Advanced Find)
- [ ] Seed data imported (spot check eap_agents table)
- [ ] Cloud flows activated (Power Automate → Solutions)
- [ ] AI Builder prompts active
- [ ] Copilot agents responding correctly
- [ ] Agent handoffs working between specialists

## Rollback

If issues occur:

1. **Solution:** Delete managed solution from environment
2. **Data:** No automatic rollback - requires manual cleanup
3. **Agents:** Delete agents from Copilot Studio

## Files Reference

| File | Size | Purpose |
|------|------|---------|
| `Consulting_and_Marketing_Agent_Platform_V7.0.zip` | 250 KB | Power Platform solution |
| `KDAP_V7.0_Data_Import.zip` | 38 KB | Reference data (CMT format) |
| `ai_builder_prompts_all_agents_v7.0.json` | 30 KB | AI Builder prompts |
| `gha_ai_builder_prompts.json` | 47 KB | GHA-specific prompts |
| `agent-registry.json` | 22 KB | Agent metadata registry |

## Support

For deployment issues, check:
1. Solution import logs in Power Platform Admin Center
2. Dataverse trace logs
3. Copilot Studio conversation logs
