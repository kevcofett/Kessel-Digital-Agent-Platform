#!/usr/bin/env python3
"""
6-Rule Compliance Validator for v6.0 Multi-Agent Architecture
Validates all instruction and KB files against Copilot Studio requirements.
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Any

# Configuration
V6_BASE = Path(__file__).parent / "agents"
INSTRUCTION_CHAR_LIMIT = 8000
KB_CHAR_LIMIT = 36000

# Non-ASCII patterns to detect
NON_ASCII_PATTERNS = {
    'curly_single_quote_left': ''',
    'curly_single_quote_right': ''',
    'curly_double_quote_left': '"',
    'curly_double_quote_right': '"',
    'em_dash': '—',
    'en_dash': '–',
    'ellipsis': '…',
    'bullet': '•',
    'bullet_hollow': '○',
    'bullet_filled': '●',
    'check': '✓',
    'check_heavy': '✔',
    'cross': '✗',
    'cross_heavy': '✘',
    'arrow_right': '→',
    'arrow_left': '←',
    'nbsp': '\xa0',
}

# Bullet patterns (not allowed)
BULLET_PATTERNS = [
    r'^[\s]*[•●○▪▫◦⦿⦾]\s',  # Various bullet characters
    r'^\s*\*\s+(?![*])',  # Asterisk bullets (but not bold)
]

# Markdown header pattern (not allowed - should be ALL-CAPS)
MARKDOWN_HEADER = re.compile(r'^#{1,6}\s+')

def find_all_files() -> Tuple[List[Path], List[Path]]:
    """Find all instruction and KB files."""
    instructions = []
    kb_files = []
    
    for agent_dir in V6_BASE.iterdir():
        if not agent_dir.is_dir():
            continue
        
        # Find instruction files
        inst_dir = agent_dir / "instructions"
        if inst_dir.exists():
            for f in inst_dir.glob("*.txt"):
                instructions.append(f)
        
        # Find KB files
        kb_dir = agent_dir / "kb"
        if kb_dir.exists():
            for f in kb_dir.glob("*.txt"):
                kb_files.append(f)
    
    return sorted(instructions), sorted(kb_files)

def check_all_caps_headers(content: str, lines: List[str]) -> List[Dict]:
    """Rule 1: ALL-CAPS section headers (no markdown #)."""
    issues = []
    
    for i, line in enumerate(lines, 1):
        # Check for markdown headers
        if MARKDOWN_HEADER.match(line):
            issues.append({
                'line': i,
                'rule': 'ALL-CAPS Headers',
                'issue': f'Markdown header found: "{line.strip()[:50]}"',
                'severity': 'ERROR'
            })
        
        # Check if line looks like a header but isn't ALL-CAPS
        # Headers typically are standalone, short, and often end without punctuation
        stripped = line.strip()
        if (stripped and 
            len(stripped) < 80 and 
            not stripped.endswith(('.', ',', ':', ';')) and
            stripped.isupper() == False and
            stripped == stripped.upper().replace(' ', stripped.replace(stripped.upper(), '')).upper()):
            # This is heuristic - might have false positives
            pass
    
    return issues

def check_hyphens_only(content: str, lines: List[str]) -> List[Dict]:
    """Rule 2: Hyphens only for lists (no bullets •●○)."""
    issues = []
    
    for i, line in enumerate(lines, 1):
        for pattern in BULLET_PATTERNS:
            if re.match(pattern, line):
                issues.append({
                    'line': i,
                    'rule': 'Hyphens Only',
                    'issue': f'Non-hyphen bullet found: "{line.strip()[:50]}"',
                    'severity': 'ERROR'
                })
                break
        
        # Check for bullet characters anywhere in line
        for name, char in NON_ASCII_PATTERNS.items():
            if 'bullet' in name and char in line:
                issues.append({
                    'line': i,
                    'rule': 'Hyphens Only',
                    'issue': f'Bullet character "{char}" ({name}) found',
                    'severity': 'ERROR'
                })
    
    return issues

def check_ascii_only(content: str, lines: List[str]) -> List[Dict]:
    """Rule 3: ASCII only (no curly quotes, em-dashes, special chars)."""
    issues = []
    
    for i, line in enumerate(lines, 1):
        # Check each character
        for j, char in enumerate(line):
            if ord(char) > 127:
                char_name = NON_ASCII_PATTERNS.get(char, f'U+{ord(char):04X}')
                if char not in issues:  # Avoid duplicate reports for same char
                    issues.append({
                        'line': i,
                        'rule': 'ASCII Only',
                        'issue': f'Non-ASCII char "{char}" ({char_name}) at position {j}',
                        'severity': 'ERROR'
                    })
    
    return issues

def check_visual_dependencies(content: str, lines: List[str]) -> List[Dict]:
    """Rule 4: Zero visual dependencies (plain text renders correctly)."""
    issues = []
    
    # Check for table-like structures that depend on alignment
    table_patterns = [
        r'\|.*\|.*\|',  # Markdown tables
        r'^\s*[-+]+\s*$',  # Table separators
    ]
    
    for i, line in enumerate(lines, 1):
        for pattern in table_patterns:
            if re.match(pattern, line):
                issues.append({
                    'line': i,
                    'rule': 'Visual Dependencies',
                    'issue': f'Potential table structure found: "{line.strip()[:50]}"',
                    'severity': 'WARNING'
                })
                break
    
    return issues

def check_mandatory_language(content: str, lines: List[str]) -> List[Dict]:
    """Rule 5: Mandatory language (professional directives)."""
    issues = []
    
    # Check for weak language patterns
    weak_patterns = [
        (r'\bmaybe\b', 'maybe'),
        (r'\bperhaps\b', 'perhaps'),
        (r'\bkind of\b', 'kind of'),
        (r'\bsort of\b', 'sort of'),
        (r'\bi guess\b', 'I guess'),
        (r'\bi think\b', 'I think'),  # Sometimes OK but often weak
    ]
    
    for i, line in enumerate(lines, 1):
        line_lower = line.lower()
        for pattern, name in weak_patterns:
            if re.search(pattern, line_lower):
                issues.append({
                    'line': i,
                    'rule': 'Mandatory Language',
                    'issue': f'Weak language "{name}" found',
                    'severity': 'WARNING'
                })
    
    return issues

def check_professional_tone(content: str, lines: List[str]) -> List[Dict]:
    """Rule 6: Professional tone (expert advisor voice)."""
    issues = []
    
    # Check for casual/unprofessional patterns
    casual_patterns = [
        (r'\bawesome\b', 'awesome'),
        (r'\bcool\b', 'cool'),
        (r'\bstuff\b', 'stuff'),
        (r'\bthing\b', 'thing'),  # Often OK but can be vague
        (r'\bguys\b', 'guys'),
        (r'\byeah\b', 'yeah'),
        (r'\bnope\b', 'nope'),
        (r'!!+', 'multiple exclamation marks'),
        (r'\?\?+', 'multiple question marks'),
    ]
    
    for i, line in enumerate(lines, 1):
        line_lower = line.lower()
        for pattern, name in casual_patterns:
            if re.search(pattern, line_lower):
                issues.append({
                    'line': i,
                    'rule': 'Professional Tone',
                    'issue': f'Casual language "{name}" found',
                    'severity': 'WARNING'
                })
    
    return issues

def check_character_limit(content: str, limit: int, file_type: str) -> Dict:
    """Check character limit."""
    char_count = len(content)
    return {
        'char_count': char_count,
        'limit': limit,
        'file_type': file_type,
        'passed': char_count <= limit,
        'percentage': round((char_count / limit) * 100, 1)
    }

def validate_file(file_path: Path, is_instruction: bool = False) -> Dict[str, Any]:
    """Validate a single file against all 6 rules."""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return {
            'file': str(file_path),
            'status': 'ERROR',
            'error': str(e),
            'issues': []
        }
    
    lines = content.split('\n')
    limit = INSTRUCTION_CHAR_LIMIT if is_instruction else KB_CHAR_LIMIT
    file_type = 'instruction' if is_instruction else 'kb'
    
    # Run all checks
    all_issues = []
    all_issues.extend(check_all_caps_headers(content, lines))
    all_issues.extend(check_hyphens_only(content, lines))
    all_issues.extend(check_ascii_only(content, lines))
    all_issues.extend(check_visual_dependencies(content, lines))
    all_issues.extend(check_mandatory_language(content, lines))
    all_issues.extend(check_professional_tone(content, lines))
    
    char_check = check_character_limit(content, limit, file_type)
    
    # Determine overall status
    errors = [i for i in all_issues if i['severity'] == 'ERROR']
    warnings = [i for i in all_issues if i['severity'] == 'WARNING']
    
    if not char_check['passed']:
        status = 'FAIL'
    elif errors:
        status = 'FAIL'
    elif warnings:
        status = 'WARN'
    else:
        status = 'PASS'
    
    return {
        'file': str(file_path.relative_to(V6_BASE.parent)),
        'agent': file_path.parent.parent.name,
        'type': file_type,
        'status': status,
        'char_count': char_check['char_count'],
        'char_limit': char_check['limit'],
        'char_percentage': char_check['percentage'],
        'char_passed': char_check['passed'],
        'error_count': len(errors),
        'warning_count': len(warnings),
        'issues': all_issues[:20]  # Limit to first 20 issues per file
    }

def generate_report(results: List[Dict]) -> str:
    """Generate the validation report."""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Summary stats
    total = len(results)
    passed = sum(1 for r in results if r['status'] == 'PASS')
    warnings = sum(1 for r in results if r['status'] == 'WARN')
    failed = sum(1 for r in results if r['status'] == 'FAIL')
    errors_total = sum(r.get('error_count', 0) for r in results)
    warnings_total = sum(r.get('warning_count', 0) for r in results)
    
    instructions = [r for r in results if r['type'] == 'instruction']
    kb_files = [r for r in results if r['type'] == 'kb']
    
    report = []
    report.append("VALIDATION REPORT - V6.0 MULTI-AGENT ARCHITECTURE")
    report.append("=" * 60)
    report.append("")
    report.append(f"Generated: {timestamp}")
    report.append(f"Branch: feature/multi-agent-architecture")
    report.append("")
    report.append("-" * 60)
    report.append("SUMMARY")
    report.append("-" * 60)
    report.append("")
    report.append(f"Total Files Validated: {total}")
    report.append(f"  - Instruction Files: {len(instructions)}")
    report.append(f"  - KB Files: {len(kb_files)}")
    report.append("")
    report.append(f"Results:")
    report.append(f"  - PASS: {passed}")
    report.append(f"  - WARN: {warnings}")
    report.append(f"  - FAIL: {failed}")
    report.append("")
    report.append(f"Total Errors: {errors_total}")
    report.append(f"Total Warnings: {warnings_total}")
    report.append("")
    
    # Character count summary
    report.append("-" * 60)
    report.append("CHARACTER COUNT SUMMARY")
    report.append("-" * 60)
    report.append("")
    report.append("Instruction Files (limit: 8,000 chars):")
    for r in instructions:
        status = "PASS" if r['char_passed'] else "FAIL"
        report.append(f"  [{status}] {r['file']}: {r['char_count']:,} chars ({r['char_percentage']}%)")
    report.append("")
    report.append("KB Files (limit: 36,000 chars):")
    for r in kb_files:
        status = "PASS" if r['char_passed'] else "FAIL"
        report.append(f"  [{status}] {r['file']}: {r['char_count']:,} chars ({r['char_percentage']}%)")
    report.append("")
    
    # 6-Rule Compliance by Agent
    report.append("-" * 60)
    report.append("6-RULE COMPLIANCE BY AGENT")
    report.append("-" * 60)
    report.append("")
    
    agents = sorted(set(r['agent'] for r in results))
    for agent in agents:
        agent_results = [r for r in results if r['agent'] == agent]
        agent_pass = all(r['status'] in ['PASS', 'WARN'] for r in agent_results)
        status = "PASS" if agent_pass else "FAIL"
        report.append(f"[{status}] {agent.upper()}")
        for r in agent_results:
            file_name = Path(r['file']).name
            report.append(f"    [{r['status']}] {file_name} - {r['error_count']} errors, {r['warning_count']} warnings")
        report.append("")
    
    # Detailed Issues (only for files with issues)
    files_with_issues = [r for r in results if r['issues']]
    if files_with_issues:
        report.append("-" * 60)
        report.append("DETAILED ISSUES")
        report.append("-" * 60)
        report.append("")
        
        for r in files_with_issues:
            report.append(f"File: {r['file']}")
            for issue in r['issues']:
                report.append(f"  Line {issue['line']}: [{issue['severity']}] {issue['rule']}")
                report.append(f"    {issue['issue']}")
            report.append("")
    
    # Compliance Checklist
    report.append("-" * 60)
    report.append("6-RULE COMPLIANCE CHECKLIST")
    report.append("-" * 60)
    report.append("")
    report.append("Rule 1 - ALL-CAPS Headers: " + ("PASS" if errors_total == 0 or not any('ALL-CAPS' in str(i) for r in results for i in r['issues']) else "CHECK ISSUES"))
    report.append("Rule 2 - Hyphens Only: " + ("PASS" if not any('Hyphens' in str(i) for r in results for i in r['issues']) else "CHECK ISSUES"))
    report.append("Rule 3 - ASCII Only: " + ("PASS" if not any('ASCII' in str(i) for r in results for i in r['issues']) else "CHECK ISSUES"))
    report.append("Rule 4 - Visual Dependencies: " + ("PASS" if not any('Visual' in str(i.get('rule', '')) for r in results for i in r['issues'] if i.get('severity') == 'ERROR') else "CHECK ISSUES"))
    report.append("Rule 5 - Mandatory Language: " + ("PASS" if not any('Mandatory' in str(i.get('rule', '')) for r in results for i in r['issues'] if i.get('severity') == 'ERROR') else "CHECK ISSUES"))
    report.append("Rule 6 - Professional Tone: " + ("PASS" if not any('Professional' in str(i.get('rule', '')) for r in results for i in r['issues'] if i.get('severity') == 'ERROR') else "CHECK ISSUES"))
    report.append("")
    
    # Final Status
    overall_pass = failed == 0
    report.append("-" * 60)
    report.append("FINAL STATUS")
    report.append("-" * 60)
    report.append("")
    if overall_pass:
        report.append("*** ALL FILES PASS VALIDATION ***")
        report.append("")
        report.append("Ready to proceed with:")
        report.append("  - Merge to deploy/mastercard")
        report.append("  - Phase 3 Vertical Overlays")
    else:
        report.append("*** VALIDATION FAILED ***")
        report.append("")
        report.append(f"{failed} file(s) require fixes before proceeding.")
        report.append("")
        report.append("Review DETAILED ISSUES section above.")
    report.append("")
    report.append("=" * 60)
    report.append("END OF REPORT")
    report.append("=" * 60)
    
    return '\n'.join(report)

def main():
    """Main validation runner."""
    print("=" * 60)
    print("V6.0 Multi-Agent Compliance Validator")
    print("=" * 60)
    print()
    
    # Find all files
    instructions, kb_files = find_all_files()
    print(f"Found {len(instructions)} instruction files")
    print(f"Found {len(kb_files)} KB files")
    print(f"Total: {len(instructions) + len(kb_files)} files")
    print()
    
    # Validate all files
    results = []
    
    print("Validating instruction files...")
    for f in instructions:
        print(f"  Checking {f.name}...")
        result = validate_file(f, is_instruction=True)
        results.append(result)
    
    print()
    print("Validating KB files...")
    for f in kb_files:
        print(f"  Checking {f.name}...")
        result = validate_file(f, is_instruction=False)
        results.append(result)
    
    print()
    
    # Generate and save report
    report = generate_report(results)
    report_path = V6_BASE.parent / "docs" / "VALIDATION_REPORT_FINAL.md"
    report_path.write_text(report, encoding='utf-8')
    
    print(f"Report saved to: {report_path}")
    print()
    
    # Print summary
    passed = sum(1 for r in results if r['status'] == 'PASS')
    failed = sum(1 for r in results if r['status'] == 'FAIL')
    print(f"SUMMARY: {passed} passed, {failed} failed")
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())
