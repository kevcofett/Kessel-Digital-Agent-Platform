# MPA v6.0 COMPLETE TOPIC CREATION GUIDE

**Purpose:** Every topic, every trigger, every node - with required/optional status and impact analysis  
**Date:** January 19, 2026  
**Total Topics:** 21 topics across 7 agents

---

# EXECUTIVE SUMMARY

## Topic Counts by Agent

| Agent | Required Topics | Optional Topics | Total |
|-------|-----------------|-----------------|-------|
| ORC (Orchestrator) | 8 | 2 | 10 |
| ANL (Analytics) | 2 | 2 | 4 |
| AUD (Audience) | 2 | 2 | 4 |
| CHA (Channel) | 2 | 1 | 3 |
| SPO (Supply Path) | 2 | 1 | 3 |
| DOC (Document) | 2 | 1 | 3 |
| PRF (Performance) | 2 | 1 | 3 |
| **TOTAL** | **20** | **10** | **30** |

## Creation Order (CRITICAL)

You MUST create topics in this order:

1. **Phase 1:** Create ALL 7 agents first (no topics yet)
2. **Phase 2:** Publish ALL 7 agents
3. **Phase 3:** Enable Agent Transfers in ORC Settings
4. **Phase 4:** Add all 6 specialists to ORC's transfer list
5. **Phase 5:** Create specialist agent topics (Greeting + Fallback for each)
6. **Phase 6:** Publish all specialists again
7. **Phase 7:** Create ORC topics (including routing topics)
8. **Phase 8:** Configure routing redirects in ORC topics
9. **Phase 9:** Final publish of ORC

**WHY THIS ORDER?** You cannot redirect to an agent that doesn't exist yet. Create all agents first, then configure routing.

---

# PART 1: ORC (ORCHESTRATOR) TOPICS

**Agent Name:** `MPA Orchestrator Agent`  
**This is the PRIMARY user-facing agent**

---

## ORC TOPIC 1: Greeting ⭐ REQUIRED

### Impact if NOT Created
- Users get generic/no welcome message
- No guidance on what the agent can do
- Poor first impression
- **Severity: HIGH** - Create this first

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Greeting` |
| Display name | `Greeting` |
| Status | On |

### Trigger Phrases (Add ALL of these)
```
Hello
Hi
Hey
Good morning
Good afternoon
Good evening
Start
Begin
Help me plan media
I need help with media planning
Get started
Let's begin
```

### Nodes to Create

**Node 1: Send a message**
1. Click **+ Add node** → **Send a message**
2. Paste this message:

```
Welcome to the Media Planning Agent! I'm your Orchestrator and will guide you through our 10-step media planning workflow.

I can help you with:
- Budget projections and analytics
- Audience strategy and targeting
- Channel selection and mix
- Programmatic optimization
- Document generation
- Performance monitoring

What would you like to work on today? Or shall we start from the beginning with Step 1?
```

3. Click **Save**

---

## ORC TOPIC 2: Route_to_ANL ⭐ REQUIRED

### Impact if NOT Created
- Analytics requests won't route to specialist
- Budget projections, ROI calculations handled poorly by ORC
- **Severity: CRITICAL** - Core routing functionality

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Route_to_ANL` |
| Display name | `Route to Analytics` |
| Status | On |

### Trigger Phrases (Add ALL of these)
```
Calculate budget
Budget projection
Project performance
Forecast results
ROI analysis
ROI calculation
Calculate ROI
Marginal return
Marginal returns
Scenario comparison
Scenario analysis
What if analysis
Statistical analysis
Budget optimization
Diminishing returns
Confidence interval
Bayesian analysis
How much should I spend
What results can I expect
```

### Nodes to Create

**Node 1: Send a message**
1. Click **+ Add node** → **Send a message**
2. Message: `I'll connect you with the Analytics Agent for this request.`

**Node 2: Redirect to agent**
1. Click **+ Add node** → **Topic management** → **Transfer conversation**
2. Select: **Transfer to another copilot**
3. Choose: `MPA Analytics Agent`

4. Click **Save**

---

## ORC TOPIC 3: Route_to_AUD ⭐ REQUIRED

### Impact if NOT Created
- Audience/targeting questions not routed
- LTV, segmentation handled poorly
- **Severity: CRITICAL** - Core routing functionality

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Route_to_AUD` |
| Display name | `Route to Audience` |
| Status | On |

### Trigger Phrases
```
Define audience
Segment customers
Target audience
Who should I target
Customer persona
Personas
LTV calculation
Customer lifetime value
Lifetime value
Journey mapping
Customer journey
Audience strategy
Propensity model
Propensity scoring
Identity resolution
Household targeting
Audience sizing
How many customers
Who are my customers
```

### Nodes to Create

**Node 1: Send a message**
- Message: `I'll connect you with the Audience Agent for this request.`

**Node 2: Transfer conversation**
- Transfer to: `MPA Audience Agent`

---

## ORC TOPIC 4: Route_to_CHA ⭐ REQUIRED

### Impact if NOT Created
- Channel selection questions not routed
- Media mix handled poorly
- **Severity: CRITICAL** - Core routing functionality

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Route_to_CHA` |
| Display name | `Route to Channel` |
| Status | On |

### Trigger Phrases
```
Which channels
Channel selection
Select channels
Media mix
Channel allocation
Allocate budget to channels
CTV advertising
CTV strategy
Connected TV
Retail media
Social media budget
Channel strategy
Brand vs performance
Media plan
Where should I advertise
Best channels
Channel recommendation
Emerging channels
DOOH
Digital out of home
```

### Nodes to Create

**Node 1: Send a message**
- Message: `I'll connect you with the Channel Agent for this request.`

**Node 2: Transfer conversation**
- Transfer to: `MPA Channel Agent`

---

## ORC TOPIC 5: Route_to_SPO ⭐ REQUIRED

### Impact if NOT Created
- Programmatic questions not routed
- Fee analysis, partner evaluation handled poorly
- **Severity: CRITICAL** - Core routing functionality

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Route_to_SPO` |
| Display name | `Route to Supply Path` |
| Status | On |

### Trigger Phrases
```
Programmatic optimization
Supply path
Supply path optimization
DSP evaluation
DSP analysis
SSP analysis
Fee transparency
Partner fees
Tech fees
Working media ratio
Working media percentage
NBI calculation
Net bidder impact
Programmatic fees
Ad tech fees
Hidden fees
Fee waterfall
Partner evaluation
Evaluate DSP
Evaluate SSP
```

### Nodes to Create

**Node 1: Send a message**
- Message: `I'll connect you with the Supply Path Agent for this request.`

**Node 2: Transfer conversation**
- Transfer to: `MPA Supply Path Agent`

---

## ORC TOPIC 6: Route_to_DOC ⭐ REQUIRED

### Impact if NOT Created
- Document generation not routed
- Briefs, reports handled poorly
- **Severity: CRITICAL** - Core routing functionality

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Route_to_DOC` |
| Display name | `Route to Document` |
| Status | On |

### Trigger Phrases
```
Generate document
Create document
Create brief
Media brief
Export report
Executive summary
Create report
Document export
Channel plan document
Budget rationale
Download plan
Generate brief
Make a brief
Write a brief
Export to Word
Export to PDF
Create presentation
Summary document
```

### Nodes to Create

**Node 1: Send a message**
- Message: `I'll connect you with the Document Agent for this request.`

**Node 2: Transfer conversation**
- Transfer to: `MPA Document Agent`

---

## ORC TOPIC 7: Route_to_PRF ⭐ REQUIRED

### Impact if NOT Created
- Performance analysis not routed
- Attribution, anomaly detection handled poorly
- **Severity: CRITICAL** - Core routing functionality

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Route_to_PRF` |
| Display name | `Route to Performance` |
| Status | On |

### Trigger Phrases
```
Campaign performance
Analyze performance
Performance analysis
Attribution report
Attribution analysis
Detect anomalies
Anomaly detection
Something looks wrong
Performance dropped
Optimization recommendations
Optimize campaign
Measure incrementality
Incrementality test
Incrementality analysis
What's performing well
Campaign results
Why did results drop
Performance report
MTA analysis
MMM analysis
```

### Nodes to Create

**Node 1: Send a message**
- Message: `I'll connect you with the Performance Agent for this request.`

**Node 2: Transfer conversation**
- Transfer to: `MPA Performance Agent`

---

## ORC TOPIC 8: Fallback ⭐ REQUIRED

### Impact if NOT Created
- Unrecognized messages get no response
- Poor user experience
- **Severity: HIGH** - Essential for error handling

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Fallback` |
| Display name | `Fallback` |
| Status | On |
| Trigger | **On Unrecognized** (system trigger, not phrases) |

### How to Create Fallback Topic
1. Go to **Topics** tab
2. Look for existing **Fallback** topic (may already exist)
3. If exists, click to edit it
4. If not, click **+ New topic** → **From blank**
5. Name it `Fallback`
6. In trigger section, select **On Unrecognized** option

### Nodes to Create

**Node 1: Send a message**
- Message:
```
I'm not sure I understood that request. I can help you with:

- Budget projections and analytics (try: "calculate budget")
- Audience strategy (try: "who should I target")
- Channel selection (try: "which channels")
- Programmatic optimization (try: "analyze fees")
- Document generation (try: "create brief")
- Performance analysis (try: "how is my campaign performing")

Could you please rephrase your request or choose one of these areas?
```

---

## ORC TOPIC 9: Workflow_Status 📋 OPTIONAL

### Impact if NOT Created
- Users can't check their progress
- No visibility into 10-step workflow position
- **Severity: MEDIUM** - Nice to have, not essential for MVP

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Workflow_Status` |
| Display name | `Workflow Status` |
| Status | On |

### Trigger Phrases
```
Where am I
Current step
Workflow status
What's next
Show progress
My progress
Which step
How far along
```

### Nodes to Create

**Node 1: Send a message**
- Message:
```
The MPA workflow has 10 steps across 4 phases:

**Discovery (Steps 1-3)**
- Step 1: Welcome and context
- Step 2: Business objectives
- Step 3: Budget and timeline

**Audience Strategy (Steps 4-5)**
- Step 4: Audience definition
- Step 5: Targeting approach

**Channel Strategy (Steps 6-7)**
- Step 6: Channel selection
- Step 7: Budget allocation

**Execution Planning (Steps 8-10)**
- Step 8: Performance framework
- Step 9: Measurement approach
- Step 10: Final review and documentation

What would you like to work on?
```

---

## ORC TOPIC 10: Help 📋 OPTIONAL

### Impact if NOT Created
- No dedicated help topic
- Users rely on Greeting for guidance
- **Severity: LOW** - Greeting covers most of this

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Help` |
| Display name | `Help` |
| Status | On |

### Trigger Phrases
```
Help
Help me
What can you do
What do you do
How does this work
Instructions
Guide me
```

### Nodes to Create

**Node 1: Send a message**
- Message:
```
I'm the Media Planning Agent Orchestrator. I coordinate between specialist agents:

**Analytics (ANL):** Budget projections, ROI, scenarios
**Audience (AUD):** Segmentation, LTV, targeting
**Channel (CHA):** Media mix, channel selection
**Supply Path (SPO):** Programmatic optimization, fees
**Document (DOC):** Briefs, reports, exports
**Performance (PRF):** Attribution, anomaly detection

Just tell me what you need, and I'll connect you with the right specialist!
```

---

# PART 2: ANL (ANALYTICS) TOPICS

**Agent Name:** `MPA Analytics Agent`

---

## ANL TOPIC 1: Greeting ⭐ REQUIRED

### Impact if NOT Created
- No welcome when user arrives at ANL
- Disorienting experience after transfer
- **Severity: HIGH**

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Greeting` |
| Display name | `Greeting` |
| Status | On |

### Trigger Phrases
```
Hello
Hi
Hey
Start
Help with analytics
Analytics help
```

### Nodes to Create

**Node 1: Send a message**
```
I'm the Analytics Agent. I specialize in quantitative analysis for media planning:

- Budget projections with confidence intervals
- ROI and marginal return calculations
- Scenario comparisons (A vs B vs C)
- Statistical analysis and Bayesian inference
- Diminishing returns curves

What would you like to analyze?
```

---

## ANL TOPIC 2: Fallback ⭐ REQUIRED

### Impact if NOT Created
- Off-domain questions get stuck in ANL
- No route back to ORC
- **Severity: CRITICAL** - Essential for multi-agent flow

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Fallback` |
| Display name | `Fallback` |
| Status | On |
| Trigger | **On Unrecognized** |

### Nodes to Create

**Node 1: Send a message**
- Message: `That's outside my analytics specialty. Let me route you back to the Orchestrator for assistance.`

**Node 2: Transfer conversation**
- Transfer to: `MPA Orchestrator Agent`

---

## ANL TOPIC 3: CalculateProjection 📋 OPTIONAL

### Impact if NOT Created
- Projections handled by generative AI only
- No structured data collection
- **Severity: MEDIUM** - Agent instructions can handle this

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `CalculateProjection` |
| Display name | `Calculate Projection` |
| Status | On |

### Trigger Phrases
```
Calculate projection
Project results
Forecast performance
What results can I expect
Estimate outcomes
```

### Nodes to Create

**Node 1: Ask a question**
- Question: `What is your total budget?`
- Save to variable: `Topic.Budget`
- Entity: **Number**

**Node 2: Ask a question**
- Question: `What timeframe are you planning for? (e.g., Q2 2026, 3 months)`
- Save to variable: `Topic.Timeframe`
- Entity: **Open-ended**

**Node 3: Ask a question**
- Question: `What channels are you considering? (e.g., Search, Social, CTV)`
- Save to variable: `Topic.Channels`
- Entity: **Open-ended**

**Node 4: Send a message**
```
I'll calculate projections for:
- Budget: {Topic.Budget}
- Timeframe: {Topic.Timeframe}
- Channels: {Topic.Channels}

Let me analyze this and provide projections with confidence intervals...
```

*(The agent's instructions and KB will guide the actual analysis)*

---

## ANL TOPIC 4: CompareScenarios 📋 OPTIONAL

### Impact if NOT Created
- Scenario comparison handled by generative AI
- No structured scenario input
- **Severity: LOW** - Nice to have

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `CompareScenarios` |
| Display name | `Compare Scenarios` |
| Status | On |

### Trigger Phrases
```
Compare scenarios
Which option is better
Scenario A vs B
What if analysis
Compare options
```

### Nodes to Create

**Node 1: Ask a question**
- Question: `Describe Scenario A:`
- Save to: `Topic.ScenarioA`

**Node 2: Ask a question**
- Question: `Describe Scenario B:`
- Save to: `Topic.ScenarioB`

**Node 3: Send a message**
```
I'll compare these scenarios and recommend the optimal choice based on expected performance, risk, and efficiency metrics.
```

---

# PART 3: AUD (AUDIENCE) TOPICS

**Agent Name:** `MPA Audience Agent`

---

## AUD TOPIC 1: Greeting ⭐ REQUIRED

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Greeting` |
| Display name | `Greeting` |
| Status | On |

### Trigger Phrases
```
Hello
Hi
Hey
Help with audience
Audience help
```

### Nodes to Create

**Node 1: Send a message**
```
I'm the Audience Agent. I specialize in:

- Audience segmentation and sizing
- Customer lifetime value (LTV) modeling
- Propensity scoring and prediction
- Journey mapping and orchestration
- Identity resolution

What audience challenge can I help with?
```

---

## AUD TOPIC 2: Fallback ⭐ REQUIRED

### Basic Settings
| Field | Value |
|-------|-------|
| Name | `Fallback` |
| Status | On |
| Trigger | **On Unrecognized** |

### Nodes to Create

**Node 1: Send a message**
- Message: `That's outside my audience specialty. Let me route you back to the Orchestrator.`

**Node 2: Transfer conversation**
- Transfer to: `MPA Orchestrator Agent`

---

## AUD TOPIC 3: SegmentAudience 📋 OPTIONAL

### Trigger Phrases
```
Segment audience
Define segments
Create segments
Who should I target
Audience segments
```

### Nodes
- Question: "What is your product or service?"
- Question: "What data sources do you have?"
- Message: "I'll help you define audience segments..."

---

## AUD TOPIC 4: CalculateLTV 📋 OPTIONAL

### Trigger Phrases
```
Calculate LTV
Customer lifetime value
Value segments
High value customers
```

### Nodes
- Question: "What is your average order value?"
- Question: "What is your typical customer retention period?"
- Message: "I'll calculate LTV segments..."

---

# PART 4: CHA (CHANNEL) TOPICS

**Agent Name:** `MPA Channel Agent`

---

## CHA TOPIC 1: Greeting ⭐ REQUIRED

### Trigger Phrases
```
Hello
Hi
Hey
Help with channels
Channel help
```

### Message
```
I'm the Channel Agent. I specialize in:

- Channel selection and media mix
- Budget allocation across channels
- Emerging channel evaluation (CTV, retail media)
- Brand vs performance balance

What channel decision can I help with?
```

---

## CHA TOPIC 2: Fallback ⭐ REQUIRED

### Trigger | **On Unrecognized**

### Nodes
- Message: `That's outside my channel specialty. Let me route you back to the Orchestrator.`
- Transfer to: `MPA Orchestrator Agent`

---

## CHA TOPIC 3: SelectChannels 📋 OPTIONAL

### Trigger Phrases
```
Select channels
Which channels
Recommend channels
Best channels for my campaign
```

### Nodes
- Question: "What are your primary objectives? (awareness, consideration, conversion)"
- Question: "What is your total budget?"
- Message: "I'll recommend an optimal channel mix..."

---

# PART 5: SPO (SUPPLY PATH) TOPICS

**Agent Name:** `MPA Supply Path Agent`

---

## SPO TOPIC 1: Greeting ⭐ REQUIRED

### Trigger Phrases
```
Hello
Hi
Hey
Help with programmatic
Supply path help
```

### Message
```
I'm the Supply Path Agent. I specialize in:

- Supply path optimization and efficiency
- Fee transparency and analysis
- DSP/SSP partner evaluation
- Net bidder impact (NBI) calculation
- Working media ratio optimization

What programmatic challenge can I help with?
```

---

## SPO TOPIC 2: Fallback ⭐ REQUIRED

### Trigger | **On Unrecognized**

### Nodes
- Message: `That's outside my supply path specialty. Let me route you back to the Orchestrator.`
- Transfer to: `MPA Orchestrator Agent`

---

## SPO TOPIC 3: AnalyzeFees 📋 OPTIONAL

### Trigger Phrases
```
Analyze fees
Fee transparency
Fee breakdown
How much am I losing to fees
```

### Nodes
- Question: "What is your current programmatic spend?"
- Question: "Which DSPs and SSPs are you using?"
- Message: "I'll analyze your fee structure and working media ratio..."

---

# PART 6: DOC (DOCUMENT) TOPICS

**Agent Name:** `MPA Document Agent`

---

## DOC TOPIC 1: Greeting ⭐ REQUIRED

### Trigger Phrases
```
Hello
Hi
Hey
Help with documents
Document help
```

### Message
```
I'm the Document Agent. I can generate:

- Media briefs
- Executive summaries
- Channel plans
- Budget rationales
- Performance reports
- Optimization reports

What document would you like to create?
```

---

## DOC TOPIC 2: Fallback ⭐ REQUIRED

### Trigger | **On Unrecognized**

### Nodes
- Message: `That's outside my document specialty. Let me route you back to the Orchestrator.`
- Transfer to: `MPA Orchestrator Agent`

---

## DOC TOPIC 3: GenerateDocument 📋 OPTIONAL

### Trigger Phrases
```
Generate document
Create document
Make a brief
Write a report
```

### Nodes
- Question: "What type of document? (media brief, executive summary, channel plan, budget rationale, performance report)"
- Question: "Who is the audience? (executive, team, client)"
- Message: "I'll generate the document based on your session data..."

---

# PART 7: PRF (PERFORMANCE) TOPICS

**Agent Name:** `MPA Performance Agent`

---

## PRF TOPIC 1: Greeting ⭐ REQUIRED

### Trigger Phrases
```
Hello
Hi
Hey
Help with performance
Performance help
```

### Message
```
I'm the Performance Agent. I specialize in:

- Campaign performance analysis
- Attribution modeling (MTA, MMM)
- Anomaly detection and diagnosis
- Incrementality measurement
- Optimization recommendations

What would you like to analyze?
```

---

## PRF TOPIC 2: Fallback ⭐ REQUIRED

### Trigger | **On Unrecognized**

### Nodes
- Message: `That's outside my performance specialty. Let me route you back to the Orchestrator.`
- Transfer to: `MPA Orchestrator Agent`

---

## PRF TOPIC 3: DetectAnomalies 📋 OPTIONAL

### Trigger Phrases
```
Detect anomalies
Something looks wrong
Performance dropped
Why did results change
```

### Nodes
- Question: "What metric changed unexpectedly?"
- Question: "When did you first notice the change?"
- Message: "I'll analyze the data for anomalies..."

---

# CREATION CHECKLIST

## Phase 1: Create All Agents (No Topics Yet)
- [ ] ORC - MPA Orchestrator Agent
- [ ] ANL - MPA Analytics Agent
- [ ] AUD - MPA Audience Agent
- [ ] CHA - MPA Channel Agent
- [ ] SPO - MPA Supply Path Agent
- [ ] DOC - MPA Document Agent
- [ ] PRF - MPA Performance Agent

## Phase 2: Publish All Agents
- [ ] Publish ORC
- [ ] Publish ANL
- [ ] Publish AUD
- [ ] Publish CHA
- [ ] Publish SPO
- [ ] Publish DOC
- [ ] Publish PRF

## Phase 3: Configure Agent Transfers
- [ ] ORC Settings → Agent transfers → Enable
- [ ] Add ANL to ORC transfer list
- [ ] Add AUD to ORC transfer list
- [ ] Add CHA to ORC transfer list
- [ ] Add SPO to ORC transfer list
- [ ] Add DOC to ORC transfer list
- [ ] Add PRF to ORC transfer list

## Phase 4: Create Specialist Topics (Required Only)

### ANL Topics
- [ ] ANL Greeting
- [ ] ANL Fallback (with transfer to ORC)

### AUD Topics
- [ ] AUD Greeting
- [ ] AUD Fallback (with transfer to ORC)

### CHA Topics
- [ ] CHA Greeting
- [ ] CHA Fallback (with transfer to ORC)

### SPO Topics
- [ ] SPO Greeting
- [ ] SPO Fallback (with transfer to ORC)

### DOC Topics
- [ ] DOC Greeting
- [ ] DOC Fallback (with transfer to ORC)

### PRF Topics
- [ ] PRF Greeting
- [ ] PRF Fallback (with transfer to ORC)

## Phase 5: Republish All Specialists
- [ ] Publish ANL
- [ ] Publish AUD
- [ ] Publish CHA
- [ ] Publish SPO
- [ ] Publish DOC
- [ ] Publish PRF

## Phase 6: Create ORC Topics (Required Only)
- [ ] ORC Greeting
- [ ] ORC Route_to_ANL (with transfer to ANL)
- [ ] ORC Route_to_AUD (with transfer to AUD)
- [ ] ORC Route_to_CHA (with transfer to CHA)
- [ ] ORC Route_to_SPO (with transfer to SPO)
- [ ] ORC Route_to_DOC (with transfer to DOC)
- [ ] ORC Route_to_PRF (with transfer to PRF)
- [ ] ORC Fallback

## Phase 7: Final Publish
- [ ] Publish ORC

## Phase 8: Testing
- [ ] Test ORC Greeting
- [ ] Test each routing topic
- [ ] Test specialist fallbacks
- [ ] End-to-end workflow test

---

# STEP-BY-STEP: HOW TO CREATE A TOPIC

## Generic Topic Creation Steps

1. **Open the agent** in Copilot Studio
2. Click **Topics** tab (left navigation)
3. Click **+ New topic** → **From blank**
4. Enter **Name** (internal identifier)
5. Enter **Display name** (what appears in UI)
6. Add **Trigger phrases** (one per line, press Enter after each)
7. Click **+ Add node** to add nodes
8. **Save** the topic
9. **Publish** the agent when all topics are done

## How to Add a Message Node

1. Click **+ Add node** below the trigger
2. Select **Send a message**
3. Type or paste the message text
4. Click outside the box to confirm

## How to Add a Transfer Node (Agent Redirect)

1. Click **+ Add node**
2. Select **Topic management**
3. Select **Transfer conversation**
4. Choose **Transfer to another copilot**
5. Select the target agent from dropdown
6. Save

## How to Add a Question Node

1. Click **+ Add node**
2. Select **Ask a question**
3. Enter the question text
4. Select **Identify** → Choose entity type:
   - **Number** for numeric inputs
   - **Open-ended** for free text
   - **Multiple choice** for options
5. Set **Save response as** → Create variable (e.g., `Topic.Budget`)
6. Save

---

# TROUBLESHOOTING

## "Agent not found in transfer list"
- Ensure target agent is published
- Go to Settings → Agent transfers → Add the agent

## "Topic triggers not working"
- Check for typos in trigger phrases
- Ensure topic status is "On"
- Republish the agent

## "Fallback not triggering"
- Ensure it's set to "On Unrecognized" trigger
- Check no other topic has overlapping triggers

## "Circular routing"
- Don't route from ORC → Specialist → ORC indefinitely
- Specialist fallback should only trigger for off-domain questions

---

**Document Version:** 1.0  
**Total Required Topics:** 20  
**Total Optional Topics:** 10  
**Estimated Creation Time:** 60-90 minutes for required topics
