"""
Dataverse Connector
Connects to Microsoft Dataverse (Power Platform) for data ingestion
"""

import logging
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import pandas as pd

from ..base import DataConnector

logger = logging.getLogger(__name__)


class DataverseConnector(DataConnector):
    """
    Connector for Microsoft Dataverse (Power Platform).

    Supports:
    - OAuth authentication
    - OData queries
    - Table/entity operations
    - Pagination
    - Column selection and filtering
    """

    def __init__(
        self,
        environment_url: str,
        client_id: str,
        client_secret: str,
        tenant_id: str,
        api_version: str = 'v9.2',
    ):
        connection_config = {
            'environment_url': environment_url,
            'client_id': client_id,
            'client_secret': client_secret,
            'tenant_id': tenant_id,
            'api_version': api_version,
        }
        super().__init__(connection_config)
        self._access_token: Optional[str] = None
        self._token_expires: Optional[float] = None

    def connect(self) -> bool:
        """Authenticate with Dataverse."""
        try:
            self._access_token = self._get_access_token()
            self._connected = True
            logger.info("Connected to Dataverse successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Dataverse: {e}")
            self._connected = False
            return False

    def disconnect(self) -> None:
        """Disconnect from Dataverse."""
        self._access_token = None
        self._connected = False
        logger.info("Disconnected from Dataverse")

    def read(
        self,
        query: Optional[str] = None,
        table_name: Optional[str] = None,
        columns: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        top: Optional[int] = None,
        order_by: Optional[str] = None,
        **kwargs,
    ) -> pd.DataFrame:
        """
        Read data from Dataverse table.

        Args:
            query: Full OData query (overrides other params)
            table_name: Dataverse table name (logical name)
            columns: List of columns to select
            filters: Filter conditions
            top: Maximum number of records
            order_by: Column to order by

        Returns:
            DataFrame with query results
        """
        if not self._connected:
            raise ConnectionError("Not connected to Dataverse")

        # Build OData URL
        if query:
            url = query
        else:
            url = self._build_odata_query(
                table_name=table_name or kwargs.get('entity_name'),
                columns=columns,
                filters=filters,
                top=top,
                order_by=order_by,
            )

        # Execute query with pagination
        all_records = []
        next_link = url

        while next_link:
            response = self._execute_request(next_link)
            records = response.get('value', [])
            all_records.extend(records)

            # Check for next page
            next_link = response.get('@odata.nextLink')

            if top and len(all_records) >= top:
                all_records = all_records[:top]
                break

        logger.info(f"Retrieved {len(all_records)} records from Dataverse")
        return pd.DataFrame(all_records)

    def write(
        self,
        data: pd.DataFrame,
        table_name: str,
        mode: str = 'append',
        batch_size: int = 1000,
        **kwargs,
    ) -> bool:
        """
        Write data to Dataverse table.

        Args:
            data: DataFrame to write
            table_name: Target table name
            mode: 'append' or 'upsert'
            batch_size: Records per batch

        Returns:
            True if successful
        """
        if not self._connected:
            raise ConnectionError("Not connected to Dataverse")

        records = data.to_dict('records')
        total = len(records)
        success_count = 0

        for i in range(0, total, batch_size):
            batch = records[i:i + batch_size]

            try:
                if mode == 'upsert':
                    self._upsert_batch(table_name, batch)
                else:
                    self._insert_batch(table_name, batch)

                success_count += len(batch)
                logger.info(f"Written {success_count}/{total} records")

            except Exception as e:
                logger.error(f"Failed to write batch: {e}")
                return False

        return success_count == total

    def _get_access_token(self) -> str:
        """Get OAuth access token from Azure AD."""
        import time
        try:
            import requests
        except ImportError:
            raise ImportError("requests package required for Dataverse connector")

        # Check if token is still valid
        if self._access_token and self._token_expires:
            if time.time() < self._token_expires - 60:  # 1 minute buffer
                return self._access_token

        tenant_id = self.connection_config['tenant_id']
        token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

        environment_url = self.connection_config['environment_url'].rstrip('/')
        scope = f"{environment_url}/.default"

        data = {
            'grant_type': 'client_credentials',
            'client_id': self.connection_config['client_id'],
            'client_secret': self.connection_config['client_secret'],
            'scope': scope,
        }

        response = requests.post(token_url, data=data)
        response.raise_for_status()

        token_data = response.json()
        self._access_token = token_data['access_token']
        self._token_expires = time.time() + token_data.get('expires_in', 3600)

        return self._access_token

    def _build_odata_query(
        self,
        table_name: str,
        columns: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        top: Optional[int] = None,
        order_by: Optional[str] = None,
    ) -> str:
        """Build OData query URL."""
        base_url = self.connection_config['environment_url'].rstrip('/')
        api_version = self.connection_config['api_version']

        url = f"{base_url}/api/data/{api_version}/{table_name}"

        query_params = []

        # Select columns
        if columns:
            query_params.append(f"$select={','.join(columns)}")

        # Filter conditions
        if filters:
            filter_parts = []
            for key, value in filters.items():
                # Handle different filter operators
                if key.endswith('__gt'):
                    col = key[:-4]
                    filter_parts.append(f"{col} gt {self._format_value(value)}")
                elif key.endswith('__lt'):
                    col = key[:-4]
                    filter_parts.append(f"{col} lt {self._format_value(value)}")
                elif key.endswith('__gte'):
                    col = key[:-5]
                    filter_parts.append(f"{col} ge {self._format_value(value)}")
                elif key.endswith('__lte'):
                    col = key[:-5]
                    filter_parts.append(f"{col} le {self._format_value(value)}")
                elif key.endswith('__ne'):
                    col = key[:-4]
                    filter_parts.append(f"{col} ne {self._format_value(value)}")
                elif key.endswith('__contains'):
                    col = key[:-10]
                    filter_parts.append(f"contains({col}, {self._format_value(value)})")
                else:
                    filter_parts.append(f"{key} eq {self._format_value(value)}")

            if filter_parts:
                query_params.append(f"$filter={' and '.join(filter_parts)}")

        # Top (limit)
        if top:
            query_params.append(f"$top={top}")

        # Order by
        if order_by:
            query_params.append(f"$orderby={order_by}")

        if query_params:
            url += '?' + '&'.join(query_params)

        return url

    def _format_value(self, value: Any) -> str:
        """Format value for OData query."""
        if isinstance(value, str):
            return f"'{value}'"
        elif isinstance(value, bool):
            return str(value).lower()
        elif value is None:
            return 'null'
        else:
            return str(value)

    def _execute_request(self, url: str, method: str = 'GET', data: Any = None) -> Dict:
        """Execute HTTP request to Dataverse."""
        try:
            import requests
        except ImportError:
            raise ImportError("requests package required for Dataverse connector")

        headers = {
            'Authorization': f'Bearer {self._access_token}',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }

        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method == 'PATCH':
            response = requests.patch(url, headers=headers, json=data)
        else:
            raise ValueError(f"Unsupported method: {method}")

        response.raise_for_status()

        if response.content:
            return response.json()
        return {}

    def _insert_batch(self, table_name: str, records: List[Dict]) -> None:
        """Insert batch of records."""
        base_url = self.connection_config['environment_url'].rstrip('/')
        api_version = self.connection_config['api_version']

        for record in records:
            url = f"{base_url}/api/data/{api_version}/{table_name}"
            self._execute_request(url, method='POST', data=record)

    def _upsert_batch(self, table_name: str, records: List[Dict]) -> None:
        """Upsert batch of records."""
        base_url = self.connection_config['environment_url'].rstrip('/')
        api_version = self.connection_config['api_version']

        for record in records:
            # Assume primary key is in record
            primary_key = record.get('id') or record.get(f'{table_name}id')
            if primary_key:
                url = f"{base_url}/api/data/{api_version}/{table_name}({primary_key})"
                self._execute_request(url, method='PATCH', data=record)
            else:
                url = f"{base_url}/api/data/{api_version}/{table_name}"
                self._execute_request(url, method='POST', data=record)

    def get_table_metadata(self, table_name: str) -> Dict[str, Any]:
        """Get metadata for a Dataverse table."""
        base_url = self.connection_config['environment_url'].rstrip('/')
        api_version = self.connection_config['api_version']

        url = f"{base_url}/api/data/{api_version}/EntityDefinitions(LogicalName='{table_name}')"
        url += "?$select=LogicalName,DisplayName,PrimaryIdAttribute,PrimaryNameAttribute"
        url += "&$expand=Attributes($select=LogicalName,AttributeType,DisplayName)"

        return self._execute_request(url)

    def list_tables(self) -> List[str]:
        """List all available tables in Dataverse."""
        base_url = self.connection_config['environment_url'].rstrip('/')
        api_version = self.connection_config['api_version']

        url = f"{base_url}/api/data/{api_version}/EntityDefinitions"
        url += "?$select=LogicalName,DisplayName&$filter=IsCustomEntity eq true or IsManaged eq false"

        response = self._execute_request(url)
        return [entity['LogicalName'] for entity in response.get('value', [])]
