#!/usr/bin/env python3
"""
Create Dataverse Tables in AragornAI
Creates the missing eap_ tables using the Dataverse Web API.
"""

import json
import sys
import time
from pathlib import Path

import requests
from msal import PublicClientApplication

# Configuration
TENANT_ID = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"
CLIENT_ID = "f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8"
ENVIRONMENT_URL = "https://aragornai.crm.dynamics.com"
API_URL = "https://aragornai.api.crm.dynamics.com/api/data/v9.2"

SCRIPT_DIR = Path(__file__).parent
SCHEMA_DIR = SCRIPT_DIR.parent.parent.parent / "base" / "dataverse" / "schema"

# Tables to create (missing from AragornAI)
TABLES_TO_CREATE = [
    "eap_capability_implementation",
    "eap_telemetry",
    "eap_proactive_trigger",
    "eap_trigger_history",
    "eap_workflow_contribution",
    "eap_workflow_definition",
    "eap_featureflag",
]


def get_token():
    """Get access token using MSAL device code flow."""
    app = PublicClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}"
    )

    # Try silent first
    accounts = app.get_accounts()
    if accounts:
        result = app.acquire_token_silent(
            [f"{ENVIRONMENT_URL}/.default"],
            account=accounts[0]
        )
        if result and "access_token" in result:
            print("Using cached token")
            return result["access_token"]

    # Device code flow
    flow = app.initiate_device_flow(scopes=[f"{ENVIRONMENT_URL}/.default"])
    print(flow["message"])
    result = app.acquire_token_by_device_flow(flow)

    if "access_token" in result:
        return result["access_token"]
    else:
        print(f"Error: {result.get('error_description', 'Unknown error')}")
        return None


def get_headers(token):
    """Get API request headers."""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Prefer": "return=representation"
    }


def load_schema(table_name):
    """Load table schema from JSON file."""
    schema_file = SCHEMA_DIR / f"{table_name}.json"
    if schema_file.exists():
        with open(schema_file) as f:
            return json.load(f)
    return None


def map_type_to_attribute_type(col):
    """Map schema type to Dataverse AttributeType."""
    col_type = col.get("type", "nvarchar")

    if col_type == "nvarchar":
        return "String"
    elif col_type == "int":
        return "Integer"
    elif col_type == "decimal":
        return "Decimal"
    elif col_type == "bit":
        return "Boolean"
    elif col_type == "datetime":
        return "DateTime"
    elif col_type == "choice":
        return "Picklist"
    elif col_type == "lookup":
        return "Lookup"
    elif col_type == "uniqueidentifier":
        return "Uniqueidentifier"
    else:
        return "String"


def get_primary_name_column(schema):
    """Get the primary name column for a table."""
    columns = schema.get("columns", [])

    # Look for common name patterns
    for col in columns:
        name = col.get("name", "")
        if col.get("primary_key"):
            continue
        if name.endswith("_code") or name.endswith("_name"):
            return name

    # Fallback to first nvarchar column
    for col in columns:
        if col.get("type") == "nvarchar" and not col.get("primary_key"):
            return col.get("name")

    return None


def check_table_exists(token, table_name):
    """Check if a table already exists."""
    url = f"{API_URL}/EntityDefinitions(LogicalName='{table_name}')"
    response = requests.get(url, headers=get_headers(token))
    return response.status_code == 200


def create_table(token, schema):
    """Create a Dataverse table from schema."""
    table_name = schema.get("table_name")
    display_name = schema.get("display_name", table_name)
    description = schema.get("description", "")

    primary_name = get_primary_name_column(schema)
    if not primary_name:
        print(f"  ERROR: No primary name column found for {table_name}")
        return False

    # Find primary name column details
    primary_col = None
    for col in schema.get("columns", []):
        if col.get("name") == primary_name:
            primary_col = col
            break

    if not primary_col:
        print(f"  ERROR: Primary column {primary_name} not found in schema")
        return False

    # Create entity definition
    entity_def = {
        "SchemaName": table_name,
        "DisplayName": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}]
        },
        "DisplayCollectionName": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": f"{display_name}s", "LanguageCode": 1033}]
        },
        "Description": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": description, "LanguageCode": 1033}]
        },
        "OwnershipType": "UserOwned",
        "IsActivity": False,
        "HasNotes": False,
        "HasActivities": False,
        "PrimaryNameAttribute": primary_name,
        "Attributes": [
            {
                "AttributeType": "String",
                "SchemaName": primary_name,
                "RequiredLevel": {"Value": "ApplicationRequired"},
                "MaxLength": primary_col.get("max_length", 100),
                "FormatName": {"Value": "Text"},
                "DisplayName": {
                    "@odata.type": "Microsoft.Dynamics.CRM.Label",
                    "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": primary_col.get("display_name", primary_name), "LanguageCode": 1033}]
                },
                "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata"
            }
        ]
    }

    url = f"{API_URL}/EntityDefinitions"
    response = requests.post(url, headers=get_headers(token), json=entity_def)

    if response.status_code in (200, 201, 204):
        print(f"  Created table: {table_name}")
        return True
    else:
        print(f"  ERROR creating table {table_name}: {response.status_code}")
        print(f"  {response.text[:500]}")
        return False


def add_column(token, table_name, col):
    """Add a column to an existing table."""
    col_name = col.get("name")
    col_type = col.get("type", "nvarchar")
    display_name = col.get("display_name", col_name)
    required = col.get("required", False)

    # Skip primary key columns
    if col.get("primary_key"):
        return True

    required_level = "ApplicationRequired" if required else "None"

    # Build attribute metadata based on type
    if col_type == "nvarchar":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
            "AttributeType": "String",
            "SchemaName": col_name,
            "MaxLength": min(col.get("max_length", 100), 4000),
            "FormatName": {"Value": "Text"},
            "RequiredLevel": {"Value": required_level},
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}]
            }
        }
    elif col_type == "int":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.IntegerAttributeMetadata",
            "AttributeType": "Integer",
            "SchemaName": col_name,
            "MinValue": -2147483648,
            "MaxValue": 2147483647,
            "Format": "None",
            "RequiredLevel": {"Value": required_level},
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}]
            }
        }
    elif col_type == "decimal":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.DecimalAttributeMetadata",
            "AttributeType": "Decimal",
            "SchemaName": col_name,
            "Precision": col.get("precision", 2),
            "MinValue": -100000000000,
            "MaxValue": 100000000000,
            "RequiredLevel": {"Value": required_level},
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}]
            }
        }
    elif col_type == "bit":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.BooleanAttributeMetadata",
            "AttributeType": "Boolean",
            "SchemaName": col_name,
            "RequiredLevel": {"Value": required_level},
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}]
            },
            "OptionSet": {
                "TrueOption": {"Value": 1, "Label": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Yes", "LanguageCode": 1033}]}},
                "FalseOption": {"Value": 0, "Label": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "No", "LanguageCode": 1033}]}}
            }
        }
    elif col_type == "datetime":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata",
            "AttributeType": "DateTime",
            "SchemaName": col_name,
            "Format": "DateAndTime",
            "RequiredLevel": {"Value": required_level},
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}]
            }
        }
    elif col_type == "choice":
        # Build options
        options = []
        for choice in col.get("choices", []):
            options.append({
                "Value": choice.get("value"),
                "Label": {
                    "@odata.type": "Microsoft.Dynamics.CRM.Label",
                    "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": choice.get("label"), "LanguageCode": 1033}]
                }
            })

        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.PicklistAttributeMetadata",
            "AttributeType": "Picklist",
            "SchemaName": col_name,
            "RequiredLevel": {"Value": required_level},
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": display_name, "LanguageCode": 1033}]
            },
            "OptionSet": {
                "@odata.type": "Microsoft.Dynamics.CRM.OptionSetMetadata",
                "IsGlobal": False,
                "OptionSetType": "Picklist",
                "Options": options
            }
        }
    else:
        # Skip unsupported types
        print(f"    Skipping unsupported type: {col_type} for {col_name}")
        return True

    url = f"{API_URL}/EntityDefinitions(LogicalName='{table_name}')/Attributes"
    response = requests.post(url, headers=get_headers(token), json=attr_def)

    if response.status_code in (200, 201, 204):
        print(f"    Added column: {col_name}")
        return True
    elif "already exists" in response.text.lower() or "duplicate" in response.text.lower():
        print(f"    Column exists: {col_name}")
        return True
    else:
        print(f"    ERROR adding column {col_name}: {response.status_code}")
        print(f"    {response.text[:300]}")
        return False


def add_table_to_solution(token, solution_name, table_name):
    """Add a table to a solution."""
    url = f"{API_URL}/AddSolutionComponent"
    payload = {
        "ComponentId": None,  # Will be set after getting EntityMetadataId
        "ComponentType": 1,  # Entity
        "SolutionUniqueName": solution_name,
        "AddRequiredComponents": False,
        "DoNotIncludeSubcomponents": False
    }

    # First get the entity metadata ID
    entity_url = f"{API_URL}/EntityDefinitions(LogicalName='{table_name}')?$select=MetadataId"
    entity_response = requests.get(entity_url, headers=get_headers(token))

    if entity_response.status_code != 200:
        print(f"  ERROR getting entity ID for {table_name}: {entity_response.status_code}")
        return False

    metadata_id = entity_response.json().get("MetadataId")
    payload["ComponentId"] = metadata_id

    response = requests.post(url, headers=get_headers(token), json=payload)

    if response.status_code in (200, 204):
        print(f"  Added {table_name} to solution {solution_name}")
        return True
    elif "already exists" in response.text.lower():
        print(f"  {table_name} already in solution")
        return True
    else:
        print(f"  ERROR adding to solution: {response.status_code}")
        print(f"  {response.text[:300]}")
        return False


def main():
    print("=" * 60)
    print("Create Dataverse Tables in AragornAI")
    print("=" * 60)
    print(f"\nEnvironment: {ENVIRONMENT_URL}")
    print(f"Tables to create: {len(TABLES_TO_CREATE)}")

    print("\nAuthenticating...")
    token = get_token()
    if not token:
        print("Authentication failed")
        sys.exit(1)
    print("Authentication successful")

    created = 0
    skipped = 0
    errors = 0

    for table_name in TABLES_TO_CREATE:
        print(f"\n--- Processing: {table_name} ---")

        # Load schema
        schema = load_schema(table_name)
        if not schema:
            print(f"  ERROR: No schema file found for {table_name}")
            errors += 1
            continue

        # Check if table exists
        if check_table_exists(token, table_name):
            print(f"  Table already exists: {table_name}")
            skipped += 1
        else:
            # Create table
            if create_table(token, schema):
                created += 1
                time.sleep(2)  # Wait for table creation
            else:
                errors += 1
                continue

        # Add remaining columns
        primary_name = get_primary_name_column(schema)
        for col in schema.get("columns", []):
            col_name = col.get("name")
            if col.get("primary_key") or col_name == primary_name:
                continue
            add_column(token, table_name, col)
            time.sleep(0.5)  # Rate limiting

    # Add tables to solution
    print("\n" + "=" * 60)
    print("Adding tables to EnterpriseAIPlatformv10 solution")
    print("=" * 60)

    solution_name = "EnterpriseAIPlatformv10"
    for table_name in TABLES_TO_CREATE:
        add_table_to_solution(token, solution_name, table_name)
        time.sleep(0.5)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Created: {created}")
    print(f"  Skipped (existing): {skipped}")
    print(f"  Errors: {errors}")

    if errors == 0:
        print("\nAll tables processed successfully!")
        print("\nNext steps:")
        print("  1. Run: pac solution export --name EnterpriseAIPlatformv10 --path ./EAPPlatform_complete.zip")
        print("  2. Import the exported solution into Mastercard environment")
    else:
        print(f"\n{errors} tables had errors. Check output above.")


if __name__ == "__main__":
    main()
