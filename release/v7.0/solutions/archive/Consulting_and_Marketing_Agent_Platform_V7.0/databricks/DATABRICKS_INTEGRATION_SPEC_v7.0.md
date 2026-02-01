# MCMAP Databricks Integration Specification v7.0

## Document Information

| Field | Value |
| ----- | ----- |
| Version | 7.0 |
| Status | Preparation Complete - Pending Integration |
| Author | Kevin Bauer |
| Date | January 31, 2026 |
| Classification | Internal |

---

## Executive Summary

This specification defines the technical requirements and architecture for integrating MCMAP (Mastercard Media Advertising Platform) with Databricks for enterprise-scale data storage, analytics, and reporting. The integration enables:

- Centralized storage of telemetry, session, and audit data
- Advanced analytics on platform usage patterns
- Long-term data retention beyond Dataverse limitations
- Foundation for ML/AI workloads on platform data

---

## Current MCMAP Data Architecture

### Dataverse Tables (14 Total)

MCMAP v7.0 uses Microsoft Dataverse as its primary data store with the following table structure:

#### EAP Platform Tables (8)

| Table | Purpose | Volume | Retention |
| ----- | ------- | ------ | --------- |
| eap_agent | Agent definitions and metadata | Low (20 records) | Permanent |
| eap_capability | Capability registry | Low (50 records) | Permanent |
| eap_session | Active planning sessions | Medium | 90 days |
| eap_telemetry | Agent call telemetry | High | 180 days |
| eap_user_profile | User attributes for ABAC | Low | Sync with directory |
| eap_access_rule | ABAC access rules | Low | Permanent |
| eap_environment_config | Platform configuration | Low | Permanent |
| eap_workflow_state | Workflow checkpoint data | Medium | 90 days |

#### MPA Domain Tables (6)

| Table | Purpose | Volume | Retention |
| ----- | ------- | ------ | --------- |
| mpa_benchmark | Industry benchmarks | Medium (708+ records) | Permanent |
| mpa_channel | Channel reference data | Low | Permanent |
| mpa_kpi | KPI definitions | Low | Permanent |
| mpa_partner | Partner/vendor data | Low | Permanent |
| mpa_session | Media planning session data | Medium | 90 days |
| mpa_vertical | Industry vertical reference | Low | Permanent |

### Current Limitations

1. Dataverse row limits for high-volume tables
2. No native analytics/BI layer for telemetry analysis
3. Limited retention (90-180 days) for compliance requirements
4. Generated documents stored only in SharePoint (no unified metadata)
5. No cross-system analytics capability

---

## Databricks Integration Scope

### Data Categories for Export

| Category | Source | Volume | Export Pattern | Priority |
| -------- | ------ | ------ | -------------- | -------- |
| Telemetry/Metrics | eap_telemetry | High (millions/month) | Streaming or Batch | P1 |
| Audit Events | CAAT AuditEvent | High | Streaming | P1 |
| Usage Analytics | UsageTracking | Medium | Batch (monthly) | P2 |
| Session Snapshots | eap_session, mpa_session | Medium | Batch | P2 |
| Generated Documents | DOC agent outputs | Low | Event-driven | P3 |
| User Uploads | User-provided data | Variable | Event-driven | P3 |
| Benchmark Data | mpa_benchmark | Low | Batch (release) | P3 |

### Export Patterns

#### Batch Export (Recommended for Initial Phase)

```
Dataverse Tables
      |
      v
Power Automate Flow (Scheduled)
      |
      v
Azure Data Lake Storage Gen2 (Staging)
      |
      v
Databricks Auto Loader
      |
      v
Delta Lake Tables
```

- Schedule: Daily at 02:00 UTC
- Format: Parquet with Delta Lake metadata
- Partitioning: By date and agent_code

#### Streaming Export (Future Phase)

```
Dataverse Change Data Capture
      |
      v
Azure Event Hub
      |
      v
Databricks Delta Live Tables
      |
      v
Delta Lake Tables (Real-time)
```

- Latency: Near real-time (seconds to minutes)
- Requires: Dataverse CDC, Event Hub namespace, DLT pipeline

#### Direct Write (Agent Outputs)

```
Agent (DOC, PRF, ANL)
      |
      v
Databricks REST API / SDK
      |
      v
Delta Lake Tables
```

- Use case: Document metadata, computed analytics
- Requires: Service principal with write access

---

## Unity Catalog Structure

### Catalog and Schema Design

```
mcmap (catalog)
|
+-- v7 (schema) - Operational data
|   |
|   +-- telemetry (table)
|   +-- session_snapshots (table)
|   +-- audit_events (table)
|   +-- usage_metrics (table)
|   +-- generated_documents (table)
|   +-- user_uploads (table)
|
+-- analytics (schema) - Materialized views and aggregations
|   |
|   +-- agent_performance_daily (materialized view)
|   +-- session_funnel_metrics (materialized view)
|   +-- benchmark_comparisons (materialized view)
|   +-- capability_usage_summary (materialized view)
|
+-- exports (schema) - Compliance and reporting
|   |
|   +-- compliance_reports (table)
|   +-- executive_dashboards (table)
|
+-- staging (schema) - Ingestion staging area
    |
    +-- raw_telemetry (table)
    +-- raw_sessions (table)
    +-- raw_audit (table)
```

### Access Control Mapping

| Dataverse Role | Databricks Permission | Unity Catalog Grant |
| -------------- | -------------------- | ------------------- |
| Platform Admin | Workspace Admin | CATALOG OWNER on mcmap |
| Domain Expert | Data Scientist | USE SCHEMA, SELECT on v7 and analytics |
| Operations | Data Analyst | SELECT on analytics schema only |
| External Agents | Service Principal | INSERT on v7 tables |
| MCMAP Service | Service Principal | ALL PRIVILEGES on v7 and staging |

### Data Retention Alignment

| Table | Dataverse Retention | Databricks Retention | Delta Time Travel |
| ----- | ------------------- | -------------------- | ----------------- |
| telemetry | 180 days (auto-purge) | 365 days | 30 days |
| session_snapshots | 90 days | 180 days | 14 days |
| audit_events | 90 days | 7 years (compliance) | 90 days |
| usage_metrics | N/A | Permanent | 30 days |
| generated_documents | N/A | 2 years | 30 days |

---

## Schema Definitions

Delta Lake table schemas are defined in the `/schemas/` directory:

| File | Table | Description |
| ---- | ----- | ----------- |
| mcmap_telemetry_v7.0.sql | mcmap.v7.telemetry | Agent telemetry events |
| mcmap_session_snapshots_v7.0.sql | mcmap.v7.session_snapshots | Session state snapshots |
| mcmap_audit_events_v7.0.sql | mcmap.v7.audit_events | Audit trail events |
| mcmap_usage_metrics_v7.0.sql | mcmap.v7.usage_metrics | Usage tracking aggregations |
| mcmap_generated_documents_v7.0.sql | mcmap.v7.generated_documents | Document metadata |
| mcmap_user_uploads_v7.0.sql | mcmap.v7.user_uploads | User upload records |

---

## Integration with External Agents

External agents (MMM, MMO, TAL, DYN, RMN, SES, MEI, SAL) may write data directly to Databricks:

### Write Patterns for External Agents

| Agent | Data Type | Target Table | Frequency |
| ----- | --------- | ------------ | --------- |
| MMM | Model outputs | mcmap.v7.mmm_results | On model run |
| MMO | Optimization results | mcmap.v7.mmo_results | On optimization |
| MEI | Economic indicators | mcmap.v7.mei_indicators | Daily/Weekly |
| TAL | Test results | mcmap.v7.tal_experiments | On test completion |

### Data Source Attribution

The inter-agent contract DataSource enum includes:

- `DATABRICKS_DELTA` - Data retrieved from Delta Lake tables
- `DATABRICKS_ANALYTICS` - Data from Databricks SQL analytics queries

---

## Security Requirements

### Data Classification

All MCMAP data exported to Databricks is classified as:

- PII: User identifiers, email addresses (masked in analytics schema)
- Confidential: Campaign budgets, client names
- Internal: Telemetry, session data, audit logs

### Encryption

- At rest: Azure Storage encryption (AES-256)
- In transit: TLS 1.2+
- Column-level: Sensitive columns encrypted with Databricks column masking

### Network Security

- Private Link for Databricks workspace
- VNet injection for compute clusters
- IP allowlist for API access

### Audit Trail

- All queries logged in Unity Catalog
- Data access events exported to SIEM
- Retention: 7 years for compliance

---

## Configuration Requirements

See DATABRICKS_CONFIG_v7.0.md for:

- Environment variables
- Feature flags
- Dataverse configuration entries

---

## Implementation Phases

### Phase 1: Batch Export (Current Preparation)

- Delta Lake schemas defined
- Export flow templates created
- Unity Catalog structure documented
- Access control mapping defined

### Phase 2: Initial Integration

- Databricks workspace provisioned
- Service principals created
- Batch export flows deployed
- Basic monitoring configured

### Phase 3: Analytics Layer

- Materialized views created
- Dashboards built
- Self-service analytics enabled

### Phase 4: Streaming Integration

- CDC enabled on Dataverse
- Event Hub configured
- Delta Live Tables deployed
- Real-time monitoring enabled

---

## Dependencies

### Mastercard Internal Teams

- Cloud Engineering: Databricks workspace provisioning
- Security/Compliance: Data residency approval, access control review
- Finance: Cost allocation model
- Data Governance: Schema registration, lineage tracking

### Technical Prerequisites

- Azure subscription with Databricks provisioned
- Azure Data Lake Storage Gen2 account
- Service principals for MCMAP and external agents
- Network connectivity (Private Link or VNet peering)

---

## Open Architecture Decisions

The following decisions require stakeholder input before integration:

1. Export Strategy: Batch-only initially, or invest in streaming?
2. Data Residency: Databricks workspace region alignment with Mastercard compliance
3. Cost Model: Platform-level or per-client cost allocation
4. Access Patterns: Read-only analytics or bidirectional sync
5. Document Storage: Continue SharePoint or migrate to Databricks Volumes
6. External Agent Data: Direct write or export through MCMAP

---

## Contact

Kevin Bauer (kevin.bauer@mastercard.com) - All inquiries

---

## Version History

| Version | Date | Changes |
| ------- | ---- | ------- |
| 7.0 | Jan 31, 2026 | Initial preparation specification |
