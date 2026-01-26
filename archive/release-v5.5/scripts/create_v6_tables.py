#!/usr/bin/env python3
"""
MPA v6.0 Reference Data - Dataverse Table Creation Script

Creates the 5 new reference data tables in Dataverse using the Web API.

Tables:
    - mpa_geography: Geographic regions with demographics
    - mpa_iab_taxonomy: IAB Content Taxonomy 3.0 codes
    - mpa_platform_taxonomy: Platform audience taxonomies
    - mpa_behavioral_attribute: Behavioral targeting signals
    - mpa_contextual_attribute: Contextual targeting signals

Usage:
    python create_v6_tables.py [--table TABLE] [--dry-run]

Examples:
    python create_v6_tables.py --dry-run           # Show what would be created
    python create_v6_tables.py --table geography   # Create geography table only
    python create_v6_tables.py                     # Create all tables
"""

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from auth.msal_auth import MSALAuthenticator, AuthenticationError
from config.settings import Settings


# Dataverse type mappings
DATAVERSE_TYPES = {
    "Text": "String",
    "MultilineText": "Memo",
    "Integer": "Integer",
    "Decimal": "Decimal",
    "Boolean": "Boolean",
    "DateTime": "DateTime",
    "UniqueIdentifier": "Uniqueidentifier"
}


# Table definitions for v6.0 reference data
TABLE_DEFINITIONS = {
    "geography": {
        "schema_name": "mpa_geography",
        "display_name": "Geography",
        "plural_name": "Geographies",
        "description": "Geographic reference data for media planning including DMAs, CMAs, and regional markets",
        "primary_attribute": "mpa_geoname",
        "primary_attribute_display": "Geographic Name",
        "columns": [
            {"name": "mpa_geoid", "display": "Geo ID", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_country", "display": "Country", "type": "Text", "length": 10, "required": True},
            {"name": "mpa_geotype", "display": "Geo Type", "type": "Text", "length": 20, "required": True},
            {"name": "mpa_geocode", "display": "Geo Code", "type": "Text", "length": 20, "required": True},
            {"name": "mpa_geoname", "display": "Geographic Name", "type": "Text", "length": 200, "required": True},
            {"name": "mpa_georank", "display": "Geo Rank", "type": "Integer", "required": False},
            {"name": "mpa_totalpopulation", "display": "Total Population", "type": "Integer", "required": False},
            {"name": "mpa_totalhouseholds", "display": "Total Households", "type": "Integer", "required": False},
            {"name": "mpa_medianage", "display": "Median Age", "type": "Decimal", "required": False},
            {"name": "mpa_medianhhi", "display": "Median HHI", "type": "Decimal", "required": False},
            {"name": "mpa_pctmale", "display": "Pct Male", "type": "Decimal", "required": False},
            {"name": "mpa_pctfemale", "display": "Pct Female", "type": "Decimal", "required": False},
            {"name": "mpa_pctage0to17", "display": "Pct Age 0-17", "type": "Decimal", "required": False},
            {"name": "mpa_pctage18to34", "display": "Pct Age 18-34", "type": "Decimal", "required": False},
            {"name": "mpa_pctage25to54", "display": "Pct Age 25-54", "type": "Decimal", "required": False},
            {"name": "mpa_pctage55plus", "display": "Pct Age 55+", "type": "Decimal", "required": False},
            {"name": "mpa_pcthhiunder50k", "display": "Pct HHI Under 50k", "type": "Decimal", "required": False},
            {"name": "mpa_pcthhi50kto100k", "display": "Pct HHI 50k-100k", "type": "Decimal", "required": False},
            {"name": "mpa_pcthhiover100k", "display": "Pct HHI Over 100k", "type": "Decimal", "required": False},
            {"name": "mpa_pcthhiover150k", "display": "Pct HHI Over 150k", "type": "Decimal", "required": False},
            {"name": "mpa_pctcollegedegree", "display": "Pct College Degree", "type": "Decimal", "required": False},
            {"name": "mpa_pctgraduatedegree", "display": "Pct Graduate Degree", "type": "Decimal", "required": False},
            {"name": "mpa_stateprimary", "display": "State Primary", "type": "Text", "length": 50, "required": False},
            {"name": "mpa_statesincluded", "display": "States Included", "type": "Text", "length": 500, "required": False},
            {"name": "mpa_datasource", "display": "Data Source", "type": "Text", "length": 100, "required": False},
            {"name": "mpa_datayear", "display": "Data Year", "type": "Integer", "required": False},
            {"name": "mpa_isactive", "display": "Is Active", "type": "Boolean", "required": True, "default": True},
        ]
    },
    "iab_taxonomy": {
        "schema_name": "mpa_iab_taxonomy",
        "display_name": "IAB Taxonomy",
        "plural_name": "IAB Taxonomies",
        "description": "IAB Content Taxonomy 3.0 codes for contextual targeting",
        "primary_attribute": "mpa_iabname",
        "primary_attribute_display": "IAB Name",
        "columns": [
            {"name": "mpa_iabid", "display": "IAB ID", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_iabcode", "display": "IAB Code", "type": "Text", "length": 20, "required": True},
            {"name": "mpa_iabname", "display": "IAB Name", "type": "Text", "length": 200, "required": True},
            {"name": "mpa_iabtier", "display": "IAB Tier", "type": "Integer", "required": True},
            {"name": "mpa_iabparentcode", "display": "IAB Parent Code", "type": "Text", "length": 20, "required": False},
            {"name": "mpa_iabdescription", "display": "IAB Description", "type": "MultilineText", "length": 1000, "required": False},
            {"name": "mpa_verticalrelevance", "display": "Vertical Relevance", "type": "Text", "length": 500, "required": False},
            {"name": "mpa_contextualsignalstrength", "display": "Contextual Signal Strength", "type": "Text", "length": 20, "required": False},
            {"name": "mpa_isactive", "display": "Is Active", "type": "Boolean", "required": True, "default": True},
        ]
    },
    "platform_taxonomy": {
        "schema_name": "mpa_platform_taxonomy",
        "display_name": "Platform Taxonomy",
        "plural_name": "Platform Taxonomies",
        "description": "Platform-specific audience taxonomy segments for Google, Meta, LinkedIn",
        "primary_attribute": "mpa_segmentname",
        "primary_attribute_display": "Segment Name",
        "columns": [
            {"name": "mpa_segmentid", "display": "Segment ID", "type": "Text", "length": 100, "required": True},
            {"name": "mpa_platform", "display": "Platform", "type": "Text", "length": 20, "required": True},
            {"name": "mpa_taxonomytype", "display": "Taxonomy Type", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_segmentpath", "display": "Segment Path", "type": "Text", "length": 500, "required": True},
            {"name": "mpa_segmentname", "display": "Segment Name", "type": "Text", "length": 200, "required": True},
            {"name": "mpa_parentpath", "display": "Parent Path", "type": "Text", "length": 500, "required": False},
            {"name": "mpa_tier", "display": "Tier", "type": "Integer", "required": True},
            {"name": "mpa_verticalrelevance", "display": "Vertical Relevance", "type": "Text", "length": 500, "required": False},
            {"name": "mpa_reachtier", "display": "Reach Tier", "type": "Text", "length": 20, "required": False},
            {"name": "mpa_lastverified", "display": "Last Verified", "type": "DateTime", "required": False},
            {"name": "mpa_isactive", "display": "Is Active", "type": "Boolean", "required": True, "default": True},
        ]
    },
    "behavioral_attribute": {
        "schema_name": "mpa_behavioral_attribute",
        "display_name": "Behavioral Attribute",
        "plural_name": "Behavioral Attributes",
        "description": "Behavioral targeting signals and attributes for audience segmentation",
        "primary_attribute": "mpa_behaviorname",
        "primary_attribute_display": "Behavior Name",
        "columns": [
            {"name": "mpa_behaviorid", "display": "Behavior ID", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_behaviorcategory", "display": "Behavior Category", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_behaviorname", "display": "Behavior Name", "type": "Text", "length": 200, "required": True},
            {"name": "mpa_behaviordescription", "display": "Behavior Description", "type": "MultilineText", "length": 1000, "required": False},
            {"name": "mpa_signaltype", "display": "Signal Type", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_platformsavailable", "display": "Platforms Available", "type": "Text", "length": 200, "required": False},
            {"name": "mpa_verticalrelevance", "display": "Vertical Relevance", "type": "Text", "length": 500, "required": False},
            {"name": "mpa_intentlevel", "display": "Intent Level", "type": "Text", "length": 20, "required": False},
            {"name": "mpa_datafreshness", "display": "Data Freshness", "type": "Text", "length": 50, "required": False},
            {"name": "mpa_isactive", "display": "Is Active", "type": "Boolean", "required": True, "default": True},
        ]
    },
    "contextual_attribute": {
        "schema_name": "mpa_contextual_attribute",
        "display_name": "Contextual Attribute",
        "plural_name": "Contextual Attributes",
        "description": "Contextual targeting signals for content environment and placement",
        "primary_attribute": "mpa_contextname",
        "primary_attribute_display": "Context Name",
        "columns": [
            {"name": "mpa_contextid", "display": "Context ID", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_contextcategory", "display": "Context Category", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_contextname", "display": "Context Name", "type": "Text", "length": 200, "required": True},
            {"name": "mpa_contextdescription", "display": "Context Description", "type": "MultilineText", "length": 1000, "required": False},
            {"name": "mpa_iabmapping", "display": "IAB Mapping", "type": "Text", "length": 100, "required": False},
            {"name": "mpa_signaltype", "display": "Signal Type", "type": "Text", "length": 50, "required": True},
            {"name": "mpa_brandsafetytier", "display": "Brand Safety Tier", "type": "Text", "length": 20, "required": False},
            {"name": "mpa_verticalrelevance", "display": "Vertical Relevance", "type": "Text", "length": 500, "required": False},
            {"name": "mpa_isactive", "display": "Is Active", "type": "Boolean", "required": True, "default": True},
        ]
    }
}


class DataverseTableCreator:
    """Creates Dataverse tables using the Web API."""

    def __init__(self, api_url: str, get_token):
        self.api_url = api_url.rstrip("/")
        self.get_token = get_token
        self.publisher_prefix = "mpa"

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.get_token()}",
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json"
        }

    def table_exists(self, logical_name: str) -> bool:
        """Check if a table already exists."""
        url = f"{self.api_url}/EntityDefinitions(LogicalName='{logical_name}')"
        response = requests.get(url, headers=self._headers())
        return response.status_code == 200

    def create_table(self, table_def: Dict[str, Any], dry_run: bool = False) -> bool:
        """
        Create a table in Dataverse.

        Args:
            table_def: Table definition from TABLE_DEFINITIONS
            dry_run: If True, don't actually create

        Returns:
            True if successful or already exists
        """
        schema_name = table_def["schema_name"]

        # Check if exists
        if self.table_exists(schema_name):
            print(f"  Table {schema_name} already exists, skipping...")
            return True

        if dry_run:
            print(f"  [DRY RUN] Would create table: {schema_name}")
            return True

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

        # Create the table
        url = f"{self.api_url}/EntityDefinitions"
        response = requests.post(url, headers=self._headers(), json=entity_def)

        if response.status_code in (200, 201, 204):
            print(f"  Created table: {schema_name}")
            return True
        else:
            print(f"  ERROR creating table {schema_name}: {response.status_code}")
            print(f"  {response.text[:500]}")
            return False

    def add_column(self, table_name: str, column_def: Dict[str, Any], dry_run: bool = False) -> bool:
        """
        Add a column to an existing table.

        Args:
            table_name: Logical name of the table
            column_def: Column definition
            dry_run: If True, don't actually create

        Returns:
            True if successful or already exists
        """
        col_name = column_def["name"]
        col_type = column_def["type"]

        if dry_run:
            print(f"    [DRY RUN] Would add column: {col_name} ({col_type})")
            return True

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
        elif col_type == "Decimal":
            attr_def = {
                "@odata.type": "Microsoft.Dynamics.CRM.DecimalAttributeMetadata",
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
                "MinValue": -100000000000,
                "MaxValue": 100000000000
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
                "Format": "DateOnly"
            }
        else:
            print(f"    WARNING: Unknown column type {col_type} for {col_name}")
            return False

        # Add the attribute
        url = f"{self.api_url}/EntityDefinitions(LogicalName='{table_name}')/Attributes"
        response = requests.post(url, headers=self._headers(), json=attr_def)

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

    def create_full_table(self, table_key: str, dry_run: bool = False) -> bool:
        """
        Create a table with all its columns.

        Args:
            table_key: Key in TABLE_DEFINITIONS
            dry_run: If True, don't actually create

        Returns:
            True if successful
        """
        table_def = TABLE_DEFINITIONS.get(table_key)
        if not table_def:
            print(f"Unknown table: {table_key}")
            return False

        print(f"\nCreating table: {table_def['display_name']}")

        # Create the table
        if not self.create_table(table_def, dry_run):
            return False

        # Wait for table to be ready
        if not dry_run:
            time.sleep(2)

        # Add columns (skip primary attribute as it's created with the table)
        schema_name = table_def["schema_name"]
        primary_attr = table_def["primary_attribute"]

        for col in table_def["columns"]:
            if col["name"] == primary_attr:
                continue  # Skip primary attribute

            if not self.add_column(schema_name, col, dry_run):
                print(f"  Warning: Failed to add column {col['name']}")

            # Small delay between columns
            if not dry_run:
                time.sleep(0.5)

        return True


def main():
    parser = argparse.ArgumentParser(
        description="Create MPA v6.0 reference data tables in Dataverse"
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
    parser.add_argument(
        "--env",
        choices=["personal", "mastercard"],
        default="personal",
        help="Environment to use (default: personal). Uses environment.{env}.json config."
    )

    args = parser.parse_args()

    print("=" * 60)
    print("MPA v6.0 Reference Data - Table Creation")
    print("=" * 60)

    # Load settings
    try:
        settings = Settings(env_name=args.env)
        print(f"\nEnvironment: {args.env}")
        print(f"Dataverse URL: {settings.dataverse.environment_url}")
        print(f"API URL: {settings.dataverse.api_url}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    if args.dry_run:
        print("\n[DRY RUN MODE] No changes will be made")

    # Authenticate
    if not args.dry_run:
        print("\nAuthenticating...")
        try:
            auth = MSALAuthenticator(
                settings.auth.tenant_id,
                settings.auth.client_id
            )
            token = auth.get_dataverse_token(settings.dataverse.environment_url)
            print("Authentication successful!")

            creator = DataverseTableCreator(
                settings.dataverse.api_url,
                lambda: auth.get_dataverse_token(settings.dataverse.environment_url)
            )
        except AuthenticationError as e:
            print(f"Authentication failed: {e}")
            sys.exit(1)
    else:
        creator = None

    # Determine tables to create
    if args.table == "all":
        tables = list(TABLE_DEFINITIONS.keys())
    else:
        tables = [args.table]

    # Create tables
    results = {}
    for table in tables:
        if args.dry_run:
            # Show what would be created
            table_def = TABLE_DEFINITIONS[table]
            print(f"\nTable: {table_def['display_name']} ({table_def['schema_name']})")
            print(f"  Primary: {table_def['primary_attribute']}")
            print(f"  Columns: {len(table_def['columns'])}")
            for col in table_def["columns"]:
                req = "*" if col.get("required") else ""
                print(f"    - {col['name']}: {col['type']}{req}")
            results[table] = True
        else:
            success = creator.create_full_table(table, dry_run=False)
            results[table] = success

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    for table, success in results.items():
        status = "OK" if success else "FAILED"
        print(f"  {table:25} [{status}]")

    if not all(results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
