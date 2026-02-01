#!/usr/bin/env python3
"""
KDAP v7.0 Comprehensive Validation Suite
Validates all components for Copilot Studio / Power Platform import readiness.
"""

import os
import sys
import json
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# Configuration
SOLUTION_DIR = "Consulting_and_Marketing_Agent_Platform_V7.0"
SOLUTION_ZIP = "Consulting_and_Marketing_Agent_Platform_V7.0.zip"
DATA_IMPORT_ZIP = "KDAP_V7.0_Data_Import.zip"

# Expected components
EXPECTED_AGENTS = ["orc", "anl", "aud", "cha", "cst", "chg", "doc", "gha", "mkt", "prf", "spo", "docs", "dvo"]
REQUIRED_ROOT_FILES = ["[Content_Types].xml", "Solution.xml", "customizations.xml"]
REQUIRED_FOLDERS = ["Entities", "Workflows"]
VALID_REQUIRED_LEVELS = ["none", "recommended", "systemrequired"]

class ValidationResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.errors = []
        self.warnings_list = []
        self.info = []

    def add_pass(self, msg):
        self.passed += 1
        self.info.append(f"✅ PASS: {msg}")

    def add_fail(self, msg):
        self.failed += 1
        self.errors.append(f"❌ FAIL: {msg}")

    def add_warning(self, msg):
        self.warnings += 1
        self.warnings_list.append(f"⚠️  WARN: {msg}")

    def add_info(self, msg):
        self.info.append(f"ℹ️  INFO: {msg}")

results = ValidationResult()

def print_header(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_section(title):
    print(f"\n--- {title} ---")

# =============================================================================
# 1. SOLUTION ZIP VALIDATION
# =============================================================================

def validate_solution_zip():
    print_header("1. SOLUTION ZIP VALIDATION")

    if not os.path.exists(SOLUTION_ZIP):
        results.add_fail(f"Solution ZIP not found: {SOLUTION_ZIP}")
        return False

    results.add_info(f"Solution ZIP size: {os.path.getsize(SOLUTION_ZIP):,} bytes")

    try:
        with zipfile.ZipFile(SOLUTION_ZIP, 'r') as zf:
            names = zf.namelist()

            # Check required root files
            print_section("Required Root Files")
            for req_file in REQUIRED_ROOT_FILES:
                if req_file in names:
                    results.add_pass(f"Root file present: {req_file}")
                else:
                    results.add_fail(f"Missing required root file: {req_file}")

            # Check required folders
            print_section("Required Folders")
            for folder in REQUIRED_FOLDERS:
                folder_exists = any(n.startswith(f"{folder}/") for n in names)
                if folder_exists:
                    results.add_pass(f"Folder present: {folder}/")
                else:
                    results.add_fail(f"Missing required folder: {folder}/")

            # Check for non-standard folders (should NOT be present)
            print_section("Non-Standard Content Check")
            non_standard = ["agents/", "contracts/", "platform/", "databricks/",
                          "docs/", "topics/", "data/"]
            for ns in non_standard:
                if any(n.startswith(ns) for n in names):
                    results.add_fail(f"Non-standard folder in ZIP (will cause import failure): {ns}")
                else:
                    results.add_pass(f"No non-standard folder: {ns}")

            # Check for non-standard root files
            root_files = [n for n in names if '/' not in n]
            allowed_root = REQUIRED_ROOT_FILES + ["Solution.xml"]
            for rf in root_files:
                if rf not in allowed_root:
                    results.add_warning(f"Extra root file (may cause issues): {rf}")

            return True

    except zipfile.BadZipFile:
        results.add_fail("Solution ZIP is corrupted")
        return False

# =============================================================================
# 2. CONTENT_TYPES.XML VALIDATION
# =============================================================================

def validate_content_types():
    print_header("2. [Content_Types].xml VALIDATION")

    ct_path = os.path.join(SOLUTION_DIR, "[Content_Types].xml")
    if not os.path.exists(ct_path):
        results.add_fail("[Content_Types].xml not found in extracted folder")
        return False

    try:
        tree = ET.parse(ct_path)
        root = tree.getroot()

        # Check namespace
        ns = "{http://schemas.openxmlformats.org/package/2006/content-types}"
        if root.tag != f"{ns}Types":
            results.add_warning(f"Unexpected root tag: {root.tag}")

        # Check required extensions
        required_extensions = ["xml", "json"]
        defaults = root.findall(f".//{ns}Default")
        extensions = [d.get("Extension", "").lower() for d in defaults]

        for ext in required_extensions:
            if ext in extensions:
                results.add_pass(f"Content type defined for .{ext}")
            else:
                results.add_fail(f"Missing content type for .{ext}")

        results.add_info(f"Total content types defined: {len(defaults)}")
        return True

    except ET.ParseError as e:
        results.add_fail(f"[Content_Types].xml parse error: {e}")
        return False

# =============================================================================
# 3. SOLUTION.XML VALIDATION
# =============================================================================

def validate_solution_xml():
    print_header("3. Solution.xml VALIDATION")

    sol_path = os.path.join(SOLUTION_DIR, "Solution.xml")
    if not os.path.exists(sol_path):
        results.add_fail("Solution.xml not found")
        return False

    try:
        tree = ET.parse(sol_path)
        root = tree.getroot()

        # Check solution unique name
        unique_name = root.find(".//UniqueName")
        if unique_name is not None and unique_name.text:
            results.add_pass(f"Solution UniqueName: {unique_name.text}")
        else:
            results.add_fail("Solution UniqueName missing")

        # Check version
        version = root.find(".//Version")
        if version is not None and version.text:
            results.add_pass(f"Solution Version: {version.text}")
            if not version.text.startswith("7."):
                results.add_warning(f"Version doesn't start with 7.x: {version.text}")
        else:
            results.add_fail("Solution Version missing")

        # Check publisher
        publisher = root.find(".//Publisher/UniqueName")
        if publisher is not None:
            results.add_pass(f"Publisher: {publisher.text}")
        else:
            results.add_warning("Publisher not defined")

        # Check for root components
        components = root.findall(".//RootComponents/RootComponent")
        results.add_info(f"Root components defined: {len(components)}")

        return True

    except ET.ParseError as e:
        results.add_fail(f"Solution.xml parse error: {e}")
        return False

# =============================================================================
# 4. ENTITIES VALIDATION
# =============================================================================

def validate_entities():
    print_header("4. ENTITIES VALIDATION")

    entities_dir = os.path.join(SOLUTION_DIR, "Entities")
    if not os.path.exists(entities_dir):
        results.add_fail("Entities folder not found")
        return False

    entities = [d for d in os.listdir(entities_dir) if os.path.isdir(os.path.join(entities_dir, d))]
    results.add_info(f"Total entities found: {len(entities)}")

    entity_issues = []

    for entity in entities:
        entity_path = os.path.join(entities_dir, entity, "Entity.xml")
        if not os.path.exists(entity_path):
            results.add_fail(f"Entity.xml missing for: {entity}")
            continue

        try:
            tree = ET.parse(entity_path)
            root = tree.getroot()

            # Check RequiredLevel values
            for attr in root.iter():
                req_level = attr.get("RequiredLevel")
                if req_level and req_level.lower() not in VALID_REQUIRED_LEVELS:
                    entity_issues.append(f"{entity}: Invalid RequiredLevel '{req_level}'")

            # Check for Name attribute
            name_elem = root.find(".//Name")
            if name_elem is None:
                results.add_warning(f"Entity {entity}: No Name element found")

        except ET.ParseError as e:
            results.add_fail(f"Entity {entity} XML parse error: {e}")

    if entity_issues:
        for issue in entity_issues:
            results.add_fail(issue)
    else:
        results.add_pass(f"All {len(entities)} entities have valid RequiredLevel values")

    # Check expected entity prefixes
    prefixes = defaultdict(int)
    for e in entities:
        prefix = e.split("_")[0] if "_" in e else e
        prefixes[prefix] += 1

    results.add_info(f"Entity prefixes: {dict(prefixes)}")

    return len(entity_issues) == 0

# =============================================================================
# 5. WORKFLOWS VALIDATION
# =============================================================================

def validate_workflows():
    print_header("5. WORKFLOWS/FLOWS VALIDATION")

    workflows_dir = os.path.join(SOLUTION_DIR, "Workflows")
    if not os.path.exists(workflows_dir):
        results.add_fail("Workflows folder not found")
        return False

    workflow_files = [f for f in os.listdir(workflows_dir) if f.endswith('.json')]
    data_files = [f for f in os.listdir(workflows_dir) if f.endswith('.json.data.xml')]

    results.add_info(f"Workflow JSON files: {len(workflow_files)}")
    results.add_info(f"Workflow data XML files: {len(data_files)}")

    issues = []

    for wf_file in workflow_files:
        if wf_file.endswith('.data.xml'):
            continue

        wf_path = os.path.join(workflows_dir, wf_file)
        try:
            with open(wf_path, 'r') as f:
                wf_data = json.load(f)

            # Check for required properties
            if 'properties' not in wf_data and 'definition' not in wf_data:
                issues.append(f"{wf_file}: Missing properties or definition")

        except json.JSONDecodeError as e:
            issues.append(f"{wf_file}: JSON parse error - {e}")
        except Exception as e:
            issues.append(f"{wf_file}: Error - {e}")

    if issues:
        for issue in issues:
            results.add_fail(issue)
    else:
        results.add_pass(f"All {len(workflow_files)} workflow files are valid JSON")

    return len(issues) == 0

# =============================================================================
# 6. DATA IMPORT PACKAGE VALIDATION
# =============================================================================

def validate_data_import():
    print_header("6. DATA IMPORT PACKAGE VALIDATION")

    if not os.path.exists(DATA_IMPORT_ZIP):
        results.add_fail(f"Data import package not found: {DATA_IMPORT_ZIP}")
        return False

    results.add_info(f"Data import ZIP size: {os.path.getsize(DATA_IMPORT_ZIP):,} bytes")

    try:
        with zipfile.ZipFile(DATA_IMPORT_ZIP, 'r') as zf:
            names = zf.namelist()

            # Check required files
            required = ["data_schema.xml", "data.xml", "[Content_Types].xml"]
            for req in required:
                if req in names:
                    results.add_pass(f"Data import file present: {req}")
                else:
                    results.add_fail(f"Missing data import file: {req}")

            # Validate data.xml content
            with zf.open("data.xml") as f:
                data_content = f.read().decode('utf-8')
                try:
                    root = ET.fromstring(data_content)
                    entities = root.findall(".//entity")
                    total_records = 0
                    for entity in entities:
                        entity_name = entity.get("name")
                        records = entity.findall(".//record")
                        total_records += len(records)
                        results.add_info(f"  {entity_name}: {len(records)} records")

                    results.add_pass(f"Data.xml valid with {total_records} total records")
                except ET.ParseError as e:
                    results.add_fail(f"Data.xml parse error: {e}")

            return True

    except zipfile.BadZipFile:
        results.add_fail("Data import ZIP is corrupted")
        return False

# =============================================================================
# 7. AI BUILDER PROMPTS VALIDATION
# =============================================================================

def validate_ai_builder_prompts():
    print_header("7. AI BUILDER PROMPTS VALIDATION")

    prompt_files = [
        "ai_builder_prompts_all_agents_v7.0.json",
        "gha_ai_builder_prompts.json"
    ]

    for pf in prompt_files:
        prompt_path = os.path.join(SOLUTION_DIR, pf)
        if not os.path.exists(prompt_path):
            results.add_warning(f"AI Builder prompt file not found: {pf}")
            continue

        try:
            with open(prompt_path, 'r') as f:
                prompts = json.load(f)

            if isinstance(prompts, list):
                results.add_pass(f"{pf}: {len(prompts)} prompts defined")

                # Validate each prompt structure
                for i, prompt in enumerate(prompts):
                    if 'name' not in prompt and 'displayName' not in prompt:
                        results.add_warning(f"{pf}[{i}]: Missing name/displayName")
                    if 'promptText' not in prompt and 'template' not in prompt:
                        results.add_warning(f"{pf}[{i}]: Missing promptText/template")

            elif isinstance(prompts, dict):
                results.add_pass(f"{pf}: Valid JSON object")
            else:
                results.add_fail(f"{pf}: Unexpected JSON structure")

        except json.JSONDecodeError as e:
            results.add_fail(f"{pf}: JSON parse error - {e}")

# =============================================================================
# 8. AGENTS VALIDATION
# =============================================================================

def validate_agents():
    print_header("8. AGENTS VALIDATION")

    agents_dir = os.path.join(SOLUTION_DIR, "agents")
    if not os.path.exists(agents_dir):
        results.add_warning("Agents folder not found in solution (may be deployed separately)")
        return True

    agents = [d for d in os.listdir(agents_dir) if os.path.isdir(os.path.join(agents_dir, d))]
    results.add_info(f"Agent folders found: {len(agents)}")

    missing_agents = set(EXPECTED_AGENTS) - set(agents)
    extra_agents = set(agents) - set(EXPECTED_AGENTS)

    if missing_agents:
        for ma in missing_agents:
            results.add_warning(f"Expected agent folder missing: {ma}")

    if extra_agents:
        for ea in extra_agents:
            results.add_info(f"Additional agent folder: {ea}")

    # Validate each agent structure
    for agent in agents:
        agent_path = os.path.join(agents_dir, agent)

        # Check for instructions
        instructions_dir = os.path.join(agent_path, "instructions")
        if os.path.exists(instructions_dir):
            instr_files = os.listdir(instructions_dir)
            if instr_files:
                results.add_pass(f"Agent {agent}: {len(instr_files)} instruction file(s)")
            else:
                results.add_warning(f"Agent {agent}: instructions folder empty")

        # Check for KB files
        kb_dir = os.path.join(agent_path, "kb")
        if os.path.exists(kb_dir):
            kb_files = os.listdir(kb_dir)
            if kb_files:
                results.add_pass(f"Agent {agent}: {len(kb_files)} KB file(s)")
            else:
                results.add_warning(f"Agent {agent}: kb folder empty")

    return True

# =============================================================================
# 9. KB DOCUMENTS VALIDATION
# =============================================================================

def validate_kb_documents():
    print_header("9. KNOWLEDGE BASE DOCUMENTS VALIDATION")

    agents_dir = os.path.join(SOLUTION_DIR, "agents")
    if not os.path.exists(agents_dir):
        results.add_info("Agents folder not in solution - KB docs validated separately")
        return True

    kb_issues = []
    total_kb_files = 0

    for agent in os.listdir(agents_dir):
        kb_dir = os.path.join(agents_dir, agent, "kb")
        if not os.path.exists(kb_dir):
            continue

        for kb_file in os.listdir(kb_dir):
            if not kb_file.endswith('.txt'):
                continue

            total_kb_files += 1
            kb_path = os.path.join(kb_dir, kb_file)

            try:
                with open(kb_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check minimum content
                if len(content) < 50:
                    kb_issues.append(f"{agent}/{kb_file}: Content too short ({len(content)} chars)")

                # Check for section headers (best practice)
                if not any(line.startswith('#') or line.isupper() for line in content.split('\n')[:20]):
                    kb_issues.append(f"{agent}/{kb_file}: No section headers found")

            except Exception as e:
                kb_issues.append(f"{agent}/{kb_file}: Read error - {e}")

    results.add_info(f"Total KB files checked: {total_kb_files}")

    if kb_issues:
        for issue in kb_issues[:10]:  # Limit output
            results.add_warning(issue)
        if len(kb_issues) > 10:
            results.add_warning(f"... and {len(kb_issues) - 10} more KB issues")
    else:
        results.add_pass("All KB documents validated")

    return len(kb_issues) == 0

# =============================================================================
# 10. TOPICS VALIDATION
# =============================================================================

def validate_topics():
    print_header("10. TOPICS VALIDATION")

    topics_dir = os.path.join(SOLUTION_DIR, "topics")
    if not os.path.exists(topics_dir):
        results.add_info("Topics folder not in solution - may be deployed separately")
        return True

    topics_file = os.path.join(topics_dir, "all_agent_topics_v7.0.json")
    if not os.path.exists(topics_file):
        results.add_warning("all_agent_topics_v7.0.json not found")
        return False

    try:
        with open(topics_file, 'r') as f:
            topics = json.load(f)

        if isinstance(topics, list):
            results.add_pass(f"Topics file contains {len(topics)} topics")

            # Validate topic structure
            issues = []
            for i, topic in enumerate(topics):
                if 'name' not in topic and 'displayName' not in topic:
                    issues.append(f"Topic[{i}]: Missing name")
                if 'triggerPhrases' in topic:
                    phrases = topic['triggerPhrases']
                    for phrase in phrases:
                        if len(phrase) < 3:
                            issues.append(f"Topic[{i}]: Trigger phrase too short: '{phrase}'")

            if issues:
                for issue in issues[:5]:
                    results.add_warning(issue)
            else:
                results.add_pass("All topics have valid structure")

        elif isinstance(topics, dict):
            results.add_pass("Topics file is valid JSON object")
        else:
            results.add_fail("Topics file has unexpected structure")

    except json.JSONDecodeError as e:
        results.add_fail(f"Topics JSON parse error: {e}")
        return False

    return True

# =============================================================================
# 11. SEED DATA VALIDATION
# =============================================================================

def validate_seed_data():
    print_header("11. SEED DATA VALIDATION")

    data_dir = os.path.join(SOLUTION_DIR, "data")
    if not os.path.exists(data_dir):
        results.add_info("Data folder not in solution - seed data in separate package")
        return True

    seed_files = [f for f in os.listdir(data_dir) if f.endswith('.xml')]
    results.add_info(f"Seed data files found: {len(seed_files)}")

    for sf in seed_files:
        sf_path = os.path.join(data_dir, sf)
        try:
            tree = ET.parse(sf_path)
            root = tree.getroot()

            entities = root.findall(".//entity")
            total_records = sum(len(e.findall(".//record")) for e in entities)
            results.add_pass(f"{sf}: {total_records} records")

        except ET.ParseError as e:
            results.add_fail(f"{sf}: XML parse error - {e}")

    return True

# =============================================================================
# 12. CROSS-REFERENCE VALIDATION
# =============================================================================

def validate_cross_references():
    print_header("12. CROSS-REFERENCE VALIDATION")

    # Get entities from solution
    entities_dir = os.path.join(SOLUTION_DIR, "Entities")
    solution_entities = set()
    if os.path.exists(entities_dir):
        solution_entities = set(os.listdir(entities_dir))

    # Get entities from data import
    data_entities = set()
    if os.path.exists(DATA_IMPORT_ZIP):
        try:
            with zipfile.ZipFile(DATA_IMPORT_ZIP, 'r') as zf:
                with zf.open("data.xml") as f:
                    root = ET.fromstring(f.read().decode('utf-8'))
                    for entity in root.findall(".//entity"):
                        data_entities.add(entity.get("name"))
        except:
            pass

    # Check data entities exist in solution
    print_section("Data Import Entity References")
    for de in data_entities:
        if de in solution_entities:
            results.add_pass(f"Data entity '{de}' exists in solution")
        else:
            results.add_fail(f"Data entity '{de}' NOT found in solution entities")

    # Check agent references in seed data
    print_section("Agent Registry Consistency")
    agent_registry = os.path.join(SOLUTION_DIR, "agent-registry.json")
    if os.path.exists(agent_registry):
        try:
            with open(agent_registry, 'r') as f:
                registry = json.load(f)

            if isinstance(registry, list):
                registry_agents = set(a.get('code', '').lower() for a in registry)
            elif isinstance(registry, dict) and 'agents' in registry:
                registry_agents = set(a.get('code', '').lower() for a in registry['agents'])
            else:
                registry_agents = set()

            agents_dir = os.path.join(SOLUTION_DIR, "agents")
            if os.path.exists(agents_dir):
                folder_agents = set(os.listdir(agents_dir))

                missing_folders = registry_agents - folder_agents
                missing_registry = folder_agents - registry_agents

                if missing_folders:
                    for mf in missing_folders:
                        results.add_warning(f"Agent in registry but no folder: {mf}")
                if missing_registry:
                    for mr in missing_registry:
                        results.add_warning(f"Agent folder exists but not in registry: {mr}")

                if not missing_folders and not missing_registry:
                    results.add_pass("Agent registry matches folder structure")

        except Exception as e:
            results.add_warning(f"Could not validate agent registry: {e}")

# =============================================================================
# 13. CUSTOMIZATIONS.XML VALIDATION
# =============================================================================

def validate_customizations():
    print_header("13. CUSTOMIZATIONS.XML VALIDATION")

    cust_path = os.path.join(SOLUTION_DIR, "customizations.xml")
    if not os.path.exists(cust_path):
        results.add_fail("customizations.xml not found")
        return False

    results.add_info(f"customizations.xml size: {os.path.getsize(cust_path):,} bytes")

    try:
        tree = ET.parse(cust_path)
        root = tree.getroot()

        # Count components
        entities = root.findall(".//Entity")
        workflows = root.findall(".//Workflow")
        option_sets = root.findall(".//optionset")

        results.add_pass(f"Entities defined: {len(entities)}")
        results.add_pass(f"Workflows defined: {len(workflows)}")
        results.add_info(f"Option sets defined: {len(option_sets)}")

        # Check for common issues
        for entity in entities:
            name = entity.get("Name", "Unknown")
            # Check for valid schema names
            if not name.islower() and '_' not in name:
                results.add_warning(f"Entity naming: {name} (should use lowercase with prefix)")

        return True

    except ET.ParseError as e:
        results.add_fail(f"customizations.xml parse error: {e}")
        return False

# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    print("\n" + "="*60)
    print("  KDAP v7.0 COMPREHENSIVE VALIDATION SUITE")
    print("  Target: Mastercard Copilot Studio Environment")
    print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    # Run all validations
    validate_solution_zip()
    validate_content_types()
    validate_solution_xml()
    validate_entities()
    validate_workflows()
    validate_data_import()
    validate_ai_builder_prompts()
    validate_agents()
    validate_kb_documents()
    validate_topics()
    validate_seed_data()
    validate_cross_references()
    validate_customizations()

    # Print summary
    print("\n" + "="*60)
    print("  VALIDATION SUMMARY")
    print("="*60)

    print(f"\n✅ Passed:   {results.passed}")
    print(f"❌ Failed:   {results.failed}")
    print(f"⚠️  Warnings: {results.warnings}")

    if results.errors:
        print("\n--- FAILURES (Must Fix) ---")
        for err in results.errors:
            print(err)

    if results.warnings_list:
        print("\n--- WARNINGS (Should Review) ---")
        for warn in results.warnings_list[:20]:
            print(warn)
        if len(results.warnings_list) > 20:
            print(f"... and {len(results.warnings_list) - 20} more warnings")

    # Final verdict
    print("\n" + "="*60)
    if results.failed == 0:
        print("  ✅ VALIDATION PASSED - Ready for import")
        print("="*60)
        return 0
    else:
        print("  ❌ VALIDATION FAILED - Fix errors before import")
        print("="*60)
        return 1

if __name__ == '__main__':
    sys.exit(main())
