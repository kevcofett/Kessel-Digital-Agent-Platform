# MCMAP Documentation Assistant (DOCS Agent)

## Overview

The DOCS agent is a lightweight chatbot that helps Mastercard employees discover and search the MCMAP architecture documentation. It provides:

- Text-based numbered menu navigation (1-9 categories)
- Terminology and acronym definitions
- Architecture documentation search
- Quick reference for agent codes and platform concepts

## Agent Identity

| Attribute | Value |
|-----------|-------|
| Code | DOCS |
| Domain | Support |
| Function | Documentation search, terminology, architecture guidance |
| Integration | Routable from ORC; hands back for planning tasks |

## Files

```
release/v6.0/agents/docs/
├── instructions/
│   └── DOCS_Instructions_v1.md    # Copilot Studio instructions (3.9KB)
├── kb/
│   └── (uses mcmap-reference-packet docs)
├── integration/
│   └── ORC_Routing_Update.md      # ORC integration patterns
└── README.md                       # This file
```

## Deployment

### Standalone Deployment

1. Create new agent in Copilot Studio
2. Copy instructions from `DOCS_Instructions_v1.md`
3. Add knowledge base: all documents from `mcmap-reference-packet/`
4. Configure greeting message
5. Publish to desired channel

### ORC Integration

When integrated with ORC orchestrator:

1. Add DOCS to ORC routing table
2. Configure terminology/architecture question detection
3. Enable handoff pattern:
   - User in MPA asks "What does X mean?"
   - ORC routes to DOCS
   - DOCS provides answer
   - User says "back to planning"
   - Returns to MPA context

## Knowledge Base Documents

The DOCS agent uses the MCMAP reference packet:

| Document | Content |
|----------|---------|
| 01-MCMAP_Executive_Summary | Value proposition, overview |
| 02-MCMAP_System_Architecture | Technical architecture |
| 03-MCMAP_Security_Compliance | DLP, security, data provenance |
| 04-MCMAP_Agent_Capabilities | All agents and capabilities |
| 05-MCMAP_Data_Architecture | Dataverse schema |
| 06-MCMAP_AIBuilder_Integration | AI Builder configuration |
| 07-MCMAP_Operational_Runbook | Support procedures |
| 08-MCMAP_Quality_Assurance | Testing framework |
| 10-MCMAP_Contact_Reference | Key contacts |

## Menu Categories

| # | Category | Content |
|---|----------|---------|
| 1 | PLATFORM OVERVIEW | Metrics, value proposition |
| 2 | AGENTS | 10 specialists, capabilities |
| 3 | ARCHITECTURE | Tech stack, data flows |
| 4 | DATA MODEL | Dataverse tables |
| 5 | SECURITY | DLP, compliance, data provenance |
| 6 | AI INTEGRATION | Prompts, KB structure |
| 7 | OPERATIONS | Support tiers |
| 8 | TESTING | QA framework |
| 9 | GLOSSARY | Terms, acronyms |

## Glossary Coverage

The agent includes built-in quick reference for:

- **Agent Codes**: ORC, ANL, AUD, CHA, SPO, DOC, PRF, CST, CHG, CA
- **Platform Acronyms**: MCMAP, MPA, EAP, CAL, DLP, KB
- **Technology Terms**: AI Builder, Dataverse, Copilot Studio, SharePoint
- **Metrics Terms**: LTV, CAC, ROAS, MMM, NBI, SPO

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 24, 2026 | Initial release |

## Compliance

- Instructions file: 3.9KB (under 8K Copilot limit)
- Plain text formatting (ALL-CAPS headers, hyphens only)
- No external dependencies
- DLP compliant (no HTTP connectors)
