# MPA Integration Test Plan

## Overview

This document defines the comprehensive integration testing strategy for Media Planning Agent (MPA) v5.1 remediated flows. All 11 Power Automate flows have been rebuilt with enterprise error handling (Scope Try/Catch pattern) and require end-to-end validation before production deployment.

**Version**: 1.0.0
**Author**: MPA Remediation Team
**Created**: 2025-12-28
**Last Updated**: 2025-12-28

---

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Flow Test Matrix](#flow-test-matrix)
4. [Test Scenarios by Flow](#test-scenarios-by-flow)
5. [Error Handling Validation](#error-handling-validation)
6. [End-to-End Integration Tests](#end-to-end-integration-tests)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Acceptance Criteria](#acceptance-criteria)
10. [Test Execution Runbook](#test-execution-runbook)

---

## Test Environment Setup

### Environment Configuration

| Environment | Purpose | Dataverse URL | Azure Functions |
|-------------|---------|---------------|-----------------|
| Development | Initial testing | aragornai.crm.dynamics.com | mpa-functions-dev |
| Staging | Pre-production validation | aragornai.crm.dynamics.com | mpa-functions-staging |
| Production | Live system | aragornai.crm.dynamics.com | mpa-functions-prod |

### Required Connections

| Connection | Type | Required For |
|------------|------|--------------|
| Dataverse | shared_commondataserviceforapps | All flows |
| HTTP | HTTP connector | Flows 04, 05 |
| SharePoint | shared_sharepointonline | Flow 05 |

### Test Data Requirements

1. **Test User Account**: Create dedicated test user in eap_user
2. **Test Client**: Create test client record in eap_client
3. **Test Session**: Valid session in eap_session
4. **Sample Benchmarks**: Minimum 10 benchmark records in mpa_benchmark
5. **Sample Channels**: Minimum 5 channel records in mpa_channel

---

## Prerequisites Checklist

Before starting integration testing:

- [ ] All 11 flows deployed to target environment
- [ ] Connection references configured and authenticated
- [ ] Azure Functions deployed and healthy (all 8 endpoints responding)
- [ ] Key Vault secrets populated
- [ ] Test data seeded in Dataverse
- [ ] Error logging table (mpa_errorlog) accessible
- [ ] Copilot Studio topics configured with flow triggers
- [ ] Test user has Security Role: MPA User

---

## Flow Test Matrix

| Flow # | Flow Name | Priority | Dependencies | Est. Time |
|--------|-----------|----------|--------------|-----------|
| 01 | MPA_InitializeSession | P0 | None | 10 min |
| 02 | MPA_CreatePlan | P0 | Flow 01 | 15 min |
| 03 | MPA_SaveSection | P0 | Flow 02 | 10 min |
| 04 | MPA_ValidatePlan | P1 | Flow 02, Azure Function | 15 min |
| 05 | MPA_GenerateDocument | P1 | Flow 02, Azure Function, SharePoint | 20 min |
| 06 | MPA_SearchBenchmarks | P1 | Benchmark data | 10 min |
| 07 | MPA_SearchChannels | P1 | Channel data | 10 min |
| 08 | MPA_ImportPerformance | P2 | Flow 02 | 15 min |
| 09 | MPA_CreatePostMortem | P2 | Flow 02, Performance data | 15 min |
| 10 | MPA_PromoteLearning | P2 | Learning record | 10 min |
| 11 | MPA_ProcessMediaBrief | P1 | Flow 01 | 10 min |

**Priority Levels**:
- P0: Critical path - must pass for any deployment
- P1: Important - should pass before production
- P2: Nice to have - can deploy with known issues if documented

---

## Test Scenarios by Flow

### Flow 01: MPA_InitializeSession

#### TC-01-001: Happy Path - New Session Creation
**Preconditions**: Valid user exists in eap_user

**Input**:
```json
{
  "user_id": "test-user-001",
  "pathway": "EXPRESS",
  "campaign_name": "Integration Test Campaign"
}
```

**Expected Output**:
```json
{
  "status": "Success",
  "session_id": "<GUID>",
  "session_code": "SES-YYYYMMDDHHMMSS-XXXX",
  "pathway": "EXPRESS",
  "created_at": "<ISO8601>"
}
```

**Validation**:
- [ ] HTTP 200 response
- [ ] session_id is valid GUID
- [ ] session_code follows pattern
- [ ] Record created in eap_session
- [ ] eap_agent_type = "MPA_AGENT"

#### TC-01-002: Error Path - Missing Required Field
**Input**:
```json
{
  "user_id": "test-user-001"
}
```

**Expected Output**:
```json
{
  "status": "Error",
  "message": "Failed to initialize session",
  "error_details": "<error info>"
}
```

**Validation**:
- [ ] HTTP 500 response
- [ ] Error logged to mpa_errorlog
- [ ] mpa_source_flow = "MPA_InitializeSession"

#### TC-01-003: Error Path - Invalid Pathway Value
**Input**:
```json
{
  "user_id": "test-user-001",
  "pathway": "INVALID_PATHWAY"
}
```

**Validation**:
- [ ] Error handled gracefully
- [ ] Logged to mpa_errorlog

---

### Flow 02: MPA_CreatePlan

#### TC-02-001: Happy Path - Full Plan Creation
**Preconditions**: Valid session from Flow 01

**Input**:
```json
{
  "session_id": "<session_id from Flow 01>",
  "client_id": "test-client-001",
  "campaign_name": "Q1 2025 Brand Campaign",
  "campaign_objective": "Increase brand awareness by 25%",
  "total_budget": 75000,
  "currency": "USD",
  "start_date": "2025-02-01",
  "end_date": "2025-04-30"
}
```

**Validation**:
- [ ] HTTP 200 response
- [ ] plan_id returned
- [ ] plan_code follows MPA-YYYYMMDD-XXXX pattern
- [ ] version = 1
- [ ] Record created in mpa_mediaplan
- [ ] Record created in mpa_planversion
- [ ] Session linked to plan

#### TC-02-002: Happy Path - Minimal Plan Creation
**Input**:
```json
{
  "session_id": "<session_id>",
  "campaign_name": "Minimal Test Plan"
}
```

**Validation**:
- [ ] Plan created with defaults
- [ ] Optional fields null/empty

#### TC-02-003: Error Path - Invalid Session
**Input**:
```json
{
  "session_id": "00000000-0000-0000-0000-000000000000",
  "campaign_name": "Test"
}
```

**Validation**:
- [ ] HTTP 500 response
- [ ] Error logged

---

### Flow 03: MPA_SaveSection

#### TC-03-001: Happy Path - Create New Section
**Input**:
```json
{
  "plan_id": "<plan_id from Flow 02>",
  "section_type": "objectives",
  "section_data": "{\"primary\":\"awareness\",\"secondary\":\"engagement\"}",
  "step_number": 2
}
```

**Validation**:
- [ ] action = "created"
- [ ] Record in mpa_plandata
- [ ] Plan current_step updated

#### TC-03-002: Happy Path - Update Existing Section
**Preconditions**: Section already exists

**Input**: Same section_type, different data

**Validation**:
- [ ] action = "updated"
- [ ] mpa_updated_at changed

#### TC-03-003: Error Path - Invalid JSON in section_data
**Validation**:
- [ ] Error logged with request_data captured

---

### Flow 04: MPA_ValidatePlan

#### TC-04-001: Happy Path - Gate 1 Validation (Pass)
**Preconditions**: Plan with all required sections for Gate 1

**Input**:
```json
{
  "plan_id": "<plan_id>",
  "gate_number": 1,
  "validation_type": "completeness"
}
```

**Validation**:
- [ ] is_valid = true
- [ ] Validation record created in mpa_planvalidation
- [ ] Azure Function called successfully

#### TC-04-002: Happy Path - Gate 1 Validation (Fail)
**Preconditions**: Incomplete plan

**Validation**:
- [ ] is_valid = false
- [ ] validation_results contains specific failures
- [ ] Plan not marked as validated

#### TC-04-003: Error Path - Azure Function Unavailable
**Preconditions**: Azure Function endpoint down

**Validation**:
- [ ] Graceful error handling
- [ ] Error logged with Azure Function error details

---

### Flow 05: MPA_GenerateDocument

#### TC-05-001: Happy Path - Generate DOCX
**Input**:
```json
{
  "plan_id": "<plan_id>",
  "document_type": "media_plan",
  "format": "docx",
  "include_sections": ["executive_summary", "objectives", "strategy", "budget"]
}
```

**Validation**:
- [ ] document_url is valid SharePoint URL
- [ ] Document accessible in SharePoint
- [ ] Record in mpa_documentregistry

#### TC-05-002: Happy Path - Generate PDF
**Validation**:
- [ ] PDF format generated correctly

#### TC-05-003: Error Path - Invalid Plan ID
**Validation**:
- [ ] HTTP 500 with clear error message

---

### Flow 06: MPA_SearchBenchmarks

#### TC-06-001: Happy Path - Search with Multiple Criteria
**Input**:
```json
{
  "industry": "Technology",
  "channel": "Digital",
  "metric_type": "CPM",
  "region": "North America",
  "top_n": 5
}
```

**Validation**:
- [ ] benchmarks array returned
- [ ] count matches array length
- [ ] Results filtered correctly

#### TC-06-002: Happy Path - Search with No Results
**Input**:
```json
{
  "industry": "NonExistent",
  "channel": "Unknown"
}
```

**Validation**:
- [ ] Empty benchmarks array
- [ ] count = 0
- [ ] HTTP 200 (not error)

---

### Flow 07: MPA_SearchChannels

#### TC-07-001: Happy Path - Filter by Category
**Input**:
```json
{
  "category": "Social Media",
  "objective": "Awareness"
}
```

**Validation**:
- [ ] channels array returned
- [ ] All channels match criteria

---

### Flow 08: MPA_ImportPerformance

#### TC-08-001: Happy Path - Manual Import
**Input**:
```json
{
  "plan_id": "<plan_id>",
  "import_source": "manual",
  "performance_data": [
    {
      "channel": "Facebook",
      "impressions": 100000,
      "clicks": 2500,
      "spend": 5000,
      "conversions": 50,
      "date": "2025-01-15"
    },
    {
      "channel": "Google Ads",
      "impressions": 150000,
      "clicks": 4500,
      "spend": 7500,
      "conversions": 75,
      "date": "2025-01-15"
    }
  ]
}
```

**Validation**:
- [ ] records_imported = 2
- [ ] Records in mpa_campaignperformance
- [ ] Import log in mpa_dataimportlog

#### TC-08-002: Error Path - Duplicate Import
**Validation**:
- [ ] Proper handling of duplicate records

---

### Flow 09: MPA_CreatePostMortem

#### TC-09-001: Happy Path - Comprehensive Report
**Preconditions**: Plan with performance data

**Input**:
```json
{
  "plan_id": "<plan_id>",
  "report_type": "comprehensive",
  "analysis_period_start": "2025-01-01",
  "analysis_period_end": "2025-03-31"
}
```

**Validation**:
- [ ] Report created in mpa_postmortemreport
- [ ] Findings generated in mpa_postmortemfinding

---

### Flow 10: MPA_PromoteLearning

#### TC-10-001: Happy Path - Promote to Organization
**Input**:
```json
{
  "learning_id": "<learning_id>",
  "promotion_scope": "organization",
  "tags": ["best_practice", "awareness"]
}
```

**Validation**:
- [ ] Record created in eap_learning
- [ ] Original record updated

---

### Flow 11: MPA_ProcessMediaBrief

#### TC-11-001: Happy Path - Extract All Fields
**Input**:
```json
{
  "session_id": "<session_id>",
  "brief_text": "Launch campaign for our new smartphone targeting tech-savvy millennials aged 25-35. Budget is $150,000 over 6 months starting April 2025. Primary goal is driving pre-orders with a target of 10,000 units.",
  "extract_fields": ["budget", "duration", "target_audience", "objective", "timeline"]
}
```

**Validation**:
- [ ] extracted_data contains identified fields
- [ ] confidence_scores present
- [ ] suggestions for missing information

---

## Error Handling Validation

### Error Logging Verification

For each flow, verify error handling:

| Test | Validation |
|------|------------|
| Trigger error | Error logged with request_data |
| Connection failure | Error logged with connection details |
| Timeout | Error logged with TimedOut status |
| Data validation | Error logged with field details |

### Error Log Schema Verification

Each error record in mpa_errorlog must contain:

- [ ] mpa_error_type = "FlowError"
- [ ] mpa_error_message populated
- [ ] mpa_source_flow matches flow name
- [ ] mpa_severity set appropriately
- [ ] mpa_is_resolved = false
- [ ] mpa_occurred_at = timestamp
- [ ] mpa_request_data = original trigger body

---

## End-to-End Integration Tests


**Scenario**: User completes full EXPRESS planning workflow

**Steps**:
1. Initialize session (Flow 01) with pathway = "EXPRESS"
2. Create plan (Flow 02)
3. Save objectives section (Flow 03)
4. Save audience section (Flow 03)
5. Save channels section (Flow 03)
6. Save budget section (Flow 03)
7. Validate Gate 1 (Flow 04)
8. Generate document (Flow 05)

**Success Criteria**:
- [ ] All flows complete successfully
- [ ] Document generated in SharePoint
- [ ] Plan status = "validated"

### E2E-002: Complete GUIDED Pathway

**Steps**: Similar to E2E-001 with additional steps and validations

### E2E-003: Post-Mortem Workflow

**Steps**:
1. Import performance data (Flow 08)
2. Create post-mortem report (Flow 09)
3. Promote learnings (Flow 10)

### E2E-004: Error Recovery Workflow

**Steps**:
1. Trigger intentional error
2. Verify error logged
3. Retry operation
4. Verify success

---

## Performance Testing

### Latency Requirements

| Flow | Max Response Time | Typical Load |
|------|-------------------|--------------|
| Flow 01 | 3 seconds | 50/hour |
| Flow 02 | 5 seconds | 30/hour |
| Flow 03 | 2 seconds | 200/hour |
| Flow 04 | 10 seconds | 20/hour |
| Flow 05 | 30 seconds | 10/hour |
| Flows 06-07 | 5 seconds | 100/hour |
| Flow 08 | 15 seconds | 10/hour |
| Flow 09 | 20 seconds | 5/hour |
| Flow 10 | 3 seconds | 10/hour |
| Flow 11 | 5 seconds | 30/hour |

### Load Test Scenarios

1. **Normal Load**: Expected usage patterns
2. **Peak Load**: 2x normal load
3. **Stress Test**: 5x normal load (find breaking point)

---

## Security Testing

### Authentication Tests

- [ ] Unauthenticated requests rejected
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected

### Authorization Tests

- [ ] Users can only access own sessions
- [ ] Users can only access own plans
- [ ] Cross-tenant access blocked

### Input Validation Tests

- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] Oversized payloads rejected
- [ ] Malformed JSON rejected

---

## Acceptance Criteria

### Go/No-Go Criteria

**Must Pass (P0)**:
- [ ] All P0 flows pass happy path tests
- [ ] All P0 flows pass error handling tests
- [ ] Error logging functional for all flows

**Should Pass (P1)**:
- [ ] All P1 flows pass happy path tests
- [ ] Performance within latency requirements
- [ ] Security tests pass

**Nice to Have (P2)**:
- [ ] All P2 flows functional
- [ ] Load testing complete

---

## Test Execution Runbook

### Pre-Test Setup

```powershell
# 1. Verify environment
./scripts/testing/test-flows.ps1 -Environment "Development" -TestType "happy" -FlowNumber "01"

# 2. Seed test data
# (Manual step - create test user, client, session via Power Apps)

# 3. Configure flow URLs
# Update config/flow_urls.json with trigger URLs from Power Automate
```

### Execute Full Test Suite

```powershell
# Run all tests
./scripts/testing/test-flows.ps1 -Environment "Development" -TestType "all"

# Review results
Get-Content ./test-results/test-summary_*.txt
```

### Post-Test Cleanup

```powershell
# Clean up test data (manual)
# 1. Delete test sessions from eap_session
# 2. Delete test plans from mpa_mediaplan
# 3. Clear mpa_errorlog test entries
```

---

## Appendix A: Test Data Templates

### Test User
```json
{
  "eap_user_code": "TEST-USER-001",
  "eap_display_name": "Integration Test User",
  "eap_email": "test@example.com"
}
```

### Test Client
```json
{
  "eap_client_code": "TEST-CLIENT-001",
  "eap_name": "Integration Test Client",
  "eap_industry": "Technology"
}
```

---

## Appendix B: Troubleshooting Guide

### Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| Flow not found | Not deployed | Run Deploy-AllFlows.ps1 |
| Connection failed | Not authenticated | Refresh connection in Power Automate |
| Timeout | Long-running operation | Check Azure Function health |
| 500 Error | Various | Check mpa_errorlog for details |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA Lead | | | |
| Product Owner | | | |
