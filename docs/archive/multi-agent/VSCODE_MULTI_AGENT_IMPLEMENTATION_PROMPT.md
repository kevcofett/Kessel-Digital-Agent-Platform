# VS CODE MULTI-AGENT ARCHITECTURE IMPLEMENTATION PROMPT

**Date:** January 2026  
**Branch:** `feature/multi-agent-architecture`  
**Parallel Work:** Claude.ai is creating KB files and Copilot instructions simultaneously

---

## CONTEXT

You are implementing the technical infrastructure for a multi-agent architecture that transforms the monolithic MPA (Media Planning Agent) into 7 specialized agents. Claude.ai is working in parallel on the Copilot Studio instructions and knowledge base files. Your focus is on the technical implementation: TypeScript packages, Power Automate flows, Dataverse tables, and Azure Functions.

### Repository Location
```
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
```

### Current Branch
```
feature/multi-agent-architecture
```

### Reference Documents
Read these files to understand the architecture:
- `docs/multi-agent/MULTI_AGENT_WORKPLAN.md` - Complete implementation plan
- Project files (accessible via project knowledge):
  - `MULTI_AGENT_COMMUNICATION_CONTRACT_v1.txt` - Inter-agent contracts
  - `MPA_Multi_Agent_Architecture_Blueprint.docx` - Full architecture
  - `ORC_Copilot_Instructions_v1.txt` - Orchestrator design
  - `ORC_KB_Routing_Logic_v1.txt` - Routing patterns

---

## YOUR IMMEDIATE TASKS (PHASE 1)

### Task 1: Create Folder Structure

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Create multi-agent folder structure
mkdir -p release/v6.0/agents/orc/{instructions,kb,flows,tests}
mkdir -p release/v6.0/agents/anl/{instructions,kb,flows,tests}
mkdir -p release/v6.0/agents/aud/{instructions,kb,flows,tests}
mkdir -p release/v6.0/agents/cha/{instructions,kb,flows,tests}
mkdir -p release/v6.0/agents/spo/{instructions,kb,flows,tests}
mkdir -p release/v6.0/agents/doc/{instructions,kb,flows,tests}
mkdir -p release/v6.0/agents/prf/{instructions,kb,flows,tests}
mkdir -p release/v6.0/platform/eap
mkdir -p release/v6.0/contracts
mkdir -p release/v6.0/evaluation
```

### Task 2: Initialize agent-core Package

The `packages/agent-core` folder already exists. Initialize it properly:

```bash
cd packages/agent-core
npm init -y
```

Create the following structure:
```
packages/agent-core/
├── src/
│   ├── types/
│   │   ├── agent-codes.ts
│   │   ├── agent-request.ts
│   │   ├── agent-response.ts
│   │   ├── session-context.ts
│   │   └── index.ts
│   ├── contracts/
│   │   ├── request-schemas.ts
│   │   ├── response-schemas.ts
│   │   └── index.ts
│   ├── session/
│   │   ├── session-manager.ts
│   │   └── index.ts
│   ├── audit/
│   │   ├── audit-logger.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Task 3: Implement Type Definitions

**File: `packages/agent-core/src/types/agent-codes.ts`**
```typescript
export const AGENT_CODES = {
  ORC: 'ORC',  // Orchestrator
  ANL: 'ANL',  // Analytics & Forecasting
  AUD: 'AUD',  // Audience Intelligence
  CHA: 'CHA',  // Channel Strategy
  SPO: 'SPO',  // Supply Path Optimization
  DOC: 'DOC',  // Document Generation
  PRF: 'PRF',  // Performance Intelligence
} as const;

export type AgentCode = typeof AGENT_CODES[keyof typeof AGENT_CODES];
```

**File: `packages/agent-core/src/types/session-context.ts`**
```typescript
export type SessionType = 'Planning' | 'InFlight' | 'PostMortem' | 'Audit';

export interface PlanState {
  client_context?: ClientContext;
  objectives?: Objectives;
  budget?: BudgetInfo;
  audience?: AudienceStrategy;
  channels?: ChannelAllocations;
  partners?: PartnerSelections;
  measurement?: MeasurementFramework;
  optimization?: OptimizationRules;
  compliance?: ComplianceRequirements;
  document?: DocumentStatus;
}

export interface SessionContext {
  session_id: string;
  workflow_step: number;
  workflow_gate: number;
  session_type: SessionType;
  plan_state: PlanState;
  created_at: string;
  updated_at: string;
}

// Sub-interfaces (implement based on existing MPA schema)
export interface ClientContext {
  industry: string;
  vertical: string;
  market_position?: string;
  compliance_needs?: string[];
}

export interface Objectives {
  primary_kpi: string;
  target_value?: number;
  secondary_kpis?: string[];
}

export interface BudgetInfo {
  total_budget: number;
  currency: string;
  pacing?: 'even' | 'front_loaded' | 'back_loaded' | 'custom';
}

// Add remaining interfaces as needed
export interface AudienceStrategy {}
export interface ChannelAllocations {}
export interface PartnerSelections {}
export interface MeasurementFramework {}
export interface OptimizationRules {}
export interface ComplianceRequirements {}
export interface DocumentStatus {}
```


**File: `packages/agent-core/src/types/agent-request.ts`**
```typescript
import { AgentCode } from './agent-codes';
import { SessionContext } from './session-context';

export interface RequestOptions {
  timeout_ms?: number;
  include_sources?: boolean;
  confidence_threshold?: 'HIGH' | 'MEDIUM' | 'LOW';
}

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

// Request types by agent
export type ANLRequestType = 
  | 'CALCULATE_PROJECTION'
  | 'RUN_SCENARIO'
  | 'VALIDATE_STATISTICS'
  | 'CALCULATE_LTV';

export type AUDRequestType =
  | 'SEGMENT_AUDIENCE'
  | 'BUILD_PERSONA'
  | 'RECOMMEND_TARGETING'
  | 'CALCULATE_AUDIENCE_SIZE';

export type CHARequestType =
  | 'RECOMMEND_CHANNELS'
  | 'CALCULATE_ALLOCATION'
  | 'LOOKUP_BENCHMARKS'
  | 'EVALUATE_MIX';

export type SPORequestType =
  | 'ANALYZE_SUPPLY_PATH'
  | 'CALCULATE_NBI'
  | 'EVALUATE_PARTNERS';

export type DOCRequestType =
  | 'GENERATE_PLAN'
  | 'GENERATE_BRIEF'
  | 'GENERATE_SUMMARY'
  | 'EXPORT_DOCUMENT';

export type PRFRequestType =
  | 'ANALYZE_PERFORMANCE'
  | 'DETECT_ANOMALIES'
  | 'EXTRACT_LEARNINGS'
  | 'RECOMMEND_OPTIMIZATION';
```

**File: `packages/agent-core/src/types/agent-response.ts`**
```typescript
import { AgentCode } from './agent-codes';
import { PlanState } from './session-context';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type DataSource = 
  | 'USER_PROVIDED'
  | 'AGENT_KB'
  | 'DATAVERSE'
  | 'CALCULATION'
  | 'WEB_RESEARCH';

export interface AgentResponseMetadata {
  processing_time_ms: number;
  data_sources: DataSource[];
  assumptions?: string[];
  limitations?: string[];
}

export interface AgentResponse {
  request_id: string;
  timestamp: string;
  source_agent: AgentCode;
  status: 'success' | 'partial' | 'error';
  data: Record<string, unknown>;
  confidence: ConfidenceLevel;
  sources: DataSource[];
  recommendations?: string[];
  updated_plan_state?: Partial<PlanState>;
  metadata: AgentResponseMetadata;
}

export interface AgentErrorResponse {
  request_id: string;
  timestamp: string;
  source_agent: AgentCode;
  error: true;
  code: string;
  message: string;
  recovery_options?: string[];
  fallback_available?: boolean;
}
```

### Task 4: Create Contract Schemas

**File: `packages/agent-core/src/contracts/request-schemas.ts`**
```typescript
import { z } from 'zod';

export const AgentRequestSchema = z.object({
  request_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  source_agent: z.enum(['ORC', 'ANL', 'AUD', 'CHA', 'SPO', 'DOC', 'PRF']),
  target_agent: z.enum(['ORC', 'ANL', 'AUD', 'CHA', 'SPO', 'DOC', 'PRF']),
  request_type: z.string(),
  session_context: z.object({
    session_id: z.string(),
    workflow_step: z.number().min(1).max(10),
    workflow_gate: z.number().min(0).max(4),
    session_type: z.enum(['Planning', 'InFlight', 'PostMortem', 'Audit']),
    plan_state: z.record(z.unknown()),
  }),
  parameters: z.record(z.unknown()),
  options: z.object({
    timeout_ms: z.number().optional(),
    include_sources: z.boolean().optional(),
    confidence_threshold: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  }).optional(),
});

export const AgentResponseSchema = z.object({
  request_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  source_agent: z.enum(['ORC', 'ANL', 'AUD', 'CHA', 'SPO', 'DOC', 'PRF']),
  status: z.enum(['success', 'partial', 'error']),
  data: z.record(z.unknown()),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  sources: z.array(z.enum(['USER_PROVIDED', 'AGENT_KB', 'DATAVERSE', 'CALCULATION', 'WEB_RESEARCH'])),
  recommendations: z.array(z.string()).optional(),
  updated_plan_state: z.record(z.unknown()).optional(),
  metadata: z.object({
    processing_time_ms: z.number(),
    data_sources: z.array(z.string()),
    assumptions: z.array(z.string()).optional(),
    limitations: z.array(z.string()).optional(),
  }),
});
```

### Task 5: Create Dataverse Table Schema

**File: `release/v6.0/platform/eap/dataverse/eap_agent.json`**
```json
{
  "table_name": "eap_agent",
  "display_name": "Agent",
  "plural_name": "Agents",
  "description": "Registry of available agents in the multi-agent system",
  "primary_column": "eap_agent_code",
  "columns": [
    {
      "name": "eap_agent_code",
      "display_name": "Agent Code",
      "type": "text",
      "max_length": 10,
      "required": true
    },
    {
      "name": "eap_agent_name",
      "display_name": "Agent Name",
      "type": "text",
      "max_length": 100,
      "required": true
    },
    {
      "name": "eap_agent_description",
      "display_name": "Description",
      "type": "multiline_text",
      "max_length": 2000
    },
    {
      "name": "eap_agent_copilot_id",
      "display_name": "Copilot ID",
      "type": "text",
      "max_length": 100
    },
    {
      "name": "eap_agent_endpoint",
      "display_name": "Endpoint URL",
      "type": "text",
      "max_length": 500
    },
    {
      "name": "eap_agent_status",
      "display_name": "Status",
      "type": "choice",
      "choices": ["Active", "Inactive", "Maintenance"],
      "default": "Inactive"
    },
    {
      "name": "eap_agent_capabilities",
      "display_name": "Capabilities",
      "type": "multiline_text",
      "max_length": 10000,
      "description": "JSON array of capability strings"
    },
    {
      "name": "eap_agent_request_types",
      "display_name": "Request Types",
      "type": "multiline_text",
      "max_length": 5000,
      "description": "JSON array of supported request types"
    }
  ]
}
```


### Task 6: Create Feature Flag Seed Data

**File: `release/v6.0/platform/eap/seed/feature_flags_multi_agent.csv`**
```csv
flag_key,flag_value,flag_description,flag_category
multi_agent_enabled,false,Enable multi-agent routing system,architecture
orc_agent_enabled,false,Enable Orchestrator Agent,agent
anl_agent_enabled,false,Enable Analytics Agent,agent
aud_agent_enabled,false,Enable Audience Agent,agent
cha_agent_enabled,false,Enable Channel Agent,agent
spo_agent_enabled,false,Enable Supply Path Agent,agent
doc_agent_enabled,false,Enable Document Agent,agent
prf_agent_enabled,false,Enable Performance Agent,agent
multi_agent_logging_verbose,false,Enable verbose routing logs,debugging
multi_agent_fallback_to_mpa,true,Fall back to MPA v5.5 on error,reliability
```

---

## PHASE 2 TASKS (After Phase 1 Complete)

### Task 7: Create RouteToSpecialist Power Automate Flow

**Flow Specification:**

```yaml
Name: RouteToSpecialist
Trigger: HTTP POST
Input Schema:
  user_message: string
  session_id: string
  current_step: number
  
Steps:
  1. Parse Input:
     - Extract user_message, session_id, current_step
     
  2. Get Session State:
     - Query eap_session by session_id
     - Parse session_data JSON
     
  3. Check Feature Flag:
     - Query eap_feature_flag for multi_agent_enabled
     - If false, route to MPA v5.5 (fallback)
     
  4. Call ORC for Intent Classification:
     - POST to ORC Copilot endpoint
     - Body: { message: user_message, session_context: session_data }
     - Parse response for routing_decision
     
  5. Route to Specialist (if needed):
     - If routing_decision.target_agent != 'ORC':
       a. Query eap_agent for target agent endpoint
       b. Build AgentRequest payload
       c. POST to specialist endpoint
       d. Parse specialist response
       
  6. Synthesize Response:
     - If specialist was called, send specialist response back to ORC
     - ORC synthesizes final user response
     
  7. Update Session:
     - Update eap_session with new plan_state
     - Log routing decision to eap_audit_log
     
  8. Return Response:
     - Return final response to Copilot Studio

Output Schema:
  response_text: string
  confidence: string
  sources: array
  next_step_suggestion: string
```

### Task 8: Create Evaluation Harness

**File: `release/v6.0/evaluation/multi-agent-eval.ts`**
```typescript
import { Eval, Scorer } from 'braintrust';
import { AgentCode } from '@kessel-digital/agent-core';

interface MultiAgentTestCase {
  input: {
    message: string;
    session_context: {
      workflow_step: number;
      session_type: string;
    };
  };
  expected: {
    target_agent: AgentCode;
    response_contains?: string[];
    confidence_minimum?: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

// Scorer: Did ORC route to the correct specialist?
const routingAccuracyScorer: Scorer<MultiAgentTestCase, string> = {
  name: 'routing-accuracy',
  scorer: async ({ input, expected, output }) => {
    const routingDecision = extractRoutingDecision(output);
    const correct = routingDecision.target_agent === expected.target_agent;
    return {
      name: 'routing-accuracy',
      score: correct ? 1 : 0,
      metadata: {
        expected_agent: expected.target_agent,
        actual_agent: routingDecision.target_agent,
      },
    };
  },
};

// Scorer: Did the specialist provide quality response?
const specialistQualityScorer: Scorer<MultiAgentTestCase, string> = {
  name: 'specialist-quality',
  scorer: async ({ input, expected, output }) => {
    // Check for expected content
    const containsExpected = expected.response_contains?.every(
      term => output.toLowerCase().includes(term.toLowerCase())
    ) ?? true;
    
    // Check confidence level
    const confidence = extractConfidence(output);
    const meetsConfidence = confidenceMeetsThreshold(
      confidence, 
      expected.confidence_minimum ?? 'LOW'
    );
    
    return {
      name: 'specialist-quality',
      score: containsExpected && meetsConfidence ? 1 : 0,
      metadata: {
        contains_expected: containsExpected,
        meets_confidence: meetsConfidence,
      },
    };
  },
};

export const multiAgentEval = Eval('multi-agent-mpa-v6', {
  data: () => loadMultiAgentDataset(),
  task: async (input) => {
    const response = await callRouteToSpecialist(
      input.message,
      input.session_context
    );
    return response.response_text;
  },
  scores: [
    routingAccuracyScorer,
    specialistQualityScorer,
  ],
});
```

---

## COORDINATION WITH CLAUDE.AI

### What Claude.ai is Building (Do Not Duplicate)
- All `*_Copilot_Instructions_v1.txt` files
- All `*_KB_*.txt` knowledge base files
- Test scenario designs (you implement the harness)
- Architecture documentation

### What You Are Building (Your Responsibility)
- TypeScript packages and types
- Power Automate flow definitions
- Dataverse table schemas and seed data
- Azure Function code
- Braintrust scorer implementations
- Deployment scripts
- Git operations

### Handoff Points
1. **Claude.ai → VS Code:** Copilot instructions ready → Deploy to Copilot Studio
2. **Claude.ai → VS Code:** KB files ready → Upload to SharePoint
3. **Claude.ai → VS Code:** Test scenarios designed → Implement in eval harness
4. **VS Code → Claude.ai:** Flow specs ready → Review for contract compliance

---

## GIT WORKFLOW

### Commit Convention
```
feat(orc): implement RouteToSpecialist flow
feat(agent-core): add type definitions for agent contracts
fix(anl): correct projection calculation
test(eval): add routing accuracy test cases
docs(multi-agent): update architecture diagram
```

### Branch Management
```bash
# You're on: feature/multi-agent-architecture
# Keep this branch for all multi-agent work

# To sync with main (if needed)
git fetch origin
git rebase origin/main

# To push your work
git add .
git commit -m "feat(agent-core): implement type definitions"
git push origin feature/multi-agent-architecture
```

---

## SUCCESS CRITERIA FOR YOUR WORK

| Task | Definition of Done |
|------|-------------------|
| Folder structure | All directories exist, README in each |
| agent-core package | Compiles, exports all types, tests pass |
| Dataverse schemas | JSON files valid, ready for import |
| Feature flags | CSV ready for import |
| RouteToSpecialist flow | Deployed, handles happy path |
| Evaluation harness | Runs against test dataset |

---

## QUESTIONS? ASK CLAUDE.AI

If you need clarification on:
- Contract specifications
- Routing logic details
- KB file content
- Architecture decisions

Ask Kev to relay to Claude.ai, or check the reference documents listed above.

---

**Prepared for VS Code Claude by Claude.ai | January 2026**
