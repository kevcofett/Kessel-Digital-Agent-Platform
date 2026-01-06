"""
Dataverse Table Names Configuration
Aragorn AI Deployment

Maps logical table names to actual Dataverse schema names.
Dataverse used default publisher prefix "new_" during CSV import.

Usage:
    from shared.table_config import TABLES
    
    # In your code:
    table_name = TABLES["benchmark"]  # Returns "new_advertisingbenchmark"
"""

# Actual Dataverse schema names (as created in Aragorn AI environment)
TABLES = {
    # EAP Core Tables
    "client": "new_client",
    "user": "new_useraccount",
    "agent": "new_agent",
    "session": "new_session",
    
    # MPA Domain Tables
    "vertical": "new_businessvertical",
    "channel": "new_advertisingchannel",
    "kpi": "new_keyperformanceindicator",
    "featureflag": "new_featureflag",
    "benchmark": "new_advertisingbenchmark",
    "mediaplan": "new_mediaplan",
    "plandata": "new_marketingdatarecord",
}

# Legacy name mappings (for backward compatibility during transition)
LEGACY_TO_NEW = {
    "mpa_benchmark": TABLES["benchmark"],
    "mpa_channel": TABLES["channel"],
    "mpa_kpi": TABLES["kpi"],
    "mpa_vertical": TABLES["vertical"],
    "mpa_featureflag": TABLES["featureflag"],
    "mpa_mediaplan": TABLES["mediaplan"],
    "mpa_plandata": TABLES["plandata"],
    "eap_session": TABLES["session"],
    "eap_client": TABLES["client"],
    "eap_user": TABLES["user"],
    "eap_agent": TABLES["agent"],
}

def get_table_name(logical_name: str) -> str:
    """
    Get actual Dataverse table name from logical name.
    Supports both new short names and legacy eap_/mpa_ prefixed names.
    
    Args:
        logical_name: Either short name ("benchmark") or legacy ("mpa_benchmark")
    
    Returns:
        Actual Dataverse schema name (e.g., "new_advertisingbenchmark")
    """
    # Try short name first
    if logical_name in TABLES:
        return TABLES[logical_name]
    
    # Try legacy name
    if logical_name in LEGACY_TO_NEW:
        return LEGACY_TO_NEW[logical_name]
    
    # Return as-is if not found (might already be correct)
    return logical_name
