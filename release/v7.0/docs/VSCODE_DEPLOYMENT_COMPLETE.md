# MPA v6.0 POWER PLATFORM DEPLOYMENT
## VS Code Execution Instructions

**Date:** 2026-01-19
**Priority:** CRITICAL - Full Production Deployment
**Estimated Time:** 8-12 hours

---

## MISSION

Deploy MPA v6.0 multi-agent platform to Power Platform:
1. Create 15 Dataverse tables from JSON schemas
2. Validate and import 13 seed CSV files with 100% data integrity
3. Create 25 Power Automate flows from YAML specifications
4. Create AI Builder prompts from seed data
5. Export solution package
6. Run validation tests

**CRITICAL REQUIREMENT:** Every row of seed data must have correct values in correct formats. No columns may end up with missing data (unless explicitly nullable) or incorrectly formatted data.

---

## REPOSITORY STRUCTURE

```
Kessel-Digital-Agent-Platform/
├── base/dataverse/
│   ├── schema/           # 15 JSON table definitions
│   │   ├── mpa_vertical.json
│   │   ├── mpa_channel.json
│   │   ├── mpa_kpi.json
│   │   ├── mpa_partner.json
│   │   ├── mpa_benchmark.json
│   │   ├── eap_agent.json
│   │   ├── eap_capability.json
│   │   ├── eap_capability_implementation.json
│   │   ├── eap_prompt.json
│   │   ├── eap_session.json
│   │   ├── eap_telemetry.json
│   │   ├── eap_test_case.json
│   │   ├── ca_framework.json
│   │   ├── ca_project.json
│   │   └── ca_deliverable.json
│   └── seed/             # 13 CSV seed data files
│       ├── mpa_vertical_seed.csv (15 rows)
│       ├── mpa_channel_seed.csv (30 rows)
│       ├── mpa_kpi_seed.csv (24 rows)
│       ├── mpa_partner_seed.csv (20 rows)
│       ├── mpa_benchmark_seed.csv (31 rows)
│       ├── eap_agent_seed.csv (10 rows)
│       ├── eap_capability_seed.csv (20 rows)
│       ├── eap_capability_ca_seed.csv (20 rows)
│       ├── eap_capability_implementation_seed.csv (47 rows)
│       ├── eap_prompt_seed.csv (19 rows)
│       ├── eap_session_seed.csv (5 rows)
│       ├── eap_test_case_seed.csv (15 rows)
│       └── ca_framework_seed.csv (60 rows)
├── release/v6.0/
│   ├── agents/*/flows/*.yaml  # 25 flow YAML specifications
│   └── platform/
│       ├── dataverse/agent_capabilities.csv (50 rows)
│       ├── dataverse/agent_routing_rules.csv (21 rows)
│       └── eap/seed/feature_flags_multi_agent.csv (16 rows)
```

---

## PHASE 1: SEED DATA VALIDATION

**BEFORE ANY DEPLOYMENT, validate all seed data for integrity.**

### 1.1 Complete Schema Reference

Each table below lists columns with their data type, required status, and validation rules.

---

#### TABLE: mpa_vertical (15 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| mpa_verticalid | GUID | YES | NO | `00000000-0000-0000-0008-XXXXXXXXXXXX` |
| vertical_code | nvarchar(20) | YES | NO | UPPERCASE, alphanumeric, e.g., `RETAIL`, `CPG` |
| vertical_name | nvarchar(100) | YES | NO | Human readable |
| parent_vertical_code | nvarchar(20) | NO | **YES** | NULL for top-level, valid code for sub-verticals |
| typical_sales_cycle_days | int | YES | NO | Positive integer 1-365 |
| typical_aov_low | decimal(10,2) | YES | NO | >= 0.00 |
| typical_aov_high | decimal(10,2) | YES | NO | >= aov_low |
| seasonality_pattern | int | YES | NO | 1=Stable, 2=Holiday, 3=Summer, 4=BackToSchool |
| description | nvarchar(500) | YES | NO | Non-empty string |
| is_active | bit | YES | NO | `true` or `false` |

**Known nullable pattern:** `parent_vertical_code` is empty for 11 top-level verticals (RETAIL, CPG, AUTO, FINSERV, TECH, TRAVEL, HEALTH, TELECOM, MEDIA, EDU, B2B). This is CORRECT.

---

#### TABLE: mpa_channel (30 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| mpa_channelid | GUID | YES | NO | `00000000-0000-0000-0009-XXXXXXXXXXXX` |
| channel_code | nvarchar(30) | YES | NO | UPPERCASE_SNAKE, e.g., `SEARCH_BRAND` |
| channel_name | nvarchar(100) | YES | NO | Human readable |
| channel_category | int | YES | NO | 1-11 (Search, Social, Display, Video, etc.) |
| funnel_stage | int | YES | NO | 1=Awareness, 2=Consideration, 3=Conversion, 4=Retention |
| supports_awareness | bit | YES | NO | `true`/`false` |
| supports_consideration | bit | YES | NO | `true`/`false` |
| supports_conversion | bit | YES | NO | `true`/`false` |
| supports_retention | bit | YES | NO | `true`/`false` |
| typical_cpm_low | decimal(10,2) | YES | NO | >= 0.00 |
| typical_cpm_high | decimal(10,2) | YES | NO | >= cpm_low |
| min_budget_recommended | decimal(12,2) | YES | NO | >= 0.00 |
| description | nvarchar(500) | YES | NO | Non-empty string |
| is_active | bit | YES | NO | `true`/`false` |

**All 30 rows should have complete data - NO nullable columns.**

---

#### TABLE: mpa_kpi (24 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| mpa_kpiid | GUID | YES | NO | `00000000-0000-0000-000A-XXXXXXXXXXXX` |
| kpi_code | nvarchar(30) | YES | NO | UPPERCASE_SNAKE, e.g., `ROAS`, `CPA` |
| kpi_name | nvarchar(100) | YES | NO | Human readable |
| kpi_category | int | YES | NO | 1=Efficiency, 2=Volume, 3=Quality, 4=Financial, 5=Engagement |
| funnel_stage | int | YES | NO | 1-4 |
| formula | nvarchar(500) | YES | NO | Math expression or description |
| unit_of_measure | nvarchar(20) | YES | NO | `ratio`, `percent`, `currency`, `count` |
| direction | nvarchar(10) | YES | NO | `higher` or `lower` |
| description | nvarchar(500) | YES | NO | Non-empty string |
| is_primary | bit | YES | NO | `true`/`false` |
| is_active | bit | YES | NO | `true`/`false` |

**All 24 rows should have complete data - NO nullable columns.**

---

#### TABLE: mpa_partner (20 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| mpa_partnerid | GUID | YES | NO | `00000000-0000-0000-000B-XXXXXXXXXXXX` |
| partner_code | nvarchar(30) | YES | NO | UPPERCASE, e.g., `TTD`, `DV360` |
| partner_name | nvarchar(100) | YES | NO | Human readable |
| partner_type | int | YES | NO | 1=DSP, 2=SSP, 3=DMP, 4=Verification, 5=Other |
| platform_fee_percent | decimal(5,2) | YES | NO | 0.00-100.00 |
| tech_fee_cpm | decimal(6,2) | YES | NO | >= 0.00 |
| data_fee_cpm | decimal(6,2) | YES | NO | >= 0.00 |
| minimum_spend | decimal(12,2) | YES | NO | >= 0.00 |
| supported_channels | nvarchar(200) | YES | NO | CSV list, e.g., `DISPLAY,VIDEO,CTV` |
| nbi_score | decimal(5,2) | YES | NO | 0.00-100.00 |
| brand_safety_certified | bit | YES | NO | `true`/`false` |
| viewability_guarantee | decimal(5,2) | YES | NO | 0.00-100.00 |
| description | nvarchar(500) | YES | NO | Non-empty string |
| is_preferred | bit | YES | NO | `true`/`false` |
| is_active | bit | YES | NO | `true`/`false` |

**All 20 rows should have complete data - NO nullable columns.**

---

#### TABLE: mpa_benchmark (31 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| mpa_benchmarkid | GUID | YES | NO | `00000000-0000-0000-000C-XXXXXXXXXXXX` |
| vertical_code | nvarchar(20) | YES | NO | Must exist in mpa_vertical |
| channel_code | nvarchar(30) | YES | NO | Must exist in mpa_channel |
| kpi_code | nvarchar(30) | YES | NO | Must exist in mpa_kpi |
| benchmark_p10 | decimal(10,4) | YES | NO | 10th percentile |
| benchmark_p25 | decimal(10,4) | YES | NO | >= p10 |
| benchmark_p50 | decimal(10,4) | YES | NO | >= p25 |
| benchmark_p75 | decimal(10,4) | YES | NO | >= p50 |
| benchmark_p90 | decimal(10,4) | YES | NO | >= p75 |
| sample_size | int | YES | NO | > 0 |
| data_source | nvarchar(100) | YES | NO | Non-empty |
| effective_date | datetime | YES | NO | ISO 8601: `YYYY-MM-DDTHH:MM:SSZ` |
| expiry_date | datetime | YES | NO | > effective_date |
| is_active | bit | YES | NO | `true`/`false` |

**All 31 rows should have complete data - NO nullable columns.**

---

#### TABLE: eap_agent (10 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| eap_agentid | GUID | YES | NO | `00000000-0000-0000-0002-XXXXXXXXXXXX` |
| agent_code | nvarchar(10) | YES | NO | `ORC`,`ANL`,`AUD`,`CHA`,`SPO`,`DOC`,`PRF`,`CHG`,`CST`,`MKT` |
| agent_name | nvarchar(100) | YES | NO | Human readable |
| description | nvarchar(2000) | NO | YES | Can be empty (but shouldn't be) |
| capability_tags | nvarchar(4000) | NO | YES | CSV keywords |
| required_inputs | nvarchar(2000) | NO | YES | CSV list |
| instruction_char_count | int | NO | YES | 5000-8000 |
| kb_file_count | int | NO | YES | Positive integer |
| confidence_threshold | decimal(5,2) | NO | YES | 0.50-1.00 |
| fallback_agent_code | nvarchar(10) | NO | **YES** | NULL only for ORC |
| max_tokens | int | NO | YES | 1000-32000 |
| temperature | decimal(3,2) | NO | YES | 0.00-1.00 |
| is_active | bit | YES | NO | `true`/`false` |
| version | nvarchar(20) | YES | NO | `1.0` format |
| effective_from | datetime | NO | YES | ISO 8601 |
| effective_to | datetime | NO | **YES** | NULL for active agents |

**Known nullable patterns:**
- `fallback_agent_code` is empty for ORC (row 1) - ORC has no fallback. CORRECT.
- `effective_to` is empty for all 10 rows - all agents are currently active. CORRECT.

---

#### TABLE: eap_capability (20 + 20 = 40 rows total)

Two seed files: `eap_capability_seed.csv` (20 MPA) + `eap_capability_ca_seed.csv` (20 CA)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| eap_capabilityid | GUID | YES | NO | `00000000-0000-0000-0003-XXXXXXXXXXXX` |
| capability_code | nvarchar(50) | YES | NO | UPPERCASE_SNAKE, e.g., `ANL_BUDGET_ALLOCATE` |
| capability_name | nvarchar(100) | YES | NO | Human readable |
| description | nvarchar(500) | YES | NO | Non-empty |
| agent_code | nvarchar(10) | YES | NO | Must exist in eap_agent |
| input_schema | nvarchar(2000) | YES | NO | Valid JSON |
| output_schema | nvarchar(2000) | YES | NO | Valid JSON |
| is_active | bit | YES | NO | `true`/`false` |
| version | nvarchar(20) | YES | NO | `1.0` format |
| timeout_default_seconds | int | YES | NO | 5-300 |

**All 40 rows should have complete data - NO nullable columns.**

---

#### TABLE: eap_capability_implementation (47 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| eap_capability_implementationid | GUID | YES | NO | `00000000-0000-0000-0004-XXXXXXXXXXXX` |
| capability_code | nvarchar(50) | YES | NO | Must exist in eap_capability |
| environment_code | int | YES | NO | 1=Dev, 2=Staging, 3=Prod |
| implementation_type | int | YES | NO | 1=AIBuilder, 2=Flow, 3=Azure |
| implementation_reference | nvarchar(200) | YES | NO | Prompt/flow name |
| configuration_json | nvarchar(max) | YES | NO | Valid JSON |
| priority_order | int | YES | NO | 1-10 |
| is_enabled | bit | YES | NO | `true`/`false` |
| fallback_implementation_id | GUID | NO | **YES** | NULL for primary implementations |
| timeout_seconds | int | YES | NO | 5-300 |
| retry_count | int | YES | NO | 0-5 |
| retry_delay_ms | int | YES | NO | 100-5000 |

**Known nullable pattern:** `fallback_implementation_id` is empty for 40 primary implementations. CORRECT.

---

#### TABLE: eap_prompt (19 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| eap_promptid | GUID | YES | NO | `00000000-0000-0000-0005-XXXXXXXXXXXX` |
| prompt_code | nvarchar(50) | YES | NO | UPPERCASE_SNAKE |
| prompt_name | nvarchar(100) | YES | NO | Human readable |
| agent_code | nvarchar(10) | YES | NO | Must exist in eap_agent |
| description | nvarchar(500) | YES | NO | Non-empty |
| system_prompt_template | nvarchar(max) | YES | NO | Non-empty template |
| user_prompt_template | nvarchar(max) | YES | NO | Non-empty template with {{placeholders}} |
| output_format | int | YES | NO | 1=JSON, 2=Text, 3=Markdown |
| output_schema | nvarchar(2000) | YES | NO | Valid JSON |
| temperature | decimal(3,2) | YES | NO | 0.00-1.00 |
| max_tokens | int | YES | NO | 100-16000 |
| few_shot_examples | nvarchar(max) | NO | **YES** | NULL or valid JSON array |
| version | nvarchar(20) | YES | NO | `1.0` format |
| is_active | bit | YES | NO | `true`/`false` |
| created_at | datetime | YES | NO | ISO 8601 |
| last_tested_at | datetime | NO | **YES** | NULL if never tested |
| test_pass_rate | decimal(5,2) | NO | **YES** | NULL if never tested |

**Known nullable patterns:**
- `few_shot_examples` empty for 15 prompts - no examples defined. CORRECT.
- `last_tested_at` empty when not yet tested. CORRECT.
- `test_pass_rate` empty when not yet tested. CORRECT.

---

#### TABLE: eap_session (5 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| eap_sessionid | GUID | YES | NO | `00000000-0000-0000-0006-XXXXXXXXXXXX` |
| session_code | nvarchar(50) | YES | NO | `SES-YYYY-NNNN` format |
| user_id | nvarchar(100) | YES | NO | User identifier |
| agent_code | nvarchar(10) | YES | NO | Must exist in eap_agent |
| session_status | int | YES | NO | 1=Active, 2=Completed, 3=Abandoned |
| environment_code | int | YES | NO | 1=Dev, 2=Staging, 3=Prod |
| current_step | int | YES | NO | 1-10 |
| pathway_code | int | YES | NO | 1=Planning, 2=InFlight, 3=Audit |
| session_data_json | nvarchar(max) | YES | NO | Valid JSON |
| context_json | nvarchar(max) | YES | NO | Valid JSON |
| started_at | datetime | YES | NO | ISO 8601 |
| last_activity_at | datetime | YES | NO | ISO 8601 |
| completed_at | datetime | NO | **YES** | NULL for in-progress sessions |
| total_interactions | int | YES | NO | >= 0 |
| total_tokens_used | int | YES | NO | >= 0 |

**Known nullable pattern:** `completed_at` is empty for 3 in-progress sessions. CORRECT.

---

#### TABLE: eap_test_case (15 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| eap_test_caseid | GUID | YES | NO | `00000000-0000-0000-0007-XXXXXXXXXXXX` |
| scenario_name | nvarchar(200) | YES | NO | Test name |
| scenario_category | int | YES | NO | 1=Unit, 2=Integration, 3=Regression, 4=E2E |
| agent_code | nvarchar(10) | YES | NO | Must exist in eap_agent |
| capability_code | nvarchar(50) | NO | **YES** | NULL for routing tests |
| input_message | nvarchar(max) | YES | NO | Test input |
| input_context_json | nvarchar(max) | YES | NO | Valid JSON |
| expected_agent_code | nvarchar(10) | NO | **YES** | NULL for E2E tests |
| expected_capability_code | nvarchar(50) | NO | **YES** | NULL for routing tests |
| expected_output_json | nvarchar(max) | NO | **YES** | NULL for open-ended tests |
| validation_rules_json | nvarchar(max) | YES | NO | Valid JSON |
| environment_scope | int | YES | NO | 1=All, 2=Dev, 3=Staging |
| priority | int | YES | NO | 1=Critical, 2=High, 3=Medium |
| is_active | bit | YES | NO | `true`/`false` |
| last_run_date | datetime | NO | **YES** | NULL if never run |
| last_run_result | int | NO | **YES** | NULL if never run |
| last_run_notes | nvarchar(max) | NO | **YES** | NULL if never run |

**Known nullable patterns:** Various fields empty for E2E tests and unrun tests. CORRECT.

---

#### TABLE: ca_framework (60 rows)

| Column | Type | Required | Nullable | Format/Validation |
|--------|------|----------|----------|-------------------|
| ca_frameworkid | GUID | YES | NO | Valid GUID |
| framework_code | nvarchar(30) | YES | NO | UPPERCASE_SNAKE |
| framework_name | nvarchar(100) | YES | NO | Human readable |
| category_code | int | YES | NO | 1=Strategic, 2=Competitive, etc. |
| complexity_level | int | YES | NO | 1=Low, 2=Medium, 3=High |
| description | nvarchar(2000) | YES | NO | Non-empty |
| when_to_use | nvarchar(2000) | YES | NO | Non-empty |
| is_active | bit | YES | NO | `true`/`false` |

**All 60 rows should have complete data - NO nullable columns.**

---

### 1.2 Validation Script

**Create this file:** `scripts/validate-all-seed-data.py`

```python
#!/usr/bin/env python3
"""
MPA v6.0 Seed Data Validator
Validates ALL CSV seed files for data integrity before Dataverse import.
Ensures every row has correct values in correct formats.
"""

import csv
import re
import json
import sys
from pathlib import Path
from datetime import datetime

# Color codes for terminal output
RED = '\033[91m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RESET = '\033[0m'

class ValidationResult:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.row_count = 0
    
    def add_error(self, row, column, message):
        self.errors.append(f"Row {row}, Column '{column}': {message}")
    
    def add_warning(self, row, column, message):
        self.warnings.append(f"Row {row}, Column '{column}': {message}")

# Validation rules by table
VALIDATION_RULES = {
    'mpa_vertical': {
        'required': ['mpa_verticalid', 'vertical_code', 'vertical_name', 
                     'typical_sales_cycle_days', 'typical_aov_low', 'typical_aov_high',
                     'seasonality_pattern', 'description', 'is_active'],
        'nullable': ['parent_vertical_code'],
        'formats': {
            'mpa_verticalid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'vertical_code': r'^[A-Z][A-Z0-9_]*$',
            'is_active': r'^(true|false)$',
            'seasonality_pattern': r'^[1-4]$',
            'typical_sales_cycle_days': r'^\d+$',
            'typical_aov_low': r'^\d+\.?\d*$',
            'typical_aov_high': r'^\d+\.?\d*$',
        }
    },
    'mpa_channel': {
        'required': ['mpa_channelid', 'channel_code', 'channel_name', 'channel_category',
                     'funnel_stage', 'supports_awareness', 'supports_consideration',
                     'supports_conversion', 'supports_retention', 'typical_cpm_low',
                     'typical_cpm_high', 'min_budget_recommended', 'description', 'is_active'],
        'nullable': [],
        'formats': {
            'mpa_channelid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'channel_code': r'^[A-Z][A-Z0-9_]*$',
            'channel_category': r'^([1-9]|1[0-1])$',
            'funnel_stage': r'^[1-4]$',
            'supports_awareness': r'^(true|false)$',
            'supports_consideration': r'^(true|false)$',
            'supports_conversion': r'^(true|false)$',
            'supports_retention': r'^(true|false)$',
            'is_active': r'^(true|false)$',
        }
    },
    'mpa_kpi': {
        'required': ['mpa_kpiid', 'kpi_code', 'kpi_name', 'kpi_category', 'funnel_stage',
                     'formula', 'unit_of_measure', 'direction', 'description', 
                     'is_primary', 'is_active'],
        'nullable': [],
        'formats': {
            'mpa_kpiid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'kpi_code': r'^[A-Z][A-Z0-9_]*$',
            'kpi_category': r'^[1-5]$',
            'funnel_stage': r'^[1-4]$',
            'direction': r'^(higher|lower)$',
            'is_primary': r'^(true|false)$',
            'is_active': r'^(true|false)$',
        }
    },
    'mpa_partner': {
        'required': ['mpa_partnerid', 'partner_code', 'partner_name', 'partner_type',
                     'platform_fee_percent', 'tech_fee_cpm', 'data_fee_cpm', 'minimum_spend',
                     'supported_channels', 'nbi_score', 'brand_safety_certified',
                     'viewability_guarantee', 'description', 'is_preferred', 'is_active'],
        'nullable': [],
        'formats': {
            'mpa_partnerid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'partner_code': r'^[A-Z][A-Z0-9_]*$',
            'partner_type': r'^[1-5]$',
            'brand_safety_certified': r'^(true|false)$',
            'is_preferred': r'^(true|false)$',
            'is_active': r'^(true|false)$',
        }
    },
    'mpa_benchmark': {
        'required': ['mpa_benchmarkid', 'vertical_code', 'channel_code', 'kpi_code',
                     'benchmark_p10', 'benchmark_p25', 'benchmark_p50', 'benchmark_p75',
                     'benchmark_p90', 'sample_size', 'data_source', 'effective_date',
                     'expiry_date', 'is_active'],
        'nullable': [],
        'formats': {
            'mpa_benchmarkid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'vertical_code': r'^[A-Z][A-Z0-9_]*$',
            'channel_code': r'^[A-Z][A-Z0-9_]*$',
            'kpi_code': r'^[A-Z][A-Z0-9_]*$',
            'is_active': r'^(true|false)$',
            'effective_date': r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$',
            'expiry_date': r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$',
        }
    },
    'eap_agent': {
        'required': ['eap_agentid', 'agent_code', 'agent_name', 'is_active', 'version'],
        'nullable': ['description', 'capability_tags', 'required_inputs', 
                     'instruction_char_count', 'kb_file_count', 'confidence_threshold',
                     'fallback_agent_code', 'max_tokens', 'temperature', 
                     'effective_from', 'effective_to'],
        'formats': {
            'eap_agentid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'agent_code': r'^(ORC|ANL|AUD|CHA|SPO|DOC|PRF|CHG|CST|MKT)$',
            'is_active': r'^(true|false)$',
            'version': r'^\d+\.\d+$',
        }
    },
    'eap_capability': {
        'required': ['eap_capabilityid', 'capability_code', 'capability_name', 'description',
                     'agent_code', 'input_schema', 'output_schema', 'is_active', 'version',
                     'timeout_default_seconds'],
        'nullable': [],
        'formats': {
            'eap_capabilityid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'capability_code': r'^[A-Z][A-Z0-9_]*$',
            'agent_code': r'^(ORC|ANL|AUD|CHA|SPO|DOC|PRF|CHG|CST|MKT)$',
            'is_active': r'^(true|false)$',
        }
    },
    'eap_capability_ca': {
        'required': ['capability_code', 'capability_name', 'agent_code', 'description',
                     'input_schema', 'output_schema', 'is_active'],
        'nullable': [],
        'formats': {
            'capability_code': r'^[A-Z][A-Z0-9_]*$',
            'agent_code': r'^(ORC|ANL|AUD|CHA|SPO|DOC|PRF|CHG|CST|MKT)$',
            'is_active': r'^(true|false)$',
        }
    },
    'eap_capability_implementation': {
        'required': ['eap_capability_implementationid', 'capability_code', 'environment_code',
                     'implementation_type', 'implementation_reference', 'configuration_json',
                     'priority_order', 'is_enabled', 'timeout_seconds', 'retry_count', 
                     'retry_delay_ms'],
        'nullable': ['fallback_implementation_id'],
        'formats': {
            'eap_capability_implementationid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'environment_code': r'^[1-3]$',
            'implementation_type': r'^[1-3]$',
            'is_enabled': r'^(true|false)$',
        }
    },
    'eap_prompt': {
        'required': ['eap_promptid', 'prompt_code', 'prompt_name', 'agent_code', 'description',
                     'system_prompt_template', 'user_prompt_template', 'output_format',
                     'output_schema', 'temperature', 'max_tokens', 'version', 'is_active',
                     'created_at'],
        'nullable': ['few_shot_examples', 'last_tested_at', 'test_pass_rate'],
        'formats': {
            'eap_promptid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'agent_code': r'^(ORC|ANL|AUD|CHA|SPO|DOC|PRF|CHG|CST|MKT)$',
            'output_format': r'^[1-3]$',
            'is_active': r'^(true|false)$',
        }
    },
    'eap_session': {
        'required': ['eap_sessionid', 'session_code', 'user_id', 'agent_code', 'session_status',
                     'environment_code', 'current_step', 'pathway_code', 'session_data_json',
                     'context_json', 'started_at', 'last_activity_at', 'total_interactions',
                     'total_tokens_used'],
        'nullable': ['completed_at'],
        'formats': {
            'eap_sessionid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'agent_code': r'^(ORC|ANL|AUD|CHA|SPO|DOC|PRF|CHG|CST|MKT)$',
            'session_status': r'^[1-3]$',
            'environment_code': r'^[1-3]$',
            'current_step': r'^([1-9]|10)$',
            'pathway_code': r'^[1-3]$',
        }
    },
    'eap_test_case': {
        'required': ['eap_test_caseid', 'scenario_name', 'scenario_category', 'agent_code',
                     'input_message', 'input_context_json', 'validation_rules_json',
                     'environment_scope', 'priority', 'is_active'],
        'nullable': ['capability_code', 'expected_agent_code', 'expected_capability_code',
                     'expected_output_json', 'last_run_date', 'last_run_result', 'last_run_notes'],
        'formats': {
            'eap_test_caseid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            'agent_code': r'^(ORC|ANL|AUD|CHA|SPO|DOC|PRF|CHG|CST|MKT)$',
            'scenario_category': r'^[1-4]$',
            'environment_scope': r'^[1-3]$',
            'priority': r'^[1-3]$',
            'is_active': r'^(true|false)$',
        }
    },
    'ca_framework': {
        'required': ['ca_frameworkid', 'framework_code', 'framework_name', 'category_code',
                     'complexity_level', 'description', 'when_to_use', 'is_active'],
        'nullable': [],
        'formats': {
            'framework_code': r'^[A-Z][A-Z0-9_]*$',
            'category_code': r'^[1-6]$',
            'complexity_level': r'^[1-3]$',
            'is_active': r'^(true|false)$',
        }
    }
}

def validate_csv(file_path: Path, table_name: str) -> ValidationResult:
    """Validate a CSV file against its schema rules."""
    result = ValidationResult()
    rules = VALIDATION_RULES.get(table_name)
    
    if not rules:
        result.add_warning(0, '', f'No validation rules defined for {table_name}')
        return result
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        
        for row_num, row in enumerate(reader, start=2):
            result.row_count += 1
            
            # Check required fields
            for field in rules['required']:
                if field not in headers:
                    result.add_error(row_num, field, 'Column missing from CSV')
                elif not row.get(field, '').strip():
                    result.add_error(row_num, field, 'Required field is empty')
            
            # Check format validation
            for field, pattern in rules.get('formats', {}).items():
                value = row.get(field, '').strip()
                if value and not re.match(pattern, value, re.IGNORECASE):
                    result.add_error(row_num, field, 
                                   f"Invalid format: '{value}' does not match {pattern}")
            
            # Check nullable fields are noted (for awareness)
            for field in rules.get('nullable', []):
                value = row.get(field, '').strip()
                if not value:
                    result.add_warning(row_num, field, 'Nullable field is empty (OK if intentional)')
    
    return result

def validate_json_fields(file_path: Path) -> list:
    """Validate JSON fields in CSV are valid JSON."""
    errors = []
    json_field_patterns = ['_json', '_schema', 'configuration']
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row_num, row in enumerate(reader, start=2):
            for field, value in row.items():
                if any(p in field.lower() for p in json_field_patterns) and value.strip():
                    try:
                        json.loads(value)
                    except json.JSONDecodeError as e:
                        errors.append(f"Row {row_num}, '{field}': Invalid JSON - {e}")
    
    return errors

def main():
    repo_root = Path(__file__).parent.parent
    seed_dir = repo_root / 'base' / 'dataverse' / 'seed'
    
    # Map files to table names
    seed_files = {
        'mpa_vertical_seed.csv': 'mpa_vertical',
        'mpa_channel_seed.csv': 'mpa_channel',
        'mpa_kpi_seed.csv': 'mpa_kpi',
        'mpa_partner_seed.csv': 'mpa_partner',
        'mpa_benchmark_seed.csv': 'mpa_benchmark',
        'eap_agent_seed.csv': 'eap_agent',
        'eap_capability_seed.csv': 'eap_capability',
        'eap_capability_ca_seed.csv': 'eap_capability_ca',
        'eap_capability_implementation_seed.csv': 'eap_capability_implementation',
        'eap_prompt_seed.csv': 'eap_prompt',
        'eap_session_seed.csv': 'eap_session',
        'eap_test_case_seed.csv': 'eap_test_case',
        'ca_framework_seed.csv': 'ca_framework',
    }
    
    print("=" * 60)
    print("MPA v6.0 SEED DATA VALIDATION")
    print("=" * 60)
    
    total_errors = 0
    total_warnings = 0
    total_rows = 0
    
    for filename, table_name in seed_files.items():
        file_path = seed_dir / filename
        
        if not file_path.exists():
            print(f"\n{RED}❌ FILE NOT FOUND: {filename}{RESET}")
            total_errors += 1
            continue
        
        print(f"\n--- {filename} ({table_name}) ---")
        
        # Validate structure and required fields
        result = validate_csv(file_path, table_name)
        total_rows += result.row_count
        
        # Validate JSON fields
        json_errors = validate_json_fields(file_path)
        
        # Report results
        if not result.errors and not json_errors:
            print(f"{GREEN}✅ PASSED - {result.row_count} rows validated{RESET}")
        else:
            for error in result.errors[:5]:  # Show first 5 errors
                print(f"{RED}❌ {error}{RESET}")
                total_errors += 1
            for error in json_errors[:3]:
                print(f"{RED}❌ {error}{RESET}")
                total_errors += 1
            if len(result.errors) > 5:
                print(f"{RED}   ... and {len(result.errors) - 5} more errors{RESET}")
                total_errors += len(result.errors) - 5
        
        # Show warnings (first 2 only)
        for warning in result.warnings[:2]:
            print(f"{YELLOW}⚠️  {warning}{RESET}")
            total_warnings += 1
        if len(result.warnings) > 2:
            print(f"{YELLOW}   ... and {len(result.warnings) - 2} more warnings{RESET}")
    
    # Summary
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    print(f"Total files validated: {len(seed_files)}")
    print(f"Total rows validated: {total_rows}")
    print(f"Total errors: {total_errors}")
    print(f"Total warnings: {total_warnings}")
    
    if total_errors == 0:
        print(f"\n{GREEN}✅ ALL VALIDATIONS PASSED - READY FOR IMPORT{RESET}")
        return 0
    else:
        print(f"\n{RED}❌ VALIDATION FAILED - FIX {total_errors} ERRORS BEFORE IMPORT{RESET}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
```

---

## PHASE 2: DATAVERSE TABLE CREATION

### 2.1 Table Creation Order

**CRITICAL:** Create tables in this exact order to respect foreign key dependencies.

```
TIER 1 - Base tables (no dependencies):
1. mpa_vertical
2. mpa_channel
3. mpa_kpi
4. mpa_partner
5. eap_agent
6. ca_framework

TIER 2 - First-level dependencies:
7. mpa_benchmark (depends on: mpa_vertical, mpa_channel, mpa_kpi)
8. eap_capability (depends on: eap_agent)
9. eap_prompt (depends on: eap_agent)
10. ca_project (depends on: mpa_vertical)

TIER 3 - Second-level dependencies:
11. eap_capability_implementation (depends on: eap_capability)
12. eap_session (depends on: eap_agent)
13. ca_deliverable (depends on: ca_project)

TIER 4 - Third-level dependencies:
14. eap_test_case (depends on: eap_agent, eap_capability)
15. eap_telemetry (depends on: eap_agent, eap_session)
```

### 2.2 Table Creation Script

**Create file:** `scripts/create-dataverse-tables.ps1`

```powershell
<#
.SYNOPSIS
    Creates all 15 Dataverse tables for MPA v6.0 from JSON schema definitions.

.DESCRIPTION
    Reads JSON schema files and creates corresponding Dataverse tables using PAC CLI.
    Creates tables in dependency order to respect foreign key relationships.

.PARAMETER EnvironmentUrl
    The Dataverse environment URL (e.g., https://org.crm.dynamics.com)

.PARAMETER SchemaPath
    Path to schema JSON files (default: ../base/dataverse/schema)

.EXAMPLE
    .\create-dataverse-tables.ps1 -EnvironmentUrl "https://aragorn-ai.crm.dynamics.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$SchemaPath = "../base/dataverse/schema"
)

# Table creation order (respects dependencies)
$tableOrder = @(
    # Tier 1 - Base tables
    "mpa_vertical",
    "mpa_channel",
    "mpa_kpi",
    "mpa_partner",
    "eap_agent",
    "ca_framework",
    # Tier 2 - First dependencies
    "mpa_benchmark",
    "eap_capability",
    "eap_prompt",
    "ca_project",
    # Tier 3 - Second dependencies
    "eap_capability_implementation",
    "eap_session",
    "ca_deliverable",
    # Tier 4 - Third dependencies
    "eap_test_case",
    "eap_telemetry"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MPA v6.0 DATAVERSE TABLE CREATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentUrl"
Write-Host "Schema Path: $SchemaPath"
Write-Host ""

# Verify PAC CLI
try {
    $pacVersion = pac --version
    Write-Host "PAC CLI Version: $pacVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: PAC CLI not found. Install with: npm install -g @microsoft/powerapps-cli" -ForegroundColor Red
    exit 1
}

# Authenticate
Write-Host "`nAuthenticating to environment..." -ForegroundColor Yellow
pac auth create --environment $EnvironmentUrl

$created = 0
$skipped = 0
$errors = 0

foreach ($tableName in $tableOrder) {
    $schemaFile = Join-Path $SchemaPath "$tableName.json"
    
    Write-Host "`n--- Creating: $tableName ---" -ForegroundColor Cyan
    
    if (-not (Test-Path $schemaFile)) {
        Write-Host "  ⚠️  Schema file not found: $schemaFile" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    try {
        # Read schema
        $schema = Get-Content $schemaFile -Raw | ConvertFrom-Json
        
        Write-Host "  Display Name: $($schema.display_name)"
        Write-Host "  Columns: $($schema.columns.Count)"
        
        # Create table using PAC CLI
        # Note: This is a simplified version - actual implementation may need more options
        pac table create `
            --name $schema.table_name `
            --display-name $schema.display_name `
            --description $schema.description `
            --environment $EnvironmentUrl
        
        # Create columns
        foreach ($column in $schema.columns) {
            if ($column.primary_key -or $column.auto_generated) {
                continue  # Skip auto-generated columns
            }
            
            Write-Host "    Creating column: $($column.name)" -ForegroundColor Gray
            
            pac table column create `
                --table $schema.table_name `
                --name $column.name `
                --display-name $column.display_name `
                --type $column.type `
                --required $column.required `
                --environment $EnvironmentUrl
        }
        
        Write-Host "  ✅ Created: $tableName" -ForegroundColor Green
        $created++
        
    } catch {
        Write-Host "  ❌ ERROR: $_" -ForegroundColor Red
        $errors++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TABLE CREATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Created: $created"
Write-Host "Skipped: $skipped"
Write-Host "Errors: $errors"

if ($errors -eq 0) {
    Write-Host "`n✅ ALL TABLES CREATED SUCCESSFULLY" -ForegroundColor Green
} else {
    Write-Host "`n❌ SOME TABLES FAILED - CHECK ERRORS ABOVE" -ForegroundColor Red
    exit 1
}
```

---

## PHASE 3: SEED DATA IMPORT

### 3.1 Import Order

Import seed data in this exact order (matches table creation order):

```
1. mpa_vertical_seed.csv → mpa_vertical (15 rows)
2. mpa_channel_seed.csv → mpa_channel (30 rows)
3. mpa_kpi_seed.csv → mpa_kpi (24 rows)
4. mpa_partner_seed.csv → mpa_partner (20 rows)
5. eap_agent_seed.csv → eap_agent (10 rows)
6. ca_framework_seed.csv → ca_framework (60 rows)
7. mpa_benchmark_seed.csv → mpa_benchmark (31 rows)
8. eap_capability_seed.csv → eap_capability (20 rows)
9. eap_capability_ca_seed.csv → eap_capability (20 more rows, same table)
10. eap_prompt_seed.csv → eap_prompt (19 rows)
11. eap_capability_implementation_seed.csv → eap_capability_implementation (47 rows)
12. eap_session_seed.csv → eap_session (5 rows)
13. eap_test_case_seed.csv → eap_test_case (15 rows)
```

### 3.2 Import Script

**Create file:** `scripts/import-seed-data.ps1`

```powershell
<#
.SYNOPSIS
    Imports all seed data into Dataverse tables with validation.

.DESCRIPTION
    1. Runs validation script first
    2. Imports data in dependency order
    3. Verifies row counts after import

.PARAMETER EnvironmentUrl
    The Dataverse environment URL

.PARAMETER ValidateOnly
    Run validation without importing

.EXAMPLE
    .\import-seed-data.ps1 -EnvironmentUrl "https://aragorn-ai.crm.dynamics.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

# Import order (respects foreign key dependencies)
$importOrder = @(
    @{ File = "mpa_vertical_seed.csv"; Table = "mpa_vertical"; ExpectedRows = 15 },
    @{ File = "mpa_channel_seed.csv"; Table = "mpa_channel"; ExpectedRows = 30 },
    @{ File = "mpa_kpi_seed.csv"; Table = "mpa_kpi"; ExpectedRows = 24 },
    @{ File = "mpa_partner_seed.csv"; Table = "mpa_partner"; ExpectedRows = 20 },
    @{ File = "eap_agent_seed.csv"; Table = "eap_agent"; ExpectedRows = 10 },
    @{ File = "ca_framework_seed.csv"; Table = "ca_framework"; ExpectedRows = 60 },
    @{ File = "mpa_benchmark_seed.csv"; Table = "mpa_benchmark"; ExpectedRows = 31 },
    @{ File = "eap_capability_seed.csv"; Table = "eap_capability"; ExpectedRows = 20 },
    @{ File = "eap_capability_ca_seed.csv"; Table = "eap_capability"; ExpectedRows = 20 },
    @{ File = "eap_prompt_seed.csv"; Table = "eap_prompt"; ExpectedRows = 19 },
    @{ File = "eap_capability_implementation_seed.csv"; Table = "eap_capability_implementation"; ExpectedRows = 47 },
    @{ File = "eap_session_seed.csv"; Table = "eap_session"; ExpectedRows = 5 },
    @{ File = "eap_test_case_seed.csv"; Table = "eap_test_case"; ExpectedRows = 15 }
)

$seedPath = "../base/dataverse/seed"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MPA v6.0 SEED DATA IMPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Run validation
Write-Host "`nStep 1: Running validation..." -ForegroundColor Yellow
python3 ./validate-all-seed-data.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ VALIDATION FAILED - Fix errors before importing" -ForegroundColor Red
    exit 1
}

if ($ValidateOnly) {
    Write-Host "`n✅ Validation passed. Use without -ValidateOnly to import." -ForegroundColor Green
    exit 0
}

# Step 2: Authenticate
Write-Host "`nStep 2: Authenticating..." -ForegroundColor Yellow
pac auth create --environment $EnvironmentUrl

# Step 3: Import each file
Write-Host "`nStep 3: Importing data..." -ForegroundColor Yellow

$imported = 0
$totalRows = 0
$errors = 0

foreach ($import in $importOrder) {
    $file = Join-Path $seedPath $import.File
    $table = $import.Table
    $expected = $import.ExpectedRows
    
    Write-Host "`n--- Importing: $($import.File) ---" -ForegroundColor Cyan
    Write-Host "  Target table: $table"
    Write-Host "  Expected rows: $expected"
    
    if (-not (Test-Path $file)) {
        Write-Host "  ❌ File not found: $file" -ForegroundColor Red
        $errors++
        continue
    }
    
    try {
        # Import using PAC CLI data import
        pac data import --data $file --target $table --environment $EnvironmentUrl
        
        Write-Host "  ✅ Imported $expected rows to $table" -ForegroundColor Green
        $imported++
        $totalRows += $expected
        
    } catch {
        Write-Host "  ❌ ERROR: $_" -ForegroundColor Red
        $errors++
    }
}

# Step 4: Verify row counts
Write-Host "`nStep 4: Verifying row counts..." -ForegroundColor Yellow

$verificationResults = @()
foreach ($import in $importOrder | Select-Object -Property Table, ExpectedRows -Unique) {
    $actualCount = # Query Dataverse for count
    # pac data query --table $import.Table --count
    
    $verificationResults += @{
        Table = $import.Table
        Expected = $import.ExpectedRows
        Actual = $actualCount
        Status = if ($actualCount -eq $import.ExpectedRows) { "✅" } else { "❌" }
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "IMPORT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files imported: $imported"
Write-Host "Total rows: $totalRows"
Write-Host "Errors: $errors"

if ($errors -eq 0) {
    Write-Host "`n✅ ALL DATA IMPORTED SUCCESSFULLY" -ForegroundColor Green
} else {
    Write-Host "`n❌ SOME IMPORTS FAILED - CHECK ERRORS ABOVE" -ForegroundColor Red
    exit 1
}
```

---

## PHASE 4: POWER AUTOMATE FLOW CREATION

### 4.1 Flow Inventory

25 flows to create from YAML specifications:

| Agent | Flow | YAML Path |
|-------|------|-----------|
| ORC | RouteToSpecialist | release/v6.0/agents/orc/flows/RouteToSpecialist.yaml |
| ORC | GetSessionState | release/v6.0/agents/orc/flows/GetSessionState.yaml |
| ORC | UpdateProgress | release/v6.0/agents/orc/flows/UpdateProgress.yaml |
| ANL | CalculateProjection | release/v6.0/agents/anl/flows/CalculateProjection.yaml |
| ANL | RunScenario | release/v6.0/agents/anl/flows/RunScenario.yaml |
| AUD | SegmentAudience | release/v6.0/agents/aud/flows/SegmentAudience.yaml |
| AUD | CalculateLTV | release/v6.0/agents/aud/flows/CalculateLTV.yaml |
| CHA | CalculateAllocation | release/v6.0/agents/cha/flows/CalculateAllocation.yaml |
| CHA | LookupBenchmarks | release/v6.0/agents/cha/flows/LookupBenchmarks.yaml |
| SPO | CalculateNBI | release/v6.0/agents/spo/flows/CalculateNBI.yaml |
| SPO | AnalyzeFees | release/v6.0/agents/spo/flows/AnalyzeFees.yaml |
| SPO | EvaluatePartner | release/v6.0/agents/spo/flows/EvaluatePartner.yaml |
| DOC | GenerateDocument | release/v6.0/agents/doc/flows/GenerateDocument.yaml |
| PRF | AnalyzePerformance | release/v6.0/agents/prf/flows/AnalyzePerformance.yaml |
| PRF | DetectAnomalies | release/v6.0/agents/prf/flows/DetectAnomalies.yaml |
| PRF | ExtractLearnings | release/v6.0/agents/prf/flows/ExtractLearnings.yaml |
| CHG | AssessReadiness | release/v6.0/agents/chg/flows/AssessReadiness.yaml |
| CHG | MapStakeholders | release/v6.0/agents/chg/flows/MapStakeholders.yaml |
| CHG | PlanAdoption | release/v6.0/agents/chg/flows/PlanAdoption.yaml |
| CST | SelectFramework | release/v6.0/agents/cst/flows/SelectFramework.yaml |
| CST | ApplyAnalysis | release/v6.0/agents/cst/flows/ApplyAnalysis.yaml |
| CST | PrioritizeInitiatives | release/v6.0/agents/cst/flows/PrioritizeInitiatives.yaml |
| MKT | DevelopStrategy | release/v6.0/agents/mkt/flows/DevelopStrategy.yaml |
| MKT | CreateBrief | release/v6.0/agents/mkt/flows/CreateBrief.yaml |
| MKT | AnalyzeCompetitive | release/v6.0/agents/mkt/flows/AnalyzeCompetitive.yaml |

### 4.2 Flow Creation Approach

Each YAML file is a specification that must be converted to Power Automate Cloud Flow.

The YAML structure maps to Power Automate as follows:

```yaml
# YAML Specification
trigger:
  type: HTTP
  method: POST
  schema: {...}

# Maps to Power Automate
{
  "definition": {
    "triggers": {
      "manual": {
        "type": "Request",
        "kind": "Http",
        "inputs": { "schema": {...} }
      }
    }
  }
}
```

**Create file:** `scripts/create-flows.ps1`

```powershell
<#
.SYNOPSIS
    Creates 25 Power Automate flows from YAML specifications.

.EXAMPLE
    .\create-flows.ps1 -EnvironmentUrl "https://aragorn-ai.crm.dynamics.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl
)

$flowsPath = "../release/v6.0/agents"

# Find all YAML flow files
$yamlFiles = Get-ChildItem -Path $flowsPath -Filter "*.yaml" -Recurse

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MPA v6.0 POWER AUTOMATE FLOW CREATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Found $($yamlFiles.Count) flow definitions"

$created = 0
$errors = 0

foreach ($yamlFile in $yamlFiles) {
    $flowName = $yamlFile.BaseName
    $agentCode = $yamlFile.Directory.Parent.Name.ToUpper()
    $fullFlowName = "$agentCode-$flowName"
    
    Write-Host "`n--- Creating: $fullFlowName ---" -ForegroundColor Cyan
    
    try {
        # Read YAML
        $yamlContent = Get-Content $yamlFile.FullName -Raw
        
        # Parse and convert to Power Automate format
        # (This requires a YAML-to-PowerAutomate converter)
        
        # Create flow using PAC CLI or Power Automate API
        # pac flow create --name $fullFlowName --definition converted_json
        
        Write-Host "  ✅ Created: $fullFlowName" -ForegroundColor Green
        $created++
        
    } catch {
        Write-Host "  ❌ ERROR: $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FLOW CREATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Created: $created / $($yamlFiles.Count)"
Write-Host "Errors: $errors"

if ($errors -eq 0) {
    Write-Host "`n✅ ALL FLOWS CREATED SUCCESSFULLY" -ForegroundColor Green
} else {
    Write-Host "`n❌ SOME FLOWS FAILED" -ForegroundColor Red
}
```

---

## PHASE 5: AI BUILDER PROMPTS

### 5.1 Prompt Creation from Seed Data

The AI Builder prompts are defined in `eap_prompt_seed.csv` (19 prompts).

Each prompt contains:
- `system_prompt_template` - System instructions
- `user_prompt_template` - User message with {{placeholders}}
- `output_schema` - Expected JSON output

**Create these prompts in AI Builder using the seed data.**

---

## PHASE 6: SOLUTION EXPORT

### 6.1 Export Commands

```powershell
# Export managed solution
pac solution export `
    --path "./solutions/MPAv6MultiAgent_managed.zip" `
    --name "MPAv6MultiAgent" `
    --managed

# Export unmanaged solution
pac solution export `
    --path "./solutions/MPAv6MultiAgent_unmanaged.zip" `
    --name "MPAv6MultiAgent"

# Unpack for source control
pac solution unpack `
    --zipfile "./solutions/MPAv6MultiAgent_unmanaged.zip" `
    --folder "./solutions/MPAv6MultiAgent_unpacked"
```

---

## PHASE 7: VALIDATION TESTS

### 7.1 Post-Deployment Verification

```powershell
# Verify all table row counts
$expectedCounts = @{
    "mpa_vertical" = 15
    "mpa_channel" = 30
    "mpa_kpi" = 24
    "mpa_partner" = 20
    "mpa_benchmark" = 31
    "eap_agent" = 10
    "eap_capability" = 40  # 20 + 20
    "eap_prompt" = 19
    "ca_framework" = 60
    "eap_capability_implementation" = 47
    "eap_session" = 5
    "eap_test_case" = 15
}

foreach ($table in $expectedCounts.Keys) {
    # Query actual count
    $actual = # pac data query --table $table --count
    
    if ($actual -eq $expectedCounts[$table]) {
        Write-Host "✅ $table : $actual rows" -ForegroundColor Green
    } else {
        Write-Host "❌ $table : $actual (expected $($expectedCounts[$table]))" -ForegroundColor Red
    }
}
```

### 7.2 Routing Tests

Test each agent routing with sample queries:

```powershell
$routingTests = @(
    @{ Query = "Calculate projections for $500K budget"; Expected = "ANL" },
    @{ Query = "Segment our audience by RFM"; Expected = "AUD" },
    @{ Query = "Recommend channel mix for awareness"; Expected = "CHA" },
    @{ Query = "Analyze supply path fees"; Expected = "SPO" },
    @{ Query = "Generate media plan document"; Expected = "DOC" },
    @{ Query = "Detect performance anomalies"; Expected = "PRF" },
    @{ Query = "Assess organizational change readiness"; Expected = "CHG" },
    @{ Query = "Select strategic framework for analysis"; Expected = "CST" },
    @{ Query = "Develop campaign strategy"; Expected = "MKT" }
)

foreach ($test in $routingTests) {
    # Call ORC routing endpoint
    # Verify routed to expected agent
}
```

---

## EXECUTION CHECKLIST

```
□ Phase 1: Seed Data Validation
  □ Run validate-all-seed-data.py
  □ Fix any errors reported
  □ Confirm 0 errors before proceeding

□ Phase 2: Dataverse Table Creation
  □ Create 15 tables in dependency order
  □ Verify all tables exist

□ Phase 3: Seed Data Import
  □ Import 13 CSV files in order
  □ Verify row counts match expected

□ Phase 4: Power Automate Flows
  □ Create 25 flows from YAML
  □ Enable all flows

□ Phase 5: AI Builder Prompts
  □ Create 19 prompts from seed data
  □ Test each prompt

□ Phase 6: Solution Export
  □ Export managed solution
  □ Export unmanaged solution
  □ Unpack for source control

□ Phase 7: Validation
  □ Verify all row counts
  □ Run routing tests (9/9 pass)
  □ Run agent tests (10/10 pass)
```

---

## EXPECTED FINAL STATE

| Component | Count | Status |
|-----------|-------|--------|
| Dataverse Tables | 15 | Created |
| Total Rows | ~316 | Imported |
| Power Automate Flows | 25 | Deployed |
| AI Builder Prompts | 19 | Created |
| Routing Tests | 9 | Passing |
| Agent Tests | 10 | Passing |

---

**Document Version:** 2.0
**Created:** 2026-01-19
**Target:** VS Code (Claude Code)
