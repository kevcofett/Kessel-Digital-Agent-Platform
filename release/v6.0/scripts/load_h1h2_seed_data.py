#!/usr/bin/env python3
"""
MPA v6.1 H1+H2 Enhancement - Seed Data Loader

Loads seed data for proactive triggers and workflow definitions into Dataverse.
"""

import csv
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import requests

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from auth.msal_auth import MSALAuthenticator, AuthenticationError
    MSAL_AVAILABLE = True
except ImportError:
    MSAL_AVAILABLE = False
    print("Warning: MSAL auth not available")


# Configuration
TENANT_ID = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"
CLIENT_ID = "f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8"
ENVIRONMENT_URL = "https://aragornai.crm.dynamics.com"
API_URL = "https://aragornai.api.crm.dynamics.com/api/data/v9.2"

# Seed file paths
BASE_DIR = Path(__file__).parent.parent.parent.parent / "base" / "dataverse" / "seed"
TRIGGER_SEED_FILE = BASE_DIR / "eap_proactive_trigger_seed_corrected.csv"
WORKFLOW_SEED_FILE = BASE_DIR / "eap_workflow_definition_seed_corrected.csv"


def get_token():
    """Get access token using MSAL."""
    if not MSAL_AVAILABLE:
        print("MSAL not available. Please install: pip install msal")
        return None

    auth = MSALAuthenticator(TENANT_ID, CLIENT_ID)

    # Try silent acquisition first
    accounts = auth._app.get_accounts()
    if accounts:
        scope = f"{ENVIRONMENT_URL}/.default"
        result = auth._app.acquire_token_silent([scope], account=accounts[0])
        if result and "access_token" in result:
            print("Using cached token")
            return result["access_token"]

    # Fall back to device code flow
    try:
        token = auth.get_dataverse_token(ENVIRONMENT_URL)
        return token
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        return None


def get_headers(token: str) -> Dict[str, str]:
    """Get API request headers."""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Prefer": "return=representation"
    }


def check_record_exists(token: str, table_name: str, filter_field: str, filter_value: str) -> bool:
    """Check if a record already exists."""
    url = f"{API_URL}/{table_name}?$filter={filter_field} eq '{filter_value}'"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code == 200:
        data = response.json()
        return len(data.get("value", [])) > 0
    return False


def convert_value(value: str, field_name: str) -> Any:
    """Convert string value to appropriate type for Dataverse."""
    if value == "" or value is None:
        return None

    # Boolean fields
    if field_name.endswith("_is_active") or field_name.endswith("_is_persistent"):
        return value.lower() == "true"

    # Integer fields
    if any(x in field_name for x in ["_priority_order", "_cooldown_hours", "_duration_seconds", "_count", "_score"]):
        try:
            return int(value)
        except ValueError:
            return None

    # DateTime fields
    if field_name.endswith("_at"):
        return value  # Keep as ISO string

    # Choice fields - need to map to integer values
    choice_mappings = {
        "eap_trigger_category": {"alert": 1, "opportunity": 2, "recommendation": 3, "warning": 4},
        "eap_severity": {"critical": 1, "important": 2, "suggestion": 3, "info": 4},
        "eap_output_type": {"plan": 1, "analysis": 2, "recommendation": 3, "document": 4},
    }

    if field_name in choice_mappings:
        return choice_mappings[field_name].get(value.lower(), 1)

    return value


def load_triggers(token: str, dry_run: bool = False) -> tuple:
    """Load proactive trigger seed data."""
    print("\n" + "=" * 60)
    print("Loading Proactive Triggers")
    print("=" * 60)

    if not TRIGGER_SEED_FILE.exists():
        print(f"ERROR: Seed file not found: {TRIGGER_SEED_FILE}")
        return 0, 0

    loaded = 0
    skipped = 0

    with open(TRIGGER_SEED_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Found {len(rows)} triggers to load")

    for row in rows:
        trigger_code = row.get("eap_trigger_code", "")
        trigger_name = row.get("eap_trigger_name", "")

        print(f"\n  Processing: {trigger_code} ({trigger_name})")

        # Check if already exists
        if check_record_exists(token, "eap_proactive_triggers", "eap_trigger_code", trigger_code):
            print(f"    Already exists, skipping...")
            skipped += 1
            continue

        if dry_run:
            print(f"    [DRY RUN] Would create")
            loaded += 1
            continue

        # Build record data
        record = {}
        for key, value in row.items():
            if value:
                converted = convert_value(value, key)
                if converted is not None:
                    record[key] = converted

        # Create record
        url = f"{API_URL}/eap_proactive_triggers"
        response = requests.post(url, headers=get_headers(token), json=record)

        if response.status_code in (200, 201, 204):
            print(f"    Created successfully")
            loaded += 1
        else:
            print(f"    ERROR: {response.status_code}")
            print(f"    {response.text[:300]}")

        time.sleep(0.3)  # Rate limiting

    return loaded, skipped


def load_workflows(token: str, dry_run: bool = False) -> tuple:
    """Load workflow definition seed data."""
    print("\n" + "=" * 60)
    print("Loading Workflow Definitions")
    print("=" * 60)

    if not WORKFLOW_SEED_FILE.exists():
        print(f"ERROR: Seed file not found: {WORKFLOW_SEED_FILE}")
        return 0, 0

    loaded = 0
    skipped = 0

    with open(WORKFLOW_SEED_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Found {len(rows)} workflows to load")

    for row in rows:
        workflow_code = row.get("eap_workflow_code", "")
        workflow_name = row.get("eap_workflow_name", "")

        print(f"\n  Processing: {workflow_code} ({workflow_name})")

        # Check if already exists
        if check_record_exists(token, "eap_workflow_definitions", "eap_workflow_code", workflow_code):
            print(f"    Already exists, skipping...")
            skipped += 1
            continue

        if dry_run:
            print(f"    [DRY RUN] Would create")
            loaded += 1
            continue

        # Build record data
        record = {}
        for key, value in row.items():
            if value:
                converted = convert_value(value, key)
                if converted is not None:
                    record[key] = converted

        # Create record
        url = f"{API_URL}/eap_workflow_definitions"
        response = requests.post(url, headers=get_headers(token), json=record)

        if response.status_code in (200, 201, 204):
            print(f"    Created successfully")
            loaded += 1
        else:
            print(f"    ERROR: {response.status_code}")
            print(f"    {response.text[:300]}")

        time.sleep(0.3)  # Rate limiting

    return loaded, skipped


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Load H1+H2 seed data into Dataverse")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be loaded without making changes")
    parser.add_argument("--triggers-only", action="store_true", help="Load only triggers")
    parser.add_argument("--workflows-only", action="store_true", help="Load only workflows")

    args = parser.parse_args()

    print("=" * 60)
    print("MPA v6.1 H1+H2 Seed Data Loader")
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

    trigger_loaded, trigger_skipped = 0, 0
    workflow_loaded, workflow_skipped = 0, 0

    if not args.workflows_only:
        trigger_loaded, trigger_skipped = load_triggers(token, args.dry_run)

    if not args.triggers_only:
        workflow_loaded, workflow_skipped = load_workflows(token, args.dry_run)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"\nProactive Triggers:")
    print(f"  Loaded: {trigger_loaded}")
    print(f"  Skipped (already exist): {trigger_skipped}")

    print(f"\nWorkflow Definitions:")
    print(f"  Loaded: {workflow_loaded}")
    print(f"  Skipped (already exist): {workflow_skipped}")

    total_loaded = trigger_loaded + workflow_loaded
    total_skipped = trigger_skipped + workflow_skipped
    print(f"\nTotal: {total_loaded} loaded, {total_skipped} skipped")


if __name__ == "__main__":
    main()
