# Orchestrator Agent (ORC)

**Version:** 1.0  
**Status:** Development  

## Purpose
Central coordinator that routes requests to specialist agents and maintains session coherence.

## Files
- `instructions/ORC_Copilot_Instructions_v1.txt` - Copilot Studio instructions
- `kb/ORC_KB_Routing_Logic_v1.txt` - Routing patterns and fallbacks

## Capabilities
- Intent classification
- 10-step workflow progression
- Gate validation
- Response synthesis
- Error recovery

## Tools
- RouteToSpecialist
- GetSessionState
- UpdateProgress
- GetPlanSummary
