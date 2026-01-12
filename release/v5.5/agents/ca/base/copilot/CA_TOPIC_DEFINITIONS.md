# CA COPILOT STUDIO TOPIC DEFINITIONS
# Consulting Agent - Mastercard Deployment

**Created:** 2026-01-12
**Purpose:** Topic configurations for CA in Copilot Studio
**Pattern:** Follows MPA topic structure

---

## TOPIC 1: GREETING

**Name:** Greeting
**Trigger Phrases:**
- Hello
- Hi
- Hey
- Start
- Help
- What can you do

**Message:**
```
Hi, I'm the Consulting Agent - your strategic consulting partner.

I specialize in strategic analysis using proven frameworks across industries including Financial Services, Retail, CPG, and Technology.

I can help you with:
- Competitive analysis (Porter's Five Forces, SWOT)
- Market sizing (TAM/SAM/SOM)
- Strategic planning (Ansoff Matrix, BCG Matrix)
- Customer insights (Jobs-to-be-Done, Journey Mapping)
- Operational improvements (Value Chain, Process Mapping)

What challenge are you working on today?
```

**Nodes:**
1. Message node (above content)
2. Wait for user response

---

## TOPIC 2: START ANALYSIS

**Name:** Start Analysis
**Trigger Phrases:**
- Start analysis
- Begin analysis
- New analysis
- Analyze
- Help me analyze
- I need to analyze

**Nodes:**

1. **Question Node**
   Text: "What type of analysis do you need?"
   Options:
   - Competitive Analysis
   - Market Sizing
   - Strategic Planning
   - Customer Analysis
   - Operational Analysis
   - I'm not sure - help me choose

2. **Set Variable** (based on selection)
   - Global.AnalysisType = [selected option]

3. **Condition: Flow Available?**
   - Yes → Call Power Automate: CA_InitializeSession
   - No → Set Global.SessionID = "standalone-" + Now()

4. **Message Node**
   Text: "Great, I'll help with [Global.AnalysisType]. Tell me about your situation - what industry are you in, and what specific challenge are you facing?"

5. **Wait for user response**

---

## TOPIC 3: SELECT FRAMEWORK

**Name:** Select Framework
**Trigger Phrases:**
- Which framework
- What frameworks
- Show me frameworks
- Framework options
- SWOT
- Porter
- BCG
- Recommend a framework

**Nodes:**

1. **Generative Answers Node**
   - Data source: SharePoint KB (CA folder)
   - Query: "consulting frameworks " + Activity.Text
   - Require citation: Yes

2. **Condition: Did KB return results?**
   - Yes → Display framework options from KB
   - No → Display fallback framework list

3. **Fallback Message:**
```
Based on your needs, I recommend these frameworks:

For competitive analysis:
- Porter's Five Forces - Industry dynamics and competition
- SWOT Analysis - Strengths, weaknesses, opportunities, threats

For strategic planning:
- Ansoff Matrix - Growth strategies
- BCG Matrix - Portfolio analysis

For customer insights:
- Jobs-to-be-Done - Understanding customer needs
- Customer Journey Mapping - Experience optimization

Which framework would you like to apply?
```

4. **Set Variable**
   - Global.SelectedFramework = [user selection]

5. **Condition: Flow Available?**
   - Yes → Call Power Automate: CA_SelectFramework
   - No → Continue in conversation

---

## TOPIC 4: APPLY FRAMEWORK

**Name:** Apply Framework
**Trigger Phrases:**
- Apply framework
- Run analysis
- Execute framework
- Analyze with [framework name]
- Do the analysis

**Nodes:**

1. **Condition: Framework Selected?**
   - Global.SelectedFramework is set → Continue
   - Not set → Redirect to Select Framework topic

2. **Question Node**
   Text: "How detailed should the analysis be?"
   Options:
   - Quick (5-10 minutes) - Executive summary and top findings
   - Standard (15-25 minutes) - Full framework with recommendations
   - Comprehensive (30-45 minutes) - Deep analysis with implementation roadmap

3. **Set Variable**
   - Global.AnalysisDepth = [selected option]

4. **Generative Answers Node**
   - Data source: SharePoint KB
   - Query: Global.SelectedFramework + " framework methodology analysis"
   - Require citation: Yes

5. **Message Node**
   Text: "Applying [Global.SelectedFramework] framework at [Global.AnalysisDepth] depth..."

6. **Condition: Flow Available?**
   - Yes → Call Power Automate: CA_ApplyFramework
   - No → Generate analysis using KB + generative answers

---

## TOPIC 5: GENERATE REPORT

**Name:** Generate Report
**Trigger Phrases:**
- Generate report
- Create document
- Export analysis
- Download report
- Save analysis
- Give me a document

**Nodes:**

1. **Condition: Analysis Complete?**
   - Global.AnalysisType is set AND Global.SelectedFramework is set → Continue
   - Not complete → Message: "Let's complete the analysis first. What would you like to analyze?"

2. **Condition: Document Generation Available?**
   - Yes → Call Power Automate: CA_GenerateDocument
   - No → Generate formatted text output

3. **If Flow Available - Message:**
   "I've generated your [Global.SelectedFramework] analysis report. [Download Link]"

4. **If No Flow - Message:**
```
Here's your analysis summary. You can copy this to your preferred document format:

---
CONSULTING ANALYSIS REPORT
Framework: [Global.SelectedFramework]
Date: [Current Date]
Depth: [Global.AnalysisDepth]

[Analysis content from conversation]

RECOMMENDATIONS
[Recommendations from analysis]

NEXT STEPS
[Action items]
---
```

---

## TOPIC 6: BENCHMARK QUERY

**Name:** Benchmark Query
**Trigger Phrases:**
- Benchmark
- Industry benchmark
- What's typical
- Compare to industry
- KPIs for
- Metrics for

**Nodes:**

1. **Generative Answers Node**
   - Data source: SharePoint KB (CA folder)
   - Query: "benchmark " + Activity.Text
   - Require citation: Yes

2. **Condition: Results Found?**
   - Yes → Display benchmarks with citation
   - No → Display fallback message

3. **Fallback Message:**
```
I don't have specific benchmarks for that in my knowledge base.

For industry benchmarks, I can help you:
- Search for publicly available data
- Apply a benchmarking framework
- Identify key metrics to track

What industry or metric are you interested in?
```

---

## TOPIC 7: PROVIDE FEEDBACK

**Name:** Provide Feedback
**Trigger Phrases:**
- Feedback
- Rate this
- How was that
- Helpful
- Not helpful
- This was good
- This was bad

**Nodes:**

1. **Question Node**
   Text: "How helpful was this analysis?"
   Options:
   - Very helpful
   - Somewhat helpful
   - Not helpful
   - I have specific feedback

2. **Condition: Specific Feedback?**
   - "I have specific feedback" → Ask for details
   - Other → Thank and log

3. **Text Input Node** (if specific feedback)
   Text: "What could I do better?"

4. **Condition: Flow Available?**
   - Yes → Call Power Automate: CA_CaptureFeedback
   - No → Message: "Thank you for the feedback. I'll use this to improve."

5. **Message Node**
   Text: "Thanks for the feedback! Is there anything else I can help you with?"

---

## TOPIC 8: FALLBACK

**Name:** Fallback
**Trigger:** System fallback (no other topic matches)

**Nodes:**

1. **Generative Answers Node**
   - Data source: SharePoint KB (CA folder)
   - Query: Activity.Text
   - Require citation: Yes
   - Content moderation: Standard

2. **Condition: Generative Answer Successful?**
   - Yes → Display answer
   - No → Display fallback message

3. **Fallback Message:**
```
I'm not sure I understood that. I can help you with:

- Strategic analysis using frameworks like SWOT, Porter's, BCG
- Competitive analysis and benchmarking
- Market sizing and opportunity assessment
- Customer insights and journey mapping

What would you like to explore?
```

---

## GLOBAL VARIABLES

| Variable | Type | Purpose |
|----------|------|---------|
| Global.SessionID | String | Analysis session identifier |
| Global.AnalysisType | String | Type of analysis selected |
| Global.SelectedFramework | String | Framework being applied |
| Global.AnalysisDepth | String | Quick/Standard/Comprehensive |
| Global.Industry | String | Client industry context |
| Global.AnalysisComplete | Boolean | Whether analysis is finished |

---

## FLOW CONNECTIONS

| Topic | Flow Called | Purpose |
|-------|-------------|---------|
| Start Analysis | CA_InitializeSession | Create session record |
| Select Framework | CA_SelectFramework | Log framework selection |
| Apply Framework | CA_ApplyFramework | Execute analysis |
| Generate Report | CA_GenerateDocument | Create downloadable report |
| Provide Feedback | CA_CaptureFeedback | Store user feedback |

---

## ADAPTIVE BEHAVIOR NOTES

All topics follow the MPA pattern:
1. Check if infrastructure (flows) is available
2. If yes → use full capability
3. If no → provide formatted text fallback

This ensures CA works in:
- Full environment (all flows connected)
- Standalone mode (Copilot + SharePoint only)

---
