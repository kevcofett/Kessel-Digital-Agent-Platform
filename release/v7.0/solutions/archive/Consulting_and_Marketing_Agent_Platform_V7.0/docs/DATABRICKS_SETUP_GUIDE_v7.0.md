# MCMAP Databricks Integration Setup Guide v7.0

## Document Information

| Field | Value |
| ----- | ----- |
| Version | 7.0 |
| Status | Preparation Complete - Pending Integration |
| Author | Kevin Bauer |
| Date | January 31, 2026 |
| Classification | Internal |

---

## Introduction

This guide provides step-by-step instructions for setting up Databricks integration with MCMAP. Follow these steps when the Databricks workspace has been provisioned and you are ready to enable the integration.

---

## Prerequisites

### Infrastructure Requirements

Before beginning setup, ensure the following are in place:

| Requirement | Owner | Status |
| ----------- | ----- | ------ |
| Azure Databricks workspace provisioned | Cloud Engineering | Pending |
| Unity Catalog enabled on workspace | Cloud Engineering | Pending |
| Azure Data Lake Storage Gen2 account | Cloud Engineering | Pending |
| Private Link or VNet peering configured | Network Security | Pending |
| Service principals created | Identity Team | Pending |
| Key Vault access granted | Security | Pending |

### Team Access

Ensure the following teams have appropriate access:

| Team | Access Level | Purpose |
| ---- | ------------ | ------- |
| Platform Team | Workspace Admin | Full administration |
| Data Engineering | Data Scientist | Schema and pipeline management |
| Operations | Data Analyst | Monitoring and reporting |
| Security | Security Admin | Access control review |

---

## Phase 1: Workspace Configuration

### Step 1.1: Verify Workspace Access

1. Navigate to the Databricks workspace URL
2. Authenticate using Mastercard SSO
3. Verify you have Workspace Admin permissions
4. Check Unity Catalog is enabled in Admin Console

### Step 1.2: Create Unity Catalog Structure

Execute the following SQL in a Databricks notebook or SQL editor:

```sql
-- Create the MCMAP catalog
CREATE CATALOG IF NOT EXISTS mcmap
COMMENT 'MCMAP platform data for media planning and analytics';

-- Create schemas
CREATE SCHEMA IF NOT EXISTS mcmap.v7
COMMENT 'MCMAP v7.0 operational data';

CREATE SCHEMA IF NOT EXISTS mcmap.analytics
COMMENT 'MCMAP analytics and materialized views';

CREATE SCHEMA IF NOT EXISTS mcmap.staging
COMMENT 'MCMAP data ingestion staging area';

CREATE SCHEMA IF NOT EXISTS mcmap.exports
COMMENT 'MCMAP compliance and reporting exports';

-- Verify creation
SHOW SCHEMAS IN mcmap;
```

### Step 1.3: Create Delta Lake Tables

Execute the schema SQL files from `/platform/data-export/schemas/`:

1. Open each `.sql` file in Databricks SQL editor
2. Execute in order:
   - `mcmap_telemetry_v7.0.sql`
   - `mcmap_session_snapshots_v7.0.sql`
   - `mcmap_audit_events_v7.0.sql`
   - `mcmap_usage_metrics_v7.0.sql`
   - `mcmap_generated_documents_v7.0.sql`
   - `mcmap_user_uploads_v7.0.sql`

3. Verify tables created:

```sql
SHOW TABLES IN mcmap.v7;
```

---

## Phase 2: Access Control Setup

### Step 2.1: Create Groups

Create the following groups in Azure AD or Databricks:

| Group Name | Purpose | Members |
| ---------- | ------- | ------- |
| mcmap-admins | Full platform access | Platform Team |
| mcmap-analysts | Read access to analytics | Data Analysts |
| mcmap-service | Service account access | MCMAP service principals |
| mcmap-security | Audit and compliance | Security Team |
| mcmap-finance | Usage and billing data | Finance Team |

### Step 2.2: Grant Permissions

Execute in Databricks SQL:

```sql
-- Grant catalog ownership
GRANT ALL PRIVILEGES ON CATALOG mcmap TO `mcmap-admins`;

-- Grant schema access
GRANT USE SCHEMA ON SCHEMA mcmap.v7 TO `mcmap-analysts`;
GRANT USE SCHEMA ON SCHEMA mcmap.analytics TO `mcmap-analysts`;
GRANT SELECT ON SCHEMA mcmap.v7 TO `mcmap-analysts`;
GRANT SELECT ON SCHEMA mcmap.analytics TO `mcmap-analysts`;

-- Grant service account access
GRANT USE CATALOG ON CATALOG mcmap TO `mcmap-service`;
GRANT USE SCHEMA ON SCHEMA mcmap.v7 TO `mcmap-service`;
GRANT USE SCHEMA ON SCHEMA mcmap.staging TO `mcmap-service`;
GRANT INSERT, SELECT ON SCHEMA mcmap.v7 TO `mcmap-service`;
GRANT ALL PRIVILEGES ON SCHEMA mcmap.staging TO `mcmap-service`;

-- Grant security team access
GRANT SELECT ON TABLE mcmap.v7.audit_events TO `mcmap-security`;

-- Grant finance access
GRANT SELECT ON TABLE mcmap.v7.usage_metrics TO `mcmap-finance`;
```

### Step 2.3: Configure Service Principals

1. Create service principal for MCMAP in Azure AD:
   - Name: `mcmap-databricks-sp`
   - Grant Contributor role on Databricks workspace

2. Create PAT or OAuth credentials:
   - Navigate to User Settings > Developer > Access tokens
   - Create token with appropriate expiration
   - Store in Azure Key Vault as `databricks-token`

3. Register service principal in Databricks:
   ```sql
   -- Add service principal to workspace (Admin Console)
   -- Then grant permissions
   GRANT USE CATALOG ON CATALOG mcmap TO `mcmap-databricks-sp`;
   ```

---

## Phase 3: Storage Configuration

### Step 3.1: Configure External Location

Set up Azure Data Lake Storage for staging:

```sql
-- Create storage credential
CREATE STORAGE CREDENTIAL IF NOT EXISTS mcmap_adls_credential
WITH (
  AZURE_MANAGED_IDENTITY = 'mcmap-databricks-sp'
);

-- Create external location for staging
CREATE EXTERNAL LOCATION IF NOT EXISTS mcmap_staging
URL 'abfss://mcmap@mcmapexport.dfs.core.windows.net/staging'
WITH (STORAGE CREDENTIAL mcmap_adls_credential);

-- Grant access
GRANT ALL PRIVILEGES ON EXTERNAL LOCATION mcmap_staging TO `mcmap-service`;
```

### Step 3.2: Configure Auto Loader

Create Auto Loader configuration for batch ingestion:

```python
# Auto Loader configuration template
# Save as a notebook in Databricks workspace

from pyspark.sql import functions as F

# Telemetry ingestion
telemetry_df = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "parquet")
    .option("cloudFiles.schemaLocation", "abfss://mcmap@mcmapexport.dfs.core.windows.net/schemas/telemetry")
    .load("abfss://mcmap@mcmapexport.dfs.core.windows.net/staging/telemetry/")
    .withColumn("_ingested_at", F.current_timestamp())
)

# Write to Delta
telemetry_df.writeStream \
    .format("delta") \
    .option("checkpointLocation", "abfss://mcmap@mcmapexport.dfs.core.windows.net/checkpoints/telemetry") \
    .outputMode("append") \
    .table("mcmap.v7.telemetry")
```

---

## Phase 4: Power Automate Integration

### Step 4.1: Import Export Flows

1. Navigate to Power Automate
2. Import the following flows (when created):
   - `EAP_Export_Telemetry_v7.0`
   - `EAP_Export_Sessions_v7.0`
   - `EAP_Export_Audit_v7.0`
   - `EAP_Export_Documents_v7.0`

### Step 4.2: Configure Connections

1. Create Azure Databricks connection:
   - Connector: Azure Databricks
   - Authentication: Service Principal
   - Workspace URL: (from DATABRICKS_HOST)
   - Token: (from Key Vault)

2. Create Azure Data Lake connection:
   - Connector: Azure Data Lake Storage
   - Account: mcmapexport
   - Authentication: Service Principal

### Step 4.3: Configure Schedules

Set up flow schedules:

| Flow | Schedule | Timezone |
| ---- | -------- | -------- |
| Telemetry Export | 2:00 AM daily | UTC |
| Session Export | 3:00 AM daily | UTC |
| Audit Export | 4:00 AM daily | UTC |
| Document Export | On trigger | N/A |

---

## Phase 5: Enable Integration

### Step 5.1: Update Dataverse Configuration

1. Open Power Apps
2. Navigate to `eap_environment_config` table
3. Add/update the `databricks_settings` record:

```json
{
  "config_key": "databricks_settings",
  "config_value": {
    "enabled": true,
    "export": {
      "telemetry": { "enabled": true },
      "sessions": { "enabled": true },
      "audit": { "enabled": true },
      "documents": { "enabled": false },
      "uploads": { "enabled": false }
    },
    "query": { "enabled": false },
    "streaming": { "enabled": false }
  }
}
```

### Step 5.2: Set Environment Variables

Configure in Azure App Configuration or deployment settings:

```
DATABRICKS_HOST=https://adb-xxxx.azuredatabricks.net
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/xxxx
DATABRICKS_CATALOG=mcmap
DATABRICKS_SCHEMA=v7
DATABRICKS_AUTH_TYPE=PAT
```

### Step 5.3: Activate Export Flows

1. Enable each Power Automate flow
2. Run manual test for each flow
3. Verify data appears in Databricks tables

---

## Phase 6: Validation

### Step 6.1: Test Data Export

Run test export and verify:

```sql
-- Check telemetry data
SELECT COUNT(*) as record_count,
       MIN(timestamp) as earliest,
       MAX(timestamp) as latest
FROM mcmap.v7.telemetry;

-- Check session snapshots
SELECT COUNT(*) as record_count,
       COUNT(DISTINCT session_id) as unique_sessions
FROM mcmap.v7.session_snapshots;

-- Check audit events
SELECT event_type, COUNT(*) as count
FROM mcmap.v7.audit_events
GROUP BY event_type;
```

### Step 6.2: Test Query Access

From DTA agent context, verify query capability:

```python
# Test query from agent
import databricks.sql as db

connection = db.connect(
    server_hostname=os.environ['DATABRICKS_HOST'],
    http_path=os.environ['DATABRICKS_HTTP_PATH'],
    access_token=os.environ['DATABRICKS_TOKEN']
)

cursor = connection.cursor()
cursor.execute("SELECT COUNT(*) FROM mcmap.v7.telemetry")
result = cursor.fetchone()
print(f"Telemetry records: {result[0]}")
```

### Step 6.3: Validate Permissions

Test access with different principals:

| Principal | Test | Expected Result |
| --------- | ---- | --------------- |
| mcmap-analysts | SELECT from analytics | Success |
| mcmap-analysts | INSERT into v7 | Denied |
| mcmap-service | INSERT into v7 | Success |
| mcmap-security | SELECT from audit_events | Success |

---

## Monitoring Setup

### Create Monitoring Dashboard

In Databricks SQL, create a dashboard with:

1. **Export Health**
   - Last successful export time
   - Records processed per export
   - Error count

2. **Storage Metrics**
   - Table sizes
   - Growth rate
   - Partition distribution

3. **Query Performance**
   - Query latency percentiles
   - Concurrent query count
   - Warehouse utilization

### Configure Alerts

Set up alerts for:

| Condition | Threshold | Action |
| --------- | --------- | ------ |
| Export job failure | Any failure | Email Platform Admin |
| Table size growth | > 20% weekly | Notification |
| Query latency | > 30 seconds | Investigate |
| Storage quota | > 80% | Capacity planning |

---

## Rollback Procedure

If issues occur during integration:

1. **Disable Export Flows**
   - Turn off all Power Automate flows
   - Set `databricks_settings.enabled = false` in Dataverse

2. **Preserve Data**
   - Do not drop Databricks tables
   - Keep staging files for investigation

3. **Investigate**
   - Check export flow run history
   - Review Databricks job logs
   - Check connectivity and permissions

4. **Restore**
   - Fix identified issues
   - Run manual test exports
   - Re-enable flows incrementally

---

## Support

### Troubleshooting

| Issue | Check | Resolution |
| ----- | ----- | ---------- |
| Connection failed | DATABRICKS_HOST, token validity | Regenerate token in Key Vault |
| Permission denied | Service principal membership | Add to appropriate groups |
| Export timeout | Batch size, network | Reduce batch size, check VNet |
| Query slow | Warehouse size, query complexity | Scale warehouse, optimize query |

### Contacts

- Platform Support: Kevin Bauer (kevin.bauer@mastercard.com)
- Cloud Engineering: (cloud engineering team)
- Security: (security team)

---

## Version History

| Version | Date | Changes |
| ------- | ---- | ------- |
| 7.0 | Jan 31, 2026 | Initial setup guide |
