#!/usr/bin/env python3
"""
Convert YAML flow definitions to Power Automate JSON format.
This script transforms the v6.0 agent flow YAML files into importable PA flows.
"""

import json
import yaml
import os
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

# Base directory for v6.0 release
BASE_DIR = Path(__file__).parent.parent

def load_yaml_flow(yaml_path: Path) -> Dict[str, Any]:
    """Load a YAML flow definition."""
    with open(yaml_path, 'r') as f:
        return yaml.safe_load(f)

def generate_flow_id() -> str:
    """Generate a unique flow ID."""
    return str(uuid.uuid4()).upper()

def convert_step_to_action(step: Dict[str, Any], flow_name: str) -> Dict[str, Any]:
    """Convert a YAML step to a Power Automate action."""
    step_type = step.get('type', 'Compose')
    step_id = step.get('id', 'unnamed_step')
    step_name = step.get('name', step_id)

    action = {
        "type": step_type,
        "metadata": {
            "operationMetadataId": generate_flow_id()
        }
    }

    if step_type == "Compose":
        action["inputs"] = step.get('inputs', {})

    elif step_type == "HTTP":
        http_inputs = step.get('inputs', {})
        action["inputs"] = {
            "method": http_inputs.get('method', 'GET'),
            "uri": http_inputs.get('uri', ''),
            "headers": http_inputs.get('headers', {}),
        }
        if 'body' in http_inputs:
            action["inputs"]["body"] = http_inputs['body']

    elif step_type == "Condition":
        action["expression"] = step.get('expression', {})
        action["actions"] = {}

    elif step_type == "Response":
        action["inputs"] = {
            "statusCode": step.get('inputs', {}).get('statusCode', 200),
            "headers": step.get('inputs', {}).get('headers', {}),
            "body": step.get('inputs', {}).get('body', {})
        }
        action["kind"] = "Http"

    # Add run_after if specified
    if 'run_after' in step:
        run_after = step['run_after']
        if isinstance(run_after, str):
            action["runAfter"] = {run_after: ["Succeeded"]}
        elif isinstance(run_after, list):
            action["runAfter"] = {ra: ["Succeeded"] for ra in run_after}

    # Add condition if specified
    if 'condition' in step:
        action["operationOptions"] = "condition"

    return {step_id: action}

def convert_yaml_to_pa_definition(yaml_flow: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a YAML flow to Power Automate definition format."""
    flow_name = yaml_flow.get('name', 'UnnamedFlow')
    description = yaml_flow.get('description', '')

    # Build trigger
    trigger_config = yaml_flow.get('trigger', {})
    trigger_type = trigger_config.get('type', 'HTTP')

    if trigger_type == 'HTTP':
        trigger = {
            "manual": {
                "type": "Request",
                "kind": "Http",
                "inputs": {
                    "method": trigger_config.get('method', 'POST'),
                    "schema": trigger_config.get('schema', {})
                }
            }
        }
    else:
        trigger = {"manual": {"type": "Request", "kind": "Http"}}

    # Build actions from steps
    actions = {}
    for step in yaml_flow.get('steps', []):
        actions.update(convert_step_to_action(step, flow_name))

    # Build error handling
    error_handling = yaml_flow.get('error_handling', {})
    if error_handling.get('on_error'):
        for error_step in error_handling['on_error']:
            error_action = convert_step_to_action(error_step, flow_name)
            # Mark as error action
            for action_name, action_def in error_action.items():
                action_def["operationOptions"] = "OnError"
            actions.update(error_action)

    # Build the full definition
    definition = {
        "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
        "contentVersion": "1.0.0.0",
        "parameters": {},
        "triggers": trigger,
        "actions": actions
    }

    return definition

def create_pa_workflow_file(yaml_flow: Dict[str, Any], output_path: Path) -> Dict[str, Any]:
    """Create a Power Automate workflow JSON file."""
    flow_name = yaml_flow.get('name', 'UnnamedFlow')
    flow_id = generate_flow_id()

    definition = convert_yaml_to_pa_definition(yaml_flow)

    # Create the workflow file structure expected by Power Platform
    workflow = {
        "properties": {
            "connectionReferences": {},
            "definition": definition,
            "state": "Activated"
        },
        "schemaVersion": "1.0.0.0"
    }

    # Write the file
    output_file = output_path / f"{flow_name}-{flow_id}.json"
    with open(output_file, 'w') as f:
        json.dump(workflow, f, indent=2)

    return {
        "name": flow_name,
        "id": flow_id,
        "file": str(output_file)
    }

def main():
    """Main conversion function."""
    print("=" * 60)
    print("Power Automate Flow Conversion - v6.0")
    print("=" * 60)

    # Find all YAML flow files
    agents_dir = BASE_DIR / "agents"
    yaml_files = list(agents_dir.glob("*/flows/*.yaml"))

    print(f"Found {len(yaml_files)} YAML flow files")

    # Create output directory
    output_dir = BASE_DIR / "platform" / "flows" / "converted"
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
        "failed": failed
    }

    manifest_path = output_dir / "conversion-manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest written to: {manifest_path}")
    print(f"Output directory: {output_dir}")

    return converted

if __name__ == "__main__":
    main()
