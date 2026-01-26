# Enterprise AI Platform (EAP) Core

Shared platform infrastructure providing common tables, knowledge base, and services for all agents.

## Version

- **Platform Version:** 5.5
- **Last Updated:** January 2026

## Directory Structure

```
eap-core/
├── base/                          # Core platform components
│   ├── kb/                        # Shared knowledge base (8 files)
│   ├── schema/
│   │   └── tables/                # Base Dataverse tables (48)
│   └── seed_data/                 # Reference data (28 JSON + 1 CSV)
└── extensions/
    └── corporate/                 # Corporate-specific extensions
        ├── schema/
        │   └── tables/            # Corporate tables (66)
        └── seed_data/             # Corporate seed data (2 CSV)
```

## Components

### Knowledge Base (8 files)

| File | Purpose |
|------|---------|
| BEHAVIORAL_Service_Availability_v1.txt | Service degradation patterns |
| BENCHMARK_Industry_KPIs_v1.txt | Industry benchmark data |
| FRAMEWORK_Library_v1.txt | Shared framework definitions |
| INDUSTRY_Vertical_Expertise_v1.txt | Vertical-specific insights |
| REFERENCE_Research_Routing_v1.txt | Information routing guide |
| REGISTRY_Available_Integrations_v1.txt | Integration registry |
| TOOLS_Consulting_Methods_v1.txt | Consulting methodology |
| KB_INDEX.txt | File index |

### Base Tables (48)

Core platform tables used by all agents:

**Session Management**
- eap_sessions, eap_session_context, eap_session_handoffs

**Output Management**
- eap_outputs, eap_output_versions, eap_output_feedback

**User & Organization**
- eap_users, eap_user_preferences, eap_roles, eap_role_permissions

**Configuration**
- eap_config_values, eap_config_definitions, eap_feature_flags

**Learning & Feedback**
- eap_learning_resources, eap_learning_feedback, eap_feedback_items

**Integration**
- eap_integrations, eap_api_registry, eap_external_connections

### Corporate Extension Tables (66)

Organization-specific tables for enterprise deployments:

**Governance**
- eap_governance_levels, eap_approval_workflows, eap_audit_logs

**Organizational**
- eap_divisions, eap_business_units, eap_cost_centers, eap_clients

**Advanced Features**
- eap_template_registry, eap_scheduled_tasks, eap_notification_queue

### Seed Data

**Base Seed Data (28 JSON files)**
- Reference data for roles, permissions, industries, frameworks
- System configuration and feature flags
- Agent and integration registrations

**Corporate Seed Data (2 CSV files)**
- api_registry.csv - API endpoint definitions
- Additional corporate-specific reference data

## Architecture

### Base vs Extensions

**Base (All Environments)**
- Core tables required for platform operation
- Shared knowledge base files
- Essential seed data

**Extensions (Cherry-Picked)**
- Corporate governance tables
- Client-specific configurations
- Organization hierarchy tables

### Multi-Tenant Support

The platform supports multiple deployment patterns:
1. **Personal** - Single-user development environment
2. **Corporate** - Enterprise deployment with full governance
3. **Client-Specific** - Customer-branded deployments

## Deployment

### Prerequisites

1. Microsoft Dataverse environment
2. Power Platform premium connectors
3. Azure Active Directory integration
4. SharePoint for KB storage

### Deployment Order

1. Deploy base tables first (eap_* prefix)
2. Run base seed data scripts
3. Deploy extension tables as needed
4. Run extension seed data scripts

## KB File Format (6-Rule Compliance)

All KB files follow the 6-Rule format:
1. Plain text only (no markdown tables)
2. UTF-8 encoding
3. Section headers in CAPS
4. One concept per line
5. No code blocks
6. Under 50KB per file

## Migration Notes

Migrated from: `/Enterprise_AI_Platform/`
Migration date: January 2026
- Base tables: 48 from core schema
- Corporate tables: 66 from corporate extension
- KB files: 7 converted to 6-Rule format + index
