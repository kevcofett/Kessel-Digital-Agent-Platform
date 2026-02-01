-- MCMAP User Uploads Table Schema v7.0
-- Databricks Delta Lake Definition
-- Source: User-uploaded files processed by MCMAP agents
--
-- Purpose: Track metadata for files uploaded by users during planning
-- sessions. Enables analytics on upload patterns and data lineage.

CREATE TABLE IF NOT EXISTS mcmap.v7.user_uploads (
    -- Primary Key
    upload_id STRING NOT NULL COMMENT 'Unique upload identifier (UUID)',

    -- Upload Identity
    original_filename STRING NOT NULL COMMENT 'Original filename as uploaded',
    normalized_filename STRING COMMENT 'Normalized/sanitized filename',
    file_type STRING NOT NULL COMMENT 'File type (CSV, XLSX, PDF, PPTX, DOCX, JSON, IMAGE)',
    mime_type STRING COMMENT 'MIME type of file',

    -- Storage
    storage_type STRING NOT NULL COMMENT 'Storage backend (SHAREPOINT, BLOB, DATABRICKS_VOLUMES)',
    storage_path STRING NOT NULL COMMENT 'Storage path',
    storage_url STRING COMMENT 'Access URL (if applicable)',

    -- File Properties
    file_size_bytes BIGINT COMMENT 'File size in bytes',
    file_hash STRING COMMENT 'SHA-256 hash for deduplication/integrity',

    -- Content Analysis (populated by processing agents)
    content_type STRING COMMENT 'Detected content type (BUDGET_DATA, PERFORMANCE_DATA, CREATIVE, BRIEF)',
    row_count INT COMMENT 'Number of rows (for tabular data)',
    column_count INT COMMENT 'Number of columns (for tabular data)',
    columns_detected ARRAY<STRING> COMMENT 'Column names detected',
    date_range_start DATE COMMENT 'Start of date range in data (if applicable)',
    date_range_end DATE COMMENT 'End of date range in data (if applicable)',

    -- Processing Status
    processing_status STRING NOT NULL COMMENT 'Status (PENDING, PROCESSING, COMPLETED, FAILED)',
    processing_error STRING COMMENT 'Error message if processing failed',
    processed_at TIMESTAMP COMMENT 'When processing completed',

    -- Extraction Results
    extracted_data_location STRING COMMENT 'Location of extracted/transformed data',
    extraction_summary STRING COMMENT 'Summary of what was extracted',

    -- Session Context
    session_id STRING COMMENT 'Session upload belongs to',
    uploaded_by_user_id STRING NOT NULL COMMENT 'User who uploaded file',
    uploaded_by_department STRING COMMENT 'User department',

    -- Usage Tracking
    times_accessed INT DEFAULT 0 COMMENT 'Number of times data was accessed',
    agents_used_by ARRAY<STRING> COMMENT 'Agents that accessed this upload',
    last_accessed_at TIMESTAMP COMMENT 'Last access timestamp',

    -- Security
    contains_pii BOOLEAN COMMENT 'Whether file contains detected PII',
    contains_financial BOOLEAN COMMENT 'Whether file contains financial data',
    sensitivity_classification STRING COMMENT 'Data sensitivity (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)',

    -- Retention
    retention_days INT COMMENT 'Days to retain file',
    expires_at TIMESTAMP COMMENT 'When file should be purged',
    purged_at TIMESTAMP COMMENT 'When file was actually purged',

    -- Timestamps
    uploaded_at TIMESTAMP NOT NULL COMMENT 'Upload timestamp',

    -- Metadata
    _ingested_at TIMESTAMP NOT NULL COMMENT 'Databricks ingestion timestamp',
    _batch_id STRING COMMENT 'Export batch identifier'
)
USING DELTA
PARTITIONED BY (file_type, date(uploaded_at))
COMMENT 'MCMAP user upload metadata for data lineage'
TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true',
    'delta.deletedFileRetentionDuration' = 'interval 30 days',
    'delta.logRetentionDuration' = 'interval 30 days'
);

-- Create indexes for common queries
CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_uploads_session
ON mcmap.v7.user_uploads (session_id);

CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_uploads_user
ON mcmap.v7.user_uploads (uploaded_by_user_id);

CREATE BLOOM FILTER INDEX IF NOT EXISTS idx_uploads_hash
ON mcmap.v7.user_uploads (file_hash);

-- Grant permissions
GRANT SELECT ON mcmap.v7.user_uploads TO `mcmap-analysts`;
GRANT INSERT, SELECT, UPDATE ON mcmap.v7.user_uploads TO `mcmap-service`;
