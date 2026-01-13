"""
Dataverse Table Names Configuration
Aragorn AI Deployment

Maps logical table names to actual Dataverse schema names.
Tables use eap_ prefix for platform-wide tables and mpa_ prefix for MPA-specific tables.

Usage:
    from shared.table_config import TABLES

    # In your code:
    table_name = TABLES["benchmark"]  # Returns "mpa_benchmark"
"""

# Actual Dataverse schema names (as created in Aragorn AI environment)
TABLES = {
    # EAP Core Tables
    "client": "eap_client",
    "user": "eap_user",
    "agent": "eap_agent",
    "session": "eap_session",
    "featureflag": "eap_featureflag",

    # MPA Domain Tables
    "vertical": "mpa_vertical",
    "channel": "mpa_channel",
    "kpi": "mpa_kpi",
    "benchmark": "mpa_benchmark",
    "mediaplan": "mpa_mediaplan",
    "plandata": "mpa_plandata",
}

# Legacy name mappings (for backward compatibility during transition)
# These map old "new_" prefixed names to the correct schema names
LEGACY_TO_NEW = {
    "new_advertisingbenchmark": TABLES["benchmark"],
    "new_advertisingchannel": TABLES["channel"],
    "new_keyperformanceindicator": TABLES["kpi"],
    "new_businessvertical": TABLES["vertical"],
    "new_featureflag": TABLES["featureflag"],
    "new_mediaplan": TABLES["mediaplan"],
    "new_marketingdatarecord": TABLES["plandata"],
    "new_session": TABLES["session"],
    "new_client": TABLES["client"],
    "new_useraccount": TABLES["user"],
    "new_agent": TABLES["agent"],
}

def get_table_name(logical_name: str) -> str:
    """
    Get actual Dataverse table name from logical name.
    Supports both new short names and legacy eap_/mpa_ prefixed names.
    
    Args:
        logical_name: Either short name ("benchmark") or legacy ("mpa_benchmark")
    
    Returns:
        Actual Dataverse schema name (e.g., "mpa_benchmark")
    """
    # Try short name first
    if logical_name in TABLES:
        return TABLES[logical_name]
    
    # Try legacy name
    if logical_name in LEGACY_TO_NEW:
        return LEGACY_TO_NEW[logical_name]
    
    # Return as-is if not found (might already be correct)
    return logical_name
