# COPILOT STUDIO MANUAL CONFIGURATION GUIDE
# Complete Step-by-Step Instructions with Screenshots Description

**Created:** 2026-01-12
**Version:** 1.0
**Applies To:** MPA (Media Planning Agent) and CA (Consulting Agent)

---

## TABLE OF CONTENTS

1. [Prerequisites](#1-prerequisites)
2. [Accessing Copilot Studio](#2-accessing-copilot-studio)
3. [Creating a New Agent](#3-creating-a-new-agent)
4. [Configuring Agent Instructions](#4-configuring-agent-instructions)
5. [Connecting SharePoint Knowledge Base](#5-connecting-sharepoint-knowledge-base)
6. [Creating Global Variables](#6-creating-global-variables)
7. [Creating Topics - MPA](#7-creating-topics---mpa)
8. [Creating Topics - CA](#8-creating-topics---ca)
9. [Connecting Power Automate Flows](#9-connecting-power-automate-flows)
10. [Testing the Agent](#10-testing-the-agent)
11. [Publishing the Agent](#11-publishing-the-agent)
12. [Post-Publication Verification](#12-post-publication-verification)

---

## 1. PREREQUISITES

Before starting, ensure you have:

### Required Access
- [ ] Microsoft 365 account with Copilot Studio license
- [ ] Environment admin or maker permissions in Power Platform
- [ ] Access to the target SharePoint site (AgentKnowledgeBase library)
- [ ] Power Automate flows already deployed and enabled

### Required Files (from repository)
| Agent | Instructions File | Topics JSON |
|-------|------------------|-------------|
| MPA | `/release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt` | `/release/v5.5/agents/mpa/base/copilot/topics/MPA_Topics_Import.json` |
| CA | `/release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt` | `/release/v5.5/agents/ca/base/copilot/topics/CA_Topics_Import.json` |

### Verify Prerequisites
```
1. Open browser
2. Navigate to https://copilotstudio.microsoft.com
3. Sign in with your Microsoft 365 account
4. Verify you can see "Agents" in the left navigation
5. Verify correct environment is selected (top right dropdown)
```

---

## 2. ACCESSING COPILOT STUDIO

### Step 2.1: Navigate to Copilot Studio
```
Action: Open browser
URL: https://copilotstudio.microsoft.com
```

### Step 2.2: Select Environment
```
Location: Top-right corner of the screen
Action: Click on environment dropdown (shows current environment name)
Action: Select target environment:
  - For Personal: [Your development environment]
  - For Mastercard: [Mastercard production environment]
Wait: Page refreshes with selected environment
```

### Step 2.3: Verify Environment
```
Check: Environment name displayed in top-right matches your target
Check: "Agents" link visible in left navigation
Check: No error messages displayed
```

---

## 3. CREATING A NEW AGENT

### Step 3.1: Start Agent Creation
```
Location: Left navigation panel
Action: Click "Agents"
Action: Click "+ New agent" button (top of page)
```

### Step 3.2: Choose Creation Method
```
Screen: "Create an agent" dialog appears
Action: Click "Skip to configure" (bottom of dialog)
  - This bypasses the wizard and gives full control
```

### Step 3.3: Set Agent Name and Description

**For MPA:**
```
Field: Name
Value: Media Planning Agent

Field: Description
Value: AI-powered media planning assistant providing strategic guidance, industry benchmarks, channel recommendations, and comprehensive media plan documentation.

Field: Instructions
Value: [Leave empty - will configure in next section]

Action: Click "Create" button
Wait: Agent is created and opens in editor
```

**For CA:**
```
Field: Name
Value: Consulting Agent

Field: Description
Value: AI-powered strategic consulting assistant with 32+ frameworks for business analysis, competitive intelligence, market research, and strategic planning.

Field: Instructions
Value: [Leave empty - will configure in next section]

Action: Click "Create" button
Wait: Agent is created and opens in editor
```

---

## 4. CONFIGURING AGENT INSTRUCTIONS

### Step 4.1: Open Instructions Editor
```
Location: Agent editor screen
Action: Click "Settings" in top navigation bar
Action: Click "Agent" in left sidebar
Section: Look for "Instructions" text area
```

### Step 4.2: Copy Instructions from File

**For MPA:**
```
Action: Open file in text editor:
  /release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt

Action: Select ALL text (Ctrl+A or Cmd+A)
Action: Copy (Ctrl+C or Cmd+C)
```

**For CA:**
```
Action: Open file in text editor:
  /release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt

Action: Select ALL text (Ctrl+A or Cmd+A)
Action: Copy (Ctrl+C or Cmd+C)
```

### Step 4.3: Paste Instructions
```
Location: Copilot Studio > Settings > Agent > Instructions
Action: Click inside the Instructions text area
Action: Clear any existing text
Action: Paste (Ctrl+V or Cmd+V)
```

### Step 4.4: Verify Character Count
```
Location: Below the Instructions text area
Check: Character count displays (should be under 8,000)
  - MPA: ~7,500 characters expected
  - CA: ~7,200 characters expected

If OVER 8,000:
  - Do NOT save
  - Review instruction file for unnecessary content
  - Contact development team
```

### Step 4.5: Save Instructions
```
Action: Click "Save" button (top right of settings panel)
Wait: "Saved successfully" message appears
Verify: Instructions persist after page refresh
```

---

## 5. CONNECTING SHAREPOINT KNOWLEDGE BASE

### Step 5.1: Navigate to Knowledge Settings
```
Location: Agent editor
Action: Click "Knowledge" in left sidebar
  - Or click "Knowledge" tab in top navigation
```

### Step 5.2: Add Knowledge Source
```
Action: Click "+ Add knowledge" button
Screen: "Add knowledge" dialog appears
```

### Step 5.3: Select SharePoint
```
Options displayed:
  - SharePoint
  - Dataverse
  - Public websites
  - Files

Action: Click "SharePoint"
```

### Step 5.4: Configure SharePoint Connection

**For MPA:**
```
Field: SharePoint site URL
Value: [Your SharePoint site URL]
  Example: https://[tenant].sharepoint.com/sites/AgentKnowledgeBase

Field: Document library
Value: AgentKnowledgeBase

Field: Folder path (if available)
Value: MPA

Action: Click "Add" or "Next"
```

**For CA:**
```
Field: SharePoint site URL
Value: [Your SharePoint site URL]
  Example: https://[tenant].sharepoint.com/sites/AgentKnowledgeBase

Field: Document library
Value: AgentKnowledgeBase

Field: Folder path (if available)
Value: CA

Action: Click "Add" or "Next"
```

### Step 5.5: Configure Search Settings
```
If advanced settings available:

Field: Maximum chunks to return
Value: 5

Field: Minimum confidence threshold
Value: 0.65

Field: Enable citations
Value: Yes (checked)

Action: Click "Save" or "Done"
```

### Step 5.6: Verify Knowledge Source
```
Location: Knowledge page
Check: SharePoint source appears in list
Check: Status shows "Active" or "Connected"
Check: File count matches expected:
  - MPA: 32 files
  - CA: 35 files

If file count is 0 or wrong:
  - Verify SharePoint folder has files
  - Check permissions on SharePoint library
  - Re-add knowledge source
```

---

## 6. CREATING GLOBAL VARIABLES

### Step 6.1: Navigate to Variables
```
Location: Agent editor
Action: Click "Settings" in top navigation
Action: Click "Variables" in left sidebar
  - Or look for "Global variables" section
```

### Step 6.2: Create Each Variable

**For MPA - Create these 6 variables:**

```
Variable 1:
  Action: Click "+ New variable"
  Name: Global.SessionID
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 2:
  Action: Click "+ New variable"
  Name: Global.Objective
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 3:
  Action: Click "+ New variable"
  Name: Global.Budget
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 4:
  Action: Click "+ New variable"
  Name: Global.Channels
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 5:
  Action: Click "+ New variable"
  Name: Global.CurrentStep
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 6:
  Action: Click "+ New variable"
  Name: Global.Vertical
  Type: String
  Default value: (leave empty)
  Action: Click "Save"
```

**For CA - Create these 6 variables:**

```
Variable 1:
  Action: Click "+ New variable"
  Name: Global.SessionID
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 2:
  Action: Click "+ New variable"
  Name: Global.AnalysisType
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 3:
  Action: Click "+ New variable"
  Name: Global.SelectedFramework
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 4:
  Action: Click "+ New variable"
  Name: Global.AnalysisDepth
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 5:
  Action: Click "+ New variable"
  Name: Global.Industry
  Type: String
  Default value: (leave empty)
  Action: Click "Save"

Variable 6:
  Action: Click "+ New variable"
  Name: Global.AnalysisComplete
  Type: Boolean
  Default value: false
  Action: Click "Save"
```

### Step 6.3: Verify Variables
```
Check: All 6 variables appear in the list
Check: Names match exactly (including "Global." prefix)
Check: Types are correct
```

---

## 7. CREATING TOPICS - MPA

### Overview
MPA requires 7 topics. Create each one following these detailed steps.

### Step 7.1: Navigate to Topics
```
Location: Agent editor
Action: Click "Topics" in left navigation
```

### Step 7.2: Create Topic - Greeting

```
Action: Click "+ New topic" → "From blank"

TRIGGER PHRASES:
Action: Click "Edit" next to "Trigger phrases"
Add these phrases (one per line, press Enter after each):
  hello
  hi
  hey
  start
  help
  what can you do
  good morning
  good afternoon
Action: Click "Save"

TOPIC NAME:
Field: Topic name (top of editor)
Value: Greeting

ADD MESSAGE NODE:
Action: Click "+" below the trigger
Action: Select "Send a message"
Message text:
  Hello! I'm the Media Planning Agent - your AI-powered media planning assistant.

  I can help you with:
  - Creating comprehensive media plans
  - Finding industry benchmarks (CPM, CTR, conversion rates)
  - Recommending channel mix based on your objectives
  - Budget allocation guidance
  - Performance validation

  What would you like to work on today?

Action: Click outside the message box to save

SAVE TOPIC:
Action: Click "Save" (top right)
```

### Step 7.3: Create Topic - Start Planning

```
Action: Click "+ New topic" → "From blank"

TRIGGER PHRASES:
Add these phrases:
  start planning
  new plan
  create plan
  begin planning
  start a media plan
  help me plan
  new media plan
  create a campaign

TOPIC NAME: Start Planning

ADD QUESTION NODE:
Action: Click "+" below trigger
Action: Select "Ask a question"
Question text: What is your primary campaign objective?
Question type: Multiple choice options
Options (add each):
  Brand Awareness - Maximize reach and impressions
  Consideration - Drive engagement and website visits
  Conversion - Generate leads or sales
  Retention - Re-engage existing customers
  I'm not sure - Help me decide
Save response as: Global.Objective

ADD MESSAGE NODE:
Action: Click "+" below question
Action: Select "Send a message"
Message text:
  Great! I'll help you create a media plan focused on {Global.Objective}.

  Step 1 of 10: Define Objectives ✓

  Now let's move to Step 2: Who is your target audience?

  Please describe:
  - Demographics (age, gender, location)
  - Interests or behaviors
  - Any existing customer data you have

SAVE: Click "Save"
```

### Step 7.4: Create Topic - Search Benchmarks

```
Action: Click "+ New topic" → "From blank"

TRIGGER PHRASES:
  benchmark
  benchmarks
  what's a typical CPM
  average CPM
  industry average
  what should I expect
  typical performance
  CTR benchmark
  conversion rate benchmark
  cost per click

TOPIC NAME: Search Benchmarks

ADD GENERATIVE ANSWERS NODE:
Action: Click "+" below trigger
Action: Select "Advanced" → "Generative answers"
  - Or look for "Search and summarize content"
Configure:
  Data source: SharePoint (select your connected source)
  Search query: {Activity.Text}
  
  If additional options:
    Require citation: Yes
    Max chunks: 5
    Min confidence: 0.65

ADD FALLBACK MESSAGE:
Action: Click "+" to add condition
Condition: If generative answer has no result
Then: Send message:
  Based on general industry data:

  **Display Advertising**
  - CPM: $2-12 depending on targeting
  - CTR: 0.05%-0.20%

  **CTV/Streaming**
  - CPM: $15-45 depending on inventory
  - Completion Rate: 85%-95%

  **Paid Social**
  - CPM: $6-25 depending on platform
  - CTR: 0.50%-2.00%

  **Paid Search**
  - CPC: $0.50-$5.00 depending on competition
  - CTR: 2%-6%

  Would you like more specific benchmarks for your industry?

SAVE: Click "Save"
```

### Step 7.5: Create Topic - Search Channels

```
Action: Click "+ New topic" → "From blank"

TRIGGER PHRASES:
  channel
  channels
  display advertising
  CTV
  connected TV
  paid social
  social media advertising
  paid search
  SEM
  programmatic
  which channels
  recommend channels

TOPIC NAME: Search Channels

ADD GENERATIVE ANSWERS NODE:
Data source: SharePoint
Search query: channel {Activity.Text}
Require citation: Yes

ADD FALLBACK MESSAGE (if no result):
  Here's an overview of major advertising channels:

  **Display/Programmatic**
  Best for: Awareness, retargeting
  Strengths: Scale, targeting options, cost-efficient reach

  **CTV/OTT**
  Best for: Awareness, consideration
  Strengths: Premium environment, high completion rates

  **Paid Social**
  Best for: Awareness, consideration, conversion
  Strengths: Precise targeting, engagement

  **Paid Search**
  Best for: Conversion, consideration
  Strengths: High intent, measurable

  Which channel would you like to explore?

SAVE: Click "Save"
```

### Step 7.6: Create Topic - Generate Document

```
Action: Click "+ New topic" → "From blank"

TRIGGER PHRASES:
  generate document
  create document
  download plan
  export plan
  give me a document
  create my plan
  generate plan
  save plan
  download

TOPIC NAME: Generate Document

ADD CONDITION NODE:
Action: Click "+" → "Add a condition"
Condition: Global.Objective is not empty
  If true: Continue to flow call
  If false: Send message asking for objective

ADD MESSAGE (if no objective):
  I don't have enough information to generate a plan yet. 
  Let's start by defining your campaign objective.
  What is your primary goal: Awareness, Consideration, Conversion, or Retention?

ADD CALL FLOW (if objective exists):
Action: Click "+" → "Call an action" → "Cloud flow"
Select flow: MPA_GenerateDocument
Map inputs:
  sessionId: Global.SessionID
  objective: Global.Objective
  budget: Global.Budget
  channels: Global.Channels
Map outputs:
  documentUrl: Topic.DocumentUrl

ADD SUCCESS MESSAGE:
  I've generated your media plan document.

  📄 **Download your plan:** {Topic.DocumentUrl}

  The document includes:
  - Executive summary
  - Campaign objectives and KPIs
  - Channel recommendations
  - Targeting strategy
  - Measurement framework

  Would you like me to explain any section?

SAVE: Click "Save"
```

### Step 7.7: Create Topic - Provide Feedback

```
Action: Click "+ New topic" → "From blank"

TRIGGER PHRASES:
  feedback
  rate
  helpful
  not helpful
  this was good
  this was bad
  great job
  needs improvement
  thanks
  thank you

TOPIC NAME: Provide Feedback

ADD QUESTION NODE:
Question: How helpful was this planning session?
Type: Multiple choice
Options:
  Very helpful - exactly what I needed
  Somewhat helpful - got partial answers
  Not helpful - didn't meet my needs
  I have specific feedback to share
Save as: Topic.FeedbackRating

ADD CONDITION (if specific feedback selected):
ADD QUESTION:
  Question: What specific feedback would you like to share?
  Type: Free text
  Save as: Topic.FeedbackDetails

ADD CALL FLOW (optional):
Flow: MPA_CaptureFeedback
Inputs: sessionId, rating, details

ADD MESSAGE:
  Thank you for your feedback! It helps me improve.
  Is there anything else I can help you with today?

SAVE: Click "Save"
```

### Step 7.8: Create Topic - Fallback

```
Action: Click "Topics" in left navigation
Action: Find "Fallback" in System topics section
Action: Click to edit (or create if not exists)

CONFIGURE FALLBACK:
Action: Delete default content

ADD GENERATIVE ANSWERS NODE:
Data source: SharePoint
Search query: {Activity.Text}
Require citation: Yes

ADD FALLBACK MESSAGE (if no result):
  I'm not sure I understood that. I can help you with:

  - **Media Planning** - Start a new plan, define objectives
  - **Benchmarks** - CPM, CTR, conversion rates by channel
  - **Channel Info** - Display, CTV, Social, Search recommendations
  - **Documents** - Generate your media plan

  What would you like to explore?

SAVE: Click "Save"
```

---

## 8. CREATING TOPICS - CA

### Overview
CA requires 8 topics. Follow the same pattern as MPA topics.

### Step 8.1: Create Topic - Greeting

```
TRIGGER PHRASES:
  hello
  hi
  hey
  start
  help
  what can you do
  good morning
  good afternoon

TOPIC NAME: Greeting

MESSAGE:
  Hello! I'm the Consulting Agent - your AI-powered strategic consulting assistant.

  I can help you with:
  - Strategic analysis using 32+ consulting frameworks
  - Industry benchmarking and competitive analysis
  - Market research and opportunity identification
  - Business case development
  - Comprehensive consulting reports

  I offer three depth levels:
  - Quick Analysis (5-10 min read)
  - Standard Analysis (15-25 min read)
  - Comprehensive Analysis (30-45 min read)

  What would you like to work on today?
```

### Step 8.2: Create Topic - Start Analysis

```
TRIGGER PHRASES:
  start analysis
  analyze
  begin analysis
  new analysis
  help me analyze
  strategic analysis
  start consulting
  begin consulting

TOPIC NAME: Start Analysis

QUESTION NODE:
  Question: What type of analysis would you like to conduct?
  Options:
    Strategic Planning - Overall business strategy
    Competitive Analysis - Market positioning
    Market Entry - New market opportunities
    Operational Improvement - Process optimization
    Digital Transformation - Technology strategy
    Other - I'll describe my needs
  Save as: Global.AnalysisType

CALL FLOW:
  Flow: CA_InitializeSession
  Input: analysisType → Global.AnalysisType
  Output: sessionId → Global.SessionID

MESSAGE:
  Great! I'll help you with {Global.AnalysisType}.

  To provide valuable analysis, please tell me:
  1. What company or situation are we analyzing?
  2. What specific question are you trying to answer?
  3. What industry or market context is relevant?
```

### Step 8.3: Create Topic - Select Framework

```
TRIGGER PHRASES:
  framework
  frameworks
  SWOT
  Porter
  BCG
  McKinsey
  which framework
  recommend framework
  five forces
  value chain
  PESTLE

TOPIC NAME: Select Framework

GENERATIVE ANSWERS:
  Search: framework {Activity.Text}
  Source: SharePoint

FALLBACK MESSAGE:
  I have access to 32+ consulting frameworks. Most common:

  **Strategy Frameworks**
  - SWOT Analysis
  - Porter's Five Forces
  - BCG Matrix
  - McKinsey 7S

  **Market Frameworks**
  - PESTLE
  - TAM/SAM/SOM
  - Value Chain Analysis

  Which framework would you like to explore?

QUESTION:
  Would you like me to apply a framework?
  Options:
    Yes - Apply the recommended framework
    Tell me more about options
    I know which framework I want
  Save as: Topic.FrameworkChoice

DEPTH QUESTION (if Yes):
  What depth of analysis?
  Options:
    Quick (5-10 min)
    Standard (15-25 min)
    Comprehensive (30-45 min)
  Save as: Global.AnalysisDepth
```

### Step 8.4: Create Topic - Apply Framework

```
TRIGGER PHRASES:
  apply framework
  run analysis
  execute analysis
  do the analysis
  analyze my situation
  apply SWOT
  apply Porter
  use this framework

TOPIC NAME: Apply Framework

CONDITION:
  Check Global.AnalysisType is not empty
  If empty: Ask for context

CALL FLOW:
  Flow: CA_ApplyFramework
  Inputs: sessionId, analysisType, framework, depth
  Outputs: analysisResult

MESSAGE:
  Analysis complete! Would you like me to:
  1. Generate a downloadable report
  2. Dive deeper into a specific finding
  3. Apply a different framework
  4. Discuss implications
```

### Step 8.5: Create Topic - Generate Report

```
TRIGGER PHRASES:
  generate report
  create report
  download report
  export analysis
  give me a document
  create document
  save analysis
  download

TOPIC NAME: Generate Report

CONDITION: Check Global.AnalysisType exists

CALL FLOW:
  Flow: CA_GenerateDocument
  Inputs: sessionId, analysisType, depth
  Outputs: documentUrl

MESSAGE:
  I've generated your consulting report.
  📄 Download: {Topic.DocumentUrl}

  The report includes:
  - Executive Summary
  - Situation Analysis
  - Framework Application
  - Key Findings
  - Strategic Recommendations
  - Implementation Roadmap
```

### Step 8.6: Create Topic - Benchmark Query

```
TRIGGER PHRASES:
  benchmark
  benchmarks
  industry average
  KPI
  metrics
  what's typical
  industry standard
  best practice

TOPIC NAME: Benchmark Query

GENERATIVE ANSWERS:
  Search: benchmark {Activity.Text}
  Source: SharePoint

FALLBACK MESSAGE:
  I can help find benchmarks. Please tell me:
  1. Which industry?
  2. What specific metrics?
  3. What geography?
```

### Step 8.7: Create Topic - Provide Feedback

```
TRIGGER PHRASES:
  feedback
  rate
  helpful
  not helpful
  thanks
  thank you

TOPIC NAME: Provide Feedback

QUESTION:
  How helpful was this consulting session?
  Options:
    Very helpful - valuable strategic insights
    Somewhat helpful - useful but incomplete
    Not helpful - didn't meet my needs
    I have specific feedback

CALL FLOW: CA_CaptureFeedback
```

### Step 8.8: Create Topic - Fallback

```
CONFIGURE SYSTEM FALLBACK:

GENERATIVE ANSWERS:
  Search: {Activity.Text}
  Source: SharePoint

FALLBACK MESSAGE:
  I'm not sure I understood. I can help with:
  - Strategic Analysis - 32+ frameworks
  - Framework Selection - SWOT, Porter's, BCG, etc.
  - Industry Benchmarks - KPIs and metrics
  - Reports - Comprehensive consulting documents
```

---

## 9. CONNECTING POWER AUTOMATE FLOWS

### Step 9.1: Verify Flows are Deployed
```
Action: Open new browser tab
URL: https://make.powerautomate.com
Navigate: My flows (or Solutions → [Your solution])

Verify these MPA flows exist and are ON:
  - MPA_InitializeSession
  - MPA_SearchBenchmarks  
  - MPA_GenerateDocument
  - MPA_CaptureFeedback

Verify these CA flows exist and are ON:
  - CA_InitializeSession
  - CA_SelectFramework
  - CA_ApplyFramework
  - CA_GenerateDocument
  - CA_CaptureFeedback

If flows are OFF:
  Action: Click on flow → Turn on
```

### Step 9.2: Add Flow Actions to Topics
```
For each topic that needs a flow:

1. Open the topic in Copilot Studio
2. Click "+" to add a node
3. Select "Call an action"
4. Select "Cloud flows"
5. Choose the appropriate flow from list
6. Map input parameters:
   - Click on each input field
   - Select the corresponding variable from dropdown
7. Map output parameters:
   - Assign outputs to topic or global variables
8. Save the topic
```

### Step 9.3: Flow Input/Output Mapping Reference

**MPA_InitializeSession:**
```
Inputs:
  objective → Global.Objective
Outputs:
  sessionId → Global.SessionID
```

**MPA_GenerateDocument:**
```
Inputs:
  sessionId → Global.SessionID
  objective → Global.Objective
  budget → Global.Budget
  channels → Global.Channels
Outputs:
  documentUrl → Topic.DocumentUrl
```

**MPA_CaptureFeedback:**
```
Inputs:
  sessionId → Global.SessionID
  rating → Topic.FeedbackRating
  details → Topic.FeedbackDetails
Outputs:
  (none required)
```

**CA_InitializeSession:**
```
Inputs:
  analysisType → Global.AnalysisType
Outputs:
  sessionId → Global.SessionID
```

**CA_ApplyFramework:**
```
Inputs:
  sessionId → Global.SessionID
  analysisType → Global.AnalysisType
  framework → Global.SelectedFramework
  depth → Global.AnalysisDepth
Outputs:
  analysisResult → Topic.AnalysisResult
```

**CA_GenerateDocument:**
```
Inputs:
  sessionId → Global.SessionID
  analysisType → Global.AnalysisType
  depth → Global.AnalysisDepth
Outputs:
  documentUrl → Topic.DocumentUrl
```

---

## 10. TESTING THE AGENT

### Step 10.1: Open Test Panel
```
Location: Agent editor (any page)
Action: Click "Test" button (bottom right corner)
  - Or press Ctrl+Shift+T
Result: Test chat panel opens on right side
```

### Step 10.2: Test Greeting
```
Test Input: Hello
Expected: Greeting message with capabilities list
Verify: No errors displayed
```

### Step 10.3: Test Knowledge Base Query
```
Test Input: What's a typical CPM for CTV?
Expected: Response with benchmark data
Verify: Citation appears (shows SharePoint source)
Check: Response is relevant and accurate
```

### Step 10.4: Test Planning Flow (MPA)
```
Test Input: Start a new media plan
Expected: Question about campaign objective
Action: Select "Brand Awareness"
Verify: Response acknowledges selection
Verify: Moves to next step (audience)
```

### Step 10.5: Test Framework Selection (CA)
```
Test Input: Tell me about SWOT analysis
Expected: Response about SWOT from KB
Verify: Citation appears
Action: Test applying framework
```

### Step 10.6: Test Document Generation
```
Prerequisite: Complete planning/analysis steps first
Test Input: Generate my plan
Expected: Either document URL or text summary
  - If flows connected: Document URL
  - If standalone mode: Text output
```

### Step 10.7: Test Edge Cases
```
Test Input: (gibberish like "asdfjkl")
Expected: Fallback message with help options
Verify: Does not crash or show errors

Test Input: (empty message)
Expected: Appropriate handling

Test Input: Very long message (500+ characters)
Expected: Processes without timeout
```

### Step 10.8: Test Validation Checklist

| Test | Input | Expected Result | Pass/Fail |
|------|-------|-----------------|-----------|
| Greeting | "Hello" | Welcome message | |
| KB Query | "What's a typical CPM?" | Benchmark with citation | |
| Start Planning (MPA) | "Create a media plan" | Objective question | |
| Start Analysis (CA) | "Begin analysis" | Analysis type question | |
| Channel Info | "Tell me about CTV" | Channel overview | |
| Framework Info | "What is Porter's Five Forces?" | Framework explanation | |
| Generate Doc | "Generate my plan" | Document or summary | |
| Feedback | "Thanks" | Feedback question | |
| Fallback | "random gibberish" | Help menu | |

---

## 11. PUBLISHING THE AGENT

### Step 11.1: Pre-Publication Checklist
```
Before publishing, verify:
[ ] All 7 topics created (MPA) or 8 topics (CA)
[ ] All global variables defined
[ ] Knowledge source connected and showing files
[ ] All tests pass
[ ] Instructions saved (under 8,000 chars)
[ ] Flows connected to relevant topics
```

### Step 11.2: Publish Agent
```
Location: Top right of agent editor
Action: Click "Publish" button
Dialog: "Publish agent" confirmation
Action: Click "Publish" to confirm
Wait: Publishing in progress (30-60 seconds)
Result: "Successfully published" message
```

### Step 11.3: Verify Publication
```
Check: "Published" indicator appears next to agent name
Check: Last published timestamp updates
Check: No error messages
```

### Step 11.4: Get Agent URL (Optional)
```
Action: Click "Channels" in left navigation
Action: Select desired channel (e.g., "Demo website")
Result: URL/embed code for sharing agent
```

---

## 12. POST-PUBLICATION VERIFICATION

### Step 12.1: Test in Published Mode
```
Action: Open agent in published channel (not test mode)
Test: Run through same test cases as Step 10
Verify: Behavior matches test mode
```

### Step 12.2: Monitor Analytics
```
Location: Agent editor → Analytics
Check: Sessions are being recorded
Check: Topics are triggering correctly
Check: No elevated error rates
```

### Step 12.3: Set Up Alerts (Optional)
```
Location: Agent editor → Settings → Alerts
Configure: Error rate thresholds
Configure: Notification recipients
```

### Step 12.4: Document Completion
```
Record in deployment log:
  - Agent name
  - Environment
  - Publication date/time
  - Deployed by
  - Test results summary
  - Any issues noted
```

---

## APPENDIX A: TROUBLESHOOTING

### Issue: Knowledge source shows 0 files
```
Solution 1: Check SharePoint permissions
Solution 2: Verify folder path is correct
Solution 3: Re-add knowledge source
Solution 4: Wait 5-10 minutes for indexing
```

### Issue: Flow not appearing in action list
```
Solution 1: Verify flow is enabled in Power Automate
Solution 2: Check flow is in same environment
Solution 3: Verify flow has proper HTTP trigger
Solution 4: Refresh Copilot Studio page
```

### Issue: Generative answers returning empty
```
Solution 1: Lower confidence threshold to 0.5
Solution 2: Increase max chunks to 10
Solution 3: Verify KB files contain relevant content
Solution 4: Check search query format
```

### Issue: Variable not saving
```
Solution 1: Verify variable name matches exactly
Solution 2: Check variable scope (Global vs Topic)
Solution 3: Verify variable is mapped in flow output
```

### Issue: Topic not triggering
```
Solution 1: Check trigger phrases for typos
Solution 2: Add more trigger phrase variations
Solution 3: Check for conflicts with other topics
Solution 4: Test with exact trigger phrase first
```

---

## APPENDIX B: QUICK REFERENCE

### MPA Topics Summary
| # | Topic | Triggers | Flow |
|---|-------|----------|------|
| 1 | Greeting | hello, hi, help | None |
| 2 | Start Planning | start planning, new plan | MPA_InitializeSession |
| 3 | Search Benchmarks | benchmark, CPM | None (KB) |
| 4 | Search Channels | channel, CTV, social | None (KB) |
| 5 | Generate Document | generate, download | MPA_GenerateDocument |
| 6 | Provide Feedback | feedback, thanks | MPA_CaptureFeedback |
| 7 | Fallback | (any unmatched) | None (KB) |

### CA Topics Summary
| # | Topic | Triggers | Flow |
|---|-------|----------|------|
| 1 | Greeting | hello, hi, help | None |
| 2 | Start Analysis | analyze, start analysis | CA_InitializeSession |
| 3 | Select Framework | framework, SWOT, Porter | CA_SelectFramework |
| 4 | Apply Framework | apply, run analysis | CA_ApplyFramework |
| 5 | Generate Report | report, download | CA_GenerateDocument |
| 6 | Benchmark Query | benchmark, KPI | None (KB) |
| 7 | Provide Feedback | feedback, thanks | CA_CaptureFeedback |
| 8 | Fallback | (any unmatched) | None (KB) |

---

**END OF MANUAL CONFIGURATION GUIDE**
