#!/usr/bin/env python3
"""
import_mpa_tests.py
Imports test cases from JSON file into Copilot Studio Kit via Dataverse Web API
and optionally creates a Test Run to execute them.

Prerequisites:
    pip install msal requests

Usage:
    python import_mpa_tests.py --env https://yourorg.crm.dynamics.com
    python import_mpa_tests.py --env https://yourorg.crm.dynamics.com --file custom_tests.json
    python import_mpa_tests.py --env https://yourorg.crm.dynamics.com --dry-run
    python import_mpa_tests.py --env https://yourorg.crm.dynamics.com --run --agent "craboratory_mPA52"
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    import msal
    import requests
except ImportError:
    print("Missing required packages. Install with:")
    print("  pip install msal requests")
    sys.exit(1)


# Dataverse option set values for test types (1,2,3,4,5,6 per API validation)
TEST_TYPE_VALUES = {
    "Response Match": 1,
    "Attachments Match": 2,
    "Topic Match": 3,
    "Generative Answers": 4,
    "Multi-turn": 5,
    "Plan Validation": 6,
}

# Azure AD app registration for Dataverse
CLIENT_ID = "51f81489-12ee-4a9e-aaae-a2591f45987d"  # Microsoft Power Platform CLI
AUTHORITY = "https://login.microsoftonline.com/common"


class DataverseClient:
    def __init__(self, environment_url: str, dry_run: bool = False):
        self.environment_url = environment_url.rstrip("/")
        self.dry_run = dry_run
        self.token = None
        self.headers = {
            "Content-Type": "application/json; charset=utf-8",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Prefer": "return=representation",
        }
    
    def authenticate(self):
        """Authenticate using device code flow with persistent token cache"""
        # Set up persistent token cache
        cache_file = Path(__file__).parent / ".msal_cache.json"
        cache = msal.SerializableTokenCache()

        if cache_file.exists():
            cache.deserialize(cache_file.read_text())

        app = msal.PublicClientApplication(CLIENT_ID, authority=AUTHORITY, token_cache=cache)

        # Try to get token from cache first
        accounts = app.get_accounts()
        if accounts:
            result = app.acquire_token_silent([f"{self.environment_url}/.default"], account=accounts[0])
            if result and "access_token" in result:
                self.token = result["access_token"]
                print(f"✓ Using cached token for {accounts[0]['username']}")
                # Save cache
                if cache.has_state_changed:
                    cache_file.write_text(cache.serialize())
                return

        # Interactive device code flow
        flow = app.initiate_device_flow(scopes=[f"{self.environment_url}/.default"])
        if "user_code" not in flow:
            raise Exception(f"Failed to create device flow: {flow.get('error_description', 'Unknown error')}")

        print(flow["message"])
        result = app.acquire_token_by_device_flow(flow)

        if "access_token" in result:
            self.token = result["access_token"]
            print(f"✓ Authenticated successfully")
            # Save cache
            if cache.has_state_changed:
                cache_file.write_text(cache.serialize())
        else:
            raise Exception(f"Authentication failed: {result.get('error_description', 'Unknown error')}")
    
    def _request(self, method: str, endpoint: str, body: dict = None, skip_dry_run: bool = False) -> dict:
        """Make a request to the Dataverse API"""
        if self.dry_run and not skip_dry_run and method != "GET":
            print(f"  [DRY RUN] {method} {endpoint}")
            return {"cat_copilottestsetid": "00000000-0000-0000-0000-000000000000",
                    "cat_copilottestid": "00000000-0000-0000-0000-000000000000"}
        
        url = f"{self.environment_url}/api/data/v9.2/{endpoint}"
        headers = {**self.headers, "Authorization": f"Bearer {self.token}"}
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=body if body else None,
        )
        
        if response.status_code >= 400:
            raise Exception(f"API Error {response.status_code}: {response.text}")
        
        if response.status_code == 204:  # No content (DELETE)
            return {}
        
        return response.json() if response.text else {}
    
    def find_test_set(self, name: str) -> dict:
        """Find existing test set by name"""
        from urllib.parse import quote
        filter_query = quote(f"cat_name eq '{name}'")
        endpoint = f"cat_copilottestsets?$filter={filter_query}&$select=cat_copilottestsetid,cat_name"
        
        try:
            result = self._request("GET", endpoint)
            if result.get("value") and len(result["value"]) > 0:
                return result["value"][0]
        except:
            pass
        return None
    
    def create_test_set(self, name: str, description: str = None) -> str:
        """Create a new test set"""
        body = {"cat_name": name}
        # Note: cat_description field doesn't exist in this version of the Kit
        
        result = self._request("POST", "cat_copilottestsets", body)
        return result.get("cat_copilottestsetid")
    
    def delete_test_set(self, test_set_id: str):
        """Delete a test set"""
        self._request("DELETE", f"cat_copilottestsets({test_set_id})")
    
    def create_test_case(self, test_set_id: str, test_case: dict, order: int) -> str:
        """Create a test case in a test set"""
        test_type = test_case.get("testType", "Generative Answers")
        test_type_value = TEST_TYPE_VALUES.get(test_type, TEST_TYPE_VALUES["Generative Answers"])

        body = {
            "cat_name": f"{test_case['id']} {test_case['name']}",
            "cat_testtypecode": test_type_value,
            "cat_testutterance": test_case["utterance"],
            "cat_expectedresponse": test_case["expectedBehavior"],
            "cat_order": order,
            # Lookup binding uses lowercase logical name
            "cat_copilottestsetid@odata.bind": f"/cat_copilottestsets({test_set_id})",
        }

        result = self._request("POST", "cat_copilottests", body)
        return result.get("cat_copilottestid")

    def list_entity_fields(self, entity_name: str) -> list:
        """List all fields for an entity (for schema discovery)"""
        endpoint = f"EntityDefinitions(LogicalName='{entity_name}')/Attributes?$select=LogicalName,AttributeType,DisplayName"
        try:
            result = self._request("GET", endpoint)
            return result.get("value", [])
        except Exception as e:
            print(f"  Could not query schema for {entity_name}: {e}")
            return []

    def list_entities(self, prefix: str = "cat_copilot") -> list:
        """List all entities matching a prefix"""
        endpoint = f"EntityDefinitions?$select=LogicalName,DisplayName&$filter=startswith(LogicalName,'{prefix}')"
        try:
            result = self._request("GET", endpoint)
            return result.get("value", [])
        except Exception as e:
            print(f"  Could not list entities: {e}")
            return []

    def get_entity_relationships(self, entity_name: str) -> list:
        """Get relationships for an entity"""
        endpoint = f"EntityDefinitions(LogicalName='{entity_name}')/ManyToOneRelationships?$select=ReferencingAttribute,ReferencedEntity,SchemaName"
        try:
            result = self._request("GET", endpoint)
            return result.get("value", [])
        except Exception as e:
            print(f"  Could not query relationships: {e}")
            return []

    def get_one_to_many_relationships(self, entity_name: str) -> list:
        """Get one-to-many relationships for an entity"""
        endpoint = f"EntityDefinitions(LogicalName='{entity_name}')/OneToManyRelationships?$select=ReferencingEntity,ReferencingAttribute,SchemaName,ReferencedEntityNavigationPropertyName"
        try:
            result = self._request("GET", endpoint)
            return result.get("value", [])
        except Exception as e:
            print(f"  Could not query one-to-many relationships: {e}")
            return []

    def find_agent_configuration(self, agent_identifier: str) -> dict:
        """Find existing agent configuration by agent identifier"""
        from urllib.parse import quote
        filter_query = quote(f"cat_agentidentifier eq '{agent_identifier}'")
        endpoint = f"cat_copilotconfigurations?$filter={filter_query}"

        try:
            result = self._request("GET", endpoint)
            if result.get("value") and len(result["value"]) > 0:
                return result["value"][0]
        except:
            pass
        return None

    def create_agent_configuration(self, agent_identifier: str, display_name: str = None) -> str:
        """Create a new agent configuration"""
        body = {
            "cat_name": display_name or agent_identifier,
            "cat_agentidentifier": agent_identifier,
            "cat_isgeneratedanswersanalysisenabled": True,  # Enable AI analysis for Generative Answers tests
        }

        result = self._request("POST", "cat_copilotconfigurations", body)
        return result.get("cat_copilotconfigurationid")

    def find_test_run(self, name: str) -> dict:
        """Find existing test run by name"""
        from urllib.parse import quote
        filter_query = quote(f"cat_name eq '{name}'")
        endpoint = f"cat_copilottestruns?$filter={filter_query}"

        try:
            result = self._request("GET", endpoint)
            if result.get("value") and len(result["value"]) > 0:
                return result["value"][0]
        except:
            pass
        return None

    def create_test_run(self, name: str, test_set_id: str, agent_config_id: str) -> str:
        """Create a new test run"""
        body = {
            "cat_name": name,
            "cat_copilottestsetid@odata.bind": f"/cat_copilottestsets({test_set_id})",
            "cat_copilotconfigurationid@odata.bind": f"/cat_copilotconfigurations({agent_config_id})",
        }

        result = self._request("POST", "cat_copilottestruns", body)
        return result.get("cat_copilottestrunid")

    def delete_test_run(self, test_run_id: str):
        """Delete a test run"""
        self._request("DELETE", f"cat_copilottestruns({test_run_id})")

    def start_test_run(self, test_run_id: str):
        """Start a test run by setting status to Pending"""
        # Status codes: 1=Not Run, 2=Running, 3=Complete, 4=Not Available, 5=Pending, 6=Error
        body = {"cat_runstatuscode": 5}  # Pending triggers the Kit's execution flow
        self._request("PATCH", f"cat_copilottestruns({test_run_id})", body)


def log(message: str, level: str = "info"):
    """Print a timestamped log message"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    colors = {
        "info": "\033[36m",     # Cyan
        "success": "\033[32m",  # Green
        "warning": "\033[33m",  # Yellow
        "error": "\033[31m",    # Red
    }
    reset = "\033[0m"
    color = colors.get(level, "")
    print(f"{color}[{timestamp}] {message}{reset}")


def main():
    parser = argparse.ArgumentParser(description="Import MPA test cases into Copilot Studio Kit")
    parser.add_argument("--env", "-e", required=True, help="Dataverse environment URL (e.g., https://yourorg.crm.dynamics.com)")
    parser.add_argument("--file", "-f", default="mpa_test_cases.json", help="Test definition JSON file")
    parser.add_argument("--force", action="store_true", help="Replace existing test set if found")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")
    parser.add_argument("--run", action="store_true", help="Create a Test Run after importing test cases")
    parser.add_argument("--start", action="store_true", help="Start the Test Run after creating it (requires --run)")
    parser.add_argument("--agent", "-a", help="Agent identifier for Test Run (required with --run)")
    parser.add_argument("--discover", action="store_true", help="Discover schema for test run entities")

    args = parser.parse_args()

    if args.run and not args.agent:
        parser.error("--agent is required when using --run")
    
    print()
    print("=" * 50)
    print("  MPA Test Suite Import Script (Python)")
    print("=" * 50)
    print()
    
    # Resolve test file path
    script_dir = Path(__file__).parent
    test_file = Path(args.file)
    if not test_file.is_absolute():
        test_file = script_dir / test_file
    
    if not test_file.exists():
        log(f"Test file not found: {test_file}", "error")
        sys.exit(1)
    
    log(f"Environment: {args.env}")
    log(f"Test File: {test_file}")
    if args.dry_run:
        log("DRY RUN MODE - No changes will be made", "warning")
    print()
    
    # Load test definitions
    log("Loading test definitions...")
    with open(test_file, "r") as f:
        test_data = json.load(f)
    
    log(f"Test Set: {test_data['testSetName']}")
    log(f"Test Cases: {len(test_data['testCases'])}")
    print()
    
    # Initialize client
    client = DataverseClient(args.env, dry_run=args.dry_run)
    
    # Authenticate
    log("Authenticating to Dataverse...")
    client.authenticate()
    print()
    
    # Check for existing test set
    log(f"Checking for existing test set '{test_data['testSetName']}'...")
    existing = client.find_test_set(test_data["testSetName"])
    
    if existing and not args.dry_run:
        log(f"Found existing test set: {existing['cat_copilottestsetid']}", "warning")
        
        if args.force:
            log("Deleting existing test set (--force mode)...", "warning")
            client.delete_test_set(existing["cat_copilottestsetid"])
            log("Deleted", "success")
        else:
            log("Test set already exists. Use --force to replace it.", "error")
            sys.exit(1)
    
    # Create test set
    log(f"Creating test set: {test_data['testSetName']}")
    test_set_id = client.create_test_set(
        test_data["testSetName"],
        test_data.get("description")
    )
    log(f"Created with ID: {test_set_id}", "success")
    print()
    
    # Create test cases
    log(f"Creating {len(test_data['testCases'])} test cases...")
    created = 0
    
    for i, test_case in enumerate(test_data["testCases"], 1):
        print(f"  [{i}/{len(test_data['testCases'])}] {test_case['id']} {test_case['name']}...", end="")
        try:
            test_id = client.create_test_case(test_set_id, test_case, i)
            print(" \033[32mCreated\033[0m")
            created += 1
        except Exception as e:
            print(f" \033[31mFAILED: {e}\033[0m")
    
    print()
    log(f"Test Set ID: {test_set_id}", "success")
    log(f"Test Cases Created: {created} / {len(test_data['testCases'])}", "success")

    # Schema discovery mode
    if args.discover:
        print()
        log("Discovering Copilot Studio Kit schema...", "info")

        # List all cat_copilot* entities
        print("\n  All cat_copilot* entities:")
        entities = client.list_entities("cat_copilot")
        for e in entities:
            print(f"    - {e.get('LogicalName')}")

        # Get relationships for cat_copilottests
        print("\n  cat_copilottest relationships (Many-to-One):")
        rels = client.get_entity_relationships("cat_copilottest")
        for r in rels:
            ref_attr = r.get("ReferencingAttribute", "?")
            ref_entity = r.get("ReferencedEntity", "?")
            schema = r.get("SchemaName", "?")
            print(f"    - {ref_attr} -> {ref_entity} ({schema})")

        # Get one-to-many from test set
        print("\n  cat_copilottestset relationships (One-to-Many):")
        rels = client.get_one_to_many_relationships("cat_copilottestset")
        for r in rels:
            ref_entity = r.get("ReferencingEntity", "?")
            ref_attr = r.get("ReferencingAttribute", "?")
            nav_prop = r.get("ReferencedEntityNavigationPropertyName", "?")
            schema = r.get("SchemaName", "?")
            print(f"    - {ref_entity}.{ref_attr} (nav: {nav_prop}, schema: {schema})")

        # Get fields for cat_copilottests
        print("\n  cat_copilottest fields (lookup types):")
        fields = client.list_entity_fields("cat_copilottest")
        for f in fields:
            if f.get("AttributeType") == "Lookup":
                print(f"    - {f.get('LogicalName')}: Lookup")

    # Create Test Run if requested
    test_run_id = None
    if args.run:
        print()
        log("=" * 50)
        log("  Creating Test Run")
        log("=" * 50)
        print()

        # Find or create agent configuration
        log(f"Looking for agent configuration: {args.agent}")
        agent_config = client.find_agent_configuration(args.agent)

        if agent_config:
            agent_config_id = agent_config.get("cat_copilotconfigurationid")
            log(f"Found existing agent configuration: {agent_config_id}", "success")
        else:
            log(f"Creating new agent configuration for: {args.agent}")
            agent_config_id = client.create_agent_configuration(
                args.agent,
                display_name=test_data.get("agentName", args.agent)
            )
            log(f"Created agent configuration: {agent_config_id}", "success")

        # Create test run
        run_name = f"{test_data['testSetName']} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        log(f"Creating test run: {run_name}")

        # Check for existing test run with same name
        existing_run = client.find_test_run(run_name)
        if existing_run and args.force:
            log("Deleting existing test run (--force mode)...", "warning")
            client.delete_test_run(existing_run.get("cat_copilottestrunid"))

        try:
            test_run_id = client.create_test_run(run_name, test_set_id, agent_config_id)
            log(f"Test Run created: {test_run_id}", "success")

            # Start the test run if requested
            if args.start:
                log("Starting test run...")
                client.start_test_run(test_run_id)
                log("Test Run started (status set to Pending)", "success")
        except Exception as e:
            log(f"Failed to create test run: {e}", "error")
            log("You may need to create the test run manually in the UI", "warning")

    print()
    print("=" * 50)
    print("  Import Complete")
    print("=" * 50)
    print()

    if test_run_id:
        log(f"Test Run ID: {test_run_id}", "success")
        print()
        print("Next steps:")
        print("  1. Open Power CAT Copilot Studio Kit")
        print(f"  2. Go to Test Runs > {test_data['testSetName']}")
        print("  3. Click 'Run Tests' to execute the test suite")
    else:
        print("Next steps:")
        print("  1. Open Power CAT Copilot Studio Kit")
        print(f"  2. Go to Test Sets > {test_data['testSetName']}")
        print("  3. Create a Test Run with your Agent Configuration")
        print("  4. Enable 'Analyze Generated Answers' in Agent Configuration")
    print()


if __name__ == "__main__":
    main()
