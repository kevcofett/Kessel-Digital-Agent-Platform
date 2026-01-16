#!/usr/bin/env python3
"""
MPA v6.0 Reference Data Import Script

Imports v6.0 reference data from CSV files to Dataverse tables using device code flow authentication.
Supports multi-file imports for tables like geography and platform_taxonomy.

Tables:
    - geography: Geographic reference data (10 regions, ~2500 total records)
    - iab_taxonomy: IAB Content Taxonomy 3.0 (~700 codes)
    - platform_taxonomy: Google, Meta, LinkedIn audience taxonomies (~1200 segments)
    - behavioral_attribute: Behavioral targeting signals (~200 signals)
    - contextual_attribute: Contextual targeting signals (~150 signals)

Usage:
    python seed_data_import_v6.py [--dry-run] [--table TABLE] [-v]

Examples:
    python seed_data_import_v6.py --dry-run                    # Validate only
    python seed_data_import_v6.py --table geography            # Import geography only
    python seed_data_import_v6.py --table geography --file us  # Import US geography only
    python seed_data_import_v6.py                              # Import all tables
"""

import argparse
import csv
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from auth.msal_auth import MSALAuthenticator, AuthenticationError
from config.settings import Settings, TABLE_CONFIG_V6
from dataverse.client import (
    DataverseClient,
    BatchResult,
    transform_record,
    parse_boolean,
    parse_float
)


def parse_int(value: Any) -> Optional[int]:
    """Parse integer, returning None for empty values."""
    if value is None or value == "":
        return None
    try:
        return int(float(value))  # Handle "123.0" format
    except (ValueError, TypeError):
        return None


def parse_int_nullable(value: Any) -> Optional[int]:
    """Parse integer, returning None for empty/invalid values."""
    return parse_int(value)


def parse_datetime(value: Any) -> Optional[str]:
    """
    Parse datetime string to ISO format for Dataverse.

    Supports formats:
        - YYYY-MM-DD
        - YYYY-MM-DDTHH:MM:SS
        - MM/DD/YYYY
    """
    if value is None or value == "":
        return None

    str_val = str(value).strip()

    # Already in ISO format
    if "T" in str_val:
        return str_val

    # Try YYYY-MM-DD
    try:
        dt = datetime.strptime(str_val, "%Y-%m-%d")
        return dt.strftime("%Y-%m-%dT00:00:00Z")
    except ValueError:
        pass

    # Try MM/DD/YYYY
    try:
        dt = datetime.strptime(str_val, "%m/%d/%Y")
        return dt.strftime("%Y-%m-%dT00:00:00Z")
    except ValueError:
        pass

    return None


def transform_record_v6(
    row: Dict[str, str],
    column_mappings: Dict[str, str],
    transforms: Dict[str, str]
) -> Dict[str, Any]:
    """
    Transform a CSV row to Dataverse record format with v6.0 transform support.

    Additional transforms for v6.0:
        - int: Parse as integer (required)
        - int_nullable: Parse as integer (optional, skip if null)
        - datetime_nullable: Parse as ISO datetime (optional, skip if null)

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
        transform = transforms.get(dv_field)  # Note: v6 uses dv_field as key
        if transform is None:
            # Check if using csv_col as key (v5 style)
            transform = transforms.get(csv_col)

        if transform == "boolean":
            value = parse_boolean(value)
        elif transform == "float":
            value = parse_float(value)
            if value is None:
                continue  # Skip null required floats
        elif transform == "float_nullable":
            value = parse_float(value)
            if value is None:
                continue  # Skip null floats
        elif transform == "int":
            value = parse_int(value)
            if value is None:
                continue  # Skip null required ints
        elif transform == "int_nullable":
            value = parse_int_nullable(value)
            if value is None:
                continue  # Skip null ints
        elif transform == "datetime_nullable":
            value = parse_datetime(value)
            if value is None:
                continue  # Skip null datetimes

        if value is not None:
            result[dv_field] = value

    return result


class ProgressTracker:
    """Track and display import progress."""

    def __init__(self, total: int, table_name: str, file_name: str = ""):
        self.total = total
        self.table_name = table_name
        self.file_name = file_name
        self.processed = 0
        self.created = 0
        self.updated = 0
        self.failed = 0
        self.start_time = datetime.now()

    def update(self, processed: int, total: int, status: str):
        """Update progress display."""
        self.processed = processed
        if status == "create":
            self.created += 1
        elif status == "update":
            self.updated += 1
        elif status == "error":
            self.failed += 1
        elif status == "validate":
            self.created += 1  # For dry run

        self._print_progress()

    def _print_progress(self):
        """Print progress line."""
        pct = (self.processed / self.total) * 100 if self.total > 0 else 0
        elapsed = (datetime.now() - self.start_time).total_seconds()
        rate = self.processed / elapsed if elapsed > 0 else 0

        display_name = f"{self.table_name}"
        if self.file_name:
            display_name = f"{self.table_name}/{self.file_name}"

        print(
            f"\r{display_name}: {self.processed}/{self.total} ({pct:.1f}%) "
            f"[{self.created} created, {self.updated} updated, {self.failed} failed] "
            f"({rate:.1f} rec/s)    ",
            end="",
            flush=True
        )

    def print_summary(self):
        """Print final summary."""
        elapsed = (datetime.now() - self.start_time).total_seconds()
        display_name = f"{self.table_name}"
        if self.file_name:
            display_name = f"{self.table_name}/{self.file_name}"

        print(f"\n{'=' * 60}")
        print(f"{display_name} Import Summary:")
        print(f"  Total:    {self.total}")
        print(f"  Created:  {self.created}")
        print(f"  Updated:  {self.updated}")
        print(f"  Failed:   {self.failed}")
        print(f"  Duration: {elapsed:.1f}s")
        print(f"{'=' * 60}")


def load_csv(file_path: Path) -> List[Dict[str, str]]:
    """Load CSV file into list of dicts."""
    if not file_path.exists():
        raise FileNotFoundError(f"CSV file not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def get_csv_files(config: dict) -> List[str]:
    """Get list of CSV files from config (supports single or multiple files)."""
    if "csv_files" in config:
        return config["csv_files"]
    elif "csv_file" in config:
        return [config["csv_file"]]
    else:
        return []


def import_table(
    client: Optional[DataverseClient],
    table_name: str,
    config: dict,
    seed_data_path: Path,
    dry_run: bool = False,
    verbose: bool = False,
    file_filter: Optional[str] = None
) -> BatchResult:
    """
    Import a v6.0 reference data table.

    Args:
        client: Dataverse client (None for dry run)
        table_name: Table identifier
        config: Table configuration from TABLE_CONFIG_V6
        seed_data_path: Path to seed data directory
        dry_run: If True, validate only
        verbose: If True, print verbose output
        file_filter: If provided, only import files containing this string

    Returns:
        BatchResult with import statistics
    """
    csv_files = get_csv_files(config)

    # Filter files if requested
    if file_filter:
        csv_files = [f for f in csv_files if file_filter.lower() in f.lower()]
        if not csv_files:
            print(f"No files matching filter '{file_filter}' found")
            return BatchResult(total=0)

    aggregate_result = BatchResult(total=0)

    for csv_filename in csv_files:
        csv_file = seed_data_path / csv_filename

        # Check if file exists
        if not csv_file.exists():
            print(f"\nWarning: File not found: {csv_filename}")
            continue

        rows = load_csv(csv_file)

        # Skip empty files (header only)
        if len(rows) == 0:
            print(f"\nSkipping {csv_filename} (no data rows)")
            continue

        print(f"\nLoaded {len(rows)} records from {csv_filename}")

        if dry_run:
            print("[DRY RUN] Validating data...")

        # Extract short file identifier for display
        file_short = csv_filename.replace("mpa_", "").replace("_seed.csv", "")
        tracker = ProgressTracker(len(rows), table_name, file_short)

        # Transform records
        records = []
        for row in rows:
            record = transform_record_v6(
                row,
                config["column_mappings"],
                config.get("transforms", {})
            )
            records.append(record)

            if verbose and dry_run:
                primary_key = config["primary_key"]
                key_val = record.get(primary_key, "unknown")
                print(f"  {key_val}: {record}")

        # Perform import
        if client and not dry_run:
            result = client.batch_upsert(
                entity_set=config["entity_set"],
                primary_key_field=config["primary_key"],
                records=records,
                get_key_value=lambda r, pk=config["primary_key"]: r.get(pk),
                progress_callback=tracker.update,
                dry_run=False
            )
        else:
            # Dry run simulation
            for i, record in enumerate(records):
                tracker.update(i + 1, len(records), "validate")
            result = BatchResult(total=len(records), created=len(records))

        tracker.print_summary()

        # Aggregate results
        aggregate_result.total += result.total
        aggregate_result.created += result.created
        aggregate_result.updated += result.updated
        aggregate_result.failed += result.failed
        aggregate_result.errors.extend(result.errors)

        if result.errors and verbose:
            print("\nErrors:")
            for error in result.errors[:10]:
                print(f"  {error['key']}: {error['error'][:100]}")
            if len(result.errors) > 10:
                print(f"  ... and {len(result.errors) - 10} more errors")

    return aggregate_result


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Import MPA v6.0 reference data to Dataverse",
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
        choices=["geography", "iab_taxonomy", "platform_taxonomy",
                 "behavioral_attribute", "contextual_attribute", "all"],
        default="all",
        help="Which table(s) to import (default: all)"
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Filter to specific file(s) containing this string (e.g., 'us' for US geography)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Print verbose output"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("MPA v6.0 Reference Data Import")
    print("=" * 60)

    # Load settings
    try:
        settings = Settings()
        print(f"\nEnvironment: {settings.dataverse.environment_url}")
        print(f"Seed Data:   {settings.seed_data_v6_path}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Verify seed data directory exists
    if not settings.seed_data_v6_path.exists():
        print(f"Error: Seed data directory not found: {settings.seed_data_v6_path}")
        sys.exit(1)

    if args.dry_run:
        print("\n[DRY RUN MODE] No changes will be made to Dataverse")

    # Authenticate
    client = None
    if not args.dry_run:
        print("\nAuthenticating...")
        try:
            auth = MSALAuthenticator(
                settings.auth.tenant_id,
                settings.auth.client_id
            )
            # Test authentication
            token = auth.get_dataverse_token(settings.dataverse.environment_url)
            print("Authentication successful!")

            # Create Dataverse client
            client = DataverseClient(
                settings.dataverse.api_url,
                lambda: auth.get_dataverse_token(settings.dataverse.environment_url)
            )
        except AuthenticationError as e:
            print(f"Authentication failed: {e}")
            sys.exit(1)

    # Determine import order (dependencies first)
    import_order = [
        "geography",           # No dependencies
        "iab_taxonomy",        # No dependencies
        "platform_taxonomy",   # No dependencies
        "behavioral_attribute", # No dependencies
        "contextual_attribute"  # References IAB taxonomy conceptually but not via lookup
    ]

    if args.table != "all":
        import_order = [args.table]

    # Track overall results
    results = {}

    # Import tables
    for table in import_order:
        print(f"\n{'=' * 60}")
        print(f"Importing: {table}")
        print(f"{'=' * 60}")

        config = TABLE_CONFIG_V6.get(table)
        if not config:
            print(f"Error: Unknown table '{table}'")
            continue

        try:
            result = import_table(
                client,
                table,
                config,
                settings.seed_data_v6_path,
                dry_run=args.dry_run,
                verbose=args.verbose,
                file_filter=args.file
            )
            results[table] = result

        except FileNotFoundError as e:
            print(f"Error: {e}")
            results[table] = BatchResult(total=0, failed=1)
        except Exception as e:
            print(f"Error importing {table}: {e}")
            if args.verbose:
                import traceback
                traceback.print_exc()
            results[table] = BatchResult(total=0, failed=1)

    # Print final summary
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)

    total_created = 0
    total_updated = 0
    total_failed = 0

    for table, result in results.items():
        status = "OK" if result.failed == 0 else "ERRORS"
        print(f"  {table:25} {result.created:5} created, {result.updated:5} updated, {result.failed:5} failed [{status}]")
        total_created += result.created
        total_updated += result.updated
        total_failed += result.failed

    print("-" * 60)
    print(f"  {'TOTAL':25} {total_created:5} created, {total_updated:5} updated, {total_failed:5} failed")

    # Exit with error code if any failures
    if total_failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
