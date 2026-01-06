# Feature Flags Integration Guide

## Overview

The MPA Feature Flags system allows controlled rollout of new features, A/B testing, and quick feature toggles without code deployment.

**Version:** 5.2
**Last Updated:** December 30, 2025
**Status:** Requires Manual Integration

---

## Contents

1. [Architecture](#architecture)
2. [Dataverse Table Setup](#dataverse-table-setup)
3. [Azure Function Deployment](#azure-function-deployment)
4. [Seeding Default Flags](#seeding-default-flags)
5. [Copilot Studio Integration](#copilot-studio-integration)
6. [Power Automate Integration](#power-automate-integration)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

---

## Architecture

### Components

```
+------------------+      +----------------------+      +------------------+
|  Copilot Studio  | ---> | CheckFeatureEnabled  | ---> |    Dataverse     |
|     Topics       |      |   Azure Function     |      | mpa_featureflag  |
+------------------+      +----------------------+      +------------------+
         |                         |
         v                         v
+------------------+      +----------------------+
|  Power Automate  |      |   In-Memory Cache    |
|      Flows       |      |    (5 min TTL)       |
+------------------+      +----------------------+
```

### Feature Flag Evaluation Order

1. Check master switch (`mpa_isenabled`)
2. Check date range (`mpa_startdate`, `mpa_enddate`)
3. Check user allowlist (`mpa_allowedusers`)
4. Check client allowlist (`mpa_allowedclients`)
5. Evaluate rollout percentage (`mpa_rolloutpercentage`)

---

## Dataverse Table Setup

### Manual Steps Required

1. Navigate to Power Apps Maker Portal
2. Select the Aragorn AI environment
3. Create a new table with these settings:

| Setting | Value |
|---------|-------|
| Display Name | MPA Feature Flag |
| Plural Name | MPA Feature Flags |
| Logical Name | mpa_featureflag |
| Primary Column | mpa_name |
| Ownership | Organization |

### Column Definitions

Create the following columns:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| mpa_name | Text (100) | Yes | Unique flag identifier |
| mpa_description | Multiline Text | No | Human-readable description |
| mpa_isenabled | Yes/No | Yes | Master on/off switch |
| mpa_rolloutpercentage | Whole Number | Yes | 0-100 rollout percentage |
| mpa_allowedusers | Multiline Text | No | Comma-separated user IDs |
| mpa_allowedclients | Multiline Text | No | Comma-separated client IDs |
| mpa_startdate | Date and Time | No | Activation date |
| mpa_enddate | Date and Time | No | Expiration date |
| mpa_category | Choice | No | Flag category |
| mpa_priority | Choice | No | Priority level |
| mpa_notes | Multiline Text | No | Additional notes |

### Choice Values for mpa_category

| Value | Label |
|-------|-------|
| 100000000 | Core |
| 100000001 | Optimization |
| 100000002 | Research |
| 100000003 | UX |
| 100000004 | Transparency |
| 100000005 | Output |
| 100000006 | Performance |
| 100000007 | Analytics |

### Choice Values for mpa_priority

| Value | Label |
|-------|-------|
| 100000000 | High |
| 100000001 | Medium |
| 100000002 | Low |

### Reference Schema

See `schema/mpa_featureflags_table.json` for complete schema definition.

---

## Azure Function Deployment

### Deploy CheckFeatureEnabled Function

1. The function code is in `azure_functions/mpa_functions/CheckFeatureEnabled/`
2. Deploy using Azure Functions Core Tools or CI/CD:

```bash
cd azure_functions/mpa_functions
func azure functionapp publish func-mpa-dev
```

### Function Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/features/{flag_name}` | GET | Check single flag |
| `/api/features` | GET | List all flags |
| `/api/features/check` | POST | Batch check flags |

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `user_id` | User ID for user-level targeting |
| `client_id` | Client ID for client-level targeting |

### Response Format

```json
{
  "flag_name": "gap_detection_v2",
  "enabled": true,
  "reason": "Full rollout (100%)",
  "exists": true,
  "description": "Enable enhanced gap detection with 6-options framework",
  "rollout_percentage": 100,
  "timestamp": "2025-12-30T10:00:00.000Z",
  "from_cache": false
}
```

---

## Seeding Default Flags

### Prerequisites

- Azure CLI installed and authenticated (`az login`)
- PowerShell 7+ installed
- Access to target Dataverse environment

### Run the Seed Script

```powershell
cd MediaPlanningAgent_v5.1/scripts

.\seed_feature_flags.ps1 `
  -EnvironmentUrl "https://aragornai.crm.dynamics.com"
```

### Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-EnvironmentUrl` | (required) | Dataverse environment URL |
| `-ConfigPath` | ../config/default_feature_flags.json | Path to config file |
| `-SkipExisting` | $true | Skip flags that already exist |

### Update Existing Flags

To update existing flags with new defaults:

```powershell
.\seed_feature_flags.ps1 `
  -EnvironmentUrl "https://aragornai.crm.dynamics.com" `
  -SkipExisting $false
```

---

## Copilot Studio Integration

### Add Feature Flag Check Topic

Create a new topic or modify the main orchestration topic:

**Trigger Phrases:** (internal use only - no user triggers)

**Actions:**

1. Set variable `flagName` to the feature you want to check
2. Call HTTP action to CheckFeatureEnabled function
3. Parse response and branch based on `enabled` value

### Example Topic Flow

```
[Start]
    |
    v
[Set flagName = "gap_detection_v2"]
    |
    v
[HTTP Request to /api/features/{flagName}?user_id={userId}]
    |
    v
[Parse JSON Response]
    |
    v
[Condition: response.enabled == true]
   / \
  Y   N
  |   |
  v   v
[Execute Feature] [Use Fallback]
```

### Power Fx Expression

```
If(
    ParseJSON(httpResponse).enabled = true,
    // Feature enabled path
    Set(featureEnabled, true),
    // Feature disabled path
    Set(featureEnabled, false)
)
```

---

## Power Automate Integration

### Call Feature Flag from Flow

1. Add HTTP action
2. Configure as follows:

| Setting | Value |
|---------|-------|
| Method | GET |
| URI | `https://func-mpa-dev.azurewebsites.net/api/features/{flagName}` |
| Headers | `x-functions-key: {function_key}` |
| Queries | `user_id: @{triggerBody()?['userId']}` |

### Parse Response

Add "Parse JSON" action with schema:

```json
{
  "type": "object",
  "properties": {
    "flag_name": {"type": "string"},
    "enabled": {"type": "boolean"},
    "reason": {"type": "string"}
  }
}
```

### Conditional Logic

```
@equals(body('Parse_JSON')?['enabled'], true)
```

---

## Usage Examples

### Check Before Gap Detection

```python
from shared import get_cache
from shared.cached_data_access import check_feature_flag

# Check if gap detection v2 is enabled
flag_result = check_feature_flag("gap_detection_v2", {
    "user_id": user_id,
    "client_id": client_id
})

if flag_result["enabled"]:
    # Use new 6-options framework
    result = gap_detection_v2(plan_data)
else:
    # Use legacy gap detection
    result = gap_detection_legacy(plan_data)
```

### Batch Check Multiple Flags

```python
import requests

response = requests.post(
    "https://func-mpa-dev.azurewebsites.net/api/features/check",
    json={"flags": ["gap_detection_v2", "spo_integration", "web_search"]},
    params={"user_id": user_id},
    headers={"x-functions-key": function_key}
)

flags = response.json()["flags"]

if flags["gap_detection_v2"]["enabled"]:
    # Gap detection v2 enabled
    pass
```

### Gradual Rollout

To gradually roll out a feature:

1. Set `mpa_isenabled` = true
2. Set `mpa_rolloutpercentage` = 10 (10% of users)
3. Monitor for issues
4. Increase percentage: 10 -> 25 -> 50 -> 75 -> 100

The rollout is deterministic based on user/client ID hashing.

---

## Best Practices

### Naming Conventions

- Use lowercase with underscores: `feature_name_version`
- Include version for major changes: `gap_detection_v2`
- Be descriptive but concise

### Testing Feature Flags

1. Add test users to `mpa_allowedusers` for early testing
2. Use 0% rollout initially
3. Test thoroughly before increasing percentage
4. Have a rollback plan (set `mpa_isenabled` = false)

### Cleanup Old Flags

- Mark expired flags as disabled
- Add end dates to temporary flags
- Periodically review and remove obsolete flags
- Document why flags were added and when they can be removed

### Performance

- Flags are cached for 5 minutes
- Use batch check for multiple flags
- Avoid checking flags in tight loops
- Cache results at application level if needed

### Security

- Don't expose user/client lists in responses
- Use function-level authentication
- Audit flag changes via Dataverse audit log
- Limit who can modify production flags

---

## Related Files

| File | Purpose |
|------|---------|
| `azure_functions/mpa_functions/CheckFeatureEnabled/` | Azure Function code |
| `config/default_feature_flags.json` | Default flag definitions |
| `schema/mpa_featureflags_table.json` | Dataverse table schema |
| `scripts/seed_feature_flags.ps1` | Seeding script |

---

## Troubleshooting

### Flag Not Found

- Verify flag name matches exactly (case-sensitive)
- Check if flag was seeded to Dataverse
- Verify function has access to Dataverse

### Unexpected Enabled/Disabled

- Check master switch (`mpa_isenabled`)
- Verify date range is current
- Check if user/client is in allowlist
- Verify rollout percentage

### Cache Issues

- Flags are cached for 5 minutes
- Changes won't appear immediately
- Clear cache by restarting function app if urgent
