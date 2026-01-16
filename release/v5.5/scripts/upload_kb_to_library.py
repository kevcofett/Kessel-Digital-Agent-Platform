#!/usr/bin/env python3
"""
Upload KB Files to Specific SharePoint Library.

Generic uploader that takes source folder and target library as arguments.

Usage:
    python upload_kb_to_library.py <source_folder> <library_name> [--overwrite] [-v]

Examples:
    python upload_kb_to_library.py /path/to/Consulting_Agent/kb consultingAgentKB
    python upload_kb_to_library.py /path/to/Enterprise_AI_Platform/kb EAPsharekb
"""

import argparse
import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from auth.msal_auth import MSALAuthenticator, AuthenticationError
from config.settings import Settings
from sharepoint.uploader import SharePointUploader, SharePointError, UploadResult


def print_progress(current: int, total: int, result: UploadResult):
    """Print upload progress."""
    status = "OK" if result.success else "FAIL"
    action = "updated" if result.was_updated else "created"

    if result.success:
        print(f"[{current}/{total}] {result.filename}: {action} [{status}]")
    else:
        print(f"[{current}/{total}] {result.filename}: {result.error} [{status}]")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Upload KB files from any folder to any SharePoint library"
    )
    parser.add_argument(
        "source_folder",
        type=str,
        help="Path to folder containing KB files to upload"
    )
    parser.add_argument(
        "library_name",
        type=str,
        help="Target SharePoint library name"
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        default=True,
        help="Overwrite existing files (default: True)"
    )
    parser.add_argument(
        "--no-overwrite",
        action="store_true",
        help="Skip existing files instead of overwriting"
    )
    parser.add_argument(
        "--pattern",
        type=str,
        default="*.txt",
        help="File pattern to upload (default: *.txt)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Print verbose output"
    )

    args = parser.parse_args()

    # Handle overwrite flag
    overwrite = not args.no_overwrite

    # Resolve source folder
    source_path = Path(args.source_folder).resolve()
    library_name = args.library_name

    print("=" * 60)
    print(f"KB Files SharePoint Upload")
    print("=" * 60)
    print(f"\nSource Folder: {source_path}")
    print(f"Target Library: {library_name}")

    # Validate source folder
    if not source_path.exists():
        print(f"Error: Source folder not found: {source_path}")
        sys.exit(1)

    if not source_path.is_dir():
        print(f"Error: Source path is not a directory: {source_path}")
        sys.exit(1)

    # Load settings for auth and SharePoint site URL
    try:
        settings = Settings()
        print(f"SharePoint Site: {settings.sharepoint.site_url}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Find KB files
    kb_files = list(source_path.glob(args.pattern))
    kb_files = [f for f in kb_files if f.is_file()]

    print(f"Files found: {len(kb_files)} (pattern: {args.pattern})")

    if len(kb_files) == 0:
        print("No files to upload.")
        sys.exit(0)

    if args.verbose:
        print("\nFiles to upload:")
        for f in kb_files:
            print(f"  {f.name} ({f.stat().st_size:,} bytes)")

    # Authenticate
    print("\nAuthenticating to Microsoft Graph...")
    try:
        auth = MSALAuthenticator(
            settings.auth.tenant_id,
            settings.auth.client_id
        )
        # Test authentication
        token = auth.get_graph_token()
        print("Authentication successful!")
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        sys.exit(1)

    # Create uploader
    uploader = SharePointUploader(
        settings.sharepoint.site_url,
        auth.get_graph_token
    )

    # Verify site and library access
    print("\nVerifying SharePoint access...")
    try:
        site_id = uploader.get_site_id()
        print(f"  Site ID: {site_id[:20]}...")

        drive_id = uploader.get_drive_id(library_name)
        print(f"  Drive ID: {drive_id[:20]}...")
    except SharePointError as e:
        print(f"Error: {e}")
        print(f"\nNote: Library '{library_name}' may not exist or you may not have access.")
        sys.exit(1)

    # Upload files
    print(f"\nUploading {len(kb_files)} files...")
    print("-" * 60)

    start_time = datetime.now()

    results = uploader.upload_folder(
        library_name=library_name,
        local_folder=source_path,
        pattern=args.pattern,
        overwrite=overwrite,
        progress_callback=print_progress
    )

    elapsed = (datetime.now() - start_time).total_seconds()

    # Summary
    print("-" * 60)
    success_count = sum(1 for r in results if r.success)
    failed_count = len(results) - success_count
    created_count = sum(1 for r in results if r.success and not r.was_updated)
    updated_count = sum(1 for r in results if r.success and r.was_updated)

    print(f"\nUpload Summary:")
    print(f"  Total:   {len(results)}")
    print(f"  Created: {created_count}")
    print(f"  Updated: {updated_count}")
    print(f"  Failed:  {failed_count}")
    print(f"  Time:    {elapsed:.1f}s")

    if failed_count > 0:
        print("\nFailed uploads:")
        for r in results:
            if not r.success:
                print(f"  {r.filename}: {r.error}")

    if success_count == len(results):
        print(f"\n[SUCCESS] All {len(results)} KB files uploaded to {library_name}")
    else:
        print(f"\n[WARNING] {failed_count} files failed to upload")
        sys.exit(1)


if __name__ == "__main__":
    main()
