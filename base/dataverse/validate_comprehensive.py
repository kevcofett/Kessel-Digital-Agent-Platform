#!/usr/bin/env python3
"""
Comprehensive Dataverse Validation Script
1. Check every column has at least one non-blank value
2. Check for singular/plural naming inconsistencies
"""

import json
import csv
import os
import re
from pathlib import Path
from collections import defaultdict

base_path = Path('/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform')
dataverse_path = base_path / 'base' / 'dataverse'
schema_path = dataverse_path / 'schema'
seed_path = dataverse_path / 'seed'

# Track all table names and references
all_table_names = set()
all_references = defaultdict(list)  # reference -> [locations]

def check_empty_columns():
    """Check that every column has at least one non-blank value"""
    print("=" * 80)
    print("CHECK 1: EMPTY COLUMNS (every column must have data in at least one row)")
    print("=" * 80)
    
    issues = []
    
    schema_files = sorted(schema_path.glob('*.json'))
    
    for schema_file in schema_files:
        table_name = schema_file.stem
        all_table_names.add(table_name)
        
        # Load schema
        with open(schema_file, 'r') as f:
            schema = json.load(f)
        
        # Find seed file
        seed_file = seed_path / f"{table_name}_seed.csv"
        
        if not seed_file.exists():
            print(f"\n{table_name}: No seed file (skipped)")
            continue
        
        # Load seed data
        with open(seed_file, 'r', newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
        
        if len(rows) < 2:
            print(f"\n{table_name}: Empty seed file")
            continue
        
        headers = rows[0]
        data_rows = rows[1:]
        
        # Check each column
        empty_cols = []
        partial_cols = []
        
        for col_idx, col_name in enumerate(headers):
            values = [row[col_idx] if col_idx < len(row) else '' for row in data_rows]
            non_empty = [v for v in values if v.strip()]
            
            if len(non_empty) == 0:
                empty_cols.append(col_name)
            elif len(non_empty) < len(data_rows):
                # Some rows have data, some don't
                empty_count = len(data_rows) - len(non_empty)
                partial_cols.append(f"{col_name} ({empty_count}/{len(data_rows)} empty)")
        
        print(f"\n{table_name}: {len(headers)} columns, {len(data_rows)} rows")
        
        if empty_cols:
            print(f"  ❌ COMPLETELY EMPTY COLUMNS: {empty_cols}")
            for col in empty_cols:
                issues.append(f"{table_name}.{col}: Column is completely empty in all rows")
        
        if partial_cols:
            print(f"  ⚠️  PARTIALLY EMPTY: {partial_cols}")
        
        if not empty_cols and not partial_cols:
            print(f"  ✅ All columns have data in all rows")
        elif not empty_cols:
            print(f"  ✅ No completely empty columns")
    
    return issues

def check_naming_consistency():
    """Check for singular/plural and naming inconsistencies"""
    print("\n")
    print("=" * 80)
    print("CHECK 2: NAMING CONSISTENCY (singular vs plural, table references)")
    print("=" * 80)
    
    issues = []
    
    # Known correct table names (from schema files)
    correct_names = set()
    for schema_file in schema_path.glob('*.json'):
        correct_names.add(schema_file.stem)
    
    print(f"\nCorrect table names ({len(correct_names)}):")
    for name in sorted(correct_names):
        print(f"  - {name}")
    
    # Common singular/plural variations to check
    variations = {
        'eap_agent': ['eap_agents', 'agent', 'agents'],
        'eap_capability': ['eap_capabilities', 'capability', 'capabilities'],
        'eap_capability_implementation': ['eap_capability_implementations', 'implementation', 'implementations'],
        'eap_prompt': ['eap_prompts', 'prompt', 'prompts'],
        'eap_session': ['eap_sessions', 'session', 'sessions'],
        'eap_test_case': ['eap_test_cases', 'test_case', 'test_cases'],
        'eap_telemetry': ['telemetry', 'eap_telemetries'],
        'mpa_channel': ['mpa_channels', 'channel', 'channels'],
        'mpa_kpi': ['mpa_kpis', 'kpi', 'kpis'],
        'mpa_benchmark': ['mpa_benchmarks', 'benchmark', 'benchmarks'],
        'mpa_vertical': ['mpa_verticals', 'vertical', 'verticals'],
        'mpa_partner': ['mpa_partners', 'partner', 'partners'],
        'ca_framework': ['ca_frameworks', 'framework', 'frameworks'],
        'ca_project': ['ca_projects', 'project', 'projects'],
        'ca_deliverable': ['ca_deliverables', 'deliverable', 'deliverables'],
    }
    
    # Files to scan for references
    scan_paths = [
        dataverse_path / 'schema',
        dataverse_path / 'seed',
    ]
    
    # Also scan KB and instructions if they exist
    kb_paths = [
        base_path / 'base' / 'kb',
        base_path / 'release' / 'v5.5' / 'agents' / 'mpa' / 'mastercard' / 'instructions',
        base_path / 'release' / 'v6.0' / 'agents' / 'mpa' / 'mastercard' / 'instructions',
    ]
    
    for kb_path in kb_paths:
        if kb_path.exists():
            scan_paths.append(kb_path)
    
    print(f"\nScanning for naming inconsistencies in:")
    for p in scan_paths:
        if p.exists():
            print(f"  - {p}")
    
    # Scan files
    found_issues = []
    
    for scan_path in scan_paths:
        if not scan_path.exists():
            continue
        
        for file_path in scan_path.rglob('*'):
            if file_path.is_dir():
                continue
            if file_path.suffix not in ['.json', '.csv', '.md', '.txt']:
                continue
            
            try:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
            except:
                continue
            
            # Check for incorrect variations
            for correct, wrongs in variations.items():
                for wrong in wrongs:
                    # Look for the wrong name as a standalone word
                    patterns = [
                        rf'\b{wrong}\b',  # Word boundary
                        rf'"{wrong}"',     # In quotes
                        rf"'{wrong}'",     # In single quotes
                    ]
                    for pattern in patterns:
                        matches = re.findall(pattern, content, re.IGNORECASE)
                        if matches:
                            # Check if it's actually wrong (not part of correct name)
                            for match in matches:
                                # Skip if it's a display name or description
                                if match.lower() in ['channel', 'channels', 'agent', 'agents', 'session', 'sessions']:
                                    # These are common English words, check context
                                    pass
                                rel_path = file_path.relative_to(base_path)
                                found_issues.append(f"{rel_path}: Found '{match}' (should be '{correct}'?)")
    
    # Check schema files for lookup_table references
    print("\n\nChecking lookup_table references in schemas:")
    for schema_file in schema_path.glob('*.json'):
        with open(schema_file, 'r') as f:
            schema = json.load(f)
        
        for col in schema.get('columns', []):
            if col.get('type') == 'lookup':
                lookup_table = col.get('lookup_table', '')
                if lookup_table and lookup_table not in correct_names:
                    issues.append(f"{schema_file.name}: lookup_table '{lookup_table}' is not a valid table name")
                    print(f"  ❌ {schema_file.name}: {col['name']} references '{lookup_table}' - NOT FOUND")
                elif lookup_table:
                    print(f"  ✅ {schema_file.name}: {col['name']} -> {lookup_table}")
    
    # Check seed files for foreign key references
    print("\n\nChecking foreign key code references in seed data:")
    
    # Build lookup of valid codes
    valid_codes = {
        'agent_code': set(),
        'capability_code': set(),
        'vertical_code': set(),
        'channel_code': set(),
        'kpi_code': set(),
        'partner_code': set(),
        'framework_code': set(),
    }
    
    # Load valid codes from seed files
    code_files = {
        'agent_code': ('eap_agent_seed.csv', 'agent_code'),
        'capability_code': ('eap_capability_seed.csv', 'capability_code'),
        'vertical_code': ('mpa_vertical_seed.csv', 'vertical_code'),
        'channel_code': ('mpa_channel_seed.csv', 'channel_code'),
        'kpi_code': ('mpa_kpi_seed.csv', 'kpi_code'),
        'partner_code': ('mpa_partner_seed.csv', 'partner_code'),
        'framework_code': ('ca_framework_seed.csv', 'framework_code'),
    }
    
    for code_type, (filename, col_name) in code_files.items():
        seed_file = seed_path / filename
        if seed_file.exists():
            with open(seed_file, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if col_name in row and row[col_name]:
                        valid_codes[code_type].add(row[col_name])
            print(f"  Loaded {len(valid_codes[code_type])} valid {code_type} values")
    
    # Now check references in other seed files
    print("\n\nValidating foreign key references:")
    
    ref_checks = [
        ('eap_capability_seed.csv', 'agent_code', 'agent_code'),
        ('eap_capability_implementation_seed.csv', 'capability_code', 'capability_code'),
        ('eap_prompt_seed.csv', 'agent_code', 'agent_code'),
        ('eap_session_seed.csv', 'agent_code', 'agent_code'),
        ('eap_test_case_seed.csv', 'agent_code', 'agent_code'),
        ('eap_test_case_seed.csv', 'capability_code', 'capability_code'),
        ('eap_test_case_seed.csv', 'expected_agent_code', 'agent_code'),
        ('eap_test_case_seed.csv', 'expected_capability_code', 'capability_code'),
        ('mpa_benchmark_seed.csv', 'vertical_code', 'vertical_code'),
        ('mpa_benchmark_seed.csv', 'channel_code', 'channel_code'),
        ('mpa_benchmark_seed.csv', 'kpi_code', 'kpi_code'),
        ('eap_agent_seed.csv', 'fallback_agent_code', 'agent_code'),
    ]
    
    for filename, col_to_check, valid_code_type in ref_checks:
        seed_file = seed_path / filename
        if not seed_file.exists():
            continue
        
        with open(seed_file, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        invalid_refs = []
        for row_idx, row in enumerate(rows, start=2):
            if col_to_check in row:
                value = row[col_to_check]
                if value and value not in valid_codes[valid_code_type]:
                    invalid_refs.append(f"Row {row_idx}: '{value}'")
        
        if invalid_refs:
            print(f"  ❌ {filename}.{col_to_check}: Invalid references: {invalid_refs[:5]}")
            issues.append(f"{filename}.{col_to_check}: Invalid {valid_code_type} references")
        else:
            print(f"  ✅ {filename}.{col_to_check}: All references valid")
    
    return issues

def check_schema_table_names():
    """Check that schema table_name matches filename"""
    print("\n")
    print("=" * 80)
    print("CHECK 3: SCHEMA TABLE_NAME vs FILENAME CONSISTENCY")
    print("=" * 80)
    
    issues = []
    
    for schema_file in sorted(schema_path.glob('*.json')):
        with open(schema_file, 'r') as f:
            schema = json.load(f)
        
        filename_base = schema_file.stem
        table_name = schema.get('table_name', '')
        
        if filename_base != table_name:
            print(f"  ❌ {schema_file.name}: filename='{filename_base}' but table_name='{table_name}'")
            issues.append(f"{schema_file.name}: Filename and table_name mismatch")
        else:
            print(f"  ✅ {schema_file.name}: table_name matches filename")
    
    return issues

def main():
    all_issues = []
    
    # Check 1: Empty columns
    issues = check_empty_columns()
    all_issues.extend(issues)
    
    # Check 2: Naming consistency
    issues = check_naming_consistency()
    all_issues.extend(issues)
    
    # Check 3: Schema table_name matches filename
    issues = check_schema_table_names()
    all_issues.extend(issues)
    
    # Summary
    print("\n")
    print("=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    
    if all_issues:
        print(f"\n❌ FOUND {len(all_issues)} ISSUES:\n")
        for issue in all_issues:
            print(f"  - {issue}")
    else:
        print("\n✅ ALL CHECKS PASSED")

if __name__ == '__main__':
    main()
