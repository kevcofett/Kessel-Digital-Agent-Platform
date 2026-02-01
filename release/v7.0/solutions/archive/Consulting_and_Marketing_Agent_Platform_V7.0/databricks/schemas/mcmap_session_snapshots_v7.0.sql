-- MCMAP Session Snapshots Table Schema v7.0
-- Databricks Delta Lake Definition
-- Source: eap_session, mpa_session (Dataverse)
--
-- Purpose: Store point-in-time snapshots of session state for analytics,
-- debugging, and historical analysis of planning workflows.

CREATE TABLE IF NOT EXISTS mcmap.v7.session_snapshots (
    -- Primary Key
    snapshot_id STRING NOT NULL COMMENT 'Unique snapshot identifier (UUID)',

    -- Session Identity
    session_id STRING NOT NULL COMMENT 'Parent session identifier (UUID)',
    session_type STRING COMMENT 'Session type (Planning, InFlight, PostMortem, Audit)',

    -- User Context
    user_id STRING COMMENT 'User identifier (anonymized)',
    user_department STRING COMMENT 'User department for analytics',
    user_region STRING COMMENT 'User geographic region',

    -- Workflow State
    workflow_step INT NOT NULL COMMENT 'Workflow step (1-10)',
    workflow_gate INT NOT NULL COMMENT 'Workflow gate (0-4)',

    -- Plan State (JSON)
    plan_state STRING COMMENT 'Full plan state JSON blob',

    -- Client Context (extracted from plan_state)
    client_name STRING COMMENT 'Client name (if available)',
    industry STRING COMMENT 'Industry classification',
    vertical STRING COMMENT 'Industry vertical',

    -- Objectives (extracted from plan_state)
    primary_kpi STRING COMMENT 'Primary KPI',
    campaign_type STRING COMMENT 'Campaign type (awareness, consideration, conversion, retention)',

    -- Budget (extracted from plan_state)
    total_budget DECIMAL(18,2) COMMENT 'Total campaign budget',
    currency STRING COMMENT 'Budget currency (3-letter code)',

    -- Timeline (extracted from plan_state)
    campaign_start_date DATE COMMENT 'Campaign start date',
    campaign_end_date DATE COMMENT 'Campaign end date',
    duration_weeks INT COMMENT 'Campaign duration in weeks',

    -- Metadata
    snapshot_timestamp TIMESTAMP NOT NULL COMMENT 'When snapshot was taken',
    snapshot_trigger STRING COMMENT 'What triggered snapshot (step_change, gate_change, manual)',
    _ingested_at TIMESTAMP NOT NULL COMMENT 'Databricks ingestion timestamp',
    _source_modified_at TIMESTAMP COMMENT 'Source record modification timestamp',
    _batch_id STRING COMMENT 'Export batch identifier'
)
USING DELTA
PARTITIONED BY (date(snapshot_timestamp))
COMMENT 'MCMAP session state snapshots for analytics'
TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true',
    'delta.deletedFileRetentionDuration' = 'interval 14 days',
    'delta.logRetentionDuration' = 'interval 14 days'
);

-- Create index for common queries
CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_snapshots_session
ON mcmap.v7.session_snapshots (session_id);

CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_snapshots_user
ON mcmap.v7.session_snapshots (user_id);

-- Grant permissions
GRANT SELECT ON mcmap.v7.session_snapshots TO `mcmap-analysts`;
GRANT INSERT, SELECT ON mcmap.v7.session_snapshots TO `mcmap-service`;
