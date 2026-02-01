-- MCMAP Usage Metrics Table Schema v7.0
-- Databricks Delta Lake Definition
-- Source: CAAT UsageTracking (PostgreSQL), eap_telemetry aggregations
--
-- Purpose: Store aggregated usage metrics for capacity planning, billing,
-- and executive reporting. Aggregated at monthly granularity.

CREATE TABLE IF NOT EXISTS mcmap.v7.usage_metrics (
    -- Primary Key
    metric_id STRING NOT NULL COMMENT 'Unique metric record identifier (UUID)',

    -- Time Period
    period_start DATE NOT NULL COMMENT 'Start of measurement period',
    period_end DATE NOT NULL COMMENT 'End of measurement period',
    period_type STRING NOT NULL COMMENT 'Period granularity (DAILY, WEEKLY, MONTHLY)',

    -- Dimension Keys
    agent_code STRING COMMENT 'Agent code (NULL for platform-level metrics)',
    capability_code STRING COMMENT 'Capability code (NULL for agent-level metrics)',
    user_department STRING COMMENT 'User department (NULL for aggregate)',
    user_region STRING COMMENT 'User region (NULL for aggregate)',
    client_industry STRING COMMENT 'Client industry (NULL for aggregate)',

    -- Request Metrics
    request_count BIGINT NOT NULL COMMENT 'Total number of requests',
    successful_requests BIGINT COMMENT 'Requests with success status',
    failed_requests BIGINT COMMENT 'Requests with failure status',

    -- Performance Metrics
    avg_latency_ms DECIMAL(10,2) COMMENT 'Average latency in milliseconds',
    p50_latency_ms INT COMMENT '50th percentile latency',
    p95_latency_ms INT COMMENT '95th percentile latency',
    p99_latency_ms INT COMMENT '99th percentile latency',
    max_latency_ms INT COMMENT 'Maximum latency observed',

    -- Token/Cost Metrics (from CAAT)
    total_input_tokens BIGINT COMMENT 'Total input tokens consumed',
    total_output_tokens BIGINT COMMENT 'Total output tokens generated',
    total_tokens BIGINT COMMENT 'Total tokens (input + output)',
    estimated_cost_usd DECIMAL(18,4) COMMENT 'Estimated cost in USD',

    -- Session Metrics
    unique_sessions BIGINT COMMENT 'Number of unique sessions',
    unique_users BIGINT COMMENT 'Number of unique users',
    sessions_completed BIGINT COMMENT 'Sessions reaching completion',

    -- Quality Metrics
    high_confidence_pct DECIMAL(5,2) COMMENT 'Percentage of HIGH confidence responses',
    medium_confidence_pct DECIMAL(5,2) COMMENT 'Percentage of MEDIUM confidence responses',
    low_confidence_pct DECIMAL(5,2) COMMENT 'Percentage of LOW confidence responses',

    -- Data Source Breakdown
    dataverse_queries BIGINT COMMENT 'Queries to Dataverse',
    kb_retrievals BIGINT COMMENT 'Knowledge base retrievals',
    web_searches BIGINT COMMENT 'Web search invocations',
    calculation_operations BIGINT COMMENT 'Calculation operations',

    -- Metadata
    calculated_at TIMESTAMP NOT NULL COMMENT 'When metrics were calculated',
    _ingested_at TIMESTAMP NOT NULL COMMENT 'Databricks ingestion timestamp',
    _batch_id STRING COMMENT 'Export batch identifier'
)
USING DELTA
PARTITIONED BY (period_type, date(period_start))
COMMENT 'MCMAP aggregated usage metrics for reporting'
TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true',
    'delta.deletedFileRetentionDuration' = 'interval 30 days',
    'delta.logRetentionDuration' = 'interval 30 days'
);

-- Create indexes for common reporting queries
CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_metrics_agent
ON mcmap.v7.usage_metrics (agent_code);

CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_metrics_department
ON mcmap.v7.usage_metrics (user_department);

-- Grant permissions
GRANT SELECT ON mcmap.v7.usage_metrics TO `mcmap-analysts`;
GRANT SELECT ON mcmap.v7.usage_metrics TO `mcmap-finance`;
GRANT INSERT, SELECT ON mcmap.v7.usage_metrics TO `mcmap-service`;
