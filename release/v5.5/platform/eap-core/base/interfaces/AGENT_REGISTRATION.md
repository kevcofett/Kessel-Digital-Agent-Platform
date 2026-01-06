# Agent Registration Interface

## Overview

All agents deployed on the platform MUST be registered in the eap_agentregistry table. This enables centralized management, discovery, and coordination.

## Contract Version

Version: 1.0
Status: Production
Last Updated: January 2026

## Registration Requirements

### Required Fields

| Field | Example | Description |
|-------|---------|-------------|
| eap_agentcode | MPA | Short unique identifier |
| eap_agentname | Media Planning Agent | Full display name |
| eap_agentversion | 5.5 | Semantic version |
| eap_status | Active | Deployment status |

### Recommended Fields

| Field | Example | Description |
|-------|---------|-------------|
| eap_copilotagentid | {GUID} | Copilot Studio agent ID |
| eap_kbsharepointlibrary | MediaPlanningKB | SharePoint library name |
| eap_featureflagprefix | mpa_ | Prefix for agent flags |
| eap_tablesowned | ["mpa_mediaplan", ...] | JSON array of owned tables |
| eap_requiredpermissions | ["mpa_user", "mpa_admin"] | Required security roles |

## Registration Process

### 1. New Agent Deployment

```
1. Define agent code (must be unique, 3-10 chars, uppercase)
2. Create Dataverse tables with agent prefix
3. Deploy flows with agent prefix
4. Upload KB to SharePoint library
5. Configure Copilot Studio agent
6. Insert record into eap_agentregistry
7. Create feature flags with agent prefix
```

### 2. Agent Update

```
1. Update agent components (tables, flows, KB, etc.)
2. Update eap_agentversion in registry
3. Update eap_tablesowned if tables added/removed
4. Update feature flags as needed
```

### 3. Agent Deprecation

```
1. Set eap_status = Deprecated
2. Existing sessions continue to work
3. New sessions blocked (optional via feature flag)
4. After retention period, set eap_status = Inactive
```

## Agent Code Convention

```
Format: 2-5 uppercase letters
Examples: MPA, CA, EAP, HR, FIN

Reserved codes:
- EAP (Enterprise AI Platform - system)
- SYS (System utilities)
- ADM (Administration)
```

## Table Ownership

Each agent owns tables prefixed with its code:

```
mpa_ → Media Planning Agent
ca_  → Consulting Agent
eap_ → Platform (shared)
```

Agents MUST NOT modify tables owned by other agents.

## Feature Flag Naming

Agent-specific flags use agent prefix:

```
{agent_code}_{feature_name}

Examples:
- mpa_enable_document_generation
- mpa_enable_web_search
- ca_enable_external_research
```

## Discovery Pattern

Other agents can discover registered agents:

```
Query: eap_agentregistry WHERE eap_status = Active
```

Use cases:
- Cross-agent handoffs
- Capability discovery
- Administrative dashboards

## Extensibility Points

Agents can extend via:

1. **Custom Tables**: Add tables with agent prefix
2. **Feature Flags**: Add flags with agent prefix
3. **KB Documents**: Add documents to agent's SharePoint library
4. **Azure Functions**: Deploy functions in agent's function app

## Validation Rules

| Rule | Enforcement |
|------|-------------|
| Agent code unique | Dataverse alternate key |
| Agent code format | Flow validation on insert |
| Tables owned valid | Advisory (logged warning) |
| Required permissions exist | Advisory (logged warning) |

## Template Record

```json
{
  "eap_agentcode": "{AGENT_CODE}",
  "eap_agentname": "{Agent Full Name}",
  "eap_agentversion": "1.0",
  "eap_status": 4,
  "eap_copilotagentid": null,
  "eap_kbsharepointlibrary": "{AgentName}KB",
  "eap_featureflagprefix": "{agent_code}_",
  "eap_tablesowned": "[]",
  "eap_requiredpermissions": "[\"{agent_code}_user\"]",
  "eap_description": "{Agent description}",
  "eap_deployedon": null
}
```

Note: Initial status is Development (4). Change to Active (1) after deployment complete.
