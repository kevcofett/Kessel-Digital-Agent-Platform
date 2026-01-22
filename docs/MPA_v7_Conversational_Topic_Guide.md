MPA V7 CONVERSATIONAL TOPIC CREATION GUIDE
==========================================

Purpose: Step-by-step instructions for creating the minimal topic structure
that supports the conversational agent pattern introduced in v7.
Date: January 2026
Version: 7.0

EXECUTIVE SUMMARY
-----------------

The v7 architecture shifts from rigid keyword-triggered topics to a
conversational pattern where intelligence resides in instructions and KB,
with topics serving as structural scaffolding.

Topic counts:
- ORC (Orchestrator): 5 topics
- Each Specialist: 3 topics
- Total: 23 topics (down from 30 in v6)

PREREQUISITES
-------------

Before creating topics, complete these steps:

1. Enable Generative AI for each agent
   - Open agent in Copilot Studio
   - Go to Settings then Generative AI
   - Enable Boost conversational coverage with generative answers
   - Select Generative (preview) for interaction style
   - Verify SharePoint KB folders are connected
   - Click Save

2. Create all 7 agents if not already done
   - ORC (Orchestrator)
   - ANL (Analytics)
   - AUD (Audience)
   - CHA (Channel)
   - SPO (Supply Path)
   - DOC (Document)
   - PRF (Performance)

3. Publish all agents before configuring transfers

4. Enable Agent Transfers in each agent Settings

TOPIC CREATION ORDER
--------------------

Phase 1: Create all specialist topics first (Greeting, Conversation, Return)
Phase 2: Publish all specialists
Phase 3: Create ORC topics
Phase 4: Configure ORC transfers to point to specialists
Phase 5: Publish ORC

This order matters because you cannot redirect to an agent that does not exist yet.


ORC TOPIC CREATION
------------------

ORC TOPIC 1: GREETING

Step 1: Create the topic
- Open MPA Orchestrator Agent in Copilot Studio
- Click Topics in left navigation
- Click + New topic then From blank

Step 2: Configure basic settings
- Name: Greeting
- Display name: Greeting

Step 3: Add trigger phrases
Add each phrase, pressing Enter after each:
- Hello
- Hi
- Hey
- Good morning
- Good afternoon
- Good evening
- Start
- Begin
- Get started
- Help me
- I need help
- Help me plan
- Media planning
- Let us begin

Step 4: Add message node
- Click + Add node below the trigger
- Select Send a message
- Paste this message:

Welcome! I am your media planning advisor. I help you think through
campaign strategy - from budget and audience to channels and measurement.

What are you working on today? You can tell me about a specific challenge,
ask me to help with a particular aspect of planning, or we can start
fresh with a new campaign.

Step 5: Add generative answers node
- Click + Add node below the message
- Select Advanced then Generative answers
- Configure Input as Activity.Text
- Select all connected knowledge sources

Step 6: Save the topic


ORC TOPIC 2: CONVERSATION

Step 1: Create the topic
- Click + New topic then From blank

Step 2: Configure basic settings
- Name: Conversation
- Display name: Main Conversation

Step 3: Add trigger phrases
These are broad catch-all phrases:
- I want to
- I need to
- Can you help
- Tell me about
- What should
- How do I
- Help me with
- I am trying to
- Let us work on
- Can we discuss
- What do you think
- Walk me through
- Explain
- Show me

Step 4: Add generative answers node
- Click + Add node below the trigger
- Select Advanced then Generative answers
- Configure Input as Activity.Text
- Select all connected knowledge sources

Step 5: Save the topic


ORC TOPIC 3: SPECIALIST HANDOFF

Step 1: Create the topic
- Click + New topic then From blank

Step 2: Configure basic settings
- Name: Specialist_Handoff
- Display name: Route to Specialist

Step 3: Add trigger phrases
- Connect me with analytics
- Route to analytics
- I need the analytics specialist
- Transfer to ANL
- Connect me with audience
- Route to audience
- I need the audience specialist
- Transfer to AUD
- Connect me with channel
- Route to channel
- I need the channel specialist
- Transfer to CHA
- Connect me with supply path
- Route to supply path
- I need the programmatic specialist
- Transfer to SPO
- Connect me with document
- Route to document
- Generate a document
- Transfer to DOC
- Connect me with performance
- Route to performance
- I need the performance specialist
- Transfer to PRF
- Let me talk to a specialist

Step 4: Add question node for intent classification
- Click + Add node then Ask a question
- Question text: Which specialist would be most helpful?
- Identify: Select Multiple choice
- Options:
  - Analytics (budget, projections, scenarios)
  - Audience (segments, targeting, LTV)
  - Channels (media mix, channel selection)
  - Supply Path (programmatic, DSP/SSP)
  - Document (briefs, reports)
  - Performance (attribution, optimization)
- Save response as: Create variable Topic.SpecialistChoice

Step 5: Add condition node with branches
- Click + Add node then Add a condition

Branch 1 - Analytics:
- Condition: Topic.SpecialistChoice equals Analytics (budget, projections, scenarios)
- Add node: Topic management then Transfer conversation
- Select Transfer to another copilot
- Choose: MPA Analytics Agent

Branch 2 - Audience:
- Condition: Topic.SpecialistChoice equals Audience (segments, targeting, LTV)
- Transfer to: MPA Audience Agent

Branch 3 - Channel:
- Condition: Topic.SpecialistChoice equals Channels (media mix, channel selection)
- Transfer to: MPA Channel Agent

Branch 4 - Supply Path:
- Condition: Topic.SpecialistChoice equals Supply Path (programmatic, DSP/SSP)
- Transfer to: MPA Supply Path Agent

Branch 5 - Document:
- Condition: Topic.SpecialistChoice equals Document (briefs, reports)
- Transfer to: MPA Document Agent

Branch 6 - Performance:
- Condition: Topic.SpecialistChoice equals Performance (attribution, optimization)
- Transfer to: MPA Performance Agent

Step 6: Save the topic



ORC TOPIC 4: RETURN FROM SPECIALIST

Step 1: Create the topic
- Click + New topic then From blank

Step 2: Configure basic settings
- Name: Return_From_Specialist
- Display name: Return from Specialist

Step 3: Add trigger phrases
- I am back
- Back to main
- Return to orchestrator
- Continue with planning
- What is next
- Move forward
- Back to workflow
- Continue
- Proceed

Step 4: Add message node
Welcome back! Based on the work with the specialist, what would you like
to focus on next? We can continue building the plan, explore another area,
or I can summarize where things stand.

Step 5: Add generative answers node
- Click + Add node below the message
- Select Advanced then Generative answers
- Configure Input as Activity.Text
- Select all connected knowledge sources

Step 6: Save the topic


ORC TOPIC 5: FALLBACK

Step 1: Locate or create Fallback topic
- Copilot Studio usually creates a default Fallback topic
- If it exists, click on Fallback in the Topics list to edit it
- If not, click + New topic then From blank and name it Fallback

Step 2: Configure trigger
- Set trigger to On Unrecognized (system trigger, not phrases)
- This is found in the trigger configuration area

Step 3: Replace existing nodes with generative answers
- Delete any existing nodes in the topic
- Click + Add node then Advanced then Generative answers
- Configure Input as Activity.Text
- Select all connected knowledge sources

Step 4: Save the topic


ANL TOPIC CREATION
------------------

ANL TOPIC 1: GREETING

Step 1: Create the topic
- Open MPA Analytics Agent in Copilot Studio
- Click Topics then + New topic then From blank

Step 2: Configure basic settings
- Name: Greeting
- Display name: ANL Greeting

Step 3: Add trigger phrases
- Hello
- Hi
- Hey
- Start
- Begin

Step 4: Add message node
I am the Analytics Agent. I help with quantitative analysis - budget
optimization, scenario modeling, performance projections, and statistical
approaches.

What would you like to analyze? If you tell me about your situation, I can
suggest the most useful calculations.

Step 5: Add generative answers node
- Click + Add node below the message
- Select Advanced then Generative answers
- Configure Input as Activity.Text
- Select all connected knowledge sources

Step 6: Save the topic


ANL TOPIC 2: CONVERSATION

Step 1: Create the topic
- Click + New topic then From blank

Step 2: Configure basic settings
- Name: Conversation
- Display name: ANL Analysis

Step 3: Add trigger phrases
- Calculate
- Project
- Forecast
- Analyze
- Budget
- Scenario
- What if
- Compare
- Model
- Estimate
- How much
- ROI
- ROAS
- Marginal
- Efficiency
- Diminishing returns
- Confidence
- Statistical

Step 4: Add generative answers node
- Click + Add node below the trigger
- Select Advanced then Generative answers
- Configure Input as Activity.Text
- Select all connected knowledge sources

Step 5: Save the topic


ANL TOPIC 3: RETURN TO ORC

Step 1: Create the topic
- Click + New topic then From blank

Step 2: Configure basic settings
- Name: Return_To_ORC
- Display name: Return to Orchestrator

Step 3: Add trigger phrases
- Go back
- Return to main
- Back to orchestrator
- I need help with something else
- Route me back
- Transfer back
- That is all for analytics
- Done with analysis
- Move on
- What is next in the workflow

Step 4: Add message node
I will connect you back to the Orchestrator to continue with your plan.

Step 5: Add transfer node
- Click + Add node then Topic management then Transfer conversation
- Select Transfer to another copilot
- Choose: MPA Orchestrator Agent

Step 6: Save the topic



SPECIALIST TOPIC TEMPLATES
--------------------------

Apply the same 3-topic pattern to each remaining specialist agent.
Below are the specific trigger phrases and messages for each.


AUD (AUDIENCE AGENT) TOPICS

AUD Greeting Message:
I am the Audience Agent. I help with segmentation strategy, targeting
approaches, LTV modeling, and customer journey analysis.

Tell me about your campaign or customer base, and I will help identify
the most effective audience strategy.

AUD Conversation Trigger Phrases:
- Audience
- Segment
- Target
- Persona
- LTV
- Customer
- Journey
- Who should
- Reach
- Demographics
- Propensity
- Lifetime value
- Segmentation
- Targeting

AUD Return Message:
I will connect you back to the Orchestrator to continue with your plan.


CHA (CHANNEL AGENT) TOPICS

CHA Greeting Message:
I am the Channel Agent. I help with channel selection, media mix strategy,
allocation decisions, and emerging channel evaluation.

What channels or media mix questions can I help you work through?

CHA Conversation Trigger Phrases:
- Channel
- Media mix
- Allocation
- CTV
- Display
- Social
- Programmatic
- Where should
- Which channels
- Television
- Digital
- Video
- Audio
- Out of home
- Retail media

CHA Return Message:
I will connect you back to the Orchestrator to continue with your plan.


SPO (SUPPLY PATH AGENT) TOPICS

SPO Greeting Message:
I am the Supply Path Agent. I help with programmatic optimization,
DSP and SSP evaluation, fee analysis, and supply chain transparency.

What programmatic or supply path questions can I help you analyze?

SPO Conversation Trigger Phrases:
- Supply path
- DSP
- SSP
- Programmatic
- Fees
- Transparency
- NBI
- Partners
- Vendors
- Ad tech
- Bidding
- Inventory
- Exchange
- Take rate

SPO Return Message:
I will connect you back to the Orchestrator to continue with your plan.


DOC (DOCUMENT AGENT) TOPICS

DOC Greeting Message:
I am the Document Agent. I help with media brief creation, report
generation, and document formatting and export.

What document would you like me to help you create?

DOC Conversation Trigger Phrases:
- Document
- Brief
- Report
- Export
- Generate
- Create document
- Media plan document
- Summary
- Template
- Format
- PDF
- Word
- Presentation

DOC Return Message:
I will connect you back to the Orchestrator to continue with your plan.


PRF (PERFORMANCE AGENT) TOPICS

PRF Greeting Message:
I am the Performance Agent. I help with attribution analysis, anomaly
detection, incrementality testing, and optimization recommendations.

What performance questions or campaign results would you like me to analyze?

PRF Conversation Trigger Phrases:
- Performance
- Attribution
- Anomaly
- Optimization
- Incrementality
- Results
- KPI
- Metrics
- Why did
- Drop
- Increase
- Testing
- Measurement
- MTA
- MMM

PRF Return Message:
I will connect you back to the Orchestrator to continue with your plan.



AGENT TRANSFER CONFIGURATION
----------------------------

After all topics are created, configure agent transfers:

FOR ORC (ORCHESTRATOR):

Step 1: Open ORC in Copilot Studio
Step 2: Go to Settings then Agent transfers
Step 3: Enable agent transfers toggle
Step 4: Click Add agent for each specialist:
- MPA Analytics Agent
- MPA Audience Agent
- MPA Channel Agent
- MPA Supply Path Agent
- MPA Document Agent
- MPA Performance Agent
Step 5: Save settings
Step 6: Publish the agent

FOR EACH SPECIALIST:

Step 1: Open the specialist agent in Copilot Studio
Step 2: Go to Settings then Agent transfers
Step 3: Enable agent transfers toggle
Step 4: Click Add agent and select:
- MPA Orchestrator Agent
Step 5: Save settings
Step 6: Publish the agent


KNOWLEDGE SOURCE CONFIGURATION
------------------------------

Ensure each agent has the correct knowledge sources connected:

ORC Knowledge Sources:
- SharePoint: EAP folder (shared platform content)
- SharePoint: Agents/ORC folder

ANL Knowledge Sources:
- SharePoint: EAP folder (shared platform content)
- SharePoint: Agents/ANL folder (all ANL KB files)

AUD Knowledge Sources:
- SharePoint: EAP folder (shared platform content)
- SharePoint: Agents/AUD folder (all AUD KB files)

CHA Knowledge Sources:
- SharePoint: EAP folder (shared platform content)
- SharePoint: Agents/CHA folder (all CHA KB files)

SPO Knowledge Sources:
- SharePoint: EAP folder (shared platform content)
- SharePoint: Agents/SPO folder

DOC Knowledge Sources:
- SharePoint: EAP folder (shared platform content)
- SharePoint: Agents/DOC folder

PRF Knowledge Sources:
- SharePoint: EAP folder (shared platform content)
- SharePoint: Agents/PRF folder (all PRF KB files)


VALIDATION TESTING
------------------

After completing all configuration, test with these scenarios:

Test 1 - Ambiguous Start:
- Input: I need help with a campaign
- Expected: ORC asks clarifying questions, does not immediately route

Test 2 - Clear Analytics Need:
- Input: Model the diminishing returns if I increase display by 20 percent
- Expected: ORC routes to ANL, ANL provides analysis

Test 3 - Partial Information:
- Input: What is the optimal budget split?
- Expected: Agent asks for context (total budget, channels, objectives)

Test 4 - Mid-Stream Pivot:
- Input: Actually, let us talk about audience instead
- Expected: Smooth transition to AUD, context preserved

Test 5 - Return from Specialist:
- Input: That is helpful, what should I do next?
- Expected: Returns to ORC, ORC suggests next steps

Test 6 - Direct Specialist Request:
- Input: Connect me with the performance specialist
- Expected: Routes to PRF via Specialist_Handoff topic


TROUBLESHOOTING
---------------

Topic Not Triggering:
- Verify topic status is On
- Check for conflicting trigger phrases in other topics
- Republish the agent after changes

Transfer Failing:
- Verify target agent is published
- Verify target agent is in the transfer list
- Check Settings then Agent transfers configuration

Generative Answers Not Working:
- Verify Generative AI is enabled in Settings
- Verify knowledge sources are connected and indexed
- Check that Activity.Text is set as the input

Fallback Triggering Too Often:
- Add more diverse trigger phrases to Conversation topic
- Check that phrases are not too specific


DOCUMENT VERSION HISTORY
------------------------

Version 7.0 - January 2026
- Initial conversational pattern architecture
- Reduced from 30 topics to 23 topics
- Shifted intelligence from topic structure to instructions and KB
- Added generative answers as primary response mechanism
