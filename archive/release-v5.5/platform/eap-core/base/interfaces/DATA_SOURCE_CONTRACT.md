# Data Source Contract (Extension Interface)

## Overview

This contract defines how agents integrate with data sources beyond Dataverse. It enables the corporate environment to plug in internal data sources (SharePoint, Confluence) without modifying base agent code.

## Contract Version

Version: 1.0
Status: Extension Interface
Last Updated: January 2026

## Applicability

This interface is primarily used in corporate environments where:
- External web search is restricted
- Internal knowledge repositories must be leveraged
- Data sources are behind corporate firewall

Personal environments typically use direct integrations and may not need this abstraction.

## Data Source Registry

Data sources are registered in `eap_datasource` table (defined in /extensions/).

### Schema (Corporate Extension)

```json
{
  "tableName": "eap_datasource",
  "columns": [
    { "name": "eap_sourcecode", "type": "String", "maxLength": 50 },
    { "name": "eap_sourcename", "type": "String", "maxLength": 200 },
    { "name": "eap_sourcetype", "type": "Choice" },
    { "name": "eap_connectiontype", "type": "Choice" },
    { "name": "eap_baseurl", "type": "String", "maxLength": 500 },
    { "name": "eap_authmethod", "type": "Choice" },
    { "name": "eap_featureflag", "type": "String", "maxLength": 100 },
    { "name": "eap_status", "type": "Choice" },
    { "name": "eap_config", "type": "Memo" }
  ]
}
```

### Source Types

| Value | Label | Description |
|-------|-------|-------------|
| 1 | Internal | Corporate internal system |
| 2 | External | Public/external system |
| 3 | Hybrid | Requires both internal and external access |

### Connection Types

| Value | Label | Description |
|-------|-------|-------------|
| 1 | SharePoint Connector | Native Power Platform connector |
| 2 | Graph API | Microsoft Graph API |
| 3 | HTTP Connector | Generic HTTP (internal only in corporate) |
| 4 | Custom Connector | Custom Power Platform connector |

### Auth Methods

| Value | Label | Description |
|-------|-------|-------------|
| 1 | SSO | User's existing SSO credentials |
| 2 | Service Account | Dedicated service account |
| 3 | API Key | API key (stored in Key Vault) |
| 4 | Certificate | Certificate-based auth |

## Integration Pattern

### Discovery Flow

```
1. Agent needs to search for information
2. Agent calls eap_get_available_datasources flow
3. Flow returns list of enabled data sources for user's access level
4. Agent queries appropriate sources based on query type
5. Results aggregated and returned to user
```

### Query Interface

All data source adapters implement this interface:

```
INPUT:
- query: String (search query)
- max_results: Integer (default: 10)
- filters: JSON (source-specific filters)

OUTPUT:
- results: Array of {
    source_code: String,
    title: String,
    snippet: String,
    url: String,
    relevance_score: Number,
    metadata: JSON
  }
- total_count: Integer
- sources_searched: Array of String
```

### Example: Confluence Search (Corporate)

```
# Registered data source
{
  "eap_sourcecode": "CONFLUENCE",
  "eap_sourcename": "Mastercard Confluence",
  "eap_sourcetype": 1,
  "eap_connectiontype": 2,
  "eap_baseurl": "https://graph.microsoft.com/v1.0/sites/{site-id}",
  "eap_authmethod": 1,
  "eap_featureflag": "int_enable_confluence_search",
  "eap_status": 1,
  "eap_config": {
    "site_id": "{confluence-site-id}",
    "search_endpoint": "/search/query",
    "result_limit": 20
  }
}

# Usage in agent
IF check_feature_flag("int_enable_confluence_search"):
    confluence_results = search_datasource("CONFLUENCE", query)
    combined_results.append(confluence_results)
```

## Fallback Behavior

When no external data sources are available:

1. Agent uses internal knowledge base (KB files)
2. Agent queries Dataverse reference tables
3. Agent informs user of limited search scope
4. Agent suggests user provide additional context

## Feature Flag Integration

Each data source has an associated feature flag:

```
eap_featureflag field → Feature flag code to check

If flag is disabled:
- Data source is skipped in queries
- No error thrown
- Other sources still queried
```

## Security Considerations

### Corporate Environment

- All data sources must be internal or approved
- No data exfiltration to external services
- User can only query sources their access level permits
- All queries logged for audit

### Access Level Filtering

Data sources can be restricted by organizational level:

```json
{
  "eap_config": {
    "access_restriction": {
      "minimum_level": "department",
      "allowed_bus": ["Marketing", "Finance"],
      "denied_departments": ["HR-Confidential"]
    }
  }
}
```

## Adding New Data Sources (Corporate)

1. Create adapter flow in /extensions/data_sources/
2. Insert record in eap_datasource table
3. Create feature flag for the source
4. Test with restricted user accounts
5. Enable flag for appropriate users/groups

## Base vs Extension

| Component | Location | Notes |
|-----------|----------|-------|
| Query interface definition | /base/interfaces/ | This document |
| eap_datasource table | /extensions/ | Corporate only |
| Source adapters | /extensions/data_sources/ | Per-source |
| Aggregation flow | /extensions/flows/ | Corporate only |

The base platform does not include data source registry - it's a corporate extension. Personal environment uses direct integrations.
