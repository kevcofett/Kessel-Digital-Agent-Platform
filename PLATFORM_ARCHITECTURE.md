# Platform Architecture

## Overview

The Kessel-Digital-Agent-Platform follows a layered architecture designed for:
- Multi-environment deployment (personal, corporate)
- Agent extensibility without code changes
- Secure data partitioning
- Graceful feature degradation

## Core Principles

### 1. Lean Orchestration + Rich Knowledge
- Agent instructions stay minimal (under 8,000 characters)
- Intelligence lives in Knowledge Base documents
- Flows handle data operations, not business logic

### 2. Registry-Based Extensibility
- New agents register via data, not code
- Data sources pluggable via configuration
- Feature flags control capability availability

### 3. Environment Parity
- Same structure across personal and corporate
- Only configuration differs
- Extensions add to base, never override

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    COPILOT STUDIO                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   MPA   │  │   CA    │  │ Future  │  │ Future  │        │
│  │  Agent  │  │  Agent  │  │ Agent   │  │ Agent   │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        └────────────┴─────┬──────┴────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    EAP CORE                                  │
│  ┌──────────────┐  ┌─────┴─────┐  ┌──────────────┐          │
│  │   Session    │  │  Feature  │  │    Agent     │          │
│  │  Management  │  │   Flags   │  │   Registry   │          │
│  └──────────────┘  └───────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────┐          │
│  │    User      │  │   Data    │  │    Audit     │          │
│  │   Context    │  │  Sources  │  │     Log      │          │
│  └──────────────┘  └───────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    DATAVERSE                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   EAP   │  │   MPA   │  │   CA    │  │ Future  │        │
│  │ Tables  │  │ Tables  │  │ Tables  │  │ Tables  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    SHAREPOINT                                │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ MediaPlanningKB │  │  ConsultingKB   │                   │
│  │   (MPA Docs)    │  │   (CA Docs)     │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Base vs Extensions Pattern

### Purpose
Enable environment-specific customization while maintaining a shared core.

### Rules

| Rule | Description |
|------|-------------|
| Base is Shared | `/base/` folders are identical across branches |
| Extensions are Isolated | `/extensions/` folders stay in their branch |
| Augment, Not Override | Extensions add capabilities, never modify base |
| Interface Contracts | Extensions must implement defined interfaces |

### Directory Pattern

```
/component/
├── /base/              # Shared - cherry-pick between branches
│   ├── /schema/
│   ├── /flows/
│   └── /interfaces/
└── /extensions/        # Branch-specific - never merge to main
    └── .gitkeep        # Empty in main branch
```

### Cherry-Pick Workflow

**Promoting base improvements:**
```bash
# On corporate branch - improve base component
git commit -m "EAP: Add session timeout configuration"

# On main branch - accept the improvement
git cherry-pick <commit-hash>

# On personal branch - receive via merge
git merge main
```

**Extensions stay isolated:**
```bash
# On corporate branch - add extension
git commit -m "EAP-CORP: Add Confluence connector"
# This commit stays in corporate branch only
```


## EAP Core Components

### Session Management
Every agent interaction starts with an EAP session:
- Creates or resumes session record
- Resolves user identity
- Loads feature flags
- Establishes data access scope

### Agent Registry
Agents register without code changes:

```json
{
  "agent_code": "MPA",
  "agent_name": "Media Planning Agent",
  "agent_version": "5.5",
  "status": "active",
  "kb_library": "MediaPlanningKB",
  "feature_flag_prefix": "mpa_",
  "tables_owned": ["mpa_mediaplan", "mpa_plansection"]
}
```

### Feature Flags
Runtime capability control with graceful degradation:

```json
{
  "flag_code": "mpa_enable_web_search",
  "flag_name": "Enable Web Search",
  "default_value": true,
  "scope": "agent",
  "fallback_behavior": "Use KB benchmarks only"
}
```

### Data Sources (Extension Point)
Pluggable data source connectors:

```json
{
  "source_code": "SHAREPOINT_KB",
  "source_type": "internal",
  "connection_type": "sharepoint_connector",
  "auth_method": "sso",
  "status": "active"
}
```

## Access Control Framework

### Hierarchy Model (Corporate Extension)

```
Business Unit
└── Department
    └── Team
        └── Pod
            └── Employee
```

### Data Visibility Rules
Users see records where:
1. They own the record, OR
2. Their pod matches the record's pod, OR
3. Their team matches (if pod not set), OR
4. Their department matches (if team not set), OR
5. Their BU matches (if department not set), OR
6. Record is marked "organization-wide"

### Implementation
- Dataverse row-level security
- `eap_user_assignment` table maps users to hierarchy
- Flows check permissions before returning data

## Feature Flag Categories

### Platform Flags (eap_)
| Flag | Default | Purpose |
|------|---------|---------|
| eap_enable_audit_logging | true | Compliance audit trail |
| eap_enable_external_apis | true | External API calls |
| eap_enable_web_search | true | Web search capability |
| eap_enable_document_export | true | Document generation |

### MPA Flags (mpa_)
| Flag | Default | Purpose |
|------|---------|---------|
| mpa_enable_benchmark_search | true | Benchmark database access |
| mpa_enable_projections | true | Budget projection calculations |
| mpa_enable_gap_detection | true | Gap analysis features |
| mpa_enable_document_generation | true | Word/PDF output |

### Graceful Degradation Pattern
```
IF feature_flag_enabled("mpa_enable_web_search"):
    result = search_web(query)
ELSE:
    result = search_kb_benchmarks(query)
    notify_user("Using internal benchmarks - web search disabled")
```

## Deployment Environments

### Personal (Aragorn AI)
- Full feature set enabled
- Single-user access
- Development and testing

### Corporate (Mastercard)
- Restricted external APIs
- Row-level security enabled
- Teams channel deployment
- Enhanced audit logging
- Confluence/SharePoint data sources

## File Naming Conventions

| Component | Pattern | Example |
|-----------|---------|---------|
| KB Files | `{Name}_v5_5.txt` | `Analytics_Engine_v5_5.txt` |
| Flows | `{agent}_{action}.json` | `mpa_create_plan.json` |
| Tables | `{agent}_{entity}` | `mpa_mediaplan` |
| Feature Flags | `{agent}_{capability}` | `mpa_enable_projections` |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 5.5 | January 2026 | Initial platform release |
