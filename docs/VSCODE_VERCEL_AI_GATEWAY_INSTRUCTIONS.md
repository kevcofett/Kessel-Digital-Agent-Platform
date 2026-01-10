# VS CODE CLAUDE: VERCEL AI GATEWAY IMPLEMENTATION

## CRITICAL FIRST STEP

Before doing ANYTHING else, read the complete implementation plan:

```
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/VERCEL_AI_GATEWAY_IMPLEMENTATION_PLAN.md
```

This document contains the full technical specification, tool definitions, MCP server architecture, and deployment configuration you need.

---

## MISSION

Implement Vercel AI Gateway integration for the Kessel-Digital-Agent-Platform to enhance MPA, CA, and EAP agents with:

1. Multi-model access with automatic failover (Claude → GPT → Gemini)
2. Custom tool definitions for Dataverse and Azure Functions
3. MCP server exposing all agent capabilities
4. Multi-step agent orchestration
5. Real-time benchmark data via web search fallback
6. Structured output for Dataverse integration

---

## REPOSITORY CONTEXT

Repository: `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`
Branch: `deploy/personal` (development) → `main` (production)

Reference files:
- `/VERCEL_AI_GATEWAY_IMPLEMENTATION_PLAN.md` - Complete implementation spec (READ THIS FIRST)
- `/release/v5.5/agents/mpa/` - Current MPA agent files
- `/MPA_Copilot_Instructions_v5_4.txt` - Agent behavior rules
- `/Analytics_Engine_v5_1.txt` - Calculation formulas
- `/mpa_benchmark_seed.csv` - Benchmark data structure

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Do First)

Create directory structure:
```
/release/v5.5/integrations/vercel-ai-gateway/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── config/
│   │   ├── ai-gateway.ts        # AI Gateway configuration
│   │   ├── dataverse.ts         # Dataverse connection
│   │   └── sharepoint.ts        # SharePoint connection
│   ├── tools/
│   │   ├── mpa/
│   │   │   ├── benchmarks.ts    # getBenchmarks, searchChannels
│   │   │   ├── projections.ts   # runProjections
│   │   │   └── validation.ts    # validatePlan, calculateCAC
│   │   ├── ca/
│   │   │   ├── frameworks.ts    # applyFramework
│   │   │   └── research.ts      # analyzeCompetitor
│   │   └── eap/
│   │       ├── sessions.ts      # Session management
│   │       └── learnings.ts     # Learning synthesis
│   ├── agents/
│   │   ├── mpa-plan-generator.ts
│   │   └── ca-proposal-generator.ts
│   ├── schemas/
│   │   └── dataverse-schemas.ts
│   └── utils/
│       ├── kb-loader.ts
│       └── dataverse-client.ts
├── api/
│   ├── mcp/route.ts             # MCP HTTP endpoint
│   ├── agent/mpa/route.ts       # MPA agent endpoint
│   └── agent/ca/route.ts        # CA agent endpoint
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

### Phase 2: Core Tools

Implement these 5 tools with COMPLETE code (see implementation plan for full source):

| Tool | File | Purpose |
|------|------|---------|
| `getBenchmarks` | benchmarks.ts | Query Dataverse, fallback to web search |
| `searchChannels` | benchmarks.ts | Rank channels by objective/budget |
| `runProjections` | projections.ts | Calculate reach/frequency/cost |
| `validatePlan` | validation.ts | Check against quality gates |
| `calculateCAC` | validation.ts | CAC analysis with LTV comparison |

### Phase 3: MCP Server

Create MCP server in `src/index.ts` that:
- Registers all MPA tools
- Registers CA tools (frameworks, research)
- Exposes KB resources (Analytics Engine, Strategic Framework)
- Handles HTTP/SSE transport

### Phase 4: Agent Orchestration

Create `mpa-plan-generator.ts` with:
- System prompt from MPA_Copilot_Instructions_v5_4.txt
- All tools registered
- `prepareStep` hook for dynamic KB injection
- `stopWhen` conditions for multi-step flow

### Phase 5: Deployment

- Configure `vercel.json` with environment variables
- Create API routes for MCP and agent endpoints
- Document Power Automate integration

---

## HARD REQUIREMENTS

1. **READ THE PLAN FIRST** - The implementation plan has complete TypeScript code for every component

2. **NO PLACEHOLDERS** - Every file must be complete and functional

3. **FOLLOW EXISTING PATTERNS** - Match naming conventions from MPA v5.5

4. **USE THESE DEPENDENCIES**:
   - `ai` v6.0.0 (Vercel AI SDK)
   - `@modelcontextprotocol/sdk` v1.0.0
   - `zod` for schema validation
   - `@azure/identity` for Dataverse auth

5. **MAINTAIN DATA HIERARCHY**:
   1. Direct API/Platform data
   2. MCP Tool results
   3. Web research
   4. User-provided data
   5. Knowledge base
   6. AI estimates (labeled)

---

## VALIDATION CHECKLIST

Before committing, verify:

- [ ] Read VERCEL_AI_GATEWAY_IMPLEMENTATION_PLAN.md completely
- [ ] All directories created
- [ ] package.json with correct dependencies
- [ ] All tool implementations complete (no TODOs)
- [ ] MCP server registers all tools and resources
- [ ] Agent orchestration handles multi-step flows
- [ ] API routes properly configured
- [ ] vercel.json has all environment variables
- [ ] TypeScript compiles without errors

---

## GIT WORKFLOW

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git checkout deploy/personal
git pull origin deploy/personal

# After implementation
git add release/v5.5/integrations/vercel-ai-gateway/
git commit -m "feat: Add Vercel AI Gateway integration with MCP server

- Implement MCP server exposing MPA, CA, and EAP tools
- Add tool definitions for benchmarks, projections, validation
- Create multi-step agent orchestration
- Configure Vercel deployment"

git push origin deploy/personal
```

---

## CONTINUATION PROMPT

If context runs out, use this to resume:

```
Continue implementing Vercel AI Gateway integration for Kessel-Digital-Agent-Platform.

Read the implementation plan:
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/VERCEL_AI_GATEWAY_IMPLEMENTATION_PLAN.md

Check current progress:
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/

Continue from where you left off, creating complete implementations with no placeholders.
```

---

## START HERE

1. Read the implementation plan: `cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/VERCEL_AI_GATEWAY_IMPLEMENTATION_PLAN.md`

2. Create the directory structure

3. Create package.json and tsconfig.json

4. Implement tools in order: benchmarks → projections → validation

5. Create MCP server

6. Create agent orchestration

7. Configure deployment

8. Commit and push
