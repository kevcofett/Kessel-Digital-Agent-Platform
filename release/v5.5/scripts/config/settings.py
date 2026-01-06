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
            "mpa_newcolumn": "mpa_name",
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
            "mpa_newcolumn": "mpa_name",
            "mpa_category": "mpa_category",
            "mpa_minbudget": "mpa_minbudget",
            "mpa_cpmlow": "mpa_cpmlow",
            "mpa_cpmhigh": "mpa_cpmhigh",
            "mpa_cpclow": "mpa_cpclow",
            "mpa_cpchigh": "mpa_cpchigh",
            "mpa_funnelstage": "mpa_funnelstage",
            "mpa_platforms": "mpa_platforms",
            "mpa_confidencelevel": "mpa_confidencelevel",
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
            "mpa_newcolumn": "mpa_name",
            "mpa_category": "mpa_category",
            "mpa_formula": "mpa_formula",
            "mpa_unit": "mpa_unit",
            "mpa_format": "mpa_format",
            "mpa_direction": "mpa_direction",
            "mpa_confidence_level": "mpa_confidencelevel",
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
            "mpa_verticalcode": "_lookup_vertical",
            "mpa_channelcode": "_lookup_channel",
            "mpa_kpicode": "_lookup_kpi",
            "mpa_metricname": "mpa_name",
            "mpa_metriclow": "mpa_metriclow",
            "mpa_metricmedian": "mpa_metricmedian",
            "mpa_metrichigh": "mpa_metrichigh",
            "mpa_metricbest": "mpa_metricbest",
            "mpa_datasource": "mpa_datasource",
            "mpa_dataperiod": "mpa_dataperiod",
            "mpa_confidencelevel": "mpa_confidencelevel",
            "mpa_metricunit": "mpa_metricunit",
            "mpa_isactive": "mpa_isactive"
        },
        "transforms": {
            "mpa_isactive": "boolean",
            "mpa_metriclow": "float",
            "mpa_metricmedian": "float",
            "mpa_metrichigh": "float",
            "mpa_metricbest": "float"
        },
        "lookups": {
            "_lookup_vertical": {
                "target_entity": "mpa_verticals",
                "source_field": "mpa_verticalcode",
                "bind_field": "mpa_vertical"
            },
            "_lookup_channel": {
                "target_entity": "mpa_channels",
                "source_field": "mpa_channelcode",
                "bind_field": "mpa_channel"
            },
            "_lookup_kpi": {
                "target_entity": "mpa_kpis",
                "source_field": "mpa_kpicode",
                "bind_field": "mpa_kpi"
            }
        }
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
