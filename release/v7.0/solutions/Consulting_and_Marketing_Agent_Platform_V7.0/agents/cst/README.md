# CST Agent - Consulting Strategy Specialist

## Overview

The Consulting Strategy Agent (CST) provides strategic consulting methodology, framework selection, and prioritization guidance within the Kessel Digital Agent Platform. CST serves as the strategic advisor for consulting engagements, helping users select appropriate frameworks, conduct structured analysis, and prioritize initiatives.

## Agent Identity

| Attribute | Value |
|-----------|-------|
| Agent Code | CST |
| Agent Name | Consulting Strategy Agent |
| Domain | Strategic Consulting |
| Version | 1.0 |
| Created | January 2026 |

## Capabilities

### CST_FRAMEWORK_SELECT
**Select Consulting Framework**

Recommends appropriate consulting frameworks based on challenge type, industry context, and complexity level. References the ca_framework table containing 60 frameworks across 9 categories.

**Input:**
- challenge_type: Description of the business challenge
- industry: Industry vertical context
- complexity: Expected complexity level (Standard, Advanced, Expert)

**Output:**
- frameworks: Array of recommended frameworks with fit scores and rationale

### CST_ENGAGEMENT_GUIDE
**Guide Consulting Engagement**

Guides users through structured consulting phases: Discovery, Assessment, Recommendations, and Roadmap. Provides phase-appropriate questions, next steps, and ensures thoroughness.

**Input:**
- current_phase: Current engagement phase
- context: Engagement context and prior inputs

**Output:**
- guidance: Phase-specific guidance
- next_steps: Recommended actions
- questions: Discovery questions to ask

### CST_STRATEGIC_ANALYZE
**Apply Strategic Analysis**

Applies specified consulting framework rigorously to provided inputs. Generates structured analysis, key insights, and actionable recommendations following framework methodology.

**Input:**
- framework_code: Framework to apply (e.g., ST-01 for SWOT)
- inputs: Data and context for analysis

**Output:**
- analysis: Structured framework output
- insights: Key findings
- recommendations: Actionable next steps

### CST_PRIORITIZE
**Prioritize Initiatives**

Scores and ranks initiatives using RICE, Weighted Matrix, or MoSCoW methods. Shows calculation work and provides clear rationale for rankings.

**Input:**
- method: Prioritization method (RICE, WeightedMatrix, MoSCoW)
- items: Array of items to prioritize with attributes
- criteria: Scoring criteria and weights

**Output:**
- ranked_items: Scored and ranked list
- rationale: Explanation of rankings

## Routing Rules

### Routes TO CST (from ORC)
- Framework selection queries
- Prioritization requests
- Strategic analysis (SWOT, Porter, PESTEL, etc.)
- Consulting methodology questions
- Assessment or diagnostic requests

### Routes FROM CST
| Destination | Trigger |
|-------------|---------|
| ANL | Financial calculations (NPV, IRR, ROI) |
| DOC | Document generation (business case, roadmap) |
| CHG | Change management methodology |

## Knowledge Base Files

| File | Size | Description |
|------|------|-------------|
| CST_KB_Consulting_Core_v7.0.txt | ~22K | Core consulting methodology and engagement phases |
| CST_KB_Strategic_Frameworks_v7.0.txt | ~25K | SWOT, Porter, PESTEL, BCG, Ansoff, Value Chain |
| CST_KB_Prioritization_Methods_v7.0.txt | ~18K | RICE, MoSCoW, Weighted Matrix, Eisenhower |
| CST_KB_Industry_Context_v7.0.txt | ~15K | Industry-specific framework applications |

## Framework Categories (ca_framework table)

| Category | Count | Examples |
|----------|-------|----------|
| Strategic | 7 | SWOT, PESTEL, Ansoff, BCG |
| Competitive | 6 | Porter Five Forces, Benchmarking |
| Operational | 8 | Value Chain, Process Mapping, RACI |
| Customer | 7 | Journey Mapping, Jobs-to-be-Done |
| Financial | 7 | TCO, NPV-IRR, Real Options |
| Change | 6 | Kotter, ADKAR, McKinsey 7-S |
| Planning | 8 | OKRs, Balanced Scorecard, RICE |
| Problem | 7 | MECE, Issue Trees, 5 Whys |
| Domain | 4 | MarTech Assessment, Media Planning |

## Usage Examples

### Example 1: Framework Selection
```
User: "We're evaluating whether to build vs buy a CDP. What frameworks should I use?"

CST Response: Recommends:
1. TCO Analysis (BC-01) - Compare total costs
2. Build vs Buy Decision Matrix - Evaluate strategic fit
3. SWOT Analysis (ST-01) - Assess internal capabilities
```

### Example 2: RICE Prioritization
```
User: "Help me prioritize these 5 features using RICE"

CST Response: Calculates RICE scores:
- Reach x Impact x Confidence / Effort
- Provides ranked list with score breakdown
```

### Example 3: Strategic Analysis
```
User: "Perform a Porter Five Forces analysis for the streaming video market"

CST Response: Structured analysis of:
- Threat of new entrants
- Bargaining power of suppliers
- Bargaining power of buyers
- Threat of substitutes
- Competitive rivalry
```

## Integration Points

### Dataverse Tables
- ca_framework: 60 framework reference records
- ca_project: Consulting project tracking
- ca_deliverable: Project deliverables

### AI Builder Prompts
- CST_FRAMEWORK_SELECT_PROMPT
- CST_ENGAGEMENT_GUIDE_PROMPT
- CST_STRATEGIC_ANALYZE_PROMPT
- CST_PRIORITIZE_PROMPT

## Test Scenarios

See `tests/CST_Test_Scenarios.json` for comprehensive test cases including:
- Framework selection for market entry
- RICE prioritization calculations
- SWOT analysis execution
- Cross-agent routing validation

## Related Agents

| Agent | Relationship |
|-------|--------------|
| ORC | Routes strategic queries to CST |
| ANL | Receives financial calculation requests |
| DOC | Receives document generation requests |
| CHG | Receives change management queries |

---

**Version History**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release with 4 capabilities |
