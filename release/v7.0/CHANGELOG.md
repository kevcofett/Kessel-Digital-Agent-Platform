# Changelog

All notable changes to the Kessel Digital Agent Platform.

## [6.0.0] - 2026-01-18

### Added

#### Multi-Agent Architecture
- **Orchestrator Agent (ORC)**: Routes requests to specialist agents, manages sessions
- **Analytics Agent (ANL)**: Calculations, projections, scenario modeling
- **Audience Agent (AUD)**: Segmentation, LTV, first-party data strategy
- **Channel Agent (CHA)**: Channel selection, allocation, benchmarks
- **Supply Path Agent (SPO)**: NBI calculation, fee analysis, partner evaluation
- **Document Agent (DOC)**: Document generation, exports, templates
- **Performance Agent (PRF)**: Performance analysis, anomaly detection, learnings

#### Knowledge Base Files (22 total)
- ORC: 2 KB files (workflow gates, error handling)
- ANL: 4 KB files (analytics engine, projections, scenarios, statistics)
- AUD: 4 KB files (segmentation, LTV, targeting, first-party data)
- CHA: 3 KB files (channel registry, playbooks, allocation methods)
- SPO: 3 KB files (NBI calculation, fee analysis, partner evaluation)
- DOC: 3 KB files (templates, formatting, export specs)
- PRF: 3 KB files (optimization triggers, anomaly detection, learnings)

#### Documentation
- Agent README files for all 7 agents
- Platform README with architecture overview
- Copilot Studio deployment checklist
- Multi-agent routing test suite (35 scenarios)
- Agent registry with routing keywords

#### New Capabilities
- Cross-agent handoffs for complex workflows
- Keyword-based intelligent routing
- Session state management across agents
- First-party data and clean room guidance
- Enhanced supply path optimization

### Changed

- Replaced monolithic MPA v5.5 with specialist agent architecture
- Redistributed 27+ KB documents across 7 specialist agents
- Improved separation of concerns by domain
- Enhanced modularity for independent agent updates

### Deprecated

- MPA v5.5 monolithic instructions (archived)
- Single-agent workflow approach

### Migration Guide

#### From MPA v5.5 to v6.0

1. **Knowledge Base**: Content redistributed to specialist agents
   - Analytics content → ANL KB files
   - Audience content → AUD KB files
   - Channel content → CHA KB files
   - Supply path content → SPO KB files
   - Document guidance → DOC KB files
   - Performance content → PRF KB files

2. **Workflows**: Now coordinated by ORC
   - Step 1-2 (Context) → ORC handles
   - Step 3-4 (Audience) → Routes to AUD
   - Step 5-6 (Analytics) → Routes to ANL
   - Step 7-8 (Channels) → Routes to CHA
   - Step 9-10 (Output) → Routes to DOC

3. **Flows**: Distributed to specialist agents
   - Calculation flows → ANL
   - Segmentation flows → AUD
   - Benchmark flows → CHA
   - Export flows → DOC

### Breaking Changes

- Direct MPA queries now route through ORC
- KB file paths changed to agent-specific directories
- Flow naming conventions updated with agent prefixes

---

## [5.5.0] - 2025-12-15

### Summary
Final monolithic MPA release before multi-agent migration.

### Features
- 10-step guided workflow
- 27 knowledge base files
- Agentic RAG system
- ADIS integration (RFM, LTV, propensity)
- 14 evaluation scorers
- 708+ benchmark records

---

## [5.0.0] - 2025-11-01

### Summary
Major release with evaluation framework and benchmark system.

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- MAJOR: Architecture changes (e.g., 5.x → 6.x for multi-agent)
- MINOR: New features, KB additions
- PATCH: Bug fixes, documentation updates
