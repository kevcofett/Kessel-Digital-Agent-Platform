# MPA v6.0 PRODUCTION READINESS PLAN

**Created:** 2026-01-19
**Target:** Production deployment across Personal and Mastercard environments
**Scope:** Complete 10-agent multi-agent architecture

---

## EXECUTIVE SUMMARY

### Current State vs Target State

| Component | Current | Target | Gap |
|-----------|---------|--------|-----|
| Agent Registrations | 7 | 10 | 3 missing (CHG, CST, MKT) |
| Instruction Files | 10 (3 under-optimized) | 10 (all 7,500+ chars) | 3 need expansion |
| KB Files | 116 | 116 | ✓ Complete |
| Power Automate Flows | 16 | 22+ | 6+ missing |
| Routing Rules | 15 | 21+ | 6+ missing |
| Agent Capabilities | 21 (7 agents) | 31+ (10 agents) | 10+ missing |
| Prompts | 19 | 28+ | 9+ missing |
| Test Cases | 15 | 50+ | 35+ missing |
| Feature Flags | All OFF | Strategic ON | Activation needed |
| Compliance Issues | 4 | 0 | 4 to fix |

### Work Distribution

| Owner | Workstream | Estimated Effort |
|-------|------------|------------------|
| **Desktop (Claude AI)** | Content, KB, Documentation, Seed Data | ~8 hours |
| **VS Code (Claude Code)** | Flows, TypeScript, Dataverse Scripts | ~12 hours |

---

## PHASE 1: REGISTRY & SEED DATA COMPLETION (P0 - BLOCKING)

**Owner:** Split (Desktop creates CSVs, VS Code creates JSON/scripts)
**Duration:** Day 1

### Task 1.1: Update Agent Registry (Desktop)

**File:** `release/v6.0/platform/agent-registry.json`

Add entries for CHG, CST, MKT with complete configuration:

```json
{
  "code": "CHG",
  "name": "Change Management",
  "description": "Change readiness assessment, stakeholder mapping, adoption planning",
  "instructionsFile": "CHG_Copilot_Instructions_v1.txt",
  "kbFiles": ["CHG_KB_Change_Core_v1.txt", "CHG_KB_Stakeholder_Methods_v1.txt", "CHG_KB_Adoption_Planning_v1.txt"],
  "flows": ["AssessReadiness", "MapStakeholders", "PlanAdoption"],
  "isRouter": false,
  "status": "active"
},
{
  "code": "CST",
  "name": "Consulting Strategy",
  "description": "Strategic frameworks, prioritization methods, consulting methodology",
  "instructionsFile": "CST_Copilot_Instructions_v1.txt",
  "kbFiles": ["CST_KB_Consulting_Core_v1.txt", "CST_KB_Strategic_Frameworks_v1.txt", "CST_KB_Prioritization_Methods_v1.txt", "CST_KB_Industry_Context_v1.txt"],
  "flows": ["SelectFramework", "ApplyAnalysis", "PrioritizeInitiatives"],
  "isRouter": false,
  "status": "active"
},
{
  "code": "MKT",
  "name": "Marketing Strategy",
  "description": "Campaign strategy, creative briefs, brand positioning, GTM planning",
  "instructionsFile": "MKT_Copilot_Instructions_v1.txt",
  "kbFiles": ["MKT_KB_Campaign_Strategy_v1.txt", "MKT_KB_Creative_Briefs_v1.txt", "MKT_KB_Brand_Positioning_v1.txt", "MKT_KB_GTM_Planning_v1.txt", "MKT_KB_Competitive_Analysis_v1.txt"],
  "flows": ["DevelopStrategy", "CreateBrief", "AnalyzeCompetitive"],
  "isRouter": false,
  "status": "active"
}
```

**Acceptance Criteria:**
- [ ] All 10 agents listed with complete fields
- [ ] No null or empty values
- [ ] routingKeywords updated for new agents

### Task 1.2: Update EAP Agent Seed (Desktop)

**File:** `release/v6.0/platform/eap/dataverse/eap_agent.json`

Add seed_data entries for CHG, CST, MKT:

| Field | CHG | CST | MKT |
|-------|-----|-----|-----|
| eap_agent_code | CHG | CST | MKT |
| eap_agent_name | Change Management Agent | Consulting Strategy Agent | Marketing Strategy Agent |
| eap_agent_status | 2 (Inactive) | 2 (Inactive) | 2 (Inactive) |
| eap_agent_version | 1.0.0 | 1.0.0 | 1.0.0 |
| eap_agent_routing_priority | 25 | 20 | 20 |
| eap_agent_timeout_ms | 30000 | 45000 | 45000 |
| eap_agent_fallback_agent | ORC | ORC | ORC |

**Acceptance Criteria:**
- [ ] All 10 agents in seed_data array
- [ ] All required fields populated
- [ ] Valid JSON syntax

### Task 1.3: Update Inter-Agent Contract (Desktop)

**File:** `release/v6.0/contracts/INTER_AGENT_CONTRACT_v1.json`

Update AgentCode enum:

```json
"AgentCode": {
  "type": "string",
  "enum": ["ORC", "ANL", "AUD", "CHA", "SPO", "DOC", "PRF", "CHG", "CST", "MKT"],
  "description": "3-letter code identifying an agent"
}
```

**Acceptance Criteria:**
- [ ] All 10 agents in enum
- [ ] Schema validates successfully

### Task 1.4: Create Routing Rules (Desktop)

**File:** `release/v6.0/platform/dataverse/agent_routing_rules.csv`

Add rows:

| rule_id | trigger_pattern | target_agent | priority | confidence_threshold | description |
|---------|----------------|--------------|----------|---------------------|-------------|
| ROUTE016 | change\|readiness\|adoption\|stakeholder\|rollout | CHG | 1 | 0.85 | Route change management to CHG |
| ROUTE017 | framework\|strategic\|prioritize\|initiative\|consulting | CST | 1 | 0.80 | Route strategic consulting to CST |
| ROUTE018 | campaign\|creative\|brief\|positioning\|gtm\|launch | MKT | 1 | 0.80 | Route marketing strategy to MKT |
| ROUTE019 | readiness assessment\|change impact | CHG | 1 | 0.90 | Route change assessments to CHG |
| ROUTE020 | swot\|porter\|pestel\|bcg\|ansoff | CST | 1 | 0.90 | Route framework analysis to CST |
| ROUTE021 | brand\|message\|value proposition\|competitive analysis | MKT | 1 | 0.85 | Route brand work to MKT |

**Acceptance Criteria:**
- [ ] All new agents have routing rules
- [ ] No pattern conflicts with existing rules
- [ ] Confidence thresholds appropriate

### Task 1.5: Create Agent Capabilities (Desktop)

**File:** `release/v6.0/platform/dataverse/agent_capabilities.csv`

Add rows (15 new capabilities):

**CHG Capabilities:**
| agent_code | capability_id | capability_name | description | requires_data |
|------------|--------------|-----------------|-------------|---------------|
| CHG | CHG001 | Assess Change Readiness | Evaluate organizational readiness for change | change_description |
| CHG | CHG002 | Map Stakeholders | Identify and analyze change stakeholders | stakeholder_list |
| CHG | CHG003 | Plan Adoption | Create change adoption and rollout plan | timeline |
| CHG | CHG004 | Measure Adoption | Track and report on adoption metrics | adoption_data |
| CHG | CHG005 | Identify Resistance | Detect and address change resistance points | feedback_data |

**CST Capabilities:**
| agent_code | capability_id | capability_name | description | requires_data |
|------------|--------------|-----------------|-------------|---------------|
| CST | CST001 | Select Framework | Recommend appropriate strategic framework | challenge_type |
| CST | CST002 | Apply Analysis | Execute strategic framework analysis | framework_inputs |
| CST | CST003 | Prioritize Initiatives | Score and rank strategic initiatives | initiative_list |
| CST | CST004 | Guide Engagement | Navigate consulting engagement phases | current_phase |
| CST | CST005 | Synthesize Insights | Consolidate analysis into recommendations | analysis_data |

**MKT Capabilities:**
| agent_code | capability_id | capability_name | description | requires_data |
|------------|--------------|-----------------|-------------|---------------|
| MKT | MKT001 | Develop Campaign Strategy | Create comprehensive campaign plan | objectives |
| MKT | MKT002 | Create Creative Brief | Generate structured creative brief | brand_context |
| MKT | MKT003 | Define Positioning | Build brand positioning framework | competitive_data |
| MKT | MKT004 | Plan GTM | Develop go-to-market strategy | market_data |
| MKT | MKT005 | Analyze Competitive | Assess competitive landscape | competitors |

**Acceptance Criteria:**
- [ ] 5 capabilities per new agent (15 total)
- [ ] All fields populated, no blanks
- [ ] Consistent naming convention

---

## PHASE 2: FLOW CREATION (P0 - BLOCKING)

**Owner:** VS Code
**Duration:** Day 1-2

### Task 2.1: Create CHG Flows

**Location:** `release/v6.0/agents/chg/flows/`

Create 3 flow YAML files:

1. **AssessReadiness.yaml**
   - Trigger: HTTP POST
   - Input: change_description, org_context
   - Output: readiness_score, strengths, gaps, recommendations
   - Calls: AI Builder prompt, Dataverse update

2. **MapStakeholders.yaml**
   - Trigger: HTTP POST
   - Input: change_description, stakeholder_list
   - Output: stakeholder_map with power/interest/strategy
   - Calls: AI Builder prompt, Dataverse update

3. **PlanAdoption.yaml**
   - Trigger: HTTP POST
   - Input: change_description, timeline, constraints
   - Output: phases, activities, success_metrics
   - Calls: AI Builder prompt, Dataverse update

### Task 2.2: Create CST Flows

**Location:** `release/v6.0/agents/cst/flows/`

Create 3 flow YAML files:

1. **SelectFramework.yaml**
   - Trigger: HTTP POST
   - Input: challenge_type, industry, complexity
   - Output: frameworks with fit_score and rationale
   - Calls: AI Builder prompt, framework lookup

2. **ApplyAnalysis.yaml**
   - Trigger: HTTP POST
   - Input: framework_code, inputs
   - Output: analysis, insights, recommendations
   - Calls: AI Builder prompt

3. **PrioritizeInitiatives.yaml**
   - Trigger: HTTP POST
   - Input: method, items, criteria
   - Output: ranked_items with scores
   - Calls: AI Builder prompt, calculation

### Task 2.3: Create MKT Flows

**Location:** `release/v6.0/agents/mkt/flows/`

Create 3 flow YAML files:

1. **DevelopStrategy.yaml**
   - Trigger: HTTP POST
   - Input: objectives, audience, budget
   - Output: strategy document, channel recommendations
   - Calls: AI Builder prompt

2. **CreateBrief.yaml**
   - Trigger: HTTP POST
   - Input: brand_context, campaign_objectives
   - Output: creative_brief document
   - Calls: AI Builder prompt

3. **AnalyzeCompetitive.yaml**
   - Trigger: HTTP POST
   - Input: competitors, category
   - Output: competitive_matrix, opportunities
   - Calls: AI Builder prompt

**Acceptance Criteria:**
- [ ] 9 new flow YAML files created
- [ ] Each follows existing flow pattern
- [ ] All have proper schema definitions
- [ ] Input validation included

---

## PHASE 3: INSTRUCTION OPTIMIZATION (P1 - HIGH)

**Owner:** Desktop
**Duration:** Day 2

### Task 3.1: Expand CHG Instructions

**File:** `release/v6.0/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt`
**Current:** 6,367 chars (79.6%)
**Target:** 7,500+ chars (93.8%+)

Add sections:
- Detailed change methodology (ADKAR, Kotter, Prosci)
- Stakeholder engagement patterns
- Resistance handling strategies
- Communication planning guidance
- Metrics and measurement approaches

### Task 3.2: Expand CST Instructions

**File:** `release/v6.0/agents/cst/instructions/CST_Copilot_Instructions_v1.txt`
**Current:** 5,989 chars (74.9%)
**Target:** 7,500+ chars (93.8%+)

Add sections:
- Framework selection criteria
- Analysis output standards
- Prioritization methodology details
- Client engagement guidance
- Deliverable quality standards

### Task 3.3: Expand MKT Instructions

**File:** `release/v6.0/agents/mkt/instructions/MKT_Copilot_Instructions_v1.txt`
**Current:** 5,567 chars (69.6%)
**Target:** 7,500+ chars (93.8%+)

Add sections:
- Campaign planning methodology
- Brief creation standards
- Positioning framework application
- Competitive analysis techniques
- GTM planning phases

**Acceptance Criteria:**
- [ ] All 3 files at 7,500+ characters
- [ ] 6-Rule compliant (ALL-CAPS headers, hyphens, ASCII)
- [ ] No numbered lists or bullets
- [ ] Professional tone maintained

---

## PHASE 4: COMPLIANCE FIXES (P1 - HIGH)

**Owner:** Desktop
**Duration:** Day 2

### Task 4.1: Fix CHA Numbered Lists

**File:** `release/v6.0/agents/cha/instructions/CHA_Copilot_Instructions_v1.txt`
**Lines:** 210-216

Convert from:
```
1. Summarize objectives and constraints
2. Recommend channel mix with rationale
3. Provide allocation percentages
```

To:
```
- Summarize objectives and constraints
- Recommend channel mix with rationale
- Provide allocation percentages
```

### Task 4.2: Fix Smart Apostrophes

**File 1:** `release/v6.0/agents/anl/kb/ANL_KB_Forecasting_Methods_v1.txt`
**Line 137:** Replace `Y'_t` with `Y'_t` (straight apostrophe)

**File 2:** `release/v6.0/agents/aud/kb/AUD_KB_Identity_Resolution_v1.txt`
**Line 357:** Replace `Chrome's` with `Chrome's` (straight apostrophe)

**Acceptance Criteria:**
- [ ] Validator returns 126/126 PASS
- [ ] Zero warnings
- [ ] Zero non-ASCII characters

---

## PHASE 5: SEED DATA COMPLETION (P1 - HIGH)

**Owner:** Desktop (CSV creation) + VS Code (import scripts)
**Duration:** Day 2-3

### Task 5.1: Update eap_agent_seed.csv

**File:** `base/dataverse/seed/eap_agent_seed.csv`

Add 3 rows for CHG, CST, MKT with complete fields:

| Column | CHG Value | CST Value | MKT Value |
|--------|-----------|-----------|-----------|
| eap_agentid | 00000000-0000-0000-0002-000000000009 | 00000000-0000-0000-0002-000000000010 | 00000000-0000-0000-0002-000000000011 |
| agent_code | CHG | CST | MKT |
| agent_name | Change Management Agent | Consulting Strategy Agent | Marketing Strategy Agent |
| description | (full description) | (full description) | (full description) |
| capability_tags | change,readiness,stakeholder,adoption,rollout | framework,strategic,prioritize,initiative,consulting | campaign,creative,brief,positioning,gtm |
| required_inputs | change_description | challenge_type | objectives |
| instruction_char_count | 7500 | 7500 | 7500 |
| kb_file_count | 3 | 4 | 5 |
| confidence_threshold | 0.85 | 0.80 | 0.80 |
| fallback_agent_code | ORC | ORC | ORC |
| max_tokens | 8192 | 8192 | 8192 |
| temperature | 0.60 | 0.50 | 0.60 |
| is_active | true | true | true |
| version | 1.0 | 1.0 | 1.0 |
| effective_from | 2026-01-01T00:00:00Z | 2026-01-01T00:00:00Z | 2026-01-01T00:00:00Z |
| effective_to | (empty) | (empty) | (empty) |

### Task 5.2: Update eap_capability_seed.csv

Add 15 new capability rows (5 per agent).

### Task 5.3: Update eap_prompt_seed.csv

Add 9 new prompt rows (3 per agent).

### Task 5.4: Update eap_test_case_seed.csv

Add 15+ new test cases covering:
- CHG routing tests (3)
- CST routing tests (3)
- MKT routing tests (3)
- CHG capability tests (3)
- CST capability tests (3)
- MKT capability tests (3)

**Acceptance Criteria:**
- [ ] No empty fields in any seed file
- [ ] All GUIDs follow naming pattern
- [ ] All foreign keys valid
- [ ] Import script runs without errors

---

## PHASE 6: TEST INFRASTRUCTURE (P1 - HIGH)

**Owner:** VS Code
**Duration:** Day 3

### Task 6.1: Create Test Directories

```bash
mkdir -p release/v6.0/agents/chg/tests
mkdir -p release/v6.0/agents/mkt/tests
```

### Task 6.2: Update Routing Tests

**File:** `release/v6.0/tests/multi-agent-routing-tests.json`

Add test scenarios:
- RT-036: Route to CHG for change readiness
- RT-037: Route to CHG for stakeholder mapping
- RT-038: Route to CST for framework selection
- RT-039: Route to CST for prioritization
- RT-040: Route to MKT for campaign strategy
- RT-041: Route to MKT for creative brief
- RT-042: Ambiguous CHG/CST routing
- RT-043: Ambiguous MKT/CHA routing

### Task 6.3: Create Agent-Specific Tests

Create test JSON files for each new agent:
- `agents/chg/tests/chg-capability-tests.json`
- `agents/cst/tests/cst-capability-tests.json`
- `agents/mkt/tests/mkt-capability-tests.json`

**Acceptance Criteria:**
- [ ] 50+ total test scenarios
- [ ] All 10 agents have routing tests
- [ ] All new capabilities have tests
- [ ] Test categories balanced

---

## PHASE 7: DOCUMENTATION UPDATE (P2 - MEDIUM)

**Owner:** Desktop
**Duration:** Day 3-4

### Task 7.1: Update Architecture Final

**File:** `release/v6.0/docs/architecture/MPA_v6_Architecture_Final.md`

Updates needed:
- Agent count: 7 → 10
- KB file count: 37 → 172
- Add CHG, CST, MKT to agent overview
- Update architecture diagrams
- Add CA expansion section

### Task 7.2: Update Planning Docs

Files to update:
- `release/v6.0/docs/planning/MPA_v6_Approved_File_List.md`
- `release/v6.0/docs/planning/KDAP_Quick_Reference.md`

### Task 7.3: Update README

**File:** `release/v6.0/README.md`

Update agent list and capabilities summary.

### Task 7.4: Update CHANGELOG

**File:** `release/v6.0/CHANGELOG.md`

Add entry for v6.0.1 with CA agent additions.

**Acceptance Criteria:**
- [ ] All docs reflect 10-agent architecture
- [ ] No conflicting information
- [ ] File counts accurate

---

## PHASE 8: FEATURE FLAG ACTIVATION (P2 - MEDIUM)

**Owner:** VS Code
**Duration:** Day 4

### Task 8.1: Update Feature Flags

**File:** `release/v6.0/platform/eap/seed/feature_flags_multi_agent.csv`

Add new flags and update values:

| flag_key | flag_value | Notes |
|----------|------------|-------|
| multi_agent_enabled | true | Enable for test |
| orc_agent_enabled | true | Required |
| anl_agent_enabled | true | Required |
| aud_agent_enabled | true | Required |
| cha_agent_enabled | true | Required |
| spo_agent_enabled | true | Required |
| doc_agent_enabled | true | Required |
| prf_agent_enabled | true | Required |
| chg_agent_enabled | true | NEW |
| cst_agent_enabled | true | NEW |
| mkt_agent_enabled | true | NEW |
| multi_agent_logging_verbose | true | For testing |
| multi_agent_fallback_to_mpa | true | Safety net |

### Task 8.2: Create Activation Script

**File:** `scripts/activate-multi-agent.ps1`

PowerShell script to:
1. Import feature flags to Dataverse
2. Activate agents
3. Validate configuration

**Acceptance Criteria:**
- [ ] All flags have valid values
- [ ] Script tested in Personal environment
- [ ] Rollback procedure documented

---

## PHASE 9: INTEGRATION VALIDATION (P2 - MEDIUM)

**Owner:** VS Code
**Duration:** Day 4-5

### Task 9.1: Run Compliance Validator

```bash
cd release/v6.0
python3 validate_compliance.py
```

Expected: 126/126 PASS, 0 warnings

### Task 9.2: Run Routing Tests

Execute all routing test scenarios via Braintrust.

### Task 9.3: Validate Dataverse Import

Import all seed data and verify:
- All 10 agents in eap_agent table
- All 36+ capabilities in eap_capability table
- All 28+ prompts in eap_prompt table
- All 50+ test cases in eap_test_case table

**Acceptance Criteria:**
- [ ] Compliance: 100% pass
- [ ] Routing: 95%+ accuracy
- [ ] Dataverse: All tables populated
- [ ] No import errors

---

## PHASE 10: DEPLOYMENT (P2 - MEDIUM)

**Owner:** VS Code
**Duration:** Day 5

### Task 10.1: Personal Environment (Aragorn AI)

1. Deploy all flows to Personal environment
2. Import seed data to Dataverse
3. Enable feature flags
4. Run smoke tests

### Task 10.2: Mastercard Environment (Future)

1. Security review
2. DLP compliance check
3. Staged deployment
4. UAT sign-off

**Acceptance Criteria:**
- [ ] Personal environment fully functional
- [ ] All 10 agents responding
- [ ] Routing working correctly
- [ ] No errors in telemetry

---

## EXECUTION TIMELINE

| Day | Desktop Tasks | VS Code Tasks |
|-----|--------------|---------------|
| **Day 1** | Tasks 1.1-1.5 (Registries, Seeds) | Task 2.1-2.3 (Flows) |
| **Day 2** | Tasks 3.1-3.3 (Instructions), 4.1-4.2 (Compliance) | Task 2.1-2.3 (Flows cont.) |
| **Day 3** | Tasks 5.1-5.4 (Seed Data) | Tasks 6.1-6.3 (Tests) |
| **Day 4** | Tasks 7.1-7.4 (Documentation) | Tasks 8.1-8.2 (Feature Flags) |
| **Day 5** | Final review | Tasks 9.1-9.3, 10.1 (Validation, Deploy) |

---

## ACCEPTANCE CRITERIA SUMMARY

### Production Ready Checklist

- [ ] **Agents:** All 10 registered in all systems
- [ ] **Instructions:** All at 7,500+ characters, 6-Rule compliant
- [ ] **KB Files:** 116 files, all compliant
- [ ] **Flows:** 22+ flows (16 existing + 6 new minimum)
- [ ] **Routing:** 21+ rules covering all agents
- [ ] **Capabilities:** 36+ capabilities (21 + 15 new)
- [ ] **Prompts:** 28+ prompts
- [ ] **Tests:** 50+ scenarios
- [ ] **Compliance:** 100% pass rate
- [ ] **Feature Flags:** All enabled for deployment
- [ ] **Dataverse:** All tables populated with valid data
- [ ] **Documentation:** Updated to reflect 10-agent architecture

### Quality Gates

| Gate | Criteria | Required |
|------|----------|----------|
| G1 | Compliance validator 100% pass | Yes |
| G2 | All registries complete | Yes |
| G3 | All flows created and valid | Yes |
| G4 | Routing tests 95%+ pass | Yes |
| G5 | Dataverse import successful | Yes |
| G6 | Smoke test pass in Personal | Yes |

---

## RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Flow creation delays | Parallel work on registries |
| Compliance issues found | Fix immediately, re-validate |
| Dataverse import failures | Test in isolation first |
| Routing conflicts | Review patterns carefully |
| Feature flag issues | Keep fallback enabled |

---

## HANDOFF INSTRUCTIONS

### For Desktop (Claude AI)

Start with Phase 1 Tasks 1.1-1.5 immediately. Create the registry updates, seed data CSVs, and routing rules. Then proceed to Phase 3 (Instructions) and Phase 4 (Compliance) while VS Code works on flows.

### For VS Code (Claude Code)

Focus on Phase 2 (Flows) first - create all 9 flow YAML files. Then Phase 6 (Tests) and Phase 8 (Feature Flags). Finally, Phase 9-10 for validation and deployment.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-19
