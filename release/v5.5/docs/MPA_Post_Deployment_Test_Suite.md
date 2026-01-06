# MPA V5.5 POST-DEPLOYMENT TEST SUITE

## Overview

This test suite validates MPA v5.5 deployment completeness and functionality. Run all tests in sequence after completing deployment phases. Tests are organized by component and criticality.

**Estimated Time:** 60-90 minutes
**Environment:** Personal (Aragorn AI) or Corporate (Mastercard)
**Tester:** ________________________________
**Date:** ________________________________

---

## Prerequisites

Complete these checks before beginning the test suite:

| Prerequisite | Status |
|--------------|--------|
| All deployment phases complete | [ ] Verified |
| Copilot agent published | [ ] Verified |
| SharePoint KB files uploaded | [ ] Verified |
| SharePoint indexing complete (wait 1-4 hours after upload) | [ ] Verified |
| Seed data imported to Dataverse | [ ] Verified |
| All Power Automate flows enabled | [ ] Verified |
| Azure Functions deployed and healthy | [ ] Verified |
| Test user account has appropriate permissions | [ ] Verified |

---

## SECTION 1: INFRASTRUCTURE TESTS

These tests verify the underlying infrastructure is operational.

### Test 1.1: Azure Functions Health Check

**Priority:** Critical
**Component:** Azure Functions

**Action:**
```bash
curl -X GET "https://{FUNCTION_APP_URL}/api/health" \
  -H "x-functions-key: {FUNCTION_APP_KEY}"
```

**Expected Result:**
```json
{
  "status": "healthy",
  "version": "5.5.0",
  "timestamp": "[ISO datetime]",
  "components": {
    "dataverse": "connected",
    "functions": "operational"
  }
}
```

**Pass Criteria:**
- HTTP 200 response
- Status is "healthy"
- All components show connected/operational

**If Fails:**
1. Check Function App is running in Azure Portal
2. Verify function key is correct
3. Check Application Insights for errors
4. Verify Managed Identity has Dataverse permissions

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 1.2: Dataverse Connectivity

**Priority:** Critical
**Component:** Dataverse

**Action:**
```bash
curl -X POST "https://{FUNCTION_APP_URL}/api/benchmarks/search" \
  -H "x-functions-key: {FUNCTION_APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"vertical": "RETAIL", "channel": "PAID_SEARCH"}'
```

**Expected Result:**
```json
{
  "benchmarks": [
    {
      "vertical": "RETAIL",
      "channel": "PAID_SEARCH",
      "metric": "CPM",
      "value": [value],
      "source": "IAB/Benchmark Study 2024"
    }
  ],
  "count": [number > 0]
}
```

**Pass Criteria:**
- HTTP 200 response
- Returns at least one benchmark record
- Data matches expected format

**If Fails:**
1. Verify seed data was imported
2. Check mpa_benchmarks table has records
3. Verify SearchBenchmarks function deployed
4. Check Managed Identity permissions on Dataverse

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 1.3: SharePoint KB Accessibility

**Priority:** Critical
**Component:** SharePoint

**Action:**
1. Navigate to SharePoint site: {SHAREPOINT_URL}
2. Open document library: {KB_LIBRARY_NAME}
3. Verify all 22 KB files are present
4. Open one file to confirm content is accessible

**Expected Result:**
- Document library accessible
- 22 files with _v5_5.txt suffix visible
- Files open and display content correctly

**Pass Criteria:**
- All 22 files present
- Files are readable
- No permission errors

**If Fails:**
1. Verify upload script completed successfully
2. Check SharePoint permissions
3. Re-run upload_kb_files.py with --overwrite flag
4. Verify Copilot Studio service principal has read access

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 1.4: Power Automate Flow Status

**Priority:** Critical
**Component:** Power Automate

**Action:**
1. Navigate to Power Automate: https://make.powerautomate.com
2. Select environment: {ENVIRONMENT_NAME}
3. Go to My flows or Cloud flows
4. Verify all 11 MPA flows exist and are enabled

**Expected Flows:**
| Flow Name | Status Expected |
|-----------|-----------------|
| MPA - Create Session | On |
| MPA - Update Session | On |
| MPA - Get Session | On |
| MPA - Search Knowledge Base | On |
| MPA - Get Benchmarks | On |
| MPA - Analyze Gaps | On |
| MPA - Generate Document | On |
| MPA - Log Audit Event | On |
| MPA - Get Feature Flags | On |
| MPA - Calculate Budget | On |
| MPA - Promote Learning | On |

**Pass Criteria:**
- All 11 flows present
- All flows show "On" status
- No flows show error state

**If Fails:**
1. Check if flows were created
2. Verify flow connections are authenticated
3. Re-enable any disabled flows
4. Check for connection reference errors

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 1.5: Copilot Studio Agent Status

**Priority:** Critical
**Component:** Copilot Studio

**Action:**
1. Navigate to Copilot Studio: {COPILOT_ENV_URL}
2. Open Media Planning Agent
3. Verify agent is published
4. Check Knowledge sources show SharePoint connected
5. Check Actions show all flows connected

**Expected Result:**
- Agent status: Published
- Knowledge: 1 SharePoint source connected
- Actions: 11 flows connected

**Pass Criteria:**
- Agent is published and accessible
- No configuration errors shown
- All integrations connected

**If Fails:**
1. Republish agent
2. Reconnect SharePoint knowledge source
3. Reconnect flow actions
4. Verify authentication on all connections

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

## SECTION 2: AGENT CONVERSATION TESTS

These tests verify the agent responds correctly to user interactions.

### Test 2.1: Version Verification

**Priority:** High
**Component:** Agent Instructions

**Prompt:** "What version of the Media Planning Agent is this?"

**Expected Response Should Include:**
- Reference to version 5.5 or v5.5
- Reference to January 2026 or current date
- May include capability summary

**Pass Criteria:**
- Agent identifies as v5.5
- Response is conversational, not technical

**If Fails:**
1. Verify Copilot instructions were updated
2. Check instructions character count (should be ~7,808)
3. Republish agent after instruction update

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.2: Knowledge Base Access

**Priority:** Critical
**Component:** SharePoint KB

**Prompt:** "Describe your philosophy on marketing measurement and why ROAS might not be the best primary KPI."

**Expected Response Should Include:**
- Incrementality-first measurement approach
- LTV governs CAC principle
- Explanation of ROAS limitations (attribution issues, optimization toward measurable not valuable)
- Reference to holdout testing or matched market testing

**Pass Criteria:**
- Response demonstrates access to KB content
- Measurement philosophy accurately represented
- Specific terminology from MEASUREMENT_FRAMEWORK_v5_5.txt present

**If Fails:**
1. Verify SharePoint KB connected in Copilot Studio
2. Check indexing status (may take 1-4 hours)
3. Verify file naming includes _v5_5.txt suffix
4. Test with simpler KB query

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.3: Workflow Initiation - GUIDED Path

**Priority:** Critical
**Component:** Core Workflow

**Prompt:** "I need help creating a media plan for a retail brand. We have about $500,000 to spend next quarter and want to drive online sales."

**Expected Response Should Include:**
- Acknowledgment of retail vertical and budget
- Questions to gather more context (audience, competitive landscape, existing channels)
- Strategic advisory tone (not transactional)
- Reference to GUIDED workflow or step-by-step approach

**Pass Criteria:**
- Agent initiates planning workflow
- Asks clarifying questions (not just providing generic answer)
- Demonstrates understanding of media planning methodology

**If Fails:**
1. Check CORE_METHODOLOGY_v5_5.txt is indexed
2. Verify workflow instructions in agent configuration
3. Test with explicit workflow trigger

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.4: Benchmark Lookup

**Priority:** High
**Component:** Benchmarks Flow

**Prompt:** "What are typical CPM rates for paid social advertising in the retail industry?"

**Expected Response Should Include:**
- Specific CPM range or value
- Reference to data source or recency
- May include comparison to other channels
- May include factors that affect CPM

**Pass Criteria:**
- Provides specific numeric benchmark data
- Data appears reasonable for retail paid social (typically $5-15 CPM range)
- Sources or caveats mentioned

**If Fails:**
1. Test SearchBenchmarks function directly via curl
2. Verify seed data imported for RETAIL vertical
3. Check MPA - Get Benchmarks flow is connected
4. Verify flow runs successfully in Power Automate

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.5: Budget Allocation Recommendation

**Priority:** High
**Component:** Budget Optimization

**Prompt:** "I have a $1 million annual budget for a DTC ecommerce brand. How should I allocate this across channels for a balanced awareness and performance strategy?"

**Expected Response Should Include:**
- Percentage or dollar allocations by channel
- Rationale for allocation decisions
- Balance between upper and lower funnel
- Recommendation aligned with DTC/ecommerce context

**Pass Criteria:**
- Provides specific allocation percentages
- Allocations sum to approximately 100%
- Rationale connects to business context

**If Fails:**
1. Check BUDGET_ALLOCATION_v5_5.txt is indexed
2. Verify Calculate Budget flow is connected
3. Test with simpler budget question

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.6: Channel Mix Recommendation

**Priority:** High
**Component:** Channel Strategy

**Prompt:** "Should I invest more in CTV or YouTube for brand awareness? What are the tradeoffs?"

**Expected Response Should Include:**
- Comparison of CTV vs YouTube for awareness
- Audience reach considerations
- Cost efficiency comparison
- Measurement differences
- Specific recommendation with rationale

**Pass Criteria:**
- Provides balanced comparison
- Demonstrates channel expertise
- Gives actionable recommendation

**If Fails:**
1. Check CHANNEL_PLAYBOOKS_v5_5.txt is indexed
2. Verify MPA_Expert_Lens_Channel_Mix.txt content
3. Test with single-channel question

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.7: Gap Analysis Request

**Priority:** High
**Component:** Gap Analyzer

**Prompt:** "Can you review this media plan and identify any gaps? Budget: $500K, Channels: 60% Paid Search, 30% Paid Social, 10% Display. Objective: Drive online sales for a B2B SaaS company."

**Expected Response Should Include:**
- Identification of missing elements (measurement plan, audience strategy, etc.)
- Channel mix assessment for B2B SaaS context
- Specific gap categories (strategy, tactical, measurement, creative)
- Recommendations to address gaps

**Pass Criteria:**
- Identifies at least 2-3 specific gaps
- Gaps are relevant to B2B SaaS context
- Provides prioritized recommendations

**If Fails:**
1. Check Analyze Gaps flow is connected
2. Verify GAP_DETECTION_v5_5.txt is indexed
3. Test with more detailed plan input

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.8: Industry-Specific Guidance

**Priority:** Medium
**Component:** Industry Framework

**Prompt:** "What are the key considerations for media planning in the financial services industry?"

**Expected Response Should Include:**
- Regulatory compliance considerations
- Trust and credibility messaging
- Longer consideration cycles
- Channel preferences for financial services
- Audience targeting approaches

**Pass Criteria:**
- Response is specific to financial services
- Demonstrates industry expertise
- Actionable guidance provided

**If Fails:**
1. Check INDUSTRY_FRAMEWORK_v5_5.txt is indexed
2. Verify financial services vertical in seed data
3. Test with different industry

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.9: Session Continuity

**Priority:** Medium
**Component:** Session Management

**Prompt Sequence:**
1. "Let's start planning a campaign for a healthcare company with a $2M budget."
2. [Wait for response]
3. "Based on what we just discussed, what channels would you recommend?"

**Expected Result:**
- Second response references healthcare context from first message
- Maintains budget awareness ($2M)
- Builds on previous conversation without requiring re-explanation

**Pass Criteria:**
- Context maintained across turns
- No "I don't have context" responses
- Coherent conversation flow

**If Fails:**
1. Check session management flow is working
2. Verify eap_sessions table is receiving records
3. Check session timeout settings

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.10: Error Handling - Invalid Input

**Priority:** Medium
**Component:** Error Handling

**Prompt:** "Create a media plan with a budget of negative five million dollars for the underwater basket weaving industry."

**Expected Response Should Include:**
- Graceful handling of invalid budget
- Either asks for clarification or explains constraints
- Does not crash or return error message
- May attempt to interpret intent constructively

**Pass Criteria:**
- No error messages exposed to user
- Maintains conversational tone
- Provides path forward

**If Fails:**
1. Review error handling in agent instructions
2. Check flow error handling configuration
3. Verify validation logic in functions

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.11: Document Generation Request

**Priority:** Medium
**Component:** Document Generator

**Prompt:** "Generate a media plan summary document for everything we've discussed." (Use after completing a planning conversation)

**Expected Response Should Include:**
- Acknowledgment of document generation request
- Summary of what will be included
- Either provides document or explains how to access

**Pass Criteria:**
- Document generation flow triggered
- Document created or clear explanation provided
- No errors or broken functionality

**If Fails:**
1. Check Generate Document flow is connected
2. Verify DocumentGenerator Azure Function
3. Check document template exists

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.12: Retail Media Networks Expertise

**Priority:** Medium
**Component:** Advanced KB Content

**Prompt:** "Explain the tradeoffs between Amazon Ads and Walmart Connect for a CPG brand's retail media strategy."

**Expected Response Should Include:**
- Comparison of both platforms
- Audience and reach differences
- Measurement capabilities
- Strategic recommendations for CPG

**Pass Criteria:**
- Demonstrates RMN expertise
- Provides specific platform comparison
- Actionable for CPG context

**If Fails:**
1. Check RETAIL_MEDIA_NETWORKS_v1.txt is indexed
2. Verify KB file uploaded successfully
3. Test with simpler RMN question

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.13: Multi-Turn Complex Planning

**Priority:** Medium
**Component:** Full Workflow

**Prompt Sequence:**
1. "I'm the marketing director at a mid-size ecommerce company selling home goods. We're planning our Q2 campaign."
2. "Our budget is $750K and we want to balance brand awareness with driving sales during our spring promotion."
3. "Our target audience is homeowners aged 30-55 with household income above $100K."
4. "What channels do you recommend and how should we allocate the budget?"
5. "What KPIs should we track and how should we measure success?"

**Expected Result:**
- Coherent progression through planning workflow
- Each response builds on previous context
- Final recommendations are specific and actionable
- Measurement framework appropriate for objectives

**Pass Criteria:**
- Maintains context through all 5 turns
- Provides specific channel and budget recommendations
- Measurement plan aligns with objectives

**If Fails:**
1. Check session persistence across turns
2. Verify all relevant KB files indexed
3. Test shorter conversation sequence

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.14: Competitive Context Handling

**Priority:** Low
**Component:** Strategic Advisory

**Prompt:** "Our main competitor just increased their digital ad spend by 50%. How should we respond?"

**Expected Response Should Include:**
- Strategic framing (not just match spending)
- Questions about competitive landscape
- Options with tradeoffs
- Caution against reactive decisions

**Pass Criteria:**
- Demonstrates strategic thinking
- Does not recommend simply matching competitor
- Provides nuanced guidance

**If Fails:**
1. Review strategic advisory content in instructions
2. Check COMPETITIVE_CONTEXT KB content if exists
3. Acceptable if response is generically strategic

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 2.15: Feature Flag Awareness (Corporate Only)

**Priority:** Medium (Corporate) / Skip (Personal)
**Component:** Feature Flags

**Prompt:** "Can you search the web for recent CPM benchmarks?" (In corporate environment where web search is disabled)

**Expected Response Should Include:**
- Acknowledgment that web search is not available
- Explanation of internal data sources
- Offer to provide data from internal benchmarks

**Pass Criteria:**
- Does not attempt web search
- Graceful fallback message
- Still provides helpful response

**If Fails:**
1. Check feature flags imported correctly
2. Verify WEB_SEARCH flag is set to disabled
3. Check Get Feature Flags flow is working

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED (Personal Env)

**Notes:** ________________________________

---

## SECTION 3: FLOW EXECUTION TESTS

These tests verify Power Automate flows execute correctly.

### Test 3.1: Create Session Flow

**Priority:** Critical
**Component:** Session Management

**Action:**
1. Start a new conversation with the agent
2. Send any planning-related message
3. Check eap_sessions table in Dataverse

**Expected Result:**
- New record created in eap_sessions
- Record contains: session_id, agent_code (MPA), user_id, created_at
- Status field shows "active"

**Pass Criteria:**
- Record created within 30 seconds of conversation start
- All required fields populated
- No duplicate sessions for same conversation

**If Fails:**
1. Check MPA - Create Session flow run history
2. Verify Dataverse connection in flow
3. Check eap_sessions table permissions

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 3.2: Get Benchmarks Flow

**Priority:** High
**Component:** Benchmark Lookup

**Action:**
1. Ask agent: "What's the average CTR for display ads in automotive?"
2. Check MPA - Get Benchmarks flow run history

**Expected Result:**
- Flow triggered and completed successfully
- Response includes specific CTR data
- Flow run history shows "Succeeded"

**Pass Criteria:**
- Flow executes without errors
- Returns data within 10 seconds
- Data matches mpa_benchmarks table

**If Fails:**
1. Check flow run history for error details
2. Verify Dataverse query in flow
3. Test SearchBenchmarks function directly

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 3.3: Log Audit Event Flow (Corporate Only)

**Priority:** High (Corporate) / Low (Personal)
**Component:** Audit Logging

**Action:**
1. Perform any agent interaction
2. Check audit table in Dataverse (eap_audit or mpa_mc_audit)

**Expected Result:**
- Audit record created
- Record contains: timestamp, user_id, action, agent_code
- Sensitive data not logged in plain text

**Pass Criteria:**
- Audit record created for each interaction
- All required fields populated
- Retention policy applied

**If Fails:**
1. Check MPA - Log Audit Event flow
2. Verify audit table exists and has correct schema
3. Check flow trigger configuration

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED (Personal Env)

**Notes:** ________________________________

---

### Test 3.4: Search Knowledge Base Flow

**Priority:** High
**Component:** KB Search

**Action:**
1. Ask agent a question requiring KB lookup
2. Monitor MPA - Search Knowledge Base flow

**Expected Result:**
- Flow triggered
- Returns relevant KB content
- Agent response reflects KB content

**Pass Criteria:**
- Flow completes successfully
- Response time under 15 seconds
- Content is relevant to query

**If Fails:**
1. Check SharePoint connection in flow
2. Verify KB library indexing status
3. Test direct SharePoint search

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

## SECTION 4: SECURITY TESTS (CORPORATE ONLY)

Skip this section for personal environment deployments.

### Test 4.1: Row-Level Security

**Priority:** Critical (Corporate)
**Component:** Access Control

**Action:**
1. Log in as User A (Team Alpha)
2. Create a session and media plan
3. Log in as User B (Team Beta)
4. Attempt to access User A's session

**Expected Result:**
- User B cannot see User A's session
- Query returns empty or access denied
- No data leakage between teams

**Pass Criteria:**
- Complete data isolation between security boundaries
- No errors exposing data existence

**If Fails:**
1. Check row-level security configuration
2. Verify user team assignments
3. Review Dataverse security roles

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED (Personal Env)

**Notes:** ________________________________

---

### Test 4.2: Data Firewall - External API Block

**Priority:** Critical (Corporate)
**Component:** Security

**Action:**
1. Attempt any action that would trigger external API call
2. Verify call is blocked or redirected

**Expected Result:**
- External API calls do not execute
- Graceful fallback to internal data
- No data exfiltration possible

**Pass Criteria:**
- All external calls blocked
- User receives appropriate message
- Functionality degrades gracefully

**If Fails:**
1. Check feature flag configuration
2. Verify network policies
3. Review function app outbound restrictions

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED (Personal Env)

**Notes:** ________________________________

---

### Test 4.3: SSO Enforcement

**Priority:** Critical (Corporate)
**Component:** Authentication

**Action:**
1. Attempt to access agent without Mastercard SSO
2. Verify authentication is required

**Expected Result:**
- Unauthenticated access blocked
- Redirects to SSO login
- Session established after authentication

**Pass Criteria:**
- No anonymous access possible
- SSO integration functional
- User identity captured correctly

**If Fails:**
1. Check Copilot Studio authentication settings
2. Verify Azure AD app registration
3. Review Teams app permissions

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED (Personal Env)

**Notes:** ________________________________

---

### Test 4.4: Audit Log Completeness

**Priority:** High (Corporate)
**Component:** Compliance

**Action:**
1. Perform 5 different agent interactions
2. Query audit log for all 5 events

**Expected Result:**
- All 5 events logged
- Each event has complete metadata
- Timestamps are accurate

**Pass Criteria:**
- 100% of interactions audited
- No gaps in audit trail
- Data retention policy applied

**If Fails:**
1. Check audit flow is triggered
2. Verify async logging not dropping events
3. Review audit table capacity

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIPPED (Personal Env)

**Notes:** ________________________________

---

## SECTION 5: EDGE CASES AND ERROR HANDLING

### Test 5.1: Session Timeout Handling

**Priority:** Medium
**Component:** Session Management

**Action:**
1. Start a conversation
2. Wait for session timeout period (60+ minutes)
3. Resume conversation

**Expected Result:**
- New session created or session resumed gracefully
- User informed if context was lost
- No error messages

**Pass Criteria:**
- Graceful handling of timeout
- Clear user communication
- Ability to continue planning

**If Fails:**
1. Check session timeout configuration
2. Verify session resume flow
3. Review error handling in instructions

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 5.2: Large Input Handling

**Priority:** Low
**Component:** Input Validation

**Action:**
Send a very long message (2000+ characters) with a detailed media plan for review

**Expected Result:**
- Agent processes input without error
- Response addresses key points
- No truncation errors

**Pass Criteria:**
- Handles large input gracefully
- Provides useful response
- No timeout or errors

**If Fails:**
1. Check token limits in configuration
2. Verify input truncation handling
3. Review function timeout settings

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 5.3: Concurrent User Handling

**Priority:** Medium
**Component:** Scalability

**Action:**
1. Have 3+ users interact with agent simultaneously
2. Verify each user's session is isolated
3. Check for performance degradation

**Expected Result:**
- All users receive responses
- No session cross-contamination
- Response times remain acceptable

**Pass Criteria:**
- All concurrent sessions function correctly
- No data leakage between users
- Response time under 30 seconds

**If Fails:**
1. Check Dataverse connection pooling
2. Verify session isolation logic
3. Review Azure Function scaling settings

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 5.4: Missing Data Graceful Degradation

**Priority:** Medium
**Component:** Error Handling

**Action:**
Ask for benchmarks for a vertical/channel combination that doesn't exist in seed data

**Expected Result:**
- Agent acknowledges data gap
- Provides alternative guidance or estimates
- Does not return error

**Pass Criteria:**
- Graceful handling of missing data
- Helpful alternative response
- No technical errors exposed

**If Fails:**
1. Review error handling in SearchBenchmarks function
2. Check agent instructions for data gap handling
3. Verify fallback logic in flows

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

### Test 5.5: Flow Failure Recovery

**Priority:** Medium
**Component:** Resilience

**Action:**
1. Temporarily disable one flow (e.g., Get Benchmarks)
2. Trigger functionality that uses that flow
3. Verify graceful degradation
4. Re-enable flow

**Expected Result:**
- Agent continues to function
- User informed of limited functionality
- No cascading failures

**Pass Criteria:**
- Single flow failure doesn't break agent
- Clear communication to user
- Recovery when flow re-enabled

**If Fails:**
1. Review error handling in agent instructions
2. Add try-catch patterns to flow calls
3. Implement circuit breaker pattern

**Result:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Notes:** ________________________________

---

## TEST RESULTS SUMMARY

### Results by Section

| Section | Total Tests | Passed | Failed | Blocked | Skipped |
|---------|-------------|--------|--------|---------|---------|
| 1. Infrastructure | 5 | | | | |
| 2. Agent Conversation | 15 | | | | |
| 3. Flow Execution | 4 | | | | |
| 4. Security (Corp Only) | 4 | | | | |
| 5. Edge Cases | 5 | | | | |
| **TOTAL** | **33** | | | | |

### Results by Priority

| Priority | Total | Passed | Failed | Blocked |
|----------|-------|--------|--------|---------|
| Critical | 10 | | | |
| High | 12 | | | |
| Medium | 9 | | | |
| Low | 2 | | | |

### Critical Failures (Must Fix Before Go-Live)

| Test ID | Test Name | Issue | Remediation |
|---------|-----------|-------|-------------|
| | | | |
| | | | |
| | | | |

### Known Issues / Accepted Limitations

| Test ID | Test Name | Issue | Acceptance Rationale |
|---------|-----------|-------|---------------------|
| | | | |
| | | | |

---

## SIGN-OFF

### Test Execution Sign-Off

| Role | Name | Date | Result | Signature |
|------|------|------|--------|-----------|
| Test Executor | ________________ | ________ | ________ | ________ |
| Technical Lead | ________________ | ________ | ________ | ________ |

### Go-Live Approval

| Criteria | Status |
|----------|--------|
| All Critical tests passed | [ ] Yes  [ ] No |
| All High priority tests passed | [ ] Yes  [ ] No |
| No unmitigated security issues | [ ] Yes  [ ] No |
| Known issues documented and accepted | [ ] Yes  [ ] No |

**Go-Live Decision:** [ ] APPROVED  [ ] NOT APPROVED

**Approver:** ________________________________

**Date:** ________________________________

---

## APPENDIX A: QUICK REFERENCE COMMANDS

### Azure Functions Health Check
```bash
curl -X GET "https://{FUNCTION_APP_URL}/api/health" \
  -H "x-functions-key: {FUNCTION_APP_KEY}"
```

### Benchmark Search Test
```bash
curl -X POST "https://{FUNCTION_APP_URL}/api/benchmarks/search" \
  -H "x-functions-key: {FUNCTION_APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"vertical": "RETAIL"}'
```

### Session Query (Dataverse)
```
https://{DATAVERSE_URL}/api/data/v9.2/eap_sessions?$filter=agent_code eq 'MPA'&$top=10
```

### Benchmark Count Query
```
https://{DATAVERSE_URL}/api/data/v9.2/mpa_benchmarks?$count=true
```

---

## APPENDIX B: ENVIRONMENT VALUES

Fill in for quick reference during testing:

| Value | Personal (Aragorn AI) | Corporate (Mastercard) |
|-------|----------------------|------------------------|
| Function App URL | https://func-aragorn-mpa.azurewebsites.net | ________________ |
| Function Key | [stored securely] | ________________ |
| Dataverse URL | https://aragornai.crm.dynamics.com | ________________ |
| SharePoint URL | https://kesseldigitalcom.sharepoint.com/sites/KesselDigital | ________________ |
| Copilot Studio URL | https://copilotstudio.microsoft.com/environments/c672b470-9cc7-e9d8-a0e2-ca83751f800c | ________________ |

---

## REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | MPA Deployment | Initial test suite creation |
