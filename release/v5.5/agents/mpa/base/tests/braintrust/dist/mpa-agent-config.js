/**
 * MPA Agent Configuration for agent-core RAG System
 *
 * This configuration defines how the Media Planning Agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */
// ============================================================================
// SYNONYM MAPPINGS
// ============================================================================
const MPA_SYNONYM_MAPPINGS = {
    // Metrics
    'ltv': ['lifetime value', 'customer lifetime value', 'clv', 'cltv'],
    'cac': ['customer acquisition cost', 'acquisition cost', 'cost of acquisition'],
    'roas': ['return on ad spend', 'return on advertising spend', 'ad return'],
    'cpm': ['cost per thousand', 'cost per mille', 'thousand impressions'],
    'cpa': ['cost per acquisition', 'cost per action', 'acquisition cost'],
    'ctr': ['click through rate', 'click-through rate', 'clickthrough rate'],
    'cvr': ['conversion rate', 'conv rate', 'cr'],
    'aov': ['average order value', 'avg order value', 'order value'],
    'roi': ['return on investment', 'investment return'],
    // Concepts
    'channel mix': ['media mix', 'allocation', 'channel allocation', 'media allocation'],
    'benchmark': ['typical', 'industry standard', 'average', 'baseline', 'norm'],
    'kpi': ['key performance indicator', 'metric', 'target metric', 'goal'],
    'incrementality': ['incremental lift', 'incremental value', 'lift', 'true lift'],
    'attribution': ['credit', 'attribution model', 'credit assignment'],
    'reach': ['audience reach', 'unique reach', 'unduplicated reach'],
    'frequency': ['ad frequency', 'exposure frequency', 'avg frequency'],
    // Channels
    'paid search': ['ppc', 'sem', 'search ads', 'google ads', 'bing ads'],
    'paid social': ['social ads', 'facebook ads', 'meta ads', 'instagram ads'],
    'display': ['banner ads', 'programmatic display', 'display advertising'],
    'ctv': ['connected tv', 'ott', 'streaming tv', 'streaming ads'],
    'retail media': ['rmn', 'retail media network', 'amazon ads', 'walmart connect'],
    // Strategy
    'upper funnel': ['awareness', 'top of funnel', 'tofu', 'brand awareness'],
    'mid funnel': ['consideration', 'middle of funnel', 'mofu'],
    'lower funnel': ['conversion', 'bottom of funnel', 'bofu', 'performance'],
    'full funnel': ['full-funnel', 'integrated funnel', 'holistic'],
};
// ============================================================================
// STEP KEYWORD MAPPINGS (MPA 10-Step Framework)
// ============================================================================
const MPA_STEP_KEYWORDS = {
    1: ['objective', 'goal', 'kpi', 'target', 'success metric', 'business objective'],
    2: ['economics', 'unit economics', 'ltv', 'cac', 'margin', 'profitability', 'payback'],
    3: ['audience', 'targeting', 'segment', 'persona', 'customer', 'demographic', 'psychographic'],
    4: ['geography', 'geo', 'region', 'market', 'dma', 'location', 'territory'],
    5: ['budget', 'spend', 'investment', 'allocation', 'funding', 'media budget'],
    6: ['value proposition', 'messaging', 'creative', 'positioning', 'usp', 'benefit'],
    7: ['channel', 'media', 'tactic', 'platform', 'channel mix', 'media mix'],
    8: ['measurement', 'attribution', 'tracking', 'analytics', 'reporting', 'mmm'],
    9: ['testing', 'experiment', 'incrementality', 'holdout', 'a/b test', 'lift test'],
    10: ['risk', 'contingency', 'mitigation', 'scenario', 'sensitivity', 'assumption'],
};
// ============================================================================
// DOCUMENT TYPE PATTERNS
// ============================================================================
const MPA_DOCUMENT_PATTERNS = {
    'benchmark': [
        /benchmark/i,
        /industry.*average/i,
        /typical.*performance/i,
        /baseline/i,
        /norm/i,
    ],
    'framework': [
        /framework/i,
        /methodology/i,
        /approach/i,
        /process/i,
        /step.*by.*step/i,
    ],
    'playbook': [
        /playbook/i,
        /guide/i,
        /how.*to/i,
        /best.*practice/i,
        /recommendation/i,
    ],
    'examples': [
        /example/i,
        /case.*study/i,
        /scenario/i,
        /illustration/i,
        /sample/i,
    ],
    'implications': [
        /implication/i,
        /impact/i,
        /consequence/i,
        /effect/i,
        /result/i,
    ],
    'operating-standards': [
        /standard/i,
        /requirement/i,
        /compliance/i,
        /rule/i,
        /policy/i,
    ],
};
// ============================================================================
// TOPIC DETECTION PATTERNS
// ============================================================================
const MPA_TOPIC_PATTERNS = {
    'audience': [
        /audience/i,
        /targeting/i,
        /segment/i,
        /persona/i,
        /demographic/i,
        /customer/i,
    ],
    'budget': [
        /budget/i,
        /spend/i,
        /allocation/i,
        /investment/i,
        /cost/i,
        /funding/i,
    ],
    'channel': [
        /channel/i,
        /media/i,
        /platform/i,
        /tactic/i,
        /paid.*search/i,
        /paid.*social/i,
        /display/i,
        /ctv/i,
        /retail.*media/i,
    ],
    'measurement': [
        /measurement/i,
        /attribution/i,
        /analytics/i,
        /tracking/i,
        /reporting/i,
        /mmm/i,
        /incrementality/i,
    ],
    'benchmark': [
        /benchmark/i,
        /average/i,
        /typical/i,
        /industry.*standard/i,
        /baseline/i,
    ],
    'efficiency': [
        /efficiency/i,
        /optimization/i,
        /performance/i,
        /improvement/i,
        /roas/i,
        /roi/i,
    ],
    'general': [
        /strategy/i,
        /planning/i,
        /approach/i,
        /overview/i,
    ],
};
// ============================================================================
// MAIN CONFIGURATION EXPORT
// ============================================================================
export const MPA_AGENT_CONFIG = {
    agentId: 'mpa',
    agentName: 'Media Planning Agent',
    agentVersion: '5.5',
    // Knowledge Base Configuration
    kbPath: '../../kb', // Relative to braintrust directory
    kbFilePattern: '*.txt',
    // Document Processing
    chunkSize: 1000,
    chunkOverlap: 200,
    // Retrieval Configuration
    topK: 5,
    minRelevanceScore: 0.3,
    // Synonym Expansion
    synonymMappings: MPA_SYNONYM_MAPPINGS,
    enableSynonymExpansion: true,
    // Step Detection (MPA-specific)
    stepKeywords: MPA_STEP_KEYWORDS,
    enableStepDetection: true,
    // Document Type Detection
    documentTypePatterns: MPA_DOCUMENT_PATTERNS,
    // Topic Detection
    topicPatterns: MPA_TOPIC_PATTERNS,
    // Vertical Support
    supportedVerticals: [
        'ecommerce',
        'retail',
        'dtc',
        'b2b',
        'saas',
        'financial',
        'healthcare',
        'pharma',
        'automotive',
        'travel',
        'cpg',
        'technology',
        'entertainment',
        'education',
    ],
    // Metrics
    supportedMetrics: [
        'cac',
        'cpa',
        'cpm',
        'cpc',
        'ctr',
        'cvr',
        'roas',
        'roi',
        'ltv',
        'aov',
        'reach',
        'frequency',
        'impressions',
        'clicks',
        'conversions',
    ],
    // Feature Flags
    features: {
        enableHybridSearch: true,
        enableQueryExpansion: true,
        enableReranking: false, // Enable when semantic embedding available
        enableCaching: true,
        cacheTTLSeconds: 3600,
    },
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Detect which MPA step a query relates to
 */
export function detectMPAStep(query) {
    const normalizedQuery = query.toLowerCase();
    for (const [step, keywords] of Object.entries(MPA_STEP_KEYWORDS)) {
        for (const keyword of keywords) {
            if (normalizedQuery.includes(keyword.toLowerCase())) {
                return parseInt(step, 10);
            }
        }
    }
    return null;
}
/**
 * Detect the primary topic of a query
 */
export function detectMPATopic(query) {
    const normalizedQuery = query.toLowerCase();
    for (const [topic, patterns] of Object.entries(MPA_TOPIC_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(normalizedQuery)) {
                return topic;
            }
        }
    }
    return 'general';
}
/**
 * Expand query with synonyms
 */
export function expandMPAQuery(query) {
    const expansions = [query];
    const normalizedQuery = query.toLowerCase();
    for (const [term, synonyms] of Object.entries(MPA_SYNONYM_MAPPINGS)) {
        if (normalizedQuery.includes(term)) {
            for (const synonym of synonyms) {
                expansions.push(query.replace(new RegExp(term, 'gi'), synonym));
            }
        }
        // Also check if any synonym is in the query
        for (const synonym of synonyms) {
            if (normalizedQuery.includes(synonym.toLowerCase())) {
                expansions.push(query.replace(new RegExp(synonym, 'gi'), term));
            }
        }
    }
    return [...new Set(expansions)];
}
/**
 * Get step-specific boost for document scoring
 */
export function getMPAStepBoost(documentContent, targetStep) {
    const keywords = MPA_STEP_KEYWORDS[targetStep] || [];
    const normalizedContent = documentContent.toLowerCase();
    let matchCount = 0;
    for (const keyword of keywords) {
        if (normalizedContent.includes(keyword.toLowerCase())) {
            matchCount++;
        }
    }
    // Boost based on keyword density
    return 1 + (matchCount * 0.1);
}
export default MPA_AGENT_CONFIG;
//# sourceMappingURL=mpa-agent-config.js.map