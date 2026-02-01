-- MCMAP Telemetry Table Schema v7.0
-- Databricks Delta Lake Definition
-- Source: eap_telemetry (Dataverse)
--
-- Purpose: Store agent telemetry events including latency, success/failure,
-- data sources used, and confidence levels for analytics and monitoring.

CREATE TABLE IF NOT EXISTS mcmap.v7.telemetry (
    -- Primary Key
    telemetry_id STRING NOT NULL COMMENT 'Unique telemetry event identifier (UUID)',

    -- Session Context
    session_id STRING COMMENT 'Parent session identifier (UUID)',
    request_id STRING COMMENT 'Individual request identifier within session (UUID)',

    -- Agent Information
    agent_code STRING NOT NULL COMMENT 'Agent code (ORC, ANL, AUD, CHA, SPO, DOC, PRF, CHG, CST, MKT, etc.)',
    capability_code STRING COMMENT 'Specific capability invoked',

    -- Timing
    timestamp TIMESTAMP NOT NULL COMMENT 'Event timestamp in UTC',
    latency_ms INT COMMENT 'Processing time in milliseconds',

    -- Outcome
    success BOOLEAN NOT NULL COMMENT 'Whether the agent call succeeded',
    error_code STRING COMMENT 'Error code if failed (from AgentErrorCode enum)',
    error_message STRING COMMENT 'Human-readable error message',

    -- Request/Response Summary
    request_type STRING COMMENT 'Type of request (agent-specific)',
    input_summary STRING COMMENT 'Summary of input parameters (sanitized)',
    output_summary STRING COMMENT 'Summary of output data (sanitized)',

    -- Data Attribution
    data_sources ARRAY<STRING> COMMENT 'Sources used (USER_PROVIDED, AGENT_KB, DATAVERSE, etc.)',
    confidence_level STRING COMMENT 'Response confidence (HIGH, MEDIUM, LOW)',

    -- Context
    workflow_step INT COMMENT 'Workflow step (1-10) when event occurred',
    workflow_gate INT COMMENT 'Workflow gate (0-4) when event occurred',
    user_id STRING COMMENT 'User identifier (anonymized for analytics)',

    -- Metadata
    _ingested_at TIMESTAMP NOT NULL COMMENT 'Databricks ingestion timestamp',
    _source_modified_at TIMESTAMP COMMENT 'Source record modification timestamp',
    _batch_id STRING COMMENT 'Export batch identifier'
)
USING DELTA
PARTITIONED BY (date(timestamp), agent_code)
COMMENT 'MCMAP agent telemetry events from eap_telemetry'
TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true',
    'delta.deletedFileRetentionDuration' = 'interval 30 days',
    'delta.logRetentionDuration' = 'interval 30 days'
);

-- Create index for common queries
CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_telemetry_session
ON mcmap.v7.telemetry (session_id);

CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_telemetry_user
ON mcmap.v7.telemetry (user_id);

-- Grant permissions
GRANT SELECT ON mcmap.v7.telemetry TO `mcmap-analysts`;
GRANT INSERT, SELECT ON mcmap.v7.telemetry TO `mcmap-service`;
