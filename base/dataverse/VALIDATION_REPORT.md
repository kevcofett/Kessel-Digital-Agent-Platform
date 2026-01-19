# Dataverse Schema and Seed Data Validation Report

**Generated:** 2026-01-18  
**Repository:** Kessel-Digital-Agent-Platform  
**Branch:** feature/v6.0-kb-expansion  
**Status:** ✅ VALIDATED (with documentation notes)

---

## Executive Summary

All 15 Dataverse table schemas and 13 seed files have been comprehensively validated:
- ✅ All column types match expected formats
- ✅ All required columns have data in every row
- ✅ All choice fields use numeric codes
- ✅ No completely empty columns in any seed file
- ✅ All foreign key references are valid
- ✅ All schema table_name values match filenames
- ⚠️ Documentation files have some plural/singular inconsistencies (does not affect functionality)

---

## Table Inventory

### EAP Platform Tables (7)

| Table | Schema | Seed | Rows | Status |
|-------|--------|------|------|--------|
| eap_agent | ✅ | ✅ | 8 | Valid |
| eap_capability | ✅ | ✅ | 20 | Valid |
| eap_capability_implementation | ✅ | ✅ | 47 | Valid |
| eap_prompt | ✅ | ✅ | 19 | Valid |
| eap_session | ✅ | ✅ | 5 | Valid |
| eap_test_case | ✅ | ✅ | 15 | Valid |
| eap_telemetry | ✅ | ⏭️ | N/A | Valid (runtime) |

### MPA Domain Tables (5)

| Table | Schema | Seed | Rows | Status |
|-------|--------|------|------|--------|
| mpa_vertical | ✅ | ✅ | 15 | Valid |
| mpa_channel | ✅ | ✅ | 30 | Valid |
| mpa_kpi | ✅ | ✅ | 24 | Valid |
| mpa_benchmark | ✅ | ✅ | 31 | Valid |
| mpa_partner | ✅ | ✅ | 20 | Valid |

### CA Domain Tables (3)

| Table | Schema | Seed | Rows | Status |
|-------|--------|------|------|--------|
| ca_framework | ✅ | ✅ | 60 | Valid |
| ca_project | ✅ | ⏭️ | N/A | Valid (transactional) |
| ca_deliverable | ✅ | ⏭️ | N/A | Valid (transactional) |

---

## Validation Results

### CHECK 1: Empty Column Validation ✅

All columns have at least one value. Partially empty columns are expected for optional fields:

| Table | Partially Empty Columns (Expected) |
|-------|-----------------------------------|
| eap_agent | fallback_agent_code, effective_to |
| eap_capability_implementation | fallback_implementation_id |
| eap_prompt | few_shot_examples |
| eap_session | completed_at |
| eap_test_case | Various expected_* fields |
| mpa_vertical | parent_vertical_code |

### CHECK 2: Foreign Key Validation ✅

All foreign key references are valid:

| Seed File | Column | References | Status |
|-----------|--------|------------|--------|
| eap_capability | agent_code | eap_agent | ✅ |
| eap_capability_implementation | capability_code | eap_capability | ✅ |
| eap_prompt | agent_code | eap_agent | ✅ |
| eap_session | agent_code | eap_agent | ✅ |
| eap_test_case | agent_code | eap_agent | ✅ |
| eap_test_case | capability_code | eap_capability | ✅ |
| eap_test_case | expected_agent_code | eap_agent | ✅ |
| eap_test_case | expected_capability_code | eap_capability | ✅ |
| mpa_benchmark | vertical_code | mpa_vertical | ✅ |
| mpa_benchmark | channel_code | mpa_channel | ✅ |
| mpa_benchmark | kpi_code | mpa_kpi | ✅ |
| eap_agent | fallback_agent_code | eap_agent | ✅ |

### CHECK 3: Lookup Table References ✅

All schema lookup references point to valid tables:

| Schema | Column | Target Table | Status |
|--------|--------|--------------|--------|
| ca_project | session_id | eap_session | ✅ |
| ca_deliverable | project_id | ca_project | ✅ |
| eap_capability_implementation | fallback_implementation_id | eap_capability_implementation | ✅ |

### CHECK 4: Schema-Filename Consistency ✅

All 15 schemas have table_name matching filename.

---

## Naming Convention Summary

### CORRECT: Table Logical Names (Singular)

All table names are correctly singular:
- eap_agent, eap_capability, eap_capability_implementation
- eap_prompt, eap_session, eap_telemetry, eap_test_case
- mpa_benchmark, mpa_channel, mpa_kpi, mpa_partner, mpa_vertical
- ca_framework, ca_project, ca_deliverable

### CORRECT: Entity Set Names in APIs/Flows (Plural)

Power Automate and Dataverse API use plural entity set names:
- `"entityName": "eap_sessions"` ← Correct in flow JSON files
- Web API: `/api/data/v9.2/mpa_benchmarks` ← Correct

### DOCUMENTATION NOTE: Inconsistent Usage in v5.5 Docs

51 instances found where documentation refers to table names as plurals. These don't affect functionality but should be reviewed:

**Files with inconsistencies:**
- CA_Agent_Roadmap_and_Starter.md
- MPA_Post_Deployment_Test_Suite.md
- EAP_CA_Compliance_Audit_Report.md
- EAP_Full_Compliance_Audit.md
- EAP_Table_Categorization.md
- Mastercard_Corporate_Extensions_Guide.md

**Note:** TABLE_NAMING_CONVENTION.md correctly documents both forms (singular for tables, plural for APIs).

---

## Choice Field Reference

### EAP Platform

| Field | Values |
|-------|--------|
| environment_code | 1=MASTERCARD, 2=PERSONAL |
| agent_status | 1=ACTIVE, 2=DEPRECATED, 3=TESTING |
| implementation_type | 1=AI_BUILDER_PROMPT, 2=AZURE_FUNCTION, 3=HTTP_ENDPOINT, 4=DATAVERSE_LOGIC |
| session_status | 1=ACTIVE, 2=PAUSED, 3=COMPLETED, 4=ABANDONED, 5=ERROR |
| pathway_code | 1=EXPRESS, 2=STANDARD, 3=GUIDED, 4=AUDIT |
| scenario_category | 1=ROUTING, 2=CALCULATION, 3=INTEGRATION, 4=E2E, 5=REGRESSION |
| priority | 1=CRITICAL, 2=HIGH, 3=MEDIUM, 4=LOW |
| output_format | 1=JSON, 2=TEXT, 3=MARKDOWN |
| environment_scope | 1=MASTERCARD, 2=PERSONAL, 3=BOTH |
| last_run_result | 1=PASS, 2=FAIL, 3=ERROR, 4=SKIP |

### MPA Domain

| Field | Values |
|-------|--------|
| channel_category | 1=PAID_SEARCH, 2=PAID_SOCIAL, 3=DISPLAY, 4=VIDEO, 5=AUDIO, 6=CTV, 7=OOH, 8=AFFILIATE, 9=DIRECT, 10=RETAIL_MEDIA, 11=EMERGING |
| funnel_stage | 1=UPPER_FUNNEL, 2=MID_FUNNEL, 3=LOWER_FUNNEL, 4=FULL_FUNNEL |
| kpi_category | 1=AWARENESS, 2=ENGAGEMENT, 3=CONVERSION, 4=EFFICIENCY, 5=QUALITY, 6=RETENTION, 7=REVENUE |
| direction | 1=HIGHER_BETTER, 2=LOWER_BETTER, 3=TARGET_BASED |
| partner_type | 1=DSP, 2=SSP, 3=DMP, 4=MEASUREMENT, 5=VERIFICATION, 6=AD_SERVER, 7=IDENTITY, 8=CREATIVE, 9=PLATFORM |
| seasonality_pattern | 1=STABLE, 2=Q4_HEAVY, 3=SUMMER, 4=HOLIDAY, 5=EVENT_DRIVEN |

### CA Domain

| Field | Values |
|-------|--------|
| category_code | 1=Strategic, 2=Competitive, 3=Operational, 4=Customer, 5=Financial, 6=Change, 7=Planning, 8=Problem |
| complexity_level | 1=Standard, 2=Advanced, 3=Expert |
| engagement_type | 1=DISCOVERY, 2=ASSESSMENT, 3=IMPLEMENTATION, 4=OPTIMIZATION, 5=MANAGED_SERVICES |
| project_status | 1=DRAFT, 2=ACTIVE, 3=ON_HOLD, 4=COMPLETED, 5=CANCELLED, 6=ARCHIVED |
| deliverable_type | 1=DOCUMENT, 2=PRESENTATION, 3=ANALYSIS, 4=DASHBOARD, 5=IMPLEMENTATION, 6=OTHER |
| deliverable_status | 1=DRAFT, 2=IN_REVIEW, 3=APPROVED, 4=DELIVERED, 5=ARCHIVED |

---

## Import Order

### Phase 1 - Base Tables (no dependencies)
1. eap_agent
2. mpa_vertical
3. mpa_channel
4. mpa_kpi
5. mpa_partner
6. ca_framework

### Phase 2 - First-level Dependencies
7. eap_capability (→ eap_agent)
8. eap_prompt (→ eap_agent)
9. mpa_benchmark (→ vertical, channel, kpi)

### Phase 3 - Second-level Dependencies
10. eap_capability_implementation (→ eap_capability)
11. eap_session (→ eap_agent)

### Phase 4 - Third-level Dependencies
12. eap_test_case (→ agent, capability)
13. ca_project (→ vertical, session)

### Phase 5 - Final Dependencies
14. ca_deliverable (→ project, framework)
15. eap_telemetry (runtime, no seed)

---

## Files Summary

### Schema Files (15)
```
base/dataverse/schema/
├── eap_agent.json
├── eap_capability.json
├── eap_capability_implementation.json
├── eap_prompt.json
├── eap_session.json
├── eap_test_case.json
├── eap_telemetry.json
├── mpa_channel.json
├── mpa_kpi.json
├── mpa_vertical.json
├── mpa_benchmark.json
├── mpa_partner.json
├── ca_framework.json
├── ca_project.json
└── ca_deliverable.json
```

### Seed Files (13)
```
base/dataverse/seed/
├── eap_agent_seed.csv (8 rows)
├── eap_capability_seed.csv (20 rows)
├── eap_capability_implementation_seed.csv (47 rows)
├── eap_prompt_seed.csv (19 rows)
├── eap_session_seed.csv (5 rows)
├── eap_test_case_seed.csv (15 rows)
├── mpa_vertical_seed.csv (15 rows)
├── mpa_channel_seed.csv (30 rows)
├── mpa_kpi_seed.csv (24 rows)
├── mpa_benchmark_seed.csv (31 rows)
├── mpa_partner_seed.csv (20 rows)
├── ca_framework_seed.csv (60 rows)
└── eap_capability_ca_seed.csv (consulting capabilities)
```

### Validation Scripts
```
base/dataverse/
├── validate_all.py (type validation)
├── validate_comprehensive.py (empty columns + naming)
└── scan_naming.py (documentation scan)
```

---

## Deployment Readiness

✅ All schemas are valid JSON with proper Dataverse types  
✅ All seed files are valid CSV with exact column name matches  
✅ No empty required fields in any seed file  
✅ All choice values use numeric codes  
✅ All dates in ISO 8601 format  
✅ All foreign key references are valid  
✅ Minimum data volume met for testing relationships  

**Ready for VS Code deployment via pac CLI**

---

**Report Generated By:** Claude (Dataverse Schema Audit)  
**Validation Date:** 2026-01-18  
**Status:** Production Ready
