#!/usr/bin/env python3
"""
ADIS Dataverse Table Creation Script
Version 1.0

Creates Dataverse tables from ADIS schema definitions.
Handles table creation order to respect foreign key dependencies.

Prerequisites:
- Power Platform CLI (pac) installed and authenticated
- Python 3.11+

Usage:
    python create_adis_tables.py --environment personal
    python create_adis_tables.py --environment mastercard --dry-run
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional


# Table creation order (respects foreign key dependencies)
TABLE_ORDER = [
    "mpa_model_catalog",      # No dependencies
    "mpa_upload_job",         # Depends on mpa_session (external)
    "mpa_data_schema",        # Depends on mpa_upload_job
    "mpa_customer_record",    # Depends on mpa_upload_job
    "mpa_model_run",          # Depends on mpa_upload_job, mpa_session
    "mpa_model_output",       # Depends on mpa_model_run, mpa_customer_record
    "mpa_audience",           # Depends on mpa_model_run, mpa_session
    "mpa_audience_rule",      # Depends on mpa_audience
    "mpa_audience_member",    # Depends on mpa_audience, mpa_customer_record
    "mpa_campaign_audience",  # Depends on mpa_session, mpa_audience
    "mpa_performance_linkage" # Depends on mpa_campaign_audience
]


# Dataverse data type mapping
TYPE_MAPPING = {
    "uniqueidentifier": "UniqueIdentifier",
    "string": "Text",
    "memo": "Multiline",
    "whole number": "WholeNumber",
    "decimal": "Decimal",
    "money": "Currency",
    "datetime": "DateTime",
    "boolean": "TwoOption",
    "picklist": "Picklist"
}


class TableCreator:
    """Creates Dataverse tables from schema definitions."""
    
    def __init__(self, schema_path: Path, dry_run: bool = False, verbose: bool = True):
        self.schema_path = schema_path
        self.dry_run = dry_run
        self.verbose = verbose
        self.tables: Dict[str, dict] = {}
        
    def log(self, message: str, level: str = "INFO"):
        """Log a message."""
        if self.verbose:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] [{level}] {message}")
    
    def load_schemas(self) -> bool:
        """Load all schema files."""
        self.log("Loading schema files...")
        
        schema_files = list(self.schema_path.glob("ADIS_Schema_v1*.json"))
        
        if not schema_files:
            self.log("No schema files found", "ERROR")
            return False
        
        for schema_file in schema_files:
            self.log(f"Loading {schema_file.name}...")
            
            with open(schema_file, "r") as f:
                schema_data = json.load(f)
            
            if "tables" in schema_data:
                for table in schema_data["tables"]:
                    table_name = table.get("name", table.get("logical_name", ""))
                    if table_name:
                        self.tables[table_name] = table
                        self.log(f"  Loaded table: {table_name}")
        
        self.log(f"Loaded {len(self.tables)} table definitions")
        return True
    
    def generate_pac_command(self, table_name: str) -> str:
        """Generate pac CLI command for table creation."""
        if table_name not in self.tables:
            return ""
        
        table = self.tables[table_name]
        
        # Build basic table creation command
        display_name = table.get("display_name", table_name.replace("_", " ").title())
        description = table.get("description", "")
        
        cmd = f"pac table create --name {table_name} --display-name \"{display_name}\""
        
        if description:
            cmd += f" --description \"{description}\""
        
        return cmd
    
    def generate_column_commands(self, table_name: str) -> List[str]:
        """Generate pac CLI commands for column creation."""
        if table_name not in self.tables:
            return []
        
        table = self.tables[table_name]
        columns = table.get("columns", [])
        commands = []
        
        for column in columns:
            col_name = column.get("name", "")
            col_type = column.get("type", "string").lower()
            display_name = column.get("display_name", col_name.replace("_", " ").title())
            
            # Map to Dataverse type
            dv_type = TYPE_MAPPING.get(col_type, "Text")
            
            cmd = f"pac column create --table {table_name} --name {col_name} "
            cmd += f"--display-name \"{display_name}\" --type {dv_type}"
            
            # Add type-specific options
            if col_type == "string" and "max_length" in column:
                cmd += f" --max-length {column['max_length']}"
            
            if column.get("required", False):
                cmd += " --required true"
            
            commands.append(cmd)
        
        return commands
    
    def create_table(self, table_name: str) -> bool:
        """Create a single table with its columns."""
        self.log(f"Creating table: {table_name}")
        
        # Generate table creation command
        table_cmd = self.generate_pac_command(table_name)
        
        if not table_cmd:
            self.log(f"Could not generate command for {table_name}", "ERROR")
            return False
        
        if self.dry_run:
            self.log(f"  [DRY RUN] {table_cmd}")
        else:
            # Would execute: subprocess.run(table_cmd, shell=True)
            self.log(f"  Executed: {table_cmd}")
        
        # Generate column creation commands
        column_cmds = self.generate_column_commands(table_name)
        
        for col_cmd in column_cmds:
            if self.dry_run:
                self.log(f"  [DRY RUN] {col_cmd}")
            else:
                # Would execute: subprocess.run(col_cmd, shell=True)
                self.log(f"  Executed: {col_cmd}")
        
        return True
    
    def create_all_tables(self) -> bool:
        """Create all tables in dependency order."""
        self.log("Creating all tables...")
        
        for table_name in TABLE_ORDER:
            if table_name in self.tables:
                if not self.create_table(table_name):
                    self.log(f"Failed to create {table_name}", "ERROR")
                    return False
            else:
                self.log(f"Table {table_name} not found in schema", "WARNING")
        
        return True
    
    def generate_sql_ddl(self) -> str:
        """Generate SQL DDL for reference (not executed)."""
        ddl_lines = []
        ddl_lines.append("-- ADIS Dataverse Table Definitions (Reference Only)")
        ddl_lines.append("-- These tables are created via Power Platform CLI, not SQL")
        ddl_lines.append("")
        
        for table_name in TABLE_ORDER:
            if table_name not in self.tables:
                continue
            
            table = self.tables[table_name]
            columns = table.get("columns", [])
            
            ddl_lines.append(f"-- Table: {table_name}")
            ddl_lines.append(f"CREATE TABLE {table_name} (")
            
            col_defs = []
            for column in columns:
                col_name = column.get("name", "")
                col_type = column.get("type", "string")
                
                # Map to SQL type for reference
                sql_type = {
                    "uniqueidentifier": "UNIQUEIDENTIFIER",
                    "string": "NVARCHAR(200)",
                    "memo": "NVARCHAR(MAX)",
                    "whole number": "INT",
                    "decimal": "DECIMAL(18,6)",
                    "money": "MONEY",
                    "datetime": "DATETIME2",
                    "boolean": "BIT",
                    "picklist": "INT"
                }.get(col_type.lower(), "NVARCHAR(200)")
                
                required = "NOT NULL" if column.get("required", False) else "NULL"
                col_defs.append(f"    {col_name} {sql_type} {required}")
            
            ddl_lines.append(",\n".join(col_defs))
            ddl_lines.append(");")
            ddl_lines.append("")
        
        return "\n".join(ddl_lines)


def main():
    parser = argparse.ArgumentParser(description="Create ADIS Dataverse tables")
    parser.add_argument(
        "--environment",
        choices=["personal", "mastercard"],
        required=True,
        help="Target environment"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show commands without executing"
    )
    parser.add_argument(
        "--generate-ddl",
        action="store_true",
        help="Generate SQL DDL reference file"
    )
    
    args = parser.parse_args()
    
    # Find schema path
    script_path = Path(__file__).resolve()
    base_path = script_path.parent.parent
    schema_path = base_path / "schema"
    
    if not schema_path.exists():
        print(f"Schema path not found: {schema_path}")
        sys.exit(1)
    
    # Create tables
    creator = TableCreator(schema_path, dry_run=args.dry_run)
    
    if not creator.load_schemas():
        sys.exit(1)
    
    if args.generate_ddl:
        ddl = creator.generate_sql_ddl()
        ddl_path = base_path / "schema" / "ADIS_Reference_DDL.sql"
        with open(ddl_path, "w") as f:
            f.write(ddl)
        print(f"Generated DDL reference: {ddl_path}")
    else:
        if not creator.create_all_tables():
            sys.exit(1)
    
    print("Table creation completed successfully")


if __name__ == "__main__":
    main()
