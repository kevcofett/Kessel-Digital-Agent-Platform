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
- **Entity Set Name (API):** Plural - `mpa_mediaplan`, `eap_session`

**Important:** When making Dataverse API calls:
- Use **plural** form in `entityName` for list/query operations
- Use **singular** form in references and relationships

## Complete Table Reference

### EAP Shared Tables (7 Tables)

MPA reads from but does not own these tables. Changes require EAP coordination.

| Logical Name | Entity Set Name | Purpose | MPA Access |
|--------------|-----------------|---------|------------|
| eap_client | eap_client | Client organizations | Read |
| eap_session | eap_session | User sessions (all agents share) | Read/Write |
| eap_learning | eap_learning | Promoted learnings from all agents | Write (promote) |
| eap_user | eap_user | User accounts | Read |
| eap_project | eap_projects | Client projects | Read |
| eap_document | eap_documents | Generated documents | Read/Write |
| eap_audit_log | eap_audit_logs | Audit trail | Write |

### MPA Core Tables (19 Tables)

Core media planning functionality owned by MPA.

| Logical Name | Entity Set Name | Purpose | Category |
|--------------|-----------------|---------|----------|
| mpa_mediaplan | mpa_mediaplan | Media plan records | Planning |
| mpa_planversion | mpa_planversion | Plan version history | Planning |
| mpa_plandata | mpa_plandata | Section data per step | Planning |
| mpa_benchmark | mpa_benchmark | Industry benchmarks | Reference |
| mpa_channel | mpa_channel | Channel definitions | Reference |
| mpa_audience | mpa_audiences | Target audience segments | Planning |
| mpa_planchannel | mpa_planchannels | Plan-channel associations | Planning |
| mpa_channelallocation | mpa_channelallocations | Budget allocation per channel | Planning |
| mpa_adpartner | mpa_adpartner | Advertising partner registry | Reference |
| mpa_planpartner | mpa_planpartner | Plan-partner associations | Planning |
| mpa_campaignperformance | mpa_campaignperformance | Performance data | Analysis |
| mpa_dataimportlog | mpa_dataimportlog | Data import tracking | Operations |
| mpa_postmortemreport | mpa_postmortemreport | Post-campaign analysis | Analysis |
| mpa_planlearning | mpa_planlearning | Plan-specific learnings | Learning |
| mpa_formtemplate | mpa_formtemplates | Form templates for input | Reference |
| mpa_user | mpa_useres | MPA user extensions | Core |
| mpa_organizations | mpa_organizationses | Organization records | Core |
| mpa_kpi | mpa_kpi | KPI definitions | Reference |
| mpa_vertical | mpa_vertical | Industry verticals | Reference |

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

The `CONFIG["tables"]` mapping provides logical-to-logical translation. When building flow definitions, append 's' for entity set names:

```python
# In CONFIG
CONFIG = {
    "tables": {
        "eap_client": "eap_client",
        "mpa_mediaplan": "mpa_mediaplan",
        ...
    }
}

# In flow definition - use plural for entityName
def get_entity_set_name(logical_name: str) -> str:
    """Convert logical name to entity set name (add 's')."""
    return f"{logical_name}s"

# Example usage
entity_name = get_entity_set_name(CONFIG["tables"]["mpa_mediaplan"])
# Returns: "mpa_mediaplan"
```

### Power Automate Flows

In flow definitions, always use the plural entity set name:

```json
{
    "type": "OpenApiConnection",
    "inputs": {
        "parameters": {
            "entityName": "mpa_mediaplan"
        }
    }
}
```

### Dataverse Direct Queries

```
/api/data/v9.2/mpa_mediaplan?$filter=mpa_status eq 100000001
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

| Date | Change | Author |
|------|--------|--------|
| 2025-12-30 | Initial documentation | MPA v5.2 Remediation |

## References

- Dataverse Schema: `specs/MediaPlanningAgent_DataverseSchema_Part[1-3].json`
- EAP Integration: `docs/EAP_MPA_Integration_Handoff.md`
- Deploy Script: `scripts/powerautomate/deploy_mpa_flows.py`
