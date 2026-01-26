#!/usr/bin/env python3
"""
MPA v5.5 Seed Data Import Script
Imports seed data to Dataverse using Web API

Prerequisites:
- pip install msal requests pandas
- Azure AD App Registration with Dataverse permissions
"""

import os
import sys
import json
import time
import pandas as pd
import requests
from msal import PublicClientApplication

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

CONFIG = {
    "tenant_id": "3933d83c-778f-4bf2-b5d7-1eea5844e9a3",
    "client_id": "51f81489-12ee-4a9e-aaae-a2591f45987d",  # Microsoft Power Platform CLI client ID
    "dataverse_url": "https://aragornai.crm.dynamics.com",
    "api_version": "v9.2",
    "seed_data_path": os.path.join(os.path.dirname(__file__), "..", "..", "agents", "mpa", "base", "data", "seed")
}

# Table mappings: CSV filename -> Dataverse table name
TABLE_MAPPINGS = {
    "mpa_vertical_seed.csv": {
        "table": "mpa_verticals",
        "key_column": "mpa_verticalcode",
        "columns": {
            "vertical_name": "mpa_name",
            "vertical_code": "mpa_verticalcode", 
            "description": "mpa_description",
            "is_active": "mpa_isactive",
            "display_order": "mpa_displayorder"
        }
    },
    "mpa_channel_seed.csv": {
        "table": "mpa_channels",
        "key_column": "mpa_channelcode",
        "columns": {
            "channel_name": "mpa_name",
            "channel_code": "mpa_channelcode",
            "category": "mpa_category",
            "description": "mpa_description",
            "typical_cpm_low": "mpa_typicalcpmlow",
            "typical_cpm_high": "mpa_typicalcpmhigh",
            "is_active": "mpa_isactive",
            "display_order": "mpa_displayorder"
        }
    },
    "mpa_kpi_seed.csv": {
        "table": "mpa_kpidefinitions",
        "key_column": "mpa_kpicode",
        "columns": {
            "kpi_name": "mpa_name",
            "kpi_code": "mpa_kpicode",
            "category": "mpa_category",
            "formula": "mpa_formula",
            "formula_inputs": "mpa_formulainputs",
            "unit": "mpa_unit",
            "format_pattern": "mpa_formatpattern",
            "direction": "mpa_direction",
            "description": "mpa_description",
            "interpretation_guide": "mpa_interpretationguide",
            "is_active": "mpa_isactive"
        }
    },
    "mpa_benchmark_seed.csv": {
        "table": "mpa_benchmarks",
        "key_column": None,  # No unique key, always insert
        "columns": {
            "metric_name": "mpa_name",
            "vertical": "mpa_vertical",
            "channel": "mpa_channel",
            "metric_type": "mpa_metrictype",
            "benchmark_low": "mpa_benchmarklow",
            "benchmark_median": "mpa_benchmarkmedian",
            "benchmark_high": "mpa_benchmarkhigh",
            "benchmark_best_in_class": "mpa_benchmarkbestinclass",
            "data_source": "mpa_datasource",
            "data_period": "mpa_dataperiod",
            "confidence": "mpa_confidence",
            "sample_size": "mpa_samplesize",
            "is_active": "mpa_isactive"
        }
    }
}

# Choice value mappings
CHOICE_MAPPINGS = {
    "category_channel": {
        "Digital": 100000000,
        "Traditional": 100000001,
        "Emerging": 100000002
    },
    "category_kpi": {
        "Cost": 100000000,
        "Engagement": 100000001,
        "Conversion": 100000002,
        "Efficiency": 100000003,
        "Quality": 100000004
    },
    "direction": {
        "Higher is Better": 100000000,
        "Lower is Better": 100000001,
        "Target Range": 100000002
    },
    "metric_type": {
        "CPM": 100000000,
        "CPC": 100000001,
        "CTR": 100000002,
        "CVR": 100000003,
        "CPA": 100000004,
        "ROAS": 100000005,
        "Viewability": 100000006,
        "VCR": 100000007,
        "Completion Rate": 100000008
    },
    "confidence": {
        "High": 100000000,
        "Medium": 100000001,
        "Low": 100000002
    }
}


# ═══════════════════════════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════════════════════════

def get_access_token():
    """Get access token using device code flow (interactive)"""
    
    app = PublicClientApplication(
        CONFIG["client_id"],
        authority=f"https://login.microsoftonline.com/{CONFIG['tenant_id']}"
    )
    
    scopes = [f"{CONFIG['dataverse_url']}/.default"]
    
    # Try to get token from cache first
    accounts = app.get_accounts()
    if accounts:
        result = app.acquire_token_silent(scopes, account=accounts[0])
        if result and "access_token" in result:
            print("✓ Using cached token")
            return result["access_token"]
    
    # Interactive login with device code
    print("\n" + "="*60)
    print("AUTHENTICATION REQUIRED")
    print("="*60)
    
    flow = app.initiate_device_flow(scopes=scopes)
    if "user_code" not in flow:
        raise Exception(f"Failed to create device flow: {flow.get('error_description', 'Unknown error')}")
    
    print(f"\n{flow['message']}\n")
    
    result = app.acquire_token_by_device_flow(flow)
    
    if "access_token" in result:
        print("✓ Authentication successful!")
        return result["access_token"]
    else:
        raise Exception(f"Authentication failed: {result.get('error_description', 'Unknown error')}")


# ═══════════════════════════════════════════════════════════════
# DATAVERSE API
# ═══════════════════════════════════════════════════════════════

class DataverseClient:
    def __init__(self, access_token):
        self.base_url = f"{CONFIG['dataverse_url']}/api/data/{CONFIG['api_version']}"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
            "Prefer": "return=representation"
        }
    
    def get_records(self, table_name, select=None, filter_query=None, top=None):
        """Get records from a table"""
        url = f"{self.base_url}/{table_name}"
        params = {}
        if select:
            params["$select"] = select
        if filter_query:
            params["$filter"] = filter_query
        if top:
            params["$top"] = str(top)
        
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            return response.json().get("value", [])
        else:
            print(f"  ⚠ GET failed: {response.status_code} - {response.text[:200]}")
            return []
    
    def create_record(self, table_name, data):
        """Create a new record"""
        url = f"{self.base_url}/{table_name}"
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code in [200, 201, 204]:
            return True, response.json() if response.text else {}
        else:
            return False, response.text
    
    def update_record(self, table_name, record_id, data):
        """Update an existing record"""
        url = f"{self.base_url}/{table_name}({record_id})"
        
        response = requests.patch(url, headers=self.headers, json=data)
        
        if response.status_code in [200, 204]:
            return True, {}
        else:
            return False, response.text
    
    def upsert_record(self, table_name, key_column, key_value, data):
        """Upsert (update or insert) a record"""
        # First try to find existing record
        existing = self.get_records(
            table_name, 
            select=f"{table_name.rstrip('s')}id,{key_column}",
            filter_query=f"{key_column} eq '{key_value}'"
        )
        
        if existing:
            # Update existing
            record_id = existing[0][f"{table_name.rstrip('s')}id"]
            return self.update_record(table_name, record_id, data)
        else:
            # Create new
            return self.create_record(table_name, data)


# ═══════════════════════════════════════════════════════════════
# DATA TRANSFORMATION
# ═══════════════════════════════════════════════════════════════

def transform_row(row, mapping, table_name):
    """Transform a CSV row to Dataverse format"""
    data = {}
    
    for csv_col, dv_col in mapping["columns"].items():
        if csv_col in row and pd.notna(row[csv_col]):
            value = row[csv_col]
            
            # Handle boolean fields
            if dv_col.endswith("isactive"):
                value = str(value).lower() in ["true", "1", "yes", "y"]
            
            # Handle choice fields
            elif dv_col == "mpa_category":
                if table_name == "mpa_channels":
                    value = CHOICE_MAPPINGS["category_channel"].get(value, value)
                elif table_name == "mpa_kpidefinitions":
                    value = CHOICE_MAPPINGS["category_kpi"].get(value, value)
            
            elif dv_col == "mpa_direction":
                value = CHOICE_MAPPINGS["direction"].get(value, value)
            
            elif dv_col == "mpa_metrictype":
                value = CHOICE_MAPPINGS["metric_type"].get(value, value)
            
            elif dv_col == "mpa_confidence":
                value = CHOICE_MAPPINGS["confidence"].get(value, value)
            
            # Handle numeric fields
            elif dv_col in ["mpa_displayorder", "mpa_samplesize"]:
                value = int(value) if pd.notna(value) else None
            
            elif dv_col in ["mpa_typicalcpmlow", "mpa_typicalcpmhigh", 
                           "mpa_benchmarklow", "mpa_benchmarkmedian", 
                           "mpa_benchmarkhigh", "mpa_benchmarkbestinclass"]:
                value = float(value) if pd.notna(value) else None
            
            if value is not None:
                data[dv_col] = value
    
    return data


# ═══════════════════════════════════════════════════════════════
# IMPORT FUNCTIONS
# ═══════════════════════════════════════════════════════════════

def import_csv(client, csv_file, mapping):
    """Import a single CSV file to Dataverse"""
    csv_path = os.path.join(CONFIG["seed_data_path"], csv_file)
    
    if not os.path.exists(csv_path):
        print(f"  ⚠ File not found: {csv_path}")
        return 0, 0
    
    df = pd.read_csv(csv_path)
    print(f"  Found {len(df)} records")
    
    success_count = 0
    error_count = 0
    
    for idx, row in df.iterrows():
        data = transform_row(row, mapping, mapping["table"])
        
        if mapping["key_column"]:
            # Upsert by key
            key_value = row.get(mapping["key_column"].replace("mpa_", ""))
            if pd.isna(key_value):
                key_value = data.get(mapping["key_column"])
            
            success, result = client.upsert_record(
                mapping["table"],
                mapping["key_column"],
                key_value,
                data
            )
        else:
            # Always insert (no key)
            success, result = client.create_record(mapping["table"], data)
        
        if success:
            success_count += 1
        else:
            error_count += 1
            if error_count <= 3:
                print(f"    ⚠ Row {idx+1} failed: {str(result)[:100]}")
        
        # Progress indicator
        if (idx + 1) % 50 == 0:
            print(f"    Processed {idx+1}/{len(df)} records...")
    
    return success_count, error_count


def main():
    print("\n" + "="*60)
    print("MPA v5.5 SEED DATA IMPORT")
    print("="*60)
    print(f"\nTarget: {CONFIG['dataverse_url']}")
    print(f"Seed Data: {CONFIG['seed_data_path']}\n")
    
    # Authenticate
    try:
        token = get_access_token()
    except Exception as e:
        print(f"✗ Authentication failed: {e}")
        sys.exit(1)
    
    # Create client
    client = DataverseClient(token)
    
    # Import each table
    total_success = 0
    total_errors = 0
    
    for csv_file, mapping in TABLE_MAPPINGS.items():
        print(f"\n→ Importing {csv_file} to {mapping['table']}...")
        
        success, errors = import_csv(client, csv_file, mapping)
        total_success += success
        total_errors += errors
        
        print(f"  ✓ {success} records imported, {errors} errors")
        
        # Rate limiting
        time.sleep(1)
    
    # Summary
    print("\n" + "="*60)
    print("IMPORT COMPLETE")
    print("="*60)
    print(f"Total records imported: {total_success}")
    print(f"Total errors: {total_errors}")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
