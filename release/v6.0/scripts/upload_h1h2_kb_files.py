#!/usr/bin/env python3
"""
MPA v6.1 H1+H2 Knowledge Base File Upload Script

Uploads H1+H2 KB files to SharePoint for Copilot Studio knowledge sources.

Target locations:
- EAP KB files -> /sites/MPA/MPAKnowledgeBase/EAP/
- ORC KB files -> /sites/MPA/MPAKnowledgeBase/Agents/ORC/
- DOC KB files -> /sites/MPA/MPAKnowledgeBase/Agents/DOC/

Requires:
- msal package for authentication
- requests package for API calls
"""

import json
import os
import sys
from pathlib import Path
from typing import Optional

import requests

# Add auth module to path
sys.path.insert(0, str(Path(__file__).parent / "auth"))

try:
    from msal_auth import MSALAuthenticator, AuthenticationError
    MSAL_AVAILABLE = True
except ImportError:
    MSAL_AVAILABLE = False
    print("Warning: MSAL auth module not available. Manual authentication required.")

# Configuration
TENANT_ID = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"
CLIENT_ID = "f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8"
SHAREPOINT_HOST = "kesseldigitalcom.sharepoint.com"
SITE_PATH = "/sites/AragornAI2"
GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"

# Repository base path
REPO_BASE = Path(__file__).parent.parent.parent.parent

# H1+H2 KB files to upload
KB_FILES = [
    # EAP Platform KB files
    {
        "source": REPO_BASE / "base/platform/eap/kb/EAP_KB_Memory_System_v1.txt",
        "target_folder": "MPAKnowledgeBase/EAP",
        "description": "Memory System knowledge base for H1 capabilities"
    },
    {
        "source": REPO_BASE / "base/platform/eap/kb/EAP_KB_Proactive_Intelligence_v1.txt",
        "target_folder": "MPAKnowledgeBase/EAP",
        "description": "Proactive Intelligence knowledge base for H1 capabilities"
    },
    {
        "source": REPO_BASE / "base/platform/eap/kb/EAP_KB_Consensus_Protocol_v1.txt",
        "target_folder": "MPAKnowledgeBase/EAP",
        "description": "Consensus Protocol knowledge base for H2 capabilities"
    },
    # ORC Agent KB files
    {
        "source": REPO_BASE / "base/agents/orc/kb/ORC_KB_Session_Management_v1.txt",
        "target_folder": "MPAKnowledgeBase/Agents/ORC",
        "description": "ORC Session Management knowledge base"
    },
    {
        "source": REPO_BASE / "base/agents/orc/kb/ORC_KB_Collaborative_Orchestration_v1.txt",
        "target_folder": "MPAKnowledgeBase/Agents/ORC",
        "description": "ORC Collaborative Orchestration knowledge base"
    },
    # DOC Agent KB files
    {
        "source": REPO_BASE / "base/agents/doc/kb/DOC_KB_File_Processing_v1.txt",
        "target_folder": "MPAKnowledgeBase/Agents/DOC",
        "description": "DOC File Processing knowledge base for H2 capabilities"
    }
]


def get_graph_token() -> Optional[str]:
    """Get access token for Microsoft Graph API."""
    if not MSAL_AVAILABLE:
        return None

    auth = MSALAuthenticator(TENANT_ID, CLIENT_ID)
    accounts = auth._app.get_accounts()

    if accounts:
        scope = "https://graph.microsoft.com/.default"
        result = auth._app.acquire_token_silent([scope], account=accounts[0])
        if result and "access_token" in result:
            print("Using cached Graph token")
            return result["access_token"]

    # Fall back to device code flow
    try:
        token = auth.get_graph_token()
        return token
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        return None


def get_site_id(token: str) -> Optional[str]:
    """Get the SharePoint site ID."""
    url = f"{GRAPH_BASE_URL}/sites/{SHAREPOINT_HOST}:{SITE_PATH}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        site_data = response.json()
        return site_data.get("id")
    else:
        print(f"Failed to get site ID: {response.status_code}")
        print(response.text)
        return None


def get_drive_id(token: str, site_id: str) -> Optional[str]:
    """Get the default document library drive ID."""
    url = f"{GRAPH_BASE_URL}/sites/{site_id}/drive"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        drive_data = response.json()
        return drive_data.get("id")
    else:
        print(f"Failed to get drive ID: {response.status_code}")
        print(response.text)
        return None


def ensure_folder_exists(token: str, drive_id: str, folder_path: str) -> bool:
    """Ensure a folder exists, creating it if necessary."""
    # Split path into components
    parts = folder_path.split("/")
    current_path = ""

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    for part in parts:
        if not part:
            continue

        parent_path = current_path if current_path else "root"
        current_path = f"{current_path}/{part}" if current_path else part

        # Check if folder exists
        if parent_path == "root":
            check_url = f"{GRAPH_BASE_URL}/drives/{drive_id}/root:/{current_path}"
        else:
            check_url = f"{GRAPH_BASE_URL}/drives/{drive_id}/root:/{current_path}"

        response = requests.get(check_url, headers=headers)

        if response.status_code == 404:
            # Create folder
            if parent_path == "root":
                create_url = f"{GRAPH_BASE_URL}/drives/{drive_id}/root/children"
            else:
                create_url = f"{GRAPH_BASE_URL}/drives/{drive_id}/root:/{'/'.join(parts[:parts.index(part)])}:/children"

            folder_data = {
                "name": part,
                "folder": {},
                "@microsoft.graph.conflictBehavior": "replace"
            }

            create_response = requests.post(create_url, headers=headers, json=folder_data)

            if create_response.status_code not in [200, 201]:
                print(f"  Failed to create folder {part}: {create_response.status_code}")
                return False
            else:
                print(f"  Created folder: {part}")

    return True


def upload_file(token: str, drive_id: str, source_path: Path, target_folder: str) -> bool:
    """Upload a file to SharePoint."""
    if not source_path.exists():
        print(f"  ERROR: Source file not found: {source_path}")
        return False

    file_name = source_path.name
    target_path = f"{target_folder}/{file_name}"

    # Read file content
    with open(source_path, "rb") as f:
        content = f.read()

    # For files under 4MB, use simple upload
    if len(content) < 4 * 1024 * 1024:
        url = f"{GRAPH_BASE_URL}/drives/{drive_id}/root:/{target_path}:/content"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "text/plain"
        }

        response = requests.put(url, headers=headers, data=content)

        if response.status_code in [200, 201]:
            print(f"  Uploaded: {file_name} -> {target_path}")
            return True
        else:
            print(f"  Failed to upload {file_name}: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    else:
        print(f"  ERROR: File too large for simple upload: {file_name}")
        return False


def main():
    """Main execution function."""
    print("=" * 60)
    print("MPA v6.1 H1+H2 KB File Upload")
    print("=" * 60)

    # Get authentication token
    print("\n1. Authenticating with Microsoft Graph...")
    token = get_graph_token()

    if not token:
        print("ERROR: Failed to get authentication token")
        print("\nManual upload required. Use SharePoint web interface:")
        print(f"  URL: https://{SHAREPOINT_HOST}{SITE_PATH}")
        print("\nFiles to upload:")
        for kb in KB_FILES:
            print(f"  - {kb['source'].name} -> {kb['target_folder']}")
        return 1

    print("  Authentication successful!")

    # Get site ID
    print("\n2. Getting SharePoint site information...")
    site_id = get_site_id(token)

    if not site_id:
        print("ERROR: Failed to get site ID")
        return 1

    print(f"  Site ID: {site_id[:30]}...")

    # Get drive ID
    print("\n3. Getting document library...")
    drive_id = get_drive_id(token, site_id)

    if not drive_id:
        print("ERROR: Failed to get drive ID")
        return 1

    print(f"  Drive ID: {drive_id[:30]}...")

    # Upload files
    print("\n4. Uploading KB files...")
    success_count = 0
    fail_count = 0

    for kb in KB_FILES:
        source_path = kb["source"]
        target_folder = kb["target_folder"]

        print(f"\n  Processing: {source_path.name}")
        print(f"    Description: {kb['description']}")
        print(f"    Target: {target_folder}")

        # Ensure folder exists
        if not ensure_folder_exists(token, drive_id, target_folder):
            fail_count += 1
            continue

        # Upload file
        if upload_file(token, drive_id, source_path, target_folder):
            success_count += 1
        else:
            fail_count += 1

    # Summary
    print("\n" + "=" * 60)
    print("UPLOAD SUMMARY")
    print("=" * 60)
    print(f"  Successful: {success_count}")
    print(f"  Failed: {fail_count}")
    print(f"  Total: {len(KB_FILES)}")

    if fail_count == 0:
        print("\nAll KB files uploaded successfully!")
        print("\nNext steps:")
        print("  1. Add SharePoint locations to Copilot Studio knowledge sources")
        print("  2. Configure ORC agent to use new KB files")
        return 0
    else:
        print(f"\nSome uploads failed. Check errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
