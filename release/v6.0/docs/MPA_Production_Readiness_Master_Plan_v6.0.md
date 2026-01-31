# MPA v6.0 PRODUCTION READINESS MASTER PLAN

**Generated:** 2026-01-19
**Status:** CRITICAL - Multiple blocking gaps identified
**Target:** Complete 10-agent multi-agent architecture production deployment

---

## EXECUTIVE SUMMARY - GAPS IDENTIFIED

### Gap Severity Matrix

| Category | Current | Required | Gap | Severity |
|----------|---------|----------|-----|----------|
| Registered Agents | 7 | 10 | 3 missing | **P0-BLOCKING** |
| Agent Instructions | 7 optimized, 3 under | 10 optimized | 3 need expansion | **P1-HIGH** |
| Power Automate Flows | 16 | 25+ | 9 missing | **P0-BLOCKING** |
| Routing Rules | 15 | 21+ | 6+ missing | **P0-BLOCKING** |
| Agent Capabilities | 35 | 50+ | 15+ missing | **P0-BLOCKING** |
| AI Prompts | 19 | 28+ | 9+ missing | **P1-HIGH** |
| Test Scenarios | 35 | 60+ | 25+ missing | **P2-MEDIUM** |
| Seed Data Completeness | ~70% | 100% | Blank fields | **P1-HIGH** |
| Contract Definitions | 7 agents | 10 agents | 3 missing | **P0-BLOCKING** |

### Missing Components by Agent

| Agent | Instructions | KB | Flows | Routing | Capabilities | Prompts | Status |
|-------|-------------|-----|-------|---------|--------------|---------|--------|
| ORC | ✓ 99% | ✓ 5 | ✓ 3 | ✓ 3 | ✓ 5 | ✓ 3 | COMPLETE |
| ANL | ✓ 97% | ✓ 19 | ✓ 2 | ✓ 2 | ✓ 5 | ✓ 4 | COMPLETE |
| AUD | ✓ 99% | ✓ 23 | ✓ 2 | ✓ 2 | ✓ 5 | ✓ 3 | COMPLETE |
| CHA | ✓ 95% | ✓ 10 | ✓ 2 | ✓ 2 | ✓ 5 | ✓ 2 | COMPLETE |
| SPO | ✓ 97% | ✓ 15 | ✓ 3 | ✓ 2 | ✓ 5 | ✓ 2 | COMPLETE |
| DOC | ✓ 96% | ✓ 6 | ✓ 1 | ✓ 2 | ✓ 5 | ✓ 2 | COMPLETE |
| PRF | ✓ 99% | ✓ 26 | ✓ 3 | ✓ 2 | ✓ 5 | ✓ 3 | COMPLETE |
| CHG | ⚠ 79% | ✓ 3 | ✗ 0 | ✗ 0 | ✗ 0 | ✗ 0 | **INCOMPLETE** |
| CST | ⚠ 74% | ✓ 4 | ✗ 0 | ✗ 0 | ✗ 0 | ✗ 0 | **INCOMPLETE** |
| MKT | ⚠ 69% | ✓ 5 | ✗ 0 | ✗ 0 | ✗ 0 | ✗ 0 | **INCOMPLETE** |

---

## WORK DISTRIBUTION

### DESKTOP (Claude AI) - Content & Data Focus
- Instruction file expansion (CHG, CST, MKT)
- Seed data CSV creation and completion
- Registry JSON updates
- Documentation updates
- Compliance fixes
- KB file validation

### VS CODE (Claude Code) - Technical Implementation Focus
- Power Automate flow YAML creation
- Dataverse import scripts
- Test scenario creation
- Feature flag management
- Deployment scripts
- Validation automation

---

## PHASE 1: REGISTRY & CONTRACT UPDATES (P0 - Day 1)

### Owner: DESKTOP

### Task 1.1: Update agent-registry.json

**File:** `release/v6.0/platform/agent-registry.json`

**Action:** Add CHG, CST, MKT agent entries to the agents array:

```json
{
  "code": "CHG",
  "name": "ChangeManagement",
  "description": "Change readiness assessment, stakeholder mapping, adoption planning",
  "instructionsFile": "CHG_Copilot_Instructions_v1.txt",
  "kbFiles": [
    "CHG_KB_Change_Core_v1.txt",
    "CHG_KB_Stakeholder_Methods_v1.txt",
    "CHG_KB_Adoption_Planning_v1.txt"
  ],
  "flows": ["AssessReadiness", "MapStakeholders", "PlanAdoption"],
  "isRouter": false,
  "status": "active"
},
{
  "code": "CST",
  "name": "ConsultingStrategy",
  "description": "Strategic framework selection, analysis, initiative prioritization",
  "instructionsFile": "CST_Copilot_Instructions_v1.txt",
  "kbFiles": [
    "CST_KB_Consulting_Core_v1.txt",
    "CST_KB_Strategic_Frameworks_v1.txt",
    "CST_KB_Prioritization_Methods_v1.txt",
    "CST_KB_Industry_Context_v1.txt"
  ],
  "flows": ["SelectFramework", "ApplyAnalysis", "PrioritizeInitiatives"],
  "isRouter": false,
  "status": "active"
},
{
  "code": "MKT",
  "name": "MarketingStrategy",
  "description": "Campaign strategy, creative briefs, brand positioning, GTM planning",
  "instructionsFile": "MKT_Copilot_Instructions_v1.txt",
  "kbFiles": [
    "MKT_KB_Campaign_Strategy_v1.txt",
    "MKT_KB_Creative_Briefs_v1.txt",
    "MKT_KB_Brand_Positioning_v1.txt",
    "MKT_KB_GTM_Planning_v1.txt",
    "MKT_KB_Competitive_Analysis_v1.txt"
  ],
  "flows": ["DevelopStrategy", "CreateBrief", "AnalyzeCompetitive"],
  "isRouter": false,
  "status": "active"
}
```

**Also update routingKeywords:**
```json
"CHG": ["change", "readiness", "stakeholder", "adoption", "rollout", "transformation", "resistance", "communication"],
"CST": ["framework", "strategic", "prioritize", "initiative", "consulting", "swot", "porter", "pestel", "roadmap"],
"MKT": ["campaign", "creative", "brief", "positioning", "gtm", "launch", "brand", "messaging", "value proposition"]
```

**Acceptance Criteria:**
- [ ] 10 agents in agents array
- [ ] routingKeywords for all 10 agents
- [ ] Valid JSON syntax

---

### Task 1.2: Update Inter-Agent Contract

**File:** `release/v6.0/contracts/INTER_AGENT_CONTRACT_v1.json`

**Action:** Update AgentCode enum:

```json
"AgentCode": {
  "type": "string",
  "enum": ["ORC", "ANL", "AUD", "CHA", "SPO", "DOC", "PRF", "CHG", "CST", "MKT"],
  "description": "3-letter code identifying an agent"
}
```

**Acceptance Criteria:**
- [ ] All 10 agents in enum
- [ ] JSON schema validates

---

### Task 1.3: Update EAP Agent JSON Seed Data

**File:** `release/v6.0/platform/eap/dataverse/eap_agent.json`

**Action:** Add seed_data entries for CHG, CST, MKT:

```json
{
  "eap_agent_code": "CHG",
  "eap_agent_name": "Change Management Agent",
  "eap_agent_description": "Assesses organizational readiness for change, maps stakeholders, and creates adoption plans for successful transformation initiatives.",
  "eap_agent_status": 1,
  "eap_agent_version": "1.0.0",
  "eap_agent_routing_priority": 25,
  "eap_agent_timeout_ms": 30000,
  "eap_agent_fallback_agent": "ORC",
  "eap_agent_request_types": "[\"ASSESS_READINESS\", \"MAP_STAKEHOLDERS\", \"PLAN_ADOPTION\", \"MEASURE_ADOPTION\"]",
  "eap_agent_capabilities": "[\"change_readiness\", \"stakeholder_analysis\", \"adoption_planning\", \"resistance_management\", \"communication_planning\"]"
},
{
  "eap_agent_code": "CST",
  "eap_agent_name": "Consulting Strategy Agent",
  "eap_agent_description": "Selects and applies strategic frameworks, conducts analysis, and prioritizes initiatives using proven consulting methodologies.",
  "eap_agent_status": 1,
  "eap_agent_version": "1.0.0",
  "eap_agent_routing_priority": 20,
  "eap_agent_timeout_ms": 45000,
  "eap_agent_fallback_agent": "ORC",
  "eap_agent_request_types": "[\"SELECT_FRAMEWORK\", \"APPLY_ANALYSIS\", \"PRIORITIZE_INITIATIVES\", \"GUIDE_ENGAGEMENT\"]",
  "eap_agent_capabilities": "[\"framework_selection\", \"strategic_analysis\", \"initiative_prioritization\", \"engagement_guidance\", \"insight_synthesis\"]"
},
{
  "eap_agent_code": "MKT",
  "eap_agent_name": "Marketing Strategy Agent",
  "eap_agent_description": "Develops campaign strategies, creates creative briefs, defines brand positioning, and builds go-to-market plans.",
  "eap_agent_status": 1,
  "eap_agent_version": "1.0.0",
  "eap_agent_routing_priority": 20,
  "eap_agent_timeout_ms": 45000,
  "eap_agent_fallback_agent": "ORC",
  "eap_agent_request_types": "[\"DEVELOP_STRATEGY\", \"CREATE_BRIEF\", \"DEFINE_POSITIONING\", \"PLAN_GTM\", \"ANALYZE_COMPETITIVE\"]",
  "eap_agent_capabilities": "[\"campaign_strategy\", \"creative_brief\", \"brand_positioning\", \"gtm_planning\", \"competitive_analysis\"]"
}
```

**Acceptance Criteria:**
- [ ] All 10 agents in seed_data
- [ ] No null/empty required fields
- [ ] Valid JSON syntax

---

### Task 1.4: Create Routing Rules for CHG, CST, MKT

**File:** `release/v6.0/platform/dataverse/agent_routing_rules.csv`

**Action:** Append these rows:

```csv
ROUTE016,change|readiness|adoption|stakeholder|rollout|transformation,CHG,1,0.85,Route change management requests to CHG
ROUTE017,framework|strategic|prioritize|initiative|consulting|swot|porter,CST,1,0.80,Route strategic consulting to CST
ROUTE018,campaign|creative|brief|positioning|gtm|launch|brand strategy,MKT,1,0.80,Route marketing strategy to MKT
ROUTE019,change impact|organizational readiness|change resistance,CHG,1,0.90,Route change assessment to CHG
ROUTE020,business case|strategic analysis|competitive advantage,CST,1,0.85,Route business analysis to CST
ROUTE021,value proposition|messaging|brand architecture|creative strategy,MKT,1,0.85,Route brand work to MKT
```

**Acceptance Criteria:**
- [ ] 21 total routing rules
- [ ] All 10 agents have at least 1 rule
- [ ] No blank fields

---

### Task 1.5: Create Agent Capabilities for CHG, CST, MKT

**File:** `release/v6.0/platform/dataverse/agent_capabilities.csv`

**Action:** Append these rows:

```csv
CHG,CHG001,Assess Change Readiness,Evaluate organizational readiness using ADKAR and other frameworks,change_description
CHG,CHG002,Map Stakeholders,Create stakeholder power-interest grid with engagement strategies,stakeholder_list
CHG,CHG003,Plan Adoption,Develop phased adoption plan with milestones and metrics,timeline_constraints
CHG,CHG004,Identify Resistance,Detect and address sources of change resistance,feedback_data
CHG,CHG005,Plan Communications,Create change communication strategy and messaging,audience_segments
CST,CST001,Select Framework,Recommend strategic frameworks based on challenge type,challenge_context
CST,CST002,Apply Strategic Analysis,Execute framework analysis with structured outputs,framework_inputs
CST,CST003,Prioritize Initiatives,Score and rank using RICE or weighted matrix,initiative_list
CST,CST004,Guide Engagement,Navigate consulting phases from discovery to roadmap,current_phase
CST,CST005,Synthesize Insights,Consolidate analysis into executive recommendations,analysis_data
MKT,MKT001,Develop Campaign Strategy,Create comprehensive campaign plan with objectives and tactics,campaign_objectives
MKT,MKT002,Create Creative Brief,Generate structured brief with insight and proposition,brand_context
MKT,MKT003,Define Brand Positioning,Build positioning framework with differentiation,competitive_landscape
MKT,MKT004,Plan Go-to-Market,Develop GTM strategy with phases and channels,market_opportunity
MKT,MKT005,Analyze Competitive,Assess competitive landscape and identify opportunities,competitor_list
```

**Acceptance Criteria:**
- [ ] 50 total capabilities (7×5 + 3×5)
- [ ] All fields populated
- [ ] Consistent naming

---

## PHASE 2: INSTRUCTION EXPANSION (P1 - Day 1-2)

### Owner: DESKTOP

### Task 2.1: Expand CHG Instructions

**File:** `release/v6.0/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt`
**Current:** 6,367 chars (79%)
**Target:** 7,500+ chars (94%+)

**Content to Add (~1,200 chars):**

```
CHANGE MANAGEMENT METHODOLOGIES

Apply these established frameworks based on change type and scope

ADKAR MODEL APPLICATION
- Awareness of need for change and consequences of not changing
- Desire to participate and support the change initiative
- Knowledge of how to change including skills and behaviors required
- Ability to implement required skills and behaviors consistently
- Reinforcement to sustain the change through recognition and rewards
Score each dimension 1-5 and identify lowest scores as intervention priorities

KOTTER 8-STEP PROCESS
For large-scale organizational transformation apply sequentially
- Create urgency through compelling case for change
- Build guiding coalition of influential change champions
- Form strategic vision with clear picture of future state
- Enlist volunteer army to spread change message widely
- Enable action by removing barriers and obstacles
- Generate short-term wins to build momentum and credibility
- Sustain acceleration by maintaining sense of urgency
- Institute change by anchoring in organizational culture

PROSCI CHANGE MANAGEMENT
Structure project-level change activities around
- Preparing for change through readiness assessments
- Managing change through communication and training plans
- Reinforcing change through feedback and corrective action

RESISTANCE MANAGEMENT PATTERNS
When encountering resistance identify root cause category
- Lack of awareness requires communication intervention
- Lack of desire requires motivation and incentive intervention
- Lack of knowledge requires training intervention
- Lack of ability requires coaching and practice intervention
- Lack of reinforcement requires recognition intervention
```

---

### Task 2.2: Expand CST Instructions

**File:** `release/v6.0/agents/cst/instructions/CST_Copilot_Instructions_v1.txt`
**Current:** 5,989 chars (74%)
**Target:** 7,500+ chars (94%+)

**Content to Add (~1,600 chars):**

```
FRAMEWORK SELECTION METHODOLOGY

Match framework to challenge type using this decision logic

MARKET AND COMPETITIVE ANALYSIS
- Porter Five Forces for industry attractiveness assessment
- PESTEL for macro-environmental scanning
- Competitor Analysis Matrix for direct rivalry evaluation
- Blue Ocean Strategy for market creation opportunities

STRATEGIC PLANNING AND DIRECTION
- SWOT for situation assessment and strategy formulation
- Ansoff Matrix for growth strategy options
- BCG Matrix for portfolio prioritization decisions
- McKinsey 7S for organizational alignment

OPERATIONAL IMPROVEMENT
- Value Chain Analysis for competitive advantage identification
- Business Model Canvas for holistic model evaluation
- Lean Six Sigma for process optimization
- Theory of Constraints for bottleneck identification

PRIORITIZATION METHODOLOGY DETAILS

RICE SCORING FRAMEWORK
Calculate composite score for each initiative
- Reach: How many customers impacted per quarter (absolute number)
- Impact: Expected benefit level (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)
- Confidence: Certainty in estimates (100%=high, 80%=medium, 50%=low)
- Effort: Person-months required to complete
- RICE Score = (Reach × Impact × Confidence) / Effort
Rank initiatives by score descending and apply cutoff threshold

WEIGHTED SCORING MATRIX
When multiple criteria matter beyond standard RICE
- Define criteria relevant to strategic objectives
- Assign weights totaling 100 percent
- Score each initiative 1-5 on each criterion
- Calculate weighted sum as overall priority score
- Validate ranking against strategic intuition

MOSCOW PRIORITIZATION
For scope management and stakeholder alignment
- Must Have: Critical requirements without which solution fails
- Should Have: Important but not vital for immediate release
- Could Have: Desirable features with small impact if absent
- Will Not Have: Explicitly out of scope for current phase
```

---

### Task 2.3: Expand MKT Instructions

**File:** `release/v6.0/agents/mkt/instructions/MKT_Copilot_Instructions_v1.txt`
**Current:** 5,567 chars (69%)
**Target:** 7,500+ chars (94%+)

**Content to Add (~2,000 chars):**

```
CAMPAIGN STRATEGY METHODOLOGY

Follow this structured approach for comprehensive campaign development

OBJECTIVE HIERARCHY FRAMEWORK
Define objectives at three levels ensuring alignment
- Business Objectives: Revenue growth, market share, profitability targets
- Marketing Objectives: Awareness levels, consideration rates, conversion targets
- Communication Objectives: Message recall, attitude shift, action intent

AUDIENCE STRATEGY DEVELOPMENT
Build audience strategy using this framework
- Primary Target: Core audience most likely to convert
- Secondary Target: Influence audience affecting purchase decisions
- Tertiary Target: Aspirational audience building long-term value
For each segment define demographics, psychographics, behaviors, media habits

CREATIVE BRIEF STANDARDS

Every brief must include these essential components

STRATEGIC FOUNDATION
- Business Challenge: What business problem does this solve
- Marketing Objective: What measurable outcome will this achieve
- Target Audience: Who specifically are we trying to reach and influence

CREATIVE DIRECTION
- Key Insight: What truth about the audience unlocks creative potential
- Single-Minded Proposition: One compelling idea that drives the work
- Reasons to Believe: Evidence and proof points supporting the proposition
- Desired Response: What we want the audience to think feel and do

EXECUTION PARAMETERS
- Mandatory Elements: Legal requirements brand guidelines technical specs
- Tone and Manner: Personality characteristics and emotional register
- Media Considerations: Format requirements and channel specifications

BRAND POSITIONING FRAMEWORK

Develop positioning using this systematic approach

COMPETITIVE FRAME OF REFERENCE
- Category Definition: What space do we compete in
- Competitive Set: Which brands do customers consider alternatives

POINT OF DIFFERENCE
- Attribute-Based: Product or service features that distinguish
- Benefit-Based: Functional or emotional outcomes that differentiate
- Value-Based: Higher-order beliefs and values that connect

POSITIONING STATEMENT TEMPLATE
For [target audience] who [need or opportunity], [brand name] is the [competitive frame] that [point of difference] because [reasons to believe].

GTM PLANNING METHODOLOGY

Structure go-to-market around these phases

PHASE 1 MARKET PREPARATION
- Market sizing and opportunity assessment
- Competitive positioning and differentiation
- Pricing strategy and value proposition

PHASE 2 LAUNCH EXECUTION
- Channel activation and partner enablement
- Marketing campaign deployment
- Sales enablement and training

PHASE 3 SCALE AND OPTIMIZE
- Performance measurement and optimization
- Customer feedback integration
- Expansion planning and roadmap
```

---

## PHASE 3: FLOW CREATION (P0 - Day 1-2)

### Owner: VS CODE

### Task 3.1: Create CHG Agent Flows (3 files)

**Location:** `release/v6.0/agents/chg/flows/`

1. **AssessReadiness.yaml**
   - Trigger: HTTP POST
   - Inputs: session_id, change_description, org_context
   - AI Prompt: CHG_ASSESS_READINESS
   - Outputs: readiness_score, strengths[], gaps[], recommendations[]

2. **MapStakeholders.yaml**
   - Trigger: HTTP POST
   - Inputs: session_id, change_description, stakeholder_list
   - AI Prompt: CHG_MAP_STAKEHOLDERS
   - Outputs: stakeholder_map[{name, power, interest, strategy}]

3. **PlanAdoption.yaml**
   - Trigger: HTTP POST
   - Inputs: session_id, change_description, timeline, constraints
   - AI Prompt: CHG_PLAN_ADOPTION
   - Outputs: phases[], success_metrics[]

---

### Task 3.2: Create CST Agent Flows (3 files)

**Location:** `release/v6.0/agents/cst/flows/`

1. **SelectFramework.yaml**
   - Inputs: challenge_type, industry, complexity
   - Outputs: frameworks[{code, name, fit_score, rationale}]

2. **ApplyAnalysis.yaml**
   - Inputs: framework_code, inputs
   - Outputs: analysis, insights[], recommendations[]

3. **PrioritizeInitiatives.yaml**
   - Inputs: method, items[], criteria
   - Outputs: ranked_items[{name, score, rank}], rationale

---

### Task 3.3: Create MKT Agent Flows (3 files)

**Location:** `release/v6.0/agents/mkt/flows/`

1. **DevelopStrategy.yaml**
   - Inputs: objectives, audience, budget, timeline
   - Outputs: strategy_sections[], channel_recommendations[]

2. **CreateBrief.yaml**
   - Inputs: brand_context, campaign_objectives, target_audience
   - Outputs: creative_brief with all standard sections

3. **AnalyzeCompetitive.yaml**
   - Inputs: competitors[], category, dimensions[]
   - Outputs: competitive_matrix, opportunities[], threats[]

---

## PHASE 4: SEED DATA COMPLETION (P1 - Day 2)

### Owner: DESKTOP

### Task 4.1: Update eap_agent_seed.csv

**File:** `base/dataverse/seed/eap_agent_seed.csv`

**Actions:**
1. Remove duplicate ANL row
2. Add CHG, CST, MKT rows
3. Fill all blank fields (effective_to can remain empty)

**New rows to add:**

```csv
00000000-0000-0000-0002-000000000009,CHG,Change Management Agent,"Assesses organizational readiness, maps stakeholders, and plans adoption for change initiatives","change,readiness,stakeholder,adoption,rollout,transformation",change_description,7500,3,0.85,ORC,8192,0.60,true,1.0,2026-01-01T00:00:00Z,
00000000-0000-0000-0002-000000000010,CST,Consulting Strategy Agent,"Selects strategic frameworks, applies analysis methodologies, and prioritizes initiatives","framework,strategic,prioritize,initiative,consulting,analysis",challenge_type,7500,4,0.80,ORC,8192,0.50,true,1.0,2026-01-01T00:00:00Z,
00000000-0000-0000-0002-000000000011,MKT,Marketing Strategy Agent,"Develops campaign strategies, creates creative briefs, and builds GTM plans","campaign,creative,brief,positioning,gtm,brand,launch",objectives,7500,5,0.80,ORC,8192,0.60,true,1.0,2026-01-01T00:00:00Z,
```

---

### Task 4.2: Create MKT Capabilities in eap_capability_ca_seed.csv

**File:** `base/dataverse/seed/eap_capability_ca_seed.csv`

**Append:**

```csv
MKT_CAMPAIGN_STRATEGY,Develop Campaign Strategy,MKT,"Create comprehensive campaign plan with objectives and tactics","{""objectives"": ""array"", ""audience"": ""object"", ""budget"": ""number""}","{""strategy"": ""object"", ""channels"": ""array"", ""timeline"": ""object""}",true
MKT_CREATIVE_BRIEF,Create Creative Brief,MKT,"Generate structured creative brief with insight and proposition","{""brand_context"": ""object"", ""campaign_objectives"": ""array""}","{""brief"": ""object"", ""sections"": ""array""}",true
MKT_POSITIONING,Define Brand Positioning,MKT,"Build positioning framework with differentiation strategy","{""competitive_landscape"": ""object"", ""target_audience"": ""object""}","{""positioning"": ""object"", ""differentiation"": ""array""}",true
MKT_GTM_PLAN,Plan Go-to-Market,MKT,"Develop GTM strategy with phases and channel activation","{""market_opportunity"": ""object"", ""timeline"": ""string""}","{""phases"": ""array"", ""channels"": ""array"", ""metrics"": ""array""}",true
MKT_COMPETITIVE,Analyze Competitive,MKT,"Assess competitive landscape and identify opportunities","{""competitors"": ""array"", ""category"": ""string""}","{""matrix"": ""object"", ""opportunities"": ""array"", ""threats"": ""array""}",true
```

---

### Task 4.3: Create Prompts for CHG, CST, MKT

**File:** `base/dataverse/seed/eap_prompt_seed.csv`

**Append prompts for each new agent capability.**

---

### Task 4.4: Update Feature Flags

**File:** `release/v6.0/platform/eap/seed/feature_flags_multi_agent.csv`

**Add flags for new agents and set all to enabled:**

```csv
chg_agent_enabled,true,Enable Change Management Agent - readiness and adoption planning,agent,2026-01-19T00:00:00Z,2026-01-19T00:00:00Z
cst_agent_enabled,true,Enable Consulting Strategy Agent - framework selection and prioritization,agent,2026-01-19T00:00:00Z,2026-01-19T00:00:00Z
mkt_agent_enabled,true,Enable Marketing Strategy Agent - campaign strategy and creative briefs,agent,2026-01-19T00:00:00Z,2026-01-19T00:00:00Z
```

**Update existing flags to true:**
- multi_agent_enabled → true
- All existing agent flags → true

---

## PHASE 5: COMPLIANCE FIXES (P1 - Day 2)

### Owner: DESKTOP

### Task 5.1: Fix CHA Numbered Lists

**File:** `release/v6.0/agents/cha/instructions/CHA_Copilot_Instructions_v1.txt`
**Lines:** 210-216

Convert numbered list to hyphen list.

### Task 5.2: Fix Smart Apostrophes

**Files:**
- `agents/anl/kb/ANL_KB_Forecasting_Methods_v1.txt` - Line 137
- `agents/aud/kb/AUD_KB_Identity_Resolution_v1.txt` - Line 357

Replace curly apostrophes with straight apostrophes.

---

## PHASE 6: TEST INFRASTRUCTURE (P2 - Day 3)

### Owner: VS CODE

### Task 6.1: Create Test Directories

```bash
mkdir -p release/v6.0/agents/chg/tests
mkdir -p release/v6.0/agents/mkt/tests
```

### Task 6.2: Expand Routing Tests

**File:** `release/v6.0/tests/multi-agent-routing-tests.json`

Add 10+ new scenarios for CHG, CST, MKT routing and edge cases.

### Task 6.3: Create Capability Tests

Create test JSON files for CHG, CST, MKT agent capabilities.

---

## PHASE 7: DOCUMENTATION UPDATE (P2 - Day 3)

### Owner: DESKTOP

Update all documentation to reflect 10-agent architecture:
- MPA_Architecture_v6.0.md
- MPA_v6_Approved_File_List.md
- KDAP_Quick_Reference.md
- README.md
- CHANGELOG.md

---

## PHASE 8: VALIDATION & DEPLOYMENT (P2 - Day 4)

### Owner: VS CODE

### Task 8.1: Run Compliance Validator
```bash
python3 release/v6.0/validate_compliance.py
```
Expected: 126/126 PASS

### Task 8.2: Validate Seed Data
Run validation script to ensure no blank required fields.

### Task 8.3: Deploy to Personal Environment
1. Import Dataverse tables
2. Import seed data
3. Enable feature flags
4. Run smoke tests

---

## EXECUTION TIMELINE

| Day | Phase | Desktop Tasks | VS Code Tasks |
|-----|-------|--------------|---------------|
| **1** | P1+P3 | 1.1-1.5 (Registries), 2.1-2.3 (Instructions start) | 3.1-3.3 (Flows) |
| **2** | P2+P4+P5 | 2.1-2.3 (Instructions finish), 4.1-4.4 (Seeds), 5.1-5.2 (Compliance) | 3.1-3.3 (Flows finish) |
| **3** | P6+P7 | 7.1 (Documentation) | 6.1-6.3 (Tests) |
| **4** | P8 | Final review | 8.1-8.3 (Validation, Deploy) |

---

## ACCEPTANCE CRITERIA

### Production Ready Checklist

**Registrations:**
- [ ] agent-registry.json has 10 agents
- [ ] INTER_AGENT_CONTRACT has 10 agents in enum
- [ ] eap_agent.json seed_data has 10 agents

**Instructions:**
- [ ] All 10 instructions at 7,500+ chars
- [ ] 6-Rule compliant (ALL-CAPS, hyphens, ASCII)

**Flows:**
- [ ] 25+ total flows (16 + 9 new)
- [ ] Valid YAML syntax

**Routing:**
- [ ] 21+ routing rules
- [ ] All 10 agents routable

**Capabilities:**
- [ ] 50+ capabilities
- [ ] All fields populated

**Seed Data:**
- [ ] No blank required fields
- [ ] Valid data formats

**Compliance:**
- [ ] 100% pass rate on validator

---

## FILES TO CREATE/MODIFY

### DESKTOP Creates:
1. `release/v6.0/platform/agent-registry.json` (MODIFY)
2. `release/v6.0/contracts/INTER_AGENT_CONTRACT_v1.json` (MODIFY)
3. `release/v6.0/platform/eap/dataverse/eap_agent.json` (MODIFY)
4. `release/v6.0/platform/dataverse/agent_routing_rules.csv` (MODIFY)
5. `release/v6.0/platform/dataverse/agent_capabilities.csv` (MODIFY)
6. `release/v6.0/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt` (MODIFY)
7. `release/v6.0/agents/cst/instructions/CST_Copilot_Instructions_v1.txt` (MODIFY)
8. `release/v6.0/agents/mkt/instructions/MKT_Copilot_Instructions_v1.txt` (MODIFY)
9. `base/dataverse/seed/eap_agent_seed.csv` (MODIFY)
10. `base/dataverse/seed/eap_capability_ca_seed.csv` (MODIFY)
11. `base/dataverse/seed/eap_prompt_seed.csv` (MODIFY)
12. `release/v6.0/platform/eap/seed/feature_flags_multi_agent.csv` (MODIFY)
13. Various KB and doc files (MODIFY for compliance)

### VS CODE Creates:
1. `release/v6.0/agents/chg/flows/AssessReadiness.yaml` (CREATE)
2. `release/v6.0/agents/chg/flows/MapStakeholders.yaml` (CREATE)
3. `release/v6.0/agents/chg/flows/PlanAdoption.yaml` (CREATE)
4. `release/v6.0/agents/cst/flows/SelectFramework.yaml` (CREATE)
5. `release/v6.0/agents/cst/flows/ApplyAnalysis.yaml` (CREATE)
6. `release/v6.0/agents/cst/flows/PrioritizeInitiatives.yaml` (CREATE)
7. `release/v6.0/agents/mkt/flows/DevelopStrategy.yaml` (CREATE)
8. `release/v6.0/agents/mkt/flows/CreateBrief.yaml` (CREATE)
9. `release/v6.0/agents/mkt/flows/AnalyzeCompetitive.yaml` (CREATE)
10. `release/v6.0/tests/multi-agent-routing-tests.json` (MODIFY)
11. Test files for CHG, CST, MKT (CREATE)
12. Deployment scripts (CREATE)

---

**Document Status:** READY FOR EXECUTION
**Next Action:** Desktop begins Phase 1 Task 1.1 immediately
