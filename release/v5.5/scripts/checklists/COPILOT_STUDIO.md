# Copilot Studio Configuration Checklist

Quick reference for configuring the Media Planning Agent in Copilot Studio.

**Instructions file:** `release/v5.5/agents/mpa/base/copilot/MPA_v55_Instructions_Uplift.txt`

---

## Prerequisites

- [ ] All Power Automate flows built and tested
- [ ] SharePoint KB library created and populated
- [ ] Dataverse tables created with seed data
- [ ] Azure Functions deployed and accessible

---

## Agent Details

| Field | Value |
|-------|-------|
| Environment | Aragorn AI |
| Agent ID | copilots_header_a2740 |
| Agent Name | Media Planning Agent |
| Web Chat URL | See environment.json |

---

## Step 1: Create/Update Agent

- [ ] Navigate to Copilot Studio
- [ ] Select Aragorn AI environment
- [ ] Create new agent OR edit existing "Media Planning Agent"
- [ ] Set display name: `Media Planning Agent`
- [ ] Set description: `AI-powered media planning assistant`

---

## Step 2: Configure Instructions

- [ ] Open agent settings → Instructions
- [ ] Copy content from `MPA_v55_Instructions_Uplift.txt`
- [ ] Paste into instructions field
- [ ] Save changes

**Key instruction sections:**
- Core Philosophy and Role
- Communication Framework
- Diagnostic Checkpoint Process
- 10-Step Planning Flow
- Gate Requirements
- Data Priority Hierarchy
- Tool Usage Guidelines

---

## Step 3: Add Knowledge Sources

### SharePoint Knowledge Base

- [ ] Navigate to Knowledge → Add knowledge
- [ ] Select SharePoint
- [ ] Site URL: `https://kesseldigitalcom.sharepoint.com/sites/KesselDigital`
- [ ] Library: `MediaPlanningKB`
- [ ] Enable auto-refresh

### KB Files Expected (22 total)

| Category | Files |
|----------|-------|
| Strategic | AI_ADVERTISING_GUIDE, BRAND_PERFORMANCE_FRAMEWORK, MEASUREMENT_FRAMEWORK, FIRST_PARTY_DATA_STRATEGY, Strategic_Wisdom |
| Expert Lens | Audience_Strategy, Budget_Allocation, Channel_Mix, Measurement_Attribution |
| Implications | Audience_Targeting, Budget_Decisions, Channel_Shifts, Measurement_Choices, Timing_Pacing |
| Data Quality | Analytics_Engine, Confidence_Level_Framework, Data_Provenance_Framework, Gap_Detection_Playbook |
| Conversation | MPA_Conversation_Examples, MPA_Supporting_Instructions, Output_Templates |
| Channel | RETAIL_MEDIA_NETWORKS |

**Note:** Knowledge indexing may take up to 4 hours to complete.

---

## Step 4: Add Actions (Flows)

Connect each Power Automate flow as an action:

| Action Name | Flow | Input Mapping |
|-------------|------|---------------|
| Initialize Session | MPA Initialize Session | userId, clientId, vertical, objective |
| Process Media Brief | MPA Process Media Brief | sessionId, briefContent, idempotencyKey |
| Update Plan Data | MPA Update Plan Data | planId, sectionType, sectionData |
| Run Projections | MPA Run Projections | planId, channelMix |
| Validate Gate | MPA Validate Gate | planId, gateNumber |
| Generate Document | MPA Generate Document | planId, documentType |
| Get Plan Summary | MPA Get Plan Summary | planId |
| Search Benchmarks | MPA Search Benchmarks | vertical, channel, kpi |
| Calculate Gap | MPA Calculate Gap | planId |
| Calculate Budget | MPA Calculate Budget Allocation | totalBudget, channels, objective |

**For each action:**
- [ ] Click Actions → Add action
- [ ] Select Power Automate flow
- [ ] Map input parameters
- [ ] Set appropriate descriptions for Copilot to understand when to use

---

## Step 5: Configure Topics

### System Topics

- [ ] Greeting - Customize welcome message
- [ ] Goodbye - Customize farewell
- [ ] Escalate - Configure escalation path
- [ ] Fallback - Handle unknown inputs

### Custom Topics (Optional)

| Topic | Trigger | Purpose |
|-------|---------|---------|
| Start Planning | "create a media plan", "new campaign" | Initiate planning workflow |
| Check Status | "plan status", "where are we" | Show current progress |
| Generate Report | "create document", "export plan" | Trigger document generation |

---

## Step 6: Test Agent

### Basic Tests

- [ ] **Test 1:** "Hello, I'd like to create a media plan"
  - Expected: Professional greeting, asks for brief details

- [ ] **Test 2:** "What channels do you recommend for awareness?"
  - Expected: Uses KB to provide strategic guidance

- [ ] **Test 3:** Provide a complete brief and verify diagnostic checkpoint
  - Expected: Assesses brief quality, identifies gaps

### Action Tests

- [ ] **Test 4:** Verify Search Benchmarks action returns data
- [ ] **Test 5:** Verify document generation creates SharePoint file
- [ ] **Test 6:** Test gate validation with incomplete data

---

## Step 7: Publish

- [ ] Review all settings
- [ ] Test in preview mode
- [ ] Publish to production
- [ ] Verify webchat URL works

---

## Post-Configuration Verification

- [ ] Agent responds with correct persona (senior media strategist)
- [ ] Knowledge retrieval works (test with specific questions)
- [ ] All 10 actions connected and functional
- [ ] Session management working (conversations maintain context)
- [ ] Document generation produces valid Word files
- [ ] Error handling displays user-friendly messages

---

## Troubleshooting

### Knowledge not returning results
- Wait for indexing to complete (up to 4 hours)
- Verify SharePoint permissions
- Check library name matches exactly

### Actions failing
- Test individual flows in Power Automate first
- Check Azure Function connectivity
- Verify function key is correct

### Session issues
- Confirm session flow is connected
- Check Dataverse eap_session table exists
- Verify user context is being passed

---

## Maintenance

| Task | Frequency |
|------|-----------|
| Review conversation logs | Weekly |
| Update KB files | As needed |
| Check error logs | Daily |
| Test actions | After any flow changes |
| Review analytics | Monthly |
