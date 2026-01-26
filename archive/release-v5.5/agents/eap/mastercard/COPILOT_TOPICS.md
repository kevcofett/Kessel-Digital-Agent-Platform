# EAP Copilot Studio Topics

## Topic Configuration for Mastercard Deployment - Enterprise AI Platform Orchestrator

### Topic 1: Start Session
- **Display Name:** Start Enterprise AI Session
- **Trigger Phrases:**
  - hello
  - hi
  - get started
  - I need help
  - start session
- **Action:** Call flow EAP_InitializeSession
- **Inputs:** pathway (auto-detected based on user profile)

### Topic 2: Route to Media Planning
- **Display Name:** Media Planning Request
- **Trigger Phrases:**
  - I need to create a media plan
  - help with media planning
  - campaign planning
  - advertising plan
  - media strategy
- **Action:** Route to MPA agent
- **Routing Logic:** Set target_agent=MPA, initialize MPA context

### Topic 3: Route to Consulting
- **Display Name:** Consulting Request
- **Trigger Phrases:**
  - I need consulting help
  - strategic advice
  - research request
  - market analysis
  - competitive research
- **Action:** Route to CA agent
- **Routing Logic:** Set target_agent=CA, initialize CA context

### Topic 4: Provide Feedback
- **Display Name:** Provide Feedback
- **Trigger Phrases:**
  - that was helpful
  - that wasn't helpful
  - good answer
  - not what I needed
  - this is wrong
- **Action:** Call flow MPA_CaptureFeedback (shared)
- **Inputs:** feedback_type (auto-detected), feedback_text, agent_type=EAP

### Topic 5: Clarify Intent
- **Display Name:** Clarify User Intent
- **Trigger Phrases:**
  - (fallback topic for ambiguous requests)
- **Action:** Ask clarifying question
- **Response Template:** "I can help you with media planning or consulting services. Which would you like to focus on today?"

### Topic 6: View Session History
- **Display Name:** Session History
- **Trigger Phrases:**
  - show my history
  - previous sessions
  - what did we discuss
  - session log
- **Action:** Call flow EAP_GetSessionHistory
- **Inputs:** user_id, limit (default: 10)

### Topic 7: Switch Agent
- **Display Name:** Switch Between Agents
- **Trigger Phrases:**
  - switch to media planning
  - switch to consulting
  - change agent
  - talk to MPA
  - talk to CA
- **Action:** Update session target_agent, re-route conversation
- **Routing Logic:** Preserve context, handoff to new agent

### Topic 8: System Status
- **Display Name:** Check System Status
- **Trigger Phrases:**
  - system status
  - is everything working
  - check health
  - diagnostics
- **Action:** Call flow EAP_SystemHealthCheck
- **Response:** Display status of MPA, CA, and shared services
