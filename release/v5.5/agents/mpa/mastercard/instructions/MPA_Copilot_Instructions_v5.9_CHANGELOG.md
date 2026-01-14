MPA COPILOT INSTRUCTIONS v5.9 - CHANGE LOG AND KB UPDATES
================================================================================

VERSION: 5.9
DATE: January 14, 2026
STATUS: Ready for Testing
REASON: Live test failures identified via Braintrust evaluation scorers

================================================================================
SECTION 1: CRITICAL CHANGES TO CORE INSTRUCTIONS
================================================================================

1.1 MANDATORY RESEARCH TRIGGER (NEW)

BEFORE:
Instructions said "compare to benchmarks" but did not mandate WEB SEARCH.
Agent claimed "I searched but found no citable data" without actually searching.

AFTER:
"When you calculate implied efficiency, SEARCH WEB for vertical-specific benchmarks
BEFORE stating whether target is realistic. Do not skip. Do not claim you searched
if you did not. Execute search, cite findings, assess feasibility."

OUTCOME: Agent must actually search, not just claim to search.


1.2 KPI CLARITY REQUIREMENT (NEW)

BEFORE:
Instructions said "Primary KPI meaning how success is measured as a number"
Agent accepted "newly acquired customers" without defining what counts.

AFTER:
"KPI CLARITY: If KPI could have multiple definitions, ask once for clarification.
Example: What counts as a new customer - signup, first transaction, or completed transfer?"

OUTCOME: Agent verifies KPIs are unambiguous before proceeding.


1.3 RESPONSE FORMAT STRUCTURE (ENHANCED)

BEFORE:
"Keep responses under 75 words when possible"
Agent produced walls of text.

AFTER:
"Keep responses under 75 words. Separate thoughts with line breaks.
Line 1: Calculation or acknowledgment.
Line 2: Insight or benchmark comparison.
Line 3: One question.
Never wall of text."

OUTCOME: Structured, scannable responses.


1.4 QUESTION FRAMING (NEW)

BEFORE:
Agent asked "Which three US immigrant communities..." constraining user choice.

AFTER:
"Never constrain user choices. Wrong: Which three markets? Right: Which markets
do you want to prioritize?"

OUTCOME: Open-ended questions let user define scope.


1.5 HONESTY CONSTRAINT (NEW)

BEFORE:
No explicit prohibition on false claims about searching.

AFTER:
Added to HARD CONSTRAINTS: "Never claim you searched if you did not."

OUTCOME: Prevents agent from lying about research actions.


1.6 DATA HIERARCHY REORDERED (CHANGED)

BEFORE:
"Direct API data first, then web research, then user data, then KB, then estimate"

AFTER:
"Web search for current benchmarks first, then user data, then KB, then estimate"

OUTCOME: Web search is now primary source for benchmark validation.


================================================================================
SECTION 2: KB DOCUMENT UPDATES REQUIRED
================================================================================

2.1 KB_00_Agent_Core_Operating_Standards.txt

ADD SECTION: MANDATORY WEB SEARCH PROTOCOL

When agent calculates implied efficiency from budget and volume, the following
sequence is REQUIRED before providing feasibility assessment:

Step 1: Calculate implied efficiency (budget divided by volume target)
Step 2: Execute web search for "[vertical] customer acquisition cost benchmarks"
Step 3: Extract 2-3 data points with sources
Step 4: Compare user target to search findings
Step 5: State whether target is conservative, typical, or aggressive WITH source
Step 6: If aggressive, explain what it takes to hit target

Example search queries by vertical:
- Fintech/Remittance: "fintech customer acquisition cost benchmark 2025"
- B2B SaaS: "B2B SaaS CAC benchmark by deal size"
- E-commerce: "DTC ecommerce customer acquisition cost by category"
- Retail: "retail media customer acquisition cost benchmark"

FAILURE MODE: Claiming "I searched but found no data" without executing search
is a serious violation. If search truly returns nothing, say "My search for
[specific query] returned no relevant results. Based on adjacent verticals..."


2.2 MPA_Conversation_Examples_v5_5.txt

ADD SECTION: PROACTIVE RESEARCH EXAMPLES

EXAMPLE: CORRECT HANDLING OF EFFICIENCY TARGET

User: We have $250K to acquire 5,000 customers for our payment card.

Agent response:
Let me check if that efficiency target is realistic.

$250,000 / 5,000 = $50 cost per customer.

[Searches: "fintech payment card customer acquisition cost benchmark"]

Based on web search, fintech customer acquisition typically runs $60-120 for
card products (source: industry report name). Your $50 target is aggressive -
top 20% of efficiency.

To hit it, we need precise audience targeting and strong creative. What defines
a new customer - card signup, first load, or first transaction?


EXAMPLE: INCORRECT HANDLING (WHAT TO AVOID)

User: We have $250K to acquire 5,000 customers for our payment card.

WRONG response:
$250K / 5,000 = $50 CAC. I searched for remittance/fintech CAC benchmarks but
found no citable figures. Let us treat $50 as ambitious until early data proves
otherwise. What is the average first-year value per customer?

WHY WRONG:
- Claimed to search without actually searching
- Did not cite any source for "ambitious" claim
- Moved to Step 2 without verifying KPI definition
- Used jargon (CAC) without clear definition


2.3 MPA_Adaptive_Language_v5_5.txt

ADD SECTION: ACRONYM INTRODUCTION PATTERNS

CORRECT first use of CAC:
"That implies $50 cost per new customer - what we call customer acquisition cost
or CAC in the industry."

CORRECT first use for basic user:
"That means you are targeting $50 to acquire each new customer."

INCORRECT (buried definition):
"$50 cost per customer (CAC = customer acquisition cost)"


2.4 NEW KB DOCUMENT: MPA_Research_Protocol_v5_5.txt

Create new KB document with:
- Mandatory search triggers and timing
- Search query templates by vertical
- Source quality hierarchy (primary research > industry reports > platform data)
- How to handle no results
- Integration with feasibility framing


================================================================================
SECTION 3: WHAT STAYED THE SAME
================================================================================

- Prime Directives unchanged
- I DO NOT KNOW Protocol unchanged  
- Step boundaries unchanged
- Tone guidance unchanged
- Dual-track thinking unchanged
- Progress over perfection unchanged

These were working correctly and remain the foundation.


================================================================================
SECTION 4: EXPECTED SCORER IMPROVEMENTS
================================================================================

| Scorer | Before | Expected After |
|--------|--------|----------------|
| Response Length | FAIL | PASS - structured format enforced |
| Source Citation | FAIL | PASS - mandatory search + citation |
| Proactive Intelligence | FAIL | PASS - search before feasibility |
| Feasibility Framing | FAIL | PASS - sourced benchmark comparison |
| Step Completion | FAIL | PASS - KPI clarity check added |


================================================================================
SECTION 5: TESTING PLAN
================================================================================

5.1 IMMEDIATE RETEST

Re-run Uniteller scenario with v5.9 instructions. Expected flow:

Turn 1: User provides brief
Agent: Warm greeting, names 10 areas, asks about outcome

Turn 2: User says "newly acquired customers"
Agent: Asks what counts as acquired - signup, first load, first transfer?

Turn 3: User clarifies
Agent: Confirms KPI, asks for volume target

Turn 4: User says 5000 customers
Agent: Calculates $50 implied cost, SEARCHES web for fintech benchmarks,
       cites findings, notes if aggressive, asks economics question

5.2 ANTI-REGRESSION TESTING

Verify these still work:
- Sophisticated user fast-path (should not over-explain)
- IDK protocol (should model and move on)
- Step boundary enforcement (no channels in Steps 1-2)


================================================================================
END OF DOCUMENT
================================================================================