#!/usr/bin/env python3
"""
KDAP v7.0 Solution Comprehensive Validation Suite
=================================================
Validates all solution components for Copilot Studio and Power Platform deployment.

Tests cover:
- Entity.xml schema compliance
- Customizations.xml consistency
- Workflow JSON Power Automate schema
- KB document 6-rule compliance
- Instruction file character limits
- Seed data schema alignment
- YAML flow definitions
- Solution.xml component references
"""

import os
import sys
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Set
from datetime import datetime
import yaml

# Test result tracking
@dataclass
class TestResult:
    test_name: str
    category: str
    status: str  # PASS, FAIL, WARN
    message: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    details: Optional[Dict] = None

@dataclass
class TestSuite:
    name: str
    results: List[TestResult] = field(default_factory=list)

    @property
    def passed(self) -> int:
        return sum(1 for r in self.results if r.status == "PASS")

    @property
    def failed(self) -> int:
        return sum(1 for r in self.results if r.status == "FAIL")

    @property
    def warnings(self) -> int:
        return sum(1 for r in self.results if r.status == "WARN")

# Base paths
V7_ROOT = Path(__file__).parent.parent
SOLUTIONS_ROOT = V7_ROOT / "solutions"
AGENTS_ROOT = V7_ROOT / "agents"

# ============================================================================
# TEST CATEGORY 1: Entity.xml Validation
# ============================================================================

def validate_entity_xml_files(suite: TestSuite) -> None:
    """Validate all Entity.xml files have required elements."""
    entity_dirs = list((SOLUTIONS_ROOT / "Consulting_and_Marketing_Agent_Platform_V7.0" / "Entities").glob("*/"))

    for entity_dir in entity_dirs:
        entity_file = entity_dir / "Entity.xml"
        if not entity_file.exists():
            suite.results.append(TestResult(
                test_name="Entity.xml exists",
                category="Entity Schema",
                status="FAIL",
                message=f"Missing Entity.xml",
                file_path=str(entity_dir)
            ))
            continue

        try:
            tree = ET.parse(entity_file)
            root = tree.getroot()

            # Check for PrimaryNameAttribute
            primary_name = root.find(".//PrimaryNameAttribute")
            if primary_name is None or not primary_name.text:
                suite.results.append(TestResult(
                    test_name="PrimaryNameAttribute exists",
                    category="Entity Schema",
                    status="FAIL",
                    message=f"Missing or empty PrimaryNameAttribute",
                    file_path=str(entity_file)
                ))
            else:
                suite.results.append(TestResult(
                    test_name="PrimaryNameAttribute exists",
                    category="Entity Schema",
                    status="PASS",
                    message=f"PrimaryNameAttribute: {primary_name.text}",
                    file_path=str(entity_file)
                ))

            # Check for EntityInfo/entity Name attribute (Power Platform uses Name as attribute)
            entity_elem = root.find(".//EntityInfo/entity")
            entity_name = None
            if entity_elem is not None:
                entity_name = entity_elem.get("Name")

            # Also check for Name as child element (alternative format)
            if entity_name is None:
                entity_name_elem = root.find(".//EntityInfo/entity/Name")
                if entity_name_elem is not None:
                    entity_name = entity_name_elem.text

            # Also check root-level Name element
            if entity_name is None:
                root_name = root.find("Name")
                if root_name is not None:
                    entity_name = root_name.text

            if entity_name is None:
                suite.results.append(TestResult(
                    test_name="Entity Name defined",
                    category="Entity Schema",
                    status="FAIL",
                    message=f"Missing entity Name element or attribute",
                    file_path=str(entity_file)
                ))
            else:
                suite.results.append(TestResult(
                    test_name="Entity Name defined",
                    category="Entity Schema",
                    status="PASS",
                    message=f"Entity: {entity_name}",
                    file_path=str(entity_file)
                ))

            # Check attributes have required elements
            attributes = root.findall(".//attribute")
            for attr in attributes:
                attr_name = attr.find("Name")
                if attr_name is not None:
                    # Check for DisplayMask with PrimaryName
                    display_mask = attr.find("DisplayMask")
                    if display_mask is not None and "PrimaryName" in (display_mask.text or ""):
                        # This attribute should have IsPrimaryName
                        is_primary = attr.find("IsPrimaryName")
                        if is_primary is None or is_primary.text != "1":
                            suite.results.append(TestResult(
                                test_name="IsPrimaryName flag",
                                category="Entity Schema",
                                status="WARN",
                                message=f"Attribute {attr_name.text} has PrimaryName in DisplayMask but missing IsPrimaryName=1",
                                file_path=str(entity_file)
                            ))

        except ET.ParseError as e:
            suite.results.append(TestResult(
                test_name="Entity.xml parse",
                category="Entity Schema",
                status="FAIL",
                message=f"XML parse error: {e}",
                file_path=str(entity_file)
            ))

# ============================================================================
# TEST CATEGORY 2: Customizations.xml Validation
# ============================================================================

def validate_customizations_xml(suite: TestSuite) -> None:
    """Validate customizations.xml files for consistency."""
    customization_files = [
        SOLUTIONS_ROOT / "Consulting_and_Marketing_Agent_Platform_V7.0" / "customizations.xml",
        SOLUTIONS_ROOT / "platform" / "customizations.xml"
    ]

    for cust_file in customization_files:
        if not cust_file.exists():
            suite.results.append(TestResult(
                test_name="customizations.xml exists",
                category="Customizations",
                status="WARN",
                message=f"File not found",
                file_path=str(cust_file)
            ))
            continue

        try:
            tree = ET.parse(cust_file)
            root = tree.getroot()

            # Check for placeholder GUIDs (excluding valid uses like LookupType)
            content = cust_file.read_text()
            placeholder_guid = "00000000-0000-0000-0000-000000000000"
            problematic_guid_found = False
            if placeholder_guid in content:
                lines = content.split('\n')
                for i, line in enumerate(lines, 1):
                    if placeholder_guid in line:
                        # Skip valid uses: LookupType elements use zero GUID for type codes
                        if "<LookupType" in line:
                            continue
                        problematic_guid_found = True
                        suite.results.append(TestResult(
                            test_name="No placeholder GUIDs",
                            category="Customizations",
                            status="FAIL",
                            message=f"Placeholder GUID found (excluding valid LookupType uses)",
                            file_path=str(cust_file),
                            line_number=i
                        ))
                        break

            if not problematic_guid_found:
                suite.results.append(TestResult(
                    test_name="No placeholder GUIDs",
                    category="Customizations",
                    status="PASS",
                    message=f"No problematic placeholder GUIDs found",
                    file_path=str(cust_file)
                ))

            # Check entities have PrimaryNameAttribute
            entities = root.findall(".//Entity")
            for entity in entities:
                entity_name_elem = entity.find("Name")
                entity_name = entity_name_elem.text if entity_name_elem is not None else "Unknown"

                # Check for PrimaryNameAttribute at entity level or in EntityInfo/entity
                primary_name = entity.find("PrimaryNameAttribute")
                if primary_name is None:
                    primary_name = entity.find(".//EntityInfo/entity/PrimaryNameAttribute")

                if primary_name is None or not primary_name.text:
                    suite.results.append(TestResult(
                        test_name="Entity PrimaryNameAttribute",
                        category="Customizations",
                        status="WARN",
                        message=f"Entity {entity_name} missing PrimaryNameAttribute",
                        file_path=str(cust_file)
                    ))

        except ET.ParseError as e:
            suite.results.append(TestResult(
                test_name="customizations.xml parse",
                category="Customizations",
                status="FAIL",
                message=f"XML parse error: {e}",
                file_path=str(cust_file)
            ))

# ============================================================================
# TEST CATEGORY 3: Workflow JSON Validation (Power Automate Schema)
# ============================================================================

def validate_workflow_json_files(suite: TestSuite) -> None:
    """Validate all workflow JSON files against Power Automate schema."""
    workflow_dirs = [
        SOLUTIONS_ROOT / "platform" / "Workflows",
        SOLUTIONS_ROOT / "agents"
    ]

    required_schema = "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#"

    for workflow_dir in workflow_dirs:
        if not workflow_dir.exists():
            continue

        for json_file in workflow_dir.rglob("*.json"):
            # Skip components.json files - these are agent metadata, not workflows
            if json_file.name == "components.json":
                continue
            try:
                with open(json_file) as f:
                    data = json.load(f)

                # Check schemaVersion
                if "schemaVersion" not in data:
                    suite.results.append(TestResult(
                        test_name="schemaVersion present",
                        category="Workflow JSON",
                        status="FAIL",
                        message="Missing schemaVersion field",
                        file_path=str(json_file)
                    ))
                else:
                    suite.results.append(TestResult(
                        test_name="schemaVersion present",
                        category="Workflow JSON",
                        status="PASS",
                        message=f"schemaVersion: {data['schemaVersion']}",
                        file_path=str(json_file)
                    ))

                # Check properties structure
                if "properties" not in data:
                    suite.results.append(TestResult(
                        test_name="properties structure",
                        category="Workflow JSON",
                        status="FAIL",
                        message="Missing properties object",
                        file_path=str(json_file)
                    ))
                    continue

                props = data["properties"]

                # Check connectionReferences
                if "connectionReferences" not in props:
                    suite.results.append(TestResult(
                        test_name="connectionReferences",
                        category="Workflow JSON",
                        status="WARN",
                        message="Missing connectionReferences (may be intentional)",
                        file_path=str(json_file)
                    ))
                else:
                    suite.results.append(TestResult(
                        test_name="connectionReferences",
                        category="Workflow JSON",
                        status="PASS",
                        message="connectionReferences defined",
                        file_path=str(json_file)
                    ))

                # Check definition
                if "definition" not in props:
                    suite.results.append(TestResult(
                        test_name="definition structure",
                        category="Workflow JSON",
                        status="FAIL",
                        message="Missing definition object",
                        file_path=str(json_file)
                    ))
                    continue

                definition = props["definition"]

                # Check $schema
                if "$schema" not in definition:
                    suite.results.append(TestResult(
                        test_name="$schema in definition",
                        category="Workflow JSON",
                        status="FAIL",
                        message="Missing $schema in definition",
                        file_path=str(json_file)
                    ))
                elif definition["$schema"] != required_schema:
                    suite.results.append(TestResult(
                        test_name="$schema correct",
                        category="Workflow JSON",
                        status="WARN",
                        message=f"Schema mismatch: {definition['$schema']}",
                        file_path=str(json_file)
                    ))
                else:
                    suite.results.append(TestResult(
                        test_name="$schema correct",
                        category="Workflow JSON",
                        status="PASS",
                        message="Correct Logic Apps schema",
                        file_path=str(json_file)
                    ))

                # Check triggers
                if "triggers" not in definition:
                    suite.results.append(TestResult(
                        test_name="triggers defined",
                        category="Workflow JSON",
                        status="FAIL",
                        message="Missing triggers in definition",
                        file_path=str(json_file)
                    ))
                else:
                    triggers = definition["triggers"]
                    if not triggers:
                        suite.results.append(TestResult(
                            test_name="triggers not empty",
                            category="Workflow JSON",
                            status="FAIL",
                            message="Triggers object is empty",
                            file_path=str(json_file)
                        ))
                    else:
                        suite.results.append(TestResult(
                            test_name="triggers defined",
                            category="Workflow JSON",
                            status="PASS",
                            message=f"Triggers: {list(triggers.keys())}",
                            file_path=str(json_file)
                        ))

                # Check actions
                if "actions" not in definition:
                    suite.results.append(TestResult(
                        test_name="actions defined",
                        category="Workflow JSON",
                        status="FAIL",
                        message="Missing actions in definition",
                        file_path=str(json_file)
                    ))
                else:
                    actions = definition["actions"]
                    if not actions:
                        suite.results.append(TestResult(
                            test_name="actions not empty",
                            category="Workflow JSON",
                            status="FAIL",
                            message="Actions object is empty",
                            file_path=str(json_file)
                        ))
                    else:
                        suite.results.append(TestResult(
                            test_name="actions defined",
                            category="Workflow JSON",
                            status="PASS",
                            message=f"Actions count: {len(actions)}",
                            file_path=str(json_file)
                        ))

                        # Check each action has required fields
                        for action_name, action in actions.items():
                            if "type" not in action:
                                suite.results.append(TestResult(
                                    test_name="action type defined",
                                    category="Workflow JSON",
                                    status="FAIL",
                                    message=f"Action '{action_name}' missing type",
                                    file_path=str(json_file)
                                ))

                            # Check for Response action at end
                            if action.get("type") == "Response":
                                if "inputs" not in action:
                                    suite.results.append(TestResult(
                                        test_name="Response action inputs",
                                        category="Workflow JSON",
                                        status="FAIL",
                                        message=f"Response action missing inputs",
                                        file_path=str(json_file)
                                    ))
                                elif "statusCode" not in action["inputs"]:
                                    suite.results.append(TestResult(
                                        test_name="Response statusCode",
                                        category="Workflow JSON",
                                        status="FAIL",
                                        message=f"Response action missing statusCode",
                                        file_path=str(json_file)
                                    ))

            except json.JSONDecodeError as e:
                suite.results.append(TestResult(
                    test_name="JSON parse",
                    category="Workflow JSON",
                    status="FAIL",
                    message=f"JSON parse error: {e}",
                    file_path=str(json_file)
                ))
            except Exception as e:
                suite.results.append(TestResult(
                    test_name="Workflow validation",
                    category="Workflow JSON",
                    status="FAIL",
                    message=f"Validation error: {e}",
                    file_path=str(json_file)
                ))

# ============================================================================
# TEST CATEGORY 4: KB Document Compliance (6-Rule)
# ============================================================================

def validate_kb_documents(suite: TestSuite) -> None:
    """Validate KB documents against Copilot Studio 6-rule compliance."""
    kb_patterns = [
        AGENTS_ROOT / "*" / "kb" / "*_v7.0.txt",
        AGENTS_ROOT / "*" / "kb" / "*_v7.0.txt"
    ]

    # Collect all KB files
    kb_files = []
    for agent_dir in AGENTS_ROOT.iterdir():
        if agent_dir.is_dir():
            kb_dir = agent_dir / "kb"
            if kb_dir.exists():
                kb_files.extend(kb_dir.glob("*_v7.0.txt"))

    for kb_file in kb_files:
        content = kb_file.read_text(encoding='utf-8', errors='replace')
        lines = content.split('\n')

        # Rule 1: No emoji
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"
            "\U0001F300-\U0001F5FF"
            "\U0001F680-\U0001F6FF"
            "\U0001F700-\U0001F77F"
            "\U0001F780-\U0001F7FF"
            "\U0001F800-\U0001F8FF"
            "\U0001F900-\U0001F9FF"
            "\U0001FA00-\U0001FA6F"
            "\U0001FA70-\U0001FAFF"
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "]+",
            flags=re.UNICODE
        )

        emoji_found = False
        for i, line in enumerate(lines, 1):
            if emoji_pattern.search(line):
                emoji_found = True
                suite.results.append(TestResult(
                    test_name="No emoji in KB",
                    category="KB Compliance",
                    status="FAIL",
                    message=f"Emoji found on line {i}",
                    file_path=str(kb_file),
                    line_number=i
                ))
                break

        if not emoji_found:
            suite.results.append(TestResult(
                test_name="No emoji in KB",
                category="KB Compliance",
                status="PASS",
                message="No emoji found",
                file_path=str(kb_file)
            ))

        # Rule 2: No markdown tables
        table_pattern = re.compile(r'\|.*\|.*\|')
        table_found = False
        for i, line in enumerate(lines, 1):
            if table_pattern.search(line):
                table_found = True
                suite.results.append(TestResult(
                    test_name="No markdown tables",
                    category="KB Compliance",
                    status="FAIL",
                    message=f"Markdown table found on line {i}",
                    file_path=str(kb_file),
                    line_number=i
                ))
                break

        if not table_found:
            suite.results.append(TestResult(
                test_name="No markdown tables",
                category="KB Compliance",
                status="PASS",
                message="No markdown tables found",
                file_path=str(kb_file)
            ))

        # Rule 3: No numbered lists (1. 2. 3.)
        numbered_list_pattern = re.compile(r'^[0-9]+\.\s')
        numbered_found = False
        for i, line in enumerate(lines, 1):
            if numbered_list_pattern.match(line):
                numbered_found = True
                suite.results.append(TestResult(
                    test_name="No numbered lists",
                    category="KB Compliance",
                    status="FAIL",
                    message=f"Numbered list found on line {i}: {line[:50]}...",
                    file_path=str(kb_file),
                    line_number=i
                ))
                break

        if not numbered_found:
            suite.results.append(TestResult(
                test_name="No numbered lists",
                category="KB Compliance",
                status="PASS",
                message="No numbered lists found",
                file_path=str(kb_file)
            ))

        # Rule 4: No curly brackets (except in code examples)
        curly_pattern = re.compile(r'[{}]')
        curly_found = False
        for i, line in enumerate(lines, 1):
            # Skip lines that look like code examples
            if line.strip().startswith(('#', '//', '/*', '*', 'Example:', 'Code:')):
                continue
            if curly_pattern.search(line):
                curly_found = True
                suite.results.append(TestResult(
                    test_name="No curly brackets",
                    category="KB Compliance",
                    status="WARN",
                    message=f"Curly bracket found on line {i}",
                    file_path=str(kb_file),
                    line_number=i
                ))
                break

        if not curly_found:
            suite.results.append(TestResult(
                test_name="No curly brackets",
                category="KB Compliance",
                status="PASS",
                message="No curly brackets found",
                file_path=str(kb_file)
            ))

        # Rule 5: Character limit (under 36,000)
        char_count = len(content)
        if char_count > 36000:
            suite.results.append(TestResult(
                test_name="Character limit",
                category="KB Compliance",
                status="FAIL",
                message=f"Character count {char_count} exceeds 36,000 limit",
                file_path=str(kb_file),
                details={"char_count": char_count}
            ))
        else:
            suite.results.append(TestResult(
                test_name="Character limit",
                category="KB Compliance",
                status="PASS",
                message=f"Character count: {char_count}/36,000",
                file_path=str(kb_file),
                details={"char_count": char_count}
            ))

        # Rule 6: ALL-CAPS headers
        header_pattern = re.compile(r'^[A-Z][A-Z0-9\s_-]+$')
        has_headers = False
        for line in lines:
            stripped = line.strip()
            if stripped and header_pattern.match(stripped) and len(stripped) > 3:
                has_headers = True
                break

        if has_headers:
            suite.results.append(TestResult(
                test_name="ALL-CAPS headers",
                category="KB Compliance",
                status="PASS",
                message="ALL-CAPS headers found",
                file_path=str(kb_file)
            ))
        else:
            suite.results.append(TestResult(
                test_name="ALL-CAPS headers",
                category="KB Compliance",
                status="WARN",
                message="No ALL-CAPS headers detected",
                file_path=str(kb_file)
            ))

# ============================================================================
# TEST CATEGORY 5: Instruction File Validation
# ============================================================================

def validate_instruction_files(suite: TestSuite) -> None:
    """Validate instruction files meet character requirements."""
    instruction_files = list(AGENTS_ROOT.rglob("*_Instructions_v7.0.txt"))
    instruction_files.extend(list(AGENTS_ROOT.rglob("*_Copilot_Instructions_v7.0.txt")))

    MIN_CHARS = 7500
    MAX_CHARS = 7999

    for inst_file in instruction_files:
        content = inst_file.read_text(encoding='utf-8', errors='replace')
        char_count = len(content)

        if char_count < MIN_CHARS:
            suite.results.append(TestResult(
                test_name="Instruction min chars",
                category="Instructions",
                status="FAIL",
                message=f"Character count {char_count} below minimum {MIN_CHARS}",
                file_path=str(inst_file),
                details={"char_count": char_count, "min": MIN_CHARS}
            ))
        elif char_count > MAX_CHARS:
            suite.results.append(TestResult(
                test_name="Instruction max chars",
                category="Instructions",
                status="FAIL",
                message=f"Character count {char_count} exceeds maximum {MAX_CHARS}",
                file_path=str(inst_file),
                details={"char_count": char_count, "max": MAX_CHARS}
            ))
        else:
            suite.results.append(TestResult(
                test_name="Instruction char range",
                category="Instructions",
                status="PASS",
                message=f"Character count {char_count} within range [{MIN_CHARS}-{MAX_CHARS}]",
                file_path=str(inst_file),
                details={"char_count": char_count}
            ))

        # Check for numbered lists
        lines = content.split('\n')
        numbered_pattern = re.compile(r'^[0-9]+\.\s')
        for i, line in enumerate(lines, 1):
            if numbered_pattern.match(line):
                suite.results.append(TestResult(
                    test_name="No numbered lists in instructions",
                    category="Instructions",
                    status="FAIL",
                    message=f"Numbered list found on line {i}",
                    file_path=str(inst_file),
                    line_number=i
                ))
                break
        else:
            suite.results.append(TestResult(
                test_name="No numbered lists in instructions",
                category="Instructions",
                status="PASS",
                message="No numbered lists found",
                file_path=str(inst_file)
            ))

# ============================================================================
# TEST CATEGORY 6: Seed Data Validation
# ============================================================================

def validate_seed_data(suite: TestSuite) -> None:
    """Validate seed data XML files against entity schemas."""
    seed_data_dirs = [
        SOLUTIONS_ROOT / "Consulting_and_Marketing_Agent_Platform_V7.0" / "data",
        SOLUTIONS_ROOT / "platform" / "data",
        V7_ROOT / "data"
    ]

    for data_dir in seed_data_dirs:
        if not data_dir.exists():
            continue

        for xml_file in data_dir.glob("*.xml"):
            try:
                tree = ET.parse(xml_file)
                root = tree.getroot()

                suite.results.append(TestResult(
                    test_name="Seed data XML parse",
                    category="Seed Data",
                    status="PASS",
                    message="XML parsed successfully",
                    file_path=str(xml_file)
                ))

                # Check for empty required values
                content = xml_file.read_text()

                # Check for empty value attributes
                empty_value_pattern = re.compile(r'value\s*=\s*["\'][\s]*["\']')
                matches = list(empty_value_pattern.finditer(content))
                if matches:
                    lines = content.split('\n')
                    for match in matches:
                        # Find line number
                        pos = match.start()
                        line_num = content[:pos].count('\n') + 1
                        suite.results.append(TestResult(
                            test_name="No empty values",
                            category="Seed Data",
                            status="WARN",
                            message=f"Empty value attribute found",
                            file_path=str(xml_file),
                            line_number=line_num
                        ))
                else:
                    suite.results.append(TestResult(
                        test_name="No empty values",
                        category="Seed Data",
                        status="PASS",
                        message="No empty value attributes",
                        file_path=str(xml_file)
                    ))

                # Check for eap_ prefix on fields
                records = root.findall(".//record")
                for record in records:
                    fields = record.findall("field")
                    non_prefixed = []
                    for field in fields:
                        field_name = field.get("name", "")
                        if field_name and not field_name.startswith(("eap_", "mpa_", "statecode", "statuscode")):
                            non_prefixed.append(field_name)

                    if non_prefixed:
                        suite.results.append(TestResult(
                            test_name="Field naming convention",
                            category="Seed Data",
                            status="WARN",
                            message=f"Non-prefixed fields: {non_prefixed[:5]}...",
                            file_path=str(xml_file)
                        ))

            except ET.ParseError as e:
                suite.results.append(TestResult(
                    test_name="Seed data XML parse",
                    category="Seed Data",
                    status="FAIL",
                    message=f"XML parse error: {e}",
                    file_path=str(xml_file)
                ))

# ============================================================================
# TEST CATEGORY 7: YAML Flow Validation
# ============================================================================

def validate_yaml_flows(suite: TestSuite) -> None:
    """Validate YAML flow definitions for Power Automate conversion."""
    yaml_files = list(AGENTS_ROOT.rglob("*.yaml"))
    yaml_files.extend(list(AGENTS_ROOT.rglob("*.yml")))

    for yaml_file in yaml_files:
        try:
            with open(yaml_file) as f:
                data = yaml.safe_load(f)

            if data is None:
                suite.results.append(TestResult(
                    test_name="YAML not empty",
                    category="YAML Flows",
                    status="FAIL",
                    message="YAML file is empty",
                    file_path=str(yaml_file)
                ))
                continue

            suite.results.append(TestResult(
                test_name="YAML parse",
                category="YAML Flows",
                status="PASS",
                message="YAML parsed successfully",
                file_path=str(yaml_file)
            ))

            # Check for required flow elements
            if "name" not in data:
                suite.results.append(TestResult(
                    test_name="Flow name",
                    category="YAML Flows",
                    status="WARN",
                    message="Missing flow name",
                    file_path=str(yaml_file)
                ))
            else:
                suite.results.append(TestResult(
                    test_name="Flow name",
                    category="YAML Flows",
                    status="PASS",
                    message=f"Flow: {data['name']}",
                    file_path=str(yaml_file)
                ))

            # Check for trigger
            if "trigger" not in data:
                suite.results.append(TestResult(
                    test_name="Flow trigger",
                    category="YAML Flows",
                    status="WARN",
                    message="Missing trigger definition",
                    file_path=str(yaml_file)
                ))
            else:
                suite.results.append(TestResult(
                    test_name="Flow trigger",
                    category="YAML Flows",
                    status="PASS",
                    message=f"Trigger type: {data['trigger'].get('type', 'unknown')}",
                    file_path=str(yaml_file)
                ))

            # Check for steps
            if "steps" not in data:
                suite.results.append(TestResult(
                    test_name="Flow steps",
                    category="YAML Flows",
                    status="WARN",
                    message="Missing steps definition",
                    file_path=str(yaml_file)
                ))
            else:
                steps = data["steps"]
                suite.results.append(TestResult(
                    test_name="Flow steps",
                    category="YAML Flows",
                    status="PASS",
                    message=f"Steps count: {len(steps)}",
                    file_path=str(yaml_file)
                ))

                # Check for placeholder values
                content = yaml_file.read_text()
                placeholder_patterns = [
                    r'"placeholder"',
                    r"'placeholder'",
                    r'_placeholder',
                    r'TODO:',
                    r'FIXME:',
                    r'XXX:'
                ]

                for pattern in placeholder_patterns:
                    if re.search(pattern, content, re.IGNORECASE):
                        suite.results.append(TestResult(
                            test_name="No placeholder values",
                            category="YAML Flows",
                            status="FAIL",
                            message=f"Placeholder pattern found: {pattern}",
                            file_path=str(yaml_file)
                        ))
                        break
                else:
                    suite.results.append(TestResult(
                        test_name="No placeholder values",
                        category="YAML Flows",
                        status="PASS",
                        message="No placeholder values found",
                        file_path=str(yaml_file)
                    ))

        except yaml.YAMLError as e:
            suite.results.append(TestResult(
                test_name="YAML parse",
                category="YAML Flows",
                status="FAIL",
                message=f"YAML parse error: {e}",
                file_path=str(yaml_file)
            ))

# ============================================================================
# TEST CATEGORY 8: Solution.xml Component References
# ============================================================================

def validate_solution_xml(suite: TestSuite) -> None:
    """Validate Solution.xml references all components correctly."""
    solution_files = [
        SOLUTIONS_ROOT / "Consulting_and_Marketing_Agent_Platform_V7.0" / "Solution.xml"
    ]

    for sol_file in solution_files:
        if not sol_file.exists():
            suite.results.append(TestResult(
                test_name="Solution.xml exists",
                category="Solution",
                status="FAIL",
                message="Solution.xml not found",
                file_path=str(sol_file)
            ))
            continue

        try:
            tree = ET.parse(sol_file)
            root = tree.getroot()

            suite.results.append(TestResult(
                test_name="Solution.xml parse",
                category="Solution",
                status="PASS",
                message="Solution.xml parsed successfully",
                file_path=str(sol_file)
            ))

            # Check UniqueName
            unique_name = root.find(".//UniqueName")
            if unique_name is None or not unique_name.text:
                suite.results.append(TestResult(
                    test_name="Solution UniqueName",
                    category="Solution",
                    status="FAIL",
                    message="Missing UniqueName",
                    file_path=str(sol_file)
                ))
            else:
                suite.results.append(TestResult(
                    test_name="Solution UniqueName",
                    category="Solution",
                    status="PASS",
                    message=f"UniqueName: {unique_name.text}",
                    file_path=str(sol_file)
                ))

            # Check Version
            version = root.find(".//Version")
            if version is None or not version.text:
                suite.results.append(TestResult(
                    test_name="Solution Version",
                    category="Solution",
                    status="FAIL",
                    message="Missing Version",
                    file_path=str(sol_file)
                ))
            else:
                suite.results.append(TestResult(
                    test_name="Solution Version",
                    category="Solution",
                    status="PASS",
                    message=f"Version: {version.text}",
                    file_path=str(sol_file)
                ))

            # Check RootComponents
            root_components = root.find(".//RootComponents")
            if root_components is None:
                suite.results.append(TestResult(
                    test_name="RootComponents",
                    category="Solution",
                    status="FAIL",
                    message="Missing RootComponents",
                    file_path=str(sol_file)
                ))
            else:
                components = root_components.findall("RootComponent")
                suite.results.append(TestResult(
                    test_name="RootComponents",
                    category="Solution",
                    status="PASS",
                    message=f"Component count: {len(components)}",
                    file_path=str(sol_file)
                ))

        except ET.ParseError as e:
            suite.results.append(TestResult(
                test_name="Solution.xml parse",
                category="Solution",
                status="FAIL",
                message=f"XML parse error: {e}",
                file_path=str(sol_file)
            ))

# ============================================================================
# TEST CATEGORY 9: Copilot Studio Topic Validation
# ============================================================================

def validate_copilot_topics(suite: TestSuite) -> None:
    """Validate Copilot Studio topic files."""
    topic_dirs = [
        SOLUTIONS_ROOT / "Consulting_and_Marketing_Agent_Platform_V7.0" / "botcomponents"
    ]

    for topic_dir in topic_dirs:
        if not topic_dir.exists():
            suite.results.append(TestResult(
                test_name="Topic directory exists",
                category="Topics",
                status="WARN",
                message="botcomponents directory not found",
                file_path=str(topic_dir)
            ))
            continue

        topic_files = list(topic_dir.rglob("*.json"))

        for topic_file in topic_files:
            try:
                with open(topic_file) as f:
                    data = json.load(f)

                suite.results.append(TestResult(
                    test_name="Topic JSON parse",
                    category="Topics",
                    status="PASS",
                    message="Topic parsed successfully",
                    file_path=str(topic_file)
                ))

            except json.JSONDecodeError as e:
                suite.results.append(TestResult(
                    test_name="Topic JSON parse",
                    category="Topics",
                    status="FAIL",
                    message=f"JSON parse error: {e}",
                    file_path=str(topic_file)
                ))

# ============================================================================
# Report Generation
# ============================================================================

def generate_report(suites: List[TestSuite]) -> str:
    """Generate comprehensive test report."""
    report = []
    report.append("=" * 80)
    report.append("KDAP v7.0 SOLUTION VALIDATION REPORT")
    report.append(f"Generated: {datetime.now().isoformat()}")
    report.append("=" * 80)
    report.append("")

    # Summary
    total_passed = sum(s.passed for s in suites)
    total_failed = sum(s.failed for s in suites)
    total_warnings = sum(s.warnings for s in suites)
    total_tests = total_passed + total_failed + total_warnings

    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 40)
    report.append(f"Total Tests:    {total_tests}")
    report.append(f"Passed:         {total_passed} ({100*total_passed//max(total_tests,1)}%)")
    report.append(f"Failed:         {total_failed}")
    report.append(f"Warnings:       {total_warnings}")
    report.append("")

    if total_failed == 0:
        report.append("STATUS: ALL CRITICAL TESTS PASSED")
    else:
        report.append("STATUS: FAILURES DETECTED - REVIEW REQUIRED")
    report.append("")

    # Category breakdown
    report.append("RESULTS BY CATEGORY")
    report.append("-" * 40)

    categories: Dict[str, Dict[str, int]] = {}
    for suite in suites:
        for result in suite.results:
            if result.category not in categories:
                categories[result.category] = {"PASS": 0, "FAIL": 0, "WARN": 0}
            categories[result.category][result.status] += 1

    for category, counts in sorted(categories.items()):
        total = sum(counts.values())
        report.append(f"\n{category}:")
        report.append(f"  PASS: {counts['PASS']}/{total}  FAIL: {counts['FAIL']}  WARN: {counts['WARN']}")

    report.append("")

    # Failures detail
    failures = [r for s in suites for r in s.results if r.status == "FAIL"]
    if failures:
        report.append("")
        report.append("FAILURES (MUST FIX)")
        report.append("=" * 40)
        for f in failures:
            report.append(f"\n[{f.category}] {f.test_name}")
            if f.file_path:
                # Shorten path for readability
                short_path = f.file_path.replace(str(V7_ROOT), "v7.0")
                report.append(f"  File: {short_path}")
            if f.line_number:
                report.append(f"  Line: {f.line_number}")
            report.append(f"  Message: {f.message}")

    # Warnings detail
    warnings = [r for s in suites for r in s.results if r.status == "WARN"]
    if warnings:
        report.append("")
        report.append("WARNINGS (REVIEW RECOMMENDED)")
        report.append("=" * 40)
        for w in warnings[:20]:  # Limit to first 20
            report.append(f"\n[{w.category}] {w.test_name}")
            if w.file_path:
                short_path = w.file_path.replace(str(V7_ROOT), "v7.0")
                report.append(f"  File: {short_path}")
            report.append(f"  Message: {w.message}")

        if len(warnings) > 20:
            report.append(f"\n... and {len(warnings) - 20} more warnings")

    report.append("")
    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)

    return "\n".join(report)

# ============================================================================
# Main Execution
# ============================================================================

def main():
    """Run all validation tests."""
    print("KDAP v7.0 Solution Validation Suite")
    print("=" * 50)
    print(f"V7 Root: {V7_ROOT}")
    print(f"Solutions Root: {SOLUTIONS_ROOT}")
    print(f"Agents Root: {AGENTS_ROOT}")
    print()

    suites = []

    # Entity Schema Tests
    print("Running Entity Schema Tests...")
    entity_suite = TestSuite("Entity Schema")
    validate_entity_xml_files(entity_suite)
    suites.append(entity_suite)
    print(f"  Passed: {entity_suite.passed}, Failed: {entity_suite.failed}, Warnings: {entity_suite.warnings}")

    # Customizations Tests
    print("Running Customizations Tests...")
    cust_suite = TestSuite("Customizations")
    validate_customizations_xml(cust_suite)
    suites.append(cust_suite)
    print(f"  Passed: {cust_suite.passed}, Failed: {cust_suite.failed}, Warnings: {cust_suite.warnings}")

    # Workflow JSON Tests
    print("Running Workflow JSON Tests...")
    workflow_suite = TestSuite("Workflow JSON")
    validate_workflow_json_files(workflow_suite)
    suites.append(workflow_suite)
    print(f"  Passed: {workflow_suite.passed}, Failed: {workflow_suite.failed}, Warnings: {workflow_suite.warnings}")

    # KB Compliance Tests
    print("Running KB Compliance Tests...")
    kb_suite = TestSuite("KB Compliance")
    validate_kb_documents(kb_suite)
    suites.append(kb_suite)
    print(f"  Passed: {kb_suite.passed}, Failed: {kb_suite.failed}, Warnings: {kb_suite.warnings}")

    # Instruction File Tests
    print("Running Instruction File Tests...")
    inst_suite = TestSuite("Instructions")
    validate_instruction_files(inst_suite)
    suites.append(inst_suite)
    print(f"  Passed: {inst_suite.passed}, Failed: {inst_suite.failed}, Warnings: {inst_suite.warnings}")

    # Seed Data Tests
    print("Running Seed Data Tests...")
    seed_suite = TestSuite("Seed Data")
    validate_seed_data(seed_suite)
    suites.append(seed_suite)
    print(f"  Passed: {seed_suite.passed}, Failed: {seed_suite.failed}, Warnings: {seed_suite.warnings}")

    # YAML Flow Tests
    print("Running YAML Flow Tests...")
    yaml_suite = TestSuite("YAML Flows")
    validate_yaml_flows(yaml_suite)
    suites.append(yaml_suite)
    print(f"  Passed: {yaml_suite.passed}, Failed: {yaml_suite.failed}, Warnings: {yaml_suite.warnings}")

    # Solution.xml Tests
    print("Running Solution.xml Tests...")
    sol_suite = TestSuite("Solution")
    validate_solution_xml(sol_suite)
    suites.append(sol_suite)
    print(f"  Passed: {sol_suite.passed}, Failed: {sol_suite.failed}, Warnings: {sol_suite.warnings}")

    # Copilot Topics Tests
    print("Running Copilot Topics Tests...")
    topic_suite = TestSuite("Topics")
    validate_copilot_topics(topic_suite)
    suites.append(topic_suite)
    print(f"  Passed: {topic_suite.passed}, Failed: {topic_suite.failed}, Warnings: {topic_suite.warnings}")

    # Generate report
    print()
    print("Generating report...")
    report = generate_report(suites)

    # Save report
    report_path = V7_ROOT / "tests" / "validation_report.txt"
    report_path.parent.mkdir(exist_ok=True)
    report_path.write_text(report)
    print(f"Report saved to: {report_path}")

    # Print report
    print()
    print(report)

    # Return exit code
    total_failed = sum(s.failed for s in suites)
    return 1 if total_failed > 0 else 0

if __name__ == "__main__":
    sys.exit(main())
