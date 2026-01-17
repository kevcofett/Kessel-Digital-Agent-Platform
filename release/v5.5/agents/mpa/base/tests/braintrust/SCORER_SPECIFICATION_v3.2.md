# MPA SCORER SPECIFICATION v3.2

## OVERVIEW

This document defines the complete scorer framework for evaluating MPA agent quality with v5.8 ecommerce scenarios. These scorers measure guidance quality with enhanced coverage for real-world ecommerce use cases.

**Total Scorers:** 24 (16 existing + 8 new ecommerce)
**Total Weight:** 100% (existing) + supplemental ecommerce scoring
**Version:** 3.2 - MPA v5.8 Ecommerce Scenario Support
**KB Version:** v6.0 (25 documents, META tag routing)
**Benchmark Version:** v6.0 (796+ records, 13+ verticals)
**Test Data Source:** Real-world ecommerce data (13,879 customers)

---

## CHANGELOG v3.2

### NEW: Ecommerce Scorer Suite (8 scorers)

Added comprehensive scoring for ecommerce-specific scenarios based on real customer data:

1. **rfm-segment-recognition** - Validates understanding of RFM segmentation
2. **reactivation-strategy** - Validates dormant customer reactivation guidance
3. **retention-acquisition-balance** - Validates balanced portfolio recommendations
4. **cohort-analysis-usage** - Validates use of cohort retention data
5. **lookalike-audience-strategy** - Validates VIP/seed audience expansion recommendations
6. **seasonal-planning** - Validates Q4/Q1 seasonal retention planning
7. **customer-ltv-application** - Validates LTV consideration in recommendations
8. **retention-channel-mix** - Validates appropriate channel recommendations for retention

### Test Data Integration

Real-world metrics incorporated from customer analytics:
- **Total Customers:** 13,879
- **Average LTV:** $396.51
- **Dormant Rate:** 20.8% (2,883 customers)
- **VIP Rate:** 19.2% (2,666 customers with 10+ orders)
- **New Customer Revenue:** 36%
- **Returning Customer Revenue:** 64%
- **Cohort Retention (YoY):** 21.0%

---

## TIER 1: CORE QUALITY BEHAVIORS (65% TOTAL)

### proactive-calculation (15%)
- **Type:** LLM Judge
- **Trigger:** Agent has budget AND volume target
- **Description:** Validates agent proactively calculates implied efficiency metrics

### teaching-behavior (12%)
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **Description:** Validates agent explains concepts clearly and educates users

### feasibility-framing (10%)
- **Type:** LLM Judge
- **Trigger:** Agent has calculated efficiency differing from benchmark
- **Description:** Validates agent frames target feasibility with context

### source-citation (10%)
- **Type:** Code + Hybrid
- **Trigger:** Any response containing numbers or benchmark claims
- **Description:** Validates proper attribution of data sources

### recalculation-on-change (8%)
- **Type:** Hybrid
- **Trigger:** User provides NEW quantitative data
- **Description:** Validates agent recalculates when inputs change

### risk-opportunity-flagging (5%)
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **Description:** Validates agent identifies risks and opportunities

### adaptive-sophistication (5%)
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **Description:** Validates agent matches user's sophistication level

---

## TIER 2: WORKFLOW COMPLIANCE (20% TOTAL)

### step-boundary (5%)
- **Type:** Code
- **Trigger:** Agent response in Steps 1-2
- **Description:** Validates agent respects workflow boundaries

### single-question (5%)
- **Type:** Code
- **Trigger:** Every agent response
- **Description:** Validates agent asks one question at a time

### idk-protocol (4%)
- **Type:** Code
- **Trigger:** User shows uncertainty
- **Description:** Validates agent handles "I don't know" gracefully

### response-length (3%)
- **Type:** Code
- **Trigger:** Every agent response
- **Description:** Validates response conciseness (target: <75 words)

### response-formatting (4%)
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **Description:** Validates appropriate formatting and structure

### acronym-definition (2%)
- **Type:** Code
- **Trigger:** Every agent response
- **Description:** Validates agent defines acronyms on first use

---

## TIER 3: ADVANCED QUALITY (15% TOTAL)

### audience-sizing-completeness (4%)
- **Type:** Code
- **Trigger:** Agent response during or after Step 4
- **Description:** Validates geographic audience sizing tables

### cross-step-synthesis (5%)
- **Type:** LLM Judge
- **Trigger:** Agent response in Steps 5-10
- **Description:** Validates agent connects insights across steps

### response-relevance (2%)
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **Description:** Validates response directly addresses user query

### benchmark-vertical-coverage (2%)
- **Type:** Code
- **Trigger:** Agent cites benchmark data
- **Description:** Validates vertical-appropriate benchmarks retrieved

### web-search-trigger (2%)
- **Type:** Code
- **Trigger:** Census or taxonomy data needed
- **Description:** Validates agent triggers web search appropriately

---

## ECOMMERCE SCORERS (v5.8 Extension)

These scorers are applied to ecommerce-specific test scenarios and evaluate MPA's ability to handle real-world customer data patterns.

### rfm-segment-recognition
- **Weight:** Supplemental (not in core 100%)
- **Type:** Code
- **Trigger:** User mentions customer segments or behavioral data
- **Description:** Validates agent understands RFM (Recency, Frequency, Monetary) segmentation

**Scoring Criteria:**
| Score | Criteria |
|-------|----------|
| 1.0 | RFM terminology + segment strategy |
| 0.8 | Segment recognition + actionable strategy |
| 0.6 | Segment recognized without strategy |
| 0.5 | Terminology only |
| 0.3 | No segment recognition |

**Detection Patterns:**
```typescript
const RFM_PATTERNS = [
  /rfm/i,
  /recency[,\s]+(frequency|monetary)/i,
  /customer\s*(segments?|segmentation)/i,
  /behavioral\s*segment/i,
];

const SEGMENT_PATTERNS = {
  dormant: [/dormant/i, /lapsed/i, /inactive/i, /churned/i],
  atRisk: [/at[\s-]?risk/i, /declining/i, /slipping/i],
  loyal: [/loyal/i, /vip/i, /high[\s-]?value/i, /repeat/i],
  new: [/new\s*(customers?|users?)/i, /first[\s-]?time/i],
};
```

---

### reactivation-strategy
- **Weight:** Supplemental
- **Type:** Code
- **Trigger:** User asks about dormant/inactive customers
- **Description:** Validates agent provides appropriate reactivation recommendations

**Scoring Criteria:**
| Score | Criteria |
|-------|----------|
| 1.0 | 2+ channels + strategy + economics understanding |
| 0.8 | 1+ channels + strategy |
| 0.7 | Strategy + sub-segmentation |
| 0.5 | Channels only |
| 0.2 | No reactivation guidance |

**Expected Channels:**
- Email (primary for reactivation)
- SMS
- Direct mail
- Retargeting/remarketing
- Win-back campaigns

**Economics Patterns:**
```typescript
const REACTIVATION_ECONOMICS = [
  /cost\s*(to\s*)?re-?activat/i,
  /cheaper\s*than\s*(acquisition|acquiring)/i,
  /existing\s*relationship/i,
  /already\s*have\s*(their\s*)?(data|email)/i,
];
```

---

### retention-acquisition-balance
- **Weight:** Supplemental
- **Type:** Code
- **Trigger:** User provides new vs returning customer data
- **Description:** Validates agent recommends balanced portfolio approach

**Scoring Criteria:**
| Score | Criteria |
|-------|----------|
| 1.0 | Retention + acquisition channels + balance recommendation |
| 0.9 | Balance with allocation numbers |
| 0.7 | Both mentioned without balance |
| 0.5 | Balance without specifics |
| 0.2 | One-sided recommendation |

**Real-World Benchmark (from test data):**
- New customer revenue: 36%
- Returning customer revenue: 64%
- New customer AOS: $119.23
- Returning customer AOS: $128.95

---

### cohort-analysis-usage
- **Weight:** Supplemental
- **Type:** Code
- **Trigger:** User provides retention/cohort data
- **Description:** Validates agent uses cohort retention data appropriately

**Scoring Criteria:**
| Score | Criteria |
|-------|----------|
| 1.0 | Cohort terms + trend analysis + actionable response |
| 0.8 | Trend with action plan |
| 0.5 | Acknowledged without action |
| 0.2 | Ignored cohort data |

**Cohort Terminology:**
```typescript
const COHORT_PATTERNS = [
  /cohort/i,
  /year[\s-]?over[\s-]?year/i,
  /yoy/i,
  /retention\s*rate/i,
  /churn\s*rate/i,
  /repeat\s*rate/i,
];
```

---

### lookalike-audience-strategy
- **Weight:** Supplemental
- **Type:** Code
- **Trigger:** User mentions VIP/high-value customers
- **Description:** Validates agent recommends lookalike audience expansion

**Scoring Criteria:**
| Score | Criteria |
|-------|----------|
| 1.0 | Lookalike + first-party data + platform-specific |
| 0.8 | Lookalike + (first-party OR platform) |
| 0.6 | Basic lookalike mention |
| 0.4 | First-party without lookalike |
| 0.2 | No expansion strategy |

**Platform-Specific Patterns:**
```typescript
const PLATFORM_LOOKALIKE_PATTERNS = [
  /meta\s*(lookalike|similar)/i,
  /facebook\s*lookalike/i,
  /google\s*(similar|customer\s*match)/i,
  /value[\s-]?based\s*lookalike/i,
];
```

---

### seasonal-planning
- **Weight:** Supplemental
- **Type:** Code
- **Trigger:** User mentions seasonal context (Q1-Q4, holidays)
- **Description:** Validates agent provides seasonally-aware recommendations

**Scoring Criteria:**
| Score | Criteria |
|-------|----------|
| 1.0 | Season acknowledged + retention timing + strategy adjustment |
| 0.8 | Season + (timing OR adjustment) |
| 0.5 | Acknowledged without action |
| 0.2 | Ignored seasonal context |

**Retention Timing Patterns:**
```typescript
const RETENTION_TIMING_PATTERNS = [
  /\d+[\s-]?day/i,
  /first\s*\d+/i,
  /welcome\s*(series|sequence|flow)/i,
  /post[\s-]?purchase/i,
  /engagement\s*window/i,
];
```

---

### customer-ltv-application
- **Weight:** Supplemental
- **Type:** Code
- **Trigger:** User provides LTV or customer value data
- **Description:** Validates agent considers LTV in recommendations

**Scoring Criteria:**
| Score | Criteria |
|-------|----------|
| 1.0 | LTV terms + LTV-based decisions + CAC:LTV ratio |
| 0.8 | LTV terms + decisions |
| 0.5 | Partial LTV consideration |
| 0.2 | Ignored LTV data |

**LTV Decision Patterns:**
```typescript
const LTV_DECISION_PATTERNS = [
  /ltv[\s:]*\$?\d+/i,
  /worth\s*\$?\d+/i,
  /payback/i,
  /roi/i,
  /profitable/i,
];
```

---

### retention-channel-mix
- **Weight:** Supplemental
- **Type:** Code
- **Trigger:** Retention context in conversation
- **Description:** Validates agent recommends appropriate retention channels

**Scoring Criteria:**
| Score | Criteria |
|-------|----------|
| 1.0 | 2+ channels + lifecycle emphasis |
| 0.8 | 2+ channels |
| 0.7 | 1 channel + segmented approach |
| 0.5 | Basic retention channel |
| 0.2 | No retention channels |

**Appropriate Retention Channels:**
```typescript
const APPROPRIATE_RETENTION_CHANNELS = {
  email: [/email/i, /newsletter/i],
  sms: [/sms/i, /text\s*(message)?/i],
  push: [/push\s*notif/i, /app\s*notif/i],
  loyalty: [/loyalty/i, /rewards?/i, /points?\s*program/i],
  lifecycle: [/lifecycle/i, /journey/i, /automation/i, /flow/i],
};
```

---

## TEST SCENARIO MAPPING

| Scenario ID | Primary Scorers | Secondary Scorers |
|-------------|-----------------|-------------------|
| `ecommerce_rfm_reactivation_initial` | rfm-segment-recognition, reactivation-strategy | retention-channel-mix |
| `ecommerce_rfm_reactivation_roi` | reactivation-strategy, customer-ltv-application | cohort-analysis-usage |
| `ecommerce_new_vs_returning_mix` | retention-acquisition-balance | retention-channel-mix |
| `ecommerce_acquisition_vs_retention_focus` | retention-acquisition-balance, customer-ltv-application | - |
| `ecommerce_retention_decline` | cohort-analysis-usage, retention-channel-mix | reactivation-strategy |
| `ecommerce_vip_lookalike_targeting` | lookalike-audience-strategy, rfm-segment-recognition | - |
| `ecommerce_vip_channel_selection` | lookalike-audience-strategy | - |
| `ecommerce_q1_retention_planning` | seasonal-planning, retention-channel-mix | customer-ltv-application |

---

## COMPOSITE SCORING

### Ecommerce Scenario Composite

For ecommerce scenarios, the composite score combines:

1. **Core Scorers (70%):** Standard TIER 1-3 scorers
2. **Ecommerce Scorers (30%):** Scenario-relevant ecommerce scorers

```typescript
function calculateEcommerceComposite(
  coreScore: number,
  ecommerceScores: Record<string, number>,
  scenarioId: string
): number {
  const SCENARIO_WEIGHTS = getScenarioWeights(scenarioId);
  
  let ecommerceTotal = 0;
  let ecommerceWeight = 0;
  
  for (const [scorer, weight] of Object.entries(SCENARIO_WEIGHTS)) {
    if (ecommerceScores[scorer] !== undefined) {
      ecommerceTotal += ecommerceScores[scorer] * weight;
      ecommerceWeight += weight;
    }
  }
  
  const normalizedEcommerce = ecommerceWeight > 0 
    ? ecommerceTotal / ecommerceWeight 
    : 1.0;
  
  return (coreScore * 0.7) + (normalizedEcommerce * 0.3);
}
```

---

## SUCCESS CRITERIA

### Per-Scenario Pass Thresholds

| Scenario Type | Core Score | Ecommerce Score | Composite |
|---------------|------------|-----------------|-----------|
| Reactivation | ≥ 0.70 | ≥ 0.75 | ≥ 0.72 |
| Retention Balance | ≥ 0.70 | ≥ 0.70 | ≥ 0.70 |
| Lookalike/VIP | ≥ 0.70 | ≥ 0.80 | ≥ 0.73 |
| Seasonal Planning | ≥ 0.70 | ≥ 0.75 | ≥ 0.72 |

### Overall v5.8 Target

**Target: 95% of scenarios pass all relevant scorers**

---

## IMPLEMENTATION

### File Locations

```
release/v5.5/agents/mpa/base/tests/braintrust/
├── scorers/
│   ├── ecommerce-scorers.ts    # 8 new ecommerce scorers
│   ├── index.ts                # Updated with ecommerce exports
│   └── ...
├── mpa-evaluation-dataset.json # Updated with 18 test cases
├── SCORER_SPECIFICATION_v3.2.md # This document
└── ...
```

### Usage Example

```typescript
import {
  ecommerceScorers,
  scoreRfmSegmentRecognition,
  scoreReactivationStrategy,
} from "./scorers/index.js";

// Score a single turn
const rfmScore = scoreRfmSegmentRecognition(output, input);
const reactivationScore = scoreReactivationStrategy(output, input);

// Score using collection
for (const [name, scorer] of Object.entries(ecommerceScorers)) {
  const result = scorer(output, input);
  console.log(`${name}: ${result.score}`);
}
```

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2025-01 | Initial v6.0 KB architecture support |
| 3.1 | 2025-01 | Added v6.1 outcome-focused scorers |
| 3.2 | 2025-01 | Added 8 ecommerce scorers for v5.8 |
