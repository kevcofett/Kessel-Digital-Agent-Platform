# MPA SCORER SPECIFICATION v3.0

## OVERVIEW

This document defines the complete scorer framework for evaluating MPA agent quality with v6.0 KB architecture. These scorers measure guidance quality with enhanced benchmark coverage across 14 verticals.

**Total Scorers:** 16 (14 existing + 2 new)
**Total Weight:** 100%
**Version:** 3.0 - MPA v6.0 KB Architecture Support
**KB Version:** v6.0 (25 documents, META tag routing)
**Benchmark Version:** v6.0 (331 records, 14 verticals)

---

## CHANGELOG v3.0

### NEW: benchmark-vertical-coverage (2% weight from Tier 3)
- Validates agent retrieves appropriate benchmarks for user's vertical
- Checks 14 supported verticals: RETAIL, ECOMMERCE, CPG, FINANCE, TECHNOLOGY, HEALTHCARE, AUTOMOTIVE, TRAVEL, ENTERTAINMENT, TELECOM, GAMING, HOSPITALITY, EDUCATION, B2B_PROFESSIONAL
- Validates channel-specific metrics retrieved (PAID_SEARCH, PAID_SOCIAL, PROGRAMMATIC_DISPLAY, CTV_OTT)

### NEW: web-search-trigger (2% weight from Tier 3)
- Detects when agent should trigger web search for census or taxonomy data
- Validates agent doesn't fabricate census data when KB indicates web search needed
- Checks for proper acknowledgment of external data needs

### UPDATED: source-citation (10% weight)
- Added v6.0 KB document patterns
- Added META tag routing validation
- Added confidence level attribution (HIGH/MEDIUM/LOW)

### UPDATED: audience-sizing-completeness (4% reduced from 6%)
- Weight reduced to accommodate new scorers
- Census and taxonomy requirements maintained

---

## TIER 1: CORE QUALITY BEHAVIORS (65% TOTAL)

### proactive-calculation
- **Weight:** 15%
- **Type:** LLM Judge
- **Trigger:** Agent has budget AND volume target (or enough data to calculate efficiency)
- **v6.0 Change:** None - calculation behavior unchanged

### teaching-behavior
- **Weight:** 12%
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **v6.0 Change:** None - teaching behavior unchanged

### feasibility-framing
- **Weight:** 10%
- **Type:** LLM Judge
- **Trigger:** Agent has calculated efficiency that differs from benchmark
- **v6.0 Enhancement:** Should reference vertical-specific benchmarks from expanded dataset

### source-citation
- **Weight:** 10%
- **Type:** Code + Hybrid
- **Trigger:** Any response containing numbers, percentages, or benchmark claims
- **v6.0 Enhancement:** Validates v6.0 KB document patterns and confidence levels

**v6.0 Source Patterns:**
```typescript
const V6_SOURCE_PATTERNS = [
  // Explicit KB v6.0 patterns
  /based on (knowledge base|kb)/i,
  /based on (expert lens|expert guidance)/i,
  /based on (benchmark data|mpa_benchmark)/i,
  /based on (gap detection playbook)/i,
  /based on (analytics engine)/i,
  // Confidence level attribution
  /\(confidence:\s*(high|medium|low)\)/i,
  /\[(high|medium|low)\s*confidence\]/i,
  // Web search attribution
  /based on web search/i,
  /based on census data/i,
  // User attribution
  /based on your input/i,
  /you (mentioned|provided|said)/i,
];
```

### recalculation-on-change
- **Weight:** 8%
- **Type:** Hybrid (Code detection + LLM evaluation)
- **Trigger:** User provides NEW quantitative data that differs from prior value
- **v6.0 Change:** None - recalculation behavior unchanged

### risk-opportunity-flagging
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **v6.0 Enhancement:** Should leverage expanded benchmark data for risk assessment

### adaptive-sophistication
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **v6.0 Change:** None - sophistication matching unchanged

---

## TIER 2: WORKFLOW COMPLIANCE (20% TOTAL)

### step-boundary
- **Weight:** 5%
- **Type:** Code
- **Trigger:** Agent response in Steps 1-2
- **v6.0 Change:** None

### single-question
- **Weight:** 5%
- **Type:** Code
- **Trigger:** Every agent response
- **v6.0 Change:** None

### idk-protocol
- **Weight:** 4%
- **Type:** Code
- **Trigger:** User says I dont know, not sure, no idea, or shows uncertainty
- **v6.0 Enhancement:** Should model using v6.0 benchmark data with vertical context

### response-length
- **Weight:** 3%
- **Type:** Code
- **Trigger:** Every agent response
- **v6.0 Change:** None

### response-formatting
- **Weight:** 4%
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **v6.0 Change:** None

### acronym-definition
- **Weight:** 2%
- **Type:** Code
- **Trigger:** Every agent response
- **v6.0 Change:** None

---

## TIER 3: ADVANCED QUALITY (15% TOTAL)

### audience-sizing-completeness
- **Weight:** 4% (reduced from 6%)
- **Type:** Code
- **Trigger:** Agent response during or after Step 4 Geography
- **v6.0 Change:** Weight reduced to accommodate new scorers; requirements unchanged

**Table component scoring (10 components):**
- DMA/Geography column present (10%)
- Total Population column present (10%)
- Target Audience column as whole numbers (10%)
- Target % column present (8%)
- TOTAL row with aggregation (10%)
- Multiple DMAs if scope is regional/national (10%)
- Weighted average for percentages in TOTAL (10%)
- Census source citation present (12%)
- Calculation methodology shown (10%)
- Taxonomy codes present in audience specification (10%)

### cross-step-synthesis
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Agent response in Steps 5-10
- **v6.0 Enhancement:** Should synthesize across v6.0 KB Expert Lens documents

### response-relevance
- **Weight:** 2% (reduced from 4%)
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **v6.0 Change:** Weight reduced to accommodate new scorers

### benchmark-vertical-coverage [NEW]
- **Weight:** 2%
- **Type:** Code
- **Trigger:** Agent cites benchmark data
- **Description:** Validates agent retrieves vertical-appropriate benchmarks

**Supported Verticals (14):**
```
TIER 1: RETAIL, ECOMMERCE, CPG, FINANCE, TECHNOLOGY
TIER 2: HEALTHCARE, AUTOMOTIVE, TRAVEL, ENTERTAINMENT, TELECOM
TIER 3: GAMING, HOSPITALITY, EDUCATION, B2B_PROFESSIONAL
```

**Channels per Vertical:**
- PAID_SEARCH: CPM, CPC, CTR, CVR, CPA, ROAS
- PAID_SOCIAL: CPM, CPC, CTR, CVR, CPA, ROAS, VTR
- PROGRAMMATIC_DISPLAY: CPM, CPC, CTR, CVR, CPA, Viewability
- CTV_OTT: CPM, CPCV, VTR, CTR, Viewability

**Code Pattern:**
```typescript
const SUPPORTED_VERTICALS = [
  'RETAIL', 'ECOMMERCE', 'CPG', 'FINANCE', 'TECHNOLOGY',
  'HEALTHCARE', 'AUTOMOTIVE', 'TRAVEL', 'ENTERTAINMENT', 'TELECOM',
  'GAMING', 'HOSPITALITY', 'EDUCATION', 'B2B_PROFESSIONAL'
];

function scoreBenchmarkVerticalCoverage(output: string, userVertical: string): TurnScore {
  // Check if vertical is supported
  const verticalNormalized = userVertical.toUpperCase().replace(/[^A-Z_]/g, '');
  const isSupported = SUPPORTED_VERTICALS.includes(verticalNormalized);
  
  // Check if agent acknowledges vertical context
  const mentionsVertical = new RegExp(userVertical, 'i').test(output);
  const mentionsBenchmark = /benchmark|typical|industry average/i.test(output);
  
  // Check for vertical-specific data
  const hasVerticalContext = mentionsVertical && mentionsBenchmark;
  
  let score = 0;
  if (isSupported && hasVerticalContext) score = 1.0;
  else if (isSupported && mentionsBenchmark) score = 0.7;
  else if (mentionsBenchmark) score = 0.5;
  
  return {
    scorer: 'benchmark-vertical-coverage',
    score,
    metadata: { userVertical, isSupported, mentionsVertical, mentionsBenchmark },
    scope: 'turn'
  };
}
```

### web-search-trigger [NEW]
- **Weight:** 2%
- **Type:** Code + Hybrid
- **Trigger:** Agent discusses census data, population statistics, or taxonomy codes
- **Description:** Validates agent appropriately triggers web search for external data

**Web Search Triggers (from KB v6.0 META_WEB_SEARCH_TRIGGER):**
- Census population data for DMA sizing
- Current taxonomy codes (IAB, Google, Meta)
- Real-time market data
- Regulatory/compliance updates

**Code Pattern:**
```typescript
const WEB_SEARCH_INDICATORS = [
  // Census data needs
  /census|population data|demographic statistics/i,
  /acs \d{4}|american community survey/i,
  // Taxonomy needs
  /iab taxonomy|iab-?\d+/i,
  /google (affinity|in-market) (audience|segment)/i,
  /meta (interest|behavior) targeting/i,
  // Real-time data
  /current (market|competitive) data/i,
  /latest (rates|pricing|cpm)/i,
];

const PROPER_ATTRIBUTION = [
  /i would need to search|let me search/i,
  /based on web search/i,
  /searching for current/i,
  /external data (needed|required)/i,
];

function scoreWebSearchTrigger(output: string, input: string): TurnScore {
  const needsWebSearch = WEB_SEARCH_INDICATORS.some(p => p.test(output) || p.test(input));
  
  if (!needsWebSearch) {
    return {
      scorer: 'web-search-trigger',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn'
    };
  }
  
  const hasProperAttribution = PROPER_ATTRIBUTION.some(p => p.test(output));
  const fabricatesData = /census shows|population is \d|according to census/i.test(output) && 
                         !hasProperAttribution;
  
  let score = 0;
  if (hasProperAttribution) score = 1.0;
  else if (fabricatesData) score = 0.0;
  else score = 0.5;
  
  return {
    scorer: 'web-search-trigger',
    score,
    metadata: { needsWebSearch, hasProperAttribution, fabricatesData },
    scope: 'turn'
  };
}
```

---

## WEIGHT SUMMARY

| Tier | Scorer | Weight |
|------|--------|--------|
| **Tier 1** | proactive-calculation | 15% |
| | teaching-behavior | 12% |
| | feasibility-framing | 10% |
| | source-citation | 10% |
| | recalculation-on-change | 8% |
| | risk-opportunity-flagging | 5% |
| | adaptive-sophistication | 5% |
| **Tier 2** | step-boundary | 5% |
| | single-question | 5% |
| | idk-protocol | 4% |
| | response-length | 3% |
| | response-formatting | 4% |
| | acronym-definition | 2% |
| **Tier 3** | audience-sizing-completeness | 4% |
| | cross-step-synthesis | 5% |
| | response-relevance | 2% |
| | benchmark-vertical-coverage | 2% |
| | web-search-trigger | 2% |
| **TOTAL** | | **100%** |

---

## VERSION HISTORY

### v3.0 (January 2026)
- Added benchmark-vertical-coverage scorer for 14 verticals
- Added web-search-trigger scorer for external data detection
- Updated source-citation for v6.0 KB patterns
- Rebalanced weights (audience-sizing 6%→4%, response-relevance 4%→2%)
- Total scorers increased from 14 to 16

### v2.1 (January 2026)
- Updated audience-sizing-completeness scorer
- Added census citation and taxonomy code detection

### v2.0 (January 2026)
- Initial v2 specification with 14 scorers
- Established three-tier structure

---

## TESTING REQUIREMENTS

### Benchmark Coverage Test
Run with each supported vertical to validate benchmark retrieval:
```bash
MPA_INSTRUCTIONS_PATH=.../MPA_Copilot_Instructions_v6_0.txt \
BRAINTRUST_API_KEY=xxx \
npx braintrust eval mpa-eval.ts --filter vertical:RETAIL

# Test all 14 verticals
for v in RETAIL ECOMMERCE CPG FINANCE TECHNOLOGY HEALTHCARE AUTOMOTIVE TRAVEL ENTERTAINMENT TELECOM GAMING HOSPITALITY EDUCATION B2B_PROFESSIONAL; do
  npx braintrust eval mpa-eval.ts --filter vertical:$v
done
```

### Web Search Trigger Test
Validate web search detection with census/taxonomy scenarios:
```bash
npx braintrust eval mpa-eval.ts --filter scenario:census-sizing
npx braintrust eval mpa-eval.ts --filter scenario:taxonomy-targeting
```
