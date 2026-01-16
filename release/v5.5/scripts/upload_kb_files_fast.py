#!/usr/bin/env python3
"""
FAST Upload KB Files to SharePoint.

Uses concurrent uploads for 4-5x faster performance.
Uploads 22 files in ~5 seconds instead of ~30 seconds.

Usage:
    python upload_kb_files_fast.py [--library LIBRARY] [-v]
"""

import argparse
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import Callable, List, Optional

import requests

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from auth.msal_auth import MSALAuthenticator, AuthenticationError
from config.settings import Settings


# =============================================================================
# FAST SHAREPOINT UPLOADER
# =============================================================================

class FastSharePointUploader:
    """
    Fast SharePoint uploader using concurrent uploads.
    
    Key optimizations:
    - Skips existence check (just overwrites)
    - Concurrent uploads with ThreadPoolExecutor
    - Caches drive ID
    """
    
    GRAPH_URL = "https://graph.microsoft.com/v1.0"
    MAX_WORKERS = 5  # Concurrent upload threads
    
    def __init__(self, site_url: str, get_token: Callable[[], str]):
        self.site_url = site_url.rstrip("/")
        self.get_token = get_token
        
        # Parse site info from URL
        parts = self.site_url.replace("https://", "").split("/")
        self.tenant_host = parts[0]
        self.site_path = "/".join(parts[1:])
        
        self._site_id: Optional[str] = None
        self._drive_cache: dict[str, str] = {}
    
    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.get_token()}",
            "Content-Type": "application/json"
        }
    
    def _upload_headers(self, content_type: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.get_token()}",
            "Content-Type": content_type
        }
    
    def get_site_id(self) -> str:
        if self._site_id:
            return self._site_id
        
        url = f"{self.GRAPH_URL}/sites/{self.tenant_host}:/{self.site_path}"
        response = requests.get(url, headers=self._headers())
        
        if response.status_code == 200:
            self._site_id = response.json().get("id")
            return self._site_id
        else:
            raise Exception(f"Could not find site: {response.status_code}")
    
    def get_drive_id(self, library_name: str) -> str:
        if library_name in self._drive_cache:
            return self._drive_cache[library_name]
        
        site_id = self.get_site_id()
        url = f"{self.GRAPH_URL}/sites/{site_id}/drives"
        response = requests.get(url, headers=self._headers())
        
        if response.status_code == 200:
            for drive in response.json().get("value", []):
                if drive.get("name") == library_name:
                    self._drive_cache[library_name] = drive.get("id")
                    return self._drive_cache[library_name]
            
            available = [d.get("name") for d in response.json().get("value", [])]
            raise Exception(f"Library '{library_name}' not found. Available: {available}")
        else:
            raise Exception(f"Could not list drives: {response.status_code}")
    
    def upload_single_file(self, drive_id: str, file_path: Path) -> dict:
        """Upload a single file directly (no existence check)."""
        
        # Determine content type
        content_types = {
            ".txt": "text/plain",
            ".json": "application/json",
            ".csv": "text/csv",
            ".md": "text/markdown",
        }
        content_type = content_types.get(file_path.suffix.lower(), "application/octet-stream")
        
        url = f"{self.GRAPH_URL}/drives/{drive_id}/root:/{file_path.name}:/content"
        
        with open(file_path, "rb") as f:
            file_content = f.read()
        
        response = requests.put(
            url,
            headers=self._upload_headers(content_type),
            data=file_content
        )
        
        return {
            "filename": file_path.name,
            "success": response.status_code in (200, 201),
            "status_code": response.status_code,
            "error": None if response.status_code in (200, 201) else response.text[:100]
        }
    
    def upload_folder_fast(
        self,
        library_name: str,
        local_folder: Path,
        pattern: str = "*.txt"
    ) -> List[dict]:
        """
        Upload all matching files concurrently.
        
        Returns:
            List of result dicts
        """
        files = list(local_folder.glob(pattern))
        files = [f for f in files if f.is_file()]
        
        if not files:
            return []
        
        # Get drive ID once (cached)
        drive_id = self.get_drive_id(library_name)
        
        results = []
        
        # Upload concurrently
        with ThreadPoolExecutor(max_workers=self.MAX_WORKERS) as executor:
            future_to_file = {
                executor.submit(self.upload_single_file, drive_id, f): f 
                for f in files
            }
            
            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                try:
                    result = future.result()
                    results.append(result)
                    
                    status = "✓" if result["success"] else "✗"
                    print(f"  {result['filename']}: {status}")
                    
                except Exception as e:
                    results.append({
                        "filename": file_path.name,
                        "success": False,
                        "error": str(e)
                    })
                    print(f"  {file_path.name}: ✗ {e}")
        
        return results


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="FAST KB file upload to SharePoint")
    parser.add_argument("--library", type=str, help="Target SharePoint library name")
    parser.add_argument("--pattern", type=str, default="*.txt", help="File pattern")
    parser.add_argument("-v", "--verbose", action="store_true")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("MPA KB Files FAST SharePoint Upload")
    print("=" * 60)
    
    start_time = datetime.now()
    
    # Load settings
    try:
        settings = Settings()
        print(f"\nSharePoint Site: {settings.sharepoint.site_url}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    # Determine library name
    library_name = args.library or settings.sharepoint.kb_libraries.get("mpa", "MediaPlanningKB")
    print(f"Target Library: {library_name}")
    
    # Find KB files
    kb_path = settings.kb_path
    if not kb_path.exists():
        print(f"Error: KB folder not found: {kb_path}")
        sys.exit(1)
    
    kb_files = list(kb_path.glob(args.pattern))
    kb_files = [f for f in kb_files if f.is_file()]
    
    print(f"KB Folder: {kb_path}")
    print(f"Files found: {len(kb_files)}")
    
    if len(kb_files) == 0:
        print("No files to upload.")
        sys.exit(0)
    
    # Authenticate
    print("\nAuthenticating...")
    try:
        auth = MSALAuthenticator(
            settings.auth.tenant_id,
            settings.auth.client_id
        )
        token = auth.get_graph_token()
        print("Authentication successful!")
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        sys.exit(1)
    
    # Create fast uploader
    uploader = FastSharePointUploader(
        settings.sharepoint.site_url,
        auth.get_graph_token
    )
    
    # Verify access
    print("\nVerifying SharePoint access...")
    try:
        site_id = uploader.get_site_id()
        print(f"  Site ID: {site_id[:20]}...")
        
        drive_id = uploader.get_drive_id(library_name)
        print(f"  Drive ID: {drive_id[:20]}...")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    # Upload files concurrently
    print(f"\nUploading {len(kb_files)} files (concurrent)...")
    print("-" * 60)
    
    results = uploader.upload_folder_fast(
        library_name=library_name,
        local_folder=kb_path,
        pattern=args.pattern
    )
    
    elapsed = (datetime.now() - start_time).total_seconds()
    
    # Summary
    print("-" * 60)
    success_count = sum(1 for r in results if r["success"])
    failed_count = len(results) - success_count
    
    print(f"\nUpload Summary:")
    print(f"  Total:   {len(results)}")
    print(f"  Success: {success_count}")
    print(f"  Failed:  {failed_count}")
    print(f"  Time:    {elapsed:.1f}s ({len(results)/elapsed:.1f} files/sec)")
    
    if failed_count > 0:
        print("\nFailed uploads:")
        for r in results:
            if not r["success"]:
                print(f"  {r['filename']}: {r.get('error', 'Unknown error')}")
        sys.exit(1)
    else:
        print("\n[SUCCESS] All KB files uploaded!")


if __name__ == "__main__":
    main()
