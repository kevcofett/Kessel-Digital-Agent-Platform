# VSCODE MPA v6.0 PRODUCTION READINESS EXECUTION PROMPT

**Date:** 2026-01-19
**Context:** Complete multi-agent architecture for production deployment
**Prerequisite:** Desktop has completed registry updates and seed data

---

## MISSION

Complete the technical implementation required to make MPA v6.0 production-ready with all 10 agents (ORC, ANL, AUD, CHA, SPO, DOC, PRF, CHG, CST, MKT) fully operational.

## YOUR DELIVERABLES

### Phase 2: Flow Creation (CRITICAL - Day 1-2)

Create 9 new Power Automate flow YAML files following the established patterns.

#### 2.1 CHG Flows (3 files)

**File: `release/v6.0/agents/chg/flows/AssessReadiness.yaml`**

```yaml
# AssessReadiness Power Automate Flow Definition
# Version: 1.0.0
# Agent: CHG (Change Management)
# Description: Evaluates organizational readiness for change initiatives

name: AssessReadiness
description: >
  HTTP-triggered flow that assesses organizational readiness for change,
  identifies strengths and gaps, and provides actionable recommendations
  for successful change implementation.

trigger:
  type: HTTP
  method: POST
  schema:
    type: object
    required:
      - session_id
      - change_description
    properties:
      session_id:
        type: string
        description: Current session identifier
      change_description:
        type: string
        description: Description of the proposed change initiative
      org_context:
        type: object
        description: Organizational context including size, culture, history
        properties:
          organization_size:
            type: string
            enum: [small, medium, large, enterprise]
          change_history:
            type: string
            enum: [successful, mixed, challenging]
          culture_type:
            type: string
            enum: [innovative, traditional, hybrid]

actions:
  - name: Parse Request
    type: ParseJSON
    inputs:
      content: "@triggerBody()"
      schema: "@trigger().schema"

  - name: Get Session Context
    type: Dataverse
    operation: GetRecord
    inputs:
      table: eap_session
      filter: "eap_session_id eq '@{body('Parse Request')['session_id']}'"

  - name: Call AI Builder
    type: AIBuilder
    operation: InvokePrompt
    inputs:
      prompt_id: CHG_ASSESS_READINESS
      parameters:
        change_description: "@body('Parse Request')['change_description']"
        org_context: "@body('Parse Request')['org_context']"
        session_context: "@body('Get Session Context')"

  - name: Parse AI Response
    type: ParseJSON
    inputs:
      content: "@body('Call AI Builder')['response']"
      schema:
        type: object
        properties:
          readiness_score:
            type: number
          strengths:
            type: array
            items:
              type: string
          gaps:
            type: array
            items:
              type: string
          recommendations:
            type: array
            items:
              type: string
          confidence:
            type: string

  - name: Update Session
    type: Dataverse
    operation: UpdateRecord
    inputs:
      table: eap_session
      record_id: "@body('Get Session Context')['eap_sessionid']"
      data:
        eap_last_agent: CHG
        eap_last_capability: CHG_READINESS
        eap_modified_on: "@utcNow()"

  - name: Log Telemetry
    type: Dataverse
    operation: CreateRecord
    inputs:
      table: eap_telemetry
      data:
        eap_session_id: "@body('Parse Request')['session_id']"
        eap_agent_code: CHG
        eap_capability_code: CHG_READINESS
        eap_input_tokens: "@body('Call AI Builder')['usage']['input_tokens']"
        eap_output_tokens: "@body('Call AI Builder')['usage']['output_tokens']"
        eap_latency_ms: "@body('Call AI Builder')['latency_ms']"
        eap_success: true

response:
  status: 200
  body:
    readiness_score: "@body('Parse AI Response')['readiness_score']"
    strengths: "@body('Parse AI Response')['strengths']"
    gaps: "@body('Parse AI Response')['gaps']"
    recommendations: "@body('Parse AI Response')['recommendations']"
    confidence: "@body('Parse AI Response')['confidence']"
    agent: CHG
    capability: CHG_READINESS
```

**File: `release/v6.0/agents/chg/flows/MapStakeholders.yaml`**

Follow same pattern with:
- Input: change_description, stakeholder_list
- AI prompt: CHG_MAP_STAKEHOLDERS
- Output: stakeholder_map with power/interest/strategy per stakeholder

**File: `release/v6.0/agents/chg/flows/PlanAdoption.yaml`**

Follow same pattern with:
- Input: change_description, timeline, constraints
- AI prompt: CHG_PLAN_ADOPTION
- Output: phases, activities, success_metrics

#### 2.2 CST Flows (3 files)

**File: `release/v6.0/agents/cst/flows/SelectFramework.yaml`**

- Input: challenge_type, industry, complexity
- AI prompt: CST_SELECT_FRAMEWORK
- Output: frameworks array with fit_score, name, rationale

**File: `release/v6.0/agents/cst/flows/ApplyAnalysis.yaml`**

- Input: framework_code, inputs
- AI prompt: CST_APPLY_ANALYSIS
- Output: analysis, insights, recommendations

**File: `release/v6.0/agents/cst/flows/PrioritizeInitiatives.yaml`**

- Input: method (RICE/weighted/MoSCoW), items, criteria
- AI prompt: CST_PRIORITIZE
- Output: ranked_items with scores

#### 2.3 MKT Flows (3 files)

**File: `release/v6.0/agents/mkt/flows/DevelopStrategy.yaml`**

- Input: objectives, audience, budget, timeline
- AI prompt: MKT_DEVELOP_STRATEGY
- Output: strategy document sections, channel recommendations

**File: `release/v6.0/agents/mkt/flows/CreateBrief.yaml`**

- Input: brand_context, campaign_objectives, target_audience
- AI prompt: MKT_CREATE_BRIEF
- Output: creative_brief with all standard sections

**File: `release/v6.0/agents/mkt/flows/AnalyzeCompetitive.yaml`**

- Input: competitors, category, dimensions
- AI prompt: MKT_ANALYZE_COMPETITIVE
- Output: competitive_matrix, opportunities, threats

---

### Phase 6: Test Infrastructure (Day 3)

#### 6.1 Create Test Directories

```bash
mkdir -p release/v6.0/agents/chg/tests
mkdir -p release/v6.0/agents/mkt/tests
touch release/v6.0/agents/chg/tests/.gitkeep
touch release/v6.0/agents/mkt/tests/.gitkeep
```

#### 6.2 Update Routing Tests

**File: `release/v6.0/tests/multi-agent-routing-tests.json`**

Add these scenarios to the scenarios array:

```json
{
  "id": "RT-036",
  "category": "chg_routing",
  "name": "Route to CHG for readiness assessment",
  "input": "Assess our organization's readiness for the new CRM implementation",
  "expected_agent": "CHG",
  "expected_behavior": "Evaluate change readiness with ADKAR dimensions",
  "priority": "P0",
  "tags": ["routing", "chg", "readiness"]
},
{
  "id": "RT-037",
  "category": "chg_routing",
  "name": "Route to CHG for stakeholder mapping",
  "input": "Help me map the stakeholders for our digital transformation",
  "expected_agent": "CHG",
  "expected_behavior": "Create stakeholder analysis with power/interest grid",
  "priority": "P0",
  "tags": ["routing", "chg", "stakeholder"]
},
{
  "id": "RT-038",
  "category": "cst_routing",
  "name": "Route to CST for framework selection",
  "input": "Which strategic framework should I use to analyze market entry?",
  "expected_agent": "CST",
  "expected_behavior": "Recommend appropriate frameworks with rationale",
  "priority": "P0",
  "tags": ["routing", "cst", "framework"]
},
{
  "id": "RT-039",
  "category": "cst_routing",
  "name": "Route to CST for prioritization",
  "input": "Help me prioritize these five strategic initiatives using RICE",
  "expected_agent": "CST",
  "expected_behavior": "Score and rank initiatives with methodology",
  "priority": "P0",
  "tags": ["routing", "cst", "prioritize"]
},
{
  "id": "RT-040",
  "category": "mkt_routing",
  "name": "Route to MKT for campaign strategy",
  "input": "Develop a campaign strategy for our Q2 product launch",
  "expected_agent": "MKT",
  "expected_behavior": "Create comprehensive campaign plan",
  "priority": "P0",
  "tags": ["routing", "mkt", "campaign"]
},
{
  "id": "RT-041",
  "category": "mkt_routing",
  "name": "Route to MKT for creative brief",
  "input": "Create a creative brief for our summer brand campaign",
  "expected_agent": "MKT",
  "expected_behavior": "Generate structured creative brief",
  "priority": "P0",
  "tags": ["routing", "mkt", "brief"]
},
{
  "id": "RT-042",
  "category": "edge_cases",
  "name": "Ambiguous CHG vs CST routing",
  "input": "Help me plan this organizational initiative",
  "expected_agent": "ORC",
  "expected_behavior": "Request clarification - change vs strategy",
  "priority": "P1",
  "tags": ["routing", "ambiguous", "clarification"]
},
{
  "id": "RT-043",
  "category": "edge_cases",
  "name": "Ambiguous MKT vs CHA routing",
  "input": "How should I approach my marketing channels?",
  "expected_agent": "ORC",
  "expected_behavior": "Route to CHA for allocation, MKT for strategy",
  "priority": "P1",
  "tags": ["routing", "ambiguous", "multi-agent"]
}
```

Update the categories count:
```json
"categories": {
  "orc_routing": 8,
  "anl_specific": 3,
  "aud_specific": 3,
  "cha_specific": 3,
  "spo_specific": 3,
  "doc_specific": 3,
  "prf_specific": 3,
  "chg_routing": 2,
  "cst_routing": 2,
  "mkt_routing": 2,
  "cross_agent": 5,
  "edge_cases": 6
}
```

Update total_scenarios to 43.

---

### Phase 8: Feature Flags (Day 4)

#### 8.1 Update Feature Flags CSV

**File: `release/v6.0/platform/eap/seed/feature_flags_multi_agent.csv`**

Replace entire file with:

```csv
flag_key,flag_value,flag_description,flag_category,flag_created_on,flag_modified_on
multi_agent_enabled,true,Enable multi-agent routing system - routes requests through ORC to specialist agents,architecture,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
orc_agent_enabled,true,Enable Orchestrator Agent - central routing and response synthesis,agent,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
anl_agent_enabled,true,Enable Analytics and Forecasting Agent - projections and scenario modeling,agent,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
aud_agent_enabled,true,Enable Audience Intelligence Agent - segmentation and targeting,agent,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
cha_agent_enabled,true,Enable Channel Strategy Agent - channel mix and allocation,agent,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
spo_agent_enabled,true,Enable Supply Path Optimization Agent - fee analysis and partner evaluation,agent,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
doc_agent_enabled,true,Enable Document Generation Agent - plan and brief generation,agent,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
prf_agent_enabled,true,Enable Performance Intelligence Agent - optimization and anomaly detection,agent,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
chg_agent_enabled,true,Enable Change Management Agent - readiness assessment and adoption planning,agent,2026-01-19T00:00:00Z,2026-01-19T00:00:00Z
cst_agent_enabled,true,Enable Consulting Strategy Agent - framework selection and prioritization,agent,2026-01-19T00:00:00Z,2026-01-19T00:00:00Z
mkt_agent_enabled,true,Enable Marketing Strategy Agent - campaign strategy and creative briefs,agent,2026-01-19T00:00:00Z,2026-01-19T00:00:00Z
multi_agent_logging_verbose,true,Enable verbose logging for all routing decisions and agent communications,debugging,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
multi_agent_fallback_to_mpa,true,Fall back to MPA v5.5 monolithic agent on multi-agent errors,reliability,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
multi_agent_parallel_routing,false,Allow ORC to route to multiple specialists in parallel when applicable,performance,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
multi_agent_ab_test_enabled,false,Enable A/B testing between multi-agent and monolithic MPA,testing,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
multi_agent_ab_test_percentage,10,Percentage of traffic routed to multi-agent system during A/B test,testing,2026-01-17T00:00:00Z,2026-01-19T00:00:00Z
```

---

### Phase 9: Validation (Day 4-5)

#### 9.1 Run Compliance Validator

```bash
cd release/v6.0
python3 validate_compliance.py
```

Expected output: `SUMMARY: 126 passed, 0 failed`

#### 9.2 Validate Flow YAML Syntax

```bash
# Install yamllint if needed
pip install yamllint

# Validate all flow files
find release/v6.0/agents -name "*.yaml" -exec yamllint {} \;
```

#### 9.3 Test Dataverse Import Script

Create and run:

**File: `scripts/validate-seed-data.js`**

```javascript
// Validate all seed CSV files have no empty required fields
const fs = require('fs');
const path = require('path');

const seedFiles = [
  'base/dataverse/seed/eap_agent_seed.csv',
  'base/dataverse/seed/eap_capability_seed.csv',
  'base/dataverse/seed/eap_prompt_seed.csv',
  'base/dataverse/seed/eap_test_case_seed.csv',
  'release/v6.0/platform/dataverse/agent_capabilities.csv',
  'release/v6.0/platform/dataverse/agent_routing_rules.csv',
  'release/v6.0/platform/eap/seed/feature_flags_multi_agent.csv'
];

let errors = [];

seedFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  lines.slice(1).forEach((line, idx) => {
    const values = line.split(',');
    values.forEach((val, col) => {
      if (val === '' && headers[col] !== 'effective_to') {
        errors.push(`${file}:${idx+2} - Empty value in column '${headers[col]}'`);
      }
    });
  });
});

if (errors.length > 0) {
  console.log('VALIDATION FAILED:');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('All seed files validated successfully!');
}
```

---

### Phase 10: Deployment (Day 5)

#### 10.1 Deploy to Personal Environment

```bash
# 1. Export solution
pac solution export --path ./solutions/MPAv6MultiAgent.zip --name MPAv6MultiAgent

# 2. Import to Personal environment
pac solution import --path ./solutions/MPAv6MultiAgent.zip --environment Aragorn-AI

# 3. Publish customizations
pac solution publish

# 4. Import seed data
node scripts/import-seed-data.js --environment personal
```

#### 10.2 Smoke Test Checklist

Run these manual tests:
1. [ ] ORC routing - "Help me create a media plan" → ORC responds
2. [ ] ANL routing - "Calculate projections for $500K budget" → ANL responds
3. [ ] CHG routing - "Assess readiness for CRM change" → CHG responds
4. [ ] CST routing - "Which framework for market analysis?" → CST responds
5. [ ] MKT routing - "Create a campaign strategy" → MKT responds
6. [ ] Cross-agent - Complex query touches multiple agents
7. [ ] Fallback - Force error, verify MPA fallback works

---

## VERIFICATION COMMANDS

After completing all phases, run:

```bash
# 1. Count flows
find release/v6.0/agents -name "*.yaml" | wc -l
# Expected: 25 (16 existing + 9 new)

# 2. Verify test count
cat release/v6.0/tests/multi-agent-routing-tests.json | jq '.total_scenarios'
# Expected: 43+

# 3. Check feature flags
grep "true" release/v6.0/platform/eap/seed/feature_flags_multi_agent.csv | wc -l
# Expected: 13

# 4. Validate compliance
python3 release/v6.0/validate_compliance.py | tail -1
# Expected: SUMMARY: 126 passed, 0 failed
```

---

## COMPLETION CRITERIA

All items must be checked before marking complete:

- [ ] 9 new flow YAML files created and valid
- [ ] Test directories created for CHG and MKT
- [ ] 8+ new routing test scenarios added
- [ ] Feature flags CSV updated with 16 rows
- [ ] All agents enabled in flags
- [ ] Compliance validator passes 100%
- [ ] YAML syntax validation passes
- [ ] Seed data validation passes
- [ ] Personal environment deployment successful
- [ ] All 7 smoke tests pass

---

## NOTES FOR EXECUTION

1. **Start with flows** - These are the critical blocking items
2. **Use existing flows as templates** - Copy pattern from ANL/CHA flows
3. **Test YAML syntax frequently** - Catch errors early
4. **Coordinate with Desktop** - They're creating seed data in parallel
5. **Document any blockers** - Note issues in commit messages

---

**Handoff from:** Desktop (Claude AI)
**Handoff to:** VS Code (Claude Code)
**Status:** Ready for execution
