"""
SharePoint Uploader Module for MPA Deployment Scripts.

Uploads files to SharePoint document libraries using Microsoft Graph API.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Callable, List, Optional

import requests


@dataclass
class UploadResult:
    """Result of a file upload operation."""
    filename: str
    success: bool
    was_updated: bool = False
    file_id: Optional[str] = None
    web_url: Optional[str] = None
    error: Optional[str] = None


class SharePointUploader:
    """
    Uploads files to SharePoint document library using Microsoft Graph.

    Features:
    - Simple upload for files < 4MB
    - Overwrite or skip existing files
    - Progress tracking
    """

    GRAPH_URL = "https://graph.microsoft.com/v1.0"

    def __init__(self, site_url: str, get_token: Callable[[], str]):
        """
        Initialize the SharePoint uploader.

        Args:
            site_url: SharePoint site URL (e.g., https://tenant.sharepoint.com/sites/SiteName)
            get_token: Callable that returns a valid Graph API access token
        """
        self.site_url = site_url.rstrip("/")
        self.get_token = get_token

        # Parse site info from URL
        # URL format: https://tenant.sharepoint.com/sites/SiteName
        parts = self.site_url.replace("https://", "").split("/")
        self.tenant_host = parts[0]  # tenant.sharepoint.com
        self.site_path = "/".join(parts[1:])  # sites/SiteName

        # Cache for site and drive IDs
        self._site_id: Optional[str] = None
        self._drive_cache: dict[str, str] = {}

    def _headers(self) -> dict[str, str]:
        """Get request headers with current token."""
        return {
            "Authorization": f"Bearer {self.get_token()}",
            "Content-Type": "application/json"
        }

    def _upload_headers(self, content_type: str = "application/octet-stream") -> dict[str, str]:
        """Get headers for file upload."""
        return {
            "Authorization": f"Bearer {self.get_token()}",
            "Content-Type": content_type
        }

    def get_site_id(self) -> str:
        """
        Get SharePoint site ID from URL.

        Returns:
            Site ID string

        Raises:
            SharePointError: If site cannot be found
        """
        if self._site_id:
            return self._site_id

        # Use site path format: hostname:/path
        url = f"{self.GRAPH_URL}/sites/{self.tenant_host}:/{self.site_path}"

        response = requests.get(url, headers=self._headers())

        if response.status_code == 200:
            data = response.json()
            self._site_id = data.get("id")
            return self._site_id
        else:
            raise SharePointError(
                f"Could not find site: {response.status_code} - {response.text[:200]}"
            )

    def get_drive_id(self, library_name: str) -> str:
        """
        Get drive ID for a document library.

        Args:
            library_name: Document library name (e.g., "MediaPlanningKB")

        Returns:
            Drive ID string

        Raises:
            SharePointError: If library cannot be found
        """
        if library_name in self._drive_cache:
            return self._drive_cache[library_name]

        site_id = self.get_site_id()

        # List all drives and find by name
        url = f"{self.GRAPH_URL}/sites/{site_id}/drives"

        response = requests.get(url, headers=self._headers())

        if response.status_code == 200:
            data = response.json()
            for drive in data.get("value", []):
                if drive.get("name") == library_name:
                    drive_id = drive.get("id")
                    self._drive_cache[library_name] = drive_id
                    return drive_id

            # Library not found - list available libraries
            available = [d.get("name") for d in data.get("value", [])]
            raise SharePointError(
                f"Library '{library_name}' not found. Available: {available}"
            )
        else:
            raise SharePointError(
                f"Could not list drives: {response.status_code} - {response.text[:200]}"
            )

    def file_exists(self, library_name: str, filename: str) -> Optional[str]:
        """
        Check if file exists in library.

        Args:
            library_name: Document library name
            filename: File name to check

        Returns:
            File ID if exists, None otherwise
        """
        drive_id = self.get_drive_id(library_name)

        url = f"{self.GRAPH_URL}/drives/{drive_id}/root:/{filename}"

        response = requests.get(url, headers=self._headers())

        if response.status_code == 200:
            data = response.json()
            return data.get("id")

        return None

    def upload_file(
        self,
        library_name: str,
        file_path: Path,
        target_folder: Optional[str] = None,
        overwrite: bool = True
    ) -> UploadResult:
        """
        Upload a single file to SharePoint.

        Uses simple upload for files < 4MB.

        Args:
            library_name: Target document library name
            file_path: Local file path to upload
            target_folder: Optional subfolder in library
            overwrite: If True, overwrite existing files

        Returns:
            UploadResult with operation details
        """
        if not file_path.exists():
            return UploadResult(
                filename=file_path.name,
                success=False,
                error=f"File not found: {file_path}"
            )

        # Check file size (simple upload limit is 4MB)
        file_size = file_path.stat().st_size
        if file_size > 4 * 1024 * 1024:
            return UploadResult(
                filename=file_path.name,
                success=False,
                error=f"File too large for simple upload: {file_size} bytes (max 4MB)"
            )

        try:
            drive_id = self.get_drive_id(library_name)
        except SharePointError as e:
            return UploadResult(
                filename=file_path.name,
                success=False,
                error=str(e)
            )

        # Build target path
        if target_folder:
            target_path = f"{target_folder.strip('/')}/{file_path.name}"
        else:
            target_path = file_path.name

        # Check if file exists
        was_updated = False
        if not overwrite:
            existing_id = self.file_exists(library_name, target_path)
            if existing_id:
                return UploadResult(
                    filename=file_path.name,
                    success=True,
                    was_updated=False,
                    file_id=existing_id,
                    error="File already exists (skipped)"
                )
        else:
            existing_id = self.file_exists(library_name, target_path)
            was_updated = existing_id is not None

        # Upload file
        url = f"{self.GRAPH_URL}/drives/{drive_id}/root:/{target_path}:/content"

        # Determine content type
        suffix = file_path.suffix.lower()
        content_types = {
            ".txt": "text/plain",
            ".json": "application/json",
            ".csv": "text/csv",
            ".md": "text/markdown",
            ".html": "text/html",
            ".pdf": "application/pdf",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
        content_type = content_types.get(suffix, "application/octet-stream")

        with open(file_path, "rb") as f:
            file_content = f.read()

        response = requests.put(
            url,
            headers=self._upload_headers(content_type),
            data=file_content
        )

        if response.status_code in (200, 201):
            data = response.json()
            return UploadResult(
                filename=file_path.name,
                success=True,
                was_updated=was_updated,
                file_id=data.get("id"),
                web_url=data.get("webUrl")
            )
        else:
            return UploadResult(
                filename=file_path.name,
                success=False,
                error=f"Upload failed: {response.status_code} - {response.text[:200]}"
            )

    def upload_folder(
        self,
        library_name: str,
        local_folder: Path,
        pattern: str = "*",
        target_folder: Optional[str] = None,
        overwrite: bool = True,
        progress_callback: Optional[Callable[[int, int, UploadResult], None]] = None
    ) -> List[UploadResult]:
        """
        Upload all matching files from a local folder.

        Args:
            library_name: Target document library name
            local_folder: Local folder path
            pattern: Glob pattern for files (default: "*")
            target_folder: Optional subfolder in library
            overwrite: If True, overwrite existing files
            progress_callback: Optional callback(current, total, result)

        Returns:
            List of UploadResult for each file
        """
        if not local_folder.exists():
            raise SharePointError(f"Folder not found: {local_folder}")

        files = list(local_folder.glob(pattern))
        files = [f for f in files if f.is_file()]

        results = []

        for i, file_path in enumerate(files):
            result = self.upload_file(
                library_name,
                file_path,
                target_folder=target_folder,
                overwrite=overwrite
            )
            results.append(result)

            if progress_callback:
                progress_callback(i + 1, len(files), result)

        return results


class SharePointError(Exception):
    """Raised when SharePoint operations fail."""
    pass


if __name__ == "__main__":
    print("SharePoint Uploader Module")
    print("-" * 40)
    print("This module provides SharePointUploader class for Graph API operations.")
    print("Use with MSALAuthenticator for authentication.")
