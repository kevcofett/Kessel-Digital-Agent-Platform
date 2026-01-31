#!/usr/bin/env python3
"""
KB File Encoding Sanitization Script
MPA v6.0 - Fixes non-ASCII character encoding issues

Usage:
    python sanitize_kb_files.py /path/to/kb/directory
    
This script:
1. Scans all .txt files in the specified directory
2. Replaces non-ASCII characters with ASCII equivalents
3. Reports changes made per file
4. Creates backup before modification (optional)
"""

import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Character replacement mapping
REPLACEMENTS: Dict[str, str] = {
    # Dashes
    '\u2013': '--',      # en-dash
    '\u2014': '--',      # em-dash
    '\u2010': '-',       # hyphen
    '\u2011': '-',       # non-breaking hyphen
    '\u2012': '-',       # figure dash
    '\u2015': '--',      # horizontal bar
    
    # Quotes
    '\u2018': "'",       # left single quote
    '\u2019': "'",       # right single quote
    '\u201a': "'",       # single low-9 quote
    '\u201b': "'",       # single high-reversed-9 quote
    '\u201c': '"',       # left double quote
    '\u201d': '"',       # right double quote
    '\u201e': '"',       # double low-9 quote
    '\u201f': '"',       # double high-reversed-9 quote
    '\u00ab': '"',       # left-pointing double angle quote
    '\u00bb': '"',       # right-pointing double angle quote
    
    # Ellipsis and dots
    '\u2026': '...',     # ellipsis
    '\u22ef': '...',     # midline horizontal ellipsis
    
    # Bullets and markers
    '\u2022': '-',       # bullet
    '\u2023': '-',       # triangular bullet
    '\u2043': '-',       # hyphen bullet
    '\u204c': '-',       # black leftwards bullet
    '\u204d': '-',       # black rightwards bullet
    '\u2219': '-',       # bullet operator
    '\u25aa': '-',       # black small square
    '\u25cf': '-',       # black circle
    '\u25e6': '-',       # white bullet
    
    # Spaces
    '\u00a0': ' ',       # non-breaking space
    '\u2002': ' ',       # en space
    '\u2003': ' ',       # em space
    '\u2009': ' ',       # thin space
    '\u200b': '',        # zero-width space (remove)
    '\u200c': '',        # zero-width non-joiner (remove)
    '\u200d': '',        # zero-width joiner (remove)
    '\ufeff': '',        # BOM (remove)
    
    # Arrows
    '\u2190': '<-',      # leftwards arrow
    '\u2192': '->',      # rightwards arrow
    '\u2194': '<->',     # left right arrow
    '\u21d2': '=>',      # rightwards double arrow
    '\u21d0': '<=',      # leftwards double arrow
    
    # Mathematical
    '\u00d7': 'x',       # multiplication sign
    '\u00f7': '/',       # division sign
    '\u2212': '-',       # minus sign
    '\u00b1': '+/-',     # plus-minus sign
    '\u2264': '<=',      # less-than or equal
    '\u2265': '>=',      # greater-than or equal
    '\u2260': '!=',      # not equal
    '\u2248': '~=',      # approximately equal
    '\u221e': 'infinity',# infinity
    
    # Currency
    '\u20ac': 'EUR',     # euro sign
    '\u00a3': 'GBP',     # pound sign
    '\u00a5': 'JPY',     # yen sign
    
    # Other common
    '\u00ae': '(R)',     # registered trademark
    '\u2122': '(TM)',    # trademark
    '\u00a9': '(c)',     # copyright
    '\u00b0': ' degrees',# degree sign
    '\u00b2': '^2',      # superscript 2
    '\u00b3': '^3',      # superscript 3
    '\u00bd': '1/2',     # one half
    '\u00bc': '1/4',     # one quarter
    '\u00be': '3/4',     # three quarters
}

def sanitize_content(content: str) -> Tuple[str, int, List[str]]:
    """
    Sanitize content by replacing non-ASCII characters.
    
    Returns:
        Tuple of (sanitized_content, change_count, list_of_changes)
    """
    changes: List[str] = []
    change_count = 0
    
    # Apply explicit replacements
    for old_char, new_char in REPLACEMENTS.items():
        if old_char in content:
            occurrences = content.count(old_char)
            content = content.replace(old_char, new_char)
            changes.append(f"  Replaced {repr(old_char)} with {repr(new_char)} ({occurrences}x)")
            change_count += occurrences
    
    # Remove any remaining non-ASCII characters
    non_ascii_pattern = re.compile(r'[^\x00-\x7F]')
    remaining_non_ascii = non_ascii_pattern.findall(content)
    if remaining_non_ascii:
        unique_chars = set(remaining_non_ascii)
        for char in unique_chars:
            occurrences = content.count(char)
            changes.append(f"  Removed unknown non-ASCII {repr(char)} ({occurrences}x)")
            change_count += occurrences
        content = non_ascii_pattern.sub('', content)
    
    return content, change_count, changes

def check_file(filepath: Path) -> List[str]:
    """Check a file for non-ASCII characters without modifying."""
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        non_ascii_pattern = re.compile(r'[^\x00-\x7F]')
        matches = non_ascii_pattern.findall(content)
        if matches:
            unique_chars = set(matches)
            for char in unique_chars:
                count = matches.count(char)
                issues.append(f"  Found {repr(char)} ({count}x)")
    except Exception as e:
        issues.append(f"  Error reading file: {e}")
    
    return issues

def process_file(filepath: Path, dry_run: bool = False, create_backup: bool = True) -> Tuple[int, List[str]]:
    """
    Process a single file.
    
    Args:
        filepath: Path to the file
        dry_run: If True, only report changes without modifying
        create_backup: If True, create .bak file before modifying
    
    Returns:
        Tuple of (change_count, list_of_changes)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        # Try with latin-1 fallback
        with open(filepath, 'r', encoding='latin-1') as f:
            content = f.read()
    
    sanitized, change_count, changes = sanitize_content(content)
    
    if change_count > 0 and not dry_run:
        if create_backup:
            backup_path = filepath.with_suffix(filepath.suffix + '.bak')
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(sanitized)
    
    return change_count, changes

def main():
    if len(sys.argv) < 2:
        print("Usage: python sanitize_kb_files.py <directory> [--dry-run] [--no-backup]")
        print("")
        print("Options:")
        print("  --dry-run    Report issues without modifying files")
        print("  --no-backup  Don't create backup files")
        print("")
        print("Example:")
        print("  python sanitize_kb_files.py ./kb --dry-run")
        sys.exit(1)
    
    directory = Path(sys.argv[1])
    dry_run = '--dry-run' in sys.argv
    create_backup = '--no-backup' not in sys.argv
    
    if not directory.exists():
        print(f"Error: Directory {directory} does not exist")
        sys.exit(1)
    
    print("=" * 60)
    print("KB FILE ENCODING SANITIZATION")
    print("=" * 60)
    print(f"Directory: {directory}")
    print(f"Mode: {'DRY RUN (no changes)' if dry_run else 'LIVE (files will be modified)'}")
    print(f"Backup: {'Yes' if create_backup and not dry_run else 'No'}")
    print("=" * 60)
    print("")
    
    txt_files = list(directory.glob('**/*.txt'))
    
    if not txt_files:
        print("No .txt files found in directory")
        sys.exit(0)
    
    total_changes = 0
    files_with_issues = 0
    
    for filepath in sorted(txt_files):
        change_count, changes = process_file(filepath, dry_run, create_backup)
        
        if change_count > 0:
            files_with_issues += 1
            total_changes += change_count
            print(f"\n{filepath.name}: {change_count} changes")
            for change in changes:
                print(change)
        else:
            print(f"{filepath.name}: OK")
    
    print("")
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Files scanned: {len(txt_files)}")
    print(f"Files with issues: {files_with_issues}")
    print(f"Total changes: {total_changes}")
    
    if dry_run and total_changes > 0:
        print("")
        print("Run without --dry-run to apply fixes")

if __name__ == '__main__':
    main()
