# COPILOT STUDIO MANUAL CONFIGURATION GUIDE
# Complete Click-by-Click Instructions

**Document Version:** 1.0
**Created:** 2026-01-12
**Purpose:** Step-by-step manual configuration for MPA and CA agents in Copilot Studio

---

## TABLE OF CONTENTS

1. Prerequisites and Access
2. MPA Agent Configuration (7 Topics)
3. CA Agent Configuration (8 Topics)
4. Knowledge Base Connection
5. Flow Connections
6. Global Variables Setup
7. Testing and Validation
8. Publishing

---

## SECTION 1: PREREQUISITES AND ACCESS

### 1.1 Required Access

Before starting, ensure you have:
- [ ] Copilot Studio access (copilotstudio.microsoft.com)
- [ ] Maker or Admin role in target environment
- [ ] Power Automate access (for flow connections)
- [ ] SharePoint access (for KB verification)

### 1.2 Open Copilot Studio

**Step 1:** Open browser and navigate to:
```
https://copilotstudio.microsoft.com
```

**Step 2:** Sign in with your organizational account

**Step 3:** Select the correct environment from the top-right dropdown
- For Personal: Select your development environment
- For Mastercard: Select the Mastercard production environment

**Step 4:** Verify you see the Copilot Studio home page with "Create" and "Agents" options

---

## SECTION 2: MPA AGENT CONFIGURATION

### 2.1 Create or Open MPA Agent

**IF CREATING NEW AGENT:**

**Step 1:** Click "Create" button in left navigation

**Step 2:** Click "New agent"

**Step 3:** In the "Name your agent" field, type:
```
Media Planning Agent
```

**Step 4:** In the "Description" field, type:
```
AI-powered media planning assistant for strategic campaign development using a 10-step framework
```

**Step 5:** Click "Create"

**Step 6:** Wait for agent to be created (10-30 seconds)

---

**IF OPENING EXISTING AGENT:**

**Step 1:** Click "Agents" in left navigation

**Step 2:** Find "Media Planning Agent" in the list

**Step 3:** Click on the agent name to open it

---

### 2.2 Configure Agent Instructions

**Step 1:** In the agent editor, click "Settings" in the left panel (gear icon)

**Step 2:** Click "Generative AI" tab

**Step 3:** Under "Instructions", click the text area

**Step 4:** Delete any existing content

**Step 5:** Open file in your file system:
```
/release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt
```

**Step 6:** Copy the ENTIRE contents of that file (Ctrl+A, Ctrl+C)

**Step 7:** Paste into the Instructions text area (Ctrl+V)

**Step 8:** Verify the character count shows less than 8,000 characters
- Look at bottom right of text area for character count
- If over 8,000, you must reduce content

**Step 9:** Click "Save" button at top right

---

### 2.3 Configure Knowledge Source

**Step 1:** In the left panel, click "Knowledge"

**Step 2:** Click "+ Add knowledge"

**Step 3:** Select "SharePoint" from the options

**Step 4:** In the Site URL field, enter your SharePoint site:
```
For Personal: https://[your-tenant].sharepoint.com/sites/AgentKnowledgeBase
For Mastercard: [Mastercard SharePoint URL]
```

**Step 5:** Click "Next"

**Step 6:** Authenticate if prompted (may require re-login)

**Step 7:** Select the document library: "AgentKnowledgeBase"

**Step 8:** Navigate to and select the "MPA" folder

**Step 9:** Click "Add"

**Step 10:** Wait for indexing to complete (may take 1-5 minutes)
- You will see "Indexing..." status
- Wait until status shows "Ready" or a green checkmark

**Step 11:** Configure search settings:
- Click the three dots (...) next to the knowledge source
- Click "Settings"
- Set "Maximum chunks": 5
- Set "Minimum confidence": 0.65
- Enable "Show citations": Yes
- Click "Save"

---

### 2.4 Create MPA Topics

#### TOPIC 1: Greeting

**Step 1:** Click "Topics" in the left panel

**Step 2:** Click "+ New topic"

**Step 3:** Click "From blank"

**Step 4:** In "Topic name" field, type:
```
Greeting
```

**Step 5:** Click "Edit" next to "Trigger phrases"

**Step 6:** Enter these trigger phrases (one per line):
```
hello
hi
hey
start
help
what can you do
good morning
good afternoon
get started
```

**Step 7:** Click "Save"

**Step 8:** In the topic canvas, you will see a "Trigger" node

**Step 9:** Click the "+" below the Trigger node

**Step 10:** Select "Send a message"

**Step 11:** In the message field, paste:
```
Hello! I am the Media Planning Agent, your AI-powered media planning assistant.

I can help you with:

- Creating comprehensive media plans using our 10-step framework
- Finding industry benchmarks for CPM, CTR, conversion rates
- Recommending channel mix based on your objectives
- Budget allocation guidance across channels
- Performance validation and optimization

What would you like to work on today?
```

**Step 12:** Click "Save" at the top right of the page

---

#### TOPIC 2: Start Planning

**Step 1:** Click "+ New topic" then "From blank"

**Step 2:** Name the topic:
```
Start Planning
```

**Step 3:** Edit trigger phrases and add:
```
start planning
new plan
create plan
begin planning
start a media plan
help me plan
new media plan
create a campaign
start new session
let's plan
```

**Step 4:** Click "Save"

**Step 5:** Click "+" below Trigger node

**Step 6:** Select "Ask a question"

**Step 7:** In the question field, type:
```
What is your primary campaign objective?
```

**Step 8:** Under "Identify", select "Multiple choice options"

**Step 9:** Click "+ Add option" to add each choice:

Option 1:
```
Brand Awareness - Maximize reach and impressions
```

Option 2:
```
Consideration - Drive engagement and website visits
```

Option 3:
```
Conversion - Generate leads or sales
```

Option 4:
```
Retention - Re-engage existing customers
```

Option 5:
```
Not Sure - Help me decide
```

**Step 10:** Under "Save response as", click the variable dropdown

**Step 11:** Click "Create new"

**Step 12:** Name the variable:
```
Global.Objective
```

**Step 13:** Set Scope to "Global"

**Step 14:** Click "Create"

**Step 15:** Click "+" below the question node

**Step 16:** Select "Call an action"

**Step 17:** Select "Cloud flows"

**Step 18:** Find and select "MPA_InitializeSession"
- If flow not visible, click "See more" or check flow is published

**Step 19:** Map the inputs:
- objective → Global.Objective

**Step 20:** Map the outputs:
- sessionId → Create new variable "Global.SessionID" (Global scope)

**Step 21:** Click "+" below the action node

**Step 22:** Select "Send a message"

**Step 23:** Paste this message (use the variable picker to insert variables):
```
Great! I have started a new planning session focused on [insert Global.Objective variable here].

Session ID: [insert Global.SessionID variable here]

Step 1 of 10: Define Objectives - COMPLETE

Now let us move to Step 2: Who is your target audience?

Please describe your target audience including demographics, interests, and behaviors.
```

To insert variables:
- Type the message
- Where you want a variable, click the {x} button
- Select the variable from the list
- The variable will appear as a blue pill in the message

**Step 24:** Click "Save"

---

#### TOPIC 3: Search Benchmarks

**Step 1:** Click "+ New topic" then "From blank"

**Step 2:** Name the topic:
```
Search Benchmarks
```

**Step 3:** Edit trigger phrases:
```
benchmark
benchmarks
what is a typical CPM
average CPM
industry average
what should I expect
typical performance
CTR benchmark
conversion rate benchmark
cost per click
CPC average
what is normal
industry standards
```

**Step 4:** Click "Save"

**Step 5:** Click "+" below Trigger node

**Step 6:** Select "Advanced" then "Generative answers"

**Step 7:** In the Generative answers node:
- Under "Data sources", ensure SharePoint (MPA) is selected
- Under "Search query", select "Activity.Text" (this passes the user's message)
- Enable "Require citation": Yes

**Step 8:** Click "+" below the Generative answers node

**Step 9:** Select "Add a condition"

**Step 10:** Set up the condition:
- Variable: System.LastAnswerGenerated (or similar system variable for answer success)
- Operator: equals
- Value: true

**Step 11:** Under the TRUE branch, add "Send a message":
```
[The generative answer will be displayed automatically]
```
Note: Generative answers typically display automatically, so this may just be a continuation message.

**Step 12:** Under the FALSE branch (click the condition node, then add to the "All other conditions" path), add "Send a message":
```
Based on general industry data:

DISPLAY ADVERTISING
CPM: $2-12 depending on targeting
CTR: 0.05%-0.20%

CTV AND STREAMING
CPM: $15-45 depending on inventory quality
Completion Rate: 85%-95%

PAID SOCIAL
CPM: $6-25 depending on platform and targeting
CTR: 0.50%-2.00%

PAID SEARCH
CPC: $0.50-$5.00 depending on competition
CTR: 2%-6%

Note: These are general ranges. Actual performance varies by vertical, targeting, and creative quality.

Would you like more specific benchmarks for your industry?
```

**Step 13:** Click "Save"

---

#### TOPIC 4: Search Channels

**Step 1:** Click "+ New topic" then "From blank"

**Step 2:** Name:
```
Search Channels
```

**Step 3:** Trigger phrases:
```
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
OTT
streaming
retail media
DOOH
audio
podcast
```

**Step 4:** Click "Save"

**Step 5:** Add Generative answers node (same as Topic 3)
- Select SharePoint MPA as data source
- Use Activity.Text as search query
- Enable citations

**Step 6:** Add fallback message for when no answer found:
```
Here is an overview of major advertising channels:

DISPLAY AND PROGRAMMATIC
Best for: Awareness, retargeting
Strengths: Scale, targeting options, cost-efficient reach
Typical CPM: $2-12

CTV AND OTT
Best for: Awareness, consideration
Strengths: Premium environment, high completion rates, growing audience
Typical CPM: $15-45

PAID SOCIAL
Best for: Full funnel from awareness to conversion
Strengths: Precise targeting, engagement, creative flexibility
Typical CPM: $6-25

PAID SEARCH
Best for: Conversion, high-intent consideration
Strengths: Intent-based, measurable, immediate results
Typical CPC: $0.50-5.00

RETAIL MEDIA
Best for: Conversion, shopper marketing
Strengths: Close to purchase, first-party data, closed-loop measurement
Typical CPM: $3-20

Which channel would you like to explore in more detail?
```

**Step 7:** Click "Save"

---

#### TOPIC 5: Generate Document

**Step 1:** Click "+ New topic" then "From blank"

**Step 2:** Name:
```
Generate Document
```

**Step 3:** Trigger phrases:
```
generate document
create document
download plan
export plan
give me a document
create my plan
generate plan
save plan
download
export
get document
make document
create report
```

**Step 4:** Click "Save"

**Step 5:** Add a Condition node to check if objective exists:
- Variable: Global.Objective
- Operator: is not empty

**Step 6:** Under FALSE branch, add message:
```
I do not have enough information to generate a plan yet. Let us start by defining your campaign objective.

What is your primary goal: Awareness, Consideration, Conversion, or Retention?
```

**Step 7:** Under TRUE branch, add "Call an action":
- Select cloud flow: MPA_GenerateDocument
- Map inputs: sessionId, objective, budget, channels
- Map outputs: documentUrl to Topic.DocumentUrl

**Step 8:** After the action, add message:
```
I have generated your media plan document.

Download your plan: [insert Topic.DocumentUrl]

The document includes:
- Executive summary
- Campaign objectives and KPIs
- Channel recommendations with budget allocation
- Targeting strategy
- Flight dates and pacing
- Measurement framework

Would you like me to explain any section in more detail?
```

**Step 9:** Click "Save"

---

#### TOPIC 6: Provide Feedback

**Step 1:** Click "+ New topic" then "From blank"

**Step 2:** Name:
```
Provide Feedback
```

**Step 3:** Trigger phrases:
```
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
rate this
give feedback
```

**Step 4:** Click "Save"

**Step 5:** Add "Ask a question" node:
- Question: "How helpful was this planning session?"
- Type: Multiple choice
- Options:
  - Very helpful - Exactly what I needed
  - Somewhat helpful - Got partial answers
  - Not helpful - Did not meet my needs
  - Share specific feedback - I have detailed comments
- Save to: Topic.FeedbackRating

**Step 6:** Add condition:
- Variable: Topic.FeedbackRating
- Equals: "Share specific feedback - I have detailed comments"

**Step 7:** Under TRUE, add another question:
- Question: "What specific feedback would you like to share?"
- Type: Open-ended
- Save to: Topic.FeedbackDetails

**Step 8:** After question/condition, add "Call an action":
- Flow: MPA_CaptureFeedback
- Inputs: sessionId, rating, details

**Step 9:** Add final message:
```
Thank you for your feedback! It helps me improve.

Is there anything else I can help you with today?
```

**Step 10:** Click "Save"

---

#### TOPIC 7: Fallback (System Topic)

**Step 1:** In the Topics list, find "Fallback" under "System topics"

**Step 2:** Click to open it

**Step 3:** The Fallback topic is pre-configured but we need to enable generative answers

**Step 4:** Click on the existing message node

**Step 5:** Delete the default message

**Step 6:** Add "Generative answers" node:
- Data source: SharePoint (MPA)
- Search query: Activity.Text
- Enable citations

**Step 7:** Add condition for when no answer found

**Step 8:** Under "no answer" path, add message:
```
I am not sure I understood that. I can help you with:

MEDIA PLANNING
Start a new plan, define objectives, build strategy

BENCHMARKS
CPM, CTR, conversion rates by channel and vertical

CHANNEL INFORMATION
Display, CTV, Social, Search recommendations

DOCUMENTS
Generate your media plan for download

What would you like to explore?
```

**Step 9:** Click "Save"

---

### 2.5 Create MPA Global Variables

**Step 1:** Click "Variables" in the left panel (or Settings > Variables)

**Step 2:** For each variable below, click "+ New variable":

| Variable Name | Type | Scope | Default Value |
|--------------|------|-------|---------------|
| Global.SessionID | String | Global | (empty) |
| Global.Objective | String | Global | (empty) |
| Global.Budget | String | Global | (empty) |
| Global.Channels | String | Global | (empty) |
| Global.Audience | String | Global | (empty) |
| Global.CurrentStep | String | Global | 0 |
| Global.Vertical | String | Global | (empty) |
| Global.Pathway | String | Global | STANDARD |

**Step 3:** For each variable:
- Enter the name (e.g., Global.SessionID)
- Select Type: String
- Set Scope: Global (available across all topics)
- Set Default value if specified
- Click "Save"

---

## SECTION 3: CA AGENT CONFIGURATION

### 3.1 Create or Open CA Agent

**Step 1:** Click "Create" or go to "Agents" list

**Step 2:** Create new agent with:
- Name: `Consulting Agent`
- Description: `AI-powered strategic consulting assistant with 32 analytical frameworks`

**Step 3:** Or open existing "Consulting Agent"

---

### 3.2 Configure CA Instructions

**Step 1:** Settings > Generative AI > Instructions

**Step 2:** Open and copy contents from:
```
/release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt
```

**Step 3:** Paste into Instructions field

**Step 4:** Verify under 8,000 characters

**Step 5:** Click "Save"

---

### 3.3 Configure CA Knowledge Source

**Step 1:** Knowledge > Add knowledge > SharePoint

**Step 2:** Enter SharePoint site URL

**Step 3:** Select "AgentKnowledgeBase" library

**Step 4:** Select "CA" folder

**Step 5:** Click "Add"

**Step 6:** Wait for indexing

**Step 7:** Configure: Max chunks 5, Min confidence 0.65, Citations enabled

---

### 3.4 Create CA Topics

Follow the same process as MPA topics. Create these 8 topics:

#### TOPIC 1: Greeting
- Trigger phrases: hello, hi, hey, start, help, what can you do
- Message: Welcome message explaining CA capabilities and depth levels

#### TOPIC 2: Start Analysis
- Trigger phrases: start analysis, analyze, begin analysis, new analysis
- Question: Analysis type (Strategic, Market, Customer, Data, Not Sure)
- Variable: Global.AnalysisType
- Flow: CA_InitializeSession

#### TOPIC 3: Select Framework
- Trigger phrases: framework, SWOT, Porter, BCG, five forces, pestle
- Generative answers from CA knowledge
- Flow: CA_SelectFramework
- Variable: Global.SelectedFramework

#### TOPIC 4: Apply Framework
- Trigger phrases: apply framework, run analysis, execute, analyze now
- Prerequisite check: Global.SelectedFramework is not empty
- Question: Depth level (Quick, Standard, Comprehensive)
- Variable: Global.AnalysisDepth
- Flow: CA_ApplyFramework

#### TOPIC 5: Generate Report
- Trigger phrases: generate report, create report, download report
- Prerequisite check: Global.SelectedFramework is not empty
- Flow: CA_GenerateDocument

#### TOPIC 6: Benchmark Query
- Trigger phrases: benchmark, industry average, KPI, metrics
- Generative answers from CA knowledge

#### TOPIC 7: Provide Feedback
- Trigger phrases: feedback, rate, helpful, thanks
- Question: Rating (Very helpful, Somewhat, Not helpful, Specific)
- Flow: CA_CaptureFeedback

#### TOPIC 8: Fallback
- System topic
- Generative answers from CA knowledge
- Fallback message listing capabilities

---

### 3.5 Create CA Global Variables

| Variable Name | Type | Scope | Default |
|--------------|------|-------|---------|
| Global.SessionID | String | Global | (empty) |
| Global.AnalysisType | String | Global | (empty) |
| Global.SelectedFramework | String | Global | (empty) |
| Global.AnalysisDepth | String | Global | standard |
| Global.Industry | String | Global | (empty) |
| Global.AnalysisContext | String | Global | (empty) |
| Global.AnalysisComplete | Boolean | Global | false |

---

## SECTION 4: CONNECTING FLOWS TO TOPICS

### 4.1 Verify Flows Are Published

**Step 1:** Open Power Automate (make.powerautomate.com)

**Step 2:** Select the same environment as Copilot Studio

**Step 3:** Click "My flows" or "Cloud flows"

**Step 4:** Verify these flows exist and are "On":

MPA Flows:
- [ ] MPA_InitializeSession
- [ ] MPA_SearchBenchmarks
- [ ] MPA_GenerateDocument
- [ ] MPA_CaptureFeedback

CA Flows:
- [ ] CA_InitializeSession
- [ ] CA_SelectFramework
- [ ] CA_ApplyFramework
- [ ] CA_GenerateDocument
- [ ] CA_CaptureFeedback

**Step 5:** If any flow shows "Off", click it and click "Turn on"

---

### 4.2 Update Flow Connections

For EACH flow, you must update connection references:

**Step 1:** Click on the flow name to open it

**Step 2:** Click "Edit"

**Step 3:** For each action that shows a warning icon:

**Step 4:** Click on the action

**Step 5:** Under "Connection", click "Add new connection" or select existing

**Step 6:** Authenticate with your credentials

**Step 7:** Repeat for all actions with warnings

**Step 8:** Click "Save"

**Step 9:** Test the flow:
- Click "Test" in the top right
- Select "Manually"
- Enter test values
- Click "Run flow"
- Verify success

---

### 4.3 Connect Flows in Copilot Studio

**Step 1:** Go back to Copilot Studio

**Step 2:** Open the agent (MPA or CA)

**Step 3:** Open the topic that needs a flow connection

**Step 4:** Find the "Call an action" node

**Step 5:** If flow is not connected:
- Click the node
- Click "Select an action"
- Click "Cloud flows"
- Find the flow in the list
- If not visible, click "Refresh" or check environment

**Step 6:** Map inputs:
- Each flow input appears in the left column
- Click the dropdown for each
- Select the matching variable (e.g., Global.Objective)

**Step 7:** Map outputs:
- Each flow output appears
- Click "Create new variable" or select existing
- Name the variable (e.g., Global.SessionID)
- Set scope to Global if needed across topics

**Step 8:** Click "Save"

---

## SECTION 5: TESTING

### 5.1 Test in Preview Panel

**Step 1:** In Copilot Studio, click "Test" in the top right

**Step 2:** A test chat panel opens on the right

**Step 3:** Run these tests:

**Test 1: Greeting**
- Type: `hello`
- Expected: Welcome message with capabilities list
- PASS/FAIL: ___

**Test 2: Knowledge Query**
- Type: `what is a typical CPM for CTV?`
- Expected: Response with benchmark data AND citation to KB file
- PASS/FAIL: ___

**Test 3: Start Planning (MPA) or Start Analysis (CA)**
- Type: `start a new media plan` or `start analysis`
- Expected: Question about objective/analysis type
- PASS/FAIL: ___

**Test 4: Select an Option**
- Click or type an option (e.g., "Awareness")
- Expected: Confirmation message with session ID (if flow works) or fallback message
- PASS/FAIL: ___

**Test 5: Document Generation**
- Type: `generate document`
- Expected: Either prerequisite warning OR document generation
- PASS/FAIL: ___

**Test 6: Feedback**
- Type: `thanks`
- Expected: Feedback question
- PASS/FAIL: ___

**Test 7: Fallback**
- Type: `asdfghjkl` (nonsense)
- Expected: Fallback message listing capabilities
- PASS/FAIL: ___

---

### 5.2 Verify Knowledge Citations

**Step 1:** Ask a knowledge-based question in test panel

**Step 2:** Look at the response

**Step 3:** There should be a citation indicator (usually a superscript number or link)

**Step 4:** Click the citation

**Step 5:** Verify it points to a file in the MPA or CA folder

**If no citations appear:**
- Check Knowledge source is indexed (Knowledge > check status)
- Check "Require citation" is enabled
- Check confidence threshold is not too high (try 0.5)

---

## SECTION 6: PUBLISHING

### 6.1 Publish to Test Channel

**Step 1:** Click "Publish" in the top right

**Step 2:** Select "Publish to demo website" (for initial testing)

**Step 3:** Click "Publish"

**Step 4:** Wait for publishing to complete (1-2 minutes)

**Step 5:** Click "Open demo website"

**Step 6:** Test the agent in the demo website

---

### 6.2 Publish to Production

**Step 1:** After testing passes, click "Publish" again

**Step 2:** Select your production channel:
- Microsoft Teams
- Web widget
- Custom channel

**Step 3:** Configure channel settings

**Step 4:** Click "Publish"

**Step 5:** Wait for publishing to complete

**Step 6:** Test in the production channel

---

## SECTION 7: TROUBLESHOOTING

### Issue: Flow not appearing in Copilot Studio

**Solutions:**
1. Verify flow is in the SAME environment as Copilot Studio
2. Verify flow is turned ON
3. Click "Refresh" in the flow selection dialog
4. Wait 5 minutes and try again (sync delay)

### Issue: Knowledge not returning answers

**Solutions:**
1. Check indexing status (should show "Ready")
2. Lower confidence threshold to 0.5
3. Verify files are in the correct folder
4. Check file format is .txt (not .docx)
5. Verify files are under 7MB each

### Issue: Variables not passing between topics

**Solutions:**
1. Verify variable scope is "Global" not "Topic"
2. Verify variable name is identical (case-sensitive)
3. Check variable is being set BEFORE being used

### Issue: Flow errors

**Solutions:**
1. Open Power Automate and check flow run history
2. Look for failed runs and check error message
3. Update connection references
4. Verify Dataverse permissions

---

## SECTION 8: CHECKLIST SUMMARY

### MPA Agent

- [ ] Agent created with correct name and description
- [ ] Instructions pasted from MPA_Instructions_RAG_PRODUCTION.txt
- [ ] Instructions under 8,000 characters
- [ ] SharePoint KB connected (MPA folder)
- [ ] KB indexed successfully
- [ ] 7 topics created:
  - [ ] Greeting
  - [ ] Start Planning
  - [ ] Search Benchmarks
  - [ ] Search Channels
  - [ ] Generate Document
  - [ ] Provide Feedback
  - [ ] Fallback (modified)
- [ ] 8 global variables created
- [ ] 4 flows connected
- [ ] Test: Greeting works
- [ ] Test: KB query returns citation
- [ ] Test: Planning flow works
- [ ] Published

### CA Agent

- [ ] Agent created with correct name and description
- [ ] Instructions pasted from CA_Instructions_RAG_PRODUCTION.txt
- [ ] Instructions under 8,000 characters
- [ ] SharePoint KB connected (CA folder)
- [ ] KB indexed successfully
- [ ] 8 topics created:
  - [ ] Greeting
  - [ ] Start Analysis
  - [ ] Select Framework
  - [ ] Apply Framework
  - [ ] Generate Report
  - [ ] Benchmark Query
  - [ ] Provide Feedback
  - [ ] Fallback (modified)
- [ ] 7 global variables created
- [ ] 5 flows connected
- [ ] Test: Greeting works
- [ ] Test: KB query returns citation
- [ ] Test: Framework flow works
- [ ] Published

---

## APPENDIX: QUICK REFERENCE

### Copilot Studio Navigation
- **Topics**: Left panel > Topics
- **Knowledge**: Left panel > Knowledge
- **Settings**: Left panel > Settings (gear icon)
- **Variables**: Settings > Variables OR within topic editor
- **Test**: Top right corner > Test
- **Publish**: Top right corner > Publish

### Variable Syntax in Messages
- To insert a variable: Click {x} button, select variable
- Variable appears as blue pill in editor
- At runtime, variable value is substituted

### Flow Mapping
- Inputs: Values from Copilot to Flow
- Outputs: Values from Flow back to Copilot
- Always create Global scope for cross-topic variables

---

**END OF MANUAL CONFIGURATION GUIDE**
