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

Step 1: Open the agent in Copilot Studio

Step 2: Click Topics in the left navigation

Step 3: Click + New topic then From blank

Step 4: Configure the topic name
- Click the topic name at the top to edit it
- Enter the Name (internal identifier)

Step 5: Configure the trigger description
- Click in the box labeled Describe what the topic does
- Write a natural language description of when this topic should activate
- The AI uses this description to match user intent
- Include key phrases and scenarios the topic should handle

Step 6: Add nodes below the trigger
- Click + Add node to add message nodes, question nodes, or actions

Step 7: Save the topic by clicking Save in the top right

HOW TO ADD A MESSAGE NODE
-------------------------

Step 1: Click + Add node below the trigger or previous node

Step 2: Select Send a message

Step 3: Type or paste the message text in the box

Step 4: Click outside the box to confirm

HOW TO ADD A GENERATIVE ANSWERS NODE
------------------------------------

Step 1: Click + Add node

Step 2: Select Advanced then Generative answers

Step 3: Configure the Input field as Activity.Text

Step 4: Select all connected knowledge sources

Step 5: Leave other settings as default

HOW TO ADD A TRANSFER NODE
--------------------------

Step 1: Click + Add node

Step 2: Select Topic management

Step 3: Select Transfer conversation

Step 4: Select Transfer to another copilot

Step 5: Choose the target agent from the dropdown

Step 6: Save the topic



ORC TOPIC CREATION
------------------

ORC TOPIC 1: GREETING

Name: Greeting

Trigger Description (paste into Describe what the topic does):
This topic handles greetings and welcome messages when users say hello, hi, hey, good morning, good afternoon, good evening, start, begin, get started, help me, I need help, help me plan, media planning, let us begin, or any other greeting or conversation starter.

Message Node:
Welcome! I am your media planning advisor. I help you think through campaign strategy - from budget and audience to channels and measurement.

What are you working on today? You can tell me about a specific challenge, ask me to help with a particular aspect of planning, or we can start fresh with a new campaign.

Then Add: Generative answers node with Activity.Text input


ORC TOPIC 2: CONVERSATION

Name: Conversation

Trigger Description (paste into Describe what the topic does):
This topic handles general conversation and requests when users say I want to, I need to, can you help, tell me about, what should, how do I, help me with, I am trying to, let us work on, can we discuss, what do you think, walk me through, explain, show me, or any other general request for help with media planning that does not specifically request a specialist.

Then Add: Generative answers node with Activity.Text input


ORC TOPIC 3: SPECIALIST HANDOFF

Name: Specialist_Handoff

Trigger Description (paste into Describe what the topic does):
This topic handles when users explicitly request a specialist by saying connect me with analytics, route to analytics, I need the analytics specialist, transfer to ANL, connect me with audience, route to audience, transfer to AUD, connect me with channel, transfer to CHA, connect me with supply path, transfer to SPO, connect me with document, transfer to DOC, connect me with performance, transfer to PRF, or let me talk to a specialist.

Question Node:
- Question text: Which specialist would be most helpful?
- Identify: Multiple choice
- Options:
  - Analytics (budget, projections, scenarios)
  - Audience (segments, targeting, LTV)
  - Channels (media mix, channel selection)
  - Supply Path (programmatic, DSP/SSP)
  - Document (briefs, reports)
  - Performance (attribution, optimization)
- Save response as: Topic.SpecialistChoice

Condition Node with 6 branches:
- If Analytics selected: Transfer to MPA Analytics Agent
- If Audience selected: Transfer to MPA Audience Agent
- If Channels selected: Transfer to MPA Channel Agent
- If Supply Path selected: Transfer to MPA Supply Path Agent
- If Document selected: Transfer to MPA Document Agent
- If Performance selected: Transfer to MPA Performance Agent


ORC TOPIC 4: RETURN FROM SPECIALIST

Name: Return_From_Specialist

Trigger Description (paste into Describe what the topic does):
This topic handles when users return from a specialist agent and say I am back, back to main, return to orchestrator, continue with planning, what is next, move forward, back to workflow, continue, proceed, or any indication they want to return to the main planning flow.

Message Node:
Welcome back! Based on the work with the specialist, what would you like to focus on next? We can continue building the plan, explore another area, or I can summarize where things stand.

Then Add: Generative answers node with Activity.Text input


ORC TOPIC 5: FALLBACK

Name: Fallback

Trigger: System trigger On Unrecognized (not a description)

Note: The Fallback topic uses a special system trigger that activates when no other topic matches. Look for an option to set the trigger type to On Unrecognized or Unrecognized user input instead of entering a description.

Then Add: Generative answers node with Activity.Text input



ANL TOPIC CREATION
------------------

ANL TOPIC 1: GREETING

Name: Greeting

Trigger Description (paste into Describe what the topic does):
This topic handles greetings when users are transferred to the Analytics Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

Message Node:
I am the Analytics Agent. I help with quantitative analysis - budget optimization, scenario modeling, performance projections, and statistical approaches.

What would you like to analyze? If you tell me about your situation, I can suggest the most useful calculations.

Then Add: Generative answers node with Activity.Text input


ANL TOPIC 2: CONVERSATION

Name: Conversation

Trigger Description (paste into Describe what the topic does):
This topic handles analytics requests when users ask to calculate, project, forecast, analyze, discuss budget, run scenarios, do what-if analysis, compare options, model outcomes, estimate results, ask how much, discuss ROI, ROAS, marginal returns, efficiency, diminishing returns, confidence levels, statistical analysis, or any quantitative analysis request.

Then Add: Generative answers node with Activity.Text input


ANL TOPIC 3: RETURN TO ORC

Name: Return_To_ORC

Trigger Description (paste into Describe what the topic does):
This topic handles when users want to leave the Analytics Agent by saying go back, return to main, back to orchestrator, I need help with something else, route me back, transfer back, that is all for analytics, done with analysis, move on, what is next in the workflow, or any indication they want to return to the main orchestrator.

Message Node:
I will connect you back to the Orchestrator to continue with your plan.

Then Add: Transfer node to MPA Orchestrator Agent



SPECIALIST TOPIC TEMPLATES
--------------------------

Apply the same 3-topic pattern to each remaining specialist agent.
Below are the trigger descriptions and messages for each.


AUD (AUDIENCE AGENT)

Greeting Trigger Description:
This topic handles greetings when users are transferred to the Audience Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

Greeting Message:
I am the Audience Agent. I help with segmentation strategy, targeting approaches, LTV modeling, and customer journey analysis. Tell me about your campaign or customer base, and I will help identify the most effective audience strategy.

Conversation Trigger Description:
This topic handles audience requests when users ask about audience, segments, targeting, personas, LTV, customers, journey mapping, who should we reach, demographics, propensity, lifetime value, segmentation strategy, targeting approach, or any audience-related analysis.

Return Trigger Description:
This topic handles when users want to leave the Audience Agent by saying go back, return to main, back to orchestrator, done with audience, move on, what is next, or any indication they want to return to the main orchestrator.

Return Message:
I will connect you back to the Orchestrator to continue with your plan.


CHA (CHANNEL AGENT)

Greeting Trigger Description:
This topic handles greetings when users are transferred to the Channel Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

Greeting Message:
I am the Channel Agent. I help with channel selection, media mix strategy, allocation decisions, and emerging channel evaluation. What channels or media mix questions can I help you work through?

Conversation Trigger Description:
This topic handles channel requests when users ask about channels, media mix, allocation, CTV, display, social, programmatic, where should we advertise, which channels, television, digital, video, audio, out of home, retail media, or any channel selection and media mix question.

Return Trigger Description:
This topic handles when users want to leave the Channel Agent by saying go back, return to main, back to orchestrator, done with channels, move on, what is next, or any indication they want to return to the main orchestrator.

Return Message:
I will connect you back to the Orchestrator to continue with your plan.


SPO (SUPPLY PATH AGENT)

Greeting Trigger Description:
This topic handles greetings when users are transferred to the Supply Path Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

Greeting Message:
I am the Supply Path Agent. I help with programmatic optimization, DSP and SSP evaluation, fee analysis, and supply chain transparency. What programmatic or supply path questions can I help you analyze?

Conversation Trigger Description:
This topic handles supply path requests when users ask about supply path, DSP, SSP, programmatic, fees, transparency, NBI, partners, vendors, ad tech, bidding, inventory, exchange, take rate, or any programmatic optimization question.

Return Trigger Description:
This topic handles when users want to leave the Supply Path Agent by saying go back, return to main, back to orchestrator, done with supply path, move on, what is next, or any indication they want to return to the main orchestrator.

Return Message:
I will connect you back to the Orchestrator to continue with your plan.


DOC (DOCUMENT AGENT)

Greeting Trigger Description:
This topic handles greetings when users are transferred to the Document Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

Greeting Message:
I am the Document Agent. I help with media brief creation, report generation, and document formatting and export. What document would you like me to help you create?

Conversation Trigger Description:
This topic handles document requests when users ask about documents, briefs, reports, exports, generating documents, creating media plan documents, summaries, templates, formatting, PDF, Word, presentations, or any document creation request.

Return Trigger Description:
This topic handles when users want to leave the Document Agent by saying go back, return to main, back to orchestrator, done with document, move on, what is next, or any indication they want to return to the main orchestrator.

Return Message:
I will connect you back to the Orchestrator to continue with your plan.


PRF (PERFORMANCE AGENT)

Greeting Trigger Description:
This topic handles greetings when users are transferred to the Performance Agent and say hello, hi, hey, start, begin, or any greeting when first arriving at this agent.

Greeting Message:
I am the Performance Agent. I help with attribution analysis, anomaly detection, incrementality testing, and optimization recommendations. What performance questions or campaign results would you like me to analyze?

Conversation Trigger Description:
This topic handles performance requests when users ask about performance, attribution, anomalies, optimization, incrementality, results, KPIs, metrics, why did something drop, why did something increase, testing, measurement, MTA, MMM, or any performance analysis question.

Return Trigger Description:
This topic handles when users want to leave the Performance Agent by saying go back, return to main, back to orchestrator, done with performance, move on, what is next, or any indication they want to return to the main orchestrator.

Return Message:
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
Step 4: Click Add agent and select MPA Orchestrator Agent
Step 5: Save settings
Step 6: Publish the agent


KNOWLEDGE SOURCE CONFIGURATION
------------------------------

Ensure each agent has the correct knowledge sources connected:

ORC: EAP folder (shared) and Agents/ORC folder
ANL: EAP folder (shared) and Agents/ANL folder
AUD: EAP folder (shared) and Agents/AUD folder
CHA: EAP folder (shared) and Agents/CHA folder
SPO: EAP folder (shared) and Agents/SPO folder
DOC: EAP folder (shared) and Agents/DOC folder
PRF: EAP folder (shared) and Agents/PRF folder


VALIDATION TESTING
------------------

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
- Expected: Smooth transition to AUD

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

Wrong Topic Triggering:
- Make trigger descriptions more distinct from each other
- Add negative examples if needed (this topic does NOT handle...)


DOCUMENT VERSION HISTORY
------------------------

Version 7.1 - January 2026
- Updated to use new Copilot Studio trigger format
- Replaced trigger phrases with Describe what the topic does descriptions
- Added detailed step-by-step instructions for new interface
- Added how-to sections for message nodes, generative answers, and transfers

Version 7.0 - January 2026
- Initial conversational pattern architecture
- Reduced from 30 topics to 23 topics
- Shifted intelligence from topic structure to instructions and KB
