MPA V7 CONVERSATIONAL TOPIC CREATION GUIDE
==========================================

Purpose: Step-by-step instructions for creating the minimal topic structure
that supports the conversational agent pattern introduced in v7.
Date: January 2026
Version: 7.1

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


HOW TO CREATE A TOPIC
---------------------

Step 1: Open your agent in Copilot Studio

Step 2: Click Topics in left navigation

Step 3: Click + New topic then From blank

Step 4: Configure basic settings
- Enter the Name (internal identifier)
- Enter the Display name (what appears in UI)

Step 5: Configure the trigger
- Click Edit next to the trigger section
- In the box labeled Describe what the topic does enter a natural language
  description of when this topic should activate
- The AI uses this description to match user intent and route to this topic
- Be specific and include example phrases users might say

Step 6: Add nodes below the trigger
- Click + Add node to add message nodes, question nodes, or transfer nodes

Step 7: Save the topic



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

Step 3: Configure the trigger
- Click Edit next to the trigger section
- In the Describe what the topic does box enter:

This topic handles greetings and welcome messages when users say hello, hi, hey, good morning, good afternoon, good evening, start, begin, get started, help me, I need help, help me plan, media planning, let us begin, or any other greeting or conversation starter.

Step 4: Add message node
- Click + Add node below the trigger
- Select Send a message
- Enter this message:

Welcome! I am your media planning advisor. I help you think through campaign strategy - from budget and audience to channels and measurement.

What are you working on today? You can tell me about a specific challenge, ask me to help with a particular aspect of planning, or we can start fresh with a new campaign.

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

Step 3: Configure the trigger
- Click Edit next to the trigger section
- In the Describe what the topic does box enter:

This topic handles general conversation and requests when users say I want to, I need to, can you help, tell me about, what should, how do I, help me with, I am trying to, let us work on, can we discuss, what do you think, walk me through, explain, show me, or any other general request for help with media planning that does not specifically request a specialist.

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

Step 3: Configure the trigger
- Click Edit next to the trigger section
- In the Describe what the topic does box enter:

This topic handles when users explicitly request a specialist by saying connect me with analytics, route to analytics, I need the analytics specialist, transfer to ANL, connect me with audience, route to audience, transfer to AUD, connect me with channel, transfer to CHA, connect me with supply path, transfer to SPO, connect me with document, transfer to DOC, connect me with performance, transfer to PRF, or let me talk to a specialist.

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

Step 3: Configure the trigger
- Click Edit next to the trigger section
- In the Describe what the topic does box enter:

This topic handles when users return from a specialist agent and say I am back, back to main, return to orchestrator, continue with planning, what is next, move forward, back to workflow, continue, proceed, or any indication they want to return to the main planning flow.

Step 4: Add message node
- Click + Add node then Send a message
- Enter this message:

Welcome back! Based on the work with the specialist, what would you like to focus on next? We can continue building the plan, explore another area, or I can summarize where things stand.

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
- For the Fallback topic, look for a system trigger option
- Select On Unrecognized or Unrecognized user input
- This is a special trigger that fires when no other topic matches
- You do not enter a description for this trigger type

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

Step 3: Configure the trigger
- Click Edit next to the trigger section
- In the Describe what the topic does box enter:

This topic handles greetings when users are transferred to the Analytics Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

Step 4: Add message node
- Click + Add node then Send a message
- Enter this message:

I am the Analytics Agent. I help with quantitative analysis - budget optimization, scenario modeling, performance projections, and statistical approaches.

What would you like to analyze? If you tell me about your situation, I can suggest the most useful calculations.

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

Step 3: Configure the trigger
- Click Edit next to the trigger section
- In the Describe what the topic does box enter:

This topic handles analytics requests when users ask to calculate, project, forecast, analyze, discuss budget, run scenarios, do what-if analysis, compare options, model outcomes, estimate results, ask how much, discuss ROI, ROAS, marginal returns, efficiency, diminishing returns, confidence levels, statistical analysis, or any quantitative analysis request.

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

Step 3: Configure the trigger
- Click Edit next to the trigger section
- In the Describe what the topic does box enter:

This topic handles when users want to leave the Analytics Agent by saying go back, return to main, back to orchestrator, I need help with something else, route me back, transfer back, that is all for analytics, done with analysis, move on, what is next in the workflow, or any indication they want to return to the main orchestrator.

Step 4: Add message node
- Click + Add node then Send a message
- Enter this message:

I will connect you back to the Orchestrator to continue with your plan.

Step 5: Add transfer node
- Click + Add node then Topic management then Transfer conversation
- Select Transfer to another copilot
- Choose: MPA Orchestrator Agent

Step 6: Save the topic



SPECIALIST TOPIC TEMPLATES
--------------------------

Apply the same 3-topic pattern to each remaining specialist agent.
Below are the trigger descriptions and messages for each.


AUD (AUDIENCE AGENT) TOPICS

AUD Greeting Trigger Description:
This topic handles greetings when users are transferred to the Audience Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

AUD Greeting Message:
I am the Audience Agent. I help with segmentation strategy, targeting approaches, LTV modeling, and customer journey analysis.

Tell me about your campaign or customer base, and I will help identify the most effective audience strategy.

AUD Conversation Trigger Description:
This topic handles audience requests when users ask about audience, segments, targeting, personas, LTV, customers, journey mapping, who should we reach, demographics, propensity, lifetime value, segmentation strategy, targeting approach, or any audience-related analysis.

AUD Return Trigger Description:
This topic handles when users want to leave the Audience Agent by saying go back, return to main, back to orchestrator, done with audience, move on, what is next, or any indication they want to return to the main orchestrator.

AUD Return Message:
I will connect you back to the Orchestrator to continue with your plan.


CHA (CHANNEL AGENT) TOPICS

CHA Greeting Trigger Description:
This topic handles greetings when users are transferred to the Channel Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

CHA Greeting Message:
I am the Channel Agent. I help with channel selection, media mix strategy, allocation decisions, and emerging channel evaluation.

What channels or media mix questions can I help you work through?

CHA Conversation Trigger Description:
This topic handles channel requests when users ask about channels, media mix, allocation, CTV, display, social, programmatic, where should we advertise, which channels, television, digital, video, audio, out of home, retail media, or any channel selection and media mix question.

CHA Return Trigger Description:
This topic handles when users want to leave the Channel Agent by saying go back, return to main, back to orchestrator, done with channels, move on, what is next, or any indication they want to return to the main orchestrator.

CHA Return Message:
I will connect you back to the Orchestrator to continue with your plan.


SPO (SUPPLY PATH AGENT) TOPICS

SPO Greeting Trigger Description:
This topic handles greetings when users are transferred to the Supply Path Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

SPO Greeting Message:
I am the Supply Path Agent. I help with programmatic optimization, DSP and SSP evaluation, fee analysis, and supply chain transparency.

What programmatic or supply path questions can I help you analyze?

SPO Conversation Trigger Description:
This topic handles supply path requests when users ask about supply path, DSP, SSP, programmatic, fees, transparency, NBI, partners, vendors, ad tech, bidding, inventory, exchange, take rate, or any programmatic optimization question.

SPO Return Trigger Description:
This topic handles when users want to leave the Supply Path Agent by saying go back, return to main, back to orchestrator, done with supply path, move on, what is next, or any indication they want to return to the main orchestrator.

SPO Return Message:
I will connect you back to the Orchestrator to continue with your plan.


DOC (DOCUMENT AGENT) TOPICS

DOC Greeting Trigger Description:
This topic handles greetings when users are transferred to the Document Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

DOC Greeting Message:
I am the Document Agent. I help with media brief creation, report generation, and document formatting and export.

What document would you like me to help you create?

DOC Conversation Trigger Description:
This topic handles document requests when users ask about documents, briefs, reports, exports, generating documents, creating media plan documents, summaries, templates, formatting, PDF, Word, presentations, or any document creation request.

DOC Return Trigger Description:
This topic handles when users want to leave the Document Agent by saying go back, return to main, back to orchestrator, done with document, move on, what is next, or any indication they want to return to the main orchestrator.

DOC Return Message:
I will connect you back to the Orchestrator to continue with your plan.


PRF (PERFORMANCE AGENT) TOPICS

PRF Greeting Trigger Description:
This topic handles greetings when users are transferred to the Performance Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

PRF Greeting Message:
I am the Performance Agent. I help with attribution analysis, anomaly detection, incrementality testing, and optimization recommendations.

What performance questions or campaign results would you like me to analyze?

PRF Conversation Trigger Description:
This topic handles performance requests when users ask about performance, attribution, anomalies, optimization, incrementality, results, KPIs, metrics, why did something drop, why did something increase, testing, measurement, MTA, MMM, or any performance analysis question.

PRF Return Trigger Description:
This topic handles when users want to leave the Performance Agent by saying go back, return to main, back to orchestrator, done with performance, move on, what is next, or any indication they want to return to the main orchestrator.

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
- Check if the trigger description is too narrow or too broad
- Ensure no other topic has a conflicting description
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
- Make trigger descriptions more specific in other topics
- Add more example phrases to trigger descriptions

Wrong Topic Triggering:
- Make trigger descriptions more distinct from each other
- Add negative examples if needed (this topic does NOT handle...)


DOCUMENT VERSION HISTORY
------------------------

Version 7.1 - January 2026
- Updated to use new Copilot Studio trigger format
- Replaced trigger phrases with Describe what the topic does descriptions
- Added detailed instructions for the new interface

Version 7.0 - January 2026
- Initial conversational pattern architecture
- Reduced from 30 topics to 23 topics
- Shifted intelligence from topic structure to instructions and KB
- Added generative answers as primary response mechanism
