"""
File Ingestion Connector
Connects to local and network file systems for data ingestion
"""

import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import pandas as pd

from ..base import DataConnector

logger = logging.getLogger(__name__)


class FileIngestionConnector(DataConnector):
    """
    Connector for file-based data ingestion.

    Supports:
    - CSV, Excel, Parquet, JSON, Feather formats
    - Local and network paths
    - Glob patterns for multiple files
    - Schema enforcement
    - Incremental loading by modification time
    """

    SUPPORTED_FORMATS = ['csv', 'xlsx', 'xls', 'parquet', 'json', 'jsonl', 'feather']

    def __init__(
        self,
        base_path: str,
        file_format: str = 'csv',
        recursive: bool = False,
        file_pattern: Optional[str] = None,
        encoding: str = 'utf-8',
    ):
        connection_config = {
            'base_path': base_path,
            'file_format': file_format,
            'recursive': recursive,
            'file_pattern': file_pattern,
            'encoding': encoding,
        }
        super().__init__(connection_config)
        self._base_path = Path(base_path)
        self._file_format = file_format.lower()
        self._recursive = recursive
        self._file_pattern = file_pattern
        self._encoding = encoding

    def connect(self) -> bool:
        """Verify base path exists and is accessible."""
        try:
            if not self._base_path.exists():
                logger.error(f"Base path does not exist: {self._base_path}")
                self._connected = False
                return False

            if not os.access(self._base_path, os.R_OK):
                logger.error(f"Base path is not readable: {self._base_path}")
                self._connected = False
                return False

            self._connected = True
            logger.info(f"Connected to file system at {self._base_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to connect to file system: {e}")
            self._connected = False
            return False

    def disconnect(self) -> None:
        """Disconnect from file system."""
        self._connected = False
        logger.info("Disconnected from file system")

    def read(
        self,
        file_path: Optional[str] = None,
        pattern: Optional[str] = None,
        columns: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
        modified_after: Optional[str] = None,
        **kwargs,
    ) -> pd.DataFrame:
        """
        Read data from file(s).

        Args:
            file_path: Specific file to read (relative to base_path)
            pattern: Glob pattern for multiple files
            columns: Columns to select
            filters: Post-read filters
            limit: Maximum rows to return
            modified_after: Only read files modified after this timestamp
            **kwargs: Additional pandas read arguments

        Returns:
            DataFrame with file contents
        """
        if not self._connected:
            raise ConnectionError("Not connected to file system")

        # Determine files to read
        files = self._get_files(file_path, pattern, modified_after)

        if not files:
            logger.warning("No files found matching criteria")
            return pd.DataFrame()

        # Read all files
        dfs = []
        for f in files:
            try:
                df = self._read_single_file(f, columns, **kwargs)
                df['_source_file'] = str(f.name)
                df['_source_path'] = str(f)
                dfs.append(df)
            except Exception as e:
                logger.warning(f"Failed to read {f}: {e}")

        if not dfs:
            return pd.DataFrame()

        # Combine DataFrames
        data = pd.concat(dfs, ignore_index=True)

        # Apply filters
        if filters:
            data = self._apply_filters(data, filters)

        # Apply limit
        if limit:
            data = data.head(limit)

        logger.info(f"Read {len(data)} rows from {len(files)} file(s)")
        return data

    def write(
        self,
        data: pd.DataFrame,
        file_path: str,
        file_format: Optional[str] = None,
        mode: str = 'w',
        partition_by: Optional[List[str]] = None,
        **kwargs,
    ) -> bool:
        """
        Write data to file(s).

        Args:
            data: DataFrame to write
            file_path: Target file path (relative to base_path)
            file_format: Output format (defaults to connector format)
            mode: Write mode ('w' for overwrite, 'a' for append)
            partition_by: Columns to partition by (creates subdirectories)
            **kwargs: Additional pandas write arguments

        Returns:
            True if successful
        """
        if not self._connected:
            raise ConnectionError("Not connected to file system")

        target_format = file_format or self._file_format
        full_path = self._base_path / file_path

        try:
            # Create parent directory if needed
            full_path.parent.mkdir(parents=True, exist_ok=True)

            if partition_by:
                self._write_partitioned(data, full_path, partition_by, target_format, **kwargs)
            else:
                self._write_single_file(data, full_path, target_format, mode, **kwargs)

            logger.info(f"Wrote {len(data)} rows to {full_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to write to {full_path}: {e}")
            return False

    def _get_files(
        self,
        file_path: Optional[str],
        pattern: Optional[str],
        modified_after: Optional[str],
    ) -> List[Path]:
        """Get list of files to read."""
        files = []

        if file_path:
            # Specific file
            full_path = self._base_path / file_path
            if full_path.exists():
                files = [full_path]
        elif pattern or self._file_pattern:
            # Glob pattern
            glob_pattern = pattern or self._file_pattern
            if self._recursive:
                files = list(self._base_path.rglob(glob_pattern))
            else:
                files = list(self._base_path.glob(glob_pattern))
        else:
            # All files with matching extension
            ext_pattern = f"*.{self._file_format}"
            if self._recursive:
                files = list(self._base_path.rglob(ext_pattern))
            else:
                files = list(self._base_path.glob(ext_pattern))

        # Filter by modification time
        if modified_after:
            import datetime
            cutoff = pd.to_datetime(modified_after).timestamp()
            files = [f for f in files if f.stat().st_mtime > cutoff]

        # Sort by modification time (newest first)
        files.sort(key=lambda f: f.stat().st_mtime, reverse=True)

        return files

    def _read_single_file(
        self,
        file_path: Path,
        columns: Optional[List[str]] = None,
        **kwargs,
    ) -> pd.DataFrame:
        """Read a single file based on format."""
        suffix = file_path.suffix.lower().lstrip('.')

        if suffix in ['csv']:
            df = pd.read_csv(
                file_path,
                usecols=columns,
                encoding=self._encoding,
                **kwargs,
            )
        elif suffix in ['xlsx', 'xls']:
            df = pd.read_excel(
                file_path,
                usecols=columns,
                **kwargs,
            )
        elif suffix == 'parquet':
            df = pd.read_parquet(
                file_path,
                columns=columns,
                **kwargs,
            )
        elif suffix == 'json':
            df = pd.read_json(
                file_path,
                encoding=self._encoding,
                **kwargs,
            )
            if columns:
                df = df[columns]
        elif suffix == 'jsonl':
            df = pd.read_json(
                file_path,
                lines=True,
                encoding=self._encoding,
                **kwargs,
            )
            if columns:
                df = df[columns]
        elif suffix == 'feather':
            df = pd.read_feather(
                file_path,
                columns=columns,
                **kwargs,
            )
        else:
            raise ValueError(f"Unsupported file format: {suffix}")

        return df

    def _write_single_file(
        self,
        data: pd.DataFrame,
        file_path: Path,
        file_format: str,
        mode: str = 'w',
        **kwargs,
    ) -> None:
        """Write to a single file based on format."""
        if file_format == 'csv':
            write_mode = 'a' if mode == 'a' else 'w'
            header = mode != 'a' or not file_path.exists()
            data.to_csv(
                file_path,
                mode=write_mode,
                header=header,
                index=False,
                encoding=self._encoding,
                **kwargs,
            )
        elif file_format in ['xlsx', 'xls']:
            data.to_excel(
                file_path,
                index=False,
                **kwargs,
            )
        elif file_format == 'parquet':
            data.to_parquet(
                file_path,
                index=False,
                **kwargs,
            )
        elif file_format == 'json':
            data.to_json(
                file_path,
                orient='records',
                **kwargs,
            )
        elif file_format == 'jsonl':
            data.to_json(
                file_path,
                orient='records',
                lines=True,
                **kwargs,
            )
        elif file_format == 'feather':
            data.to_feather(
                file_path,
                **kwargs,
            )
        else:
            raise ValueError(f"Unsupported file format: {file_format}")

    def _write_partitioned(
        self,
        data: pd.DataFrame,
        base_path: Path,
        partition_by: List[str],
        file_format: str,
        **kwargs,
    ) -> None:
        """Write data partitioned by columns."""
        for values, group in data.groupby(partition_by):
            if not isinstance(values, tuple):
                values = (values,)

            # Build partition path
            partition_path = base_path
            for col, val in zip(partition_by, values):
                partition_path = partition_path / f"{col}={val}"

            partition_path.mkdir(parents=True, exist_ok=True)

            # Write file
            file_name = f"data.{file_format}"
            self._write_single_file(
                group.drop(columns=partition_by),
                partition_path / file_name,
                file_format,
                **kwargs,
            )

    def _apply_filters(self, data: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
        """Apply filters to DataFrame."""
        for key, value in filters.items():
            if key.endswith('__gt'):
                col = key[:-4]
                data = data[data[col] > value]
            elif key.endswith('__lt'):
                col = key[:-4]
                data = data[data[col] < value]
            elif key.endswith('__gte'):
                col = key[:-5]
                data = data[data[col] >= value]
            elif key.endswith('__lte'):
                col = key[:-5]
                data = data[data[col] <= value]
            elif key.endswith('__ne'):
                col = key[:-4]
                data = data[data[col] != value]
            elif key.endswith('__in'):
                col = key[:-4]
                data = data[data[col].isin(value)]
            elif key.endswith('__contains'):
                col = key[:-10]
                data = data[data[col].str.contains(value, na=False)]
            elif key.endswith('__isnull'):
                col = key[:-8]
                if value:
                    data = data[data[col].isna()]
                else:
                    data = data[data[col].notna()]
            else:
                data = data[data[key] == value]

        return data

    def list_files(
        self,
        pattern: Optional[str] = None,
        include_metadata: bool = False,
    ) -> Union[List[str], pd.DataFrame]:
        """
        List files in the base path.

        Args:
            pattern: Glob pattern to filter files
            include_metadata: Include file metadata (size, modified time)

        Returns:
            List of file names or DataFrame with metadata
        """
        glob_pattern = pattern or f"*.{self._file_format}"

        if self._recursive:
            files = list(self._base_path.rglob(glob_pattern))
        else:
            files = list(self._base_path.glob(glob_pattern))

        if not include_metadata:
            return [str(f.relative_to(self._base_path)) for f in files]

        # Build metadata DataFrame
        metadata = []
        for f in files:
            stat = f.stat()
            metadata.append({
                'file_name': f.name,
                'relative_path': str(f.relative_to(self._base_path)),
                'full_path': str(f),
                'size_bytes': stat.st_size,
                'modified_time': pd.Timestamp.fromtimestamp(stat.st_mtime),
                'created_time': pd.Timestamp.fromtimestamp(stat.st_ctime),
            })

        return pd.DataFrame(metadata)

    def get_schema(self, file_path: str) -> Dict[str, str]:
        """Get schema (column types) from a file."""
        full_path = self._base_path / file_path
        df = self._read_single_file(full_path).head(100)
        return {col: str(dtype) for col, dtype in df.dtypes.items()}

    def validate_schema(
        self,
        file_path: str,
        expected_schema: Dict[str, str],
    ) -> Dict[str, Any]:
        """
        Validate file schema against expected schema.

        Returns:
            Dictionary with validation results
        """
        actual_schema = self.get_schema(file_path)

        missing_columns = set(expected_schema.keys()) - set(actual_schema.keys())
        extra_columns = set(actual_schema.keys()) - set(expected_schema.keys())

        type_mismatches = {}
        for col, expected_type in expected_schema.items():
            if col in actual_schema:
                actual_type = actual_schema[col]
                if not self._types_compatible(expected_type, actual_type):
                    type_mismatches[col] = {
                        'expected': expected_type,
                        'actual': actual_type,
                    }

        is_valid = not missing_columns and not type_mismatches

        return {
            'is_valid': is_valid,
            'missing_columns': list(missing_columns),
            'extra_columns': list(extra_columns),
            'type_mismatches': type_mismatches,
        }

    def _types_compatible(self, expected: str, actual: str) -> bool:
        """Check if types are compatible."""
        # Normalize type names
        expected = expected.lower()
        actual = actual.lower()

        # Direct match
        if expected == actual:
            return True

        # Compatible groups
        int_types = {'int', 'int32', 'int64', 'int8', 'int16'}
        float_types = {'float', 'float32', 'float64'}
        string_types = {'str', 'string', 'object'}
        bool_types = {'bool', 'boolean'}
        datetime_types = {'datetime', 'datetime64', 'datetime64[ns]'}

        type_groups = [int_types, float_types, string_types, bool_types, datetime_types]

        for group in type_groups:
            if expected in group and actual in group:
                return True

        # Numeric compatibility
        if expected in int_types | float_types and actual in int_types | float_types:
            return True

        return False
