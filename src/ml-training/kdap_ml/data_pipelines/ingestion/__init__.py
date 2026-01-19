"""
Data Ingestion Module
Connectors for various data sources
"""

from .pipeline import (
    DataIngestionPipeline,
    IncrementalIngestionPipeline,
    BatchIngestionPipeline,
)
from .dataverse import DataverseConnector
from .azure_blob import AzureBlobConnector
from .azure_sql import AzureSQLConnector
from .file_ingestion import FileIngestionConnector
from .api_connector import APIConnector

__all__ = [
    'DataIngestionPipeline',
    'IncrementalIngestionPipeline',
    'BatchIngestionPipeline',
    'DataverseConnector',
    'AzureBlobConnector',
    'AzureSQLConnector',
    'FileIngestionConnector',
    'APIConnector',
]
