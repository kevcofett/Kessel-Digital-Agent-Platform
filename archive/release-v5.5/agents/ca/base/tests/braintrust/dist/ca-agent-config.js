/**
 * CA Agent Configuration for agent-core RAG System
 *
 * This configuration defines how the Consulting Agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */
// ============================================================================
// SYNONYM MAPPINGS
// ============================================================================
const CA_SYNONYM_MAPPINGS = {
    // Business Terms
    'digital transformation': ['dx', 'digitalization', 'digital strategy', 'modernization'],
    'roi': ['return on investment', 'investment return', 'returns'],
    'kpi': ['key performance indicator', 'metric', 'performance metric', 'target'],
    'stakeholder': ['sponsor', 'decision maker', 'executive', 'leadership'],
    'deliverable': ['output', 'artifact', 'work product', 'document'],
    // Consulting Terms
    'methodology': ['approach', 'method', 'framework', 'process'],
    'assessment': ['analysis', 'evaluation', 'review', 'audit', 'diagnostic'],
    'recommendation': ['suggestion', 'proposal', 'guidance', 'advice'],
    'implementation': ['execution', 'deployment', 'rollout', 'launch'],
    'change management': ['ocm', 'organizational change', 'transformation management'],
    'due diligence': ['dd', 'diligence', 'investigation', 'review'],
    'synergy': ['synergies', 'cost savings', 'revenue synergy', 'operational synergy'],
    'operating model': ['opmodel', 'business model', 'org model', 'target operating model', 'tom'],
    'value creation': ['value add', 'value generation', 'value capture'],
    'workstream': ['work stream', 'track', 'initiative', 'project stream'],
    // Analysis Terms
    'benchmark': ['benchmarking', 'comparison', 'peer comparison', 'industry comparison'],
    'gap analysis': ['gap assessment', 'current vs future', 'as-is to-be'],
    'swot': ['strengths weaknesses', 'swot analysis'],
    'pestle': ['pest', 'pestel', 'external analysis'],
    // Technology Terms
    'erp': ['enterprise resource planning', 'sap', 'oracle'],
    'crm': ['customer relationship management', 'salesforce', 'dynamics'],
    'bi': ['business intelligence', 'analytics', 'reporting'],
    'ai': ['artificial intelligence', 'machine learning', 'ml'],
    // Industry Terms
    'financial services': ['fsi', 'fs', 'banking and insurance'],
    'private equity': ['pe', 'buyout', 'portfolio company'],
    'healthcare': ['hc', 'health', 'medical'],
    'retail': ['consumer retail', 'commerce'],
};
// ============================================================================
// DOCUMENT TYPE PATTERNS
// ============================================================================
const CA_DOCUMENT_TYPE_PATTERNS = {
    'methodology': [
        /methodology/i,
        /method/i,
        /approach/i,
        /process/i,
    ],
    'framework': [
        /framework/i,
        /model/i,
        /structure/i,
        /architecture/i,
    ],
    'case-study': [
        /case.*study/i,
        /example/i,
        /scenario/i,
        /client.*story/i,
    ],
    'template': [
        /template/i,
        /format/i,
        /standard/i,
        /boilerplate/i,
    ],
    'best-practice': [
        /best.*practice/i,
        /leading.*practice/i,
        /recommendation/i,
        /guidance/i,
    ],
    'industry-analysis': [
        /industry/i,
        /sector/i,
        /market/i,
        /vertical/i,
        /expertise/i,
    ],
    'reference': [
        /reference/i,
        /glossary/i,
        /definition/i,
        /terminology/i,
    ],
    'registry': [
        /registry/i,
        /inventory/i,
        /catalog/i,
        /list/i,
    ],
    'behavioral': [
        /behavioral/i,
        /behavior/i,
        /routing/i,
        /service/i,
    ],
};
// ============================================================================
// DOCUMENT PURPOSE PATTERNS
// ============================================================================
const CA_DOCUMENT_PURPOSE_PATTERNS = {
    'definitive': [
        /framework/i,
        /authoritative/i,
        /official/i,
    ],
    'guidance': [
        /guide/i,
        /best.*practice/i,
        /recommendation/i,
    ],
    'reference': [
        /reference/i,
        /glossary/i,
        /registry/i,
    ],
    'procedural': [
        /process/i,
        /procedure/i,
        /methodology/i,
    ],
    'template': [
        /template/i,
        /format/i,
    ],
    'example': [
        /example/i,
        /case.*study/i,
        /sample/i,
    ],
};
// ============================================================================
// TOPIC KEYWORD MAPPINGS
// ============================================================================
const CA_TOPIC_KEYWORDS = {
    'strategy': [
        'strategy',
        'strategic',
        'vision',
        'roadmap',
        'planning',
    ],
    'operations': [
        'operation',
        'operational',
        'process',
        'efficiency',
        'optimization',
    ],
    'technology': [
        'technology',
        'tech',
        'digital',
        'system',
        'platform',
        'software',
    ],
    'transformation': [
        'transformation',
        'change',
        'modernization',
        'evolution',
    ],
    'analytics': [
        'analytics',
        'data',
        'insight',
        'intelligence',
        'reporting',
    ],
    'organization': [
        'organization',
        'org',
        'people',
        'talent',
        'culture',
        'leadership',
    ],
    'research': [
        'research',
        'routing',
        'source',
        'quality',
    ],
    'benchmarks': [
        'benchmark',
        'kpi',
        'metric',
        'performance',
    ],
    'general': [
        'general',
        'overview',
        'introduction',
    ],
};
// ============================================================================
// VERTICAL AND METRIC PATTERNS
// ============================================================================
const CA_VERTICAL_PATTERNS = [
    'financial-services',
    'fsi',
    'banking',
    'insurance',
    'healthcare',
    'pharma',
    'pharmaceutical',
    'retail',
    'consumer',
    'manufacturing',
    'technology',
    'telecom',
    'energy',
    'public-sector',
    'government',
    'private-equity',
    'pe',
];
const CA_METRIC_PATTERNS = [
    'roi',
    'npv',
    'irr',
    'payback',
    'tco',
    'revenue',
    'cost',
    'margin',
    'ebitda',
    'nps',
    'adoption-rate',
    'headcount',
    'attrition',
    'time-to-value',
];
// ============================================================================
// FRAMEWORK LIBRARY (CA-Specific)
// ============================================================================
export const CA_FRAMEWORKS = {
    strategic: [
        'Porter Five Forces',
        'SWOT Analysis',
        'PESTLE Analysis',
        'Value Chain Analysis',
        'BCG Matrix',
        'Ansoff Matrix',
        'Blue Ocean Strategy',
    ],
    operational: [
        'Lean Six Sigma',
        'Business Process Reengineering',
        'Theory of Constraints',
        'Total Quality Management',
        'Kaizen',
    ],
    organizational: [
        'McKinsey 7S',
        'Kotter 8 Steps',
        'ADKAR Model',
        'Bridges Transition Model',
        'Prosci Change Management',
    ],
    financial: [
        'DCF Analysis',
        'NPV/IRR Analysis',
        'Payback Period',
        'Cost-Benefit Analysis',
        'TCO Analysis',
    ],
};
// ============================================================================
// MAIN CONFIGURATION EXPORT
// ============================================================================
export const CA_AGENT_CONFIG = {
    // Knowledge Base Configuration
    kbPath: '../../kb', // Relative to braintrust directory
    // Excluded files (none for CA)
    excludedFiles: [],
    // Deprioritized files
    deprioritizedFiles: [],
    // Synonym Expansion
    synonymMappings: CA_SYNONYM_MAPPINGS,
    // Document Type Detection
    documentTypePatterns: CA_DOCUMENT_TYPE_PATTERNS,
    // Document Purpose Detection
    documentPurposePatterns: CA_DOCUMENT_PURPOSE_PATTERNS,
    // Topic Keywords
    topicKeywords: CA_TOPIC_KEYWORDS,
    // Step Detection - CA does NOT use numbered steps
    stepKeywords: {},
    // Vertical Patterns
    verticalPatterns: CA_VERTICAL_PATTERNS,
    // Metric Patterns
    metricPatterns: CA_METRIC_PATTERNS,
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Detect the primary topic of a query
 */
export function detectCATopic(query) {
    const normalizedQuery = query.toLowerCase();
    for (const [topic, keywords] of Object.entries(CA_TOPIC_KEYWORDS)) {
        for (const keyword of keywords) {
            if (normalizedQuery.includes(keyword.toLowerCase())) {
                return topic;
            }
        }
    }
    return 'general';
}
/**
 * Expand query with synonyms
 */
export function expandCAQuery(query) {
    const expansions = [query];
    const normalizedQuery = query.toLowerCase();
    for (const [term, synonyms] of Object.entries(CA_SYNONYM_MAPPINGS)) {
        if (normalizedQuery.includes(term)) {
            for (const synonym of synonyms) {
                expansions.push(query.replace(new RegExp(term, 'gi'), synonym));
            }
        }
        for (const synonym of synonyms) {
            if (normalizedQuery.includes(synonym.toLowerCase())) {
                expansions.push(query.replace(new RegExp(synonym, 'gi'), term));
            }
        }
    }
    return [...new Set(expansions)];
}
/**
 * Detect document type from content
 */
export function detectCADocumentType(content) {
    const normalizedContent = content.toLowerCase();
    for (const [docType, patterns] of Object.entries(CA_DOCUMENT_TYPE_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(normalizedContent)) {
                return docType;
            }
        }
    }
    return 'best-practice';
}
/**
 * Get relevant frameworks for a topic
 */
export function getCAFrameworksForTopic(topic) {
    switch (topic) {
        case 'strategy':
            return CA_FRAMEWORKS.strategic;
        case 'operations':
            return CA_FRAMEWORKS.operational;
        case 'organization':
        case 'transformation':
            return CA_FRAMEWORKS.organizational;
        case 'analytics':
        case 'benchmarks':
            return CA_FRAMEWORKS.financial;
        default:
            return [...CA_FRAMEWORKS.strategic, ...CA_FRAMEWORKS.operational];
    }
}
export default CA_AGENT_CONFIG;
//# sourceMappingURL=ca-agent-config.js.map