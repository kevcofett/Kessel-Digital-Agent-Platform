#!/usr/bin/env python3
"""
ADIS Dataverse Deployment Script - Web API Version
Deploys Dataverse tables using the Dataverse REST API.

Prerequisites:
- Azure AD App Registration with Dataverse permissions
- Python packages: msal, requests

Usage:
    # Interactive login (uses device code flow)
    python deploy_dataverse_webapi.py --org-url https://aragornai.crm.dynamics.com --interactive

    # Service principal auth
    python deploy_dataverse_webapi.py --org-url https://aragornai.crm.dynamics.com \
        --client-id YOUR_APP_ID --client-secret YOUR_SECRET --tenant-id YOUR_TENANT
"""

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

try:
    import msal
    import requests
except ImportError:
    print("Missing required packages. Install with: pip install msal requests")
    sys.exit(1)


# Table creation order (respects foreign key dependencies)
TABLE_ORDER = [
    "mpa_model_catalog",
    "mpa_upload_job",
    "mpa_data_schema",
    "mpa_customer_record",
    "mpa_model_run",
    "mpa_model_output",
    "mpa_audience",
    "mpa_audience_rule",
    "mpa_audience_member",
    "mpa_campaign_audience",
    "mpa_performance_linkage"
]

# Dataverse attribute type mapping
ATTRIBUTE_TYPE_MAPPING = {
    "uniqueidentifier": "UniqueIdentifier",
    "string": "String",
    "memo": "Memo",
    "whole_number": "Integer",
    "decimal": "Decimal",
    "money": "Money",
    "datetime": "DateTime",
    "boolean": "Boolean",
    "picklist": "Picklist"
}


class DataverseClient:
    """Client for Dataverse Web API operations."""

    def __init__(self, org_url: str, access_token: str):
        self.org_url = org_url.rstrip('/')
        self.api_url = f"{self.org_url}/api/data/v9.2"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8"
        }

    def _request(self, method: str, endpoint: str, data: Optional[dict] = None) -> dict:
        """Make an API request."""
        url = f"{self.api_url}/{endpoint}"

        try:
            if method == "GET":
                response = requests.get(url, headers=self.headers)
            elif method == "POST":
                response = requests.post(url, headers=self.headers, json=data)
            elif method == "PATCH":
                response = requests.patch(url, headers=self.headers, json=data)
            elif method == "DELETE":
                response = requests.delete(url, headers=self.headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            if response.status_code == 204:
                return {"success": True}
            elif response.status_code >= 400:
                return {"error": response.text, "status": response.status_code}
            else:
                return response.json() if response.text else {"success": True}

        except Exception as e:
            return {"error": str(e)}

    def table_exists(self, logical_name: str) -> bool:
        """Check if a table exists."""
        # Query EntityDefinitions for the table
        endpoint = f"EntityDefinitions(LogicalName='{logical_name}')"
        result = self._request("GET", endpoint)
        return "error" not in result

    def create_table(self, table_def: dict) -> dict:
        """Create a new table (entity)."""
        logical_name = table_def.get("logical_name", "")
        display_name = table_def.get("display_name", logical_name)
        plural_name = table_def.get("plural_name", f"{display_name}s")
        description = table_def.get("description", "")
        primary_column = table_def.get("primary_column", f"{logical_name}name")

        # Build entity definition
        entity_def = {
            "SchemaName": logical_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [
                    {"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}
                ]
            },
            "DisplayCollectionName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [
                    {"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": plural_name, "LanguageCode": 1033}
                ]
            },
            "Description": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [
                    {"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": description, "LanguageCode": 1033}
                ]
            },
            "OwnershipType": "UserOwned",
            "HasNotes": False,
            "HasActivities": False,
            "IsActivity": False,
            "PrimaryNameAttribute": primary_column,
            "Attributes": [
                {
                    "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
                    "SchemaName": primary_column,
                    "RequiredLevel": {"Value": "ApplicationRequired"},
                    "MaxLength": 200,
                    "DisplayName": {
                        "@odata.type": "Microsoft.Dynamics.CRM.Label",
                        "LocalizedLabels": [
                            {"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name.split()[0] + " Name", "LanguageCode": 1033}
                        ]
                    }
                }
            ]
        }

        return self._request("POST", "EntityDefinitions", entity_def)

    def create_attribute(self, table_name: str, column_def: dict) -> dict:
        """Create a column (attribute) on a table."""
        logical_name = column_def.get("logical_name", "")
        display_name = column_def.get("display_name", logical_name)
        col_type = column_def.get("type", "string").lower()

        # Skip primary key columns - Dataverse creates them automatically
        if column_def.get("is_primary_key", False):
            return {"skipped": True, "reason": "Primary key created automatically"}

        # Build attribute metadata based on type
        attr_def = self._build_attribute_metadata(column_def)

        if not attr_def:
            return {"skipped": True, "reason": f"Unsupported type: {col_type}"}

        # Create the attribute via API
        endpoint = f"EntityDefinitions(LogicalName='{table_name}')/Attributes"
        return self._request("POST", endpoint, attr_def)

    def _build_attribute_metadata(self, column_def: dict) -> Optional[dict]:
        """Build attribute metadata for different column types."""
        logical_name = column_def.get("logical_name", "")
        display_name = column_def.get("display_name", logical_name)
        col_type = column_def.get("type", "string").lower()
        required = column_def.get("required", False)

        base_def = {
            "SchemaName": logical_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [
                    {"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}
                ]
            },
            "RequiredLevel": {"Value": "ApplicationRequired" if required else "None"}
        }

        if col_type == "string":
            max_length = column_def.get("max_length", 200)
            return {
                **base_def,
                "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
                "AttributeType": "String",
                "MaxLength": max_length,
                "FormatName": {"Value": "Text"}
            }

        elif col_type == "memo":
            max_length = column_def.get("max_length", 10000)
            return {
                **base_def,
                "@odata.type": "Microsoft.Dynamics.CRM.MemoAttributeMetadata",
                "AttributeType": "Memo",
                "MaxLength": min(max_length, 1048576)  # Dataverse max
            }

        elif col_type == "whole_number":
            return {
                **base_def,
                "@odata.type": "Microsoft.Dynamics.CRM.IntegerAttributeMetadata",
                "AttributeType": "Integer",
                "MinValue": column_def.get("min_value", -2147483648),
                "MaxValue": column_def.get("max_value", 2147483647)
            }

        elif col_type == "decimal":
            precision = column_def.get("precision", 2)
            return {
                **base_def,
                "@odata.type": "Microsoft.Dynamics.CRM.DecimalAttributeMetadata",
                "AttributeType": "Decimal",
                "Precision": precision,
                "MinValue": column_def.get("min_value", -100000000000),
                "MaxValue": column_def.get("max_value", 100000000000)
            }

        elif col_type == "money":
            return {
                **base_def,
                "@odata.type": "Microsoft.Dynamics.CRM.MoneyAttributeMetadata",
                "AttributeType": "Money",
                "Precision": 4,
                "PrecisionSource": 2  # Use currency precision
            }

        elif col_type == "datetime":
            return {
                **base_def,
                "@odata.type": "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata",
                "AttributeType": "DateTime",
                "Format": "DateAndTime"
            }

        elif col_type == "boolean":
            default_value = column_def.get("default_value", False)
            return {
                **base_def,
                "@odata.type": "Microsoft.Dynamics.CRM.BooleanAttributeMetadata",
                "AttributeType": "Boolean",
                "DefaultValue": default_value,
                "OptionSet": {
                    "TrueOption": {"Value": 1, "Label": {"LocalizedLabels": [{"Label": "Yes", "LanguageCode": 1033}]}},
                    "FalseOption": {"Value": 0, "Label": {"LocalizedLabels": [{"Label": "No", "LanguageCode": 1033}]}}
                }
            }

        elif col_type == "picklist":
            options = column_def.get("options", [])
            option_set = {
                "IsGlobal": False,
                "OptionSetType": "Picklist",
                "Options": [
                    {
                        "Value": opt.get("value", idx + 100000000),
                        "Label": {"LocalizedLabels": [{"Label": opt.get("label", f"Option {idx}"), "LanguageCode": 1033}]}
                    }
                    for idx, opt in enumerate(options)
                ]
            }

            default_value = column_def.get("default_value")
            attr = {
                **base_def,
                "@odata.type": "Microsoft.Dynamics.CRM.PicklistAttributeMetadata",
                "AttributeType": "Picklist",
                "OptionSet": option_set
            }

            if default_value is not None:
                attr["DefaultFormValue"] = default_value

            return attr

        return None


def get_token_interactive(org_url: str) -> str:
    """Get access token using interactive device code flow."""
    # Use Microsoft's public client ID for Dataverse
    client_id = "51f81489-12ee-4a9e-aaae-a2591f45987d"  # Dynamics 365 UCI
    authority = "https://login.microsoftonline.com/common"
    scope = [f"{org_url}/.default"]

    app = msal.PublicClientApplication(
        client_id,
        authority=authority
    )

    # Try to get cached token first
    accounts = app.get_accounts()
    if accounts:
        result = app.acquire_token_silent(scope, account=accounts[0])
        if result and "access_token" in result:
            print("Using cached token")
            return result["access_token"]

    # Use device code flow
    flow = app.initiate_device_flow(scopes=scope)

    if "user_code" not in flow:
        raise Exception(f"Failed to initiate device flow: {flow.get('error_description', 'Unknown error')}")

    print(f"\n{flow['message']}\n")

    result = app.acquire_token_by_device_flow(flow)

    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"Authentication failed: {result.get('error_description', 'Unknown error')}")


def get_token_service_principal(org_url: str, client_id: str, client_secret: str, tenant_id: str) -> str:
    """Get access token using service principal."""
    authority = f"https://login.microsoftonline.com/{tenant_id}"
    scope = [f"{org_url}/.default"]

    app = msal.ConfidentialClientApplication(
        client_id,
        authority=authority,
        client_credential=client_secret
    )

    result = app.acquire_token_for_client(scopes=scope)

    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"Authentication failed: {result.get('error_description', 'Unknown error')}")


def load_schemas(schema_path: Path) -> Dict[str, dict]:
    """Load all schema files and return table definitions."""
    tables = {}

    for schema_file in sorted(schema_path.glob("ADIS_Schema_v1*.json")):
        print(f"Loading {schema_file.name}...")

        with open(schema_file, "r") as f:
            schema_data = json.load(f)

        if "tables" in schema_data:
            for table in schema_data["tables"]:
                table_name = table.get("logical_name", "")
                if table_name:
                    tables[table_name] = table

    return tables


def deploy_tables(client: DataverseClient, tables: Dict[str, dict], dry_run: bool = False):
    """Deploy all tables in dependency order."""
    results = {"success": [], "failed": [], "skipped": []}

    for table_name in TABLE_ORDER:
        if table_name not in tables:
            print(f"  [SKIP] {table_name} - not in schema")
            results["skipped"].append(table_name)
            continue

        table_def = tables[table_name]

        # Check if table exists
        if client.table_exists(table_name):
            print(f"  [EXISTS] {table_name}")
            results["skipped"].append(table_name)
            continue

        print(f"  [CREATE] {table_name}...")

        if dry_run:
            print(f"    [DRY RUN] Would create table {table_name}")
            results["success"].append(table_name)
            continue

        # Create table
        result = client.create_table(table_def)

        if "error" in result:
            print(f"    [ERROR] {result['error'][:200]}")
            results["failed"].append(table_name)
            continue

        print(f"    [OK] Table created")

        # Wait for table to be available
        time.sleep(2)

        # Create columns
        columns = table_def.get("columns", [])
        col_success = 0
        col_failed = 0

        for column in columns:
            col_name = column.get("logical_name", "")

            if column.get("is_primary_key", False):
                continue

            col_result = client.create_attribute(table_name, column)

            if "skipped" in col_result:
                continue
            elif "error" in col_result:
                print(f"    [COL ERROR] {col_name}: {str(col_result['error'])[:100]}")
                col_failed += 1
            else:
                col_success += 1

        print(f"    Columns: {col_success} created, {col_failed} failed")

        if col_failed == 0:
            results["success"].append(table_name)
        else:
            results["failed"].append(table_name)

        # Rate limiting
        time.sleep(1)

    return results


def main():
    parser = argparse.ArgumentParser(description="Deploy ADIS Dataverse tables via Web API")
    parser.add_argument("--org-url", required=True, help="Dataverse org URL (e.g., https://aragornai.crm.dynamics.com)")
    parser.add_argument("--interactive", action="store_true", help="Use interactive device code authentication")
    parser.add_argument("--client-id", help="Azure AD App client ID (for service principal auth)")
    parser.add_argument("--client-secret", help="Azure AD App client secret")
    parser.add_argument("--tenant-id", help="Azure AD tenant ID")
    parser.add_argument("--dry-run", action="store_true", help="Show actions without executing")

    args = parser.parse_args()

    # Find schema path
    script_path = Path(__file__).resolve()
    schema_path = script_path.parent.parent / "schema"

    if not schema_path.exists():
        print(f"Schema path not found: {schema_path}")
        sys.exit(1)

    # Authenticate
    print("\n=== ADIS Dataverse Deployment ===\n")
    print(f"Target: {args.org_url}")
    print(f"Schema: {schema_path}\n")

    try:
        if args.interactive:
            print("Authenticating (interactive)...")
            token = get_token_interactive(args.org_url)
        elif args.client_id and args.client_secret and args.tenant_id:
            print("Authenticating (service principal)...")
            token = get_token_service_principal(
                args.org_url,
                args.client_id,
                args.client_secret,
                args.tenant_id
            )
        else:
            print("Error: Specify --interactive or provide --client-id, --client-secret, --tenant-id")
            sys.exit(1)

        print("Authentication successful\n")

    except Exception as e:
        print(f"Authentication failed: {e}")
        sys.exit(1)

    # Load schemas
    print("Loading schemas...")
    tables = load_schemas(schema_path)
    print(f"Loaded {len(tables)} table definitions\n")

    # Create client
    client = DataverseClient(args.org_url, token)

    # Deploy tables
    print("Deploying tables...")
    results = deploy_tables(client, tables, dry_run=args.dry_run)

    # Summary
    print("\n=== Deployment Summary ===")
    print(f"Success: {len(results['success'])}")
    print(f"Failed: {len(results['failed'])}")
    print(f"Skipped: {len(results['skipped'])}")

    if results["failed"]:
        print(f"\nFailed tables: {', '.join(results['failed'])}")
        sys.exit(1)

    print("\nDeployment completed successfully")


if __name__ == "__main__":
    main()
