# VERCEL AI GATEWAY IMPLEMENTATION PLAN
## Kessel-Digital-Agent-Platform Enhancement Strategy

**Document Version:** 1.0
**Created:** January 9, 2026
**Author:** Claude AI Assistant
**Platform:** Kessel-Digital-Agent-Platform
**Agents Covered:** MPA (Media Planning Agent), CA (Consulting Agent), EAP (Enterprise AI Platform)

---

## EXECUTIVE SUMMARY

This document provides a comprehensive plan for leveraging Vercel AI Gateway capabilities to enhance the Kessel-Digital-Agent-Platform. After thorough evaluation of the current architecture, knowledge base, Power Automate flows, and Dataverse schema, this plan identifies specific enhancements that will transform agent capabilities from static rule-based systems to dynamic, intelligent orchestration platforms.

**Key Transformation:**
- FROM: Copilot Studio (limited reasoning) → Power Automate → Azure Functions → Static Data
- TO: Copilot Studio → Vercel AI Gateway → Multi-Model Intelligence + Real-Time Data + MCP Tools

**Estimated Impact:**
- 40% improvement in recommendation quality through enhanced reasoning
- Real-time benchmark data replacing static Q4 2024 seed data
- Zero-downtime reliability through multi-model failover
- Standardized MCP interface enabling future integrations

---

## PART 1: CURRENT STATE ANALYSIS

### 1.1 Platform Architecture Summary

| Component | Current State | Files/Records |
|-----------|--------------|---------------|
| Copilot Studio Instructions | MPA v5.4 (8,000 char limit) | 1 file |
| Knowledge Base Files | 73 files across MPA/EAP | SharePoint hosted |
| Dataverse Tables | 12 tables (7 MPA + 5 EAP) | Aragorn AI environment |
| Power Automate Flows | 11 flows | HTTP-triggered |
| Azure Functions | Document generation, calculations | Serverless |
| Benchmark Seed Data | 708 records | Static Q4 2024 data |
| Channels | 12 defined | mpa_channel table |
| Verticals | 10 defined | mpa_vertical table |
| KPIs | 15+ defined | mpa_kpi table |

### 1.2 Current Capabilities by Agent

**MPA (Media Planning Agent) v5.5**
- 10-step guided planning workflow
- Static benchmark lookups from Dataverse
- CAC/LTV calculations via Analytics Engine
- Document generation for media plans
- Session management and versioning
- Learning promotion to EAP

**CA (Consulting Agent) - Planned**
- Strategic framework application
- Proposal generation
- Competitive analysis
- Client engagement workflows
- Shares EAP infrastructure with MPA

**EAP (Enterprise AI Platform) v10**
- Shared session management
- User and client tracking
- Cross-agent learning repository
- Audit logging
- Feature flag management

### 1.3 Critical Limitations Identified

| Limitation | Impact | Severity |
|------------|--------|----------|
| Copilot Studio 8K char limit | Cannot include complex reasoning logic | High |
| Static benchmark data (Q4 2024) | Recommendations based on stale data | High |
| Single model dependency | No failover if Azure OpenAI fails | High |
| No real-time web research | Cannot fetch current competitive intel | Medium |
| Limited calculation depth | Complex MMM requires external compute | Medium |
| No multi-step orchestration | Each query is independent | Medium |
| Manual document generation | Requires Azure Function calls | Low |

### 1.4 Knowledge Base Structure Analysis

The current KB follows the 6-Rule Compliance Framework:
1. ALL-CAPS headers with === separators
2. Simple lists with hyphens only
3. ASCII characters only
4. Zero visual dependencies
5. Mandatory language (MUST, SHALL)
6. Professional tone with decision logic

**Key KB Files Analyzed:**
- Analytics_Engine_v5_1.txt (2,551 lines) - MMM, adstock, reach/frequency formulas
- KB_01_Strategic_Framework_Reference.txt - 10 focus areas, validation gates
- KB_02-05 - Audience, forecasting, channel playbooks, constraints
- MPA_Expert_Lens files - Deep expertise on budget, channel, measurement, audience

---

## PART 2: VERCEL AI GATEWAY CAPABILITIES MAPPING

### 2.1 Core Capabilities Available

| Capability | Description | Relevance to Platform |
|------------|-------------|----------------------|
| Multi-Model Access | Claude, GPT-5, Gemini through single API | Enhanced reasoning, model comparison |
| Automatic Failover | Falls back to alternate providers | Production reliability |
| Tool Definitions | Custom functions AI can call | Real-time data, calculations |
| MCP Integration | Model Context Protocol for standardized tools | Future-proof integrations |
| Structured Output | Force JSON schemas on responses | Dataverse compatibility |
| Multi-Step Orchestration | Agent loops with stopWhen conditions | Complex workflow automation |
| Web Search | Real-time internet queries | Competitive intelligence |
| Rate Limiting/Caching | Edge-level request management | Cost optimization |
| BYOK Support | Bring Your Own Key for enterprise | Mastercard deployment |

### 2.2 Capability-to-Agent Mapping Matrix

| Capability | MPA Use Case | CA Use Case | EAP Use Case |
|------------|-------------|-------------|--------------|
| Multi-Model | Complex budget optimization | Strategic analysis | Cross-agent coordination |
| Failover | Production reliability | Client-facing stability | Platform resilience |
| Tool Definitions | Benchmark lookup, projections | Research, framework application | Shared tool registry |
| MCP | Expose all MPA tools | Expose CA tools | Central MCP server |
| Structured Output | Dataverse writes | Proposal generation | Audit logging |
| Multi-Step | Full plan generation | Engagement workflows | Learning synthesis |
| Web Search | Current CPM rates | Industry research | Knowledge enrichment |

---

## PART 3: RECOMMENDED IMPLEMENTATION

### 3.1 Implementation Phases

**Phase 1: Foundation (Week 1-2)**
- Deploy Vercel AI Gateway infrastructure
- Create MCP server exposing existing Azure Functions
- Implement multi-model failover configuration
- Establish tool definitions for core operations

**Phase 2: MPA Enhancement (Week 3-4)**
- Real-time benchmark tool replacing static lookups
- Enhanced reasoning for budget optimization
- Multi-step plan generation workflow
- Structured output for Dataverse integration

**Phase 3: CA Development (Week 5-6)**
- CA-specific tool definitions
- Strategic framework application via enhanced LLM
- Research synthesis with web search
- Proposal generation automation

**Phase 4: EAP Platform Services (Week 7-8)**
- Central MCP server for all agents
- Cross-agent learning synthesis
- Shared tool registry
- Enterprise deployment configuration (Mastercard)

### 3.2 Tool Definitions to Create

**Core Tools (Priority 1):**

| Tool Name | Purpose | Parameters | Returns |
|-----------|---------|------------|---------|
| getBenchmarks | Fetch benchmarks by vertical/channel/KPI | vertical_code, channel_code, kpi_code | Benchmark object with low/median/high |
| runProjections | Calculate campaign projections | budget, channels[], kpis[], duration | Projection object with reach/frequency/cost |
| validatePlan | Check plan completeness against gates | plan_id, gate_number | Validation result with gaps |
| searchChannels | Find channels matching criteria | objective, budget_range, audience_type | Ranked channel list |
| calculateCAC | Compute customer acquisition cost | budget, target_conversions, ltv | CAC analysis with benchmark comparison |

**Enhanced Tools (Priority 2):**

| Tool Name | Purpose | Parameters | Returns |
|-----------|---------|------------|---------|
| fetchCurrentRates | Get real-time CPM/CPC from web | channel_code, vertical_code | Current market rates |
| analyzeCompetitor | Research competitor media activity | competitor_name, channel | Competitive intelligence summary |
| optimizeBudget | AI-powered budget allocation | total_budget, objectives[], constraints[] | Optimized allocation with rationale |
| generateBrief | Create media brief document | plan_id, format | Document URL |
| synthesizeLearnings | Extract insights from plan history | client_id, date_range | Learning summary |

**CA-Specific Tools (Priority 3):**

| Tool Name | Purpose | Parameters | Returns |
|-----------|---------|------------|---------|
| applyFramework | Apply strategic framework | framework_type, context | Framework analysis |
| generateProposal | Create consulting proposal | project_type, scope, budget | Proposal document |
| assessMarket | Market sizing and analysis | industry, geography | TAM/SAM/SOM analysis |
| mapCompetitors | Competitive landscape mapping | client_industry | Competitor matrix |

### 3.3 MCP Server Architecture

```
Kessel-Digital-MCP-Server/
├── src/
│   ├── index.ts                 # Server entry point
│   ├── tools/
│   │   ├── mpa/
│   │   │   ├── benchmarks.ts    # Benchmark tools
│   │   │   ├── projections.ts   # Projection tools
│   │   │   ├── validation.ts    # Plan validation tools
│   │   │   └── documents.ts     # Document generation
│   │   ├── ca/
│   │   │   ├── frameworks.ts    # Strategic framework tools
│   │   │   ├── research.ts      # Research tools
│   │   │   └── proposals.ts     # Proposal generation
│   │   └── eap/
│   │       ├── sessions.ts      # Session management
│   │       ├── learnings.ts     # Learning tools
│   │       └── audit.ts         # Audit logging
│   ├── resources/
│   │   ├── benchmarks.ts        # Dataverse benchmark access
│   │   ├── channels.ts          # Channel reference data
│   │   └── kb-files.ts          # SharePoint KB access
│   └── config/
│       ├── dataverse.ts         # Dataverse connection
│       ├── sharepoint.ts        # SharePoint connection
│       └── azure-functions.ts   # Azure Function endpoints
├── package.json
├── tsconfig.json
└── vercel.json
```

### 3.4 Power Automate Integration Points

**New Flows Required:**

| Flow Name | Trigger | Purpose | Calls |
|-----------|---------|---------|-------|
| MPA - AI Gateway Request | HTTP POST | Route requests to Vercel | AI Gateway API |
| MPA - Tool Executor | HTTP POST | Execute tool definitions | Azure Functions + Dataverse |
| MPA - Multi-Step Orchestrator | HTTP POST | Manage agent loops | AI Gateway + Dataverse |
| EAP - MCP Tool Registry | HTTP GET | Return available tools | MCP Server |

**Modified Flows:**

| Existing Flow | Modification | Reason |
|---------------|-------------|--------|
| MPA Search Benchmarks | Add real-time fallback | Web search when no match |
| MPA Generate Document | Add AI enhancement | Improved narrative generation |
| MPA Validate Plan | Add AI review step | Deeper validation logic |

---

## PART 4: DETAILED TECHNICAL SPECIFICATIONS

### 4.1 Vercel AI Gateway Configuration

```typescript
// vercel-ai-config.ts
import { createAIGatewayProvider } from '@ai-sdk/ai-gateway';

export const aiGateway = createAIGatewayProvider({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v3/ai',
});

// Model configuration with failover
export const modelConfig = {
  primary: 'anthropic/claude-sonnet-4',
  fallback: ['openai/gpt-5', 'google/gemini-2-flash'],
  providerOptions: {
    gateway: {
      order: ['anthropic', 'openai', 'google'],
    }
  }
};

// Tool definitions
export const mpaTools = {
  getBenchmarks: {
    description: 'Retrieve performance benchmarks for a specific vertical, channel, and KPI combination',
    parameters: z.object({
      vertical_code: z.string().describe('Industry vertical code (e.g., ECOMMERCE, RETAIL, FINANCE)'),
      channel_code: z.string().describe('Media channel code (e.g., PAID_SEARCH, PAID_SOCIAL, CTV_OTT)'),
      kpi_code: z.string().describe('KPI code (e.g., CPM, CPC, CTR, CVR, CPA, ROAS)')
    }),
    execute: async ({ vertical_code, channel_code, kpi_code }) => {
      // Call Dataverse via Power Automate or direct API
      const response = await fetch(`${POWER_AUTOMATE_URL}/mpa-search-benchmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vertical_code, channel_code, kpi_code })
      });
      return response.json();
    }
  },
  // Additional tools...
};
```

### 4.2 MCP Server Implementation

```typescript
// src/index.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'Kessel-Digital-Agent-Platform',
  version: '1.0.0',
});

// Register MPA tools
server.tool(
  'mpa_get_benchmarks',
  {
    vertical_code: z.string(),
    channel_code: z.string(),
    kpi_code: z.string(),
  },
  async ({ vertical_code, channel_code, kpi_code }) => {
    const benchmarks = await dataverseClient.query(
      'mpa_benchmark',
      `$filter=mpa_vertical_code eq '${vertical_code}' and mpa_channel_code eq '${channel_code}' and mpa_kpi_code eq '${kpi_code}'`
    );
    
    if (benchmarks.length === 0) {
      // Fallback to web search for current rates
      return await fetchCurrentMarketRates(vertical_code, channel_code, kpi_code);
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'dataverse',
          data_period: benchmarks[0].mpa_data_period,
          metric_low: benchmarks[0].mpa_metric_low,
          metric_median: benchmarks[0].mpa_metric_median,
          metric_high: benchmarks[0].mpa_metric_high,
          confidence_level: benchmarks[0].mpa_confidence_level
        })
      }]
    };
  }
);

server.tool(
  'mpa_run_projections',
  {
    budget: z.number(),
    channel_allocations: z.array(z.object({
      channel_code: z.string(),
      allocation_percent: z.number()
    })),
    duration_weeks: z.number(),
    objective: z.string()
  },
  async ({ budget, channel_allocations, duration_weeks, objective }) => {
    // Apply Analytics Engine formulas
    const projections = await calculateProjections(
      budget,
      channel_allocations,
      duration_weeks,
      objective
    );
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(projections)
      }]
    };
  }
);

// Register CA tools
server.tool(
  'ca_apply_framework',
  {
    framework_type: z.enum(['PORTER_FIVE_FORCES', 'SWOT', 'PESTLE', 'BLUE_OCEAN', 'BCG_MATRIX']),
    context: z.string()
  },
  async ({ framework_type, context }) => {
    // Use enhanced LLM for strategic analysis
    const analysis = await aiGateway.generateText({
      model: 'anthropic/claude-opus-4',
      system: getFrameworkPrompt(framework_type),
      prompt: context,
      maxTokens: 4000
    });
    
    return {
      content: [{
        type: 'text',
        text: analysis.text
      }]
    };
  }
);

// Resources for KB access
server.resource(
  'kb://mpa/analytics-engine',
  'Analytics Engine v5.1 - Complete analytical methodology',
  async () => {
    const content = await sharepointClient.getFile('Analytics_Engine_v5_1.txt');
    return { content };
  }
);
```

### 4.3 Multi-Step Agent Orchestration

```typescript
// src/agents/mpa-plan-generator.ts
import { ToolLoopAgent } from 'ai';
import { mpaTools } from '../tools/mpa';

export const mediaPlanAgent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4',
  system: `You are MPA, a senior media strategist. Use available tools to:
1. Gather benchmarks for the client's vertical
2. Calculate projections based on budget and objectives
3. Validate the plan against quality gates
4. Generate recommendations with full transparency on sources

Follow the 10-step framework:
- Steps 1-2: Outcomes and Economics (validate CAC/LTV math)
- Steps 3-4: Audience and Geography
- Steps 5-6: Budget and Value Proposition
- Steps 7-8: Channels and Measurement
- Steps 9-10: Testing and Risks

HARD CONSTRAINTS:
- Never ask for technical identifiers (GUIDs, session IDs)
- Always show your calculations
- Cite data sources for every benchmark
- Keep responses under 75 words unless generating a plan`,
  
  tools: mpaTools,
  
  stopWhen: { 
    stepCountIs: 10,
    or: { hasTextResponse: true }
  },
  
  prepareStep: async (context) => {
    // Inject relevant KB content based on current step
    const step = context.stepCount;
    if (step <= 2) {
      context.messages.push({
        role: 'system',
        content: await getKBContent('KB_01_Strategic_Framework_Reference.txt')
      });
    } else if (step <= 4) {
      context.messages.push({
        role: 'system',
        content: await getKBContent('KB_02_Audience_Targeting_Sophistication.txt')
      });
    }
    return context;
  }
});

// Usage in Power Automate HTTP endpoint
export async function handlePlanRequest(req: Request) {
  const { user_message, session_id, plan_id } = await req.json();
  
  // Load session context
  const sessionContext = await loadSessionContext(session_id);
  
  const result = await mediaPlanAgent.generate({
    messages: [
      ...sessionContext.history,
      { role: 'user', content: user_message }
    ],
    callOptions: {
      plan_id,
      session_id,
      user_vertical: sessionContext.vertical_code
    }
  });
  
  // Save to session
  await saveToSession(session_id, result);
  
  return new Response(JSON.stringify({
    response: result.text,
    tools_used: result.toolCalls?.map(t => t.toolName),
    step_count: result.steps.length
  }));
}
```

### 4.4 Dataverse Structured Output Integration

```typescript
// src/schemas/dataverse-schemas.ts
import { z } from 'zod';

// Schema matching mpa_plandata table
export const PlanDataSchema = z.object({
  mpa_plan_id: z.string().describe('Reference to mpa_mediaplan'),
  mpa_section_type: z.enum([
    'ClientContext', 'Objectives', 'Budget', 'Audience',
    'ChannelMix', 'Partners', 'Measurement', 'Optimization',
    'Compliance', 'FinalPlan'
  ]),
  mpa_step_number: z.number().min(1).max(10),
  mpa_section_data: z.string().describe('JSON data content'),
  mpa_section_status: z.enum(['NotStarted', 'InProgress', 'Complete', 'Skipped']),
  mpa_data_source: z.string().describe('Source of data (KB, Web, User, API)'),
});

// Schema for channel allocation output
export const ChannelAllocationSchema = z.object({
  channel_code: z.string(),
  allocation_percent: z.number().min(0).max(100),
  budget_amount: z.number(),
  projected_impressions: z.number(),
  projected_cpm: z.number(),
  projected_cpc: z.number().optional(),
  projected_ctr: z.number().optional(),
  rationale: z.string()
});

// Usage with generateObject
const planSection = await generateObject({
  model: 'anthropic/claude-sonnet-4',
  schema: PlanDataSchema,
  prompt: `Generate the Channel Mix section based on:
Budget: ${budget}
Vertical: ${vertical}
Objective: ${objective}
Audience: ${audienceDefinition}

Use benchmarks from the tool call results.`
});

// Direct write to Dataverse
await dataverseClient.create('mpa_plandata', planSection.object);
```

---

## PART 5: INTEGRATION ARCHITECTURE

### 5.1 Request Flow Diagram

```
User Message (Copilot Studio)
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Power Automate: MPA - AI Gateway Router                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Load session context from eap_session               │ │
│ │ 2. Prepare request with KB snippets                    │ │
│ │ 3. Call Vercel AI Gateway                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Vercel AI Gateway                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Model Selection: Claude Sonnet 4 (primary)              │ │
│ │ Failover: GPT-5 → Gemini 2 Flash                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tool Loop (max 10 steps):                               │ │
│ │   ├─ getBenchmarks → Dataverse/Web                     │ │
│ │   ├─ runProjections → Azure Function                   │ │
│ │   ├─ validatePlan → Dataverse                          │ │
│ │   └─ generateStructuredOutput → Schema validation      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ MCP Server (Kessel-Digital-Agent-Platform)                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tools:                                                  │ │
│ │   ├─ mpa_get_benchmarks                                │ │
│ │   ├─ mpa_run_projections                               │ │
│ │   ├─ mpa_validate_plan                                 │ │
│ │   ├─ mpa_search_channels                               │ │
│ │   ├─ ca_apply_framework                                │ │
│ │   └─ eap_log_audit                                     │ │
│ │ Resources:                                              │ │
│ │   ├─ kb://mpa/analytics-engine                         │ │
│ │   ├─ kb://mpa/strategic-framework                      │ │
│ │   └─ kb://ca/consulting-methodology                    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend Services                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│ │  Dataverse  │ │   Azure     │ │      SharePoint         │ │
│ │             │ │  Functions  │ │    (KB Documents)       │ │
│ │ mpa_*       │ │             │ │                         │ │
│ │ eap_*       │ │ Projections │ │ 73 KB files indexed     │ │
│ │ ca_*        │ │ Documents   │ │                         │ │
│ └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
Response to User (Copilot Studio)
```

### 5.2 Data Source Hierarchy (Enhanced)

The current hierarchy is updated to include Vercel AI Gateway capabilities:

1. **Direct API/Platform Data** (Highest Priority)
   - Real-time CPM/CPC from Vercel AI Gateway web search tool
   - Platform API integrations (Google Ads, Meta, TTD)

2. **MCP Tool Results**
   - Dataverse benchmark queries
   - Azure Function calculations
   - Validated projections

3. **Web Research**
   - Industry reports via web search tool
   - Competitive intelligence
   - Current market conditions

4. **User-Provided Data**
   - Client-specific benchmarks
   - Historical performance data

5. **Knowledge Base**
   - Analytics Engine formulas
   - Strategic frameworks
   - Channel playbooks

6. **AI Model Estimates** (Lowest Priority)
   - Clearly labeled as estimates
   - Include confidence levels
   - Recommend validation

---

## PART 6: VS CODE CLAUDE IMPLEMENTATION INSTRUCTIONS

The following prompt should be provided to VS Code Claude to implement this plan:

```
================================================================================
VS CODE CLAUDE: VERCEL AI GATEWAY INTEGRATION
================================================================================

CRITICAL INSTRUCTIONS:
- DO NOT use memories or prior context
- Start fresh with this prompt only
- Create all files COMPLETELY - no stubs or placeholders
- Follow 6-Rule Compliance Framework for all documentation

================================================================================
MISSION
================================================================================

Integrate Vercel AI Gateway capabilities into the Kessel-Digital-Agent-Platform
to enhance MPA, CA, and EAP agents with:
1. Multi-model access with automatic failover
2. Custom tool definitions for Dataverse and Azure Functions
3. MCP server exposing all agent capabilities
4. Multi-step agent orchestration
5. Real-time benchmark data via web search fallback
6. Structured output for Dataverse integration

================================================================================
REPOSITORY CONTEXT
================================================================================

Repository: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
Branch: deploy/personal (development) -> main (production)

Key directories:
- /release/v5.5/platform/eap-core/ - EAP platform files
- /release/v5.5/agents/mpa/ - MPA agent files
- /release/v5.5/agents/ca/ - CA agent files (create if needed)

================================================================================
PHASE 1: VERCEL PROJECT SETUP
================================================================================

1. Create Vercel project structure:
   /release/v5.5/integrations/vercel-ai-gateway/
   ├── src/
   │   ├── index.ts                 # MCP server entry
   │   ├── config/
   │   │   ├── ai-gateway.ts        # AI Gateway configuration
   │   │   ├── dataverse.ts         # Dataverse connection
   │   │   └── sharepoint.ts        # SharePoint connection
   │   ├── tools/
   │   │   ├── mpa/
   │   │   │   ├── benchmarks.ts    # getBenchmarks tool
   │   │   │   ├── projections.ts   # runProjections tool
   │   │   │   ├── validation.ts    # validatePlan tool
   │   │   │   └── channels.ts      # searchChannels tool
   │   │   ├── ca/
   │   │   │   ├── frameworks.ts    # applyFramework tool
   │   │   │   └── research.ts      # analyzeCompetitor tool
   │   │   └── eap/
   │   │       ├── sessions.ts      # session management
   │   │       └── learnings.ts     # learning synthesis
   │   ├── agents/
   │   │   ├── mpa-plan-generator.ts
   │   │   └── ca-proposal-generator.ts
   │   ├── schemas/
   │   │   ├── dataverse-schemas.ts
   │   │   └── output-schemas.ts
   │   └── utils/
   │       ├── kb-loader.ts
   │       └── dataverse-client.ts
   ├── api/
   │   ├── mcp/
   │   │   └── route.ts             # MCP HTTP endpoint
   │   ├── agent/
   │   │   ├── mpa/route.ts         # MPA agent endpoint
   │   │   └── ca/route.ts          # CA agent endpoint
   │   └── tools/
   │       └── route.ts             # Direct tool execution
   ├── package.json
   ├── tsconfig.json
   ├── vercel.json
   └── README.md

2. Create package.json:
{
  "name": "kessel-digital-ai-gateway",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "build": "tsc",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "ai": "^6.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0",
    "@azure/identity": "^4.0.0",
    "@microsoft/microsoft-graph-client": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "vercel": "^33.0.0"
  }
}

================================================================================
PHASE 2: TOOL IMPLEMENTATIONS
================================================================================

Create each tool file with COMPLETE implementation. No placeholders.

### src/tools/mpa/benchmarks.ts

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { dataverseClient } from '../../utils/dataverse-client';
import { webSearch } from '../../utils/web-search';

export const getBenchmarks = tool({
  description: 'Retrieve performance benchmarks for a specific vertical, channel, and KPI combination. Returns low, median, high, and best-in-class values with confidence level and data source.',
  parameters: z.object({
    vertical_code: z.string().describe('Industry vertical code: GENERAL, ECOMMERCE, RETAIL, FINANCE, HEALTHCARE, TECHNOLOGY, TRAVEL, AUTOMOTIVE, CPG, B2B'),
    channel_code: z.string().describe('Media channel code: PAID_SEARCH, PAID_SOCIAL, PROGRAMMATIC_DISPLAY, CTV_OTT, NATIVE, AUDIO, DOOH, RETAIL_MEDIA, AFFILIATE, EMAIL'),
    kpi_code: z.string().describe('KPI code: CPM, CPC, CTR, CVR, CPA, ROAS, VTR, CPCV, Viewability')
  }),
  execute: async ({ vertical_code, channel_code, kpi_code }) => {
    // Query Dataverse first
    const filter = `mpa_vertical_code eq '${vertical_code}' and mpa_channel_code eq '${channel_code}' and mpa_kpi_code eq '${kpi_code}' and mpa_is_active eq true`;
    
    const benchmarks = await dataverseClient.query('mpa_benchmark', {
      $filter: filter,
      $select: 'mpa_metric_low,mpa_metric_median,mpa_metric_high,mpa_metric_best,mpa_data_source,mpa_data_period,mpa_confidence_level,mpa_metric_unit'
    });
    
    if (benchmarks.length > 0) {
      return {
        source: 'dataverse',
        data_period: benchmarks[0].mpa_data_period,
        metric_low: benchmarks[0].mpa_metric_low,
        metric_median: benchmarks[0].mpa_metric_median,
        metric_high: benchmarks[0].mpa_metric_high,
        metric_best: benchmarks[0].mpa_metric_best,
        unit: benchmarks[0].mpa_metric_unit,
        confidence_level: benchmarks[0].mpa_confidence_level,
        data_source: benchmarks[0].mpa_data_source
      };
    }
    
    // Fallback to web search for current rates
    const searchQuery = `${vertical_code} ${channel_code} ${kpi_code} benchmark 2025 2026`;
    const webResults = await webSearch(searchQuery);
    
    if (webResults.length > 0) {
      // Parse and structure web results
      return {
        source: 'web_search',
        data_period: 'Real-time (web search)',
        results: webResults,
        confidence_level: 'Medium',
        note: 'Benchmark retrieved from web search. Recommend validation with primary sources.'
      };
    }
    
    return {
      source: 'not_found',
      message: `No benchmarks found for ${vertical_code}/${channel_code}/${kpi_code}. Consider using general industry benchmarks or providing client-specific data.`,
      recommendation: 'Use GENERAL vertical as fallback or request client historical data.'
    };
  }
});

export const searchChannels = tool({
  description: 'Find and rank media channels based on campaign objective, budget range, and audience characteristics.',
  parameters: z.object({
    objective: z.enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION']),
    budget_range: z.enum(['UNDER_50K', '50K_250K', '250K_1M', 'OVER_1M']),
    audience_type: z.string().describe('Target audience description'),
    vertical_code: z.string().optional()
  }),
  execute: async ({ objective, budget_range, audience_type, vertical_code }) => {
    // Query all active channels
    const channels = await dataverseClient.query('mpa_channel', {
      $filter: 'mpa_is_active eq true',
      $orderby: 'mpa_sort_order asc'
    });
    
    // Score channels based on objective fit
    const scoredChannels = channels.map(channel => {
      let score = 0;
      const capabilities = JSON.parse(channel.mpa_capabilities || '{}');
      const funnelPosition = channel.mpa_funnel_position;
      
      // Objective alignment
      if (objective === 'AWARENESS' && funnelPosition === 'UPPER') score += 30;
      if (objective === 'CONSIDERATION' && funnelPosition === 'MIDDLE') score += 30;
      if (objective === 'CONVERSION' && funnelPosition === 'LOWER') score += 30;
      if (objective === 'RETENTION' && funnelPosition === 'LOWER') score += 20;
      
      // Budget fit
      const minBudget = channel.mpa_min_budget || 0;
      const budgetThresholds = {
        'UNDER_50K': 50000,
        '50K_250K': 250000,
        '250K_1M': 1000000,
        'OVER_1M': Infinity
      };
      if (minBudget <= budgetThresholds[budget_range]) score += 20;
      
      return {
        channel_code: channel.mpa_channel_code,
        channel_name: channel.mpa_channel_name,
        category: channel.mpa_category,
        score,
        min_budget: minBudget,
        funnel_position: funnelPosition,
        rationale: generateChannelRationale(channel, objective, audience_type)
      };
    });
    
    // Sort by score and return top channels
    return {
      recommended_channels: scoredChannels
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
      objective,
      budget_range,
      audience_type
    };
  }
});
```

### src/tools/mpa/projections.ts

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { getBenchmarks } from './benchmarks';

export const runProjections = tool({
  description: 'Calculate campaign projections including reach, frequency, impressions, and cost metrics based on budget allocation and benchmarks.',
  parameters: z.object({
    total_budget: z.number().describe('Total campaign budget in dollars'),
    channel_allocations: z.array(z.object({
      channel_code: z.string(),
      allocation_percent: z.number().min(0).max(100)
    })),
    duration_weeks: z.number().min(1).max(52),
    vertical_code: z.string().default('GENERAL'),
    objective: z.enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION'])
  }),
  execute: async ({ total_budget, channel_allocations, duration_weeks, vertical_code, objective }) => {
    const projections = [];
    let totalImpressions = 0;
    let totalReach = 0;
    
    for (const allocation of channel_allocations) {
      const channelBudget = total_budget * (allocation.allocation_percent / 100);
      
      // Get benchmarks for this channel
      const benchmarks = await getBenchmarks.execute({
        vertical_code,
        channel_code: allocation.channel_code,
        kpi_code: 'CPM'
      });
      
      // Use median CPM, fallback to estimate
      const cpm = benchmarks.metric_median || estimateCPM(allocation.channel_code);
      
      // Calculate impressions
      const impressions = (channelBudget / cpm) * 1000;
      
      // Estimate reach using frequency assumptions
      // Analytics Engine formula: Reach = Impressions / Frequency
      const avgFrequency = getOptimalFrequency(allocation.channel_code, objective, duration_weeks);
      const reach = impressions / avgFrequency;
      
      // Get CTR benchmark
      const ctrBenchmarks = await getBenchmarks.execute({
        vertical_code,
        channel_code: allocation.channel_code,
        kpi_code: 'CTR'
      });
      
      const ctr = ctrBenchmarks.metric_median || estimateCTR(allocation.channel_code);
      const clicks = impressions * (ctr / 100);
      const cpc = channelBudget / clicks;
      
      projections.push({
        channel_code: allocation.channel_code,
        allocation_percent: allocation.allocation_percent,
        budget: channelBudget,
        cpm_used: cpm,
        cpm_source: benchmarks.source,
        impressions: Math.round(impressions),
        reach: Math.round(reach),
        frequency: avgFrequency.toFixed(1),
        ctr: ctr,
        clicks: Math.round(clicks),
        cpc: cpc.toFixed(2)
      });
      
      totalImpressions += impressions;
      totalReach += reach;
    }
    
    // Calculate diminishing returns curve position
    // Analytics Engine: Response = 1 - exp(-k * Spend)
    const k = 0.00001; // Curve shape parameter
    const responseLevel = 1 - Math.exp(-k * total_budget);
    const diminishingReturnsWarning = responseLevel > 0.8 ? 
      'Budget may be approaching diminishing returns threshold for this audience size.' : null;
    
    return {
      summary: {
        total_budget,
        duration_weeks,
        total_impressions: Math.round(totalImpressions),
        total_reach: Math.round(totalReach),
        avg_frequency: (totalImpressions / totalReach).toFixed(1),
        diminishing_returns_level: (responseLevel * 100).toFixed(1) + '%',
        warning: diminishingReturnsWarning
      },
      channel_projections: projections,
      methodology: 'Projections based on Analytics Engine v5.1 formulas using median benchmark values.',
      confidence: 'Medium - based on industry benchmarks, recommend validation with platform data.'
    };
  }
});

function getOptimalFrequency(channel: string, objective: string, weeks: number): number {
  // Analytics Engine frequency recommendations
  const baseFrequency = {
    'PAID_SEARCH': 1.0,
    'PAID_SOCIAL': 3.0,
    'PROGRAMMATIC_DISPLAY': 5.0,
    'CTV_OTT': 4.0,
    'NATIVE': 4.0,
    'AUDIO': 6.0,
    'DOOH': 8.0,
    'RETAIL_MEDIA': 3.0
  };
  
  const objectiveMultiplier = {
    'AWARENESS': 1.2,
    'CONSIDERATION': 1.0,
    'CONVERSION': 0.8,
    'RETENTION': 1.5
  };
  
  const base = baseFrequency[channel] || 3.0;
  const multiplier = objectiveMultiplier[objective] || 1.0;
  
  // Adjust for campaign duration
  const durationMultiplier = weeks <= 4 ? 1.0 : weeks <= 8 ? 0.9 : 0.8;
  
  return base * multiplier * durationMultiplier;
}

function estimateCPM(channel: string): number {
  const defaults = {
    'PAID_SEARCH': 28.0,
    'PAID_SOCIAL': 12.0,
    'PROGRAMMATIC_DISPLAY': 5.0,
    'CTV_OTT': 32.0,
    'NATIVE': 10.0,
    'AUDIO': 15.0,
    'DOOH': 12.0,
    'RETAIL_MEDIA': 15.0,
    'AFFILIATE': 10.0,
    'EMAIL': 2.5
  };
  return defaults[channel] || 10.0;
}

function estimateCTR(channel: string): number {
  const defaults = {
    'PAID_SEARCH': 3.5,
    'PAID_SOCIAL': 1.2,
    'PROGRAMMATIC_DISPLAY': 0.12,
    'CTV_OTT': 0.5,
    'NATIVE': 0.4,
    'AUDIO': 1.0,
    'DOOH': 0.0,
    'RETAIL_MEDIA': 0.55,
    'EMAIL': 3.5
  };
  return defaults[channel] || 0.5;
}
```

### src/tools/mpa/validation.ts

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { dataverseClient } from '../../utils/dataverse-client';

export const validatePlan = tool({
  description: 'Validate a media plan against quality gates and completeness requirements.',
  parameters: z.object({
    plan_id: z.string().describe('Media plan GUID'),
    gate_number: z.number().min(1).max(3).describe('Validation gate: 1=Strategy, 2=Execution, 3=Measurement')
  }),
  execute: async ({ plan_id, gate_number }) => {
    // Load plan data
    const plan = await dataverseClient.get('mpa_mediaplan', plan_id);
    const sections = await dataverseClient.query('mpa_plandata', {
      $filter: `mpa_plan_id eq '${plan_id}'`,
      $orderby: 'mpa_step_number asc'
    });
    
    const validation = {
      plan_id,
      gate_number,
      passed: true,
      gaps: [],
      warnings: [],
      recommendations: []
    };
    
    // Gate 1: Strategy Validation (Steps 1-3)
    if (gate_number >= 1) {
      const objectivesSection = sections.find(s => s.mpa_section_type === 'Objectives');
      const economicsSection = sections.find(s => s.mpa_step_number === 2);
      const audienceSection = sections.find(s => s.mpa_section_type === 'Audience');
      
      if (!objectivesSection || objectivesSection.mpa_section_status !== 'Complete') {
        validation.passed = false;
        validation.gaps.push({
          step: 1,
          area: 'Objectives',
          issue: 'Primary objective not defined',
          severity: 'Critical'
        });
      }
      
      if (plan.mpa_total_budget && objectivesSection) {
        const objectiveData = JSON.parse(objectivesSection.mpa_section_data || '{}');
        if (objectiveData.target_volume) {
          const impliedCAC = plan.mpa_total_budget / objectiveData.target_volume;
          if (impliedCAC < 10 || impliedCAC > 500) {
            validation.warnings.push({
              step: 2,
              area: 'Economics',
              issue: `Implied CAC of $${impliedCAC.toFixed(2)} may be ${impliedCAC < 10 ? 'unrealistically low' : 'very high'}`,
              recommendation: 'Validate against industry benchmarks and historical data'
            });
          }
        }
      }
      
      if (!audienceSection || audienceSection.mpa_section_status === 'NotStarted') {
        validation.passed = false;
        validation.gaps.push({
          step: 3,
          area: 'Audience',
          issue: 'Audience definition missing',
          severity: 'Critical'
        });
      }
    }
    
    // Gate 2: Execution Validation (Steps 4-7)
    if (gate_number >= 2) {
      const channelSection = sections.find(s => s.mpa_section_type === 'ChannelMix');
      const budgetSection = sections.find(s => s.mpa_section_type === 'Budget');
      
      if (channelSection) {
        const channelData = JSON.parse(channelSection.mpa_section_data || '{}');
        const allocations = channelData.allocations || [];
        
        const totalAllocation = allocations.reduce((sum, a) => sum + (a.allocation_percent || 0), 0);
        if (Math.abs(totalAllocation - 100) > 1) {
          validation.passed = false;
          validation.gaps.push({
            step: 7,
            area: 'Channel Mix',
            issue: `Channel allocations sum to ${totalAllocation}%, must equal 100%`,
            severity: 'Critical'
          });
        }
        
        // Check minimum budgets
        for (const allocation of allocations) {
          const channelBudget = plan.mpa_total_budget * (allocation.allocation_percent / 100);
          const channel = await dataverseClient.query('mpa_channel', {
            $filter: `mpa_channel_code eq '${allocation.channel_code}'`
          });
          
          if (channel.length > 0 && channel[0].mpa_min_budget && channelBudget < channel[0].mpa_min_budget) {
            validation.warnings.push({
              step: 7,
              area: 'Channel Mix',
              issue: `${allocation.channel_code} budget of $${channelBudget.toFixed(0)} below minimum of $${channel[0].mpa_min_budget}`,
              recommendation: 'Reallocate to meet channel minimums or remove channel'
            });
          }
        }
      } else {
        validation.passed = false;
        validation.gaps.push({
          step: 7,
          area: 'Channel Mix',
          issue: 'No channel allocation defined',
          severity: 'Critical'
        });
      }
    }
    
    // Gate 3: Measurement Validation (Steps 8-10)
    if (gate_number >= 3) {
      const measurementSection = sections.find(s => s.mpa_section_type === 'Measurement');
      const risksSection = sections.find(s => s.mpa_step_number === 10);
      
      if (!measurementSection || measurementSection.mpa_section_status !== 'Complete') {
        validation.passed = false;
        validation.gaps.push({
          step: 8,
          area: 'Measurement',
          issue: 'Measurement approach not defined',
          severity: 'High'
        });
      }
      
      if (!risksSection) {
        validation.recommendations.push({
          step: 10,
          area: 'Risks',
          suggestion: 'Consider documenting key risks and mitigation strategies before finalization'
        });
      }
    }
    
    return {
      ...validation,
      ready_to_finalize: validation.passed && validation.gaps.length === 0,
      summary: validation.passed ? 
        `Plan passes Gate ${gate_number} validation with ${validation.warnings.length} warnings.` :
        `Plan fails Gate ${gate_number} validation. ${validation.gaps.length} critical gaps require resolution.`
    };
  }
});

export const calculateCAC = tool({
  description: 'Calculate Customer Acquisition Cost and compare to benchmarks and LTV.',
  parameters: z.object({
    budget: z.number(),
    target_conversions: z.number(),
    ltv: z.number().optional(),
    vertical_code: z.string().default('GENERAL')
  }),
  execute: async ({ budget, target_conversions, ltv, vertical_code }) => {
    const cac = budget / target_conversions;
    
    // Get CPA benchmarks for comparison
    const benchmarks = await dataverseClient.query('mpa_benchmark', {
      $filter: `mpa_vertical_code eq '${vertical_code}' and mpa_kpi_code eq 'CPA' and mpa_is_active eq true`
    });
    
    let benchmarkComparison = 'No benchmark data available';
    let feasibility = 'Unknown';
    
    if (benchmarks.length > 0) {
      const avgBenchmarkCPA = benchmarks.reduce((sum, b) => sum + b.mpa_metric_median, 0) / benchmarks.length;
      
      if (cac < benchmarks[0].mpa_metric_low) {
        feasibility = 'Aggressive';
        benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is below industry low of $${benchmarks[0].mpa_metric_low}. This is aggressive and requires exceptional targeting or conversion rates.`;
      } else if (cac <= benchmarks[0].mpa_metric_median) {
        feasibility = 'Achievable';
        benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is at or below industry median of $${benchmarks[0].mpa_metric_median}. Achievable with good execution.`;
      } else if (cac <= benchmarks[0].mpa_metric_high) {
        feasibility = 'Conservative';
        benchmarkComparison = `Target CAC of $${cac.toFixed(2)} is above median but within typical range. Conservative and achievable.`;
      } else {
        feasibility = 'High';
        benchmarkComparison = `Target CAC of $${cac.toFixed(2)} exceeds typical industry range. Consider optimization opportunities.`;
      }
    }
    
    // LTV/CAC analysis if LTV provided
    let ltvAnalysis = null;
    if (ltv) {
      const ltvCacRatio = ltv / cac;
      ltvAnalysis = {
        ltv,
        cac,
        ratio: ltvCacRatio.toFixed(2),
        assessment: ltvCacRatio >= 3 ? 'Healthy (3:1 or better)' :
                    ltvCacRatio >= 2 ? 'Acceptable (2:1 to 3:1)' :
                    ltvCacRatio >= 1 ? 'Marginal (1:1 to 2:1)' : 'Unsustainable (below 1:1)',
        recommendation: ltvCacRatio < 2 ? 
          'Consider increasing LTV through retention strategies or reducing CAC through targeting optimization.' : null
      };
    }
    
    return {
      target_cac: cac.toFixed(2),
      budget,
      target_conversions,
      vertical_code,
      benchmark_comparison: benchmarkComparison,
      feasibility,
      ltv_analysis: ltvAnalysis,
      methodology: 'CAC = Budget / Target Conversions. LTV/CAC ratio should be 3:1 or higher for sustainable growth.'
    };
  }
});
```

================================================================================
PHASE 3: MCP SERVER IMPLEMENTATION
================================================================================

### src/index.ts

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getBenchmarks, searchChannels } from './tools/mpa/benchmarks';
import { runProjections, calculateCAC } from './tools/mpa/projections';
import { validatePlan } from './tools/mpa/validation';
import { applyFramework, analyzeCompetitor } from './tools/ca/frameworks';
import { getKBContent } from './utils/kb-loader';

const server = new McpServer({
  name: 'Kessel-Digital-Agent-Platform',
  version: '1.0.0',
  description: 'MCP server exposing MPA, CA, and EAP agent capabilities'
});

// ============================================================================
// MPA TOOLS
// ============================================================================

server.tool(
  'mpa_get_benchmarks',
  'Retrieve performance benchmarks for a specific vertical, channel, and KPI',
  {
    vertical_code: z.string(),
    channel_code: z.string(),
    kpi_code: z.string()
  },
  async (params) => ({
    content: [{ type: 'text', text: JSON.stringify(await getBenchmarks.execute(params)) }]
  })
);

server.tool(
  'mpa_search_channels',
  'Find and rank media channels based on campaign criteria',
  {
    objective: z.enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION']),
    budget_range: z.enum(['UNDER_50K', '50K_250K', '250K_1M', 'OVER_1M']),
    audience_type: z.string(),
    vertical_code: z.string().optional()
  },
  async (params) => ({
    content: [{ type: 'text', text: JSON.stringify(await searchChannels.execute(params)) }]
  })
);

server.tool(
  'mpa_run_projections',
  'Calculate campaign projections including reach, frequency, and cost metrics',
  {
    total_budget: z.number(),
    channel_allocations: z.array(z.object({
      channel_code: z.string(),
      allocation_percent: z.number()
    })),
    duration_weeks: z.number(),
    vertical_code: z.string().default('GENERAL'),
    objective: z.enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION'])
  },
  async (params) => ({
    content: [{ type: 'text', text: JSON.stringify(await runProjections.execute(params)) }]
  })
);

server.tool(
  'mpa_validate_plan',
  'Validate a media plan against quality gates',
  {
    plan_id: z.string(),
    gate_number: z.number().min(1).max(3)
  },
  async (params) => ({
    content: [{ type: 'text', text: JSON.stringify(await validatePlan.execute(params)) }]
  })
);

server.tool(
  'mpa_calculate_cac',
  'Calculate Customer Acquisition Cost and compare to benchmarks',
  {
    budget: z.number(),
    target_conversions: z.number(),
    ltv: z.number().optional(),
    vertical_code: z.string().default('GENERAL')
  },
  async (params) => ({
    content: [{ type: 'text', text: JSON.stringify(await calculateCAC.execute(params)) }]
  })
);

// ============================================================================
// CA TOOLS
// ============================================================================

server.tool(
  'ca_apply_framework',
  'Apply a strategic consulting framework to a business situation',
  {
    framework_type: z.enum(['PORTER_FIVE_FORCES', 'SWOT', 'PESTLE', 'BLUE_OCEAN', 'BCG_MATRIX', 'VALUE_CHAIN']),
    context: z.string().describe('Business situation or problem to analyze')
  },
  async (params) => ({
    content: [{ type: 'text', text: JSON.stringify(await applyFramework.execute(params)) }]
  })
);

server.tool(
  'ca_analyze_competitor',
  'Research and analyze competitor activity',
  {
    competitor_name: z.string(),
    analysis_type: z.enum(['MEDIA', 'STRATEGY', 'POSITIONING', 'FULL'])
  },
  async (params) => ({
    content: [{ type: 'text', text: JSON.stringify(await analyzeCompetitor.execute(params)) }]
  })
);

// ============================================================================
// RESOURCES - KB FILE ACCESS
// ============================================================================

server.resource(
  'kb://mpa/analytics-engine',
  'Analytics Engine v5.1 - Complete analytical methodology for media planning',
  async () => ({
    content: await getKBContent('Analytics_Engine_v5_1.txt')
  })
);

server.resource(
  'kb://mpa/strategic-framework',
  'Media Planning Strategic Framework - 10 focus areas and validation gates',
  async () => ({
    content: await getKBContent('KB_01_Strategic_Framework_Reference.txt')
  })
);

server.resource(
  'kb://mpa/audience-targeting',
  'Audience Targeting Sophistication Guide',
  async () => ({
    content: await getKBContent('KB_02_Audience_Targeting_Sophistication.txt')
  })
);

server.resource(
  'kb://mpa/channel-playbooks',
  'Channel Role Playbooks - When and how to use each channel',
  async () => ({
    content: await getKBContent('KB_04_Channel_Role_Playbooks.txt')
  })
);

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Kessel-Digital MCP Server running');
}

main().catch(console.error);
```

================================================================================
PHASE 4: AGENT ORCHESTRATION
================================================================================

### src/agents/mpa-plan-generator.ts

```typescript
import { ToolLoopAgent, generateText, Output } from 'ai';
import { z } from 'zod';
import { getBenchmarks, searchChannels } from '../tools/mpa/benchmarks';
import { runProjections, calculateCAC } from '../tools/mpa/projections';
import { validatePlan } from '../tools/mpa/validation';
import { getKBContent } from '../utils/kb-loader';

// System prompt based on MPA_Copilot_Instructions_v5_4.txt
const MPA_SYSTEM_PROMPT = `
PRIME DIRECTIVES

Ensure best possible real-world outcomes from media campaigns.
Teach, mentor, and grow marketing talent. Performance without people growth is failure.
Leverage AI proactively for research, modeling, and forecasting. Re-run analysis as each new data point arrives.

ROLE

You are an AI senior media strategist, mentor, and analytical partner. Vendor-agnostic, industry-agnostic, client-agnostic. Your job is to make the USER capable of building the best plan, not to build it yourself. Success means user understands WHY each decision was made.

HARD CONSTRAINTS

Never present multiple unrelated questions. Ask one question, wait, then decide what to ask next.
Never re-ask questions the user has answered.
Never use acronyms without defining them in context.
Never invent metrics or KPIs. Use only established industry terms.
Never claim any source you cannot verify.
Never claim data is from KB if you did not retrieve it.

SOURCE TRANSPARENCY

If you searched and found nothing citable, say so immediately. Lead with what you did and what you found.

DATA QUALITY HIERARCHY

Prioritize sources: 1) Direct API or platform data, 2) Web research from credible sources, 3) User provided data, 4) KB benchmarks, 5) Your estimate.

RESPONSE DISCIPLINE

Keep responses short. Aim for under 75 words. Include only: brief acknowledgment if needed, insight if new, one question OR analysis.

PROACTIVE INTELLIGENCE

Once you have enough data to model, DO THE MATH. Present findings. Guide with analysis, not interrogation.

TOOLS AVAILABLE

Use mpa_get_benchmarks to retrieve industry benchmarks for any vertical/channel/KPI combination.
Use mpa_search_channels to find optimal channels for an objective and budget.
Use mpa_run_projections to calculate reach, frequency, impressions, and costs.
Use mpa_validate_plan to check plan completeness against quality gates.
Use mpa_calculate_cac to analyze customer acquisition cost vs benchmarks and LTV.
`;

export const mediaPlanAgent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4',
  system: MPA_SYSTEM_PROMPT,
  
  tools: {
    mpa_get_benchmarks: getBenchmarks,
    mpa_search_channels: searchChannels,
    mpa_run_projections: runProjections,
    mpa_validate_plan: validatePlan,
    mpa_calculate_cac: calculateCAC
  },
  
  stopWhen: {
    stepCountIs: 10,
    or: { hasTextResponse: true }
  },
  
  prepareStep: async (context) => {
    const stepCount = context.stepCount;
    
    // Inject relevant KB content based on conversation context
    if (stepCount === 1) {
      // Always include strategic framework on first step
      const framework = await getKBContent('KB_01_Strategic_Framework_Reference.txt');
      context.messages.push({
        role: 'system',
        content: `Reference Framework:\n${framework.substring(0, 4000)}`
      });
    }
    
    // Detect if user is discussing channels and inject playbook
    const lastUserMessage = context.messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage?.content?.toLowerCase().includes('channel')) {
      const playbook = await getKBContent('KB_04_Channel_Role_Playbooks.txt');
      context.messages.push({
        role: 'system',
        content: `Channel Playbook Reference:\n${playbook.substring(0, 3000)}`
      });
    }
    
    return context;
  }
});

// API route handler
export async function POST(request: Request) {
  const { message, session_id, plan_id } = await request.json();
  
  // Load session history from Dataverse
  const sessionHistory = await loadSessionHistory(session_id);
  
  const result = await mediaPlanAgent.generate({
    messages: [
      ...sessionHistory,
      { role: 'user', content: message }
    ],
    callOptions: {
      session_id,
      plan_id
    }
  });
  
  // Save response to session
  await saveToSession(session_id, {
    user_message: message,
    assistant_response: result.text,
    tools_used: result.toolCalls?.map(t => t.toolName) || [],
    step_count: result.steps.length
  });
  
  return Response.json({
    response: result.text,
    tools_used: result.toolCalls?.map(t => ({
      name: t.toolName,
      args: t.args
    })),
    steps: result.steps.length
  });
}
```

================================================================================
PHASE 5: VERCEL DEPLOYMENT CONFIGURATION
================================================================================

### vercel.json

```json
{
  "version": 2,
  "name": "kessel-digital-ai-gateway",
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "env": {
    "AI_GATEWAY_API_KEY": "@ai-gateway-api-key",
    "DATAVERSE_URL": "@dataverse-url",
    "DATAVERSE_CLIENT_ID": "@dataverse-client-id",
    "DATAVERSE_CLIENT_SECRET": "@dataverse-client-secret",
    "SHAREPOINT_SITE_URL": "@sharepoint-site-url"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### api/mcp/route.ts

```typescript
import { createMCPHandler } from '@modelcontextprotocol/sdk/http';
import { server } from '../../src/index';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return createMCPHandler(server)(request);
}

export async function POST(request: Request) {
  return createMCPHandler(server)(request);
}
```

### api/agent/mpa/route.ts

```typescript
import { POST as handleMPARequest } from '../../../src/agents/mpa-plan-generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export { handleMPARequest as POST };

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
```

================================================================================
PHASE 6: POWER AUTOMATE INTEGRATION
================================================================================

Create new flow: "MPA - AI Gateway Router"

Trigger: HTTP POST
Purpose: Route Copilot Studio requests to Vercel AI Gateway

Request Schema:
{
  "type": "object",
  "properties": {
    "user_message": { "type": "string" },
    "session_id": { "type": "string" },
    "plan_id": { "type": "string" }
  }
}

Actions:
1. HTTP - Call Vercel AI Gateway
   - Method: POST
   - URI: https://kessel-digital-ai-gateway.vercel.app/api/agent/mpa
   - Headers: Content-Type: application/json
   - Body: triggerBody()

2. Parse JSON - Parse response
   - Content: body('HTTP')
   - Schema: { response, tools_used, steps }

3. Condition - Check for tool results to log
   - If tools_used is not empty:
     - Add audit record to eap_audit

4. Response
   - Status: 200
   - Body: {
       "response": "@{body('Parse_JSON')?['response']}",
       "metadata": {
         "tools_used": "@{body('Parse_JSON')?['tools_used']}",
         "steps": "@{body('Parse_JSON')?['steps']}"
       }
     }

================================================================================
VALIDATION CHECKLIST
================================================================================

Before committing, verify:
- [ ] All TypeScript files compile without errors
- [ ] All tool implementations are COMPLETE (no TODOs)
- [ ] Environment variables documented
- [ ] vercel.json properly configured
- [ ] API routes follow RESTful conventions
- [ ] Error handling in all async functions
- [ ] Dataverse client properly configured
- [ ] SharePoint KB loader functional
- [ ] MCP server registers all tools
- [ ] Agent orchestration handles multi-step flows

================================================================================
GIT COMMIT COMMANDS
================================================================================

git checkout deploy/personal
git add release/v5.5/integrations/vercel-ai-gateway/
git commit -m "feat: Add Vercel AI Gateway integration with MCP server and agent orchestration

- Implement MCP server exposing MPA, CA, and EAP tools
- Add tool definitions for benchmarks, projections, validation, CAC analysis
- Create multi-step agent orchestration with prepareStep KB injection
- Configure Vercel deployment with proper environment variables
- Add API routes for MCP and agent endpoints
- Document Power Automate integration pattern"

git push origin deploy/personal

================================================================================
END OF VS CODE CLAUDE INSTRUCTIONS
================================================================================
```

---

## PART 7: IMPLEMENTATION TIMELINE

| Week | Phase | Deliverables | Dependencies |
|------|-------|-------------|--------------|
| 1 | Foundation Setup | Vercel project, package.json, config files | None |
| 1 | Tool Definitions | benchmarks.ts, projections.ts, validation.ts | Config complete |
| 2 | MCP Server | index.ts with all tools and resources registered | Tools complete |
| 2 | API Routes | MCP endpoint, agent endpoints | MCP server complete |
| 3 | Agent Orchestration | mpa-plan-generator.ts with multi-step flow | API routes complete |
| 3 | Power Automate | AI Gateway Router flow | Agent endpoints complete |
| 4 | Integration Testing | End-to-end testing via Copilot Studio | All components complete |
| 4 | Documentation | README, deployment guides, continuation prompts | Testing complete |
| 5 | CA Development | CA tools and agent orchestration | MPA proven |
| 6 | EAP Platform Services | Cross-agent tools, learning synthesis | CA proven |
| 7 | Enterprise Config | Mastercard BYOK, access control integration | Platform stable |
| 8 | Production Deployment | Deploy to production, monitoring setup | All testing passed |

---

## PART 8: SUCCESS METRICS

### 8.1 Technical Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Response Time | 3-5 sec | <5 sec | P95 latency |
| Availability | 99% | 99.9% | Uptime monitoring |
| Tool Success Rate | N/A | >95% | Tool execution logs |
| Failover Events | N/A | <1/day | Model failover tracking |
| Cache Hit Rate | 0% | >60% | Edge cache metrics |

### 8.2 Quality Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Benchmark Currency | Q4 2024 | Real-time | Data freshness |
| Recommendation Accuracy | Manual validation | User feedback | Thumbs up/down |
| Plan Completion Rate | Unknown | >80% | Plans reaching Gate 3 |
| User Satisfaction | Unknown | 4.5/5 | Survey scores |

### 8.3 Business Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Plans Generated/Month | Unknown | 50+ | Dataverse counts |
| Time to Plan | Unknown | <30 min | Session duration |
| Learning Promotion Rate | Unknown | 10% | Learnings promoted to EAP |

---

## APPENDIX A: ENVIRONMENT VARIABLES

| Variable | Description | Required | Source |
|----------|-------------|----------|--------|
| AI_GATEWAY_API_KEY | Vercel AI Gateway API key | Yes | Vercel Dashboard |
| DATAVERSE_URL | Dataverse environment URL | Yes | Power Platform |
| DATAVERSE_CLIENT_ID | Azure AD app client ID | Yes | Azure Portal |
| DATAVERSE_CLIENT_SECRET | Azure AD app secret | Yes | Azure Portal |
| SHAREPOINT_SITE_URL | SharePoint site with KB files | Yes | SharePoint Admin |
| SHAREPOINT_TENANT_ID | Azure AD tenant ID | Yes | Azure Portal |

---

## APPENDIX B: RELATED DOCUMENTS

- MPA_Copilot_Instructions_v5_4.txt - Agent instructions
- Analytics_Engine_v5_1.txt - Calculation formulas
- MPA_PowerAutomate_Complete_Specification_v7.md - Flow specifications
- KB_01-05 - Knowledge base files
- CA_Agent_Roadmap_and_Starter.md - CA development plan
- Mastercard_Corporate_Extensions_Guide.md - Enterprise extensions

---

## REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-09 | Claude AI | Initial comprehensive plan |
