# Media Planning Agent (MPA) - Base Components

## Overview

The Media Planning Agent (MPA) v5.5 provides strategic media planning guidance through an intelligent advisor persona. This folder contains all base components shared across environments.

## Status

**Version:** 5.5
**Status:** Production Ready

## Component Summary

| Folder | Contents | Count |
|--------|----------|-------|
| /kb/ | Knowledge base files (.txt) | 22 |
| /copilot/ | Copilot Studio instructions | 1 |
| /flows/definitions/ | Power Automate flow JSON | 12 |
| /flows/specs/ | Flow specification docs | 11 |
| /functions/mpa_functions/ | Azure Functions | 14 |
| /cards/ | Adaptive Card templates | 6 |
| /schema/tables/ | Dataverse table schemas | 8 |
| /templates/ | Document templates | 3 |
| /data/seed/ | Seed data CSVs | 4 |
| /docs/ | MPA documentation | 18 |

## Knowledge Base Files (22 total)

### Core Instructions
- MPA_v55_Instructions_Uplift.txt (8K chars - Copilot limit)

### Strategic Framework
- MPA_Strategic_Framework_v5_5.txt
- MPA_Complete_Workflow_v5_5.txt

### Expert Lenses (4 documents)
- MPA_Expert_Lens_Budget_Allocation_v5_5.txt
- MPA_Expert_Lens_Channel_Mix_v5_5.txt
- MPA_Expert_Lens_Measurement_Attribution_v5_5.txt
- MPA_Expert_Lens_Audience_Strategy_v5_5.txt

### Implication Chains (5 documents)
- MPA_Implications_Measurement_Choices_v5_5.txt
- MPA_Implications_Budget_Decisions_v5_5.txt
- MPA_Implications_Channel_Shifts_v5_5.txt
- MPA_Implications_Timing_Pacing_v5_5.txt
- MPA_Implications_Audience_Targeting_v5_5.txt

### Reference Data
- MPA_Benchmark_Reference_v5_5.txt
- MPA_Channel_Reference_v5_5.txt
- MPA_KPI_Reference_v5_5.txt
- MPA_Vertical_Reference_v5_5.txt

### Additional Knowledge
- MPA_Conversation_Examples_v5_5.txt
- MPA_Document_Generation_Guide_v5_5.txt
- MPA_Validation_Gates_v5_5.txt
- MPA_ML_Integration_Supplement_v5_5.txt
- MPA_NonLinear_Navigation_Framework_v5_5.txt
- MPA_Dynamic_KB_Usage_Guide_v5_5.txt

## Dataverse Tables (8 total)

| Table | Purpose |
|-------|---------|
| mpa_mediaplan | Media plan header |
| mpa_plansection | Plan sections |
| mpa_channel | Channel reference |
| mpa_kpi | KPI reference |
| mpa_vertical | Industry verticals |
| mpa_benchmark | Performance benchmarks |
| mpa_budgetallocation | Budget by channel |
| mpa_projection | Performance projections |

## Power Automate Flows (12 total)

| Flow | Purpose |
|------|---------|
| mpa_initialize_session | Start new planning session |
| mpa_create_media_plan | Create plan record |
| mpa_get_benchmarks | Query benchmark data |
| mpa_calculate_projections | Performance calculations |
| mpa_generate_document | Create Word/PDF output |
| mpa_save_budget_allocation | Store budget distribution |
| mpa_validate_plan | Run validation checks |
| mpa_get_channels | Get channel list |
| mpa_get_kpis | Get KPI list |
| mpa_get_verticals | Get vertical list |
| mpa_update_plan_status | Update plan status |
| mpa_get_plan_summary | Retrieve plan summary |

## Azure Functions (14 total)

| Function | Purpose |
|----------|---------|
| mpa_calculate_cpm | CPM calculations |
| mpa_calculate_reach | Reach estimation |
| mpa_calculate_frequency | Frequency analysis |
| mpa_calculate_grps | GRP calculations |
| mpa_optimize_budget | Budget optimization |
| mpa_generate_projections | Performance projections |
| mpa_validate_plan | Plan validation |
| mpa_generate_document | Document generation |
| mpa_lookup_benchmark | Benchmark queries |
| mpa_calculate_roi | ROI calculations |
| mpa_audience_overlap | Audience analysis |
| mpa_competitive_analysis | Competitive intel |
| mpa_seasonality_adjustment | Seasonality factors |
| mpa_channel_recommendation | Channel recommendations |

## Seed Data Files (4 total)

| File | Records | Purpose |
|------|---------|---------|
| mpa_vertical_seed.csv | 23 | Industry verticals |
| mpa_channel_seed.csv | 32 | Media channels |
| mpa_kpi_seed.csv | 45 | KPI definitions |
| mpa_benchmark_seed.csv | 708 | Performance benchmarks |

## 6-Rule Compliance

All KB files comply with Copilot Studio requirements:

1. ✅ ALL-CAPS headers
2. ✅ Simple lists (no nested bullets)
3. ✅ Hyphens only (no asterisks/plus)
4. ✅ ASCII only (no Unicode/emojis)
5. ✅ Zero visual dependencies
6. ✅ Mandatory language (MUST/SHALL)

## Deployment

See [Deployment Guide](../../../docs/DEPLOYMENT_GUIDE.md) for step-by-step instructions.

## Related Documentation

- [Platform Architecture](../../../docs/PLATFORM_ARCHITECTURE.md)
- [Release Notes](../../../docs/RELEASE_NOTES.md)
- [Corporate Deployment Addendum](../../../docs/CORPORATE_DEPLOYMENT_ADDENDUM.md)
