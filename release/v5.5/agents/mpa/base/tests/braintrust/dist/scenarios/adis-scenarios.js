/**
 * ADIS Test Scenarios
 *
 * Tests for Audience Data Intelligence System integration in MPA v6.4
 * - Trigger detection for customer data mentions
 * - RFM/CLV/segmentation keyword recognition
 * - AMMO optimization offers at budget step
 * - Channel affinity references in channel selection
 */
// ============================================================================
// Personas
// ============================================================================
export const dataRichRetailPersona = {
    name: "Data-Rich Retail Marketer",
    title: "Marketing Manager",
    company: "Retail Co",
    sophisticationLevel: "intermediate",
    industry: "retail",
    communicationStyle: "direct",
    priorMediaExperience: "Retail marketing manager with 3 years of transaction data for 50,000 customers. " +
        "Understands RFM conceptually but hasn't done formal analysis. Wants to improve " +
        "retention and identify best customers for holiday campaign. Data-driven decision maker.",
    knownData: {
        hasBudget: true,
        budget: 500000,
        hasObjective: true,
        objective: "retention",
    },
};
export const customerValueFocusedPersona = {
    name: "CLV-Focused Subscription Marketer",
    title: "VP Marketing",
    company: "SaaS Corp",
    sophisticationLevel: "advanced",
    industry: "subscription",
    communicationStyle: "analytical",
    priorMediaExperience: "VP Marketing at subscription SaaS company. Has detailed customer cohort data " +
        "and wants to optimize acquisition spend based on predicted lifetime value. " +
        "Familiar with cohort analysis and retention curves. Board presentation in 2 weeks.",
    knownData: {
        hasBudget: true,
        budget: 1000000,
        hasLTV: true,
        ltv: 2400,
        hasCAC: true,
        cac: 400,
    },
};
export const segmentationNewbiePersona = {
    name: "Segmentation Newbie",
    title: "Owner",
    company: "Small Ecommerce Shop",
    sophisticationLevel: "basic",
    industry: "ecommerce",
    communicationStyle: "casual",
    priorMediaExperience: "Small ecommerce business owner. Has customer purchase history in spreadsheets " +
        "but never done formal segmentation. Knows they have 'good' and 'bad' customers " +
        "but doesn't know how to systematically identify them. Limited budget, no data science resources.",
    knownData: {
        hasBudget: true,
        budget: 50000,
    },
};
// ============================================================================
// Success Criteria
// ============================================================================
const adisSuccessCriteria = {
    minimumOverallScore: 0.75,
    noCriticalFailures: true,
    requiredBehaviors: ["adis-trigger-detection", "model-explanation"],
};
const rfmSuccessCriteria = {
    minimumOverallScore: 0.8,
    noCriticalFailures: true,
    requiredBehaviors: ["segment-presentation", "channel-affinity-recommendation"],
};
const ammoSuccessCriteria = {
    minimumOverallScore: 0.8,
    noCriticalFailures: true,
    requiredBehaviors: ["ammo-trigger", "allocation-rationale"],
};
const clvSuccessCriteria = {
    minimumOverallScore: 0.8,
    noCriticalFailures: true,
    requiredBehaviors: ["clv-recognition", "model-recommendation"],
};
const newbieSuccessCriteria = {
    minimumOverallScore: 0.75,
    noCriticalFailures: true,
    requiredBehaviors: ["language-adaptation", "jargon-avoidance"],
};
// ============================================================================
// Scenario 1: ADIS Trigger Detection
// ============================================================================
const adisTriggerTurns = [
    {
        turnNumber: 1,
        userMessage: "Hi, I need help planning a campaign to re-engage my existing customers",
        expectedBehaviors: [
            "Warm greeting with 10-step overview",
            "Question about business outcome (retention/re-engagement)",
        ],
        qualityFocus: ["greeting", "step-progression"],
    },
    {
        turnNumber: 2,
        userMessage: "I want to increase repeat purchases. My goal is 20% more repeat buyers this quarter.",
        expectedBehaviors: [
            "Lock objective: retention/repeat purchase",
            "Acknowledge 20% target",
            "Move toward KPI/economics discussion",
        ],
        qualityFocus: ["objective-lock", "target-acknowledgment"],
    },
    {
        turnNumber: 3,
        userMessage: "I have 3 years of customer transaction data. Can you help me figure out who to target?",
        expectedBehaviors: [
            "ADIS TRIGGER: Recognize customer data mention",
            "Offer to analyze/segment customer data",
            "Mention RFM or customer value segmentation",
            "Ask about data format or offer upload instructions",
        ],
        qualityFocus: ["adis-trigger-detection", "segmentation-offer"],
    },
    {
        turnNumber: 4,
        userMessage: "Yes! I have it in Excel. What kind of analysis can you do?",
        expectedBehaviors: [
            "List available analysis types (RFM, CLV, Decile, Cohort)",
            "Recommend RFM for retention focus",
            "Explain what RFM measures (Recency, Frequency, Monetary)",
            "Request file upload or specify data requirements",
        ],
        qualityFocus: ["model-explanation", "data-requirements"],
    },
    {
        turnNumber: 5,
        userMessage: "RFM sounds perfect. My data has customer ID, purchase date, and order amount. " +
            "I have about 50,000 customers and 200,000 transactions.",
        expectedBehaviors: [
            "Confirm data is sufficient for RFM",
            "Acknowledge column availability (customer_id, date, amount)",
            "Confirm record counts are adequate (min 100 customers)",
            "Ready to proceed with analysis",
        ],
        qualityFocus: ["data-validation", "readiness-confirmation"],
    },
];
export const adisTriggerContext = {
    scenarioType: "adis-integration",
    vertical: "retail",
};
export const adisTriggerScenario = {
    id: "adis-trigger-detection",
    name: "ADIS Trigger Detection",
    category: "adis",
    description: "Tests that the agent correctly identifies customer data mentions and offers ADIS analysis. " +
        "Critical test for v6.4 CUSTOMER DATA INTEGRATION section.",
    persona: dataRichRetailPersona,
    turns: adisTriggerTurns,
    qualityContext: adisTriggerContext,
    successCriteria: adisSuccessCriteria,
    minExpectedTurns: 5,
    maxTurns: 8,
};
// ============================================================================
// Scenario 2: RFM Analysis and Audience Creation
// ============================================================================
const rfmAudienceCreationTurns = [
    {
        turnNumber: 1,
        userMessage: "I want to run RFM analysis on my customer base to identify segments for a holiday campaign",
        expectedBehaviors: [
            "Recognize RFM request",
            "Acknowledge holiday campaign context",
            "Ask about available data or offer to receive upload",
        ],
        qualityFocus: ["rfm-recognition", "context-awareness"],
    },
    {
        turnNumber: 2,
        userMessage: "I have an Excel file with 50,000 customers and 180,000 transactions over 2 years. Ready to upload.",
        expectedBehaviors: [
            "Acknowledge file details",
            "Confirm data is sufficient",
            "Begin or offer to begin analysis",
        ],
        qualityFocus: ["upload-handling"],
    },
    {
        turnNumber: 3,
        userMessage: "Please run the analysis",
        expectedBehaviors: [
            "Report analysis completion",
            "Present segment distribution (Champions, Loyal, At Risk, etc.)",
            "Show customer counts per segment",
            "Show value distribution per segment",
            "Offer to create audiences",
        ],
        qualityFocus: ["segment-presentation", "value-distribution"],
    },
    {
        turnNumber: 4,
        userMessage: "Create audiences for Champions and At Risk customers",
        expectedBehaviors: [
            "Confirm audience creation",
            "Report member counts for each",
            "Report total value for each",
            "Provide channel recommendations per segment",
            "Champions: email, direct mail recommended",
            "At Risk: retargeting, personalized outreach recommended",
        ],
        qualityFocus: ["audience-creation", "channel-affinity-recommendation"],
    },
    {
        turnNumber: 5,
        userMessage: "What channels work best for each segment?",
        expectedBehaviors: [
            "Reference channel affinity data",
            "Champions: high email (1.4x), direct mail (1.5x) affinity",
            "At Risk: high email (1.5x), programmatic (1.3x) affinity",
            "Explain affinity concept (effectiveness multiplier)",
            "Recommend different strategies per segment",
        ],
        qualityFocus: ["channel-affinity-explanation", "segment-strategy"],
    },
];
export const rfmAudienceCreationContext = {
    scenarioType: "adis-rfm-workflow",
    vertical: "retail",
    channels: ["email", "direct_mail", "programmatic", "paid_social"],
};
export const rfmAudienceCreationScenario = {
    id: "rfm-audience-creation",
    name: "RFM Analysis and Audience Creation",
    category: "adis",
    description: "Tests full RFM workflow: analysis execution, segment presentation, audience creation, " +
        "and channel affinity recommendations.",
    persona: dataRichRetailPersona,
    turns: rfmAudienceCreationTurns,
    qualityContext: rfmAudienceCreationContext,
    successCriteria: rfmSuccessCriteria,
    minExpectedTurns: 5,
    maxTurns: 10,
};
// ============================================================================
// Scenario 3: AMMO Budget Optimization
// ============================================================================
const ammoBudgetOptimizationTurns = [
    {
        turnNumber: 1,
        userMessage: "I have Champions and At Risk audiences from my RFM analysis. Now I need to allocate my $500K budget.",
        expectedBehaviors: [
            "Acknowledge existing audiences",
            "Acknowledge $500K budget",
            "AMMO TRIGGER: Offer budget optimization across segments",
            "Mention audience-aware allocation",
        ],
        qualityFocus: ["ammo-trigger", "budget-acknowledgment"],
    },
    {
        turnNumber: 2,
        userMessage: "Yes, please optimize the budget allocation",
        expectedBehaviors: [
            "Run optimization",
            "Present allocation by channel",
            "Present allocation by audience segment",
            "Show expected performance metrics (conversions, ROI)",
            "Reference channel affinity in allocation rationale",
        ],
        qualityFocus: ["optimization-results", "allocation-rationale"],
    },
    {
        turnNumber: 3,
        userMessage: "Why is email getting such a high allocation for Champions?",
        expectedBehaviors: [
            "Explain channel affinity concept",
            "Reference Champions email affinity (1.4x)",
            "Show calculation: base response × affinity = adjusted response",
            "Compare to other channels for Champions",
        ],
        qualityFocus: ["affinity-explanation", "calculation-display"],
    },
    {
        turnNumber: 4,
        userMessage: "What if I increased budget to $750K? How would allocation change?",
        expectedBehaviors: [
            "Run scenario analysis",
            "Show marginal returns calculation",
            "Present revised allocation",
            "Note which channels scale and which hit diminishing returns",
            "Recommend optimal scenario based on efficiency",
        ],
        qualityFocus: ["scenario-analysis", "marginal-returns"],
    },
    {
        turnNumber: 5,
        userMessage: "Lock in the $500K allocation",
        expectedBehaviors: [
            "Confirm allocation locked",
            "Summarize final allocation by channel and segment",
            "State expected outcomes (conversions, ROI)",
            "Move toward channel selection step",
        ],
        qualityFocus: ["lock-confirmation", "step-progression"],
    },
];
export const ammoBudgetOptimizationContext = {
    scenarioType: "adis-ammo-workflow",
    vertical: "retail",
    channels: ["email", "direct_mail", "programmatic", "paid_social", "paid_search"],
};
export const ammoBudgetOptimizationScenario = {
    id: "ammo-budget-optimization",
    name: "AMMO Budget Optimization",
    category: "adis",
    description: "Tests AMMO integration: budget optimization offer, allocation presentation, " +
        "affinity explanation, and scenario analysis.",
    persona: dataRichRetailPersona,
    turns: ammoBudgetOptimizationTurns,
    qualityContext: ammoBudgetOptimizationContext,
    successCriteria: ammoSuccessCriteria,
    minExpectedTurns: 5,
    maxTurns: 8,
};
// ============================================================================
// Scenario 4: CLV Analysis for Sophisticated User
// ============================================================================
const clvAnalysisTurns = [
    {
        turnNumber: 1,
        userMessage: "I need to justify our CAC investments to the board. Can you help me calculate customer lifetime value?",
        expectedBehaviors: [
            "Recognize CLV request",
            "Acknowledge board presentation context",
            "Ask about available customer data",
            "Mention CLV calculation options (deterministic vs probabilistic)",
        ],
        qualityFocus: ["clv-recognition", "context-awareness"],
    },
    {
        turnNumber: 2,
        userMessage: "We have 18 months of subscription data. 12,000 customers, monthly recurring revenue, churn events tracked.",
        expectedBehaviors: [
            "Confirm data is sufficient for CLV",
            "Recommend probabilistic CLV (BG/NBD) given data depth",
            "Explain difference from deterministic CLV",
            "Note minimum requirements met (500+ customers, 180+ days)",
        ],
        qualityFocus: ["model-recommendation", "data-validation"],
    },
    {
        turnNumber: 3,
        userMessage: "Run the probabilistic CLV model",
        expectedBehaviors: [
            "Report analysis completion",
            "Present CLV distribution (high/medium/low value tiers)",
            "Show confidence intervals on predictions",
            "Report key parameters (expected purchases, probability alive)",
            "Offer segment creation by CLV tier",
        ],
        qualityFocus: ["clv-results", "confidence-intervals"],
    },
    {
        turnNumber: 4,
        userMessage: "What's a good CAC target given these CLV numbers?",
        expectedBehaviors: [
            "Reference CLV:CAC ratio best practices (3:1 typical)",
            "Calculate recommended CAC based on predicted CLV",
            "Adjust for confidence (use conservative CLV estimate)",
            "Compare to KB benchmarks for subscription vertical",
        ],
        qualityFocus: ["cac-recommendation", "benchmark-comparison"],
    },
];
export const clvAnalysisContext = {
    scenarioType: "adis-clv-workflow",
    vertical: "subscription",
};
export const clvAnalysisScenario = {
    id: "clv-analysis-sophisticated",
    name: "CLV Analysis for Sophisticated User",
    category: "adis",
    description: "Tests CLV workflow with sophisticated user: model recommendation, " +
        "probabilistic analysis, confidence intervals, and CAC derivation.",
    persona: customerValueFocusedPersona,
    turns: clvAnalysisTurns,
    qualityContext: clvAnalysisContext,
    successCriteria: clvSuccessCriteria,
    minExpectedTurns: 4,
    maxTurns: 6,
};
// ============================================================================
// Scenario 5: Segmentation for Newbie User
// ============================================================================
const segmentationNewbieTurns = [
    {
        turnNumber: 1,
        userMessage: "I know I have good customers and bad customers but I don't know how to tell them apart systematically",
        expectedBehaviors: [
            "Recognize segmentation need",
            "Use simple, non-technical language",
            "Explain customer segmentation in plain terms",
            "Ask about available data in accessible way",
        ],
        qualityFocus: ["language-adaptation", "accessibility"],
    },
    {
        turnNumber: 2,
        userMessage: "I have a spreadsheet with all my orders from Shopify. Customer email, date, amount.",
        expectedBehaviors: [
            "Confirm this data works for analysis",
            "Explain what we can learn (who buys often, who spends most, who's recent)",
            "Avoid jargon (say 'best customers' not 'Champions segment')",
            "Offer to analyze when ready",
        ],
        qualityFocus: ["jargon-avoidance", "simple-explanation"],
    },
    {
        turnNumber: 3,
        userMessage: "That sounds great! What will I learn?",
        expectedBehaviors: [
            "Explain RFM in simple terms without using acronym",
            "Recent buyers vs old buyers",
            "Frequent buyers vs one-timers",
            "Big spenders vs small spenders",
            "Promise actionable groups at the end",
        ],
        qualityFocus: ["teaching-quality", "outcome-preview"],
    },
    {
        turnNumber: 4,
        userMessage: "Analysis complete - show me what you found",
        expectedBehaviors: [
            "Present results in simple language",
            "Your Best Customers (not Champions): X people, $Y value",
            "Customers Slipping Away (not At Risk): X people",
            "Give concrete next steps for each group",
            "Avoid overwhelming with all 11 segments",
        ],
        qualityFocus: ["result-simplification", "actionable-guidance"],
    },
];
export const segmentationNewbieContext = {
    scenarioType: "adis-basic-user",
    vertical: "ecommerce",
};
export const segmentationNewbieScenario = {
    id: "segmentation-newbie-user",
    name: "Segmentation for Newbie User",
    category: "adis",
    description: "Tests ADIS integration with basic user: language adaptation, " +
        "jargon avoidance, simplified explanations, and actionable guidance.",
    persona: segmentationNewbiePersona,
    turns: segmentationNewbieTurns,
    qualityContext: segmentationNewbieContext,
    successCriteria: newbieSuccessCriteria,
    minExpectedTurns: 4,
    maxTurns: 6,
};
// ============================================================================
// Exports
// ============================================================================
export const ADIS_SCENARIOS = [
    adisTriggerScenario,
    rfmAudienceCreationScenario,
    ammoBudgetOptimizationScenario,
    clvAnalysisScenario,
    segmentationNewbieScenario,
];
export const ADIS_CONTEXTS = {
    "adis-trigger-detection": adisTriggerContext,
    "rfm-audience-creation": rfmAudienceCreationContext,
    "ammo-budget-optimization": ammoBudgetOptimizationContext,
    "clv-analysis-sophisticated": clvAnalysisContext,
    "segmentation-newbie-user": segmentationNewbieContext,
};
export const ADIS_SCENARIO_METADATA = {
    "adis-trigger-detection": {
        name: "ADIS Trigger Detection",
        description: "Tests customer data mention detection and ADIS offer",
        expectedDuration: "5-10 minutes",
        expectedTurns: "5-8",
        difficulty: "medium",
        category: "adis",
        qualityFocus: ["trigger-detection", "model-explanation"],
    },
    "rfm-audience-creation": {
        name: "RFM Analysis and Audience Creation",
        description: "Tests full RFM workflow with channel affinity recommendations",
        expectedDuration: "8-15 minutes",
        expectedTurns: "5-10",
        difficulty: "medium",
        category: "adis",
        qualityFocus: ["segment-presentation", "channel-affinity"],
    },
    "ammo-budget-optimization": {
        name: "AMMO Budget Optimization",
        description: "Tests audience-aware budget optimization and scenario analysis",
        expectedDuration: "10-15 minutes",
        expectedTurns: "5-8",
        difficulty: "hard",
        category: "adis",
        qualityFocus: ["optimization-trigger", "allocation-rationale"],
    },
    "clv-analysis-sophisticated": {
        name: "CLV Analysis for Sophisticated User",
        description: "Tests probabilistic CLV with confidence intervals",
        expectedDuration: "8-12 minutes",
        expectedTurns: "4-6",
        difficulty: "hard",
        category: "adis",
        qualityFocus: ["model-selection", "statistical-rigor"],
    },
    "segmentation-newbie-user": {
        name: "Segmentation for Newbie User",
        description: "Tests ADIS with language adaptation for basic users",
        expectedDuration: "6-10 minutes",
        expectedTurns: "4-6",
        difficulty: "medium",
        category: "adis",
        qualityFocus: ["language-adaptation", "simplification"],
    },
};
//# sourceMappingURL=adis-scenarios.js.map