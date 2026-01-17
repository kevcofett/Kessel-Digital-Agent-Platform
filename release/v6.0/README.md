# Release v6.0: Multi-Agent Architecture

**Status:** Development  
**Branch:** `feature/multi-agent-architecture`

## Overview

This release transforms the monolithic MPA into a 7-agent specialized system:

| Agent | Code | Primary Domain |
|-------|------|----------------|
| Orchestrator | ORC | Routing, workflow, session |
| Analytics | ANL | Projections, forecasting, statistics |
| Audience | AUD | Segmentation, LTV, targeting |
| Channel | CHA | Media mix, allocation, benchmarks |
| Supply Path | SPO | Programmatic optimization, fees |
| Document | DOC | Plan generation, exports |
| Performance | PRF | In-flight optimization, learnings |

## Documentation

- `docs/multi-agent/MULTI_AGENT_WORKPLAN.md` - Complete implementation plan
- `docs/multi-agent/VSCODE_MULTI_AGENT_IMPLEMENTATION_PROMPT.md` - VS Code tasks

## Structure

```
release/v6.0/
├── agents/
│   ├── orc/          # Orchestrator Agent
│   ├── anl/          # Analytics Agent
│   ├── aud/          # Audience Agent
│   ├── cha/          # Channel Agent
│   ├── spo/          # Supply Path Agent
│   ├── doc/          # Document Agent
│   └── prf/          # Performance Agent
├── platform/
│   └── eap/          # Shared EAP services
├── contracts/        # Inter-agent communication
└── evaluation/       # Multi-agent test harness
```

## Getting Started

See `VSCODE_MULTI_AGENT_IMPLEMENTATION_PROMPT.md` for implementation tasks.
