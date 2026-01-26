# MPA KB VERIFICATION TEST SUITE

Version: 1.0
Date: January 5, 2026
Purpose: Validate that KB integration is working correctly and agent grounds responses in KB content

## OVERVIEW

This test suite validates:
- KB indexing is complete and functional
- Agent consults KB before answering methodology questions
- Agent discloses source basis in responses
- Agent does not show generic greetings when data is provided
- Agent cites specific KB documents when answering

## PRE-TEST REQUIREMENTS

Before running tests verify:
- SharePoint indexing shows Ready status in Copilot Studio Knowledge tab
- PRIMARY_AGENT_INSTRUCTIONS files removed from KB
- MPA_v55_Instructions_KB_Grounded.txt deployed to Copilot Studio
- At least 2 hours elapsed since last KB file changes

## TEST CATEGORY 1: KB RETRIEVAL VALIDATION

These tests MUST trigger KB lookup and return KB-specific content that only exists in your custom documents.

### TEST 1.1: Session Types Query

INPUT: What are the four session types in MPA?

EXPECTED BEHAVIOR:
- Agent searches KB
- Response includes: Planning and InFlight and PostMortem and Audit
- Response includes source disclosure like KB SOURCE or similar
- Response does NOT show generic greeting

PASS CRITERIA:
- All four session types named correctly
- Source disclosed
- No greeting text

### TEST 1.2: Validation Gates Query

INPUT: What are the validation gates in the 10-step process?

EXPECTED BEHAVIOR:
- Agent searches KB
- Response includes: Gate 1 through Gate 4
- Response describes what each gate validates
- Source disclosed

PASS CRITERIA:
- Four gates described
- Content matches KB document content
- Source disclosed

### TEST 1.3: Data Priority Hierarchy Query

INPUT: What is the data priority hierarchy for sourcing information?

EXPECTED BEHAVIOR:
- Agent searches KB
- Response includes hierarchy: Client Data then Tool Data then Enterprise Data then Web Research then Knowledge Base
- Response includes confidence levels
- Source disclosed

PASS CRITERIA:
- Five-level hierarchy described
- Matches KB content
- Source disclosed


## TEST CATEGORY 2: ANTI-GREETING VALIDATION

These tests verify agent does NOT show generic greetings when user provides actionable data.

### TEST 2.1: Direct Data Input

INPUT: Create media plan for TechCorp B2B SaaS company with 300K budget targeting enterprise IT decision makers for lead generation.

EXPECTED BEHAVIOR:
- Agent immediately begins analysis
- Agent calculates initial projections
- Agent queries benchmarks
- Agent asks clarifying questions about conversion definition or attribution
- NO greeting or menu shown

PASS CRITERIA:
- Response starts with analysis not greeting
- Calculations included
- Source disclosed
- No capability list shown

### TEST 2.2: Budget First Entry

INPUT: I have 175K for Q2 customer acquisition campaign.

EXPECTED BEHAVIOR:
- Agent acknowledges budget
- Agent calculates customer volume scenarios using benchmark CAC ranges
- Agent asks for vertical or objective to refine
- NO greeting shown

PASS CRITERIA:
- Immediate calculation
- Benchmark data cited
- No greeting

### TEST 2.3: Problem First Entry

INPUT: Our Meta CPA increased 40 percent last month and we need to diagnose why.

EXPECTED BEHAVIOR:
- Agent recognizes diagnostic need
- Agent sets context for InFlight session type
- Agent applies significance testing framework
- Agent asks for data to perform analysis
- NO greeting shown

PASS CRITERIA:
- Diagnostic approach initiated
- Significance testing mentioned
- No greeting

## TEST CATEGORY 3: SOURCE DISCLOSURE VALIDATION

These tests verify agent discloses source basis in every response.

### TEST 3.1: Methodology Question

INPUT: How does the agent handle budget allocation across channels?

EXPECTED BEHAVIOR:
- Response includes KB SOURCE disclosure
- Specific document name cited such as Analytics_Engine or Channel_Registry
- Methodology described from KB content

PASS CRITERIA:
- KB SOURCE or similar disclosure present
- Document name mentioned
- Content matches KB

### TEST 3.2: Benchmark Question

INPUT: What are typical CAC benchmarks for Financial Services vertical?

EXPECTED BEHAVIOR:
- Agent queries MPA Search Benchmarks tool
- Response includes KB SOURCE disclosure
- Specific benchmarks provided with confidence level

PASS CRITERIA:
- Tool invocation or KB search occurred
- Source disclosed
- Benchmark values provided


## TEST CATEGORY 4: KB DEVIATION VALIDATION

These tests verify agent properly handles KB deviation scenarios.

### TEST 4.1: Client Data Supersedes Benchmark

INPUT: Our historical Meta CPA is 28 dollars which differs from industry benchmarks.

EXPECTED BEHAVIOR:
- Agent acknowledges KB benchmark exists
- Agent prioritizes client historical data per DATA PRIORITY HIERARCHY
- Agent uses client 28 dollars as baseline not KB benchmark
- Agent discloses deviation and rationale

PASS CRITERIA:
- KB benchmark mentioned
- Client data used as primary
- Deviation disclosed with reasoning

### TEST 4.2: Evidence Based Deviation

INPUT: We have 50000 customer records showing 90 percent of revenue comes from 8 percent of customers. Should we use standard targeting?

EXPECTED BEHAVIOR:
- Agent recognizes data supports RFM segmentation
- Agent deviates from broad targeting approach
- Agent recommends high-value customer focus
- Agent cites evidence for deviation

PASS CRITERIA:
- RFM or segmentation approach recommended
- Evidence cited
- Deviation from standard approach disclosed

## TEST RESULTS RECORDING

Use this template to record test results:

TEST ID: ___________
DATE: ___________
TESTER: ___________
INPUT PROVIDED: ___________
RESPONSE RECEIVED: ___________

PASS CRITERIA EVALUATION:
- KB Source Disclosed: YES / NO
- Greeting Shown: YES / NO (should be NO)
- Calculations Included: YES / NO
- Content Matches KB: YES / NO

OVERALL RESULT: PASS / FAIL

NOTES: ___________

## TEST EXECUTION SCHEDULE

INITIAL VALIDATION - Run all tests after:
- MPA_v55_Instructions deployed
- PRIMARY_AGENT_INSTRUCTIONS files removed from KB
- SharePoint indexing complete - minimum 2 hours wait

REGRESSION TESTING - Run Category 1 and Category 2 tests after:
- Any KB file changes
- Any instruction updates
- SharePoint re-indexing events

## ESCALATION PATH

If tests fail:
1. Verify SharePoint indexing status shows Ready
2. Verify correct instruction file deployed
3. Verify behavioral files removed from KB
4. Wait additional 2 hours and retest
5. If still failing contact development team

