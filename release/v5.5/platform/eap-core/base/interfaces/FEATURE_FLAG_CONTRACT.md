# Feature Flag Contract

## Overview

All optional functionality MUST be controlled via feature flags. This enables graceful degradation, environment-specific configuration, and safe rollouts.

## Contract Version

Version: 1.0
Status: Production
Last Updated: January 2026

## Core Principles

1. **Fail Safe**: If flag check fails, assume feature is DISABLED
2. **Graceful Degradation**: Disabled features return friendly messages, never errors
3. **Centralized Control**: All flags stored in eap_featureflag table
4. **Environment Agnostic**: Same code works in all environments via flags

## Flag Naming Convention

```
{scope}_{feature_name}

Scopes:
- eap_  → Platform-wide
- mpa_  → Media Planning Agent
- ca_   → Consulting Agent
- int_  → Integration
- sec_  → Security
- ui_   → User Interface
```

## Flag Categories

| Category | Value | Description |
|----------|-------|-------------|
| Platform | 1 | Core platform functionality |
| Agent | 2 | Agent-specific features |
| Integration | 3 | External service integrations |
| Security | 4 | Security controls |
| UI | 5 | User interface options |

## Required Flag Fields

| Field | Purpose |
|-------|---------|
| eap_flagcode | Unique identifier |
| eap_isenabled | Current state |
| eap_defaultvalue | Fallback if lookup fails |
| eap_category | Classification |
| eap_fallbackmessage | User-facing message when disabled |

## Integration Pattern

### Flow Integration (Power Automate)

```
1. Call eap_check_feature_flag flow
2. Input: flag_code
3. Output: is_enabled (boolean), fallback_message (string)
4. Branch based on is_enabled
```

### Pseudocode Pattern

```
FUNCTION check_and_execute(flag_code, enabled_action, disabled_action):
    
    TRY:
        flag_result = call_flow("eap_check_feature_flag", flag_code)
        
        IF flag_result.is_enabled THEN:
            RETURN enabled_action()
        ELSE:
            log_event("Feature disabled", flag_code)
            RETURN disabled_action(flag_result.fallback_message)
    
    CATCH error:
        # Fail safe - assume disabled
        log_error("Flag check failed", flag_code, error)
        RETURN disabled_action("This feature is currently unavailable.")

END FUNCTION
```

### Example: Web Search Feature

```
# Check flag
result = check_feature_flag("mpa_enable_web_search")

IF result.is_enabled:
    # Execute web search
    search_results = perform_web_search(query)
    RETURN format_results(search_results)
ELSE:
    # Graceful fallback
    RETURN result.fallback_message
    # "Web search is not available in this environment. 
    #  Using internal knowledge base instead."
```

## Graceful Degradation Requirements

When a feature is disabled, the agent MUST:

1. **NOT throw errors** - Handle gracefully
2. **Inform the user** - Display fallback_message
3. **Log the event** - For monitoring/debugging
4. **Continue workflow** - Don't block the conversation
5. **Offer alternatives** - When possible

## Default Values by Environment

| Environment | Default Stance | Rationale |
|-------------|---------------|-----------|
| Personal | Most ON | Development flexibility |
| Corporate | Most OFF | Security-first |

## Standard Platform Flags

| Flag Code | Default | Description |
|-----------|---------|-------------|
| eap_require_session_tracking | true | Require session for all interactions |
| eap_enable_audit_logging | false | Enhanced audit trail (corporate) |
| eap_enable_cross_agent_handoff | false | Allow agents to hand off to each other |

## Standard MPA Flags

| Flag Code | Default | Description |
|-----------|---------|-------------|
| mpa_enable_document_generation | true | Generate Word/PDF documents |
| mpa_enable_web_search | true | Search external web |
| mpa_enable_benchmark_lookup | true | Query benchmark database |
| mpa_enable_budget_optimization | true | Run budget optimization |
| mpa_enable_external_api | true | Call external APIs |

## Corporate-Specific Flags (Extensions)

These flags are defined in /extensions/ for corporate environments:

| Flag Code | Default | Description |
|-----------|---------|-------------|
| int_enable_confluence_search | false | Search Confluence |
| int_enable_sharepoint_search | true | Search SharePoint |
| sec_require_data_classification | true | Require data sensitivity tags |
| sec_enable_row_level_security | true | Enforce BU/dept access control |

## Flag Lifecycle

```
1. DEFINE: Add flag to eap_featureflag table
2. IMPLEMENT: Add flag check in agent code
3. TEST: Verify both enabled/disabled paths
4. DEPLOY: Set appropriate value per environment
5. MONITOR: Track usage and errors
6. RETIRE: Set deprecated, then remove after transition
```

## Error Handling Matrix

| Scenario | Action |
|----------|--------|
| Flag not found | Use default (false), log warning |
| Database unreachable | Use default (false), log error |
| Invalid flag code format | Return false, log error |
| Flag disabled | Return fallback message |
| Flag enabled | Execute feature |
