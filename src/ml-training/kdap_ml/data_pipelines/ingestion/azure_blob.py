"""
Azure Blob Storage Connector
Connects to Azure Blob Storage for data ingestion
"""

import io
import logging
from typing import Any, Dict, List, Optional

import pandas as pd

from ..base import DataConnector

logger = logging.getLogger(__name__)


class AzureBlobConnector(DataConnector):
    """
    Connector for Azure Blob Storage.

    Supports:
    - CSV, Parquet, JSON file formats
    - Connection string or managed identity authentication
    - Blob listing and filtering
    - Streaming for large files
    """

    def __init__(
        self,
        connection_string: Optional[str] = None,
        account_name: Optional[str] = None,
        account_key: Optional[str] = None,
        sas_token: Optional[str] = None,
        container_name: Optional[str] = None,
        use_managed_identity: bool = False,
    ):
        connection_config = {
            'connection_string': connection_string,
            'account_name': account_name,
            'account_key': account_key,
            'sas_token': sas_token,
            'container_name': container_name,
            'use_managed_identity': use_managed_identity,
        }
        super().__init__(connection_config)
        self._blob_service_client = None
        self._container_client = None

    def connect(self) -> bool:
        """Connect to Azure Blob Storage."""
        try:
            from azure.storage.blob import BlobServiceClient
        except ImportError:
            raise ImportError("azure-storage-blob package required for Azure Blob connector")

        try:
            if self.connection_config.get('connection_string'):
                self._blob_service_client = BlobServiceClient.from_connection_string(
                    self.connection_config['connection_string']
                )
            elif self.connection_config.get('use_managed_identity'):
                from azure.identity import DefaultAzureCredential
                credential = DefaultAzureCredential()
                account_name = self.connection_config['account_name']
                account_url = f"https://{account_name}.blob.core.windows.net"
                self._blob_service_client = BlobServiceClient(account_url, credential=credential)
            else:
                account_name = self.connection_config['account_name']
                account_url = f"https://{account_name}.blob.core.windows.net"

                if self.connection_config.get('account_key'):
                    self._blob_service_client = BlobServiceClient(
                        account_url,
                        credential=self.connection_config['account_key']
                    )
                elif self.connection_config.get('sas_token'):
                    self._blob_service_client = BlobServiceClient(
                        account_url,
                        credential=self.connection_config['sas_token']
                    )
                else:
                    raise ValueError("No valid authentication method provided")

            # Get container client if specified
            if self.connection_config.get('container_name'):
                self._container_client = self._blob_service_client.get_container_client(
                    self.connection_config['container_name']
                )

            self._connected = True
            logger.info("Connected to Azure Blob Storage successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to connect to Azure Blob Storage: {e}")
            self._connected = False
            return False

    def disconnect(self) -> None:
        """Disconnect from Azure Blob Storage."""
        self._blob_service_client = None
        self._container_client = None
        self._connected = False
        logger.info("Disconnected from Azure Blob Storage")

    def read(
        self,
        blob_name: Optional[str] = None,
        container_name: Optional[str] = None,
        prefix: Optional[str] = None,
        file_format: str = 'csv',
        columns: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> pd.DataFrame:
        """
        Read data from Azure Blob Storage.

        Args:
            blob_name: Specific blob to read
            container_name: Override default container
            prefix: Blob prefix for filtering
            file_format: 'csv', 'parquet', 'json'
            columns: Columns to select
            filters: Post-read filters

        Returns:
            DataFrame with blob contents
        """
        if not self._connected:
            raise ConnectionError("Not connected to Azure Blob Storage")

        container_client = self._get_container_client(container_name)

        if blob_name:
            # Read single blob
            data = self._read_blob(container_client, blob_name, file_format, columns, **kwargs)
        else:
            # Read multiple blobs with prefix
            blobs = self._list_blobs(container_client, prefix)
            data_frames = []

            for blob in blobs:
                if self._is_data_file(blob.name, file_format):
                    try:
                        df = self._read_blob(container_client, blob.name, file_format, columns, **kwargs)
                        df['_source_blob'] = blob.name
                        data_frames.append(df)
                    except Exception as e:
                        logger.warning(f"Failed to read blob {blob.name}: {e}")

            if data_frames:
                data = pd.concat(data_frames, ignore_index=True)
            else:
                data = pd.DataFrame()

        # Apply filters if provided
        if filters and len(data) > 0:
            data = self._apply_filters(data, filters)

        logger.info(f"Read {len(data)} rows from Azure Blob Storage")
        return data

    def write(
        self,
        data: pd.DataFrame,
        blob_name: str,
        container_name: Optional[str] = None,
        file_format: str = 'parquet',
        overwrite: bool = True,
        **kwargs,
    ) -> bool:
        """
        Write data to Azure Blob Storage.

        Args:
            data: DataFrame to write
            blob_name: Target blob name
            container_name: Override default container
            file_format: 'csv', 'parquet', 'json'
            overwrite: Overwrite if exists

        Returns:
            True if successful
        """
        if not self._connected:
            raise ConnectionError("Not connected to Azure Blob Storage")

        container_client = self._get_container_client(container_name)
        blob_client = container_client.get_blob_client(blob_name)

        try:
            # Serialize data
            buffer = io.BytesIO()

            if file_format == 'parquet':
                data.to_parquet(buffer, index=False, **kwargs)
            elif file_format == 'csv':
                data.to_csv(buffer, index=False, **kwargs)
            elif file_format == 'json':
                data.to_json(buffer, orient='records', **kwargs)
            else:
                raise ValueError(f"Unsupported format: {file_format}")

            buffer.seek(0)

            # Upload
            blob_client.upload_blob(buffer, overwrite=overwrite)
            logger.info(f"Wrote {len(data)} rows to blob {blob_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to write to blob: {e}")
            return False

    def _get_container_client(self, container_name: Optional[str] = None):
        """Get container client."""
        if container_name:
            return self._blob_service_client.get_container_client(container_name)
        elif self._container_client:
            return self._container_client
        else:
            raise ValueError("No container specified")

    def _list_blobs(self, container_client, prefix: Optional[str] = None) -> List:
        """List blobs in container."""
        if prefix:
            return list(container_client.list_blobs(name_starts_with=prefix))
        return list(container_client.list_blobs())

    def _is_data_file(self, blob_name: str, file_format: str) -> bool:
        """Check if blob is a data file of the specified format."""
        extensions = {
            'csv': ['.csv', '.csv.gz'],
            'parquet': ['.parquet', '.pq'],
            'json': ['.json', '.json.gz', '.jsonl'],
        }
        return any(blob_name.lower().endswith(ext) for ext in extensions.get(file_format, []))

    def _read_blob(
        self,
        container_client,
        blob_name: str,
        file_format: str,
        columns: Optional[List[str]] = None,
        **kwargs,
    ) -> pd.DataFrame:
        """Read single blob into DataFrame."""
        blob_client = container_client.get_blob_client(blob_name)
        blob_data = blob_client.download_blob().readall()
        buffer = io.BytesIO(blob_data)

        if file_format == 'parquet':
            if columns:
                df = pd.read_parquet(buffer, columns=columns, **kwargs)
            else:
                df = pd.read_parquet(buffer, **kwargs)
        elif file_format == 'csv':
            if columns:
                df = pd.read_csv(buffer, usecols=columns, **kwargs)
            else:
                df = pd.read_csv(buffer, **kwargs)
        elif file_format == 'json':
            df = pd.read_json(buffer, **kwargs)
            if columns:
                df = df[columns]
        else:
            raise ValueError(f"Unsupported format: {file_format}")

        return df

    def _apply_filters(self, data: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
        """Apply filter conditions to DataFrame."""
        result = data

        for key, value in filters.items():
            if key.endswith('__gt'):
                col = key[:-4]
                result = result[result[col] > value]
            elif key.endswith('__lt'):
                col = key[:-4]
                result = result[result[col] < value]
            elif key.endswith('__gte'):
                col = key[:-5]
                result = result[result[col] >= value]
            elif key.endswith('__lte'):
                col = key[:-5]
                result = result[result[col] <= value]
            elif key.endswith('__ne'):
                col = key[:-4]
                result = result[result[col] != value]
            elif key.endswith('__in'):
                col = key[:-4]
                result = result[result[col].isin(value)]
            else:
                result = result[result[key] == value]

        return result

    def list_blobs(
        self,
        container_name: Optional[str] = None,
        prefix: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """List blobs with metadata."""
        if not self._connected:
            raise ConnectionError("Not connected to Azure Blob Storage")

        container_client = self._get_container_client(container_name)
        blobs = self._list_blobs(container_client, prefix)

        return [
            {
                'name': blob.name,
                'size': blob.size,
                'last_modified': blob.last_modified,
                'content_type': blob.content_settings.content_type if blob.content_settings else None,
            }
            for blob in blobs
        ]

    def delete_blob(
        self,
        blob_name: str,
        container_name: Optional[str] = None,
    ) -> bool:
        """Delete a blob."""
        if not self._connected:
            raise ConnectionError("Not connected to Azure Blob Storage")

        try:
            container_client = self._get_container_client(container_name)
            blob_client = container_client.get_blob_client(blob_name)
            blob_client.delete_blob()
            logger.info(f"Deleted blob: {blob_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete blob: {e}")
            return False
