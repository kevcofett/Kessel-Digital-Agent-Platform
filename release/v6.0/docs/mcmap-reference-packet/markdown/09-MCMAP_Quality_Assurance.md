# MCMAP Quality Assurance & Testing

**Document:** 08-MCMAP_Quality_Assurance.md  
**Version:** 1.0  
**Date:** January 23, 2026  
**Classification:** Mastercard Internal - Technical Reference  
**Audience:** QA Engineers, Developers, Release Managers

---

## Table of Contents

1. [Quality Assurance Framework](#1-quality-assurance-framework)
2. [Test Strategy](#2-test-strategy)
3. [Test Categories](#3-test-categories)
4. [Test Case Management](#4-test-case-management)
5. [Automated Testing](#5-automated-testing)
6. [Manual Testing Procedures](#6-manual-testing-procedures)
7. [Performance Testing](#7-performance-testing)
8. [Deployment Validation](#8-deployment-validation)
9. [Quality Metrics](#9-quality-metrics)
10. [Continuous Improvement](#10-continuous-improvement)

---

## 1. Quality Assurance Framework

### 1.1 Quality Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Test-Driven Quality** | Golden test cases validate behavior before deployment | eap_test_case table with regression suite |
| **Shift Left** | Find defects early in development | Unit tests during development |
| **Automation First** | Automate repeatable tests | Braintrust + Power Automate test flows |
| **Production Parity** | Test in production-like environment | Staging environment mirrors production |
| **Continuous Validation** | Ongoing quality monitoring | Post-deployment smoke tests |

### 1.2 Quality Gates

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    QUALITY GATES                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  GATE 1: Development                                            â”‚
â”‚  â”œâ”€â”€ Unit tests pass                                            â”‚
â”‚  â”œâ”€â”€ Code review approved                                       â”‚
â”‚  â””â”€â”€ Prompt validation pass                                     â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  GATE 2: Integration                                            â”‚
â”‚  â”œâ”€â”€ Integration tests pass                                     â”‚
â”‚  â”œâ”€â”€ Flow execution success                                     â”‚
â”‚  â””â”€â”€ Capability tests pass                                      â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  GATE 3: Staging                                                â”‚
â”‚  â”œâ”€â”€ Regression suite pass (100%)                               â”‚
â”‚  â”œâ”€â”€ Performance benchmarks met                                 â”‚
â”‚  â””â”€â”€ UAT sign-off (if applicable)                              â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  GATE 4: Production                                             â”‚
â”‚  â”œâ”€â”€ Smoke tests pass                                           â”‚
â”‚  â”œâ”€â”€ Telemetry baseline established                             â”‚
â”‚  â””â”€â”€ Rollback plan verified                                     â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  GATE 5: Post-Deployment                                        â”‚
â”‚  â”œâ”€â”€ Error rate within threshold                                â”‚
â”‚  â”œâ”€â”€ Performance within SLA                                     â”‚
â”‚  â””â”€â”€ User feedback positive                                     â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 1.3 Quality Metrics Summary

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Test Pass Rate | 100% | 100% | âœ… |
| Code Coverage | > 80% | 87% | âœ… |
| Regression Pass | 100% | 100% | âœ… |
| Performance SLA | 95% | 97.2% | âœ… |
| Defect Escape Rate | < 2% | 0.8% | âœ… |
| Mean Time to Detect | < 15 min | 8 min | âœ… |

---

## 2. Test Strategy

### 2.1 Test Pyramid

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   E2E Tests   â”‚  (10%)
                    â”‚   Manual UAT  â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚  Integration  â”‚  (30%)
                    â”‚    Tests      â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚        Capability Tests       â”‚  (40%)
            â”‚   (AI Builder + Flow Tests)   â”‚
            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚              Unit Tests                       â”‚  (20%)
    â”‚    (Prompt Validation, Schema Tests)         â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Test Environments

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| **Development** | Developer testing | Synthetic | Development team |
| **Staging** | Integration and regression | Production copy | QA + Dev teams |
| **Production** | Live system | Real data | All users |

### 2.3 Test Data Strategy

| Data Type | Source | Refresh | Notes |
|-----------|--------|---------|-------|
| Reference data | Seed CSVs | Per deployment | Channels, KPIs, verticals |
| Benchmark data | Production export | Monthly | Anonymized |
| Test sessions | Synthetic | Per test run | Generated by tests |
| Golden test cases | eap_test_case | Maintained | Curated scenarios |

---

## 3. Test Categories

### 3.1 Routing Tests

**Purpose:** Verify ORC agent routes queries to correct agents.

**Test Case Structure:**

| Field | Description | Example |
|-------|-------------|---------|
| input_message | User query | "What's my projected ROI?" |
| expected_agent | Target agent | ANL |
| confidence_threshold | Minimum confidence | 0.8 |

**Sample Routing Test Cases:**

| Test ID | Input Message | Expected Agent | Category |
|---------|---------------|----------------|----------|
| RT-001 | "Help me plan my media budget" | ORC/ANL | Budget |
| RT-002 | "Who should I target for this campaign?" | AUD | Audience |
| RT-003 | "Which channels should I use?" | CHA | Channel |
| RT-004 | "Analyze my programmatic fees" | SPO | Supply |
| RT-005 | "Why did performance drop last week?" | PRF | Performance |
| RT-006 | "Create a media plan document" | DOC | Document |
| RT-007 | "What strategic framework should I use?" | CST | Consulting |
| RT-008 | "Help me manage stakeholder resistance" | CHG | Change |
| RT-009 | "Build a business case for this initiative" | CA | Analysis |
| RT-010 | "Hello, what can you help me with?" | ORC | General |

**Pass Criteria:**
- Correct agent selected
- Confidence >= threshold
- Response time < 2 seconds

### 3.2 Capability Tests

**Purpose:** Verify capabilities produce correct, consistent outputs.

**Test Case Structure:**

| Field | Description | Example |
|-------|-------------|---------|
| capability_code | Capability under test | ANL_MARGINAL_RETURN |
| input_json | Input parameters | {"channel_code": "PAID_SEARCH"...} |
| expected_output_contains | Required fields | ["marginal_returns", "confidence"] |
| expected_value_ranges | Numeric bounds | {"confidence": [0.7, 1.0]} |
| tolerance_band | Acceptable variance | 0.05 (5%) |

**Sample Capability Test Cases:**

| Test ID | Capability | Input Summary | Validation |
|---------|------------|---------------|------------|
| CT-001 | ANL_MARGINAL_RETURN | Paid Search, $100K | Returns curve, confidence > 0.8 |
| CT-002 | ANL_SCENARIO_COMPARE | 3 scenarios | Ranked list, recommendation |
| CT-003 | AUD_SEGMENT_PRIORITY | 5 segments | Prioritized list, scores |
| CT-004 | AUD_LTV_ASSESS | High-value segment | LTV estimate with range |
| CT-005 | CHA_CHANNEL_MIX | $500K budget | Allocation totals 100% |
| CT-006 | SPO_FEE_WATERFALL | $50K programmatic | Working media % calculated |
| CT-007 | PRF_ANOMALY | Performance data | Anomalies identified |
| CT-008 | DOC_TEMPLATE_SELECT | Media brief request | Correct template selected |
| CT-009 | ORC_INTENT_CLASSIFY | "Calculate my budget" | Intent: ANALYTICS |
| CT-010 | CST_FRAMEWORK_SELECT | Market entry scenario | Porter's Five Forces |

**Pass Criteria:**
- All required fields present
- Values within expected ranges
- JSON schema valid
- Execution time < 5 seconds

### 3.3 Integration Tests

**Purpose:** Verify end-to-end flow execution through multiple components.

**Test Scenarios:**

| Scenario | Components Tested | Success Criteria |
|----------|-------------------|------------------|
| Session Lifecycle | Flow â†’ Dataverse â†’ Agent | Session created, persisted, retrievable |
| Capability Dispatch | Agent â†’ Flow â†’ AI Builder â†’ Response | Correct response returned |
| Telemetry Logging | All flows â†’ eap_telemetry | Events logged with correct data |
| KB Retrieval | Agent â†’ SharePoint â†’ Response | Relevant KB content cited |
| Multi-Agent | ORC â†’ ANL â†’ DOC | Complete workflow executes |

**Sample Integration Test:**

```
Test: IT-001 Complete Media Planning Flow

Setup:
- Create test session
- Seed minimal context

Steps:
1. Send "Help me plan a $500K digital campaign"
2. Verify ORC routes to CHA
3. Respond to channel selection prompts
4. Verify ANL provides projections
5. Request document generation
6. Verify DOC produces media brief

Validation:
- All agent transitions successful
- Session state maintained throughout
- Telemetry records complete trail
- Document contains required sections

Teardown:
- Delete test session
- Clear telemetry records
```

### 3.4 Regression Tests

**Purpose:** Ensure new changes don't break existing functionality.

**Regression Suite Coverage:**

| Area | Test Count | Priority |
|------|------------|----------|
| Routing | 25 | Critical |
| ANL Capabilities | 18 | Critical |
| AUD Capabilities | 15 | High |
| CHA Capabilities | 10 | High |
| SPO Capabilities | 9 | Medium |
| PRF Capabilities | 12 | High |
| DOC Capabilities | 8 | Medium |
| Consulting (CST/CHG/CA) | 15 | Medium |
| Session Management | 12 | Critical |
| Error Handling | 20 | High |
| **Total** | **144** | |

**Regression Execution:**
- Run on every deployment to staging
- Full suite must pass before production
- Failed tests block deployment

### 3.5 Performance Tests

**Purpose:** Verify system meets performance SLAs under load.

**Performance Test Scenarios:**

| Scenario | Load | Duration | Success Criteria |
|----------|------|----------|------------------|
| Baseline | 10 concurrent users | 15 min | P95 < 5s |
| Normal | 50 concurrent users | 30 min | P95 < 5s |
| Peak | 100 concurrent users | 15 min | P95 < 8s |
| Stress | 150 concurrent users | 10 min | Graceful degradation |
| Endurance | 50 concurrent users | 4 hours | No memory leaks |

---

## 4. Test Case Management

### 4.1 Test Case Repository

All test cases are stored in the `eap_test_case` Dataverse table:

| Column | Type | Description |
|--------|------|-------------|
| test_case_id | GUID (PK) | Unique identifier |
| scenario_name | Text | Human-readable name |
| scenario_category | Choice | ROUTING, CAPABILITY, INTEGRATION, E2E, REGRESSION |
| agent_code | Lookup | Target agent |
| capability_code | Lookup | Specific capability |
| input_message | Multiline | User message to test |
| input_json | Multiline JSON | Structured input parameters |
| expected_agent | Lookup | Which agent should handle |
| expected_capability | Lookup | Which capability invoked |
| expected_output_contains | Multiline JSON | Required output fields |
| expected_value_ranges | Multiline JSON | Numeric validation ranges |
| expected_citations | Multiline | Expected KB citations |
| tolerance_band | Decimal | Acceptable variance |
| environment_code | Choice | BOTH, MASTERCARD, PERSONAL |
| priority | Choice | CRITICAL, HIGH, MEDIUM, LOW |
| is_active | Boolean | Include in test runs |
| last_run_date | DateTime | Most recent execution |
| last_run_result | Choice | PASS, FAIL, ERROR, SKIP |
| last_run_details | Multiline | Execution details/errors |
| last_run_duration_ms | Integer | Execution time |

### 4.2 Test Case Lifecycle

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 TEST CASE LIFECYCLE                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  DRAFT                                                          â”‚
â”‚  â””â”€â”€ Test case created, not yet validated                       â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  REVIEW                                                         â”‚
â”‚  â””â”€â”€ Test case reviewed by QA lead                             â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  ACTIVE                                                         â”‚
â”‚  â””â”€â”€ Test case included in regression suite                    â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼ (if obsolete)                                         â”‚
â”‚  DEPRECATED                                                     â”‚
â”‚  â””â”€â”€ Test case excluded but retained for history               â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼ (if deleted)                                          â”‚
â”‚  ARCHIVED                                                       â”‚
â”‚  â””â”€â”€ Soft delete, retained for audit                           â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.3 Test Case Creation Guidelines

**Good Test Case Characteristics:**

| Attribute | Guideline |
|-----------|-----------|
| **Atomic** | Test one thing at a time |
| **Independent** | No dependencies on other tests |
| **Repeatable** | Same result every execution |
| **Clear** | Obvious pass/fail criteria |
| **Maintainable** | Easy to update when system changes |

**Test Case Template:**

```json
{
  "scenario_name": "ANL: Marginal Return - Paid Search Baseline",
  "scenario_category": "CAPABILITY",
  "agent_code": "ANL",
  "capability_code": "ANL_MARGINAL_RETURN",
  "input_json": {
    "channel_code": "PAID_SEARCH_BRAND",
    "current_spend": 100000,
    "currency": "USD",
    "vertical_code": "RETAIL"
  },
  "expected_output_contains": [
    "marginal_returns.at_current",
    "saturation_point",
    "confidence"
  ],
  "expected_value_ranges": {
    "confidence": [0.7, 1.0],
    "marginal_returns.at_current": [1.0, 10.0]
  },
  "tolerance_band": 0.1,
  "priority": "HIGH",
  "is_active": true
}
```

---

## 5. Automated Testing

### 5.1 Test Automation Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                TEST AUTOMATION ARCHITECTURE                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                 BRAINTRUST PLATFORM                      â”‚   â”‚
â”‚  â”‚  â”œâ”€â”€ Test orchestration                                  â”‚   â”‚
â”‚  â”‚  â”œâ”€â”€ LLM-based evaluation scorers                       â”‚   â”‚
â”‚  â”‚  â””â”€â”€ Performance dashboards                              â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                 PYTHON TEST HARNESS                      â”‚   â”‚
â”‚  â”‚  â”œâ”€â”€ pytest framework                                    â”‚   â”‚
â”‚  â”‚  â”œâ”€â”€ API clients (Dataverse, AI Builder)                â”‚   â”‚
â”‚  â”‚  â””â”€â”€ Result reporting                                    â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                 POWER AUTOMATE TESTS                     â”‚   â”‚
â”‚  â”‚  â”œâ”€â”€ Test execution flow                                 â”‚   â”‚
â”‚  â”‚  â”œâ”€â”€ Dataverse test case reader                         â”‚   â”‚
â”‚  â”‚  â””â”€â”€ Result writer                                       â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 5.2 Braintrust Evaluation Scorers

MCMAP uses LLM-based scorers to evaluate agent quality:

| Scorer | Purpose | Target | Current |
|--------|---------|--------|---------|
| **proactive-intelligence** | Agent provides proactive insights | > 95% | 92% |
| **self-referential-learning** | Agent learns from conversation | > 95% | 91% |
| **rag-retrieval** | Relevant KB content retrieved | > 95% | 91% |
| **response-accuracy** | Factually correct responses | > 98% | 97% |
| **response-completeness** | All user questions addressed | > 95% | 94% |
| **tone-consistency** | Appropriate professional tone | > 98% | 98% |
| **citation-quality** | Proper source attribution | > 95% | 93% |

**Scorer Implementation:**

```python
# Example: Response Accuracy Scorer
@braintrust.scorer
def response_accuracy(input: str, output: str, expected: dict) -> float:
    """
    Evaluate whether the response contains factually accurate information.
    
    Returns: 0.0 to 1.0 score
    """
    # LLM-based evaluation
    evaluation = llm_evaluate(
        prompt=f"""
        Evaluate the accuracy of this response:
        
        User Query: {input}
        Agent Response: {output}
        Expected Elements: {expected}
        
        Score from 0.0 (completely inaccurate) to 1.0 (fully accurate).
        Consider:
        - Factual correctness
        - Appropriate caveats
        - No hallucinations
        """,
        model="gpt-4"
    )
    return evaluation.score
```

### 5.3 Test Execution Flow

**Power Automate Test Runner:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    TEST EXECUTION FLOW                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  Trigger: Scheduled (nightly) OR Manual                         â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Query eap_test_case                                            â”‚
â”‚  â””â”€â”€ Filter: is_active = true, environment = MASTERCARD         â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  For Each test_case:                                            â”‚
â”‚  â”œâ”€â”€ Setup: Create test session                                â”‚
â”‚  â”œâ”€â”€ Execute: Send input to agent/capability                   â”‚
â”‚  â”œâ”€â”€ Capture: Record response                                   â”‚
â”‚  â”œâ”€â”€ Validate: Compare to expected                             â”‚
â”‚  â”œâ”€â”€ Score: Calculate pass/fail                                â”‚
â”‚  â””â”€â”€ Record: Update last_run_* fields                          â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Generate Summary Report                                        â”‚
â”‚  â”œâ”€â”€ Total tests run                                            â”‚
â”‚  â”œâ”€â”€ Pass/Fail counts                                           â”‚
â”‚  â”œâ”€â”€ Failed test details                                        â”‚
â”‚  â””â”€â”€ Execution time                                             â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Alert on Failures                                              â”‚
â”‚  â””â”€â”€ Send to Teams: MCMAP-Test-Alerts                           â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 5.4 Test Result Reporting

**Test Summary Schema:**

```json
{
  "execution_id": "exec-2026-01-23-001",
  "execution_date": "2026-01-23T02:00:00Z",
  "environment": "MASTERCARD",
  "total_tests": 144,
  "passed": 142,
  "failed": 2,
  "skipped": 0,
  "pass_rate": 98.6,
  "execution_time_seconds": 847,
  "failed_tests": [
    {
      "test_case_id": "TC-087",
      "scenario_name": "AUD: LTV Assessment Edge Case",
      "expected": "LTV tier = MEDIUM",
      "actual": "LTV tier = LOW",
      "error": "Confidence below threshold"
    }
  ]
}
```

---

## 6. Manual Testing Procedures

### 6.1 User Acceptance Testing (UAT)

**UAT Scope:**

| Area | Test Focus | Testers |
|------|------------|---------|
| Media Planning | Complete workflow execution | Media planners |
| Analytics | Projection accuracy | Analysts |
| Consulting | Framework appropriateness | Consultants |
| Documents | Output quality | All users |

**UAT Checklist:**

- [ ] User can start new session
- [ ] Agent responds appropriately to domain queries
- [ ] Cross-agent handoffs are smooth
- [ ] Session context is maintained
- [ ] Documents generated are useful
- [ ] KB citations are relevant
- [ ] Error messages are helpful
- [ ] Performance is acceptable

### 6.2 Exploratory Testing

**Exploratory Test Charter Template:**

```
Charter: Explore [AREA] with focus on [FOCUS]

Time Box: [DURATION]

Setup:
- [Environment setup steps]

Mission:
- [What to explore]

Risks to mitigate:
- [What could go wrong]

Notes:
- [Observations during testing]

Bugs Found:
- [Issues discovered]
```

**Exploratory Testing Areas:**

| Area | Focus | Risk |
|------|-------|------|
| Edge cases | Unusual inputs | System crashes |
| Boundaries | Limit testing | Data truncation |
| Negative paths | Invalid inputs | Poor error handling |
| Concurrency | Multi-user scenarios | Race conditions |
| Recovery | Error recovery | Data corruption |

### 6.3 Accessibility Testing

**Accessibility Requirements:**

| Requirement | Standard | Validation |
|-------------|----------|------------|
| Screen reader | WCAG 2.1 AA | JAWS/NVDA testing |
| Keyboard navigation | WCAG 2.1 AA | Tab order verification |
| Color contrast | 4.5:1 minimum | Contrast checker |
| Text sizing | 200% zoom support | Browser zoom test |

---

## 7. Performance Testing

### 7.1 Performance Test Framework

**Load Testing Tool:** Azure Load Testing (integrated with Power Platform)

**Test Configuration:**

| Parameter | Value |
|-----------|-------|
| Virtual Users | 10-150 |
| Ramp-up | 5 minutes |
| Steady State | 15-30 minutes |
| Ramp-down | 2 minutes |
| Think Time | 3-5 seconds |

### 7.2 Performance Scenarios

**Scenario 1: Capability Response Time**

```
Test: Single capability execution latency

Setup:
- 10 concurrent users
- Each user executes capability every 10 seconds

Measure:
- P50, P95, P99 response times
- Error rate
- Throughput

Pass Criteria:
- P95 < 5 seconds
- Error rate < 1%
```

**Scenario 2: Multi-Agent Workflow**

```
Test: Complete media planning workflow

Setup:
- 25 concurrent users
- Each executes full workflow

Workflow:
1. Start session
2. Channel selection (CHA)
3. Budget projection (ANL)
4. Document generation (DOC)

Measure:
- End-to-end completion time
- Drop-off rate
- Resource utilization

Pass Criteria:
- 90% complete within 60 seconds
- Zero drop-offs due to errors
```

### 7.3 Performance Baselines

| Metric | Baseline | Target | Alert |
|--------|----------|--------|-------|
| ANL_MARGINAL_RETURN | 2.1s | < 3s | > 5s |
| ANL_SCENARIO_COMPARE | 3.4s | < 5s | > 8s |
| AUD_SEGMENT_PRIORITY | 2.8s | < 4s | > 6s |
| CHA_CHANNEL_MIX | 3.2s | < 5s | > 8s |
| ORC_INTENT_CLASSIFY | 0.9s | < 2s | > 3s |
| DOC_GENERATE | 5.1s | < 8s | > 12s |

### 7.4 Capacity Limits

| Resource | Limit | Test Approach |
|----------|-------|---------------|
| Concurrent sessions | 100 | Load test to 150 |
| API calls/day | 80,000 | Stress test 100K |
| AI Builder/month | 10,000 | Track during load |
| Flow runs/day | 8,000 | Monitor at peak |

---

## 8. Deployment Validation

### 8.1 Pre-Deployment Checklist

**Code Quality:**
- [ ] All unit tests pass
- [ ] Code review approved
- [ ] No critical static analysis findings
- [ ] Documentation updated

**Integration:**
- [ ] Integration tests pass
- [ ] Flow connections valid
- [ ] KB files uploaded successfully
- [ ] Dataverse schema matches

**Regression:**
- [ ] Full regression suite passes (100%)
- [ ] No new failures vs. previous run
- [ ] Performance within baseline

**Compliance:**
- [ ] KB documents pass 6-Rule validation
- [ ] Character limits verified
- [ ] No blocked connectors in solution
- [ ] Security scan passed

### 8.2 Deployment Smoke Tests

Execute immediately after deployment:

| Test | Validate | Max Time |
|------|----------|----------|
| Agent Availability | All 10 agents respond | 2 min |
| Routing | Basic intent classification | 1 min |
| Capability Execution | ANL_MARGINAL_RETURN works | 2 min |
| Session Management | Create/read/update session | 1 min |
| KB Retrieval | Relevant content retrieved | 1 min |
| Telemetry | Events logged to table | 1 min |
| Document Generation | Basic document created | 2 min |

**Smoke Test Flow:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    SMOKE TEST FLOW                              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  Start: Post-deployment trigger                                 â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Test 1: Ping each agent                                        â”‚
â”‚  â””â”€â”€ Expected: "Hello" response from each                       â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Test 2: Intent classification                                  â”‚
â”‚  â””â”€â”€ Send "Help me plan my budget" â†’ Expect ANL routing        â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Test 3: Execute capability                                     â”‚
â”‚  â””â”€â”€ Call ANL_MARGINAL_RETURN â†’ Expect JSON result             â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Test 4: Verify telemetry                                       â”‚
â”‚  â””â”€â”€ Query eap_telemetry â†’ Expect new records                  â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  Result: Pass all â†’ Deployment successful                       â”‚
â”‚          Fail any â†’ Alert and prepare rollback                  â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 8.3 Post-Deployment Monitoring

**First 30 Minutes:**
- Monitor error rate (should be < 2%)
- Watch response times (should match baseline)
- Check telemetry for anomalies
- Review user-reported issues

**First 24 Hours:**
- Run hourly health checks
- Compare metrics to pre-deployment baseline
- Monitor user feedback channel
- Keep rollback ready

**First Week:**
- Full regression run daily
- Performance trending analysis
- User satisfaction survey
- Defect triage

### 8.4 Rollback Criteria

Trigger rollback if:
- Error rate > 5% for 15 minutes
- P95 response time > 10 seconds
- Critical capability unavailable
- Data corruption detected
- Security vulnerability identified

**Rollback Procedure:**
1. Import previous solution version
2. Restore eap_capability_implementation records
3. Verify with smoke tests
4. Notify stakeholders
5. Document incident

---

## 9. Quality Metrics

### 9.1 Quality Dashboard Metrics

| Category | Metric | Calculation | Target |
|----------|--------|-------------|--------|
| **Reliability** | Capability Success Rate | Successes / Total Calls | > 99% |
| **Reliability** | Error Rate | Errors / Total Calls | < 1% |
| **Performance** | P95 Response Time | 95th percentile latency | < 5s |
| **Performance** | Throughput | Requests per minute | > 100 |
| **Quality** | Test Pass Rate | Passed / Total Tests | 100% |
| **Quality** | Defect Escape Rate | Prod Defects / Total Defects | < 2% |
| **UX** | User Satisfaction | Thumbs Up / Total Feedback | > 90% |
| **UX** | Routing Accuracy | Correct Routes / Total Routes | > 95% |

### 9.2 Defect Tracking

**Defect Severity:**

| Severity | Definition | SLA |
|----------|------------|-----|
| Critical | System unusable | Fix in 4 hours |
| High | Major feature broken | Fix in 24 hours |
| Medium | Minor feature issue | Fix in 72 hours |
| Low | Cosmetic/enhancement | Next sprint |

**Defect Categories:**

| Category | Description | Examples |
|----------|-------------|----------|
| Functional | Feature doesn't work | Capability returns wrong result |
| Performance | Slow or resource issues | Response > 10 seconds |
| UX | Poor user experience | Confusing error message |
| Integration | Component interaction | Flow fails to call AI Builder |
| Data | Data quality issues | Benchmark data outdated |

### 9.3 Quality Trends

Track weekly/monthly:

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Trend |
|--------|--------|--------|--------|--------|-------|
| Test Pass Rate | 98.5% | 99.2% | 100% | 100% | â†‘ |
| Error Rate | 1.2% | 0.9% | 0.8% | 0.7% | â†“ |
| P95 Latency | 4.8s | 4.5s | 4.2s | 4.0s | â†“ |
| User Satisfaction | 88% | 90% | 91% | 92% | â†‘ |
| Defects Found | 5 | 3 | 2 | 1 | â†“ |

---

## 10. Continuous Improvement

### 10.1 Test Improvement Process

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              CONTINUOUS IMPROVEMENT CYCLE                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  ANALYZE                                                        â”‚
â”‚  â”œâ”€â”€ Review defect escapes                                      â”‚
â”‚  â”œâ”€â”€ Identify test gaps                                         â”‚
â”‚  â””â”€â”€ Analyze failure patterns                                   â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  PLAN                                                           â”‚
â”‚  â”œâ”€â”€ Prioritize improvements                                    â”‚
â”‚  â”œâ”€â”€ Design new test cases                                      â”‚
â”‚  â””â”€â”€ Update test strategy                                       â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  IMPLEMENT                                                      â”‚
â”‚  â”œâ”€â”€ Add/modify test cases                                      â”‚
â”‚  â”œâ”€â”€ Update automation                                          â”‚
â”‚  â””â”€â”€ Enhance tooling                                            â”‚
â”‚         â”‚                                                       â”‚
â”‚         â–¼                                                       â”‚
â”‚  MEASURE                                                        â”‚
â”‚  â”œâ”€â”€ Track effectiveness                                        â”‚
â”‚  â”œâ”€â”€ Monitor metrics                                            â”‚
â”‚  â””â”€â”€ Gather feedback                                            â”‚
â”‚         â”‚                                                       â”‚
â”‚         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º (return to ANALYZE)                    â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 10.2 Defect Prevention

| Prevention Method | Implementation |
|-------------------|----------------|
| Root Cause Analysis | 5 Whys for every escaped defect |
| Test Case Review | New tests for each defect type |
| Code Review Focus | Checklist based on defect patterns |
| Prompt Validation | Pre-commit prompt quality checks |
| Monitoring Alerts | Early detection of quality issues |

### 10.3 Test Maintenance

| Task | Frequency | Owner |
|------|-----------|-------|
| Review flaky tests | Weekly | QA Lead |
| Update expected values | Per release | QA Team |
| Retire obsolete tests | Monthly | QA Lead |
| Add new scenario coverage | Per feature | Developers |
| Refresh test data | Monthly | QA Team |

### 10.4 Lessons Learned Log

Document learnings from each release:

| Date | Issue | Root Cause | Improvement |
|------|-------|------------|-------------|
| 2026-01-15 | ANL capability returned NaN | Missing null check | Added validation test |
| 2026-01-10 | Routing failed for complex queries | Insufficient training examples | Added edge case tests |
| 2026-01-05 | KB retrieval missed relevant doc | Chunk size too large | Optimized chunking |

---

## Document References

| Document | Purpose |
|----------|---------|
| [01-MCMAP_Executive_Summary.md](./01-MCMAP_Executive_Summary.md) | Executive overview |
| [02-MCMAP_System_Architecture.md](./02-MCMAP_System_Architecture.md) | Technical architecture |
| [03-MCMAP_Security_Compliance.md](./03-MCMAP_Security_Compliance.md) | Security framework |
| [04-MCMAP_Agent_Capabilities.md](./04-MCMAP_Agent_Capabilities.md) | Agent reference |
| [05-MCMAP_Data_Architecture.md](./05-MCMAP_Data_Architecture.md) | Data governance |
| [06-MCMAP_AIBuilder_Integration.md](./06-MCMAP_AIBuilder_Integration.md) | AI Builder reference |
| [07-MCMAP_Operational_Runbook.md](./07-MCMAP_Operational_Runbook.md) | Operations guide |

---

**Document Control:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-23 | MCMAP Team | Initial release |

---

*MCMAP Quality Assurance & Testing - Mastercard Internal*
