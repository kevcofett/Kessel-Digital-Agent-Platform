# VS CODE CLAUDE: MULTI-AGENT PHASE 5-6 DEPLOYMENT PROMPT

**Date:** January 18, 2026
**Repository:** Kessel-Digital-Agent-Platform
**Branch:** feature/multi-agent-architecture
**Objective:** Complete multi-agent deployment to Copilot Studio

---

## CONTEXT

All 7 specialist agents have instructions and knowledge base files committed to git. This session completes deployment preparation and creates the artifacts needed for Copilot Studio configuration.

### Agent Status (All Complete in Git)

| Agent | Code | Instructions | KB Files |
|-------|------|--------------|----------|
| Orchestrator | ORC | 7,999 chars | 2 files |
| Analytics | ANL | 7,797 chars | 4 files |
| Audience | AUD | 5,143 chars | 3 files |
| Channel | CHA | 7,187 chars | 3 files |
| Supply Path | SPO | 5,364 chars | 3 files |
| Document | DOC | 4,268 chars | 3 files |
| Performance | PRF | 6,436 chars | 3 files |

---

## PHASE 5A: VERIFICATION

### Step 1: Pull Latest and Verify

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git checkout feature/multi-agent-architecture
git pull origin feature/multi-agent-architecture

# Verify all agent files
echo "=== AGENT FILE VERIFICATION ==="
for agent in orc anl aud cha spo doc prf; do
  echo ""
  echo "Agent: $agent"
  echo "Instructions:"
  wc -c release/v6.0/agents/$agent/instructions/*.txt 2>/dev/null || echo "  MISSING"
  echo "KB Files:"
  ls release/v6.0/agents/$agent/kb/*.txt 2>/dev/null || echo "  MISSING"
done
```

### Step 2: Validate Character Counts

All instructions must be under 8,000 characters for Copilot Studio.

```bash
echo "=== CHARACTER COUNT VALIDATION ==="
for agent in orc anl aud cha spo doc prf; do
  chars=$(wc -c < release/v6.0/agents/$agent/instructions/*_Instructions_v1.txt 2>/dev/null)
  if [ "$chars" -gt 8000 ]; then
    echo "WARNING: $agent instructions exceed 8000 chars ($chars)"
  else
    echo "OK: $agent = $chars chars"
  fi
done
```

---

## PHASE 5B: CREATE DEPLOYMENT CHECKLIST

Create file: `release/v6.0/COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md`

```markdown
# COPILOT STUDIO MULTI-AGENT DEPLOYMENT CHECKLIST

**Generated:** [DATE]
**Target Environment:** Aragorn AI (Personal)
**Agents:** 7 (ORC, ANL, AUD, CHA, SPO, DOC, PRF)

---

## PRE-DEPLOYMENT VERIFICATION

- [ ] All instruction files under 8,000 characters
- [ ] All KB files under 36,000 characters
- [ ] All files are plain text (no markdown formatting)
- [ ] All files use ALL-CAPS headers
- [ ] All files use hyphens (no bullets)

---

## ORCHESTRATOR AGENT (ORC)

### Instructions
- [ ] Create new agent in Copilot Studio named "Orchestrator"
- [ ] Copy content from: `release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt`
- [ ] Paste into agent instructions field
- [ ] Verify character count accepted

### Knowledge Base
- [ ] Upload: `ORC_KB_Workflow_Gates_v1.txt`
- [ ] Upload: `ORC_KB_Error_Handling_v1.txt`
- [ ] Wait for indexing to complete
- [ ] Test: "Route this to the analytics agent"

### Tools/Flows
- [ ] Connect: RouteToAgent flow
- [ ] Connect: InitializeSession flow
- [ ] Connect: GetAgentRegistry flow

---

## ANALYTICS AGENT (ANL)

### Instructions
- [ ] Create new agent in Copilot Studio named "Analytics"
- [ ] Copy content from: `release/v6.0/agents/anl/instructions/ANL_Copilot_Instructions_v1.txt`
- [ ] Paste into agent instructions field

### Knowledge Base
- [ ] Upload: `ANL_KB_Analytics_Engine_v1.txt`
- [ ] Upload: `ANL_KB_Projection_Methods_v1.txt`
- [ ] Upload: `ANL_KB_Scenario_Modeling_v1.txt`
- [ ] Upload: `ANL_KB_Statistical_Tests_v1.txt`
- [ ] Wait for indexing to complete
- [ ] Test: "Calculate reach for $500K budget"

### Tools/Flows
- [ ] Connect: CalculateProjection flow
- [ ] Connect: RunScenario flow

---

## AUDIENCE AGENT (AUD)

### Instructions
- [ ] Create new agent in Copilot Studio named "Audience"
- [ ] Copy content from: `release/v6.0/agents/aud/instructions/AUD_Copilot_Instructions_v1.txt`
- [ ] Paste into agent instructions field

### Knowledge Base
- [ ] Upload: `AUD_KB_Segmentation_Methods_v1.txt`
- [ ] Upload: `AUD_KB_LTV_Models_v1.txt`
- [ ] Upload: `AUD_KB_Targeting_Strategy_v1.txt`
- [ ] Wait for indexing to complete
- [ ] Test: "Segment my customers using RFM"

### Tools/Flows
- [ ] Connect: SegmentAudience flow
- [ ] Connect: CalculateLTV flow

---

## CHANNEL AGENT (CHA)

### Instructions
- [ ] Create new agent in Copilot Studio named "Channel"
- [ ] Copy content from: `release/v6.0/agents/cha/instructions/CHA_Copilot_Instructions_v1.txt`
- [ ] Paste into agent instructions field

### Knowledge Base
- [ ] Upload: `CHA_KB_Channel_Registry_v1.txt`
- [ ] Upload: `CHA_KB_Channel_Playbooks_v1.txt`
- [ ] Upload: `CHA_KB_Allocation_Methods_v1.txt`
- [ ] Wait for indexing to complete
- [ ] Test: "Recommend channels for $200K awareness campaign"

### Tools/Flows
- [ ] Connect: LookupBenchmarks flow
- [ ] Connect: CalculateAllocation flow

---

## SUPPLY PATH AGENT (SPO)

### Instructions
- [ ] Create new agent in Copilot Studio named "SupplyPath"
- [ ] Copy content from: `release/v6.0/agents/spo/instructions/SPO_Copilot_Instructions_v1.txt`
- [ ] Paste into agent instructions field

### Knowledge Base
- [ ] Upload: `SPO_KB_NBI_Calculation_v1.txt`
- [ ] Upload: `SPO_KB_Fee_Analysis_v1.txt`
- [ ] Upload: `SPO_KB_Partner_Evaluation_v1.txt`
- [ ] Wait for indexing to complete
- [ ] Test: "Calculate NBI for $10 CPM with 15% fees"

### Tools/Flows
- [ ] Connect: CalculateNBI flow
- [ ] Connect: AnalyzeFees flow
- [ ] Connect: EvaluatePartner flow

---

## DOCUMENT AGENT (DOC)

### Instructions
- [ ] Create new agent in Copilot Studio named "Document"
- [ ] Copy content from: `release/v6.0/agents/doc/instructions/DOC_Copilot_Instructions_v1.txt`
- [ ] Paste into agent instructions field

### Knowledge Base
- [ ] Upload: `DOC_KB_Template_Library_v1.txt`
- [ ] Upload: `DOC_KB_Formatting_Rules_v1.txt`
- [ ] Upload: `DOC_KB_Export_Specifications_v1.txt`
- [ ] Wait for indexing to complete
- [ ] Test: "Generate a media plan summary"

### Tools/Flows
- [ ] Connect: GenerateDocument flow
- [ ] Connect: ExportPlan flow

### Azure Functions
- [ ] Verify: GenerateWordDoc function deployed
- [ ] Verify: GeneratePDF function deployed

---

## PERFORMANCE AGENT (PRF)

### Instructions
- [ ] Create new agent in Copilot Studio named "Performance"
- [ ] Copy content from: `release/v6.0/agents/prf/instructions/PRF_Copilot_Instructions_v1.txt`
- [ ] Paste into agent instructions field

### Knowledge Base
- [ ] Upload: `PRF_KB_Optimization_Triggers_v1.txt`
- [ ] Upload: `PRF_KB_Anomaly_Detection_v1.txt`
- [ ] Upload: `PRF_KB_Learning_Extraction_v1.txt`
- [ ] Wait for indexing to complete
- [ ] Test: "Analyze campaign performance against benchmarks"

### Tools/Flows
- [ ] Connect: AnalyzePerformance flow
- [ ] Connect: DetectAnomalies flow
- [ ] Connect: ExtractLearnings flow

---

## POST-DEPLOYMENT VALIDATION

### Routing Tests
- [ ] ORC routes analytics query to ANL
- [ ] ORC routes audience query to AUD
- [ ] ORC routes channel query to CHA
- [ ] ORC routes supply path query to SPO
- [ ] ORC routes document query to DOC
- [ ] ORC routes performance query to PRF
- [ ] ORC handles unknown query gracefully

### Cross-Agent Handoffs
- [ ] ANL can hand off to CHA for channel recommendations
- [ ] CHA can hand off to SPO for supply path analysis
- [ ] PRF can hand off to CHA for reallocation
- [ ] Any agent can hand off to DOC for document generation

### End-to-End Tests
- [ ] Complete media planning workflow through all agents
- [ ] Document generation produces valid output
- [ ] Session state maintained across agent transitions

---

## SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| Product Owner | | | |
```

---

## PHASE 5C: CREATE ROUTING TEST SUITE

Create file: `release/v6.0/tests/multi-agent-routing-tests.json`

```json
{
  "testSuite": "Multi-Agent Routing Validation",
  "version": "1.0",
  "created": "2026-01-18",
  "totalScenarios": 35,
  "categories": [
    {
      "name": "ORC Routing",
      "scenarios": [
        {
          "id": "orc-001",
          "input": "Calculate reach and frequency for my campaign",
          "expectedAgent": "ANL",
          "expectedBehavior": "Route to Analytics for calculations"
        },
        {
          "id": "orc-002",
          "input": "Segment my customer database",
          "expectedAgent": "AUD",
          "expectedBehavior": "Route to Audience for segmentation"
        },
        {
          "id": "orc-003",
          "input": "Which channels should I use for awareness?",
          "expectedAgent": "CHA",
          "expectedBehavior": "Route to Channel for recommendations"
        },
        {
          "id": "orc-004",
          "input": "What's the NBI on this programmatic buy?",
          "expectedAgent": "SPO",
          "expectedBehavior": "Route to Supply Path for NBI calculation"
        },
        {
          "id": "orc-005",
          "input": "Generate a media plan document",
          "expectedAgent": "DOC",
          "expectedBehavior": "Route to Document for generation"
        },
        {
          "id": "orc-006",
          "input": "How did my campaign perform vs benchmarks?",
          "expectedAgent": "PRF",
          "expectedBehavior": "Route to Performance for analysis"
        },
        {
          "id": "orc-007",
          "input": "Hello, how are you?",
          "expectedAgent": "ORC",
          "expectedBehavior": "Handle greeting, offer guidance"
        },
        {
          "id": "orc-008",
          "input": "What can you help me with?",
          "expectedAgent": "ORC",
          "expectedBehavior": "Explain capabilities, list agents"
        }
      ]
    },
    {
      "name": "ANL Scenarios",
      "scenarios": [
        {
          "id": "anl-001",
          "input": "Project impressions for $500K budget on Meta",
          "expectedAgent": "ANL",
          "expectedBehavior": "Calculate impressions using CPM benchmarks"
        },
        {
          "id": "anl-002",
          "input": "What's the optimal frequency for awareness?",
          "expectedAgent": "ANL",
          "expectedBehavior": "Reference frequency guidelines"
        },
        {
          "id": "anl-003",
          "input": "Run a scenario with 20% budget increase",
          "expectedAgent": "ANL",
          "expectedBehavior": "Model budget change impact"
        }
      ]
    },
    {
      "name": "AUD Scenarios",
      "scenarios": [
        {
          "id": "aud-001",
          "input": "Create RFM segments from my customer data",
          "expectedAgent": "AUD",
          "expectedBehavior": "Apply RFM methodology"
        },
        {
          "id": "aud-002",
          "input": "Calculate customer lifetime value",
          "expectedAgent": "AUD",
          "expectedBehavior": "Apply LTV model"
        },
        {
          "id": "aud-003",
          "input": "Which segments should I target for retention?",
          "expectedAgent": "AUD",
          "expectedBehavior": "Recommend At Risk and Champions"
        }
      ]
    },
    {
      "name": "CHA Scenarios",
      "scenarios": [
        {
          "id": "cha-001",
          "input": "Recommend channel mix for ecommerce brand",
          "expectedAgent": "CHA",
          "expectedBehavior": "Apply ecommerce playbook"
        },
        {
          "id": "cha-002",
          "input": "What's the minimum budget for CTV?",
          "expectedAgent": "CHA",
          "expectedBehavior": "Reference channel minimums"
        },
        {
          "id": "cha-003",
          "input": "Allocate $1M across awareness and conversion",
          "expectedAgent": "CHA",
          "expectedBehavior": "Apply allocation formulas"
        }
      ]
    },
    {
      "name": "SPO Scenarios",
      "scenarios": [
        {
          "id": "spo-001",
          "input": "Calculate net bid impression for $15 CPM",
          "expectedAgent": "SPO",
          "expectedBehavior": "Apply NBI formula"
        },
        {
          "id": "spo-002",
          "input": "Break down the fee structure for this DSP",
          "expectedAgent": "SPO",
          "expectedBehavior": "Analyze fee components"
        },
        {
          "id": "spo-003",
          "input": "Compare PMP vs open exchange efficiency",
          "expectedAgent": "SPO",
          "expectedBehavior": "Evaluate supply paths"
        }
      ]
    },
    {
      "name": "DOC Scenarios",
      "scenarios": [
        {
          "id": "doc-001",
          "input": "Create a media plan summary document",
          "expectedAgent": "DOC",
          "expectedBehavior": "Generate formatted document"
        },
        {
          "id": "doc-002",
          "input": "Export my plan to Excel",
          "expectedAgent": "DOC",
          "expectedBehavior": "Generate Excel export"
        },
        {
          "id": "doc-003",
          "input": "Format this as a client presentation",
          "expectedAgent": "DOC",
          "expectedBehavior": "Apply presentation template"
        }
      ]
    },
    {
      "name": "PRF Scenarios",
      "scenarios": [
        {
          "id": "prf-001",
          "input": "Analyze my campaign performance",
          "expectedAgent": "PRF",
          "expectedBehavior": "Compare to benchmarks"
        },
        {
          "id": "prf-002",
          "input": "Detect any anomalies in my metrics",
          "expectedAgent": "PRF",
          "expectedBehavior": "Apply anomaly detection"
        },
        {
          "id": "prf-003",
          "input": "What learnings can we extract from Q4?",
          "expectedAgent": "PRF",
          "expectedBehavior": "Extract insights and recommendations"
        }
      ]
    },
    {
      "name": "Cross-Agent Handoffs",
      "scenarios": [
        {
          "id": "cross-001",
          "input": "Calculate reach, then recommend channels",
          "expectedFlow": "ANL -> CHA",
          "expectedBehavior": "ANL calculates, hands off to CHA"
        },
        {
          "id": "cross-002",
          "input": "Segment audience, then target with channels",
          "expectedFlow": "AUD -> CHA",
          "expectedBehavior": "AUD segments, CHA recommends channels"
        },
        {
          "id": "cross-003",
          "input": "Analyze performance and suggest reallocations",
          "expectedFlow": "PRF -> CHA",
          "expectedBehavior": "PRF analyzes, CHA reallocates"
        },
        {
          "id": "cross-004",
          "input": "Create plan and generate document",
          "expectedFlow": "CHA -> DOC",
          "expectedBehavior": "CHA creates plan, DOC generates doc"
        }
      ]
    }
  ]
}
```

---

## PHASE 5D: CREATE AGENT REGISTRY UPDATE

Create/update file: `release/v6.0/platform/agent-registry.json`

```json
{
  "version": "6.0",
  "updated": "2026-01-18",
  "agents": [
    {
      "code": "ORC",
      "name": "Orchestrator",
      "description": "Routes requests to specialist agents, manages session state",
      "instructionsFile": "ORC_Copilot_Instructions_v1.txt",
      "kbFiles": ["ORC_KB_Workflow_Gates_v1.txt", "ORC_KB_Error_Handling_v1.txt"],
      "flows": ["RouteToAgent", "InitializeSession", "GetAgentRegistry"],
      "isRouter": true,
      "status": "active"
    },
    {
      "code": "ANL",
      "name": "Analytics",
      "description": "Calculations, projections, scenario modeling",
      "instructionsFile": "ANL_Copilot_Instructions_v1.txt",
      "kbFiles": ["ANL_KB_Analytics_Engine_v1.txt", "ANL_KB_Projection_Methods_v1.txt", "ANL_KB_Scenario_Modeling_v1.txt", "ANL_KB_Statistical_Tests_v1.txt"],
      "flows": ["CalculateProjection", "RunScenario"],
      "isRouter": false,
      "status": "active"
    },
    {
      "code": "AUD",
      "name": "Audience",
      "description": "Segmentation, LTV, targeting strategy",
      "instructionsFile": "AUD_Copilot_Instructions_v1.txt",
      "kbFiles": ["AUD_KB_Segmentation_Methods_v1.txt", "AUD_KB_LTV_Models_v1.txt", "AUD_KB_Targeting_Strategy_v1.txt"],
      "flows": ["SegmentAudience", "CalculateLTV"],
      "isRouter": false,
      "status": "active"
    },
    {
      "code": "CHA",
      "name": "Channel",
      "description": "Channel selection, allocation, benchmarks",
      "instructionsFile": "CHA_Copilot_Instructions_v1.txt",
      "kbFiles": ["CHA_KB_Channel_Registry_v1.txt", "CHA_KB_Channel_Playbooks_v1.txt", "CHA_KB_Allocation_Methods_v1.txt"],
      "flows": ["LookupBenchmarks", "CalculateAllocation"],
      "isRouter": false,
      "status": "active"
    },
    {
      "code": "SPO",
      "name": "SupplyPath",
      "description": "NBI calculation, fee analysis, partner evaluation",
      "instructionsFile": "SPO_Copilot_Instructions_v1.txt",
      "kbFiles": ["SPO_KB_NBI_Calculation_v1.txt", "SPO_KB_Fee_Analysis_v1.txt", "SPO_KB_Partner_Evaluation_v1.txt"],
      "flows": ["CalculateNBI", "AnalyzeFees", "EvaluatePartner"],
      "isRouter": false,
      "status": "active"
    },
    {
      "code": "DOC",
      "name": "Document",
      "description": "Document generation, formatting, exports",
      "instructionsFile": "DOC_Copilot_Instructions_v1.txt",
      "kbFiles": ["DOC_KB_Template_Library_v1.txt", "DOC_KB_Formatting_Rules_v1.txt", "DOC_KB_Export_Specifications_v1.txt"],
      "flows": ["GenerateDocument", "ExportPlan"],
      "azureFunctions": ["GenerateWordDoc", "GeneratePDF"],
      "isRouter": false,
      "status": "active"
    },
    {
      "code": "PRF",
      "name": "Performance",
      "description": "Performance analysis, anomaly detection, learnings",
      "instructionsFile": "PRF_Copilot_Instructions_v1.txt",
      "kbFiles": ["PRF_KB_Optimization_Triggers_v1.txt", "PRF_KB_Anomaly_Detection_v1.txt", "PRF_KB_Learning_Extraction_v1.txt"],
      "flows": ["AnalyzePerformance", "DetectAnomalies", "ExtractLearnings"],
      "isRouter": false,
      "status": "active"
    }
  ],
  "routingKeywords": {
    "ANL": ["calculate", "projection", "scenario", "forecast", "reach", "frequency", "impressions", "model"],
    "AUD": ["segment", "audience", "rfm", "ltv", "lifetime value", "customer", "targeting", "cohort"],
    "CHA": ["channel", "allocation", "budget", "mix", "platform", "cpm", "benchmark", "funnel"],
    "SPO": ["nbi", "supply path", "fee", "dsp", "ssp", "programmatic", "exchange", "partner"],
    "DOC": ["document", "export", "generate", "pdf", "word", "excel", "report", "summary"],
    "PRF": ["performance", "analyze", "anomaly", "learning", "optimize", "trend", "variance", "kpi"]
  }
}
```

---

## PHASE 5E: COMMIT AND PUSH

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Stage all new files
git add release/v6.0/COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md
git add release/v6.0/tests/multi-agent-routing-tests.json
git add release/v6.0/platform/agent-registry.json

# Commit
git commit -m "Phase 5: Multi-agent deployment checklist, routing tests, and agent registry

- COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md: Step-by-step deployment guide for all 7 agents
- multi-agent-routing-tests.json: 35 test scenarios for routing validation
- agent-registry.json: Complete agent configuration with routing keywords

Ready for Copilot Studio deployment."

# Push
git push origin feature/multi-agent-architecture
```

---

## PHASE 6: PRODUCTION DEPLOYMENT (After Copilot Studio Setup)

### Step 1: Deploy to Aragorn AI (Personal)

1. Follow COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md
2. Configure all 7 agents
3. Run routing tests
4. Validate end-to-end workflows

### Step 2: Deploy to Mastercard

1. Create feature flag: `multi_agent_enabled = false`
2. Deploy agents to Mastercard environment
3. Set feature flag to 10% rollout
4. Monitor for 48 hours
5. If stable, increase to 50%
6. If stable, increase to 100%

### Step 3: Deprecate Monolithic MPA

1. After 2 weeks at 100% multi-agent
2. Archive MPA v5.5 instructions
3. Update documentation
4. Remove feature flag

---

## SUCCESS CRITERIA

- [ ] All 7 agents deployed to Copilot Studio
- [ ] All routing tests pass (35/35)
- [ ] Cross-agent handoffs working
- [ ] Document generation functional
- [ ] Performance within acceptable latency (< 5s per agent response)
- [ ] No regressions from monolithic MPA

---

## TROUBLESHOOTING

### Agent Not Responding
1. Check instructions character count (< 8,000)
2. Verify KB files indexed
3. Check flow connections

### Routing Incorrect
1. Review ORC routing keywords
2. Check agent registry configuration
3. Test with explicit routing: "Route this to [AGENT]"

### Document Generation Failed
1. Verify Azure Functions deployed
2. Check function app logs
3. Verify SharePoint permissions

---

## CONTACT

For issues during deployment:
- Repository: Kessel-Digital-Agent-Platform
- Branch: feature/multi-agent-architecture
- Lead: Kev
