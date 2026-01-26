"""
Dataverse client for Azure Functions.
All data access goes through this client.

IMPORTANT: This client uses Entity Set Names (plural form) for all API calls.
Table names are automatically converted using the table_config module.
"""

import os
import requests
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from azure.identity import DefaultAzureCredential, ManagedIdentityCredential

from .table_config import get_table_name

logger = logging.getLogger(__name__)


class DataverseClient:
    """Client for Dataverse API operations."""

    def __init__(self):
        self.environment_url = os.environ.get(
            "DATAVERSE_URL",
            "https://aragornai.crm.dynamics.com"
        )
        self.api_version = "v9.2"
        self._token = None
        self._token_expires = None

    def _get_token(self) -> str:
        """Get access token using managed identity or default credentials."""
        now = datetime.utcnow()

        # Return cached token if still valid
        if self._token and self._token_expires and now < self._token_expires:
            return self._token

        try:
            # Try managed identity first (for Azure deployment)
            credential = ManagedIdentityCredential()
            scope = f"{self.environment_url}/.default"
            token = credential.get_token(scope)
        except Exception:
            # Fall back to default credential (for local dev)
            credential = DefaultAzureCredential()
            scope = f"{self.environment_url}/.default"
            token = credential.get_token(scope)

        self._token = token.token
        # Refresh 5 minutes before expiry
        self._token_expires = now + timedelta(seconds=token.expires_on - 300)

        return self._token

    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authorization."""
        return {
            "Authorization": f"Bearer {self._get_token()}",
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Prefer": "return=representation"
        }

    def _get_api_url(self, table_name: str) -> str:
        """
        Construct API URL for a table.

        Args:
            table_name: Table name in any format (singular, plural, short name, legacy)

        Returns:
            Full API URL using the Entity Set Name (plural form)
        """
        # Use get_table_name to convert any format to Entity Set Name (plural)
        entity_set_name = get_table_name(table_name)
        return f"{self.environment_url}/api/data/{self.api_version}/{entity_set_name}"

    def create_record(self, table_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new record in Dataverse."""
        url = self._get_api_url(table_name)

        logger.info(f"Creating record in {table_name}")
        response = requests.post(url, headers=self._get_headers(), json=data)
        response.raise_for_status()

        # Get the created record ID from response headers
        record_uri = response.headers.get("OData-EntityId", "")
        record_id = record_uri.split("(")[-1].rstrip(")")

        return {"id": record_id, **response.json()}

    def get_record(self, table_name: str, record_id: str, select: Optional[List[str]] = None) -> Dict[str, Any]:
        """Get a record by ID."""
        url = f"{self._get_api_url(table_name)}({record_id})"

        params = {}
        if select:
            params["$select"] = ",".join(select)

        response = requests.get(url, headers=self._get_headers(), params=params)
        response.raise_for_status()
        return response.json()

    def update_record(self, table_name: str, record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing record."""
        url = f"{self._get_api_url(table_name)}({record_id})"

        logger.info(f"Updating record {record_id} in {table_name}")
        response = requests.patch(url, headers=self._get_headers(), json=data)
        response.raise_for_status()

        return {"id": record_id, "status": "updated"}

    def delete_record(self, table_name: str, record_id: str) -> Dict[str, Any]:
        """Delete a record."""
        url = f"{self._get_api_url(table_name)}({record_id})"

        logger.info(f"Deleting record {record_id} from {table_name}")
        response = requests.delete(url, headers=self._get_headers())
        response.raise_for_status()

        return {"id": record_id, "status": "deleted"}

    def query_records(
        self,
        table_name: str,
        filter_query: Optional[str] = None,
        select: Optional[List[str]] = None,
        order_by: Optional[str] = None,
        top: Optional[int] = None,
        expand: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Query records with OData filters."""
        url = self._get_api_url(table_name)

        params = {}
        if filter_query:
            params["$filter"] = filter_query
        if select:
            params["$select"] = ",".join(select)
        if order_by:
            params["$orderby"] = order_by
        if top:
            params["$top"] = str(top)
        if expand:
            params["$expand"] = expand

        logger.debug(f"Querying {table_name} with params: {params}")
        response = requests.get(url, headers=self._get_headers(), params=params)
        response.raise_for_status()

        return response.json().get("value", [])

    def query_all_records(
        self,
        table_name: str,
        filter_query: Optional[str] = None,
        select: Optional[List[str]] = None,
        order_by: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Query all records with pagination support."""
        all_records = []
        url = self._get_api_url(table_name)

        params = {}
        if filter_query:
            params["$filter"] = filter_query
        if select:
            params["$select"] = ",".join(select)
        if order_by:
            params["$orderby"] = order_by

        while url:
            response = requests.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            data = response.json()

            all_records.extend(data.get("value", []))

            # Get next page URL
            url = data.get("@odata.nextLink")
            params = {}  # Clear params for next page (included in nextLink)

        return all_records

    def get_records(
        self,
        table_name: str,
        select: Optional[str] = None,
        filter_query: Optional[str] = None,
        order_by: Optional[str] = None,
        top: Optional[int] = None,
        expand: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get records from a table with optional filtering.

        Convenience method that wraps query_records with a different parameter order
        commonly used in cached_data_access.

        Args:
            table_name: Table name (any format - will be converted to Entity Set Name)
            select: Comma-separated column names to select
            filter_query: OData filter expression
            order_by: OData order by expression
            top: Maximum records to return
            expand: OData expand expression

        Returns:
            List of records
        """
        select_list = select.split(",") if select else None
        return self.query_records(
            table_name=table_name,
            filter_query=filter_query,
            select=select_list,
            order_by=order_by,
            top=top,
            expand=expand
        )
