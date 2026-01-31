#!/usr/bin/env python3
"""
Convert YAML flow definitions to Power Automate JSON format - v2
Generates proper PA action types and connection references for solution import.
"""

import json
import yaml
import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional

# Base directory for v6.0 release
BASE_DIR = Path(__file__).parent.parent

# Connection reference name from existing solution
DATAVERSE_CONNECTION_REF = "mpa_sharedcommondataserviceforapps_1d3b7"

def load_yaml_flow(yaml_path: Path) -> Dict[str, Any]:
    """Load a YAML flow definition."""
    with open(yaml_path, 'r') as f:
        return yaml.safe_load(f)

def generate_flow_id() -> str:
    """Generate a unique flow ID in Power Platform format."""
    return str(uuid.uuid4()).upper()

def generate_operation_id() -> str:
    """Generate operation metadata ID."""
    return str(uuid.uuid4()).lower()

def convert_yaml_type_to_pa_type(yaml_type: str, step: Dict[str, Any]) -> str:
    """Convert YAML step type to proper Power Automate type."""
    type_mapping = {
        'Compose': 'Compose',
        'HTTP': 'Http',  # PA uses 'Http' not 'HTTP'
        'Condition': 'If',  # PA uses 'If' for conditions
        'Response': 'Response',
        'InitializeVariable': 'InitializeVariable',
        'SetVariable': 'SetVariable',
        'Scope': 'Scope'
    }

    # Check if this is a Dataverse operation
    inputs = step.get('inputs', {})
    uri = inputs.get('uri', '')
    if isinstance(uri, str) and 'api/data/v9' in uri:
        return 'OpenApiConnection'  # Use Dataverse connector

    return type_mapping.get(yaml_type, 'Compose')

def build_http_action(step: Dict[str, Any]) -> Dict[str, Any]:
    """Build an HTTP action."""
    inputs = step.get('inputs', {})
    return {
        "type": "Http",
        "inputs": {
            "method": inputs.get('method', 'GET'),
            "uri": inputs.get('uri', ''),
            "headers": inputs.get('headers', {}),
        }
    }

def build_dataverse_action(step: Dict[str, Any], operation: str) -> Dict[str, Any]:
    """Build a Dataverse (OpenApiConnection) action."""
    inputs = step.get('inputs', {})

    # Parse the URI to determine entity and operation
    uri = inputs.get('uri', '')
    method = inputs.get('method', 'GET').upper()

    # Determine operation type
    if method == 'POST':
        operation_id = 'CreateRecord'
    elif method == 'PATCH':
        operation_id = 'UpdateRecord'
    elif method == 'DELETE':
        operation_id = 'DeleteRecord'
    else:
        operation_id = 'GetItem' if '(' in uri else 'ListRecords'

    action = {
        "type": "OpenApiConnection",
        "inputs": {
            "host": {
                "connectionName": "shared_commondataserviceforapps",
                "operationId": operation_id,
                "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
            },
            "parameters": {},
            "authentication": "@parameters('$authentication')"
        }
    }

    return action

def build_compose_action(step: Dict[str, Any]) -> Dict[str, Any]:
    """Build a Compose action."""
    return {
        "type": "Compose",
        "inputs": step.get('inputs', {})
    }

def build_condition_action(step: Dict[str, Any]) -> Dict[str, Any]:
    """Build a Condition (If) action."""
    expression = step.get('expression', {})

    # Convert YAML expression to PA expression
    if 'equals' in expression:
        equals_values = expression['equals']
        pa_expression = {
            "and": [
                {
                    "equals": equals_values
                }
            ]
        }
    else:
        pa_expression = expression

    return {
        "type": "If",
        "expression": pa_expression,
        "actions": {},
        "else": {
            "actions": {}
        }
    }

def build_response_action(step: Dict[str, Any]) -> Dict[str, Any]:
    """Build a Response action."""
    inputs = step.get('inputs', {})
    return {
        "type": "Response",
        "kind": "Http",
        "inputs": {
            "statusCode": inputs.get('statusCode', 200),
            "body": inputs.get('body', {}),
            "headers": inputs.get('headers', {"Content-Type": "application/json"})
        }
    }

def convert_step_to_action(step: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a YAML step to a Power Automate action."""
    step_type = step.get('type', 'Compose')
    step_id = step.get('id', 'unnamed_step')

    # Build base action
    if step_type == 'Compose':
        action = build_compose_action(step)
    elif step_type == 'HTTP':
        # Check if it's a Dataverse call
        uri = step.get('inputs', {}).get('uri', '')
        if isinstance(uri, str) and 'api/data/v9' in uri:
            action = build_dataverse_action(step, 'dataverse')
        else:
            action = build_http_action(step)
    elif step_type == 'Condition':
        action = build_condition_action(step)
    elif step_type == 'Response':
        action = build_response_action(step)
    else:
        action = build_compose_action(step)

    # Add metadata
    action["metadata"] = {
        "operationMetadataId": generate_operation_id()
    }

    # Add runAfter
    run_after = step.get('run_after')
    if run_after:
        if isinstance(run_after, str):
            action["runAfter"] = {run_after: ["Succeeded"]}
        elif isinstance(run_after, list):
            action["runAfter"] = {ra: ["Succeeded"] for ra in run_after}
    else:
        action["runAfter"] = {}

    return {step_id: action}

def convert_yaml_to_pa_definition(yaml_flow: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a YAML flow to Power Automate definition format."""
    flow_name = yaml_flow.get('name', 'UnnamedFlow')

    # Build trigger
    trigger_config = yaml_flow.get('trigger', {})
    trigger_type = trigger_config.get('type', 'HTTP')

    trigger = {
        "manual": {
            "metadata": {
                "operationMetadataId": generate_operation_id()
            },
            "type": "Request",
            "kind": "Http",
            "inputs": {
                "schema": trigger_config.get('schema', {
                    "type": "object",
                    "properties": {}
                }),
                "triggerAuthenticationType": "Tenant"
            }
        }
    }

    # Build actions from steps
    actions = {}
    for step in yaml_flow.get('steps', []):
        actions.update(convert_step_to_action(step))

    # Build the full definition
    definition = {
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
        "triggers": trigger,
        "actions": actions
    }

    return definition

def create_pa_workflow_file(yaml_flow: Dict[str, Any], output_path: Path) -> Dict[str, Any]:
    """Create a Power Automate workflow JSON file."""
    flow_name = yaml_flow.get('name', 'UnnamedFlow')
    flow_id = generate_flow_id()

    definition = convert_yaml_to_pa_definition(yaml_flow)

    # Create the workflow file structure for solution import
    workflow = {
        "properties": {
            "connectionReferences": {
                "shared_commondataserviceforapps": {
                    "runtimeSource": "embedded",
                    "connection": {
                        "connectionReferenceLogicalName": DATAVERSE_CONNECTION_REF
                    },
                    "api": {
                        "name": "shared_commondataserviceforapps"
                    }
                }
            },
            "definition": definition,
            "templateName": None
        },
        "schemaVersion": "1.0.0.0"
    }

    # Create output filename using MPA prefix
    safe_name = flow_name.replace(' ', '')
    output_file = output_path / f"MPA{safe_name}-{flow_id}.json"

    with open(output_file, 'w') as f:
        json.dump(workflow, f, indent=2)

    return {
        "name": f"MPA{safe_name}",
        "display_name": f"MPA v6 {flow_name}",
        "id": flow_id,
        "file": str(output_file),
        "relative_path": f"Workflows/MPA{safe_name}-{flow_id}.json"
    }

def main():
    """Main conversion function."""
    print("=" * 60)
    print("Power Automate Flow Conversion - v6.0 (v2)")
    print("=" * 60)

    # Find all YAML flow files
    agents_dir = BASE_DIR / "agents"
    yaml_files = list(agents_dir.glob("*/flows/*.yaml"))

    print(f"Found {len(yaml_files)} YAML flow files")

    # Create output directory
    output_dir = BASE_DIR / "platform" / "flows" / "solution-ready"
    output_dir.mkdir(parents=True, exist_ok=True)

    converted = []
    failed = []

    for yaml_file in yaml_files:
        try:
            yaml_flow = load_yaml_flow(yaml_file)
            result = create_pa_workflow_file(yaml_flow, output_dir)
            converted.append(result)
            print(f"  ✓ {result['name']}")
        except Exception as e:
            failed.append({"file": str(yaml_file), "error": str(e)})
            print(f"  ✗ {yaml_file.name}: {e}")

    print("")
    print(f"Converted: {len(converted)}")
    print(f"Failed: {len(failed)}")

    # Write manifest
    manifest = {
        "version": "6.0.0",
        "generated": datetime.now().isoformat(),
        "flows": converted,
        "failed": failed,
        "solution_components": [
            {
                "type": 29,  # Workflow component type
                "id": f"{{{flow['id'].lower()}}}",
                "name": flow['name']
            }
            for flow in converted
        ]
    }

    manifest_path = output_dir / "conversion-manifest-v2.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest written to: {manifest_path}")
    print(f"Output directory: {output_dir}")

    return converted

if __name__ == "__main__":
    main()
