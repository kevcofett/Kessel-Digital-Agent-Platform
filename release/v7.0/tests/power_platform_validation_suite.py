#!/usr/bin/env python3
"""
KDAP v7.0 Power Platform Import Validation Suite
=================================================
Comprehensive validation suite for ensuring all solution components
will import and run correctly in Copilot Studio, Power Platform,
Dataverse, Power Automate, and Azure environments.

Test Categories:
1. Solution Package Structure (CRITICAL)
2. XML Schema Validation (CRITICAL)
3. Entity Relationship Integrity (CRITICAL)
4. Power Automate Flow Validation (CRITICAL)
5. AI Builder Prompt Validation (HIGH)
6. Copilot Studio Topic Validation (HIGH)
7. KB Document Compliance (HIGH)
8. Instruction File Compliance (HIGH)
9. Seed Data Schema Alignment (HIGH)
10. Connection Reference Validation (MEDIUM)
11. Environment Variable Validation (MEDIUM)
12. Component Cross-Reference (MEDIUM)
13. YAML-to-JSON Conversion Readiness (MEDIUM)
14. ZIP Package Integrity (CRITICAL)
15. Dataverse Schema Compatibility (CRITICAL)

Total: ~170 individual test cases
"""

import os
import sys
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set, Tuple, Any
from datetime import datetime
from enum import Enum
import yaml

# ============================================================================
# ENUMS AND DATACLASSES
# ============================================================================

class Priority(Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Status(Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARN = "WARN"
    SKIP = "SKIP"

@dataclass
class TestResult:
    test_id: str
    test_name: str
    category: str
    priority: Priority
    status: Status
    message: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    details: Optional[Dict] = None
    remediation: Optional[str] = None

@dataclass
class TestCategory:
    name: str
    priority: Priority
    target: str
    results: List[TestResult] = field(default_factory=list)

    @property
    def passed(self) -> int:
        return sum(1 for r in self.results if r.status == Status.PASS)

    @property
    def failed(self) -> int:
        return sum(1 for r in self.results if r.status == Status.FAIL)

    @property
    def warnings(self) -> int:
        return sum(1 for r in self.results if r.status == Status.WARN)

    @property
    def skipped(self) -> int:
        return sum(1 for r in self.results if r.status == Status.SKIP)

# ============================================================================
# CONFIGURATION
# ============================================================================

# Base paths
V7_ROOT = Path(__file__).parent.parent
SOLUTIONS_ROOT = V7_ROOT / "solutions"
AGENTS_ROOT = V7_ROOT / "agents"
SOLUTION_DIR = SOLUTIONS_ROOT / "Consulting_and_Marketing_Agent_Platform_V7.0"
SOLUTION_ZIP = SOLUTIONS_ROOT / "Consulting_and_Marketing_Agent_Platform_V7.0.zip"

# Valid Dataverse attribute types
VALID_DATAVERSE_TYPES = {
    "primarykey", "uniqueidentifier", "nvarchar", "ntext", "int", "bigint",
    "decimal", "float", "money", "bit", "datetime", "date", "picklist",
    "state", "status", "lookup", "owner", "customer", "partylist",
    "image", "file", "multiselect"
}

# Valid RequiredLevel values
VALID_REQUIRED_LEVELS = {"none", "recommended", "required", "systemrequired"}

# Reserved SQL/Dataverse names
RESERVED_NAMES = {
    "name", "id", "type", "state", "status", "owner", "created", "modified",
    "select", "from", "where", "and", "or", "not", "null", "true", "false",
    "insert", "update", "delete", "drop", "table", "index", "key", "primary"
}

# Valid publisher prefixes
VALID_PREFIXES = {"eap_", "mpa_", "ca_"}

# System entities that are valid lookup targets
SYSTEM_ENTITIES = {
    "systemuser", "team", "businessunit", "transactioncurrency",
    "organization", "principal", "owner", "customer"
}

# ============================================================================
# CATEGORY 1: Solution Package Structure Tests
# ============================================================================

def validate_solution_package_structure(category: TestCategory) -> None:
    """Validate solution package structure for Power Platform import."""

    # PKG-001: Root files exist
    if not SOLUTION_ZIP.exists():
        category.results.append(TestResult(
            test_id="PKG-001",
            test_name="Solution ZIP exists",
            category=category.name,
            priority=Priority.CRITICAL,
            status=Status.FAIL,
            message="Solution ZIP file not found",
            file_path=str(SOLUTION_ZIP),
            remediation="Run: cd solutions && zip -r solution.zip Consulting_and_Marketing_Agent_Platform_V7.0/"
        ))
        return

    try:
        with zipfile.ZipFile(SOLUTION_ZIP, 'r') as zf:
            file_list = zf.namelist()

            # Check for required root files
            required_files = ["Solution.xml", "customizations.xml", "[Content_Types].xml"]
            for req_file in required_files:
                if req_file in file_list:
                    category.results.append(TestResult(
                        test_id="PKG-001",
                        test_name=f"Root file exists: {req_file}",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.PASS,
                        message=f"{req_file} found at ZIP root",
                        file_path=req_file
                    ))
                else:
                    category.results.append(TestResult(
                        test_id="PKG-001",
                        test_name=f"Root file exists: {req_file}",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.FAIL,
                        message=f"{req_file} NOT found at ZIP root",
                        file_path=str(SOLUTION_ZIP),
                        remediation=f"Ensure {req_file} is at the root of the ZIP, not in a subfolder"
                    ))

            # PKG-002: Solution.xml format
            if "Solution.xml" in file_list:
                content = zf.read("Solution.xml").decode('utf-8')

                # Check no XML declaration
                if content.startswith("<?xml"):
                    category.results.append(TestResult(
                        test_id="PKG-002",
                        test_name="Solution.xml no XML declaration",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.FAIL,
                        message="Solution.xml should not have XML declaration for Power Platform",
                        file_path="Solution.xml",
                        remediation="Remove <?xml version=\"1.0\"?> line from Solution.xml"
                    ))
                else:
                    category.results.append(TestResult(
                        test_id="PKG-002",
                        test_name="Solution.xml no XML declaration",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.PASS,
                        message="Solution.xml has correct format (no XML declaration)",
                        file_path="Solution.xml"
                    ))

                # Check for CrmLive generatedBy
                if 'generatedBy="CrmLive"' in content:
                    category.results.append(TestResult(
                        test_id="PKG-002",
                        test_name="Solution.xml CrmLive attribute",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.PASS,
                        message="Solution.xml has correct generatedBy attribute",
                        file_path="Solution.xml"
                    ))
                else:
                    category.results.append(TestResult(
                        test_id="PKG-002",
                        test_name="Solution.xml CrmLive attribute",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.FAIL,
                        message="Solution.xml missing generatedBy=\"CrmLive\" attribute",
                        file_path="Solution.xml",
                        remediation="Add generatedBy=\"CrmLive\" to ImportExportXml element"
                    ))

            # PKG-003: customizations.xml format
            if "customizations.xml" in file_list:
                content = zf.read("customizations.xml").decode('utf-8')

                if content.startswith("<?xml"):
                    category.results.append(TestResult(
                        test_id="PKG-003",
                        test_name="customizations.xml no XML declaration",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.FAIL,
                        message="customizations.xml should not have XML declaration",
                        file_path="customizations.xml",
                        remediation="Remove <?xml version=\"1.0\"?> line"
                    ))
                else:
                    category.results.append(TestResult(
                        test_id="PKG-003",
                        test_name="customizations.xml no XML declaration",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.PASS,
                        message="customizations.xml has correct format",
                        file_path="customizations.xml"
                    ))

            # PKG-004: [Content_Types].xml format
            if "[Content_Types].xml" in file_list:
                content = zf.read("[Content_Types].xml").decode('utf-8')

                if "schemas.openxmlformats.org/package/2006/content-types" in content:
                    category.results.append(TestResult(
                        test_id="PKG-004",
                        test_name="[Content_Types].xml OPC namespace",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.PASS,
                        message="[Content_Types].xml has correct OPC namespace",
                        file_path="[Content_Types].xml"
                    ))
                else:
                    category.results.append(TestResult(
                        test_id="PKG-004",
                        test_name="[Content_Types].xml OPC namespace",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.FAIL,
                        message="[Content_Types].xml missing OPC namespace",
                        file_path="[Content_Types].xml"
                    ))

            # PKG-005: No nested solution folders
            nested_solution = any(
                f.startswith("Consulting_and_Marketing_Agent_Platform_V7.0/")
                for f in file_list
            )
            if nested_solution:
                category.results.append(TestResult(
                    test_id="PKG-005",
                    test_name="No nested solution folders",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.FAIL,
                    message="Solution files are nested in subfolder instead of at root",
                    file_path=str(SOLUTION_ZIP),
                    remediation="Recreate ZIP from inside solution folder: cd solution_folder && zip -r ../solution.zip ."
                ))
            else:
                category.results.append(TestResult(
                    test_id="PKG-005",
                    test_name="No nested solution folders",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.PASS,
                    message="Solution files are correctly at ZIP root",
                    file_path=str(SOLUTION_ZIP)
                ))

            # PKG-008: No hidden files
            hidden_files = [f for f in file_list if ".DS_Store" in f or "__MACOSX" in f or ".git" in f]
            if hidden_files:
                category.results.append(TestResult(
                    test_id="PKG-008",
                    test_name="No hidden files",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.WARN,
                    message=f"Hidden files found in ZIP: {hidden_files[:3]}",
                    file_path=str(SOLUTION_ZIP),
                    remediation="Recreate ZIP with: zip -r solution.zip . -x '*.DS_Store' -x '__MACOSX/*'"
                ))
            else:
                category.results.append(TestResult(
                    test_id="PKG-008",
                    test_name="No hidden files",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message="No hidden files in ZIP",
                    file_path=str(SOLUTION_ZIP)
                ))

            # PKG-009, PKG-010, PKG-011, PKG-012: Parse Solution.xml for metadata
            if "Solution.xml" in file_list:
                content = zf.read("Solution.xml").decode('utf-8')
                try:
                    root = ET.fromstring(content)

                    # PKG-009: UniqueName valid
                    unique_name = root.find(".//UniqueName")
                    if unique_name is not None and unique_name.text:
                        name = unique_name.text
                        if re.match(r'^[A-Za-z][A-Za-z0-9_]*$', name) and len(name) < 100:
                            category.results.append(TestResult(
                                test_id="PKG-009",
                                test_name="UniqueName valid",
                                category=category.name,
                                priority=Priority.CRITICAL,
                                status=Status.PASS,
                                message=f"UniqueName '{name}' is valid",
                                file_path="Solution.xml"
                            ))
                        else:
                            category.results.append(TestResult(
                                test_id="PKG-009",
                                test_name="UniqueName valid",
                                category=category.name,
                                priority=Priority.CRITICAL,
                                status=Status.FAIL,
                                message=f"UniqueName '{name}' is invalid (must be alphanumeric, <100 chars)",
                                file_path="Solution.xml"
                            ))

                    # PKG-010: Version format
                    version = root.find(".//Version")
                    if version is not None and version.text:
                        if re.match(r'^\d+\.\d+\.\d+\.\d+$', version.text):
                            category.results.append(TestResult(
                                test_id="PKG-010",
                                test_name="Version format valid",
                                category=category.name,
                                priority=Priority.HIGH,
                                status=Status.PASS,
                                message=f"Version '{version.text}' is valid X.X.X.X format",
                                file_path="Solution.xml"
                            ))
                        else:
                            category.results.append(TestResult(
                                test_id="PKG-010",
                                test_name="Version format valid",
                                category=category.name,
                                priority=Priority.HIGH,
                                status=Status.FAIL,
                                message=f"Version '{version.text}' is not X.X.X.X format",
                                file_path="Solution.xml"
                            ))

                    # PKG-012: MissingDependencies empty
                    missing_deps = root.find(".//MissingDependencies")
                    if missing_deps is not None:
                        dep_children = list(missing_deps)
                        if len(dep_children) == 0:
                            category.results.append(TestResult(
                                test_id="PKG-012",
                                test_name="MissingDependencies empty",
                                category=category.name,
                                priority=Priority.CRITICAL,
                                status=Status.PASS,
                                message="No missing dependencies",
                                file_path="Solution.xml"
                            ))
                        else:
                            category.results.append(TestResult(
                                test_id="PKG-012",
                                test_name="MissingDependencies empty",
                                category=category.name,
                                priority=Priority.CRITICAL,
                                status=Status.FAIL,
                                message=f"Missing dependencies found: {len(dep_children)} items",
                                file_path="Solution.xml",
                                remediation="Resolve all missing dependencies before import"
                            ))

                except ET.ParseError as e:
                    category.results.append(TestResult(
                        test_id="PKG-002",
                        test_name="Solution.xml parse",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.FAIL,
                        message=f"Solution.xml parse error: {e}",
                        file_path="Solution.xml"
                    ))

    except zipfile.BadZipFile as e:
        category.results.append(TestResult(
            test_id="PKG-001",
            test_name="ZIP file valid",
            category=category.name,
            priority=Priority.CRITICAL,
            status=Status.FAIL,
            message=f"Invalid ZIP file: {e}",
            file_path=str(SOLUTION_ZIP)
        ))

# ============================================================================
# CATEGORY 2: XML Schema Validation Tests
# ============================================================================

def validate_entity_xml_schema(category: TestCategory) -> None:
    """Validate all Entity.xml files conform to Dataverse schema."""

    entities_dir = SOLUTION_DIR / "Entities"
    if not entities_dir.exists():
        category.results.append(TestResult(
            test_id="ENT-001",
            test_name="Entities directory exists",
            category=category.name,
            priority=Priority.CRITICAL,
            status=Status.FAIL,
            message="Entities directory not found",
            file_path=str(entities_dir)
        ))
        return

    entity_dirs = [d for d in entities_dir.iterdir() if d.is_dir()]

    for entity_dir in entity_dirs:
        entity_file = entity_dir / "Entity.xml"
        entity_name = entity_dir.name

        # ENT-001: Entity.xml exists
        if not entity_file.exists():
            category.results.append(TestResult(
                test_id="ENT-001",
                test_name="Entity.xml exists",
                category=category.name,
                priority=Priority.CRITICAL,
                status=Status.FAIL,
                message=f"Entity.xml not found for {entity_name}",
                file_path=str(entity_dir)
            ))
            continue

        try:
            tree = ET.parse(entity_file)
            root = tree.getroot()

            # ENT-002: XML well-formed
            category.results.append(TestResult(
                test_id="ENT-002",
                test_name="XML well-formed",
                category=category.name,
                priority=Priority.CRITICAL,
                status=Status.PASS,
                message=f"Entity.xml parses correctly",
                file_path=str(entity_file)
            ))

            # ENT-003: PrimaryNameAttribute exists
            primary_name_attr = root.find(".//PrimaryNameAttribute")
            if primary_name_attr is None or not primary_name_attr.text:
                category.results.append(TestResult(
                    test_id="ENT-003",
                    test_name="PrimaryNameAttribute exists",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.FAIL,
                    message=f"Missing PrimaryNameAttribute in {entity_name}",
                    file_path=str(entity_file),
                    remediation="Add <PrimaryNameAttribute>fieldname</PrimaryNameAttribute>"
                ))
            else:
                primary_name = primary_name_attr.text
                category.results.append(TestResult(
                    test_id="ENT-003",
                    test_name="PrimaryNameAttribute exists",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.PASS,
                    message=f"PrimaryNameAttribute: {primary_name}",
                    file_path=str(entity_file)
                ))

                # ENT-004: PrimaryNameAttribute references valid field
                attributes = root.findall(".//attribute")
                # Handle both formats: PhysicalName attribute or Name child element
                attr_names = []
                for a in attributes:
                    # First try PhysicalName attribute
                    physical_name = a.get("PhysicalName")
                    if physical_name:
                        attr_names.append(physical_name.lower())
                    else:
                        # Fall back to Name child element
                        name_elem = a.find("Name")
                        if name_elem is not None and name_elem.text:
                            attr_names.append(name_elem.text.lower())

                if primary_name.lower() in attr_names:
                    category.results.append(TestResult(
                        test_id="ENT-004",
                        test_name="PrimaryNameAttribute references valid field",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.PASS,
                        message=f"Field '{primary_name}' exists in attributes",
                        file_path=str(entity_file)
                    ))

                    # ENT-005: IsPrimaryName flag set
                    primary_attr = None
                    for attr in attributes:
                        # Handle PhysicalName attribute
                        physical_name = attr.get("PhysicalName")
                        if physical_name and physical_name.lower() == primary_name.lower():
                            primary_attr = attr
                            break
                        # Fall back to Name child element
                        name_elem = attr.find("Name")
                        if name_elem is not None and name_elem.text and name_elem.text.lower() == primary_name.lower():
                            primary_attr = attr
                            break

                    if primary_attr is not None:
                        is_primary = primary_attr.find("IsPrimaryName")
                        if is_primary is not None and is_primary.text == "1":
                            category.results.append(TestResult(
                                test_id="ENT-005",
                                test_name="IsPrimaryName flag set",
                                category=category.name,
                                priority=Priority.HIGH,
                                status=Status.PASS,
                                message=f"IsPrimaryName=1 on '{primary_name}'",
                                file_path=str(entity_file)
                            ))
                        else:
                            category.results.append(TestResult(
                                test_id="ENT-005",
                                test_name="IsPrimaryName flag set",
                                category=category.name,
                                priority=Priority.HIGH,
                                status=Status.WARN,
                                message=f"IsPrimaryName flag not set on '{primary_name}'",
                                file_path=str(entity_file),
                                remediation="Add <IsPrimaryName>1</IsPrimaryName> to the primary name attribute"
                            ))
                else:
                    category.results.append(TestResult(
                        test_id="ENT-004",
                        test_name="PrimaryNameAttribute references valid field",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.FAIL,
                        message=f"Field '{primary_name}' not found in attributes",
                        file_path=str(entity_file)
                    ))

            # ENT-006: Entity Name defined
            entity_name_elem = root.find("Name")
            entity_info_name = root.find(".//EntityInfo/entity")

            if entity_name_elem is not None or (entity_info_name is not None and entity_info_name.get("Name")):
                category.results.append(TestResult(
                    test_id="ENT-006",
                    test_name="Entity Name defined",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.PASS,
                    message=f"Entity name is defined",
                    file_path=str(entity_file)
                ))
            else:
                category.results.append(TestResult(
                    test_id="ENT-006",
                    test_name="Entity Name defined",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.FAIL,
                    message=f"Entity name not defined",
                    file_path=str(entity_file)
                ))

            # ENT-008: Attribute types valid
            for attr in root.findall(".//attribute"):
                type_elem = attr.find("Type")
                name_elem = attr.find("Name")
                attr_name = name_elem.text if name_elem is not None else "unknown"

                if type_elem is not None and type_elem.text:
                    if type_elem.text.lower() not in VALID_DATAVERSE_TYPES:
                        category.results.append(TestResult(
                            test_id="ENT-008",
                            test_name="Attribute type valid",
                            category=category.name,
                            priority=Priority.HIGH,
                            status=Status.FAIL,
                            message=f"Invalid type '{type_elem.text}' on attribute '{attr_name}'",
                            file_path=str(entity_file)
                        ))

            # ENT-009: RequiredLevel valid
            for attr in root.findall(".//attribute"):
                req_level = attr.find("RequiredLevel")
                name_elem = attr.find("Name")
                attr_name = name_elem.text if name_elem is not None else "unknown"

                if req_level is not None and req_level.text:
                    if req_level.text.lower() not in VALID_REQUIRED_LEVELS:
                        category.results.append(TestResult(
                            test_id="ENT-009",
                            test_name="RequiredLevel valid",
                            category=category.name,
                            priority=Priority.MEDIUM,
                            status=Status.WARN,
                            message=f"Invalid RequiredLevel '{req_level.text}' on '{attr_name}'",
                            file_path=str(entity_file)
                        ))

            # ENT-017: Correct prefix usage
            for attr in root.findall(".//attribute"):
                name_elem = attr.find("Name")
                is_custom = attr.find("IsCustomField")

                if name_elem is not None and name_elem.text:
                    attr_name = name_elem.text.lower()
                    if is_custom is not None and is_custom.text == "1":
                        has_valid_prefix = any(attr_name.startswith(p) for p in VALID_PREFIXES)
                        if not has_valid_prefix:
                            # Skip system fields that don't need prefix
                            if attr_name not in {"statecode", "statuscode", "createdon", "modifiedon", "ownerid"}:
                                category.results.append(TestResult(
                                    test_id="ENT-017",
                                    test_name="Correct prefix usage",
                                    category=category.name,
                                    priority=Priority.MEDIUM,
                                    status=Status.WARN,
                                    message=f"Custom field '{attr_name}' missing publisher prefix",
                                    file_path=str(entity_file)
                                ))

            # ENT-018: No duplicate attributes
            attr_names_check = []
            for attr in root.findall(".//attribute"):
                name_elem = attr.find("Name")
                if name_elem is not None and name_elem.text:
                    if name_elem.text.lower() in attr_names_check:
                        category.results.append(TestResult(
                            test_id="ENT-018",
                            test_name="No duplicate attributes",
                            category=category.name,
                            priority=Priority.HIGH,
                            status=Status.FAIL,
                            message=f"Duplicate attribute '{name_elem.text}'",
                            file_path=str(entity_file)
                        ))
                    else:
                        attr_names_check.append(name_elem.text.lower())

        except ET.ParseError as e:
            category.results.append(TestResult(
                test_id="ENT-002",
                test_name="XML well-formed",
                category=category.name,
                priority=Priority.CRITICAL,
                status=Status.FAIL,
                message=f"XML parse error: {e}",
                file_path=str(entity_file)
            ))

# ============================================================================
# CATEGORY 3: Entity Relationship Integrity Tests
# ============================================================================

def validate_entity_relationships(category: TestCategory) -> None:
    """Validate entity relationships for Dataverse import."""

    relationships_dir = SOLUTION_DIR / "Other" / "Relationships"
    entities_dir = SOLUTION_DIR / "Entities"

    # Collect all defined entity names
    defined_entities = set()
    if entities_dir.exists():
        for entity_dir in entities_dir.iterdir():
            if entity_dir.is_dir():
                defined_entities.add(entity_dir.name.lower())

    # Add system entities
    defined_entities.update(SYSTEM_ENTITIES)

    # REL-002: Relationship XML valid
    if relationships_dir.exists():
        for rel_file in relationships_dir.glob("*.xml"):
            try:
                tree = ET.parse(rel_file)
                category.results.append(TestResult(
                    test_id="REL-002",
                    test_name="Relationship XML valid",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message=f"Relationship file parses correctly",
                    file_path=str(rel_file)
                ))
            except ET.ParseError as e:
                category.results.append(TestResult(
                    test_id="REL-002",
                    test_name="Relationship XML valid",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.FAIL,
                    message=f"Parse error: {e}",
                    file_path=str(rel_file)
                ))

    # REL-001: Lookup field targets exist
    if entities_dir.exists():
        for entity_dir in entities_dir.iterdir():
            if not entity_dir.is_dir():
                continue
            entity_file = entity_dir / "Entity.xml"
            if not entity_file.exists():
                continue

            try:
                tree = ET.parse(entity_file)
                root = tree.getroot()

                for attr in root.findall(".//attribute"):
                    type_elem = attr.find("Type")
                    if type_elem is not None and type_elem.text and type_elem.text.lower() == "lookup":
                        lookup_type = attr.find("LookupType")
                        if lookup_type is not None:
                            target = lookup_type.get("id", "")
                            # Zero GUID is valid for polymorphic lookups
                            if target and target != "00000000-0000-0000-0000-000000000000":
                                # Check if target entity exists
                                name_elem = attr.find("Name")
                                attr_name = name_elem.text if name_elem is not None else "unknown"
                                category.results.append(TestResult(
                                    test_id="REL-001",
                                    test_name="Lookup target exists",
                                    category=category.name,
                                    priority=Priority.HIGH,
                                    status=Status.PASS,
                                    message=f"Lookup '{attr_name}' has target defined",
                                    file_path=str(entity_file)
                                ))

            except ET.ParseError:
                pass

# ============================================================================
# CATEGORY 4: Power Automate Flow Validation Tests
# ============================================================================

def validate_power_automate_flows(category: TestCategory) -> None:
    """Validate Power Automate flow JSON files."""

    workflow_dirs = [
        SOLUTION_DIR / "Workflows",
        SOLUTIONS_ROOT / "platform" / "Workflows",
        AGENTS_ROOT
    ]

    required_schema = "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#"

    workflow_files = []
    for workflow_dir in workflow_dirs:
        if workflow_dir.exists():
            workflow_files.extend(workflow_dir.rglob("*.json"))

    for json_file in workflow_files:
        # Skip non-workflow files
        if json_file.name in ["components.json", "agent-registry.json", "handoff-contracts.json"]:
            continue
        if "prompts" in json_file.name.lower() or "topics" in json_file.name.lower():
            continue
        if "test" in str(json_file).lower():
            continue

        try:
            with open(json_file) as f:
                data = json.load(f)

            # FLW-001: JSON well-formed
            category.results.append(TestResult(
                test_id="FLW-001",
                test_name="JSON well-formed",
                category=category.name,
                priority=Priority.CRITICAL,
                status=Status.PASS,
                message="JSON parses correctly",
                file_path=str(json_file)
            ))

            # Check if this is a Power Automate workflow
            if "schemaVersion" not in data and "properties" not in data:
                continue

            # FLW-002: schemaVersion present
            if "schemaVersion" in data:
                category.results.append(TestResult(
                    test_id="FLW-002",
                    test_name="schemaVersion present",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.PASS,
                    message=f"schemaVersion: {data['schemaVersion']}",
                    file_path=str(json_file)
                ))
            else:
                category.results.append(TestResult(
                    test_id="FLW-002",
                    test_name="schemaVersion present",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.FAIL,
                    message="Missing schemaVersion",
                    file_path=str(json_file)
                ))

            # FLW-003: properties structure
            if "properties" in data:
                props = data["properties"]
                category.results.append(TestResult(
                    test_id="FLW-003",
                    test_name="properties structure",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.PASS,
                    message="properties object present",
                    file_path=str(json_file)
                ))

                # FLW-004: definition structure
                if "definition" in props:
                    definition = props["definition"]
                    category.results.append(TestResult(
                        test_id="FLW-004",
                        test_name="definition structure",
                        category=category.name,
                        priority=Priority.CRITICAL,
                        status=Status.PASS,
                        message="definition object present",
                        file_path=str(json_file)
                    ))

                    # FLW-005: $schema correct
                    if "$schema" in definition:
                        if definition["$schema"] == required_schema:
                            category.results.append(TestResult(
                                test_id="FLW-005",
                                test_name="$schema correct",
                                category=category.name,
                                priority=Priority.HIGH,
                                status=Status.PASS,
                                message="Correct Logic Apps schema",
                                file_path=str(json_file)
                            ))
                        else:
                            category.results.append(TestResult(
                                test_id="FLW-005",
                                test_name="$schema correct",
                                category=category.name,
                                priority=Priority.HIGH,
                                status=Status.WARN,
                                message=f"Schema mismatch: {definition['$schema']}",
                                file_path=str(json_file)
                            ))

                    # FLW-006: triggers defined
                    if "triggers" in definition and definition["triggers"]:
                        category.results.append(TestResult(
                            test_id="FLW-006",
                            test_name="triggers defined",
                            category=category.name,
                            priority=Priority.CRITICAL,
                            status=Status.PASS,
                            message=f"Triggers: {list(definition['triggers'].keys())}",
                            file_path=str(json_file)
                        ))
                    else:
                        category.results.append(TestResult(
                            test_id="FLW-006",
                            test_name="triggers defined",
                            category=category.name,
                            priority=Priority.CRITICAL,
                            status=Status.FAIL,
                            message="No triggers defined",
                            file_path=str(json_file)
                        ))

                    # FLW-008: actions defined
                    if "actions" in definition and definition["actions"]:
                        actions = definition["actions"]
                        category.results.append(TestResult(
                            test_id="FLW-008",
                            test_name="actions defined",
                            category=category.name,
                            priority=Priority.CRITICAL,
                            status=Status.PASS,
                            message=f"Actions count: {len(actions)}",
                            file_path=str(json_file)
                        ))

                        # FLW-009: action types valid
                        for action_name, action in actions.items():
                            if "type" not in action:
                                category.results.append(TestResult(
                                    test_id="FLW-009",
                                    test_name="action type defined",
                                    category=category.name,
                                    priority=Priority.HIGH,
                                    status=Status.FAIL,
                                    message=f"Action '{action_name}' missing type",
                                    file_path=str(json_file)
                                ))
                    else:
                        category.results.append(TestResult(
                            test_id="FLW-008",
                            test_name="actions defined",
                            category=category.name,
                            priority=Priority.CRITICAL,
                            status=Status.FAIL,
                            message="No actions defined",
                            file_path=str(json_file)
                        ))

                # FLW-012: connectionReferences defined
                if "connectionReferences" in props:
                    category.results.append(TestResult(
                        test_id="FLW-012",
                        test_name="connectionReferences defined",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.PASS,
                        message="connectionReferences present",
                        file_path=str(json_file)
                    ))

            # FLW-014: no placeholder values
            content = json_file.read_text()
            placeholder_patterns = ['"placeholder"', "'placeholder'", "TODO:", "FIXME:", "XXX:"]
            for pattern in placeholder_patterns:
                if pattern.lower() in content.lower():
                    category.results.append(TestResult(
                        test_id="FLW-014",
                        test_name="no placeholder values",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message=f"Placeholder pattern found: {pattern}",
                        file_path=str(json_file)
                    ))
                    break
            else:
                category.results.append(TestResult(
                    test_id="FLW-014",
                    test_name="no placeholder values",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message="No placeholder values",
                    file_path=str(json_file)
                ))

        except json.JSONDecodeError as e:
            category.results.append(TestResult(
                test_id="FLW-001",
                test_name="JSON well-formed",
                category=category.name,
                priority=Priority.CRITICAL,
                status=Status.FAIL,
                message=f"JSON parse error: {e}",
                file_path=str(json_file)
            ))

# ============================================================================
# CATEGORY 5: AI Builder Prompt Validation Tests
# ============================================================================

def validate_ai_builder_prompts(category: TestCategory) -> None:
    """Validate AI Builder prompt configurations."""

    prompt_files = [
        SOLUTION_DIR / "ai_builder_prompts_all_agents_v7.0.json",
        SOLUTION_DIR / "gha_ai_builder_prompts.json"
    ]

    all_prompts = []

    for prompt_file in prompt_files:
        if not prompt_file.exists():
            continue

        try:
            with open(prompt_file) as f:
                data = json.load(f)

            # PRO-001: JSON well-formed
            category.results.append(TestResult(
                test_id="PRO-001",
                test_name="Prompt JSON well-formed",
                category=category.name,
                priority=Priority.HIGH,
                status=Status.PASS,
                message="Prompt file parses correctly",
                file_path=str(prompt_file)
            ))

            # Handle nested structure: {"prompts": {"AGENT": {"prompts": [...]}}}
            prompts = []
            if isinstance(data, list):
                prompts = data
            elif isinstance(data, dict):
                if "prompts" in data:
                    prompts_data = data["prompts"]
                    if isinstance(prompts_data, list):
                        prompts = prompts_data
                    elif isinstance(prompts_data, dict):
                        # Nested by agent
                        for agent_code, agent_data in prompts_data.items():
                            if isinstance(agent_data, dict) and "prompts" in agent_data:
                                prompts.extend(agent_data["prompts"])
                            elif isinstance(agent_data, list):
                                prompts.extend(agent_data)

            for prompt in prompts:
                if not isinstance(prompt, dict):
                    continue
                # Handle both field naming conventions
                prompt_id = prompt.get("prompt_id") or prompt.get("promptCode") or "unknown"
                all_prompts.append(prompt_id)

                # PRO-003: name present (handle both "name" and "displayName")
                has_name = "name" in prompt or "displayName" in prompt
                if has_name:
                    category.results.append(TestResult(
                        test_id="PRO-003",
                        test_name="Prompt name present",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.PASS,
                        message=f"Prompt '{prompt_id}' has name",
                        file_path=str(prompt_file)
                    ))
                else:
                    category.results.append(TestResult(
                        test_id="PRO-003",
                        test_name="Prompt name present",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message=f"Prompt '{prompt_id}' missing name",
                        file_path=str(prompt_file)
                    ))

                # PRO-004: template present (handle "template", "systemMessage", "userTemplate")
                template = prompt.get("template") or prompt.get("systemMessage") or prompt.get("userTemplate")
                if template:

                    # PRO-010: template length
                    if len(template) > 32000:
                        category.results.append(TestResult(
                            test_id="PRO-010",
                            test_name="Template length valid",
                            category=category.name,
                            priority=Priority.HIGH,
                            status=Status.FAIL,
                            message=f"Template too long: {len(template)} chars (max 32000)",
                            file_path=str(prompt_file)
                        ))

                    # PRO-005: parameters match template
                    params_field = prompt.get("parameters") or prompt.get("inputParameters")
                    if params_field:
                        template_params = set(re.findall(r'\{\{(\w+)\}\}', template))
                        # Handle both list of strings and list of objects with "name" field
                        defined_params = set()
                        for p in params_field:
                            if isinstance(p, str):
                                defined_params.add(p)
                            elif isinstance(p, dict) and "name" in p:
                                defined_params.add(p["name"])

                        missing_in_template = defined_params - template_params
                        missing_in_params = template_params - defined_params

                        if missing_in_params:
                            category.results.append(TestResult(
                                test_id="PRO-005",
                                test_name="Parameters match template",
                                category=category.name,
                                priority=Priority.HIGH,
                                status=Status.WARN,
                                message=f"Template uses undefined params: {missing_in_params}",
                                file_path=str(prompt_file)
                            ))
                else:
                    category.results.append(TestResult(
                        test_id="PRO-004",
                        test_name="Template present",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message=f"Prompt '{prompt_id}' missing template",
                        file_path=str(prompt_file)
                    ))

                # PRO-008: temperature valid
                if "temperature" in prompt:
                    temp = prompt["temperature"]
                    if not (0.0 <= temp <= 2.0):
                        category.results.append(TestResult(
                            test_id="PRO-008",
                            test_name="Temperature valid",
                            category=category.name,
                            priority=Priority.MEDIUM,
                            status=Status.WARN,
                            message=f"Temperature {temp} outside range [0.0, 2.0]",
                            file_path=str(prompt_file)
                        ))

                # PRO-009: max_tokens valid (handle both "max_tokens" and "maxTokens")
                tokens = prompt.get("max_tokens") or prompt.get("maxTokens")
                if tokens:
                    if not (1 <= tokens <= 128000):
                        category.results.append(TestResult(
                            test_id="PRO-009",
                            test_name="max_tokens valid",
                            category=category.name,
                            priority=Priority.MEDIUM,
                            status=Status.WARN,
                            message=f"max_tokens {tokens} outside range [1, 128000]",
                            file_path=str(prompt_file)
                        ))

        except json.JSONDecodeError as e:
            category.results.append(TestResult(
                test_id="PRO-001",
                test_name="Prompt JSON well-formed",
                category=category.name,
                priority=Priority.HIGH,
                status=Status.FAIL,
                message=f"JSON parse error: {e}",
                file_path=str(prompt_file)
            ))

    # PRO-002: prompt_id unique
    if len(all_prompts) != len(set(all_prompts)):
        duplicates = [p for p in all_prompts if all_prompts.count(p) > 1]
        category.results.append(TestResult(
            test_id="PRO-002",
            test_name="prompt_id unique",
            category=category.name,
            priority=Priority.HIGH,
            status=Status.FAIL,
            message=f"Duplicate prompt IDs: {set(duplicates)}",
            file_path="ai_builder_prompts"
        ))
    else:
        category.results.append(TestResult(
            test_id="PRO-002",
            test_name="prompt_id unique",
            category=category.name,
            priority=Priority.HIGH,
            status=Status.PASS,
            message=f"All {len(all_prompts)} prompt IDs are unique",
            file_path="ai_builder_prompts"
        ))

# ============================================================================
# CATEGORY 6: Copilot Studio Topic Validation Tests
# ============================================================================

def validate_copilot_topics(category: TestCategory) -> None:
    """Validate Copilot Studio topic configurations."""

    topic_files = list(SOLUTION_DIR.glob("*topics*.json"))
    topic_files.extend(list(SOLUTION_DIR.glob("topics/*.json")))

    all_topic_ids = []
    all_trigger_phrases = []

    for topic_file in topic_files:
        try:
            with open(topic_file) as f:
                data = json.load(f)

            # TOP-001: JSON well-formed
            category.results.append(TestResult(
                test_id="TOP-001",
                test_name="Topic JSON well-formed",
                category=category.name,
                priority=Priority.HIGH,
                status=Status.PASS,
                message="Topic file parses correctly",
                file_path=str(topic_file)
            ))

            # Handle nested structure: {"topics": {"AGENT": {"topics": [...]}}}
            topics = []
            if isinstance(data, list):
                topics = data
            elif isinstance(data, dict):
                if "topics" in data:
                    topics_data = data["topics"]
                    if isinstance(topics_data, list):
                        topics = topics_data
                    elif isinstance(topics_data, dict):
                        # Nested by agent
                        for agent_code, agent_data in topics_data.items():
                            if isinstance(agent_data, dict) and "topics" in agent_data:
                                topics.extend(agent_data["topics"])
                            elif isinstance(agent_data, list):
                                topics.extend(agent_data)

            for topic in topics:
                if not isinstance(topic, dict):
                    continue
                topic_id = topic.get("topic_id", "unknown")
                all_topic_ids.append(topic_id)

                # TOP-003: name present
                if "name" not in topic:
                    category.results.append(TestResult(
                        test_id="TOP-003",
                        test_name="Topic name present",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message=f"Topic '{topic_id}' missing name",
                        file_path=str(topic_file)
                    ))

                # TOP-004: trigger_phrases present
                if "trigger_phrases" in topic:
                    phrases = topic["trigger_phrases"]
                    if len(phrases) < 3:
                        category.results.append(TestResult(
                            test_id="TOP-004",
                            test_name="Sufficient trigger phrases",
                            category=category.name,
                            priority=Priority.MEDIUM,
                            status=Status.WARN,
                            message=f"Topic '{topic_id}' has only {len(phrases)} trigger phrases (recommend 3+)",
                            file_path=str(topic_file)
                        ))
                    all_trigger_phrases.extend(phrases)

                    # TOP-011: phrase length valid
                    for phrase in phrases:
                        if len(phrase) < 3 or len(phrase) > 256:
                            category.results.append(TestResult(
                                test_id="TOP-011",
                                test_name="Phrase length valid",
                                category=category.name,
                                priority=Priority.MEDIUM,
                                status=Status.WARN,
                                message=f"Phrase '{phrase[:30]}...' length {len(phrase)} outside range [3, 256]",
                                file_path=str(topic_file)
                            ))
                else:
                    category.results.append(TestResult(
                        test_id="TOP-004",
                        test_name="Trigger phrases present",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message=f"Topic '{topic_id}' missing trigger_phrases",
                        file_path=str(topic_file)
                    ))

                # TOP-006: action defined
                if "action" not in topic:
                    category.results.append(TestResult(
                        test_id="TOP-006",
                        test_name="Action defined",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message=f"Topic '{topic_id}' missing action",
                        file_path=str(topic_file)
                    ))

        except json.JSONDecodeError as e:
            category.results.append(TestResult(
                test_id="TOP-001",
                test_name="Topic JSON well-formed",
                category=category.name,
                priority=Priority.HIGH,
                status=Status.FAIL,
                message=f"JSON parse error: {e}",
                file_path=str(topic_file)
            ))

    # TOP-002: topic_id unique
    if len(all_topic_ids) != len(set(all_topic_ids)):
        duplicates = [t for t in all_topic_ids if all_topic_ids.count(t) > 1]
        category.results.append(TestResult(
            test_id="TOP-002",
            test_name="topic_id unique",
            category=category.name,
            priority=Priority.HIGH,
            status=Status.FAIL,
            message=f"Duplicate topic IDs: {set(duplicates)}",
            file_path="topics"
        ))
    elif all_topic_ids:
        category.results.append(TestResult(
            test_id="TOP-002",
            test_name="topic_id unique",
            category=category.name,
            priority=Priority.HIGH,
            status=Status.PASS,
            message=f"All {len(all_topic_ids)} topic IDs are unique",
            file_path="topics"
        ))

    # TOP-005: trigger phrases unique
    phrase_lower = [p.lower() for p in all_trigger_phrases]
    if len(phrase_lower) != len(set(phrase_lower)):
        duplicates = [p for p in phrase_lower if phrase_lower.count(p) > 1]
        category.results.append(TestResult(
            test_id="TOP-005",
            test_name="Trigger phrases unique",
            category=category.name,
            priority=Priority.MEDIUM,
            status=Status.WARN,
            message=f"Duplicate trigger phrases across topics: {len(set(duplicates))} duplicates",
            file_path="topics"
        ))

# ============================================================================
# CATEGORY 7: KB Document Compliance Tests (6-Rule)
# ============================================================================

def validate_kb_documents(category: TestCategory) -> None:
    """Validate KB documents against Copilot Studio 6-rule compliance."""

    kb_files = []
    for agent_dir in AGENTS_ROOT.iterdir():
        if agent_dir.is_dir():
            kb_dir = agent_dir / "kb"
            if kb_dir.exists():
                kb_files.extend(kb_dir.glob("*_v7.0.txt"))
                kb_files.extend(kb_dir.glob("*_v7.0*.txt"))

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

    for kb_file in kb_files:
        try:
            content = kb_file.read_text(encoding='utf-8', errors='replace')
            lines = content.split('\n')

            # KB-001: No emoji
            if emoji_pattern.search(content):
                for i, line in enumerate(lines, 1):
                    if emoji_pattern.search(line):
                        category.results.append(TestResult(
                            test_id="KB-001",
                            test_name="No emoji",
                            category=category.name,
                            priority=Priority.HIGH,
                            status=Status.FAIL,
                            message=f"Emoji found",
                            file_path=str(kb_file),
                            line_number=i
                        ))
                        break
            else:
                category.results.append(TestResult(
                    test_id="KB-001",
                    test_name="No emoji",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message="No emoji found",
                    file_path=str(kb_file)
                ))

            # KB-002: No markdown tables
            table_pattern = re.compile(r'\|.*\|.*\|')
            table_found = False
            for i, line in enumerate(lines, 1):
                if table_pattern.search(line):
                    category.results.append(TestResult(
                        test_id="KB-002",
                        test_name="No markdown tables",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message="Markdown table found",
                        file_path=str(kb_file),
                        line_number=i
                    ))
                    table_found = True
                    break

            if not table_found:
                category.results.append(TestResult(
                    test_id="KB-002",
                    test_name="No markdown tables",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message="No markdown tables",
                    file_path=str(kb_file)
                ))

            # KB-003: No numbered lists
            numbered_pattern = re.compile(r'^[0-9]+\.\s')
            numbered_found = False
            for i, line in enumerate(lines, 1):
                if numbered_pattern.match(line):
                    category.results.append(TestResult(
                        test_id="KB-003",
                        test_name="No numbered lists",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message=f"Numbered list found: {line[:40]}...",
                        file_path=str(kb_file),
                        line_number=i
                    ))
                    numbered_found = True
                    break

            if not numbered_found:
                category.results.append(TestResult(
                    test_id="KB-003",
                    test_name="No numbered lists",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message="No numbered lists",
                    file_path=str(kb_file)
                ))

            # KB-005: Character limit
            char_count = len(content)
            if char_count > 36000:
                category.results.append(TestResult(
                    test_id="KB-005",
                    test_name="Character limit",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.FAIL,
                    message=f"Character count {char_count} exceeds 36,000",
                    file_path=str(kb_file)
                ))
            else:
                category.results.append(TestResult(
                    test_id="KB-005",
                    test_name="Character limit",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message=f"Character count: {char_count}/36,000",
                    file_path=str(kb_file)
                ))

            # KB-006: ALL-CAPS headers
            header_pattern = re.compile(r'^[A-Z][A-Z0-9\s_-]+$')
            has_headers = any(
                header_pattern.match(line.strip()) and len(line.strip()) > 3
                for line in lines if line.strip()
            )
            if has_headers:
                category.results.append(TestResult(
                    test_id="KB-006",
                    test_name="ALL-CAPS headers",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.PASS,
                    message="ALL-CAPS headers found",
                    file_path=str(kb_file)
                ))
            else:
                category.results.append(TestResult(
                    test_id="KB-006",
                    test_name="ALL-CAPS headers",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.WARN,
                    message="No ALL-CAPS headers detected",
                    file_path=str(kb_file)
                ))

        except Exception as e:
            category.results.append(TestResult(
                test_id="KB-001",
                test_name="KB file readable",
                category=category.name,
                priority=Priority.HIGH,
                status=Status.FAIL,
                message=f"Error reading file: {e}",
                file_path=str(kb_file)
            ))

# ============================================================================
# CATEGORY 8: Instruction File Compliance Tests
# ============================================================================

def validate_instruction_files(category: TestCategory) -> None:
    """Validate instruction files meet Copilot Studio requirements."""

    instruction_files = list(AGENTS_ROOT.rglob("*_Instructions_v7.0.txt"))
    instruction_files.extend(list(AGENTS_ROOT.rglob("*_Copilot_Instructions_v7.0.txt")))

    MIN_CHARS = 7500
    MAX_CHARS = 7999

    for inst_file in instruction_files:
        # Skip archived files
        if "archive" in str(inst_file).lower():
            continue

        try:
            content = inst_file.read_text(encoding='utf-8', errors='replace')
            char_count = len(content)

            # INS-001: Character minimum
            if char_count < MIN_CHARS:
                category.results.append(TestResult(
                    test_id="INS-001",
                    test_name="Character minimum",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.FAIL,
                    message=f"Character count {char_count} below minimum {MIN_CHARS}",
                    file_path=str(inst_file),
                    remediation=f"Add {MIN_CHARS - char_count} more characters"
                ))
            # INS-002: Character maximum
            elif char_count > MAX_CHARS:
                category.results.append(TestResult(
                    test_id="INS-002",
                    test_name="Character maximum",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.FAIL,
                    message=f"Character count {char_count} exceeds maximum {MAX_CHARS}",
                    file_path=str(inst_file),
                    remediation=f"Remove {char_count - MAX_CHARS} characters"
                ))
            else:
                category.results.append(TestResult(
                    test_id="INS-001",
                    test_name="Character range valid",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message=f"Character count {char_count} within [{MIN_CHARS}-{MAX_CHARS}]",
                    file_path=str(inst_file)
                ))

            # INS-003: No numbered lists
            lines = content.split('\n')
            numbered_pattern = re.compile(r'^[0-9]+\.\s')
            for i, line in enumerate(lines, 1):
                if numbered_pattern.match(line):
                    category.results.append(TestResult(
                        test_id="INS-003",
                        test_name="No numbered lists",
                        category=category.name,
                        priority=Priority.HIGH,
                        status=Status.FAIL,
                        message=f"Numbered list on line {i}",
                        file_path=str(inst_file),
                        line_number=i
                    ))
                    break
            else:
                category.results.append(TestResult(
                    test_id="INS-003",
                    test_name="No numbered lists",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message="No numbered lists",
                    file_path=str(inst_file)
                ))

        except Exception as e:
            category.results.append(TestResult(
                test_id="INS-001",
                test_name="Instruction file readable",
                category=category.name,
                priority=Priority.HIGH,
                status=Status.FAIL,
                message=f"Error reading file: {e}",
                file_path=str(inst_file)
            ))

# ============================================================================
# CATEGORY 9: Seed Data Schema Alignment Tests
# ============================================================================

def validate_seed_data(category: TestCategory) -> None:
    """Validate seed data against entity schemas."""

    seed_data_dirs = [
        SOLUTION_DIR / "data",
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

                # SED-001: XML well-formed
                category.results.append(TestResult(
                    test_id="SED-001",
                    test_name="Seed data XML parse",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.PASS,
                    message="XML parsed successfully",
                    file_path=str(xml_file)
                ))

                # SED-008: No empty required values
                content = xml_file.read_text()
                empty_value_pattern = re.compile(r'value\s*=\s*["\'][\s]*["\']')
                if empty_value_pattern.search(content):
                    category.results.append(TestResult(
                        test_id="SED-008",
                        test_name="No empty values",
                        category=category.name,
                        priority=Priority.MEDIUM,
                        status=Status.WARN,
                        message="Empty value attribute found",
                        file_path=str(xml_file)
                    ))
                else:
                    category.results.append(TestResult(
                        test_id="SED-008",
                        test_name="No empty values",
                        category=category.name,
                        priority=Priority.MEDIUM,
                        status=Status.PASS,
                        message="No empty value attributes",
                        file_path=str(xml_file)
                    ))

                # SED-009: Field prefix correct
                records = root.findall(".//record")
                for record in records:
                    fields = record.findall("field")
                    for field_elem in fields:
                        field_name = field_elem.get("name", "")
                        if field_name and not field_name.startswith(("eap_", "mpa_", "ca_", "statecode", "statuscode")):
                            category.results.append(TestResult(
                                test_id="SED-009",
                                test_name="Field prefix correct",
                                category=category.name,
                                priority=Priority.MEDIUM,
                                status=Status.WARN,
                                message=f"Field '{field_name}' missing publisher prefix",
                                file_path=str(xml_file)
                            ))
                            break

            except ET.ParseError as e:
                category.results.append(TestResult(
                    test_id="SED-001",
                    test_name="Seed data XML parse",
                    category=category.name,
                    priority=Priority.HIGH,
                    status=Status.FAIL,
                    message=f"XML parse error: {e}",
                    file_path=str(xml_file)
                ))

# ============================================================================
# CATEGORY 14: ZIP Package Integrity Tests
# ============================================================================

def validate_zip_integrity(category: TestCategory) -> None:
    """Validate ZIP package integrity for Power Platform import."""

    if not SOLUTION_ZIP.exists():
        category.results.append(TestResult(
            test_id="ZIP-001",
            test_name="ZIP exists",
            category=category.name,
            priority=Priority.CRITICAL,
            status=Status.FAIL,
            message="Solution ZIP not found",
            file_path=str(SOLUTION_ZIP)
        ))
        return

    try:
        with zipfile.ZipFile(SOLUTION_ZIP, 'r') as zf:
            # ZIP-001: Valid ZIP file
            category.results.append(TestResult(
                test_id="ZIP-001",
                test_name="ZIP file valid",
                category=category.name,
                priority=Priority.CRITICAL,
                status=Status.PASS,
                message="ZIP file opens successfully",
                file_path=str(SOLUTION_ZIP)
            ))

            # ZIP-002: Test all files extractable
            bad_files = zf.testzip()
            if bad_files:
                category.results.append(TestResult(
                    test_id="ZIP-002",
                    test_name="All files extractable",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.FAIL,
                    message=f"Corrupted file: {bad_files}",
                    file_path=str(SOLUTION_ZIP)
                ))
            else:
                category.results.append(TestResult(
                    test_id="ZIP-002",
                    test_name="All files extractable",
                    category=category.name,
                    priority=Priority.CRITICAL,
                    status=Status.PASS,
                    message="All files pass integrity check",
                    file_path=str(SOLUTION_ZIP)
                ))

            # ZIP-003: File count reasonable
            file_count = len(zf.namelist())
            if file_count > 10000:
                category.results.append(TestResult(
                    test_id="ZIP-003",
                    test_name="File count reasonable",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.WARN,
                    message=f"Very large file count: {file_count}",
                    file_path=str(SOLUTION_ZIP)
                ))
            else:
                category.results.append(TestResult(
                    test_id="ZIP-003",
                    test_name="File count reasonable",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.PASS,
                    message=f"File count: {file_count}",
                    file_path=str(SOLUTION_ZIP)
                ))

            # ZIP-004: Total size reasonable
            total_size = sum(info.file_size for info in zf.infolist())
            size_mb = total_size / (1024 * 1024)
            if size_mb > 500:
                category.results.append(TestResult(
                    test_id="ZIP-004",
                    test_name="Total size reasonable",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.WARN,
                    message=f"Large uncompressed size: {size_mb:.1f} MB",
                    file_path=str(SOLUTION_ZIP)
                ))
            else:
                category.results.append(TestResult(
                    test_id="ZIP-004",
                    test_name="Total size reasonable",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.PASS,
                    message=f"Uncompressed size: {size_mb:.1f} MB",
                    file_path=str(SOLUTION_ZIP)
                ))

    except zipfile.BadZipFile as e:
        category.results.append(TestResult(
            test_id="ZIP-001",
            test_name="ZIP file valid",
            category=category.name,
            priority=Priority.CRITICAL,
            status=Status.FAIL,
            message=f"Invalid ZIP: {e}",
            file_path=str(SOLUTION_ZIP)
        ))

# ============================================================================
# CATEGORY 13: YAML-to-JSON Conversion Readiness Tests
# ============================================================================

def validate_yaml_conversion_readiness(category: TestCategory) -> None:
    """Validate YAML flows are ready for Power Automate conversion."""

    yaml_files = list(AGENTS_ROOT.rglob("*.yaml"))
    yaml_files.extend(list(AGENTS_ROOT.rglob("*.yml")))

    for yaml_file in yaml_files:
        try:
            with open(yaml_file) as f:
                data = yaml.safe_load(f)

            if data is None:
                category.results.append(TestResult(
                    test_id="YML-001",
                    test_name="YAML not empty",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.FAIL,
                    message="YAML file is empty",
                    file_path=str(yaml_file)
                ))
                continue

            # YML-001: YAML parse
            category.results.append(TestResult(
                test_id="YML-001",
                test_name="YAML parse",
                category=category.name,
                priority=Priority.MEDIUM,
                status=Status.PASS,
                message="YAML parsed successfully",
                file_path=str(yaml_file)
            ))

            # YML-002: Flow name present
            if "name" in data:
                category.results.append(TestResult(
                    test_id="YML-002",
                    test_name="Flow name",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.PASS,
                    message=f"Flow: {data['name']}",
                    file_path=str(yaml_file)
                ))
            else:
                category.results.append(TestResult(
                    test_id="YML-002",
                    test_name="Flow name",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.WARN,
                    message="Missing flow name",
                    file_path=str(yaml_file)
                ))

            # YML-003: Trigger present
            if "trigger" in data:
                category.results.append(TestResult(
                    test_id="YML-003",
                    test_name="Flow trigger",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.PASS,
                    message=f"Trigger type: {data['trigger'].get('type', 'defined')}",
                    file_path=str(yaml_file)
                ))

            # YML-004: Steps present
            if "steps" in data:
                category.results.append(TestResult(
                    test_id="YML-004",
                    test_name="Flow steps",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.PASS,
                    message=f"Steps: {len(data['steps'])}",
                    file_path=str(yaml_file)
                ))

            # YML-005: No placeholder values
            content = yaml_file.read_text()
            placeholders = ['"placeholder"', "'placeholder'", "TODO:", "FIXME:"]
            for p in placeholders:
                if p.lower() in content.lower():
                    category.results.append(TestResult(
                        test_id="YML-005",
                        test_name="No placeholders",
                        category=category.name,
                        priority=Priority.MEDIUM,
                        status=Status.FAIL,
                        message=f"Placeholder found: {p}",
                        file_path=str(yaml_file)
                    ))
                    break
            else:
                category.results.append(TestResult(
                    test_id="YML-005",
                    test_name="No placeholders",
                    category=category.name,
                    priority=Priority.MEDIUM,
                    status=Status.PASS,
                    message="No placeholder values",
                    file_path=str(yaml_file)
                ))

        except yaml.YAMLError as e:
            category.results.append(TestResult(
                test_id="YML-001",
                test_name="YAML parse",
                category=category.name,
                priority=Priority.MEDIUM,
                status=Status.FAIL,
                message=f"YAML parse error: {e}",
                file_path=str(yaml_file)
            ))

# ============================================================================
# REPORT GENERATION
# ============================================================================

def generate_report(categories: List[TestCategory]) -> str:
    """Generate comprehensive validation report."""

    report = []
    report.append("=" * 80)
    report.append("KDAP v7.0 POWER PLATFORM IMPORT VALIDATION REPORT")
    report.append(f"Generated: {datetime.now().isoformat()}")
    report.append("=" * 80)
    report.append("")

    # Summary
    total_passed = sum(c.passed for c in categories)
    total_failed = sum(c.failed for c in categories)
    total_warnings = sum(c.warnings for c in categories)
    total_skipped = sum(c.skipped for c in categories)
    total_tests = total_passed + total_failed + total_warnings + total_skipped

    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 40)
    report.append(f"Total Tests:    {total_tests}")
    report.append(f"Passed:         {total_passed} ({100*total_passed//max(total_tests,1)}%)")
    report.append(f"Failed:         {total_failed}")
    report.append(f"Warnings:       {total_warnings}")
    report.append(f"Skipped:        {total_skipped}")
    report.append("")

    if total_failed == 0:
        report.append("✓ STATUS: ALL CRITICAL TESTS PASSED")
        report.append("  Solution is ready for Power Platform import")
    else:
        report.append("✗ STATUS: FAILURES DETECTED")
        report.append("  Solution requires fixes before import")
    report.append("")

    # Category breakdown
    report.append("RESULTS BY CATEGORY")
    report.append("-" * 40)

    for cat in categories:
        total = cat.passed + cat.failed + cat.warnings + cat.skipped
        status = "✓" if cat.failed == 0 else "✗"
        report.append(f"\n{status} {cat.name} [{cat.priority.value}]")
        report.append(f"  Target: {cat.target}")
        report.append(f"  PASS: {cat.passed}/{total}  FAIL: {cat.failed}  WARN: {cat.warnings}")

    # Failures detail
    all_failures = []
    for cat in categories:
        all_failures.extend([r for r in cat.results if r.status == Status.FAIL])

    if all_failures:
        report.append("")
        report.append("=" * 80)
        report.append("FAILURES (MUST FIX BEFORE IMPORT)")
        report.append("=" * 80)

        for f in all_failures:
            report.append(f"\n[{f.test_id}] {f.test_name}")
            report.append(f"  Category: {f.category} ({f.priority.value})")
            if f.file_path:
                short_path = f.file_path.replace(str(V7_ROOT), "v7.0")
                report.append(f"  File: {short_path}")
            if f.line_number:
                report.append(f"  Line: {f.line_number}")
            report.append(f"  Message: {f.message}")
            if f.remediation:
                report.append(f"  Fix: {f.remediation}")

    # Warnings
    all_warnings = []
    for cat in categories:
        all_warnings.extend([r for r in cat.results if r.status == Status.WARN])

    if all_warnings:
        report.append("")
        report.append("=" * 80)
        report.append("WARNINGS (REVIEW RECOMMENDED)")
        report.append("=" * 80)

        for w in all_warnings[:30]:  # Limit output
            report.append(f"\n[{w.test_id}] {w.test_name}")
            if w.file_path:
                short_path = w.file_path.replace(str(V7_ROOT), "v7.0")
                report.append(f"  File: {short_path}")
            report.append(f"  Message: {w.message}")

        if len(all_warnings) > 30:
            report.append(f"\n... and {len(all_warnings) - 30} more warnings")

    report.append("")
    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)

    return "\n".join(report)

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Run all Power Platform validation tests."""

    print("KDAP v7.0 Power Platform Import Validation Suite")
    print("=" * 60)
    print(f"Solution: {SOLUTION_DIR}")
    print(f"ZIP: {SOLUTION_ZIP}")
    print()

    categories = []

    # Category 1: Solution Package Structure
    print("Running Category 1: Solution Package Structure...")
    cat1 = TestCategory("Solution Package Structure", Priority.CRITICAL, "Power Platform Import")
    validate_solution_package_structure(cat1)
    categories.append(cat1)
    print(f"  PASS: {cat1.passed}  FAIL: {cat1.failed}  WARN: {cat1.warnings}")

    # Category 2: XML Schema Validation
    print("Running Category 2: XML Schema Validation...")
    cat2 = TestCategory("XML Schema Validation", Priority.CRITICAL, "Dataverse Entity Import")
    validate_entity_xml_schema(cat2)
    categories.append(cat2)
    print(f"  PASS: {cat2.passed}  FAIL: {cat2.failed}  WARN: {cat2.warnings}")

    # Category 3: Entity Relationship Integrity
    print("Running Category 3: Entity Relationship Integrity...")
    cat3 = TestCategory("Entity Relationship Integrity", Priority.CRITICAL, "Dataverse Relationships")
    validate_entity_relationships(cat3)
    categories.append(cat3)
    print(f"  PASS: {cat3.passed}  FAIL: {cat3.failed}  WARN: {cat3.warnings}")

    # Category 4: Power Automate Flow Validation
    print("Running Category 4: Power Automate Flow Validation...")
    cat4 = TestCategory("Power Automate Flow Validation", Priority.CRITICAL, "Flow Deployment")
    validate_power_automate_flows(cat4)
    categories.append(cat4)
    print(f"  PASS: {cat4.passed}  FAIL: {cat4.failed}  WARN: {cat4.warnings}")

    # Category 5: AI Builder Prompt Validation
    print("Running Category 5: AI Builder Prompt Validation...")
    cat5 = TestCategory("AI Builder Prompt Validation", Priority.HIGH, "Copilot Studio Prompts")
    validate_ai_builder_prompts(cat5)
    categories.append(cat5)
    print(f"  PASS: {cat5.passed}  FAIL: {cat5.failed}  WARN: {cat5.warnings}")

    # Category 6: Copilot Studio Topic Validation
    print("Running Category 6: Copilot Studio Topic Validation...")
    cat6 = TestCategory("Copilot Studio Topic Validation", Priority.HIGH, "Topic Import")
    validate_copilot_topics(cat6)
    categories.append(cat6)
    print(f"  PASS: {cat6.passed}  FAIL: {cat6.failed}  WARN: {cat6.warnings}")

    # Category 7: KB Document Compliance
    print("Running Category 7: KB Document Compliance...")
    cat7 = TestCategory("KB Document Compliance", Priority.HIGH, "Knowledge Base")
    validate_kb_documents(cat7)
    categories.append(cat7)
    print(f"  PASS: {cat7.passed}  FAIL: {cat7.failed}  WARN: {cat7.warnings}")

    # Category 8: Instruction File Compliance
    print("Running Category 8: Instruction File Compliance...")
    cat8 = TestCategory("Instruction File Compliance", Priority.HIGH, "Agent Instructions")
    validate_instruction_files(cat8)
    categories.append(cat8)
    print(f"  PASS: {cat8.passed}  FAIL: {cat8.failed}  WARN: {cat8.warnings}")

    # Category 9: Seed Data Schema Alignment
    print("Running Category 9: Seed Data Schema Alignment...")
    cat9 = TestCategory("Seed Data Schema Alignment", Priority.HIGH, "Data Import")
    validate_seed_data(cat9)
    categories.append(cat9)
    print(f"  PASS: {cat9.passed}  FAIL: {cat9.failed}  WARN: {cat9.warnings}")

    # Category 13: YAML-to-JSON Conversion Readiness
    print("Running Category 13: YAML-to-JSON Conversion Readiness...")
    cat13 = TestCategory("YAML-to-JSON Conversion", Priority.MEDIUM, "Flow Conversion")
    validate_yaml_conversion_readiness(cat13)
    categories.append(cat13)
    print(f"  PASS: {cat13.passed}  FAIL: {cat13.failed}  WARN: {cat13.warnings}")

    # Category 14: ZIP Package Integrity
    print("Running Category 14: ZIP Package Integrity...")
    cat14 = TestCategory("ZIP Package Integrity", Priority.CRITICAL, "Import Readiness")
    validate_zip_integrity(cat14)
    categories.append(cat14)
    print(f"  PASS: {cat14.passed}  FAIL: {cat14.failed}  WARN: {cat14.warnings}")

    # Generate and save report
    print()
    print("Generating comprehensive report...")
    report = generate_report(categories)

    # Save report
    reports_dir = V7_ROOT / "tests" / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    report_file = reports_dir / f"power_platform_validation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    report_file.write_text(report)

    # Also save as latest
    latest_file = reports_dir / "power_platform_validation_latest.txt"
    latest_file.write_text(report)

    print(f"Report saved to: {report_file}")
    print(f"Latest report: {latest_file}")
    print()

    # Print report
    print(report)

    # Return exit code
    total_failed = sum(c.failed for c in categories)
    return 1 if total_failed > 0 else 0

if __name__ == "__main__":
    sys.exit(main())
