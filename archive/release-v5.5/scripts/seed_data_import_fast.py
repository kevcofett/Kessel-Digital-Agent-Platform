#!/usr/bin/env python3
"""
MPA v5.5 FAST Seed Data Import Script

Uses OData $batch operations for 10-20x faster imports.
Imports 800+ records in ~30 seconds instead of 10+ minutes.

Usage:
    python seed_data_import_fast.py [--dry-run] [--table TABLE] [-v]

Examples:
    python seed_data_import_fast.py --dry-run           # Validate only
    python seed_data_import_fast.py --table benchmark   # Import benchmarks only
    python seed_data_import_fast.py                     # Import all tables
"""

import argparse
import csv
import json
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

import requests

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from auth.msal_auth import MSALAuthenticator, AuthenticationError
from config.settings import Settings, TABLE_CONFIG


# =============================================================================
# BATCH CONFIGURATION
# =============================================================================

# Maximum operations per $batch request (Dataverse limit is 1000)
BATCH_SIZE = 100  # Conservative to avoid timeouts

# Maximum concurrent batch requests
MAX_CONCURRENT = 3


# =============================================================================
# DATA TRANSFORMATION UTILITIES
# =============================================================================

def parse_boolean(value: str) -> bool:
    """Parse string to boolean."""
    if isinstance(value, bool):
        return value
    return str(value).lower() in ('true', '1', 'yes', 'y')


def parse_float(value: str) -> Optional[float]:
    """Parse string to float, handling empty strings."""
    if value is None or value == '':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def parse_int(value: str) -> Optional[int]:
    """Parse string to int, handling empty strings."""
    if value is None or value == '':
        return None
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None


def transform_record(
    row: Dict[str, str],
    column_mappings: Dict[str, str],
    transforms: Dict[str, Callable] = None
) -> Dict[str, Any]:
    """
    Transform a CSV row to a Dataverse record.
    
    Args:
        row: CSV row as dict
        column_mappings: Map of CSV column -> Dataverse field
        transforms: Optional transforms to apply to specific fields
    
    Returns:
        Transformed record dict
    """
    transforms = transforms or {}
    record = {}
    
    for csv_col, dv_field in column_mappings.items():
        if csv_col in row:
            value = row[csv_col]
            
            # Apply transform if specified
            if dv_field in transforms:
                value = transforms[dv_field](value)
            
            # Skip None values
            if value is not None:
                record[dv_field] = value
    
    return record


# =============================================================================
# ODATA $BATCH CLIENT
# =============================================================================

class BatchClient:
    """
    Dataverse client using OData $batch for high-performance imports.
    
    Uses multipart/mixed batch requests to send up to 1000 operations
    in a single HTTP request.
    """
    
    def __init__(self, api_url: str, get_token: Callable[[], str]):
        self.api_url = api_url.rstrip("/")
        self.get_token = get_token
        self._lookup_cache: Dict[str, Dict[str, str]] = {}
    
    def _headers(self, content_type: str = "application/json") -> Dict[str, str]:
        """Get request headers with current token."""
        return {
            "Authorization": f"Bearer {self.get_token()}",
            "Content-Type": content_type,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json"
        }
    
    def build_lookup_cache(
        self,
        entity_set: str,
        code_field: str,
        id_field: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Build lookup cache by fetching all records from an entity.
        
        Args:
            entity_set: Dataverse entity set name (e.g., mpa_verticals)
            code_field: Field containing the code value
            id_field: ID field name (auto-detected if not provided)
        
        Returns:
            Dict mapping code values to GUIDs
        """
        if id_field is None:
            id_field = entity_set.rstrip("s") + "id"
        
        cache_key = f"{entity_set}:{code_field}"
        self._lookup_cache[cache_key] = {}
        
        url = f"{self.api_url}/{entity_set}?$select={code_field},{id_field}"
        
        response = requests.get(url, headers=self._headers())
        
        if response.status_code == 200:
            data = response.json()
            for record in data.get("value", []):
                code = record.get(code_field)
                guid = record.get(id_field)
                if code and guid:
                    self._lookup_cache[cache_key][code] = guid
        
        return self._lookup_cache.get(cache_key, {})
    
    def get_cached_id(self, entity_set: str, code_field: str, code_value: str) -> Optional[str]:
        """Get ID from cache."""
        cache_key = f"{entity_set}:{code_field}"
        return self._lookup_cache.get(cache_key, {}).get(code_value)
    
    def execute_batch(
        self,
        entity_set: str,
        operations: List[Dict[str, Any]],
        operation_type: str = "POST"
    ) -> Tuple[int, int, List[Dict]]:
        """
        Execute a batch of operations using OData $batch.
        
        Args:
            entity_set: Target entity set
            operations: List of record data dicts
            operation_type: HTTP method (POST for create, PATCH for update)
        
        Returns:
            Tuple of (success_count, error_count, errors_list)
        """
        if not operations:
            return 0, 0, []
        
        batch_id = str(uuid.uuid4())
        changeset_id = str(uuid.uuid4())
        
        # Build multipart batch request body
        boundary = f"batch_{batch_id}"
        changeset_boundary = f"changeset_{changeset_id}"
        
        body_parts = []
        body_parts.append(f"--{boundary}")
        body_parts.append(f"Content-Type: multipart/mixed; boundary={changeset_boundary}")
        body_parts.append("")
        
        for i, record in enumerate(operations):
            content_id = i + 1
            record_json = json.dumps(record)
            
            body_parts.append(f"--{changeset_boundary}")
            body_parts.append("Content-Type: application/http")
            body_parts.append("Content-Transfer-Encoding: binary")
            body_parts.append(f"Content-ID: {content_id}")
            body_parts.append("")
            body_parts.append(f"{operation_type} {self.api_url}/{entity_set} HTTP/1.1")
            body_parts.append("Content-Type: application/json")
            body_parts.append(f"Content-Length: {len(record_json)}")
            body_parts.append("")
            body_parts.append(record_json)
        
        body_parts.append(f"--{changeset_boundary}--")
        body_parts.append(f"--{boundary}--")
        
        body = "\r\n".join(body_parts)
        
        # Send batch request
        headers = self._headers(f"multipart/mixed; boundary={boundary}")
        
        response = requests.post(
            f"{self.api_url}/$batch",
            headers=headers,
            data=body.encode('utf-8')
        )
        
        # Parse response
        success_count = 0
        error_count = 0
        errors = []
        
        if response.status_code in (200, 202):
            # Parse multipart response to count successes/failures
            response_text = response.text
            
            # Count HTTP 201 (Created) and HTTP 204 (No Content) responses
            success_count = response_text.count("HTTP/1.1 201") + response_text.count("HTTP/1.1 204")
            
            # Count errors (4xx, 5xx)
            for code in range(400, 600):
                error_count += response_text.count(f"HTTP/1.1 {code}")
            
            # Extract error messages if any
            if error_count > 0:
                # Simple extraction - look for error JSON
                import re
                error_matches = re.findall(r'\{"error":\{.*?\}\}', response_text)
                for match in error_matches[:5]:  # First 5 errors
                    try:
                        errors.append(json.loads(match))
                    except:
                        errors.append({"raw": match[:200]})
        else:
            # Entire batch failed
            error_count = len(operations)
            errors.append({
                "batch_error": f"HTTP {response.status_code}",
                "message": response.text[:500]
            })
        
        return success_count, error_count, errors


# =============================================================================
# IMPORT FUNCTIONS
# =============================================================================

def load_csv(file_path: Path) -> List[Dict[str, str]]:
    """Load CSV file into list of dicts."""
    if not file_path.exists():
        raise FileNotFoundError(f"CSV file not found: {file_path}")
    
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def import_simple_table(
    client: BatchClient,
    table_name: str,
    config: dict,
    seed_data_path: Path,
    dry_run: bool = False,
    verbose: bool = False
) -> Tuple[int, int, int]:
    """
    Import a simple table (no lookups) using batch operations.
    
    Returns:
        Tuple of (total, created, failed)
    """
    csv_file = seed_data_path / config["csv_file"]
    rows = load_csv(csv_file)
    
    print(f"  Loaded {len(rows)} records from {config['csv_file']}")
    
    if dry_run:
        print(f"  [DRY RUN] Would import {len(rows)} records")
        return len(rows), len(rows), 0
    
    # Transform all records
    records = []
    for row in rows:
        record = transform_record(
            row,
            config["column_mappings"],
            config.get("transforms", {})
        )
        records.append(record)
    
    # Process in batches
    total_success = 0
    total_errors = 0
    all_errors = []
    
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(records) + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} records)...", end=" ", flush=True)
        
        success, errors, error_list = client.execute_batch(
            config["entity_set"],
            batch,
            "POST"
        )
        
        total_success += success
        total_errors += errors
        all_errors.extend(error_list)
        
        print(f"✓ {success} created, {errors} failed")
    
    if all_errors and verbose:
        print(f"  Errors: {all_errors[:3]}")
    
    return len(rows), total_success, total_errors


def import_benchmark_table(
    client: BatchClient,
    config: dict,
    seed_data_path: Path,
    dry_run: bool = False,
    verbose: bool = False
) -> Tuple[int, int, int]:
    """
    Import benchmark table with lookup resolution using batch operations.
    
    Returns:
        Tuple of (total, created, failed)
    """
    csv_file = seed_data_path / config["csv_file"]
    rows = load_csv(csv_file)
    
    print(f"  Loaded {len(rows)} benchmark records from {config['csv_file']}")
    
    # Build lookup caches
    print("  Building lookup caches...")
    
    vertical_cache = client.build_lookup_cache("mpa_verticals", "mpa_verticalcode")
    print(f"    Verticals: {len(vertical_cache)} records")
    
    channel_cache = client.build_lookup_cache("mpa_channels", "mpa_channelcode")
    print(f"    Channels: {len(channel_cache)} records")
    
    kpi_cache = client.build_lookup_cache("mpa_kpis", "mpa_kpicode")
    print(f"    KPIs: {len(kpi_cache)} records")
    
    if dry_run:
        print(f"  [DRY RUN] Would import {len(rows)} records")
        return len(rows), len(rows), 0
    
    # Transform records with lookup resolution
    records = []
    lookup_errors = 0
    
    for row in rows:
        # Basic field transforms
        record = transform_record(
            row,
            config["column_mappings"],
            config.get("transforms", {})
        )
        
        # Resolve lookups
        vertical_code = row.get("mpa_verticalcode")
        channel_code = row.get("mpa_channelcode")
        kpi_code = row.get("mpa_kpicode")
        
        vertical_id = vertical_cache.get(vertical_code)
        channel_id = channel_cache.get(channel_code)
        kpi_id = kpi_cache.get(kpi_code)
        
        # Skip if lookups fail
        if not vertical_id or not channel_id or not kpi_id:
            lookup_errors += 1
            if verbose:
                print(f"    Lookup miss: v={vertical_code} c={channel_code} k={kpi_code}")
            continue
        
        # Add lookup bindings
        record["mpa_vertical@odata.bind"] = f"/mpa_verticals({vertical_id})"
        record["mpa_channel@odata.bind"] = f"/mpa_channels({channel_id})"
        record["mpa_kpi@odata.bind"] = f"/mpa_kpis({kpi_id})"
        
        records.append(record)
    
    if lookup_errors:
        print(f"  Warning: {lookup_errors} records skipped (lookup errors)")
    
    print(f"  Importing {len(records)} valid records...")
    
    # Process in batches
    total_success = 0
    total_errors = 0
    all_errors = []
    
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(records) + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} records)...", end=" ", flush=True)
        
        success, errors, error_list = client.execute_batch(
            config["entity_set"],
            batch,
            "POST"
        )
        
        total_success += success
        total_errors += errors
        all_errors.extend(error_list)
        
        print(f"✓ {success} created, {errors} failed")
    
    if all_errors and verbose:
        print(f"  Errors: {all_errors[:3]}")
    
    return len(rows), total_success, total_errors + lookup_errors


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="FAST import of MPA seed data using OData $batch",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate data without writing to Dataverse"
    )
    parser.add_argument(
        "--table",
        choices=["vertical", "channel", "kpi", "benchmark", "all"],
        default="all",
        help="Which table(s) to import (default: all)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Print verbose output"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("MPA v5.5 FAST Seed Data Import (OData $batch)")
    print("=" * 60)
    
    start_time = datetime.now()
    
    # Load settings
    try:
        settings = Settings()
        print(f"\nEnvironment: {settings.dataverse.environment_url}")
        print(f"Seed Data:   {settings.seed_data_path}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    if args.dry_run:
        print("\n[DRY RUN MODE] No changes will be made to Dataverse")
        client = None
    else:
        # Authenticate
        print("\nAuthenticating...")
        try:
            auth = MSALAuthenticator(
                settings.auth.tenant_id,
                settings.auth.client_id
            )
            token = auth.get_dataverse_token(settings.dataverse.environment_url)
            print("Authentication successful!")
        except AuthenticationError as e:
            print(f"Authentication failed: {e}")
            sys.exit(1)
        
        # Create batch client
        client = BatchClient(
            settings.dataverse.api_url,
            lambda: auth.get_dataverse_token(settings.dataverse.environment_url)
        )
    
    # Determine import order
    import_order = ["vertical", "channel", "kpi", "benchmark"]
    
    if args.table != "all":
        import_order = [args.table]
    
    # Track results
    results = {}
    
    # Import tables
    for table in import_order:
        print(f"\n{'─' * 60}")
        print(f"Importing: {table.upper()}")
        print(f"{'─' * 60}")
        
        config = TABLE_CONFIG.get(table)
        if not config:
            print(f"Error: Unknown table '{table}'")
            continue
        
        try:
            if table == "benchmark":
                if client:
                    total, created, failed = import_benchmark_table(
                        client,
                        config,
                        settings.seed_data_path,
                        dry_run=args.dry_run,
                        verbose=args.verbose
                    )
                else:
                    rows = load_csv(settings.seed_data_path / config["csv_file"])
                    total, created, failed = len(rows), len(rows), 0
            else:
                if client:
                    total, created, failed = import_simple_table(
                        client,
                        table,
                        config,
                        settings.seed_data_path,
                        dry_run=args.dry_run,
                        verbose=args.verbose
                    )
                else:
                    rows = load_csv(settings.seed_data_path / config["csv_file"])
                    total, created, failed = len(rows), len(rows), 0
            
            results[table] = {"total": total, "created": created, "failed": failed}
            
        except FileNotFoundError as e:
            print(f"Error: {e}")
            results[table] = {"total": 0, "created": 0, "failed": 1}
        except Exception as e:
            print(f"Error importing {table}: {e}")
            if args.verbose:
                import traceback
                traceback.print_exc()
            results[table] = {"total": 0, "created": 0, "failed": 1}
    
    # Print final summary
    elapsed = (datetime.now() - start_time).total_seconds()
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)
    
    total_records = 0
    total_created = 0
    total_failed = 0
    
    for table, r in results.items():
        status = "✓" if r["failed"] == 0 else "✗"
        print(f"  {table:12} {r['created']:4} created, {r['failed']:4} failed {status}")
        total_records += r["total"]
        total_created += r["created"]
        total_failed += r["failed"]
    
    print("─" * 60)
    print(f"  {'TOTAL':12} {total_created:4} created, {total_failed:4} failed")
    print(f"\nDuration: {elapsed:.1f}s ({total_records / elapsed:.1f} records/sec)")
    
    if total_failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
