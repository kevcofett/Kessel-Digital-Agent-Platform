"""
Settings Module for MPA Deployment Scripts.

Loads configuration from environment.json and provides typed access.
"""

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional


@dataclass
class DataverseConfig:
    """Dataverse environment configuration."""
    environment_url: str
    api_url: str
    environment_id: str
    organization_id: str
    solution_name: str
    publisher_prefix: str


@dataclass
class SharePointConfig:
    """SharePoint configuration."""
    site_url: str
    kb_libraries: Dict[str, str]


@dataclass
class AuthConfig:
    """Authentication configuration."""
    tenant_id: str
    client_id: str
    authority: str
    scopes: list[str]


@dataclass
class AzureFunctionsConfig:
    """Azure Functions configuration."""
    base_url: str
    function_key: str
    endpoints: Dict[str, str]


class Settings:
    """
    Loads and provides typed access to environment configuration.

    Default location: release/v5.5/platform/config/environment.json
    """

    def __init__(self, env_file_path: Optional[Path] = None):
        """
        Initialize settings from environment.json.

        Args:
            env_file_path: Optional path to environment.json.
                          Defaults to ../platform/config/environment.json relative to scripts/
        """
        if env_file_path is None:
            # Default path relative to scripts directory
            scripts_dir = Path(__file__).parent.parent
            env_file_path = scripts_dir.parent / "platform" / "config" / "environment.json"

        if not env_file_path.exists():
            raise FileNotFoundError(f"Environment config not found: {env_file_path}")

        with open(env_file_path, "r") as f:
            self._config = json.load(f)

        self._env_file_path = env_file_path

    @property
    def dataverse(self) -> DataverseConfig:
        """Get Dataverse configuration."""
        dv = self._config["dataverse"]
        return DataverseConfig(
            environment_url=dv["environmentUrl"],
            api_url=dv["apiUrl"],
            environment_id=dv["environmentId"],
            organization_id=dv["organizationId"],
            solution_name=dv["solutionName"],
            publisher_prefix=dv["publisherPrefix"]
        )

    @property
    def sharepoint(self) -> SharePointConfig:
        """Get SharePoint configuration."""
        sp = self._config["sharepoint"]
        return SharePointConfig(
            site_url=sp["siteUrl"],
            kb_libraries=sp["kbLibraries"]
        )

    @property
    def auth(self) -> AuthConfig:
        """Get authentication configuration."""
        auth = self._config["authentication"]
        tenant = self._config["tenant"]
        return AuthConfig(
            tenant_id=tenant["tenantId"],
            client_id=auth["clientId"],
            authority=auth["authority"],
            scopes=auth["scopes"]
        )

    @property
    def azure_functions(self) -> AzureFunctionsConfig:
        """Get Azure Functions configuration."""
        af = self._config["azureFunctions"]
        return AzureFunctionsConfig(
            base_url=af["baseUrl"],
            function_key=af.get("functionKey", ""),
            endpoints=af["endpoints"]
        )

    @property
    def seed_data_path(self) -> Path:
        """Get path to seed data directory."""
        return self._env_file_path.parent.parent.parent / "agents" / "mpa" / "base" / "data" / "seed"

    @property
    def seed_data_v6_path(self) -> Path:
        """Get path to v6.0 seed data directory (reference data)."""
        return self._env_file_path.parent.parent.parent / "agents" / "mpa" / "base" / "seed-data-v6"

    @property
    def kb_path(self) -> Path:
        """Get path to KB files directory."""
        return self._env_file_path.parent.parent.parent / "agents" / "mpa" / "base" / "kb"

    @property
    def feature_flags_template_path(self) -> Path:
        """Get path to feature flags template."""
        return self._env_file_path.parent / "feature_flags.template.json"

    def get_raw(self, key: str, default=None):
        """Get raw config value by key."""
        return self._config.get(key, default)


# Table configuration for seed data import
TABLE_CONFIG = {
    "vertical": {
        "entity_set": "mpa_verticals",
        "primary_key": "mpa_verticalcode",
        "csv_file": "mpa_vertical_seed.csv",
        "column_mappings": {
            "mpa_verticalcode": "mpa_verticalcode",
            "mpa_newcolumn": "mpa_newcolumn",
            "mpa_description": "mpa_description",
            "mpa_isactive": "mpa_isactive"
        },
        "transforms": {
            "mpa_isactive": "boolean"
        }
    },
    "channel": {
        "entity_set": "mpa_channels",
        "primary_key": "mpa_channelcode",
        "csv_file": "mpa_channel_seed.csv",
        "column_mappings": {
            "mpa_channelcode": "mpa_channelcode",
            "mpa_newcolumn": "mpa_newcolumn",
            "mpa_category": "mpa_category",
            "mpa_minbudget": "mpa_minbudget",
            "mpa_cpmlow": "mpa_cpmlow",
            "mpa_cpmhigh": "mpa_cpmhigh",
            "mpa_cpclow": "mpa_cpclow",
            "mpa_cpchigh": "mpa_cpchigh",
            "mpa_funnelstage": "mpa_funnelstage",
            "mpa_platforms": "mpa_platforms",
            "mpa_confidencelevel": "mpa_confidence_level",
            "mpa_notes": "mpa_notes",
            "mpa_isactive": "mpa_isactive"
        },
        "transforms": {
            "mpa_isactive": "boolean",
            "mpa_minbudget": "float",
            "mpa_cpmlow": "float",
            "mpa_cpmhigh": "float",
            "mpa_cpclow": "float_nullable",
            "mpa_cpchigh": "float_nullable"
        }
    },
    "kpi": {
        "entity_set": "mpa_kpis",
        "primary_key": "mpa_kpicode",
        "csv_file": "mpa_kpi_seed.csv",
        "column_mappings": {
            "mpa_kpicode": "mpa_kpicode",
            "mpa_newcolumn": "mpa_newcolumn",
            "mpa_category": "mpa_category",
            "mpa_formula": "mpa_formula",
            "mpa_unit": "mpa_unit",
            "mpa_format": "mpa_format",
            "mpa_direction": "mpa_direction",
            "mpa_confidencelevel": "mpa_confidence_level",
            "mpa_notes": "mpa_notes",
            "mpa_isactive": "mpa_isactive"
        },
        "transforms": {
            "mpa_isactive": "boolean"
        }
    },
    "benchmark": {
        "entity_set": "mpa_benchmarks",
        "primary_key": ["mpa_verticalcode", "mpa_channelcode", "mpa_kpicode"],  # Composite
        "csv_file": "mpa_benchmark_seed.csv",
        "column_mappings": {
            "mpa_verticalcode": "mpa_verticalcode",
            "mpa_channelcode": "mpa_channelcode",
            "mpa_kpicode": "mpa_kpicode",
            "mpa_metricname": "mpa_metricname",
            "mpa_metriclow": "mpa_metriclow",
            "mpa_metricmedian": "mpa_metricmedian",
            "mpa_metrichigh": "mpa_metrichigh",
            "mpa_metricbest": "mpa_metricbest",
            "mpa_datasource": "mpa_datasource",
            "mpa_dataperiod": "mpa_dataperiod",
            "mpa_confidencelevel": "mpa_confidencelevel",
            "mpa_metricunit": "mpa_metricunit"
        },
        "transforms": {
            "mpa_metriclow": "float",
            "mpa_metricmedian": "float",
            "mpa_metrichigh": "float",
            "mpa_metricbest": "float"
        }
    }
}

# v6.0 Reference Data Table Configurations
TABLE_CONFIG_V6 = {
    "geography": {
        "entity_set": "mpa_geographies",
        "primary_key": "mpa_geoid",
        "csv_files": [
            "mpa_geography_us_seed.csv",
            "mpa_geography_ca_seed.csv",
            "mpa_geography_uk_seed.csv",
            "mpa_geography_mx_seed.csv",
            "mpa_geography_au_seed.csv",
            "mpa_geography_de_seed.csv",
            "mpa_geography_fr_seed.csv",
            "mpa_geography_cl_seed.csv",
            "mpa_geography_es_seed.csv",
            "mpa_geography_br_seed.csv"
        ],
        "column_mappings": {
            "mpa_geo_id": "mpa_geoid",
            "mpa_country": "mpa_country",
            "mpa_geo_type": "mpa_geotype",
            "mpa_geo_code": "mpa_geocode",
            "mpa_geo_name": "mpa_geoname",
            "mpa_geo_rank": "mpa_georank",
            "mpa_total_population": "mpa_totalpopulation",
            "mpa_total_households": "mpa_totalhouseholds",
            "mpa_median_age": "mpa_medianage",
            "mpa_median_hhi": "mpa_medianhhi",
            "mpa_pct_male": "mpa_pctmale",
            "mpa_pct_female": "mpa_pctfemale",
            "mpa_pct_age_0_17": "mpa_pctage0to17",
            "mpa_pct_age_18_34": "mpa_pctage18to34",
            "mpa_pct_age_25_54": "mpa_pctage25to54",
            "mpa_pct_age_55_plus": "mpa_pctage55plus",
            "mpa_pct_hhi_under_50k": "mpa_pcthhiunder50k",
            "mpa_pct_hhi_50k_100k": "mpa_pcthhi50kto100k",
            "mpa_pct_hhi_over_100k": "mpa_pcthhiover100k",
            "mpa_pct_hhi_over_150k": "mpa_pcthhiover150k",
            "mpa_pct_college_degree": "mpa_pctcollegedegree",
            "mpa_pct_graduate_degree": "mpa_pctgraduatedegree",
            "mpa_state_primary": "mpa_stateprimary",
            "mpa_states_included": "mpa_statesincluded",
            "mpa_data_source": "mpa_datasource",
            "mpa_data_year": "mpa_datayear"
        },
        "transforms": {
            "mpa_georank": "int_nullable",
            "mpa_totalpopulation": "int_nullable",
            "mpa_totalhouseholds": "int_nullable",
            "mpa_medianage": "float_nullable",
            "mpa_medianhhi": "float_nullable",
            "mpa_pctmale": "float_nullable",
            "mpa_pctfemale": "float_nullable",
            "mpa_pctage0to17": "float_nullable",
            "mpa_pctage18to34": "float_nullable",
            "mpa_pctage25to54": "float_nullable",
            "mpa_pctage55plus": "float_nullable",
            "mpa_pcthhiunder50k": "float_nullable",
            "mpa_pcthhi50kto100k": "float_nullable",
            "mpa_pcthhiover100k": "float_nullable",
            "mpa_pcthhiover150k": "float_nullable",
            "mpa_pctcollegedegree": "float_nullable",
            "mpa_pctgraduatedegree": "float_nullable",
            "mpa_datayear": "int"
        }
    },
    "iab_taxonomy": {
        "entity_set": "mpa_iab_taxonomies",
        "primary_key": "mpa_iabid",
        "csv_file": "mpa_iab_taxonomy_seed.csv",
        "column_mappings": {
            "mpa_iab_id": "mpa_iabid",
            "mpa_iab_code": "mpa_iabcode",
            "mpa_iab_tier": "mpa_iabtier",
            "mpa_iab_parent_code": "mpa_iabparentcode",
            "mpa_iab_name": "mpa_iabname",
            "mpa_iab_description": "mpa_iabdescription",
            "mpa_vertical_relevance": "mpa_verticalrelevance",
            "mpa_contextual_signal_strength": "mpa_contextualsignalstrength"
        },
        "transforms": {
            "mpa_iabtier": "int"
        }
    },
    "platform_taxonomy": {
        "entity_set": "mpa_platform_taxonomies",
        "primary_key": "mpa_segmentid",
        "csv_files": [
            "mpa_taxonomy_google_seed.csv",
            "mpa_taxonomy_meta_seed.csv",
            "mpa_taxonomy_linkedin_seed.csv"
        ],
        "column_mappings": {
            "mpa_segment_id": "mpa_segmentid",
            "mpa_platform": "mpa_platform",
            "mpa_taxonomy_type": "mpa_taxonomytype",
            "mpa_segment_path": "mpa_segmentpath",
            "mpa_segment_name": "mpa_segmentname",
            "mpa_parent_path": "mpa_parentpath",
            "mpa_tier": "mpa_tier",
            "mpa_vertical_relevance": "mpa_verticalrelevance",
            "mpa_reach_tier": "mpa_reachtier",
            "mpa_last_verified": "mpa_lastverified"
        },
        "transforms": {
            "mpa_tier": "int",
            "mpa_lastverified": "datetime_nullable"
        }
    },
    "behavioral_attribute": {
        "entity_set": "mpa_behavioral_attributes",
        "primary_key": "mpa_behaviorid",
        "csv_file": "mpa_behavioral_attributes_seed.csv",
        "column_mappings": {
            "mpa_behavior_id": "mpa_behaviorid",
            "mpa_behavior_category": "mpa_behaviorcategory",
            "mpa_behavior_name": "mpa_behaviorname",
            "mpa_behavior_description": "mpa_behaviordescription",
            "mpa_signal_type": "mpa_signaltype",
            "mpa_platforms_available": "mpa_platformsavailable",
            "mpa_vertical_relevance": "mpa_verticalrelevance",
            "mpa_intent_level": "mpa_intentlevel",
            "mpa_data_freshness": "mpa_datafreshness"
        },
        "transforms": {}
    },
    "contextual_attribute": {
        "entity_set": "mpa_contextual_attributes",
        "primary_key": "mpa_contextid",
        "csv_file": "mpa_contextual_attributes_seed.csv",
        "column_mappings": {
            "mpa_context_id": "mpa_contextid",
            "mpa_context_category": "mpa_contextcategory",
            "mpa_context_name": "mpa_contextname",
            "mpa_context_description": "mpa_contextdescription",
            "mpa_iab_mapping": "mpa_iabmapping",
            "mpa_signal_type": "mpa_signaltype",
            "mpa_brand_safety_tier": "mpa_brandsafetytier",
            "mpa_vertical_relevance": "mpa_verticalrelevance"
        },
        "transforms": {}
    }
}

# Feature flag category choice values
FEATURE_FLAG_CATEGORIES = {
    "Platform": 100000000,
    "Agent": 100000001,
    "Integration": 100000002,
    "Security": 100000003,
    "UI": 100000004
}


if __name__ == "__main__":
    # Test settings loading
    print("Settings Test")
    print("-" * 40)

    try:
        settings = Settings()
        print(f"Dataverse URL: {settings.dataverse.environment_url}")
        print(f"API URL: {settings.dataverse.api_url}")
        print(f"Tenant ID: {settings.auth.tenant_id}")
        print(f"Client ID: {settings.auth.client_id}")
        print(f"SharePoint Site: {settings.sharepoint.site_url}")
        print(f"KB Library (MPA): {settings.sharepoint.kb_libraries.get('mpa')}")
        print(f"Seed Data Path: {settings.seed_data_path}")
        print(f"KB Path: {settings.kb_path}")
    except Exception as e:
        print(f"Error: {e}")
