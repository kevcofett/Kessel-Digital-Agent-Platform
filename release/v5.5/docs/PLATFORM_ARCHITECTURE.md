# Platform Architecture

## Overview

The Kessel-Digital Agent Platform is a unified architecture for deploying AI-powered business agents on Microsoft Power Platform, Copilot Studio, and Azure.

## Version

Version: 5.5
Release Date: January 2026

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER CHANNELS                                  │
│                    (Web / Teams / Mobile)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         COPILOT STUDIO                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  Media Planning │  │   Consulting    │  │  Future Agents  │         │
│  │     Agent       │  │     Agent       │  │      (...)      │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
└───────────┼─────────────────────┼─────────────────────┼─────────────────┘
            │                     │                     │
            └──────────────┬──────┴──────────────┬──────┘
                           │                     │
                           ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE AI PLATFORM (EAP)                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SESSION MANAGEMENT                            │   │
│  │         (eap_session, eap_user, eap_client)                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     FEATURE FLAGS                                │   │
│  │              (eap_featureflag, graceful degradation)            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AGENT REGISTRY                                │   │
│  │                   (eap_agentregistry)                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Dataverse  │  │  SharePoint  │  │    Azure     │                  │
│  │   (Tables)   │  │     (KB)     │  │  Functions   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
/release/v5.5/
│
├── /platform/                              # Shared Infrastructure
│   │
│   ├── /config/                            # Configuration Templates
│   │   ├── environment.template.json       # Environment-specific settings
│   │   └── feature_flags.template.json     # Feature flag catalog
│   │
│   ├── /eap-core/                          # Enterprise AI Platform
│   │   ├── /base/                          # Shared across environments
│   │   │   ├── /schema/tables/             # EAP table definitions
│   │   │   ├── /flows/                     # Shared flows
│   │   │   └── /interfaces/                # Contract definitions
│   │   └── /extensions/                    # Environment-specific additions
│   │
│   └── /security/                          # Access Control Framework
│       ├── /base/                          # Core security patterns
│       └── /extensions/                    # Corporate hierarchy
│
├── /agents/                                # Individual Agents
│   │
│   ├── /mpa/                               # Media Planning Agent
│   │   ├── /base/                          # Core MPA components
│   │   │   ├── /kb/                        # 22 knowledge base files
│   │   │   ├── /copilot/                   # Agent instructions
│   │   │   ├── /flows/                     # MPA flows
│   │   │   ├── /functions/                 # Azure Functions
│   │   │   ├── /schema/                    # MPA tables
│   │   │   ├── /cards/                     # Adaptive cards
│   │   │   ├── /templates/                 # Document templates
│   │   │   ├── /data/seed/                 # Seed data CSVs
│   │   │   └── /docs/                      # MPA documentation
│   │   └── /extensions/                    # Environment-specific MPA
│   │
│   ├── /ca/                                # Consulting Agent (placeholder)
│   │   ├── /base/
│   │   └── /extensions/
│   │
│   └── /agent-template/                    # Template for new agents
│       ├── /base/
│       └── /extensions/
│
└── /docs/                                  # Platform Documentation
```

## Key Design Patterns

### 1. Base/Extensions Pattern

- **/base/** contains components shared across ALL environments
- **/extensions/** contains environment-specific additions
- Extensions augment but never override base components
- Changes to /base/ can be cherry-picked between branches

### 2. Feature Flag Driven

- All optional features controlled via flags
- Graceful degradation when features disabled
- Environment-specific defaults (Personal: permissive, Corporate: restrictive)

### 3. Contract-Based Integration

- Agents integrate with EAP through defined interfaces
- Session Contract, Agent Registration, Feature Flag Contract, Data Source Contract
- Enables loose coupling and independent evolution

### 4. Configuration Over Code

- Environment differences expressed through JSON configuration
- Same codebase deploys to multiple environments
- No environment-specific code branches

## Technology Stack

| Layer | Technology |
|-------|------------|
| User Interface | Copilot Studio, Teams, Web |
| Agent Runtime | Copilot Studio |
| Orchestration | Power Automate |
| Data Storage | Dataverse |
| Knowledge Base | SharePoint |
| Compute | Azure Functions |
| Authentication | Entra ID (Azure AD) |
| Monitoring | Application Insights |

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| main | Canonical source of truth |
| deploy/personal | Personal environment (Kessel-Digital) |
| deploy/corporate | Corporate environment (Mastercard) |

## Agents

### Media Planning Agent (MPA)

- **Version:** 5.5
- **Status:** Production Ready
- **Purpose:** AI-powered media campaign planning and optimization
- **Components:** 22 KB files, 11 flows, 8 Azure Functions

### Consulting Agent (CA)

- **Version:** 5.5
- **Status:** Placeholder
- **Purpose:** Strategic consulting and advisory services
- **Components:** TBD

## Security Model

### Personal Environment
- Simple role-based access
- Platform User / Platform Admin
- Agent-specific roles (mpa_user, mpa_admin)

### Corporate Environment
- Hierarchy-based row-level security
- Business Unit → Department → Team → Pod → Employee
- Enhanced audit logging
- Data classification requirements

## Getting Started

1. Clone repository
2. Choose branch (deploy/personal or deploy/corporate)
3. Copy environment.template.json to environment.json
4. Fill in environment-specific values
5. Follow DEPLOYMENT_GUIDE.md

## Related Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Release Notes](RELEASE_NOTES.md)
- [Branching Guide](BRANCHING_AND_EXTENSION_GUIDE.md)
- [Migration Plan](../../docs/PLATFORM_MIGRATION_PLAN.md)
