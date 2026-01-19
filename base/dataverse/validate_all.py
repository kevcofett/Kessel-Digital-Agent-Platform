#!/usr/bin/env python3
"""
Comprehensive Dataverse Schema and Seed Data Validation Script
Validates all 14 tables for type mismatches, missing columns, and data format errors
"""

import json
import csv
import os
import re
from pathlib import Path
from datetime import datetime

base_path = Path('/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/dataverse')
schema_path = base_path / 'schema'
seed_path = base_path / 'seed'

# Validation results
all_issues = []

def validate_guid(value, col_name):
    """Validate GUID format"""
    if not value:
        return None
    pattern = r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    if not re.match(pattern, value):
        return f"Invalid GUID format: '{value}'"
    return None

def validate_int(value, col_name):
    """Validate integer"""
    if not value and value != 0:
        return None
    try:
        int(value)
        return None
    except ValueError:
        return f"Invalid int: '{value}'"

def validate_decimal(value, col_name):
    """Validate decimal"""
    if not value and value != 0:
        return None
    try:
        float(value)
        return None
    except ValueError:
        return f"Invalid decimal: '{value}'"

def validate_bit(value, col_name):
    """Validate boolean"""
    if not value:
        return None
    if value.lower() not in ['true', 'false', '1', '0']:
        return f"Invalid bit/boolean: '{value}' (expected true/false)"
    return None

def validate_datetime(value, col_name):
    """Validate ISO datetime"""
    if not value:
        return None
    # Accept ISO format with or without timezone
    patterns = [
        r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$',
        r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$',
        r'^\d{4}-\d{2}-\d{2}$'
    ]
    for pattern in patterns:
        if re.match(pattern, value):
            return None
    return f"Invalid datetime: '{value}' (expected ISO format like 2026-01-18T00:00:00Z)"

def validate_choice(value, col_name, choices):
    """Validate choice field is numeric and in valid range"""
    if not value:
        return None
    try:
        val = int(value)
        valid_values = [c['value'] for c in choices]
        if val not in valid_values:
            return f"Invalid choice value: {val} (valid: {valid_values})"
        return None
    except ValueError:
        return f"Choice must be numeric, got: '{value}'"

def validate_nvarchar(value, col_name, max_length):
    """Validate string length"""
    if not value:
        return None
    if len(value) > max_length:
        return f"String exceeds max_length {max_length}: {len(value)} chars"
    return None

def validate_table(table_name, schema, seed_rows, seed_headers):
    """Validate a single table's seed data against its schema"""
    issues = []
    
    # Build column lookup from schema
    schema_cols = {col['name']: col for col in schema['columns']}
    schema_col_names = set(schema_cols.keys())
    seed_col_names = set(seed_headers)
    
    # Check for column mismatches
    missing_in_seed = schema_col_names - seed_col_names
    extra_in_seed = seed_col_names - schema_col_names
    
    # Filter out optional columns that might be legitimately missing
    required_missing = []
    for col_name in missing_in_seed:
        col = schema_cols[col_name]
        if col.get('required', False) and not col.get('auto_generated', False):
            required_missing.append(col_name)
    
    if required_missing:
        issues.append(f"MISSING REQUIRED COLUMNS in seed: {required_missing}")
    
    if extra_in_seed:
        issues.append(f"EXTRA COLUMNS in seed (not in schema): {extra_in_seed}")
    
    # Validate each row
    for row_idx, row in enumerate(seed_rows, start=2):  # Start at 2 (row 1 is header)
        for col_idx, col_name in enumerate(seed_headers):
            if col_name not in schema_cols:
                continue  # Skip columns not in schema
            
            col_def = schema_cols[col_name]
            col_type = col_def['type']
            value = row[col_idx] if col_idx < len(row) else ''
            
            # Check required fields
            if col_def.get('required', False) and not value and not col_def.get('auto_generated', False):
                issues.append(f"Row {row_idx}, {col_name}: REQUIRED field is empty")
                continue
            
            # Type-specific validation
            error = None
            if col_type == 'uniqueidentifier':
                error = validate_guid(value, col_name)
            elif col_type == 'int':
                error = validate_int(value, col_name)
            elif col_type == 'decimal':
                error = validate_decimal(value, col_name)
            elif col_type == 'bit':
                error = validate_bit(value, col_name)
            elif col_type == 'datetime':
                error = validate_datetime(value, col_name)
            elif col_type == 'choice':
                choices = col_def.get('choices', [])
                error = validate_choice(value, col_name, choices)
            elif col_type == 'nvarchar':
                max_len = col_def.get('max_length', 4000)
                error = validate_nvarchar(value, col_name, max_len)
            elif col_type == 'lookup':
                # Lookups should be GUIDs or empty
                if value:
                    error = validate_guid(value, col_name)
            
            if error:
                issues.append(f"Row {row_idx}, {col_name}: {error}")
    
    return issues

def main():
    print("=" * 80)
    print("DATAVERSE SCHEMA AND SEED DATA VALIDATION")
    print("=" * 80)
    print()
    
    # Get all schema files
    schema_files = sorted(schema_path.glob('*.json'))
    print(f"Found {len(schema_files)} schema files\n")
    
    total_issues = 0
    tables_validated = 0
    tables_with_issues = 0
    
    for schema_file in schema_files:
        table_name = schema_file.stem
        
        # Load schema
        with open(schema_file, 'r') as f:
            schema = json.load(f)
        
        # Find corresponding seed file
        seed_file = seed_path / f"{table_name}_seed.csv"
        
        print(f"\n{'='*60}")
        print(f"TABLE: {table_name}")
        print(f"{'='*60}")
        print(f"Schema: {schema_file.name}")
        
        # List schema columns
        print(f"\nSchema columns ({len(schema['columns'])}):")
        for col in schema['columns']:
            req = "REQUIRED" if col.get('required') else "optional"
            auto = " (auto)" if col.get('auto_generated') else ""
            col_type = col['type']
            if col_type == 'choice':
                choices = col.get('choices', [])
                choice_vals = [str(c['value']) for c in choices]
                col_type = f"choice({','.join(choice_vals)})"
            elif col_type == 'nvarchar':
                col_type = f"nvarchar({col.get('max_length', '?')})"
            print(f"  - {col['name']}: {col_type} [{req}]{auto}")
        
        if not seed_file.exists():
            print(f"\nSeed file: NOT FOUND (may be intentional for transactional/runtime tables)")
            tables_validated += 1
            continue
        
        # Load seed data
        with open(seed_file, 'r', newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
        
        if len(rows) < 2:
            print(f"\nSeed file: {seed_file.name} - EMPTY OR HEADER ONLY")
            continue
        
        headers = rows[0]
        data_rows = rows[1:]
        
        print(f"\nSeed file: {seed_file.name}")
        print(f"Seed columns ({len(headers)}): {headers}")
        print(f"Seed rows: {len(data_rows)}")
        
        # Validate
        issues = validate_table(table_name, schema, data_rows, headers)
        
        tables_validated += 1
        
        if issues:
            tables_with_issues += 1
            total_issues += len(issues)
            print(f"\n❌ ISSUES FOUND ({len(issues)}):")
            for issue in issues[:20]:  # Limit to first 20
                print(f"  - {issue}")
            if len(issues) > 20:
                print(f"  ... and {len(issues) - 20} more issues")
        else:
            print(f"\n✅ VALID - All {len(data_rows)} rows pass validation")
    
    # Summary
    print("\n")
    print("=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    print(f"Tables validated: {tables_validated}")
    print(f"Tables with issues: {tables_with_issues}")
    print(f"Total issues found: {total_issues}")
    
    if total_issues == 0:
        print("\n✅ ALL TABLES PASS VALIDATION")
    else:
        print(f"\n❌ {total_issues} ISSUES NEED TO BE FIXED")

if __name__ == '__main__':
    main()
