"""
Dataverse Table Names Configuration
Aragorn AI Deployment

Maps logical table names to actual Dataverse Entity Set Names (plural form).
Tables use eap_ prefix for platform-wide tables and mpa_ prefix for MPA-specific tables.

IMPORTANT: Dataverse API requires Entity Set Names (plural form), not Schema Names (singular).
- Schema Name (singular): Used in relationships, column prefixes (e.g., mpa_mediaplan)
- Entity Set Name (plural): Used in API calls, Power Automate (e.g., mpa_mediaplans)

Usage:
    from shared.table_config import TABLES

    # In your code:
    table_name = TABLES["benchmark"]  # Returns "mpa_benchmarks"
"""

# Dataverse Entity Set Names (plural form - used for all API calls)
TABLES = {
    # EAP Core Tables
    "client": "eap_clients",
    "user": "eap_users",
    "agent": "eap_agents",
    "session": "eap_sessions",
    "featureflag": "eap_featureflags",
    "audit": "eap_audits",
    "learning": "eap_learnings",
    "project": "eap_projects",
    "document": "eap_documents",

    # MPA Domain Tables
    "vertical": "mpa_verticals",
    "channel": "mpa_channels",
    "kpi": "mpa_kpis",
    "benchmark": "mpa_benchmarks",
    "mediaplan": "mpa_mediaplans",
    "plandata": "mpa_plandatas",
    "planversion": "mpa_planversions",
    "audience": "mpa_audiences",
    "planchannel": "mpa_planchannels",
    "channelallocation": "mpa_channelallocations",
    "adpartner": "mpa_adpartners",
    "planpartner": "mpa_planpartners",
    "campaignperformance": "mpa_campaignperformances",
    "dataimportlog": "mpa_dataimportlogs",
    "postmortemreport": "mpa_postmortemreports",
    "planlearning": "mpa_planlearnings",
    "formtemplate": "mpa_formtemplates",
    "errorlog": "mpa_errorlogs",
    "gapanalysis": "mpa_gapanalyses",
    "validationgate": "mpa_validationgates",
}

# Legacy name mappings (for backward compatibility during transition)
# These map old "new_" prefixed names to the correct Entity Set Names
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

# Singular to plural mapping for backwards compatibility
# Maps singular schema names to plural Entity Set Names
SINGULAR_TO_PLURAL = {
    # EAP tables
    "eap_client": "eap_clients",
    "eap_user": "eap_users",
    "eap_agent": "eap_agents",
    "eap_session": "eap_sessions",
    "eap_featureflag": "eap_featureflags",
    "eap_audit": "eap_audits",
    "eap_learning": "eap_learnings",
    "eap_project": "eap_projects",
    "eap_document": "eap_documents",
    # MPA tables
    "mpa_vertical": "mpa_verticals",
    "mpa_channel": "mpa_channels",
    "mpa_kpi": "mpa_kpis",
    "mpa_benchmark": "mpa_benchmarks",
    "mpa_mediaplan": "mpa_mediaplans",
    "mpa_plandata": "mpa_plandatas",
    "mpa_planversion": "mpa_planversions",
    "mpa_audience": "mpa_audiences",
    "mpa_planchannel": "mpa_planchannels",
    "mpa_channelallocation": "mpa_channelallocations",
    "mpa_adpartner": "mpa_adpartners",
    "mpa_planpartner": "mpa_planpartners",
    "mpa_campaignperformance": "mpa_campaignperformances",
    "mpa_dataimportlog": "mpa_dataimportlogs",
    "mpa_postmortemreport": "mpa_postmortemreports",
    "mpa_planlearning": "mpa_planlearnings",
    "mpa_formtemplate": "mpa_formtemplates",
    "mpa_errorlog": "mpa_errorlogs",
    "mpa_gapanalysis": "mpa_gapanalyses",
    "mpa_validationgate": "mpa_validationgates",
}


def get_table_name(logical_name: str) -> str:
    """
    Get Dataverse Entity Set Name (plural form) from any table name format.

    Supports:
    - Short names: "benchmark" -> "mpa_benchmarks"
    - Singular schema names: "mpa_benchmark" -> "mpa_benchmarks"
    - Legacy names: "new_advertisingbenchmark" -> "mpa_benchmarks"
    - Already plural: "mpa_benchmarks" -> "mpa_benchmarks" (passthrough)

    Args:
        logical_name: Any supported table name format

    Returns:
        Dataverse Entity Set Name (plural form for API calls)
    """
    # Try short name first
    if logical_name in TABLES:
        return TABLES[logical_name]

    # Try singular to plural mapping
    if logical_name in SINGULAR_TO_PLURAL:
        return SINGULAR_TO_PLURAL[logical_name]

    # Try legacy name
    if logical_name in LEGACY_TO_NEW:
        return LEGACY_TO_NEW[logical_name]

    # If already plural (ends with 's' and is a known entity set name), return as-is
    if logical_name in TABLES.values():
        return logical_name

    # Return as-is if not found (might already be correct)
    return logical_name
