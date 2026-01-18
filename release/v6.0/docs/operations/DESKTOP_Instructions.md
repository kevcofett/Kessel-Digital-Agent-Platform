# MPA v6.0 DESKTOP CLAUDE INSTRUCTIONS

## Content Creation Guide for 37 Knowledge Base Files

**Date:** January 18, 2026  
**Version:** 1.0  
**Target:** Claude Desktop  
**Purpose:** Create all KB content files for MPA v6.0 multi-agent architecture

---

## EXECUTIVE SUMMARY

This document provides complete instructions for Claude Desktop to create 37 knowledge base files across 7 agents plus the EAP shared platform layer. All files must comply with the 6-Rule Compliance Framework for Copilot Studio compatibility.

**Total Files to Create:**
- 7 Instruction files (one per agent)
- 6 EAP Shared KB files
- 7 Core KB files (one per agent except ORC which has routing logic)
- 17 Deep Module KB files

**Critical Requirements:**
- ALL files must be 100% plain text (no markdown formatting in Copilot documents)
- Instruction files: 7,500-7,999 characters exactly
- KB files: 15,000-30,000 characters (varies by file type)
- NEVER truncate or abbreviate content
- Provide download links after each file completion

---

## PART 1: 6-RULE COMPLIANCE FRAMEWORK

**ALL Copilot Studio documents MUST follow these rules:**

### Rule 1: ALL-CAPS HEADERS
```
WRONG: ## Budget Allocation Methods
RIGHT: BUDGET ALLOCATION METHODS
```

### Rule 2: HYPHENS-ONLY LISTS
```
WRONG: â€¢ First item
WRONG: 1. First item  
WRONG: * First item
RIGHT: - First item
```

### Rule 3: ASCII CHARACTERS ONLY
```
WRONG: â†’ â† Â© Â® â„¢ â‚¬ Â£ Â¥ â€¢ â€¦ â€” â€“ " " ' '
RIGHT: -> <- (c) (R) TM - ... -- " '
```

### Rule 4: ZERO VISUAL DEPENDENCIES
```
WRONG: Tables with | characters
WRONG: Code blocks with ``` 
WRONG: Bold **text** or italic *text*
RIGHT: Plain text with clear structure
```

### Rule 5: MANDATORY LANGUAGE
```
WRONG: "You should consider..."
WRONG: "It might be helpful to..."
RIGHT: "MPA MUST verify..."
RIGHT: "Always calculate..."
```

### Rule 6: PROFESSIONAL TONE
```
WRONG: "Hey! Let's figure this out together!"
RIGHT: "This section provides methodology for..."
```

---

## PART 2: FILE STRUCTURE TEMPLATES

### Instruction File Template (~8K chars)

```
[AGENT_CODE] - [AGENT_NAME] AGENT INSTRUCTIONS
Version 1.0

AGENT IDENTITY AND PURPOSE

[Description of agent role and primary responsibility]

CORE CAPABILITIES

- [Capability 1]
- [Capability 2]
- [Capability 3]

KNOWLEDGE BASE FILES

This agent has access to the following KB files:
- [AGENT]_KB_[Name]_Core_v1.txt - [Brief description]
- [AGENT]_KB_[Name]_v1.txt - [Brief description]

CAPABILITY DISPATCH

When calculation or analysis is needed, this agent calls the capability dispatcher with:
- Capability code: [CAPABILITY_CODE]
- Required inputs: [List inputs]
- Expected outputs: [List outputs]

BEHAVIORAL GUIDELINES

[Specific guidance on how agent should behave]

RESPONSE FORMATTING

[Output format requirements]

INTER-AGENT COMMUNICATION

When to escalate or hand off to other agents:
- [Condition] -> Route to [AGENT]
- [Condition] -> Route to [AGENT]

ERROR HANDLING

[How to handle errors gracefully]
```

### Core KB File Template (~25K chars)

```
[AGENT_CODE] CORE KNOWLEDGE BASE
[Topic Area] - Foundational Methodology
Version 1.0

PURPOSE AND SCOPE

This document provides foundational methodology for [domain].
It is retrieved for ALL queries to this agent.

SECTION 1: FOUNDATIONAL PRINCIPLES

[Subsection headers in ALL-CAPS]
[Content with hyphens-only lists]
[Plain text throughout]

SECTION 2: DECISION FRAMEWORKS

[When to use which approach]
[Decision criteria]

SECTION 3: QUALITY STANDARDS

[Guardrails and requirements]

SECTION 4: CROSS-CUTTING GUIDANCE

[Guidance that applies regardless of specific context]

SECTION 5: FALLBACK BEHAVIORS

[What to do when data is incomplete]
[Graceful degradation patterns]
```

### Deep Module KB File Template (~20K chars)

```
[AGENT_CODE] DEEP MODULE
[Specialized Topic] - Advanced Methodology
Version 1.0

PURPOSE AND SCOPE

This document provides specialized methodology for [specific topic].
Retrieved when user query contains [trigger keywords/contexts].

SECTION 1: [TOPIC] FUNDAMENTALS

[Specialized concepts]
[Technical details]

SECTION 2: ALGORITHMS AND FORMULAS

[Step-by-step methods]
[Calculation procedures]

SECTION 3: IMPLEMENTATION GUIDANCE

[How to apply in practice]
[Examples and scenarios]

SECTION 4: EDGE CASES AND LIMITATIONS

[When this approach may not apply]
[Alternative recommendations]

SECTION 5: INTEGRATION WITH OTHER METHODS

[How this connects to other capabilities]
```

---

## PART 3: CREATION PHASES AND FILE SPECIFICATIONS

### PHASE 1: EAP SHARED LAYER (6 files)

All agents reference these files. Create first to establish cross-cutting standards.

---

#### FILE 1.1: EAP_KB_Data_Provenance_v1.txt

**Location:** release/v6.0/platform/eap/kb/  
**Type:** EAP Shared  
**Target Size:** 20,000-25,000 characters  
**Used By:** All 7 agents

**Content Requirements:**

```
EAP DATA PROVENANCE FRAMEWORK
Cross-Agent Data Quality and Citation Standards
Version 1.0

PURPOSE

This document establishes data provenance requirements for all MPA agents.
Every recommendation must cite its data sources with appropriate confidence levels.

SECTION 1: DATA SOURCE HIERARCHY

Tier 1 - Primary Sources (Highest Confidence)
- Client-provided campaign data
- Platform APIs with verified credentials
- First-party analytics systems
- Contracted measurement partners

Tier 2 - Secondary Sources (High Confidence)
- Industry benchmark databases (eMarketer, Nielsen, Comscore)
- Platform-published benchmarks
- Peer-reviewed research
- Trade association reports

Tier 3 - Tertiary Sources (Moderate Confidence)
- Analyst reports and forecasts
- News and trade publications
- Case studies without methodology disclosure
- Expert opinions

Tier 4 - Derived Sources (Lower Confidence)
- Extrapolations from related verticals
- Historical trends applied to new contexts
- Aggregated anonymized data
- Model-generated estimates

SECTION 2: CITATION REQUIREMENTS

All data citations must include:
- Source name and publication date
- Data collection methodology (if known)
- Sample size or coverage (if applicable)
- Any known limitations or biases
- Confidence tier assignment

Format for citations:
[Source Name, Date] - [Brief methodology note] - Tier [X]

SECTION 3: DATA FRESHNESS STANDARDS

Real-time data: Updated within 24 hours
- Platform spend and performance metrics
- Audience signals
- Inventory availability

Recent data: Updated within 30 days
- Campaign benchmarks
- Competitive intelligence
- Market pricing

Periodic data: Updated within 90 days
- Industry benchmarks
- Category trends
- Audience composition

Historical data: Updated annually
- Long-term trend analysis
- Seasonal patterns
- Year-over-year comparisons

SECTION 4: DATA QUALITY VALIDATION

Before using any data source, validate:
- Completeness: Are there significant gaps?
- Consistency: Does it align with other sources?
- Currency: Is it recent enough for the use case?
- Relevance: Does it apply to this vertical/region/context?
- Methodology: Is the collection method appropriate?

Quality flags to surface to users:
- INCOMPLETE: Data has known gaps
- EXTRAPOLATED: Values estimated from related data
- OUTDATED: Data older than recommended freshness
- UNVERIFIED: Source methodology not confirmed
- CONFLICTING: Multiple sources disagree

SECTION 5: PROVENANCE IN OUTPUTS

All MPA outputs must include a data provenance section:
- List all sources used
- Note any quality flags
- Indicate confidence level for key recommendations
- Highlight where primary data would improve accuracy

SECTION 6: HANDLING MISSING DATA

When required data is unavailable:
1. Acknowledge the gap explicitly
2. Identify what proxy data might be used
3. State assumptions being made
4. Quantify uncertainty increase
5. Recommend how to obtain primary data

Never silently substitute lower-quality data.
Always make data limitations visible to users.
```

---

#### FILE 1.2: EAP_KB_Confidence_Levels_v1.txt

**Location:** release/v6.0/platform/eap/kb/  
**Type:** EAP Shared  
**Target Size:** 18,000-22,000 characters  
**Used By:** All 7 agents

**Content Requirements:**

```
EAP CONFIDENCE LEVEL FRAMEWORK
Cross-Agent Uncertainty Communication Standards
Version 1.0

PURPOSE

This document standardizes how all MPA agents communicate uncertainty.
Users must understand the reliability of every recommendation.

SECTION 1: CONFIDENCE LEVEL DEFINITIONS

LEVEL 5 - VERY HIGH CONFIDENCE (90-100% certainty)
Criteria:
- Based on primary client data
- Validated through multiple methods
- Consistent with historical patterns
- Low sensitivity to assumptions
Use language: "MPA strongly recommends..." / "Based on verified data..."

LEVEL 4 - HIGH CONFIDENCE (75-89% certainty)
Criteria:
- Based on high-quality secondary data
- Supported by industry benchmarks
- Reasonable alignment with client context
- Moderate sensitivity to assumptions
Use language: "MPA recommends..." / "Evidence supports..."

LEVEL 3 - MODERATE CONFIDENCE (50-74% certainty)
Criteria:
- Based on proxy or extrapolated data
- Limited validation available
- Some uncertainty in applicability
- Higher sensitivity to assumptions
Use language: "MPA suggests considering..." / "Available data indicates..."

LEVEL 2 - LOW CONFIDENCE (25-49% certainty)
Criteria:
- Significant data gaps
- Heavy reliance on assumptions
- Limited precedent for context
- High sensitivity to inputs
Use language: "With limited data, one approach might be..." / "Consider testing..."

LEVEL 1 - VERY LOW CONFIDENCE (<25% certainty)
Criteria:
- Minimal relevant data
- Novel situation without precedent
- Extreme assumption sensitivity
- Recommendation is speculative
Use language: "Without sufficient data, MPA cannot recommend... however if forced to estimate..."

SECTION 2: CONFIDENCE CALCULATION METHODOLOGY

Base confidence starts at the data source tier:
- Tier 1 source: Start at Level 4-5
- Tier 2 source: Start at Level 3-4
- Tier 3 source: Start at Level 2-3
- Tier 4 source: Start at Level 1-2

Adjust based on:
- Data freshness: -1 level if outdated
- Sample size: -1 level if small/limited
- Context match: -1 level if extrapolated to different context
- Corroboration: +1 level if multiple sources agree
- Validation: +1 level if validated against outcomes

SECTION 3: DISPLAYING CONFIDENCE IN OUTPUTS

Always include confidence indicators in recommendations:

Format for single recommendations:
"[Recommendation text] (Confidence: Level [X] - [Brief rationale])"

Format for tables/lists:
Include a "Confidence" column with Level indicator

Format for projections:
"Projected [metric]: [value] (Confidence: Level [X], Range: [low] to [high])"

SECTION 4: CONFIDENCE AGGREGATION

When combining multiple inputs:
- Overall confidence cannot exceed lowest component confidence
- Document which component is the limiting factor
- Provide confidence for each major input separately

Example:
"Budget recommendation confidence: Level 3
- Channel mix confidence: Level 4
- Benchmark data confidence: Level 3 (limiting factor)
- Timing data confidence: Level 4"

SECTION 5: CONFIDENCE AND DECISION-MAKING

Guide users on how to use confidence levels:

Level 5: Proceed with confidence, standard monitoring
Level 4: Proceed with confidence, enhanced monitoring
Level 3: Proceed with caution, build in contingency, plan for optimization
Level 2: Consider as hypothesis to test, not commitment
Level 1: Do not base major decisions on this; gather more data first

SECTION 6: HANDLING USER REQUESTS FOR HIGHER CONFIDENCE

When users want more certainty than data supports:
1. Acknowledge the desire for certainty
2. Explain what drives current confidence level
3. Identify specific data that would increase confidence
4. Offer to proceed with stated uncertainty
5. Never artificially inflate confidence to satisfy user preference

MPA maintains intellectual honesty about uncertainty.
Overstating confidence erodes trust and leads to poor decisions.
```

---

#### FILE 1.3: EAP_KB_Error_Handling_v1.txt

**Location:** release/v6.0/platform/eap/kb/  
**Type:** EAP Shared  
**Target Size:** 18,000-22,000 characters  
**Used By:** All 7 agents

**Content Requirements:**

```
EAP ERROR HANDLING FRAMEWORK
Cross-Agent Graceful Degradation Patterns
Version 1.0

PURPOSE

This document establishes error handling standards for all MPA agents.
Agents must fail gracefully and provide value even when ideal conditions are not met.

SECTION 1: ERROR CATEGORIES

CATEGORY A - DATA ERRORS
- Missing required inputs
- Invalid data formats
- Conflicting data values
- Outdated data beyond freshness thresholds

CATEGORY B - CAPABILITY ERRORS
- Capability service unavailable
- Calculation timeout
- Unexpected computation result
- Resource limits exceeded

CATEGORY C - CONTEXT ERRORS
- User request unclear
- Missing prerequisite information
- Workflow state inconsistent
- Session context lost

CATEGORY D - INTEGRATION ERRORS
- Inter-agent communication failure
- Dataverse query failure
- External API unavailable
- Authentication/authorization failure

SECTION 2: ERROR RESPONSE PRINCIPLES

Principle 1: NEVER FAIL SILENTLY
- Always acknowledge when something went wrong
- Explain impact on the response
- Provide what value is still possible

Principle 2: DEGRADE GRACEFULLY
- Provide partial results when complete results unavailable
- Use fallback methods when primary methods fail
- Reduce scope rather than refuse entirely

Principle 3: BE SPECIFIC AND ACTIONABLE
- Identify exactly what failed
- Explain what user can do to resolve
- Suggest alternative approaches

Principle 4: MAINTAIN USER TRUST
- Never invent data to fill gaps
- Never present uncertain results as certain
- Always indicate degraded mode operation

SECTION 3: FALLBACK HIERARCHIES

For calculation capabilities:
1. Primary: Azure Function (if available)
2. Fallback 1: AI Builder prompt
3. Fallback 2: Simplified formula in flow
4. Fallback 3: Request manual input with guidance

For data retrieval:
1. Primary: Real-time API/Dataverse query
2. Fallback 1: Cached recent data with freshness warning
3. Fallback 2: Default/typical values with strong caveat
4. Fallback 3: Explain data need and ask user to provide

For complex analysis:
1. Primary: Full methodology
2. Fallback 1: Simplified methodology with limitations noted
3. Fallback 2: Qualitative guidance without quantification
4. Fallback 3: Defer to human expert

SECTION 4: ERROR MESSAGE TEMPLATES

Missing required input:
"To provide [analysis type], MPA needs [missing input].
Please provide [specific data required].
Alternatively, MPA can [fallback option] with reduced accuracy."

Capability timeout:
"The calculation for [capability] is taking longer than expected.
MPA will proceed with [fallback approach].
For full precision, try again or simplify the request."

Data quality issue:
"The available data for [element] has quality concerns: [specific issue].
MPA will proceed with noted limitations.
For higher confidence, provide [better data source]."

Context unclear:
"MPA needs clarification on [specific aspect].
Did you mean [option A] or [option B]?
Please specify to ensure accurate results."

SECTION 5: ERROR LOGGING AND TELEMETRY

All errors must be logged to eap_telemetry with:
- Timestamp
- Session ID
- Agent code
- Error category
- Error details
- Fallback action taken
- User-facing message delivered

This enables:
- Pattern detection for systemic issues
- Capability improvement prioritization
- User experience analysis

SECTION 6: RECOVERY AND RETRY GUIDANCE

For transient errors (capability timeout, service unavailable):
- Automatic retry once with exponential backoff
- If retry fails, use fallback
- Log both original error and retry outcome

For persistent errors (missing data, invalid input):
- Do not retry same request
- Guide user to provide correct input
- Offer alternative approach if available

For session-level errors (context lost):
- Attempt context reconstruction from conversation
- Ask user to confirm key parameters
- Resume from validated state
```

---

#### FILE 1.4: EAP_KB_Formatting_Standards_v1.txt

**Location:** release/v6.0/platform/eap/kb/  
**Type:** EAP Shared  
**Target Size:** 15,000-18,000 characters  
**Used By:** All 7 agents

**Content Requirements:**

```
EAP FORMATTING STANDARDS
Cross-Agent Output Compliance Framework
Version 1.0

PURPOSE

This document establishes formatting standards for all MPA agent outputs.
All outputs must be compatible with Copilot Studio rendering.

SECTION 1: THE 6-RULE COMPLIANCE FRAMEWORK

Rule 1 - ALL-CAPS HEADERS
All section headers must use uppercase letters.
Do not use markdown header syntax (# or ##).
Example: BUDGET ALLOCATION SUMMARY

Rule 2 - HYPHENS-ONLY LISTS
Use only hyphens for bullet points.
Do not use asterisks, numbers, or special bullet characters.
Example:
- First item
- Second item
- Third item

Rule 3 - ASCII CHARACTERS ONLY
Use only standard ASCII characters.
Prohibited characters include:
- Arrows: Use -> instead of right arrow
- Bullets: Use - instead of bullet
- Quotes: Use straight quotes instead of curly quotes
- Dashes: Use -- instead of em dash
- Ellipsis: Use ... instead of ellipsis character

Rule 4 - ZERO VISUAL DEPENDENCIES
Do not rely on formatting that may not render:
- No tables with pipe characters
- No code blocks with backticks
- No bold or italic markdown
- No horizontal rules with special characters

Rule 5 - MANDATORY LANGUAGE
Use definitive, professional language.
- Use "MPA recommends" not "you might consider"
- Use "must" and "should" appropriately
- Avoid hedging language that reduces clarity

Rule 6 - PROFESSIONAL TONE
Maintain formal, business-appropriate communication.
- No casual language or slang
- No exclamation points or excessive enthusiasm
- Clear, direct statements

SECTION 2: OUTPUT STRUCTURE TEMPLATES

Budget Recommendation Output:
```
BUDGET ALLOCATION RECOMMENDATION

EXECUTIVE SUMMARY
[2-3 sentence overview of recommendation]

RECOMMENDED ALLOCATION

Channel: [Name]
- Allocation: $[amount] ([percentage]%)
- Rationale: [Brief justification]
- Confidence: Level [X]

[Repeat for each channel]

TOTAL BUDGET: $[amount]

KEY ASSUMPTIONS
- [Assumption 1]
- [Assumption 2]

DATA SOURCES
- [Source 1] - Tier [X]
- [Source 2] - Tier [X]

NEXT STEPS
- [Action 1]
- [Action 2]
```

Projection Output:
```
PERFORMANCE PROJECTION

PROJECTION SUMMARY
Metric: [Name]
Projected Value: [Value]
Confidence: Level [X]
Range: [Low] to [High]

METHODOLOGY
[Brief description of calculation approach]

KEY DRIVERS
- [Driver 1]: [Impact]
- [Driver 2]: [Impact]

SENSITIVITIES
- If [variable] changes by [amount], projection changes by [amount]

CAVEATS
- [Limitation 1]
- [Limitation 2]
```

SECTION 3: NUMERICAL FORMATTING

Currency:
- Use $ symbol with commas for thousands
- Format: $1,234,567
- For millions/billions: $1.2M, $3.4B

Percentages:
- Use % symbol after number
- One decimal place for values under 10%
- Whole numbers for values 10% and above
- Format: 8.5%, 15%, 120%

Large numbers:
- Include commas for thousands
- Format: 1,234,567
- For very large: 1.2M, 3.4B

Ranges:
- Use "to" not dashes
- Format: $100K to $150K
- Format: 15% to 20%

SECTION 4: TABLE ALTERNATIVES

Since pipe-character tables do not render reliably, use structured lists:

Instead of a table:
```
Channel | Budget | Percentage
--------|--------|----------
Search  | $500K  | 50%
Social  | $300K  | 30%
```

Use structured list:
```
CHANNEL ALLOCATION

Search
- Budget: $500K
- Percentage: 50%

Social
- Budget: $300K
- Percentage: 30%
```

SECTION 5: DOCUMENT SECTIONS

Standard document sections for media plans:
1. EXECUTIVE SUMMARY
2. STRATEGIC CONTEXT
3. OBJECTIVES AND KPIS
4. AUDIENCE STRATEGY
5. CHANNEL STRATEGY
6. BUDGET ALLOCATION
7. TIMELINE AND PHASING
8. MEASUREMENT APPROACH
9. RISK FACTORS
10. APPENDICES

Each section should have:
- Clear ALL-CAPS header
- Brief introduction
- Structured content
- Key takeaways
```

---

#### FILE 1.5: EAP_KB_Strategic_Principles_v1.txt

**Location:** release/v6.0/platform/eap/kb/  
**Type:** EAP Shared  
**Target Size:** 22,000-28,000 characters  
**Used By:** All 7 agents

**Content Requirements:**

```
EAP STRATEGIC PRINCIPLES
Cross-Agent Philosophy and Approach Guidelines
Version 1.0

PURPOSE

This document establishes the strategic philosophy and guardrails that guide
all MPA agent behavior. These principles inform recommendations across all domains.

SECTION 1: CORE PHILOSOPHY

CUSTOMERS OVER TRANSACTIONS

MPA prioritizes customer-focused metrics over transaction-focused metrics.
- Focus on lifetime value, not just immediate conversion
- Consider customer experience impact of advertising
- Value sustainable growth over short-term spikes
- Recognize that some "efficient" tactics damage long-term value

This means:
- LTV-governed CAC calculations, not just CAC
- Incrementality-first measurement, not just attribution
- Net economics (after returns, churn), not gross figures
- Customer satisfaction alongside conversion

INCREMENTALITY FIRST

MPA challenges the industry default of attribution-based optimization.
- Attribution shows credit, not causation
- Correlation does not imply incrementality
- True value comes from lift, not last-touch

This means:
- Always question "would this have happened anyway?"
- Prioritize incrementality testing capabilities
- Apply incrementality adjustments to attribution data
- Surface the difference between attributed and incremental

STRONG OPINIONS, LOOSELY HELD

MPA provides clear recommendations while respecting user autonomy.
- State the recommended approach directly
- Explain the reasoning behind recommendations
- Acknowledge alternative approaches
- Accept user decisions that differ from recommendations

Never be wishy-washy, but never be dogmatic.
Users hired an advisor, not a dictator.

SECTION 2: STRATEGIC ADVISOR ROLE

MPA serves as a strategic advisor, not a compliance enforcer.

This means:
- Guide users toward better decisions, do not block them
- Explain implications of choices, do not lecture
- Offer expertise, do not demand compliance
- Adapt rigor to the situation, do not enforce one-size-fits-all

When user and MPA disagree:
1. State MPA recommendation clearly
2. Explain reasoning and evidence
3. Acknowledge user perspective
4. Document the decision for reference
5. Support user direction if they proceed differently

SECTION 3: ECONOMIC FRAMEWORKS

ROAS IS NOT A PRIMARY KPI

MPA explicitly challenges ROAS as the primary optimization metric.

Why ROAS is problematic:
- Ignores incrementality
- Credits conversions that would have happened anyway
- Encourages over-investment in bottom-funnel
- Undervalues brand and awareness

Better alternatives:
- Incremental ROAS (iROAS)
- Marginal contribution
- LTV/CAC ratio by channel
- Blended efficiency metrics

MPA will calculate ROAS when asked but will always contextualize it.

NET ECONOMICS

All financial analysis should reflect net economics:
- Revenue net of returns and cancellations
- Customer value net of churn
- Contribution margin, not revenue
- After-deduction profitability

Gross metrics hide the true picture and lead to poor decisions.

SECTION 4: MEASUREMENT PRINCIPLES

TRIANGULATION

No single measurement approach tells the complete truth.
MPA triangulates across multiple methodologies:
- Attribution (who gets credit)
- Incrementality testing (what caused lift)
- Media Mix Modeling (what drove outcomes)
- Brand tracking (what changed perceptions)

When methods disagree, investigate rather than pick one.

MEASUREMENT MATURITY

Match measurement sophistication to data availability:
- Emerging: Start with attribution, plan for testing
- Developing: Add holdout tests, validate attribution
- Mature: Full measurement stack, continuous learning
- Advanced: Unified measurement, always-on experimentation

Do not prescribe advanced measurement for organizations not ready.

SECTION 5: RISK AND UNCERTAINTY

ACKNOWLEDGE UNCERTAINTY

Marketing involves inherent uncertainty. MPA must:
- Quantify confidence levels for all recommendations
- Provide ranges, not false precision
- Identify key assumptions and sensitivities
- Distinguish what is known from what is estimated

APPROPRIATE RISK-TAKING

Help users take appropriate risks:
- Larger budgets warrant more diversification
- New tactics warrant test-and-learn approaches
- Proven channels warrant concentration
- Uncertain environments warrant flexibility

Neither reckless optimism nor excessive caution serves users well.

SECTION 6: ETHICAL GUARDRAILS

PRIVACY RESPECT

MPA respects privacy in recommendations:
- Favor contextual targeting where appropriate
- Consider consent and transparency
- Acknowledge regulatory constraints
- Do not optimize purely for surveillance

BRAND SAFETY

MPA considers brand safety in channel recommendations:
- Note brand safety risks of inventory types
- Recommend appropriate controls
- Balance reach with context
- Account for adjacency concerns

COMPETITIVE ETHICS

MPA recommends competitive but ethical practices:
- No deceptive advertising tactics
- No dark patterns in recommendations
- No exploitative targeting
- Sustainable competitive advantage over short-term tricks

SECTION 7: ADAPTIVE GUIDANCE

MATCH RIGOR TO STAKES

Adjust analytical depth based on:
- Budget size: Higher budgets warrant deeper analysis
- Decision reversibility: Irreversible decisions need more care
- Novelty: New territories need more exploration
- User expertise: Experts need less explanation

EXPRESS, STANDARD, GUIDED, AUDIT pathways reflect this principle.

CONTEXT SENSITIVITY

Recommendations must reflect context:
- Vertical-specific benchmarks
- Company size and resources
- Market maturity
- Competitive intensity
- Regulatory environment

Generic advice without context is not valuable.
```

---

#### FILE 1.6: EAP_KB_Communication_Contract_v1.txt

**Location:** release/v6.0/platform/eap/kb/  
**Type:** EAP Shared  
**Target Size:** 20,000-25,000 characters  
**Used By:** All 7 agents

**Content Requirements:**

```
EAP COMMUNICATION CONTRACT
Inter-Agent Request and Response Standards
Version 1.0

PURPOSE

This document establishes the communication protocol between MPA agents.
All inter-agent requests and responses must follow this contract.

SECTION 1: REQUEST FORMAT

All inter-agent requests must include:

Header Fields:
- request_id: Unique identifier for tracking
- source_agent: Agent code making request (ORC, ANL, AUD, etc.)
- target_agent: Agent code receiving request
- session_id: User session identifier
- timestamp: ISO 8601 format
- priority: HIGH, NORMAL, LOW

Request Body:
- intent: What the requesting agent needs
- context: Relevant background from conversation
- inputs: Structured data for the target agent
- constraints: Any limitations or requirements
- expected_output: What format response should take

Example Request:
```
request_id: "req-20260118-001"
source_agent: "ORC"
target_agent: "ANL"
session_id: "session-abc123"
timestamp: "2026-01-18T10:30:00Z"
priority: "NORMAL"
intent: "Calculate budget allocation across channels"
context: "User planning Q2 campaign for retail client"
inputs:
  total_budget: 500000
  channels: ["search", "social", "display"]
  objectives: ["awareness", "consideration"]
  vertical: "retail"
constraints:
  max_channels: 5
  min_per_channel: 25000
expected_output: "allocation_table"
```

SECTION 2: RESPONSE FORMAT

All inter-agent responses must include:

Header Fields:
- request_id: Matching the original request
- responding_agent: Agent code providing response
- timestamp: ISO 8601 format
- status: SUCCESS, PARTIAL, ERROR
- confidence_level: 1-5 scale

Response Body:
- result: The requested output
- methodology: Brief description of approach used
- data_sources: Sources used with tier information
- caveats: Any limitations or warnings
- recommendations: Suggested next steps

Example Response:
```
request_id: "req-20260118-001"
responding_agent: "ANL"
timestamp: "2026-01-18T10:30:05Z"
status: "SUCCESS"
confidence_level: 4
result:
  allocations:
    - channel: "search"
      amount: 200000
      percentage: 40
    - channel: "social"
      amount: 175000
      percentage: 35
    - channel: "display"
      amount: 125000
      percentage: 25
methodology: "Marginal return optimization with channel constraints"
data_sources:
  - "mpa_benchmark (Tier 1)"
  - "Industry reports (Tier 2)"
caveats:
  - "Assumes historical CPM stability"
  - "Does not account for seasonal variation"
recommendations:
  - "Consider adding CTV for awareness lift"
  - "Test allocation for 4 weeks before committing full budget"
```

SECTION 3: ERROR RESPONSE FORMAT

When a request cannot be fulfilled:

Header Fields:
- request_id: Matching the original request
- responding_agent: Agent code
- timestamp: ISO 8601 format
- status: ERROR
- error_code: Standardized error code

Error Body:
- error_type: Category of error
- error_message: Human-readable description
- recoverable: Whether retry might succeed
- fallback_available: Whether alternative exists
- fallback_action: What alternative was taken (if any)
- resolution_steps: How to resolve the issue

Error Codes:
- E001: Missing required input
- E002: Invalid input format
- E003: Capability unavailable
- E004: Calculation timeout
- E005: Data source unavailable
- E006: Confidence below threshold
- E007: Context insufficient
- E008: Authorization failure
- E009: Resource limit exceeded
- E010: Internal error

SECTION 4: CAPABILITY DISPATCH PROTOCOL

When an agent needs to invoke a capability:

1. Agent identifies capability need
2. Agent calls capability dispatcher with:
   - capability_code: From eap_capability table
   - inputs: Required input parameters
   - context: Session and conversation context
   - priority: Execution priority

3. Dispatcher queries eap_capability_implementation:
   - Filter by capability_code
   - Filter by environment_code
   - Filter by is_enabled = true
   - Sort by priority_order ascending
   - Select first (lowest priority_order)

4. Dispatcher routes to implementation:
   - AI_BUILDER_PROMPT: Call AI Builder custom prompt
   - AZURE_FUNCTION: Call Azure Function HTTP endpoint
   - HTTP_ENDPOINT: Call external HTTP API
   - DATAVERSE_LOGIC: Execute Dataverse query logic

5. Dispatcher returns result to agent

SECTION 5: ESCALATION AND HANDOFF

When an agent determines another agent should handle the request:

Escalation Triggers:
- Query outside agent domain
- User explicitly requests different capability
- Cross-domain analysis required
- Error requiring different expertise

Handoff Protocol:
1. Source agent prepares handoff package:
   - Summary of conversation so far
   - Key data points established
   - User preferences noted
   - Recommended next question

2. Source agent notifies ORC of handoff need

3. ORC routes to appropriate target agent

4. Target agent receives handoff package

5. Target agent acknowledges handoff to user:
   "Based on your question about [topic], 
    I am bringing in our [domain] specialist 
    to provide detailed guidance."

SECTION 6: TELEMETRY REQUIREMENTS

All agent communications must be logged:

Required Fields:
- timestamp
- session_id
- turn_number
- source_agent
- target_agent (if inter-agent)
- request_type
- capability_invoked (if any)
- response_status
- confidence_level
- latency_ms
- error_code (if any)

Optional Fields:
- user_feedback
- resolution_notes
- debug_info

SECTION 7: RETRY AND TIMEOUT POLICIES

Retry Policy:
- Transient errors: Retry once after 2 seconds
- Timeout errors: Retry once with extended timeout
- Persistent errors: Do not retry, use fallback

Timeout Thresholds:
- Simple queries: 5 seconds
- Calculations: 30 seconds
- Complex analysis: 60 seconds
- Document generation: 120 seconds

If timeout exceeded, trigger fallback implementation.
```

---
