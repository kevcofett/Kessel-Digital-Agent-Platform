# MCMAP Databricks Configuration Reference v7.0

## Document Information

| Field | Value |
| ----- | ----- |
| Version | 7.0 |
| Status | Preparation Complete - Pending Integration |
| Author | Kevin Bauer |
| Date | January 31, 2026 |
| Classification | Internal |

---

## Overview

This document defines all configuration parameters required for MCMAP Databricks integration. These settings control connectivity, feature flags, and export behavior.

---

## Environment Variables

### Required for Connection

| Variable | Type | Description | Example |
| -------- | ---- | ----------- | ------- |
| DATABRICKS_HOST | String | Databricks workspace URL | `https://adb-xxxx.azuredatabricks.net` |
| DATABRICKS_HTTP_PATH | String | SQL warehouse HTTP path | `/sql/1.0/warehouses/xxxx` |
| DATABRICKS_CATALOG | String | Unity Catalog name | `mcmap` |
| DATABRICKS_SCHEMA | String | Default schema | `v7` |

### Authentication

| Variable | Type | Description | Notes |
| -------- | ---- | ----------- | ----- |
| DATABRICKS_TOKEN | String (Secret) | Personal Access Token or OAuth token | Store in Azure Key Vault |
| DATABRICKS_CLIENT_ID | String | Service Principal client ID | For OAuth authentication |
| DATABRICKS_CLIENT_SECRET | String (Secret) | Service Principal secret | Store in Azure Key Vault |
| DATABRICKS_AUTH_TYPE | String | Authentication method | `PAT`, `OAUTH`, `MANAGED_IDENTITY` |

### Optional Performance Settings

| Variable | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| DATABRICKS_WAREHOUSE_ID | String | (auto) | SQL warehouse ID for queries |
| DATABRICKS_CONNECTION_TIMEOUT | Integer | 30 | Connection timeout in seconds |
| DATABRICKS_QUERY_TIMEOUT | Integer | 300 | Query timeout in seconds |
| DATABRICKS_MAX_ROWS | Integer | 100000 | Maximum rows per query |
| DATABRICKS_RETRY_ATTEMPTS | Integer | 3 | Number of retry attempts |
| DATABRICKS_RETRY_DELAY_MS | Integer | 1000 | Delay between retries |

---

## Feature Flags

### Dataverse Configuration Table

Add the following entry to the `eap_environment_config` table in Dataverse:

```json
{
  "config_key": "databricks_settings",
  "config_value": {
    "enabled": false,
    "export": {
      "telemetry": {
        "enabled": false,
        "schedule": "0 2 * * *",
        "batch_size": 10000,
        "retention_days": 365
      },
      "sessions": {
        "enabled": false,
        "schedule": "0 3 * * *",
        "batch_size": 5000,
        "retention_days": 180
      },
      "audit": {
        "enabled": false,
        "schedule": "0 4 * * *",
        "batch_size": 50000,
        "retention_days": 2555
      },
      "documents": {
        "enabled": false,
        "trigger": "on_generate",
        "retention_days": 730
      },
      "uploads": {
        "enabled": false,
        "trigger": "on_upload",
        "retention_days": 365
      }
    },
    "query": {
      "enabled": false,
      "cache_ttl_seconds": 300,
      "max_concurrent_queries": 10
    },
    "streaming": {
      "enabled": false,
      "checkpoint_location": "abfss://mcmap@storage.dfs.core.windows.net/checkpoints"
    }
  },
  "created_at": "2026-01-31T00:00:00Z",
  "updated_at": "2026-01-31T00:00:00Z"
}
```

### Feature Flag Descriptions

| Flag | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `enabled` | Boolean | false | Master switch for all Databricks features |
| `export.telemetry.enabled` | Boolean | false | Enable telemetry export to Databricks |
| `export.telemetry.schedule` | Cron | `0 2 * * *` | Daily at 2 AM UTC |
| `export.telemetry.batch_size` | Integer | 10000 | Records per batch |
| `export.sessions.enabled` | Boolean | false | Enable session snapshot export |
| `export.audit.enabled` | Boolean | false | Enable audit event export |
| `export.documents.enabled` | Boolean | false | Enable document metadata export |
| `export.documents.trigger` | String | `on_generate` | When to export (`on_generate`, `scheduled`) |
| `export.uploads.enabled` | Boolean | false | Enable user upload metadata export |
| `query.enabled` | Boolean | false | Enable querying Databricks from agents |
| `query.cache_ttl_seconds` | Integer | 300 | Query result cache duration |
| `streaming.enabled` | Boolean | false | Enable real-time streaming export |

---

## Power Automate Connection References

### Required Connections

When deploying Power Automate flows for Databricks export, create these connection references:

| Connection Name | Connector | Purpose |
| --------------- | --------- | ------- |
| `mcmap_databricks` | Azure Databricks | Execute SQL queries and commands |
| `mcmap_keyvault` | Azure Key Vault | Retrieve secrets (tokens, credentials) |
| `mcmap_dataverse` | Microsoft Dataverse | Read source data |
| `mcmap_adls` | Azure Data Lake Storage | Write staging data |

### Connection Configuration

**Azure Databricks Connector:**
```
Authentication Type: Azure AD Service Principal
Tenant ID: (Mastercard tenant)
Client ID: (from DATABRICKS_CLIENT_ID)
Client Secret: (from Azure Key Vault)
Workspace URL: (from DATABRICKS_HOST)
```

**Azure Data Lake Storage Connector:**
```
Authentication Type: Azure AD Service Principal
Account Name: mcmapexport
Container: databricks-staging
```

---

## Azure Key Vault Secrets

Store sensitive configuration in Azure Key Vault:

| Secret Name | Description |
| ----------- | ----------- |
| `databricks-token` | Databricks PAT or OAuth token |
| `databricks-client-secret` | Service Principal client secret |
| `adls-connection-string` | ADLS connection string |

### Key Vault Access Policy

Grant the following permissions to MCMAP service principals:

| Principal | Permissions |
| --------- | ----------- |
| MCMAP Power Automate | GET secrets |
| MCMAP Copilot Service | GET secrets |
| DTA Agent Service | GET secrets |

---

## Agent-Specific Configuration

### DTA Agent Settings

When the DTA agent is activated, configure these settings:

```json
{
  "agent_code": "DTA",
  "databricks": {
    "default_warehouse": "mcmap-analytics",
    "default_catalog": "mcmap",
    "default_schema": "analytics",
    "query_templates": {
      "agent_performance": "SELECT * FROM mcmap.analytics.agent_performance_daily WHERE date >= :start_date",
      "session_funnel": "SELECT * FROM mcmap.analytics.session_funnel_metrics WHERE date >= :start_date",
      "usage_summary": "SELECT * FROM mcmap.v7.usage_metrics WHERE period_start >= :start_date"
    },
    "max_query_cost_units": 1000,
    "timeout_seconds": 60
  }
}
```

### External Agent Write Access

Configure write access for external agents (MMM, MMO, MEI, TAL):

```json
{
  "external_agent_access": {
    "MMM": {
      "can_write": true,
      "target_tables": ["mcmap.v7.mmm_results"],
      "service_principal": "mmm-agent-sp"
    },
    "MMO": {
      "can_write": true,
      "target_tables": ["mcmap.v7.mmo_results"],
      "service_principal": "mmo-agent-sp"
    },
    "MEI": {
      "can_write": true,
      "target_tables": ["mcmap.v7.mei_indicators"],
      "service_principal": "mei-agent-sp"
    },
    "TAL": {
      "can_write": true,
      "target_tables": ["mcmap.v7.tal_experiments"],
      "service_principal": "tal-agent-sp"
    }
  }
}
```

---

## Export Scheduling

### Batch Export Schedule

| Export Type | Schedule (UTC) | Duration Estimate |
| ----------- | -------------- | ----------------- |
| Telemetry | 02:00 daily | 30-60 minutes |
| Sessions | 03:00 daily | 15-30 minutes |
| Audit | 04:00 daily | 45-90 minutes |
| Usage Metrics | 00:00 1st of month | 10-20 minutes |

### Streaming Configuration (Future)

When streaming is enabled:

```json
{
  "streaming": {
    "enabled": true,
    "telemetry": {
      "event_hub_namespace": "mcmap-events",
      "event_hub_name": "telemetry",
      "consumer_group": "databricks",
      "checkpoint_interval_seconds": 60
    },
    "delta_live_tables": {
      "pipeline_name": "mcmap-streaming",
      "target_schema": "v7",
      "continuous": true,
      "development": false
    }
  }
}
```

---

## Monitoring and Alerting

### Metrics to Monitor

| Metric | Threshold | Alert Action |
| ------ | --------- | ------------ |
| Export job failure rate | > 10% | Email Platform Admin |
| Export latency | > 2x baseline | Warning notification |
| Query timeout rate | > 5% | Investigate warehouse |
| Storage growth rate | > 20% monthly | Capacity planning |

### Log Analytics Integration

Export Databricks logs to Azure Log Analytics:

```json
{
  "diagnostics": {
    "log_analytics_workspace_id": "(workspace-id)",
    "logs": [
      "dbfs",
      "clusters",
      "accounts",
      "jobs",
      "sql"
    ],
    "retention_days": 90
  }
}
```

---

## Validation Checklist

Before enabling Databricks integration, validate:

- [ ] Environment variables set in Azure App Configuration
- [ ] Secrets stored in Azure Key Vault
- [ ] Dataverse configuration entry created
- [ ] Power Automate connections configured
- [ ] Service principals provisioned with correct permissions
- [ ] Unity Catalog structure created
- [ ] Delta Lake tables created from schema files
- [ ] Test export job runs successfully
- [ ] Test query returns expected results
- [ ] Monitoring dashboards configured

---

## Contact

Kevin Bauer (kevin.bauer@mastercard.com) - All inquiries

---

## Version History

| Version | Date | Changes |
| ------- | ---- | ------- |
| 7.0 | Jan 31, 2026 | Initial configuration reference |
