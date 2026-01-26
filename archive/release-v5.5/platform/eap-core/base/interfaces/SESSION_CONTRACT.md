# Session Contract Interface

## Overview

All agents on the platform MUST integrate with the EAP session management system. This contract defines the required interactions for session lifecycle management.

## Contract Version

Version: 1.0
Status: Production
Last Updated: January 2026

## Session Lifecycle

```
1. INITIALIZE → Create session record
2. UPDATE → Track progress and state changes
3. COMPLETE → Mark session finished
4. ABANDON → Mark session abandoned (timeout or user exit)
```

## Required Integrations

### 1. Session Initialization

Agents MUST call `eap_initialize_session` flow at conversation start.

**Input Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agent_code | String | Yes | Agent identifier (MPA, CA, etc.) |
| user_principal_name | String | Yes | UPN from System.User.PrincipalName |
| session_type | String | No | Agent-specific session type |
| client_id | GUID | No | If client context known |
| context_json | String | No | Initial context data |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| session_id | GUID | New session record ID |
| session_code | String | Human-readable code |
| user_id | GUID | Resolved/created user ID |
| is_new_user | Boolean | True if user was just created |

### 2. Session Update

Agents SHOULD update session on significant state changes.

**Trigger Conditions:**
- User completes a workflow step
- Agent receives new context
- Error occurs

**Update Fields:**

- modifiedon (always - auto-updated)
- eap_sessiondata (if context changed)
- eap_status (if changed)

### 3. Session Completion

Agents MUST mark session complete when workflow finishes.

**Set Fields:**

- eap_status = 200000002 (Completed)
- eap_endedat = Current timestamp
- eap_sessiondata = Final state JSON

### 4. Session Abandonment

System marks session abandoned after timeout (default: 30 minutes).

**Handled By:** Platform scheduled flow (not agent responsibility)

## Session Code Format

```
{AGENT_CODE}-{YYYYMMDD}-{SEQUENCE}

Example: MPA-20260105-001
```

- Sequence resets daily per agent
- Guaranteed unique within platform

## Context JSON Structure

Agents define their own context schema. Recommended pattern:

```json
{
  "agent_version": "5.5",
  "current_step": "objectives",
  "completed_steps": ["client_context"],
  "agent_specific_data": {
    // Agent defines this structure
  }
}
```

## Error Handling

If session initialization fails:
1. Log error with correlation ID
2. Attempt retry (max 3 attempts)
3. If still failing, inform user and continue in degraded mode
4. Agent MAY operate without session tracking if feature flag allows

## Feature Flag

```
eap_require_session_tracking (default: true)
```

If false, agents may skip session initialization. NOT recommended for production.

## Compliance Requirements

- All session data subject to data retention policies
- Session context may contain PII - handle according to privacy requirements
- Corporate environments may require enhanced audit logging (see extensions)
