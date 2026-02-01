-- MCMAP Audit Events Table Schema v7.0
-- Databricks Delta Lake Definition
-- Source: CAAT AuditEvent (PostgreSQL)
--
-- Purpose: Store audit trail events for compliance, security monitoring,
-- and forensic analysis. 7-year retention for regulatory compliance.

CREATE TABLE IF NOT EXISTS mcmap.v7.audit_events (
    -- Primary Key
    audit_id STRING NOT NULL COMMENT 'Unique audit event identifier (UUID)',

    -- Event Classification
    event_type STRING NOT NULL COMMENT 'Event type (AUTH, ACCESS, MODIFY, DELETE, EXPORT, CONFIG)',
    event_category STRING COMMENT 'Event category for filtering',
    severity STRING NOT NULL COMMENT 'Severity level (INFO, WARNING, ERROR, CRITICAL)',

    -- Actor Information
    actor_id STRING COMMENT 'User or service principal ID',
    actor_type STRING NOT NULL COMMENT 'Actor type (USER, SERVICE, SYSTEM)',
    actor_name STRING COMMENT 'Display name (sanitized)',
    actor_ip STRING COMMENT 'IP address (for security analysis)',
    actor_user_agent STRING COMMENT 'User agent string',

    -- Target Information
    target_type STRING COMMENT 'Target resource type (SESSION, AGENT, CONFIG, DATA)',
    target_id STRING COMMENT 'Target resource identifier',
    target_name STRING COMMENT 'Target resource name',

    -- Event Details
    action STRING NOT NULL COMMENT 'Specific action performed',
    outcome STRING NOT NULL COMMENT 'Outcome (SUCCESS, FAILURE, DENIED)',
    outcome_reason STRING COMMENT 'Reason for outcome (especially failures)',

    -- Context
    session_id STRING COMMENT 'Related session if applicable',
    request_id STRING COMMENT 'Related request if applicable',
    correlation_id STRING COMMENT 'Correlation ID for tracing',

    -- Timing
    event_timestamp TIMESTAMP NOT NULL COMMENT 'When event occurred (UTC)',
    processing_time_ms INT COMMENT 'Processing time if applicable',

    -- Additional Data
    event_data STRING COMMENT 'Additional event data as JSON',

    -- Source Tracking
    source_system STRING NOT NULL COMMENT 'Source system (MCMAP, CAAT, COPILOT)',
    source_version STRING COMMENT 'Source system version',

    -- Metadata
    _ingested_at TIMESTAMP NOT NULL COMMENT 'Databricks ingestion timestamp',
    _batch_id STRING COMMENT 'Export batch identifier',
    _retention_expires_at TIMESTAMP COMMENT 'When record can be purged (7 years from event)'
)
USING DELTA
PARTITIONED BY (date(event_timestamp), event_type)
COMMENT 'MCMAP audit trail for compliance (7-year retention)'
TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true',
    'delta.deletedFileRetentionDuration' = 'interval 90 days',
    'delta.logRetentionDuration' = 'interval 90 days'
);

-- Create indexes for security analysis queries
CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_audit_actor
ON mcmap.v7.audit_events (actor_id);

CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_audit_target
ON mcmap.v7.audit_events (target_id);

CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_audit_session
ON mcmap.v7.audit_events (session_id);

CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_audit_correlation
ON mcmap.v7.audit_events (correlation_id);

-- Grant permissions (restricted for compliance)
GRANT SELECT ON mcmap.v7.audit_events TO `mcmap-security`;
GRANT SELECT ON mcmap.v7.audit_events TO `mcmap-compliance`;
GRANT INSERT, SELECT ON mcmap.v7.audit_events TO `mcmap-service`;
