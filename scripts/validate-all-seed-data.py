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
            'kpi_category': r'^[1-9]$',  # Extended to 1-9
            'funnel_stage': r'^[1-4]$',
            'direction': r'^[1-3]$',  # 1=higher_better, 2=lower_better, 3=neutral
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
            'partner_type': r'^[1-6]$',  # Extended to include type 6
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
            'implementation_type': r'^[1-4]$',  # Extended to include type 4
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
            'pathway_code': r'^[1-4]$',  # Extended to include pathway 4
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
            'framework_code': r'^[A-Z][A-Z0-9_-]+$',  # Allow hyphens (DS-01, ST-02, etc.)
            'category_code': r'^[1-9]$',  # Extended to include categories 7-9
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
            print(f"\n{RED}FILE NOT FOUND: {filename}{RESET}")
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
            print(f"{GREEN}PASSED - {result.row_count} rows validated{RESET}")
        else:
            for error in result.errors[:5]:  # Show first 5 errors
                print(f"{RED}ERROR: {error}{RESET}")
                total_errors += 1
            for error in json_errors[:3]:
                print(f"{RED}ERROR: {error}{RESET}")
                total_errors += 1
            if len(result.errors) > 5:
                print(f"{RED}   ... and {len(result.errors) - 5} more errors{RESET}")
                total_errors += len(result.errors) - 5

        # Show warnings (first 2 only)
        for warning in result.warnings[:2]:
            print(f"{YELLOW}WARNING: {warning}{RESET}")
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
        print(f"\n{GREEN}ALL VALIDATIONS PASSED - READY FOR IMPORT{RESET}")
        return 0
    else:
        print(f"\n{RED}VALIDATION FAILED - FIX {total_errors} ERRORS BEFORE IMPORT{RESET}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
