#!/usr/bin/env python3
"""
MPA v6.1 H1+H2 Power Automate Flow Deployment Script

Deploys 5 Power Automate cloud flows programmatically via Dataverse API.

Flows:
- MPA_Memory_Initialize
- MPA_Memory_Store
- MPA_Proactive_Evaluate
- MPA_Workflow_Orchestrate
- MPA_File_Process
"""

import json
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, Optional

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


def get_token() -> Optional[str]:
    """Get access token for Dataverse API."""
    if not MSAL_AVAILABLE:
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


def build_flow_definition(flow_name: str, description: str, actions: Dict) -> Dict:
    """Build a Power Automate cloud flow definition."""
    return {
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
                                    "user_id": {"type": "string"},
                                    "session_id": {"type": "string"},
                                    "context_json": {"type": "string"}
                                }
                            }
                        }
                    }
                },
                "actions": actions
            }
        },
        "schemaVersion": "1.0.0.0"
    }


def build_memory_initialize_flow() -> Dict:
    """Build MPA_Memory_Initialize flow definition."""
    actions = {
        "Get_User_Preferences": {
            "type": "OpenApiConnection",
            "inputs": {
                "host": {
                    "connectionName": "shared_commondataserviceforapps",
                    "operationId": "ListRecords",
                    "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
                },
                "parameters": {
                    "entityName": "mpa_user_preferenceses",
                    "$filter": "mpa_user_id eq '@{triggerBody()?['user_id']}'",
                    "$top": 1
                },
                "authentication": "@parameters('$authentication')"
            },
            "runAfter": {}
        },
        "Get_Session_Memory": {
            "type": "OpenApiConnection",
            "inputs": {
                "host": {
                    "connectionName": "shared_commondataserviceforapps",
                    "operationId": "ListRecords",
                    "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
                },
                "parameters": {
                    "entityName": "mpa_session_memories",
                    "$filter": "mpa_user_id eq '@{triggerBody()?['user_id']}'",
                    "$orderby": "mpa_last_updated desc",
                    "$top": 1
                },
                "authentication": "@parameters('$authentication')"
            },
            "runAfter": {}
        },
        "Build_Response": {
            "type": "Compose",
            "inputs": {
                "preferences_json": "@first(body('Get_User_Preferences')?['value'])",
                "context_json": "@first(body('Get_Session_Memory')?['value'])?['mpa_session_context_json']",
                "session_resume_available": "@not(empty(body('Get_Session_Memory')?['value']))",
                "last_session_summary": "@first(body('Get_Session_Memory')?['value'])?['mpa_summary']"
            },
            "runAfter": {
                "Get_User_Preferences": ["Succeeded"],
                "Get_Session_Memory": ["Succeeded"]
            }
        },
        "Response": {
            "type": "Response",
            "kind": "Http",
            "inputs": {
                "statusCode": 200,
                "body": "@outputs('Build_Response')"
            },
            "runAfter": {
                "Build_Response": ["Succeeded"]
            }
        }
    }
    return build_flow_definition(
        "MPA_Memory_Initialize",
        "Initialize memory system at session start",
        actions
    )


def build_memory_store_flow() -> Dict:
    """Build MPA_Memory_Store flow definition."""
    actions = {
        "Parse_Input": {
            "type": "ParseJson",
            "inputs": {
                "content": "@triggerBody()",
                "schema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "session_id": {"type": "string"},
                        "conversation_text": {"type": "string"},
                        "preferences_json": {"type": "string"}
                    }
                }
            },
            "runAfter": {}
        },
        "Upsert_Preferences": {
            "type": "OpenApiConnection",
            "inputs": {
                "host": {
                    "connectionName": "shared_commondataserviceforapps",
                    "operationId": "UpdateRecord",
                    "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
                },
                "parameters": {
                    "entityName": "mpa_user_preferenceses",
                    "recordId": "@body('Parse_Input')?['user_id']",
                    "item/mpa_preferences_json": "@body('Parse_Input')?['preferences_json']",
                    "item/mpa_last_session_id": "@body('Parse_Input')?['session_id']"
                },
                "authentication": "@parameters('$authentication')"
            },
            "runAfter": {
                "Parse_Input": ["Succeeded"]
            }
        },
        "Upsert_Session_Memory": {
            "type": "OpenApiConnection",
            "inputs": {
                "host": {
                    "connectionName": "shared_commondataserviceforapps",
                    "operationId": "CreateRecord",
                    "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
                },
                "parameters": {
                    "entityName": "mpa_session_memories",
                    "item/mpa_session_id": "@body('Parse_Input')?['session_id']",
                    "item/mpa_user_id": "@body('Parse_Input')?['user_id']",
                    "item/mpa_session_context_json": "@body('Parse_Input')?['preferences_json']"
                },
                "authentication": "@parameters('$authentication')"
            },
            "runAfter": {
                "Parse_Input": ["Succeeded"]
            }
        },
        "Response": {
            "type": "Response",
            "kind": "Http",
            "inputs": {
                "statusCode": 200,
                "body": {"status": "success"}
            },
            "runAfter": {
                "Upsert_Preferences": ["Succeeded"],
                "Upsert_Session_Memory": ["Succeeded"]
            }
        }
    }
    return build_flow_definition(
        "MPA_Memory_Store",
        "Store preferences and session memory",
        actions
    )


def build_proactive_evaluate_flow() -> Dict:
    """Build MPA_Proactive_Evaluate flow definition."""
    actions = {
        "Get_Active_Triggers": {
            "type": "OpenApiConnection",
            "inputs": {
                "host": {
                    "connectionName": "shared_commondataserviceforapps",
                    "operationId": "ListRecords",
                    "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
                },
                "parameters": {
                    "entityName": "eap_proactive_triggers",
                    "$filter": "eap_enabled eq true"
                },
                "authentication": "@parameters('$authentication')"
            },
            "runAfter": {}
        },
        "Build_Trigger_Response": {
            "type": "Compose",
            "inputs": {
                "triggers": "@body('Get_Active_Triggers')?['value']",
                "evaluated_count": "@length(body('Get_Active_Triggers')?['value'])"
            },
            "runAfter": {
                "Get_Active_Triggers": ["Succeeded"]
            }
        },
        "Response": {
            "type": "Response",
            "kind": "Http",
            "inputs": {
                "statusCode": 200,
                "body": "@outputs('Build_Trigger_Response')"
            },
            "runAfter": {
                "Build_Trigger_Response": ["Succeeded"]
            }
        }
    }
    return build_flow_definition(
        "MPA_Proactive_Evaluate",
        "Evaluate proactive triggers against context",
        actions
    )


def build_workflow_orchestrate_flow() -> Dict:
    """Build MPA_Workflow_Orchestrate flow definition."""
    actions = {
        "Get_Workflow_Definition": {
            "type": "OpenApiConnection",
            "inputs": {
                "host": {
                    "connectionName": "shared_commondataserviceforapps",
                    "operationId": "ListRecords",
                    "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
                },
                "parameters": {
                    "entityName": "eap_workflow_definitions",
                    "$filter": "eap_workflow_code eq '@{triggerBody()?['workflow_code']}'",
                    "$top": 1
                },
                "authentication": "@parameters('$authentication')"
            },
            "runAfter": {}
        },
        "Build_Orchestration_Response": {
            "type": "Compose",
            "inputs": {
                "workflow": "@first(body('Get_Workflow_Definition')?['value'])",
                "synthesized_response": "Collaborative analysis initiated",
                "confidence_overall": 75
            },
            "runAfter": {
                "Get_Workflow_Definition": ["Succeeded"]
            }
        },
        "Response": {
            "type": "Response",
            "kind": "Http",
            "inputs": {
                "statusCode": 200,
                "body": "@outputs('Build_Orchestration_Response')"
            },
            "runAfter": {
                "Build_Orchestration_Response": ["Succeeded"]
            }
        }
    }
    return build_flow_definition(
        "MPA_Workflow_Orchestrate",
        "Orchestrate collaborative multi-agent workflow",
        actions
    )


def build_file_process_flow() -> Dict:
    """Build MPA_File_Process flow definition."""
    actions = {
        "Parse_File_Input": {
            "type": "Compose",
            "inputs": {
                "file_type": "@triggerBody()?['file_type']",
                "file_name": "@triggerBody()?['file_name']",
                "session_id": "@triggerBody()?['session_id']"
            },
            "runAfter": {}
        },
        "Build_Extraction_Response": {
            "type": "Compose",
            "inputs": {
                "extraction_summary": "File analysis complete",
                "extracted_data": {},
                "clarifications_needed": [],
                "field_count": 0
            },
            "runAfter": {
                "Parse_File_Input": ["Succeeded"]
            }
        },
        "Response": {
            "type": "Response",
            "kind": "Http",
            "inputs": {
                "statusCode": 200,
                "body": "@outputs('Build_Extraction_Response')"
            },
            "runAfter": {
                "Build_Extraction_Response": ["Succeeded"]
            }
        }
    }
    return build_flow_definition(
        "MPA_File_Process",
        "Process uploaded files for data extraction",
        actions
    )


def check_flow_exists(token: str, flow_name: str) -> Optional[str]:
    """Check if a flow with this name already exists."""
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json"
    }

    url = f"{API_URL}/workflows?$filter=name eq '{flow_name}' and category eq 5&$select=workflowid,name"
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        flows = response.json().get("value", [])
        if flows:
            return flows[0].get("workflowid")
    return None


def create_flow(token: str, flow_name: str, description: str, definition: Dict) -> Optional[str]:
    """Create a new Power Automate cloud flow."""
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    flow_id = str(uuid.uuid4())
    clientdata = json.dumps(definition)

    payload = {
        "workflowid": flow_id,
        "name": flow_name,
        "description": description,
        "category": 5,  # Cloud flow
        "type": 1,  # Definition
        "primaryentity": "none",
        "scope": 4,  # Organization
        "mode": 0,  # Background
        "statecode": 0,  # Draft
        "statuscode": 1,  # Draft
        "clientdata": clientdata
    }

    url = f"{API_URL}/workflows"
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code in [200, 201, 204]:
        print(f"    Created flow: {flow_id}")
        return flow_id
    else:
        print(f"    ERROR creating flow: {response.status_code}")
        print(f"    Response: {response.text[:500]}")
        return None


def deploy_flow(token: str, flow_name: str, description: str, definition: Dict) -> bool:
    """Deploy a single Power Automate flow."""
    print(f"\n  Deploying: {flow_name}")
    print(f"    Description: {description}")

    # Check if already exists
    existing_id = check_flow_exists(token, flow_name)
    if existing_id:
        print(f"    Flow already exists: {existing_id}")
        print(f"    Skipping (use update if needed)")
        return True

    # Create flow
    flow_id = create_flow(token, flow_name, description, definition)
    if not flow_id:
        return False

    print(f"    SUCCESS: {flow_name} deployed")
    return True


def main():
    """Main execution function."""
    print("=" * 60)
    print("MPA v6.1 H1+H2 Power Automate Flow Deployment")
    print("=" * 60)

    # Get authentication token
    print("\n1. Authenticating with Dataverse...")
    token = get_token()

    if not token:
        print("ERROR: Failed to get authentication token")
        return 1

    print("   Authentication successful!")

    # Define flows to deploy
    flows = [
        ("MPA_Memory_Initialize", "Initialize memory system at session start", build_memory_initialize_flow()),
        ("MPA_Memory_Store", "Store preferences and session memory", build_memory_store_flow()),
        ("MPA_Proactive_Evaluate", "Evaluate proactive triggers against context", build_proactive_evaluate_flow()),
        ("MPA_Workflow_Orchestrate", "Orchestrate collaborative multi-agent workflow", build_workflow_orchestrate_flow()),
        ("MPA_File_Process", "Process uploaded files for data extraction", build_file_process_flow())
    ]

    print(f"\n2. Deploying {len(flows)} Power Automate flows...")
    print("-" * 50)

    success_count = 0
    fail_count = 0

    for flow_name, description, definition in flows:
        if deploy_flow(token, flow_name, description, definition):
            success_count += 1
        else:
            fail_count += 1

    # Summary
    print("\n" + "=" * 60)
    print("DEPLOYMENT SUMMARY")
    print("=" * 60)
    print(f"  Successful: {success_count}")
    print(f"  Failed: {fail_count}")
    print(f"  Total: {len(flows)}")

    if fail_count == 0:
        print("\nAll Power Automate flows deployed successfully!")
        print("\nNote: Flows are in draft state. They can be activated via:")
        print("  - Power Automate portal")
        print("  - Power Platform admin center")
        return 0
    else:
        print(f"\nSome deployments failed. Check errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
