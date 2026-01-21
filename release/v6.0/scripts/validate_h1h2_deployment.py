#!/usr/bin/env python3
"""
MPA v6.1 H1+H2 Deployment Validation Script

Validates that all H1+H2 components have been deployed correctly:
- 6 Dataverse tables with correct schemas
- Seed data loaded (20 triggers, 10 workflows)
- KB files uploaded to SharePoint
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests

# Add auth module to path
sys.path.insert(0, str(Path(__file__).parent / "auth"))

try:
    from msal_auth import MSALAuthenticator, AuthenticationError
    MSAL_AVAILABLE = True
except ImportError:
    MSAL_AVAILABLE = False
    print("Warning: MSAL auth module not available.")

# Configuration
TENANT_ID = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"
CLIENT_ID = "f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8"
ENVIRONMENT_URL = "https://aragornai.crm.dynamics.com"
API_URL = f"{ENVIRONMENT_URL}/api/data/v9.2"
SHAREPOINT_HOST = "kesseldigitalcom.sharepoint.com"
SITE_PATH = "/sites/AragornAI2"
GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"

# Expected H1+H2 tables
EXPECTED_TABLES = {
    "mpa_user_preferences": {
        "display_name": "User Preferences",
        "min_columns": 15,
        "key_columns": ["mpa_user_id", "mpa_user_email", "mpa_default_vertical", "mpa_created_at"]
    },
    "mpa_session_memory": {
        "display_name": "Session Memory",
        "min_columns": 13,
        "key_columns": ["mpa_session_id", "mpa_user_id", "mpa_memory_type", "mpa_memory_key"]
    },
    "eap_proactive_trigger": {
        "display_name": "Proactive Trigger",
        "min_columns": 12,
        "key_columns": ["eap_trigger_code", "eap_trigger_name", "eap_agent_code", "eap_condition_json"]
    },
    "eap_workflow_definition": {
        "display_name": "Workflow Definition",
        "min_columns": 9,
        "key_columns": ["eap_workflow_code", "eap_workflow_name", "eap_agent_sequence_json"]
    },
    "eap_workflow_contribution": {
        "display_name": "Workflow Contribution",
        "min_columns": 10,
        "key_columns": ["eap_workflow_instance_id", "eap_session_id", "eap_agent_code"]
    },
    "eap_trigger_history": {
        "display_name": "Trigger History",
        "min_columns": 6,
        "key_columns": ["eap_trigger_code", "eap_session_id", "eap_fired_at"]
    }
}

# Expected seed data counts
EXPECTED_SEED_DATA = {
    "eap_proactive_triggers": 20,
    "eap_workflow_definitions": 10
}

# Expected KB files
EXPECTED_KB_FILES = [
    "MPAKnowledgeBase/EAP/EAP_KB_Memory_System_v1.txt",
    "MPAKnowledgeBase/EAP/EAP_KB_Proactive_Intelligence_v1.txt",
    "MPAKnowledgeBase/EAP/EAP_KB_Consensus_Protocol_v1.txt",
    "MPAKnowledgeBase/Agents/ORC/ORC_KB_Session_Management_v1.txt",
    "MPAKnowledgeBase/Agents/ORC/ORC_KB_Collaborative_Orchestration_v1.txt",
    "MPAKnowledgeBase/Agents/DOC/DOC_KB_File_Processing_v1.txt"
]


class ValidationResult:
    """Holds validation results for a component."""

    def __init__(self, component: str):
        self.component = component
        self.passed = True
        self.messages: List[str] = []
        self.warnings: List[str] = []

    def fail(self, message: str):
        self.passed = False
        self.messages.append(f"FAIL: {message}")

    def warn(self, message: str):
        self.warnings.append(f"WARN: {message}")

    def success(self, message: str):
        self.messages.append(f"OK: {message}")


def get_dataverse_token() -> Optional[str]:
    """Get access token for Dataverse API."""
    if not MSAL_AVAILABLE:
        return None

    auth = MSALAuthenticator(TENANT_ID, CLIENT_ID)
    accounts = auth._app.get_accounts()

    if accounts:
        scope = f"{ENVIRONMENT_URL}/.default"
        result = auth._app.acquire_token_silent([scope], account=accounts[0])
        if result and "access_token" in result:
            return result["access_token"]

    try:
        token = auth.get_dataverse_token(ENVIRONMENT_URL)
        return token
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        return None


def get_graph_token() -> Optional[str]:
    """Get access token for Microsoft Graph API."""
    if not MSAL_AVAILABLE:
        return None

    auth = MSALAuthenticator(TENANT_ID, CLIENT_ID)
    accounts = auth._app.get_accounts()

    if accounts:
        scope = "https://graph.microsoft.com/.default"
        result = auth._app.acquire_token_silent([scope], account=accounts[0])
        if result and "access_token" in result:
            return result["access_token"]

    try:
        token = auth.get_graph_token()
        return token
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        return None


def validate_table_exists(token: str, table_name: str, expected: dict) -> ValidationResult:
    """Validate that a Dataverse table exists with expected schema."""
    result = ValidationResult(f"Table: {table_name}")

    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json"
    }

    # Get table metadata
    url = f"{API_URL}/EntityDefinitions(LogicalName='{table_name}')?$expand=Attributes"
    response = requests.get(url, headers=headers)

    if response.status_code == 404:
        result.fail(f"Table '{table_name}' not found")
        return result

    if response.status_code != 200:
        result.fail(f"Error checking table: {response.status_code}")
        return result

    table_data = response.json()
    attributes = table_data.get("Attributes", [])
    attribute_names = [attr.get("LogicalName", "") for attr in attributes]

    # Check minimum column count
    if len(attributes) >= expected["min_columns"]:
        result.success(f"Column count: {len(attributes)} (min: {expected['min_columns']})")
    else:
        result.fail(f"Column count: {len(attributes)} (expected min: {expected['min_columns']})")

    # Check for key columns
    for col in expected["key_columns"]:
        if col in attribute_names:
            result.success(f"Column '{col}' exists")
        else:
            result.fail(f"Column '{col}' not found")

    return result


def validate_seed_data(token: str, table_name: str, expected_count: int) -> ValidationResult:
    """Validate that seed data has been loaded."""
    result = ValidationResult(f"Seed Data: {table_name}")

    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Prefer": "odata.include-annotations=*"
    }

    url = f"{API_URL}/{table_name}?$count=true&$top=1"
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        result.fail(f"Error querying table: {response.status_code}")
        return result

    data = response.json()
    count = data.get("@odata.count", len(data.get("value", [])))

    if count >= expected_count:
        result.success(f"Record count: {count} (expected: {expected_count})")
    else:
        result.fail(f"Record count: {count} (expected: {expected_count})")

    return result


def validate_kb_file_exists(token: str, file_path: str) -> Tuple[bool, str]:
    """Check if a KB file exists in SharePoint."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Get site ID
    site_url = f"{GRAPH_BASE_URL}/sites/{SHAREPOINT_HOST}:{SITE_PATH}"
    site_response = requests.get(site_url, headers=headers)

    if site_response.status_code != 200:
        return False, "Could not access SharePoint site"

    site_id = site_response.json().get("id")

    # Get drive
    drive_url = f"{GRAPH_BASE_URL}/sites/{site_id}/drive"
    drive_response = requests.get(drive_url, headers=headers)

    if drive_response.status_code != 200:
        return False, "Could not access document library"

    drive_id = drive_response.json().get("id")

    # Check file
    file_url = f"{GRAPH_BASE_URL}/drives/{drive_id}/root:/{file_path}"
    file_response = requests.get(file_url, headers=headers)

    if file_response.status_code == 200:
        return True, "File exists"
    elif file_response.status_code == 404:
        return False, "File not found"
    else:
        return False, f"Error: {file_response.status_code}"


def validate_kb_files(token: str) -> ValidationResult:
    """Validate that all KB files have been uploaded to SharePoint."""
    result = ValidationResult("SharePoint KB Files")

    for file_path in EXPECTED_KB_FILES:
        exists, message = validate_kb_file_exists(token, file_path)
        if exists:
            result.success(f"{file_path}: {message}")
        else:
            result.fail(f"{file_path}: {message}")

    return result


def main():
    """Run all validation tests."""
    print("=" * 70)
    print("MPA v6.1 H1+H2 DEPLOYMENT VALIDATION")
    print("=" * 70)

    all_results: List[ValidationResult] = []

    # Get Dataverse token
    print("\n1. Authenticating with Dataverse...")
    dv_token = get_dataverse_token()

    if not dv_token:
        print("ERROR: Could not authenticate with Dataverse")
        print("Run validation manually or check authentication configuration")
        return 1

    print("   Authentication successful!")

    # Validate tables
    print("\n2. Validating Dataverse Tables...")
    print("-" * 50)

    for table_name, expected in EXPECTED_TABLES.items():
        result = validate_table_exists(dv_token, table_name, expected)
        all_results.append(result)
        status = "PASS" if result.passed else "FAIL"
        print(f"\n   {table_name}: {status}")
        for msg in result.messages:
            print(f"     {msg}")
        for warn in result.warnings:
            print(f"     {warn}")

    # Validate seed data
    print("\n3. Validating Seed Data...")
    print("-" * 50)

    for table_name, expected_count in EXPECTED_SEED_DATA.items():
        result = validate_seed_data(dv_token, table_name, expected_count)
        all_results.append(result)
        status = "PASS" if result.passed else "FAIL"
        print(f"\n   {table_name}: {status}")
        for msg in result.messages:
            print(f"     {msg}")

    # Get Graph token for SharePoint validation
    print("\n4. Authenticating with Microsoft Graph...")
    graph_token = get_graph_token()

    if not graph_token:
        print("   WARNING: Could not authenticate with Graph API")
        print("   Skipping SharePoint validation")
    else:
        print("   Authentication successful!")

        # Validate KB files
        print("\n5. Validating SharePoint KB Files...")
        print("-" * 50)

        result = validate_kb_files(graph_token)
        all_results.append(result)
        status = "PASS" if result.passed else "FAIL"
        print(f"\n   KB Files: {status}")
        for msg in result.messages:
            print(f"     {msg}")

    # Summary
    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)

    passed = sum(1 for r in all_results if r.passed)
    failed = sum(1 for r in all_results if not r.passed)
    total = len(all_results)

    print(f"\n   Passed: {passed}/{total}")
    print(f"   Failed: {failed}/{total}")

    if failed == 0:
        print("\n   ALL VALIDATIONS PASSED!")
        print("\n   H1+H2 deployment is complete. Next steps:")
        print("   1. Deploy AI Builder prompts manually (see deploy_ai_builder_prompts_manual.md)")
        print("   2. Create Power Automate flows manually (see deploy_power_automate_flows_manual.md)")
        print("   3. Update ORC agent instructions in Copilot Studio")
        print("   4. Create new topics in Copilot Studio (see H1H2_Topics_Manual.md)")
        print("   5. Run end-to-end tests")
        return 0
    else:
        print("\n   SOME VALIDATIONS FAILED!")
        print("\n   Review the failures above and address them before proceeding.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
