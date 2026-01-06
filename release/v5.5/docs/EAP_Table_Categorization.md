# EAP TABLE CATEGORIZATION ANALYSIS

**Date:** 2026-01-06
**Source:** /Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform/specs/dataverse/
**Total Files:** 124

---

## CATEGORY 1: CA TABLES (Move to /agents/ca/)

These 11 tables belong to the Consulting Agent, NOT EAP core:

| Table | Destination |
|-------|-------------|
| ca_analyses.json | /agents/ca/base/schema/tables/ |
| ca_benchmark_applications.json | /agents/ca/base/schema/tables/ |
| ca_benchmarks.json | /agents/ca/base/schema/tables/ |
| ca_consulting_sessions.json | /agents/ca/base/schema/tables/ |
| ca_deliverables.json | /agents/ca/base/schema/tables/ |
| ca_framework_applications.json | /agents/ca/base/schema/tables/ |
| ca_frameworks.json | /agents/ca/base/schema/tables/ |
| ca_handoffs.json | /agents/ca/base/schema/tables/ |
| ca_recommendations.json | /agents/ca/base/schema/tables/ |

**Note:** ca_benchmark_applications and ca_framework_applications are junction tables.

---

## CATEGORY 2: META/DOCUMENTATION FILES (Do Not Migrate as Tables)

| File | Action |
|------|--------|
| EAP_Dataverse_Schema.json | Move to /docs/ as reference |
| EAP_MPA_Migration_Mapping.json | Move to /docs/ as reference |
| migration_report_20251230_061053.json | Archive or delete |

---

## CATEGORY 3: EAP BASE TABLES (Core Platform - All Environments)

These tables are fundamental platform infrastructure needed everywhere:

### Session & Conversation (8 tables)
| Table | Purpose |
|-------|---------|
| eap_session.json | Core session tracking |
| eap_exchanges.json | Conversation exchanges |
| eap_session_snapshots.json | Session state snapshots |
| eap_conversation_threads.json | Thread management |
| eap_message_reactions.json | User reactions |
| eap_comments.json | Comments on outputs |
| eap_recent_items.json | Recent activity |
| eap_favorites.json | User favorites |

### User Management (5 tables)
| Table | Purpose |
|-------|---------|
| eap_user.json | Core user records |
| eap_user_preferences.json | User preferences |
| eap_user_notifications.json | Notifications |
| eap_user_familiarity.json | User expertise tracking |
| eap_user_learning_progress.json | Learning progress |

### Client & Engagement (4 tables)
| Table | Purpose |
|-------|---------|
| eap_client.json | Client records |
| eap_client_associations.json | Client relationships |
| eap_engagements.json | Engagement tracking |
| eap_projects.json | Project context |

### Agent & Features (4 tables)
| Table | Purpose |
|-------|---------|
| eap_agent.json | Agent registry |
| eap_agent_features.json | Feature definitions |
| eap_agent_feature_assignments.json | Feature-agent mapping |
| eap_agent_user_access.json | User-agent access |

### Knowledge & Content (5 tables)
| Table | Purpose |
|-------|---------|
| eap_kb_registry.json | KB file registry |
| eap_content_sources.json | Content sources |
| eap_learning_resources.json | Learning capture |
| eap_prompt_templates.json | Prompt templates |
| eap_response_templates.json | Response templates |

### Output Management (4 tables)
| Table | Purpose |
|-------|---------|
| eap_outputs.json | Generated outputs |
| eap_output_types.json | Output type definitions |
| eap_output_versions.json | Output versioning |
| eap_output_stakes.json | Stakeholders |

### Core Operations (8 tables)
| Table | Purpose |
|-------|---------|
| eap_feature_flags.json | Feature toggles |
| eap_feedback.json | User feedback |
| eap_audit_logs.json | Audit trail |
| eap_config_definitions.json | Config definitions |
| eap_system_settings.json | System settings |
| eap_environment_config.json | Environment config |
| eap_environment_variables.json | Environment vars |
| eap_proactive_triggers.json | Proactive behavior |

### Reference Data (8 tables)
| Table | Purpose |
|-------|---------|
| eap_industries.json | Industry codes |
| eap_countries.json | Country codes |
| eap_regions.json | Region codes |
| eap_markets.json | Market definitions |
| eap_tags.json | Tagging system |
| eap_domains.json | Domain taxonomy |
| eap_practices.json | Practice areas |
| eap_frameworks.json | Framework definitions |

**BASE TOTAL: ~46 tables**

---

## CATEGORY 4: EAP EXTENSION TABLES (Corporate/Enterprise Features)

These tables support corporate deployments like Mastercard:

### Admin & RBAC (9 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_admin_roles.json | Admin role definitions | Corporate |
| eap_admin_permissions.json | Permission definitions | Corporate |
| eap_admin_role_permissions.json | Role-permission mapping | Corporate |
| eap_roles.json | User roles | Corporate |
| eap_role_levels.json | Role hierarchy | Corporate |
| eap_role_titles.json | Role titles | Corporate |
| eap_user_roles.json | User-role assignments | Corporate |
| eap_user_admin_assignments.json | Admin assignments | Corporate |
| eap_permission_scopes.json | Permission scopes | Corporate |

### Organization Hierarchy (6 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_tenants.json | Multi-tenant support | Corporate |
| eap_business_units.json | Business units | Corporate |
| eap_divisions.json | Divisions | Corporate |
| eap_product_units.json | Product units | Corporate |
| eap_user_business_units.json | User-BU mapping | Corporate |
| eap_user_product_units.json | User-PU mapping | Corporate |

### Approval Workflows (5 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_approval_statuses.json | Approval status codes | Corporate |
| eap_approval_requests.json | Approval requests | Corporate |
| eap_approval_actions.json | Approval actions | Corporate |
| eap_approval_rules.json | Approval rules | Corporate |
| eap_approval_delegations.json | Delegation rules | Corporate |

### Governance & Compliance (6 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_governance_levels.json | Governance levels | Corporate |
| eap_governance_policies.json | Governance policies | Corporate |
| eap_data_classifications.json | Data classification | Corporate |
| eap_retention_policies.json | Retention rules | Corporate |
| eap_policy_violations.json | Violation tracking | Corporate |
| eap_entity_classifications.json | Entity classification | Corporate |

### Security (4 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_sso_configurations.json | SSO config | Corporate |
| eap_ip_allowlists.json | IP restrictions | Corporate |
| eap_api_keys.json | API key management | Corporate |
| eap_login_history.json | Login audit | Corporate |

### Integrations (6 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_webhooks.json | Webhook config | Corporate |
| eap_webhook_logs.json | Webhook logs | Corporate |
| eap_salesforce_sync.json | Salesforce integration | Corporate |
| eap_confluence_connections.json | Confluence integration | Corporate |
| eap_integration_health.json | Integration monitoring | Corporate |
| eap_deadletterqueue.json | Failed message queue | Corporate |

### Advanced Features (12 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_collaboration_spaces.json | Collaboration | Corporate |
| eap_space_members.json | Space membership | Corporate |
| eap_shared_artifacts.json | Artifact sharing | Corporate |
| eap_dashboards.json | Custom dashboards | Corporate |
| eap_report_definitions.json | Report definitions | Corporate |
| eap_report_executions.json | Report runs | Corporate |
| eap_saved_searches.json | Saved searches | Corporate |
| eap_scheduled_tasks.json | Task scheduling | Corporate |
| eap_task_executions.json | Task runs | Corporate |
| eap_announcements.json | System announcements | Corporate |
| eap_email_templates.json | Email templates | Corporate |
| eap_brand_profiles.json | Brand customization | Corporate |

### Model & Quality (5 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_model_configurations.json | Model config | Corporate |
| eap_quality_scores.json | Quality metrics | Corporate |
| eap_rate_limits.json | Rate limiting | Corporate |
| eap_usage_tracking.json | Usage metrics | Corporate |
| eap_usage_budgets.json | Budget tracking | Corporate |

### Scoped Customization (5 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_scoped_instructions.json | Custom instructions | Corporate |
| eap_scoped_prompts.json | Custom prompts | Corporate |
| eap_scoped_context_rules.json | Context rules | Corporate |
| eap_preference_definitions.json | Preference defs | Corporate |
| eap_template_registry.json | Template registry | Corporate |

### Entity Taxonomy (3 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_entity_domains.json | Entity-domain mapping | Corporate |
| eap_entity_practices.json | Entity-practice mapping | Corporate |
| eap_entity_tags.json | Entity tagging | Corporate |

### Operations (3 tables)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_incident_logs.json | Incident tracking | Corporate |
| eap_migration_history.json | Migration audit | Corporate |
| eap_notification_queue.json | Notification queue | Corporate |

### Platform Features (1 table)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_platform_features.json | Platform features | Corporate |

### Activity Tracking (1 table)
| Table | Purpose | Extension Type |
|-------|---------|----------------|
| eap_activity_types.json | Activity types | Corporate |

**EXTENSION TOTAL: ~66 tables**

---

## SUMMARY

| Category | Count | Destination |
|----------|-------|-------------|
| CA Tables | 9 | /agents/ca/base/schema/tables/ |
| Meta Files | 3 | /docs/ or archive |
| EAP Base | ~46 | /platform/eap-core/base/schema/tables/ |
| EAP Extensions | ~66 | /platform/eap-core/extensions/corporate/schema/tables/ |
| **TOTAL** | **124** | |

---

## RECOMMENDATION

1. **BASE tables** go to `/platform/eap-core/base/` - needed in ALL environments
2. **EXTENSION tables** go to `/platform/eap-core/extensions/corporate/` - cherry-picked for Mastercard
3. **CA tables** go to `/agents/ca/base/` - CA-owned domain tables
4. Use `corporate` instead of `mastercard` for extension folder name (more reusable)

This enables the cherry-pick pattern:
- Personal deployment: BASE only
- Mastercard deployment: BASE + selected EXTENSIONS
