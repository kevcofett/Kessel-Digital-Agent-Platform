# KESSEL DIGITAL AGENT PLATFORM - MASTER BUILD PLAN

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** APPROVED - Ready for Execution  
**Scope:** Complete 10-Agent Platform with MPA + CA Integration

---

## EXECUTIVE SUMMARY

This document provides the complete build plan for the Kessel Digital Agent Platform, integrating:
- **MPA (Media Planning Agent)** - 7 specialized agents for media planning
- **CA (Consulting Agent)** - 3 additional agents for strategic consulting
- **EAP (Enterprise Agent Platform)** - Shared infrastructure layer

**Total: 10 Agents, ~160 KB files, unified architecture**

---

## PART 1: CURRENT STATE ASSESSMENT

### 1.1 Kessel-Digital-Agent-Platform Repository

**Branch:** feature/v6.0-kb-expansion

| Agent | Files | Status | Action Required |
|-------|-------|--------|-----------------|
| ORC | 5 | ✓ Complete | Add CA routing rules |
| ANL | 17 | ✓ Complete | Add financial capabilities |
| AUD | 22 | ✓ Complete | Minor updates only |
| CHA | 11 | ✓ Complete | No changes |
| SPO | 16 | ✓ Complete | No changes |
| DOC | 6 | ✓ Complete | Add CA templates |
| PRF | 25 | ✓ Complete | No changes |
| NDS | 29 | ⚠ Deprecated | Merge into ANL, then archive |
| CSO | 4 | ⚠ Deprecated | Merge into AUD, then archive |
| UDM | 8 | ⚠ Deprecated | Archive (defer to future) |
| **Total** | **143** | | |

**Missing:**
- EAP shared KB (6 files) - NOT CREATED
- CST agent (Consulting Strategy) - NOT CREATED
- CHG agent (Change Management) - NOT CREATED
- MKT agent (Market Intelligence) - NOT CREATED

### 1.2 Consulting_Agent Repository

| Category | Files | Reuse Strategy |
|----------|-------|----------------|
| FRAMEWORK_*.txt | 5 | → CST_KB + ca_framework table |
| REFERENCE_*.txt | 14 | → Shared reference library |
| REGISTRY_*.txt | 5 | → Dataverse seed data |
| BEHAVIORAL_*.txt | 2 | → CST_KB_Consulting_Core |
| CA_CONFIDENCE/DATA_SOURCE | 2 | → DELETE (use EAP KB) |
| Other operational | 7 | → CST/CHG KB consolidation |
| **Total** | **35** | |

---

## PART 2: TARGET ARCHITECTURE

### 2.1 Complete Agent Inventory (10 Agents)

```
KESSEL DIGITAL AGENT PLATFORM
├── ORCHESTRATION
│   └── ORC - Orchestrator (routes to all agents)
│
├── MPA DOMAIN (Media Planning)
│   ├── ANL - Analytics (projections, modeling, financial calcs)
│   ├── AUD - Audience (segmentation, targeting, journeys)
│   ├── CHA - Channel (media mix, allocation)
│   ├── SPO - Supply Path (programmatic optimization)
│   ├── DOC - Document (generation, export, templates)
│   └── PRF - Performance (attribution, monitoring)
│
├── CA DOMAIN (Consulting)
│   ├── CST - Consulting Strategy (frameworks, methodology)
│   └── CHG - Change Management (organizational change)
│
└── SHARED
    └── EAP - Enterprise Agent Platform (shared KB, infrastructure)
```

### 2.2 Final File Counts by Agent

| Agent | Instructions | Core KB | Deep Modules | Total |
|-------|--------------|---------|--------------|-------|
| ORC | 1 | 1 | 0 | 2 |
| ANL | 1 | 1 | 5 (+1 financial) | 7 |
| AUD | 1 | 1 | 4 | 6 |
| CHA | 1 | 1 | 3 | 5 |
| SPO | 1 | 1 | 2 | 4 |
| DOC | 1 | 1 | 2 (+1 consulting) | 4 |
| PRF | 1 | 1 | 3 | 5 |
| CST | 1 | 1 | 3 | 5 |
| CHG | 1 | 1 | 2 | 4 |
| EAP | - | - | 6 | 6 |
| **Total** | **9** | **9** | **30** | **48** |

**Note:** Existing 143 files include many tactical playbooks beyond core architecture. These are retained as supplemental content.

### 2.3 Capability Distribution

| Capability | Owner | AI Builder Prompt | Azure Function |
|------------|-------|-------------------|----------------|
| **ROUTING** |
| Intent Classification | ORC | ORC_INTENT | - |
| Gate Validation | ORC | ORC_GATE_VALIDATE | - |
| **ANALYTICS (MPA)** |
| Marginal Return | ANL | ANL_MARGINAL_RETURN | ✓ (complex math) |
| Scenario Compare | ANL | ANL_SCENARIO_COMPARE | ✓ |
| Projection | ANL | ANL_PROJECTION | ✓ |
| Bayesian Inference | ANL | ANL_BAYESIAN | ✓ |
| Causal Analysis | ANL | ANL_CAUSAL | - |
| **ANALYTICS (CA FINANCIAL)** |
| NPV Calculate | ANL | ANL_NPV | ✓ |
| IRR Calculate | ANL | ANL_IRR | ✓ |
| TCO Calculate | ANL | ANL_TCO | - |
| Monte Carlo Simulation | ANL | ANL_MONTECARLO | ✓ |
| Sensitivity Analysis | ANL | ANL_SENSITIVITY | ✓ |
| Payback Period | ANL | ANL_PAYBACK | - |
| **AUDIENCE** |
| Segment Priority | AUD | AUD_SEGMENT_PRIORITY | - |
| LTV Assessment | AUD | AUD_LTV_ASSESS | ✓ |
| Journey State | AUD | AUD_JOURNEY_STATE | - |
| Propensity Score | AUD | AUD_PROPENSITY | ✓ |
| **CHANNEL** |
| Channel Mix | CHA | CHA_CHANNEL_MIX | - |
| Channel Select | CHA | CHA_CHANNEL_SELECT | - |
| **SUPPLY PATH** |
| Fee Waterfall | SPO | SPO_FEE_WATERFALL | - |
| Partner Score | SPO | SPO_PARTNER_SCORE | - |
| NBI Calculate | SPO | SPO_NBI | - |
| **DOCUMENT** |
| Generate Document | DOC | DOC_GENERATE | - |
| Template Select | DOC | DOC_TEMPLATE_SELECT | - |
| Generate Business Case | DOC | DOC_BUSINESSCASE | - |
| Generate Roadmap | DOC | DOC_ROADMAP | - |
| **PERFORMANCE** |
| Anomaly Detection | PRF | PRF_ANOMALY | ✓ |
| Attribution Analysis | PRF | PRF_ATTRIBUTION | - |
| Incrementality | PRF | PRF_INCREMENTALITY | - |
| **CONSULTING STRATEGY** |
| Framework Select | CST | CST_FRAMEWORK_SELECT | - |
| Engagement Guide | CST | CST_ENGAGEMENT_GUIDE | - |
| Strategic Analysis | CST | CST_STRATEGIC_ANALYZE | - |
| Prioritization | CST | CST_PRIORITIZE | - |
| **CHANGE MANAGEMENT** |
| Readiness Assessment | CHG | CHG_READINESS | - |
| Stakeholder Mapping | CHG | CHG_STAKEHOLDER | - |
| Adoption Planning | CHG | CHG_ADOPTION | - |

**Summary:** 35 capabilities, 35 AI Builder prompts, 12 Azure Functions

---

## PART 3: DATAVERSE SCHEMA

### 3.1 Existing Tables (No Changes)

- eap_agent
- eap_capability
- eap_capability_implementation
- eap_prompt
- eap_test_case
- eap_telemetry
- mpa_channel
- mpa_kpi
- mpa_benchmark
- mpa_vertical
- mpa_partner

### 3.2 New Tables Required

**ca_framework** (Reference data for 60 consulting frameworks)
```
ca_framework_id (PK, Autonumber)
framework_code (Text, 20, Unique) - "SWOT", "PORTER_5F"
framework_name (Text, 100)
category_code (Choice) - Strategic, Financial, Operational, Customer, Change, Problem
complexity_level (Choice) - Standard, Advanced, Expert
description (Text, 500)
when_to_use (Text, 1000)
typical_duration (Text, 50)
is_active (Boolean)
display_order (Integer)
```

**ca_project** (Consulting engagement tracking)
```
ca_project_id (PK, GUID)
ca_project_name (Text, 200)
ca_client_name (Text, 200)
ca_industry_code (Lookup → mpa_vertical)
ca_engagement_type (Choice) - Assessment, Strategy, Transformation, Due Diligence
ca_status (Choice) - Discovery, Analysis, Recommendations, Roadmap, Complete
eap_session_id (Lookup → eap_session)
created_on (DateTime)
modified_on (DateTime)
```

**ca_deliverable** (Consulting deliverable tracking)
```
ca_deliverable_id (PK, GUID)
ca_project_id (Lookup → ca_project)
ca_deliverable_type (Choice) - Analysis, Business Case, Roadmap, Presentation, Report
ca_framework_used (Text, 100)
ca_status (Choice) - Draft, Review, Final
ca_file_url (Text, 500)
created_on (DateTime)
```

---

## PART 4: CONTENT MIGRATION MAP

### 4.1 NDS → ANL Migration (Archive After)

| NDS File | → ANL Target |
|----------|--------------|
| NDS_KB_Marginal_Return_*.txt | ANL_KB_Budget_Optimization_v1.txt (merge) |
| NDS_KB_Spend_NoSpend_*.txt | ANL_KB_Causal_Incrementality_v1.txt (merge) |
| NDS_KB_Multi_Input_*.txt | ANL_KB_Analytics_Core_v1.txt (merge) |
| NDS_KB_Risk_Adjusted_*.txt | ANL_KB_Budget_Optimization_v1.txt (merge) |
| NDS_KB_Budget_Response_*.txt | ANL_KB_Budget_Optimization_v1.txt (merge) |
| All other NDS files | Archive to /archive/nds/ |

### 4.2 CSO → AUD Migration (Archive After)

| CSO File | → AUD Target |
|----------|--------------|
| CSO_KB_Journey_State_*.txt | AUD_KB_Journey_Orchestration_v1.txt (merge) |
| CSO_KB_NBA_*.txt | AUD_KB_Journey_Orchestration_v1.txt (merge) |
| CSO_KB_Sequence_*.txt | AUD_KB_Journey_Orchestration_v1.txt (merge) |
| All other CSO files | Archive to /archive/cso/ |

### 4.3 CA Repo → Platform Migration

| CA Repo File | → Platform Target |
|--------------|-------------------|
| FRAMEWORK_Library_Master_v1.txt | ca_framework table (seed data) |
| FRAMEWORK_Consulting_Tools_v1.txt | CST_KB_Strategic_Frameworks_v1.txt |
| FRAMEWORK_Enterprise_Tools_v1.txt | CST_KB_Strategic_Frameworks_v1.txt |
| FRAMEWORK_Advanced_Analytics_v1.txt | ANL_KB_Financial_Investment_v1.txt |
| CA_CONFIDENCE_LEVELS_v1.txt | DELETE (use EAP_KB_Confidence_Levels) |
| CA_DATA_SOURCE_HIERARCHY_v1.txt | DELETE (use EAP_KB_Data_Provenance) |
| BEHAVIORAL_*.txt | CST_KB_Consulting_Core_v1.txt |
| INDUSTRY_Expertise_Guide_v1.txt | CST_KB_Industry_Context_v1.txt |
| REFERENCE_*.txt | Shared reference library (platform/shared/reference/) |
| REGISTRY_Benchmarks_*.txt | Dataverse seed data enhancement |
| REGISTRY_URLs_*.txt | Dataverse seed data enhancement |
| CUSTOM_FRAMEWORK_GUIDE_v1.txt | CST_KB_Consulting_Core_v1.txt |
| RESEARCH_QUALITY_INDICATORS_v1.txt | EAP_KB_Data_Provenance_v1.txt |
| SOURCE_QUALITY_TIERS_v1.txt | EAP_KB_Data_Provenance_v1.txt |

### 4.4 UDM Disposition

| Action | Files |
|--------|-------|
| Archive to /archive/udm/ | All 8 UDM files |
| Rationale | Specialized NLP/unstructured data capabilities deferred to future release |

---

## PART 5: NEW CONTENT TO CREATE

### 5.1 EAP Shared KB (6 files) - REQUIRED

| File | Size | Source |
|------|------|--------|
| EAP_KB_Data_Provenance_v1.txt | 15K | New + CA sources |
| EAP_KB_Confidence_Levels_v1.txt | 12K | New + CA sources |
| EAP_KB_Error_Handling_v1.txt | 10K | New |
| EAP_KB_Formatting_Standards_v1.txt | 8K | New (6-Rule Framework) |
| EAP_KB_Strategic_Principles_v1.txt | 12K | New |
| EAP_KB_Communication_Contract_v1.txt | 10K | New |

### 5.2 CST Agent (5 files) - REQUIRED

| File | Size | Source |
|------|------|--------|
| CST_Copilot_Instructions_v1.txt | 8K | New |
| CST_KB_Consulting_Core_v1.txt | 25K | Consolidate CA behavioral + methodology |
| CST_KB_Strategic_Frameworks_v1.txt | 22K | Consolidate CA FRAMEWORK_*.txt |
| CST_KB_Prioritization_Methods_v1.txt | 18K | New (RICE, weighted matrix, MoSCoW) |
| CST_KB_Industry_Context_v1.txt | 15K | From CA INDUSTRY_Expertise_Guide |

### 5.3 CHG Agent (4 files) - REQUIRED

| File | Size | Source |
|------|------|--------|
| CHG_Copilot_Instructions_v1.txt | 8K | New |
| CHG_KB_Change_Core_v1.txt | 22K | New (Kotter, ADKAR, Lewin, Bridges) |
| CHG_KB_Stakeholder_Methods_v1.txt | 18K | New |
| CHG_KB_Adoption_Planning_v1.txt | 15K | New |

### 5.4 ANL Extensions (1 file) - REQUIRED

| File | Size | Source |
|------|------|--------|
| ANL_KB_Financial_Investment_v1.txt | 22K | New + CA FRAMEWORK_Advanced_Analytics |

### 5.5 DOC Extensions (1 file) - REQUIRED

| File | Size | Source |
|------|------|--------|
| DOC_KB_Consulting_Templates_v1.txt | 18K | New (business case, roadmap templates) |

### 5.6 ORC Extensions - UPDATE ONLY

| File | Action |
|------|--------|
| ORC_Copilot_Instructions_v1.txt | Add CST, CHG routing rules |
| ORC_KB_Routing_Logic_v1.txt | Add CA intent patterns |

---

## PART 6: REPOSITORY STRUCTURE (FINAL)

```
Kessel-Digital-Agent-Platform/
├── base/
│   ├── agents/
│   │   ├── orc/           # Orchestrator
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── anl/           # Analytics (MPA + CA financial)
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── aud/           # Audience
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── cha/           # Channel
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── spo/           # Supply Path
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── doc/           # Document (MPA + CA templates)
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── prf/           # Performance
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   ├── cst/           # Consulting Strategy (NEW)
│   │   │   ├── instructions/
│   │   │   └── kb/
│   │   └── chg/           # Change Management (NEW)
│   │       ├── instructions/
│   │       └── kb/
│   │
│   ├── platform/
│   │   └── eap/
│   │       ├── kb/        # Shared KB (6 files)
│   │       ├── prompts/   # AI Builder prompt definitions
│   │       └── flows/     # Power Automate flow definitions
│   │
│   ├── shared/
│   │   └── reference/     # Shared reference content (from CA)
│   │
│   └── dataverse/
│       ├── schema/
│       └── seed/
│           ├── eap_*.csv
│           ├── mpa_*.csv
│           └── ca_*.csv   # NEW: ca_framework seed
│
├── environments/
│   ├── mastercard/
│   │   ├── seed/
│   │   └── config/
│   └── personal/
│       ├── functions/     # Azure Functions
│       ├── seed/
│       └── config/
│
├── archive/               # Deprecated agent content
│   ├── nds/
│   ├── cso/
│   └── udm/
│
└── docs/
    ├── architecture/
    ├── operations/
    └── planning/
```

---

## PART 7: SEQUENTIAL BUILD PLAN

### Phase 1: Foundation & Cleanup (Days 1-2)

| Task | Owner | Description |
|------|-------|-------------|
| 1.1 | VS Code | Create archive directories, move NDS/CSO/UDM |
| 1.2 | VS Code | Create EAP KB directory structure |
| 1.3 | VS Code | Create CST and CHG agent directory structure |
| 1.4 | VS Code | Create shared/reference directory |
| 1.5 | VS Code | Copy CA reference files to shared/reference |
| 1.6 | VS Code | Create ca_framework Dataverse schema |
| 1.7 | VS Code | Generate ca_framework seed CSV from FRAMEWORK_Library_Master |

### Phase 2: EAP Shared KB (Days 3-4)

| Task | Owner | Description |
|------|-------|-------------|
| 2.1 | Desktop | Create EAP_KB_Data_Provenance_v1.txt |
| 2.2 | Desktop | Create EAP_KB_Confidence_Levels_v1.txt |
| 2.3 | Desktop | Create EAP_KB_Error_Handling_v1.txt |
| 2.4 | Desktop | Create EAP_KB_Formatting_Standards_v1.txt |
| 2.5 | Desktop | Create EAP_KB_Strategic_Principles_v1.txt |
| 2.6 | Desktop | Create EAP_KB_Communication_Contract_v1.txt |
| 2.7 | VS Code | Commit and push EAP KB files |

### Phase 3: ANL & DOC Extensions (Days 5-6)

| Task | Owner | Description |
|------|-------|-------------|
| 3.1 | Desktop | Create ANL_KB_Financial_Investment_v1.txt |
| 3.2 | Desktop | Create DOC_KB_Consulting_Templates_v1.txt |
| 3.3 | VS Code | Commit and push extension files |

### Phase 4: CST Agent (Days 7-9)

| Task | Owner | Description |
|------|-------|-------------|
| 4.1 | Desktop | Create CST_Copilot_Instructions_v1.txt |
| 4.2 | Desktop | Create CST_KB_Consulting_Core_v1.txt |
| 4.3 | Desktop | Create CST_KB_Strategic_Frameworks_v1.txt |
| 4.4 | Desktop | Create CST_KB_Prioritization_Methods_v1.txt |
| 4.5 | Desktop | Create CST_KB_Industry_Context_v1.txt |
| 4.6 | VS Code | Commit and push CST agent files |

### Phase 5: CHG Agent (Days 10-11)

| Task | Owner | Description |
|------|-------|-------------|
| 5.1 | Desktop | Create CHG_Copilot_Instructions_v1.txt |
| 5.2 | Desktop | Create CHG_KB_Change_Core_v1.txt |
| 5.3 | Desktop | Create CHG_KB_Stakeholder_Methods_v1.txt |
| 5.4 | Desktop | Create CHG_KB_Adoption_Planning_v1.txt |
| 5.5 | VS Code | Commit and push CHG agent files |

### Phase 6: ORC Updates (Day 12)

| Task | Owner | Description |
|------|-------|-------------|
| 6.1 | Desktop | Update ORC_Copilot_Instructions_v1.txt (add CST, CHG routing) |
| 6.2 | Desktop | Update ORC_KB_Routing_Logic_v1.txt (add CA intent patterns) |
| 6.3 | VS Code | Commit and push ORC updates |

### Phase 7: Dataverse & Capabilities (Days 13-15)

| Task | Owner | Description |
|------|-------|-------------|
| 7.1 | VS Code | Deploy ca_framework, ca_project, ca_deliverable tables |
| 7.2 | VS Code | Load ca_framework seed data (60 frameworks) |
| 7.3 | VS Code | Add CST capabilities to eap_capability |
| 7.4 | VS Code | Add CHG capabilities to eap_capability |
| 7.5 | VS Code | Add ANL financial capabilities to eap_capability |
| 7.6 | VS Code | Add DOC consulting capabilities to eap_capability |

### Phase 8: AI Builder Prompts (Days 16-18)

| Task | Owner | Description |
|------|-------|-------------|
| 8.1 | VS Code | Create CST AI Builder prompts (4) |
| 8.2 | VS Code | Create CHG AI Builder prompts (3) |
| 8.3 | VS Code | Create ANL financial prompts (6) |
| 8.4 | VS Code | Create DOC consulting prompts (2) |
| 8.5 | VS Code | Register all prompts in eap_prompt table |

### Phase 9: Azure Functions - Personal (Days 19-21)

| Task | Owner | Description |
|------|-------|-------------|
| 9.1 | VS Code | Create ANL_NPV function |
| 9.2 | VS Code | Create ANL_IRR function |
| 9.3 | VS Code | Create ANL_MONTECARLO function |
| 9.4 | VS Code | Create ANL_SENSITIVITY function |
| 9.5 | VS Code | Deploy functions to Azure |
| 9.6 | VS Code | Register implementations in eap_capability_implementation |

### Phase 10: Testing & Validation (Days 22-24)

| Task | Owner | Description |
|------|-------|-------------|
| 10.1 | VS Code | Create CST test scenarios |
| 10.2 | VS Code | Create CHG test scenarios |
| 10.3 | VS Code | Run full routing tests |
| 10.4 | VS Code | Run capability tests |
| 10.5 | Both | Fix any issues |

### Phase 11: Deployment (Days 25-27)

| Task | Owner | Description |
|------|-------|-------------|
| 11.1 | VS Code | Deploy to Personal environment |
| 11.2 | VS Code | Run smoke tests (Personal) |
| 11.3 | VS Code | Deploy to Mastercard environment |
| 11.4 | VS Code | Run smoke tests (Mastercard) |
| 11.5 | Both | Documentation finalization |

---

## PART 8: DETAILED PROMPTS

### PHASE 1 PROMPTS

#### Prompt 1.1-1.5: VS Code - Foundation Setup
```
TASK: Foundation Setup for Kessel Digital Agent Platform

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE THESE STEPS IN ORDER:

1. CREATE ARCHIVE DIRECTORIES
mkdir -p archive/nds archive/cso archive/udm

2. MOVE DEPRECATED AGENTS TO ARCHIVE
mv release/v6.0/agents/nds/* archive/nds/
mv release/v6.0/agents/cso/* archive/cso/
mv release/v6.0/agents/udm/* archive/udm/
rmdir release/v6.0/agents/nds release/v6.0/agents/cso release/v6.0/agents/udm

3. CREATE NEW AGENT DIRECTORIES
mkdir -p base/agents/cst/instructions base/agents/cst/kb
mkdir -p base/agents/chg/instructions base/agents/chg/kb

4. CREATE EAP KB DIRECTORY
mkdir -p base/platform/eap/kb base/platform/eap/prompts base/platform/eap/flows

5. CREATE SHARED REFERENCE DIRECTORY
mkdir -p base/shared/reference

6. COPY CA REFERENCE FILES
cp /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/REFERENCE_*.txt base/shared/reference/

7. COMMIT
git add -A
git commit -m "chore: Foundation setup - archive deprecated agents, create new structure"
git push origin feature/v6.0-kb-expansion

VALIDATION:
- archive/ contains nds/, cso/, udm/ with files
- base/agents/ contains cst/, chg/ directories
- base/platform/eap/kb/ exists
- base/shared/reference/ contains REFERENCE_*.txt files
```

#### Prompt 1.6-1.7: VS Code - Dataverse Schema
```
TASK: Create CA Dataverse Schema and Seed Data

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

1. CREATE ca_framework SCHEMA FILE

Create file: base/dataverse/schema/ca_framework.json

{
  "table_name": "ca_framework",
  "display_name": "CA Framework",
  "description": "Reference data for 60 consulting frameworks",
  "columns": [
    {"name": "ca_framework_id", "type": "Autonumber", "primary_key": true},
    {"name": "framework_code", "type": "Text", "max_length": 20, "required": true, "unique": true},
    {"name": "framework_name", "type": "Text", "max_length": 100, "required": true},
    {"name": "category_code", "type": "Choice", "options": ["Strategic", "Competitive", "Operational", "Customer", "Financial", "Change", "Planning", "Problem"]},
    {"name": "complexity_level", "type": "Choice", "options": ["Standard", "Advanced", "Expert"]},
    {"name": "description", "type": "Text", "max_length": 500},
    {"name": "when_to_use", "type": "Text", "max_length": 1000},
    {"name": "typical_duration", "type": "Text", "max_length": 50},
    {"name": "is_active", "type": "Boolean", "default": true},
    {"name": "display_order", "type": "Integer"}
  ]
}

2. PARSE FRAMEWORK_Library_Master_v1.txt AND GENERATE SEED CSV

Read: /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Library_Master_v1.txt
Generate: base/dataverse/seed/ca_framework_seed.csv

CSV should have 60 rows with columns:
framework_code,framework_name,category_code,complexity_level,description,when_to_use,is_active,display_order

Include all frameworks from these categories:
- Domain-Specific (4): DS-01 to DS-04
- Strategic Analysis (7): ST-01 to ST-07
- Competitive Analysis (6): CP-01 to CP-06
- Operational (8): OP-01 to OP-08
- Customer & Market (7): CM-01 to CM-07
- Business Case & Investment (7): BC-01 to BC-07
- Organizational Change (6): OC-01 to OC-06
- Strategic Planning (8): SP-01 to SP-08
- Problem Solving (7): PS-01 to PS-07

3. COMMIT
git add base/dataverse/
git commit -m "feat(dataverse): Add ca_framework schema and seed data"
git push origin feature/v6.0-kb-expansion
```

### PHASE 2 PROMPTS

#### Prompt 2.1: Desktop - EAP_KB_Data_Provenance
```
TASK: Create EAP_KB_Data_Provenance_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Data_Provenance_v1.txt

INCORPORATE CONTENT FROM:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/CA_DATA_SOURCE_HIERARCHY_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/SOURCE_QUALITY_TIERS_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/RESEARCH_QUALITY_INDICATORS_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 15,000 characters
- Must cover: Source hierarchy, quality tiers, citation requirements, provenance tracking

STRUCTURE:
1. DATA SOURCE HIERARCHY
   - Primary sources (1P data, direct measurement)
   - Secondary sources (industry reports, benchmarks)
   - Tertiary sources (aggregated, derived)
   
2. QUALITY TIERS
   - Tier 1: Audited, verified, contractual
   - Tier 2: Published, attributed, recent
   - Tier 3: Estimated, modeled, aged

3. CITATION REQUIREMENTS
   - When citation is mandatory
   - Citation format standards
   - Source attribution rules

4. PROVENANCE TRACKING
   - Data lineage documentation
   - Transformation logging
   - Confidence degradation rules

CRITICAL: This file is used by ALL agents. Must be complete and authoritative.
```

#### Prompt 2.2: Desktop - EAP_KB_Confidence_Levels
```
TASK: Create EAP_KB_Confidence_Levels_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Confidence_Levels_v1.txt

INCORPORATE CONTENT FROM:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/CA_CONFIDENCE_LEVELS_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 12,000 characters
- Must cover: Confidence bands, uncertainty communication, when to caveat

STRUCTURE:
1. CONFIDENCE BAND DEFINITIONS
   - HIGH (85-100%): Strong evidence, multiple sources, recent data
   - MEDIUM (60-84%): Good evidence, some assumptions
   - LOW (40-59%): Limited evidence, significant assumptions
   - SPECULATIVE (<40%): Insufficient data, directional only

2. UNCERTAINTY COMMUNICATION
   - Language patterns for each band
   - When to use ranges vs point estimates
   - Mandatory caveats by confidence level

3. CONFIDENCE CALCULATION
   - Data recency factor
   - Source quality factor
   - Sample size factor
   - Methodology rigor factor

4. PRESENTATION STANDARDS
   - Visual indicators for confidence
   - Required disclosures
   - Escalation thresholds

CRITICAL: This file is used by ALL agents. Must be complete and authoritative.
```

#### Prompt 2.3: Desktop - EAP_KB_Error_Handling
```
TASK: Create EAP_KB_Error_Handling_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Error_Handling_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 10,000 characters
- Must cover: Graceful degradation, fallback patterns, error messaging

STRUCTURE:
1. ERROR CATEGORIES
   - Data errors (missing, invalid, stale)
   - Capability errors (timeout, unavailable)
   - Routing errors (unknown intent, ambiguous)
   - User errors (insufficient input, invalid request)

2. GRACEFUL DEGRADATION PATTERNS
   - Primary → Fallback capability routing
   - Partial results with disclosure
   - Estimation when exact unavailable

3. USER-FACING ERROR MESSAGES
   - Constructive error language (never blame user)
   - What went wrong (brief)
   - What user can do (actionable)
   - What agent will try instead

4. ESCALATION RULES
   - When to ask for clarification
   - When to offer alternatives
   - When to acknowledge limitation

CRITICAL: This file is used by ALL agents. Must be complete and authoritative.
```

#### Prompt 2.4: Desktop - EAP_KB_Formatting_Standards
```
TASK: Create EAP_KB_Formatting_Standards_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Formatting_Standards_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 8,000 characters
- Must cover: 6-Rule Framework, document standards, output formatting

STRUCTURE:
1. THE 6-RULE COMPLIANCE FRAMEWORK
   - Rule 1: ALL-CAPS HEADERS for section titles
   - Rule 2: HYPHENS-ONLY LISTS (no bullets, no numbers)
   - Rule 3: ASCII CHARACTERS ONLY (no em-dashes, smart quotes)
   - Rule 4: ZERO VISUAL DEPENDENCIES (content works without formatting)
   - Rule 5: MANDATORY LANGUAGE (must, shall, always, never)
   - Rule 6: PROFESSIONAL TONE (clear, authoritative)

2. DOCUMENT TYPE STANDARDS
   - Knowledge Base files: 6-Rule compliant, max 36K chars
   - Instruction files: 6-Rule compliant, max 8K chars
   - User-facing documents: Standard markdown permitted
   - Deliverables: Full formatting, professional styling

3. OUTPUT FORMATTING
   - Response structure patterns
   - When to use tables vs prose
   - Number formatting standards
   - Date/time formatting

4. CHARACTER LIMIT ENFORCEMENT
   - KB files: 36,000 characters maximum
   - Instruction files: 8,000 characters maximum
   - Chunking strategy for large content

CRITICAL: This file is used by ALL agents. Must be complete and authoritative.
```

#### Prompt 2.5: Desktop - EAP_KB_Strategic_Principles
```
TASK: Create EAP_KB_Strategic_Principles_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Strategic_Principles_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 12,000 characters
- Must cover: Platform philosophy, guardrails, approach standards

STRUCTURE:
1. PLATFORM PHILOSOPHY
   - Strategic advisor, not compliance enforcer
   - Strong opinions, loosely held
   - Customers over transactions
   - Incrementality-first measurement
   - Net economics over gross figures

2. GUARDRAILS
   - What agents must never do
   - Required disclosures
   - Escalation triggers
   - User autonomy respect

3. APPROACH STANDARDS
   - Evidence-based recommendations
   - Multiple options when uncertainty exists
   - Trade-off acknowledgment
   - Long-term thinking over short-term

4. QUALITY MARKERS
   - Completeness checklist
   - Consistency requirements
   - Actionability standards

CRITICAL: This file is used by ALL agents. Must be complete and authoritative.
```

#### Prompt 2.6: Desktop - EAP_KB_Communication_Contract
```
TASK: Create EAP_KB_Communication_Contract_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Communication_Contract_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 10,000 characters
- Must cover: Inter-agent protocol, request/response format, handoff rules

STRUCTURE:
1. INTER-AGENT REQUEST FORMAT
   - Required fields: source_agent, target_agent, capability_code, inputs_json
   - Optional fields: priority, timeout, context
   - Session continuity requirements

2. INTER-AGENT RESPONSE FORMAT
   - Required fields: status, result_json, confidence_level
   - Error response structure
   - Partial result handling

3. HANDOFF RULES
   - When to route vs handle locally
   - Context preservation requirements
   - User transparency during handoffs

4. ORCHESTRATOR PROTOCOL
   - Intent classification contract
   - Multi-agent coordination
   - Response aggregation rules

CRITICAL: This file is used by ALL agents. Must be complete and authoritative.
```

#### Prompt 2.7: VS Code - Commit EAP KB
```
TASK: Commit and Push EAP KB Files

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify files exist
ls -la base/platform/eap/kb/

# Should show 6 files:
# EAP_KB_Data_Provenance_v1.txt
# EAP_KB_Confidence_Levels_v1.txt
# EAP_KB_Error_Handling_v1.txt
# EAP_KB_Formatting_Standards_v1.txt
# EAP_KB_Strategic_Principles_v1.txt
# EAP_KB_Communication_Contract_v1.txt

# Validate each file for 6-Rule compliance (no em-dashes, smart quotes, etc.)
for f in base/platform/eap/kb/*.txt; do
  if grep -P '[–—""'']' "$f"; then
    echo "FAIL: $f contains non-ASCII characters"
  else
    echo "PASS: $f"
  fi
done

# Commit
git add base/platform/eap/kb/
git commit -m "feat(eap): Add shared KB files for platform-wide standards"
git push origin feature/v6.0-kb-expansion
```

### PHASE 3 PROMPTS

#### Prompt 3.1: Desktop - ANL_KB_Financial_Investment
```
TASK: Create ANL_KB_Financial_Investment_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt

INCORPORATE CONTENT FROM:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Advanced_Analytics_v1.txt
- MPA_v6_CA_Framework_Expansion.md (Financial Analysis Models section)

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 22,000 characters
- Must cover: NPV, IRR, TCO, payback, sensitivity, Monte Carlo

STRUCTURE:
1. NET PRESENT VALUE (NPV) METHODOLOGY
   - Discount rate selection
   - Cash flow projection
   - Terminal value calculation
   - Sensitivity to rate changes

2. INTERNAL RATE OF RETURN (IRR)
   - IRR calculation approach
   - Multiple IRR handling
   - MIRR when appropriate
   - IRR vs NPV decision rules

3. TOTAL COST OF OWNERSHIP (TCO)
   - Lifecycle phases
   - Hidden cost identification
   - Opportunity cost inclusion
   - TCO vs purchase price framing

4. PAYBACK PERIOD ANALYSIS
   - Simple payback calculation
   - Discounted payback
   - Break-even analysis
   - Payback limitations

5. SENSITIVITY ANALYSIS
   - Tornado diagram methodology
   - Spider diagram methodology
   - Key variable identification
   - Scenario definition (base/bull/bear)

6. MONTE CARLO SIMULATION
   - Input distribution selection
   - Iteration count guidance
   - Output interpretation
   - Confidence interval reporting

7. INVESTMENT DECISION FRAMEWORK
   - When to use which method
   - Combined analysis approach
   - Presentation to stakeholders

CRITICAL: This extends ANL's analytical capabilities for consulting use cases.
```

#### Prompt 3.2: Desktop - DOC_KB_Consulting_Templates
```
TASK: Create DOC_KB_Consulting_Templates_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 18,000 characters
- Must cover: Business case, roadmap, assessment report templates

STRUCTURE:
1. BUSINESS CASE DOCUMENT STRUCTURE
   - Executive summary (1 page)
   - Problem statement
   - Proposed solution
   - Financial analysis (NPV, IRR, payback)
   - Risk assessment
   - Implementation approach
   - Recommendation
   - Appendices

2. IMPLEMENTATION ROADMAP STRUCTURE
   - Executive overview
   - Current state summary
   - Future state vision
   - Phased approach (phases, milestones, dependencies)
   - Resource requirements
   - Risk mitigation
   - Success metrics
   - Governance model

3. ASSESSMENT REPORT STRUCTURE
   - Executive summary
   - Methodology
   - Current state analysis
   - Gap analysis
   - Findings and observations
   - Recommendations (prioritized)
   - Quick wins vs long-term
   - Next steps

4. TEMPLATE SELECTION LOGIC
   - When to use business case vs assessment
   - Combining templates
   - Customization guidance

5. FORMATTING STANDARDS
   - Section length guidelines
   - Visual element placement
   - Data presentation standards

CRITICAL: This extends DOC's generation capabilities for consulting deliverables.
```

#### Prompt 3.3: VS Code - Commit ANL & DOC Extensions
```
TASK: Commit and Push ANL and DOC Extension Files

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify files exist
ls -la release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt
ls -la release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt

# Validate 6-Rule compliance
for f in release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt; do
  if grep -P '[–—""'']' "$f"; then
    echo "FAIL: $f contains non-ASCII characters"
  else
    echo "PASS: $f"
  fi
done

# Commit
git add release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt
git add release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt
git commit -m "feat(anl,doc): Add financial investment and consulting template KB extensions"
git push origin feature/v6.0-kb-expansion
```

### PHASE 4 PROMPTS

#### Prompt 4.1: Desktop - CST_Copilot_Instructions
```
TASK: Create CST_Copilot_Instructions_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/instructions/CST_Copilot_Instructions_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 8,000 characters MAXIMUM (Copilot Studio limit)
- Must define: Agent identity, capabilities, routing, behavior

STRUCTURE:
1. AGENT IDENTITY
   - Name: CST (Consulting Strategy Agent)
   - Role: Strategic framework selection and consulting methodology guidance
   - Domain: Strategic analysis, prioritization, consulting engagement

2. CAPABILITIES
   - CST_FRAMEWORK_SELECT: Recommend frameworks for challenge type
   - CST_ENGAGEMENT_GUIDE: Guide discovery → assessment → recommendations → roadmap
   - CST_STRATEGIC_ANALYZE: Apply strategic frameworks
   - CST_PRIORITIZE: RICE, weighted matrix, MoSCoW scoring

3. ROUTING RULES
   - Financial calculations → Route to ANL
   - Document generation → Route to DOC
   - Change management → Route to CHG
   - Strategic analysis → Handle locally

4. BEHAVIOR GUIDELINES
   - Always ask clarifying questions before framework selection
   - Present 2-3 framework options with trade-offs
   - Explain why a framework fits the situation
   - Reference ca_framework table for framework details

5. KB RETRIEVAL
   - Always retrieve CST_KB_Consulting_Core for methodology
   - Retrieve CST_KB_Strategic_Frameworks for framework application
   - Retrieve CST_KB_Prioritization_Methods for scoring requests

CRITICAL: Must be under 8,000 characters. Count carefully.
```

#### Prompt 4.2: Desktop - CST_KB_Consulting_Core
```
TASK: Create CST_KB_Consulting_Core_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/kb/CST_KB_Consulting_Core_v1.txt

INCORPORATE CONTENT FROM:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/BEHAVIORAL_Research_Routing_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/BEHAVIORAL_Service_Availability_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/CUSTOM_FRAMEWORK_GUIDE_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 25,000 characters
- Must cover: Consulting methodology, engagement phases, discovery process

STRUCTURE:
1. CONSULTING ENGAGEMENT MODEL
   - Phase 1: Discovery (understand the problem)
   - Phase 2: Assessment (analyze current state)
   - Phase 3: Recommendations (develop solutions)
   - Phase 4: Roadmap (plan implementation)

2. DISCOVERY METHODOLOGY
   - Stakeholder identification
   - Problem framing techniques
   - Scope definition
   - Success criteria establishment

3. ASSESSMENT APPROACH
   - Data gathering methods
   - Current state documentation
   - Gap analysis framework
   - Finding synthesis

4. RECOMMENDATION DEVELOPMENT
   - Option generation
   - Evaluation criteria
   - Trade-off analysis
   - Prioritization approach

5. ROADMAP CREATION
   - Phasing strategy
   - Dependency mapping
   - Resource estimation
   - Risk identification

6. FRAMEWORK SELECTION PRINCIPLES
   - Match framework to problem type
   - Consider complexity level
   - Combine frameworks when appropriate
   - Customize standard frameworks

CRITICAL: This is the CORE KB - always retrieved for CST queries.
```

#### Prompt 4.3: Desktop - CST_KB_Strategic_Frameworks
```
TASK: Create CST_KB_Strategic_Frameworks_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/kb/CST_KB_Strategic_Frameworks_v1.txt

INCORPORATE CONTENT FROM:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Library_Master_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Consulting_Tools_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Enterprise_Tools_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 22,000 characters
- Must cover: How to APPLY each framework category (not just list them)

NOTE: Framework METADATA (names, codes, descriptions) lives in ca_framework Dataverse table.
This KB covers APPLICATION GUIDANCE.

STRUCTURE:
1. STRATEGIC ANALYSIS FRAMEWORKS
   - SWOT application methodology
   - PESTEL analysis process
   - Scenario planning facilitation
   - Porter's Five Forces deep dive

2. COMPETITIVE ANALYSIS FRAMEWORKS
   - Competitor profiling template
   - Strategic group mapping process
   - Positioning map creation
   - Win-loss analysis approach

3. GROWTH STRATEGY FRAMEWORKS
   - Ansoff matrix application
   - BCG matrix scoring
   - GE-McKinsey nine-box process

4. OPERATIONAL FRAMEWORKS
   - Value chain analysis steps
   - Process mapping methodology
   - Root cause analysis techniques

5. CUSTOMER FRAMEWORKS
   - Journey mapping facilitation
   - Jobs-to-be-Done interview guide
   - Kano model survey design

6. FRAMEWORK COMBINATION PATTERNS
   - Common framework sequences
   - Complementary framework pairs
   - Framework selection decision tree

CRITICAL: Focus on HOW TO APPLY, not framework definitions.
```

#### Prompt 4.4: Desktop - CST_KB_Prioritization_Methods
```
TASK: Create CST_KB_Prioritization_Methods_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/kb/CST_KB_Prioritization_Methods_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 18,000 characters
- Must cover: RICE, weighted matrix, MoSCoW, effort-impact, dependency mapping

STRUCTURE:
1. RICE SCORING METHODOLOGY
   - Reach: How to estimate affected users/customers
   - Impact: Scoring scale (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)
   - Confidence: Percentage based on evidence quality
   - Effort: Person-months estimation
   - RICE formula: (Reach x Impact x Confidence) / Effort
   - Interpreting RICE scores

2. WEIGHTED DECISION MATRIX
   - Criteria identification
   - Weight assignment (must sum to 100%)
   - Scoring scale definition
   - Weighted score calculation
   - Sensitivity analysis on weights

3. MOSCOW PRIORITIZATION
   - Must have: Non-negotiable requirements
   - Should have: Important but not critical
   - Could have: Desirable if resources allow
   - Won't have: Explicitly out of scope
   - Stakeholder alignment process

4. EFFORT-IMPACT MATRIX
   - Quick wins (low effort, high impact)
   - Major projects (high effort, high impact)
   - Fill-ins (low effort, low impact)
   - Thankless tasks (high effort, low impact)

5. DEPENDENCY MAPPING
   - Identifying dependencies
   - Critical path analysis
   - Sequencing constraints
   - Parallel vs sequential execution

6. METHOD SELECTION GUIDE
   - When to use RICE vs weighted matrix
   - Combining methods
   - Stakeholder presentation approaches

CRITICAL: Include formulas and calculation examples.
```

#### Prompt 4.5: Desktop - CST_KB_Industry_Context
```
TASK: Create CST_KB_Industry_Context_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/kb/CST_KB_Industry_Context_v1.txt

INCORPORATE CONTENT FROM:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/INDUSTRY_Expertise_Guide_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 15,000 characters
- Must cover: Industry context for consulting recommendations

STRUCTURE:
1. INDUSTRY CLASSIFICATION
   - Mapping to mpa_vertical codes
   - Industry-specific considerations
   - Regulatory landscape by industry

2. INDUSTRY TRENDS AWARENESS
   - Technology disruption patterns
   - Market consolidation trends
   - Emerging business models

3. INDUSTRY-SPECIFIC FRAMEWORKS
   - Retail: Customer-centric frameworks
   - Financial Services: Risk and compliance focus
   - Technology: Innovation and agility frameworks
   - Healthcare: Patient journey and compliance
   - CPG: Supply chain and brand frameworks

4. BENCHMARK CONTEXTUALIZATION
   - Industry benchmark interpretation
   - Peer group definition
   - Performance gap analysis

5. REGULATORY CONSIDERATIONS
   - Privacy regulations by industry
   - Compliance requirements
   - Risk mitigation frameworks

CRITICAL: Connect to mpa_vertical for consistency.
```

#### Prompt 4.6: VS Code - Commit CST Agent
```
TASK: Commit and Push CST Agent Files

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify files exist
ls -la base/agents/cst/instructions/
ls -la base/agents/cst/kb/

# Should show:
# CST_Copilot_Instructions_v1.txt (instructions/)
# CST_KB_Consulting_Core_v1.txt (kb/)
# CST_KB_Strategic_Frameworks_v1.txt (kb/)
# CST_KB_Prioritization_Methods_v1.txt (kb/)
# CST_KB_Industry_Context_v1.txt (kb/)

# Validate 6-Rule compliance
for f in base/agents/cst/instructions/*.txt base/agents/cst/kb/*.txt; do
  if grep -P '[–—""'']' "$f"; then
    echo "FAIL: $f contains non-ASCII characters"
  else
    echo "PASS: $f"
  fi
done

# Check instruction file size (must be <= 8000 chars)
wc -c base/agents/cst/instructions/CST_Copilot_Instructions_v1.txt

# Commit
git add base/agents/cst/
git commit -m "feat(cst): Add Consulting Strategy agent with instructions and KB"
git push origin feature/v6.0-kb-expansion
```

### PHASE 5 PROMPTS

#### Prompt 5.1: Desktop - CHG_Copilot_Instructions
```
TASK: Create CHG_Copilot_Instructions_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 8,000 characters MAXIMUM (Copilot Studio limit)
- Must define: Agent identity, capabilities, routing, behavior

STRUCTURE:
1. AGENT IDENTITY
   - Name: CHG (Change Management Agent)
   - Role: Organizational change methodology and adoption planning
   - Domain: Change readiness, stakeholder management, adoption

2. CAPABILITIES
   - CHG_READINESS: Assess organizational change readiness
   - CHG_STAKEHOLDER: Map and analyze stakeholders
   - CHG_ADOPTION: Create adoption and rollout plans

3. ROUTING RULES
   - Strategic frameworks → Route to CST
   - Document generation → Route to DOC
   - Financial analysis → Route to ANL
   - Change methodology → Handle locally

4. BEHAVIOR GUIDELINES
   - Acknowledge change is about people, not just process
   - Always consider resistance and adoption barriers
   - Recommend communication strategies
   - Connect to business outcomes

5. KB RETRIEVAL
   - Always retrieve CHG_KB_Change_Core for methodology
   - Retrieve CHG_KB_Stakeholder_Methods for stakeholder analysis
   - Retrieve CHG_KB_Adoption_Planning for rollout planning

CRITICAL: Must be under 8,000 characters. Count carefully.
```

#### Prompt 5.2: Desktop - CHG_KB_Change_Core
```
TASK: Create CHG_KB_Change_Core_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/chg/kb/CHG_KB_Change_Core_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 22,000 characters
- Must cover: Kotter, ADKAR, Lewin, Bridges, McKinsey 7-S for change

STRUCTURE:
1. KOTTERS 8-STEP CHANGE MODEL
   - Step 1: Create urgency
   - Step 2: Form powerful coalition
   - Step 3: Create vision for change
   - Step 4: Communicate the vision
   - Step 5: Remove obstacles
   - Step 6: Create short-term wins
   - Step 7: Build on the change
   - Step 8: Anchor changes in culture
   - Application guidance for each step

2. ADKAR MODEL
   - Awareness: Why change is needed
   - Desire: Personal motivation to change
   - Knowledge: How to change
   - Ability: Skills and behaviors
   - Reinforcement: Sustaining change
   - Assessment approach for each element

3. LEWINS CHANGE MODEL
   - Unfreeze: Preparing for change
   - Change: Implementing change
   - Refreeze: Embedding change
   - Force field analysis integration

4. BRIDGES TRANSITION MODEL
   - Ending: Letting go of old ways
   - Neutral zone: In-between state
   - New beginning: Embracing new way
   - Emotional journey mapping

5. MCKINSEY 7-S FOR CHANGE
   - Strategy alignment
   - Structure implications
   - Systems changes
   - Shared values evolution
   - Skills requirements
   - Staff considerations
   - Style adaptation

6. MODEL SELECTION GUIDE
   - When to use which model
   - Combining models
   - Organization size considerations

CRITICAL: This is the CORE KB - always retrieved for CHG queries.
```

#### Prompt 5.3: Desktop - CHG_KB_Stakeholder_Methods
```
TASK: Create CHG_KB_Stakeholder_Methods_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/chg/kb/CHG_KB_Stakeholder_Methods_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 18,000 characters
- Must cover: Stakeholder identification, analysis, engagement, communication

STRUCTURE:
1. STAKEHOLDER IDENTIFICATION
   - Categories: Sponsors, champions, influencers, affected parties
   - Identification techniques
   - Stakeholder inventory template

2. STAKEHOLDER ANALYSIS
   - Power/interest grid
   - Influence/impact matrix
   - Support/opposition assessment
   - RACI for change initiatives

3. STAKEHOLDER MAPPING
   - Visualization techniques
   - Relationship mapping
   - Coalition building opportunities

4. ENGAGEMENT STRATEGIES
   - High power, high interest: Manage closely
   - High power, low interest: Keep satisfied
   - Low power, high interest: Keep informed
   - Low power, low interest: Monitor

5. COMMUNICATION PLANNING
   - Message customization by stakeholder
   - Channel selection
   - Frequency guidelines
   - Feedback loops

6. RESISTANCE MANAGEMENT
   - Types of resistance
   - Root cause analysis for resistance
   - Intervention strategies
   - Converting resistors to supporters

CRITICAL: Include practical templates and examples.
```

#### Prompt 5.4: Desktop - CHG_KB_Adoption_Planning
```
TASK: Create CHG_KB_Adoption_Planning_v1.txt

OUTPUT PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/chg/kb/CHG_KB_Adoption_Planning_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 15,000 characters
- Must cover: Rollout planning, training, sustainment, measurement

STRUCTURE:
1. ROLLOUT STRATEGY
   - Big bang vs phased rollout
   - Pilot selection criteria
   - Geographic vs functional rollout
   - Timing considerations

2. TRAINING APPROACH
   - Training needs assessment
   - Delivery methods (instructor-led, e-learning, blended)
   - Train-the-trainer programs
   - Just-in-time training

3. CHANGE NETWORK
   - Change champion selection
   - Change agent roles
   - Super user programs
   - Peer support networks

4. SUSTAINMENT PLANNING
   - Reinforcement mechanisms
   - Performance support tools
   - Continuous improvement cycles
   - Success celebration

5. ADOPTION METRICS
   - Leading indicators (training completion, system usage)
   - Lagging indicators (productivity, quality)
   - Adoption curves
   - Target setting

6. RISK MITIGATION
   - Common adoption risks
   - Contingency planning
   - Escalation paths
   - Recovery strategies

CRITICAL: Include practical checklists and templates.
```

#### Prompt 5.5: VS Code - Commit CHG Agent
```
TASK: Commit and Push CHG Agent Files

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify files exist
ls -la base/agents/chg/instructions/
ls -la base/agents/chg/kb/

# Should show:
# CHG_Copilot_Instructions_v1.txt (instructions/)
# CHG_KB_Change_Core_v1.txt (kb/)
# CHG_KB_Stakeholder_Methods_v1.txt (kb/)
# CHG_KB_Adoption_Planning_v1.txt (kb/)

# Validate 6-Rule compliance
for f in base/agents/chg/instructions/*.txt base/agents/chg/kb/*.txt; do
  if grep -P '[–—""'']' "$f"; then
    echo "FAIL: $f contains non-ASCII characters"
  else
    echo "PASS: $f"
  fi
done

# Check instruction file size (must be <= 8000 chars)
wc -c base/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt

# Commit
git add base/agents/chg/
git commit -m "feat(chg): Add Change Management agent with instructions and KB"
git push origin feature/v6.0-kb-expansion
```

### PHASE 6 PROMPTS

#### Prompt 6.1-6.2: Desktop - ORC Updates
```
TASK: Update ORC Agent for CA Routing

FILES TO UPDATE:
1. /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt
2. /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt

UPDATES REQUIRED:

For ORC_Copilot_Instructions_v1.txt, ADD to routing rules section:
---
CONSULTING STRATEGY ROUTING
- Framework selection, consulting methodology, prioritization → CST
- Intent patterns: framework, prioritize, RICE, SWOT, strategic analysis, assessment

CHANGE MANAGEMENT ROUTING
- Organizational change, stakeholder, adoption, rollout → CHG
- Intent patterns: change management, stakeholder, adoption, resistance, rollout
---

For ORC_KB_Routing_Logic_v1.txt, ADD new section:
---
CA DOMAIN ROUTING

CST AGENT TRIGGERS
- User asks about frameworks or methodology
- User needs prioritization help
- User requests strategic analysis
- Keywords: framework, SWOT, Porter, RICE, prioritize, assess, strategic

CHG AGENT TRIGGERS
- User asks about change management
- User needs stakeholder analysis
- User requests adoption planning
- Keywords: change, stakeholder, adoption, rollout, resistance, communication plan

MULTI-AGENT CA SCENARIOS
- Business case: CST (framework) → ANL (financials) → DOC (document)
- Transformation: CST (assessment) → CHG (change plan) → DOC (roadmap)
---

CRITICAL: Preserve existing content, only ADD new sections. Verify character count stays under limits.
```

#### Prompt 6.3: VS Code - Commit ORC Updates
```
TASK: Commit and Push ORC Updates

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify files were updated
git diff release/v6.0/agents/orc/

# Check instruction file size (must be <= 8000 chars)
wc -c release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt

# Commit
git add release/v6.0/agents/orc/
git commit -m "feat(orc): Add CST and CHG routing rules for CA integration"
git push origin feature/v6.0-kb-expansion
```

### PHASE 7-11 PROMPTS

[Phases 7-11 contain VS Code-only tasks for Dataverse deployment, AI Builder prompts, Azure Functions, testing, and deployment. These prompts will be provided in a separate document: KDAP_Phase7-11_VSCode_Prompts.md]

---

## PART 9: SUCCESS CRITERIA

### 9.1 Phase Completion Checklist

| Phase | Deliverables | Validation |
|-------|--------------|------------|
| 1 | Archive created, directories setup | `ls archive/` shows nds/, cso/, udm/ |
| 2 | 6 EAP KB files | All files exist, 6-Rule compliant |
| 3 | ANL + DOC extensions | 2 new KB files, 6-Rule compliant |
| 4 | CST agent complete | 5 files, instruction < 8K chars |
| 5 | CHG agent complete | 4 files, instruction < 8K chars |
| 6 | ORC updated | Routing includes CST, CHG |
| 7 | Dataverse deployed | 3 new tables, seed data loaded |
| 8 | AI Builder prompts | 15 new prompts registered |
| 9 | Azure Functions | 4 financial functions deployed |
| 10 | Tests passing | All routing + capability tests pass |
| 11 | Deployed | Both environments live |

### 9.2 Final Metrics

| Metric | Target |
|--------|--------|
| Total Agents | 10 (ORC, ANL, AUD, CHA, SPO, DOC, PRF, CST, CHG + archived UDM) |
| Active KB Files | ~55 core files + ~100 supplemental |
| EAP Shared KB | 6 files |
| AI Builder Prompts | 35 total |
| Azure Functions | 12 total |
| Capabilities | 35 total |
| Dataverse Tables | 14 total |

---

## APPENDIX: QUICK REFERENCE

### Agent Codes
- ORC: Orchestrator
- ANL: Analytics
- AUD: Audience
- CHA: Channel
- SPO: Supply Path Optimization
- DOC: Document
- PRF: Performance
- CST: Consulting Strategy
- CHG: Change Management

### Repository Paths
- Main repo: `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`
- CA repo (source): `/Users/kevinbauer/Kessel-Digital/Consulting_Agent`
- Branch: `feature/v6.0-kb-expansion`

### Key Constraints
- Instruction files: 8,000 characters max
- KB files: 36,000 characters max
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only, ASCII only

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Status:** APPROVED - Ready for Execution
