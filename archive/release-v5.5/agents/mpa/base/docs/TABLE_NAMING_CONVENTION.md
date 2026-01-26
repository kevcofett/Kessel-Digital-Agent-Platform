# MPA Table Naming Convention

## Overview

This document defines the naming conventions for all Dataverse tables used by the Media Planning Agent (MPA) and the Enterprise AI Platform (EAP). Following these conventions ensures deployment scripts, API calls, and data queries work correctly.

## Naming Structure

### Prefix Rules

| Prefix | Meaning | Owner | Examples |
|--------|---------|-------|----------|
| `eap_` | Enterprise AI Platform (shared) | EAP | eap_session, eap_client, eap_learning |
| `mpa_` | Media Planning Agent (specific) | MPA | mpa_mediaplan, mpa_benchmark, mpa_channel |

### Singular vs Plural

- **Schema Name (Logical):** Singular - `mpa_mediaplan`, `eap_session`
- **Entity Set Name (API/Power Automate):** Plural - `mpa_mediaplans`, `eap_sessions`

**Important:** When making Dataverse API calls or configuring Power Automate flows:

- Use **plural** form in `entityName` parameter (e.g., `eap_sessions`, `mpa_mediaplans`)
- The Entity Set Name is what Power Automate uses for all Dataverse operations
- Relationships and column names remain singular (e.g., `mpa_session_id`, `_eap_clientid_value`)

## Complete Table Reference

### EAP Shared Tables (7 Tables)

MPA reads from but does not own these tables. Changes require EAP coordination.

| Logical Name | Entity Set Name | Purpose | MPA Access |
|--------------|-----------------|---------|------------|
| eap_client | eap_clients | Client organizations | Read |
| eap_session | eap_sessions | User sessions (all agents share) | Read/Write |
| eap_learning | eap_learnings | Promoted learnings from all agents | Write (promote) |
| eap_user | eap_users | User accounts | Read |
| eap_project | eap_projects | Client projects | Read |
| eap_document | eap_documents | Generated documents | Read/Write |
| eap_audit_log | eap_audit_logs | Audit trail | Write |

### MPA Core Tables (19 Tables)

Core media planning functionality owned by MPA.

| Logical Name | Entity Set Name | Purpose | Category |
|--------------|-----------------|---------|----------|
| mpa_mediaplan | mpa_mediaplans | Media plan records | Planning |
| mpa_planversion | mpa_planversions | Plan version history | Planning |
| mpa_plandata | mpa_plandatas | Section data per step | Planning |
| mpa_benchmark | mpa_benchmarks | Industry benchmarks | Reference |
| mpa_channel | mpa_channels | Channel definitions | Reference |
| mpa_audience | mpa_audiences | Target audience segments | Planning |
| mpa_planchannel | mpa_planchannels | Plan-channel associations | Planning |
| mpa_channelallocation | mpa_channelallocations | Budget allocation per channel | Planning |
| mpa_adpartner | mpa_adpartners | Advertising partner registry | Reference |
| mpa_planpartner | mpa_planpartners | Plan-partner associations | Planning |
| mpa_campaignperformance | mpa_campaignperformances | Performance data | Analysis |
| mpa_dataimportlog | mpa_dataimportlogs | Data import tracking | Operations |
| mpa_postmortemreport | mpa_postmortemreports | Post-campaign analysis | Analysis |
| mpa_planlearning | mpa_planlearnings | Plan-specific learnings | Learning |
| mpa_formtemplate | mpa_formtemplates | Form templates for input | Reference |
| mpa_user | mpa_users | MPA user extensions | Core |
| mpa_organization | mpa_organizations | Organization records | Core |
| mpa_kpi | mpa_kpis | KPI definitions | Reference |
| mpa_vertical | mpa_verticals | Industry verticals | Reference |

### MPA Additional Tables (8 Tables)

Extended functionality tables.

| Logical Name | Entity Set Name | Purpose | Category |
|--------------|-----------------|---------|----------|
| mpa_gapanalysis | mpa_gapanalyses | Gap analysis results | Analysis |
| mpa_validationgate | mpa_validationgates | Gate validation results | Workflow |
| mpa_sessioncustomization | mpa_sessioncustomizations | Session preferences | Sessions |
| mpa_learningapplication | mpa_learningapplications | Applied learnings log | Learning |
| mpa_optimizationrecommendation | mpa_optimizationrecommendations | Optimization suggestions | Analysis |
| mpa_creativespec | mpa_creativespecs | Creative specifications | Planning |
| mpa_measurementframework | mpa_measurementframeworks | Measurement config | Planning |
| mpa_competitoranalysis | mpa_competitoranalyses | Competitive data | Analysis |

## Usage in Code

### Python (deploy_mpa_flows.py)

The `CONFIG["tables"]` mapping provides logical-to-entity-set translation. Always use plural entity set names:

```python
# In CONFIG - map logical names to entity set names (plural)
CONFIG = {
    "tables": {
        "eap_client": "eap_clients",
        "eap_session": "eap_sessions",
        "mpa_mediaplan": "mpa_mediaplans",
        "mpa_benchmark": "mpa_benchmarks",
        ...
    }
}

# Example usage in flow definition
entity_name = CONFIG["tables"]["mpa_mediaplan"]
# Returns: "mpa_mediaplans"
```

### Power Automate Flows

In flow definitions, always use the **plural** entity set name:

```json
{
    "type": "OpenApiConnection",
    "inputs": {
        "parameters": {
            "entityName": "mpa_mediaplans"
        }
    }
}
```

**Correct examples:**

- `"entityName": "eap_sessions"` (not `eap_session`)
- `"entityName": "mpa_mediaplans"` (not `mpa_mediaplan`)
- `"entityName": "mpa_benchmarks"` (not `mpa_benchmark`)

### Dataverse Direct Queries

```
/api/data/v9.2/mpa_mediaplans?$filter=mpa_status eq 100000001
```

## Validation

Before deployment, verify table names match actual Dataverse schema:

1. Run `pac table list` to see deployed tables
2. Compare logical names against this document
3. Ensure entity set names use plural form

## Table Relationships

### Key Foreign Key References

| From Table | Field | To Table | Notes |
|------------|-------|----------|-------|
| mpa_mediaplan | mpa_client_id | eap_client | Client ownership |
| mpa_plandata | mpa_plan_id | mpa_mediaplan | Section belongs to plan |
| mpa_planversion | mpa_plan_id | mpa_mediaplan | Version history |
| mpa_planchannel | mpa_plan_id | mpa_mediaplan | Channel allocation |
| mpa_planchannel | mpa_channel_id | mpa_channel | Channel reference |
| mpa_campaignperformance | mpa_plan_id | mpa_mediaplan | Performance data |
| mpa_postmortemreport | mpa_plan_id | mpa_mediaplan | Analysis link |
| mpa_planlearning | mpa_plan_id | mpa_mediaplan | Learning source |

## Change Log

| Date       | Change                                                          | Author                   |
|------------|----------------------------------------------------------------|--------------------------|
| 2025-12-30 | Initial documentation                                           | MPA v5.2 Remediation     |
| 2026-01-12 | Updated all entity names to use plural form (Entity Set Names)  | Phase 10 Implementation  |

## References

- Dataverse Schema: `specs/MediaPlanningAgent_DataverseSchema_Part[1-3].json`
- EAP Integration: `docs/EAP_MPA_Integration_Handoff.md`
- Deploy Script: `scripts/powerautomate/deploy_mpa_flows.py`
