#!/usr/bin/env python3
"""
MPA v6.1 H1+H2 Enhancement - Dataverse Table Creation Script

Creates the 6 new tables required for Horizon 1+2 features:
- mpa_user_preferences: User defaults and preferences for personalization
- mpa_session_memory: Session-level memory items for context persistence
- eap_proactive_trigger: Definitions for proactive intelligence triggers
- eap_workflow_definition: Templates for collaborative multi-agent workflows
- eap_workflow_contribution: Agent contributions during collaborative workflows
- eap_trigger_history: History of fired proactive triggers

Usage:
    python create_h1h2_tables.py [--table TABLE] [--dry-run]

Examples:
    python create_h1h2_tables.py --dry-run           # Show what would be created
    python create_h1h2_tables.py --table user_preferences  # Create one table
    python create_h1h2_tables.py                     # Create all tables
"""

import argparse
import json
import os
import sys
import time
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from auth.msal_auth import MSALAuthenticator, AuthenticationError
    MSAL_AVAILABLE = True
except ImportError:
    MSAL_AVAILABLE = False
    print("Warning: MSAL auth not available, will use simple token approach")


# Configuration
TENANT_ID = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"
CLIENT_ID = "f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8"
ENVIRONMENT_URL = "https://aragornai.crm.dynamics.com"
API_URL = "https://aragornai.api.crm.dynamics.com/api/data/v9.2"


# Table definitions for H1+H2 enhancement
TABLE_DEFINITIONS = {
    "user_preferences": {
        "schema_name": "mpa_user_preferences",
        "display_name": "User Preferences",
        "plural_name": "User Preferences",
        "description": "User defaults and preferences for personalization",
        "primary_attribute": "mpa_user_email",
        "primary_attribute_display": "User Email",
        "columns": [
            {"name": "mpa_user_id", "display": "User ID", "type": "Text", "length": 100, "required": True},
            {"name": "mpa_user_email", "display": "User Email", "type": "Text", "length": 200, "required": False},
            {"name": "mpa_default_vertical", "display": "Default Vertical", "type": "Text", "length": 50, "required": False},
            {"name": "mpa_typical_budget_low", "display": "Typical Budget Low", "type": "Currency", "required": False},
            {"name": "mpa_typical_budget_high", "display": "Typical Budget High", "type": "Currency", "required": False},
            {"name": "mpa_preferred_channels_json", "display": "Preferred Channels", "type": "MultilineText", "length": 4000, "required": False},
            {"name": "mpa_excluded_channels_json", "display": "Excluded Channels", "type": "MultilineText", "length": 4000, "required": False},
            {"name": "mpa_preferred_kpis_json", "display": "Preferred KPIs", "type": "MultilineText", "length": 4000, "required": False},
            {"name": "mpa_communication_style", "display": "Communication Style", "type": "Choice", "required": False, "options": ["concise", "detailed", "balanced"]},
            {"name": "mpa_measurement_philosophy", "display": "Measurement Philosophy", "type": "Choice", "required": False, "options": ["incrementality_first", "attribution_focused", "hybrid"]},
            {"name": "mpa_learned_patterns_json", "display": "Learned Patterns", "type": "MultilineText", "length": 8000, "required": False},
            {"name": "mpa_last_session_id", "display": "Last Session ID", "type": "Text", "length": 50, "required": False},
            {"name": "mpa_session_count", "display": "Session Count", "type": "Integer", "required": False},
            {"name": "mpa_preference_version", "display": "Preference Version", "type": "Integer", "required": False},
            {"name": "mpa_created_at", "display": "Created At", "type": "DateTime", "required": True},
            {"name": "mpa_updated_at", "display": "Updated At", "type": "DateTime", "required": True},
        ]
    },
    "session_memory": {
        "schema_name": "mpa_session_memory",
        "display_name": "Session Memory",
        "plural_name": "Session Memories",
        "description": "Session-level memory items for context persistence",
        "primary_attribute": "mpa_memory_key",
        "primary_attribute_display": "Memory Key",
        "columns": [
            {"name": "mpa_session_id", "display": "Session ID", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_user_id", "display": "User ID", "type": "Text", "length": 100, "required": True},
            {"name": "mpa_memory_type", "display": "Memory Type", "type": "Choice", "required": True, "options": ["preference", "decision", "context", "pattern"]},
            {"name": "mpa_memory_category", "display": "Memory Category", "type": "Choice", "required": True, "options": ["vertical", "budget", "channel", "kpi", "measurement", "audience", "other"]},
            {"name": "mpa_memory_key", "display": "Memory Key", "type": "Text", "length": 100, "required": True},
            {"name": "mpa_memory_value_json", "display": "Memory Value", "type": "MultilineText", "length": 8000, "required": True},
            {"name": "mpa_confidence_score", "display": "Confidence Score", "type": "Integer", "required": True},
            {"name": "mpa_source_type", "display": "Source Type", "type": "Choice", "required": True, "options": ["explicit", "implicit", "inferred"]},
            {"name": "mpa_source_quote", "display": "Source Quote", "type": "Text", "length": 500, "required": False},
            {"name": "mpa_is_persistent", "display": "Is Persistent", "type": "Boolean", "required": True, "default": False},
            {"name": "mpa_expires_at", "display": "Expires At", "type": "DateTime", "required": False},
            {"name": "mpa_created_at", "display": "Created At", "type": "DateTime", "required": True},
            {"name": "mpa_last_accessed_at", "display": "Last Accessed At", "type": "DateTime", "required": False},
            {"name": "mpa_access_count", "display": "Access Count", "type": "Integer", "required": False},
        ]
    },
    "proactive_trigger": {
        "schema_name": "eap_proactive_trigger",
        "display_name": "Proactive Trigger",
        "plural_name": "Proactive Triggers",
        "description": "Definitions for proactive intelligence triggers",
        "primary_attribute": "eap_trigger_name",
        "primary_attribute_display": "Trigger Name",
        "columns": [
            {"name": "eap_trigger_code", "display": "Trigger Code", "type": "Text", "length": 50, "required": True},
            {"name": "eap_trigger_name", "display": "Trigger Name", "type": "Text", "length": 100, "required": True},
            {"name": "eap_description", "display": "Description", "type": "MultilineText", "length": 500, "required": False},
            {"name": "eap_agent_code", "display": "Agent Code", "type": "Text", "length": 10, "required": True},
            {"name": "eap_trigger_category", "display": "Trigger Category", "type": "Choice", "required": True, "options": ["alert", "opportunity", "recommendation", "warning"]},
            {"name": "eap_severity", "display": "Severity", "type": "Choice", "required": True, "options": ["critical", "important", "suggestion", "info"]},
            {"name": "eap_priority_order", "display": "Priority Order", "type": "Integer", "required": True},
            {"name": "eap_condition_json", "display": "Condition JSON", "type": "MultilineText", "length": 4000, "required": True},
            {"name": "eap_message_template", "display": "Message Template", "type": "MultilineText", "length": 1000, "required": True},
            {"name": "eap_cooldown_hours", "display": "Cooldown Hours", "type": "Integer", "required": False},
            {"name": "eap_is_active", "display": "Is Active", "type": "Boolean", "required": True, "default": True},
            {"name": "eap_applies_to_steps_json", "display": "Applies to Steps", "type": "MultilineText", "length": 500, "required": False},
            {"name": "eap_created_at", "display": "Created At", "type": "DateTime", "required": True},
        ]
    },
    "workflow_definition": {
        "schema_name": "eap_workflow_definition",
        "display_name": "Workflow Definition",
        "plural_name": "Workflow Definitions",
        "description": "Templates for collaborative multi-agent workflows",
        "primary_attribute": "eap_workflow_name",
        "primary_attribute_display": "Workflow Name",
        "columns": [
            {"name": "eap_workflow_code", "display": "Workflow Code", "type": "Text", "length": 50, "required": True},
            {"name": "eap_workflow_name", "display": "Workflow Name", "type": "Text", "length": 100, "required": True},
            {"name": "eap_description", "display": "Description", "type": "MultilineText", "length": 500, "required": False},
            {"name": "eap_trigger_phrases_json", "display": "Trigger Phrases", "type": "MultilineText", "length": 2000, "required": True},
            {"name": "eap_agent_sequence_json", "display": "Agent Sequence", "type": "MultilineText", "length": 1000, "required": True},
            {"name": "eap_estimated_duration_seconds", "display": "Estimated Duration", "type": "Integer", "required": False},
            {"name": "eap_output_type", "display": "Output Type", "type": "Choice", "required": True, "options": ["plan", "analysis", "recommendation", "document"]},
            {"name": "eap_synthesis_template", "display": "Synthesis Template", "type": "MultilineText", "length": 4000, "required": False},
            {"name": "eap_is_active", "display": "Is Active", "type": "Boolean", "required": True, "default": True},
            {"name": "eap_created_at", "display": "Created At", "type": "DateTime", "required": True},
        ]
    },
    "workflow_contribution": {
        "schema_name": "eap_workflow_contribution",
        "display_name": "Workflow Contribution",
        "plural_name": "Workflow Contributions",
        "description": "Agent contributions during collaborative workflows",
        "primary_attribute": "eap_workflow_instance_id",
        "primary_attribute_display": "Workflow Instance ID",
        "columns": [
            {"name": "eap_workflow_instance_id", "display": "Workflow Instance ID", "type": "Text", "length": 50, "required": True},
            {"name": "eap_session_id", "display": "Session ID", "type": "Text", "length": 50, "required": True},
            {"name": "eap_agent_code", "display": "Agent Code", "type": "Text", "length": 10, "required": True},
            {"name": "eap_contribution_type", "display": "Contribution Type", "type": "Choice", "required": True, "options": ["analysis", "recommendation", "validation", "context"]},
            {"name": "eap_contribution_json", "display": "Contribution JSON", "type": "MultilineText", "length": 16000, "required": True},
            {"name": "eap_summary", "display": "Summary", "type": "MultilineText", "length": 500, "required": False},
            {"name": "eap_confidence_overall", "display": "Overall Confidence", "type": "Integer", "required": False},
            {"name": "eap_status", "display": "Status", "type": "Choice", "required": True, "options": ["pending", "complete", "failed", "skipped"]},
            {"name": "eap_started_at", "display": "Started At", "type": "DateTime", "required": True},
            {"name": "eap_completed_at", "display": "Completed At", "type": "DateTime", "required": False},
            {"name": "eap_error_message", "display": "Error Message", "type": "Text", "length": 500, "required": False},
        ]
    },
    "trigger_history": {
        "schema_name": "eap_trigger_history",
        "display_name": "Trigger History",
        "plural_name": "Trigger History",
        "description": "History of fired proactive triggers",
        "primary_attribute": "eap_trigger_code",
        "primary_attribute_display": "Trigger Code",
        "columns": [
            {"name": "eap_trigger_code", "display": "Trigger Code", "type": "Text", "length": 50, "required": True},
            {"name": "eap_session_id", "display": "Session ID", "type": "Text", "length": 50, "required": True},
            {"name": "eap_user_id", "display": "User ID", "type": "Text", "length": 100, "required": True},
            {"name": "eap_fired_at", "display": "Fired At", "type": "DateTime", "required": True},
            {"name": "eap_message_delivered", "display": "Message Delivered", "type": "MultilineText", "length": 1000, "required": False},
            {"name": "eap_user_response", "display": "User Response", "type": "Choice", "required": False, "options": ["engaged", "dismissed", "ignored"]},
            {"name": "eap_context_snapshot_json", "display": "Context Snapshot", "type": "MultilineText", "length": 4000, "required": False},
        ]
    }
}


def get_token():
    """Get access token using MSAL - tries silent acquisition first."""
    if not MSAL_AVAILABLE:
        print("MSAL not available. Please install: pip install msal")
        return None

    auth = MSALAuthenticator(TENANT_ID, CLIENT_ID)

    # Try silent acquisition first from cached tokens
    accounts = auth._app.get_accounts()
    if accounts:
        scope = f"{ENVIRONMENT_URL}/.default"
        result = auth._app.acquire_token_silent([scope], account=accounts[0])
        if result and "access_token" in result:
            print("Using cached token")
            return result["access_token"]

    # Fall back to device code flow if needed
    try:
        token = auth.get_dataverse_token(ENVIRONMENT_URL)
        return token
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        return None


def check_table_exists(api_url: str, token: str, logical_name: str) -> bool:
    """Check if a table already exists."""
    import requests

    url = f"{api_url}/EntityDefinitions(LogicalName='{logical_name}')"
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json"
    }

    response = requests.get(url, headers=headers)
    return response.status_code == 200


def create_table(api_url: str, token: str, table_def: Dict[str, Any], dry_run: bool = False) -> bool:
    """Create a table in Dataverse."""
    import requests

    schema_name = table_def["schema_name"]

    if dry_run:
        print(f"  [DRY RUN] Would create table: {schema_name}")
        return True

    # Check if exists
    if check_table_exists(api_url, token, schema_name):
        print(f"  Table {schema_name} already exists, skipping table creation...")
        return True

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json"
    }

    # Build entity definition
    entity_def = {
        "@odata.type": "Microsoft.Dynamics.CRM.EntityMetadata",
        "SchemaName": schema_name,
        "DisplayName": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [{
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": table_def["display_name"],
                "LanguageCode": 1033
            }]
        },
        "DisplayCollectionName": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [{
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": table_def["plural_name"],
                "LanguageCode": 1033
            }]
        },
        "Description": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [{
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": table_def["description"],
                "LanguageCode": 1033
            }]
        },
        "OwnershipType": "OrganizationOwned",
        "IsActivity": False,
        "HasNotes": False,
        "HasActivities": False,
        "PrimaryNameAttribute": table_def["primary_attribute"],
        "Attributes": [{
            "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
            "SchemaName": table_def["primary_attribute"],
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": table_def["primary_attribute_display"],
                    "LanguageCode": 1033
                }]
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired",
                "CanBeChanged": False
            },
            "MaxLength": 200,
            "IsPrimaryName": True
        }]
    }

    url = f"{api_url}/EntityDefinitions"
    response = requests.post(url, headers=headers, json=entity_def)

    if response.status_code in (200, 201, 204):
        print(f"  Created table: {schema_name}")
        return True
    else:
        print(f"  ERROR creating table {schema_name}: {response.status_code}")
        print(f"  {response.text[:500]}")
        return False


def add_column(api_url: str, token: str, table_name: str, column_def: Dict[str, Any], dry_run: bool = False) -> bool:
    """Add a column to an existing table."""
    import requests

    col_name = column_def["name"]
    col_type = column_def["type"]

    if dry_run:
        print(f"    [DRY RUN] Would add column: {col_name} ({col_type})")
        return True

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json"
    }

    # Build attribute metadata based on type
    if col_type == "Text":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
            "SchemaName": col_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": column_def["display"],
                    "LanguageCode": 1033
                }]
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired" if column_def.get("required") else "None",
                "CanBeChanged": True
            },
            "MaxLength": column_def.get("length", 100),
            "FormatName": {"Value": "Text"}
        }
    elif col_type == "MultilineText":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.MemoAttributeMetadata",
            "SchemaName": col_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": column_def["display"],
                    "LanguageCode": 1033
                }]
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired" if column_def.get("required") else "None",
                "CanBeChanged": True
            },
            "MaxLength": column_def.get("length", 2000)
        }
    elif col_type == "Integer":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.IntegerAttributeMetadata",
            "SchemaName": col_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": column_def["display"],
                    "LanguageCode": 1033
                }]
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired" if column_def.get("required") else "None",
                "CanBeChanged": True
            },
            "MinValue": -2147483648,
            "MaxValue": 2147483647
        }
    elif col_type == "Currency":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.MoneyAttributeMetadata",
            "SchemaName": col_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": column_def["display"],
                    "LanguageCode": 1033
                }]
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired" if column_def.get("required") else "None",
                "CanBeChanged": True
            },
            "Precision": 2,
            "MinValue": 0,
            "MaxValue": 922337203685477.0
        }
    elif col_type == "Boolean":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.BooleanAttributeMetadata",
            "SchemaName": col_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": column_def["display"],
                    "LanguageCode": 1033
                }]
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired" if column_def.get("required") else "None",
                "CanBeChanged": True
            },
            "DefaultValue": column_def.get("default", False),
            "OptionSet": {
                "TrueOption": {
                    "Value": 1,
                    "Label": {
                        "@odata.type": "Microsoft.Dynamics.CRM.Label",
                        "LocalizedLabels": [{
                            "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                            "Label": "Yes",
                            "LanguageCode": 1033
                        }]
                    }
                },
                "FalseOption": {
                    "Value": 0,
                    "Label": {
                        "@odata.type": "Microsoft.Dynamics.CRM.Label",
                        "LocalizedLabels": [{
                            "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                            "Label": "No",
                            "LanguageCode": 1033
                        }]
                    }
                }
            }
        }
    elif col_type == "DateTime":
        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata",
            "SchemaName": col_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": column_def["display"],
                    "LanguageCode": 1033
                }]
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired" if column_def.get("required") else "None",
                "CanBeChanged": True
            },
            "Format": "DateAndTime"
        }
    elif col_type == "Choice":
        # Build option set
        options = column_def.get("options", [])
        option_items = []
        for i, opt in enumerate(options):
            option_items.append({
                "Value": i + 1,
                "Label": {
                    "@odata.type": "Microsoft.Dynamics.CRM.Label",
                    "LocalizedLabels": [{
                        "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                        "Label": opt,
                        "LanguageCode": 1033
                    }]
                }
            })

        attr_def = {
            "@odata.type": "Microsoft.Dynamics.CRM.PicklistAttributeMetadata",
            "SchemaName": col_name,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [{
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": column_def["display"],
                    "LanguageCode": 1033
                }]
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired" if column_def.get("required") else "None",
                "CanBeChanged": True
            },
            "OptionSet": {
                "@odata.type": "Microsoft.Dynamics.CRM.OptionSetMetadata",
                "IsGlobal": False,
                "OptionSetType": "Picklist",
                "Options": option_items
            }
        }
    else:
        print(f"    WARNING: Unknown column type {col_type} for {col_name}")
        return False

    url = f"{api_url}/EntityDefinitions(LogicalName='{table_name}')/Attributes"
    response = requests.post(url, headers=headers, json=attr_def)

    if response.status_code in (200, 201, 204):
        print(f"    Added column: {col_name}")
        return True
    elif response.status_code == 400 and "already exists" in response.text.lower():
        print(f"    Column {col_name} already exists, skipping...")
        return True
    else:
        print(f"    ERROR adding column {col_name}: {response.status_code}")
        print(f"    {response.text[:300]}")
        return False


def create_full_table(api_url: str, token: str, table_key: str, dry_run: bool = False) -> bool:
    """Create a table with all its columns."""
    table_def = TABLE_DEFINITIONS.get(table_key)
    if not table_def:
        print(f"Unknown table: {table_key}")
        return False

    print(f"\nCreating table: {table_def['display_name']} ({table_def['schema_name']})")

    # Create the table
    if not create_table(api_url, token, table_def, dry_run):
        return False

    # Wait for table to be ready
    if not dry_run:
        time.sleep(3)

    # Add columns (skip primary attribute as it's created with the table)
    schema_name = table_def["schema_name"]
    primary_attr = table_def["primary_attribute"]

    for col in table_def["columns"]:
        if col["name"] == primary_attr:
            continue  # Skip primary attribute

        if not add_column(api_url, token, schema_name, col, dry_run):
            print(f"  Warning: Failed to add column {col['name']}")

        # Small delay between columns
        if not dry_run:
            time.sleep(0.5)

    return True


def main():
    parser = argparse.ArgumentParser(
        description="Create MPA v6.1 H1+H2 enhancement tables in Dataverse"
    )
    parser.add_argument(
        "--table",
        choices=list(TABLE_DEFINITIONS.keys()) + ["all"],
        default="all",
        help="Which table to create (default: all)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be created without making changes"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("MPA v6.1 H1+H2 Enhancement - Dataverse Table Creation")
    print("=" * 60)

    print(f"\nDataverse API: {API_URL}")

    if args.dry_run:
        print("\n[DRY RUN MODE] No changes will be made")
        token = "dry-run-token"
    else:
        print("\nGetting authentication token...")
        token = get_token()
        if not token:
            print("Failed to get authentication token")
            sys.exit(1)
        print("Authentication successful!")

    # Determine tables to create
    if args.table == "all":
        tables = list(TABLE_DEFINITIONS.keys())
    else:
        tables = [args.table]

    # Create tables
    results = {}
    for table in tables:
        if args.dry_run:
            table_def = TABLE_DEFINITIONS[table]
            print(f"\nTable: {table_def['display_name']} ({table_def['schema_name']})")
            print(f"  Primary: {table_def['primary_attribute']}")
            print(f"  Columns: {len(table_def['columns'])}")
            for col in table_def["columns"]:
                req = "*" if col.get("required") else ""
                print(f"    - {col['name']}: {col['type']}{req}")
            results[table] = True
        else:
            success = create_full_table(API_URL, token, table, dry_run=False)
            results[table] = success

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    for table, success in results.items():
        status = "OK" if success else "FAILED"
        table_def = TABLE_DEFINITIONS[table]
        print(f"  {table_def['schema_name']:35} [{status}]")

    success_count = sum(1 for s in results.values() if s)
    print(f"\nTotal: {success_count}/{len(results)} tables created successfully")

    if not all(results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
