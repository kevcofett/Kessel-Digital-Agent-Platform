"""
Dataverse Client Module for MPA Deployment Scripts.

Provides upsert operations for Dataverse tables with lookup cache support.
"""

import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

import requests


@dataclass
class UpsertResult:
    """Result of an upsert operation."""
    success: bool
    operation: str  # "create" or "update"
    record_id: Optional[str] = None
    error: Optional[str] = None
    response_data: Optional[Dict] = None


@dataclass
class BatchResult:
    """Result of a batch import operation."""
    total: int
    created: int = 0
    updated: int = 0
    failed: int = 0
    errors: List[Dict] = field(default_factory=list)


class DataverseClient:
    """
    Dataverse client optimized for deployment operations.

    Features:
    - Upsert (create or update) based on primary key
    - Lookup field resolution with caching
    - Rate limiting to avoid throttling
    - Progress tracking
    """

    def __init__(self, api_url: str, get_token: Callable[[], str]):
        """
        Initialize the Dataverse client.

        Args:
            api_url: Dataverse API URL (e.g., https://org.api.crm.dynamics.com/api/data/v9.2)
            get_token: Callable that returns a valid access token
        """
        self.api_url = api_url.rstrip("/")
        self.get_token = get_token

        # Lookup caches: entity_set -> {code_value -> guid}
        self._lookup_cache: Dict[str, Dict[str, str]] = {}

    def _headers(self) -> Dict[str, str]:
        """Get request headers with current token."""
        return {
            "Authorization": f"Bearer {self.get_token()}",
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Prefer": "return=representation"
        }

    def _url(self, entity_set: str, record_id: Optional[str] = None) -> str:
        """Build API URL for entity set."""
        if record_id:
            return f"{self.api_url}/{entity_set}({record_id})"
        return f"{self.api_url}/{entity_set}"

    def find_by_code(
        self,
        entity_set: str,
        code_field: str,
        code_value: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find existing record by code field.

        Args:
            entity_set: Dataverse entity set name (e.g., mpa_verticals)
            code_field: Field name to search (e.g., mpa_verticalcode)
            code_value: Value to search for

        Returns:
            Record dict if found, None otherwise
        """
        url = f"{self._url(entity_set)}?$filter={code_field} eq '{code_value}'"

        response = requests.get(url, headers=self._headers())

        if response.status_code == 200:
            data = response.json()
            records = data.get("value", [])
            if records:
                return records[0]
        elif response.status_code != 404:
            # Log unexpected errors but don't raise
            print(f"Warning: Query failed ({response.status_code}): {response.text[:200]}")

        return None

    def get_record_id(
        self,
        entity_set: str,
        code_field: str,
        code_value: str,
        id_field: Optional[str] = None
    ) -> Optional[str]:
        """
        Get record GUID by code, using cache.

        Args:
            entity_set: Dataverse entity set name
            code_field: Field name to search
            code_value: Value to search for
            id_field: ID field name (defaults to entity singular + "id")

        Returns:
            Record GUID if found, None otherwise
        """
        # Check cache first
        cache_key = f"{entity_set}:{code_field}"
        if cache_key not in self._lookup_cache:
            self._lookup_cache[cache_key] = {}

        if code_value in self._lookup_cache[cache_key]:
            return self._lookup_cache[cache_key][code_value]

        # Query Dataverse
        record = self.find_by_code(entity_set, code_field, code_value)
        if record:
            # Determine ID field name
            if id_field is None:
                # Convention: mpa_verticals -> mpa_verticalid
                id_field = entity_set.rstrip("s") + "id"

            record_id = record.get(id_field)
            if record_id:
                self._lookup_cache[cache_key][code_value] = record_id
                return record_id

        return None

    def build_lookup_cache(
        self,
        entity_set: str,
        code_field: str,
        id_field: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Build lookup cache for an entity by fetching all records.

        Args:
            entity_set: Dataverse entity set name
            code_field: Field name containing the code
            id_field: ID field name (defaults to entity singular + "id")

        Returns:
            Dict mapping code values to GUIDs
        """
        if id_field is None:
            id_field = entity_set.rstrip("s") + "id"

        cache_key = f"{entity_set}:{code_field}"
        self._lookup_cache[cache_key] = {}

        url = f"{self._url(entity_set)}?$select={code_field},{id_field}"

        response = requests.get(url, headers=self._headers())

        if response.status_code == 200:
            data = response.json()
            for record in data.get("value", []):
                code = record.get(code_field)
                guid = record.get(id_field)
                if code and guid:
                    self._lookup_cache[cache_key][code] = guid

        return self._lookup_cache.get(cache_key, {})

    def create(self, entity_set: str, data: Dict[str, Any]) -> UpsertResult:
        """
        Create a new record.

        Args:
            entity_set: Dataverse entity set name
            data: Record data to create

        Returns:
            UpsertResult with operation details
        """
        response = requests.post(
            self._url(entity_set),
            headers=self._headers(),
            json=data
        )

        if response.status_code in (200, 201, 204):
            # Extract record ID from response or OData-EntityId header
            record_id = None
            if response.status_code in (200, 201):
                try:
                    resp_data = response.json()
                    # Find the ID field
                    id_field = entity_set.rstrip("s") + "id"
                    record_id = resp_data.get(id_field)
                except Exception:
                    pass

            if not record_id:
                # Try to get from header
                entity_id = response.headers.get("OData-EntityId", "")
                if "(" in entity_id and ")" in entity_id:
                    record_id = entity_id.split("(")[1].split(")")[0]

            return UpsertResult(
                success=True,
                operation="create",
                record_id=record_id
            )
        else:
            return UpsertResult(
                success=False,
                operation="create",
                error=f"HTTP {response.status_code}: {response.text[:500]}"
            )

    def update(self, entity_set: str, record_id: str, data: Dict[str, Any]) -> UpsertResult:
        """
        Update an existing record.

        Args:
            entity_set: Dataverse entity set name
            record_id: Record GUID
            data: Record data to update

        Returns:
            UpsertResult with operation details
        """
        response = requests.patch(
            self._url(entity_set, record_id),
            headers=self._headers(),
            json=data
        )

        if response.status_code in (200, 204):
            return UpsertResult(
                success=True,
                operation="update",
                record_id=record_id
            )
        else:
            return UpsertResult(
                success=False,
                operation="update",
                error=f"HTTP {response.status_code}: {response.text[:500]}"
            )

    def upsert(
        self,
        entity_set: str,
        primary_key_field: str,
        primary_key_value: str,
        data: Dict[str, Any]
    ) -> UpsertResult:
        """
        Create or update record based on primary key.

        Args:
            entity_set: Dataverse entity set name
            primary_key_field: Field name to match on
            primary_key_value: Value to match
            data: Record data (should include the primary key field)

        Returns:
            UpsertResult with operation details
        """
        # Check if record exists
        existing = self.find_by_code(entity_set, primary_key_field, primary_key_value)

        if existing:
            # Update existing record
            id_field = entity_set.rstrip("s") + "id"
            record_id = existing.get(id_field)
            if record_id:
                return self.update(entity_set, record_id, data)
            else:
                return UpsertResult(
                    success=False,
                    operation="update",
                    error=f"Could not find ID field {id_field} in existing record"
                )
        else:
            # Create new record
            return self.create(entity_set, data)

    def batch_upsert(
        self,
        entity_set: str,
        primary_key_field: str,
        records: List[Dict[str, Any]],
        get_key_value: Callable[[Dict], str],
        delay: float = 0.1,
        batch_delay: float = 1.0,
        batch_size: int = 50,
        progress_callback: Optional[Callable[[int, int, str], None]] = None,
        dry_run: bool = False
    ) -> BatchResult:
        """
        Batch upsert with rate limiting and progress tracking.

        Args:
            entity_set: Dataverse entity set name
            primary_key_field: Field name to match on
            records: List of record data dicts
            get_key_value: Function to extract primary key value from record
            delay: Delay between individual records (seconds)
            batch_delay: Longer delay every batch_size records (seconds)
            batch_size: Number of records before longer delay
            progress_callback: Optional callback(processed, total, status)
            dry_run: If True, validate but don't write

        Returns:
            BatchResult with counts and errors
        """
        result = BatchResult(total=len(records))

        for i, record in enumerate(records):
            key_value = get_key_value(record)

            if dry_run:
                # Validate only
                if progress_callback:
                    progress_callback(i + 1, len(records), "validate")
                result.created += 1  # Count as would-create for dry run
                continue

            # Perform upsert
            upsert_result = self.upsert(
                entity_set,
                primary_key_field,
                key_value,
                record
            )

            if upsert_result.success:
                if upsert_result.operation == "create":
                    result.created += 1
                else:
                    result.updated += 1
            else:
                result.failed += 1
                result.errors.append({
                    "record": record,
                    "key": key_value,
                    "error": upsert_result.error
                })

            # Progress callback
            if progress_callback:
                status = upsert_result.operation if upsert_result.success else "error"
                progress_callback(i + 1, len(records), status)

            # Rate limiting
            if (i + 1) % batch_size == 0:
                time.sleep(batch_delay)
            else:
                time.sleep(delay)

        return result


def parse_boolean(value: Any) -> Optional[bool]:
    """
    Parse boolean from various formats.

    Supports: Yes/No, True/False, 1/0, true/false, y/n
    """
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return value
    str_val = str(value).lower().strip()
    return str_val in ["yes", "true", "1", "y"]


def parse_float(value: Any) -> Optional[float]:
    """Parse float, returning None for empty values."""
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def transform_record(
    row: Dict[str, str],
    column_mappings: Dict[str, str],
    transforms: Dict[str, str]
) -> Dict[str, Any]:
    """
    Transform a CSV row to Dataverse record format.

    Args:
        row: CSV row dict
        column_mappings: CSV column -> Dataverse field mappings
        transforms: Field -> transform type mappings

    Returns:
        Transformed record dict
    """
    result = {}

    for csv_col, dv_field in column_mappings.items():
        if csv_col not in row:
            continue

        value = row[csv_col]

        # Skip lookup placeholders (handled separately)
        if dv_field.startswith("_lookup_"):
            continue

        # Apply transforms
        transform = transforms.get(csv_col)
        if transform == "boolean":
            value = parse_boolean(value)
        elif transform == "float":
            value = parse_float(value)
        elif transform == "float_nullable":
            value = parse_float(value)
            if value is None:
                continue  # Skip null floats

        if value is not None:
            result[dv_field] = value

    return result


if __name__ == "__main__":
    print("Dataverse Client Module")
    print("-" * 40)
    print("This module provides DataverseClient class for API operations.")
    print("Use with MSALAuthenticator for authentication.")
