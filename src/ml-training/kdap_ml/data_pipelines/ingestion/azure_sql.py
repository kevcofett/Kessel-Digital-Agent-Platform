"""
Azure SQL Database Connector
Connects to Azure SQL Database for data ingestion
"""

import logging
from typing import Any, Dict, List, Optional

import pandas as pd

from ..base import DataConnector

logger = logging.getLogger(__name__)


class AzureSQLConnector(DataConnector):
    """
    Connector for Azure SQL Database.

    Supports:
    - SQL Server authentication
    - Azure AD authentication
    - Managed identity
    - Parameterized queries
    - Batch operations
    """

    def __init__(
        self,
        server: str,
        database: str,
        username: Optional[str] = None,
        password: Optional[str] = None,
        driver: str = 'ODBC Driver 18 for SQL Server',
        use_managed_identity: bool = False,
        connection_timeout: int = 30,
    ):
        connection_config = {
            'server': server,
            'database': database,
            'username': username,
            'password': password,
            'driver': driver,
            'use_managed_identity': use_managed_identity,
            'connection_timeout': connection_timeout,
        }
        super().__init__(connection_config)
        self._connection = None
        self._engine = None

    def connect(self) -> bool:
        """Connect to Azure SQL Database."""
        try:
            connection_string = self._build_connection_string()

            # Try pyodbc first
            try:
                import pyodbc
                self._connection = pyodbc.connect(connection_string)
                logger.info("Connected to Azure SQL using pyodbc")
            except ImportError:
                # Fall back to SQLAlchemy
                try:
                    from sqlalchemy import create_engine
                    self._engine = create_engine(f"mssql+pyodbc:///?odbc_connect={connection_string}")
                    self._connection = self._engine.connect()
                    logger.info("Connected to Azure SQL using SQLAlchemy")
                except ImportError:
                    raise ImportError("Either pyodbc or sqlalchemy package required for Azure SQL connector")

            self._connected = True
            return True

        except Exception as e:
            logger.error(f"Failed to connect to Azure SQL: {e}")
            self._connected = False
            return False

    def disconnect(self) -> None:
        """Disconnect from Azure SQL Database."""
        if self._connection:
            self._connection.close()
        if self._engine:
            self._engine.dispose()

        self._connection = None
        self._engine = None
        self._connected = False
        logger.info("Disconnected from Azure SQL")

    def read(
        self,
        query: Optional[str] = None,
        table_name: Optional[str] = None,
        columns: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        order_by: Optional[str] = None,
        params: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> pd.DataFrame:
        """
        Read data from Azure SQL Database.

        Args:
            query: SQL query (overrides other params)
            table_name: Table to query
            columns: Columns to select
            filters: WHERE conditions
            limit: LIMIT clause
            offset: OFFSET clause
            order_by: ORDER BY clause
            params: Query parameters

        Returns:
            DataFrame with query results
        """
        if not self._connected:
            raise ConnectionError("Not connected to Azure SQL")

        if query:
            sql = query
        else:
            sql = self._build_select_query(
                table_name=table_name,
                columns=columns,
                filters=filters,
                limit=limit,
                offset=offset,
                order_by=order_by,
            )

        logger.debug(f"Executing query: {sql}")

        if self._engine:
            data = pd.read_sql(sql, self._connection, params=params)
        else:
            data = pd.read_sql(sql, self._connection, params=params)

        logger.info(f"Retrieved {len(data)} rows from Azure SQL")
        return data

    def write(
        self,
        data: pd.DataFrame,
        table_name: str,
        schema: Optional[str] = None,
        if_exists: str = 'append',
        index: bool = False,
        batch_size: int = 1000,
        **kwargs,
    ) -> bool:
        """
        Write data to Azure SQL Database.

        Args:
            data: DataFrame to write
            table_name: Target table
            schema: Database schema
            if_exists: 'append', 'replace', 'fail'
            index: Write index
            batch_size: Records per batch

        Returns:
            True if successful
        """
        if not self._connected:
            raise ConnectionError("Not connected to Azure SQL")

        try:
            if self._engine:
                data.to_sql(
                    table_name,
                    self._engine,
                    schema=schema,
                    if_exists=if_exists,
                    index=index,
                    chunksize=batch_size,
                    **kwargs,
                )
            else:
                # Manual batch insert for pyodbc
                self._batch_insert(data, table_name, schema, batch_size)

            logger.info(f"Wrote {len(data)} rows to table {table_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to write to Azure SQL: {e}")
            return False

    def execute(
        self,
        sql: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> int:
        """
        Execute a SQL statement (INSERT, UPDATE, DELETE).

        Returns:
            Number of affected rows
        """
        if not self._connected:
            raise ConnectionError("Not connected to Azure SQL")

        cursor = self._connection.cursor()
        try:
            if params:
                cursor.execute(sql, params)
            else:
                cursor.execute(sql)

            affected = cursor.rowcount
            self._connection.commit()
            logger.info(f"Executed statement, {affected} rows affected")
            return affected

        except Exception as e:
            self._connection.rollback()
            logger.error(f"Failed to execute statement: {e}")
            raise
        finally:
            cursor.close()

    def _build_connection_string(self) -> str:
        """Build ODBC connection string."""
        config = self.connection_config
        parts = [
            f"DRIVER={{{config['driver']}}}",
            f"SERVER={config['server']}",
            f"DATABASE={config['database']}",
            f"Connection Timeout={config['connection_timeout']}",
        ]

        if config.get('use_managed_identity'):
            parts.append("Authentication=ActiveDirectoryMsi")
        elif config.get('username') and config.get('password'):
            parts.append(f"UID={config['username']}")
            parts.append(f"PWD={config['password']}")
        else:
            raise ValueError("No valid authentication method provided")

        # Security settings
        parts.append("Encrypt=yes")
        parts.append("TrustServerCertificate=no")

        return ';'.join(parts)

    def _build_select_query(
        self,
        table_name: str,
        columns: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        order_by: Optional[str] = None,
    ) -> str:
        """Build SELECT query."""
        # Column list
        if columns:
            col_list = ', '.join(f'[{col}]' for col in columns)
        else:
            col_list = '*'

        # Base query
        sql = f"SELECT {col_list} FROM [{table_name}]"

        # WHERE clause
        if filters:
            where_parts = []
            for key, value in filters.items():
                if key.endswith('__gt'):
                    col = key[:-4]
                    where_parts.append(f"[{col}] > {self._format_value(value)}")
                elif key.endswith('__lt'):
                    col = key[:-4]
                    where_parts.append(f"[{col}] < {self._format_value(value)}")
                elif key.endswith('__gte'):
                    col = key[:-5]
                    where_parts.append(f"[{col}] >= {self._format_value(value)}")
                elif key.endswith('__lte'):
                    col = key[:-5]
                    where_parts.append(f"[{col}] <= {self._format_value(value)}")
                elif key.endswith('__ne'):
                    col = key[:-4]
                    where_parts.append(f"[{col}] <> {self._format_value(value)}")
                elif key.endswith('__in'):
                    col = key[:-4]
                    values = ', '.join(self._format_value(v) for v in value)
                    where_parts.append(f"[{col}] IN ({values})")
                elif key.endswith('__like'):
                    col = key[:-6]
                    where_parts.append(f"[{col}] LIKE {self._format_value(value)}")
                elif key.endswith('__isnull'):
                    col = key[:-8]
                    if value:
                        where_parts.append(f"[{col}] IS NULL")
                    else:
                        where_parts.append(f"[{col}] IS NOT NULL")
                else:
                    where_parts.append(f"[{key}] = {self._format_value(value)}")

            if where_parts:
                sql += " WHERE " + " AND ".join(where_parts)

        # ORDER BY clause (required for OFFSET)
        if order_by:
            sql += f" ORDER BY [{order_by}]"
        elif offset is not None:
            sql += " ORDER BY (SELECT NULL)"  # Required for OFFSET

        # OFFSET and FETCH for pagination
        if offset is not None:
            sql += f" OFFSET {offset} ROWS"
            if limit:
                sql += f" FETCH NEXT {limit} ROWS ONLY"
        elif limit:
            # Use TOP for simple limit without offset
            sql = sql.replace("SELECT", f"SELECT TOP {limit}", 1)

        return sql

    def _format_value(self, value: Any) -> str:
        """Format value for SQL query."""
        if isinstance(value, str):
            return f"'{value.replace(chr(39), chr(39)+chr(39))}'"
        elif isinstance(value, bool):
            return '1' if value else '0'
        elif value is None:
            return 'NULL'
        else:
            return str(value)

    def _batch_insert(
        self,
        data: pd.DataFrame,
        table_name: str,
        schema: Optional[str] = None,
        batch_size: int = 1000,
    ) -> None:
        """Batch insert using pyodbc."""
        columns = list(data.columns)
        col_list = ', '.join(f'[{col}]' for col in columns)
        placeholders = ', '.join(['?' for _ in columns])

        full_table = f"[{schema}].[{table_name}]" if schema else f"[{table_name}]"
        sql = f"INSERT INTO {full_table} ({col_list}) VALUES ({placeholders})"

        cursor = self._connection.cursor()
        try:
            records = data.values.tolist()
            for i in range(0, len(records), batch_size):
                batch = records[i:i + batch_size]
                cursor.executemany(sql, batch)

            self._connection.commit()

        except Exception:
            self._connection.rollback()
            raise
        finally:
            cursor.close()

    def get_table_schema(self, table_name: str) -> pd.DataFrame:
        """Get schema information for a table."""
        sql = f"""
        SELECT
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            CHARACTER_MAXIMUM_LENGTH,
            NUMERIC_PRECISION,
            NUMERIC_SCALE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '{table_name}'
        ORDER BY ORDINAL_POSITION
        """
        return self.read(query=sql)

    def list_tables(self, schema: Optional[str] = None) -> List[str]:
        """List all tables in the database."""
        sql = """
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        """
        if schema:
            sql += f" AND TABLE_SCHEMA = '{schema}'"

        df = self.read(query=sql)
        return df['TABLE_NAME'].tolist()
