#!/usr/bin/env python3
"""
KDAP ML Endpoints Registration Script

Registers Azure Function ML scoring endpoints in the eap_capability_implementation
Dataverse table for agent integration.
"""

import sys
import time
import uuid
from pathlib import Path
from typing import Dict, Optional

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

# ML Endpoint definitions - capability codes match MPA_ML_Endpoint_Router flow
ML_ENDPOINTS = [
    {
        "capability_code": "ANL_BUDGET_OPTIMIZE",
        "capability_name": "Budget Optimization ML Model",
        "description": "ML model for optimizing budget allocation across channels using gradient descent and diminishing returns curves",
        "implementation_type": "AZURE_ML_ENDPOINT",
        "endpoint_url": "https://kdap-ml-budget-optimizer.azurewebsites.net/api/score",
        "agent_code": "ANL",
        "is_active": True
    },
    {
        "capability_code": "AUD_PROPENSITY_SCORE",
        "capability_name": "Propensity Scoring ML Model",
        "description": "ML model for customer propensity scoring and conversion likelihood prediction",
        "implementation_type": "AZURE_ML_ENDPOINT",
        "endpoint_url": "https://kdap-ml-propensity.azurewebsites.net/api/score",
        "agent_code": "AUD",
        "is_active": True
    },
    {
        "capability_code": "PRF_ANOMALY_DETECT",
        "capability_name": "Anomaly Detection ML Model",
        "description": "ML model for detecting anomalies in campaign performance metrics using statistical methods",
        "implementation_type": "AZURE_ML_ENDPOINT",
        "endpoint_url": "https://kdap-ml-anomaly-detector.azurewebsites.net/api/score",
        "agent_code": "PRF",
        "is_active": True
    },
    {
        "capability_code": "ANL_MONTECARLO",
        "capability_name": "Monte Carlo Simulation Model",
        "description": "Monte Carlo simulation for campaign outcome forecasting and risk analysis",
        "implementation_type": "AZURE_ML_ENDPOINT",
        "endpoint_url": "https://kdap-ml-monte-carlo.azurewebsites.net/api/score",
        "agent_code": "ANL",
        "is_active": True
    },
    {
        "capability_code": "CHA_MEDIA_MIX",
        "capability_name": "Media Mix Modeling",
        "description": "Media mix modeling for channel contribution analysis and optimization recommendations",
        "implementation_type": "AZURE_ML_ENDPOINT",
        "endpoint_url": "https://kdap-ml-media-mix.azurewebsites.net/api/score",
        "agent_code": "CHA",
        "is_active": True
    },
    {
        "capability_code": "ANL_ATTRIBUTION",
        "capability_name": "Attribution Modeling",
        "description": "Multi-touch attribution modeling for conversion path analysis",
        "implementation_type": "AZURE_ML_ENDPOINT",
        "endpoint_url": "https://kdap-ml-attribution.azurewebsites.net/api/score",
        "agent_code": "ANL",
        "is_active": True
    },
    {
        "capability_code": "CST_PRIORITIZE",
        "capability_name": "Action Prioritization Model",
        "description": "ML model for prioritizing optimization actions based on expected impact",
        "implementation_type": "AZURE_ML_ENDPOINT",
        "endpoint_url": "https://kdap-ml-prioritizer.azurewebsites.net/api/score",
        "agent_code": "CST",
        "is_active": True
    }
]


def get_token() -> Optional[str]:
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


def check_record_exists(token: str, capability_code: str) -> Optional[str]:
    """Check if a capability implementation already exists. Returns record ID if found."""
    url = f"{API_URL}/eap_capability_implementations?$filter=eap_capability_code eq '{capability_code}'&$select=eap_capability_implementationid"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code == 200:
        data = response.json()
        records = data.get("value", [])
        if records:
            return records[0].get("eap_capability_implementationid")
    return None


def create_capability_implementation(token: str, endpoint: Dict) -> bool:
    """Create a new capability implementation record."""
    record = {
        "eap_capability_code": endpoint["capability_code"],
        "eap_capability_name": endpoint["capability_name"],
        "eap_description": endpoint["description"],
        "eap_implementation_type": endpoint["implementation_type"],
        "eap_endpoint_url": endpoint["endpoint_url"],
        "eap_agent_code": endpoint["agent_code"],
        "eap_version": "1.0.0",
        # Note: eap_auth_type column may not be available yet
    }

    url = f"{API_URL}/eap_capability_implementations"
    response = requests.post(url, headers=get_headers(token), json=record)

    if response.status_code in (200, 201, 204):
        return True
    else:
        print(f"    ERROR: {response.status_code}")
        print(f"    {response.text[:500]}")
        return False


def update_capability_implementation(token: str, record_id: str, endpoint: Dict) -> bool:
    """Update an existing capability implementation record."""
    record = {
        "eap_capability_name": endpoint["capability_name"],
        "eap_description": endpoint["description"],
        "eap_implementation_type": endpoint["implementation_type"],
        "eap_endpoint_url": endpoint["endpoint_url"],
        "eap_agent_code": endpoint["agent_code"],
        "eap_version": "1.0.0",
        # Note: eap_auth_type column may not be available yet
    }

    url = f"{API_URL}/eap_capability_implementations({record_id})"
    response = requests.patch(url, headers=get_headers(token), json=record)

    if response.status_code in (200, 204):
        return True
    else:
        print(f"    ERROR: {response.status_code}")
        print(f"    {response.text[:500]}")
        return False


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Register ML endpoints in Dataverse")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be registered without making changes")
    parser.add_argument("--update", action="store_true", help="Update existing records instead of skipping")

    args = parser.parse_args()

    print("=" * 60)
    print("KDAP ML Endpoints Registration")
    print("=" * 60)
    print(f"\nDataverse API: {API_URL}")
    print(f"Endpoints to register: {len(ML_ENDPOINTS)}")

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

    created = 0
    updated = 0
    skipped = 0
    errors = 0

    print("\n" + "-" * 60)
    print("Registering ML Endpoints")
    print("-" * 60)

    for endpoint in ML_ENDPOINTS:
        capability_code = endpoint["capability_code"]
        print(f"\n  Processing: {capability_code}")
        print(f"    Name: {endpoint['capability_name']}")
        print(f"    URL: {endpoint['endpoint_url']}")

        if args.dry_run:
            print(f"    [DRY RUN] Would register")
            created += 1
            continue

        # Check if already exists
        existing_id = check_record_exists(token, capability_code)

        if existing_id:
            if args.update:
                print(f"    Updating existing record...")
                if update_capability_implementation(token, existing_id, endpoint):
                    print(f"    Updated successfully")
                    updated += 1
                else:
                    errors += 1
            else:
                print(f"    Already exists (use --update to overwrite)")
                skipped += 1
        else:
            print(f"    Creating new record...")
            if create_capability_implementation(token, endpoint):
                print(f"    Created successfully")
                created += 1
            else:
                errors += 1

        time.sleep(0.3)  # Rate limiting

    # Summary
    print("\n" + "=" * 60)
    print("REGISTRATION SUMMARY")
    print("=" * 60)
    print(f"\n  Created: {created}")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Errors: {errors}")
    print(f"\n  Total: {len(ML_ENDPOINTS)} endpoints")

    if errors == 0:
        print("\nML endpoints registered successfully!")
        return 0
    else:
        print(f"\n{errors} endpoints failed to register. Check errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
