#!/usr/bin/env python3
"""
KDAP v7.0 Compliance Issue Remediation Script
Fixes all identified warnings to ensure 100% Power Platform import compatibility.
"""

import os
import re
import json
import zipfile
import shutil
from pathlib import Path
from datetime import datetime

# Configuration
SOLUTION_DIR = "solutions/Consulting_and_Marketing_Agent_Platform_V7.0"
SOLUTION_ZIP = "solutions/Consulting_and_Marketing_Agent_Platform_V7.0.zip"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def fix_required_level_issues():
    """Fix RequiredLevel='applicationrequired' to 'recommended'"""
    log("Fixing RequiredLevel issues in Entity XML files...")

    entities_dir = Path(SOLUTION_DIR) / "Entities"
    if not entities_dir.exists():
        log(f"  WARNING: Entities directory not found at {entities_dir}")
        return 0

    fixed_count = 0

    for entity_dir in entities_dir.iterdir():
        if entity_dir.is_dir():
            entity_xml = entity_dir / "Entity.xml"
            if entity_xml.exists():
                content = entity_xml.read_text(encoding='utf-8')
                original = content

                content = content.replace(
                    '<RequiredLevel>applicationrequired</RequiredLevel>',
                    '<RequiredLevel>recommended</RequiredLevel>'
                )

                if content != original:
                    entity_xml.write_text(content, encoding='utf-8')
                    fixed_count += 1
                    log(f"  Fixed: {entity_xml}")

    log(f"  Fixed RequiredLevel in {fixed_count} entity files")
    return fixed_count

def fix_content_types():
    """Add missing file extensions to [Content_Types].xml"""
    log("Fixing [Content_Types].xml...")

    content_types_path = Path(SOLUTION_DIR) / "[Content_Types].xml"
    if not content_types_path.exists():
        log(f"  WARNING: [Content_Types].xml not found")
        return False

    new_types = {
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'md': 'text/plain',
        'ts': 'text/plain',
        'sql': 'text/plain',
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'gif': 'image/gif',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }

    content = content_types_path.read_text(encoding='utf-8')

    new_entries = []
    for ext, mime in new_types.items():
        if f'Extension="{ext}"' not in content:
            new_entries.append(f'<Default Extension="{ext}" ContentType="{mime}" />')

    if new_entries:
        insert_point = content.rfind('</Types>')
        if insert_point > 0:
            content = content[:insert_point] + ''.join(new_entries) + content[insert_point:]
            content_types_path.write_text(content, encoding='utf-8')
            log(f"  Added {len(new_entries)} new content type entries")
            return True

    log("  [Content_Types].xml already complete")
    return False

def fix_topic_phrases():
    """Fix topic phrases that are too short (minimum 3 characters)"""
    log("Fixing topic phrase lengths...")

    fixed_count = 0

    for topics_file in Path(".").rglob("*topics*.json"):
        try:
            content = topics_file.read_text(encoding='utf-8')
            original = content

            # Fix "hi..." or similar short phrases
            content = re.sub(r'"hi\.\.\."', '"hello"', content)
            content = re.sub(r'"hi"', '"hello"', content)

            if content != original:
                topics_file.write_text(content, encoding='utf-8')
                fixed_count += 1
                log(f"  Fixed: {topics_file}")

        except (json.JSONDecodeError, UnicodeDecodeError):
            continue

    log(f"  Fixed phrases in {fixed_count} topic files")
    return fixed_count

def fix_kb_headers():
    """Add ALL-CAPS headers to KB files that are missing them"""
    log("Fixing KB file headers...")

    fixed_count = 0
    gha_kb_dir = Path("agents/gha/kb")

    if not gha_kb_dir.exists():
        log(f"  WARNING: GHA KB directory not found")
        return 0

    for kb_file in gha_kb_dir.glob("GHA_KB_*.txt"):
        content = kb_file.read_text(encoding='utf-8')

        # Check if file has ALL-CAPS headers (at least one line of 10+ uppercase chars)
        has_caps_header = bool(re.search(r'^[A-Z][A-Z\s_]{9,}$', content, re.MULTILINE))

        if not has_caps_header:
            # Extract title from filename
            name = kb_file.stem.replace('GHA_KB_', '').replace('_v7.0', '').replace('_', ' ')
            header = name.upper()

            new_content = f"{header}\n{'=' * len(header)}\n\n{content}"
            kb_file.write_text(new_content, encoding='utf-8')
            fixed_count += 1
            log(f"  Added header to: {kb_file}")

    log(f"  Added headers to {fixed_count} KB files")
    return fixed_count

def rebuild_solution_zip():
    """Rebuild solution ZIP with all fixes applied"""
    log("Rebuilding solution ZIP...")

    if not os.path.exists(SOLUTION_DIR):
        log(f"  WARNING: Solution directory not found at {SOLUTION_DIR}")
        return False

    # Backup old ZIP
    if os.path.exists(SOLUTION_ZIP):
        backup_path = SOLUTION_ZIP + f".backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copy(SOLUTION_ZIP, backup_path)
        log(f"  Backed up to: {backup_path}")
        os.remove(SOLUTION_ZIP)

    # Create new ZIP
    with zipfile.ZipFile(SOLUTION_ZIP, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(SOLUTION_DIR):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]

            for file in files:
                # Skip hidden files
                if file.startswith('.') or file in ['.DS_Store', '.gitkeep']:
                    continue

                file_path = os.path.join(root, file)
                arc_name = os.path.relpath(file_path, SOLUTION_DIR)
                zf.write(file_path, arc_name)

    size_mb = os.path.getsize(SOLUTION_ZIP) / (1024 * 1024)
    log(f"  Rebuilt ZIP: {SOLUTION_ZIP} ({size_mb:.2f} MB)")
    return True

def main():
    print("=" * 60)
    print("KDAP v7.0 COMPLIANCE REMEDIATION SCRIPT")
    print("=" * 60)
    print()

    print("--- PHASE 1: Fix Entity XML Issues ---")
    fix_required_level_issues()

    print("\n--- PHASE 2: Fix Content Types ---")
    fix_content_types()

    print("\n--- PHASE 3: Fix Topic Phrases ---")
    fix_topic_phrases()

    print("\n--- PHASE 4: Fix KB Headers ---")
    fix_kb_headers()

    print("\n--- PHASE 5: Rebuild Solution ZIP ---")
    rebuild_solution_zip()

    print("\n" + "=" * 60)
    print("REMEDIATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
