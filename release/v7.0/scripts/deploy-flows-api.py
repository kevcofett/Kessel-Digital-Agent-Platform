#!/usr/bin/env python3
"""
Deploy Power Automate flows via the Flow API.
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, Optional

BASE_DIR = Path(__file__).parent.parent
ENV_ID = "c672b470-9cc7-e9d8-a0e2-ca83751f800c"

def get_flow_token() -> str:
    """Get Flow API access token via Azure CLI."""
    result = subprocess.run(
        ["az", "account", "get-access-token", "--resource", "https://service.flow.microsoft.com", "--query", "accessToken", "-o", "tsv"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise Exception(f"Failed to get token: {result.stderr}")
    return result.stdout.strip()

def create_flow(token: str, display_name: str, definition: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Create a flow via the API."""
    import urllib.request
    import urllib.error

    url = f"https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/{ENV_ID}/flows?api-version=2016-11-01"

    payload = {
        "properties": {
            "displayName": display_name,
            "definition": definition,
            "state": "Stopped"  # Create in stopped state, activate later
        }
    }

    data = json.dumps(payload).encode('utf-8')

    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/json')

    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"    HTTP Error {e.code}: {error_body[:200]}")
        return None
    except Exception as e:
        print(f"    Error: {e}")
        return None

def main():
    """Deploy all flows."""
    print("=" * 60)
    print("Deploying MPA v6.0 Flows via API")
    print("=" * 60)

    # Get token
    print("Getting access token...")
    token = get_flow_token()
    print(f"Token obtained: {token[:20]}...")

    # Load manifest
    manifest_path = BASE_DIR / "platform" / "flows" / "solution-ready" / "conversion-manifest-v2.json"
    with open(manifest_path) as f:
        manifest = json.load(f)

    flows = manifest['flows']
    print(f"Found {len(flows)} flows to deploy")

    created = []
    failed = []

    for flow_info in flows:
        display_name = flow_info['display_name']
        flow_file = Path(flow_info['file'])

        print(f"\nDeploying: {display_name}")

        # Load flow definition
        with open(flow_file) as f:
            flow_data = json.load(f)

        definition = flow_data['properties']['definition']

        result = create_flow(token, display_name, definition)

        if result and 'name' in result:
            created.append({
                "name": display_name,
                "flow_id": result['name'],
                "original_id": flow_info['id']
            })
            print(f"  ✓ Created: {result['name']}")
        else:
            failed.append({
                "name": display_name,
                "file": str(flow_file)
            })
            print(f"  ✗ Failed")

    print("\n" + "=" * 60)
    print(f"Created: {len(created)}")
    print(f"Failed: {len(failed)}")

    # Write results
    results = {
        "created": created,
        "failed": failed
    }

    results_path = BASE_DIR / "platform" / "flows" / "deployment-results.json"
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\nResults written to: {results_path}")

if __name__ == "__main__":
    main()
