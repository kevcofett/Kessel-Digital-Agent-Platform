#!/usr/bin/env python3
"""
MPA v5.5 Seed Data Import Script

Imports seed data from CSV files to Dataverse tables using device code flow authentication.

Usage:
    python seed_data_import.py [--dry-run] [--table TABLE] [-v]

Examples:
    python seed_data_import.py --dry-run           # Validate only
    python seed_data_import.py --table vertical    # Import verticals only
    python seed_data_import.py                     # Import all tables
"""

import argparse
import csv
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from auth.msal_auth import MSALAuthenticator, AuthenticationError
from config.settings import Settings, TABLE_CONFIG
from dataverse.client import (
    DataverseClient,
    BatchResult,
    transform_record,
    parse_boolean,
    parse_float
)


class ProgressTracker:
    """Track and display import progress."""

    def __init__(self, total: int, table_name: str):
        self.total = total
        self.table_name = table_name
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

        print(
            f"\r{self.table_name}: {self.processed}/{self.total} ({pct:.1f}%) "
            f"[{self.created} created, {self.updated} updated, {self.failed} failed] "
            f"({rate:.1f} rec/s)",
            end="",
            flush=True
        )

    def print_summary(self):
        """Print final summary."""
        elapsed = (datetime.now() - self.start_time).total_seconds()
        print(f"\n{'=' * 60}")
        print(f"{self.table_name} Import Summary:")
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


def import_simple_table(
    client: DataverseClient,
    table_name: str,
    config: dict,
    seed_data_path: Path,
    dry_run: bool = False,
    verbose: bool = False
) -> BatchResult:
    """
    Import a simple table (no lookups).

    Args:
        client: Dataverse client
        table_name: Table identifier (vertical, channel, kpi)
        config: Table configuration from TABLE_CONFIG
        seed_data_path: Path to seed data directory
        dry_run: If True, validate only
        verbose: If True, print verbose output

    Returns:
        BatchResult with import statistics
    """
    csv_file = seed_data_path / config["csv_file"]
    rows = load_csv(csv_file)

    print(f"\nLoaded {len(rows)} records from {config['csv_file']}")

    if dry_run:
        print("[DRY RUN] Validating data...")

    tracker = ProgressTracker(len(rows), table_name)

    # Transform records
    records = []
    for row in rows:
        record = transform_record(
            row,
            config["column_mappings"],
            config.get("transforms", {})
        )
        records.append(record)

        if verbose and dry_run:
            print(f"  {row.get(config['primary_key'])}: {record}")

    # Batch upsert
    result = client.batch_upsert(
        entity_set=config["entity_set"],
        primary_key_field=config["primary_key"],
        records=records,
        get_key_value=lambda r: r.get(config["primary_key"]),
        progress_callback=tracker.update,
        dry_run=dry_run
    )

    tracker.print_summary()

    if result.errors and verbose:
        print("\nErrors:")
        for error in result.errors[:10]:  # Show first 10 errors
            print(f"  {error['key']}: {error['error'][:100]}")
        if len(result.errors) > 10:
            print(f"  ... and {len(result.errors) - 10} more errors")

    return result


def import_benchmark_table(
    client: DataverseClient,
    config: dict,
    seed_data_path: Path,
    dry_run: bool = False,
    verbose: bool = False
) -> BatchResult:
    """
    Import benchmark table with lookup resolution.

    Benchmarks reference vertical, channel, and KPI tables via lookups.
    Uses @odata.bind syntax for setting lookup fields.

    Args:
        client: Dataverse client
        config: Table configuration from TABLE_CONFIG
        seed_data_path: Path to seed data directory
        dry_run: If True, validate only
        verbose: If True, print verbose output

    Returns:
        BatchResult with import statistics
    """
    csv_file = seed_data_path / config["csv_file"]
    rows = load_csv(csv_file)

    print(f"\nLoaded {len(rows)} benchmark records from {config['csv_file']}")

    # Build lookup caches
    print("Building lookup caches...")

    vertical_cache = client.build_lookup_cache("mpa_verticals", "mpa_verticalcode")
    print(f"  Verticals: {len(vertical_cache)} records cached")

    channel_cache = client.build_lookup_cache("mpa_channels", "mpa_channelcode")
    print(f"  Channels: {len(channel_cache)} records cached")

    kpi_cache = client.build_lookup_cache("mpa_kpis", "mpa_kpicode")
    print(f"  KPIs: {len(kpi_cache)} records cached")

    if dry_run:
        print("[DRY RUN] Validating data...")

    tracker = ProgressTracker(len(rows), "benchmark")

    # Transform records with lookup resolution
    records = []
    lookup_errors = []

    for row in rows:
        # Basic field transforms
        record = transform_record(
            row,
            config["column_mappings"],
            config.get("transforms", {})
        )

        # Resolve lookups using @odata.bind syntax
        vertical_code = row.get("mpa_verticalcode")
        channel_code = row.get("mpa_channelcode")
        kpi_code = row.get("mpa_kpicode")

        vertical_id = vertical_cache.get(vertical_code)
        channel_id = channel_cache.get(channel_code)
        kpi_id = kpi_cache.get(kpi_code)

        # Check for missing lookups
        if not vertical_id:
            lookup_errors.append(f"Vertical not found: {vertical_code}")
            continue
        if not channel_id:
            lookup_errors.append(f"Channel not found: {channel_code}")
            continue
        if not kpi_id:
            lookup_errors.append(f"KPI not found: {kpi_code}")
            continue

        # Add lookup bindings using @odata.bind syntax
        record["mpa_vertical@odata.bind"] = f"/mpa_verticals({vertical_id})"
        record["mpa_channel@odata.bind"] = f"/mpa_channels({channel_id})"
        record["mpa_kpi@odata.bind"] = f"/mpa_kpis({kpi_id})"

        # Create composite key for matching
        record["_composite_key"] = f"{vertical_code}|{channel_code}|{kpi_code}"

        records.append(record)

        if verbose and dry_run:
            print(f"  {vertical_code}/{channel_code}/{kpi_code}: lookup resolved")

    if lookup_errors:
        print(f"\nWarning: {len(lookup_errors)} records skipped due to lookup errors")
        if verbose:
            for error in lookup_errors[:10]:
                print(f"  {error}")

    print(f"\nImporting {len(records)} valid records...")

    # For benchmarks, we need a different upsert strategy since there's no single primary key
    # We'll use create (POST) for each record since benchmarks are typically loaded fresh
    result = BatchResult(total=len(records))
    start_time = datetime.now()

    for i, record in enumerate(records):
        composite_key = record.pop("_composite_key", "")

        if dry_run:
            tracker.update(i + 1, len(records), "validate")
            result.created += 1
            continue

        # Create record (benchmarks are typically loaded fresh)
        create_result = client.create(config["entity_set"], record)

        if create_result.success:
            result.created += 1
            tracker.update(i + 1, len(records), "create")
        else:
            result.failed += 1
            result.errors.append({
                "key": composite_key,
                "error": create_result.error
            })
            tracker.update(i + 1, len(records), "error")

        # Rate limiting
        if (i + 1) % 50 == 0:
            time.sleep(1.0)
        else:
            time.sleep(0.1)

    tracker.print_summary()

    return result


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Import MPA seed data to Dataverse",
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
    print("MPA v5.5 Seed Data Import")
    print("=" * 60)

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

    # Authenticate
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
        except AuthenticationError as e:
            print(f"Authentication failed: {e}")
            sys.exit(1)

        # Create Dataverse client
        client = DataverseClient(
            settings.dataverse.api_url,
            lambda: auth.get_dataverse_token(settings.dataverse.environment_url)
        )
    else:
        # Dummy client for dry run
        client = None

    # Determine import order
    import_order = ["vertical", "channel", "kpi", "benchmark"]

    if args.table != "all":
        import_order = [args.table]

    # Track overall results
    results = {}

    # Import tables
    for table in import_order:
        print(f"\n{'=' * 60}")
        print(f"Importing: {table}")
        print(f"{'=' * 60}")

        config = TABLE_CONFIG.get(table)
        if not config:
            print(f"Error: Unknown table '{table}'")
            continue

        try:
            if table == "benchmark":
                if client:
                    result = import_benchmark_table(
                        client,
                        config,
                        settings.seed_data_path,
                        dry_run=args.dry_run,
                        verbose=args.verbose
                    )
                else:
                    # Dry run for benchmarks
                    rows = load_csv(settings.seed_data_path / config["csv_file"])
                    print(f"\n[DRY RUN] Would import {len(rows)} benchmark records")
                    result = BatchResult(total=len(rows), created=len(rows))
            else:
                if client:
                    result = import_simple_table(
                        client,
                        table,
                        config,
                        settings.seed_data_path,
                        dry_run=args.dry_run,
                        verbose=args.verbose
                    )
                else:
                    # Dry run
                    rows = load_csv(settings.seed_data_path / config["csv_file"])
                    print(f"\n[DRY RUN] Would import {len(rows)} {table} records")
                    result = BatchResult(total=len(rows), created=len(rows))

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
        print(f"  {table:12} {result.created:4} created, {result.updated:4} updated, {result.failed:4} failed [{status}]")
        total_created += result.created
        total_updated += result.updated
        total_failed += result.failed

    print("-" * 60)
    print(f"  {'TOTAL':12} {total_created:4} created, {total_updated:4} updated, {total_failed:4} failed")

    # Exit with error code if any failures
    if total_failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
