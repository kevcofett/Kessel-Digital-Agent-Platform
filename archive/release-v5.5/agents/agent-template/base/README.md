# Agent Template - Base Components

## Overview

This folder serves as a template for creating new agents on the platform. Copy this structure when developing a new agent and customize as needed.

## Status

**Version:** 5.5
**Status:** Template Ready

## Template Structure

```
/base/
├── /kb/               ← Knowledge base files (.txt)
│   ├── {AGENT}_Core_Instructions_v5_5.txt
│   └── {AGENT}_Domain_Knowledge_v5_5.txt
├── /copilot/          ← Copilot Studio instructions
│   └── {AGENT}_v55_Instructions.txt
├── /flows/            ← Power Automate flow definitions
│   ├── /definitions/
│   │   └── {agent}_initialize_session.json
│   └── /specs/
│       └── {agent}_initialize_session_spec.md
├── /functions/        ← Azure Functions
│   └── /{agent}_functions/
│       ├── __init__.py
│       ├── function_app.py
│       └── requirements.txt
├── /schema/           ← Dataverse table schemas
│   └── /tables/
│       └── {agent}_domain_table.json
├── /cards/            ← Adaptive Card templates
│   └── {agent}_action_card.json
├── /templates/        ← Document templates
│   └── {Agent}_Report_Template.docx
├── /data/             ← Seed data
│   └── /seed/
│       └── {agent}_seed_data.csv
└── /docs/             ← Agent-specific documentation
    ├── README.md
    └── {AGENT}_DEPLOYMENT.md
```

## Creating a New Agent

### Step 1: Copy Template

```bash
# Create new agent folder
cp -r release/v5.5/agents/agent-template release/v5.5/agents/{new-agent}

# Rename placeholder files
# Replace {AGENT} with your agent code (e.g., HR, FIN)
# Replace {agent} with lowercase version
```

### Step 2: Configure Agent Code

Choose a unique 2-5 character code:

| Code | Agent |
|------|-------|
| MPA | Media Planning Agent |
| CA | Consulting Agent |
| HR | Human Resources Agent |
| FIN | Finance Agent |

### Step 3: Create Required Components

1. **Knowledge Base Files**: Create .txt files following 6-Rule Compliance
2. **Copilot Instructions**: 8,000 character limit
3. **Dataverse Tables**: Use {agent}_ prefix
4. **Power Automate Flows**: Use {agent}_ prefix
5. **Azure Functions**: Create in /{agent}_functions/

### Step 4: Register Agent

Add to `eap_agentregistry`:

```json
{
  "eap_agentcode": "{AGENT}",
  "eap_agentname": "{Agent Full Name}",
  "eap_agentversion": "1.0",
  "eap_status": 4,
  "eap_kbsharepointlibrary": "{AgentName}KB",
  "eap_featureflagprefix": "{agent}_",
  "eap_tablesowned": "[]",
  "eap_requiredpermissions": "[\"{agent}_user\"]"
}
```

### Step 5: Create Feature Flags

Add agent-specific flags to `eap_featureflag`:

```json
{
  "eap_flagcode": "{agent}_enable_core_feature",
  "eap_flagname": "Enable {Agent} Core Feature",
  "eap_category": 2,
  "eap_agentcode": "{AGENT}",
  "eap_isenabled": true,
  "eap_fallbackmessage": "This feature is not available."
}
```

## Naming Conventions

| Component | Convention | Example |
|-----------|------------|---------|
| Tables | {agent}_{entity} | hr_employee |
| Flows | {agent}_{action}_{entity} | hr_create_request |
| Functions | {agent}_{operation} | hr_calculate_leave |
| KB Files | {AGENT}_{Topic}_v5_5.txt | HR_Policy_Guide_v5_5.txt |
| Cards | {agent}_{purpose}_card.json | hr_approval_card.json |

## Required Integrations

Every agent MUST integrate with:

1. **Session Management**: Call `eap_initialize_session` at start
2. **Feature Flags**: Check flags before optional features
3. **Audit Logging**: Log events when enabled

See [Interface Contracts](../../platform/eap-core/base/interfaces/) for details.

## Documentation Requirements

Every new agent must include:

- README.md in /base/ folder
- Deployment guide in /docs/
- KB files with proper 6-Rule Compliance
- Schema documentation for all tables
- Flow specifications for all flows

## Testing Requirements

Before deployment:

- [ ] Unit tests for all functions
- [ ] Integration tests with EAP Core
- [ ] Feature flag fallback tests
- [ ] KB indexed and searchable
- [ ] End-to-end conversation test

## Reference Implementation

See [MPA Base Components](../mpa/base/) for a complete reference implementation of an agent on this platform.
