# MPA SCORER SPECIFICATION v2.1

## OVERVIEW

This document defines the complete scorer framework for evaluating MPA agent quality. These scorers measure guidance quality, not completion speed.

**Total Scorers:** 14
**Total Weight:** 100%
**Version:** 2.1 - Updated audience-sizing-completeness with census and taxonomy requirements

---

## CHANGELOG v2.1

### audience-sizing-completeness (6% weight)
- ADDED: Census source citation present (10%)
- ADDED: Taxonomy codes present (10%)
- REBALANCED: Existing components reduced proportionally
- NEW TOTAL: 10 scoring components

---

## TIER 1: CORE QUALITY BEHAVIORS (65% TOTAL)

### proactive-calculation
- **Weight:** 15%
- **Type:** LLM Judge
- **Trigger:** Agent has budget AND volume target (or enough data to calculate efficiency)

### teaching-behavior
- **Weight:** 12%
- **Type:** LLM Judge
- **Trigger:** Every agent response

### feasibility-framing
- **Weight:** 10%
- **Type:** LLM Judge
- **Trigger:** Agent has calculated efficiency that differs from benchmark

### source-citation
- **Weight:** 10%
- **Type:** Code
- **Trigger:** Any response containing numbers, percentages, or benchmark claims

### recalculation-on-change
- **Weight:** 8%
- **Type:** Hybrid (Code detection + LLM evaluation)
- **Trigger:** User provides NEW quantitative data that differs from prior value

### risk-opportunity-flagging
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Every agent response

### adaptive-sophistication
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Every agent response

---

## TIER 2: WORKFLOW COMPLIANCE (20% TOTAL)

### step-boundary
- **Weight:** 5%
- **Type:** Code
- **Trigger:** Agent response in Steps 1-2

### single-question
- **Weight:** 5%
- **Type:** Code
- **Trigger:** Every agent response

### idk-protocol
- **Weight:** 4%
- **Type:** Code
- **Trigger:** User says I dont know, not sure, no idea, or shows uncertainty

### response-length
- **Weight:** 3%
- **Type:** Code
- **Trigger:** Every agent response

### response-formatting
- **Weight:** 4%
- **Type:** LLM Judge
- **Trigger:** Every agent response

### acronym-definition
- **Weight:** 2%
- **Type:** Code
- **Trigger:** Every agent response

---

## TIER 3: ADVANCED QUALITY (15% TOTAL)

### audience-sizing-completeness
- **Weight:** 6%
- **Type:** Code
- **Trigger:** Agent response during or after Step 4 Geography
- **Instructions:**
  When in Step 4 Geography, agent MUST present audience sizing table with census-validated data and taxonomy codes before proceeding to Step 5.
  
  **Table component scoring (v2.1 - 10 components):**
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
  
  **Score:** Sum of present components.


- **Code Pattern:**
```typescript
function checkCensusCitation(text: string): boolean {
  const censusPatterns = [
    /census/i,
    /acs\s*\d{4}/i,
    /american community survey/i,
    /statistics canada/i,
    /statcan/i,
    /ons\.gov/i,
    /eurostat/i,
    /abs\.gov/i,
    /inegi/i,
    /ibge/i,
    /data source/i
  ];
  return censusPatterns.some(p => p.test(text));
}

function checkTaxonomyCodes(text: string): boolean {
  const taxonomyPatterns = [
    /iab\d+/i,
    /iab-?\d+/i,
    /\/affinity\//i,
    /\/in-market\//i,
    /google (affinity|in-market)/i,
    /meta (interests?|behaviors?)/i,
    /facebook (interests?|behaviors?)/i,
    /linkedin targeting/i,
    /interests?:/i,
    /behaviors?:/i,
    /contextual targeting/i,
    /taxonomy/i
  ];
  return taxonomyPatterns.some(p => p.test(text));
}
```

---

### cross-step-synthesis
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Agent response in Steps 5-10

### response-relevance
- **Weight:** 4%
- **Type:** LLM Judge
- **Trigger:** Every agent response

---

## VERSION HISTORY

### v2.1 (January 2026)
- Updated audience-sizing-completeness scorer
  - Added census citation detection (12%)
  - Added calculation methodology detection (10%)
  - Added taxonomy code detection (10%)
  - Rebalanced existing components
  - Total components increased from 7 to 10

### v2.0 (January 2026)
- Initial v2 specification with 14 scorers
- Established three-tier structure
- Defined code and LLM judge patterns
