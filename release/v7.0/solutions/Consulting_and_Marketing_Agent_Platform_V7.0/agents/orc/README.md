# Orchestrator Agent (ORC)

## Purpose
Routes user requests to specialist agents, manages session state, and handles workflow coordination across the multi-agent system.

## Capabilities
- Intent classification and agent routing
- Session initialization and state management
- Error handling and graceful degradation
- Workflow gate enforcement
- Cross-agent handoff coordination

## Knowledge Base Files
| File | Description |
|------|-------------|
| ORC_KB_Workflow_Gates_v7.0.txt | Step progression rules and gate conditions |
| ORC_KB_Error_Handling_v7.0.txt | Error patterns and recovery procedures |

## Flows
- RouteToAgent: Determines and executes routing to specialist
- InitializeSession: Creates new planning session
- GetAgentRegistry: Returns available agents and capabilities

## Example Queries
- "Help me create a media plan" → Initiates workflow
- "Route this to analytics" → Explicit routing
- "What can you help me with?" → Capability overview

## Routing Keywords
ORC handles general queries and routes based on these patterns:
- Analytics keywords → ANL
- Audience/segment keywords → AUD
- Channel/budget keywords → CHA
- Supply path/NBI keywords → SPO
- Document/export keywords → DOC
- Performance/analyze keywords → PRF

## Dependencies
- All 6 specialist agents must be deployed
- Agent registry must be configured
- Session management flow operational
