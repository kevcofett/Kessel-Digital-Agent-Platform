# Vercel AI Gateway Integration

MCP server and agent orchestration for the Kessel-Digital-Agent-Platform, providing multi-model AI access with Dataverse integration.

## Overview

This integration provides:

- **MCP Server** - Model Context Protocol server exposing all agent tools
- **MPA Agent** - Media Planning Agent with 10-step planning framework
- **CA Agent** - Consulting Agent with strategic framework analysis
- **EAP Tools** - Enterprise Agent Platform session and learning management
- **Multi-model Failover** - Claude → GPT → Gemini automatic fallback
- **Dataverse Integration** - Direct connection to Microsoft Dataverse tables
- **SharePoint KB Access** - Knowledge base loading from SharePoint libraries

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  /api/mcp   │  │/api/agent/  │  │/api/agent/  │         │
│  │             │  │    mpa      │  │    ca       │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────┐         │
│  │              MCP Server (index.ts)             │         │
│  │  - 15 Tools (MPA, CA, EAP)                    │         │
│  │  - 5 KB Resources                              │         │
│  │  - 2 Prompt Templates                          │         │
│  └───────────────────────┬───────────────────────┘         │
│                          │                                  │
│  ┌─────────────┬─────────┴─────────┬─────────────┐         │
│  │ MPA Tools   │   CA Tools        │  EAP Tools  │         │
│  │ - Benchmarks│   - Frameworks    │  - Sessions │         │
│  │ - Projections│  - Research      │  - Learnings│         │
│  │ - Validation│                   │             │         │
│  └──────┬──────┴─────────┬─────────┴──────┬──────┘         │
│         │                │                │                 │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Dataverse│    │SharePoint│    │ AI Models│
    │  Tables  │    │    KB    │    │(Claude/  │
    │          │    │          │    │GPT/Gemini│
    └──────────┘    └──────────┘    └──────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Vercel CLI (`npm i -g vercel`)
- Azure AD app registration for Dataverse access
- Anthropic API key

### Installation

```bash
cd release/v5.5/integrations/vercel-ai-gateway
npm install
```

### Environment Variables

Create `.env.local`:

```env
# AI Gateway
AI_GATEWAY_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-google-key

# Dataverse
DATAVERSE_URL=https://your-org.crm.dynamics.com
DATAVERSE_CLIENT_ID=your-client-id
DATAVERSE_CLIENT_SECRET=your-client-secret
DATAVERSE_TENANT_ID=your-tenant-id

# SharePoint
SHAREPOINT_SITE_URL=https://your-tenant.sharepoint.com/sites/AragornAI2
SHAREPOINT_CLIENT_ID=your-client-id
SHAREPOINT_CLIENT_SECRET=your-client-secret
SHAREPOINT_TENANT_ID=your-tenant-id
```

### Local Development

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### Deployment

```bash
vercel --prod
```

## API Endpoints

### MCP Endpoint

```
GET  /api/mcp          - Server capabilities
POST /api/mcp          - MCP JSON-RPC requests
```

**List Tools:**
```json
POST /api/mcp
{
  "method": "tools/list"
}
```

**Call Tool:**
```json
POST /api/mcp
{
  "method": "tools/call",
  "params": {
    "name": "mpa_get_benchmarks",
    "arguments": {
      "vertical_code": "RETAIL",
      "channel_code": "PAID_SOCIAL"
    }
  }
}
```

### MPA Agent Endpoint

```
GET  /api/agent/mpa    - Agent info and health
POST /api/agent/mpa    - Execute MPA agent
```

**Execute Agent:**
```json
POST /api/agent/mpa
{
  "message": "Create a media plan for retail client with $500K budget",
  "clientContext": {
    "clientName": "Acme Retail",
    "verticalCode": "RETAIL",
    "objectives": ["AWARENESS", "CONSIDERATION"],
    "budget": 500000
  }
}
```

### CA Agent Endpoint

```
GET  /api/agent/ca     - Agent info and health
POST /api/agent/ca     - Execute CA agent
```

**Execute Agent:**
```json
POST /api/agent/ca
{
  "message": "Conduct a SWOT analysis for Tesla",
  "engagementType": "STRATEGY"
}
```

## Available Tools

### MPA Tools (5)

| Tool | Description |
|------|-------------|
| `mpa_get_benchmarks` | Query industry benchmark data from Dataverse |
| `mpa_search_channels` | Rank channels by objective, budget, audience |
| `mpa_run_projections` | Calculate reach, frequency, impressions, cost |
| `mpa_validate_plan` | Validate against 3-gate quality framework |
| `mpa_calculate_cac` | Customer acquisition cost analysis |

### CA Tools (3)

| Tool | Description |
|------|-------------|
| `ca_apply_framework` | Apply strategic frameworks (SWOT, Porter, etc.) |
| `ca_analyze_competitor` | Competitive intelligence analysis |
| `ca_market_research` | Market sizing and trend analysis |

### EAP Tools (7)

| Tool | Description |
|------|-------------|
| `eap_load_session` | Load existing agent session |
| `eap_create_session` | Create new session |
| `eap_update_session` | Update session data |
| `eap_get_session_history` | Get conversation history |
| `eap_synthesize_learnings` | Extract insights from history |
| `eap_promote_learning` | Save insight to KB |
| `eap_search_learnings` | Search learning repository |

## KB Resources

| URI | Description |
|-----|-------------|
| `kb://mpa/analytics-engine` | Analytics Engine v5.5 formulas |
| `kb://mpa/strategic-framework` | Campaign strategy guidelines |
| `kb://mpa/channel-playbooks` | Channel capabilities reference |
| `kb://mpa/benchmark-guide` | Industry benchmark reference |
| `kb://mpa/measurement-framework` | KPI measurement methodology |

## Project Structure

```
vercel-ai-gateway/
├── src/
│   ├── index.ts                 # MCP server entry
│   ├── config/
│   │   ├── ai-gateway.ts        # Model configuration
│   │   ├── dataverse.ts         # Dataverse connection
│   │   └── sharepoint.ts        # SharePoint/Graph API
│   ├── tools/
│   │   ├── mpa/
│   │   │   ├── benchmarks.ts    # getBenchmarks, searchChannels
│   │   │   ├── projections.ts   # runProjections
│   │   │   └── validation.ts    # validatePlan, calculateCAC
│   │   ├── ca/
│   │   │   ├── frameworks.ts    # applyFramework
│   │   │   └── research.ts      # analyzeCompetitor, marketResearch
│   │   └── eap/
│   │       ├── sessions.ts      # Session management
│   │       └── learnings.ts     # Learning synthesis
│   ├── agents/
│   │   ├── mpa-plan-generator.ts
│   │   └── ca-proposal-generator.ts
│   ├── schemas/
│   │   └── dataverse-schemas.ts
│   └── utils/
│       ├── dataverse-client.ts
│       └── kb-loader.ts
├── api/
│   ├── mcp/route.ts
│   └── agent/
│       ├── mpa/route.ts
│       └── ca/route.ts
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## Dataverse Tables

| Table | Purpose |
|-------|---------|
| `mpa_benchmark` | Industry benchmark metrics |
| `mpa_channel` | Channel definitions |
| `mpa_vertical` | Industry verticals |
| `mpa_kpi` | KPI definitions |
| `mpa_mediaplan` | Media plan records |
| `mpa_plandata` | Plan section data |
| `eap_session` | Agent sessions |
| `eap_learning` | Shared learnings |

## Multi-Model Failover

The gateway automatically handles model failures:

1. **Primary**: Claude claude-sonnet-4-20250514 (Anthropic)
2. **Fallback 1**: GPT-4o (OpenAI)
3. **Fallback 2**: Gemini 1.5 Pro (Google)

Configure in `src/config/ai-gateway.ts`.

## Power Automate Integration

To integrate with Microsoft Power Automate:

1. Create HTTP action pointing to `/api/agent/mpa`
2. Set Content-Type: application/json
3. Pass message and context in request body
4. Parse JSON response for agent output

Example flow: `MPA - AI Gateway Router`

## Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

## Version History

- **5.5.0** - Initial Vercel AI Gateway implementation
  - MCP server with 15 tools
  - MPA and CA agent orchestration
  - Dataverse and SharePoint integration
  - Multi-model failover support

## License

Proprietary - Kessel Digital
