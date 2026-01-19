# KDAP Adaptive Cards - Copilot Studio Integration Guide

## Overview

This guide details how to integrate KDAP decision tree Adaptive Cards with Microsoft Copilot Studio (formerly Power Virtual Agents). The cards provide rich, interactive UI for guiding users through decision workflows.

## Card Templates

| Template | Purpose | File |
|----------|---------|------|
| `workflow-selector` | Choose workflow, resume sessions | `templates/workflow-selector.json` |
| `workflow-progress` | Show current step, progress bar | `templates/workflow-progress.json` |
| `decision-node` | Present decision options | `templates/decision-node.json` |
| `action-node` | Display agent action status | `templates/action-node.json` |
| `gate-approval` | Human review/approval gate | `templates/gate-approval.json` |
| `workflow-complete` | Summary and artifacts | `templates/workflow-complete.json` |

---

## Copilot Studio Setup

### 1. Create Power Automate Flow for Card Data

Create a flow that generates card data based on the current workflow state.

**Flow Name:** `KDAP-Generate-Adaptive-Card`

**Trigger:** When Copilot Studio calls a flow

**Inputs:**
- `cardType` (string): Template type to render
- `sessionId` (string): Current workflow session ID
- `nodeId` (string, optional): Specific node to display

**Actions:**

```
1. Initialize variable: cardData (Object)
2. Switch on cardType:
   - workflow-selector: Call GetWorkflowList action
   - decision-node: Call GetDecisionNodeData action
   - action-node: Call GetActionNodeData action
   - gate-approval: Call GetGateData action
   - workflow-complete: Call GetCompletionData action
3. Compose: Merge template with data
4. Return cardData to Copilot
```

### 2. Register Topics in Copilot Studio

#### Topic: Start Workflow

**Trigger phrases:**
- "Start a workflow"
- "Begin decision tree"
- "New campaign planning"
- "Help me optimize budget"

**Flow:**
```
1. Call KDAP-Generate-Adaptive-Card flow
   - cardType: "workflow-selector"
   - sessionId: null
2. Display Adaptive Card response
3. Wait for user selection
4. Branch based on action:
   - startWorkflow: Create session, show first node
   - resumeSession: Load session, show current node
```

#### Topic: Handle Decision

**Trigger:** Conversation update with action = "confirmDecision"

**Flow:**
```
1. Get session from Dataverse
2. Record decision in session
3. Determine next node
4. Generate appropriate card:
   - If decision node: decision-node template
   - If action node: action-node template
   - If gate node: gate-approval template
   - If end node: workflow-complete template
5. Display card and wait
```

#### Topic: Handle Gate Approval

**Trigger:** Conversation update with action in ["approve", "reject", "requestChanges"]

**Flow:**
```
1. Get session and gate data
2. Record approval decision
3. If approved:
   - Execute approved actions
   - Move to next node
4. If rejected:
   - Record rejection reason
   - Return to previous decision point
5. If requestChanges:
   - Flag for revision
   - Return to action node
6. Display next appropriate card
```

---

## Dataverse Tables Required

### kdap_workflowsession

| Column | Type | Description |
|--------|------|-------------|
| kdap_sessionid | GUID | Primary key |
| kdap_workflowid | String | Workflow definition ID |
| kdap_currentnodeid | String | Current node in workflow |
| kdap_status | Choice | pending/active/completed/cancelled |
| kdap_startedat | DateTime | Session start time |
| kdap_completedat | DateTime | Session completion time |
| kdap_decisions | Multiline | JSON of decisions made |
| kdap_completednodes | Multiline | JSON array of completed node IDs |
| kdap_userid | Lookup | Link to systemuser |

### kdap_gateapproval

| Column | Type | Description |
|--------|------|-------------|
| kdap_approvalid | GUID | Primary key |
| kdap_sessionid | Lookup | Link to session |
| kdap_gateid | String | Gate node ID |
| kdap_status | Choice | pending/approved/rejected |
| kdap_approvedby | Lookup | Link to systemuser |
| kdap_approvedat | DateTime | Approval timestamp |
| kdap_comments | Multiline | Approval comments |

---

## Power Automate Flow Definitions

### Flow: KDAP-Get-Decision-Node-Data

**Purpose:** Generate decision node card data

**Input:**
- sessionId (string)
- nodeId (string)

**Actions:**
```yaml
- Get session from Dataverse
- Get workflow definition
- Find node by ID
- Build options array from node.options
- Calculate context from previous decisions
- Return:
    workflowId: workflow.id
    workflowName: workflow.name
    sessionId: session.kdap_sessionid
    nodeId: node.id
    decisionLabel: node.label
    decisionDescription: node.description
    options: mapped options array
    showOptionCards: length(options) <= 4
    contextSummary: built from session.decisions
```

### Flow: KDAP-Execute-Agent-Action

**Purpose:** Execute an agent action and track status

**Input:**
- sessionId (string)
- nodeId (string)
- actionType (string)

**Actions:**
```yaml
- Get session and node
- Determine agent endpoint based on node.agent
- Call appropriate Azure Function:
    ANL: kdap-anl-{capability}
    AUD: kdap-aud-{capability}
    CHA: kdap-cha-{capability}
    PRF: kdap-prf-{capability}
- Store result in session
- Update session.completednodes
- Return action result with metrics
```

---

## Card Action Handlers

### Action: startWorkflow

```javascript
{
  "action": "startWorkflow",
  "workflowId": "mpa-budget-optimization"
}
```

**Handler:**
1. Create new session in Dataverse
2. Initialize session with workflow start node
3. Generate first node card
4. Return card to user

### Action: confirmDecision

```javascript
{
  "action": "confirmDecision",
  "workflowId": "mpa-budget-optimization",
  "nodeId": "decision-reallocation",
  "sessionId": "abc-123",
  "selectedOption": "yes"
}
```

**Handler:**
1. Validate session exists and is active
2. Record decision: `session.decisions[nodeId] = selectedOption`
3. Find target node from option.targetNodeId
4. Update session.currentnodeid
5. Generate next node card

### Action: approve

```javascript
{
  "action": "approve",
  "workflowId": "mpa-budget-optimization",
  "nodeId": "human-review",
  "sessionId": "abc-123",
  "gateId": "gate-human-review",
  "approvalComments": "Approved with budget cap of $50k"
}
```

**Handler:**
1. Create approval record in kdap_gateapproval
2. Update session to move past gate
3. Execute any pending actions gated on approval
4. Generate next node card

---

## Environment Variables

Configure these in Power Platform environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `KDAP_BaseUrl` | Web app base URL | `https://kdap.contoso.com` |
| `KDAP_AzureFunctionUrl` | Azure Functions base | `https://kdap-func.azurewebsites.net` |
| `KDAP_AzureFunctionKey` | Function auth key | `***` |
| `KDAP_DefaultTimeout` | Action timeout (ms) | `30000` |

---

## Error Handling

### Card Rendering Errors

If card data generation fails:

```yaml
Condition: cardData is null
Actions:
  - Send message: "I encountered an issue loading the workflow. Let me try again."
  - Retry flow with exponential backoff
  - If retry fails after 3 attempts:
    - Send message: "I'm having trouble with this workflow. Please try again later or contact support."
    - Log error to Application Insights
```

### Session Recovery

If session is corrupted or lost:

```yaml
Condition: session.status = 'error' OR session is null
Actions:
  - Send message: "It looks like your session was interrupted. Would you like to:"
  - Show options:
    - "Start fresh" -> Create new session
    - "Try to recover" -> Attempt to restore from last checkpoint
```

---

## Testing Checklist

### Card Rendering
- [ ] All templates render without errors
- [ ] Data binding works for all variables
- [ ] Conditional sections show/hide correctly
- [ ] Actions submit correct data

### Flow Integration
- [ ] Topics trigger on correct phrases
- [ ] Flows execute without timeout
- [ ] Dataverse operations succeed
- [ ] Error handling catches failures

### User Experience
- [ ] Progress accurately reflects completion
- [ ] Back navigation works correctly
- [ ] Gate approvals are recorded
- [ ] Completion summary is accurate

---

## Sample Copilot Topic Configuration

### Topic: Budget Optimization Workflow

**Name:** `KDAP_BudgetOptimization`

**Description:** Guide users through budget optimization decisions

**Trigger phrases:**
- optimize my budget
- reallocate spending
- budget optimization workflow
- help with media budget

**Nodes:**

```
[Trigger] → [Message: "I'll help you optimize your media budget allocation."]
           ↓
[Call Flow: KDAP-Generate-Adaptive-Card]
  - cardType: "workflow-selector"
  - filter: "budget-optimization"
           ↓
[Display Adaptive Card]
           ↓
[Wait for User Response]
           ↓
[Branch on Response.action]
  ├─ "startWorkflow" → [Call Flow: KDAP-Create-Session] → [Show First Node]
  ├─ "resumeSession" → [Call Flow: KDAP-Load-Session] → [Show Current Node]
  └─ Other → [Message: "Please select an option to continue."] → [Loop]
```

---

## Deployment Steps

1. **Import Adaptive Card Templates**
   - Upload JSON files to SharePoint or Dataverse
   - Register template IDs in environment config

2. **Create Power Automate Flows**
   - Import flow definitions from solution
   - Configure connection references
   - Set environment variables

3. **Configure Copilot Studio**
   - Create topics for each workflow entry point
   - Link flows to topic actions
   - Test conversation paths

4. **Deploy to Channels**
   - Teams integration
   - Web chat widget
   - SharePoint embedding

---

## Troubleshooting

### Cards Not Rendering

**Symptom:** Blank or broken card display

**Causes:**
- Invalid JSON in template
- Missing required data fields
- Unsupported Adaptive Card version

**Solution:**
1. Validate template at https://adaptivecards.io/designer/
2. Check all `${variable}` references have data
3. Ensure version is 1.5 or lower for Copilot compatibility

### Actions Not Submitting

**Symptom:** Clicking buttons does nothing

**Causes:**
- Missing action handler in Copilot
- Incorrect data payload format
- Flow connection errors

**Solution:**
1. Verify topic handles the action type
2. Check flow trigger conditions
3. Review flow run history for errors

### Session State Lost

**Symptom:** Workflow resets unexpectedly

**Causes:**
- Session timeout
- Dataverse connection failure
- Concurrent modification

**Solution:**
1. Increase session timeout in environment config
2. Add retry logic to Dataverse operations
3. Implement optimistic locking on session updates
