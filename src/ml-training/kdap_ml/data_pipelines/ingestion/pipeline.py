"""
Data Ingestion Pipeline
Orchestrates data ingestion from various sources
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

import pandas as pd

from ..base import DataPipeline, DataConnector, PipelineConfig, DataSourceType

logger = logging.getLogger(__name__)


class DataIngestionPipeline(DataPipeline):
    """
    Pipeline for ingesting data from various sources.

    Supports:
    - Dataverse (Power Platform)
    - Azure Blob Storage
    - Azure SQL Database
    - Local/remote files (CSV, Parquet, JSON)
    - REST APIs
    """

    def __init__(
        self,
        config: PipelineConfig,
        connector: DataConnector,
        schema: Optional[Dict[str, str]] = None,
        transformations: Optional[List[callable]] = None,
    ):
        super().__init__(config)
        self.connector = connector
        self.schema = schema
        self.transformations = transformations or []

    def extract(self) -> pd.DataFrame:
        """Extract data from the configured source."""
        logger.info(f"Extracting data from {self.config.source_type.value}")

        with self.connector:
            # Build query based on parameters
            query = self.config.parameters.get('query')
            filters = self.config.parameters.get('filters', {})
            columns = self.config.parameters.get('columns')

            data = self.connector.read(
                query=query,
                filters=filters,
                columns=columns,
            )

        logger.info(f"Extracted {len(data)} rows")
        return data

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply transformations to extracted data."""
        logger.info(f"Applying {len(self.transformations)} transformations")

        result = data.copy()

        for i, transform_fn in enumerate(self.transformations):
            try:
                result = transform_fn(result)
                logger.debug(f"Applied transformation {i + 1}: {transform_fn.__name__}")
            except Exception as e:
                self.add_warning(f"Transformation {i + 1} failed: {e}")

        return result

    def validate(self, data: pd.DataFrame) -> bool:
        """Validate data against schema and constraints."""
        if not self.config.validate_data:
            return True

        is_valid = True

        # Check for empty data
        if len(data) == 0:
            self.add_validation_error("Data is empty")
            return False

        # Schema validation
        if self.schema:
            for col, expected_type in self.schema.items():
                if col not in data.columns:
                    self.add_validation_error(f"Missing required column: {col}")
                    is_valid = False
                else:
                    # Type validation
                    actual_type = str(data[col].dtype)
                    if not self._types_compatible(actual_type, expected_type):
                        self.add_warning(f"Column {col} type mismatch: expected {expected_type}, got {actual_type}")

        # Check for required columns
        required_cols = self.config.parameters.get('required_columns', [])
        for col in required_cols:
            if col not in data.columns:
                self.add_validation_error(f"Missing required column: {col}")
                is_valid = False

        # Check for null constraints
        not_null_cols = self.config.parameters.get('not_null_columns', [])
        for col in not_null_cols:
            if col in data.columns and data[col].isnull().any():
                null_count = data[col].isnull().sum()
                self.add_warning(f"Column {col} has {null_count} null values")

        return is_valid

    def _types_compatible(self, actual: str, expected: str) -> bool:
        """Check if actual and expected types are compatible."""
        type_groups = {
            'numeric': ['int64', 'int32', 'float64', 'float32', 'int', 'float', 'numeric'],
            'string': ['object', 'str', 'string'],
            'datetime': ['datetime64[ns]', 'datetime', 'date'],
            'boolean': ['bool', 'boolean'],
        }

        for group_name, types in type_groups.items():
            if expected.lower() in types and actual.lower() in types:
                return True

        return actual.lower() == expected.lower()

    def add_transformation(self, transform_fn: callable) -> None:
        """Add a transformation function to the pipeline."""
        self.transformations.append(transform_fn)

    def set_schema(self, schema: Dict[str, str]) -> None:
        """Set the validation schema."""
        self.schema = schema


class IncrementalIngestionPipeline(DataIngestionPipeline):
    """
    Pipeline for incremental data ingestion.

    Tracks watermarks for incremental loading.
    """

    def __init__(
        self,
        config: PipelineConfig,
        connector: DataConnector,
        watermark_column: str,
        watermark_value: Optional[Any] = None,
        schema: Optional[Dict[str, str]] = None,
    ):
        super().__init__(config, connector, schema)
        self.watermark_column = watermark_column
        self.watermark_value = watermark_value
        self._new_watermark: Optional[Any] = None

    def extract(self) -> pd.DataFrame:
        """Extract incremental data based on watermark."""
        logger.info(f"Extracting incremental data since watermark: {self.watermark_value}")

        with self.connector:
            # Build incremental query
            filters = self.config.parameters.get('filters', {}).copy()

            if self.watermark_value is not None:
                filters[f'{self.watermark_column}__gt'] = self.watermark_value

            data = self.connector.read(filters=filters)

        # Update watermark
        if len(data) > 0 and self.watermark_column in data.columns:
            self._new_watermark = data[self.watermark_column].max()
        else:
            self._new_watermark = self.watermark_value

        logger.info(f"Extracted {len(data)} incremental rows")
        return data

    def get_new_watermark(self) -> Any:
        """Get the new watermark value after extraction."""
        return self._new_watermark


class BatchIngestionPipeline(DataIngestionPipeline):
    """
    Pipeline for batch data ingestion.

    Processes data in batches to handle large datasets.
    """

    def __init__(
        self,
        config: PipelineConfig,
        connector: DataConnector,
        batch_size: int = 10000,
        schema: Optional[Dict[str, str]] = None,
    ):
        super().__init__(config, connector, schema)
        self.batch_size = batch_size
        self._current_batch = 0
        self._total_batches = 0

    def extract(self) -> pd.DataFrame:
        """Extract data in batches."""
        logger.info(f"Extracting data in batches of {self.batch_size}")

        all_data = []

        with self.connector:
            offset = 0
            while True:
                batch = self.connector.read(
                    limit=self.batch_size,
                    offset=offset,
                )

                if len(batch) == 0:
                    break

                all_data.append(batch)
                self._current_batch += 1
                offset += self.batch_size

                logger.info(f"Extracted batch {self._current_batch}: {len(batch)} rows")

        self._total_batches = self._current_batch

        if all_data:
            result = pd.concat(all_data, ignore_index=True)
        else:
            result = pd.DataFrame()

        logger.info(f"Extracted {len(result)} total rows in {self._total_batches} batches")
        return result

    def extract_generator(self):
        """Yield data batches as a generator."""
        logger.info(f"Starting batch extraction with batch size {self.batch_size}")

        with self.connector:
            offset = 0
            batch_num = 0

            while True:
                batch = self.connector.read(
                    limit=self.batch_size,
                    offset=offset,
                )

                if len(batch) == 0:
                    break

                batch_num += 1
                offset += self.batch_size

                logger.info(f"Yielding batch {batch_num}: {len(batch)} rows")
                yield batch

        logger.info(f"Completed batch extraction: {batch_num} batches")
