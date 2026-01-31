#!/usr/bin/env python3
"""
MPA v6.1 H1+H2 AI Builder Prompt Deployment Script

Deploys 10 AI Builder custom prompts programmatically via Dataverse API.

Prompts:
- MEM_STORE_PREFERENCE
- MEM_RETRIEVE_CONTEXT
- MEM_LEARN_PATTERN
- PRO_EVALUATE_TRIGGERS
- CON_COLLECT_CONTRIBUTION
- CON_SYNTHESIZE_RESPONSE
- CON_RESOLVE_CONFLICTS
- FILE_ANALYZE_CSV
- FILE_ANALYZE_EXCEL
- FILE_EXTRACT_PDF
"""

import json
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

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

# GptPowerPrompt template ID
GPT_PROMPT_TEMPLATE_ID = "edfdb190-3791-45d8-9a6c-8f90a37c278a"

# Repository base path
REPO_BASE = Path(__file__).parent.parent.parent.parent

# Prompt JSON files location
PROMPTS_DIR = REPO_BASE / "base/platform/eap/prompts"


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


def load_prompt_definition(prompt_file: Path) -> Optional[Dict[str, Any]]:
    """Load prompt definition from JSON file."""
    if not prompt_file.exists():
        print(f"  ERROR: Prompt file not found: {prompt_file}")
        return None

    with open(prompt_file, "r") as f:
        return json.load(f)


def build_custom_configuration(prompt_def: Dict[str, Any]) -> str:
    """Build the msdyn_customconfiguration JSON for AI Builder."""

    # Build prompt array with system message and user template
    prompt_parts = []

    # System message as literal
    system_message = prompt_def.get("system_message", "")
    if system_message:
        prompt_parts.append({
            "type": "literal",
            "text": f"SYSTEM:\n{system_message}\n\nUSER:\n"
        })

    # User template with input variables
    user_template = prompt_def.get("user_template", "")
    input_params = prompt_def.get("input_parameters", [])

    # Parse user template to extract variable placeholders
    import re
    parts = re.split(r'(\{\{[^}]+\}\})', user_template)

    for part in parts:
        if part.startswith("{{") and part.endswith("}}"):
            var_name = part[2:-2].strip()
            prompt_parts.append({
                "type": "inputVariable",
                "id": var_name
            })
        elif part:
            prompt_parts.append({
                "type": "literal",
                "text": part
            })

    # Build input definitions
    input_defs = []
    for param in input_params:
        input_def = {
            "id": param.get("name"),
            "text": param.get("name"),
            "type": param.get("type", "text"),
            "quickTestValue": ""
        }
        input_defs.append(input_def)

    # Determine output format
    output_format = prompt_def.get("output_format", "text")
    output_formats = ["json"] if output_format == "json" else ["text"]

    # Model parameters
    temperature = prompt_def.get("temperature", 0.3)
    model = prompt_def.get("model", "gpt-4")

    # Map model names to AI Builder model types
    model_mapping = {
        "gpt-4": "gpt-4",
        "gpt-4o": "gpt-4o",
        "gpt-3.5-turbo": "gpt-35-turbo"
    }
    model_type = model_mapping.get(model, "gpt-4")

    custom_config = {
        "version": "GptDynamicPrompt-2",
        "prompt": prompt_parts,
        "definitions": {
            "inputs": input_defs,
            "data": [],
            "output": {
                "formats": output_formats
            }
        },
        "modelParameters": {
            "modelType": model_type,
            "gptParameters": {
                "temperature": temperature
            }
        }
    }

    return json.dumps(custom_config)


def create_ai_model(token: str, prompt_name: str, description: str) -> Optional[str]:
    """Create a new AI model entry."""
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    model_id = str(uuid.uuid4())

    payload = {
        "msdyn_aimodelid": model_id,
        "msdyn_name": prompt_name,
        "msdyn_TemplateId@odata.bind": f"/msdyn_aitemplates({GPT_PROMPT_TEMPLATE_ID})"
    }

    url = f"{API_URL}/msdyn_aimodels"
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code in [200, 201, 204]:
        print(f"    Created AI model: {model_id}")
        return model_id
    else:
        print(f"    ERROR creating AI model: {response.status_code}")
        print(f"    Response: {response.text[:500]}")
        return None


def create_base_configuration(token: str, model_id: str, prompt_def: Dict[str, Any]) -> Optional[str]:
    """Create a base AI configuration (type 190690000) with the prompt definition."""
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    config_id = str(uuid.uuid4())
    custom_config = build_custom_configuration(prompt_def)

    payload = {
        "msdyn_aiconfigurationid": config_id,
        "msdyn_name": f"{model_id}_base",
        "msdyn_AIModelId@odata.bind": f"/msdyn_aimodels({model_id})",
        "msdyn_customconfiguration": custom_config,
        "msdyn_type": 190690000  # Base/trained configuration type
    }

    url = f"{API_URL}/msdyn_aiconfigurations"
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code in [200, 201, 204]:
        print(f"    Created base config: {config_id}")
        return config_id
    else:
        print(f"    ERROR creating base config: {response.status_code}")
        print(f"    Response: {response.text[:500]}")
        return None


def create_run_configuration(token: str, model_id: str, base_config_id: str, prompt_def: Dict[str, Any]) -> Optional[str]:
    """Create a run AI configuration (type 190690001) that references the base config."""
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    config_id = str(uuid.uuid4())
    custom_config = build_custom_configuration(prompt_def)

    payload = {
        "msdyn_aiconfigurationid": config_id,
        "msdyn_name": f"{model_id}_run",
        "msdyn_AIModelId@odata.bind": f"/msdyn_aimodels({model_id})",
        "msdyn_TrainedModelAIConfigurationPareId@odata.bind": f"/msdyn_aiconfigurations({base_config_id})",
        "msdyn_customconfiguration": custom_config,
        "msdyn_type": 190690001  # Run configuration type
    }

    url = f"{API_URL}/msdyn_aiconfigurations"
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code in [200, 201, 204]:
        print(f"    Created run config: {config_id}")
        return config_id
    else:
        print(f"    ERROR creating run config: {response.status_code}")
        print(f"    Response: {response.text[:500]}")
        return None


def update_model_active_config(token: str, model_id: str, config_id: str) -> bool:
    """Update the AI model to point to the active configuration."""
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    payload = {
        "msdyn_ActiveRunConfigurationId@odata.bind": f"/msdyn_aiconfigurations({config_id})",
        "statecode": 1,  # Active
        "statuscode": 1
    }

    url = f"{API_URL}/msdyn_aimodels({model_id})"
    response = requests.patch(url, headers=headers, json=payload)

    if response.status_code in [200, 204]:
        print(f"    Activated AI model")
        return True
    else:
        print(f"    ERROR activating AI model: {response.status_code}")
        print(f"    Response: {response.text[:500]}")
        return False


def check_prompt_exists(token: str, prompt_name: str) -> Optional[str]:
    """Check if a prompt with this name already exists."""
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json"
    }

    url = f"{API_URL}/msdyn_aimodels?$filter=msdyn_name eq '{prompt_name}'&$select=msdyn_aimodelid,msdyn_name"
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        models = response.json().get("value", [])
        if models:
            return models[0].get("msdyn_aimodelid")
    return None


def deploy_prompt(token: str, prompt_file: Path) -> bool:
    """Deploy a single AI Builder prompt."""
    # Load prompt definition
    prompt_def = load_prompt_definition(prompt_file)
    if not prompt_def:
        return False

    prompt_code = prompt_def.get("prompt_code")
    prompt_name = prompt_def.get("prompt_name")
    description = prompt_def.get("description", "")

    # Use prompt_code as the AI Builder model name for consistency
    model_name = f"MPA_{prompt_code}"

    print(f"\n  Deploying: {model_name}")
    print(f"    Name: {prompt_name}")
    print(f"    Description: {description[:60]}...")

    # Check if already exists
    existing_id = check_prompt_exists(token, model_name)
    if existing_id:
        print(f"    Prompt already exists: {existing_id}")
        print(f"    Skipping (use update if needed)")
        return True

    # Create AI Model
    model_id = create_ai_model(token, model_name, description)
    if not model_id:
        return False

    # Create base AI Configuration (type 190690000)
    base_config_id = create_base_configuration(token, model_id, prompt_def)
    if not base_config_id:
        return False

    # Create run AI Configuration (type 190690001) that references base
    run_config_id = create_run_configuration(token, model_id, base_config_id, prompt_def)
    if not run_config_id:
        return False

    # Activate the model with the run configuration
    if not update_model_active_config(token, model_id, run_config_id):
        return False

    print(f"    SUCCESS: {model_name} deployed")
    return True


def main():
    """Main execution function."""
    print("=" * 60)
    print("MPA v6.1 H1+H2 AI Builder Prompt Deployment")
    print("=" * 60)

    # Get authentication token
    print("\n1. Authenticating with Dataverse...")
    token = get_token()

    if not token:
        print("ERROR: Failed to get authentication token")
        return 1

    print("   Authentication successful!")

    # List prompt files to deploy
    prompt_files = [
        "MEM_STORE_PREFERENCE_PROMPT.json",
        "MEM_RETRIEVE_CONTEXT_PROMPT.json",
        "MEM_LEARN_PATTERN_PROMPT.json",
        "PRO_EVALUATE_TRIGGERS_PROMPT.json",
        "CON_COLLECT_CONTRIBUTION_PROMPT.json",
        "CON_SYNTHESIZE_RESPONSE_PROMPT.json",
        "CON_RESOLVE_CONFLICTS_PROMPT.json",
        "FILE_ANALYZE_CSV_PROMPT.json",
        "FILE_ANALYZE_EXCEL_PROMPT.json",
        "FILE_EXTRACT_PDF_PROMPT.json"
    ]

    print(f"\n2. Deploying {len(prompt_files)} AI Builder prompts...")
    print("-" * 50)

    success_count = 0
    fail_count = 0

    for prompt_file in prompt_files:
        file_path = PROMPTS_DIR / prompt_file

        if deploy_prompt(token, file_path):
            success_count += 1
        else:
            fail_count += 1

    # Summary
    print("\n" + "=" * 60)
    print("DEPLOYMENT SUMMARY")
    print("=" * 60)
    print(f"  Successful: {success_count}")
    print(f"  Failed: {fail_count}")
    print(f"  Total: {len(prompt_files)}")

    if fail_count == 0:
        print("\nAll AI Builder prompts deployed successfully!")
        return 0
    else:
        print(f"\nSome deployments failed. Check errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
