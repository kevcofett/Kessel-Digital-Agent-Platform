#!/usr/bin/env python3
"""
MPA v7.0 Patch Application Script
Applies patches to fix test failures from MPA v7.0 test suite.

Usage:
    python3 apply-patches.py --all                    # Apply all patches
    python3 apply-patches.py --patch PATCH-001        # Apply specific patch
    python3 apply-patches.py --dry-run                # Preview changes only
    python3 apply-patches.py --validate               # Validate patches only
"""

import json
import os
import sys
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

PATCHES_DIR = Path(__file__).parent
RELEASE_DIR = PATCHES_DIR.parent


def load_manifest() -> Dict[str, Any]:
    """Load the patch manifest."""
    manifest_path = PATCHES_DIR / 'PATCH-MANIFEST.json'
    with open(manifest_path, 'r') as f:
        return json.load(f)


def load_patch(patch_file: str) -> Dict[str, Any]:
    """Load a specific patch file."""
    patch_path = PATCHES_DIR / patch_file
    with open(patch_path, 'r') as f:
        return json.load(f)


def validate_patch(patch: Dict[str, Any]) -> List[str]:
    """Validate patch structure and requirements."""
    errors = []

    required_fields = ['patch_id', 'version', 'description', 'affected_tests', 'changes']
    for field in required_fields:
        if field not in patch:
            errors.append(f"Missing required field: {field}")

    if 'changes' in patch:
        for i, change in enumerate(patch['changes']):
            if 'file' not in change:
                errors.append(f"Change {i} missing 'file' field")
            if 'change_type' not in change:
                errors.append(f"Change {i} missing 'change_type' field")

    return errors


def apply_agent_registry_patch(patch: Dict[str, Any], dry_run: bool = False) -> bool:
    """Apply patches to agent-registry.json."""
    registry_path = RELEASE_DIR / 'platform' / 'agent-registry.json'

    if not registry_path.exists():
        print(f"{RED}ERROR: agent-registry.json not found{RESET}")
        return False

    with open(registry_path, 'r') as f:
        registry = json.load(f)

    modified = False

    for change in patch.get('changes', []):
        if 'agent-registry.json' not in change.get('file', ''):
            continue

        section = change.get('section', '')
        change_type = change.get('change_type', '')

        if section == 'routingKeywords' and change_type == 'add':
            # Add routing keywords
            before = change.get('before', {})
            after = change.get('after', {})

            for agent, keywords in after.items():
                if agent in registry.get('routingKeywords', {}):
                    existing = set(registry['routingKeywords'][agent])
                    new_keywords = set(keywords) - existing
                    if new_keywords:
                        print(f"  {BLUE}Adding keywords to {agent}:{RESET} {', '.join(new_keywords)}")
                        registry['routingKeywords'][agent] = keywords
                        modified = True

        elif section.startswith('routingKeywords.'):
            # Update specific agent keywords
            agent = section.split('.')[1]
            after = change.get('after', [])

            if agent in registry.get('routingKeywords', {}):
                existing = set(registry['routingKeywords'][agent])
                new_keywords = set(after) - existing
                if new_keywords:
                    print(f"  {BLUE}Adding keywords to {agent}:{RESET} {', '.join(new_keywords)}")
                    registry['routingKeywords'][agent] = after
                    modified = True

        elif section == 'edgeCaseHandling' and change_type == 'add_new_section':
            # Add new section
            content = change.get('content', {})
            if 'edgeCaseHandling' not in registry:
                print(f"  {BLUE}Adding edgeCaseHandling section{RESET}")
                registry['edgeCaseHandling'] = content.get('edgeCaseHandling', {})
                modified = True

    if modified and not dry_run:
        # Update version
        registry['version'] = '6.0.2'
        registry['updated'] = datetime.now().strftime('%Y-%m-%d')

        with open(registry_path, 'w') as f:
            json.dump(registry, f, indent=2)
        print(f"  {GREEN}Updated agent-registry.json{RESET}")

    return modified


def apply_contract_patch(patch: Dict[str, Any], dry_run: bool = False) -> bool:
    """Apply patches to inter-agent contracts."""
    # Create a separate handoff contracts file (the main file is a JSON schema)
    handoff_path = RELEASE_DIR / 'contracts' / 'handoff-contracts.json'

    modified = False

    for change in patch.get('changes', []):
        if 'INTER_AGENT_CONTRACT' not in change.get('file', ''):
            continue

        section = change.get('section', '')
        content = change.get('content', {})

        if section == 'handoff_contracts':
            contract_name = list(content.keys())[0] if content else 'unknown'
            print(f"  {BLUE}Adding handoff contract: {contract_name}{RESET}")

            if not dry_run:
                handoff_path.parent.mkdir(parents=True, exist_ok=True)

                # Load existing or create new handoff contracts file
                if handoff_path.exists():
                    with open(handoff_path, 'r') as f:
                        handoff_contracts = json.load(f)
                else:
                    handoff_contracts = {
                        'version': '1.0.0',
                        'description': 'Handoff contracts for inter-agent communication',
                        'handoff_contracts': {}
                    }

                handoff_contracts['handoff_contracts'].update(content)

                with open(handoff_path, 'w') as f:
                    json.dump(handoff_contracts, f, indent=2)

                print(f"  {GREEN}Updated handoff-contracts.json{RESET}")

            modified = True

    return modified


def apply_flow_patch(patch: Dict[str, Any], dry_run: bool = False) -> bool:
    """Apply patches to flow YAML files (stored as documentation)."""
    modified = False

    for change in patch.get('changes', []):
        file_path = change.get('file', '')
        if not file_path.endswith('.yaml'):
            continue

        section = change.get('section', '')
        content = change.get('content', {})
        description = change.get('description', '')

        # For YAML flow patches, we create a documentation file
        # Actual flow updates would be done in Power Automate
        doc_filename = file_path.replace('/', '_').replace('.yaml', '_PATCH.json')
        doc_path = PATCHES_DIR / 'flow-updates' / doc_filename

        print(f"  {BLUE}Flow update documented: {file_path}{RESET}")
        print(f"    Section: {section}")
        print(f"    Description: {description}")

        if not dry_run:
            doc_path.parent.mkdir(parents=True, exist_ok=True)
            with open(doc_path, 'w') as f:
                json.dump({
                    'target_file': file_path,
                    'section': section,
                    'content': content,
                    'description': description,
                    'patch_source': patch.get('patch_id')
                }, f, indent=2)

        modified = True

    return modified


def apply_template_patch(patch: Dict[str, Any], dry_run: bool = False) -> bool:
    """Apply patches to create new templates."""
    modified = False

    for change in patch.get('changes', []):
        file_path = change.get('file', '')
        if 'template' not in file_path.lower():
            continue

        if change.get('change_type') == 'create':
            content = change.get('content', {})

            # Create template file
            template_path = RELEASE_DIR / file_path

            print(f"  {BLUE}Creating template: {file_path}{RESET}")

            if not dry_run:
                template_path.parent.mkdir(parents=True, exist_ok=True)
                with open(template_path, 'w') as f:
                    json.dump(content, f, indent=2)

            modified = True

    return modified


def apply_kb_patch(patch: Dict[str, Any], dry_run: bool = False) -> bool:
    """Apply patches to KB documentation files."""
    modified = False

    for change in patch.get('changes', []):
        file_path = change.get('file', '')
        if '/kb/' not in file_path:
            continue

        section = change.get('section', '')
        content = change.get('content', '')
        change_type = change.get('change_type', '')

        # For KB updates, we create a documentation file
        # Actual KB updates would be done in Power Platform
        doc_filename = file_path.replace('/', '_').replace('.txt', '_PATCH.txt')
        doc_path = PATCHES_DIR / 'kb-updates' / doc_filename

        print(f"  {BLUE}KB update documented: {file_path}{RESET}")
        print(f"    Section: {section}")

        if not dry_run:
            doc_path.parent.mkdir(parents=True, exist_ok=True)
            with open(doc_path, 'w') as f:
                f.write(f"# KB PATCH\n")
                f.write(f"# Target: {file_path}\n")
                f.write(f"# Section: {section}\n")
                f.write(f"# Change Type: {change_type}\n")
                f.write(f"# Patch Source: {patch.get('patch_id')}\n")
                f.write(f"\n{'='*60}\n\n")
                f.write(content)

        modified = True

    return modified


def apply_patch(patch_id: str, dry_run: bool = False) -> bool:
    """Apply a specific patch."""
    manifest = load_manifest()

    # Find patch in manifest
    patch_info = None
    for p in manifest['patches']:
        if p['patch_id'] == patch_id:
            patch_info = p
            break

    if not patch_info:
        print(f"{RED}ERROR: Patch {patch_id} not found in manifest{RESET}")
        return False

    print(f"\n{BOLD}Applying {patch_id}: {patch_info['description']}{RESET}")
    print(f"  Tests addressed: {', '.join(patch_info['tests_addressed'])}")
    print(f"  Priority: {patch_info['priority']}")

    if dry_run:
        print(f"  {YELLOW}[DRY RUN - No changes will be made]{RESET}")

    # Load and validate patch
    patch = load_patch(patch_info['file'])
    errors = validate_patch(patch)

    if errors:
        print(f"{RED}Validation errors:{RESET}")
        for error in errors:
            print(f"  - {error}")
        return False

    # Apply different types of patches
    results = []
    results.append(apply_agent_registry_patch(patch, dry_run))
    results.append(apply_contract_patch(patch, dry_run))
    results.append(apply_flow_patch(patch, dry_run))
    results.append(apply_template_patch(patch, dry_run))
    results.append(apply_kb_patch(patch, dry_run))

    if any(results):
        print(f"  {GREEN}Patch {patch_id} applied successfully{RESET}")
        return True
    else:
        print(f"  {YELLOW}No changes needed for {patch_id}{RESET}")
        return True


def apply_all_patches(dry_run: bool = False) -> bool:
    """Apply all patches in order."""
    manifest = load_manifest()

    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}MPA v7.0 Patch Application{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")
    print(f"\nTotal patches: {len(manifest['patches'])}")
    print(f"Tests to fix: {manifest['summary']['total_failures_addressed']}")

    if dry_run:
        print(f"\n{YELLOW}DRY RUN MODE - No changes will be made{RESET}")

    success_count = 0
    failure_count = 0

    for patch_id in manifest['application_order']:
        if apply_patch(patch_id, dry_run):
            success_count += 1
        else:
            failure_count += 1

    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}Summary:{RESET}")
    print(f"  {GREEN}Successful: {success_count}{RESET}")
    print(f"  {RED}Failed: {failure_count}{RESET}")

    if not dry_run:
        print(f"\n{BOLD}Next Steps:{RESET}")
        print("  1. Review flow-updates/ for Power Automate changes")
        print("  2. Review kb-updates/ for KB documentation changes")
        print("  3. Deploy updated agent-registry.json")
        print("  4. Re-run test suite to validate fixes")

    return failure_count == 0


def main():
    parser = argparse.ArgumentParser(description='Apply MPA v7.0 patches')
    parser.add_argument('--all', action='store_true', help='Apply all patches')
    parser.add_argument('--patch', type=str, help='Apply specific patch (e.g., PATCH-001)')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without applying')
    parser.add_argument('--validate', action='store_true', help='Validate patches only')
    parser.add_argument('--list', action='store_true', help='List available patches')

    args = parser.parse_args()

    if args.list:
        manifest = load_manifest()
        print(f"\n{BOLD}Available Patches:{RESET}")
        for p in manifest['patches']:
            print(f"  {p['patch_id']}: {p['description']}")
            print(f"    Tests: {', '.join(p['tests_addressed'])}")
            print(f"    Priority: {p['priority']}")
        return 0

    if args.validate:
        manifest = load_manifest()
        print(f"\n{BOLD}Validating Patches:{RESET}")
        all_valid = True
        for p in manifest['patches']:
            patch = load_patch(p['file'])
            errors = validate_patch(patch)
            if errors:
                print(f"  {RED}{p['patch_id']}: INVALID{RESET}")
                for error in errors:
                    print(f"    - {error}")
                all_valid = False
            else:
                print(f"  {GREEN}{p['patch_id']}: VALID{RESET}")
        return 0 if all_valid else 1

    if args.patch:
        success = apply_patch(args.patch, args.dry_run)
        return 0 if success else 1

    if args.all:
        success = apply_all_patches(args.dry_run)
        return 0 if success else 1

    parser.print_help()
    return 1


if __name__ == '__main__':
    sys.exit(main())
