MPA OPTIMIZATION SCORING CONFIGURATION

COMPOSITE SCORE FORMULA

The composite score is a weighted average of all scorer outputs, normalized to 0-1 scale.

TIER WEIGHTS

Tier 1 - Never Regress (Weight 3.0)
- mpa-idk-protocol
- mpa-progress-over-perfection
- mpa-step-boundary

Tier 2 - Protect Strongly (Weight 2.0)
- mpa-adaptive-sophistication
- mpa-source-citation
- mpa-tone-quality

Tier 3 - Optimize (Weight 1.0)
- mpa-response-length
- mpa-single-question
- mpa-proactive-intelligence

Tier 4 - Nice to Have (Weight 0.5)
- mpa-feasibility-framing
- mpa-step-completion
- mpa-acronym-definition

CALCULATION

Total Weight = (3 * 3) + (3 * 2) + (3 * 1) + (3 * 0.5) = 9 + 6 + 3 + 1.5 = 19.5

Composite Score = Sum of (scorer_score * tier_weight) / 19.5

EXAMPLE

If scores are:
- IDK Protocol: 0.9, Progress: 0.85, Step Boundary: 1.0 (Tier 1)
- Adaptive: 0.8, Source: 0.75, Tone: 0.9 (Tier 2)
- Response Length: 0.7, Single Q: 0.8, Proactive: 0.6 (Tier 3)
- Feasibility: 0.5, Step Completion: 0.7, Acronym: 0.8 (Tier 4)

Tier 1 contribution: (0.9 + 0.85 + 1.0) * 3 = 8.25
Tier 2 contribution: (0.8 + 0.75 + 0.9) * 2 = 4.9
Tier 3 contribution: (0.7 + 0.8 + 0.6) * 1 = 2.1
Tier 4 contribution: (0.5 + 0.7 + 0.8) * 0.5 = 1.0

Composite = (8.25 + 4.9 + 2.1 + 1.0) / 19.5 = 16.25 / 19.5 = 0.833

STOPPING CONDITIONS

Stop optimization when ANY of these conditions are met:

CONDITION 1 - TARGET ACHIEVED
Composite score >= 0.90

CONDITION 2 - PLATEAU DETECTED
Last 3 iterations had composite score delta < 0.01

CONDITION 3 - TIER 1 PERFECT
All Tier 1 scorers >= 0.95 AND composite >= 0.85

CONDITION 4 - MAX ITERATIONS
10 iterations without reaching target (prevent infinite loops)

CONDITION 5 - REGRESSION SPIRAL
3 consecutive rejected changes (need human intervention)

MINIMUM THRESHOLDS

These scorer thresholds must NEVER go below, regardless of composite improvement:

Tier 1 Minimum: 0.70 (any Tier 1 below this = reject change)
Tier 2 Minimum: 0.50 (any Tier 2 below this = flag for review)
Tier 3 Minimum: 0.30 (acceptable to trade off)
Tier 4 Minimum: none (can sacrifice entirely if needed)

VARIANT TESTING RULES

When testing multiple approaches to the same problem:

1. Create variants as separate files: v5_7_1a.txt, v5_7_1b.txt, v5_7_1c.txt
2. Run eval on all variants against same dataset
3. Compare composite scores
4. Winner must beat baseline by >= 0.02 to be accepted
5. If tie within 0.01, prefer the shorter instruction (fewer characters)
6. Document all variants and scores in change log

OPTIMIZATION PRIORITIES

When multiple scorers need improvement, prioritize in this order:

1. Any Tier 1 scorer below 0.80 (critical)
2. Any Tier 2 scorer below 0.60 (important)
3. Lowest absolute scorer regardless of tier
4. Highest potential gain (current score * weight gap)

HUMAN INTERVENTION TRIGGERS

Stop auto-optimization and ask for human input when:

1. Proposed change requires adding new KB document
2. Proposed change would remove existing instruction entirely
3. Two consecutive hypotheses address same test case with no improvement
4. Character count would exceed 7,500 (approaching limit)
5. Change requires modifying Tier 1 behavior
