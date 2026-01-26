#!/usr/bin/env python3
"""
Upload ADIS KB Documents to SharePoint.

Uploads all ADIS knowledge base documents to the SharePoint site
for the Personal (Aragorn AI) environment.
"""

import sys
from pathlib import Path

# Add scripts directory to path for imports
scripts_dir = Path(__file__).parent.parent.parent.parent.parent.parent / "scripts"
sys.path.insert(0, str(scripts_dir))

from auth.msal_auth import MSALAuthenticator, AuthenticationError
from sharepoint.uploader import SharePointUploader, SharePointError


# Configuration for Personal (Aragorn AI) environment
TENANT_ID = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"
CLIENT_ID = None  # Will use default Microsoft PowerShell client ID
SHAREPOINT_SITE = "https://kesseldigitalcom.sharepoint.com/sites/AragornAI2"
DOCUMENT_LIBRARY = "MediaPlanningKB"  # Default KB document library name

# Source files
KB_FOLDER = Path(__file__).parent.parent.parent.parent / "personal" / "kb"
ADIS_FILE_PATTERN = "ADIS_*.txt"


def main():
    """Upload ADIS KB documents to SharePoint."""
    print("\n=== ADIS KB Document Upload ===\n")
    print(f"Source folder: {KB_FOLDER}")
    print(f"Target site: {SHAREPOINT_SITE}")
    print(f"Target library: {DOCUMENT_LIBRARY}")

    # Find all ADIS KB files
    if not KB_FOLDER.exists():
        print(f"\nError: KB folder not found: {KB_FOLDER}")
        return 1

    files = list(KB_FOLDER.glob(ADIS_FILE_PATTERN))
    if not files:
        print(f"\nError: No files matching '{ADIS_FILE_PATTERN}' found in {KB_FOLDER}")
        return 1

    print(f"\nFound {len(files)} ADIS KB documents:")
    for f in files:
        print(f"  - {f.name}")

    # Initialize authenticator
    print("\n--- Authentication ---")
    try:
        auth = MSALAuthenticator(TENANT_ID, CLIENT_ID)
    except Exception as e:
        print(f"Error initializing authenticator: {e}")
        return 1

    # Create token getter function for uploader
    def get_token():
        return auth.get_graph_token()

    # Get initial token (will trigger device code flow if needed)
    try:
        print("Authenticating to Microsoft Graph...")
        token = get_token()
        print("Authentication successful!")
    except AuthenticationError as e:
        print(f"\nAuthentication failed: {e}")
        return 1

    # Initialize uploader
    print("\n--- SharePoint Upload ---")
    uploader = SharePointUploader(SHAREPOINT_SITE, get_token)

    # Get site ID to verify access
    try:
        site_id = uploader.get_site_id()
        print(f"Connected to site: {site_id[:50]}...")
    except SharePointError as e:
        print(f"\nError connecting to SharePoint: {e}")
        return 1

    # Try to get drive ID (will list available libraries if not found)
    try:
        drive_id = uploader.get_drive_id(DOCUMENT_LIBRARY)
        print(f"Found library: {DOCUMENT_LIBRARY}")
    except SharePointError as e:
        print(f"\nError: {e}")
        print("\nYou may need to:")
        print("1. Create the document library in SharePoint")
        print("2. Or update DOCUMENT_LIBRARY in this script to match an existing library")
        return 1

    # Upload files
    print("\nUploading files...")

    def progress_callback(current, total, result):
        status = "✓" if result.success else "✗"
        update = " (updated)" if result.was_updated else ""
        error = f" - {result.error}" if result.error and not result.success else ""
        print(f"  [{current}/{total}] {status} {result.filename}{update}{error}")

    try:
        results = uploader.upload_folder(
            DOCUMENT_LIBRARY,
            KB_FOLDER,
            pattern=ADIS_FILE_PATTERN,
            overwrite=True,
            progress_callback=progress_callback
        )
    except SharePointError as e:
        print(f"\nError during upload: {e}")
        return 1

    # Summary
    print("\n--- Upload Summary ---")
    success_count = sum(1 for r in results if r.success)
    update_count = sum(1 for r in results if r.success and r.was_updated)
    new_count = success_count - update_count
    fail_count = len(results) - success_count

    print(f"Total files: {len(results)}")
    print(f"Successful: {success_count}")
    print(f"  - New: {new_count}")
    print(f"  - Updated: {update_count}")
    print(f"Failed: {fail_count}")

    if fail_count > 0:
        print("\nFailed files:")
        for r in results:
            if not r.success:
                print(f"  - {r.filename}: {r.error}")
        return 1

    print("\n✓ All ADIS KB documents uploaded successfully!")
    print(f"\nView documents at: {SHAREPOINT_SITE}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
