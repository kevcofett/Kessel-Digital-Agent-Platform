"""
MSAL Authentication Module for MPA Deployment Scripts.

Provides device code flow authentication for interactive CLI scripts.
Supports both Dataverse API and Microsoft Graph API.
"""

import json
import sys
from pathlib import Path
from typing import Optional

import msal


class MSALAuthenticator:
    """
    Handles device code flow authentication for interactive CLI scripts.

    Supports:
    - Dataverse API (https://{env}.crm.dynamics.com/.default)
    - Microsoft Graph API (https://graph.microsoft.com/.default)
    """

    GRAPH_SCOPE = "https://graph.microsoft.com/.default"

    # Microsoft Azure PowerShell well-known client ID - works for device code flow across tenants
    # This is a first-party Microsoft app that supports Dynamics CRM scopes
    DEFAULT_CLIENT_ID = "1950a258-227b-4e31-a9cf-717495945fc2"

    def __init__(self, tenant_id: str, client_id: Optional[str] = None, cache_file: Optional[Path] = None):
        """
        Initialize the authenticator.

        Args:
            tenant_id: Azure AD tenant ID
            client_id: Azure AD application (client) ID. If None or "TO_BE_CONFIGURED",
                      uses Microsoft's Azure PowerShell well-known client ID for device code flow.
            cache_file: Optional path to token cache file. Defaults to ~/.mpa_token_cache.json
        """
        self.tenant_id = tenant_id
        # Use default client ID if none provided or placeholder value
        if not client_id or client_id == "TO_BE_CONFIGURED":
            self.client_id = self.DEFAULT_CLIENT_ID
        else:
            self.client_id = client_id
        self.cache_file = cache_file or Path.home() / ".mpa_token_cache.json"
        self.authority = f"https://login.microsoftonline.com/{tenant_id}"

        self._token_cache = msal.SerializableTokenCache()
        self._load_cache()

        self._app = msal.PublicClientApplication(
            client_id=self.client_id,
            authority=self.authority,
            token_cache=self._token_cache
        )

    def _load_cache(self) -> None:
        """Load token cache from disk if it exists."""
        if self.cache_file.exists():
            try:
                self._token_cache.deserialize(self.cache_file.read_text())
            except (json.JSONDecodeError, Exception) as e:
                print(f"Warning: Could not load token cache: {e}")

    def _save_cache(self) -> None:
        """Save token cache to disk."""
        if self._token_cache.has_state_changed:
            try:
                self.cache_file.write_text(self._token_cache.serialize())
                self.cache_file.chmod(0o600)  # Restrict permissions
            except Exception as e:
                print(f"Warning: Could not save token cache: {e}")

    def get_dataverse_token(self, environment_url: str) -> str:
        """
        Get access token for Dataverse API using device code flow.

        Args:
            environment_url: Dataverse environment URL (e.g., https://org.crm.dynamics.com)

        Returns:
            Access token string

        Raises:
            AuthenticationError: If authentication fails
        """
        scope = f"{environment_url.rstrip('/')}/.default"
        return self._get_token([scope])

    def get_graph_token(self) -> str:
        """
        Get access token for Microsoft Graph API using device code flow.

        Returns:
            Access token string

        Raises:
            AuthenticationError: If authentication fails
        """
        return self._get_token([self.GRAPH_SCOPE])

    def _get_token(self, scopes: list[str]) -> str:
        """
        Get access token using device code flow with cache support.

        Args:
            scopes: List of OAuth scopes to request

        Returns:
            Access token string
        """
        # Try to get token from cache first
        accounts = self._app.get_accounts()
        if accounts:
            result = self._app.acquire_token_silent(scopes, account=accounts[0])
            if result and "access_token" in result:
                return result["access_token"]

        # Fall back to device code flow
        flow = self._app.initiate_device_flow(scopes=scopes)

        if "user_code" not in flow:
            error_msg = flow.get("error_description", "Unknown error initiating device flow")
            raise AuthenticationError(f"Failed to initiate device flow: {error_msg}")

        # Display instructions to user
        print("\n" + "=" * 60)
        print("AUTHENTICATION REQUIRED")
        print("=" * 60)
        print(f"\nTo sign in, use a web browser to open:")
        print(f"  {flow['verification_uri']}")
        print(f"\nAnd enter the code:")
        print(f"  {flow['user_code']}")
        print("\nWaiting for authentication...")
        print("=" * 60 + "\n")

        # Wait for user to authenticate
        result = self._app.acquire_token_by_device_flow(flow)

        if "access_token" not in result:
            error_msg = result.get("error_description", result.get("error", "Unknown error"))
            raise AuthenticationError(f"Authentication failed: {error_msg}")

        # Save cache after successful authentication
        self._save_cache()

        print("Authentication successful!\n")
        return result["access_token"]

    def clear_cache(self) -> None:
        """Clear the token cache."""
        if self.cache_file.exists():
            self.cache_file.unlink()
            print("Token cache cleared.")


class AuthenticationError(Exception):
    """Raised when authentication fails."""
    pass


if __name__ == "__main__":
    # Test the authenticator
    print("MSAL Authenticator Test")
    print("-" * 40)

    # These would normally come from settings
    test_tenant = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"
    test_client = "f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8"
    test_env = "https://aragornai.crm.dynamics.com"

    auth = MSALAuthenticator(test_tenant, test_client)

    try:
        token = auth.get_dataverse_token(test_env)
        print(f"Token obtained successfully!")
        print(f"Token length: {len(token)} characters")
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        sys.exit(1)
