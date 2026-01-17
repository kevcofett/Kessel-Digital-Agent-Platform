# MULTI-AGENT ARCHITECTURE: COMPLETE IMPLEMENTATION WORKPLAN

**Version:** 1.0  
**Created:** January 2026  
**Branch:** `feature/multi-agent-architecture`  
**Status:** PLANNING

---

## EXECUTIVE SUMMARY

This workplan details the transformation of the monolithic MPA into a 7-agent specialized system while maintaining full backward compatibility with production deployments.

### Key Outcomes
- 7x instruction capacity (8K → 56K characters)
- Dedicated KB files per agent (no cross-contamination)
- Independent evaluation and tuning per specialist
- Parallel development without production impact

### Timeline
- **Phase 1-2:** 4 weeks (Foundation + ORC + ANL)
- **Phase 3-4:** 4 weeks (AUD + CHA + Integration)
- **Phase 5-6:** 4 weeks (SPO + DOC + PRF + Production)
- **Total:** 12 weeks to full production

---

## BUILD RESPONSIBILITY MATRIX

| Component | Claude.ai | VS Code | Rationale |
|-----------|-----------|---------|-----------|
| Copilot Instructions | ✅ Primary | Review | Natural language, strategy |
| Knowledge Base Files | ✅ Primary | Review | Domain expertise, formatting |
| Communication Contracts | ✅ Primary | Implement | Contract design |
| Power Automate Flows | Design | ✅ Primary | Technical implementation |
| Azure Functions | Design | ✅ Primary | Code, deployment |
| Dataverse Schema | Design | ✅ Primary | Table creation, relationships |
| Braintrust Scorers | Design | ✅ Primary | TypeScript implementation |
| Test Datasets | ✅ Primary | Execute | Scenario design |
| Evaluation Harness | Design | ✅ Primary | Integration code |
| Git Operations | Guidance | ✅ Primary | Branch management |
| Deployment Scripts | Design | ✅ Primary | PowerShell/Python |

---

## PHASE 1: FOUNDATION (Week 1-2)

### Objective
Establish the multi-agent infrastructure without breaking existing MPA.

### 1.1 Repository Structure Setup

**VS Code Tasks:**

```bash
# Create multi-agent folder structure
mkdir -p release/v6.0/agents/{orc,anl,aud,cha,spo,doc,prf}/{instructions,kb,flows,tests}
mkdir -p release/v6.0/platform/eap
mkdir -p release/v6.0/contracts
mkdir -p packages/agent-core/src/{session,audit,contracts,types}
```

**Files to Create:**
| File | Owner | Description |
|------|-------|-------------|
| `release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt` | Claude.ai | Orchestrator instructions |
| `release/v6.0/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt` | Claude.ai | Routing patterns |
| `release/v6.0/contracts/INTER_AGENT_CONTRACT_v1.json` | VS Code | JSON schema |
| `packages/agent-core/src/types/agent-request.ts` | VS Code | TypeScript types |
| `packages/agent-core/src/types/agent-response.ts` | VS Code | TypeScript types |
| `packages/agent-core/src/contracts/index.ts` | VS Code | Contract exports |

### 1.2 Communication Contract Implementation

**Claude.ai Delivers:**
- Complete contract specification (already in project: `MULTI_AGENT_COMMUNICATION_CONTRACT_v1.txt`)
- Request/response schemas for each agent type
- Error handling patterns
- Context preservation rules

**VS Code Implements:**
```typescript
// packages/agent-core/src/types/agent-request.ts
export interface AgentRequest {
  request_id: string;
  timestamp: string;
  source_agent: AgentCode;
  target_agent: AgentCode;
  request_type: string;
  session_context: SessionContext;
  parameters: Record<string, unknown>;
  options?: RequestOptions;
}

export type AgentCode = 'ORC' | 'ANL' | 'AUD' | 'CHA' | 'SPO' | 'DOC' | 'PRF';

export interface SessionContext {
  session_id: string;
  workflow_step: number;
  workflow_gate: number;
  session_type: 'Planning' | 'InFlight' | 'PostMortem' | 'Audit';
  plan_state: PlanState;
}
```

### 1.3 EAP Shared Services Extraction

**VS Code Tasks:**
1. Create `packages/agent-core/src/session/session-manager.ts`
2. Create `packages/agent-core/src/audit/audit-logger.ts`
3. Extract common Dataverse operations
4. Implement agent registry interface

**Dataverse Tables Required:**
| Table | Purpose | Owner |
|-------|---------|-------|
| `eap_agent` | Agent registry | VS Code |
| `eap_agent_capability` | Capability mapping | VS Code |
| `eap_routing_log` | Routing decisions | VS Code |

### 1.4 Feature Flag Setup

**Add to `eap_feature_flag` table:**
```csv
flag_key,flag_value,description
multi_agent_enabled,false,Enable multi-agent routing
orc_agent_enabled,false,Enable Orchestrator Agent
anl_agent_enabled,false,Enable Analytics Agent
aud_agent_enabled,false,Enable Audience Agent
cha_agent_enabled,false,Enable Channel Agent
spo_agent_enabled,false,Enable Supply Path Agent
doc_agent_enabled,false,Enable Document Agent
prf_agent_enabled,false,Enable Performance Agent
```

### Phase 1 Deliverables Checklist
- [ ] Folder structure created
- [ ] `packages/agent-core` package initialized
- [ ] Communication contract types implemented
- [ ] EAP shared services extracted
- [ ] Agent registry table created
- [ ] Feature flags added
- [ ] ORC instructions finalized (Claude.ai)
- [ ] ORC routing KB finalized (Claude.ai)

---

## PHASE 2: ORCHESTRATOR + ANALYTICS (Week 3-4)

### Objective
Deploy ORC with ANL as first specialist. Validate routing pattern.

### 2.1 Orchestrator Agent (ORC)

**Claude.ai Delivers:**
| Artifact | Characters | Status |
|----------|------------|--------|
| `ORC_Copilot_Instructions_v1.txt` | ~5,800 | ✅ Complete (in project) |
| `ORC_KB_Routing_Logic_v1.txt` | ~11,000 | ✅ Complete (in project) |
| `ORC_KB_Workflow_Gates_v1.txt` | ~6,000 | To create |
| `ORC_KB_Error_Handling_v1.txt` | ~4,000 | To create |

**VS Code Implements:**
| Component | Description |
|-----------|-------------|
| `Flow: RouteToSpecialist` | HTTP-triggered, routes to specialist agents |
| `Flow: GetSessionState` | Retrieves current plan state from EAP |
| `Flow: UpdateProgress` | Marks steps/gates complete |
| `Flow: GetPlanSummary` | Generates status overview |
| Copilot Topic: ORC Main | Entry point, triggers routing |


**RouteToSpecialist Flow Specification:**
```
Trigger: HTTP POST from Copilot Studio
Input: { user_message, session_id, current_step }

Steps:
1. Call ORC Copilot for intent classification
2. Parse routing decision from ORC response
3. If target_agent != 'ORC':
   a. Build AgentRequest with session_context
   b. Call target specialist Copilot
   c. Parse specialist response
   d. Return synthesized response to ORC
4. Return final response to user
```

### 2.2 Analytics Agent (ANL)

**Claude.ai Delivers:**
| Artifact | Characters | Purpose |
|----------|------------|---------|
| `ANL_Copilot_Instructions_v1.txt` | ~5,500 | ✅ Complete (in project) |
| `ANL_KB_Analytics_Engine_v1.txt` | ~35,000 | Core formulas (extract from 83KB master) |
| `ANL_KB_Projection_Methods_v1.txt` | ~8,000 | Forecasting methodology |
| `ANL_KB_Statistical_Tests_v1.txt` | ~6,000 | Significance, incrementality |
| `ANL_KB_Scenario_Modeling_v1.txt` | ~5,000 | What-if patterns |

**VS Code Implements:**
| Component | Description |
|-----------|-------------|
| `Flow: CalculateProjection` | Core math engine |
| `Flow: RunScenario` | Multi-variable comparison |
| `Flow: ValidateStatistics` | Confidence intervals |
| `Function: forecast-engine` | Azure Function for complex calcs |
| Copilot Topic: ANL Main | Entry point for analytics |

### 2.3 ORC ↔ ANL Integration Test

**Test Scenarios (Claude.ai designs, VS Code implements):**
```
Scenario: Budget Projection Request
User: "What results can I expect from a $500K budget?"
Expected:
1. ORC classifies as ANL request
2. ORC routes to ANL with session context
3. ANL calculates projections
4. ANL returns structured response
5. ORC synthesizes and presents to user
```

### Phase 2 Deliverables Checklist
- [ ] ORC deployed to Copilot Studio
- [ ] ORC KB files uploaded to SharePoint
- [ ] ANL deployed to Copilot Studio
- [ ] ANL KB files uploaded to SharePoint
- [ ] RouteToSpecialist flow operational
- [ ] ORC ↔ ANL routing validated
- [ ] Evaluation dataset created (10 scenarios)
- [ ] Baseline accuracy established

---

## PHASE 3: AUDIENCE + CHANNEL (Week 5-6)

### Objective
Add AUD and CHA specialists. Validate cross-specialist routing.

### 3.1 Audience Intelligence Agent (AUD)

**Claude.ai Delivers:**
| Artifact | Characters | Purpose |
|----------|------------|---------|
| `AUD_Copilot_Instructions_v1.txt` | ~6,800 | ✅ Complete (in project) |
| `AUD_KB_Segmentation_Methods_v1.txt` | ~10,000 | RFM, behavioral |
| `AUD_KB_LTV_Modeling_v1.txt` | ~8,000 | Cohort analysis |
| `AUD_KB_Targeting_Strategy_v1.txt` | ~12,000 | Extract from existing |
| `AUD_KB_Data_Sources_v1.txt` | ~6,000 | 1P, CDP, clean rooms |

**VS Code Implements:**
| Component | Description |
|-----------|-------------|
| `Flow: CalculateLTV` | LTV cohort projection |
| `Flow: SegmentAudience` | RFM scoring |
| `Flow: GetAudienceRecommendation` | Targeting strategy |
| Copilot Topic: AUD Main | Entry point |

### 3.2 Channel Strategy Agent (CHA)

**Claude.ai Delivers:**
| Artifact | Characters | Purpose |
|----------|------------|---------|
| `CHA_Copilot_Instructions_v1.txt` | ~7,500 | ✅ Complete (in project) |
| `CHA_KB_Channel_Registry_v1.txt` | ~15,000 | 43 channels detailed |
| `CHA_KB_Allocation_Logic_v1.txt` | ~10,000 | Optimization rules |
| `CHA_KB_Benchmark_Reference_v1.txt` | ~12,000 | Vertical benchmarks |
| `CHA_KB_Platform_Capabilities_v1.txt` | ~8,000 | Meta, Google, TikTok |

**VS Code Implements:**
| Component | Description |
|-----------|-------------|
| `Flow: LookupBenchmarks` | Dataverse query |
| `Flow: CalculateAllocation` | Budget distribution |
| `Flow: GetChannelRecommendation` | Mix optimization |
| Copilot Topic: CHA Main | Entry point |

### 3.3 Cross-Specialist Routing

**Test Scenarios:**
```
Scenario: Audience-Informed Channel Selection
User: "Recommend channels for reaching high-LTV customers"
Expected:
1. ORC classifies as AUD + CHA request
2. ORC routes to AUD first (get audience insight)
3. AUD returns LTV segments
4. ORC routes to CHA with AUD context
5. CHA returns channel recommendations
6. ORC synthesizes combined response
```

### Phase 3 Deliverables Checklist
- [ ] AUD deployed to Copilot Studio
- [ ] AUD KB files uploaded
- [ ] CHA deployed to Copilot Studio
- [ ] CHA KB files uploaded
- [ ] AUD ↔ CHA cross-routing validated
- [ ] Evaluation dataset expanded (25 scenarios)
- [ ] Accuracy tracked per agent

---

## PHASE 4: INTEGRATION + STABILIZATION (Week 7-8)

### Objective
Integrate ORC + ANL + AUD + CHA. Comprehensive testing.


### 4.1 Full Workflow Test

**End-to-End Planning Session:**
```
Step 1-3 (Foundation): ORC handles, consults ANL for projections
Step 4 (Audience): ORC routes to AUD
Step 5 (Channels): ORC routes to CHA with AUD context
Step 6 (Partners): ORC handles with CHA support
...
```

### 4.2 Evaluation Harness

**VS Code Implements:**
```typescript
// release/v6.0/tests/multi-agent-eval.ts
import { Eval } from 'braintrust';

const multiAgentEval = Eval('multi-agent-mpa', {
  data: () => loadMultiAgentDataset(),
  task: async (input) => {
    const response = await callOrcAgent(input.message, input.session);
    return response;
  },
  scores: [
    routingAccuracyScorer,      // Did ORC route to correct specialist?
    specialistQualityScorer,    // Did specialist provide good response?
    synthesisCoherenceScorer,   // Did ORC combine responses well?
    workflowProgressionScorer,  // Did session advance correctly?
  ],
});
```

### 4.3 A/B Comparison

**Feature Flag Strategy:**
```
User Group A (10%): multi_agent_enabled = true  → ORC + specialists
User Group B (90%): multi_agent_enabled = false → MPA v5.5 monolithic
```

**VS Code Tasks:**
1. Implement feature flag routing in entry flow
2. Log which path each session takes
3. Compare accuracy metrics between groups

### Phase 4 Deliverables Checklist
- [ ] Full 10-step workflow tested with 4 agents
- [ ] Evaluation harness running in Braintrust
- [ ] A/B feature flag implemented
- [ ] Comparison metrics collected
- [ ] Performance baseline vs multi-agent documented
- [ ] Bug fixes from integration testing

---

## PHASE 5: REMAINING SPECIALISTS (Week 9-10)

### Objective
Add SPO, DOC, PRF. Complete the 7-agent ecosystem.

### 5.1 Supply Path Optimization Agent (SPO)

**Claude.ai Delivers:**
| Artifact | Characters | Purpose |
|----------|------------|---------|
| `SPO_Copilot_Instructions_v1.txt` | ~6,000 | ✅ Complete (in project) |
| `SPO_KB_Fee_Analysis_v1.txt` | ~10,000 | Waterfall breakdown |
| `SPO_KB_Partner_Evaluation_v1.txt` | ~8,000 | DSP/SSP scoring |
| `SPO_KB_NBI_Calculation_v1.txt` | ~5,000 | Net Benefit Index |

**VS Code Implements:**
| Component | Description |
|-----------|-------------|
| `Flow: CalculateNBI` | Net Benefit Index |
| `Flow: AnalyzeSupplyPath` | Fee transparency |
| `Function: spo-calculator` | Complex fee math |

### 5.2 Document Generation Agent (DOC)

**Claude.ai Delivers:**
| Artifact | Characters | Purpose |
|----------|------------|---------|
| `DOC_Copilot_Instructions_v1.txt` | ~6,500 | ✅ Complete (in project) |
| `DOC_KB_Template_Library_v1.txt` | ~12,000 | Document structures |
| `DOC_KB_Formatting_Rules_v1.txt` | ~6,000 | Brand standards |
| `DOC_KB_Export_Specifications_v1.txt` | ~4,000 | DOCX, PDF, PPTX |

**VS Code Implements:**
| Component | Description |
|-----------|-------------|
| `Flow: GenerateDocument` | Triggers Azure Function |
| `Function: document-generator` | docx/PDF generation |
| `Function: presentation-generator` | PPTX generation |

### 5.3 Performance Intelligence Agent (PRF)

**Claude.ai Delivers:**
| Artifact | Characters | Purpose |
|----------|------------|---------|
| `PRF_Copilot_Instructions_v1.txt` | ~7,000 | ✅ Complete (in project) |
| `PRF_KB_Optimization_Triggers_v1.txt` | ~10,000 | Threshold rules |
| `PRF_KB_Anomaly_Detection_v1.txt` | ~6,000 | Statistical patterns |
| `PRF_KB_Learning_Extraction_v1.txt` | ~5,000 | Post-mortem process |

**VS Code Implements:**
| Component | Description |
|-----------|-------------|
| `Flow: AnalyzePerformance` | Variance calculation |
| `Flow: DetectAnomalies` | Threshold checking |
| `Flow: ExtractLearnings` | Store to EAP |

### Phase 5 Deliverables Checklist
- [ ] SPO deployed and integrated
- [ ] DOC deployed and integrated
- [ ] PRF deployed and integrated
- [ ] All 7 agents operational
- [ ] Evaluation expanded to 50+ scenarios
- [ ] All agents achieving target accuracy

---

## PHASE 6: PRODUCTION DEPLOYMENT (Week 11-12)

### Objective
Deploy to production. Deprecate monolithic MPA path.

### 6.1 Production Readiness

**Checklist:**
- [ ] All 7 agents passing 95%+ accuracy
- [ ] Latency within acceptable range (<5s per response)
- [ ] Error handling validated
- [ ] Fallback behaviors tested
- [ ] Session persistence confirmed
- [ ] Audit logging complete

### 6.2 Deployment Sequence

**Aragorn AI (Personal) First:**
```bash
git checkout deploy/personal
git merge feature/multi-agent-architecture
# Update feature flags to enable multi-agent
# Validate in personal environment
```

**Mastercard (Corporate) Second:**
```bash
git checkout deploy/mastercard
git merge feature/multi-agent-architecture
# Apply corporate extensions
# Deploy with feature flag at 10%
# Gradually increase to 100%
```


### 6.3 Rollback Plan

**If issues detected:**
1. Set `multi_agent_enabled = false` in feature flags
2. Users immediately fall back to MPA v5.5
3. Investigate and fix issues
4. Re-enable gradually

### Phase 6 Deliverables Checklist
- [ ] Aragorn AI deployment complete
- [ ] Mastercard deployment complete
- [ ] MPA v5.5 deprecated (but available for rollback)
- [ ] Documentation updated
- [ ] Team trained on new architecture

---

## PRIORITY ORDER: WHY THIS SEQUENCE?

| Phase | Agents | Rationale |
|-------|--------|-----------|
| 1 | Foundation | Can't build agents without infrastructure |
| 2 | ORC + ANL | ORC is required first; ANL validates routing works |
| 3 | AUD + CHA | Highest user impact; most requests |
| 4 | Integration | Must stabilize before adding more |
| 5 | SPO + DOC + PRF | Lower volume; can iterate after core stable |
| 6 | Production | Only after comprehensive testing |

---

## VS CODE TASK SUMMARY

### Immediate Tasks (Phase 1)
1. Create folder structure
2. Initialize `packages/agent-core` with TypeScript
3. Implement communication contract types
4. Create agent registry Dataverse table
5. Add feature flags for multi-agent

### Phase 2 Tasks
1. Create RouteToSpecialist Power Automate flow
2. Create GetSessionState Power Automate flow
3. Deploy ORC to Copilot Studio
4. Deploy ANL to Copilot Studio
5. Create forecast-engine Azure Function
6. Build initial evaluation harness

### Phase 3-4 Tasks
1. Deploy AUD to Copilot Studio
2. Deploy CHA to Copilot Studio
3. Create LTV calculation flow
4. Create benchmark lookup flow
5. Implement cross-agent routing tests
6. Build A/B feature flag routing

### Phase 5-6 Tasks
1. Deploy SPO, DOC, PRF agents
2. Create document generation Azure Functions
3. Implement production deployment scripts
4. Configure monitoring and alerting

---

## CLAUDE.AI TASK SUMMARY

### Immediate Tasks (Phase 1)
1. Finalize ORC KB files (Workflow Gates, Error Handling)
2. Review communication contract with VS Code

### Phase 2 Tasks
1. Create ANL KB files (extract from Analytics Engine)
2. Design evaluation test scenarios
3. Review ORC ↔ ANL integration

### Phase 3-4 Tasks
1. Create AUD KB files
2. Create CHA KB files
3. Design cross-specialist test scenarios
4. Refine routing logic based on test results

### Phase 5-6 Tasks
1. Create SPO, DOC, PRF KB files
2. Final documentation review
3. Training materials

---

## FILE INVENTORY

### Already Complete (In Project Files)
| File | Location |
|------|----------|
| ORC_Copilot_Instructions_v1.txt | /mnt/project/ |
| ORC_KB_Routing_Logic_v1.txt | /mnt/project/ |
| ANL_Copilot_Instructions_v1.txt | /mnt/project/ |
| AUD_Copilot_Instructions_v1.txt | /mnt/project/ |
| CHA_Copilot_Instructions_v1.txt | /mnt/project/ |
| SPO_Copilot_Instructions_v1.txt | /mnt/project/ |
| DOC_Copilot_Instructions_v1.txt | /mnt/project/ |
| PRF_Copilot_Instructions_v1.txt | /mnt/project/ |
| MPA_Multi_Agent_Architecture_Blueprint.docx | /mnt/project/ |
| MULTI_AGENT_COMMUNICATION_CONTRACT_v1.txt | /mnt/project/ |

### To Create (Claude.ai)
| File | Priority | Phase |
|------|----------|-------|
| ORC_KB_Workflow_Gates_v1.txt | High | 1 |
| ORC_KB_Error_Handling_v1.txt | High | 1 |
| ANL_KB_Analytics_Engine_v1.txt | High | 2 |
| ANL_KB_Projection_Methods_v1.txt | High | 2 |
| ANL_KB_Statistical_Tests_v1.txt | Medium | 2 |
| ANL_KB_Scenario_Modeling_v1.txt | Medium | 2 |
| AUD_KB_Segmentation_Methods_v1.txt | High | 3 |
| AUD_KB_LTV_Modeling_v1.txt | High | 3 |
| AUD_KB_Targeting_Strategy_v1.txt | High | 3 |
| CHA_KB_Channel_Registry_v1.txt | High | 3 |
| CHA_KB_Allocation_Logic_v1.txt | High | 3 |
| CHA_KB_Benchmark_Reference_v1.txt | Medium | 3 |
| SPO_KB_Fee_Analysis_v1.txt | Medium | 5 |
| DOC_KB_Template_Library_v1.txt | Medium | 5 |
| PRF_KB_Optimization_Triggers_v1.txt | Medium | 5 |

### To Create (VS Code)
| Component | Type | Phase |
|-----------|------|-------|
| agent-core package | TypeScript | 1 |
| eap_agent table | Dataverse | 1 |
| RouteToSpecialist flow | Power Automate | 2 |
| GetSessionState flow | Power Automate | 2 |
| forecast-engine function | Azure Function | 2 |
| ORC Copilot deployment | Copilot Studio | 2 |
| ANL Copilot deployment | Copilot Studio | 2 |
| AUD Copilot deployment | Copilot Studio | 3 |
| CHA Copilot deployment | Copilot Studio | 3 |
| LookupBenchmarks flow | Power Automate | 3 |
| CalculateAllocation flow | Power Automate | 3 |
| Multi-agent eval harness | Braintrust | 4 |
| document-generator function | Azure Function | 5 |
| SPO/DOC/PRF deployments | Copilot Studio | 5 |

---

## SUCCESS CRITERIA

| Metric | Target | Measurement |
|--------|--------|-------------|
| Routing Accuracy | 95%+ | ORC routes to correct specialist |
| Specialist Quality | 95%+ | Per-agent Braintrust scores |
| Response Latency | <5 seconds | End-to-end timing |
| Session Continuity | 100% | State preserved across turns |
| Fallback Success | 100% | Graceful degradation when specialist unavailable |

---

## RISKS AND MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Routing confusion | Medium | High | Comprehensive intent classification in ORC |
| Latency increase | Medium | Medium | Parallel specialist calls where possible |
| Session state loss | Low | High | EAP session management with redundancy |
| Specialist unavailable | Low | Medium | Fallback behaviors in ORC |
| Integration bugs | High | Medium | Phased rollout with feature flags |

---

**Document prepared by Claude for Kessel Digital | January 2026**
