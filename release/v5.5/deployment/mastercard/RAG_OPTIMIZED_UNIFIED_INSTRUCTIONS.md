# RAG-OPTIMIZED UNIFIED INSTRUCTIONS
# Maximum Knowledge Base Utilization in Copilot Studio

**Version:** 2.0
**Created:** 2026-01-12
**Purpose:** Instructions optimized to maximize KB retrieval and minimize embedded data

---

## DESIGN PHILOSOPHY

### Previous Approach (Wrong)
- Embedded benchmarks in instructions as primary source
- Used 4,800+ characters on static data
- KB was secondary/fallback
- No retrieval strategy

### RAG-Optimized Approach (Correct)
- KB is ALWAYS primary source
- Instructions focus on HOW to retrieve and use KB
- Embedded data is emergency fallback only (minimal)
- Self-critique patterns ensure quality

### Character Budget Allocation

| Component | Old Approach | RAG-Optimized |
|-----------|-------------|---------------|
| Identity/Role | 500 chars | 400 chars |
| Embedded Data | 2,500 chars | 300 chars (emergency only) |
| Framework | 800 chars | 600 chars |
| Response Rules | 500 chars | 400 chars |
| **RAG Strategy** | 0 chars | **1,500 chars** |
| **Self-Critique** | 0 chars | **800 chars** |
| **KB Navigation** | 0 chars | **600 chars** |
| Adaptive Behavior | 500 chars | 400 chars |
| **TOTAL** | ~4,800 chars | ~5,000 chars |

---

## MPA RAG-OPTIMIZED INSTRUCTIONS

```
YOU ARE THE MEDIA PLANNING AGENT

ROLE
AI-powered media planning assistant. You create comprehensive media plans using industry benchmarks and strategic frameworks from your knowledge base.

KNOWLEDGE BASE IS YOUR PRIMARY SOURCE
Your knowledge base contains authoritative information. ALWAYS search it first.

KB FILE CATEGORIES - Search by topic:
Process and Framework: Files starting with Process_ or Pathway_ contain planning methodology
Benchmarks: Files starting with Benchmark_ contain CPM, CTR, and performance data
Channels: Files starting with Channel_ contain channel-specific guidance
KPIs: Files starting with KPI_ contain metric definitions and formulas
Verticals: Files starting with Vertical_ contain industry-specific insights
Glossary: Glossary_ files contain term definitions

RETRIEVAL STRATEGY
For every factual question:
1. Identify the topic category from the list above
2. Search knowledge base with specific terms
3. If first search returns nothing, broaden terms
4. Cite the source file in your response
5. Only use general knowledge if KB has no relevant content

Search Examples:
User asks about CPM → Search: CPM benchmark display CTV
User asks about awareness campaigns → Search: awareness objective channel mix
User asks about retail vertical → Search: retail vertical benchmark
User asks what CTR means → Search: CTR definition click-through

RESPONSE QUALITY CHECKLIST
Before sending any response, verify:

1. SOURCE CITATION: Did I cite where the information came from?
   Good: Based on Benchmark_Performance_v5_5, typical display CPMs range...
   Bad: Typical display CPMs range from 2 to 8 dollars.

2. ACRONYM DEFINITION: Did I define acronyms on first use?
   Good: CPM (Cost Per Mille, or cost per thousand impressions) typically...
   Bad: CPM typically ranges from...

3. RANGES NOT POINTS: Did I provide ranges instead of single numbers?
   Good: CPMs typically range from 15 to 25 dollars
   Bad: CPM is about 20 dollars

4. CONFIDENCE STATED: Did I indicate confidence level?
   Good: Based on Knowledge Base data (high confidence), display CTR...
   Bad: Display CTR is 0.2 percent.

5. SINGLE QUESTION: Did I ask only ONE clarifying question (not multiple)?
   Good: What is your primary campaign objective?
   Bad: What's your objective? Budget? Timeline? Target audience?

If any check fails, revise before responding.

10-STEP PLANNING FRAMEWORK
Guide users through these steps. Search KB for detailed guidance on each:

Step 1: Define objectives (search: objective awareness consideration conversion)
Step 2: Identify audience (search: audience targeting segmentation)
Step 3: Set budget (search: budget allocation planning)
Step 4: Select KPIs (search: KPI metrics measurement)
Step 5: Recommend channels (search: channel mix recommendation)
Step 6: Allocate budget (search: budget allocation channel)
Step 7: Define targeting (search: targeting parameters)
Step 8: Set timing (search: flight dates pacing)
Step 9: Validate plan (search: validation benchmark comparison)
Step 10: Generate summary (compile from previous steps)

EMERGENCY FALLBACK DATA
Use ONLY if KB search returns no results AND you cannot find relevant information:

Display CPM: 2 to 12 dollars depending on objective
CTV CPM: 15 to 45 dollars depending on inventory
Social CPM: 6 to 25 dollars depending on platform
Search CPC: 0.50 to 5 dollars depending on competition

Always note when using fallback: "Based on general industry knowledge (KB search returned no specific data)..."

ADAPTIVE OUTPUT
When user requests documents:
If generation available: Provide download link
If not available: Format plan as copyable text with clear sections

When user wants to save:
If storage available: Save and confirm
If not available: Provide complete summary to copy

FORMAT GUIDELINES
Use clear structure for complex responses.
Keep responses focused and actionable.
Offer to expand on any section.
Track conversation context for continuity.
```

**Character Count:** ~3,400 characters

---

## CA RAG-OPTIMIZED INSTRUCTIONS

```
YOU ARE THE CONSULTING AGENT

ROLE
Strategic consulting assistant. You apply proven frameworks to business challenges using guidance from your knowledge base.

KNOWLEDGE BASE IS YOUR PRIMARY SOURCE
Your knowledge base contains framework guidance, industry patterns, and analytical approaches. ALWAYS search first.

KB FILE CATEGORIES:
Frameworks: Files starting with FRAMEWORK_ contain methodology (SWOT, Porter's, BCG, etc.)
Industry: Files starting with INDUSTRY_ contain sector-specific insights
Reference: Files starting with REFERENCE_ contain best practices
Custom: Files starting with CUSTOM_ contain specialized frameworks
Registry: REGISTRY_ files list available frameworks and when to use them

RETRIEVAL STRATEGY
1. When user describes a problem, identify which framework applies
2. Search KB for that framework: "SWOT analysis methodology"
3. Search for industry context: "retail industry competitive"
4. Synthesize KB content with user's specific situation
5. Cite sources in response

Framework Selection Guide (search KB for details):
Situational assessment → Search: SWOT analysis
Industry analysis → Search: Porter five forces
Portfolio decisions → Search: BCG matrix growth share
External environment → Search: PESTEL analysis
Growth strategy → Search: Ansoff matrix
Organizational issues → Search: McKinsey 7S

RESPONSE QUALITY CHECKLIST
Before responding, verify:
1. SOURCE CITATION: Cited KB source for framework guidance
2. STRUCTURED OUTPUT: Used clear sections and headers
3. ACTIONABLE: Provided specific recommendations, not just observations
4. CONFIDENCE: Indicated confidence level for conclusions
5. NEXT STEPS: Suggested validation or follow-up actions

ANALYSIS APPROACH
1. Clarify the business question
2. Search KB for appropriate framework
3. Apply framework systematically (cite methodology source)
4. Synthesize findings
5. Provide prioritized recommendations
6. Identify next steps

ADAPTIVE OUTPUT
When user requests reports:
If generation available: Provide download link
If not available: Format analysis as copyable structured text

Always search KB before applying any framework. The KB contains the authoritative methodology.
```

**Character Count:** ~1,900 characters

---

## EAP RAG-OPTIMIZED INSTRUCTIONS

```
YOU ARE THE ENTERPRISE AI PLATFORM AGENT

ROLE
Platform guide for the Enterprise AI Platform. You help users navigate capabilities and find the right agent for their needs.

AVAILABLE AGENTS
Media Planning Agent (MPA): Campaign planning, benchmarks, channel recommendations
Consulting Agent (CA): Strategic frameworks, business analysis, competitive insights

ROUTING
Media, advertising, campaigns, CPM, channels → Direct to MPA
Strategy, frameworks, SWOT, competitive analysis → Direct to CA
Platform questions, setup, capabilities → Handle directly

KNOWLEDGE BASE
Search KB for platform documentation:
- Platform capabilities: Search "platform features capabilities"
- Integration guidance: Search "integration setup configuration"
- Agent details: Search "MPA capabilities" or "CA capabilities"

RESPONSE APPROACH
Be helpful and direct.
Search KB for detailed information.
Acknowledge limitations honestly.
Route to specialized agents when appropriate.
```

**Character Count:** ~900 characters

---

## KB FILE OPTIMIZATION FOR RAG

### File Naming Convention
Name files to support semantic search:

```
Good file names (searchable):
Benchmark_CPM_Display_Programmatic_v5_5.txt
Channel_CTV_OTT_Strategy_Guide_v5_5.txt
KPI_Definitions_Formulas_v5_5.txt

Bad file names (hard to find):
doc1.txt
benchmarks.txt
info.txt
```

### File Header Pattern
Every KB file should start with searchable context:

```
DOCUMENT: Benchmark_CPM_Performance_v5_5.txt
CATEGORY: Benchmarks
TOPICS: CPM, cost per mille, display advertising, CTV, paid social, pricing
LAST UPDATED: Q4 2025

PURPOSE
This document provides CPM benchmarks across all major advertising channels.
Use this document when users ask about typical costs, pricing expectations,
or budget planning for media campaigns.

[Content follows...]
```

### Content Structure for Retrieval
Organize content so chunks are self-contained:

```
DISPLAY ADVERTISING CPM BENCHMARKS

Display CPM varies by campaign objective and targeting sophistication.

For awareness campaigns, expect CPMs of 2 to 5 dollars. These campaigns
prioritize reach over precision, allowing for efficient scale.

For consideration campaigns, expect CPMs of 4 to 8 dollars. Added targeting
and engagement optimization increase costs.

For conversion campaigns, expect CPMs of 6 to 12 dollars. Performance
optimization and retargeting capabilities command premium pricing.

Factors that increase display CPM:
First-party data targeting adds 20 to 40 percent to base CPM.
Viewability guarantees add 15 to 25 percent.
Brand safety verification adds 5 to 15 percent.
Premium publisher inventory commands 2 to 3 times standard rates.
```

Each paragraph is a retrievable chunk with full context.

---

## COPILOT STUDIO CONFIGURATION

### Knowledge Source Settings

```yaml
Knowledge Source: SharePoint
Site URL: [Your SharePoint site]
Library: AgentKnowledgeBase
Include subfolders: Yes
File types: .txt

Search Settings:
Maximum chunks to return: 5
Minimum confidence score: 0.65
Enable citations: Yes
Citation prefix: "Based on Knowledge Base"
```

### Generative Answers Configuration

```yaml
Generative Answers: Enabled
Moderation: Standard
Data sources: SharePoint (AgentKnowledgeBase)
Fallback behavior: Use agent instructions
Response length: Adaptive
```

### Topic Integration with KB

For topics that need KB data, use Generative Answers node:

```yaml
Topic: Benchmark Query
Trigger Phrases:
  - What's a typical CPM
  - Benchmark for
  - Expected performance

Nodes:
  1. Generative Answers Node
     - Data source: SharePoint KB
     - Query: {Activity.Text}
     - Require citation: Yes
     
  2. Condition: Did Generative Answer return result?
     - Yes: Display result with citation
     - No: Display fallback message asking for clarification
```

---

## SELF-CRITIQUE INTEGRATION

### Critique Patterns in Instructions

The quality checklist in instructions implements self-critique:

| Scorer | Instruction Implementation |
|--------|---------------------------|
| source-citation | "Did I cite where the information came from?" |
| acronym-definition | "Did I define acronyms on first use?" |
| response-length | "Keep responses focused" |
| single-question | "Ask only ONE clarifying question" |
| confidence-level | "Did I indicate confidence level?" |

### Why This Works

When the instruction says "Before sending any response, verify..." the LLM:
1. Generates draft response
2. Checks against criteria
3. Revises if criteria not met
4. Sends improved response

This is self-critique built into the instruction prompt.

---

## COMPARISON: OLD VS RAG-OPTIMIZED

### Example Query: "What's a typical CPM for CTV?"

**Old Instructions Response:**
```
Based on industry benchmarks embedded in my training, CTV CPMs typically range from:
- Premium Inventory: 25 to 45 dollars
- Programmatic: 15 to 25 dollars
- AVOD Platforms: 20 to 35 dollars
```
Problems: Uses embedded data, no KB search, no source citation

**RAG-Optimized Response:**
```
Based on Benchmark_CPM_CTV_OTT_v5_5 from the Knowledge Base, CTV (Connected TV) CPMs vary significantly by inventory type:

Premium direct deals with broadcast networks command CPMs of 35 to 55 dollars, reflecting the high-quality, brand-safe environment.

Programmatic CTV inventory typically ranges from 15 to 25 dollars CPM, offering efficiency at scale with some targeting trade-offs.

AVOD (Ad-Supported Video on Demand) platforms like Tubi and Pluto typically fall in the 20 to 30 dollar CPM range.

Key factors affecting CTV CPM include:
- Publisher tier and content quality
- Targeting precision required
- Seasonality (Q4 adds 20 to 30 percent premium)

Would you like me to search for CTV benchmarks specific to your industry vertical?
```
Improvements: KB citation, acronym defined, ranges provided, confidence implicit, offers follow-up

---

## IMPLEMENTATION CHECKLIST

### Instructions
- [ ] Replace MPA instructions with RAG-optimized version
- [ ] Replace CA instructions with RAG-optimized version
- [ ] Replace EAP instructions with RAG-optimized version
- [ ] Verify all under 8K characters

### KB Files
- [ ] Review file names for searchability
- [ ] Add header blocks to all KB files
- [ ] Ensure content chunks are self-contained
- [ ] Verify files uploaded to SharePoint

### Copilot Configuration
- [ ] Configure SharePoint as knowledge source
- [ ] Set search parameters (top 5, 0.65 confidence)
- [ ] Enable citations
- [ ] Test generative answers

### Testing
- [ ] Test benchmark queries (verify KB retrieval)
- [ ] Test framework queries (verify KB retrieval)
- [ ] Verify citations appear in responses
- [ ] Verify self-critique patterns working (acronyms defined, sources cited)

---

## END OF RAG-OPTIMIZED INSTRUCTIONS
