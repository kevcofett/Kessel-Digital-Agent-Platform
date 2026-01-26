# COPILOT STUDIO STANDALONE MODE
# Maximum Effectiveness Without External Infrastructure

**Version:** 1.0
**Created:** 2026-01-12
**Purpose:** Optimize agent for environments where Dataverse, Power Automate, and Azure are unavailable
**Use Case:** Initial deployment, restricted environments, fallback mode

---

## OVERVIEW

This specification defines how to configure the MPA, CA, and EAP agents to operate effectively using ONLY:
- ✅ Copilot Studio native capabilities
- ✅ SharePoint knowledge base
- ✅ Optimized instructions (within 8K limit)
- ✅ Native topics with embedded logic
- ❌ NO Dataverse
- ❌ NO Power Automate flows
- ❌ NO Azure Functions
- ❌ NO custom APIs

The goal is to achieve 80% of full functionality through careful optimization.

---

## CAPABILITY MATRIX

| Feature | Full Mode | Standalone Mode | Standalone Approach |
|---------|-----------|-----------------|---------------------|
| Conversation | ✅ Full | ✅ Full | Native Copilot |
| KB Retrieval | ✅ Full | ✅ Full | SharePoint + Generative Answers |
| Session Tracking | ✅ Dataverse | ⚠️ Limited | Conversation variables |
| Benchmarks | ✅ Database | ✅ Embedded | KB files + inline data |
| Channel Info | ✅ Database | ✅ Embedded | KB files |
| Document Gen | ✅ Azure Function | ❌ None | Provide formatted text to copy |
| Feedback Capture | ✅ Dataverse | ⚠️ Limited | Log to conversation |
| Learning Loop | ✅ Full pipeline | ❌ None | Manual KB updates |
| Multi-session | ✅ Persistent | ❌ None | Single conversation |

---

## SECTION 1: OPTIMIZED INSTRUCTIONS

### 1.1 Instruction Design Principles

When Dataverse/flows aren't available, the instructions must:
1. **Embed critical reference data** - Include key benchmarks inline
2. **Define pseudo-states** - Track conversation progress with variables
3. **Include decision trees** - Guide without flow logic
4. **Maximize KB utilization** - Reference KB extensively
5. **Provide actionable outputs** - Give copy-paste ready content

### 1.2 MPA Standalone Instructions

```
YOU ARE THE MEDIA PLANNING AGENT (MPA)

ROLE: AI-powered media planning assistant that helps create comprehensive media plans using industry benchmarks and best practices.

CAPABILITIES:
- Guide users through 10-step media planning process
- Provide industry benchmarks from knowledge base
- Recommend channel allocations based on objectives
- Generate formatted plan content for copy/paste
- Answer questions about media planning concepts

CONVERSATION STATE:
Track these in conversation:
- CurrentStep: 1-10 (start at 1)
- Objective: User's campaign objective
- Budget: Campaign budget if provided
- Vertical: Industry vertical if provided
- Channels: Recommended channels

10-STEP FRAMEWORK:
Step 1: Define campaign objectives (awareness, consideration, conversion)
Step 2: Identify target audience and segments
Step 3: Set budget and timeline
Step 4: Select primary KPIs based on objective
Step 5: Recommend channel mix based on objective and budget
Step 6: Allocate budget across channels
Step 7: Define targeting parameters
Step 8: Set flight dates and pacing
Step 9: Review and validate plan
Step 10: Generate plan summary

EMBEDDED BENCHMARKS:
Use these when knowledge base search is unavailable:

Display Advertising CPM by Objective:
- Awareness: 2 to 5 dollars
- Consideration: 4 to 8 dollars
- Conversion: 6 to 12 dollars

CTV/OTT CPM Ranges:
- Premium Inventory: 25 to 45 dollars
- Programmatic: 15 to 25 dollars
- AVOD Platforms: 20 to 35 dollars

Paid Social CPM Ranges:
- Meta (Facebook/Instagram): 8 to 15 dollars
- LinkedIn: 25 to 45 dollars
- TikTok: 6 to 12 dollars

Paid Search CPC Ranges:
- Non-brand: 1 to 5 dollars
- Brand: 0.50 to 2 dollars
- Competitive: 3 to 15 dollars

Typical CTR Benchmarks:
- Display: 0.1 to 0.3 percent
- Native: 0.2 to 0.5 percent
- Paid Social: 0.5 to 1.5 percent
- Paid Search: 2 to 5 percent
- CTV: Not applicable (video completion instead)

Video Completion Rates:
- CTV 15 second: 90 to 95 percent
- CTV 30 second: 85 to 92 percent
- Pre-roll 15 second: 70 to 80 percent
- Pre-roll 30 second: 60 to 75 percent

CHANNEL ALLOCATION BY OBJECTIVE:
Awareness campaigns: CTV 40 percent, Display 30 percent, Paid Social 20 percent, Audio 10 percent
Consideration campaigns: Paid Social 35 percent, Display 25 percent, Native 20 percent, CTV 20 percent
Conversion campaigns: Paid Search 40 percent, Paid Social 30 percent, Display 20 percent, Retargeting 10 percent

RESPONSE FORMAT:
Always cite sources using: "Based on Knowledge Base" or "Based on industry benchmarks"
Include confidence indicators: High, Medium, or Low confidence
Provide ranges rather than single numbers
Explain assumptions and caveats

LIMITATIONS IN THIS MODE:
- Cannot save plans to database
- Cannot generate downloadable documents
- Cannot track sessions across conversations
- Cannot import performance data
Inform user of these limitations when relevant and offer alternatives.

ALTERNATIVE OUTPUTS:
When user requests document generation:
Provide formatted text that user can copy into Word or Google Docs
Use clear headers and bullet points
Include all plan details in structured format

When user wants to save progress:
Summarize current state in copyable format
Suggest user save conversation or copy summary

KNOWLEDGE BASE PRIORITY:
Always search knowledge base first for:
- Detailed benchmark data
- Channel-specific guidance
- KPI definitions and formulas
- Industry vertical insights
Fall back to embedded benchmarks only if KB search returns no results.
```

**Character Count:** ~3,200 characters (leaves room for agent-specific additions)

### 1.3 CA Standalone Instructions

```
YOU ARE THE CONSULTING AGENT (CA)

ROLE: Strategic consulting assistant that applies proven frameworks to business challenges, providing structured analysis and recommendations.

CAPABILITIES:
- Apply consulting frameworks (SWOT, Porter's, BCG, PESTEL, etc.)
- Provide industry analysis and competitive insights
- Structure complex problems into actionable components
- Generate formatted analysis outputs
- Answer strategic consulting questions

FRAMEWORK LIBRARY:
Apply these frameworks based on user needs:

SWOT Analysis:
Use for: Situational assessment, strategic planning
Components: Strengths, Weaknesses, Opportunities, Threats
Output: 2x2 matrix with actionable insights

Porter's Five Forces:
Use for: Industry analysis, competitive positioning
Components: Rivalry, New Entrants, Substitutes, Buyer Power, Supplier Power
Output: Force-by-force assessment with strategic implications

BCG Matrix:
Use for: Portfolio analysis, resource allocation
Components: Stars, Cash Cows, Question Marks, Dogs
Axes: Market Growth Rate vs Relative Market Share

PESTEL Analysis:
Use for: Macro-environment scanning
Components: Political, Economic, Social, Technological, Environmental, Legal
Output: Factor analysis with business implications

Ansoff Matrix:
Use for: Growth strategy selection
Components: Market Penetration, Market Development, Product Development, Diversification
Output: Strategy recommendation based on risk appetite

McKinsey 7-S:
Use for: Organizational alignment
Components: Strategy, Structure, Systems, Shared Values, Skills, Style, Staff
Output: Alignment assessment with gaps identified

Value Chain Analysis:
Use for: Competitive advantage identification
Components: Primary Activities, Support Activities
Output: Cost and differentiation opportunities

ANALYSIS APPROACH:
1. Clarify the business question
2. Select appropriate framework(s)
3. Gather relevant data points
4. Apply framework systematically
5. Synthesize insights
6. Provide actionable recommendations

CONFIDENCE LEVELS:
High confidence: Based on provided data and established frameworks
Medium confidence: Based on industry patterns and analogies
Low confidence: Directional guidance requiring validation

RESPONSE FORMAT:
Structure all analyses with:
- Context summary
- Framework application
- Key findings (prioritized)
- Recommendations (specific and actionable)
- Next steps

KNOWLEDGE BASE USAGE:
Search knowledge base for:
- Industry-specific benchmarks
- Competitive intelligence patterns
- Best practice examples
- Regulatory considerations

LIMITATIONS IN THIS MODE:
- Cannot save analyses to database
- Cannot generate downloadable reports
- Cannot track client history
Provide formatted text outputs that user can copy and refine.
```

**Character Count:** ~2,100 characters

### 1.4 EAP Standalone Instructions

```
YOU ARE THE ENTERPRISE AI PLATFORM AGENT (EAP)

ROLE: Platform guide that helps users navigate AI capabilities, configure integrations, and maximize value from enterprise AI tools.

CAPABILITIES:
- Explain available AI agents and their purposes
- Guide platform configuration and setup
- Provide integration guidance
- Answer questions about AI capabilities
- Route to appropriate specialized agents

AVAILABLE AGENTS:
Media Planning Agent (MPA):
Purpose: Create comprehensive media plans
Best for: Marketing teams, media planners, campaign managers
Key features: Benchmarks, channel recommendations, plan generation

Consulting Agent (CA):
Purpose: Apply strategic frameworks to business challenges
Best for: Strategy teams, consultants, business analysts
Key features: SWOT, Porter's, competitive analysis

PLATFORM CAPABILITIES:
Knowledge Base: Searchable repository of industry insights
Conversation Memory: Context maintained within session
Multi-turn Dialogue: Complex discussions supported
Citation: Sources provided for all recommendations

ROUTING GUIDANCE:
If user asks about:
- Media planning, advertising, campaigns -> Suggest MPA
- Strategy, frameworks, competitive analysis -> Suggest CA
- Platform setup, integration -> Handle directly

INTEGRATION GUIDANCE:
SharePoint Integration:
- Knowledge base documents stored in SharePoint
- Automatic indexing and search
- Document updates reflected in agent knowledge

Teams Integration:
- Access agents directly in Microsoft Teams
- Collaborate on outputs with team members
- Share agent responses in channels

RESPONSE FORMAT:
Be helpful and direct
Explain capabilities clearly
Provide step-by-step guidance when needed
Acknowledge limitations honestly

LIMITATIONS IN THIS MODE:
- Limited session persistence
- No cross-agent memory
- No custom integrations active
Guide users on available functionality.
```

**Character Count:** ~1,600 characters

---

## SECTION 2: STANDALONE TOPICS

### 2.1 Topic Design for Standalone Mode

Without Power Automate flows, topics must:
1. Use **Message nodes** instead of Action nodes
2. Embed **decision logic** in conditions
3. Use **Variables** to track state
4. Provide **formatted outputs** instead of API calls

### 2.2 MPA Standalone Topics

#### Topic: Start Planning (Standalone)
```yaml
Name: Start Planning Session
Trigger Phrases:
  - Start a new media plan
  - Create media plan
  - New campaign
  - Begin planning
Variables:
  - Set Global.CurrentStep = 1
  - Set Global.SessionActive = true
Message: |
  I've started a new planning session!
  
  📋 **Media Planning Framework - Step 1 of 10**
  
  Let's begin by defining your campaign objectives.
  
  What is the primary goal for this campaign?
  
  Common objectives:
  • **Awareness** - Build brand recognition and reach
  • **Consideration** - Drive engagement and interest
  • **Conversion** - Generate leads or sales
  
  Please describe your objective, or choose one of the above.
```

#### Topic: Provide Objective (Standalone)
```yaml
Name: Capture Objective
Trigger Phrases:
  - awareness
  - brand awareness
  - consideration
  - engagement
  - conversion
  - sales
  - leads
Condition: Global.CurrentStep = 1
Variables:
  - Set Global.Objective = [extracted from message]
  - Set Global.CurrentStep = 2
Message: |
  Got it! Your objective is **{Global.Objective}**.
  
  📋 **Step 2 of 10: Target Audience**
  
  Now let's define your target audience.
  
  Please describe:
  • Who are you trying to reach?
  • Any demographic details (age, location, income)?
  • Behavioral or interest-based targeting?
  
  The more specific you are, the better I can recommend channels and tactics.
```

#### Topic: Benchmark Query (Standalone)
```yaml
Name: Benchmark Information
Trigger Phrases:
  - What's a typical CPM
  - Benchmark for
  - Average CTR
  - Expected performance
  - Industry average
Action: Generative Answers (Knowledge Base)
Fallback Message: |
  Based on industry benchmarks, here are typical ranges:
  
  **Display Advertising:**
  • CPM: $2-8 (varies by targeting)
  • CTR: 0.1-0.3%
  
  **CTV/Streaming:**
  • CPM: $15-45 (varies by inventory type)
  • Completion Rate: 85-95%
  
  **Paid Social:**
  • CPM: $6-15 (platform dependent)
  • CTR: 0.5-1.5%
  
  **Paid Search:**
  • CPC: $1-5 (non-brand)
  • CTR: 2-5%
  
  These are median values. Your actual results may vary based on targeting, creative quality, and market conditions.
  
  Would you like more specific benchmarks for a particular channel or vertical?
```

#### Topic: Channel Recommendation (Standalone)
```yaml
Name: Channel Recommendations
Trigger Phrases:
  - What channels should I use
  - Recommend channels
  - Channel mix
  - Where should I advertise
Condition: Global.Objective != null
Message: |
  Based on your objective (**{Global.Objective}**), here's my recommended channel mix:
  
  {IF Global.Objective = "awareness"}
  **Awareness-Focused Mix:**
  • CTV/OTT: 40% - High-impact video reach
  • Programmatic Display: 30% - Scale and frequency
  • Paid Social: 20% - Precise targeting
  • Digital Audio: 10% - Incremental reach
  {ENDIF}
  
  {IF Global.Objective = "consideration"}
  **Consideration-Focused Mix:**
  • Paid Social: 35% - Engagement-driven
  • Programmatic Display: 25% - Retargeting capable
  • Native Advertising: 20% - Content integration
  • CTV/OTT: 20% - Video storytelling
  {ENDIF}
  
  {IF Global.Objective = "conversion"}
  **Conversion-Focused Mix:**
  • Paid Search: 40% - High intent capture
  • Paid Social: 30% - Direct response
  • Programmatic Display: 20% - Retargeting
  • Affiliate/Partners: 10% - Performance-based
  {ENDIF}
  
  Would you like me to explain the rationale for any of these recommendations?
```

#### Topic: Generate Plan Summary (Standalone)
```yaml
Name: Generate Plan Summary
Trigger Phrases:
  - Generate the document
  - Create plan summary
  - Export the plan
  - Show me the plan
  - Plan summary
Condition: Global.SessionActive = true
Message: |
  Here's your media plan summary. You can copy this into a document:
  
  ---
  
  **MEDIA PLAN SUMMARY**
  
  **Campaign Objective:** {Global.Objective}
  
  **Target Audience:** {Global.Audience}
  
  **Budget:** {Global.Budget}
  
  **Flight Dates:** {Global.FlightDates}
  
  **Recommended Channel Mix:**
  {Global.ChannelMix}
  
  **Key Performance Indicators:**
  {Global.KPIs}
  
  **Benchmark Expectations:**
  Based on industry data, expect:
  • Overall CPM: $X-Y range
  • Blended CTR: X-Y% range
  • Expected Reach: X impressions
  
  ---
  
  📋 To save this plan:
  1. Copy the text above
  2. Paste into Word or Google Docs
  3. Add your company branding
  4. Share with stakeholders
  
  Is there anything you'd like me to adjust in this plan?
```

#### Topic: Feedback (Standalone)
```yaml
Name: Provide Feedback
Trigger Phrases:
  - That was helpful
  - Great answer
  - Not helpful
  - Wrong answer
  - Thank you
Message: |
  Thank you for your feedback!
  
  {IF contains(Activity.Text, "not") OR contains(Activity.Text, "wrong")}
  I'm sorry that wasn't helpful. Could you tell me more about what you were looking for? I'll do my best to improve my response.
  {ELSE}
  I'm glad I could help! Is there anything else you'd like assistance with?
  {ENDIF}
  
  💡 **Tip:** For the best results, try to be specific in your questions and provide context about your campaign or business situation.
```

### 2.3 Topic State Management

Since Dataverse isn't available, use Copilot Studio global variables:

```
Global Variables to Create:
- Global.SessionActive (Boolean) - Is session in progress
- Global.CurrentStep (Number) - Current step 1-10
- Global.Objective (Text) - Campaign objective
- Global.Audience (Text) - Target audience description
- Global.Budget (Text) - Budget amount
- Global.Vertical (Text) - Industry vertical
- Global.ChannelMix (Text) - Recommended channels
- Global.KPIs (Text) - Selected KPIs
- Global.FlightDates (Text) - Campaign dates
```

---

## SECTION 3: KNOWLEDGE BASE OPTIMIZATION

### 3.1 KB File Structure for Standalone

Organize KB files to maximize retrieval effectiveness:

```
MPA KB Structure (Standalone Optimized):
├── CORE_Process_Framework_v5_5.txt        # 10-step process
├── CORE_Objective_Mapping_v5_5.txt        # Objective to channel mapping
├── BENCHMARK_CPM_Reference_v5_5.txt       # All CPM benchmarks
├── BENCHMARK_Performance_KPIs_v5_5.txt    # CTR, VCR, etc.
├── CHANNEL_Display_Complete_v5_5.txt      # Display channel details
├── CHANNEL_CTV_OTT_Complete_v5_5.txt      # CTV channel details
├── CHANNEL_Paid_Social_Complete_v5_5.txt  # Social channel details
├── CHANNEL_Paid_Search_Complete_v5_5.txt  # Search channel details
├── VERTICAL_Retail_Benchmarks_v5_5.txt    # Retail-specific data
├── VERTICAL_Finance_Benchmarks_v5_5.txt   # Finance-specific data
└── REFERENCE_Glossary_Terms_v5_5.txt      # Definitions
```

### 3.2 KB File Optimization Rules

For standalone mode, KB files should:

1. **Include complete context** - Don't assume external lookups
2. **Use clear headers** - Help semantic search find content
3. **Embed examples** - Provide concrete illustrations
4. **Include decision guidance** - "Use X when Y"
5. **Cross-reference** - "See also: [filename]"

### 3.3 Example Optimized KB File

```
DOCUMENT: BENCHMARK_CPM_Reference_v5_5.txt

PURPOSE
This document provides comprehensive CPM (Cost Per Mille) benchmarks across all major advertising channels. Use this as the primary reference for CPM-related queries.

DISPLAY ADVERTISING CPM BENCHMARKS

Standard Display (IAB Standard Units):
Awareness campaigns typically see CPMs of 2 to 5 dollars.
Consideration campaigns typically see CPMs of 4 to 8 dollars.
Conversion campaigns typically see CPMs of 6 to 12 dollars.

Factors affecting display CPM:
Premium publishers command 2 to 3 times standard rates.
First-party data targeting adds 20 to 40 percent premium.
Viewability guarantees add 15 to 25 percent premium.
Brand safety verification adds 5 to 15 percent.

CTV AND OTT CPM BENCHMARKS

Premium Inventory (Direct Deals):
Broadcast network apps: 35 to 55 dollars CPM.
Cable network apps: 25 to 40 dollars CPM.
Streaming services (ad-supported tier): 30 to 45 dollars CPM.

Programmatic Inventory:
Open exchange CTV: 15 to 25 dollars CPM.
Private marketplace CTV: 20 to 35 dollars CPM.
Programmatic guaranteed CTV: 25 to 40 dollars CPM.

AVOD Platforms:
Tubi, Pluto, Freevee: 20 to 30 dollars CPM.
Peacock, Paramount+: 25 to 40 dollars CPM.
Hulu, Max: 30 to 45 dollars CPM.

PAID SOCIAL CPM BENCHMARKS

Meta (Facebook and Instagram):
Feed placements: 8 to 15 dollars CPM.
Stories placements: 6 to 12 dollars CPM.
Reels placements: 10 to 18 dollars CPM.
Audience Network: 3 to 8 dollars CPM.

LinkedIn:
Sponsored Content: 25 to 45 dollars CPM.
Message Ads: 30 to 50 dollars CPM.
B2B targeting premium: 20 to 40 percent above base.

TikTok:
In-feed ads: 6 to 12 dollars CPM.
TopView: 50 to 80 dollars CPM (high impact).
Brand effects: Variable based on customization.

X (Twitter):
Promoted tweets: 5 to 10 dollars CPM.
Video views: 8 to 15 dollars CPM.

Pinterest:
Standard pins: 4 to 8 dollars CPM.
Video pins: 8 to 15 dollars CPM.

DIGITAL AUDIO CPM BENCHMARKS

Streaming Audio:
Spotify: 15 to 25 dollars CPM.
Pandora: 10 to 20 dollars CPM.
iHeartRadio: 8 to 18 dollars CPM.

Podcast Advertising:
Host-read ads: 20 to 35 dollars CPM.
Dynamically inserted: 12 to 22 dollars CPM.
Programmatic podcast: 8 to 15 dollars CPM.

NATIVE ADVERTISING CPM BENCHMARKS

Content Recommendation:
Outbrain: 0.50 to 2 dollars CPC (equivalent 5 to 15 dollars CPM).
Taboola: 0.40 to 1.50 dollars CPC (equivalent 4 to 12 dollars CPM).

Premium Native:
Publisher direct native: 15 to 30 dollars CPM.
Programmatic native: 8 to 18 dollars CPM.

RETAIL MEDIA CPM BENCHMARKS

Amazon Advertising:
Sponsored Products: CPC model (1 to 3 dollars).
Sponsored Brands: CPC model (1.50 to 4 dollars).
Sponsored Display: 3 to 8 dollars CPM.
Amazon DSP: 4 to 12 dollars CPM.

Walmart Connect:
Sponsored Products: CPC model (0.75 to 2.50 dollars).
Display: 4 to 10 dollars CPM.

Instacart:
Sponsored Products: CPC model (1 to 3 dollars).
Display: 8 to 18 dollars CPM.

SEASONAL ADJUSTMENTS

Q4 Holiday Premium:
November: 15 to 25 percent increase.
December (first three weeks): 25 to 40 percent increase.
December (last week): 10 to 20 percent decrease.

Other Seasonal Factors:
Back to school (August): 10 to 20 percent increase.
Super Bowl week: 20 to 35 percent increase for video.
Summer (June-August): 5 to 15 percent decrease for B2B.

METHODOLOGY NOTES

All benchmarks represent median values from industry research.
Sources include IAB benchmarks, platform reported data, and agency composites.
Actual CPMs vary based on targeting, creative, and market conditions.
Updated quarterly to reflect market changes.
Last updated: Q4 2025.

See also: BENCHMARK_Performance_KPIs_v5_5.txt for CTR and conversion benchmarks.
See also: CHANNEL files for channel-specific strategic guidance.
```

---

## SECTION 4: PSEUDO-LEARNING SYSTEM

### 4.1 Simulating Learning Without Infrastructure

Without Dataverse and flows, implement a "pseudo-learning" approach:

1. **Conversation-Level Learning**
   - Track what works within the conversation
   - Adjust responses based on user feedback
   - Remember preferences stated in conversation

2. **KB-Based Patterns**
   - Include "common questions" in KB files
   - Embed successful response patterns
   - Document edge cases and solutions

3. **User-Prompted Improvement**
   - Ask for feedback explicitly
   - Offer alternative approaches when first attempt fails
   - Guide users to provide useful context

### 4.2 Feedback Loop Without Storage

```yaml
Topic: Request Feedback
Trigger: After every 3rd response OR after plan completion
Message: |
  Before we continue, I'd like to make sure I'm being helpful.
  
  On a scale of 1-5, how well am I meeting your needs so far?
  
  1 - Not helpful at all
  2 - Somewhat helpful
  3 - Moderately helpful
  4 - Very helpful
  5 - Extremely helpful
  
  Your feedback helps me adjust my approach!
```

### 4.3 Self-Correction Pattern

Embed self-correction in topics:

```yaml
Topic: Clarification After Negative Feedback
Trigger Phrases:
  - That's not what I meant
  - You misunderstood
  - Let me rephrase
  - Not quite right
Message: |
  I apologize for the confusion. Let me try a different approach.
  
  Could you help me understand better by answering:
  
  1. What specific aspect were you asking about?
  2. What type of answer would be most useful?
  3. Is there context I should know about?
  
  With more details, I can provide a more accurate response.
```

---

## SECTION 5: DEPLOYMENT CHECKLIST FOR STANDALONE MODE

### 5.1 Pre-Deployment

- [ ] Optimize instructions for standalone mode (< 8K characters)
- [ ] Create all standalone topics (no flow dependencies)
- [ ] Configure global variables for state tracking
- [ ] Upload all KB files to SharePoint
- [ ] Configure SharePoint as knowledge source
- [ ] Test generative answers with KB

### 5.2 Topic Configuration

- [ ] Create Greeting topic
- [ ] Create Start Planning topic (with variable setting)
- [ ] Create Objective Capture topic (with variable setting)
- [ ] Create Benchmark Query topic (generative answers)
- [ ] Create Channel Recommendation topic (conditional logic)
- [ ] Create Plan Summary topic (formatted output)
- [ ] Create Feedback topic
- [ ] Create Fallback topic
- [ ] Enable all topics

### 5.3 Testing

- [ ] Test complete planning flow (Steps 1-10)
- [ ] Test benchmark queries (verify KB retrieval)
- [ ] Test channel recommendations (verify conditional logic)
- [ ] Test plan summary generation (verify variable interpolation)
- [ ] Test feedback handling
- [ ] Test edge cases and error recovery

### 5.4 User Communication

- [ ] Document limitations of standalone mode
- [ ] Provide workarounds for missing features
- [ ] Create user guide for copy/paste outputs
- [ ] Set expectations for session scope

---

## SECTION 6: UPGRADE PATH

### 6.1 From Standalone to Full Mode

When infrastructure becomes available:

1. **Phase 1: Add Dataverse**
   - Deploy tables per full specification
   - Migrate session tracking to database
   - Import seed data

2. **Phase 2: Add Power Automate**
   - Deploy flows
   - Update topics to use flow actions
   - Enable persistent storage

3. **Phase 3: Add Azure Functions**
   - Deploy document generation
   - Enable real document downloads
   - Add advanced calculations

4. **Phase 4: Enable Learning**
   - Deploy feedback tables
   - Connect feedback flows
   - Begin pattern analysis

### 6.2 Hybrid Mode

Some organizations may have partial infrastructure. Support configurations:

| Configuration | Copilot | SharePoint | Dataverse | Flows | Azure |
|--------------|---------|------------|-----------|-------|-------|
| Minimal | ✅ | ✅ | ❌ | ❌ | ❌ |
| Basic | ✅ | ✅ | ✅ | ❌ | ❌ |
| Standard | ✅ | ✅ | ✅ | ✅ | ❌ |
| Full | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## END OF STANDALONE MODE SPECIFICATION
