#!/usr/bin/env python3
"""
KDAP ML Integration Flows Deployment Script

Creates Power Automate flows for ML endpoint routing and telemetry logging.

Flows created:
- MPA_ML_Endpoint_Router: Routes capability requests to ML endpoints
- MPA_Telemetry_Logger: Logs telemetry for agent and ML calls
"""

import json
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

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

# ML Endpoint mappings
ML_ENDPOINTS = {
    "ANL_BUDGET_OPTIMIZE": "https://kdap-ml-budget-optimizer.azurewebsites.net/api/score",
    "AUD_PROPENSITY_SCORE": "https://kdap-ml-propensity.azurewebsites.net/api/score",
    "PRF_ANOMALY_DETECT": "https://kdap-ml-anomaly-detector.azurewebsites.net/api/score",
    "ANL_MONTECARLO": "https://kdap-ml-monte-carlo.azurewebsites.net/api/score",
    "CHA_MEDIA_MIX": "https://kdap-ml-media-mix.azurewebsites.net/api/score",
    "ANL_ATTRIBUTION": "https://kdap-ml-attribution.azurewebsites.net/api/score",
    "CST_PRIORITIZE": "https://kdap-ml-prioritizer.azurewebsites.net/api/score"
}


def get_token() -> Optional[str]:
    """Get access token using MSAL."""
    if not MSAL_AVAILABLE:
        print("MSAL not available")
        return None

    auth = MSALAuthenticator(TENANT_ID, CLIENT_ID)
    accounts = auth._app.get_accounts()
    if accounts:
        scope = f"{ENVIRONMENT_URL}/.default"
        result = auth._app.acquire_token_silent([scope], account=accounts[0])
        if result and "access_token" in result:
            print("Using cached token")
            return result["access_token"]

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


def check_flow_exists(token: str, flow_name: str) -> Optional[str]:
    """Check if a flow already exists."""
    url = f"{API_URL}/workflows?$filter=name eq '{flow_name}' and category eq 5&$select=workflowid,name"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code == 200:
        flows = response.json().get("value", [])
        if flows:
            return flows[0].get("workflowid")
    return None


def build_ml_router_flow_definition() -> Dict[str, Any]:
    """Build the MPA_ML_Endpoint_Router flow definition."""

    # Build switch cases for each ML endpoint
    switch_cases = {}
    for capability_code, endpoint_url in ML_ENDPOINTS.items():
        switch_cases[capability_code] = {
            "case": capability_code,
            "actions": {
                f"HTTP_Call_{capability_code}": {
                    "type": "Http",
                    "inputs": {
                        "method": "POST",
                        "uri": endpoint_url,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "body": "@triggerBody()?['request_payload']"
                    },
                    "runAfter": {}
                },
                f"Set_Response_{capability_code}": {
                    "type": "SetVariable",
                    "inputs": {
                        "name": "response_body",
                        "value": f"@body('HTTP_Call_{capability_code}')"
                    },
                    "runAfter": {
                        f"HTTP_Call_{capability_code}": ["Succeeded"]
                    }
                },
                f"Set_StatusCode_{capability_code}": {
                    "type": "SetVariable",
                    "inputs": {
                        "name": "status_code",
                        "value": f"@outputs('HTTP_Call_{capability_code}')?['statusCode']"
                    },
                    "runAfter": {
                        f"Set_Response_{capability_code}": ["Succeeded"]
                    }
                }
            }
        }

    actions = {
        "Initialize_response_body": {
            "type": "InitializeVariable",
            "inputs": {
                "variables": [{"name": "response_body", "type": "object", "value": {}}]
            },
            "runAfter": {}
        },
        "Initialize_status_code": {
            "type": "InitializeVariable",
            "inputs": {
                "variables": [{"name": "status_code", "type": "integer", "value": 0}]
            },
            "runAfter": {"Initialize_response_body": ["Succeeded"]}
        },
        "Initialize_start_time": {
            "type": "InitializeVariable",
            "inputs": {
                "variables": [{"name": "start_time", "type": "string", "value": "@utcNow()"}]
            },
            "runAfter": {"Initialize_status_code": ["Succeeded"]}
        },
        "Switch_on_capability": {
            "type": "Switch",
            "expression": "@triggerBody()?['capability_code']",
            "cases": switch_cases,
            "default": {
                "actions": {
                    "Set_Error_Response": {
                        "type": "SetVariable",
                        "inputs": {
                            "name": "response_body",
                            "value": {"error": "Unknown capability code"}
                        },
                        "runAfter": {}
                    },
                    "Set_Error_StatusCode": {
                        "type": "SetVariable",
                        "inputs": {
                            "name": "status_code",
                            "value": 400
                        },
                        "runAfter": {"Set_Error_Response": ["Succeeded"]}
                    }
                }
            },
            "runAfter": {"Initialize_start_time": ["Succeeded"]}
        },
        "Response": {
            "type": "Response",
            "kind": "Http",
            "inputs": {
                "statusCode": "@variables('status_code')",
                "body": {
                    "response": "@variables('response_body')",
                    "status_code": "@variables('status_code')",
                    "capability_code": "@triggerBody()?['capability_code']",
                    "latency_ms": "@div(sub(ticks(utcNow()), ticks(variables('start_time'))), 10000)"
                }
            },
            "runAfter": {"Switch_on_capability": ["Succeeded", "Failed"]}
        }
    }

    # Wrap in properties structure
    flow_definition = {
        "properties": {
            "connectionReferences": {},
            "definition": {
                "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
                "contentVersion": "1.0.0.0",
                "parameters": {
                    "$connections": {
                        "defaultValue": {},
                        "type": "Object"
                    },
                    "$authentication": {
                        "defaultValue": {},
                        "type": "SecureObject"
                    }
                },
                "triggers": {
                    "manual": {
                        "type": "Request",
                        "kind": "Button",
                        "inputs": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "capability_code": {"type": "string"},
                                    "session_id": {"type": "string"},
                                    "request_payload": {"type": "object"}
                                },
                                "required": ["capability_code", "request_payload"]
                            }
                        }
                    }
                },
                "actions": actions
            }
        },
        "schemaVersion": "1.0.0.0"
    }

    return flow_definition


def build_telemetry_logger_flow_definition() -> Dict[str, Any]:
    """Build the MPA_Telemetry_Logger flow definition."""

    actions = {
        "Create_Telemetry_Record": {
            "type": "OpenApiConnection",
            "inputs": {
                "host": {
                    "connectionName": "shared_commondataserviceforapps",
                    "operationId": "CreateRecord",
                    "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
                },
                "parameters": {
                    "entityName": "eap_telemetries",
                    "item/eap_session_id": "@triggerBody()?['session_id']",
                    "item/eap_turn_number": "@triggerBody()?['turn_number']",
                    "item/eap_routed_agent": "@triggerBody()?['routed_agent']",
                    "item/eap_capability_code": "@triggerBody()?['capability_code']",
                    "item/eap_implementation_type": "@triggerBody()?['implementation_type']",
                    "item/eap_endpoint_url": "@triggerBody()?['endpoint_url']",
                    "item/eap_latency_ms": "@triggerBody()?['latency_ms']",
                    "item/eap_status_code": "@triggerBody()?['status_code']",
                    "item/eap_error_message": "@triggerBody()?['error_message']",
                    "item/eap_confidence_level": "@triggerBody()?['confidence_level']"
                },
                "authentication": "@parameters('$authentication')"
            },
            "runAfter": {}
        },
        "Response": {
            "type": "Response",
            "kind": "Http",
            "inputs": {
                "statusCode": 200,
                "body": {
                    "success": True,
                    "telemetry_id": "@outputs('Create_Telemetry_Record')?['body/eap_telemetryid']"
                }
            },
            "runAfter": {"Create_Telemetry_Record": ["Succeeded"]}
        }
    }

    # Wrap in properties structure
    flow_definition = {
        "properties": {
            "connectionReferences": {
                "shared_commondataserviceforapps": {
                    "runtimeSource": "embedded",
                    "connection": {
                        "connectionReferenceLogicalName": "msdyn_sharedcommondataserviceforapps"
                    },
                    "api": {
                        "name": "shared_commondataserviceforapps"
                    }
                }
            },
            "definition": {
                "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
                "contentVersion": "1.0.0.0",
                "parameters": {
                    "$connections": {
                        "defaultValue": {},
                        "type": "Object"
                    },
                    "$authentication": {
                        "defaultValue": {},
                        "type": "SecureObject"
                    }
                },
                "triggers": {
                    "manual": {
                        "type": "Request",
                        "kind": "Button",
                        "inputs": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "session_id": {"type": "string"},
                                    "turn_number": {"type": "integer"},
                                    "routed_agent": {"type": "string"},
                                    "capability_code": {"type": "string"},
                                    "implementation_type": {"type": "string"},
                                    "endpoint_url": {"type": "string"},
                                    "latency_ms": {"type": "integer"},
                                    "status_code": {"type": "integer"},
                                    "error_message": {"type": "string"},
                                    "confidence_level": {"type": "number"}
                                },
                                "required": ["session_id", "routed_agent", "capability_code", "implementation_type", "latency_ms", "status_code"]
                            }
                        }
                    }
                },
                "actions": actions
            }
        },
        "schemaVersion": "1.0.0.0"
    }

    return flow_definition


def create_flow(token: str, flow_name: str, description: str, flow_definition: Dict) -> bool:
    """Create a Power Automate flow in Dataverse."""

    workflow_id = str(uuid.uuid4())

    payload = {
        "workflowid": workflow_id,
        "name": flow_name,
        "description": description,
        "category": 5,  # Modern flow
        "type": 1,  # Definition
        "scope": 4,  # Organization
        "ondemand": True,
        "triggeroncreate": False,
        "triggerondelete": False,
        "triggeronupdateattributelist": "",
        "statecode": 0,  # Draft
        "statuscode": 1,  # Draft
        "clientdata": json.dumps(flow_definition),
        "processorder": 1,
        "primaryentity": "none"
    }

    url = f"{API_URL}/workflows"
    response = requests.post(url, headers=get_headers(token), json=payload)

    if response.status_code in (200, 201, 204):
        print(f"  Created: {workflow_id}")
        return True
    else:
        print(f"  ERROR: {response.status_code}")
        print(f"  {response.text[:500]}")
        return False


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Deploy ML integration flows")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be deployed")
    args = parser.parse_args()

    print("=" * 60)
    print("KDAP ML Integration Flows Deployment")
    print("=" * 60)

    if args.dry_run:
        print("\n[DRY RUN MODE]")
        print("\nWould create flows:")
        print("  - MPA_ML_Endpoint_Router")
        print("  - MPA_Telemetry_Logger")
        print("\nML Endpoint mappings:")
        for code, url in ML_ENDPOINTS.items():
            print(f"  {code}: {url}")
        return 0

    print("\nAuthenticating...")
    token = get_token()
    if not token:
        print("Failed to authenticate")
        return 1

    print("Authentication successful!")

    flows = [
        {
            "name": "MPA_ML_Endpoint_Router",
            "description": "Routes capability requests to the appropriate ML endpoint based on capability code",
            "definition": build_ml_router_flow_definition()
        },
        {
            "name": "MPA_Telemetry_Logger",
            "description": "Logs telemetry for agent and ML endpoint calls to eap_telemetry table",
            "definition": build_telemetry_logger_flow_definition()
        }
    ]

    created = 0
    skipped = 0
    errors = 0

    print("\n" + "-" * 60)
    print("Deploying Flows")
    print("-" * 60)

    for flow in flows:
        print(f"\n  {flow['name']}:")

        # Check if exists
        existing_id = check_flow_exists(token, flow["name"])
        if existing_id:
            print(f"  Already exists: {existing_id}")
            skipped += 1
            continue

        if create_flow(token, flow["name"], flow["description"], flow["definition"]):
            created += 1
        else:
            errors += 1

    # Summary
    print("\n" + "=" * 60)
    print("DEPLOYMENT SUMMARY")
    print("=" * 60)
    print(f"  Created: {created}")
    print(f"  Skipped: {skipped}")
    print(f"  Errors: {errors}")

    if errors == 0:
        print("\nML integration flows deployed successfully!")
        return 0
    else:
        print(f"\n{errors} flows failed. Check errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
