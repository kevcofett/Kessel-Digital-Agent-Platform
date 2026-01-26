/**
 * CA Agent Braintrust Evaluation Runner
 *
 * Evaluates the Consulting Agent's RAG retrieval quality
 * and response generation capabilities.
 */
import { Eval } from 'braintrust';
import { CA_AGENT_CONFIG, detectCATopic, expandCAQuery } from './ca-agent-config.js';
const CA_TEST_CASES = [
    {
        input: 'What frameworks should I use for digital transformation assessment?',
        expectedTopic: 'transformation',
        expectedDocTypes: ['framework', 'methodology'],
        description: 'Digital transformation framework query',
    },
    {
        input: 'How do I calculate ROI for a technology investment?',
        expectedTopic: 'analytics',
        expectedDocTypes: ['methodology', 'best-practice'],
        description: 'Financial analysis methodology query',
    },
    {
        input: 'What are best practices for change management?',
        expectedTopic: 'organization',
        expectedDocTypes: ['best-practice', 'framework'],
        description: 'Change management best practices query',
    },
    {
        input: 'Show me industry benchmarks for financial services',
        expectedTopic: 'benchmarks',
        expectedDocTypes: ['registry', 'reference'],
        description: 'Industry benchmark query',
    },
    {
        input: 'How should I structure a consulting deliverable?',
        expectedTopic: 'general',
        expectedDocTypes: ['template', 'best-practice'],
        description: 'Deliverable structure query',
    },
    {
        input: 'What data sources are most reliable for market research?',
        expectedTopic: 'research',
        expectedDocTypes: ['reference', 'registry'],
        description: 'Research source quality query',
    },
    {
        input: 'Explain the McKinsey 7S framework',
        expectedTopic: 'organization',
        expectedDocTypes: ['framework'],
        description: 'Specific framework explanation query',
    },
    {
        input: 'What are the key KPIs for operational efficiency?',
        expectedTopic: 'operations',
        expectedDocTypes: ['registry', 'benchmark'],
        description: 'Operational KPI query',
    },
];
// ============================================================================
// SCORERS
// ============================================================================
/**
 * Score topic detection accuracy
 */
function scoreTopicDetection(input, expected) {
    const detected = detectCATopic(input);
    return detected === expected ? 1.0 : 0.0;
}
/**
 * Score query expansion quality
 */
function scoreQueryExpansion(input) {
    const expansions = expandCAQuery(input);
    // More expansions generally means better coverage
    // But cap at reasonable level
    const expansionCount = Math.min(expansions.length, 10);
    return expansionCount / 10;
}
/**
 * Score based on config validity
 */
function scoreConfigValidity() {
    const config = CA_AGENT_CONFIG;
    let score = 0;
    if (config.kbPath)
        score += 0.25;
    if (Object.keys(config.synonymMappings || {}).length > 10)
        score += 0.25;
    if (config.verticalPatterns.length > 5)
        score += 0.25;
    if (config.metricPatterns.length > 5)
        score += 0.25;
    return score;
}
// ============================================================================
// MAIN EVALUATION
// ============================================================================
Eval('ca-agent-rag', {
    experimentName: 'ca-rag-baseline',
    data: () => CA_TEST_CASES.map(tc => ({
        input: tc.input,
        expected: {
            topic: tc.expectedTopic,
            docTypes: tc.expectedDocTypes,
        },
        metadata: {
            description: tc.description,
        },
    })),
    task: async (input) => {
        // For now, return config-based analysis
        // Full RAG retrieval will be added when agent-core is wired up
        const topic = detectCATopic(input);
        const expansions = expandCAQuery(input);
        return {
            topic,
            expansions,
            expansionCount: expansions.length,
            configValid: scoreConfigValidity() === 1.0,
        };
    },
    scores: [
        // Topic detection accuracy
        (args) => {
            const score = scoreTopicDetection(args.input, args.expected.topic);
            return {
                name: 'topic_detection',
                score,
            };
        },
        // Query expansion quality
        (args) => {
            const score = scoreQueryExpansion(args.input);
            return {
                name: 'query_expansion',
                score,
            };
        },
        // Config validity
        () => {
            const score = scoreConfigValidity();
            return {
                name: 'config_validity',
                score,
            };
        },
    ],
});
export { CA_TEST_CASES };
//# sourceMappingURL=ca-eval.js.map