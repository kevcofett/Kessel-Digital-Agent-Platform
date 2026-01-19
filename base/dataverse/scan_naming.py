#!/usr/bin/env python3
"""
Scan KB docs and instructions for Dataverse table naming inconsistencies
"""

import os
import re
from pathlib import Path
from collections import defaultdict

base_path = Path('/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform')

# Correct table names (singular)
correct_table_names = {
    'eap_agent',
    'eap_capability', 
    'eap_capability_implementation',
    'eap_prompt',
    'eap_session',
    'eap_telemetry',
    'eap_test_case',
    'mpa_benchmark',
    'mpa_channel',
    'mpa_kpi',
    'mpa_partner',
    'mpa_vertical',
    'ca_framework',
    'ca_project',
    'ca_deliverable',
}

# Wrong variations to search for (plurals and common mistakes)
wrong_variations = {
    'eap_agents': 'eap_agent',
    'eap_capabilities': 'eap_capability',
    'eap_capability_implementations': 'eap_capability_implementation',
    'eap_prompts': 'eap_prompt',
    'eap_sessions': 'eap_session',
    'eap_telemetries': 'eap_telemetry',
    'eap_test_cases': 'eap_test_case',
    'mpa_benchmarks': 'mpa_benchmark',
    'mpa_channels': 'mpa_channel',
    'mpa_kpis': 'mpa_kpi',
    'mpa_partners': 'mpa_partner',
    'mpa_verticals': 'mpa_vertical',
    'ca_frameworks': 'ca_framework',
    'ca_projects': 'ca_project',
    'ca_deliverables': 'ca_deliverable',
}

# Directories to scan
scan_dirs = [
    base_path / 'base' / 'kb',
    base_path / 'base' / 'dataverse',
    base_path / 'release' / 'v5.5' / 'agents' / 'mpa',
    base_path / 'release' / 'v6.0' / 'agents' / 'mpa',
    base_path / 'release' / 'v5.5' / 'docs',
    base_path / 'release' / 'v6.0' / 'docs',
]

# File extensions to scan
scan_extensions = {'.md', '.txt', '.json', '.yaml', '.yml', '.xml', '.csv'}

def scan_file(file_path):
    """Scan a single file for naming issues"""
    issues = []
    
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
    except:
        return issues
    
    lines = content.split('\n')
    
    for line_num, line in enumerate(lines, 1):
        for wrong, correct in wrong_variations.items():
            # Case insensitive search for the wrong variation
            pattern = rf'\b{wrong}\b'
            matches = re.finditer(pattern, line, re.IGNORECASE)
            for match in matches:
                issues.append({
                    'file': str(file_path.relative_to(base_path)),
                    'line': line_num,
                    'found': match.group(),
                    'should_be': correct,
                    'context': line.strip()[:100]
                })
    
    return issues

def main():
    print("=" * 80)
    print("DATAVERSE TABLE NAMING CONSISTENCY SCAN")
    print("=" * 80)
    print()
    print("Searching for PLURAL table names (should all be SINGULAR):")
    print()
    
    all_issues = []
    files_scanned = 0
    
    for scan_dir in scan_dirs:
        if not scan_dir.exists():
            print(f"  Skipping (not found): {scan_dir}")
            continue
        
        print(f"  Scanning: {scan_dir}")
        
        for file_path in scan_dir.rglob('*'):
            if file_path.is_dir():
                continue
            if file_path.suffix.lower() not in scan_extensions:
                continue
            
            files_scanned += 1
            issues = scan_file(file_path)
            all_issues.extend(issues)
    
    print()
    print(f"Files scanned: {files_scanned}")
    print()
    
    if all_issues:
        print("=" * 80)
        print(f"❌ FOUND {len(all_issues)} NAMING ISSUES:")
        print("=" * 80)
        
        # Group by file
        by_file = defaultdict(list)
        for issue in all_issues:
            by_file[issue['file']].append(issue)
        
        for file, file_issues in sorted(by_file.items()):
            print(f"\n📄 {file}")
            for issue in file_issues:
                print(f"   Line {issue['line']}: '{issue['found']}' → should be '{issue['should_be']}'")
                print(f"      Context: {issue['context']}")
    else:
        print("=" * 80)
        print("✅ NO PLURAL TABLE NAME ISSUES FOUND")
        print("=" * 80)
    
    print()
    print("Correct table names (all singular):")
    for name in sorted(correct_table_names):
        print(f"  - {name}")

if __name__ == '__main__':
    main()
